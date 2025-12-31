import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';

export const VisitorManagementRoutes: Routes = [
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
          import('./visitor-dashboard/visitor-dashboard.component').then(
            (m) => m.VisitorDashboardComponent
          ),
      },
      {
        path: 'visits',
        children: [
          {
            path: '',
            redirectTo: 'active',
            pathMatch: 'full',
          },
          {
            path: 'active',
            loadComponent: () =>
              import('./visits-list/visits-list.component').then(
                (m) => m.VisitsListEnhancedComponent
              ),
            data: { type: 'active' },
          },
          {
            path: 'checkin',
            loadComponent: () =>
              import('./visit-checkin/visit-checkin.component').then(
                (m) => m.VisitCheckinComponent
              ),
          },
          {
            path: 'checkout/:visitNumber',
            loadComponent: () =>
              import('./visit-checkout/visit-checkout.component').then(
                (m) => m.VisitCheckoutComponent
              ),
          },
          {
            path: 'details/:visitNumber',
            loadComponent: () =>
              import('./visit-details/visit-details.component').then(
                (m) => m.VisitDetailsComponent
              ),
          },
        ],
      },
      {
        path: 'reports',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./visit-reports/visit-reports.component').then(
                (m) => m.VisitReportsComponent
              ),
          },
        ],
      },
      {
        path: 'visitors',
        children: [
          {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full',
          },
          {
            path: 'list',
            loadComponent: () =>
              import('./visitors-list/visitors-list.component').then(
                (m) => m.VisitorsListComponent
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./visitor-create/visitor-create.component').then(
                (m) => m.VisitorCreateComponent
              ),
          },
          {
            path: 'profile/:id',
            loadComponent: () =>
              import('./visitor-profile/visitor-profile.component').then(
                (m) => m.VisitorProfileComponent
              ),
          },
        ],
      },
      {
        path: 'employees',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./employees-list/employees-list.component').then(
                (m) => m.EmployeesListComponent
              ),
          },
          {
            path: 'attendance/:id',
            loadComponent: () =>
              import('./employee-attendance/employee-attendance.component').then(
                (m) => m.EmployeeAttendanceComponent
              ),
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./employee-attendance-dashboard/employee-attendance-dashboard.component').then(
                (m) => m.EmployeeAttendanceDashboardComponent
              ),
          },
        ],
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./departments-list/departments-list.component').then(
            (m) => m.DepartmentsListComponent
          ),
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
];

