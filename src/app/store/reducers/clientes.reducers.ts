import { cargarClientes, cargarClientesError, cargarClientesSuccess } from '../actions';
import { createReducer, on } from '@ngrx/store';

import { Cliente } from 'app/models/cliente.model';

export interface ClientesState {
    clientes  : Cliente[],
    loaded : boolean,
    loading: boolean,
    error  : any,
    // user   : Clientes[]
}

export const clientesInitialState: ClientesState = {
    clientes  : [],
    loaded : false,
    loading: false,
    error  : null,
    // user   : [],
}

export const clientesReducer = createReducer(
  clientesInitialState,
  on(cargarClientes, state => ({ ...state, loading: true})),

  on(cargarClientesSuccess, (state, { clientes }) => ({
    ...state,
    loading: false,
    loaded: true,
    clientes: [ ...clientes]
  })),

  on(cargarClientesError, (state, { payload }) => ({
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
