import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DepartmentUser, DirectoryUser } from '../department.model';
import { DepartmentService } from '../department.service';
import { take } from 'rxjs/operators';

export interface UserDialogData {
  user?: DepartmentUser;
  departmentId: string;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss'],
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  availableUsers: DirectoryUser[] = [];
  isLoadingUsers = false;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.isEditMode = !!data.user;
    this.userForm = this.fb.group({
      userId: ['', [Validators.required]],
      position: [''],
      isHead: [false],
      notes: [''],
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.user) {
      this.userForm.patchValue({
        userId: this.data.user.userId,
        position: this.data.user.position || '',
        isHead: this.data.user.isHead,
        notes: this.data.user.notes || '',
      });
      // Disable user selection in edit mode
      this.userForm.get('userId')?.disable();
    } else {
      this.loadAvailableUsers();
    }
  }

  loadAvailableUsers(): void {
    this.isLoadingUsers = true;
    this.departmentService
      .getAvailableUsersForDepartment(this.data.departmentId)
      .pipe(take(1))
      .subscribe({
        next: (users) => {
          this.availableUsers = users;
          this.isLoadingUsers = false;
        },
        error: (error) => {
          console.error('Error loading available users:', error);
          this.isLoadingUsers = false;
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      // Convert userId to number if it's a string
      if (typeof formValue.userId === 'string') {
        formValue.userId = parseInt(formValue.userId, 10);
      }
      this.dialogRef.close(formValue);
    }
  }
}

