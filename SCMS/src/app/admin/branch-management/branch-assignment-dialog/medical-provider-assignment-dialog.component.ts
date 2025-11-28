// medical-provider-assignment-dialog/medical-provider-assignment-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface BranchAssignmentDialogData {
  user: any;
  medicalProviders: any[];
  currentMedicalProviderId?: number;
  currentRole?: number;
}

@Component({
  selector: 'app-medical-provider-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatCheckboxModule
  ],
  templateUrl: './medical-provider-assignment-dialog.component.html',
  styleUrls: ['./medical-provider-assignment-dialog.component.scss']
})
export class BranchAssignmentDialogComponent implements OnInit {
  assignmentForm: FormGroup;
  availableMedicalProviders: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BranchAssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BranchAssignmentDialogData
  ) {
    this.assignmentForm = this.fb.group({
      medicalProviderId: [data.currentMedicalProviderId || null],
      role: [data.currentRole || null],
      isPrimary: [false]
    });
  }

  ngOnInit() {
    // Filter out current medical provider from available medical providers (optional)
    this.availableMedicalProviders = this.data.medicalProviders;

    // Set up conditional validation for role
    this.assignmentForm.get('medicalProviderId')?.valueChanges.subscribe(medicalProviderId => {
      const roleControl = this.assignmentForm.get('role');
      
      if (medicalProviderId) {
        roleControl?.setValidators([Validators.required]);
      } else {
        roleControl?.clearValidators();
        roleControl?.setValue(null);
      }
      roleControl?.updateValueAndValidity();
    });

    // Set initial role validation
    if (this.assignmentForm.get('medicalProviderId')?.value) {
      this.assignmentForm.get('role')?.setValidators([Validators.required]);
      this.assignmentForm.get('role')?.updateValueAndValidity();
    }
  }

  getCurrentMedicalProviderName(): string {
    if (!this.data.currentMedicalProviderId) return 'None';
    const medicalProvider = this.data.medicalProviders.find(m => m.id === this.data.currentMedicalProviderId);
    return medicalProvider ? medicalProvider.name : 'Unknown';
  }

  getSelectedMedicalProviderName(): string {
    const medicalProviderId = this.assignmentForm.get('medicalProviderId')?.value;
    if (!medicalProviderId) return 'None';
    const medicalProvider = this.data.medicalProviders.find(m => m.id === medicalProviderId);
    return medicalProvider ? medicalProvider.name : 'Unknown';
  }

  getSelectedMedicalProvider(): any {
    const medicalProviderId = this.assignmentForm.get('medicalProviderId')?.value;
    if (!medicalProviderId) return null;
    return this.data.medicalProviders.find(m => m.id === medicalProviderId);
  }

  showSummary(): boolean {
        const newMedicalProviderId = this.assignmentForm.get('medicalProviderId')?.value;
    return newMedicalProviderId !== this.data.currentMedicalProviderId;
  }

  getActionButtonText(): string {
    const medicalProviderId = this.assignmentForm.get('medicalProviderId')?.value;
    
    if (medicalProviderId === null) {
      return 'Remove from medical-provider';
    } else if (!this.data.currentMedicalProviderId) {
      return 'Assign to medical-provider';
    } else if (medicalProviderId !== this.data.currentMedicalProviderId) {
      return 'Move to medical-provider';
    }
    return 'Update';
  }

  getRoleName(role: number): string {
    const roleMap: { [key: number]: string } = {
      1: 'Reception',
      2: 'Doctor',
      3: 'Manager',
      4: 'Clerk'
    };
    return roleMap[role] || 'Unknown';
  }

  save() {
    if (!this.assignmentForm.valid) return;

    const formData = this.assignmentForm.value;
    this.dialogRef.close(formData);
  }

  cancel() {
    this.dialogRef.close();
  }
}