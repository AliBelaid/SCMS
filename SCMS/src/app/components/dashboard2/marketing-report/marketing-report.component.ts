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

export interface marketingreportChart {
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
  labels: string | any;
}

@Component({
  selector: 'app-marketing-report',
  imports: [MaterialModule, NgApexchartsModule, MatButtonModule, TablerIconsModule, MatIconModule],
  templateUrl: './marketing-report.component.html',
})
export class AppMarketingReportComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public marketingreportChart!: Partial<marketingreportChart> | any;

  constructor() {
    this.marketingreportChart = {

      color: "#adb5bd",
      series: [70, 18, 12],
      labels: ["24.3K", "1.22", "+2.9k"],
      chart: {
        height: 180,
        type: "donut",
        fontFamily: "inherit",
        foreColor: "#adb0bb",
      },
      stroke: {
        show: true,
        colors: 'var(--mdc-elevated-card-container-color)',
        width: 3,
      },
      dataLabels: {
        enabled: false,
      },

      legend: {
        show: false,
      },
      colors: ["var(--mat-sys-primary)", "#00ceb6", "var(--mat-sys-error)"],

      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          donut: {
            size: "85%",
            background: "none",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "15px",
                color: undefined,
                offsetY: 5,
              },
              value: {
                show: false,
              },
              total: {
                show: true,
                color: "#7c8fac",
                fontSize: "20px",
                fontWeight: "600",
                label: "24.3k",
              },
            },
          },
        },
      },

      tooltip: {
        theme: "dark",
        fillSeriesColor: false,
      },

    };
  }
}
