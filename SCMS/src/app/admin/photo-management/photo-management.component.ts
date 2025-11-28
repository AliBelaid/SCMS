import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

import { PasswordRestComponent } from '../Modals/password-rest/password-rest.component';

import { CdkStepperModule } from '@angular/cdk/stepper';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

interface Photo {
  id: number;
  name: string;
  url: string;
  uploadedBy: string;
  tags: string[];
}

@Component({
  selector: 'app-photo-management',
  templateUrl: './photo-management.component.html',
  styleUrls: ['./photo-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,MatCardModule,
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
    MatButtonToggleModule,
    NgIf,
    NgFor,
    MatDividerModule,
    MatListModule,
    TranslateModule,
      MaterialFileInputModule,
        MatTabsModule,
        MatChipsModule,
        MatRippleModule,
        CdkStepperModule,
        MatButtonToggleModule,
        MatSnackBarModule,
        MatSliderModule,
        MatStepperModule,
        MatOptionModule,
        DragDropModule,
        RouterModule ,

],  providers: [
    DatePipe,

  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]

})
export class PhotoManagementComponent implements OnInit {
  photos: any[] = [];
  searchQuery = '';
  viewMode: 'grid' | 'list' = 'grid';
  pageSize = 24;
  totalPhotos = 0;

  constructor() {}

  ngOnInit() {
    // Initialize with sample data
    this.photos = [
      {
        id: 1,
        name: 'Sample Photo 1',
        url: 'assets/images/demo/1.jpg',
        uploadedBy: 'Admin',
        tags: ['sample', 'demo']
      }
    ];
    this.totalPhotos = this.photos.length;
  }

  uploadPhoto() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    // Handle file selection
    fileInput.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Convert file to base64 string
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64String = e.target.result;
          // Here you would typically send the base64 string to your API
          console.log('Image converted to base64:', base64String.substring(0, 50) + '...');
          
          // Add the new photo to the list (in a real app, this would come from the API response)
          this.photos.unshift({
            id: Date.now(), // temporary ID
            name: file.name,
            url: base64String, // Using base64 directly as url
            uploadedBy: 'Current User',
            tags: []
          });
          
          this.totalPhotos = this.photos.length;
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Trigger file selection dialog
    fileInput.click();
  }
}
