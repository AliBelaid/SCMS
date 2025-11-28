// medical-provider-management.component.ts
import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/assets/environments/environment';
import { catchError, of } from 'rxjs';
import { medicalProvider, medical_provider_dto } from 'src/assets/models/medical-provider.model';

// export interface medicalprovider {
//   id: number;
//   name: string;
//   nameAr?: string;
//   code: string;
//   city: string;
//   address?: string;
//   phoneNumber?: string;
//   email?: string;
//   latitude?: number;
//   longitude?: number;
//   active: boolean;
//   created: Date;
//   userCount?: number;
//   isHeadquarters?: boolean;
// }

@Component({
  selector: 'app-medical-provider-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatBadgeModule,
    TranslateModule
  ],
  templateUrl: './medical-provider-management.component.html',
  styleUrls: ['./medical-provider-management.component.scss']
})
export class MedicalProviderManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private apiUrl = environment.apiUrl;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'code',
    'name',
    'city',
    'address',
    'phoneNumber',
    'userCount',
    'headquarters',
    'active',
    'actions'
  ];

  dataSource: MatTableDataSource<medical_provider_dto> = new MatTableDataSource();
  loading = signal(false);
  searchTerm = signal('');
  selectedCity = signal<string>('all');
  medicalproviders = signal<medical_provider_dto[]>([]);
  cities = signal<string[]>([]);
  
  // Track headquarters medical-provider
  headquartersBranch = computed(() => 
    this.medicalproviders().find(b => b.isHeadquarters)
  );
  
  private isBranchActive(branch: medical_provider_dto): boolean {
    return branch.active ?? branch.isActive ?? false;
  }

  // Statistics
  totalBranches = computed(() => this.medicalproviders().length);
  activeBranches = computed(() => this.medicalproviders().filter(b => this.isBranchActive(b)).length);
  totalUsers = computed(() => this.medicalproviders().reduce((sum, b) => sum + (b.userCount || 0), 0));

  ngOnInit() {
    this.loadBranches();
    this.setupFilters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadBranches() {
    this.loading.set(true);
    
    this.http.get<medical_provider_dto[]>(`${this.apiUrl}/api/admin/medical-providers`)
      .pipe(catchError(error => {
        console.error('Error loading medical-providers:', error);
        this.snackBar.open('Failed to load medical-providers', 'Close', { duration: 3000 });
        return of([]);
      }))
      .subscribe(medicalproviders => {
        this.medicalproviders.set(medicalproviders);
        this.dataSource.data = medicalproviders;
        
        // Extract unique cities
        const uniqueCities = [...new Set(medicalproviders.map(b => b.city))];
        this.cities.set(uniqueCities);
        
        this.loading.set(false);
      });
  }

  setupFilters() {
    this.dataSource.filterPredicate = (data: medical_provider_dto, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.name.toLowerCase().includes(searchStr) ||
             data.code.toLowerCase().includes(searchStr) ||
             data.city.toLowerCase().includes(searchStr) ||
             (data.address?.toLowerCase().includes(searchStr) || false) ||
             (data.phoneNumber?.includes(searchStr) || false);
    };
  }

  applyFilter() {
    this.dataSource.filter = this.searchTerm().trim().toLowerCase();
    
    if (this.selectedCity() !== 'all') {
      const cityFilter = this.selectedCity();
            this.dataSource.data = this.medicalproviders().filter(b => b.city === cityFilter);
    } else {
      this.dataSource.data = this.medicalproviders();
    }
  }

  openCreateBranchDialog() {
    // TODO: Create MedicalProviderDialogComponent
    this.snackBar.open('Create dialog coming soon', 'Close', { duration: 2000 });
    // const dialogRef = this.dialog.open(MedicalProviderDialogComponent, {
    //   width: '600px',
    //   data: { 
    //     mode: 'create',
    //     hasHeadquarters: !!this.headquartersBranch()
    //   }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.createBranch(result);
    //   }
    // });
  }

  openEditBranchDialog(medicalprovider: medical_provider_dto) {
    // TODO: Create MedicalProviderDialogComponent
    this.snackBar.open('Edit dialog coming soon', 'Close', { duration: 2000 });
    // const dialogRef = this.dialog.open(MedicalProviderDialogComponent, {
    //   width: '600px',
    //   data: { 
    //     mode: 'edit',
    //     medicalprovider: medicalprovider,
    //     hasHeadquarters: !!this.headquartersBranch() && !medicalprovider.isHeadquarters
    //   }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.updateBranch(medicalprovider.id, result);
    //   }
    // });
  }

  openBranchUsersDialog(medicalprovider: medical_provider_dto) {
    // TODO: Implement medical-provider users dialog
    this.snackBar.open('medical-provider users management coming soon', 'Close', { duration: 2000 });
  }

  createBranch(branchData: any) {
    this.loading.set(true);
    
    // If setting as headquarters, need to remove current headquarters first
    if (branchData.isHeadquarters && this.headquartersBranch()) {
      this.removeHeadquartersStatus(this.headquartersBranch()!.id)
        .subscribe(() => {
          this.performCreateBranch(branchData);
        });
    } else {
      this.performCreateBranch(branchData);
    }
  }

  private performCreateBranch(branchData: any) {
    this.http.post<medical_provider_dto>(`${this.apiUrl}/api/admin/medical-providers`, branchData)
      .pipe(catchError(error => {
        console.error('Error creating medical-provider:', error);
        this.snackBar.open(error.message || 'Failed to create medical-provider', 'Close', { duration: 3000 });
        return of(null);
      }))
      .subscribe(medicalprovider => {
        if (medicalprovider) {
          this.snackBar.open('medical-provider created successfully', 'Close', { duration: 3000 });
          this.loadBranches();
        }
        this.loading.set(false);
      });
  }

  updateBranch(medicalProviderId: number, branchData: any) {
    this.loading.set(true);
    
    // If trying to set as headquarters
    if (branchData.isHeadquarters && !this.medicalproviders().find(b => b.id === medicalProviderId)?.isHeadquarters) {
      // Remove headquarters status from current headquarters
      const currentHQ = this.headquartersBranch();
      if (currentHQ) {
        this.removeHeadquartersStatus(currentHQ.id)
          .subscribe(() => {
            this.performUpdateBranch(medicalProviderId, branchData);
          });
        return;
      }
    }
    
    this.performUpdateBranch(medicalProviderId, branchData);
  }

  private performUpdateBranch(medicalProviderId: number, branchData: any) {
    this.http.put<medical_provider_dto>(`${this.apiUrl}/api/admin/medical-providers/${medicalProviderId}`, branchData)
      .pipe(catchError(error => {
        console.error('Error updating medical-provider:', error);
        this.snackBar.open(error.message || 'Failed to update medical-provider', 'Close', { duration: 3000 });
        return of(null);
      }))
      .subscribe(medicalprovider => {
        if (medicalprovider) {
          this.snackBar.open('medical-provider updated successfully', 'Close', { duration: 3000 });
          this.loadBranches();
        }
        this.loading.set(false);
      });
  }

  private removeHeadquartersStatus(medicalProviderId: number) {
    return this.http.put<medical_provider_dto>(`${this.apiUrl}/api/admin/medical-providers/${medicalProviderId}`, { isHeadquarters: false })
      .pipe(catchError(error => {
        console.error('Error removing headquarters status:', error);
        return of(null);
      }));
  }

  toggleBranchStatus(medicalprovider: medical_provider_dto) {
    const currentlyActive = this.isBranchActive(medicalprovider);

    if (medicalprovider.isHeadquarters && currentlyActive) {
      this.snackBar.open('Cannot deactivate headquarters medical-provider', 'Close', { duration: 3000 });
      return;
    }

    this.loading.set(true);

    const payload = { isActive: !currentlyActive, active: !currentlyActive };

    this.http
      .put<medical_provider_dto>(`${this.apiUrl}/api/admin/medical-providers/${medicalprovider.id}`, payload)
      .pipe(
        catchError(error => {
          console.error('Error toggling medical-provider status:', error);
          this.snackBar.open('Failed to update medical-provider status', 'Close', { duration: 3000 });
          return of(null);
        })
      )
      .subscribe(updated => {
        if (updated) {
          this.snackBar.open(
            `medical-provider ${!currentlyActive ? 'activated' : 'deactivated'} successfully`,
            'Close',
            { duration: 3000 }
          );
        }
        this.loadBranches();
        this.loading.set(false);
      });
  }

  setAsHeadquarters(medicalprovider: medical_provider_dto) {
    if (medicalprovider.isHeadquarters) {
      this.snackBar.open('This medical-provider is already headquarters', 'Close', { duration: 2000 });
      return;
    }

    const confirmMsg = this.headquartersBranch() 
      ? `This will remove headquarters status from ${this.headquartersBranch()!.name}. Continue?`
      : 'Set this medical-provider as headquarters?';

    if (!confirm(confirmMsg)) {
      return;
    }

    this.updateBranch(medicalprovider.id, { ...medicalprovider, isHeadquarters: true });
  }

  deleteBranch(medicalprovider: medical_provider_dto) {
    // Prevent deleting headquarters
    if (medicalprovider.isHeadquarters) {
      this.snackBar.open('Cannot delete headquarters medical-provider', 'Close', { duration: 3000 });
      return;
    }

    if (medicalprovider.userCount && medicalprovider.userCount > 0) {
      this.snackBar.open('Cannot delete medical-provider with assigned users', 'Close', { duration: 3000 });
      return;
    }

    if (!confirm(`Are you sure you want to delete medical-provider ${medicalprovider.name}? This action cannot be undone.`)) {
      return;
    }

    this.loading.set(true);
    
    this.http.delete<void>(`${this.apiUrl}/api/admin/medical-providers/${medicalprovider.id}`)
      .pipe(catchError(error => {
        console.error('Error deleting medical-provider:', error);
        this.snackBar.open(error.message || 'Failed to delete medical-provider', 'Close', { duration: 3000 });
        return of(null);
      }))
      .subscribe(() => {
        this.snackBar.open('medical-provider deleted successfully', 'Close', { duration: 3000 });
        this.loadBranches();
        this.loading.set(false);
      });
  }

  exportToExcel() {
    // Implement export functionality
    const data = this.medicalproviders().map(b => ({
      Code: b.code,
      Name: b.name,
      City: b.city,
      Address: b.address || '',
      Phone: b.phoneNumber || '',
      'User Count': b.userCount || 0,
      Headquarters: b.isHeadquarters ? 'Yes' : 'No',
      Status: this.isBranchActive(b) ? 'Active' : 'Inactive'
    }));

    console.log('Export data:', data);
    this.snackBar.open('Export feature coming soon', 'Close', { duration: 2000 });
  }
}