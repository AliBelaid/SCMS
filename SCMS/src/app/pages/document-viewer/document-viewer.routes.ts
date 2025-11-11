import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { UploadGuard } from '../../guards/upload.guard';

export const DocumentViewerRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginPageComponent)
  },
  {
    path: 'files',
    loadComponent: () => import('./file-dashboard/file-dashboard.component').then(m => m.FileDashboardPageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin-panel/admin-panel.component').then(m => m.AdminPanelPageComponent),
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: 'upload',
        loadComponent: () => import('../../components/file-upload/file-upload.component').then(m => m.FileUploadComponent),
        canActivate: [UploadGuard]
      },
      {
        path: 'users',
        loadComponent: () => import('../../components/user-panel/user-panel.component').then(m => m.UserPanelComponent)
      },
      {
        path: '',
        redirectTo: 'upload',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
]; 