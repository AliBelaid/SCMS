import { Injectable } from '@angular/core';
import { NavigationDropdown, NavigationItem, NavigationLink, NavigationSubheading } from './navigation-item.interface';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationConfigService {
  constructor(private translate: TranslateService) {}

  /**
   * Get all navigation items with translations applied
   */
  getNavigationItems(): NavigationItem[] {
    return [
      {
        type: 'subheading',
        label: this.translate.instant('MAIN') || 'Main',
        children: [
          {
            type: 'link',
            label: this.translate.instant('HOME') || 'Home',
            route: '/app/document-management/dashboard',
            icon: 'mat:home',
            routerLinkActiveOptions: { exact: true }
          }
        ]
      },
      {
        type: 'subheading',
        label: this.translate.instant('DOCUMENT_MANAGEMENT') || 'Document Management',
        children: [
          {
            type: 'link',
            label: this.translate.instant('DASHBOARD') || 'Dashboard',
            route: '/app/document-management/dashboard',
            icon: 'mat:dashboard',
            routerLinkActiveOptions: { exact: true }
          },
          {
            type: 'dropdown',
            label: this.translate.instant('ORDERS') || 'Orders',
            icon: 'mat:folder',
            children: [
              {
                type: 'link',
                label: this.translate.instant('ALL_ORDERS') || 'All Orders',
                route: '/app/document-management/orders/all',
                icon: 'mat:list'
              },
              {
                type: 'link',
                label: this.translate.instant('INCOMING_ORDERS') || 'Incoming Orders',
                route: '/app/document-management/orders/incoming',
                icon: 'mat:move_to_inbox'
              },
              {
                type: 'link',
                label: this.translate.instant('OUTGOING_ORDERS') || 'Outgoing Orders',
                route: '/app/document-management/orders/outgoing',
                icon: 'mat:outbox'
              },
              {
                type: 'link',
                label: this.translate.instant('CREATE_ORDER') || 'Create Order',
                route: '/app/document-management/orders/create',
                icon: 'mat:add_circle'
              }
            ]
          }
        ]
      },
      {
        type: 'subheading',
        label: this.translate.instant('ACCOUNT') || 'Account',
        children: [
          {
            type: 'link',
            label: this.translate.instant('PROFILE') || 'Profile',
            route: '/app/user',
            icon: 'mat:account_circle'
          }
        ]
      }
    ];
  }

  /**
   * Get navigation items filtered by user roles
   */
  getFilteredNavigationItems(userRoles: string[]): NavigationItem[] {
    const allItems = this.getNavigationItems();
    return this.filterItemsByRoles(allItems, userRoles);
  }

  /**
   * Filter navigation items based on user roles
   */
  private filterItemsByRoles(items: NavigationItem[], userRoles: string[]): NavigationItem[] {
    return items.filter(item => {
      // If item has no roles specified, it's accessible to all
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      
      // Check if user has any of the required roles
      const hasRequiredRole = userRoles.some(role => item.roles!.includes(role));
      
      if (hasRequiredRole && item.type === 'subheading') {
        // For subheadings, also filter their children
        const filteredChildren = this.filterItemsByRoles(item.children, userRoles);
        return filteredChildren.length > 0;
      }
      
      if (hasRequiredRole && item.type === 'dropdown') {
        // For dropdowns, filter their children (which can only be NavigationLink or NavigationDropdown)
        const filteredChildren = this.filterDropdownChildren(item.children, userRoles);
        return filteredChildren.length > 0;
      }
      
      return hasRequiredRole;
    }).map(item => {
      // Recursively filter children for subheadings and dropdowns
      if (item.type === 'subheading' && item.children) {
        return {
          ...item,
          children: this.filterItemsByRoles(item.children, userRoles)
        } as NavigationSubheading;
      }
      if (item.type === 'dropdown' && item.children) {
        return {
          ...item,
          children: this.filterDropdownChildren(item.children, userRoles)
        } as NavigationDropdown;
      }
      return item;
    });
  }

  /**
   * Filter dropdown children (only NavigationLink or NavigationDropdown allowed)
   */
  private filterDropdownChildren(children: (NavigationLink | NavigationDropdown)[], userRoles: string[]): (NavigationLink | NavigationDropdown)[] {
    return children.filter(child => {
      // If item has no roles specified, it's accessible to all
      if (!child.roles || child.roles.length === 0) {
        return true;
      }
      
      // Check if user has any of the required roles
      const hasRequiredRole = userRoles.some(role => child.roles!.includes(role));
      
      if (hasRequiredRole && child.type === 'dropdown') {
        // For nested dropdowns, filter their children
        const filteredChildren = this.filterDropdownChildren(child.children, userRoles);
        return filteredChildren.length > 0;
      }
      
      return hasRequiredRole;
    }).map(child => {
      // Recursively filter children for nested dropdowns
      if (child.type === 'dropdown' && child.children) {
        return {
          ...child,
          children: this.filterDropdownChildren(child.children, userRoles)
        } as NavigationDropdown;
      }
      return child;
    });
  }
}
