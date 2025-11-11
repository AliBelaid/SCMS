import { Component, OnInit } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, TranslateModule],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="languageMenu" class="language-switcher-btn" [matTooltip]="'LANGUAGES.SELECT_LANGUAGE' | translate">
      <div class="language-btn-content">
        <span class="current-flag">{{ getCurrentFlag() }}</span>
        <mat-icon class="dropdown-icon">expand_more</mat-icon>
      </div>
    </button>
    
    <mat-menu #languageMenu="matMenu" class="language-menu">
      <div class="menu-header">
        <span class="menu-title">{{ 'LANGUAGES.SELECT_LANGUAGE' | translate }}</span>
      </div>
      
      <button mat-menu-item (click)="switchLanguage('ar')" [class.active]="currentLang === 'ar'" class="lang-option">
        <div class="lang-content">
          <span class="flag-icon">🇸🇦</span>
          <span class="lang-name">{{ 'LANGUAGES.ARABIC' | translate }}</span>
          <span class="lang-native">العربية</span>
        </div>
        <mat-icon *ngIf="currentLang === 'ar'" class="check-icon">check</mat-icon>
      </button>
      
      <button mat-menu-item (click)="switchLanguage('en')" [class.active]="currentLang === 'en'" class="lang-option">
        <div class="lang-content">
          <span class="flag-icon">🇺🇸</span>
          <span class="lang-name">{{ 'LANGUAGES.ENGLISH' | translate }}</span>
          <span class="lang-native">English</span>
        </div>
        <mat-icon *ngIf="currentLang === 'en'" class="check-icon">check</mat-icon>
      </button>
      
      <button mat-menu-item (click)="switchLanguage('fr')" [class.active]="currentLang === 'fr'" class="lang-option">
        <div class="lang-content">
          <span class="flag-icon">🇫🇷</span>
          <span class="lang-name">{{ 'LANGUAGES.FRENCH' | translate }}</span>
          <span class="lang-native">Français</span>
        </div>
        <mat-icon *ngIf="currentLang === 'fr'" class="check-icon">check</mat-icon>
      </button>
    </mat-menu>
  `,
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent implements OnInit {
  currentLang: string = 'ar';

  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Set default language to Arabic
    this.translate.setDefaultLang('ar');
    
    // Check if user is logged in and has preferred language
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.preferredLanguage) {
      this.currentLang = currentUser.preferredLanguage;
      this.translate.use(currentUser.preferredLanguage);
    } else {
      this.currentLang = this.translate.currentLang || 'ar';
    }
    
    // Set document direction based on language
    this.updateDocumentDirection(this.currentLang);
  }

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    this.updateDocumentDirection(lang);
    
    // Store language preference in localStorage
    localStorage.setItem('preferredLanguage', lang);
    
    // Update user's preferred language if logged in
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Update local user object
      currentUser.preferredLanguage = lang;
      this.authService.updateCurrentUserFromStorage();
      
      // Send update to backend to save user's preferred language
      this.userService.updateUserLanguage(currentUser.code, lang).subscribe(
        success => {
          if (success) {
            console.log('User language preference updated successfully');
          } else {
            console.error('Failed to update user language preference');
          }
        },
        error => {
          console.error('Error updating user language preference:', error);
        }
      );
    }
  }

  getCurrentFlag(): string {
    switch (this.currentLang) {
      case 'ar': return '🇸🇦';
      case 'en': return '🇺🇸';
      case 'fr': return '🇫🇷';
      default: return '🇸🇦';
    }
  }

  private updateDocumentDirection(lang: string) {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (lang === 'ar') {
      htmlElement.setAttribute('dir', 'rtl');
      htmlElement.setAttribute('lang', 'ar');
      bodyElement.classList.add('rtl');
      bodyElement.classList.remove('ltr');
    } else {
      htmlElement.setAttribute('dir', 'ltr');
      htmlElement.setAttribute('lang', lang);
      bodyElement.classList.add('ltr');
      bodyElement.classList.remove('rtl');
    }
  }
}
