import { cargarEquipos, cargarEquiposError, cargarEquiposSuccess, insertarEquipo, insertarEquipoError, insertarEquipoSuccess } from '../actions';
import { createReducer, on } from '@ngrx/store';

import { Equipo } from 'app/models/equipo.model';

export interface EquiposState {
    uid         : string,
    codigolocal : string,
    equipos?    : Equipo[] | null,
    equipo      : Equipo,
    loaded      : boolean,
    loading     : boolean,
    error       : any,
}

export const EquiposInitialState: EquiposState = {
    uid         : null,
    codigolocal : null,
    equipos     : [],
    equipo      : null,
    loaded      : false,
    loading     : false,
    error       : null,
    // user   : [],
}

export const equiposReducer = createReducer(
  EquiposInitialState,
  on(cargarEquipos, (state, {uid, codigolocal}) => ({
    ...state,
    loading: true,
    uid: uid,
    codigolocal: codigolocal
  })),

  on(cargarEquiposSuccess, (state, { equipos }) => ({
    ...state,
    loading: false,
    loaded: true,
    equipos: [...equipos],
  })),

  on(cargarEquiposError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

  on(insertarEquipo, (state, { uid, equipo }) => ({
    ...state,
    loading     : true,
    uid         : uid,
    equipo      : equipo
  })),

  on(insertarEquipoSuccess, (state, { equipo }) => ({
    ...state,
    loading: false,
    loaded: true,
    equipo: equipo,
  })),

  on(insertarEquipoError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

);
