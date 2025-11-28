import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show a success notification
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 3000)
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Show an error notification
   * @param message The error message to display
   * @param duration Duration in milliseconds (default: 5000)
   */
  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Show an info notification
   * @param message The info message to display
   * @param duration Duration in milliseconds (default: 3000)
   */
  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Show a warning notification
   * @param message The warning message to display
   * @param duration Duration in milliseconds (default: 4000)
   */
  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
} 