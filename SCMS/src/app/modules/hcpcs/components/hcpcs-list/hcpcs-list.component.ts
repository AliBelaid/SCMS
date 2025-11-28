import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime } from 'rxjs';
import { HCPCSService } from '../../services/hcpcs.service';
import {
  HCPCSCode,
  HCPCSQueryParams,
  HCPCSStatistics
} from '../../models/hcpcs.models';

@Component({
  selector: 'app-hcpcs-list',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSlideToggleModule,
    TranslateModule
  ],
  templateUrl: './hcpcs-list.component.html',
  styleUrls: ['./hcpcs-list.component.scss']
})
export class HCPCSListComponent implements OnInit, AfterViewInit {
  filterForm!: FormGroup;
  // Table configuration
  displayedColumns: string[] = [
    'select',
    'code',
    'shortDescription',
    'longDescription',
    'actionCode',
    'category',
    'status',
    'actions'
  ];
  
  dataSource = new MatTableDataSource<HCPCSCode>([]);
  selection = new SelectionModel<HCPCSCode>(true, []);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // Loading states
  loading = false;
  importing = false;
  exporting = false;
  
  // Pagination
  totalCount = 0;
  pageSize = 50;
  pageNumber = 1;
  pageSizeOptions = [10, 25, 50, 100, 200];
  
  // Filters
  searchTerm = '';
  selectedCategory = '';
  activeFilter: boolean | null = null;
  categories: string[] = [];
  
  // Statistics
  statistics: HCPCSStatistics | null = null;

