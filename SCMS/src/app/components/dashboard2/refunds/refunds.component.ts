import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-refunds',
  imports: [MaterialModule, MatProgressBarModule],
  templateUrl: './refunds.component.html',
})
export class AppRefundsComponent {
  constructor() {}
}
