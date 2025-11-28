import { Component } from '@angular/core';

@Component({
  selector: 'app-users-create',
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Create User</h1>
      <p>Add a new user to the system.</p>
    </div>
  `,
  standalone: true
})
export class UsersCreateComponent {
  constructor() {}
}