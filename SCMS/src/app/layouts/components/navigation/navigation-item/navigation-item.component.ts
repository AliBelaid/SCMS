import { Component, Input, OnInit } from '@angular/core';
import {
  NavigationItem,
  NavigationLink
} from '../../../../core/navigation/navigation-item.interface';
import { filter, map, startWith } from 'rxjs/operators';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NavigationService } from '../../../../core/navigation/navigation.service';
import { trackByRoute } from '@vex/utils/track-by';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import {
  AsyncPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet
} from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../../user/user.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'vex-navigation-item',
  templateUrl: './navigation-item.component.html',
  styleUrls: ['./navigation-item.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatRippleModule,
    NgClass,
    RouterLink,
    MatMenuModule,
    NgFor,
    MatIconModule,
    NgTemplateOutlet,
    AsyncPipe,
    TranslateModule
  ]
})
export class NavigationItemComponent implements OnInit {
  @Input({ required: true }) item!: NavigationItem;

  isActive$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null),
    map(() => (item: NavigationItem) => this.hasActiveChilds(item))
  );

  isLink = this.navigationService.isLink;
  isDropdown = this.navigationService.isDropdown;
  isSubheading = this.navigationService.isSubheading;
  trackByRoute = trackByRoute;

  constructor(
    private navigationService: NavigationService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {}

  hasActiveChilds(parent: NavigationItem): boolean {
    if (this.isLink(parent)) {
      // Check if the route is /queues and the current route matches /queues or /finish/*
      if (parent.route === '/queues') {
        return this.router.url.startsWith('/queues') || this.router.url.startsWith('/finish/');
      }
      // Use routerLinkActiveOptions if provided, otherwise use exact matching
      const options = (parent as NavigationLink).routerLinkActiveOptions || { exact: true };
      return this.router.isActive(parent.route as string, options.exact);
    }

    if (this.isDropdown(parent) || this.isSubheading(parent)) {
      return parent.children.some((child) => {
        if (this.isDropdown(child)) {
          return this.hasActiveChilds(child);
        }

        if (this.isLink(child) && !this.isFunction(child.route)) {
          // Check if the route is /queues and the current route matches /queues or /finish/*
          if (child.route === '/queues') {
            return this.router.url.startsWith('/queues') || this.router.url.startsWith('/finish/');
          }
          // Use routerLinkActiveOptions if provided, otherwise use exact matching
          const options = (child as NavigationLink).routerLinkActiveOptions || { exact: true };
          return this.router.isActive(child.route as string, options.exact);
        }

        return false;
      });
    }

    return false;
  }

  isFunction(prop: NavigationLink['route']) {
    return prop instanceof Function;
  }

  // Check if user has required roles to view this item
  hasRequiredRole(item: NavigationItem): boolean {
    // If no roles specified, item is visible to everyone
    if (!('roles' in item) || !item.roles || item.roles.length === 0) {
      return true;
    }

    // Get current user synchronously from the service
    const currentUser = this.userService.currentUserValue;
    
    // If no user is logged in, no roles are available
    if (!currentUser) {
      return false;
    }
    
    // Check if current user has any of the required roles
    const userRoles = currentUser.roles || [];
    return userRoles.some(role => item.roles?.includes(role));
  }
}
