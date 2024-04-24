import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject, filter, takeUntil, tap } from 'rxjs';
import { isLoading, stopLoading } from 'app/store/actions';

import { AppSettings } from '../../app.settings';
import { AppState } from 'app/store/app.reducers';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Settings } from '../../app.settings.model';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { emailValidator } from '../../theme/utils/app-validators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: ['input { font-size: 12pt; vertical-align: middle; line-height: 30px; }',
          ' .mat-icon { vertical-align: middle; }',
          ' .mat-error { text-align: right;}',
          ' button .fa-sync { float: left; margin-top: 12px; }']
})
export class LoginComponent implements OnInit, OnDestroy {
  public form:UntypedFormGroup;
  public settings: Settings;
  public hide = true;
  public cargando: boolean = true;
  private stop$ = new Subject<void>();
  public identificado: boolean = false;
  constructor(
            public appSettings:AppSettings,
            public fb: UntypedFormBuilder,
            public router:Router,
            public authService: AuthService,
            public store: Store<AppState>){
    this.settings = this.appSettings.settings;


   this.store.select('user')
              .pipe(
                    filter( ({user}) => user !== null),
                    tap( () => {
                      if(this.authService.loadInitAuthListener){
                        this.cargando = true;
                      }
                    }),
                    takeUntil(this.stop$))
              .subscribe( () => {
                this.router.navigate(['/']);  
                window.location.reload();
              });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      'email': ['', Validators.compose([Validators.required, emailValidator])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'rememberMe': false
    });

    // Creamos la suscripción a isLoading y le pasamos la referencia a variable local
    this.store.select('ui').pipe(takeUntil(this.stop$) )
                           .subscribe( ui => { this.cargando = ui.isLoading; });

    this.authService.initAuthListener();
  }

  ngOnDestroy(): void {
    stop();
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.settings.loadingSpinner = false;
    });
  }

  loginUsuario(){
    if(this.form.invalid){ return; }

    this.store.dispatch( isLoading());

    const {email, password} = this.form.value;
    this.authService.login(email, password)
    .then( credenciales => {
        console.log('Credenciales: ', credenciales);
        this.authService.cargarUsuario(credenciales.user)
        .then( (hayUsuario) => {
          this.store.dispatch( stopLoading());
          if(hayUsuario){
            console.log('Usuario autenticado y cargado... redirigiendo');
            this.identificado = true; // Para el caso que no rediriga bien.
            this.router.navigate(['/']);  
            window.location.reload();
          }else{
            console.log('No se obtuvo el usuario.');
          }
        })
        .catch( err => { console.log('error al obtener usuario', err); })
        
    })
    .catch( err => {
      this.store.dispatch( stopLoading());

      Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err.message,
      // footer: '<a href="">Why do I have this issue?</a>'
    })});
  }

  acceder(){
    console.log('redirigiendo a la fuerza');
    this.router.navigate(['/dashboard']);
  }

  stop() {
    this.stop$.next();
    this.stop$.complete();
  }
}
