import { Component } from '@angular/core';

@Component({
  selector: 'app-users-list',
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Users List</h1>
      <p>Manage system users and their roles.</p>
    </div>
  `,
  standalone: true
})
export class UsersListComponent {
  constructor() {}
}