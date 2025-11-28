import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavigationLoaderService } from './core/navigation/navigation-loader.service';
import { AuthService } from 'src/assets/services/auth.service';
import { NavigationItem } from './core/navigation/navigation-item.interface';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterModule],
  standalone: true
})
export class AppComponent implements OnInit {
  selectedLang = localStorage.getItem('userLang') || 'ar';
  navigationItems: NavigationItem[] = [];

  constructor(
    private translate: TranslateService,
    private navigationService: NavigationLoaderService,
    public authService: AuthService
  ) {
    this.translate.setDefaultLang('ar');
    this.translate.use(this.selectedLang);
  }

  ngOnInit(): void {
    this.loadMenuItems();
    this.loadAdditionalTranslations();
    this.initializeAuth();
  }
  
  private initializeAuth(): void {
    // Only try to load current user if we have a valid token
    const token = this.authService.getAuthToken();
    if (token && !this.authService.isTokenExpired()) {
      console.log('✅ Valid token found, user already authenticated');
      // User is already authenticated from localStorage/token
      // No need to call API
    } else {
      console.log('⚠️ No valid token found, user needs to login');
      // Clear any stale data
      this.authService.clearAuthData();
    }
  }

  loadMenuItems() {
    this.navigationService.items$.subscribe(items => {
      this.navigationItems = items;
    });
  }

  filterMenuItemsByUserRoles(userRoles: string[]) {
    if (!userRoles || userRoles.length === 0) {
      return [];
    }
    return this.filterItemsByRole(this.navigationItems);
  }

  private filterItemsByRole(items: any[]): any[] {
    const currentUser = this.authService.getCurrentUser();
      return items.filter(item => {
        if (item.roles && item.roles.length > 0) {
        return item.roles.some((role: string) => 
          currentUser?.roles?.includes(role)
        );
      }
        return true;
    }).map(item => {
      if (item.children) {
        return {
          ...item,
          children: this.filterItemsByRole(item.children)
        };
      }
      return item;
    });
  }

  private loadAdditionalTranslations() {
    // Load any additional translations if needed
    this.translate.get('APP_TITLE').subscribe((title: string) => {
      document.title = title || 'Health Expense Management System';
      });
  }
}
