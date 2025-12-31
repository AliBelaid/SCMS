import { LayoutComponent } from './layouts/layout/layout.component';
import { VexRoutes } from '@vex/interfaces/vex-route.interface';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/assets/services/auth.service';
import { NoAuthGuard } from './guards/auth.guard';
 

export const appRoutes: VexRoutes = [
  // Root route - redirect based on authentication status
  {
    path: '',
    canActivate: [() => {
      const authService = inject(AuthService);
      const router = inject(Router);
      
      if (authService.isAuthenticated()) {
        router.navigate(['/app/visitor-management']);
        return false;
      } else {
        router.navigate(['/login']);
        return false;
      }
    }],
    pathMatch: 'full',
    children: []
  },

  // Add dashboard route redirect
  {
    path: 'dashboard',
    redirectTo: '/app/document-management',
    pathMatch: 'full'
  },
  // Auth routes - commented out until components are created
  {
    path: 'login',
    canActivate: [NoAuthGuard],
    loadComponent: () =>
      import('./auth/login/login.component').then(
        (m) => m.LoginComponent
      )
  },
 
  {
    path: 'forgot-password',
    loadComponent: () =>
      import(
        './auth/forgot-password/forgot-password.component'
      ).then((m) => m.ForgotPasswordComponent)
  },

  // Main application with layout
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'visitor-management',
        pathMatch: 'full'
      },
      {
        path: 'document-management',
        loadChildren: () =>
          import('./document-management/document-management.routes').then(
            (m) => m.DocumentManagementRoutes
          )
      },
      {
        path: 'visitor-management',
        loadChildren: () =>
          import('./visitor-management/visitor-management.routes').then(
            (m) => m.VisitorManagementRoutes
          )
      },
      {
        path: 'user',
        loadChildren: () => import('./user/user.module').then(m => m.UserModule)
      }
    ]
  }
];

export default appRoutes;
