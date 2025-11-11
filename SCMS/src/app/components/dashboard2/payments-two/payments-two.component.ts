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
  ApexResponsive,
  ApexGrid,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MatButtonModule } from '@angular/material/button';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatIconModule } from '@angular/material/icon';

export interface paymentstwoChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  responsive: ApexResponsive;
  grid: ApexGrid;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  colors: string | any;
}

@Component({
  selector: 'app-payments-two',
  imports: [MaterialModule, NgApexchartsModule, MatButtonModule, TablerIconsModule, MatIconModule],
  templateUrl: './payments-two.component.html',
})
export class AppPaymentsTwoComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public paymentstwoChart!: Partial<paymentstwoChart> | any;

  constructor() {
    this.paymentstwoChart = {
      series: [
        {
          name: "Paypal",
          data: [29, 52, 38, 47, 56, 41, 46],
        },
        {
          name: "Credit Card",
          data: [71, 71, 71, 71, 71, 71, 71],
        },
      ],
      chart: {
        fontFamily: "inherit",
        foreColor: "#adb0bb",
        type: "bar",
        height: 150,
        stacked: true,
        offsetX: -20,
        toolbar: {
          show: false,
        },
      },
      grid: {
        show: false,
        borderColor: "rgba(0,0,0,0.1)",
        strokeDashArray: 1,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      colors: ["var(--mat-sys-primary)", "#D9D9D955"],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "26%",
          borderRadius: [3],
          borderRadiusApplication: "end",
          borderRadiusWhenStacked: "all",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: [["M"], ["T"], ["W"], ["T"], ["F"], ["S"], ["S"]],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
      tooltip: {
        theme: "dark",
      },
      legend: {
        show: false,
      },
    };
  }
}
