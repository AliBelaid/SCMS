import { Component, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import {
    ApexChart,
    ChartComponent,
    ApexDataLabels,
    ApexLegend,
    ApexStroke,
    ApexTooltip,
    ApexAxisChartSeries,
    ApexPlotOptions,
    NgApexchartsModule,
    ApexFill,
} from 'ng-apexcharts';

export interface customersChart {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    tooltip: ApexTooltip;
    stroke: ApexStroke;
    legend: ApexLegend;
    fill: ApexFill;
}

@Component({
    selector: 'app-customers',
    imports: [MaterialModule, NgApexchartsModule],
    templateUrl: './customers.component.html',
})
export class AppCustomersComponent {
    @ViewChild('chart') chart: ChartComponent = Object.create(null);
    public customersChart!: Partial<customersChart> | any;

    constructor() {
        this.customersChart = {
            chart: {
                id: "customers",
                type: "area",
                height: 103,
                sparkline: {
                  enabled: true,
                },
                group: "sparklines",
                fontFamily: "inherit",
                foreColor: "#adb0bb",
              },
              series: [
                {
                  name: "customers",
                  color: "#00A1FF",
                  data: [15, 18, 66, 20, 40, 12, 30],
                },
              ],
              stroke: {
                curve: "smooth",
                width: 2,
              },
              fill: {
                type: "gradient",
                color: "#00A1FF",
          
                gradient: {
                  shadeIntensity: 0,
                  inverseColors: false,
                  opacityFrom: 0.1,
                  opacityTo: 0,
                  stops: [100],
                },
              },
          
              markers: {
                size: 0,
              },
              tooltip: {
                theme: "dark",
                fixed: {
                  enabled: true,
                  position: "right",
                },
                x: {
                  show: false,
                },
              },
        };
    }
}
