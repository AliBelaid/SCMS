import { Component } from '@angular/core';
import { FileTableComponent } from '../../../components/file-table/file-table.component';

@Component({
  selector: 'app-file-dashboard-page',
  standalone: true,
  imports: [FileTableComponent],
  template: '<app-file-table></app-file-table>'
})
export class FileDashboardPageComponent {} 