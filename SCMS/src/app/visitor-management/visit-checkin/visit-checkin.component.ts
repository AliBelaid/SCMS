import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-visit-checkin',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div style="margin-top: 70px; padding: 20px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>login</mat-icon>
            تسجيل دخول زائر
          </mat-card-title>
        </mat-card-header>
        <mat-card-content style="text-align: center; padding: 60px;">
          <mat-icon style="font-size: 100px; height: 100px; width: 100px; color: #ccc;">construction</mat-icon>
          <h2>قيد الإنشاء</h2>
          <p>هذه الميزة قيد التطوير</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class VisitCheckinComponent {}

