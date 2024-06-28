import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AgmCoreModule } from "@agm/core";
import { AngularSignaturePadModule } from "@almothafar/angular-signature-pad";
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
} from "@angular-material-components/datetime-picker";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterModule, Routes } from "@angular/router";
import { MatVerticalStepperScrollerDirective } from "app/directives/matverticalstepperscroller.directive";
import { MatSelectFilterModule } from "mat-select-filter";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgxMatComboboxModule } from "ngx-mat-combobox";
import { MaterialFileInputModule } from "ngx-material-file-input";
import { NgxPaginationModule } from "ngx-pagination";
import { SharedModule } from "../../shared/shared.module";
import { PipesModule } from "../../theme/pipes/pipes.module";
import { StatusOtV2Component } from "../status-ot-v2/status-ot-v2.component";
import {
  DetalleOtComponent,
  DetalleOtDialogFirma,
  DetalleOtDialogMsg,
  DetalleOtDialogRegistrar,
} from "./detalle-ot/detalle-ot.component";
import { PdfComponent } from "./pdf/pdf.component";
import { ReporteOtComponent } from "./reporte-ot/reporte-ot.component";
import { ServiciosOtComponent } from "./servicios-ot/servicios-ot.component";
import { StatusOtComponent } from "./status-ot/status-ot.component";
import { TareaOtComponent } from "./tarea-ot/tarea-ot.component";
import {
  TareaOtUser,
  TareasOtComponent,
} from "./tareas-ot/tareas-ot.component";

export const routes: Routes = [
  { path: "status", component: TareasOtComponent, pathMatch: "full" },
  { path: "services", component: ServiciosOtComponent, pathMatch: "full" },
  { path: "report", component: ReporteOtComponent, pathMatch: "full" },
  {
    path: "details",
    component: TareaOtComponent,
    pathMatch: "full",
    data: { breadcrumb: "details" },
  },
  { path: "details/new", component: TareaOtComponent, pathMatch: "full" },
  { path: "lista", component: StatusOtV2Component, pathMatch: "full" },
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    SharedModule,
    PipesModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule,
    FlexLayoutModule,
    MatInputModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatComboboxModule,
    AngularSignaturePadModule,
    MaterialFileInputModule,
    MatSelectFilterModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCDKSs6XQxwVRhzTvdfEr-NHqbiPXhqB6A",
      libraries: ["places"],
    }),
  ],
  declarations: [
    TareasOtComponent,
    DetalleOtComponent,
    DetalleOtDialogFirma,
    DetalleOtDialogRegistrar,
    ServiciosOtComponent,
    PdfComponent,
    TareaOtComponent,
    TareaOtUser,
    MatVerticalStepperScrollerDirective,
    StatusOtComponent,
    DetalleOtDialogMsg,
    ReporteOtComponent,
  ],
  exports: [RouterModule],
})
export class TareasModule {}
