import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface User {
  id: number;
  code: string;
  description: string;
  role: string;
  isActive: boolean;
  lastActive: Date;
  email?: string;
  country?: string;
  preferredLanguage?: string;
}

export interface CreateUserDto {
  code: string;
  password: string;
  description?: string;
  role: string;
  isActive: boolean;
  email?: string;
  country?: string;
  preferredLanguage?: string;
}

export interface UpdateUserDto {
  code: string;
  description?: string;
  role: string;
  isActive: boolean;
  email?: string;
  country?: string;
  preferredLanguage?: string;
}

export interface ResetPasswordDto {
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all users (Admin only)
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/DocumentViewerUser`);
  }

  // Get user by ID (Admin only)
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/DocumentViewerUser/${id}`);
  }

  // Create user (Admin only)
  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/DocumentViewerUser`, user);
  }

  // Update user (Admin only)
  updateUser(id: number, user: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/DocumentViewerUser/${id}`, user);
  }

  // Delete user (Admin only)
  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/DocumentViewerUser/${id}`);
  }

  // Activate user (Admin only)
  activateUser(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/DocumentViewerUser/${id}/activate`, {});
  }

  // Deactivate user (Admin only)
  deactivateUser(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/DocumentViewerUser/${id}/deactivate`, {});
  }

  // Reset password (Admin only)
  resetPassword(id: number, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/DocumentViewerUser/${id}/reset-password`, {
      newPassword: newPassword
    });
  }

  // Check if user code exists (Admin only)
  checkCodeExists(code: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/DocumentViewerUser/check-code/${code}`);
  }

  // Get available roles
  getAvailableRoles(): string[] {
    return ['Admin', 'Member', 'Uploader'];
  }
}

