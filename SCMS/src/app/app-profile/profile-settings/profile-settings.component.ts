import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class ProfileSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' }
  ];
  themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
  ];

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      language: ['en'],
      theme: ['light'],
      emailNotifications: [true],
      pushNotifications: [true],
      smsNotifications: [false],
      twoFactorAuth: [false]
    });
  }

  ngOnInit(): void {
    // Load settings data and populate form
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      // Handle form submission
      console.log(this.settingsForm.value);
    }
  }
} 