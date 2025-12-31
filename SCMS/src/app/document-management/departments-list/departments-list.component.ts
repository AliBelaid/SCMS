import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DepartmentService } from '../department.service';
import { AuthService } from 'src/assets/services/auth.service';
import { Department } from '../department.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
  totalSubjects: number;
  totalUsers: number;
}

@Component({
  selector: 'app-departments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './departments-list.component.html',
  styleUrls: ['./departments-list.component.scss']
})
export class DepartmentsListComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  departments: Department[] = [];
  dataSource!: MatTableDataSource<Department>;
  displayedColumns: string[] = ['code', 'nameAr', 'nameEn', 'subjects', 'users', 'isActive', 'actions'];
  
  searchTerm: string = '';
  statusFilter: string = 'all';
  isLoading = true;
  currentUser: any;
  stats: DepartmentStats = {
    total: 0,
    active: 0,
    inactive: 0,
    totalSubjects: 0,
    totalUsers: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private departmentService: DepartmentService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.departmentService.getAllDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (departments) => {
          this.departments = departments;
          this.calculateStats();
          this.initializeDataSource();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading departments:', error);
          this.isLoading = false;
        }
      });
  }

  calculateStats(): void {
    this.stats.total = this.departments.length;
    this.stats.active = this.departments.filter(d => d.isActive).length;
    this.stats.inactive = this.departments.filter(d => !d.isActive).length;
    this.stats.totalSubjects = this.departments.reduce((sum, d) => sum + (d.subjects?.length || 0), 0);
    this.stats.totalUsers = this.departments.reduce((sum, d) => sum + (d.usersCount || 0), 0);
  }

  initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.departments);
    
    // Custom filter predicate
    this.dataSource.filterPredicate = (data: Department, filter: string) => {
      const searchStr = filter.toLowerCase();
      const statusMatch = this.statusFilter === 'all' || 
        (this.statusFilter === 'active' && data.isActive) ||
        (this.statusFilter === 'inactive' && !data.isActive);
      
      const textMatch = !searchStr || 
        data.code.toLowerCase().includes(searchStr) ||
        data.nameAr.toLowerCase().includes(searchStr) ||
        data.nameEn.toLowerCase().includes(searchStr);
      
      return statusMatch && textMatch;
    };

    setTimeout(() => {
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }, 100);
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  applyStatusFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  clearFilter(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.applyFilter();
  }

  viewDepartment(department: Department): void {
    this.router.navigate([
      '/app/document-management/departments/details',
      department.id
    ]);
  }

  editDepartment(department: Department): void {
    this.router.navigate([
      '/app/document-management/departments/edit',
      department.id
    ]);
  }

  deleteDepartment(department: Department): void {
    if (confirm(`هل أنت متأكد من حذف الإدارة "${department.nameAr}"؟\n\nملاحظة: سيتم حذف جميع المواضيع والمستخدمين المرتبطين بهذه الإدارة.`)) {
      this.departmentService.deleteDepartment(department.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.loadDepartments();
              alert('تم حذف الإدارة بنجاح');
            }
          },
          error: (error) => {
            console.error('Error deleting department:', error);
            alert('حدث خطأ أثناء حذف الإدارة. قد تحتوي على معاملات مرتبطة بها.');
          }
        });
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/app/document-management/departments/create']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/app/document-management/dashboard']);
  }

  getSubjectsCount(department: Department): number {
    return department.subjects?.length || 0;
  }

  getUsersCount(department: Department): number {
    return department.usersCount || department.users?.length || 0;
  }

  canEdit(): boolean {
    return this.authService.isAdmin();
  }

  canDelete(): boolean {
    return this.authService.isAdmin();
  }

  exportToExcel(): void {
    // TODO: Implement Excel export
    alert('ميزة التصدير إلى Excel قيد التطوير');
  }

  printList(): void {
    window.print();
  }

  refreshList(): void {
    this.loadDepartments();
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'نشط' : 'غير نشط';
  }

  getStatusIcon(isActive: boolean): string {
    return isActive ? 'check_circle' : 'cancel';
  }

  // Helper methods for stats cards
  getActivePercentage(): number {
    return this.stats.total > 0 ? (this.stats.active / this.stats.total) * 100 : 0;
  }

  getAverageSubjectsPerDepartment(): number {
    return this.stats.total > 0 ? this.stats.totalSubjects / this.stats.total : 0;
  }

  getAverageUsersPerDepartment(): number {
    return this.stats.total > 0 ? this.stats.totalUsers / this.stats.total : 0;
  }
}