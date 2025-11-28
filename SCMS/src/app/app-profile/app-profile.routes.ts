import { Routes } from '@angular/router';
import { AppProfileComponent } from './app-profile.component';
import { RoleGuard } from '../core/guards/role.guard';

export const APP_PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: AppProfileComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Admin', 'Doctor', 'Patient']
    },
    children: [
      {
        path: '',
        redirectTo: 'details',
        pathMatch: 'full'
      },
      {
        path: 'details',
        loadComponent: () => import('./profile-details/profile-details.component').then(m => m.ProfileDetailsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./profile-settings/profile-settings.component').then(m => m.ProfileSettingsComponent)
      },
      {
        path: 'security',
        loadComponent: () => import('./profile-security/profile-security.component').then(m => m.ProfileSecurityComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./profile-notifications/profile-notifications.component').then(m => m.ProfileNotificationsComponent)
      }
    ]
  }
]; 