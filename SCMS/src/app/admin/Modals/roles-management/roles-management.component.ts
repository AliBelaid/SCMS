import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTreeModule } from '@angular/material/tree';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { AddEditRoleDialogComponent } from './add-edit-role-dialog.component';
import { RoleService } from 'src/app/services/role.service';

@Component({
  selector: 'vex-roles-management',
  templateUrl: './roles-management.component.html',
  styleUrls: ['./roles-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatTabsModule,
    MatStepperModule,
    MatRadioModule,
    MatSliderModule,
    MatAutocompleteModule,
    MatTreeModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatGridListModule,
    MatRippleModule,
    MatSidenavModule,
    MatToolbarModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  providers: [RoleService]
})
export class RolesManagementComponent implements OnInit {
  roles: any[] = [];
  filteredRoles: any[] = [];
  loading = false;
  error: string | null = null;

  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private roleService: RoleService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: ['all']
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.setupFilterListeners();
  }

  private loadRoles(): void {
    this.loading = true;
    this.error = null;

    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.filteredRoles = roles;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load roles. Please try again later.';
        this.loading = false;
        console.error('Error loading roles:', err);
      }
    });
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    const { search, status } = this.filterForm.value;
    const searchLower = search.toLowerCase();

    this.filteredRoles = this.roles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(searchLower) ||
                          role.description.toLowerCase().includes(searchLower);

      const matchesStatus = status === 'all' ||
                          (status === 'active' && role.isActive) ||
                          (status === 'inactive' && !role.isActive);

      return matchesSearch && matchesStatus;
    });
  }

  openAddRoleDialog(): void {
    const dialogRef = this.dialog.open(AddEditRoleDialogComponent, {
      width: '500px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRoles();
      }
    });
  }

  openEditRoleDialog(role: any): void {
    const dialogRef = this.dialog.open(AddEditRoleDialogComponent, {
      width: '500px',
      data: { mode: 'edit', role }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRoles();
      }
    });
  }

  openDeleteRoleDialog(role: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Role',
        message: `Are you sure you want to delete the role "${role.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteRole(role.id);
      }
    });
  }

  private deleteRole(roleId: number): void {
    this.roleService.deleteRole(roleId.toString()).subscribe({
      next: () => {
        this.loadRoles();
      },
      error: (err) => {
        console.error('Error deleting role:', err);
        // Show error notification
      }
    });
  }

  toggleRoleStatus(role: any): void {
    const updatedRole = { ...role, isActive: !role.isActive };
    this.roleService.updateRole(role.id, updatedRole).subscribe({
      next: () => {
        this.loadRoles();
      },
      error: (err) => {
        console.error('Error updating role status:', err);
        // Show error notification
      }
    });
  }
}
