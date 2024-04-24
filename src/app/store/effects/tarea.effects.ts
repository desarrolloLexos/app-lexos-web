import * as actions from '../actions';

import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatMap, switchMap } from "rxjs/operators";

import { Injectable } from "@angular/core";
import { TareasService } from '../../services/tareas.service';

@Injectable()
export class TareaEffects {

  constructor(
    // Los Actions de NgRx Effects están pendiente de todas las acciones de que disparan.
    // Son Observables que están escuchando las acciones.
    private actions$: Actions,
    private tareasService: TareasService
  ) {}

  /*
   * URL: https://www.youtube.com/watch?v=uyW48EQge-8&t=624s
    We can use different Rxjs operator for different scenarios like:
    MergeMap -  can be used for Deleting items
    concatMap - can be used for Updating or creating items
    exhaustMap - can be used for getting some data from the server.
    switchMap - can be used for search functions.
  */
  cargarTareaOT$ = createEffect(
    () => this.actions$.pipe(
            ofType(actions.cargarTareaOT),
            switchMap(
              ({id}) =>
                this.tareasService.getTareaOTById(id)
                .then( (tareas) => {                  
                  return actions.cargarTareaOTSuccess({tareas});
                })
                .catch( err => {
                  console.error('No se pudo obtener la tarea: ', err);
                  return actions.cargarTareaOTError({payload: err});
                })
            )
          )
  );

  cargarTareaOTChilds$ = createEffect(
    () => this.actions$.pipe(
            ofType(actions.cargarTareaOTChilds),
            switchMap(
              ({id}) =>
                this.tareasService.getTareasOTByIdParent(id)
                .then( (tareaOT) => {  
                  console.log('obtuvimos tareas hijos. ', tareaOT);                
                  return actions.cargarTareaOTChildsSuccess({tareasOT: tareaOT});
                })
                .catch( err => {
                  console.error('No se pudo obtener la tarea: ', err);
                  return actions.cargarTareaOTChildsError({payload: err});
                })
            )
          )
  );

  cargarTareaOTByFolio$ = createEffect(
    () => this.actions$.pipe(
            ofType(actions.cargarTareaOTByFolio),
            switchMap(
              ({folio}) =>
                this.tareasService.getTareasOTByFolio(folio)
                .then( (tareas) => {                  
                  return actions.cargarTareaOTSuccess({tareas});
                })
                .catch( err => {
                  console.error('No se pudo obtener la tarea por folio: ', err);
                  return actions.cargarTareaOTError({payload: err});
                })
            )
          )
  );

  actualizarTareaOT$ = createEffect(
    () => this.actions$.pipe(
            ofType(actions.actualizarTareaOT),
            concatMap(
              ({tareaOT}) =>
                this.tareasService.actualizarTareaOT(tareaOT)
                .then( () => {
                  console.log('Tarea ',tareaOT.wo_folio,' actualizada');
                  return actions.actualizarTareaOTSuccess({exito: true});
                })
                .catch( err => {
                  console.error('No se pudo obtener la tarea: ', err);
                  return actions.actualizarTareaOTError({payload: err});
                })
            )
          )
  );
}
