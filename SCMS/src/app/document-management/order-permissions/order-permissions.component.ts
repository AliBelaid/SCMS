import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import {
  AccessLevel,
  AddUserExceptionDto,
  Department,
  DepartmentAccess,
  GrantDepartmentAccessDto,
  GrantUserPermissionDto,
  UserException,
  UserPermission,
} from '../department.model';
import { DepartmentService } from '../department.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialFileInputModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './order-permissions.component.html',
  styleUrls: ['./order-permissions.component.scss']
})
export class OrderPermissionsComponent implements OnInit {
  orderId!: string;
  orderTitle!: string;
  
  // Current permissions
  userPermissions: UserPermission[] = [];
  departmentAccesses: DepartmentAccess[] = [];
  userExceptions: UserException[] = [];
  
  // Available data
  departments: Department[] = [];
  users: any[] = []; // You'll need to get this from a user service
  
  // UI state
  activeTab: number = 0; // 0=users, 1=departments, 2=exceptions
  isLoading = false;
  
  // Forms
  userPermissionForm!: FormGroup;
  departmentAccessForm!: FormGroup;
  userExceptionForm!: FormGroup;
  
  // Access levels for dropdown
  accessLevels = [
    { value: AccessLevel.ViewOnly, label: 'عرض فقط', labelEn: 'View Only' },
    { value: AccessLevel.Edit, label: 'تعديل', labelEn: 'Edit' },
    { value: AccessLevel.Full, label: 'كامل', labelEn: 'Full' }
  ];

  // Table columns
  displayedColumns: string[] = ['user', 'permissions', 'expires', 'actions'];

  constructor(
    public dialogRef: MatDialogRef<OrderPermissionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { orderId: string; orderTitle: string },
    private orderService: DepartmentService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.orderId = data.orderId;
    this.orderTitle = data.orderTitle;
    this.initializeForms();
  }

