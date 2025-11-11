import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { SignalRService } from '../../services/signalr.service';
import { RoleMonitorService } from '../../services/role-monitor.service';
import { AppUser } from '../../models/app-user';
import { RolePipe } from '../../pipe/role.pipe';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { PasswordResetDialogComponent } from '../password-reset-dialog/password-reset-dialog.component';
import { SharedHeaderComponent } from '../shared-header/shared-header.component';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, RolePipe, SharedHeaderComponent],
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.scss']
})
export class UserPanelComponent implements OnInit {
  users: AppUser[] = [];
  displayedColumns: string[] = ['code', 'country', 'role', 'preferredLanguage', 'isActive', 'actions'];
  userForm: FormGroup;
  isAddingUser = false;
  currentUser: any;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private signalRService: SignalRService,
    private roleMonitorService: RoleMonitorService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.userForm = this.fb.group({
      code: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      country: [''],
      role: ['Member', [Validators.required]],
      preferredLanguage: ['ar', [Validators.required]], // Default to Arabic
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.ensureRolesExist();
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  addUser(): void {
    this.isAddingUser = true;
    this.userForm.reset({
      role: 'Member',
      preferredLanguage: 'ar', // Default to Arabic
      isActive: true
    });
  }

  cancelAddUser(): void {
    this.isAddingUser = false;
    this.userForm.reset();
  }

  onSubmitUser(): void {
    if (this.userForm.valid) {
      const newUser: AppUser = this.userForm.value;
      
      this.userService.isUserCodeUnique(newUser.code).subscribe(isUnique => {
        if (!isUnique) {
                this.snackBar.open('رمز المستخدم موجود مسبقاً!', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
          return;
        }

        this.userService.addUser(newUser).subscribe(success => {
          if (success) {
            this.snackBar.open('تم إضافة المستخدم بنجاح!', 'إغلاق', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });

            this.isAddingUser = false;
            this.userForm.reset();
            this.loadUsers();
          } else {
            this.snackBar.open('فشل في إضافة المستخدم!', 'إغلاق', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      });
    }
  }

  activateUser(user: AppUser): void {
    this.userService.activateUser(user.code).subscribe(success => {
      if (success) {
        this.snackBar.open('تم تفعيل المستخدم!', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loadUsers();
      } else {
        this.snackBar.open('فشل في تفعيل المستخدم!', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deactivateUser(user: AppUser): void {
    this.userService.deactivateUser(user.code).subscribe(success => {
      if (success) {
        this.snackBar.open('تم إلغاء تفعيل المستخدم!', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loadUsers();
      } else {
        this.snackBar.open('فشل في إلغاء تفعيل المستخدم!', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  resetPassword(user: AppUser): void {
    const dialogRef = this.dialog.open(PasswordResetDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        userCode: user.code,
        userName: user.code
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.userService.resetUserPassword(result.userCode, result.newPassword).subscribe(success => {
          if (success) {
            this.snackBar.open(`Password reset successfully! New password: ${result.newPassword}`, 'Close', {
              duration: 8000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
          } else {
            this.snackBar.open('Failed to reset password!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  deleteUser(user: AppUser): void {
    // Check if user is Admin before allowing delete
    if (!this.authService.isAdmin()) {
      this.snackBar.open('فقط المدير يمكنه حذف المستخدمين', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (user.code === this.currentUser.code) {
      this.snackBar.open('لا يمكنك حذف حسابك الخاص!', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'حذف المستخدم',
        message: `هل أنت متأكد من حذف المستخدم ${user.code}؟`,
        confirmText: 'حذف',
        cancelText: 'إلغاء'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.code).subscribe(success => {
          if (success) {
            this.snackBar.open('تم حذف المستخدم بنجاح!', 'إغلاق', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.loadUsers();
          } else {
            this.snackBar.open('فشل في حذف المستخدم!', 'إغلاق', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  generateRandomPassword(): string {
    return Math.random().toString(36).substr(2, 8);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToFiles(): void {
    this.router.navigate(['/files']);
  }

  navigateToUpload(): void {
    this.router.navigate(['/admin/upload']);
  }

  ensureRolesExist(): void {
    this.userService.ensureRolesExist().subscribe(
      response => {
        if (response && response.createdRoles && response.createdRoles.length > 0) {
          console.log('Created roles:', response.createdRoles);
        }
      },
      error => {
        console.error('Error ensuring roles exist:', error);
      }
    );
  }

  toggleUploaderRole(user: AppUser): void {
    const action = user.role === 'Member' ? 'ترقية إلى رافع ملفات' : 'خفض إلى عضو عادي';
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'تغيير صلاحية المستخدم',
        message: `هل أنت متأكد من ${action} للمستخدم ${user.code}؟`,
        confirmText: 'تأكيد',
        cancelText: 'إلغاء'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.toggleUploaderRole(user.code).subscribe(response => {
          if (response && response.newRole) {
            const successMessage = response.newRole === 'Uploader' 
              ? `تم ترقية المستخدم ${user.code} إلى رافع ملفات بنجاح!`
              : `تم خفض المستخدم ${user.code} إلى عضو عادي بنجاح!`;
              
            this.snackBar.open(successMessage, 'إغلاق', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            
            // Update user role in the list
            user.role = response.newRole;
            
            // Notify other components about the role change via SignalR
            this.signalRService.notifyRoleChanged({
              userCode: user.code,
              newRole: response.newRole,
              message: response.message,
              timestamp: new Date()
            });

            // Also send personal role change notification to simulate direct user notification
            this.signalRService.handlePersonalRoleChange({
              userCode: user.code,
              newRole: response.newRole,
              message: `تم تحديث صلاحيتك إلى: ${response.newRole === 'Uploader' ? 'رافع ملفات' : 'عضو عادي'}`,
              timestamp: new Date(),
              requiresReload: true
            });

            // If the current user's role was changed, update immediately
            if (user.code === this.currentUser?.code) {
              this.currentUser.role = response.newRole;
            }
            
            this.loadUsers();
          } else {
            this.snackBar.open('فشل في تغيير صلاحية المستخدم!', 'إغلاق', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }
} 