import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  success(title: string, message: string): void {
    this.toastr.success(message, title);
  }

  error(title: string, message: string): void {
    this.toastr.error(message, title);
  }

  warning(title: string, message: string): void {
    this.toastr.warning(message, title);
  }

  info(title: string, message: string): void {
    this.toastr.info(message, title);
  }
} 