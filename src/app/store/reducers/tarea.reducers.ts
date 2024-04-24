import * as actions from 'app/store/actions';
import { createReducer, on } from '@ngrx/store';

import { TareaOT } from 'app/models/tarea-ot.model';

export interface TareaOTState {
    uid?     : string | null,
    tareaOT? : TareaOT | null,
    loaded   : boolean,
    loading  : boolean,
    error    : any,
    updated  : boolean,
    id       : number,
    tareaOTChilds : TareaOT[] | null
}

export const tareaOTInitialState: TareaOTState = {
    uid     : null,
    tareaOT : null,
    loaded  : false,
    loading : false,
    error   : null,
    updated : null,
    id      : null,
    tareaOTChilds: []
}

export const tareaOTReducer = createReducer(
    tareaOTInitialState,
  on(actions.cargarTareaOT, (state, { id }) => ({
    ...state,
    loading: true,
    id:  id
  })),

  on(actions.cargarTareaOTSuccess, (state, { tareas }) => ({
    ...state,
    loading: false,
    loaded: true,
    tareaOT: tareas[0],
    tareaOTChilds: tareas.length > 1? tareas.slice(1, tareas.length) : []
  })),

  on(actions.cargarTareaOTError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),
  // ------------------------------ TAREAS HIJAS
  on(actions.cargarTareaOTChilds, (state, { id }) => ({
    ...state,
    loading: true,
    id:  id
  })),

  on(actions.cargarTareaOTChildsSuccess, (state, { tareasOT }) => ({
    ...state, 
    loading: false, 
    loaded: true, 
    tareaOTChilds: [...tareasOT]})),

  on(actions.cargarTareaOTChildsError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),
  // -----------------------------------------------
  on(actions.actualizarTareaOT, (state, { tareaOT }) => ({
    ...state,
    loaded: false,
    loading: true,
    tareaOT: tareaOT   
  })),

  on(actions.actualizarTareaOTSuccess, (state, { exito }) => ({
    ...state,
    loading: false,
    loaded: true,
    updated: exito,
  })),

  on(actions.actualizarTareaOTError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    updated: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

  on(actions.cargarTareaOTByFolio, (state) => ({
    ...state,
    loaded: false,
    loading: true,  
  })),

  on(actions.limpiarTareaOT, (state) => ({
    ...state,
    loaded: false,
    loading: false,
    tareaOT: null,
    tareaOTChilds: null   
  })),
);
