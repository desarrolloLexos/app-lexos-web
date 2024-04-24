import * as actions from '../actions';
import { createReducer, on } from '@ngrx/store';

import { Usuario } from 'app/models/usuario.model';

export interface UsuarioState {
    id?      : string | null,
    user?    : Usuario | null,
    loaded   : boolean,
    loading  : boolean,
    error    : any,
    person_id: number
}

export const UsuarioInitialState: UsuarioState = {
    id       : null,
    user     : null,
    loaded   : false,
    loading  : false,
    error    : null,
    person_id: null
    // user   : [],
}

export const UsuarioReducer = createReducer(
  UsuarioInitialState,
  on(actions.cargarUsuario, (state, { id }) => ({
    ...state,
    loading: true,
    id:  id
  })),

  on(actions.cargarUsuarioSuccess, (state, { usuario }) => ({
    ...state,
    loading: false,
    loaded: true,
    user: {...usuario},
  })),

  on(actions.cargarUsuarioError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

  on(actions.cargarUsuarioByPersonId, (state, {person_id}) => ({
      ...state,
      loading  : true,
      person_id: person_id      
    }
  )),

  on(actions.cargarUsuarioByPersonIdSuccess, (state, { usuario }) => ({
    ...state,
    loading: false,
    loaded: true,
    user: {...usuario},
  })),

  on(actions.cargarUsuarioByPersonIdError, (state, { payload }) => ({
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
