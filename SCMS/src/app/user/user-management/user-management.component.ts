import { AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Observable, of, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { IUserNew, Clinic } from 'src/assets/user';
import { AdminService } from '../../admin/admin.service';
import { PasswordRestComponent } from '../../admin/Modals/password-rest/password-rest.component';
// import { CreateUserComponent } from '../../admin/Modals/create-user/create-user.component';
// import { RolesModalComponent } from '../../admin/Modals/roles-management/roles-management.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatMenuModule,
    MatInputModule,
    VexBreadcrumbsComponent,
    VexPageLayoutComponent,
    VexPageLayoutHeaderDirective,
    VexPageLayoutContentDirective,
    MatButtonToggleModule,
    NgIf,
    NgFor,
    NgClass,
    MatDividerModule,
    MatListModule,
    TranslateModule,
    MatCardModule,
  ],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
          style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class UserManagementComponent implements OnInit, AfterViewInit {
  // For table expansion
  expandedUser: IUserNew | null = null;
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');

  // Data source and selections
  subject$: ReplaySubject<IUserNew[]> = new ReplaySubject<IUserNew[]>(1);
  data$: Observable<IUserNew[]> = this.subject$.asObservable();
  dataSource: MatTableDataSource<IUserNew> = new MatTableDataSource();
  selection = new SelectionModel<IUserNew>(true, []);
  
  // Search and layout controls
  searchCtrl = new UntypedFormControl();
  layoutCtrl = new UntypedFormControl('fullwidth');
  
  // Table columns definition
  columns: TableColumn<IUserNew>[] = [
    { label: 'Select', property: 'select', type: 'checkbox', visible: true, matColumnDef: 'select' },
    { label: 'Profile', property: 'avatar', type: 'image', visible: true, matColumnDef: 'avatar' },
    { label: 'ID', property: 'id', type: 'text', visible: true, cssClasses: ['font-medium'], matColumnDef: 'id' },
    { label: 'Username', property: 'userName', type: 'text', visible: true, cssClasses: ['font-medium'], matColumnDef: 'userName' },
    { label: 'Email', property: 'email', type: 'text', visible: true, cssClasses: ['font-medium'], matColumnDef: 'email' },
    { label: 'Roles', property: 'roles', type: 'text', visible: true, cssClasses: ['font-medium'], matColumnDef: 'roles' },
    { label: 'Specialties', property: 'specialties', type: 'text', visible: true, cssClasses: ['font-medium'], matColumnDef: 'specialties' },
    { label: 'Status', property: 'status', type: 'text', visible: true, cssClasses: ['font-medium'], matColumnDef: 'status' },
    { label: 'Actions', property: 'actions', type: 'button', visible: true, matColumnDef: 'actions' },
  ];

  // Pagination settings
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  // Filter data
  activeRoleFilter: string = '';
  activeSpecialtyFilter: string | number = '';
  
  // Local data
  users: IUserNew[] = [];
  specialties: Clinic[] = [];
  
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor(
    private adminService: AdminService, 
    private dialog: MatDialog,
 
    private snackbarService: ToastrService
  ) {}

  ngOnInit() {
    // Load users and specialties
    this.loadUsers();
   // this.loadSpecialties();

    // Set up data subscription
    this.data$.pipe(
      filter<IUserNew[]>(Boolean),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(users => {
      this.users = users;
      this.dataSource.data = users;
    });

    // Set up search filter
    this.searchCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.onFilterChange(value));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
    this.adminService.getUsers().subscribe(response => {
      // Convert User[] to IUserNew[] - this is a temporary solution
      this.users = (response.data || []).map(user => ({
        ...user,
        // Add missing properties with default values
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        fullName: user.displayName || '',
        roles: user.roles || [],
        specialties: [],
        status: user.isActive ? 'Active' : 'Inactive',
        categories: [],
        accountType: 'Standard',
        pathCoverImage: '',
        logo: '',
        clinics: [],
        reginLibyana: '',
        phoneNumber: user.phoneNumber || '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        profilePicture: '',
        displayName: user.displayName || '',
        KnownAs: '',
        token: '',
        photoUrl: '',
        isEmailVerified: false,
        isPhoneVerified: false,
        lastLoginAt: '',
        loginAttempts: 0,
        lockedUntil: '',
        passwordChangedAt: '',
        twoFactorEnabled: false,
        twoFactorSecret: '',
        backupCodes: [],
        preferences: {},
        metadata: {},
        tags: [],
        notes: '',
        externalId: '',
        source: '',
        version: 1,
        isDeleted: false,
        deletedAt: '',
        deletedBy: '',
        restoredAt: '',
        restoredBy: '',
        archivedAt: '',
        archivedBy: '',
        isArchived: false,
        createdBy: user.createdBy || '',
        updatedBy: ''
      } as unknown as IUserNew));
      this.subject$.next(this.users);
    });
  }

 

  // Getters
  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  // Count methods for dashboard cards
  getRoleCount(role: string): number {
    if (!this.users) return 0;
    return this.users.filter(user => 
      user.roles && user.roles.some(r => r === role)
    ).length;
  }

  // Table selection methods
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // Filter methods
  onFilterChange(value: string) {
    if (!this.dataSource) return;
    
    value = value.trim().toLowerCase();
    this.dataSource.filter = value;
  }

  filterByRole(event: MatSelectChange) {
    this.activeRoleFilter = event.value;
    this.applyFilters();
  }

  filterBySpecialty(event: MatSelectChange) {
    this.activeSpecialtyFilter = event.value;
    this.applyFilters();
  }

  applyFilters() {
    // Reset dataSource to all users first
    this.dataSource.data = this.users;
    
    let filteredData = this.users;
    
    // Apply role filter if active
    if (this.activeRoleFilter) {
      filteredData = filteredData.filter(user => 
        user.roles && user.roles.includes(this.activeRoleFilter)
      );
    }
    
    // Apply specialty filter if active
    if (this.activeSpecialtyFilter) {
      const specialty = this.specialties.find(s => s.id === this.activeSpecialtyFilter);
      if (specialty) {
        filteredData = filteredData.filter(user => 
          user.specialties && user.specialties.some(s => s.includes(specialty.specialtyName))
        );
      }
    }
    
    // Update data source
    this.dataSource.data = filteredData;
  }

  // Action methods
  createUser() {
    // TODO: Implement create user dialog
    console.log('Create user functionality to be implemented');
    this.snackbarService.info('Create user functionality to be implemented');
  }

  openRolesDialog(user: IUserNew) {
    // TODO: Implement roles dialog
    console.log('Open roles dialog for user:', user);
    this.snackbarService.info('Roles dialog functionality to be implemented');
  }

  openDialogRestPassword(user: IUserNew) {
    const dialogRef = this.dialog.open(PasswordRestComponent, {
      width: '500px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe((pwd: string) => {
      if (pwd) {
        this.adminService.resetUserPassword(user.id).subscribe({
          next: (response: any) => {
            this.snackbarService.success('Password reset successfully');
          },
          error: (error) => {
            this.snackbarService.error('Failed to reset password: ' + error);
          }
        });
      }
    });
  }


  deleteCustomer(user: IUserNew) {
    this.dialog.open(ConfirmDialogComponent)
      .afterClosed()
      .subscribe(confirm => {
        if (confirm) {
          this.adminService.deleteUser(user.id).subscribe({
            next: () => {
              this.loadUsers();
              this.snackbarService.success('User deleted successfully');
            },
            error: (error) => {
              this.snackbarService.error('Failed to delete user: ' + error);
            }
          });
        }
      });
  }

  deleteCustomers(users: IUserNew[]) {
    this.dialog.open(ConfirmDialogComponent)
      .afterClosed()
      .subscribe(confirm => {
        if (confirm) {
          // In a real app, you would batch delete these users
          // For now, we'll just delete them one by one
          let deletedCount = 0;
          
          users.forEach(user => {
            this.adminService.deleteUser(user.id).subscribe({
              next: () => {
                deletedCount++;
                if (deletedCount === users.length) {
                  this.loadUsers();
                  this.selection.clear();
                  this.snackbarService.success(`${deletedCount} users deleted successfully`);
                }
              },
              error: (error) => {
                this.snackbarService.error(`Failed to delete user: ${user.userName}`);
              }
            });
          });
        }
      });
  }

  // Helper methods
  getRoles(user: IUserNew): any[] {
    const roles: any[] = [];
    const userRoles = user.roles;
    const availableRoles: any[] = [
      { name: 'Admin', value: 'Admin' },
      { name: 'Doctor', value: 'Doctor' },
      { name: 'Patient', value: 'Patient' },
      { name: 'Pharmacy', value: 'Pharmacy' },
      { name: 'Reception', value: 'Reception' },
    ];

    availableRoles.forEach(role => {
      let isMatch = false;
      if (userRoles) {
        for (const userRole of userRoles) {
          if (userRole === role.name) {
            role.checked = true;
            isMatch = true;
            roles.push(role);
            break;
          }
        }
      }

      if (!isMatch) {
        role.checked = false;
        roles.push(role);
      }
    });

    return roles;
  }

  getSpecialty(user: IUserNew): any[] {
    const UserSpecialties: any[] = [];
    const userRoles = user.specialties || [];
    const availableSpecialties: any[] = this.specialties || [];

    availableSpecialties.forEach(item => {
      let isMatch = false;
      
      if (Array.isArray(userRoles)) {
        for (const specialty of userRoles) {
          if (specialty && typeof specialty === 'string' && specialty.includes(item.specialtyName)) {
            item.checked = true;
            isMatch = true;
            UserSpecialties.push(item);
            break;
          }
        }
      }

      if (!isMatch) {
        item.checked = false;
        UserSpecialties.push(item);
      }
    });

    return UserSpecialties;
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }
} 