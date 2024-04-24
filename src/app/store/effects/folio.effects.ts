import * as actions from './../actions';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { FoliosService } from '../../services/folios.service';
import { Injectable } from '@angular/core';
import { exhaustMap, concatMap } from 'rxjs';

@Injectable()
export class FolioEffects {


  constructor(
    private actions$: Actions,
    private foliosService: FoliosService
  ) {}

 /**
  *  URL: https://www.youtube.com/watch?v=uyW48EQge-8&t=624s
  *  We can use different Rxjs operator for different scenarios like:
  *  MergeMap -  can be used for Deleting items
  *  concatMap - can be used for Updating or creating items
  *  exhaustMap - can be used for getting some data from the server.
  *  switchMap - can be used for search functions.
  **/

  cargarFolio$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.cargarFolio ),
      exhaustMap(
          ({id}) => this.foliosService.getFolioById(id)
                .then( (folio) => actions.cargarFolioSuccess({folio}))
                .catch( err => actions.cargarFolioError({payload: err}))
          )
      )
  );

  generarFolio$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.generarFolio ),
      concatMap(
          ({id}) => this.foliosService.generarFolio(id)
                .then( (folio) => actions.generarFolioSuccess({folio}))
                .catch( err => actions.generarFolioError({payload: err}))
          )
      )
  );

}
