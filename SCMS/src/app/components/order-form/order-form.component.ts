import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterModule,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap, take } from 'rxjs/operators';
import {
  Department,
  Order,
  Subject,
} from '../../models/department.model';
import { DepartmentService } from '../../services/department.service';

type OrderFormMode = 'create' | 'edit';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.scss',
})
export class OrderFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly departmentService = inject(DepartmentService);

  private readonly modeSignal = signal<OrderFormMode>('create');
  readonly submissionMessage = signal<string | null>(null);
  readonly isSaving = signal(false);

  readonly form = this.fb.group({
    type: this.fb.control<Order['type']>('incoming', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    departmentId: ['', Validators.required],
    subjectId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    status: this.fb.control<Order['status']>('pending', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    priority: this.fb.control<Order['priority']>('medium', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dueDate: [''],
    isPublic: [false],
  });

  readonly departments$: Observable<Department[]> =
    this.departmentService.getAllDepartments();

  readonly subjects$: Observable<Subject[]> = this.form
    .get('departmentId')!
    .valueChanges.pipe(
      startWith(this.form.get('departmentId')!.value),
      switchMap((departmentId) =>
        departmentId
          ? this.departmentService.getSubjectsByDepartment(departmentId)
          : of([])
      )
    );

  readonly isEditMode = this.modeSignal.asReadonly();

  private currentOrder: Order | null = null;

  constructor() {
    this.initializeRouteState();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.departments$.pipe(take(1)).subscribe({
      next: (departments) => {
        const values = this.form.getRawValue();
        const department = departments.find(
          (dept) => dept.id === values.departmentId
        );
        const subjects = department?.subjects ?? [];
        const subject = subjects.find((subj) => subj.id === values.subjectId);

        if (!department || !subject) {
          this.isSaving.set(false);
          this.submissionMessage.set('يرجى اختيار إدارة وموضوع صالحين.');
          return;
        }

        const baseOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
          referenceNumber:
            this.currentOrder?.referenceNumber ??
            this.departmentService.generateReferenceNumber(
              department.code,
              subject.code
            ),
          type: values.type,
          departmentId: department.id,
          departmentCode: department.code,
          subjectId: subject.id,
          subjectCode: subject.code,
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority,
          attachments: this.currentOrder?.attachments ?? [],
          createdBy: this.currentOrder?.createdBy ?? 'admin',
          updatedBy: 'admin',
          createdAt: this.currentOrder?.createdAt ?? new Date(),
          updatedAt: new Date(),
          dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
          permissions:
            this.currentOrder?.permissions ?? {
              canView: ['admin', 'user1', 'user2'],
              canEdit: ['admin', 'user1'],
              canDelete: ['admin'],
              excludedUsers: [],
              isPublic: values.isPublic ?? false,
            },
        };

        const action$ =
          this.modeSignal() === 'create' || !this.currentOrder
            ? this.departmentService.addOrder(baseOrder)
            : this.departmentService.updateOrder(
                this.currentOrder.id,
                baseOrder
              );

        action$.pipe(take(1)).subscribe({
          next: (result) => {
            this.isSaving.set(false);
            if (result) {
              this.submissionMessage.set('تم حفظ المعاملة بنجاح.');
              if (this.modeSignal() === 'edit' && this.currentOrder) {
                this.router.navigate(['/orders/details', this.currentOrder.id]);
              } else {
                this.router.navigate(['/orders']);
              }
            } else {
              this.submissionMessage.set('تعذر حفظ المعاملة. حاول مرة أخرى.');
            }
          },
          error: () => {
            this.isSaving.set(false);
            this.submissionMessage.set('حدث خطأ غير متوقع.');
          },
        });
      },
      error: () => {
        this.isSaving.set(false);
        this.submissionMessage.set('تعذر تحميل بيانات الإدارات.');
      },
    });
  }

  private initializeRouteState(): void {
    this.route.data
      .pipe(take(1))
      .subscribe((data) =>
        this.modeSignal.set((data['mode'] as OrderFormMode) ?? 'create')
      );

    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        switchMap((id) => (id ? this.departmentService.getOrderById(id) : of(null))),
        take(1)
      )
      .subscribe((order) => {
        if (!order) {
          return;
        }

        this.currentOrder = order;
        this.modeSignal.set('edit');

        this.form.patchValue({
          type: order.type,
          departmentId: order.departmentId,
          subjectId: order.subjectId,
          title: order.title,
          description: order.description,
          status: order.status,
          priority: order.priority,
          dueDate: order.dueDate ? order.dueDate.toISOString().substring(0, 10) : '',
          isPublic: order.permissions.isPublic,
        });
      });
  }
}

