import { MatSortModule } from '@angular/material/sort';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {  ErrorStateMatcher, MatNativeDateModule, MatOptionModule, MatRippleModule, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserDetalisComponent } from './user-detalis/user-detalis.component';
import { MatMenuModule } from '@angular/material/menu';

 import { CdkStepperModule } from '@angular/cdk/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { UserPhotoComponent } from './user-photo/user-photo.component';
import { UserFriendsComponent } from './user-friends/user-friends.component';
import { UserPhotoUpdateComponent } from './user-photo-update/user-photo-update.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ImgComponent } from './img/img.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { EditUserComponent } from './edit-user/edit-user.component';
import { LocalCompanyComponent } from './edit-user/local-company/local-company.component';
import { InterNaitnlCompanyComponent } from './edit-user/Inter-naitnl-company/Inter-naitnl-company.component';
import { UserConfigMaskDirective } from './edit-user/Inter-naitnl-company/siteConfigMask';
import { MaterialFileInputModule, NGX_MAT_FILE_INPUT_CONFIG } from 'ngx-material-file-input';
import { config } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatSidenavModule } from '@angular/material/sidenav';

import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { FileUploadComponent } from 'src/assets/file-upload/file-upload.component';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
 export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@NgModule({
    declarations: [UserProfileComponent,
        UserPhotoComponent,
        UserFriendsComponent,
        UserPhotoUpdateComponent,
        ImgComponent,FileUploadComponent ,
        EditUserComponent ,UserConfigMaskDirective,
    LocalCompanyComponent , InterNaitnlCompanyComponent,



    ],
    providers: [

      DatePipe,
    //   SitesDetailedResolver,
    //    { provide: NGX_MAT_FILE_INPUT_CONFIG, useValue: config },
    //     { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    // ],
    ],
    imports: [
      MatSortModule,
      MatSidenavModule,
      MaterialFileInputModule,
        CommonModule,
        UserRoutingModule,

        MatTabsModule,
        MatButtonModule,MatChipsModule,
        MatIconModule,
          TranslateModule,
        MatRippleModule,
        MatButtonModule,TranslateModule,
        MatIconModule,
        MatMenuModule,
         MatRippleModule,
        CdkStepperModule,
        MatSelectModule,ReactiveFormsModule,
                MatDatepickerModule,        MatNativeDateModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatStepperModule,
        MatInputModule,
        MatCheckboxModule,
        MatOptionModule,
        MatCardModule,
        MatNativeDateModule,
        MatDialogModule,
        MatFormFieldModule,
        MatRadioModule,
        MatDividerModule,
        ReactiveFormsModule,
        MatButtonModule,
          MatButtonModule,MatIconModule,
MatButtonToggleModule,
ReactiveFormsModule,
FormsModule,
 MatDatepickerModule,
MatButtonModule,
MatIconModule,
MatRippleModule,
MatIconModule,
MatIconModule,
MatTableModule,
MatPaginatorModule,

VexBreadcrumbsComponent,
ReactiveFormsModule,
FormsModule,
MatInputModule,
MatTabsModule,
MatDialogModule,
 MatTooltipModule,
 RouterModule,
MatIconModule,
VexPageLayoutComponent,
VexPageLayoutHeaderDirective,
VexPageLayoutContentDirective,
NgIf,
NgFor,
NgClass,
]

 ,


})
export class UserModule { }
