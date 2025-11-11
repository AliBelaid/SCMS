import { Component, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

interface month {
    value: string;
    viewValue: string;
}

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
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface totalordersChart {
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
    selector: 'app-total-orders',
    imports: [MaterialModule, TablerIconsModule, NgApexchartsModule, MatMenuModule, MatButtonModule, CommonModule],
    templateUrl: './total-orders.component.html',
})
export class AppTotalOrdersComponent {
    @ViewChild('chart') chart: ChartComponent = Object.create(null);
    public totalordersChart!: Partial<totalordersChart> | any;

    months: month[] = [
        { value: 'mar', viewValue: 'This Week' },
        { value: 'April', viewValue: 'April 2025' },
        { value: 'May', viewValue: 'May 2025' },
        { value: 'june', viewValue: 'June 2025' },
    ];

    constructor() {
        this.totalordersChart = {

            series: [
                {
                  name: "",
                  data: [0, 20, 15, 19, 14, 25, 30],
                },
                {
                  name: "",
                  data: [0, 8, 19, 13, 26, 16, 25],
                },
              ],
              chart: {
                fontFamily: "inherit",
                foreColor: "#adb0bb",
                height: 250,
                width: "100%",
                type: "line",
                offsetX:-18,
                toolbar: {
                  show: false,
                },
                stacked: false,
              },
              legend: {
                show: false,
              },
              stroke: {
                width: 3,
                curve: "smooth",
              },
              grid: {
                borderColor: "rgba(0,0,0,0.05)",
                strokeDashArray: 3,
                xaxis: {
                  lines: {
                    show: true,
                  },
                },
                yaxis: {
                  lines: {
                    show: true,
                  },
                },
                padding: {
                  top: 0,
                  bottom: 0,
                  left: 10,
                  right: 0,
                },
              },
              colors: ["var(--mat-sys-primary)", "#8965E5"],
              fill: {
                type: "gradient",
                gradient: {
                  shade: "dark",
                  gradientToColors: ["#6993ff"],
                  shadeIntensity: 1,
                  type: "horizontal",
                  opacityFrom: 1,
                  opacityTo: 1,
                  stops: [0, 100, 100, 100],
                },
              },
              markers: {
                size: 0,
              },
              xaxis: {
                labels: {
                  show: true,
                },
                type: "category",
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                axisTicks: {
                  show: false,
                },
                axisBorder: {
                  show: false,
                },
              },
              yaxis: {
                axisTicks: {
                  show: false,
                },
                axisBorder: {
                  show: false,
                },
                labels: {
                  show: true,
                  formatter: function (value: string) {
                    return value + "k";
                  },
                },
              },
              tooltip: {
                theme: "dark",
              },
        };
    }
}
