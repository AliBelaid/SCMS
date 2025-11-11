import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { AdminGuard } from '../../guards/admin.guard';

export const DocumentManagementRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./orders-dashboard/orders-dashboard.component').then(
        (m) => m.OrdersDashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'orders',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'all',
        pathMatch: 'full',
      },
      {
        path: 'all',
        loadComponent: () =>
          import('./orders-list/orders-list.component').then(
            (m) => m.OrdersListComponent
          ),
        data: { type: 'all' },
      },
      {
        path: 'incoming',
        loadComponent: () =>
          import('./orders-list/orders-list.component').then(
            (m) => m.OrdersListComponent
          ),
        data: { type: 'incoming' },
      },
      {
        path: 'outgoing',
        loadComponent: () =>
          import('./orders-list/orders-list.component').then(
            (m) => m.OrdersListComponent
          ),
        data: { type: 'outgoing' },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./order-form/order-form.component').then(
            (m) => m.OrderFormComponent
          ),
        data: { mode: 'create' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./order-form/order-form.component').then(
            (m) => m.OrderFormComponent
          ),
        data: { mode: 'edit' },
      },
      {
        path: 'details/:id',
        loadComponent: () =>
          import('./order-details/order-details.component').then(
            (m) => m.OrderDetailsComponent
          ),
      },
    ],
  },
  {
    path: 'departments',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../../components/departments-list/departments-list.component').then(
            (m) => m.DepartmentsListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./department-form/department-form.component').then(
            (m) => m.DepartmentFormComponent
          ),
        canActivate: [AdminGuard],
        data: { mode: 'create' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./department-form/department-form.component').then(
            (m) => m.DepartmentFormComponent
          ),
        canActivate: [AdminGuard],
        data: { mode: 'edit' },
      },
      {
        path: 'details/:id',
        loadComponent: () =>
          import('./department-details/department-details.component').then(
            (m) => m.DepartmentDetailsComponent
          ),
      },
    ],
  },
  {
    path: 'files',
    loadComponent: () =>
      import('../../components/file-table/file-table.component').then(
        (m) => m.FileTableComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full',
      },
      {
        path: 'users',
        loadComponent: () =>
          import('../../components/user-panel/user-panel.component').then(
            (m) => m.UserPanelComponent
          ),
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('../../components/file-upload/file-upload.component').then(
            (m) => m.FileUploadComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

