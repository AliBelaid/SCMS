import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';

export const DocumentManagementRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
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
      },
      {
        path: 'orders',
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
          {
            path: 'history',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./order-history-viewer/order-history-viewer.component').then(
                    (m) => m.OrderHistoryViewerComponent
                  ),
              },
              {
                path: ':orderId',
                loadComponent: () =>
                  import('./order-history-viewer/order-history-viewer.component').then(
                    (m) => m.OrderHistoryViewerComponent
                  ),
              },
            ],
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
];
