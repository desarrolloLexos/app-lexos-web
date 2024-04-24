import * as actions from './../actions';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Injectable } from '@angular/core';
import { exhaustMap } from 'rxjs';
import { ClientesService } from 'app/services/clientes.service';

@Injectable()
export class ClientesEffects {


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

  cargarClientes$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.cargarClientes ),
      exhaustMap(
          () => this.clientesService.getClientes()
                .then( (clientes) => actions.cargarClientesSuccess({clientes}))
                .catch( err => actions.cargarClientesError({payload: err}))
          )
      )
  );
}
