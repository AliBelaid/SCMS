import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="list-container">
      <div class="header">
        <h1>Notifications</h1>
        <button mat-raised-button color="primary">
          <mat-icon>add</mat-icon>
          Add New
        </button>
      </div>

      <div class="filters-section">
        <form [formGroup]="filterForm" class="filters">
          <mat-form-field>
            <mat-label>Search</mat-label>
            <input matInput formControlName="search" placeholder="Search...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="">All</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </div>

      <div class="table-container">
        <table mat-table [dataSource]="data" class="data-table">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let item">{{item.id}}</td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let item">{{item.name}}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let item">{{item.status}}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let item">
              <button mat-icon-button><mat-icon>edit</mat-icon></button>
              <button mat-icon-button><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 25]"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .page-container, .dashboard-container, .list-container, .form-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #1976d2;
    }
    .filters {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      align-items: center;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .data-table {
      width: 100%;
    }
  `]
})
export class UserNotificationsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'status', 'actions'];
  data: any[] = [];
  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      search: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    console.log('Loading Notifications data...');
  }
}