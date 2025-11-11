import { Component } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AppAnnualProfitComponent } from 'src/app/components/dashboard2/annual-profit/annual-profit.component';
import { AppEarningsComponent } from 'src/app/components/dashboard2/earnings/earnings.component';
import { AppMarketingReportComponent } from 'src/app/components/dashboard2/marketing-report/marketing-report.component';
import { AppPaymentsTwoComponent } from 'src/app/components/dashboard2/payments-two/payments-two.component';
import { AppProductSalesComponent } from 'src/app/components/dashboard2/product-sales/product-sales.component';
import { AppRecentTransactionsComponent } from 'src/app/components/dashboard2/recent-transactions/recent-transactions.component';
import { AppRefundsComponent } from 'src/app/components/dashboard2/refunds/refunds.component';
import { AppSalesProfitComponent } from 'src/app/components/dashboard2/sales-profit/sales-profit.component';
import { AppSalesComponent } from 'src/app/components/dashboard2/sales/sales.component';
import { AppTopPerformingProductsComponent } from 'src/app/components/dashboard2/top-performing-products/top-performing-products.component';
import { AppWelcomeComponent } from 'src/app/components/dashboard2/welcome/welcome.component';


@Component({
  selector: 'app-dashboard2',
  standalone: true,
  imports: [
    TablerIconsModule,
    AppWelcomeComponent,
    AppSalesComponent,
    AppRefundsComponent,
    AppEarningsComponent,
    AppSalesProfitComponent,
    AppProductSalesComponent,
    AppMarketingReportComponent,
    AppPaymentsTwoComponent,
    AppAnnualProfitComponent,
    AppTopPerformingProductsComponent,
    AppRecentTransactionsComponent
  ],
  templateUrl: './dashboard2.component.html',
})
export class AppDashboard2Component {
  constructor() {}
}
