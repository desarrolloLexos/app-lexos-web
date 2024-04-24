import { createAction, props } from '@ngrx/store';

import { TareaOT } from 'app/models/tarea-ot.model';

export const cargarTareaOT = createAction(
        '[TareaOT] cargar TareaOT',
        props<{id: number}>());

export const cargarTareaOTSuccess = createAction(
       '[TareaOT] cargar TareaOT Success',
        props<{tareas: TareaOT[]}>());

export const cargarTareaOTError = createAction(
       '[TareaOT] cargar TareaOT Error',
        props<{ payload: any}>());

export const cargarTareaOTByFolio = createAction(
        '[TareaOT] cargar TareaOT By Folio',
        props<{folio: string}>());

// Tareas hijas de una tarea
export const cargarTareaOTChilds = createAction(
        '[TareaOT] cargar TareaOT Childs',
        props<{id: number}>());

export const cargarTareaOTChildsSuccess = createAction(
        '[TareaOT] cargar TareaOT Childs Success',
        props<{tareasOT: TareaOT[]}>());

export const cargarTareaOTChildsError = createAction(
        '[TareaOT] cargar TareaOT Childs Error',
        props<{ payload: any}>());

export const limpiarTareaOT = createAction(
        '[TareaOT] limpiar TareaOT'
)