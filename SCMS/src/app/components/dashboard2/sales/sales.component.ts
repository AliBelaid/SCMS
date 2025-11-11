import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-sales',
  imports: [MaterialModule, MatProgressBarModule],
  templateUrl: './sales.component.html',
})
export class AppSalesComponent {
  constructor() {}
}
