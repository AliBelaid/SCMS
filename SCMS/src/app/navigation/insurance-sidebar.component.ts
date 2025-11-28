import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { InsuranceNavigationService, NavigationItem } from '../services/navigation.service';

@Component({
  selector: 'app-insurance-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule
  ],
  template: `
    <mat-nav-list>
      <ng-container *ngFor="let item of navigationItems">
        <mat-list-item 
          *ngIf="!item.children" 
          (click)="navigateTo(item.route)"
          [routerLink]="item.route"
          routerLinkActive="active-route"
        >
          <mat-icon *ngIf="item.icon" matListIcon>{{ item.icon }}</mat-icon>
          <span matLine>{{ item.label }}</span>
        </mat-list-item>

        <mat-expansion-panel *ngIf="item.children" hideToggle>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon *ngIf="item.icon">{{ item.icon }}</mat-icon>
              {{ item.label }}
            </mat-panel-title>
          </mat-expansion-panel-header>

          <mat-nav-list>
            <mat-list-item 
              *ngFor="let child of item.children" 
              (click)="navigateTo(child.route)"
              [routerLink]="child.route"
              routerLinkActive="active-route"
            >
              <span matLine>{{ child.label }}</span>
            </mat-list-item>
          </mat-nav-list>
        </mat-expansion-panel>
      </ng-container>
    </mat-nav-list>
  `,
  styles: [`
    .active-route {
      background-color: rgba(0, 0, 0, 0.1);
      color: #1976d2;
    }

    mat-list-item {
      cursor: pointer;
    }

    mat-expansion-panel {
      box-shadow: none;
    }
  `]
})
export class InsuranceSidebarComponent implements OnInit {
  navigationItems: NavigationItem[] = [];

  constructor(private navigationService: InsuranceNavigationService) {}

  ngOnInit(): void {
    this.navigationItems = this.navigationService.getNavigationItems();
  }

  navigateTo(route: string): void {
    this.navigationService.navigateTo(route);
  }
}
