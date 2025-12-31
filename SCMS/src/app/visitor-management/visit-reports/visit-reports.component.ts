import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface VisitSummary {
  totalVisits: number;
  totalCompleted: number;
  totalOngoing: number;
  visitsPerDepartment: DepartmentVisitCount[];
  visitsPerUser: UserVisitCount[];
}

interface DepartmentVisitCount {
  departmentId: number;
  departmentName: string;
  visitCount: number;
}

interface UserVisitCount {
  userId: number;
  userName: string;
  visitCount: number;
}

interface DailyStats {
  date: string;
  total: number;
  completed: number;
  ongoing: number;
  incomplete: number;
}

@Component({
  selector: 'app-visit-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './visit-reports.component.html',
  styleUrls: ['./visit-reports.component.scss']
})
export class VisitReportsComponent implements OnInit {
  isLoading = false;
  summary: VisitSummary | null = null;
  dailyStats: DailyStats[] = [];
  
  fromDate: Date = new Date(new Date().setDate(new Date().getDate() - 7));
  toDate: Date = new Date();

  departmentColumns = ['departmentName', 'visitCount'];
  userColumns = ['userName', 'visitCount'];
  dailyColumns = ['date', 'total', 'completed', 'ongoing'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    
    const fromDateStr = this.formatDate(this.fromDate);
    const toDateStr = this.formatDate(this.toDate);

    // Load summary report
    this.http.get<VisitSummary>(
      `${environment.apiUrl}/VisitReports/summary?fromDate=${fromDateStr}&toDate=${toDateStr}`
    ).subscribe({
      next: (data) => {
        this.summary = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading summary:', error);
        this.isLoading = false;
      }
    });

    // Load daily stats
    this.http.get<DailyStats[]>(
      `${environment.apiUrl}/VisitReports/daily-stats?days=7`
    ).subscribe({
      next: (data) => {
        this.dailyStats = data;
      },
      error: (error) => {
        console.error('Error loading daily stats:', error);
      }
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  refresh(): void {
    this.loadReports();
  }
}

