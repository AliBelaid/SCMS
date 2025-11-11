import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatTabsModule } from '@angular/material/tabs';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-upcoming-schedules',
    imports: [
        MaterialModule,
        MatMenuModule,
        MatButtonModule,
        CommonModule,
        TablerIconsModule,
        MatTabsModule,
        NgScrollbarModule,
        MatIconModule        
    ],
    templateUrl: './upcoming-schedules.component.html',
})
export class AppUpcomingSchedulesComponent {


    constructor() { }
}
