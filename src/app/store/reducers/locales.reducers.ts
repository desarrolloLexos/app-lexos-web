import { cargarLocales, cargarLocalesError, cargarLocalesSuccess, insertarLocal, insertarLocalError, insertarLocalSuccess } from '../actions';
import { createReducer, on } from '@ngrx/store';

import { Local } from 'app/models/local.model';

export interface LocalesState {
    uid: string,
    locales? : Local[] | null,
    loaded : boolean,
    loading: boolean,
    error  : any,
}

export const LocalesInitialState: LocalesState = {
    uid: null,
    locales  : [],
    loaded : false,
    loading: false,
    error  : null,
    // user   : [],
}

export const localesReducers = createReducer(
  LocalesInitialState,
  on(cargarLocales, (state, {uid}) => ({
    ...state,
    loading: true,
    uid: uid
  })),

  on(cargarLocalesSuccess, (state, { locales }) => ({
    ...state,
    loading: false,
    loaded: true,
    locales: [...locales],
  })),

  on(cargarLocalesError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),

  on(insertarLocal, (state, { uid, local }) => ({
    ...state,
    loading     : true,
    uid         : uid,
    local      : local
  })),

  on(insertarLocalSuccess, (state, { local }) => ({
    ...state,
    loading: false,
    loaded: true,
    local: local,
  })),

  on(insertarLocalError, (state, { payload }) => ({
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
