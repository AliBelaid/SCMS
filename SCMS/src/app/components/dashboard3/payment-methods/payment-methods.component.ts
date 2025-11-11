import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

export interface productsData {
  id: number;
  imagePath: string;
  title: string;
  subtitle: string;
  bgcolor: string;
  category: string;
  transactions: string;
  bonus: string;
  color: string;
}

const ELEMENT_DATA: productsData[] = [
  {
    id: 1,
    imagePath: 'assets/images/svgs/icon-netflix.svg',
    title: 'Netflix Subscription',
    subtitle: 'Today, 09:23am',
    bgcolor: 'bg-light-success text-success',
    category: 'Approved',
    transactions: '- $4.58',
    bonus: '+5 Bonus',
    color: 'text-error',
  },
  {
    id: 2,
    imagePath: 'assets/images/svgs/icon-upwork.svg',
    title: 'Upwork',
    subtitle: 'August 15, 10:35pm',
    bgcolor: 'bg-light-warning text-warning',
    category: 'Pending',
    transactions: '+ $15.60',
    bonus: '+30 Bonus',
    color: 'text-success',
  },
];

@Component({
  selector: 'app-payment-methods',
  imports: [
    MaterialModule,
    MatMenuModule,
    MatButtonModule,
    CommonModule,
    TablerIconsModule,
    MatProgressBarModule,
    MatIconModule
],
  templateUrl: './payment-methods.component.html',
})
export class AppPaymentMethodsComponent {

  displayedColumns: string[] = ['product name', 'category', 'sales'];
  dataSource = ELEMENT_DATA;

  constructor() { }
}
