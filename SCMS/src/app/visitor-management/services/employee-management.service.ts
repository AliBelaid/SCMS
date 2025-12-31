import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../assets/environments/environment';

export interface Employee {
  id: number;
  employeeId: string;
  employeeName: string;
  departmentId?: number;
  departmentName?: string;
  cardImageUrl?: string;
  faceImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateEmployeeDto {
  employeeId: string;
  employeeName: string;
  departmentId?: number;
  cardImageBase64?: string;
  faceImageBase64?: string;
}

export interface UpdateEmployeeDto {
  employeeName?: string;
  departmentId?: number;
  cardImageBase64?: string;
  faceImageBase64?: string;
  isActive?: boolean;
}

export interface EmployeeAttendance {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmployeeId?: string;
  checkInTime?: string; // For regular attendance
  checkOutTime?: string; // For regular attendance
  firstCheckInTime?: string; // For grouped attendance
  lastCheckOutTime?: string; // For grouped attendance
  isCheckedIn?: boolean; // For grouped attendance
  attendanceId?: number; // For grouped attendance
  notes?: string;
  departmentName?: string;
  // Helper getter properties (will be computed)
  _checkInTime?: string;
  _checkOutTime?: string;
}

export interface CreateEmployeeAttendanceDto {
  employeeIdOrName: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeManagementService {
  private apiUrl = `${environment.apiUrl}/Employees`;
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getEmployees(search?: string, departmentId?: number): Observable<Employee[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (departmentId) params = params.set('departmentId', departmentId.toString());

    return this.http.get<Employee[]>(this.apiUrl, { params }).pipe(
      map(employees => {
        this.employeesSubject.next(employees);
        return employees;
      })
    );
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  getEmployeeByIdentifier(employeeId?: string, name?: string): Observable<Employee> {
    let params = new HttpParams();
    if (employeeId) params = params.set('employeeId', employeeId);
    if (name) params = params.set('name', name);

    return this.http.get<Employee>(`${this.apiUrl}/lookup`, { params });
  }

  createEmployee(dto: CreateEmployeeDto): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, dto).pipe(
      map(employee => {
        const current = this.employeesSubject.value;
        this.employeesSubject.next([...current, employee]);
        return employee;
      })
    );
  }

  updateEmployee(id: number, dto: UpdateEmployeeDto): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, dto).pipe(
      map(employee => {
        const current = this.employeesSubject.value;
        const index = current.findIndex(e => e.id === id);
        if (index >= 0) {
          current[index] = employee;
          this.employeesSubject.next([...current]);
        }
        return employee;
      })
    );
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        const current = this.employeesSubject.value.filter(e => e.id !== id);
        this.employeesSubject.next(current);
      })
    );
  }

  checkIn(dto: CreateEmployeeAttendanceDto): Observable<EmployeeAttendance> {
    return this.http.post<EmployeeAttendance>(`${this.apiUrl}/attendance/checkin`, dto);
  }

  checkOut(attendanceId: number): Observable<EmployeeAttendance> {
    return this.http.post<EmployeeAttendance>(`${this.apiUrl}/attendance/${attendanceId}/checkout`, {});
  }

  getTodayAttendance(): Observable<EmployeeAttendance[]> {
    return this.http.get<EmployeeAttendance[]>(`${this.apiUrl}/attendance/today`);
  }

  getEmployeeAttendance(employeeId: number, dateFrom?: Date, dateTo?: Date): Observable<EmployeeAttendance[]> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('dateFrom', dateFrom.toISOString());
    if (dateTo) params = params.set('dateTo', dateTo.toISOString());

    return this.http.get<EmployeeAttendance[]>(`${this.apiUrl}/${employeeId}/attendance`, { params });
  }

  importFromExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/import/excel`, formData);
  }
}

