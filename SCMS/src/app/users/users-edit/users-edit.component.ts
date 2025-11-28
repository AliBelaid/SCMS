import { Component } from '@angular/core';

@Component({
  selector: 'app-users-edit',
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Edit User</h1>
      <p>Update user information and permissions.</p>
    </div>
  `,
  standalone: true
})
export class UsersEditComponent {
  constructor() {}
}