import * as usuarioActions from '../actions/usuario.actions';

import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, concatMap } from 'rxjs/operators';

import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { UsuariosService } from 'app/services/usuarios.service';

// import { UsuarioService } from "app/services/usuario.service";


@Injectable()
export class UsuarioEffects {

  constructor(
    // Los Actions de NgRx Effects están pendientes de todas las acciones de que disparan.
    // Son Observables que están escuchando las acciones.
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

  cargarUsuarioByPersonId$ =  createEffect(
    () => this.actions$.pipe(
      ofType(usuarioActions.cargarUsuarioByPersonId),
      concatMap( ({person_id}) => {
          return this.usuariosService.getUsuarioByPersonId(person_id)
          .then( (usuario) => {
            return usuarioActions.cargarUsuarioByPersonIdSuccess({usuario});
          })
          .catch( err => {
            return usuarioActions.cargarUsuarioByPersonIdError({payload: err})
          })
      })
    )
  );


}
