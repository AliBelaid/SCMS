import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {


  private iss = {

   // login : 'http://80.209.237.254/projects/manhaji_student/public/api/login'  ,
  //  signup : 'http://80.209.237.254/projects/manhaji_student/public/api/register'
  };
  constructor() { }


  handle(token){
    this.set(token);
     // console.log(this.isValid());
  }

  set(token){
    localStorage.setItem('token',token);
  }

  get(){
    return localStorage.getItem('token');
  }

  remove(){
    localStorage.removeItem('token');
  }

  isValid(){
    const token   = this.get();
   // console.log('no token found ');
    if( token !== null ){
   //   console.log('token != null => ' + token );
      const payload   = this.payload(token);
      if(payload){

        return Object.values(this.iss).indexOf(payload.iss) > -1  ? true  : false ;
      }
    }
    return false;
  }


  payload(token){
    const payload = token.split('.')[1] ;
    return this.decode(payload) ;
  }


  decode(payload){
    return JSON.parse(atob(payload));
  }

loggedIn(){
  if (this.isValid() == false){
  //  console.log('Token.loggedIn = false ')   ;
  }
  else{
  //  console.log('Token.loggedIn = true ')   ;
  }


  return this.isValid();
}





}
