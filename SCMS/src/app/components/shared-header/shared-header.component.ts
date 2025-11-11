import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shared-header',
  standalone: true,
  imports: [
    CommonModule, 
    MatToolbarModule, 
    MatIconModule, 
    MatButtonModule, 
    MatTooltipModule,
    TranslateModule, 
    LanguageSwitcherComponent
  ],
  template: `
    <mat-toolbar class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <img src="assets/images/logos/img1.png" alt="Logo" class="header-logo">
          <div class="title-container">
            <span class="app-title">{{ 'DOCUMENT_SYSTEM.TITLE' | translate }}</span>
            <span class="app-subtitle">{{ 'DOCUMENT_SYSTEM.SUBTITLE' | translate }}</span>
          </div>
        </div>
        
        <div class="header-actions">
          <div class="user-section" *ngIf="currentUser">
            <div class="user-avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <div class="user-details">
              <span class="user-name">{{ currentUser?.description || currentUser?.code }}</span>
              <span class="user-role">{{ currentUser?.role }}</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <app-language-switcher></app-language-switcher>
            <button 
              mat-icon-button 
              (click)="logout()" 
              [matTooltip]="'USER_INTERFACE.LOGOUT_TOOLTIP' | translate" 
              *ngIf="currentUser"
              class="logout-btn">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </mat-toolbar>
  `,
     styles: [`
     .app-header {
       position: fixed;
       top: 0;
       left: 0;
       right: 0;
       z-index: 1000;
       height: 70px;
       background: linear-gradient(135deg, #cfae45 0%, #d2ad45 50%, #342e21 100%);
       box-shadow: 0 4px 20px rgba(52, 46, 33, 0.25);
       border-bottom: 2px solid rgba(207, 174, 69, 0.3);
     }

     .header-content {
       display: flex;
       justify-content: space-between;
       align-items: center;
       width: 100%;
       height: 100%;
       padding: 0 24px;
     }

     .logo-section {
       display: flex;
       align-items: center;
       gap: 16px;
     }

     .header-logo {
       height: 45px;
       width: auto;
       filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
     }

     .title-container {
       display: flex;
       flex-direction: column;
       gap: 2px;
     }

     .app-title {
       font-size: 22px;
       font-weight: 700;
       color: #ffffff;
       text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
       letter-spacing: 0.5px;
     }

     .app-subtitle {
       font-size: 12px;
       font-weight: 400;
       color: rgba(255, 255, 255, 0.8);
       text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
     }

     .header-actions {
       display: flex;
       align-items: center;
       gap: 24px; /* Increased gap for more space */
     }

     .user-section {
       display: flex;
       align-items: center;
       gap: 12px;
       background: rgba(37, 150, 190, 0.15);
       padding: 12px 20px; /* Increased padding */
       border-radius: 30px;
       backdrop-filter: blur(15px);
       border: 1px solid rgba(37, 150, 190, 0.25);
       transition: all 0.3s ease;
       box-shadow: 0 2px 8px rgba(52, 46, 33, 0.15);
     }

     .user-section:hover {
       background: rgba(37, 150, 190, 0.25);
       transform: translateY(-2px);
       box-shadow: 0 6px 16px rgba(52, 46, 33, 0.25);
       border-color: rgba(37, 150, 190, 0.4);
     }

     .user-avatar {
       display: flex;
       align-items: center;
       justify-content: center;
       width: 42px; /* Increased size */
       height: 42px; /* Increased size */
       background: rgba(207, 174, 69, 0.25);
       border-radius: 50%;
       border: 2px solid rgba(207, 174, 69, 0.4);
       transition: all 0.3s ease;
     }

     .user-section:hover .user-avatar {
       background: rgba(207, 174, 69, 0.35);
       border-color: rgba(207, 174, 69, 0.6);
       transform: scale(1.05);
     }

     .user-avatar mat-icon {
       color: white;
       font-size: 24px; /* Increased size */
       width: 24px; /* Increased size */
       height: 24px; /* Increased size */
     }

     .user-details {
       display: flex;
       flex-direction: column;
       gap: 4px; /* Increased gap */
     }

     .user-name {
       font-size: 16px; /* Increased font size */
       font-weight: 600;
       color: white;
       text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
       line-height: 1.2;
     }

     .user-role {
       font-size: 12px; /* Increased font size */
       font-weight: 500;
       color: rgba(255, 255, 255, 0.9);
       text-transform: uppercase;
       letter-spacing: 0.8px;
       background: rgba(37, 150, 190, 0.2);
       padding: 3px 8px; /* Increased padding */
       border-radius: 10px;
       display: inline-block;
     }

     .action-buttons {
       display: flex;
       align-items: center;
       gap: 16px; /* Increased gap */
     }

     .logout-btn {
       background: rgba(37, 150, 190, 0.15);
       border: 1px solid rgba(37, 150, 190, 0.25);
       border-radius: 50%;
       width: 46px; /* Increased size */
       height: 46px; /* Increased size */
       transition: all 0.3s ease;
       box-shadow: 0 2px 8px rgba(52, 46, 33, 0.1);
     }

     .logout-btn:hover {
       background: rgba(37, 150, 190, 0.25);
       transform: scale(1.1) rotate(5deg);
       box-shadow: 0 6px 16px rgba(52, 46, 33, 0.2);
       border-color: rgba(37, 150, 190, 0.4);
     }

     .logout-btn mat-icon {
       color: white;
       font-size: 24px; /* Increased size */
       width: 24px; /* Increased size */
       height: 24px; /* Increased size */
     }

     /* RTL Support */
     [dir="rtl"] .header-content {
       flex-direction: row-reverse;
     }

     [dir="rtl"] .logo-section {
       flex-direction: row-reverse;
     }

     [dir="rtl"] .header-actions {
       flex-direction: row-reverse;
     }

     [dir="rtl"] .user-section {
       flex-direction: row-reverse;
     }

     [dir="rtl"] .user-details {
       align-items: flex-end;
     }

           /* Responsive Design */
      @media (max-width: 768px) {
        .header-content {
          padding: 0 16px;
        }

        .app-title {
          font-size: 18px;
        }

        .app-subtitle {
          font-size: 10px;
        }

        .user-section {
          padding: 10px 16px; /* Adjusted padding */
        }

        .user-name {
          font-size: 14px; /* Adjusted font size */
        }

        .user-role {
          font-size: 11px; /* Adjusted font size */
          padding: 2px 6px; /* Adjusted padding */
        }

        .action-buttons {
          gap: 12px; /* Adjusted gap */
        }

        .logout-btn {
          width: 42px; /* Adjusted size */
          height: 42px; /* Adjusted size */
        }

        .logout-btn mat-icon {
          font-size: 22px; /* Adjusted size */
          width: 22px; /* Adjusted size */
          height: 22px; /* Adjusted size */
        }
      }

           @media (max-width: 480px) {
        .app-title {
          font-size: 16px;
        }

        .header-logo {
          height: 35px;
        }

        .user-section {
          display: none;
        }

        .action-buttons {
          gap: 8px; /* Adjusted gap */
        }
      }
   `]
})
export class SharedHeaderComponent implements OnInit {
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