  constructor(
    private hcpcsService: HCPCSService,
    private router: Router,
    private snack: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initializeFilterForm();
    this.loadCategories();
    this.loadStatistics();
    this.applyFilters(this.filterForm.value);
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      category: [''],
      isActive: [null],
    });

    this.filterForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.pageNumber = 1;
        this.applyFilters(value);
      });
  }

  private applyFilters(value: { searchTerm: string | null; category: string | null; isActive: boolean | null }): void {
    this.searchTerm = value.searchTerm ?? '';
    this.selectedCategory = value.category ?? '';
    this.activeFilter =
      value.isActive === null || value.isActive === undefined ? null : !!value.isActive;

    this.loadData();
  }

  // ==================== DATA LOADING ====================

  loadData() {
    this.loading = true;
    
    const params: HCPCSQueryParams = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      category: this.selectedCategory || undefined,
      isActive: this.activeFilter !== null ? this.activeFilter : undefined,
      sortBy: this.sort?.active || 'code',
      sortOrder: this.sort?.direction || 'asc'
    };

    this.hcpcsService.getHCPCSList(params).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading HCPCS codes:', error);
        this.snack.open('Failed to load HCPCS codes', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.hcpcsService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadStatistics() {
    this.hcpcsService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  // ==================== SEARCH & FILTER ====================

  clearSearch() {
    this.filterForm.patchValue({ searchTerm: '' });
  }

  clearFilters() {
    this.filterForm.setValue({
      searchTerm: '',
      category: '',
      isActive: null,
    });
  }

  // ==================== PAGINATION ====================

  onPageChange(event: PageEvent) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  // ==================== SORTING ====================

  onSortChange(sort: Sort) {
    this.pageNumber = 1;
    this.loadData();
  }

  // ==================== SELECTION ====================

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  clearSelection() {
    this.selection.clear();
  }

  // ==================== ACTIONS ====================

  onCreate() {
    this.router.navigate(['/app/hcpcs/create']);
  }

  onEdit(hcpcs: HCPCSCode) {
    this.router.navigate(['/app/hcpcs/edit', hcpcs.id]);
  }

  onView(hcpcs: HCPCSCode) {
    this.router.navigate(['/app/hcpcs/view', hcpcs.id]);
  }

  onDelete(hcpcs: HCPCSCode) {
    if (!confirm(`Are you sure you want to delete HCPCS code "${hcpcs.code}"?`)) {
      return;
    }

    this.hcpcsService.delete(hcpcs.id!).subscribe({
      next: () => {
        this.snack.open('HCPCS code deleted successfully', 'Close', { duration: 3000 });
        this.loadData();
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error deleting HCPCS code:', error);
        this.snack.open('Failed to delete HCPCS code', 'Close', { duration: 3000 });
      }
    });
  }

  onToggleActive(hcpcs: HCPCSCode) {
    this.hcpcsService.toggleActive(hcpcs.id!).subscribe({
      next: (updated) => {
        hcpcs.isActive = updated.isActive;
        this.snack.open(
          `HCPCS code ${updated.isActive ? 'activated' : 'deactivated'}`,
          'Close',
          { duration: 2000 }
        );
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error toggling HCPCS status:', error);
        this.snack.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  onBulkDelete() {
    const selected = this.selection.selected;
    if (selected.length === 0) {
      this.snack.open('No items selected', 'Close', { duration: 2000 });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selected.length} HCPCS codes?`)) {
      return;
    }

    const ids = selected.map(item => item.id!);
    
    this.hcpcsService.bulkDelete(ids).subscribe({
      next: () => {
        this.snack.open(`${selected.length} HCPCS codes deleted`, 'Close', { duration: 3000 });
        this.selection.clear();
        this.loadData();
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error bulk deleting:', error);
        this.snack.open('Failed to delete HCPCS codes', 'Close', { duration: 3000 });
      }
    });
  }

  // ==================== IMPORT / EXPORT ====================

  onImportExcel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        this.importFile(file);
      }
    };
    
    input.click();
  }

  importFile(file: File) {
    const overwriteExisting = confirm(
      'Do you want to overwrite existing codes with the same code value?\n\n' +
      'Click OK to overwrite existing codes.\n' +
      'Click Cancel to skip duplicates.'
    );

    this.importing = true;
    
    this.hcpcsService.importFromExcel(file, overwriteExisting).subscribe({
      next: (result) => {
        this.importing = false;
        
        const message = `
          Import completed!
          Total processed: ${result.totalProcessed}
          Successful: ${result.successful}
          Failed: ${result.failed}
          Duplicates: ${result.duplicates.length}
        `;
        
        alert(message);
        
        if (result.errors.length > 0) {
          console.error('Import errors:', result.errors);
        }
        
        this.loadData();
        this.loadStatistics();
      },
      error: (error) => {
        this.importing = false;
        console.error('Error importing file:', error);
        this.snack.open('Failed to import Excel file', 'Close', { duration: 3000 });
      }
    });
  }

  onExportExcel() {
    this.exporting = true;
    
    const params: HCPCSQueryParams = {
      searchTerm: this.searchTerm || undefined,
      category: this.selectedCategory || undefined,
      isActive: this.activeFilter !== null ? this.activeFilter : undefined
    };

    this.hcpcsService.exportToExcel(params).subscribe({
      next: (blob) => {
        this.exporting = false;
        const filename = `HCPCS_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
        this.hcpcsService.downloadBlob(blob, filename);
        this.snack.open('Excel file exported successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.exporting = false;
        console.error('Error exporting:', error);
        this.snack.open('Failed to export Excel file', 'Close', { duration: 3000 });
      }
    });
  }

  onDownloadTemplate() {
    this.hcpcsService.downloadTemplate().subscribe({
      next: (blob) => {
        this.hcpcsService.downloadBlob(blob, 'HCPCS_Template.xlsx');
        this.snack.open('Template downloaded successfully', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error downloading template:', error);
        this.snack.open('Failed to download template', 'Close', { duration: 3000 });
      }
    });
  }

  // ==================== UTILITY ====================

  getStatusColor(isActive?: boolean): string {
    return isActive ? '#4caf50' : '#f44336';
  }

  getStatusText(isActive?: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  trackByCode(index: number, item: HCPCSCode): string {
    return item.code;
  }
}