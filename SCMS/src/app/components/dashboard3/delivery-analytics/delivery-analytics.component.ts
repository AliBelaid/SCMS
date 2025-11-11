import { Component, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

import {
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexGrid,
  ApexFill,
  ApexMarkers,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MatIconModule } from '@angular/material/icon';

export interface deliveryanalyticsChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  responsive: ApexResponsive;
  grid: ApexGrid;
  fill: ApexFill;
  markers: ApexMarkers;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  colors: string | any;
}

export interface deliveryChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  fill: ApexFill;
  grid: ApexGrid;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  responsive: ApexResponsive;
}



@Component({
  selector: 'app-delivery-analytics',
  imports: [MaterialModule, TablerIconsModule, MatButtonModule, CommonModule, NgApexchartsModule, MatIconModule],
  templateUrl: './delivery-analytics.component.html',
})
export class AppDeliveryAnalyticsComponent {

  public tabtitle = "orders";

  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public deliveryanalyticsChart!: Partial<deliveryanalyticsChart> | any;
  public deliveryChart!: Partial<deliveryChart> | any;


  constructor() {
    this.deliveryanalyticsChart = {
      series: [
        { name: "Sales", data: [32, 27, 27, 30, 25, 25] },
        { name: "Visits", data: [25, 35, 20, 20, 20, 20] },
      ],

      chart: {
        fontFamily: "inherit",
        type: "radar",
        height: 340,
        toolbar: { show: !1 },
        foreColor: "#adb0bb",
      },
      plotOptions: {
        radar: {
          polygons: {
            strokeColors: "rgba(0,0,0,0.1)",
            connectorColors: "rgba(0,0,0,0.1)",
          },
        },
      },
      colors: ["#00a1ff", "#ffe4ec"],
      legend: {
        show: false,
      },
      fill: {
        colors: ["#00a1ff", "#ffe4ec"],
        opacity: [1, 0.9],
      },
      markers: { size: 0 },
      grid: {
        show: false,
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        labels: {
          show: !0,
          style: {
            fontSize: "13px",
          },
        },
      },
      yaxis: { show: !1, min: 0, max: 40, tickAmount: 4 },
      responsive: [{ breakpoint: 769, options: { chart: { height: 400 } } }],
      tooltip: {
        theme: "dark",
      },
    };

    this.deliveryChart = {
      series: [
        {
          name: "This year",
          data: [9, 5, 3, 7, 5, 10, 3],
        },
        {
          name: "Last year ",
          data: [6, 3, 9, 5, 4, 6, 4],
        },
      ],
      chart: {
        fontFamily: "inherit",
        type: "bar",
        height: 340,
        offsetY: 10,
        offsetX: -18,
        toolbar: {
          show: false,
        },
      },
      grid: {
        show: true,
        strokeDashArray: 3,
        borderColor: "rgba(0,0,0,.1)",
      },
      colors: ["#00a1ff", "#8965e5"],
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: "30%",
          endingShape: "rounded",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 5,
        colors: ["transparent"],
      },
      xaxis: {
        type: "category",
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: "#a1aab2",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#a1aab2",
          },
        },
      },
      fill: {
        opacity: 1,
        colors: ["#00a1ff", "#8965e5"],
      },
      tooltip: {
        theme: "dark",
      },
      legend: {
        show: false,
      },
      responsive: [
        {
          breakpoint: 767,
          options: {
            stroke: {
              show: false,
              width: 5,
              colors: ["transparent"],
            },
          },
        },
      ],
    };

  }
  handleTab(data: string) {
    this.tabtitle = data;
  }
}
