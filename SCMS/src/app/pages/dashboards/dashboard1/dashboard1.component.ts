import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AppCongratulationsComponent } from 'src/app/components/dashboard1/congratulations/congratulations.component';
import { AppCustomersComponent } from 'src/app/components/dashboard1/customers/customers.component';
import { AppLatestDealComponent } from 'src/app/components/dashboard1/latest-deal/latest-deal.component';
import { AppLatestReviewsComponent } from 'src/app/components/dashboard1/latest-reviews/latest-reviews.component';
import { AppPaymentsComponent } from 'src/app/components/dashboard1/payments/payments.component';
import { AppPopularProductsComponent } from 'src/app/components/dashboard1/popular-products/popular-products.component';
import { AppProductsComponent } from 'src/app/components/dashboard1/products/products.component';
import { AppSalesLocationsComponent } from 'src/app/components/dashboard1/sales-locations/sales-locations.component';
import { AppTotalOrdersComponent } from 'src/app/components/dashboard1/total-orders/total-orders.component';
import { AppUpcomingSchedulesComponent } from 'src/app/components/dashboard1/upcoming-schedules/upcoming-schedules.component';

@Component({
  selector: 'app-dashboard1',
  standalone: true,
  imports: [
    TablerIconsModule,
    MatCardModule,
    AppCongratulationsComponent,
    AppTotalOrdersComponent,
    AppLatestDealComponent,
    AppCustomersComponent,
    AppPaymentsComponent,
    AppProductsComponent,
    AppPopularProductsComponent,
    AppUpcomingSchedulesComponent,
    AppLatestReviewsComponent,
    AppSalesLocationsComponent
  ],
  templateUrl: './dashboard1.component.html',
})
export class AppDashboard1Component {
  constructor() {}
}
