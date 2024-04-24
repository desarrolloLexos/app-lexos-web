import { cargarFolio, cargarFolioError, cargarFolioSuccess } from '../actions';
import { createReducer, on } from '@ngrx/store';

import { Folio } from 'app/models/folio.model';
import { generarFolio, generarFolioSuccess, generarFolioError } from '../actions/folio.actions';

export interface FolioState {
    id?     : string | null,
    folio?   : Folio | null,
    loaded : boolean,
    loading: boolean,
    error  : any,
}

export const FolioInitialState: FolioState = {
    id    : null,
    folio  : null,
    loaded : false,
    loading: false,
    error  : null,
}

export const folioReducer = createReducer(
  FolioInitialState,
  on(cargarFolio, (state, { id }) => ({
    ...state,
    loading: true,
    id:  id
  })),

  on(cargarFolioSuccess, (state, { folio }) => ({
    ...state,
    loading: false,
    loaded: true,
    folio: {...folio},
  })),

  on(cargarFolioError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

  // para generar folio se usan otros actions:
  on(generarFolio, (state, { id }) => ({
    ...state,
    loading: true,
    id:  id
  })),

  on(generarFolioSuccess, (state, { folio }) => ({
    ...state,
    loading: false,
    loaded: true,
    folio: {...folio},
  })),

  on(generarFolioError, (state, { payload }) => ({
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
