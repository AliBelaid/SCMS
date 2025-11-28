import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'claim' | 'preapproval' | 'benefit' | 'eligibility';
  condition: string;
  action: 'block' | 'warn' | 'require_approval';
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ValidationRulesService {
  private baseUrl = '/api/validation-rules';

  constructor(private http: HttpClient) {}

  getValidationRules(): Observable<ValidationRule[]> {
    // Mock data for development
    const mockRules: ValidationRule[] = [
      {
        id: '1',
        name: 'Maximum Claim Amount',
        description: 'Prevents claims exceeding $50,000 without approval',
        ruleType: 'claim',
        condition: 'amount > 50000',
        action: 'require_approval',
        isActive: true,
        priority: 1,
        createdAt: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'Duplicate Claim Check',
        description: 'Blocks duplicate claims for same patient and service date',
        ruleType: 'claim',
        condition: 'duplicate_claim_exists',
        action: 'block',
        isActive: true,
        priority: 2,
        createdAt: new Date('2024-01-01')
      }
    ];

    return of(mockRules);
  }

  createValidationRule(rule: Partial<ValidationRule>): Observable<ValidationRule> {
    return this.http.post<ValidationRule>(this.baseUrl, rule);
  }

  updateValidationRule(id: string, rule: Partial<ValidationRule>): Observable<ValidationRule> {
    return this.http.put<ValidationRule>(`${this.baseUrl}/${id}`, rule);
  }

  deleteValidationRule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
