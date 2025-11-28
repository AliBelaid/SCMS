import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-insurance-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule
  ],
  template: `
    <div class="navigation-container">
      <h2>Insurance Navigation Diagnostics</h2>
      
      <mat-list>
        <mat-list-item>
          <button mat-raised-button color="primary" (click)="navigateTo('/app/insurance/company/dashboard')">
            Company Dashboard
          </button>
        </mat-list-item>
        <mat-list-item>
          <button mat-raised-button color="primary" (click)="navigateTo('/app/insurance/companies')">
            Companies List
          </button>
        </mat-list-item>
        <mat-list-item>
          <button mat-raised-button color="primary" (click)="navigateTo('/app/insurance/claims')">
            Claims
          </button>
        </mat-list-item>
        <mat-list-item>
          <button mat-raised-button color="primary" (click)="navigateTo('/app/insurance/contracts')">
            Contracts
          </button>
        </mat-list-item>
        <mat-list-item>
          <button mat-raised-button color="primary" (click)="navigateTo('/app/insurance/icd10')">
            ICD10
          </button>
        </mat-list-item>
      </mat-list>

      <div class="current-route">
        <h3>Current Route Diagnostics:</h3>
        <pre>{{ currentRoute }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .navigation-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    .current-route {
      margin-top: 20px;
      background-color: #f0f0f0;
      padding: 15px;
      border-radius: 5px;
    }

    mat-list-item {
      margin-bottom: 10px;
    }

    button {
      width: 100%;
    }
  `]
})
export class InsuranceNavigationComponent implements OnInit {
  currentRoute = 'No route selected';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  navigateTo(route: string): void {
    try {
      this.router.navigate([route]).then(
        success => console.log(`Navigation to ${route} successful`),
        error => console.error(`Navigation to ${route} failed`, error)
      );
    } catch (err) {
      console.error('Navigation error:', err);
    }
  }
}
