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
  ApexResponsive,
} from 'ng-apexcharts';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface salesprofitChart {
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
  responsive: ApexResponsive;
}

@Component({
  selector: 'app-sales-profit',
  imports: [MaterialModule, TablerIconsModule, NgApexchartsModule, MatButtonModule, CommonModule],
  templateUrl: './sales-profit.component.html',
})
export class AppSalesProfitComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public salesprofitChart!: Partial<salesprofitChart> | any;
  public expensesChart!: Partial<salesprofitChart> | any;

  public tabtitle = "profit";

  constructor() {
    this.salesprofitChart = {

      series: [
        {
          type: "area",
          name: "This Year",
          chart: {
            foreColor: "#111c2d99",
            fontSize: 12,
            fontWeight: 500,
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
              y: 25,
            },
            {
              x: "Sep",
              y: 25,
            },
            {
              x: "Oct",
              y: 10,
            },
            {
              x: "Nov",
              y: 10,
            },
            {
              x: "Dec",
              y: 45,
            },
            {
              x: "Jan",
              y: 45,
            },
            {
              x: "Feb",
              y: 75,
            },
            {
              x: "Mar",
              y: 70,
            },
            {
              x: "Apr",
              y: 35,
            },
          ],
        },
        {
          type: "line",
          name: "Last Year",
          chart: {
            foreColor: "#111c2d99",
          },
          data: [
            {
              x: "Aug",
              y: 50,
            },
            {
              x: "Sep",
              y: 50,
            },
            {
              x: "Oct",
              y: 25,
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
              y: 20,
            },
            {
              x: "Feb",
              y: 35,
            },
            {
              x: "Mar",
              y: 35,
            },
            {
              x: "Apr",
              y: 60,
            },
          ],
        },
      ],
      chart: {
        height: 300,
        type: 'area',
        fontFamily: "inherit",
        foreColor: "#adb0bb",
        fontSize: "12px",
        offsetX: -15,
        offsetY: 10,
        animations: {
          speed: 500,
        },
        toolbar: {
          show: false,
        },
      },
      colors: ["#00A1FF", "#8965E5"],
      dataLabels: {
        enabled: false,
      },
      fill: {
        colors: undefined,
        opacity: 0.1,
        type: 'solid',
      },
      grid: {
        show: true,
        strokeDashArray: 3,
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
      yaxis: {
        tickAmount: 3,
      },
      legend: {
        show: false,
      },
      tooltip: {
        theme: "dark",
      },
    };


    this.expensesChart = {
      series: [
        {
          name: "This year",
          data: [9, 5, 3, 7, 5, 10, 3],
          color: 'var(--mat-sys-primary)',
        },
        {
          name: "Last year ",
          data: [6, 3, 9, 5, 4, 6, 4],
          color: 'var(--mat-sys-secondary)',
        },
      ],
      chart: {
        fontFamily: "inherit",
        type: "bar",
        height: 378,
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
      colors: ["var(--mat-sys-primary)", "var(--mat-sys-secondary)"],
      plotOptions: {
        bar: {
          borderRadius: 5,
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
