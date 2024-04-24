import { cargarCliente, cargarClienteError, cargarClienteSuccess } from '../actions';
import { createReducer, on } from '@ngrx/store';

import { Cliente } from 'app/models/cliente.model';

export interface ClienteState {
    uid?     : string | null,
    cliente?   : Cliente | null,
    loaded : boolean,
    loading: boolean,
    error  : any,
}

export const ClienteInitialState: ClienteState = {
    uid    : null,
    cliente  : null,
    loaded : false,
    loading: false,
    error  : null,
}

export const clienteReducer = createReducer(
  ClienteInitialState,
  on(cargarCliente, (state, { uid }) => ({
    ...state,
    loading: true,
    id:  uid
  })),

  on(cargarClienteSuccess, (state, { cliente }) => ({
    ...state,
    loading: false,
    loaded: true,
    cliente: {...cliente},
  })),

  on(cargarClienteError, (state, { payload }) => ({
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
