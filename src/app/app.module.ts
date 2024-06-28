import { getApp, initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { initializeFirestore, provideFirestore } from "@angular/fire/firestore";
import {
  StorageModule,
  getStorage,
  provideStorage,
} from "@angular/fire/storage";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CalendarModule, DateAdapter } from "angular-calendar";

import { AgmCoreModule } from "@agm/core";
import { AngularSignaturePadModule } from "@almothafar/angular-signature-pad";
import { OverlayContainer } from "@angular/cdk/overlay";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { GoogleMapsModule } from "@angular/google-maps";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import {
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule,
} from "ngx-perfect-scrollbar";
import { environment } from "../environments/environment";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app.routing";
import { AppSettings } from "./app.settings";
import { MaterialElevationDirective } from "./directives/material-elevation.directive";
import { BlankComponent } from "./pages/blank/blank.component";
import { ErrorComponent } from "./pages/errors/error/error.component";
import { NotFoundComponent } from "./pages/errors/not-found/not-found.component";
import { PagesComponent } from "./pages/pages.component";
import { SearchComponent } from "./pages/search/search.component";
import { StatusOtV2Component } from "./pages/status-ot-v2/status-ot-v2.component";
import { DialogComponentComponent } from "./pages/ui/modal/dialog-component/dialog-component.component";
import { SharedModule } from "./shared/shared.module";
import { appReducers } from "./store/app.reducers";
import { EffectsArray } from "./store/effects";
import { ApplicationsComponent } from "./theme/components/applications/applications.component";
import { FavoritesComponent } from "./theme/components/favorites/favorites.component";
import { FlagsMenuComponent } from "./theme/components/flags-menu/flags-menu.component";
import { FullScreenComponent } from "./theme/components/fullscreen/fullscreen.component";
import { HorizontalMenuComponent } from "./theme/components/menu/horizontal-menu/horizontal-menu.component";
import { VerticalMenuComponent } from "./theme/components/menu/vertical-menu/vertical-menu.component";
import { MessagesComponent } from "./theme/components/messages/messages.component";
import { SidenavComponent } from "./theme/components/sidenav/sidenav.component";
import { TopInfoContentComponent } from "./theme/components/top-info-content/top-info-content.component";
import { UserMenuComponent } from "./theme/components/user-menu/user-menu.component";
import { PipesModule } from "./theme/pipes/pipes.module";
import { CustomOverlayContainer } from "./theme/utils/custom-overlay-container";

// NgRX

// import { TareasOtComponent } from './pages/tareas/tareas-ot/tareas-ot.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true,
  suppressScrollX: true,
};

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCDKSs6XQxwVRhzTvdfEr-NHqbiPXhqB6A",
      libraries: ["places"],
    }),
    PerfectScrollbarModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    SharedModule,
    PipesModule,
    AppRoutingModule,
    InfiniteScrollModule,
    GoogleMapsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    // provideFirestore(() => getFirestore()),
    provideFirestore(() =>
      initializeFirestore(getApp(), { ignoreUndefinedProperties: true })
    ),
    provideStorage(() => getStorage()),
    StoreModule.forRoot(appReducers),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
    }),
    EffectsModule.forRoot(EffectsArray),
    StorageModule,
    AngularSignaturePadModule,
  ],
  declarations: [
    AppComponent,
    PagesComponent,
    BlankComponent,
    SearchComponent,
    NotFoundComponent,
    ErrorComponent,
    TopInfoContentComponent,
    SidenavComponent,
    VerticalMenuComponent,
    HorizontalMenuComponent,
    FlagsMenuComponent,
    FullScreenComponent,
    ApplicationsComponent,
    MessagesComponent,
    UserMenuComponent,
    FavoritesComponent,
    MaterialElevationDirective,
    StatusOtV2Component,
    DialogComponentComponent,
    // TareasOtComponent
  ],
  providers: [
    AppSettings,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    { provide: OverlayContainer, useClass: CustomOverlayContainer },
    { provide: MAT_DATE_LOCALE, useValue: "en-GB" },
  ],
  bootstrap: [AppComponent],
  entryComponents: [DialogComponentComponent], // Asegúrate de incluir el diálogo en entryComponents si usas versiones anteriores de Angular
})
export class AppModule {}
