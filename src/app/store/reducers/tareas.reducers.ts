import * as actions from './../actions';

import { createReducer, on } from '@ngrx/store';

import { TareaOT } from '../../models/tarea-ot.model';

export interface TareasOTState {
  tareas    : TareaOT[],
  loaded    : boolean,
  loading   : boolean,
  error     : any,
  tareaOT   : TareaOT,
  person_id : number,
  reporte   : TareaOT[]
}

export const initialStateTareasOT: TareasOTState = {
  tareas    : [],
  loaded    : false,
  loading   : false,
  error     : null,
  tareaOT   : null,
  person_id : null,
  reporte   : []
}

export const tareasOTReducer = createReducer(
  initialStateTareasOT,

  // Reducers relacionados a la carga inicial de las Ordenes de Trabajo.
  on(actions.getTareasOT, state => ({...state, loading: true})),
  on(actions.getTareasOTSuccess, (state, { tareasOT }) => ({...state, loading: false, loaded: true, tareas: [...tareasOT]})),
  on(actions.getTareasOTError, (state, { payload }) => ({   ...state, loading: false,  loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

  // Reducers relacionados a la carga de scroll infinito en listado de Ordenes de Trabajo.
  on(actions.getTareasOTScroll, state => ({ ...state, loading: true})),
  on(actions.getTareasOTScrollSuccess, (state, { tareasOT }) => ({...state, loading: false,  loaded: true,
    tareas: state.tareas.concat([ ...tareasOT])     // para no perder el listado anterior, se contatena
  })),
  on(actions.getTareasOTScrollError, (state, { payload }) => ({   ...state, loading: false,  loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

  // Reducers relacionados a la carga de tareas de un usuario asignado (técnico)
  on(actions.getTareasOTByIdAssignerUser, (state, {person_id}) => ({...state, loading: true, person_id: person_id})),
  on(actions.getTareasOTByIdAssignerUserSuccess, (state, { tareasOT }) => ({...state, loading: false, loaded: true, tareas: [...tareasOT]})),
  on(actions.getTareasOTByIdAssignerUserError, (state, { payload }) => ({   ...state, loading: false,  loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

  // Reducers relacionados con el listado de OT asignadas y pendientes por realizar.
  on(actions.getTareasOTAssignedAndPending, (state) => ({...state, loading: true})),
  on(actions.getTareasOTAssignedAndPendingSuccess, (state, { tareasOT }) => ({...state, loading: false, loaded: true, tareas: [...tareasOT]})),
  on(actions.getTareasOTAssignedAndPendingError, (state, { payload }) => ({   ...state, loading: false,  loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

   // Reducers relacionados a la creación de una tarea en el Firebase Cloud Firestore.
   on(actions.crearTareaOT, (state, {tareaOT}) => ({ ...state, tareaOT: tareaOT})),
   on(actions.crearTareaOTSuccess, (state, { tareaOT }) => ({...state, loading: false,  loaded: true,
      tareaOT: tareaOT
   })),
   on(actions.crearTareaOTError, (state, { payload }) => ({   ...state, loading: false,  loaded: false,
     error: {
       url: payload.url,
       name: payload.name,
       message: payload.message
     }
   })),

  on( actions.UnSetTareasOT, (state) => ({ ...state, tareas: [] })),


  // Reducers relacionados con el listado de reporte.
  on(actions.getTareasReport, (state) => ({...state, loading: true})),
  on(actions.getTareasReportSuccess, (state, { reporte }) => ({...state, loading: false, loaded: true, reporte: [...reporte]})),
  on(actions.getTareasReportError, (state, { payload }) => ({   ...state, loading: false,  loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

);
