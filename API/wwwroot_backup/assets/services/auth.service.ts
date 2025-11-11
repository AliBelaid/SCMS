import { TokenService } from './token.service';
import { Injectable } from '@angular/core';
import { BackendApiService } from './backend-api.service';
import { UserService } from 'src/app/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private Token:TokenService, private API: BackendApiService,private user:UserService) { }



  getToken(){
    return localStorage.getItem('token');
  }

   loggedIn() {

     return !!localStorage.getItem('token') ;
   }






}
