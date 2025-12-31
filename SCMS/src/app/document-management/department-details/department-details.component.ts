import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { Department, DepartmentUser, Subject, DirectoryUser } from '../department.model';
import { DepartmentService } from '../department.service';
import { AuthService } from 'src/assets/services/auth.service';
import { SubjectDialogComponent, SubjectDialogData } from '../subject-dialog/subject-dialog.component';
import { UserDialogComponent, UserDialogData } from '../user-dialog/user-dialog.component';

@Component({
  selector: 'app-department-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatTabsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './department-details.component.html',
  styleUrls: ['./department-details.component.scss'],
})
export class DepartmentDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  department = signal<Department | null>(null);
  isLoading = signal(true);
  selectedTabIndex = signal(0);

  subjectsColumns: string[] = ['code', 'nameAr', 'nameEn', 'isActive', 'actions'];
  usersColumns: string[] = ['userCode', 'userName', 'position', 'isHead', 'joinedAt', 'actions'];

  ngOnInit(): void {
    this.loadDepartment();
  }

  loadDepartment(): void {
    this.isLoading.set(true);
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        switchMap((id) =>
          id ? this.departmentService.getDepartmentById(id) : of(null)
        ),
        take(1)
      )
      .subscribe({
        next: (department) => {
          this.department.set(department);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading department:', error);
          this.isLoading.set(false);
        },
      });
  }

  // ==================== Navigation ====================

  editDepartment(): void {
    const dept = this.department();
    if (dept) {
      this.router.navigate(['/app/document-management/departments/edit', dept.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/app/document-management/departments/list']);
  }

  // ==================== Subjects Management ====================

  async addSubject(): Promise<void> {
    const dept = this.department();
    if (!dept) return;

    const dialogRef = this.dialog.open(SubjectDialogComponent, {
      width: '600px',
      data: { departmentId: dept.id } as SubjectDialogData,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.departmentService
            .addSubjectToDepartment(dept.id, result)
            .pipe(take(1))
            .toPromise();
          this.loadDepartment();
        } catch (error) {
          console.error('Error adding subject:', error);
          alert('حدث خطأ أثناء إضافة الموضوع');
        }
      }
    });
  }

  async editSubject(subject: Subject): Promise<void> {
    const dept = this.department();
    if (!dept) return;

    const dialogRef = this.dialog.open(SubjectDialogComponent, {
      width: '600px',
      data: { subject, departmentId: dept.id } as SubjectDialogData,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.departmentService
            .updateSubject(dept.id, subject.id, result)
            .pipe(take(1))
            .toPromise();
          this.loadDepartment();
        } catch (error) {
          console.error('Error updating subject:', error);
          alert('حدث خطأ أثناء تحديث الموضوع');
        }
      }
    });
  }

  async deleteSubject(subject: Subject): Promise<void> {
    const dept = this.department();
    if (!dept) return;

    if (!confirm(`هل أنت متأكد من حذف الموضوع "${subject.nameAr}"؟`)) {
      return;
    }

    try {
      await this.departmentService
        .deleteSubject(dept.id, subject.id)
        .pipe(take(1))
        .toPromise();
      this.loadDepartment();
      alert('تم حذف الموضوع بنجاح');
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('لا يمكن حذف الموضوع. قد يحتوي على معاملات مرتبطة به');
    }
  }

  // ==================== Users Management ====================

  async addUser(): Promise<void> {
    const dept = this.department();
    if (!dept) return;

    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { departmentId: dept.id } as UserDialogData,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.departmentService
            .addUserToDepartment(dept.id, result)
            .pipe(take(1))
            .toPromise();
          this.loadDepartment();
        } catch (error) {
          console.error('Error adding user:', error);
          alert('حدث خطأ أثناء إضافة المستخدم');
        }
      }
    });
  }

  async editUser(user: DepartmentUser): Promise<void> {
    const dept = this.department();
    if (!dept) return;

    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { user, departmentId: dept.id } as UserDialogData,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.departmentService
            .updateDepartmentUser(dept.id, user.userId, result)
            .pipe(take(1))
            .toPromise();
          this.loadDepartment();
        } catch (error) {
          console.error('Error updating user:', error);
          alert('حدث خطأ أثناء تحديث المستخدم');
        }
      }
    });
  }

  async removeUser(user: DepartmentUser): Promise<void> {
    const dept = this.department();
    if (!dept) return;

    if (!confirm(`هل أنت متأكد من إزالة "${user.userName}" من الإدارة؟`)) {
      return;
    }

    try {
      await this.departmentService
        .removeUserFromDepartment(dept.id, user.userId)
        .pipe(take(1))
        .toPromise();

      this.loadDepartment();
      alert('تم إزالة المستخدم بنجاح');
    } catch (error) {
      console.error('Error removing user:', error);
      alert('حدث خطأ أثناء إزالة المستخدم');
    }
  }

  // ==================== Permissions ====================

  canEdit(): boolean {
    return this.authService.isAdmin();
  }

  canDelete(): boolean {
    return this.authService.isAdmin();
  }

  // ==================== Helpers ====================

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}