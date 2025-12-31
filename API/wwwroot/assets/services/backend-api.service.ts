import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/assets/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BackendApiService {


  private baseUrl = environment.apiUrl+'/account' ;
  // headers = new HttpHeaders().set('Content-Type', 'application/json');
  isOpt =false;

  constructor(private http:HttpClient) { }


  // Upload patient photo
  uploadPatientPhoto(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Patients/upload-photo`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }



  sendPusher(data:any): Observable<any> {
    return this.http.post(`${this.baseUrl}/challange`,data).pipe(
      catchError(this.handleError)
    );
  }



  getProfile(data:any): Observable<any> {
    return this.http.post(`${this.baseUrl}/getProfile`,data).pipe(
      catchError(this.handleError)
    );
  }


  getCourse(data:any): Observable<any> {
    return this.http.post(`${this.baseUrl}/getCourse`,data).pipe(
      catchError(this.handleError)
    );
  }


  getCourseItems(data:any): Observable<any> {
    return this.http.post(`${this.baseUrl}/getCourseItems`,data).pipe(
      catchError(this.handleError)
    );
  }


  getCourseItemView(data:any): Observable<any> {
    return this.http.post(`${this.baseUrl}/getCourseItemView`,data).pipe(
      catchError(this.handleError)
    );
  }


  getCourseItemInfo(data:any): Observable<any> {
    return this.http.post(`${this.baseUrl}/getCourseItemInfo`,data).pipe(
      catchError(this.handleError)
    );
  }








  // Handle API errors
  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  };








  getProfile2(data:any){
    return this.http.post( `${this.baseUrl}/getProfile` ,data)
  }


  testApi(data:any){
    return this.http.post( `${this.baseUrl}/testapi` ,data)
  }



  register(data:any){
    return this.http.post( `${this.baseUrl}/register` ,data)
  }


  loginPlatform(data: any): Observable<any> {
    console.log('Login data:', data);
    return this.http.post(`${this.baseUrl}/login`, data).pipe(
      map((response: any) => {
        console.log('Login response:', response);
        return response; // Map the response directly
      })
    );
  }


  sendOtp(data: string) {
    const url = environment.apiUrl+'/otp/';
    console.log(url)

    return this.http.get(url+data).pipe(
      map((response: any) => {
        console.log(response);

        return response; // Map the response directly
      })
    );
  }

  verifyOtp(item:any) {
    const url =environment.apiUrl+'/otp';
    const data = {
      "identifier":item.email,
      "otp" :item.otp,
    };

    return this.http.post(url, data ).pipe(
      map((response: any) => {

        console.log(response);
        return response; // Map the response directly
      })
    );
  }
}




