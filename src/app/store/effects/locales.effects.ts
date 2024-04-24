import * as actions from './../actions';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Injectable } from '@angular/core';
import { concatMap, exhaustMap } from 'rxjs';
import { ClientesService } from 'app/services/clientes.service';

@Injectable()
export class LocalesEffects {


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

  cargarLocales$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.cargarLocales ),
      exhaustMap(
          ({uid}) => this.clientesService.getLocalesByClienteID(uid)
                .then( (locales) => actions.cargarLocalesSuccess({locales}))
                .catch( err => actions.cargarLocalesError({payload: err}))
          )
      )
  );

  insertarLocal$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.insertarLocal ),
      concatMap(
          ({uid, local}) => this.clientesService.setLocal(uid, local)
                .then( (local) => actions.insertarLocalSuccess({local}))
                .catch( err => actions.insertarLocalError({payload: err}))
          )
      )
  );
}
