import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { EmployeeManagementService, Employee } from '../services/employee-management.service';
import { environment } from '../../../assets/environments/environment';
import { HttpClient } from '@angular/common/http';
import { EmployeeEditDialogComponent } from './employee-edit-dialog.component';
import * as XLSX from 'xlsx';

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss']
})
export class EmployeesListComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  dataSource!: MatTableDataSource<Employee>;
  displayedColumns: string[] = [
    'employeeId',
    'employeeName',
    'department',
    'status',
    'actions'
  ];

  departments: Department[] = [];
  searchTerm: string = '';
  selectedDepartment: number | null = null;
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeManagementService,
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepartments(): void {
    this.http.get<Department[]>(`${environment.apiUrl}/VisitorDepartments`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (departments) => {
          this.departments = departments;
        },
        error: (error) => {
          console.error('Error loading departments:', error);
        }
      });
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getEmployees(this.searchTerm, this.selectedDepartment || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employees) => {
          this.employees = employees;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          this.showNotification('فشل تحميل الموظفين', 'error');
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.employees];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.employeeId.toLowerCase().includes(search) ||
        emp.employeeName.toLowerCase().includes(search) ||
        (emp.departmentName && emp.departmentName.toLowerCase().includes(search))
      );
    }

    if (this.selectedDepartment) {
      filtered = filtered.filter(emp => emp.departmentId === this.selectedDepartment);
    }

    this.filteredEmployees = filtered;
    this.initializeDataSource();
  }

  initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.filteredEmployees);
    
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
    this.selectedDepartment = null;
    this.loadEmployees();
  }

  createEmployee(): void {
    const dialogRef = this.dialog.open(EmployeeEditDialogComponent, {
      width: '700px',
      direction: 'rtl',
      data: { employee: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  exportTemplate(): void {
    // Create Excel template with headers and example data
    const templateData = [
      ['رقم الموظف', 'اسم الموظف', 'رقم الإدارة'], // Headers (Arabic)
      ['EMP001', 'أحمد محمد', ''], // Example row 1 (department ID is optional)
      ['EMP002', 'فاطمة علي', '1'], // Example row 2 (with department ID)
      ['EMP003', 'خالد سعيد', '2'], // Example row 3 (with department ID)
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Employee ID column
      { wch: 25 }, // Employee Name column
      { wch: 15 }  // Department ID column
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');

    // Generate Excel file and download
    XLSX.writeFile(wb, 'employee-import-template.xlsx');
    this.showNotification('تم تحميل قالب الاستيراد بنجاح', 'success');
  }

  importFromExcel(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.isLoading = true;
        this.employeeService.importFromExcel(file)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (result: any) => {
              this.isLoading = false;
              let message = `تم استيراد ${result.importedCount} موظف بنجاح`;
              if (result.errorCount > 0) {
                message += `\n\nحدثت ${result.errorCount} أخطاء:\n${result.errors.join('\n')}`;
              }
              alert(message);
              this.loadEmployees();
            },
            error: (error) => {
              console.error('Error importing employees:', error);
              this.isLoading = false;
              this.showNotification('فشل استيراد الموظفين من Excel', 'error');
            }
          });
      }
    };
    input.click();
  }

  editEmployee(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeEditDialogComponent, {
      width: '700px',
      direction: 'rtl',
      data: { employee }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  deleteEmployee(employee: Employee): void {
    if (confirm(`هل أنت متأكد من حذف الموظف ${employee.employeeName}؟`)) {
      this.employeeService.deleteEmployee(employee.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('تم حذف الموظف بنجاح', 'success');
            this.loadEmployees();
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
            this.showNotification('فشل حذف الموظف', 'error');
          }
        });
    }
  }

  viewAttendance(employee: Employee): void {
    this.router.navigate(['/app/visitor-management/employees/attendance', employee.id]);
  }

  getImageUrl(imageUrl?: string): string | null {
    if (!imageUrl || imageUrl.trim() === '') return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return imageUrl;
  }

  hasImage(imageUrl?: string): boolean {
    return imageUrl != null && imageUrl.trim() !== '';
  }

  private failedImages = new Set<string>();

  shouldShowImage(imageUrl?: string): boolean {
    if (!this.hasImage(imageUrl)) return false;
    return !this.failedImages.has(imageUrl || '');
  }

  onImageError(imageUrl?: string): void {
    if (imageUrl) {
      this.failedImages.add(imageUrl);
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

