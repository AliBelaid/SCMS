import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, of } from 'rxjs';
import { map, switchMap, take, takeUntil } from 'rxjs/operators';
import { UserManagementService, User, CreateUserDto, UpdateUserDto } from '../user-management.service';
import { AuthService } from 'src/assets/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

type UserFormMode = 'create' | 'edit';

@Component({
  selector: 'app-user-form',
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
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserManagementService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  private readonly modeSignal = signal<UserFormMode>('create');
  readonly mode = this.modeSignal.asReadonly();
  readonly isSaving = signal(false);
  readonly submissionMessage = signal<string | null>(null);

  readonly form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.email]],
    role: ['Member', [Validators.required]],
    isActive: [true],
    country: [''],
    preferredLanguage: ['ar']
  });

  private currentUser: User | null = null;
  availableRoles: string[] = [];
  private destroy$ = new Subject<void>();

  constructor() {
    this.availableRoles = this.userService.getAvailableRoles();
  }

  ngOnInit(): void {
    this.initializeRouteState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeRouteState(): void {
    this.route.data
      .pipe(take(1))
      .subscribe((data) =>
        this.modeSignal.set((data['mode'] as UserFormMode) ?? 'create')
      );

    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        switchMap((id) =>
          id ? this.userService.getUserById(+id) : of(null)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((user) => {
        if (!user) {
          // Create mode - password is required
          this.form.get('password')?.setValidators([Validators.required, Validators.minLength(3)]);
          this.form.get('password')?.updateValueAndValidity();
          return;
        }

        this.currentUser = user;
        this.modeSignal.set('edit');

        // Edit mode - password is optional
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();

        this.form.patchValue({
          code: user.code,
          description: user.description || user.code,
          email: user.email || '',
          role: user.role || 'Member',
          isActive: user.isActive,
          country: user.country || '',
          preferredLanguage: user.preferredLanguage || 'ar'
        });
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.submissionMessage.set(null);

    const formValue = this.form.getRawValue();
    const mode = this.modeSignal();

    if (mode === 'create') {
      const createDto: CreateUserDto = {
        code: formValue.code.trim(),
        password: formValue.password,
        description: formValue.description.trim(),
        email: formValue.email?.trim() || undefined,
        role: formValue.role,
        isActive: formValue.isActive ?? true,
        country: formValue.country?.trim() || undefined,
        preferredLanguage: formValue.preferredLanguage || 'ar'
      };

      this.userService.createUser(createDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.submissionMessage.set('تم إنشاء المستخدم بنجاح');
            setTimeout(() => {
              this.router.navigate(['/app/document-management/users/list']);
            }, 1500);
          },
          error: (error) => {
            this.isSaving.set(false);
            const errorMessage = error.error?.error || error.error?.message || 'فشل إنشاء المستخدم';
            this.submissionMessage.set(errorMessage);
          }
        });
    } else {
      if (!this.currentUser) return;

      const updateDto: UpdateUserDto = {
        code: formValue.code.trim(),
        description: formValue.description.trim(),
        email: formValue.email?.trim() || undefined,
        role: formValue.role,
        isActive: formValue.isActive ?? true,
        country: formValue.country?.trim() || undefined,
        preferredLanguage: formValue.preferredLanguage || 'ar'
      };

      this.userService.updateUser(this.currentUser.id, updateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.submissionMessage.set('تم تحديث المستخدم بنجاح');
            setTimeout(() => {
              this.router.navigate(['/app/document-management/users/list']);
            }, 1500);
          },
          error: (error) => {
            this.isSaving.set(false);
            const errorMessage = error.error?.error || error.error?.message || 'فشل تحديث المستخدم';
            this.submissionMessage.set(errorMessage);
          }
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/app/document-management/users/list']);
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'Admin': 'مدير',
      'Member': 'عضو',
      'Uploader': 'مرفع ملفات'
    };
    return labels[role] || role;
  }
}

