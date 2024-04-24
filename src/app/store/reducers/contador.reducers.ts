import { cargarContador, cargarContadorError, cargarContadorSuccess } from '../actions';
import { createReducer, on } from '@ngrx/store';

import { Contador } from 'app/models/contador.model';

export interface ContadorState {
    id?       : string | null,
    contador? : Contador | null,
    loaded    : boolean,
    loading   : boolean,
    error     : any,
}

export const ContadorInitialState: ContadorState = {
    id        : null,
    contador  : null,
    loaded    : false,
    loading   : false,
    error     : null,
}

export const contadorReducer = createReducer(
  ContadorInitialState,
  on(cargarContador, (state, { id }) => ({
    ...state,
    loading: true,
    id:  id
  })),

  on(cargarContadorSuccess, (state, { contador }) => ({
    ...state,
    loading: false,
    loaded: true,
    contador: {...contador},
  })),

  on(cargarContadorError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  }))
);
