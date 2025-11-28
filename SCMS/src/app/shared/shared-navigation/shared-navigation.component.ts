import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

 

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  description?: string;
  children?: NavigationItem[];
  badge?: number;
  badgeColor?: string;
}

interface BreadcrumbItem {
  label: string;
  icon?: string;
  path: string;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  organization: string;
}

@Component({
  selector: 'app-shared-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    MatExpansionModule
  ],
  template: `
    <div class="navigation-container">
      <!-- Top Toolbar -->
      <mat-toolbar class="top-toolbar" color="primary">
        <button 
          mat-icon-button 
          (click)="toggleSidenav()"
          [class.hidden-desktop]="!isMobile">
          <mat-icon>menu</mat-icon>
        </button>

        <!-- Logo and Title -->
        <div class="toolbar-title" routerLink="/dashboard">
          <mat-icon class="app-logo">health_and_safety</mat-icon>
          <span class="app-name">Insurance Management</span>
        </div>

        <!-- Breadcrumbs -->
        <div class="breadcrumbs" [class.hidden-mobile]="isMobile">
          <ng-container *ngFor="let crumb of breadcrumbs; let last = last">
            <button 
              mat-button 
              [routerLink]="crumb.path"
              [disabled]="last"
              class="breadcrumb-item">
              <mat-icon *ngIf="crumb.icon" class="breadcrumb-icon">{{ crumb.icon }}</mat-icon>
              {{ crumb.label }}
            </button>
            <mat-icon *ngIf="!last" class="breadcrumb-separator">chevron_right</mat-icon>
          </ng-container>
        </div>

        <div class="toolbar-spacer"></div>

        <!-- Notification Bell -->
        <button 
          mat-icon-button 
          [matBadge]="notificationCount" 
          matBadgeColor="warn"
          [matBadgeHidden]="notificationCount === 0"
          matTooltip="Notifications"
          (click)="openNotifications()">
          <mat-icon>notifications</mat-icon>
        </button>

        <!-- User Menu -->
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
          <div class="user-avatar">
            <mat-icon *ngIf="!userProfile.avatar">account_circle</mat-icon>
            <img *ngIf="userProfile.avatar" [src]="userProfile.avatar" [alt]="userProfile.name">
          </div>
          <div class="user-info" [class.hidden-mobile]="isMobile">
            <div class="user-name">{{ userProfile.name }}</div>
            <div class="user-role">{{ userProfile.role }}</div>
          </div>
          <mat-icon>expand_more</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <div class="user-menu-header">
            <div class="user-avatar-large">
              <mat-icon *ngIf="!userProfile.avatar">account_circle</mat-icon>
              <img *ngIf="userProfile.avatar" [src]="userProfile.avatar" [alt]="userProfile.name">
            </div>
            <div class="user-details">
              <div class="user-name">{{ userProfile.name }}</div>
              <div class="user-email">{{ userProfile.email }}</div>
              <div class="user-organization">{{ userProfile.organization }}</div>
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            Profile
          </button>
          <button mat-menu-item routerLink="/settings">
            <mat-icon>settings</mat-icon>
            Settings
          </button>
          <button mat-menu-item routerLink="/help">
            <mat-icon>help</mat-icon>
            Help
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-menu>
      </mat-toolbar>

      <!-- Sidenav Container -->
      <mat-sidenav-container class="sidenav-container">
        <!-- Side Navigation -->
        <mat-sidenav 
          #sidenav
          class="sidenav"
          [mode]="isMobile ? 'over' : 'side'"
          [opened]="!isMobile"
          [fixedInViewport]="isMobile">
          
          <!-- Quick Stats Section -->
          <div class="sidenav-header">
            <div class="quick-stats">
              <div class="stat-item">
                <mat-icon>business</mat-icon>
                <span>{{ systemStats.insuranceCompanies }}</span>
              </div>
              <div class="stat-item">
                <mat-icon>domain</mat-icon>
                <span>{{ systemStats.corporateClients }}</span>
              </div>
              <div class="stat-item">
                <mat-icon>shield</mat-icon>
                <span>{{ systemStats.riskCarriers }}</span>
              </div>
            </div>
          </div>

          <!-- Navigation Menu -->
          <mat-nav-list class="navigation-list">
            <ng-container *ngFor="let item of navigationItems">
              
              <!-- Simple navigation item (no children) -->
              <a 
                *ngIf="!item.children"
                mat-list-item 
                [routerLink]="item.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
                class="nav-item"
                [matTooltip]="item.description"
                matTooltipPosition="right">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                <div matListItemTitle>{{ item.label }}</div>
                <div 
                  *ngIf="item.badge && item.badge > 0" 
                  matListItemMeta
                  class="nav-badge"
                  [style.background-color]="item.badgeColor || '#ef4444'">
                  {{ item.badge }}
                </div>
              </a>

              <!-- Expandable navigation item (with children) -->
              <mat-expansion-panel 
                *ngIf="item.children"
                class="nav-expansion-panel"
                [expanded]="isExpanded(item.id)">
                
                <mat-expansion-panel-header class="nav-expansion-header">
                  <mat-panel-title class="nav-expansion-title">
                    <mat-icon class="nav-expansion-icon">{{ item.icon }}</mat-icon>
                    <span>{{ item.label }}</span>
                  </mat-panel-title>
                </mat-expansion-panel-header>

                <div class="nav-expansion-content">
                  <a 
                    *ngFor="let child of item.children"
                    mat-list-item 
                    [routerLink]="child.route"
                    routerLinkActive="active"
                    class="nav-child-item"
                    [matTooltip]="child.description"
                    matTooltipPosition="right">
                    <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                    <div matListItemTitle>{{ child.label }}</div>
                    <div 
                      *ngIf="child.badge && child.badge > 0" 
                      matListItemMeta
                      class="nav-badge"
                      [style.background-color]="child.badgeColor || '#ef4444'">
                      {{ child.badge }}
                    </div>
                  </a>
                </div>
              </mat-expansion-panel>

              <!-- Divider after major sections -->
              <mat-divider 
                *ngIf="item.id === 'entities' || item.id === 'operations'"
                class="nav-divider">
              </mat-divider>
            </ng-container>
          </mat-nav-list>

          <!-- Sidenav Footer -->
          <div class="sidenav-footer">
            <div class="version-info">
              <mat-icon>info</mat-icon>
              <span>Version 2.1.0</span>
            </div>
            <div class="support-link">
              <button mat-button color="primary" routerLink="/help">
                <mat-icon>support</mat-icon>
                Support
              </button>
            </div>
          </div>
        </mat-sidenav>

        <!-- Main Content Area -->
        <mat-sidenav-content class="main-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .navigation-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .top-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      margin-right: 24px;
    }

    .app-logo {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .app-name {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: rgba(255, 255, 255, 0.8);
      text-transform: none;
      font-weight: 400;
    }

    .breadcrumb-item:not([disabled]) {
      color: white;
    }

    .breadcrumb-item:not([disabled]):hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .breadcrumb-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .breadcrumb-separator {
      color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
      margin: 0 4px;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .user-menu-trigger {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-avatar mat-icon {
      color: white;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .user-name {
      font-weight: 500;
      font-size: 0.9rem;
      line-height: 1.2;
    }

    .user-role {
      font-size: 0.75rem;
      opacity: 0.8;
      line-height: 1.2;
    }

    .user-menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8fafc;
    }

    .user-avatar-large {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e2e8f0;
    }

    .user-avatar-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-avatar-large mat-icon {
      color: #64748b;
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .user-details .user-name {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2px;
    }

    .user-details .user-email {
      color: #64748b;
      font-size: 0.85rem;
      margin-bottom: 2px;
    }

    .user-details .user-organization {
      color: #94a3b8;
      font-size: 0.8rem;
    }

    .sidenav-container {
      flex: 1;
    }

    .sidenav {
      width: 280px;
      background: #fafafa;
      border-right: 1px solid #e2e8f0;
    }

    .sidenav-header {
      padding: 16px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
    }

    .quick-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex: 1;
    }

    .stat-item mat-icon {
      color: #64748b;
      font-size: 20px;
    }

    .stat-item span {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9rem;
    }

    .navigation-list {
      padding-top: 8px;
    }

    .nav-item {
      margin: 4px 12px;
      border-radius: 8px;
      transition: all 0.3s ease;
      min-height: 48px;
      color: #64748b;
    }

    .nav-item:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .nav-item.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .nav-item.active mat-icon {
      color: white;
    }

    .nav-badge {
      background: #ef4444;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .nav-expansion-panel {
      margin: 4px 12px;
      border-radius: 8px;
      box-shadow: none;
      background: transparent;
    }

    .nav-expansion-panel:not(.mat-expanded) {
      background: transparent;
    }

    .nav-expansion-header {
      padding: 0 16px;
      height: 48px;
      color: #64748b;
    }

    .nav-expansion-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
    }

    .nav-expansion-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .nav-expansion-content {
      padding: 8px 0;
      background: #f8fafc;
      border-radius: 0 0 8px 8px;
    }

    .nav-child-item {
      margin: 2px 16px;
      border-radius: 6px;
      min-height: 40px;
      font-size: 0.9rem;
      color: #64748b;
      padding-left: 36px;
    }

    .nav-child-item:hover {
      background: #e2e8f0;
      color: #1e293b;
    }

    .nav-child-item.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .nav-child-item.active mat-icon {
      color: white;
    }

    .nav-divider {
      margin: 12px 16px;
    }

    .sidenav-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px;
      background: white;
      border-top: 1px solid #e2e8f0;
    }

    .version-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #94a3b8;
      font-size: 0.8rem;
      margin-bottom: 8px;
    }

    .version-info mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .support-link button {
      width: 100%;
      justify-content: flex-start;
    }

    .main-content {
      background: #f8fafc;
    }

    .content-wrapper {
      min-height: 100%;
      padding: 0;
    }

    .hidden-mobile {
      display: none;
    }

    .hidden-desktop {
      display: none;
    }

    @media (max-width: 768px) {
      .hidden-mobile {
        display: flex;
      }

      .hidden-desktop {
        display: block;
      }

      .breadcrumbs {
        display: none;
      }

      .user-info {
        display: none;
      }

      .toolbar-title .app-name {
        display: none;
      }

      .sidenav {
        width: 100%;
        max-width: 320px;
      }
    }

    @media (min-width: 769px) {
      .hidden-desktop {
        display: none;
      }
    }
  `]
})
export class SharedNavigationComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private destroy$ = new Subject<void>();
  
  isMobile = false;
  navigationItems: NavigationItem[] = [];
  breadcrumbs: BreadcrumbItem[] = [];
  notificationCount = 0;
  expandedPanels = new Set<string>(['entities', 'operations']);

  userProfile: UserProfile = {
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'TPA Administrator',
    organization: 'Health Benefits Co.',
    avatar: undefined
  };

  systemStats = {
    insuranceCompanies: 0,
    corporateClients: 0,
    riskCarriers: 0
  };

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.initializeNavigation();
    this.setupBreakpointObserver();
    this.setupRouterEvents();
    this.loadSystemStats();
    this.loadNotifications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeNavigation() {
    this.navigationItems = this.getNavigationMenu().map(item => ({
      ...item,
      badge: this.getNavigationBadge(item.id),
      badgeColor: this.getNavigationBadgeColor(item.id)
    }));
  }

  private setupBreakpointObserver() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  private setupRouterEvents() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateBreadcrumbs(event.url);
        if (this.isMobile && this.sidenav) {
          this.sidenav.close();
        }
      });
  }

  private updateBreadcrumbs(url: string) {
    this.breadcrumbs = this.getBreadcrumbConfig(url);
  }

  private loadSystemStats() {
    // Mock data - in real app, this would come from services
    this.systemStats = {
      insuranceCompanies: 10,
      corporateClients: 25,
      riskCarriers: 15
    };
  }

  private loadNotifications() {
    // Mock notification count
    this.notificationCount = 3;
  }

  private getNavigationBadge(itemId: string): number {
    // Mock badge logic - in real app, this would be dynamic
    const badges: { [key: string]: number } = {
      'claims': 12,
      'contracts': 5,
      'activity': 8
    };
    return badges[itemId] || 0;
  }

  private getNavigationBadgeColor(itemId: string): string {
    const colors: { [key: string]: string } = {
      'claims': '#ef4444',
      'contracts': '#f59e0b',
      'activity': '#3b82f6'
    };
    return colors[itemId] || '#ef4444';
  }

  toggleSidenav() {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  isExpanded(panelId: string): boolean {
    return this.expandedPanels.has(panelId);
  }

  openNotifications() {
    // Navigate to notifications or open a dialog
    this.router.navigate(['/notifications']);
  }

  logout() {
    // Implement logout logic
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }

  private getNavigationMenu(): NavigationItem[] {
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/app',
        description: 'Main dashboard overview'
      },
      {
        id: 'entities',
        label: 'Entities',
        icon: 'business_center',
        description: 'Manage system entities',
        children: [
          {
            id: 'insurance-companies',
            label: 'Insurance Companies',
            icon: 'business',
            route: '/app/insurance/companies',
            description: 'Manage insurance companies'
          },
          {
            id: 'corporate-clients',
            label: 'Corporate Clients',
            icon: 'domain',
            route: '/app/insurance/corporate-clients',
            description: 'Manage corporate clients'
          },
          {
            id: 'risk-carriers',
            label: 'Risk Carriers',
            icon: 'shield',
            route: '/app/insurance/risk-carriers',
            description: 'Manage risk carriers'
          }
        ]
      },
      {
        id: 'operations',
        label: 'Operations',
        icon: 'settings',
        description: 'System operations',
        children: [
          {
            id: 'contracts',
            label: 'Contracts',
            icon: 'description',
            route: '/app/insurance/contracts',
            description: 'Manage insurance contracts'
          },
          {
            id: 'claims',
            label: 'Claims',
            icon: 'local_hospital',
            route: '/app/insurance/claims',
            description: 'Process and manage claims'
          },
          {
            id: 'activity',
            label: 'Activity Log',
            icon: 'history',
            route: '/app/insurance/activity',
            description: 'View system activity'
          }
        ]
      }
    ];
  }

  private getBreadcrumbConfig(url: string): BreadcrumbItem[] {
    const segments = url.split('/').filter(segment => segment);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Always start with dashboard
    breadcrumbs.push({
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/app'
    });

    // Add breadcrumbs based on URL segments
    let currentPath = '/app';
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      
      switch (segment) {
        case 'insurance':
          breadcrumbs.push({
            label: 'Insurance',
            icon: 'business_center',
            path: currentPath
          });
          break;
        case 'companies':
          breadcrumbs.push({
            label: 'Insurance Companies',
            icon: 'business',
            path: currentPath
          });
          break;
        case 'corporate-clients':
          breadcrumbs.push({
            label: 'Corporate Clients',
            icon: 'domain',
            path: currentPath
          });
          break;
        case 'risk-carriers':
          breadcrumbs.push({
            label: 'Risk Carriers',
            icon: 'shield',
            path: currentPath
          });
          break;
        case 'contracts':
          breadcrumbs.push({
            label: 'Contracts',
            icon: 'description',
            path: currentPath
          });
          break;
        case 'claims':
          breadcrumbs.push({
            label: 'Claims',
            icon: 'local_hospital',
            path: currentPath
          });
          break;
        default:
          breadcrumbs.push({
            label: segment.charAt(0).toUpperCase() + segment.slice(1),
            path: currentPath
          });
      }
    }

    return breadcrumbs;
  }
}