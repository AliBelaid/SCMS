import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';


export interface productsData {
    id: number;
    imagePath: string;
    uname: string;
    email: string;
    reviews: string;
    date: string;
    rating: string;
}

const ELEMENT_DATA: productsData[] = [
    {
        id: 1,
        imagePath: 'assets/images/profile/user-6.jpg',
        uname: 'Arlene McCoy',
        email: 'macoy@arlene.com',
        reviews: 'This theme is great. Clean and easy to understand. Perfect for those who dont have',
        date: 'Nov 8',
        rating: '3.5',

    },
    {
        id: 2,
        imagePath: 'assets/images/profile/user-3.jpg',
        uname: 'Jerome Bell',
        email: 'belljerome@yahoo.com',
        reviews: 'It s a Mac, after all. Once you ve gone Mac, there s no going back. My first Mac lasted over nine years.',
        date: 'Nov 8',
        rating: '4',
    },
    {
        id: 3,
        imagePath: 'assets/images/profile/user-4.jpg',
        uname: 'Annette Black',
        email: 'blackanne@yahoo.com',
        reviews: 'The controller is quite comfy for me. Despite its increased size, the controller still fits well in my hands',
        date: 'Nov 8',
        rating: '4',
    },
    {
        id: 4,
        imagePath: 'assets/images/profile/user-5.jpg',
        uname: 'Albert Flores',
        email: 'albertflo9@gmail.com',
        reviews: 'This theme is great. Perfect for those who don t have time to start everything from scratch',
        date: 'Nov 8',
        rating: '3.5',
    },
];
@Component({
    selector: 'app-latest-reviews',
    imports: [
        MaterialModule,
        MatMenuModule,
        MatButtonModule,
        CommonModule,
        TablerIconsModule,
        MatProgressBarModule,
        MatCheckboxModule,
        MatIconModule
    ],
    templateUrl: './latest-reviews.component.html',
})
export class AppLatestReviewsComponent {

    displayedColumns: string[] = ['#', 'customer', 'reviews', 'date', 'menu'];
    dataSource = ELEMENT_DATA;

    constructor() { }
}
