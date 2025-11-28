import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';


import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from 'src/assets/services/user.service';
 

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  /**
   *
   */
  constructor(private accountService: UserService ) {

  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean>  {


      return this.accountService.currentUser$.pipe(
        map(user => {
        if(user.roles.includes('Admin') || user.roles.includes('Moderator')){
         return true;
        }
       // this.toastrService.error('You cannot enter this area');
        return false;
      }))
  }

}
