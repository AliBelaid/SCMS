import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";


import { catchError, map, Observable, of, ReplaySubject, take, throwError, tap } from "rxjs";

import { ToastrService } from "ngx-toastr";
import { IUserNew } from "src/assets/user";
import { User } from "src/assets/models/medical-provider.model";
import { TokenService } from "src/assets/services/token.service";
import { BehaviorSubject, Subject } from "rxjs";
import { environment } from "src/assets/environments/environment";


type AddressDto = Record<string, unknown>;

@Injectable({
  providedIn: "root",
})
export class UserService {

  blockedSite(name: string) {
    this.http
      .get(
        `https:/.codetabs.com/v1/proxy/?quest=https://libyanspider.com/blocked/${name}`
      )
      .subscribe(() => {
        //empty
      });
  }

  // Instead of just having a ReplaySubject, keep a private current user object
  private currentUserObject: IUserNew| null = null;
  private readonly currentUserSources = new ReplaySubject<IUserNew>(1);
  public currentUser$ = this.currentUserSources.asObservable();
  
  // Make these public so we can call next() on them directly
  public UserPhotoCover = new BehaviorSubject<string>("");
  public logoUser = this.UserPhotoCover.asObservable();
  public UserPhotoAvatar = new BehaviorSubject<string>("");
  authUrl = "http://medisoft.somee.com";
  public logoUserAvatar = this.UserPhotoAvatar.asObservable();
  baseUrl = environment.apiUrl;
  private readonly previousUrls = new ReplaySubject<string>(1);
  public readonly previousUrls$ = this.previousUrls.asObservable();
  
  constructor(
    private http: HttpClient,
    private route: Router,
    private tokenService: TokenService,
    private toastr: ToastrService
  ) {
    // Try to initialize the user from localStorage on startup
    this.initUserFromStorage();
  }

  // Initialize user from localStorage on application startup
  private initUserFromStorage() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        
        // Ensure roles is always an array
        if (user && !Array.isArray(user.roles)) {
          // If roles is a string, convert it to an array
          if (typeof user.roles === 'string') {
            user.roles = [user.roles];
          } 
          // If roles doesn't exist, initialize as empty array
          else if (!user.roles) {
            user.roles = [];
          }
        }
        