  initializeForms(): void {
    // User Permission Form
    this.userPermissionForm = this.fb.group({
      userCode: [''],
      userId: [0, Validators.required],
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

    // Department Access Form
    this.departmentAccessForm = this.fb.group({
      departmentId: ['', Validators.required],
      accessLevel: [AccessLevel.ViewOnly, Validators.required],
      expiresAt: [null],
      notes: ['']
    });

    // User Exception Form
    this.userExceptionForm = this.fb.group({
      userCode: [''],
      userId: [0, Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      expiresAt: [null]
    });
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.loadDepartments();
    this.loadUsers();
  }

  // ==================== Load Data ====================

  loadPermissions(): void {
    this.isLoading = true;

    // Load user permissions
    this.orderService.getOrderUserPermissions(this.orderId).subscribe({
      next: (permissions) => {
        this.userPermissions = permissions;
      },
      error: (error) => console.error('Error loading user permissions:', error)
    });

    // Load department accesses
    this.orderService.getOrderDepartmentAccesses(this.orderId).subscribe({
      next: (accesses) => {
        this.departmentAccesses = accesses;
      },
      error: (error) => console.error('Error loading department accesses:', error)
    });

    // Load user exceptions
    this.orderService.getOrderUserExceptions(this.orderId).subscribe({
      next: (exceptions) => {
        this.userExceptions = exceptions;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user exceptions:', error);
        this.isLoading = false;
      }
    });
  }

  loadDepartments(): void {
    this.orderService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => console.error('Error loading departments:', error)
    });
  }

  loadUsers(): void {
    this.orderService.getAvailableUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: () => {
        this.users = [];
      }
    });
  }

  // ==================== User Permissions ====================

  grantUserPermission(): void {
    if (this.userPermissionForm.invalid) {
      return;
    }

    const formValue = this.userPermissionForm.value;
    const dto: GrantUserPermissionDto = {
      userId: formValue.userId,
      canView: formValue.canView ?? true,
      canEdit: formValue.canEdit ?? false,
      canDelete: formValue.canDelete ?? false,
      canShare: formValue.canShare ?? false,
      canDownload: formValue.canDownload ?? true,
      canPrint: formValue.canPrint ?? true,
      canComment: formValue.canComment ?? true,
      canApprove: formValue.canApprove ?? false,
      expiresAt: formValue.expiresAt ? new Date(formValue.expiresAt) : undefined,
      notes: formValue.notes
    };

    this.orderService.grantUserPermission(this.orderId, dto).subscribe({
      next: (success) => {
        if (success) {
          alert('تم منح الصلاحيات بنجاح');
          this.loadPermissions();
          this.userPermissionForm.reset({
            userId: 0,
            canView: true,
            canEdit: false,
            canDelete: false,
            canShare: false,
            canDownload: true,
            canPrint: true,
            canComment: true,
            canApprove: false,
            expiresAt: null,
            notes: ''
          });
        } else {
          alert('تعذر منح الصلاحيات');
        }
      },
      error: (error) => {
        console.error('Error granting permission:', error);
        alert('فشل منح الصلاحيات');
      }
    });
  }

  addUserPermission(): void {
    this.grantUserPermission();
  }

  revokeUserPermission(userId: number): void {
    if (confirm('هل أنت متأكد من إلغاء صلاحيات هذا المستخدم؟')) {
      this.orderService.revokeUserPermission(this.orderId, userId).subscribe({
        next: (success) => {
          if (success) {
            alert('تم إلغاء الصلاحيات بنجاح');
            this.loadPermissions();
          } else {
            alert('تعذر إلغاء الصلاحيات');
          }
        },
        error: (error) => {
          console.error('Error revoking permission:', error);
          alert('فشل إلغاء الصلاحيات');
        }
      });
    }
  }

  // ==================== Department Access ====================

  grantDepartmentAccess(): void {
    if (this.departmentAccessForm.invalid) {
      return;
    }

    const formValue = this.departmentAccessForm.value;
    const dto: GrantDepartmentAccessDto = {
      departmentId: formValue.departmentId,
      accessLevel: formValue.accessLevel,
      expiresAt: formValue.expiresAt ? new Date(formValue.expiresAt) : undefined,
      notes: formValue.notes
    };

    this.orderService.grantDepartmentAccess(this.orderId, dto).subscribe({
      next: (success) => {
        if (success) {
          alert('تم منح وصول الإدارة بنجاح');
          this.loadPermissions();
          this.departmentAccessForm.reset({
            departmentId: '',
            accessLevel: AccessLevel.ViewOnly,
            expiresAt: null,
            notes: ''
          });
        } else {
          alert('تعذر منح وصول الإدارة');
        }
      },
      error: (error) => {
        console.error('Error granting department access:', error);
        alert('فشل منح وصول الإدارة');
      }
    });
  }

  addDepartmentAccess(): void {
    this.grantDepartmentAccess();
  }

  revokeDepartmentAccess(departmentId: number): void {
    if (confirm('هل أنت متأكد من إلغاء وصول هذه الإدارة؟')) {
      this.orderService.revokeDepartmentAccess(this.orderId, departmentId.toString()).subscribe({
        next: (success) => {
          if (success) {
            alert('تم إلغاء وصول الإدارة بنجاح');
            this.loadPermissions();
          } else {
            alert('تعذر إلغاء وصول الإدارة');
          }
        },
        error: (error) => {
          console.error('Error revoking department access:', error);
          alert('فشل إلغاء وصول الإدارة');
        }
      });
    }
  }

  // ==================== User Exceptions ====================

  addUserException(): void {
    if (this.userExceptionForm.invalid) {
      return;
    }

    const formValue = this.userExceptionForm.value;
    const dto: AddUserExceptionDto = {
      userId: formValue.userId,
      reason: formValue.reason,
      expiresAt: formValue.expiresAt ? new Date(formValue.expiresAt) : undefined
    };

    this.orderService.addUserException(this.orderId, dto).subscribe({
      next: (success) => {
        if (success) {
          alert('تم استثناء المستخدم بنجاح');
          this.loadPermissions();
          this.userExceptionForm.reset({
            userCode: '',
            userId: 0,
            reason: '',
            expiresAt: null
          });
        } else {
          alert('تعذر استثناء المستخدم');
        }
      },
      error: (error) => {
        console.error('Error adding user exception:', error);
        alert('فشل استثناء المستخدم');
      }
    });
  }

  removeUserException(userId: number): void {
    if (confirm('هل أنت متأكد من إلغاء استثناء هذا المستخدم؟')) {
      this.orderService.removeUserException(this.orderId, userId).subscribe({
        next: (success) => {
          if (success) {
            alert('تم إلغاء الاستثناء بنجاح');
            this.loadPermissions();
          } else {
            alert('تعذر إلغاء الاستثناء');
          }
        },
        error: (error) => {
          console.error('Error removing user exception:', error);
          alert('فشل إلغاء الاستثناء');
        }
      });
    }
  }

  // ==================== Helpers ====================

  getAccessLevelLabel(level: number): string {
    const accessLevel = this.accessLevels.find(a => a.value === level);
    return accessLevel ? accessLevel.label : 'غير معروف';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  navigateToOrderDetails(): void {
    this.dialogRef.close();
    this.router.navigate(['/app/document-management/orders/details', this.orderId]);
  }

  navigateToOrdersList(): void {
    this.dialogRef.close();
    this.router.navigate(['/app/document-management/orders']);
  }

  navigateToDepartment(departmentId: string): void {
    this.dialogRef.close();
    this.router.navigate(['/app/document-management/departments'], {
      queryParams: { selected: departmentId },
    });
  }

}