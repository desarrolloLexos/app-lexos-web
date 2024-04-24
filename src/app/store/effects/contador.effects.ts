import * as actions from './../actions';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { ContadorService } from '../../services/contador.service';
import { Injectable } from '@angular/core';
import { exhaustMap } from 'rxjs';

@Injectable()
export class ContadorEffects {


  constructor(
    private actions$: Actions,
    private contadorService: ContadorService
  ) {}

 /**
  *  URL: https://www.youtube.com/watch?v=uyW48EQge-8&t=624s
  *  We can use different Rxjs operator for different scenarios like:
  *  MergeMap -  can be used for Deleting items
  *  concatMap - can be used for Updating or creating items
  *  exhaustMap - can be used for getting some data from the server.
  *  switchMap - can be used for search functions.
  **/

  cargarContador$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.cargarContador ),
      exhaustMap(
          ({id}) => this.contadorService.getContadorById(id)
                .then( (contador) => actions.cargarContadorSuccess({contador}))
                .catch( err => actions.cargarContadorError({payload: err}))
          )
      )
  );

}
