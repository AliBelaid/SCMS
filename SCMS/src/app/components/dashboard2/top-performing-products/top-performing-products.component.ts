import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';



export interface productsData {
    id: number;
    imagePath: string;
    bgcolor: string;
    admin: string;
    category: string;
    sales: string;
    earnings: string;
    technology: any;
}

const ELEMENT_DATA: productsData[] = [
    {
        id: 1,
        imagePath: 'assets/images/svgs/icon-materialM.svg',
        bgcolor: 'bg-light-primary text-primary',
        admin: 'MDash - Admin',
        category: 'Mobile',
        sales: '2,350',
        earnings: '$24,235',
        technology: ['assets/images/svgs/icon-photoshop.svg'],
    },
    {
        id: 2,
        imagePath: 'assets/images/svgs/icon-matdash.svg',
        bgcolor: 'bg-light-secondary text-secondary',
        admin: 'MatDash - Admin',
        category: 'Web App',
        sales: '1,630',
        earnings: '$13,699',
        technology: ['assets/images/svgs/icon-figma.svg','assets/images/svgs/icon-veu.svg'],
    },
    {
        id: 3,
        imagePath: 'assets/images/svgs/icon-spike.svg',
        bgcolor: 'bg-light-success text-success',
        admin: 'Spike - Admin',
        category: 'Website',
        sales: '480',
        earnings: '$9,640',
        technology: ['assets/images/svgs/icon-xd.svg','assets/images/svgs/icon-bootstrap.svg'],
    },
    {
        id: 4,
        imagePath: 'assets/images/svgs/icon-modernize.svg',
        bgcolor: 'bg-light-warning text-warning',
        admin: 'Modernize - Admin',
        category: 'Marketing',
        sales: '874',
        earnings: '$10,250',
        technology: ['assets/images/svgs/icon-angular.svg'],
    },
    {
        id: 5,
        imagePath: 'assets/images/svgs/icon-materialpro.svg',
        bgcolor: 'bg-light-error text-error',
        admin: 'MaterialPro - Admin',
        category: 'SSM',
        sales: '3715',
        earnings: '$36,400',
        technology: ['assets/images/svgs/icon-nextjs.svg','assets/images/svgs/icon-javascript.svg'],
    },
];
@Component({
    selector: 'app-top-performing-products',
    imports: [
        MaterialModule,
        MatMenuModule,
        MatButtonModule,
        CommonModule,
        TablerIconsModule,
        MatProgressBarModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './top-performing-products.component.html',
})
export class AppTopPerformingProductsComponent {

    displayedColumns: string[] = ['product name', 'category', 'sales', 'earnings', 'technology'];
    dataSource = ELEMENT_DATA;

    constructor() { }
}
