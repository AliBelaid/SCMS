import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatIconModule } from '@angular/material/icon';

interface stats {
  id: number;
  color: string;
  title: string;
  subtitle: string;
  img: string;
  percent: string;
}

@Component({
  selector: 'app-recent-transactions',
  imports: [MaterialModule, TablerIconsModule, MatIconModule],
  templateUrl: './recent-transactions.component.html',
})
export class AppRecentTransactionsComponent {
  stats: stats[] = [
    {
      id: 1,
      color: 'secondary',
      title: 'PayPal Transfer',
      subtitle: 'Money added',
      img: 'assets/images/svgs/icon-paypal.svg',
      percent: '6,235',
    },
    {
      id: 2,
      color: 'success',
      title: 'Wallet',
      subtitle: 'Bill payment',
      img: 'assets/images/svgs/icon-office-bag.svg',
      percent: '345',
    },
    {
      id: 3,
      color: 'warning',
      title: 'Credit Card',
      subtitle: 'Money reversed',
      img: 'assets/images/svgs/icon-master-card.svg',
      percent: '2235',
    },
    {
      id: 4,
      color: 'primary',
      title: 'Bank Transfer',
      subtitle: 'Money added',
      img: 'assets/images/svgs/icon-money.svg',
      percent: '320',
    },
    {
      id: 5,
      color: 'error',
      title: 'Refund',
      subtitle: 'Bill Payment',
      img: 'assets/images/svgs/icon-pie.svg',
      percent: '32',
    },
  ];
}
