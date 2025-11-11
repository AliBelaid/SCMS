import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-welcome',
  imports: [MaterialModule, MatProgressBarModule],
  templateUrl: './welcome.component.html',
})
export class AppWelcomeComponent {
  constructor() {}
}
