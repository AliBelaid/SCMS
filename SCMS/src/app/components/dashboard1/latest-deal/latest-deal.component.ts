import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-latest-deal',
  imports: [MaterialModule, MatProgressBarModule],
  templateUrl: './latest-deal.component.html',
})
export class AppLatestDealComponent {
  constructor() {}
}
