import { createAction, props } from '@ngrx/store';

import { TareaOT } from 'app/models/tarea-ot.model';

// Acciones para la carga inicial de la obtención de las Ordenes de Trabajo.
export const getTareasOT         = createAction('[Tareas OT] Get TareasOT');
export const getTareasOTSuccess  = createAction('[Tareas OT] Get TareasOT Success',
                                                (tareasOT: TareaOT[]) => ({ tareasOT }));
export const getTareasOTError    = createAction('[Tareas OT] Get TareasOT Fail',
                                                 props<{payload: any}>());

// Acciones para el listado general de Ordenes de Trabajo, mediante Scroll.
export const getTareasOTScroll        = createAction('[Tareas OT] Get TareasOT Scroll');
export const getTareasOTScrollSuccess = createAction('[Tareas OT] Get TareasOT Scroll Success',
                                                      props<{tareasOT: TareaOT[]}>());
export const getTareasOTScrollError   = createAction('[Tareas OT] Get TareasOT Scroll Error',
                                                      props<{ payload: any}>());
 
// Acciones para el listado general de Ordenes de Trabajo, mediante Scroll.
export const getTareasOTByIdAssignerUser = createAction('[Tareas OT] Get TareasOT By IdAssigner', 
    props<{ person_id: number }>());
export const getTareasOTByIdAssignerUserSuccess = createAction('[Tareas OT] Get TareasOT By IdAssigner Success',
    props<{ tareasOT: TareaOT[] }>());
export const getTareasOTByIdAssignerUserError = createAction('[Tareas OT] Get TareasOT By IdAssigner Error',
    props<{ payload: any }>());


 // Acciones para crear una tarea en el firebase.
 // Primero se le envía el objeto TareaOT para crear, luego de estar bien, se obtiene
 // el mismo objeto pero con los ID autogenerados.
export const crearTareaOT        = createAction('[Tareas OT] crear Tarea',
                                                props<{tareaOT: TareaOT}>());
export const crearTareaOTSuccess = createAction('[Tareas OT] crear Tarea Success',
                                                props<{tareaOT: TareaOT}>());
export const crearTareaOTError   = createAction('[Tareas OT] crear Tarea Error',
                                                props<{ payload: any}>()); 


export const actualizarTareaOT        = createAction('[Tareas OT] actualizar Tarea',
                                                props<{tareaOT: TareaOT}>());
export const actualizarTareaOTSuccess = createAction('[Tareas OT] actualizar Tarea Success',
                                                props<{ exito: boolean}>());
export const actualizarTareaOTError   = createAction('[Tareas OT] actualizar Tarea Error',
                                                props<{ payload: any}>());


// Acciones para ver las OT asignadas y pendientes por realizar.
export const getTareasOTAssignedAndPending = createAction('[Tareas OT] Get TareasOT Assigned and Pending');
export const getTareasOTAssignedAndPendingSuccess = createAction('[Tareas OT] Get TareasOT Assigned and Pending Success',
props<{ tareasOT: TareaOT[] }>());
export const getTareasOTAssignedAndPendingError = createAction('[Tareas OT] Get TareasOT Assigned and Pending Error',
props<{ payload: any }>());


export const UnSetTareasOT = createAction('[Tareas OT] Unset Tareas OT');

// Acciones para reportería.
export const getTareasReport = createAction('[Tareas OT] Get TareasOT By Report', 
    props<{ fechaDesde: string, fechaHasta: string }>());
export const getTareasReportSuccess = createAction('[Tareas OT] Get TareasOT By Report Success',
    props<{ reporte: TareaOT[] }>());
export const getTareasReportError = createAction('[Tareas OT] Get TareasOT By Report Error',
    props<{ payload: any }>());

