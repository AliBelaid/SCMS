// src/app/pages/apps/users/users-profile/users-profile.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/assets/services/auth.service';
import { User } from 'src/assets/models/medical-provider.model';
 
@Component({
  standalone: true,
  selector: 'app-users-profile',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-wrap">
      <div class="profile-header">
        <div class="avatar" [title]="initials()">{{ initials() }}</div>
        <div class="meta">
          <h1>{{ user()?.firstName }} {{ user()?.lastName }}</h1>
          <p class="email">{{ user()?.email }}</p>
          <div class="badges">
            <span class="badge" *ngFor="let r of user()?.roles">{{ roleLabel(r) }}</span>
          </div>
        </div>
        <div class="actions">
          <label class="btn">
            <input type="file" hidden (change)="onAvatar($event)" />
            Upload Avatar
          </label>
        </div>
      </div>

      <div class="grid">
        <form [formGroup]="form" (ngSubmit)="save()" class="card">
          <h3>Profile Details</h3>
          <div class="row">
            <label>First Name</label>
            <input formControlName="firstName" />
          </div>
          <div class="row">
            <label>Last Name</label>
            <input formControlName="lastName" />
          </div>
          <div class="row">
            <label>Email</label>
            <input formControlName="email" type="email" />
          </div>
        <div class="row">
          <label>Medical Provider</label>
          <input [value]="branchDisplay()" disabled />
          <small class="hint">
            Admins & Medical Provider Managers can operate without a provider assignment.
          </small>
        </div>
          <div class="footer">
            <button class="btn primary" type="submit" [disabled]="form.invalid || saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>

        <form [formGroup]="pwForm" (ngSubmit)="changePassword()" class="card">
          <h3>Change Password</h3>
          <div class="row">
            <label>Current Password</label>
            <input type="password" formControlName="currentPassword" />
          </div>
          <div class="row">
            <label>New Password</label>
            <input type="password" formControlName="newPassword" />
          </div>
          <div class="footer">
            <button class="btn" type="submit" [disabled]="pwForm.invalid || pwSaving">
              {{ pwSaving ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-wrap { max-width: 1100px; margin: 24px auto; padding: 0 16px; }
    .profile-header { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; }
    .avatar { width: 64px; height: 64px; border-radius: 50%; background: #3b82f6; color: #fff;
              display:flex; align-items:center; justify-content:center; font-weight:700; }
    .meta h1 { margin:0; font-size: 20px; }
    .meta .email { color:#64748b; margin: 2px 0 8px; }
    .badges { display:flex; flex-wrap:wrap; gap:6px; }
    .badge { background:#eef2ff; color:#3730a3; padding: 2px 8px; border-radius: 999px; font-size:12px; }
    .actions { margin-left:auto; }
    .btn { appearance: none; border: 1px solid #d1d5db; background: #fff; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
    .btn.primary { background:#3b82f6; color:#fff; border-color:#3b82f6; }
    .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .card { background:#fff; border:1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
    .card h3 { margin-top:0; margin-bottom: 12px; }
    .row { display:flex; flex-direction:column; gap:6px; margin-bottom: 10px; }
    label { font-size: 12px; color:#374151; }
    input { padding:10px; border:1px solid #d1d5db; border-radius: 8px; }
    .hint { color:#6b7280; font-size: 11px; }
    .footer { display:flex; justify-content:flex-end; margin-top: 8px; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
  `]
})
export class UsersProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  user = signal<User | null>(null);
  saving = false;
  pwSaving = false;

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]]
  });

  pwForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    const u = this.auth.getCurrentUser();
    this.user.set(u);
    if (u) {
      this.form.patchValue({
        firstName: u['firstName'] || '',
        lastName:  u['lastName'] || '',
        email:     u.email || ''
      });
    }
  }

  initials(): string {
    const u = this.user();
    return ((u?.['firstName']?.[0] || '') + (u?.['lastName']?.[0] || '')).toUpperCase() || '?';
    }

  roleLabel(r: any): string {
    // supports string roles or { name: string }
    if (typeof r === 'string') return r;
    if (r?.displayName) return r.displayName;
    return r?.name || 'Role';
  }

  branchDisplay(): string {
    const u = this.user();
    if (!u) return '-';
    const hasProvider = u.medicalProviderId !== null && u.medicalProviderId !== undefined;
    if (!hasProvider) {
      return 'None (Global Access)';
    }
    return u.medicalProviderName || String(u.medicalProviderId);
  }

  async save() {
    if (this.form.invalid) return;
    this.saving = true;
    try {
      const updated = await this.auth.updateProfile(this.form.getRawValue()).toPromise();
      this.user.set(updated);
    } finally {
      this.saving = false;
    }
  }

  async changePassword() {
    if (this.pwForm.invalid) return;
    this.pwSaving = true;
    try {
      await this.auth.changePassword(this.pwForm.getRawValue()).toPromise();
      this.pwForm.reset();
    } finally {
      this.pwSaving = false;
    }
  }

  async onAvatar(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const { imageUrl } = await this.auth.uploadProfileImage(file).toPromise();
    const u = this.user();
    if (u) {
      this.user.set({ ...u, profileImage: imageUrl });
    }
  }
}
