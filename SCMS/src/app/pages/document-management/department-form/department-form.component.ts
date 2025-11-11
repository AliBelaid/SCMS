import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterModule,
} from '@angular/router';
import { of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import {
  Department,
  Subject,
} from '../../../models/department.model';
import { DepartmentService } from '../../../services/department.service';

type DepartmentFormMode = 'create' | 'edit';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.scss',
})
export class DepartmentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly departmentService = inject(DepartmentService);

  private readonly modeSignal = signal<DepartmentFormMode>('create');
  readonly mode = this.modeSignal.asReadonly();
  readonly isSaving = signal(false);
  readonly submissionMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(2)]],
    nameAr: ['', [Validators.required, Validators.minLength(3)]],
    nameEn: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    isActive: [true],
    subjects: this.fb.array([]),
  });

  private currentDepartment: Department | null = null;

  constructor() {
    this.initializeRouteState();
  }

  get subjectsArray(): FormArray {
    return this.form.get('subjects') as FormArray;
  }

  addSubject(subject?: Partial<Subject>): void {
    this.subjectsArray.push(
      this.fb.group({
        id: [subject?.id ?? null],
        code: [subject?.code ?? '', [Validators.required, Validators.minLength(2)]],
        nameAr: [subject?.nameAr ?? '', [Validators.required, Validators.minLength(3)]],
        nameEn: [subject?.nameEn ?? '', [Validators.required, Validators.minLength(3)]],
        incomingPrefix: [
          subject?.incomingPrefix ?? '',
          [Validators.required, Validators.minLength(2)],
        ],
        outgoingPrefix: [
          subject?.outgoingPrefix ?? '',
          [Validators.required, Validators.minLength(2)],
        ],
        isActive: [subject?.isActive ?? true],
        createdAt: [
          subject?.createdAt
            ? subject.createdAt.toISOString().substring(0, 10)
            : null,
        ],
      })
    );
  }

  removeSubject(index: number): void {
    this.subjectsArray.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.form.getRawValue();
    const mode = this.modeSignal();

    const toSafeString = (value: string | null | undefined): string =>
      (value ?? '').trim();
    const toOptionalString = (value: string | null | undefined): string | undefined => {
      const trimmed = toSafeString(value);
      return trimmed.length ? trimmed : undefined;
    };

    const subjects = this.subjectsArray.controls.map((control, index) => {
      const subject = control.getRawValue() as {
        id: string | null;
        code: string | null;
        nameAr: string | null;
        nameEn: string | null;
        incomingPrefix: string | null;
        outgoingPrefix: string | null;
        isActive: boolean | null;
        createdAt: string | null;
      };

      return {
        id: subject.id ?? `subj-${Date.now()}-${index}`,
        code: toSafeString(subject.code),
        nameAr: toSafeString(subject.nameAr),
        nameEn: toSafeString(subject.nameEn),
        departmentId: this.currentDepartment?.id ?? '',
        incomingPrefix: toSafeString(subject.incomingPrefix),
        outgoingPrefix: toSafeString(subject.outgoingPrefix),
        isActive: subject.isActive ?? true,
        createdAt: subject.createdAt ? new Date(subject.createdAt) : new Date(),
      };
    });

    const payload: Omit<Department, 'id' | 'createdAt'> = {
      code: toSafeString(formValue.code),
      nameAr: toSafeString(formValue.nameAr),
      nameEn: toSafeString(formValue.nameEn),
      description: toOptionalString(formValue.description),
      isActive: formValue.isActive ?? true,
      subjects,
      createdBy: this.currentDepartment?.createdBy ?? 'admin',
    };

    const request$ =
      mode === 'edit' && this.currentDepartment
        ? this.departmentService.updateDepartment(this.currentDepartment.id, {
            ...payload,
            subjects,
          })
        : this.departmentService.addDepartment(payload);

    request$.pipe(take(1)).subscribe({
      next: (result) => {
        this.isSaving.set(false);
        if (result) {
          this.submissionMessage.set('تم حفظ بيانات الإدارة بنجاح.');
          this.router.navigate(['/departments']);
        } else {
          this.submissionMessage.set('تعذر حفظ الإدارة. حاول مرة أخرى.');
        }
      },
      error: () => {
        this.isSaving.set(false);
        this.submissionMessage.set('حدث خطأ غير متوقع.');
      },
    });
  }

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
          if (this.subjectsArray.length === 0) {
            this.addSubject();
          }
          return;
        }

        this.currentDepartment = department;
        this.modeSignal.set('edit');

        this.form.patchValue({
          code: department.code,
          nameAr: department.nameAr,
          nameEn: department.nameEn,
          description: department.description ?? '',
          isActive: department.isActive,
        });

        this.subjectsArray.clear();
        department.subjects.forEach((subject) =>
          this.addSubject({
            ...subject,
            createdAt: subject.createdAt,
          })
        );
      });

    if (this.subjectsArray.length === 0) {
      this.addSubject();
    }
  }
}

