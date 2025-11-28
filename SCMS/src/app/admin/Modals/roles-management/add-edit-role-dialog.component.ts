import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

export interface AddEditRoleDialogData {
  mode: 'add' | 'edit';
  role?: any;
}

@Component({
  selector: 'app-add-edit-role-dialog',
  templateUrl: './add-edit-role-dialog.component.html',
  styleUrls: ['./add-edit-role-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslateModule
  ]
})
export class AddEditRoleDialogComponent implements OnInit {
  roleForm: FormGroup;
  isSubmitting = false;

  // Available permissions
  availablePermissions = [
    { id: 'users.read', name: 'View Users', description: 'Can view user information' },
    { id: 'users.create', name: 'Create Users', description: 'Can create new users' },
    { id: 'users.update', name: 'Update Users', description: 'Can modify user information' },
    { id: 'users.delete', name: 'Delete Users', description: 'Can delete users' },
    { id: 'roles.read', name: 'View Roles', description: 'Can view role information' },
    { id: 'roles.create', name: 'Create Roles', description: 'Can create new roles' },
    { id: 'roles.update', name: 'Update Roles', description: 'Can modify role information' },
    { id: 'roles.delete', name: 'Delete Roles', description: 'Can delete roles' },
    { id: 'medical-providers.read', name: 'View Medical Providers', description: 'Can view medical provider information' },
    { id: 'medical-providers.create', name: 'Create Medical Providers', description: 'Can create new medical providers' },
    { id: 'medical-providers.update', name: 'Update Medical Providers', description: 'Can modify medical provider information' },
    { id: 'medical-providers.delete', name: 'Delete Medical Providers', description: 'Can delete medical providers' },
    { id: 'claims.read', name: 'View Claims', description: 'Can view claim information' },
    { id: 'claims.process', name: 'Process Claims', description: 'Can process and approve claims' },
    { id: 'reports.read', name: 'View Reports', description: 'Can view system reports' },
    { id: 'settings.read', name: 'View Settings', description: 'Can view system settings' },
    { id: 'settings.update', name: 'Update Settings', description: 'Can modify system settings' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddEditRoleDialogData
  ) {
    this.roleForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.role) {
      this.populateForm(this.data.role);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      isActive: [true],
      permissions: this.fb.array([])
    });
  }

  private populateForm(role: any): void {
    this.roleForm.patchValue({
      name: role.name,
      description: role.description,
      isActive: role.isActive
    });

    // Set permissions
    const permissionsArray = this.roleForm.get('permissions') as any;
    this.availablePermissions.forEach(permission => {
      const isGranted = role.permissions?.some((p: any) => p.id === permission.id && p.isGranted) || false;
      permissionsArray.push(this.fb.control(isGranted));
    });
  }

  get permissionsArray() {
    return this.roleForm.get('permissions') as any;
  }

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Edit Role' : 'Add New Role';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update Role' : 'Create Role';
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.roleForm.value;
    const roleData = {
      ...formValue,
      permissions: this.availablePermissions.map((permission, index) => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        isGranted: formValue.permissions[index] || false
      }))
    };

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.dialogRef.close(roleData);
    }, 1000);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.roleForm.controls).forEach(key => {
      const control = this.roleForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.roleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.roleForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    if (field.errors['maxlength']) return `Maximum length is ${field.errors['maxlength'].requiredLength}`;

    return 'This field is invalid';
  }
}
