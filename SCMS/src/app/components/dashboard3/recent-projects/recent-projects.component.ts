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

export interface successChart {
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

export interface errorChart {
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

export interface warningChart {
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

export interface accentChart {
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

export interface productsData {
  id: number;
  imagePath: string;
  name: string;
  budget: string;
  bgcolor: string;
  leader: string;
  chart: string;
}

const ELEMENT_DATA: productsData[] = [
  {
    id: 1,
    imagePath: 'assets/images/svgs/icon-photoshop.svg',
    name: 'Photoshop',
    bgcolor: 'bg-light-success text-success',
    budget: '$29,374.60',
    leader: 'Erin',
    chart: "successChart",
  },
  {
    id: 2,
    imagePath: 'assets/images/svgs/icon-diamond.svg',
    name: 'Website SEO',
    bgcolor: 'bg-light-warning text-warning',
    budget: '$1,843.73',
    leader: 'Timothy',
    chart: "errorChart",
  },
  {
    id: 3,
    imagePath: 'assets/images/svgs/icon-veu.svg',
    name: 'iOS Mobile App Design',
    bgcolor: 'bg-light-success text-success',
    budget: '$0.9989',
    leader: 'Tyler',
    chart: "successChart",
  },
  {
    id: 4,
    imagePath: 'assets/images/svgs/icon-figma.svg',
    name: 'Figma Components',
    bgcolor: 'bg-light-error text-error',
    budget: '$238.61',
    leader: 'Kristen',
    chart: "warningChart",
  },
  {
    id: 5,
    imagePath: 'assets/images/svgs/icon-react.svg',
    name: 'Web App Design',
    bgcolor: 'bg-light-primary text-primary',
    budget: '$0.629',
    leader: 'Isabelle',
    chart: "accentChart",
  },
];
const ELEMENT_DATA2: productsData[] = [

  {
    id: 2,
    imagePath: 'assets/images/svgs/icon-diamond.svg',
    name: 'Website SEO',
    bgcolor: 'bg-light-warning text-warning',
    budget: '$1,843.73',
    leader: 'Timothy',
    chart: "errorChart",
  },
  {
    id: 3,
    imagePath: 'assets/images/svgs/icon-veu.svg',
    name: 'iOS Mobile App Design',
    bgcolor: 'bg-light-success text-success',
    budget: '$0.9989',
    leader: 'Tyler',
    chart: "successChart",
  },
  {
    id: 5,
    imagePath: 'assets/images/svgs/icon-react.svg',
    name: 'Web App Design',
    bgcolor: 'bg-light-primary text-primary',
    budget: '$0.629',
    leader: 'Isabelle',
    chart: "accentChart",
  },
];
const ELEMENT_DATA3: productsData[] = [
  {
    id: 3,
    imagePath: 'assets/images/svgs/icon-veu.svg',
    name: 'iOS Mobile App Design',
    bgcolor: 'bg-light-success text-success',
    budget: '$0.9989',
    leader: 'Tyler',
    chart: "successChart",
  },
  {
    id: 2,
    imagePath: 'assets/images/svgs/icon-diamond.svg',
    name: 'Website SEO',
    bgcolor: 'bg-light-warning text-warning',
    budget: '$1,843.73',
    leader: 'Timothy',
    chart: "errorChart",
  },

];

@Component({
  selector: 'app-recent-projects',
  imports: [MaterialModule, TablerIconsModule, MatButtonModule, CommonModule, NgApexchartsModule, MatIconModule],
  templateUrl: './recent-projects.component.html',
})
export class AppRecentProjectsComponent {

  public tabtitle = "saas";

  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public successChart!: Partial<successChart> | any;
  public errorChart!: Partial<errorChart> | any;
  public warningChart!: Partial<warningChart> | any;
  public accentChart!: Partial<accentChart> | any;


  constructor() {
    this.successChart = {
      chart: {
        id: "table-chart",
        type: "area",
        width: 143,
        height: 14,
        sparkline: {
          enabled: true,
        },
        group: "table-chart",
        fontFamily: "inherit",
        foreColor: "#adb0bb",
      },
      series: [
        {
          color: "#00ceb6",
          data: [25, 66, 20, 40, 12, 58, 20],
        },
      ],
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0,
          inverseColors: false,
          opacityFrom: 0,
          opacityTo: 0,
          stops: [20, 180],
        },
      },
      markers: {
        size: 0,
      },
      tooltip: {
        enabled: false,
      },



    };

    this.errorChart = {
      chart: {
        id: "table-chart",
        type: "area",
        width: 143,
        height: 14,
        sparkline: {
          enabled: true,
        },
        group: "table-chart",
        fontFamily: "inherit",
        foreColor: "#adb0bb",
      },
      series: [
        {
          color: "#ff6692",
          data: [25, 66, 20, 40, 12, 58, 20],
        },
      ],
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0,
          inverseColors: false,
          opacityFrom: 0,
          opacityTo: 0,
          stops: [20, 180],
        },
      },
      markers: {
        size: 0,
      },
      tooltip: {
        enabled: false,
      },



    };

    this.warningChart = {
      chart: {
        id: "table-chart",
        type: "area",
        width: 143,
        height: 14,
        sparkline: {
          enabled: true,
        },
        group: "table-chart",
        fontFamily: "inherit",
        foreColor: "#adb0bb",
      },
      series: [
        {
          color: "#ffae1f",
          data: [25, 66, 20, 40, 12, 58, 20],
        },
      ],
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0,
          inverseColors: false,
          opacityFrom: 0,
          opacityTo: 0,
          stops: [20, 180],
        },
      },
      markers: {
        size: 0,
      },
      tooltip: {
        enabled: false,
      },



    };

    this.accentChart = {
      chart: {
        id: "table-chart",
        type: "area",
        width: 143,
        height: 14,
        sparkline: {
          enabled: true,
        },
        group: "table-chart",
        fontFamily: "inherit",
        foreColor: "#adb0bb",
      },
      series: [
        {
          color: "#8965e5",
          data: [25, 66, 20, 40, 12, 58, 20],
        },
      ],
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0,
          inverseColors: false,
          opacityFrom: 0,
          opacityTo: 0,
          stops: [20, 180],
        },
      },
      markers: {
        size: 0,
      },
      tooltip: {
        enabled: false,
      },



    };

  }

  handleTab(data: string) {
    this.tabtitle = data;
  }

  displayedColumns: string[] = ['#', 'name', 'budget', 'team', 'leader', 'activity log'];
  dataSource = ELEMENT_DATA;
  dataSource2 = ELEMENT_DATA2
  dataSource3 = ELEMENT_DATA3

}
