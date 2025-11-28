import { VexRoutes } from '@vex/interfaces/vex-route.interface';

export const USERS_ROUTES: VexRoutes = [
  {
    path: '',
    children: [
      { 
        path: '', 
        title: 'Users - List',
        loadComponent: () => import('./users-list/users-list.component').then(m => m.UsersListComponent)
      },
      { 
        path: 'create', 
        title: 'Users - Create',
        loadComponent: () => import('./users-create/users-create.component').then(m => m.UsersCreateComponent)
      },
      { 
        path: ':id', 
        title: 'Users - Details',
        loadComponent: () => import('./users-details/users-details.component').then(m => m.UsersDetailsComponent)
      },
      { 
        path: ':id/edit', 
        title: 'Users - Edit',
        loadComponent: () => import('./users-edit/users-edit.component').then(m => m.UsersEditComponent)
      },
       
     { path: 'profile',        title: 'My Profile',
        loadComponent: () =>
          import('./users-profile/users-profile.component').then(m => m.UsersProfileComponent)
      }
    ]
  }
];
