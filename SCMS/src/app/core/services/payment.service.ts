import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/assets/environments/environment';

export interface PaymentData {
  patientId: number;
  queueId: number;
  amount: number;
  paymentMethod: string;
  notes?: string;
  cardDetails?: {
    cardHolderName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };
  insuranceDetails?: {
    provider: string;
    policyNumber: string;
    approvalCode: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  processPayment(paymentData: PaymentData): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/process`, paymentData);
  }

  getPaymentHistory(patientId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/payments/history/${patientId}`);
  }

  getPaymentMethods(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/payments/methods`);
  }
} 