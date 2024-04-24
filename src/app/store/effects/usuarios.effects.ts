import * as actions from './../actions';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Injectable } from '@angular/core';
import { exhaustMap } from 'rxjs';
import { UsuariosService } from 'app/services/usuarios.service';

@Injectable()
export class UsuariosEffects {


  constructor(
    private actions$: Actions,
    private usuariosService: UsuariosService
  ) {}

 /**
  *  URL: https://www.youtube.com/watch?v=uyW48EQge-8&t=624s
  *  We can use different Rxjs operator for different scenarios like:
  *  MergeMap -  can be used for Deleting items
  *  concatMap - can be used for Updating or creating items
  *  exhaustMap - can be used for getting some data from the server.
  *  switchMap - can be used for search functions.
  **/

  cargarUsuarios$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.cargarUsuarios ),
      exhaustMap(
          () => this.usuariosService.getUsuarios()
                .then( (usuarios) => actions.cargarUsuariosSuccess({ usuarios}))
                .catch( err => actions.cargarUsuariosError({payload: err}))
          )
      )
  );
}