        // Update both the ReplaySubject and the private user object
        this.currentUserObject = user;
        this.currentUserSources.next(user);
        console.log('Initialized user from storage:', user);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }

  login(value: any) {
    return this.http.post<IUserNew>(this.baseUrl + "/account/login", value).pipe(
      map((user: IUserNew) => {
        if (user) {
          // Update both the ReplaySubject and the private user object
          this.currentUserObject = user;
          this.currentUserSources.next(user);
        }
      })
    );
  }

  // Get current user value synchronously (without subscribing)
  get currentUserValue(): IUserNew | null {
    return this.currentUserObject;
  }

  register(values: any) {
    return this.http.post(this.baseUrl + "/account/register", values);
  }

  checkEmailExists(email: string) {
    return this.http.get(this.baseUrl + "/Account/emailexists?email=" + email);
  }


    private handleError(error: HttpErrorResponse): Observable<any> {
      console.error('API Error:', error);

      // You can handle the error and return a user-friendly message or rethrow it
      return throwError('Something went wrong. Please try again later.');
    }

  loadCurrentUser(): Observable<IUserNew| null> {
    const token = this.tokenService.get();
    
    if (!token) {
      // No token found, return null without making API call
      this.currentUserSources.next(null);
      return of(null);
    }

    // Try to load from localStorage first
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Update both the ReplaySubject and the private user object
        this.currentUserObject = user;
        this.currentUserSources.next(user);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }

    // Then make the API call
    return this.http.get<IUserNew>(`${this.baseUrl}/account`).pipe(
      map((user) => {
        console.log("Loading current user:", user);
        
        // Ensure roles is always an array
        if (user && !Array.isArray(user.roles)) {
          // If roles is a string, convert it to an array
          if (typeof user.roles === 'string') {
            user.roles = [user.roles];
          } 
          // If roles doesn't exist, initialize as empty array
          else if (!user.roles) {
            user.roles = [];
          }
        }
        
        // Store user in localStorage as a backup for page refreshes
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update both the ReplaySubject and the private user object
        this.currentUserObject = user;
        this.currentUserSources.next(user);
        this.UserPhotoAvatar.next(user?.logo ?? "");
        this.UserPhotoCover.next(user?.pathCoverImage ?? '');
        return user;
      }),
      catchError((error) => {
        console.error('Error loading current user:', error);
        
        // If API call fails but we have stored user data, use that
        if (this.currentUserObject) {
          return of(this.currentUserObject);
        }
        
        // Otherwise return null
        this.currentUserSources.next(null);
        return of(null);
      })
    );
  }


  logout() {
    this.currentUserSources.next(null);
    localStorage.removeItem("token");
    this.route.navigateByUrl("/login");
  }

  getUserAddress() {
    return this.http.get<AddressDto>(this.baseUrl + "/account/address");
  }

  updateUserAddress(address: AddressDto) {
    return this.http.put(this.baseUrl + "/account/address", address);
  }

  setUpdateCurrentUser(user: IUserNew) {
    // Ensure roles is always an array
    if (user && !Array.isArray(user.roles)) {
      // If roles is a string, convert it to an array
      if (typeof user.roles === 'string') {
        user.roles = [user.roles];
      } 
      // If roles doesn't exist, initialize as empty array
      else if (!user.roles) {
        user.roles = [];
      }
    }
    
    console.log('Setting current user with roles:', user.roles);
    this.currentUserSources.next(user);
  }

  setUpdateCurrentPhotoCover(photo: any) {
    console.log(photo);
    this.UserPhotoCover.next(photo);
  }

  setUpdateCurrentPhotoAvatar(photo: any) {
    console.log(photo);
    this.UserPhotoAvatar.next(photo);
  }

  loadSchool() {
    return this.http
      .get<any[]>(
        this.baseUrl + "/schools"
      )
      .pipe(take(1));
  }
  loadAddress() {
    return this.http
      .get<AddressDto[]>(
        this.baseUrl + "/Account​/address"
      )
      .pipe(map((rep) => rep));
  }
  updateUser(user: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/account/update`, user)
      .pipe(
        tap(response => {
          // Update current user after successful update
          this.currentUserSources.next(response);
        })
      );
  }

  loadGrade() {
    return this.http
      .get<any[]>(
        this.baseUrl + "/grades"
      )
      .pipe(map((rep) => rep));
  }


  blockedMember(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/users/${id}/block`, {});
  }

  unblockedMember(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/users/${id}/unblock`, {});
  }

  updateUserx(dataToSend:any ) {
    return this.http
    .post(
            environment.apiUrl+"/friend_request",dataToSend);
  }


  acceptFriendship(friend: number) {

    const data = {
      friend_user_id: friend,
    };

    return this.http
      .post(
        environment.apiUrl+"/friend_request",
        data
      )
      .subscribe((rep) => {
        console.log(rep);

        rep;});
  }

  deleteFriends(friend: number) {
    console.log('-delete freinde'+friend);
    return this.http
      .delete(
          environment.apiUrl+"/friend/"+friend);


  }
  AbrveFrindes(friend: number) {

    const data = {friend_user_id : friend};
    return this.http
      .put(
        environment.apiUrl+"/friend_approve",
        data
      )
      .subscribe((rep) => {
        console.log(rep);

        rep;});
  }

  loadImages() {
    return this.http
      .get<any[]>(
        environment.apiUrl+"/user_images"
      )
      .pipe(
        map((rep) => {
          return rep["data"];
        })
      );
  }
  uploadImage(img: any) {
    this.http
      .post(
        environment.apiUrl+"/user_image",
        img
      )
      .subscribe((rep) => {
        console.log(rep);

        rep;});
  }
  UpdateImg(img: any) {
    this.http
      .put(environment.apiUrl+"/user_image", img)
      .subscribe((rep) => {
        console.log(rep);

        rep;});
  }

  DeleteImg(img: any) {
    return this.http
      .delete(
            environment.apiUrl+"/User/delete-photo/"+img.id)
      .pipe(map((rep) => rep));
  }

  /**
   * Check if the current user has any of the specified roles
   * @param requiredRoles Array of roles to check
   * @returns Observable of boolean indicating if user has any of the specified roles
   */
  hasRole(requiredRoles: string[]): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        
        // Get user roles
        const userRoles = user.roles || [];
        
        // Check if user has any of the required roles
        return userRoles.some(role => requiredRoles.includes(role));
      })
    );
  }
  
  /**
   * Check if the current user is a doctor
   * @returns Observable of boolean indicating if user is a doctor
   */
  isDoctor(): Observable<boolean> {
    return this.hasRole(['Doctor']);
  }
  
  /**
   * Check if the current user is an admin
   * @returns Observable of boolean indicating if user is an admin
   */
  isAdmin(): Observable<boolean> {
    return this.hasRole(['Admin']);
  }
  
  /**
   * Check if the current user ID matches the specified ID
   * @param id ID to check against current user
   * @returns Observable of boolean indicating if IDs match
   */
  isCurrentUser(id: number): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        return user.id.toString() === id.toString();
      })
    );
  }

  // Add a new method for uploading user profile image
  uploadProfileImage(userId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    return this.http.post<{photoUrl: string}>(`${this.baseUrl}/user/${userId}/photo`, formData)
      .pipe(
        tap(response => {
          if (response && response.photoUrl) {
            // Update the user's avatar in the service
            this.UserPhotoAvatar.next(response.photoUrl);
          }
        })
      );
  }
  
  // Method to update user profile data
  updateUserProfile(userData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/account/update/user`, userData)
      .pipe(
        tap(response => {
          // Update the current user with the new data
          this.currentUser$.pipe(take(1)).subscribe(currentUser => {
            if (currentUser) {
              const updatedUser = { ...currentUser, ...response };
              this.currentUserSources.next(updatedUser);
              
              // Update logo if it's changed
              if (response.logo) {
                this.UserPhotoAvatar.next(response.logo);
              }
            }
          });
        })
      );
  }
}
