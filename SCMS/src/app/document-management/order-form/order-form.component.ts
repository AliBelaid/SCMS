import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  Department,
  Subject as OrderSubject,
  Order,
  GrantUserPermissionDto,
  GrantDepartmentAccessDto,
  AddUserExceptionDto,
  AccessLevel,
} from '../department.model';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { AuthService } from 'src/assets/services/auth.service';
import { DepartmentService } from '../department.service';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

interface User {
  id: number;
  code: string;
  email: string;
  name: string;
}

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MaterialFileInputModule, 
    TranslateModule, 
    MatIconModule,
    MatStepperModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
   ],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit, OnDestroy {
  orderForm!: FormGroup;
  permissionsForm!: FormGroup;
  
  departments: Department[] = [];
  subjects: OrderSubject[] = [];
  filteredSubjects: OrderSubject[] = [];
  availableUsers: User[] = [];
  
  selectedFiles: File[] = [];
  filesPreviews: { file: File; preview?: string; type: string }[] = [];
  
  currentStep = 0;
  isLoading = false;
  isSaving = false;
  
  // Access Levels for dropdown
  accessLevels = [
    { value: AccessLevel.ViewOnly, label: 'عرض فقط' },
    { value: AccessLevel.Edit, label: 'تعديل' },
    { value: AccessLevel.Full, label: 'كامل' }
  ];
  
  private destroy$ = new Subject<void>();
  private currentUser: any;

  constructor(
    private fb: FormBuilder,
    private orderService: DepartmentService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.initializeForms();
    this.loadDepartments();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== Form Initialization ====================

  initializeForms(): void {
    // Main order form
    this.orderForm = this.fb.group({
      type: ['incoming', Validators.required],
      departmentId: ['', Validators.required],
      subjectId: ['', Validators.required],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      priority: ['medium', Validators.required],
      status: ['pending', Validators.required],
      dueDate: [null],
      expirationDate: [null],
      isPublic: [false],
      notes: ['', Validators.maxLength(500)]
    });

    // Permissions form
    this.permissionsForm = this.fb.group({
      userPermissions: this.fb.array([]),
      departmentAccesses: this.fb.array([]),
      userExceptions: this.fb.array([])
    });

    // Watch department changes to filter subjects
    this.orderForm.get('departmentId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(departmentId => {
        this.onDepartmentChange(departmentId);
      });
  }

  // ==================== Form Arrays ====================

  get userPermissions(): FormArray {
    return this.permissionsForm.get('userPermissions') as FormArray;
  }

  get departmentAccesses(): FormArray {
    return this.permissionsForm.get('departmentAccesses') as FormArray;
  }

  get userExceptions(): FormArray {
    return this.permissionsForm.get('userExceptions') as FormArray;
  }

  // ==================== User Permissions ====================

  addUserPermission(): void {
    const permissionGroup = this.fb.group({
      userId: ['', Validators.required],
      canView: [true],
      canEdit: [false],
      canDelete: [false],
      canShare: [false],
      canDownload: [true],
      canPrint: [true],
      canComment: [true],
      canApprove: [false],
      expiresAt: [null],
      notes: ['']
    });

    this.userPermissions.push(permissionGroup);
  }

  removeUserPermission(index: number): void {
    this.userPermissions.removeAt(index);
  }

  // ==================== Department Access ====================

  addDepartmentAccess(): void {
    const accessGroup = this.fb.group({
      departmentId: ['', Validators.required],
      accessLevel: [AccessLevel.ViewOnly, Validators.required],
      expiresAt: [null],
      notes: ['']
    });

    this.departmentAccesses.push(accessGroup);
  }

  removeDepartmentAccess(index: number): void {
    this.departmentAccesses.removeAt(index);
  }

  // ==================== User Exceptions ====================

  addUserException(): void {
    const exceptionGroup = this.fb.group({
      userId: ['', Validators.required],
      reason: ['', Validators.required],
      expiresAt: [null]
    });

    this.userExceptions.push(exceptionGroup);
  }

  removeUserException(index: number): void {
    this.userExceptions.removeAt(index);
  }

  // ==================== File Upload ====================

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.showMessage('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت', 'error');
        continue;
      }

      this.selectedFiles.push(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.filesPreviews.push({
            file: file,
            preview: e.target.result,
            type: 'image'
          });
        };
        reader.readAsDataURL(file);
      } else {
        this.filesPreviews.push({
          file: file,
          type: this.getFileType(file)
        });
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.filesPreviews.splice(index, 1);
  }

  getFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (['pdf'].includes(extension || '')) return 'pdf';
    if (['doc', 'docx'].includes(extension || '')) return 'document';
    if (['xls', 'xlsx'].includes(extension || '')) return 'spreadsheet';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return 'image';
    
    return 'other';
  }

  getFileIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'pdf': 'picture_as_pdf',
      'document': 'description',
      'spreadsheet': 'table_chart',
      'image': 'image',
      'other': 'insert_drive_file'
    };
    return icons[type] || 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ==================== Data Loading ====================

  loadDepartments(): void {
    this.isLoading = true;
    this.orderService.getAllDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (departments) => {
          this.departments = departments;
          this.isLoading = false;
        },
        error: (error) => {
          this.showMessage('فشل تحميل الإدارات', 'error');
          this.isLoading = false;
        }
      });
  }

  loadUsers(): void {
    this.orderService.getAvailableUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.availableUsers = users;
        },
        error: () => {
          this.availableUsers = [];
        }
      });
  }

  onDepartmentChange(departmentId: string): void {
    if (!departmentId) {
      this.filteredSubjects = [];
      this.orderForm.patchValue({ subjectId: '' });
      return;
    }

    this.orderService.getSubjectsByDepartment(departmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subjects) => {
          this.filteredSubjects = subjects;
        },
        error: (error) => {
          this.showMessage('فشل تحميل المواضيع', 'error');
        }
      });
  }

  // ==================== Form Submission ====================

  async onSubmit(): Promise<void> {
    if (this.orderForm.invalid) {
      this.showMessage('يرجى تعبئة جميع الحقول المطلوبة', 'error');
      return;
    }

    this.isSaving = true;

    try {
      const values = this.orderForm.value;
      const department = this.departments.find((d) => d.id === values.departmentId);
      const subject = this.filteredSubjects.find((s) => s.id === values.subjectId);

      if (!department || !subject) {
        throw new Error('القسم أو الموضوع غير صحيح');
      }

      const referenceNumber = this.generateReferenceNumber(
        department.code,
        subject.code,
        values.type
      );

      const now = new Date();
      const orderPayload: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        referenceNumber,
        type: values.type,
        departmentId: department.id,
        departmentCode: department.code,
        subjectId: subject.id,
        subjectCode: subject.code,
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        attachments: [],
        createdBy: this.currentUser?.userName ?? 'system',
        updatedBy: this.currentUser?.userName ?? 'system',
        dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
        expirationDate: values.expirationDate ? new Date(values.expirationDate) : undefined,
        isExpired: values.expirationDate ? new Date(values.expirationDate) < now : false,
        isArchived: false,
        archivedAt: undefined,
        archivedBy: undefined,
        archiveReason: undefined,
        notes: values.notes ?? '',
        isPublic: values.isPublic ?? false,
        userPermissions: [],
        departmentAccesses: [],
        userExceptions: [],
      };

      const createdOrder = await firstValueFrom(
        this.orderService.addOrder(orderPayload)
      );

      if (!createdOrder) {
        throw new Error('فشل إنشاء المعاملة');
      }

      if (this.selectedFiles.length > 0) {
        await this.uploadFiles(createdOrder.id);
      }

      for (const permission of this.userPermissions.value) {
        if (permission.userId) {
          const dto: GrantUserPermissionDto = {
            userId: Number(permission.userId),
            canView: permission.canView ?? true,
            canEdit: permission.canEdit ?? false,
            canDelete: permission.canDelete ?? false,
            canShare: permission.canShare ?? false,
            canDownload: permission.canDownload ?? true,
            canPrint: permission.canPrint ?? true,
            canComment: permission.canComment ?? true,
            canApprove: permission.canApprove ?? false,
            expiresAt: permission.expiresAt ? new Date(permission.expiresAt) : undefined,
            notes: permission.notes,
          };
          await firstValueFrom(
            this.orderService.grantUserPermission(createdOrder.id, dto)
          );
        }
      }

      for (const access of this.departmentAccesses.value) {
        if (access.departmentId) {
          const dto: GrantDepartmentAccessDto = {
            departmentId: access.departmentId,
            accessLevel: access.accessLevel,
            expiresAt: access.expiresAt ? new Date(access.expiresAt) : undefined,
            notes: access.notes,
          };
          await firstValueFrom(
            this.orderService.grantDepartmentAccess(createdOrder.id, dto)
          );
        }
      }

      for (const exception of this.userExceptions.value) {
        if (exception.userId) {
          const dto: AddUserExceptionDto = {
            userId: Number(exception.userId),
            reason: exception.reason,
            expiresAt: exception.expiresAt ? new Date(exception.expiresAt) : undefined,
          };
          await firstValueFrom(
            this.orderService.addUserException(createdOrder.id, dto)
          );
        }
      }

      this.showMessage('تم إنشاء المعاملة بنجاح', 'success');
      this.router.navigate(['/app/document-management/orders/details', createdOrder.id]);
    } catch (error: any) {
      console.error('Error creating order:', error);
      this.showMessage(error.message || 'فشل إنشاء المعاملة', 'error');
    } finally {
      this.isSaving = false;
    }
  }

  private async uploadFiles(orderId: string): Promise<void> {
    // TODO: Implement actual file upload to backend
    // For now, this is a placeholder
    for (const file of this.selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', orderId);
      
      // await this.fileUploadService.upload(formData).toPromise();
    }
  }

  private generateReferenceNumber(deptCode: string, subjectCode: string, type: string): string {
    const year = new Date().getFullYear();
    const prefix = type === 'incoming' ? 'IN' : 'OUT';
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    return `${deptCode}-${subjectCode}-${prefix}-${year}-${String(randomNum).padStart(4, '0')}`;
  }

  // ==================== Stepper Navigation ====================

  nextStep(): void {
    if (this.currentStep === 0 && this.orderForm.invalid) {
      this.showMessage('يرجى تعبئة جميع الحقول المطلوبة', 'error');
      return;
    }
    
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step === 0 || (step > 0 && this.orderForm.valid)) {
      this.currentStep = step;
    }
  }

  // ==================== Helpers ====================

  getUserName(userId: number): string {
    const user = this.availableUsers.find(u => u.id === userId);
    return user ? `${user.name} (${user.code})` : 'غير معروف';
  }

  getDepartmentName(departmentId: string): string {
    const dept = this.departments.find(d => d.id === departmentId);
    return dept ? `${dept.nameAr} (${dept.code})` : 'غير معروف';
  }

  getAccessLevelLabel(level: AccessLevel): string {
    const item = this.accessLevels.find(l => l.value === level);
    return item ? item.label : 'غير معروف';
  }

  showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'إغلاق', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }

  cancel(): void {
    if (confirm('هل أنت متأكد من إلغاء إنشاء المعاملة؟ سيتم فقدان جميع البيانات المدخلة.')) {
      this.router.navigate(['/orders']);
    }
  }
}