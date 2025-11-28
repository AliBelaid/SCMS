import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/assets/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RadiologyService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get all radiology reports
   */
  getReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/radiology`);
  }

  /**
   * Get a specific radiology report by ID
   */
  getReport(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/radiology/${id}`);
  }

  /**
   * Create a new radiology report
   */
  createReport(formData: FormData): Observable<any> {
    // Log the FormData contents for debugging
    console.log('Creating radiology report with FormData:');
    console.log('Has file:', formData.has('reportAttachment'));
    
    // Check if the form data includes a file
    if (formData.has('reportAttachment')) {
      const file = formData.get('reportAttachment') as File;
      console.log('File details:', file.name, file.type, file.size);
    }
    
    return this.http.post<any>(`${this.apiUrl}/radiology/direct`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / event.total);
            return { status: 'progress', message: `${progress}%` };
          
          case HttpEventType.Response:
            return event.body;
          
          default:
            return { status: 'event', message: `Upload event: ${event.type}` };
        }
      })
    );
  }

  /**
   * Update an existing radiology report
   */
  updateReport(id: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/radiology/${id}`, formData);
  }

  /**
   * Delete a radiology report
   */
  deleteReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/radiology/${id}`);
  }

  /**
   * Generate a PDF for a radiology report
   */
  generateReportPdf(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/radiology/${id}/pdf`);
  }

  /**
   * Get all radiology reports for a specific treatment
   */
  getReportsByTreatment(treatmentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/radiology/treatment/${treatmentId}`);
  }

  /**
   * Get radiology service prices
   */
  getServicePrices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/queue/payment/service/1/prices`);
  }
} 