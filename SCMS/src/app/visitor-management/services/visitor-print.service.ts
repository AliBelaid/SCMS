import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environments/environment';
import { Visit, VisitorBadge } from '../models/visitor-management.model';

@Injectable({
  providedIn: 'root'
})
export class VisitorPrintService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================== Badge Printing ====================

  /**
   * Print visitor badge
   */
  printVisitorBadge(visit: Visit): void {
    const badge: VisitorBadge = {
      visitNumber: visit.visitNumber,
      visitorName: visit.visitorName,
      department: visit.departmentName,
      employeeToVisit: visit.employeeToVisit,
      checkInTime: visit.checkInAt,
      validUntil: visit.expectedDurationHours
        ? new Date(
            new Date(visit.checkInAt).getTime() +
              visit.expectedDurationHours * 60 * 60 * 1000
          )
        : undefined,
      qrCode: this.generateQRCodeData(visit.visitNumber),
      photoUrl: undefined
    };

    this.printBadgeHTML(badge);
  }

  /**
   * Get badge from API and print
   */
  printBadgeFromAPI(visitNumber: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/Visits/${visitNumber}/badge`, {
      responseType: 'blob'
    });
  }

  /**
   * Download badge as PDF
   */
  downloadBadge(visitNumber: string, filename?: string): void {
    this.printBadgeFromAPI(visitNumber).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `badge-${visitNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: error => console.error('Error downloading badge:', error)
    });
  }

  // ==================== HTML Badge Generation ====================

  /**
   * Generate and print badge HTML
   */
  private printBadgeHTML(badge: VisitorBadge): void {
    const badgeHTML = this.generateBadgeHTML(badge);
    const printWindow = window.open('', '_blank', 'width=400,height=600');

    if (!printWindow) {
      console.error('Could not open print window');
      return;
    }

    printWindow.document.write(badgeHTML);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }

  /**
   * Generate badge HTML template
   */
  private generateBadgeHTML(badge: VisitorBadge): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>بطاقة زائر - ${badge.visitNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }

          .badge {
            width: 350px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 30px;
            color: white;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
          }

          .badge::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          }

          .badge-header {
            text-align: center;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
          }

          .badge-logo {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }

          .badge-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
          }

          .badge-subtitle {
            font-size: 14px;
            opacity: 0.9;
          }

          .badge-photo {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            margin: 0 auto 20px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 1;
          }

          .badge-photo img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }

          .badge-photo-placeholder {
            font-size: 60px;
            color: #667eea;
          }

          .badge-content {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
            position: relative;
            z-index: 1;
          }

          .badge-field {
            margin-bottom: 15px;
          }

          .badge-field:last-child {
            margin-bottom: 0;
          }

          .badge-field-label {
            font-size: 12px;
            opacity: 0.8;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .badge-field-value {
            font-size: 18px;
            font-weight: 600;
          }

          .badge-visit-number {
            font-size: 24px !important;
            font-weight: 700;
            text-align: center;
            background: rgba(255, 255, 255, 0.2);
            padding: 10px;
            border-radius: 10px;
            margin-bottom: 15px;
            letter-spacing: 2px;
          }

          .badge-qr {
            text-align: center;
            margin-top: 20px;
            padding: 15px;
            background: white;
            border-radius: 10px;
          }

          .badge-qr img {
            width: 120px;
            height: 120px;
          }

          .badge-footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            opacity: 0.8;
            position: relative;
            z-index: 1;
          }

          .badge-valid {
            background: rgba(67, 233, 123, 0.3);
            padding: 8px 15px;
            border-radius: 20px;
            display: inline-block;
            margin-top: 15px;
            font-size: 11px;
            font-weight: 600;
          }

          @media print {
            body {
              background: white;
            }

            .badge {
              box-shadow: none;
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="badge">
          <div class="badge-header">
            <div class="badge-logo">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="#667eea">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            <h1 class="badge-title">بطاقة زائر</h1>
            <p class="badge-subtitle">Visitor Badge</p>
          </div>

          ${badge.photoUrl ? `
            <div class="badge-photo">
              <img src="${badge.photoUrl}" alt="${badge.visitorName}">
            </div>
          ` : `
            <div class="badge-photo">
              <span class="badge-photo-placeholder">👤</span>
            </div>
          `}

          <div class="badge-content">
            <div class="badge-visit-number">${badge.visitNumber}</div>

            <div class="badge-field">
              <div class="badge-field-label">اسم الزائر</div>
              <div class="badge-field-value">${badge.visitorName}</div>
            </div>

            ${badge.company ? `
              <div class="badge-field">
                <div class="badge-field-label">الشركة</div>
                <div class="badge-field-value">${badge.company}</div>
              </div>
            ` : ''}

            <div class="badge-field">
              <div class="badge-field-label">الإدارة</div>
              <div class="badge-field-value">${badge.department}</div>
            </div>

            <div class="badge-field">
              <div class="badge-field-label">الموظف المطلوب</div>
              <div class="badge-field-value">${badge.employeeToVisit}</div>
            </div>

            <div class="badge-field">
              <div class="badge-field-label">وقت الدخول</div>
              <div class="badge-field-value">${this.formatTime(badge.checkInTime)}</div>
            </div>

            ${badge.validUntil ? `
              <div class="badge-valid">
                صالحة حتى: ${this.formatTime(badge.validUntil)}
              </div>
            ` : ''}
          </div>

          ${badge.qrCode ? `
            <div class="badge-qr">
              <img src="${badge.qrCode}" alt="QR Code">
            </div>
          ` : ''}

          <div class="badge-footer">
            <p>نظام إدارة الزوار</p>
            <p>Visitor Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ==================== QR Code Generation ====================

  /**
   * Generate QR code data URL
   */
  private generateQRCodeData(visitNumber: string): string {
    // Using a simple QR code generator API
    // In production, use a proper QR code library like qrcode.js
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      visitNumber
    )}`;
  }

  // ==================== Document Printing ====================

  /**
   * Print visit details
   */
  printVisitDetails(visit: Visit): void {
    const detailsHTML = this.generateVisitDetailsHTML(visit);
    this.printHTML(detailsHTML, `تفاصيل الزيارة - ${visit.visitNumber}`);
  }

  /**
   * Generate visit details HTML
   */
  private generateVisitDetailsHTML(visit: Visit): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; padding: 40px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #667eea; margin-bottom: 10px;">تفاصيل الزيارة</h1>
          <h2 style="color: #666; font-weight: 400;">${visit.visitNumber}</h2>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 15px; background: #f5f7fa; font-weight: 600; width: 30%;">اسم الزائر</td>
            <td style="padding: 15px; border: 1px solid #e0e0e0;">${visit.visitorName}</td>
          </tr>
          <tr>
            <td style="padding: 15px; background: #f5f7fa; font-weight: 600;">الإدارة</td>
            <td style="padding: 15px; border: 1px solid #e0e0e0;">${visit.departmentName}</td>
          </tr>
          <tr>
            <td style="padding: 15px; background: #f5f7fa; font-weight: 600;">الموظف المطلوب</td>
            <td style="padding: 15px; border: 1px solid #e0e0e0;">${visit.employeeToVisit}</td>
          </tr>
          ${
            visit.visitReason
              ? `
          <tr>
            <td style="padding: 15px; background: #f5f7fa; font-weight: 600;">سبب الزيارة</td>
            <td style="padding: 15px; border: 1px solid #e0e0e0;">${visit.visitReason}</td>
          </tr>
          `
              : ''
          }
          <tr>
            <td style="padding: 15px; background: #f5f7fa; font-weight: 600;">وقت الدخول</td>
            <td style="padding: 15px; border: 1px solid #e0e0e0;">${this.formatDateTime(
              visit.checkInAt
            )}</td>
          </tr>
          ${
            visit.checkOutAt
              ? `
          <tr>
            <td style="padding: 15px; background: #f5f7fa; font-weight: 600;">وقت الخروج</td>
            <td style="padding: 15px; border: 1px solid #e0e0e0;">${this.formatDateTime(
              visit.checkOutAt
            )}</td>
          </tr>
          `
              : ''
          }
          ${
            visit.carPlate
              ? `
          <tr>
            <td style="padding: 15px; background: #f5f7fa; font-weight: 600;">رقم السيارة</td>
            <td style="padding: 15px; border: 1px solid #e0e0e0;">${visit.carPlate}</td>
          </tr>
          `
              : ''
          }
          <tr>
            <td style="padding: 15px; background: #f5f7fa; font-weight: 600;">الحالة</td>
            <td style="padding: 15px; border: 1px solid #e0e0e0;">${this.getStatusLabel(
              visit.status
            )}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 40px; color: #999; font-size: 14px;">
          <p>طُبع بتاريخ: ${this.formatDateTime(new Date())}</p>
          <p style="margin-top: 10px;">نظام إدارة الزوار</p>
        </div>
      </div>
    `;
  }

  /**
   * Generic print HTML method
   */
  private printHTML(html: string, title: string = 'طباعة'): void {
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      console.error('Could not open print window');
      return;
    }

    const fullHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @media print {
            @page {
              margin: 20mm;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    printWindow.document.write(fullHTML);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }

  // ==================== Format Helpers ====================

  private formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

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

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ongoing: 'جارية',
      completed: 'مكتملة',
      incomplete: 'غير مكتملة',
      cancelled: 'ملغاة'
    };
    return labels[status] || status;
  }
}

