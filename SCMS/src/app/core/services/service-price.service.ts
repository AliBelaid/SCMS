import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicePriceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get all service prices for a specific type
   * @param type The service type (e.g., 'radiology', 'lab', etc.)
   */
  getServicePricesByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/service-prices/type/${type}`);
  }

  /**
   * Get a specific service price by ID
   * @param id The service price ID
   */
  getServicePriceById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/service-prices/id/${id}`);
  }
} 