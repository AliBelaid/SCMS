import { Component } from '@angular/core';

@Component({
  selector: 'app-users-details',
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">User Details</h1>
      <p>View detailed information about a specific user.</p>
    </div>
  `,
  standalone: true
})
export class UsersDetailsComponent {
  constructor() {}
}