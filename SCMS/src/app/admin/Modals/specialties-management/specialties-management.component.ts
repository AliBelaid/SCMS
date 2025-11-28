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
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-specialties-management',
  templateUrl: './specialties-management.component.html',
  styleUrls: ['./specialties-management.component.scss'],
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
    MatChipsModule,
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
    MatChipsModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatGridListModule,
    MatRippleModule,
    MatSidenavModule,
    MatToolbarModule,
     TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class SpecialtiesManagementComponent implements OnInit {
  specialties: any[] = [];
  filteredSpecialties: any[] = [];
  loading = false;
  error: string | null = null;

  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: ['all']
    });
  }

  ngOnInit(): void {
    this.loadSpecialties();
    this.setupFilterListeners();
  }

  private loadSpecialties(): void {
    this.loading = true;
    this.error = null;
    // TODO: Implement specialty loading logic
    this.loading = false;
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    const { search, status } = this.filterForm.value;
    const searchLower = search.toLowerCase();

    this.filteredSpecialties = this.specialties.filter(specialty => {
      const matchesSearch = specialty.name.toLowerCase().includes(searchLower) ||
                          specialty.description.toLowerCase().includes(searchLower);

      const matchesStatus = status === 'all' ||
                          (status === 'active' && specialty.isActive) ||
                          (status === 'inactive' && !specialty.isActive);

      return matchesSearch && matchesStatus;
    });
  }

  openAddSpecialtyDialog(): void {
    // TODO: Implement add specialty dialog
  }

  openEditSpecialtyDialog(specialty: any): void {
    // TODO: Implement edit specialty dialog
  }

  openDeleteSpecialtyDialog(specialty: any): void {
    // TODO: Implement delete specialty dialog
  }

  toggleSpecialtyStatus(specialty: any): void {
    // TODO: Implement toggle specialty status
  }
}
