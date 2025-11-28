import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';

export interface LoadingDialogData {
  message?: string;
  title?: string;
}

@Component({
  selector: 'app-loading-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  template: `
    <div class="p-6 text-center">
      <h2 mat-dialog-title>{{ data.title || ('LOADING' | translate) }}</h2>
      <div mat-dialog-content>
        <mat-spinner diameter="50"></mat-spinner>
        <p class="mt-4">{{ data.message || ('PLEASE_WAIT' | translate) }}</p>
      </div>
    </div>
  `,
  styles: [`
    .p-6 { padding: 1.5rem; }
    .text-center { text-align: center; }
    .mt-4 { margin-top: 1rem; }
  `]
})
export class LoadingDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LoadingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LoadingDialogData
  ) {}
}