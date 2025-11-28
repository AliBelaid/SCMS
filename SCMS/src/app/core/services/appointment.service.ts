import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Finish an appointment
   * @param formData The appointment finish data as FormData (for file uploads)
   */
  finishAppointment( appointmentId: number, formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/queue/FinishAppointment/${appointmentId}`, formData);
  }

  /**
   * Check if technician is enabled for an appointment
   * @param queuePatientId The queue patient ID
   */
  isTechnicianEnabled(queuePatientId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/queue/technician-enabled/${queuePatientId}`);
  }
} 