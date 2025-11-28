import { Component, OnInit } from '@angular/core';
import { VexPopoverRef } from '@vex/components/vex-popover/vex-popover-ref';
import { MatRippleModule } from '@angular/material/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, AsyncPipe } from '@angular/common';
import { UserService } from '../../../../user/user.service';
import { AuthService } from 'src/assets/services/auth.service';

@Component({
  selector: 'vex-sidenav-user-menu',
  templateUrl: './sidenav-user-menu.component.html',
  styleUrls: ['./sidenav-user-menu.component.scss'],
  imports: [MatRippleModule, RouterLink, MatIconModule, NgIf, AsyncPipe],
  standalone: true
})
export class SidenavUserMenuComponent implements OnInit {
  currentUser$ = this.userService.currentUser$;
  
  constructor(
    private readonly popoverRef: VexPopoverRef,
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  close(): void {
    /** Wait for animation to complete and then close */
    setTimeout(() => this.popoverRef.close(), 250);
  }
  
  /**
   * Navigate to profile settings
   */
  navigateToProfile(): void {
    this.close();
    
    this.currentUser$.subscribe(user => {
      if (user) {
        // For doctors, go to doctor profile
        if (user.roles && user.roles.includes('Doctor')) {
          this.router.navigate([`/doctor/${user.id}/queue`]);
        } else {
          // For other users, go to general profile settings
          this.router.navigate(['/user']);
        }
      }
    }).unsubscribe();
  }
  
  /**
   * Log out the current user
   */
  logout(): void {
    this.close();
    this.authService.logout();
   // this.router.navigate(['/app']);
  }
}
