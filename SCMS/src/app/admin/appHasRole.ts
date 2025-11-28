import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/assets/services/user.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective {
  @Input() set appHasRole(requiredRoles: string[]) {
    this.checkRoles(requiredRoles);
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private accountService: UserService,
    private toastr: ToastrService // Inject the ToastrService
  ) {}

  private checkRoles(requiredRoles: string[]) {
    this.accountService.currentUser$.subscribe(user => {

      console.log(user)
      if (
        user && Array.isArray(user.roles) && user.roles.some((role: any) => {
          const roleName: string = typeof role === 'string' ? role : (role && role.name) || '';
          return typeof roleName === 'string' && requiredRoles.includes(roleName);
        })
      ) {

        console.log('user')

        // User has at least one of the required roles, so render the content
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        // User doesn't have any of the required roles, so clear the view
        this.viewContainer.clear();

        // Display error toastr
        this.toastr.error('You do not have the required role(s)', 'Access Denied');
      }
    });
  }
}
