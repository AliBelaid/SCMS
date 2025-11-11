import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RoleMonitorService } from './services/role-monitor.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'Modernize Angular Admin Tempplate';

  constructor(private roleMonitorService: RoleMonitorService) {}

  ngOnInit(): void {
    // Initialize role monitoring - service will handle role change notifications
    // and auto-navigation when user roles are changed
  }
}
