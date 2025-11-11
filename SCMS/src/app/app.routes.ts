import { Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';

export const routes: Routes = [
  // Login route (outside main layout)
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/document-viewer/login/login.component').then(
        (m) => m.LoginPageComponent
      ),
  },
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/document-management/document-management.routes').then(
            (m) => m.DocumentManagementRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
