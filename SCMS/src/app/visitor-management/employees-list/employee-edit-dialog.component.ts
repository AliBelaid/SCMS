import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { EmployeeManagementService, Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../services/employee-management.service';
import { environment } from '../../../assets/environments/environment';

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-employee-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.employee ? 'تعديل موظف' : 'إضافة موظف جديد' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>رقم الموظف (باركود)</mat-label>
          <input matInput formControlName="employeeId" [readonly]="!!data.employee">
          <mat-icon matPrefix>badge</mat-icon>
          <mat-error *ngIf="employeeForm.get('employeeId')?.hasError('required')">
            رقم الموظف مطلوب
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>اسم الموظف</mat-label>
          <input matInput formControlName="employeeName">
          <mat-icon matPrefix>person</mat-icon>
          <mat-error *ngIf="employeeForm.get('employeeName')?.hasError('required')">
            اسم الموظف مطلوب
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>الإدارة</mat-label>
          <mat-select formControlName="departmentId">
            <mat-option [value]="null">لا يوجد</mat-option>
            <mat-option *ngFor="let dept of departments" [value]="dept.id">
              {{ dept.name }}
            </mat-option>
          </mat-select>
          <mat-icon matPrefix>business</mat-icon>
        </mat-form-field>

        <!-- Card Image Upload -->
        <div class="image-upload-section">
          <label class="image-label">صورة البطاقة</label>
          <div class="image-upload-container">
            <input
              type="file"
              accept="image/*"
              (change)="onCardImageSelected($event)"
              style="display: none;"
              #cardImageInput>
            <button
              type="button"
              mat-stroked-button
              (click)="cardImageInput.click()"
              class="upload-button">
              <mat-icon>add_photo_alternate</mat-icon>
              اختر صورة البطاقة
            </button>
            <div *ngIf="cardImagePreview || (data.employee && data.employee.cardImageUrl)" class="image-preview">
              <img
                [src]="cardImagePreview || getImageUrl(data.employee?.cardImageUrl)"
                alt="Card Image Preview"
                class="preview-image">
              <button
                type="button"
                mat-icon-button
                color="warn"
                (click)="removeCardImage()"
                class="remove-image-button">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Face Image Upload -->
        <div class="image-upload-section">
          <label class="image-label">صورة الوجه</label>
          <div class="image-upload-container">
            <input
              type="file"
              accept="image/*"
              (change)="onFaceImageSelected($event)"
              style="display: none;"
              #faceImageInput>
            <button
              type="button"
              mat-stroked-button
              (click)="faceImageInput.click()"
              class="upload-button">
              <mat-icon>add_photo_alternate</mat-icon>
              اختر صورة الوجه
            </button>
            <div *ngIf="faceImagePreview || (data.employee && data.employee.faceImageUrl)" class="image-preview">
              <img
                [src]="faceImagePreview || getImageUrl(data.employee?.faceImageUrl)"
                alt="Face Image Preview"
                class="preview-image">
              <button
                type="button"
                mat-icon-button
                color="warn"
                (click)="removeFaceImage()"
                class="remove-image-button">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">إلغاء</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="employeeForm.invalid || isSubmitting">
            <mat-spinner *ngIf="isSubmitting" diameter="20" style="display: inline-block; margin-left: 8px;"></mat-spinner>
            {{ data.employee ? 'حفظ التعديلات' : 'إضافة' }}
          </button>
        </div>
      </form>
    </mat-dialog-content>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
    mat-dialog-content {
      min-width: 600px;
      max-width: 700px;
      padding: 24px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .image-upload-section {
      margin-bottom: 16px;
    }
    .image-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    .image-upload-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .upload-button {
      min-width: 150px;
    }
    .image-preview {
      position: relative;
      width: 100px;
      height: 100px;
    }
    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
    .remove-image-button {
      position: absolute;
      top: -8px;
      right: -8px;
      background: white;
    }
  `]
})
export class EmployeeEditDialogComponent implements OnInit, OnDestroy {
  employeeForm!: FormGroup;
  departments: Department[] = [];
  isSubmitting = false;
  cardImageFile: File | null = null;
  faceImageFile: File | null = null;
  cardImagePreview: string | null = null;
  faceImagePreview: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeManagementService,
    private http: HttpClient,
    public dialogRef: MatDialogRef<EmployeeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: Employee | null }
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepartments(): void {
    this.http.get<Department[]>(`${environment.apiUrl}/VisitorDepartments`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (departments) => {
          this.departments = departments;
        },
        error: (error) => {
          console.error('Error loading departments:', error);
        }
      });
  }

  initializeForm(): void {
    const employee = this.data.employee;
    this.employeeForm = this.fb.group({
      employeeId: [employee?.employeeId || '', [Validators.required]],
      employeeName: [employee?.employeeName || '', [Validators.required]],
      departmentId: [employee?.departmentId || null]
    });
  }

  getImageUrl(imageUrl?: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${environment.apiUrl.replace('/api', '')}${imageUrl}`;
  }

  onCardImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.cardImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.cardImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.cardImageFile);
    }
  }

  onFaceImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.faceImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.faceImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.faceImageFile);
    }
  }

  removeCardImage(): void {
    this.cardImageFile = null;
    this.cardImagePreview = null;
  }

  removeFaceImage(): void {
    this.faceImageFile = null;
    this.faceImagePreview = null;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.employeeForm.value;

    try {
      if (this.data.employee) {
        // Update existing employee
        const updateDto: UpdateEmployeeDto = {
          employeeName: formValue.employeeName,
          departmentId: formValue.departmentId || undefined,
          isActive: this.data.employee.isActive
        };

        // Add image base64 if new images are selected
        if (this.cardImageFile) {
          updateDto.cardImageBase64 = await this.fileToBase64(this.cardImageFile);
        }

        if (this.faceImageFile) {
          updateDto.faceImageBase64 = await this.fileToBase64(this.faceImageFile);
        }

        this.employeeService.updateEmployee(this.data.employee.id, updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialogRef.close(true);
            },
            error: (error) => {
              console.error('Error updating employee:', error);
              alert('فشل تحديث الموظف');
              this.isSubmitting = false;
            }
          });
      } else {
        // Create new employee - only employeeId and employeeName are required
        const createDto: CreateEmployeeDto = {
          employeeId: formValue.employeeId,
          employeeName: formValue.employeeName,
          departmentId: formValue.departmentId || undefined
        };

        // Add image base64 if images are selected (optional)
        if (this.cardImageFile) {
          createDto.cardImageBase64 = await this.fileToBase64(this.cardImageFile);
        }

        if (this.faceImageFile) {
          createDto.faceImageBase64 = await this.fileToBase64(this.faceImageFile);
        }

        this.employeeService.createEmployee(createDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialogRef.close(true);
            },
            error: (error) => {
              console.error('Error creating employee:', error);
              alert('فشل إضافة الموظف');
              this.isSubmitting = false;
            }
          });
      }
    } catch (error) {
      console.error('Error processing images:', error);
      alert('فشل معالجة الصور');
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
