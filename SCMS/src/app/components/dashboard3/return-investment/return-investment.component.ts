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

export interface returninvestmentChart {
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
  selector: 'app-return-investment',
  imports: [MaterialModule, NgApexchartsModule, MatButtonModule, TablerIconsModule, MatIconModule],
  templateUrl: './return-investment.component.html',
})
export class AppReturnInvestmentComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public returninvestmentChart!: Partial<returninvestmentChart> | any;

  constructor() {
    this.returninvestmentChart = {
      series: [
        {
          name: "",
          data: [128, 193, 150, 120, 174, 150],
        },
      ],

      chart: {
        toolbar: {
          show: false,
        },
        height: 230,
        type: "bar",
        fontFamily: "inherit",
        foreColor: "#adb0bb",
      },
      colors: [
        "rgba(0,0,0,0.07)",
        "var(--mat-sys-primary)",
        "rgba(0,0,0,0.07)",
        "rgba(0,0,0,0.07)",
        "rgba(0,0,0,0.07)",
        "rgba(0,0,0,0.07)",
      ],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "59%",
          distributed: true,
          endingShape: "rounded",
        },
      },

      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      grid: {
        yaxis: {
          lines: {
            show: false,
          },
        },
        xaxis: {
          lines: {
            show: false,
          },
        },
      },
      xaxis: {
        categories: [["JAN"], ["FEB"], ["MAR"], ["APR"], ["MAY"], ["JUN"]],
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
    };
  }
}
