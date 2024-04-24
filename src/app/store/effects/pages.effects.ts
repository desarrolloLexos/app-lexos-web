import * as actions from './../actions';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, exhaustMap } from 'rxjs';

import { Injectable } from '@angular/core';
import { PagesService } from '../../services/pages.service';

@Injectable()
export class PagesEffects {


  constructor(
  private actions$: Actions,
  private pagesService: PagesService
  ) {}

 /**
  *  URL: https://www.youtube.com/watch?v=uyW48EQge-8&t=624s
  *  We can use different Rxjs operator for different scenarios like:
  *  MergeMap -  can be used for Deleting items
  *  concatMap - can be used for Updating or creating items
  *  exhaustMap - can be used for getting some data from the server.
  *  switchMap - can be used for search functions.
  **/

  cargarPages$ = createEffect(
  () => this.actions$.pipe(
    ofType( actions.cargarPages ),
    exhaustMap(
      () => this.pagesService.getPage()
        .then( (page) => actions.cargarPagesSuccess({page}))
        .catch( err => actions.cargarPagesError({payload: err}))
      )
    )
  );

  setPages$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.setPages ),
      concatMap(
        ({page}) => this.pagesService.setPage(page)
          .then( (page) => actions.cargarPagesSuccess({page}))
          .catch( err => actions.cargarPagesError({payload: err}))
        )
      )
    );

}
