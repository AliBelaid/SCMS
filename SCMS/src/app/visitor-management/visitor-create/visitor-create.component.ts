import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VisitorManagementService } from '../services/visitor-management.service';

@Component({
  selector: 'app-visitor-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './visitor-create.component.html',
  styleUrls: ['./visitor-create.component.scss']
})
export class VisitorCreateComponent implements OnInit {
  visitorForm!: FormGroup;
  isLoading = false;
  personImageFile: File | null = null;
  idCardImageFile: File | null = null;
  personImagePreview: string | null = null;
  idCardImagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private visitorService: VisitorManagementService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.visitorForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d{10,14}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      company: [''],
      expectedVisitDate: [null, Validators.required],
      expectedVisitTime: ['', Validators.required],
      visitPurpose: ['', Validators.required],
      notes: ['']
    });
  }

  onPersonImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.personImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.personImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.personImageFile);
    }
  }

  onIdCardImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.idCardImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.idCardImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.idCardImageFile);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.visitorForm.invalid) {
      this.visitorForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      const formValue = this.visitorForm.value;
      
      // Convert images to base64 if present
      let personImageBase64 = null;
      let idCardImageBase64 = null;

      if (this.personImageFile) {
        personImageBase64 = await this.fileToBase64(this.personImageFile);
      }

      if (this.idCardImageFile) {
        idCardImageBase64 = await this.fileToBase64(this.idCardImageFile);
      }

      const visitorData = {
        fullName: formValue.fullName,
        nationalId: formValue.nationalId,
        phone: formValue.phone,
        company: formValue.company || null,
        personImageBase64,
        idCardImageBase64,
        expectedVisitDate: formValue.expectedVisitDate,
        expectedVisitTime: formValue.expectedVisitTime,
        visitPurpose: formValue.visitPurpose,
        notes: formValue.notes || null
      };

      await this.visitorService.createVisitor(visitorData).toPromise();
      
      this.showNotification('تم إنشاء ملف الزائر بنجاح', 'success');
      this.router.navigate(['/app/visitor-management/visitors/list']);
    } catch (error: any) {
      console.error('Error creating visitor:', error);
      this.showNotification(
        error.error?.message || 'فشل إنشاء ملف الزائر',
        'error'
      );
    } finally {
      this.isLoading = false;
    }
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

  cancel(): void {
    this.router.navigate(['/app/visitor-management/visitors/list']);
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'إغلاق', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }
}

