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

export interface productsChart {
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
  selector: 'app-products',
  imports: [MaterialModule, NgApexchartsModule],
  templateUrl: './products.component.html',
})
export class AppProductsComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public productsChart!: Partial<productsChart> | any;

  constructor() {
    this.productsChart = {
      color: "#adb5bd",
      series: [70, 18, 12],
      labels: ["2025", "2024", "2023"],
      chart: {
        height: 175,
        type: "donut",
        fontFamily: "inherit",
        foreColor: "#adb0bb",
      },
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          donut: {
            size: "85%",
          },
        },
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
      colors: ["var(--mat-sys-primary)", "var(--mat-sys-secondary)", "var(--mat-sys-error)"],

      tooltip: {
        theme: "dark",
        fillSeriesColor: false,
      },
    };
  }
}
