import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { DepartmentManagementService, Department, CreateDepartmentDto, UpdateDepartmentDto } from '../services/department-management.service';

@Component({
  selector: 'app-department-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.department ? 'تعديل إدارة' : 'إضافة إدارة جديدة' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="departmentForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>اسم الإدارة</mat-label>
          <input matInput formControlName="name">
          <mat-icon matPrefix>business</mat-icon>
          <mat-error *ngIf="departmentForm.get('name')?.hasError('required')">
            اسم الإدارة مطلوب
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>الوصف (اختياري)</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
          <mat-icon matPrefix>description</mat-icon>
        </mat-form-field>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">إلغاء</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="departmentForm.invalid || isSubmitting">
            <mat-spinner *ngIf="isSubmitting" diameter="20" style="display: inline-block; margin-left: 8px;"></mat-spinner>
            {{ data.department ? 'حفظ التعديلات' : 'إضافة' }}
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
      min-width: 400px;
      max-width: 500px;
      padding: 24px;
      max-height: 80vh;
      overflow-y: auto;
    }
  `]
})
export class DepartmentEditDialogComponent implements OnInit, OnDestroy {
  departmentForm!: FormGroup;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentManagementService,
    public dialogRef: MatDialogRef<DepartmentEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { department: Department | null }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    const department = this.data.department;
    this.departmentForm = this.fb.group({
      name: [department?.name || '', [Validators.required]],
      description: [''] // Note: DepartmentDto doesn't have description in response, but API supports it in create/update
    });
  }

  async onSubmit(): Promise<void> {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.departmentForm.value;

    try {
      if (this.data.department) {
        // Update existing department
        const updateDto: UpdateDepartmentDto = {
          name: formValue.name,
          description: formValue.description || undefined
        };

        this.departmentService.updateDepartment(this.data.department.id, updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialogRef.close(true);
            },
            error: (error) => {
              console.error('Error updating department:', error);
              alert('فشل تحديث الإدارة');
              this.isSubmitting = false;
            }
          });
      } else {
        // Create new department
        const createDto: CreateDepartmentDto = {
          name: formValue.name,
          description: formValue.description || undefined
        };

        this.departmentService.createDepartment(createDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialogRef.close(true);
            },
            error: (error) => {
              console.error('Error creating department:', error);
              alert('فشل إضافة الإدارة');
              this.isSubmitting = false;
            }
          });
      }
    } catch (error) {
      console.error('Error processing department:', error);
      alert('حدث خطأ أثناء المعالجة');
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

