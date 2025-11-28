// import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
// import { CommonModule, NgFor, NgIf } from '@angular/common';
// import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
// import { AdminService } from '../../admin.service';
// import { ToastrService } from 'ngx-toastr';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatIconModule } from '@angular/material/icon';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
// import { TranslateModule } from '@ngx-translate/core';
// import { MatListModule } from '@angular/material/list';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// import { MatTabsModule, MatTabGroup } from '@angular/material/tabs';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


// // Define UserType enum to match backend
// enum UserType {
//   HospitalStaff = 0,
//   MinistryInspector = 1,
//   MaintenanceTech = 2,
//   MedicalTechnician = 3
// }

// interface CategoryWithChecked extends CategoryService {
//   checked: boolean;
// }

// interface ClinicWithChecked extends Clinic {
//   checked: boolean;
// }

// @Component({
//   selector: 'app-create-user',
//   templateUrl: './create-user.component.html',
//   styleUrls: ['./create-user.component.scss'],
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     MatDialogModule,
//     MatButtonModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatCheckboxModule,
//     MatIconModule,
//     MatDatepickerModule,
//     MatNativeDateModule,
//     NgFor,
//     NgIf,
//     TranslateModule,
//     MatDividerModule,
//     MatListModule,
//     MatSlideToggleModule,
//     MatTabsModule,
//     MatProgressSpinnerModule
//   ]
// })
// export class CreateUserComponent implements OnInit {

//   user = this.fb.group({
//     displayName: ['', Validators.required],
//     email: ['', [Validators.email]],
//     password: ['', Validators.required],
//     password_confirm: ['', Validators.required],
//     phoneNumber: [''],
//     logo: [''],
//     roles: this.fb.array([]),
//     userType: [UserType.HospitalStaff],
//     enabledCategories: [[]],
//     clinicIds: [[]]
//   }, { validators: this.emailOrPhoneValidator });

//   // List of error messages to display at the top of the form
//   errorMessages: string[] = [];

//   // Form validation error messages
//   validationMessages = {
//     displayName: [
//       { type: 'required', message: 'Display name is required' }
//     ],
//     email: [
//       { type: 'email', message: 'Enter a valid email' }
//     ],
//     phoneNumber: [
//       { type: 'required', message: 'Phone number is required' }
//     ],
//     password: [
//       { type: 'required', message: 'Password is required' }
//     ],
//     password_confirm: [
//       { type: 'required', message: 'Password confirmation is required' }
//     ]
//   };

//   clinics: ClinicWithChecked[] = [];
//   categories: CategoryWithChecked[] = [];
//   loading = false;

//   userTypes = [
//     { value: UserType.HospitalStaff, label: 'Hospital Staff' },
//     { value: UserType.MinistryInspector, label: 'Ministry Inspector' },
//     { value: UserType.MaintenanceTech, label: 'Maintenance Tech' },
//     { value: UserType.MedicalTechnician, label: 'Medical Technician' }
//   ];

//   roles: any[] = [
//     { name: 'Admin', value: 'Admin', checked: false },
//     { name: 'Doctor', value: 'Doctor', checked: false },
//     { name: 'Patient', value: 'Patient', checked: false },
//     { name: 'Moderator', value: 'Moderator', checked: false },
//     { name: 'Member', value: 'Member', checked: false },
//     { name: 'Pharmacy', value: 'Pharmacy', checked: false },
//     { name: 'Reception', value: 'Reception', checked: false },
//     { name: 'LAB', value: 'LAB', checked: false },
//     { name: 'Emergency', value: 'Emergency', checked: false },
//     { name: 'Surgery', value: 'Surgery', checked: false },
//     { name: 'Imaging', value: 'Imaging', checked: false },
//     { name: 'Insurance', value: 'Insurance', checked: false },
//     { name: 'Hospital', value: 'Hospital', checked: false },
//     { name: 'Finance', value: 'Finance', checked: false },
//     { name: 'Treasury', value: 'Treasury', checked: false },
//     { name: 'MedicalTechnician', value: 'MedicalTechnician', checked: false }
//   ];

//   @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

//   constructor(
//     public dialogRef: MatDialogRef<CreateUserComponent>, 
//     private fb: FormBuilder, 
//     private cd: ChangeDetectorRef,
//     private adminService: AdminService,
//     private categoriesService: CategoriesService,
//     private toastr: ToastrService
//   ) {}

