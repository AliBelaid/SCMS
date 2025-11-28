import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-notifications',
  templateUrl: './profile-notifications.component.html',
  styleUrls: ['./profile-notifications.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class ProfileNotificationsComponent implements OnInit {
  notificationsForm: FormGroup;
  notificationTypes = [
    { value: 'all', label: 'All Notifications' },
    { value: 'important', label: 'Important Only' },
    { value: 'none', label: 'None' }
  ];

  constructor(private fb: FormBuilder) {
    this.notificationsForm = this.fb.group({
      emailNotifications: [true],
      pushNotifications: [true],
      smsNotifications: [false],
      notificationType: ['all'],
      appointmentReminders: [true],
      prescriptionUpdates: [true],
      testResults: [true],
      billingUpdates: [true],
      marketingEmails: [false]
    });
  }

  ngOnInit(): void {
    // Load notification settings and populate form
  }

  onSubmit(): void {
    if (this.notificationsForm.valid) {
      // Handle form submission
      console.log(this.notificationsForm.value);
    }
  }
} 