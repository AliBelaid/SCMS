import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { HCPCSService } from '../../services/hcpcs.service';
import { HCPCSCode, HCPCSCreateDto } from '../../models/hcpcs.models';

@Component({
  selector: 'app-hcpcs-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    TranslateModule
  ],
  templateUrl: './hcpcs-form.component.html',
  styleUrls: ['./hcpcs-form.component.scss']
})
export class HCPCSFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  saving = false;
  editMode = false;
  hcpcsId: string | null = null;
  categories: string[] = [];

  // Predefined categories
  predefinedCategories = [
    'Surgical',
    'Diagnostic',
    'Radiology',
    'Laboratory',
    'Medical Services',
    'Supplies',
    'Durable Medical Equipment',
    'Drugs',
    'Orthotics',
    'Prosthetics',
    'Transportation',
    'Vision Services',
    'Hearing Services'
  ];

  constructor(
    private fb: FormBuilder,
    private hcpcsService: HCPCSService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadCategories();
    
    this.hcpcsId = this.route.snapshot.params['id'];
    if (this.hcpcsId) {
      this.editMode = true;
      this.loadHCPCS();
    }
  }

  // ==================== FORM INITIALIZATION ====================

  initializeForm() {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[A-Z]\d{4}$/)]],
      actionCode: [''],
      shortDescription: ['', [Validators.required, Validators.maxLength(255)]],
      longDescription: ['', [Validators.required, Validators.maxLength(1000)]],
      category: [''],
      effectiveDate: [null],
      terminationDate: [null],
      isActive: [true]
    });

    // Disable code field in edit mode
    if (this.editMode) {
      this.form.get('code')?.disable();
    }
  }

  loadCategories() {
    this.hcpcsService.getCategories().subscribe({
      next: (categories) => {
        this.categories = [...this.predefinedCategories, ...categories].filter(
          (value, index, self) => self.indexOf(value) === index
        );
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories = this.predefinedCategories;
      }
    });
  }

  // ==================== DATA LOADING ====================

  loadHCPCS() {
    if (!this.hcpcsId) return;

    this.loading = true;
    
    this.hcpcsService.getById(this.hcpcsId).subscribe({
      next: (hcpcs) => {
        this.populateForm(hcpcs);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading HCPCS:', error);
        this.snack.open('Failed to load HCPCS code', 'Close', { duration: 3000 });
        this.loading = false;
        this.goBack();
      }
    });
  }

  populateForm(hcpcs: HCPCSCode) {
    this.form.patchValue({
      code: hcpcs.code,
      actionCode: hcpcs.actionCode,
      shortDescription: hcpcs.shortDescription,
      longDescription: hcpcs.longDescription,
      category: hcpcs.category,
      effectiveDate: hcpcs.effectiveDate ? new Date(hcpcs.effectiveDate) : null,
      terminationDate: hcpcs.terminationDate ? new Date(hcpcs.terminationDate) : null,
      isActive: hcpcs.isActive ?? true
    });
  }

  // ==================== FORM SUBMISSION ====================

  onSubmit() {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      this.snack.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const formData = this.prepareFormData();

    if (this.editMode) {
      this.updateHCPCS(formData);
    } else {
      this.createHCPCS(formData);
    }
  }

  prepareFormData(): HCPCSCreateDto {
    const formValue = this.form.getRawValue();
    
    return {
      code: formValue.code?.trim().toUpperCase(),
      actionCode: formValue.actionCode?.trim() || undefined,
      shortDescription: formValue.shortDescription?.trim(),
      longDescription: formValue.longDescription?.trim(),
      category: formValue.category || undefined,
      effectiveDate: formValue.effectiveDate || undefined,
      terminationDate: formValue.terminationDate || undefined,
      isActive: formValue.isActive ?? true
    };
  }

  createHCPCS(data: HCPCSCreateDto) {
    this.saving = true;
    
    this.hcpcsService.create(data).subscribe({
      next: (response) => {
        this.saving = false;
        this.snack.open('HCPCS code created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/app/hcpcs']);
      },
      error: (error) => {
        this.saving = false;
        console.error('Error creating HCPCS:', error);
        const message = error.error?.message || 'Failed to create HCPCS code';
        this.snack.open(message, 'Close', { duration: 3000 });
      }
    });
  }

  updateHCPCS(data: HCPCSCreateDto) {
    if (!this.hcpcsId) return;

    this.saving = true;
    
    this.hcpcsService.update(this.hcpcsId, data).subscribe({
      next: (response) => {
        this.saving = false;
        this.snack.open('HCPCS code updated successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/app/hcpcs']);
      },
      error: (error) => {
        this.saving = false;
        console.error('Error updating HCPCS:', error);
        const message = error.error?.message || 'Failed to update HCPCS code';
        this.snack.open(message, 'Close', { duration: 3000 });
      }
    });
  }

  // ==================== VALIDATION ====================

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return 'This field is required';
    }

    if (field.errors['pattern']) {
      return 'Invalid HCPCS code format (must be letter + 4 digits, e.g., A1234)';
    }

    if (field.errors['maxlength']) {
      return `Maximum length is ${field.errors['maxlength'].requiredLength} characters`;
    }

    return 'Invalid value';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // ==================== CODE VALIDATION ====================

  onCodeInput(event: any) {
    const input = event.target;
    let value = input.value.toUpperCase();
    
    // Remove any non-alphanumeric characters
    value = value.replace(/[^A-Z0-9]/g, '');
    
    // Limit to 5 characters
    if (value.length > 5) {
      value = value.substring(0, 5);
    }
    
    input.value = value;
    this.form.get('code')?.setValue(value, { emitEvent: false });
  }

  validateCodeFormat() {
    const code = this.form.get('code')?.value;
    if (code && !this.hcpcsService.validateCode(code)) {
      this.form.get('code')?.setErrors({ pattern: true });
    }
  }

  // ==================== NAVIGATION ====================

  goBack() {
    this.router.navigate(['/app/hcpcs']);
  }

  onCancel() {
    if (this.form.dirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    this.goBack();
  }

  // ==================== UTILITY ====================

  get pageTitle(): string {
    return this.editMode ? 'Edit HCPCS Code' : 'Create New HCPCS Code';
  }

  get submitButtonText(): string {
    if (this.saving) {
      return this.editMode ? 'Updating...' : 'Creating...';
    }
    return this.editMode ? 'Update Code' : 'Create Code';
  }
}