import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

export interface DemoRoleSwitcherService {
  getCurrentRole(): Observable<UserRole>;
  switchRole(roleId: string): Observable<UserRole>;
  getAvailableRoles(): Observable<UserRole[]>;
}

@Injectable({
  providedIn: 'root'
})
export class RoleBasedAccessService implements DemoRoleSwitcherService {
  private currentRoleSubject = new BehaviorSubject<UserRole>(this.getDefaultRole());
  public currentRole$ = this.currentRoleSubject.asObservable();

  private availableRoles: UserRole[] = [
    {
      id: 'tpa-admin',
      name: 'TPA Administrator',
      permissions: ['all'],
      description: 'Full system access'
    },
    {
      id: 'medical-provider',
      name: 'Medical Provider',
      permissions: ['view_claims', 'create_claims', 'edit_own_claims'],
      description: 'Can manage own claims'
    },
    {
      id: 'hospital-system',
      name: 'Hospital System',
      permissions: ['view_claims', 'create_claims', 'edit_claims', 'batch_management'],
      description: 'Can manage hospital claims and batches'
    },
    {
      id: 'insurance-company',
      name: 'Insurance Company',
      permissions: ['view_claims', 'approve_claims', 'reject_claims'],
      description: 'Can review and approve claims'
    },
    {
      id: 'claims-processor',
      name: 'Claims Processor',
      permissions: ['view_claims', 'process_claims', 'batch_management'],
      description: 'Can process and manage claims'
    },
    {
      id: 'subscriber',
      name: 'Subscriber',
      permissions: ['view_own_claims', 'view_benefits'],
      description: 'Can view own claims and benefits'
    }
  ];

  constructor() {}

  getCurrentRole(): Observable<UserRole> {
    return this.currentRoleSubject.asObservable();
  }

  switchRole(roleId: string): Observable<UserRole> {
    const role = this.availableRoles.find(r => r.id === roleId);
    if (role) {
      this.currentRoleSubject.next(role);
      // In a real app, you would save this to localStorage or send to backend
      localStorage.setItem('currentRole', JSON.stringify(role));
    }
    return of(role || this.getDefaultRole());
  }

  getAvailableRoles(): Observable<UserRole[]> {
    return of(this.availableRoles);
  }

  hasPermission(permission: string): boolean {
    const currentRole = this.currentRoleSubject.value;
    return currentRole.permissions.includes('all') || currentRole.permissions.includes(permission);
  }

  private getDefaultRole(): UserRole {
    const savedRole = localStorage.getItem('currentRole');
    if (savedRole) {
      try {
        return JSON.parse(savedRole);
      } catch {
        // Fall back to default
      }
    }
    return this.availableRoles[0]; // Default to TPA Admin
  }
}
