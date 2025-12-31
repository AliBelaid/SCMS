import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environments/environment';
import {
  VisitReport,
  ReportType,
  TimePeriod,
  VisitFilters,
  ExportOptions,
  ExportFormat,
  Visit,
  DashboardStats,
  HourlyDistribution,
  VisitStatus
} from '../models/visitor-management.model';

@Injectable({
  providedIn: 'root'
})
export class VisitorReportService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================== Report Generation ====================

  /**
   * Generate comprehensive visit report
   */
  generateReport(
    reportType: ReportType,
    dateFrom: Date,
    dateTo: Date,
    filters?: VisitFilters
  ): Observable<VisitReport> {
    const body = {
      reportType,
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      filters: filters || {}
    };

    return this.http.post<VisitReport>(
      `${this.apiUrl}/Visits/reports/generate`,
      body
    );
  }

  /**
   * Generate daily report
   */
  generateDailyReport(date: Date, filters?: VisitFilters): Observable<VisitReport> {
    const dateFrom = new Date(date);
    dateFrom.setHours(0, 0, 0, 0);
    const dateTo = new Date(date);
    dateTo.setHours(23, 59, 59, 999);

    return this.generateReport(ReportType.Daily, dateFrom, dateTo, filters);
  }

  /**
   * Generate weekly report
   */
  generateWeeklyReport(startDate: Date, filters?: VisitFilters): Observable<VisitReport> {
    const dateFrom = new Date(startDate);
    const dateTo = new Date(startDate);
    dateTo.setDate(dateTo.getDate() + 6);

    return this.generateReport(ReportType.Weekly, dateFrom, dateTo, filters);
  }

  /**
   * Generate monthly report
   */
  generateMonthlyReport(
    year: number,
    month: number,
    filters?: VisitFilters
  ): Observable<VisitReport> {
    const dateFrom = new Date(year, month, 1);
    const dateTo = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return this.generateReport(ReportType.Monthly, dateFrom, dateTo, filters);
  }

  /**
   * Generate custom report
   */
  generateCustomReport(
    dateFrom: Date,
    dateTo: Date,
    filters?: VisitFilters
  ): Observable<VisitReport> {
    return this.generateReport(ReportType.Custom, dateFrom, dateTo, filters);
  }

  // ==================== Export Reports ====================

  /**
   * Export visits to Excel
   */
  exportToExcel(
    visits: Visit[],
    filename: string = 'visits-report',
    filters?: VisitFilters
  ): Observable<Blob> {
    const options: ExportOptions = {
      format: ExportFormat.Excel,
      includeHeaders: true,
      includeStats: true,
      filters: filters,
      columns: [
        'visitNumber',
        'visitorName',
        'departmentName',
        'employeeToVisit',
        'checkInAt',
        'checkOutAt',
        'status',
        'carPlate'
      ]
    };

    return this.http.post(
      `${this.apiUrl}/Visits/export/excel`,
      options,
      { responseType: 'blob' }
    );
  }

  /**
   * Export visits to PDF
   */
  exportToPDF(
    visits: Visit[],
    filename: string = 'visits-report',
    filters?: VisitFilters
  ): Observable<Blob> {
    const options: ExportOptions = {
      format: ExportFormat.PDF,
      includeHeaders: true,
      includeStats: true,
      filters: filters
    };

    return this.http.post(
      `${this.apiUrl}/Visits/export/pdf`,
      options,
      { responseType: 'blob' }
    );
  }

  /**
   * Export visits to CSV
   */
  exportToCSV(
    visits: Visit[],
    filename: string = 'visits-report',
    filters?: VisitFilters
  ): Observable<Blob> {
    const options: ExportOptions = {
      format: ExportFormat.CSV,
      includeHeaders: true,
      includeStats: false,
      filters: filters
    };

    return this.http.post(
      `${this.apiUrl}/Visits/export/csv`,
      options,
      { responseType: 'blob' }
    );
  }

  /**
   * Export visits to JSON
   */
  exportToJSON(visits: Visit[], filename: string = 'visits-report'): void {
    const dataStr = JSON.stringify(visits, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    this.downloadBlob(dataBlob, `${filename}.json`);
  }

  // ==================== Download Helpers ====================

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

  /**
   * Download report with auto-naming
   */
  downloadReport(
    blob: Blob,
    reportType: ReportType,
    format: ExportFormat,
    dateFrom?: Date,
    dateTo?: Date
  ): void {
    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `visits-${reportType}-${timestamp}`;

    if (dateFrom && dateTo) {
      const from = dateFrom.toISOString().split('T')[0];
      const to = dateTo.toISOString().split('T')[0];
      filename = `visits-${from}-to-${to}`;
    }

    const extension = this.getFileExtension(format);
    this.downloadBlob(blob, `${filename}.${extension}`);
  }

  private getFileExtension(format: ExportFormat): string {
    const extensions: Record<ExportFormat, string> = {
      [ExportFormat.Excel]: 'xlsx',
      [ExportFormat.PDF]: 'pdf',
      [ExportFormat.CSV]: 'csv',
      [ExportFormat.JSON]: 'json'
    };
    return extensions[format];
  }

  // ==================== Statistics Reports ====================

  /**
   * Generate statistics summary
   */
  generateStatsSummary(visits: Visit[]): DashboardStats {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const completed = visits.filter(v => {
      const status = String(v.status).toLowerCase();
      return status === 'checkedout' || status === 'completed' || v.status === VisitStatus.CheckedOut;
    });
    const ongoing = visits.filter(v => {
      const status = String(v.status).toLowerCase();
      return status === 'checkedin' || status === 'ongoing' || v.status === VisitStatus.CheckedIn;
    });
    const todayVisits = visits.filter(v => new Date(v.checkInAt) >= today);
    const weekVisits = visits.filter(v => new Date(v.checkInAt) >= weekAgo);
    const monthVisits = visits.filter(v => new Date(v.checkInAt) >= monthAgo);

    // Calculate average duration
    let totalDuration = 0;
    let completedCount = 0;

    completed.forEach(visit => {
      if (visit.checkOutAt) {
        const duration =
          new Date(visit.checkOutAt).getTime() - new Date(visit.checkInAt).getTime();
        totalDuration += duration;
        completedCount++;
      }
    });

    const averageDurationMinutes =
      completedCount > 0 ? Math.round(totalDuration / completedCount / 60000) : 0;

    // Visits per department
    const departmentMap = new Map<number, { name: string; count: number }>();

    visits.forEach(visit => {
      const existing = departmentMap.get(visit.departmentId);
      if (existing) {
        existing.count++;
      } else {
        departmentMap.set(visit.departmentId, {
          name: visit.departmentName,
          count: 1
        });
      }
    });

    const visitsPerDepartment = Array.from(departmentMap.values()).map(dept => ({
      departmentId: 0,
      departmentName: dept.name,
      visitCount: dept.count,
      percentage: (dept.count / visits.length) * 100
    }));

    return {
      totalVisits: visits.length,
      totalCompleted: completed.length,
      totalOngoing: ongoing.length,
      todayVisits: todayVisits.length,
      weekVisits: weekVisits.length,
      monthVisits: monthVisits.length,
      visitsPerDepartment,
      visitsPerUser: [],
      averageDurationMinutes
    };
  }

  /**
   * Generate hourly distribution
   */
  generateHourlyDistribution(visits: Visit[]): HourlyDistribution[] {
    const distribution: HourlyDistribution[] = [];
    const hourCounts = new Map<number, number>();

    // Count visits per hour
    visits.forEach(visit => {
      const hour = new Date(visit.checkInAt).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    // Generate distribution for working hours (8 AM - 6 PM)
    for (let hour = 8; hour <= 18; hour++) {
      const count = hourCounts.get(hour) || 0;
      distribution.push({
        hour: `${hour}:00`,
        count,
        percentage: visits.length > 0 ? (count / visits.length) * 100 : 0
      });
    }

    return distribution;
  }

  // ==================== Print Reports ====================

  /**
   * Print report
   */
  printReport(reportHtml: string, title: string = 'Visit Report'): void {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      console.error('Could not open print window');
      return;
    }

    const styles = `
      <style>
        @media print {
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            margin: 20px;
          }
          h1 { 
            color: #667eea;
            text-align: center;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: right;
          }
          th {
            background-color: #667eea;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          ${styles}
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          ${reportHtml}
          <div class="footer">
            <p>نظام إدارة الزوار - اللجنة الفنية العليا 2025-2026</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }

  /**
   * Generate printable HTML for visits
   */
  generatePrintableHTML(visits: Visit[]): string {
    let html = '<table><thead><tr>';
    html += '<th>رقم الزيارة</th>';
    html += '<th>اسم الزائر</th>';
    html += '<th>الإدارة</th>';
    html += '<th>الموظف المطلوب</th>';
    html += '<th>وقت الدخول</th>';
    html += '<th>وقت الخروج</th>';
    html += '<th>الحالة</th>';
    html += '</tr></thead><tbody>';

    visits.forEach(visit => {
      html += '<tr>';
      html += `<td>${visit.visitNumber}</td>`;
      html += `<td>${visit.visitorName}</td>`;
      html += `<td>${visit.departmentName}</td>`;
      html += `<td>${visit.employeeToVisit}</td>`;
      html += `<td>${this.formatDateTime(visit.checkInAt)}</td>`;
      html += `<td>${visit.checkOutAt ? this.formatDateTime(visit.checkOutAt) : '-'}</td>`;
      html += `<td>${this.getStatusLabel(visit.status)}</td>`;
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  }

  // ==================== Format Helpers ====================

  private formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getStatusLabel(status: string | VisitStatus): string {
    const statusStr = String(status);
    const statusLower = statusStr?.toLowerCase() || '';
    switch (statusLower) {
      case 'checkedin':
      case 'ongoing': // Legacy support
        return 'جارية';
      case 'checkedout':
      case 'completed': // Legacy support
        return 'مكتملة';
      case 'rejected':
      case 'incomplete': // Legacy support
        return 'مرفوضة';
      case 'cancelled':
        return 'ملغاة';
      default:
        return statusStr || 'غير معروف';
    }
  }

  // ==================== Report Templates ====================

  /**
   * Get report template by type
   */
  getReportTemplate(reportType: ReportType): string {
    const templates: Record<ReportType, string> = {
      [ReportType.Daily]: 'تقرير يومي - الزيارات',
      [ReportType.Weekly]: 'تقرير أسبوعي - الزيارات',
      [ReportType.Monthly]: 'تقرير شهري - الزيارات',
      [ReportType.Custom]: 'تقرير مخصص - الزيارات'
    };
    return templates[reportType];
  }
}

