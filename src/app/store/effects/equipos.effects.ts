import * as actions from './../actions';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Injectable } from '@angular/core';
import { exhaustMap, concatMap} from 'rxjs';
import { ClientesService } from 'app/services/clientes.service';

@Injectable()
export class EquiposEffects {


  constructor(
    private actions$: Actions,
    private clientesService: ClientesService
  ) {}

 /**
  *  URL: https://www.youtube.com/watch?v=uyW48EQge-8&t=624s
  *  We can use different Rxjs operator for different scenarios like:
  *  MergeMap -  can be used for Deleting items
  *  concatMap - can be used for Updating or creating items
  *  exhaustMap - can be used for getting some data from the server.
  *  switchMap - can be used for search functions.
  **/

  cargarEquipos$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.cargarEquipos ),
      exhaustMap(
          ({uid, codigolocal}) => this.clientesService.getEquiposByClienteID(uid)
                .then( (equipos) => actions.cargarEquiposSuccess({ equipos}))
                .catch( err => actions.cargarEquiposError({payload: err}))
          )
      )
  );

  insertarEquipo$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.insertarEquipo ),
      concatMap(
          ({uid, equipo}) => this.clientesService.setEquipo(uid, equipo)
                .then( (equipo) => actions.insertarEquipoSuccess({equipo}))
                .catch( err => actions.insertarEquipoError({payload: err}))
          )
      )
  );
}
