import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/assets/environments/environment';
import {
  HCPCSCode,
  HCPCSListResponse,
  HCPCSQueryParams,
  HCPCSCreateDto,
  HCPCSImportResult,
  HCPCSBulkDeleteRequest,
  HCPCSStatistics
} from '../models/hcpcs.models';

@Injectable({
  providedIn: 'root'
})
export class HCPCSService {
  private readonly API_BASE = `${environment.apiUrl}/hcpcs`;
  
  // Cache for statistics
  private statisticsSubject = new BehaviorSubject<HCPCSStatistics | null>(null);
  public statistics$ = this.statisticsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ==================== LIST & SEARCH ====================

  /**
   * Get paginated list of HCPCS codes
   */
  getHCPCSList(params: HCPCSQueryParams): Observable<HCPCSListResponse> {
    let httpParams = new HttpParams();
    
    if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

    return this.http.get<HCPCSListResponse>(this.API_BASE, { params: httpParams });
  }

  /**
   * Search HCPCS codes by term (lighter endpoint for autocomplete)
   */
  searchHCPCS(searchTerm: string, limit: number = 20): Observable<HCPCSCode[]> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('limit', limit.toString());
    
    return this.http.get<HCPCSCode[]>(`${this.API_BASE}/search`, { params });
  }

  /**
   * Get HCPCS by code
   */
  getByCode(code: string): Observable<HCPCSCode> {
    return this.http.get<HCPCSCode>(`${this.API_BASE}/code/${code}`);
  }

  /**
   * Get HCPCS by ID
   */
  getById(id: string): Observable<HCPCSCode> {
    return this.http.get<HCPCSCode>(`${this.API_BASE}/${id}`);
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * Create new HCPCS code
   */
  create(hcpcs: HCPCSCreateDto): Observable<HCPCSCode> {
    return this.http.post<HCPCSCode>(this.API_BASE, hcpcs).pipe(
      tap(() => this.refreshStatistics())
    );
  }

  /**
   * Update existing HCPCS code
   */
  update(id: string, hcpcs: HCPCSCreateDto): Observable<HCPCSCode> {
    return this.http.put<HCPCSCode>(`${this.API_BASE}/${id}`, hcpcs).pipe(
      tap(() => this.refreshStatistics())
    );
  }

  /**
   * Delete HCPCS code
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/${id}`).pipe(
      tap(() => this.refreshStatistics())
    );
  }

  /**
   * Bulk delete HCPCS codes
   */
  bulkDelete(ids: string[]): Observable<void> {
    const request: HCPCSBulkDeleteRequest = { ids };
    return this.http.post<void>(`${this.API_BASE}/bulk-delete`, request).pipe(
      tap(() => this.refreshStatistics())
    );
  }

  /**
   * Toggle active status
   */
  toggleActive(id: string): Observable<HCPCSCode> {
    return this.http.patch<HCPCSCode>(`${this.API_BASE}/${id}/toggle-active`, {}).pipe(
      tap(() => this.refreshStatistics())
    );
  }

  // ==================== EXCEL IMPORT ====================

  /**
   * Import HCPCS codes from Excel file
   */
  importFromExcel(file: File, overwriteExisting: boolean = false): Observable<HCPCSImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('overwriteExisting', overwriteExisting.toString());

    return this.http.post<HCPCSImportResult>(`${this.API_BASE}/import`, formData).pipe(
      tap(() => this.refreshStatistics())
    );
  }

  /**
   * Download Excel template
   */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.API_BASE}/template`, {
      responseType: 'blob'
    });
  }

  /**
   * Export HCPCS codes to Excel
   */
  exportToExcel(params?: HCPCSQueryParams): Observable<Blob> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
    }

    return this.http.get(`${this.API_BASE}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  // ==================== STATISTICS ====================

  /**
   * Get HCPCS statistics
   */
  getStatistics(): Observable<HCPCSStatistics> {
    return this.http.get<HCPCSStatistics>(`${this.API_BASE}/statistics`).pipe(
      tap(stats => this.statisticsSubject.next(stats))
    );
  }

  /**
   * Refresh statistics
   */
  refreshStatistics(): void {
    this.getStatistics().subscribe();
  }

  // ==================== CATEGORIES ====================

  /**
   * Get all unique categories
   */
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_BASE}/categories`);
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Validate HCPCS code format
   */
  validateCode(code: string): boolean {
    // HCPCS codes are alphanumeric, typically 5 characters (e.g., A0001, J1234)
    const hcpcsPattern = /^[A-Z]\d{4}$/;
    return hcpcsPattern.test(code);
  }

  /**
   * Parse Excel file locally (client-side validation)
   */
  async parseExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          // This is a simplified version - you'll need xlsx library
          // npm install xlsx
          // import * as XLSX from 'xlsx';
          
          const data = e.target.result;
          // const workbook = XLSX.read(data, { type: 'binary' });
          // const sheetName = workbook.SheetNames[0];
          // const worksheet = workbook.Sheets[sheetName];
          // const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // For now, returning empty array - implement with xlsx library
          resolve([]);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}