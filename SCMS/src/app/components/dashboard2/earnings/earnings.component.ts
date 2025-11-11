import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-earnings',
  imports: [MaterialModule, MatProgressBarModule],
  templateUrl: './earnings.component.html',
})
export class AppEarningsComponent {
  constructor() {}
}
