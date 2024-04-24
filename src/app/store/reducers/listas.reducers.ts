import * as actions from 'app/store/actions';
import { createReducer, on } from '@ngrx/store';

import { TipoFalla } from 'app/models/tipo-falla.model';
import { MetodoDeteccion } from 'app/models/metodo-deteccion.model';
import { CausaFalla } from 'app/models/causa-falla.model';
import { Lista } from 'app/models/lista.model';

export interface TipoFallasState {
  tipoFallas: TipoFalla[],
  tipoFalla: TipoFalla,
  loaded: boolean,
  loading: boolean,
  error: any,
}

export interface CausaFallasState {
  causaFallas: CausaFalla[],
  causaFalla: CausaFalla,
  loaded: boolean,
  loading: boolean,
  error: any,
}

export interface MetodosDeteccionState {
  metodosDeteccion: MetodoDeteccion[],
  metodoDeteccion: MetodoDeteccion,
  loaded: boolean,
  loading: boolean,
  error: any,
}

export interface MotivosDetencionState {
  motivosDetencion: Lista[],
  motivoDetencion: Lista,
  loaded: boolean,
  loading: boolean,
  error: any,
}


export const tipoFallasInitialState: TipoFallasState = {
  tipoFallas: [],
  tipoFalla: null,
  loaded: false,
  loading: false,
  error: null,
}

export const causaFallasInitialState: CausaFallasState = {
  causaFallas: [],
  causaFalla: null,
  loaded: false,
  loading: false,
  error: null,
}

export const metodosDeteccionInitialState: MetodosDeteccionState = {
  metodosDeteccion: [],
  metodoDeteccion: null,
  loaded: false,
  loading: false,
  error: null,
}

export const motivosDetencionInitialState: MotivosDetencionState = {
  motivosDetencion: [],
  motivoDetencion: null,
  loaded: false,
  loading: false,
  error: null,
}

export const tipoFallasReducer = createReducer(
  tipoFallasInitialState,
  on(actions.cargarTipoFalla, state => ({ ...state, loading: true })),

  on(actions.cargarTipoFallaSuccess, (state, { tipoFallas }) => ({
    ...state,
    loading: false,
    loaded: true,
    tipoFallas: [...tipoFallas]
  })),

  on(actions.cargarTipoFallaError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),
  
  on(actions.insertarTipoFalla, (state, { tipoFalla }) => ({ 
    ...state, 
    loading: true, 
    loaded: false,
    tipoFalla: tipoFalla
  })),
  on(actions.insertarTipoFallaSuccess, (state, { tipoFalla }) => ({
    ...state, 
    loading: false, 
    loaded: true, 
    tipoFalla: tipoFalla
  })),
  on(actions.insertarTipoFallaError, (state, { payload }) => ({
    ...state, 
    loading: false, 
    loaded: false,
    error: { url: payload.url, 
            name: payload.name, 
         message: payload.message }
  })),
);

export const causaFallasReducer = createReducer(
  causaFallasInitialState,
  on(actions.cargarCausaFalla, state => ({ ...state, loading: true })),

  on(actions.cargarCausaFallaSuccess, (state, { causaFallas }) => ({
    ...state,
    loading: false,
    loaded: true,
    causaFallas: [...causaFallas]
  })),

  on(actions.cargarCausaFallaError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

  on(actions.insertarCausaFalla, (state, { causaFalla }) => ({ 
    ...state, 
    loading: true, 
    loaded: false,
    causaFalla: causaFalla
  })),
  on(actions.insertarCausaFallaSuccess, (state, { causaFalla }) => ({
    ...state, 
    loading: false, 
    loaded: true, 
    causaFalla: causaFalla
  })),
  on(actions.insertarCausaFallaError, (state, { payload }) => ({
    ...state, 
    loading: false, 
    loaded: false,
    error: { url: payload.url, 
            name: payload.name, 
         message: payload.message }
  })),
);

export const metodosDeteccionReducer = createReducer(
  metodosDeteccionInitialState,
  on(actions.cargarMetodoDeteccion, state => ({ ...state, loading: true })),

  on(actions.cargarMetodoDeteccionSuccess, (state, { metodosDeteccion }) => ({
    ...state,
    loading: false,
    loaded: true,
    metodosDeteccion: [...metodosDeteccion]
  })),

  on(actions.cargarMetodoDeteccionError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

  on(actions.insertarMetodoDeteccion, (state, { metodoDeteccion }) => ({ 
    ...state, 
    loading: true, 
    metodoDeteccion: metodoDeteccion
  })),
  on(actions.insertarMetodoDeteccionSuccess, (state, { metodoDeteccion }) => ({
    ...state, 
    loading: false, 
    loaded: true, 
    metodoDeteccion: metodoDeteccion
  })),
  on(actions.insertarMetodoDeteccionError, (state, { payload }) => ({
    ...state, 
    loading: false, 
    loaded: false,
    error: { url: payload.url, 
            name: payload.name, 
         message: payload.message }
  })),
);

export const motivosDetencionReducer = createReducer(
  motivosDetencionInitialState,
  on(actions.cargarMotivoDetencion, state => ({ ...state, loading: true })),
  on(actions.cargarMotivoDetencionSuccess, (state, { motivosDetencion }) => ({
    ...state, 
    loading: false, 
    loaded: true, 
    motivosDetencion: [...motivosDetencion]
  })),
  on(actions.cargarMotivoDetencionError, (state, { payload }) => ({
    ...state, 
    loading: false, 
    loaded: false,
    error: { url: payload.url, 
            name: payload.name,
         message: payload.message }
  })),
  on(actions.insertarMotivoDetencion, (state, { motivoDetencion }) => ({ 
    ...state, 
    loading: true, 
    motivoDetencion: motivoDetencion
  })),
  on(actions.insertarMotivoDetencionSuccess, (state, { motivoDetencion }) => ({
    ...state, 
    loading: false, 
    loaded: true, 
    motivoDetencion: motivoDetencion
  })),
  on(actions.insertarMotivoDetencionError, (state, { payload }) => ({
    ...state, 
    loading: false, 
    loaded: false,
    error: { url: payload.url, 
            name: payload.name, 
         message: payload.message }
  })),
);