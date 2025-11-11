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

export interface productsalesChart {
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
  selector: 'app-product-sales',
  imports: [MaterialModule, NgApexchartsModule, MatButtonModule, TablerIconsModule, MatIconModule],
  templateUrl: './product-sales.component.html',
})
export class AppProductSalesComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public productsalesChart!: Partial<productsalesChart> | any;

  constructor() {
    this.productsalesChart = {

      series: [30, 10, 16, 16, 16, 10],
      labels: ["36%", "10%", "16%", "16%", "10%", "15%"],
      chart: {
        type: "donut",
        fontFamily: "inherit",
        foreColor: "#c6d1e9",
        height: 190,
      },
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          offsetY: 10,
          donut: {
            size: "75%",
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
                label: "8364",
              },
            },
          },
        },
      },
      grid: {
        padding: {
          bottom: -80,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
        name: {
          show: false,
        },
      },
      stroke: {
        width: 0,
      },
      tooltip: {
        enabled: false,
        fillSeriesColor: false,
      },
      colors: [
        "var(--mat-sys-primary)",
        "var(--mat-sys-secondary)",
        "var(--mat-sys-error-fixed-dim)",
        "#f8fafd",
        "#eff4fa",
        "#00ceb6",
      ],

    };
  }
}
