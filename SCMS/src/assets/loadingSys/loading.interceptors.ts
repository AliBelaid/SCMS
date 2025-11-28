
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable, identity } from "rxjs";
import { Injectable } from '@angular/core';
import { delay, catchError, finalize } from 'rxjs/operators';
import { BusyService } from "./busy.service";
import { environment } from "../environments/environment";
 
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {


  constructor(private busyService: BusyService) {
  }

  intercept(req: HttpRequest<any>,
     next: HttpHandler): Observable<HttpEvent<any>> {
       if(!req.url.includes('emailexists')){
         this.busyService.busy();
       }
      return next.handle(req).pipe(


         (environment.production? identity:    delay(10)),
        finalize(()=>{
           this.busyService.idle();
        })
      )
  }

}
