import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-create-request-dialog',
  templateUrl: './create-request-dialog.component.html',
  styleUrls: ['./create-request-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule
  ]
})
export class CreateRequestDialogComponent implements OnInit {
  requestForm: FormGroup;
  
  requestTypes = [
    { value: 'leave', viewValue: 'Leave Request' },
    { value: 'schedule', viewValue: 'Schedule Change' },
    { value: 'equipment', viewValue: 'Equipment Request' }
  ];
  
  priorityLevels = [
    { value: 'low', viewValue: 'Low' },
    { value: 'medium', viewValue: 'Medium' },
    { value: 'high', viewValue: 'High' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateRequestDialogComponent>
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.requestForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      type: ['', Validators.required],
      priority: ['medium', Validators.required]
    });
  }

  submitRequest(): void {
    if (this.requestForm.valid) {
      this.dialogRef.close(this.requestForm.value);
    } else {
      this.requestForm.markAllAsTouched();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
} 