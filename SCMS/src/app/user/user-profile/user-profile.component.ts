import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { fadeInRight400ms } from 'src/@vex/animations/fade-in-right.animation';
import { scaleIn400ms } from 'src/@vex/animations/scale-in.animation';
import { UserService } from '../user.service';
import { IUserNew } from 'src/assets/user';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileDialogComponent } from '../user-profile-dialog/user-profile-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

interface NavLink {
  label: string;
  route: string;
  icon: string;
  disabled?: boolean;
}

@Component({
  selector: 'vex-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  animations: [
    scaleIn400ms,
    fadeInRight400ms
  ]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  isLoading = true;
  userSubscription: Subscription;
  public photoCover: string = 'assets/img/medical/background1.jpg';
  public photoAvatar: string = 'assets/img/Medical/user.jpg';
  user: IUserNew;
  editMode = false;
  
  // Navigation links with appropriate icons
  links: NavLink[] = [
    {
      label: 'DETAILS',
      route: 'details',
      icon: 'mat:person'
    }
  ];

  constructor(
    public userService: UserService, 
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public translate: TranslateService,
    private snackBar: MatSnackBar
  ) {
    this.loadingUser();
  }

  loadingUser() {
    this.isLoading = true;
    this.userService.loadCurrentUser().subscribe({
      next: () => {
        this.userService.currentUser$.pipe(take(1)).subscribe(response => {
          if (response) {
            this.user = response;
            this.photoAvatar = this.user.logo || 'assets/img/Medical/user.jpg';
            this.photoCover = this.user.pathCoverImage || 'assets/img/medical/background1.jpg';

            // Configure navigation links based on user role
            this.configureNavigationLinks();
            
            // Navigate to details page by default
            if (this.router.url.endsWith('/user')) {
              this.router.navigate(['details'], { relativeTo: this.route });
            }
            
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error("Error loading user:", err);
        this.isLoading = false;
        this.snackBar.open(this.translate.instant('ERROR_LOADING_USER'), 
          this.translate.instant('CLOSE'), { duration: 3000 });
      }
    });
  }

  ngOnInit(): void {
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.isLoading = false;
      }
    });
    
    this.userService.logoUserAvatar.subscribe(avatar => {
      if (avatar) {
        this.photoAvatar = avatar;
      }
    });
    
    this.userService.logoUser.subscribe(cover => {
      if (cover) {
        this.photoCover = cover;
      }
    });
  }

  openContact() {
    const dialogRef = this.dialog.open(UserProfileDialogComponent, {
      width: '800px',
      data: this.user,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh user data
        this.loadingUser();
      }
    });
  }

  // Configure navigation links based on user role
  private configureNavigationLinks() {
    // Basic navigation for all users
    this.links = [
      {
        label: 'DETAILS',
        route: 'details',
        icon: 'mat:person'
      },
      {
        label: 'EDIT',
        route: 'edith',
        icon: 'mat:edit'
      }
    ];

    // Add role-specific links
    if (this.user.roles) {
      // For Medical Technicians
      if (this.user.roles.includes('MedicalTechnician')) {
        this.links.push(
          {
            label: 'QUEUE',
            route: 'queue',
            icon: 'mat:queue'
          },
          {
            label: 'BALANCE',
            route: 'balance',
            icon: 'mat:account_balance'
          }
        );
      }
      
      // For Doctors (if they access the user profile)
      if (this.user.roles.includes('Doctor')) {
        this.links.push(
          {
            label: 'SCHEDULE',
            route: 'schedule',
            icon: 'mat:calendar_today'
          }
        );
      }
      
      // For Finance or Admin roles
      if (this.user.roles.includes('Finance') || this.user.roles.includes('Admin')) {
        this.links.push(
          {
            label: 'REPORTS',
            route: 'reports',
            icon: 'mat:assessment'
          }
        );
      }
    }
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
