import * as actions from './../actions';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Injectable } from '@angular/core';
import { exhaustMap, concatMap} from 'rxjs';
import { ListasService } from 'app/services/listas.services';

@Injectable()
export class ListasEffects {


  constructor(
    private actions$: Actions,
    private listasService: ListasService
  ) {}

 /**
  *  URL: https://www.youtube.com/watch?v=uyW48EQge-8&t=624s
  *  We can use different Rxjs operator for different scenarios like:
  *  MergeMap -  can be used for Deleting items
  *  concatMap - can be used for Updating or creating items
  *  exhaustMap - can be used for getting some data from the server.
  *  switchMap - can be used for search functions.
  **/

  cargarTipoFalla$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.cargarTipoFalla ),
      exhaustMap(
          () => this.listasService.getListaTipoFalla()
                .then( (tipoFallas) => actions.cargarTipoFallaSuccess({tipoFallas}))
                .catch( err => actions.cargarTipoFallaError({payload: err}))
          )
      )
  );

  insertarTipoFalla$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.insertarTipoFalla ),
      concatMap(
          ({tipoFalla}) => this.listasService.setTipoFalla(tipoFalla)
                .then( (tipoFalla) => actions.insertarTipoFallaSuccess({tipoFalla}))
                .catch( err => actions.insertarTipoFallaError({payload: err}))
          )
      )
  );


  cargarCausaFalla$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.cargarCausaFalla ),
      exhaustMap(
          () => this.listasService.getListaCausaFalla()
                .then( (causaFallas) => actions.cargarCausaFallaSuccess({causaFallas}))
                .catch( err => actions.cargarCausaFallaError({payload: err}))
          )
      )
  );

  insertarCausaFalla$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.insertarCausaFalla ),
      concatMap(
          ({causaFalla}) => this.listasService.setCausaFalla(causaFalla)
                .then( (causaFalla) => actions.insertarCausaFallaSuccess({causaFalla}))
                .catch( err => actions.insertarCausaFallaError({payload: err}))
          )
      )
  );


  cargarMetodoDeteccion$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.cargarMetodoDeteccion ),
      exhaustMap(
          () => this.listasService.getListaMetodoDeteccion()
                .then( (metodosDeteccion) => actions.cargarMetodoDeteccionSuccess({metodosDeteccion}))
                .catch( err => actions.cargarMetodoDeteccionError({payload: err}))
          )
      )
  );

  cargarMotivosDetencion$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.cargarMotivoDetencion ),
      exhaustMap(
          () => this.listasService.getListaMotivosDetencion()
                .then( (motivosDetencion) => actions.cargarMotivoDetencionSuccess({motivosDetencion}))
                .catch( err => actions.cargarMotivoDetencionError({payload: err}))
          )
      )
  );

  insertarMotivosDetencion$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.insertarMotivoDetencion ),
      concatMap(
          ({motivoDetencion}) => this.listasService.setMotivoDetencion(motivoDetencion)
                .then( (motivoDetencion) => actions.insertarMotivoDetencionSuccess({motivoDetencion}))
                .catch( err => actions.cargarMotivoDetencionError({payload: err}))
          )
      )
  );

  insertarMetodoDeteccion$ = createEffect(
    () => this.actions$.pipe(
      ofType( actions.insertarMetodoDeteccion ),
      concatMap(
          ({metodoDeteccion}) => this.listasService.setMetodoDeteccion(metodoDeteccion)
                .then( (metodoDeteccion) => actions.insertarMetodoDeteccionSuccess({metodoDeteccion}))
                .catch( err => actions.insertarMetodoDeteccionError({payload: err}))
          )
      )
  );


}
