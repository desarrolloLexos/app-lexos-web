import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DashboardComponent } from './dashboard.component';
import { TilesComponent, TilesDialog } from './tiles/tiles.component';
import { InfoCardsComponent } from './info-cards/info-cards.component';
import { DiskSpaceComponent } from './disk-space/disk-space.component';
import { TodoComponent } from './todo/todo.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { TeamComponent } from './team/team.component';
import { MatSelectFilterModule } from 'mat-select-filter';
import { MatDialogContent, MatDialogActions } from "@angular/material/dialog";

export const routes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' }
];

@NgModule({
    declarations: [
        DashboardComponent,
        TilesComponent,
        InfoCardsComponent,
        DiskSpaceComponent,
        TodoComponent,
        AnalyticsComponent,
        TeamComponent,
        TilesDialog
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
        FormsModule,
        NgxChartsModule,
        PerfectScrollbarModule,
        ReactiveFormsModule,
        MatSelectFilterModule,
    ]
})
export class DashboardModule { }
