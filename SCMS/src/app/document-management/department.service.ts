import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  Department,
  Subject,
  Order,
  OrderHistory,
  UserPermission,
  DepartmentAccess,
  UserException,
  EffectivePermissions,
  GrantUserPermissionDto,
  GrantDepartmentAccessDto,
  AddUserExceptionDto,
  SetExpirationDto,
  ArchiveOrderDto,
  ArchivedOrder,
  ExpirationWarning,
} from './department.model';

export type DirectoryUser = {
  id: number;
  code: string;
  email: string;
  name: string;
};

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================== Departments ====================

  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments`);
  }

  getDepartmentById(id: string): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/departments/${id}`);
  }

  addDepartment(department: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}/departments`, department);
  }

  updateDepartment(id: string, department: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.baseUrl}/departments/${id}`, department);
  }

  deleteDepartment(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/departments/${id}`);
  }

  // ==================== Subjects ====================

  getSubjectsByDepartment(departmentId: string): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/departments/${departmentId}/subjects`);
  }

  addSubject(subject: Partial<Subject>): Observable<Subject> {
    return this.http.post<Subject>(`${this.baseUrl}/subjects`, subject);
  }

  updateSubject(id: string, subject: Partial<Subject>): Observable<Subject> {
    return this.http.put<Subject>(`${this.baseUrl}/subjects/${id}`, subject);
  }

  deleteSubject(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/subjects/${id}`);
  }

  // ==================== Orders ====================

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}`);
  }

  getOrdersByType(type: 'incoming' | 'outgoing'): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/type/${type}`);
  }

  getOrdersByDepartment(departmentId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/department/${departmentId}`);
  }

  addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, order);
  }

  updateOrder(id: string, order: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/orders/${id}`, order);
  }

  deleteOrder(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/orders/${id}`);
  }

  // ==================== Order History (NEW) ====================

  getOrderHistory(
    orderId: string,
    pageNumber = 1,
    pageSize = 50
  ): Observable<{
    history: OrderHistory[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<{
      history: OrderHistory[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(`${this.baseUrl}/orders/${orderId}/history`, { params });
  }

  getOrderHistoryCount(orderId: string): Observable<{ orderId: string; historyCount: number }> {
    return this.http.get<{ orderId: string; historyCount: number }>(
      `${this.baseUrl}/orders/${orderId}/history-count`
    );
  }

  // ==================== Permissions Management ====================

  getMyPermissions(orderId: string): Observable<EffectivePermissions> {
    return this.http.get<EffectivePermissions>(`${this.baseUrl}/orders/${orderId}/permissions/my`);
  }

  getOrderUserPermissions(orderId: string): Observable<UserPermission[]> {
    return this.http.get<UserPermission[]>(`${this.baseUrl}/orders/${orderId}/permissions/users`);
  }

  grantUserPermission(orderId: string, dto: GrantUserPermissionDto): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/orders/${orderId}/permissions/user`, dto);
  }

  revokeUserPermission(orderId: string, userId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/orders/${orderId}/permissions/user/${userId}`);
  }

  updateUserPermission(
    orderId: string,
    userId: number,
    dto: GrantUserPermissionDto
  ): Observable<boolean> {
    return this.http.put<boolean>(
      `${this.baseUrl}/orders/${orderId}/permissions/user/${userId}`,
      dto
    );
  }

  // ==================== Department Access ====================

  getOrderDepartmentAccesses(orderId: string): Observable<DepartmentAccess[]> {
    return this.http.get<DepartmentAccess[]>(
      `${this.baseUrl}/orders/${orderId}/permissions/departments`
    );
  }

  grantDepartmentAccess(orderId: string, dto: GrantDepartmentAccessDto): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.baseUrl}/orders/${orderId}/permissions/department`,
      dto
    );
  }

  revokeDepartmentAccess(orderId: string, departmentId: string): Observable<boolean> {
    return this.http.delete<boolean>(
      `${this.baseUrl}/orders/${orderId}/permissions/department/${departmentId}`
    );
  }

  // ==================== User Exceptions ====================

  getOrderUserExceptions(orderId: string): Observable<UserException[]> {
    return this.http.get<UserException[]>(
      `${this.baseUrl}/orders/${orderId}/permissions/user-exceptions`
    );
  }

  addUserException(orderId: string, dto: AddUserExceptionDto): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.baseUrl}/orders/${orderId}/permissions/user-exception`,
      dto
    );
  }

  removeUserException(orderId: string, userId: number): Observable<boolean> {
    return this.http.delete<boolean>(
      `${this.baseUrl}/orders/${orderId}/permissions/user-exception/${userId}`
    );
  }

  getAvailableUsers(): Observable<DirectoryUser[]> {
    return this.http.get<DirectoryUser[]>(`${this.baseUrl}/orders/permissions/available-users`);
  }

  // ==================== Expiration Management ====================

  setExpirationDate(orderId: string, dto: SetExpirationDto): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/orders/${orderId}/expiration`, dto);
  }

  removeExpirationDate(orderId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/orders/${orderId}/expiration`);
  }

  getExpiredOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/expired`);
  }

  getOrdersNearExpiration(days = 7): Observable<Order[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<Order[]>(`${this.baseUrl}/orders/near-expiration`, { params });
  }

  getExpirationWarnings(): Observable<ExpirationWarning[]> {
    return this.http.get<ExpirationWarning[]>(`${this.baseUrl}/orders/expiration-warnings`);
  }

  archiveExpiredOrders(): Observable<{ message: string; count: number }> {
    return this.http.post<{ message: string; count: number }>(
      `${this.baseUrl}/orders/archive-expired`,
      {}
    );
  }

  // ==================== Archive Management ====================

  archiveOrder(orderId: string, dto: ArchiveOrderDto): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/orders/${orderId}/archive`, dto);
  }

  getArchivedOrders(): Observable<ArchivedOrder[]> {
    return this.http.get<ArchivedOrder[]>(`${this.baseUrl}/orders/archived`);
  }

  restoreArchivedOrder(archivedOrderId: number): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.baseUrl}/orders/archived/${archivedOrderId}/restore`,
      {}
    );
  }

  permanentlyDeleteArchivedOrder(archivedOrderId: number): Observable<boolean> {
    return this.http.delete<boolean>(
      `${this.baseUrl}/orders/archived/${archivedOrderId}/permanent`
    );
  }

  // ==================== Attachments ====================

  uploadAttachment(orderId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderId', orderId);
    return this.http.post(`${this.baseUrl}/orders/${orderId}/attachments`, formData);
  }

  deleteAttachment(orderId: string, attachmentId: string): Observable<boolean> {
    return this.http.delete<boolean>(
      `${this.baseUrl}/orders/${orderId}/attachments/${attachmentId}`
    );
  }

  // ==================== Dashboard Stats ====================

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders/dashboard/stats`);
  }

  // ==================== Helper Methods ====================

  canViewOrder(orderId: string): Observable<boolean> {
    return this.getMyPermissions(orderId).pipe(map((permissions) => permissions.canView));
  }

  canEditOrder(orderId: string): Observable<boolean> {
    return this.getMyPermissions(orderId).pipe(map((permissions) => permissions.canEdit));
  }

  canDeleteOrder(orderId: string): Observable<boolean> {
    return this.getMyPermissions(orderId).pipe(map((permissions) => permissions.canDelete));
  }
}