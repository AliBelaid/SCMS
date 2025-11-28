import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { environment } from 'src/assets/environments/environment';
import { ToastrService } from 'ngx-toastr';
  
export interface MedicalTechnician {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
}

// export interface TechnicianQueuePatient {
//  // queuePatientId: number;
//  id: number;
//   patientId: number;
//   patientName: string;
//   serviceName: string;
//   clinicName: string;
//   serviceId: number;
//   clinicId: number;
//   enqueueTime: Date;
//   paymentAmount: number;
//   technicianAmount: number;
//   technicianPercentage: number;
//   isPaid: boolean;
//   isFinished: boolean;
//   status?: string;
//   notes?: string;
//   paymentDate?: Date;
// }

export interface TechnicianBalance {
  technicianId: number;
  technicianName: string;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  services: TechnicianService[];
}

export interface TechnicianService {
  queuePatientId: number;
  patientName: string;
  serviceName: string;
  amount: number;
  technicianAmount: number;
  technicianPercentage: number;
  paymentDate: Date;
  isFinished: boolean;
  status: string;
}

export interface FinishAppointmentRequest {
  notes: string;
  finishReason: string;
  medicalTechnicianId?: number | null;
  settlementId?: null;
}

@Injectable({
  providedIn: 'root'
})
export class MedicalTechnicianService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) { }

  /**
   * Get all medical technicians
   */
  getAllTechnicians(): Observable<MedicalTechnician[]> {
    return this.http.get<MedicalTechnician[]>(`${this.apiUrl}/queue/medical-technicians`)
      .pipe(
        catchError(error => {
          this.toastr.error('Failed to load medical technicians', 'Error');
          console.error('Error loading technicians:', error);
          return of([]);
        })
      );
  }

  /**
   * Get queue for a specific technician
   */
 

  /**
   * Get financial balance information for technicians
   */
  getTechnicianBalances(technicianId?: number, startDate?: Date, endDate?: Date): Observable<TechnicianBalance[]> {
    let url = `${this.apiUrl}/treasury/technician-balances`;
    
    // Add query parameters
    const params: string[] = [];
    if (technicianId) params.push(`technicianId=${technicianId}`);
    if (startDate) params.push(`startDate=${startDate.toISOString()}`);
    if (endDate) params.push(`endDate=${endDate.toISOString()}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<TechnicianBalance[]>(url)
      .pipe(
        catchError(error => {
          this.toastr.error('Failed to load technician balances', 'Error');
          console.error('Error loading technician balances:', error);
          return of([]);
        })
      );
  }

  /**
   * Finish an appointment/service
   */
  finishAppointment(queueId: number, data: FinishAppointmentRequest): Observable<any> {
    // Check if the queue already has a technician assigned
    return this.http.get<any>(`${this.apiUrl}/queue/PatientByQueueId/${queueId}`).pipe(
      switchMap(queueDetails => {
        // If queue already has a technician, don't try to reassign
        if (queueDetails.medicalTechnicianId) {
          // Don't include technician ID in the request if already assigned
          const requestData = {
            notes: data.notes,
            finishReason: data.finishReason,
            settlementId: null
          };
          return this.http.post(`${this.apiUrl}/queue/FinishAppointment/${queueId}`, requestData);
        } else {
          // Include the technician ID in the request and set settlementId to null
          const requestWithNullSettlement = {
            ...data,
            settlementId: null
          };
          return this.http.post(`${this.apiUrl}/queue/FinishAppointment/${queueId}`, requestWithNullSettlement);
        }
      }),
      catchError(error => {
        this.toastr.error('Failed to finish appointment', 'Error');
        console.error('Error finishing appointment:', error);
        throw error;
      })
    );
  }

  /**
   * Update queue status (finish/unfinish)
   */
  updateQueueStatus(queueId: number, isFinished: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/queue/status/${queueId}`, { isFinished })
      .pipe(
        catchError(error => {
          this.toastr.error('Failed to update status', 'Error');
          console.error('Error updating status:', error);
          throw error;
        })
      );
  }

  /**
   * Get detailed information about a specific queue patient
   */
  getPatientByQueueId(queueId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/queue/PatientByQueueId/${queueId}`)
      .pipe(
        catchError(error => {
          this.toastr.error('Failed to load patient details', 'Error');
          console.error('Error loading patient details:', error);
          throw error;
        })
      );
  }
} 