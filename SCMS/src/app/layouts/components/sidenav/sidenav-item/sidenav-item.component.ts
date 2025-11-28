import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostBinding,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {
  NavigationDropdown,
  NavigationItem,
  NavigationLink
} from '../../../../core/navigation/navigation-item.interface';
import { dropdownAnimation } from '@vex/animations/dropdown.animation';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationService } from '../../../../core/navigation/navigation.service';
import { UserService } from '../../../../user/user.service';

import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'vex-sidenav-item',
  templateUrl: './sidenav-item.component.html',
  styleUrls: ['./sidenav-item.component.scss'],
  animations: [dropdownAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatRippleModule,
    RouterLinkActive,
    RouterLink,
    MatIconModule,
    NgClass,
    NgFor
  ]
})
export class SidenavItemComponent implements OnInit, OnChanges {
  @Input({ required: true }) item!: NavigationItem;
  @Input({ required: true }) level!: number;
  isOpen: boolean = false;
  isActive: boolean = false;
  
  // Current user roles
  private userRoles: string[] = [];

  isLink = this.navigationService.isLink;
  isDropdown = this.navigationService.isDropdown;
  isSubheading = this.navigationService.isSubheading;

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private navigationService: NavigationService,
    private userService: UserService
  ) {
    // Get current user roles
    this.userService.currentUser$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(user => {
      if (user && user.roles) {
        this.userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
      } else {
        this.userRoles = [];
      }
      this.cd.markForCheck();
    });
  }

  @HostBinding('class')
  get levelClass() {
    return `item-level-${this.level}`;
  }

  ngOnInit() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter(() => this.isDropdown(this.item)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.onRouteChange());

    this.navigationService.openChange$
      .pipe(
        filter(() => this.isDropdown(this.item)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((item) => this.onOpenChange(item));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes &&
      changes.hasOwnProperty('item') &&
      this.isDropdown(this.item)
    ) {
      this.onRouteChange();
    }
  }

  /**
   * Check if an item should be shown based on user roles
   */
  canShowItem(item: NavigationItem): boolean {
    // If no roles specified for the item, show it to everyone
    if (!item.roles || !item.roles.length) {
      return true;
    }
    
    // If user has no roles or item requires roles, hide it
    if (!this.userRoles.length) {
      return false;
    }
    
    // Show if user has at least one of the required roles
    return item.roles.some(role => this.userRoles.includes(role));
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
    this.navigationService.triggerOpenChange(this.item as NavigationDropdown);
    this.cd.markForCheck();
  }

  onOpenChange(item: NavigationDropdown) {
    if (this.isChildrenOf(this.item as NavigationDropdown, item)) {
      return;
    }

    if (this.hasActiveChilds(this.item as NavigationDropdown)) {
      return;
    }

    if (this.item !== item) {
      this.isOpen = false;
      this.cd.markForCheck();
    }
  }

  onRouteChange() {
    if (this.hasActiveChilds(this.item as NavigationDropdown)) {
      this.isActive = true;
      this.isOpen = true;
      this.navigationService.triggerOpenChange(this.item as NavigationDropdown);
      this.cd.markForCheck();
    } else {
      this.isActive = false;
      this.isOpen = false;
      this.navigationService.triggerOpenChange(this.item as NavigationDropdown);
      this.cd.markForCheck();
    }
  }

  isChildrenOf(parent: NavigationDropdown, item: NavigationDropdown): boolean {
    if (parent.children.indexOf(item) !== -1) {
      return true;
    }

    return parent.children
      .filter((child) => this.isDropdown(child))
      .some((child) => this.isChildrenOf(child as NavigationDropdown, item));
  }

  hasActiveChilds(parent: NavigationDropdown): boolean {
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
        const options = (child as NavigationLink).routerLinkActiveOptions || { exact: false };
        return this.router.isActive(child.route as string, options.exact);
      }

      return false;
    });
  }

  isFunction(prop: NavigationLink['route']): boolean {
    return prop instanceof Function;
  }
}
