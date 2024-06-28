import { Component } from "@angular/core";

import { AppSettings } from "./app.settings";
import { Settings } from "./app.settings.model";
import { AuthService } from "./services/auth.service";
import { TareasService } from "./services/tareas.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  public settings: Settings;
  constructor(
    public appSettings: AppSettings,
    public authService: AuthService,
    public tareasService: TareasService
  ) {
    this.settings = this.appSettings.settings;
    //this.authService.initAuthListener();
  }

  ngOnInit() {
    /*this.tareasService.listadoCausaFalla().then((data) => {
      const dataRefined = [];
      data.forEach((element) => {
        dataRefined.push(element.description);
      });
      console.log("CAUSAS DE FALLA", dataRefined);
    });*/
  }
}
