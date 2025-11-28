import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, Subject, takeUntil, BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { NavigationService } from '../../../core/navigation/navigation.service';
import { NavigationItem } from '../../../core/navigation/navigation-item.interface';
import { NavigationItemComponent } from './navigation-item/navigation-item.component';
import { MatDividerModule } from '@angular/material/divider';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { UserService } from '../../../user/user.service';

@Component({
  selector: 'vex-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    MatDividerModule,
    NavigationItemComponent
  ]
})
export class NavigationComponent implements OnInit, OnDestroy {
  items$: Observable<NavigationItem[]>;
  private destroy$ = new Subject<void>();

  constructor(
    private navigationService: NavigationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Filter navigation items based on user roles
    this.items$ = this.navigationService.items$.pipe(
      takeUntil(this.destroy$),
      map(items => {
        // Use type assertion to handle type safety while still filtering by role
        return this.filterItemsByRole(items) as NavigationItem[];
      })
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Filter navigation items recursively based on user roles
   */
  private filterItemsByRole(items: any[]): any[] {
    return items
      .filter(item => this.isVisible(item))
      .map(item => {
        // Handle subheadings and dropdowns with children
        if ('children' in item && item.children) {
          const filteredChildren = this.filterItemsByRole(item.children);
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      // Only include subheadings if they have at least one visible child
      .filter(item => !('children' in item) || (item.children && item.children.length > 0));
  }

  /**
   * Check if a navigation item should be visible based on roles
   */
  private isVisible(item: any): boolean {
    // If no roles specified, item is visible to everyone
    if (!('roles' in item) || !item.roles || item.roles.length === 0) {
      return true;
    }

    // Use the currentUserValue for synchronous role checking
    const currentUser = this.userService.currentUserValue;
    if (!currentUser || !currentUser.roles) return false;
      
    return currentUser.roles.some(role => item.roles.includes(role));
  }
}
