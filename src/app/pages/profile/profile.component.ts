import { AfterContentInit, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Usuario } from 'app/models/usuario.model';
import { AppState } from 'app/store/app.reducers';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterContentInit {

  public userImage = "assets/img/user-icon.png";
  usuario?: Usuario | null;
  usuarioSubs: Subscription;
  nombre: String;
  cargo: String;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.usuarioSubs = this.store.select('user')
                                  .pipe( filter( ({user}) => user != null))
                                  .subscribe( ({user}) => this.usuario = user);
  }

  ngAfterContentInit(): void {
    const vectorNombre = this.usuario?.name.split(' ');
    this.nombre = vectorNombre[0].concat(' ', vectorNombre[2]);
    switch(this.usuario?.profiles_description){
      case 'PERSONALIZED': {this.cargo = 'ADMINISTRATIVO'; break;}
      case 'TECHNICAL': {this.cargo = 'TÉCNICO'; break;}
      case 'SUPERVISOR': {this.cargo = 'SUPERVISOR'; break;}
      case 'ADMINISTRATOR': {this.cargo = 'ADMINISTRADOR'; break;}
      case 'STORAGE': {this.cargo = 'BODEGUERO'; break;}
      default: this.cargo = 'SIN CARGO';
    }
    this.userImage = this.usuario?.path_image;
  }

}