//   ngOnInit(): void {
//     this.loadClinics();
//     this.loadCategories();
//   }

//   // Custom validator to require either email or phone number
//   emailOrPhoneValidator(control: any) {
//     const email = control.get('email')?.value;
//     const phoneNumber = control.get('phoneNumber')?.value;
    
//     if (!email && !phoneNumber) {
//       return { emailOrPhoneRequired: true };
//     }
    
//     return null;
//   }

//   loadClinics(): void {
//     this.loading = true;
//     this.adminService.getClinics().subscribe({
//       next: (clinics) => {
//         this.clinics = clinics.map(clinic => ({
//           ...clinic,
//           checked: false
//         }));
//         this.loading = false;
//       },
//       error: (error) => {
//         console.error('Error loading clinics:', error);
//         this.toastr.error('Failed to load clinics');
//         this.loading = false;
//       }
//     });
//   }

//   loadCategories(): void {
//     this.loading = true;
//     this.categoriesService.getAllCategories().subscribe({
//       next: (categories) => {
//         this.categories = categories.map(category => ({
//           ...category,
//           checked: false
//         }));
//         this.loading = false;
//       },
//       error: (error) => {
//         console.error('Error loading categories:', error);
//         this.toastr.error('Failed to load categories');
//         this.loading = false;
//       }
//     });
//   }

//   closeDialog() {
//     this.dialogRef.close();
//   }

//   save() {
//     // Clear previous error messages
//     this.errorMessages = [];
    
//     // Perform client-side validation first
//     if (this.user.invalid) {
//       // Mark all form controls as touched to show validation errors
//       this.markFormGroupTouched(this.user);
      
//       // Find which controls are invalid and display specific error messages
//       const formErrors = [];
      
//       if (this.user.get('displayName').invalid) {
//         formErrors.push('Display name is required');
//       }
      
//       // Check for email or phone number requirement
//       if (this.user.hasError('emailOrPhoneRequired')) {
//         formErrors.push('Either email or phone number is required');
//       }
      
//       if (this.user.get('email').invalid && this.user.get('email').hasError('email')) {
//         formErrors.push('Email format is invalid');
//       }
      
//       if (this.user.get('password').invalid) {
//         formErrors.push('Password is required');
//       }
      
//       if (this.user.get('password_confirm').invalid) {
//         formErrors.push('Password confirmation is required');
//       }
      
//       // Add errors to the errorMessages array and show in toastr
//       if (formErrors.length > 0) {
//         this.errorMessages = formErrors;
//         this.toastr.error(formErrors.join('<br>'), 'Validation Error', { 
//           enableHtml: true,
//           timeOut: 5000
//         });
//         this.tabGroup.selectedIndex = 0; // Navigate to the first tab
//         return;
//       }
//     }

//     // Check password matching
//     if (this.user.get('password').value !== this.user.get('password_confirm').value) {
//       this.errorMessages.push('Passwords do not match');
//       this.toastr.error('Passwords do not match', 'Validation Error');
//       this.tabGroup.selectedIndex = 3; // Navigate to the security tab
//       return;
//     }

//     // Check if at least one role is selected
//     const selectedRoles = this.roles.filter(role => role.checked);
//     if (selectedRoles.length === 0) {
//       this.errorMessages.push('At least one role must be selected');
//       this.toastr.error('Please select at least one role', 'Validation Error');
//       this.tabGroup.selectedIndex = 4; // Navigate to the roles tab
//       return;
//     }

//     this.loading = true;

//     // Get selected roles
//     const selectedRolesNames = selectedRoles.map(role => role.name);
    
//     // Get selected categories
//     const selectedCategories = this.categories
//       .filter(category => category.checked)
//       .map(category => category.id);
    
//     // Get selected clinics
//     const selectedClinicIds = this.clinics
//       .filter(clinic => clinic.checked)
//       .map(clinic => clinic.id);

//     // Create the user data to submit
//     const userData = {
//       ...this.user.value,
//       roles: selectedRolesNames,
//       enabledCategoryIds: selectedCategories,
//       clinicIds: selectedClinicIds,
//       logo: this.user.get('logo')?.value || 'assets/img/Medical/user.jpg'
//     };

