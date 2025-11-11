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
  ApexFill,
  ApexMarkers,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MatButtonModule } from '@angular/material/button';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatIconModule } from '@angular/material/icon';

export interface currentbalanceChart {
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

@Component({
  selector: 'app-current-balance',
  imports: [MaterialModule, NgApexchartsModule, MatButtonModule, TablerIconsModule, MatIconModule],
  templateUrl: './current-balance.component.html', 
})
export class AppCurrentBalanceComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public currentbalanceChart!: Partial<currentbalanceChart> | any;

  constructor() {
    this.currentbalanceChart = {

      color: "#adb5bd",
      series: [70, 49],
      labels: ["2025", "2024", "2023"],
      chart: {
        height: 120,
        type: "donut",
        fontFamily: "inherit",
        foreColor: "#adb0bb",
        offsetY: -10,
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
      grid: {
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      stroke: {
        show: false,
        colors: "#ffffff",
        width: 3,
      },
      dataLabels: {
        enabled: false,
      },

      legend: {
        show: false,
      },
      colors: ["#b2efe8", "#00ceb6"],

      tooltip: {
        theme: "dark",
        fillSeriesColor: false,
      },

    };
  }
}
