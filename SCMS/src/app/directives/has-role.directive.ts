import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../user/user.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private hasView = false;
  private roles: string[] = [];
  private destroy$ = new Subject<void>();

  @Input() set appHasRole(roles: string | string[]) {
    // Convert single role to array if string is provided
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Subscribe to user changes to update the view when user changes
    this.userService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    this.userService.hasRole(this.roles)
      .pipe(takeUntil(this.destroy$))
      .subscribe(hasRole => {
        if (hasRole && !this.hasView) {
          // If user has role and view is not created, create it
          this.viewContainerRef.createEmbeddedView(this.templateRef);
          this.hasView = true;
        } else if (!hasRole && this.hasView) {
          // If user doesn't have role and view exists, remove it
          this.viewContainerRef.clear();
          this.hasView = false;
        }
      });
  }
} 