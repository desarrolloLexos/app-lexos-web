import { AfterContentInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription, filter } from 'rxjs';

import { AppState } from 'app/store/app.reducers';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { Usuario } from 'app/models/usuario.model';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserMenuComponent implements OnInit, AfterContentInit {
 
  public userImage = "assets/img/user-icon.png";
  usuario?: Usuario | null;
  usuarioSubs: Subscription;
  nombre: String;
  cargo: String;

  constructor(private authService: AuthService,
              private router: Router,
              private store: Store<AppState>) {
      this.usuarioSubs = this.store.select('user')
                                    .pipe( filter( ({user}) => user != null))
                                    .subscribe( ({user}) => this.usuario = user);
  }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    const vectorNombre = this.usuario?.name.split(' ');
    this.nombre = vectorNombre.filter( (_, index) => index !== 1)?.join(' ');
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


  ngOnDestroy(): void {
      this.usuarioSubs.unsubscribe();
  }

  logout(){

    Swal.fire({
      title: '¡Cerrando sesión!',
      didOpen: () => {
        Swal.showLoading()
      },
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log('I was closed by the timer')
      }
    })

    this.authService.logout()
    .then(() => {
      setInterval(() => {
        Swal.close();
        this.router.navigate(['/login']);
       });
    }).catch(err => {
        console.log('Error', err);
        setInterval(() => {
          Swal.close();
        }, 400);
      });
      
    }
}
