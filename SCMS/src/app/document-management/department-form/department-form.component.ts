import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Department, Subject, DepartmentUser, DirectoryUser } from '../department.model';
import { DepartmentService } from '../department.service';

type DepartmentFormMode = 'create' | 'edit';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss'],
})
export class DepartmentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly departmentService = inject(DepartmentService);

  readonly modeSignal = signal<DepartmentFormMode>('create');
  readonly mode = this.modeSignal.asReadonly();
  readonly isSaving = signal(false);
  readonly submissionMessage = signal<string | null>(null);
  readonly isLoadingUsers = signal(false);

  availableUsers = signal<DirectoryUser[]>([]);
  currentDepartment = signal<Department | null>(null);

  // Form Groups
  readonly basicInfoForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(2)]],
    nameAr: ['', [Validators.required, Validators.minLength(3)]],
    nameEn: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    isActive: [true],
    managerId: [null as number | null],
  });

  readonly subjectsForm = this.fb.group({
    subjects: this.fb.array([]),
  });

  readonly usersForm = this.fb.group({
    users: this.fb.array([]),
  });

  displayedSubjectColumns: string[] = ['code', 'nameAr', 'nameEn', 'isActive', 'actions'];
  displayedUserColumns: string[] = ['userCode', 'position', 'isHead', 'actions'];

  ngOnInit(): void {
    this.initializeRouteState();
  }

  get subjectsArray(): FormArray {
    return this.subjectsForm.get('subjects') as FormArray;
  }

  get usersArray(): FormArray {
    return this.usersForm.get('users') as FormArray;
  }

  // ==================== Subjects Management ====================

  addSubject(subject?: Partial<Subject>): void {
    this.subjectsArray.push(
      this.fb.group({
        id: [subject?.id ?? null],
        code: [subject?.code ?? '', [Validators.required, Validators.minLength(2)]],
        nameAr: [subject?.nameAr ?? '', [Validators.required, Validators.minLength(3)]],
        nameEn: [subject?.nameEn ?? '', [Validators.required, Validators.minLength(3)]],
        description: [subject?.description ?? ''],
        isActive: [subject?.isActive ?? true],
      })
    );
  }

  removeSubject(index: number): void {
    if (confirm('هل أنت متأكد من حذف هذا الموضوع؟')) {
      this.subjectsArray.removeAt(index);
    }
  }

  // ==================== Users Management ====================

  async loadAvailableUsers(): Promise<void> {
    const dept = this.currentDepartment();
    if (!dept) return;

    this.isLoadingUsers.set(true);
    try {
      const users = await this.departmentService
        .getAvailableUsersForDepartment(dept.id)
        .pipe(take(1))
        .toPromise();
      this.availableUsers.set(users || []);
    } catch (error) {
      console.error('Error loading available users:', error);
    } finally {
      this.isLoadingUsers.set(false);
    }
  }

  addUser(user?: Partial<DepartmentUser>): void {
    this.usersArray.push(
      this.fb.group({
        id: [user?.id ?? null],
        userId: [user?.userId ?? null, Validators.required],
        userCode: [user?.userCode ?? ''],
        userEmail: [user?.userEmail ?? ''],
        userName: [user?.userName ?? ''],
        position: [user?.position ?? ''],
        isHead: [user?.isHead ?? false],
        notes: [user?.notes ?? ''],
      })
    );
  }

  removeUser(index: number): void {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم من الإدارة؟')) {
      this.usersArray.removeAt(index);
    }
  }

  onUserSelected(index: number, userId: number): void {
    const selectedUser = this.availableUsers().find(u => u.id === userId);
    if (selectedUser) {
      const userGroup = this.usersArray.at(index) as FormGroup;
      userGroup.patchValue({
        userId: selectedUser.id,
        userCode: selectedUser.code,
        userEmail: selectedUser.email,
        userName: selectedUser.name,
      });
    }
  }

  // ==================== Form Submission ====================

  async submit(): Promise<void> {
    if (this.basicInfoForm.invalid) {
      this.basicInfoForm.markAllAsTouched();
      this.submissionMessage.set('يرجى إكمال المعلومات الأساسية المطلوبة');
      return;
    }

    this.isSaving.set(true);
    const mode = this.modeSignal();

    const basicInfo = this.basicInfoForm.getRawValue();
    const subjects = this.subjectsArray.controls.map((control) => {
      const subject = control.getRawValue();
      return {
        id: subject.id,
        code: subject.code,
        nameAr: subject.nameAr,
        nameEn: subject.nameEn,
        description: subject.description,
        isActive: subject.isActive,
      };
    });

    const users = this.usersArray.controls.map((control) => {
      const user = control.getRawValue();
      return {
        userId: parseInt(user.userId),
        position: user.position,
        isHead: user.isHead,
        notes: user.notes,
      };
    });

    const payload = {
      code: basicInfo.code!,
      nameAr: basicInfo.nameAr!,
      nameEn: basicInfo.nameEn!,
      description: basicInfo.description || undefined,
      isActive: basicInfo.isActive!,
      managerId: basicInfo.managerId || undefined,
      subjects: subjects,
      users: users,
    };

    try {
      if (mode === 'edit' && this.currentDepartment()) {
        const dept = this.currentDepartment()!;
        // Update basic info
        await this.departmentService.updateDepartment(dept.id, {
          code: payload.code,
          nameAr: payload.nameAr,
          nameEn: payload.nameEn,
          description: payload.description,
          isActive: payload.isActive,
          managerId: payload.managerId,
        }).pipe(take(1)).toPromise();

        this.submissionMessage.set('تم تحديث بيانات الإدارة بنجاح');
      } else {
        // Create new department
        await this.departmentService.addDepartment(payload).pipe(take(1)).toPromise();
        this.submissionMessage.set('تم إنشاء الإدارة بنجاح');
      }

      setTimeout(() => {
        this.router.navigate(['/app/document-management/departments/list']);
      }, 1500);
    } catch (error) {
      console.error('Error saving department:', error);
      this.submissionMessage.set('حدث خطأ أثناء حفظ البيانات');
    } finally {
      this.isSaving.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/app/document-management/departments/list']);
  }

  // ==================== Initialization ====================

  private initializeRouteState(): void {
    this.route.data
      .pipe(take(1))
      .subscribe((data) =>
        this.modeSignal.set((data['mode'] as DepartmentFormMode) ?? 'create')
      );

    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        switchMap((id) =>
          id ? this.departmentService.getDepartmentById(id) : of(null)
        ),
        take(1)
      )
      .subscribe((department) => {
        if (!department) {
          // Create mode - add one empty subject
          if (this.subjectsArray.length === 0) {
            this.addSubject();
          }
          return;
        }

        this.currentDepartment.set(department);
        this.modeSignal.set('edit');

        // Populate basic info
        this.basicInfoForm.patchValue({
          code: department.code,
          nameAr: department.nameAr,
          nameEn: department.nameEn,
          description: department.description ?? '',
          isActive: department.isActive,
          managerId: department.managerId ?? null,
        });

        // Populate subjects
        this.subjectsArray.clear();
        department.subjects.forEach((subject) => this.addSubject(subject));

        // Populate users
        this.usersArray.clear();
        department.users?.forEach((user) => this.addUser(user));

        // Load available users for adding new ones
        this.loadAvailableUsers();
      });

    // Default: add one empty subject for create mode
    if (this.subjectsArray.length === 0) {
      this.addSubject();
    }
  }

  // ==================== Step Validation ====================

  isStepValid(step: number): boolean {
    switch (step) {
      case 0:
        return this.basicInfoForm.valid;
      case 1:
        return this.subjectsForm.valid;
      case 2:
        return this.usersForm.valid;
      default:
        return false;
    }
  }
}