import { Component, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

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
  ApexGrid,
  ApexXAxis,
  ApexYAxis,
  ApexMarkers,
  ApexResponsive,
} from 'ng-apexcharts';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface overallbalanceChart {
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
  markers: ApexMarkers;
  colors: string | any;
}

export interface expensesChart {
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
  colors: string | any;
  responsive: ApexResponsive;
}

interface stats {
  id: number;
  color: string;
  title: string;
  subtitle: string;
  icon: string;
}

@Component({
  selector: 'app-overall-balance',
  imports: [MaterialModule, TablerIconsModule, NgApexchartsModule, MatButtonModule, CommonModule],
  templateUrl: './overall-balance.component.html',
})
export class AppOverallBalanceComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public overallbalanceChart!: Partial<overallbalanceChart> | any;
  public expensesChart!: Partial<overallbalanceChart> | any;

  public tabtitle = "orders";

  stats: stats[] = [
    {
      id: 1,
      color: 'warning',
      title: '$14,673',
      subtitle: 'Total Sales',
      icon: 'solar:course-up-line-duotone',
    },
    {
      id: 2,
      color: 'error',
      title: '$9,281',
      subtitle: 'Total Profit',
      icon: 'solar:dollar-minimalistic-line-duotone',
    },
    {
      id: 3,
      color: 'success',
      title: '45.1k',
      subtitle: 'Total Users',
      icon: 'solar:flag-2-line-duotone',
    },
    {
      id: 4,
      color: 'primary',
      title: '$4,673',
      subtitle: 'Total Expense',
      icon: 'solar:pie-chart-line-duotone',
    },
  ];

  constructor() {
    this.overallbalanceChart = {

      series: [
        {
          name: "BTC",
          data: [3500, 2500, 4000, 2500, 5500, 3500, 2500],
        },
        {
          name: "ETH",
          data: [3000, 1500, 3100, 5000, 3000, 5500, 3500],
        },
      ],
      chart: {
        fontFamily: "inherit",
        foreColor: "#adb0bb",
        height: 220,
        type: "line",
        toolbar: {
          show: false,
        },
      },
      legend: {
        show: false,
      },
      stroke: {
        width: 3,
        curve: "smooth",
      },
      grid: {
        show: false,
        strokeDashArray: 3,
        borderColor: "#90A4AE50",
      },
      colors: ["var(--mat-sys-primary)", "#dfe5ef"],
      markers: {
        size: 0,
      },
      yaxis: {
        show: false,
      },
      xaxis: {
        type: "category",
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July"],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      tooltip: {
        theme: "dark",
      },

    };


    this.expensesChart = {

      series: [
        {
          type: "area",
          name: "This Year",
          data: [
            {
              x: "Aug",
              y: 25,
            },
            {
              x: "Sep",
              y: 13,
            },
            {
              x: "Oct",
              y: 20,
            },
            {
              x: "Nov",
              y: 40,
            },
            {
              x: "Dec",
              y: 45,
            },
            {
              x: "Jan",
              y: 50,
            },
            {
              x: "Feb",
              y: 70,
            },
            {
              x: "Mar",
              y: 30,
            },
          ],
        },
        {
          type: "line",
          name: "Last Year",
          chart: {
            foreColor: "#adb0bb",
            dropShadow: {
              enabled: true,
              enabledOnSeries: undefined,
              top: 5,
              left: 0,
              blur: 3,
              color: "#000",
              opacity: 0.1,
            },
          },
          data: [
            {
              x: "Aug",
              y: 50,
            },
            {
              x: "Sep",
              y: 35,
            },
            {
              x: "Oct",
              y: 30,
            },
            {
              x: "Nov",
              y: 20,
            },
            {
              x: "Dec",
              y: 20,
            },
            {
              x: "Jan",
              y: 30,
            },
            {
              x: "Feb",
              y: 35,
            },
            {
              x: "Mar",
              y: 40,
            },
          ],
        },
      ],
      chart: {
        height: 210,
        type: 'area',
        fontFamily: "inherit",
        foreColor: "#adb0bb",
        offsetX: -15,
        animations: {
          speed: 500,
        },
        toolbar: {
          show: false,
        },
      },
      colors: ["#00A1FF", "rgba(119, 119, 142, 0.05)"],
      dataLabels: {
        enabled: false,
      },
      fill: {
        colors: undefined,
        opacity: 0.1,
        type: 'solid',
      },
      grid: {
        borderColor: "#90A4AE50",
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      legend: {
        show: false,
      },
      tooltip: {
        theme: "dark",
      },

    };


  }
  handleTab(data: string) {
    this.tabtitle = data;
  }
}
