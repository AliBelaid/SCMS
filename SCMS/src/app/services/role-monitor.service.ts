import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { SignalRService, RoleChangeNotification } from './signalr.service';
import { Subject, takeUntil, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleMonitorService {
  private destroy$ = new Subject<void>();
  private joinedUserCode: string | null = null;

  constructor(
    private authService: AuthService,
    private signalRService: SignalRService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    console.log('RoleMonitorService: Initializing...');
    
    // Keep SignalR connection and group membership synced with auth state
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          console.log('RoleMonitorService: User logged in, ensuring SignalR connection. User:', user.code);
          this.signalRService.startConnection();

          const newCode = user.code ?? null;
          const codeUser = user.description ?? null; // often holds CodeUser like MEMBER001
          if (this.joinedUserCode && this.joinedUserCode !== newCode) {
            this.signalRService.leaveUserGroup(this.joinedUserCode);
          }
          if (newCode && newCode !== this.joinedUserCode) {
            // Small delay to ensure connection is fully established
            setTimeout(() => this.signalRService.joinUserGroup(newCode), 500);
          }
          this.joinedUserCode = newCode;

          // Also join CodeUser group if present and different (backend sends group notifications by CodeUser)
          if (codeUser && codeUser !== newCode) {
            setTimeout(() => this.signalRService.joinUserGroup(codeUser), 600);
          }
        } else {
          // Logged out
          if (this.joinedUserCode) {
            this.signalRService.leaveUserGroup(this.joinedUserCode);
            this.joinedUserCode = null;
          }
          this.signalRService.stopConnection();
        }
      });

    this.setupRoleChangeListening();
    this.setupRouteMonitoring();
  }

  private setupRoleChangeListening(): void {
    this.signalRService.subscribeToNotifications((notification) => {
      if (notification.type === 'roleChanged') {
        this.handleRoleChangeNotification(notification.data);
      }
    });
  }

  private handleRoleChangeNotification(roleChangeData: RoleChangeNotification): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Some deployments might store email in code and CodeUser in description
    const matchesByCode = currentUser.code === roleChangeData.userCode;
    const matchesByDescription = currentUser.description === roleChangeData.userCode;

    if (matchesByCode || matchesByDescription) {
      this.handleCurrentUserRoleChange(roleChangeData);
    }
  }

  private handleCurrentUserRoleChange(roleChangeData: RoleChangeNotification): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    console.log('RoleMonitor: Handling role change for current user:', roleChangeData);

    // Update user role immediately in AuthService
    this.authService.updateUserRole(roleChangeData.newRole);
    
    // Force immediate notification to all components listening to role changes
    console.log('RoleMonitor: Broadcasting role change to all subscribers');

    // Show notification
    const message = roleChangeData.newRole === 'Uploader' 
      ? 'تم ترقيتك إلى رافع ملفات! يمكنك الآن رفع الملفات.'
      : 'تم تغيير دورك إلى عضو عادي. لن تتمكن من رفع الملفات.';
    
    this.snackBar.open(message, 'إغلاق', {
      duration: 6000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });

    // Handle auto-navigation based on current page and new role
    this.handleAutoNavigation(roleChangeData.newRole);
  }

  private handleAutoNavigation(newRole: string): void {
    const currentUrl = this.router.url;
    
    // If user was on upload page and lost upload permissions, redirect immediately
    if (currentUrl.includes('/admin/upload') && newRole === 'Member') {
      // Immediate navigation without delay
      this.router.navigate(['/files']).then(() => {
        this.snackBar.open('تم تحويلك إلى صفحة الملفات لأنك لم تعد تملك صلاحية الرفع.', 'موافق', {
          duration: 8000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        });
      });
    }
    
    // If user was on any admin page and lost upload permissions, redirect to files
    if (currentUrl.includes('/admin/') && !this.authService.canUploadFiles() && !this.authService.isAdmin()) {
      this.router.navigate(['/files']).then(() => {
        this.snackBar.open('تم تحويلك إلى صفحة الملفات لعدم وجود صلاحيات إدارية.', 'موافق', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        });
      });
    }
    
    // If user became Uploader, show success message about new permissions
    if (newRole === 'Uploader') {
      setTimeout(() => {
        this.snackBar.open('يمكنك الآن الوصول إلى صفحة رفع الملفات!', 'إغلاق', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      }, 1500);
    }
  }

  checkCurrentUserPermissions(): boolean {
    const currentUser = this.authService.getCurrentUser();
    const currentUrl = this.router.url;
    
    // Check if user is on upload page without permissions
    if (currentUrl.includes('/admin/upload') && !this.authService.canUploadFiles()) {
      this.snackBar.open('ليس لديك صلاحية لرفع الملفات!', 'إغلاق', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/files']);
      return false;
    }

    return true;
  }

  private setupRouteMonitoring(): void {
    // Monitor route changes and check permissions continuously
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.checkCurrentPagePermissions();
    });
  }

  private checkCurrentPagePermissions(): void {
    const currentUrl = this.router.url;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) return;
    
    // If user is on upload page but doesn't have upload permissions
    if (currentUrl.includes('/admin/upload') && !this.authService.canUploadFiles()) {
      console.log('RoleMonitor: User lost upload permission, redirecting from upload page');
      this.router.navigate(['/files']).then(() => {
        this.snackBar.open('تم منعك من الوصول لصفحة الرفع لعدم وجود الصلاحية المطلوبة.', 'موافق', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      });
    }
    
    // If user is on admin users page but isn't admin
    if (currentUrl.includes('/admin/users') && !this.authService.isAdmin()) {
      console.log('RoleMonitor: User lost admin permission, redirecting from users page');
      this.router.navigate(['/files']).then(() => {
        this.snackBar.open('تم منعك من الوصول لصفحة إدارة المستخدمين لعدم وجود صلاحية المدير.', 'موافق', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}