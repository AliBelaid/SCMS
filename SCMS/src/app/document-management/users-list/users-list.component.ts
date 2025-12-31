import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserManagementService, User } from '../user-management.service';
import { AuthService } from 'src/assets/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-users-list',
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
    MatDialogModule
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  users: User[] = [];
  dataSource!: MatTableDataSource<User>;
  displayedColumns: string[] = ['code', 'description', 'email', 'role', 'isActive', 'lastActive', 'actions'];
  
  searchTerm: string = '';
  isLoading = true;
  currentUser: any;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserManagementService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.initializeDataSource();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoading = false;
        }
      });
  }

  initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.users);
    
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
    const filterValue = this.searchTerm.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  clearFilter(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  editUser(user: User): void {
    this.router.navigate([
      '/app/document-management/users/edit',
      user.id
    ]);
  }

  deleteUser(user: User): void {
    if (confirm(`هل أنت متأكد من حذف المستخدم "${user.code}"؟`)) {
      this.userService.deleteUser(user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            alert('فشل حذف المستخدم');
          }
        });
    }
  }

  activateUser(user: User): void {
    this.userService.activateUser(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error activating user:', error);
          alert('فشل تفعيل المستخدم');
        }
      });
  }

  deactivateUser(user: User): void {
    if (confirm(`هل أنت متأكد من إلغاء تفعيل المستخدم "${user.code}"؟`)) {
      this.userService.deactivateUser(user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deactivating user:', error);
            alert('فشل إلغاء تفعيل المستخدم');
          }
        });
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/app/document-management/users/create']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/app/document-management/dashboard']);
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'Admin': 'warn',
      'Member': 'primary',
      'Uploader': 'accent'
    };
    return colors[role] || '';
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'Admin': 'مدير',
      'Member': 'عضو',
      'Uploader': 'مرفع ملفات'
    };
    return labels[role] || role;
  }

  canEdit(): boolean {
    return this.authService.isAdmin();
  }

  canDelete(): boolean {
    return this.authService.isAdmin();
  }

  formatDate(date: Date | string): string {
    if (!date) return 'غير متوفر';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

