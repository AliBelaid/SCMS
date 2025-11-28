 import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable, identity } from "rxjs";
import { Injectable } from '@angular/core';
import { delay, catchError, finalize } from 'rxjs/operators';
import { BusyService } from "src/assets/services/busy.service";
import { environment } from "src/assets/environments/environment";

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {


  constructor(private busyService: BusyService) {
  }
  intercept(req: HttpRequest<any>,
     next: HttpHandler): Observable<HttpEvent<any>> {
      if(req.method==='POST' && req.url.includes('Orders')) {
        return next.handle(req);
      }
       if(req.url.includes('emailexists')){
        return next.handle(req);
       }
      //  checkEmailExists(email: string) {
      //   return this.http.get(this.baseUrl + 'account/emailexists?email=' + email);
      // }
       this.busyService.busy();
      return next.handle(req).pipe(

     (environment.production? identity:    delay(1000)),
        finalize(()=>{
          this.busyService.idle();
        })
      )
  }

}
