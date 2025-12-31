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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { VisitorManagementService } from '../services/visitor-management.service';
import { trigger, transition, style, animate } from '@angular/animations';

interface VisitorListItem {
  id: number;
  fullName: string;
  nationalId?: string;
  phone?: string;
  company?: string;
  profileImageUrl?: string;
  isBlocked: boolean;
  totalVisits: number;
  lastVisitDate?: string;
  createdAt: string;
}

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-visitors-list',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './visitors-list.component.html',
  styleUrls: ['./visitors-list.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class VisitorsListComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  visitors: VisitorListItem[] = [];
  filteredVisits: VisitorListItem[] = [];
  dataSource!: MatTableDataSource<VisitorListItem>;
  displayedColumns: string[] = [
    'profileImage',
    'fullName',
    'nationalId',
    'phone',
    'company',
    'totalVisits',
    'lastVisitDate',
    'status',
    'actions'
  ];

  departments: Department[] = [];
  
  // Filters
  searchTerm: string = '';
  selectedDepartment: number | null = null;

  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private visitorService: VisitorManagementService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadVisitors();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== Data Loading ====================

  loadDepartments(): void {
    this.visitorService.loadDepartments()
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

  loadVisitors(): void {
    this.isLoading = true;
    
    this.visitorService.getVisitors(this.selectedDepartment || undefined, this.searchTerm || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (visitors) => {
          console.log('✅ Visitors loaded:', visitors.length, 'visitors');
          this.visitors = visitors || [];
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading visitors:', error);
          this.showNotification('فشل تحميل الزوار', 'error');
          this.visitors = [];
          this.filteredVisits = [];
          this.initializeDataSource();
          this.isLoading = false;
        }
      });
  }

  // ==================== Filtering ====================

  applyFilters(): void {
    let filtered = [...this.visitors];

    // Search filter (already applied by backend, but keeping for client-side if needed)
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(visitor =>
        visitor.fullName.toLowerCase().includes(search) ||
        (visitor.nationalId && visitor.nationalId.toLowerCase().includes(search)) ||
        (visitor.phone && visitor.phone.toLowerCase().includes(search)) ||
        (visitor.company && visitor.company.toLowerCase().includes(search))
      );
    }

    this.filteredVisits = filtered;
    this.initializeDataSource();
  }

  initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.filteredVisits);
    
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
    this.loadVisitors();
  }

  onSearchChange(): void {
    // Debounce search - reload from server
    this.loadVisitors();
  }

  onDepartmentChange(): void {
    this.loadVisitors();
  }

  // ==================== Actions ====================

  viewVisitorProfile(visitor: VisitorListItem): void {
    this.router.navigate(['/app/visitor-management/visitors/profile', visitor.id]);
  }

  viewVisitHistory(visitor: VisitorListItem): void {
    this.router.navigate(['/app/visitor-management/visitors/profile', visitor.id], {
      queryParams: { tab: 'history' }
    });
  }

  // ==================== Helpers ====================

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getImageUrl(imageUrl?: string): string | null {
    if (!imageUrl || imageUrl.trim() === '') return null;
    // If already full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // For relative URLs, they should already be resolved by backend with full URL
    return imageUrl;
  }

  hasImage(imageUrl?: string): boolean {
    return imageUrl != null && imageUrl.trim() !== '';
  }

  // Track failed image loads
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

