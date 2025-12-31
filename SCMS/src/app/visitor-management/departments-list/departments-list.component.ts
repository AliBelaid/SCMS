import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { DepartmentManagementService, Department } from '../services/department-management.service';
import { DepartmentEditDialogComponent } from './department-edit-dialog.component';

@Component({
  selector: 'app-departments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './departments-list.component.html',
  styleUrls: ['./departments-list.component.scss']
})
export class DepartmentsListComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  departments: Department[] = [];
  filteredDepartments: Department[] = [];
  dataSource!: MatTableDataSource<Department>;
  displayedColumns: string[] = [
    'id',
    'name',
    'actions'
  ];

  searchTerm: string = '';
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private departmentService: DepartmentManagementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.departmentService.getDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (departments) => {
          this.departments = departments;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading departments:', error);
          this.showNotification('فشل تحميل الإدارات', 'error');
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.departments];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(dept =>
        dept.name.toLowerCase().includes(search) ||
        dept.id.toString().includes(search)
      );
    }

    this.filteredDepartments = filtered;
    this.initializeDataSource();
  }

  initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.filteredDepartments);
    
    setTimeout(() => {
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }, 100);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.loadDepartments();
  }

  createDepartment(): void {
    const dialogRef = this.dialog.open(DepartmentEditDialogComponent, {
      width: '500px',
      direction: 'rtl',
      data: { department: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartments();
      }
    });
  }

  editDepartment(department: Department): void {
    const dialogRef = this.dialog.open(DepartmentEditDialogComponent, {
      width: '500px',
      direction: 'rtl',
      data: { department }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartments();
      }
    });
  }

  deleteDepartment(department: Department): void {
    if (confirm(`هل أنت متأكد من حذف الإدارة "${department.name}"؟`)) {
      this.departmentService.deleteDepartment(department.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('تم حذف الإدارة بنجاح', 'success');
            this.loadDepartments();
          },
          error: (error) => {
            console.error('Error deleting department:', error);
            this.showNotification('فشل حذف الإدارة', 'error');
          }
        });
    }
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

