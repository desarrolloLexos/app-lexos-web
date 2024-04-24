import * as actions from '../actions';

import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatMap, switchMap, catchError, map } from "rxjs/operators";

import { Injectable } from "@angular/core";
import { TareasService } from '../../services/tareas.service';
import { TareaOT } from 'app/models/tarea-ot.model';
import { of } from 'rxjs';

@Injectable()
export class TareasEffects {

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
  getTareasOT$ = createEffect(
    () => this.actions$.pipe(
            ofType(actions.getTareasOT),
            switchMap(
              () =>
                this.tareasService.initTareasOTListener()
                .then( (tareasOT) => {
                  console.log('Se han recibido correctamente tareas, cantidad: ', tareasOT.length);
                  return actions.getTareasOTSuccess(tareasOT);
                })
                .catch( err => {
                  console.error('No se pudo obtener tareas: ', err);
                  return actions.getTareasOTError({payload: err});
                })
            )
          )
  );

  // Primera configuración del Effect
  getTareasOTScroll$ = createEffect(
    // El createEffect necesita un Observable, y se lo damos de esta manera:
    () => this.actions$.pipe(
      // Evalúe la acción (no la cargue), cualquier otra acción no pasa del ofType.
      ofType( actions.getTareasOTScroll ),
       // Quiero disparar un nuevo Observable y que se una a la petición anterior
       concatMap(
        () => this.tareasService.getNextTareasOT()
          .then((tareas) => {
            console.log('getNextTareasOT cargadas satisfactoriamente, cantidad recibida: ', tareas.length);
            return actions.getTareasOTScrollSuccess({ tareasOT: tareas }); })
          .catch(err => {
            console.error('getNextTareasOT falló la obtención de datos.', err);
            return actions.getTareasOTScrollError({ payload: err }); })
      )
    )
  );

  getTareasOTByIdAssignerUser$ = createEffect(
    () => this.actions$.pipe(
            ofType(actions.getTareasOTByIdAssignerUser),
            switchMap(
              ({person_id}) =>
                this.tareasService.getTareaOTByIdAssignerUser(person_id)
                .then( (tareasOT) => {
                  console.log('Se han recibido correctamente tareas, cantidad: ', tareasOT.length);
                  return actions.getTareasOTByIdAssignerUserSuccess({tareasOT});
                })
                .catch( err => {
                  console.error('No se pudo obtener tareas: ', err);
                  return actions.getTareasOTByIdAssignerUserError({payload: err});
                })
            )
          )
  );

  getTareasOTAssignedAndPending$ = createEffect(
    () => this.actions$.pipe(
            ofType(actions.getTareasOTAssignedAndPending),
            switchMap(
              () =>
                this.tareasService.getTaskAssignedAndPending()
                .then( (tareasOT) => {
                  return actions.getTareasOTAssignedAndPendingSuccess({tareasOT});
                })
                .catch( err => {
                  return actions.getTareasOTAssignedAndPendingError({payload: err});
                })
            )
          )
  );

  crearTareaOT$ = createEffect(
    () => this.actions$.pipe(
            ofType(actions.crearTareaOT),
            concatMap(
              ({tareaOT}) => this.tareasService.crearTareaOT(tareaOT)
                .then( (tareaOT) => {
                  console.log('Se creó correctamente la tarea ID: ', tareaOT.id);
                  return actions.crearTareaOTSuccess({tareaOT});
                })
                .catch( err => {
                  console.error('No se pudo obtener tareas: ', err);
                  return actions.getTareasOTError({payload: err});
                })
            )
          )
  );

  getTareasReport$ = createEffect(
    () => this.actions$.pipe(
            ofType(actions.getTareasReport),
            switchMap(
              ({fechaDesde, fechaHasta}) =>
                this.tareasService.getReporteTiemposPromise(fechaDesde, fechaHasta)
                .then( (reporte) => {
                  return actions.getTareasReportSuccess({reporte});
                })
                .catch( err => {
                  return actions.getTareasReportError({payload: err});
                })
            )
          )
  );
  // getReporteTiemposPromise


   // Effects con Observable:
   // https://duncanhunter.gitbook.io/angular-and-ngrx/20.-create-effect
   // https://timdeschryver.dev/blog/start-using-ngrx-effects-for-this#effects-basic
  //  getTareasReport$ = createEffect(
  //   () => this.actions$.pipe(
  //           ofType(actions.getTareasReport),
  //           switchMap(
  //             (fechaDesde, fechaHasta) =>
  //               this.tareasService.getReporteTiempos(fechaDesde, fechaHasta)
  //               .pipe(
  //               map( (reporte: TareaOT[]) => {
  //                 console.log('Effect => Reporte recibidos', reporte?.length);
  //                 return actions.getTareasReportSuccess({reporte})
  //               }),
  //               catchError((err) => of(actions.getTareasReportError({payload: err})))
  //               )              
  //           )
  //         )
  // );
}
