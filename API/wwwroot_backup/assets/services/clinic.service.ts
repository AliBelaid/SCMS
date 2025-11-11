import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/assets/environments/environment';
import { Clinic } from 'src/assets/user';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  private baseUrl = `${environment.apiUrl}/clinics`;

  constructor(private http: HttpClient) { }

  /**
   * Get all clinics
   */
  getClinics(): Observable<Clinic[]> {
    return this.http.get<Clinic[]>(this.baseUrl);
  }

  /**
   * Get a specific clinic by ID
   */
  getClinic(id: number): Observable<Clinic> {
    return this.http.get<Clinic>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new clinic
   * Logo is included directly in the clinic object as a base64 string
   */
  createClinic(clinic: any): Observable<Clinic> {
    return this.http.post<Clinic>(this.baseUrl, clinic);
  }

  /**
   * Update an existing clinic
   * Logo is included directly in the clinic object as a base64 string
   */
  updateClinic(id: number, clinic: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, clinic);
  }

  /**
   * Delete a clinic
   */
  deleteClinic(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get doctors for a specific clinic
   */
  getClinicDoctors(clinicId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${clinicId}/doctors`);
  }

  /**
   * Add a doctor to a clinic
   */
  addDoctorToClinic(clinicId: number, doctorId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${clinicId}/Doctor/${doctorId}`, {});
  }

  /**
   * Remove a doctor from a clinic
   */
  removeDoctorFromClinic(clinicId: number, doctorId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${clinicId}/Doctor/${doctorId}`);
  }

  /**
   * Get clinic queue patients
   */
  getClinicQueue(clinicId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${clinicId}/queue`);
  }

  /**
   * Get all queue patients across all clinics
   */
  getAllQueuePatients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/queue`);
  }

  /**
   * Get clinic calendar events
   */
  getClinicEvents(clinicId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${clinicId}/events`);
  }

  /**
   * Assign clinics to a user
   */
  assignClinicsToUser(username: string, clinicIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${username}/add-patch-clinic`, clinicIds);
  }

  /**
   * Get users assigned to a clinic
   */
  getUsersByClinic(clinicId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/by-clinic/${clinicId}`);
  }
} 