import { cargarUsuarios, cargarUsuariosError, cargarUsuariosSuccess } from '../actions';
import { createReducer, on } from '@ngrx/store';

import { Usuario } from 'app/models/usuario.model';

export interface UsuariosState {
    usuarios  : Usuario[],
    loaded : boolean,
    loading: boolean,
    error  : any,
    // user   : Usuario[]
}

export const usuariosInitialState: UsuariosState = {
    usuarios  : [],
    loaded : false,
    loading: false,
    error  : null,
    // user   : [],
}

export const usuariosReducer = createReducer(
  usuariosInitialState,
  on(cargarUsuarios, state => ({ ...state, loading: true})),

  on(cargarUsuariosSuccess, (state, { usuarios }) => ({
    ...state,
    loading: false,
    loaded: true,
    usuarios: [ ...usuarios]
  })),

  on(cargarUsuariosError, (state, { payload }) => ({
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
