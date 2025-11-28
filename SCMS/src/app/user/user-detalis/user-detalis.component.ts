import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { take } from "rxjs";
import { fadeInRight400ms } from "src/@vex/animations/fade-in-right.animation";
import { fadeInUp400ms } from "src/@vex/animations/fade-in-up.animation";
import { scaleIn400ms } from "src/@vex/animations/scale-in.animation";
import { stagger40ms } from "src/@vex/animations/stagger.animation";
import { UserService } from "../user.service";
import { TranslateService } from "@ngx-translate/core";
import { UserProfileDialogComponent } from "../user-profile-dialog/user-profile-dialog.component";
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/assets/environments/environment';
import { IUserNew } from 'src/assets/user';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';

interface TechnicianStats {
  totalPatients: number;
  totalRevenue: number;
  completedServices: number;
  pendingAmount: number;
}

interface Activity {
  type: 'appointment' | 'payment' | 'system';
  title: string;
  description: string;
  date: Date;
}

@Component({
  selector: "vex-user-detalis",
  templateUrl: "./user-detalis.component.html",
  styleUrls: ["./user-detalis.component.scss"],
  animations: [fadeInUp400ms, fadeInRight400ms, scaleIn400ms, stagger40ms],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    TranslateModule
  ]
})
export class UserDetalisComponent implements OnInit {
  user: IUserNew;
  isLoading = true;
  error: string | null = null;
  technicianStats: TechnicianStats | null = null;
  recentActivity: Activity[] = [];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    public userService: UserService,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.loadUserData();
  }

  loadUserData() {
    this.isLoading = true;
    this.error = null;

    this.userService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          
          // If the user is a technician, load their stats
          if (this.isTechnician()) {
            this.loadTechnicianStats();
            this.loadRecentActivity();
          }
          
          this.isLoading = false;
        } else {
          this.error = 'User data not found';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading user data:', err);
        this.error = 'Error loading user data';
        this.isLoading = false;
      }
    });
  }

  openContact() {
    const dialogRef = this.dialog.open(UserProfileDialogComponent, {
      width: '800px',
      data: this.user,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUserData();
      }
    });
  }

  calculateDaysSinceJoined(): number {
    if (!this.user?.created) return 0;
    
    const createdDate = new Date(this.user.created);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  isTechnician(): boolean {
    return this.user?.roles?.includes('MedicalTechnician') || false;
  }

  loadTechnicianStats() {
    if (!this.user?.id) return;
    
    // TODO: Implement technician stats loading from appropriate service
    // For now, set default values
    this.technicianStats = {
      totalPatients: 0,
      totalRevenue: 0,
      completedServices: 0,
      pendingAmount: 0
    };
  }

  loadRecentActivity() {
    if (!this.user?.id) return;

    // Try to load activity from API
    this.http.get<Activity[]>(`${environment.apiUrl}/queue/technician-activity/${this.user.id}`).subscribe({
      next: (activities) => {
        this.recentActivity = activities;
      },
      error: (err) => {
        console.error('Error loading recent activity:', err);
        // Provide some mock data as fallback
        this.recentActivity = [
          {
            type: 'appointment',
            title: 'Patient Appointment',
            description: 'Completed service for patient',
            date: new Date()
          }
        ];
      }
    });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'appointment':
        return 'mat:event';
      case 'payment':
        return 'mat:payments';
      case 'system':
        return 'mat:info';
      default:
        return 'mat:info';
    }
  }

  ngOnInit(): void {
    this.loadUserData();
  }
}
