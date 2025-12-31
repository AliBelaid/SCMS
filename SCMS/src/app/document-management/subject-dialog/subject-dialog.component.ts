import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from '../department.model';

export interface SubjectDialogData {
  subject?: Subject;
  departmentId: string;
}

@Component({
  selector: 'app-subject-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  templateUrl: './subject-dialog.component.html',
  styleUrls: ['./subject-dialog.component.scss'],
})
export class SubjectDialogComponent implements OnInit {
  subjectForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SubjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubjectDialogData
  ) {
    this.isEditMode = !!data.subject;
    this.subjectForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2)]],
      nameAr: ['', [Validators.required]],
      nameEn: ['', [Validators.required]],
      description: [''],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.subject) {
      this.subjectForm.patchValue({
        code: this.data.subject.code,
        nameAr: this.data.subject.nameAr,
        nameEn: this.data.subject.nameEn,
        description: this.data.subject.description || '',
        isActive: this.data.subject.isActive,
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.subjectForm.valid) {
      this.dialogRef.close(this.subjectForm.value);
    }
  }
}

