import { Component } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AppCurrentBalanceComponent } from 'src/app/components/dashboard3/current-balance/current-balance.component';
import { AppDeliveryAnalyticsComponent } from 'src/app/components/dashboard3/delivery-analytics/delivery-analytics.component';
import { AppEarningReportsComponent } from 'src/app/components/dashboard3/earning-reports/earning-reports.component';
import { AppMarketingReportTwoComponent } from 'src/app/components/dashboard3/marketing-report-two/marketing-report-two.component';
import { AppOverallBalanceComponent } from 'src/app/components/dashboard3/overall-balance/overall-balance.component';
import { AppPaymentMethodsComponent } from 'src/app/components/dashboard3/payment-methods/payment-methods.component';
import { AppRecentProjectsComponent } from 'src/app/components/dashboard3/recent-projects/recent-projects.component';
import { AppReturnInvestmentComponent } from 'src/app/components/dashboard3/return-investment/return-investment.component';
import { AppTotalFollowersComponent } from 'src/app/components/dashboard3/total-followers/total-followers.component';
import { AppTotalIncomeComponent } from 'src/app/components/dashboard3/total-income/total-income.component';


@Component({
  selector: 'app-dashboard3',
  standalone: true,
  imports: [
    TablerIconsModule,
    AppOverallBalanceComponent,
    AppReturnInvestmentComponent,
    AppTotalFollowersComponent,
    AppTotalIncomeComponent,
    AppCurrentBalanceComponent,
    AppMarketingReportTwoComponent,
    AppPaymentMethodsComponent,
    AppRecentProjectsComponent,
    AppDeliveryAnalyticsComponent,
    AppEarningReportsComponent
  ],
  templateUrl: './dashboard3.component.html',
})
export class AppDashboard3Component {
  constructor() {}
}
