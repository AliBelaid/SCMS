import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-congratulations',
  imports: [MaterialModule],
  templateUrl: './congratulations.component.html',
})
export class AppCongratulationsComponent {
  constructor() {}
}
