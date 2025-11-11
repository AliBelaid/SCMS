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

interface stats {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

export interface marketingreporttwoChart {
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
  selector: 'app-marketing-report-two',
  imports: [MaterialModule, NgApexchartsModule, MatButtonModule, TablerIconsModule, MatIconModule],
  templateUrl: './marketing-report-two.component.html',
})
export class AppMarketingReportTwoComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public marketingreporttwoChart!: Partial<marketingreporttwoChart> | any;

  stats: stats[] = [
    {
      id: 1,
      title: '+2.9k',
      subtitle: 'Search Volume',
      icon: 'solar:course-up-line-duotone',
    },
    {
      id: 2,
      title: '1.22',
      subtitle: 'Return Ratio',
      icon: 'solar:pie-chart-3-line-duotone',
    },
    {
      id: 3,
      title: '0.83',
      subtitle: 'Clicks / search',
      icon: 'solar:cursor-line-duotone',
    },
    {
      id: 4,
      title: '41.2',
      subtitle: 'Return Ratio',
      icon: 'solar:pie-chart-3-line-duotone',
    },
  ];

  constructor() {
    this.marketingreporttwoChart = {

      series: [20, 20, 20, 20, 20],
      labels: ["245", "45", "14", "78", "95"],
      chart: {
        height: 200,
        fontFamily: "inherit",
        type: "donut",
      },
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          offsetY: 10,
          donut: {
            size: "85%",
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
        width: 2,
        colors: 'var(--mdc-elevated-card-container-color)',
      },
      tooltip: {
        fillSeriesColor: false,
      },
      colors: [
        "#ff6692",
        "#ffae1f",
        "#fff1cc",
        "#d2f9f4",
        "#00ceb6",
      ],

    };
  }
}
