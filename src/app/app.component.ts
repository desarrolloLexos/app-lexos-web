import { Component, ViewChild } from '@angular/core';

import { AppSettings } from './app.settings';
import { AuthService } from './services/auth.service';
import { Settings } from './app.settings.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public settings: Settings;
  constructor(public appSettings:AppSettings,
              public authService: AuthService){
      this.settings = this.appSettings.settings;
      //this.authService.initAuthListener();
  }

  ngOnInit() { }
}
