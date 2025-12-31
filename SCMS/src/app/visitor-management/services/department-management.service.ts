import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../assets/environments/environment';

export interface Department {
  id: number;
  name: string;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
}

export interface UpdateDepartmentDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentManagementService {
  private apiUrl = `${environment.apiUrl}/VisitorDepartments`;
  private departmentsSubject = new BehaviorSubject<Department[]>([]);
  public departments$ = this.departmentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getDepartments(includeInactive: boolean = false): Observable<Department[]> {
    let params = new HttpParams();
    if (includeInactive) {
      params = params.set('includeInactive', 'true');
    }
    return this.http.get<Department[]>(this.apiUrl, { params }).pipe(
      map(departments => {
        this.departmentsSubject.next(departments);
        return departments;
      })
    );
  }

  getDepartment(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  createDepartment(dto: CreateDepartmentDto): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, dto).pipe(
      map(department => {
        const current = this.departmentsSubject.value;
        this.departmentsSubject.next([...current, department]);
        return department;
      })
    );
  }

  updateDepartment(id: number, dto: UpdateDepartmentDto): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, dto).pipe(
      map(department => {
        const current = this.departmentsSubject.value;
        const index = current.findIndex(d => d.id === id);
        if (index !== -1) {
          current[index] = department;
          this.departmentsSubject.next([...current]);
        }
        return department;
      })
    );
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        const current = this.departmentsSubject.value;
        this.departmentsSubject.next(current.filter(d => d.id !== id));
      })
    );
  }
}