//     console.log('Submitting user data:', userData);

//     // Create user
//     this.adminService.createUser(userData).subscribe({
//       next: (response) => {
//         if (response === true) {
//           this.toastr.success('User added successfully');
//           this.dialogRef.close(userData);
//         } else {
//           this.errorMessages.push('Failed to add user - please check the form and try again');
//           this.toastr.error('Failed to add user - please check the form and try again');
//         }
//         this.loading = false;
//       },
//       error: (error) => {
//         console.error('Error creating user:', error);
//         this.loading = false;
        
//         // Handle specific error types
//         if (error.error && typeof error.error === 'object') {
//           // Handle validation errors from API
//           if (error.error.errors) {
//             const errorMessages = [];
            
//             // Process all validation errors
//             for (const key in error.error.errors) {
//               if (error.error.errors.hasOwnProperty(key)) {
//                 const messages = error.error.errors[key];
//                 if (Array.isArray(messages)) {
//                   messages.forEach(msg => errorMessages.push(msg));
//                 } else {
//                   errorMessages.push(messages);
//                 }
//               }
//             }
            
//             if (errorMessages.length > 0) {
//               this.errorMessages = errorMessages;
//               this.toastr.error(errorMessages.join('<br>'), 'Validation Error', { 
//                 enableHtml: true,
//                 timeOut: 5000
//               });
//               this.tabGroup.selectedIndex = 0; // Navigate to the first tab
//               return;
//             }
//           }
          
//           // Email already exists error
//           if (error.error.message === 'Email already exists') {
//             this.errorMessages.push('This email address is already registered. Please use a different email.');
//             this.toastr.error('This email address is already registered. Please use a different email.');
//             this.tabGroup.selectedIndex = 1; // Navigate to the contact info tab
//             return;
//           }
          
//           // General error message from API
//           if (error.error.message) {
//             this.errorMessages.push(error.error.message);
//             this.toastr.error(error.error.message);
//             return;
//           }
//         }
        
//         // Default error message for unknown errors
//         const defaultErrorMsg = error.message || 'Failed to create user. Please try again.';
//         this.errorMessages.push(defaultErrorMsg);
//         this.toastr.error(defaultErrorMsg);
//       }
//     });
//   }
  
//   // Helper method to mark all form controls as touched
//   markFormGroupTouched(formGroup: any) {
//     Object.keys(formGroup.controls).forEach(key => {
//       const control = formGroup.controls[key];
      
//       if (control instanceof FormControl) {
//         control.markAsTouched();
//       } else if (control instanceof FormGroup) {
//         this.markFormGroupTouched(control);
//       } else if (control instanceof FormArray) {
//         for (let i = 0; i < control.length; i++) {
//           this.markFormGroupTouched(control.at(i));
//         }
//       }
//     });
//   }

//   toggleVisibility() {
//     if (this.visible) {
//       this.inputType = 'password';
//       this.visible = false;
//     } else {
//       this.inputType = 'text';
//       this.visible = true;
//     }
//     this.cd.markForCheck();
//   }

//   trackByRole(index: number, role: any): string {
//     return role.name;
//   }

//   trackByClinic(index: number, clinic: ClinicWithChecked): number {
//     return clinic.id;
//   }

//   trackByCategory(index: number, category: CategoryWithChecked): number {
//     return category.id;
//   }

//   toggleRole(role: any): void {
//     role.checked = !role.checked;
//   }

//   toggleClinic(clinic: ClinicWithChecked): void {
//     clinic.checked = !clinic.checked;
//   }

//   toggleCategory(category: CategoryWithChecked): void {
//     category.checked = !category.checked;
//   }

//      /**
//     * Handle file selection for profile picture
//     */
//    onFileSelected(event: Event): void {
//      const input = event.target as HTMLInputElement;
//      if (input.files && input.files.length) {
//        const file = input.files[0];
//        const reader = new FileReader();
//        reader.onload = (e: any) => {
//          const base64Image = e.target.result;
//          this.user.get('logo')?.setValue(base64Image);
         
//          // Clear the input value to allow selecting the same file again
//          input.value = '';
//        };
//        reader.readAsDataURL(file);
//      }
//    }

//   inputType = 'password';
//   visible = false;
// }



