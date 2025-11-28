import { Routes } from '@angular/router';

/**
 * HCPCS Module Routes
 *
 * Routes for HCPCS code management:
 * - List view with pagination and filtering
 * - Create new HCPCS code
 * - Edit existing HCPCS code
 * - View HCPCS code details
 */
export const HCPCS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./components/hcpcs-list/hcpcs-list.component').then(
        (m) => m.HCPCSListComponent
      ),
    data: {
      title: 'HCPCS Codes',
      breadcrumb: 'List',
    },
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./components/hcpcs-form/hcpcs-form.component').then(
        (m) => m.HCPCSFormComponent
      ),
    data: {
      title: 'Create HCPCS Code',
      breadcrumb: 'Create',
    },
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/hcpcs-form/hcpcs-form.component').then(
        (m) => m.HCPCSFormComponent
      ),
    data: {
      title: 'Edit HCPCS Code',
      breadcrumb: 'Edit',
    },
  },
  {
    path: 'view/:id',
    loadComponent: () =>
      import('./components/hcpcs-view/hcpcs-view.component').then(
        (m) => m.HCPCSViewComponent
      ),
    data: {
      title: 'View HCPCS Code',
      breadcrumb: 'View',
    },
  },
];

/**
 * Integration with main app routing:
 *
 * In your app.routes.ts or main routing file:
 *
 * ```typescript
 * import { HCPCS_ROUTES } from './modules/hcpcs/hcpcs.routes';
 *
 * export const routes: Routes = [
 *   // ... other routes
 *   {
 *     path: 'app',
 *     component: MainLayoutComponent,
 *     children: [
 *       // ... other child routes
 *       {
 *         path: 'hcpcs',
 *         children: HCPCS_ROUTES
 *       }
 *     ]
 *   }
 * ];
 * ```
 *
 * This will make HCPCS module available at:
 * - /app/hcpcs/list
 * - /app/hcpcs/create
 * - /app/hcpcs/edit/:id
 * - /app/hcpcs/view/:id
 */

/**
 * Navigation menu integration example:
 *
 * In your navigation component or service:
 *
 * ```typescript
 * const menuItems = [
 *   // ... other menu items
 *   {
 *     label: 'HCPCS Codes',
 *     icon: 'medical_services',
 *     route: '/app/hcpcs',
 *     children: [
 *       {
 *         label: 'View All',
 *         icon: 'list',
 *         route: '/app/hcpcs/list'
 *       },
 *       {
 *         label: 'Add New',
 *         icon: 'add_circle',
 *         route: '/app/hcpcs/create'
 *       }
 *     ]
 *   }
 * ];
 * ```
 */

