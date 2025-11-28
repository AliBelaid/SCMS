import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { fadeInRight400ms } from 'src/@vex/animations/fade-in-right.animation';
import { scaleIn400ms } from 'src/@vex/animations/scale-in.animation';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface NavLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './app-profile.component.html',
  styleUrls: ['./app-profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatOptionModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    VexPageLayoutComponent,
    VexPageLayoutContentDirective,
    VexPageLayoutHeaderDirective,
    NgxSpinnerModule
  ],
  animations: [
    scaleIn400ms,
    fadeInRight400ms
  ]
})
export class AppProfileComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  activeTabIndex: number = 0;
  private subscription: Subscription;
  private destroy$ = new Subject<void>();
  
  navLinks: NavLink[] = [
    { path: 'details', label: 'Details', icon: 'mat:person' },
    { path: 'settings', label: 'Settings', icon: 'mat:settings' },
    { path: 'security', label: 'Security', icon: 'mat:security' },
    { path: 'notifications', label: 'Notifications', icon: 'mat:notifications' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isLoading = false;

    // Subscribe to route changes to update active tab
    this.subscription = this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      const activeTabPath = this.navLinks.findIndex(tab => 
        currentUrl.includes(`/${tab.path}`)
      );
      
      if (activeTabPath >= 0) {
        this.activeTabIndex = activeTabPath;
      } else {
        // If no specific tab is selected, navigate to schedule
        this.router.navigate(['schedule'], { relativeTo: this.route });
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  openEditMode(): void {
    // Implement edit mode functionality
  }
} 