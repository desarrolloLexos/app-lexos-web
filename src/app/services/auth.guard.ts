import { CanActivate, Router } from '@angular/router';
import { Observable, take, tap } from 'rxjs';

import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate{

  constructor(private authService: AuthService,
              private router: Router){

  }

  // canLoad(): Observable<boolean> {
  //   return this.authService.isAuth().pipe(
  //     tap( (estado) => {          
  //         if (!estado) {              
  //             this.router.navigate(['/login']);
  //           }
  //     }),
  //     take(1) //Cada vez que quiero entrar a cargar el módulo, debo preparar una nueva subscripción.
  //   );

  // }

  canActivate(): Observable<boolean> {
    return this.authService.isAuth().pipe(
      tap( (estado) => {
          console.log('canActivate', estado);          
          if (!estado || !this.authService.user) {            
             this.router.navigate(['/login']); 
            }
      }),
      take(1) //Cada vez que quiero entrar a cargar el módulo, debo preparar una nueva subscripción.
    );

  }

}
