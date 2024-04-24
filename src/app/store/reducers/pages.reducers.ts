import * as actions from './../actions';

import { createReducer, on } from '@ngrx/store';

import { Pages } from 'app/models/pages.model';

export interface PageState {
    page : Pages;
    error: any;
}

export const initialStatePage: PageState = {
   page: {showTareasOT: false},
   error: null
}

export const pagesReducer = createReducer(
  initialStatePage,
  // Reducers relacionados a la carga de configuración de páginas.
  on(actions.setPages, (state, {page}) => ({...state, page: page})),
  on(actions.cargarPages, state => ({...state})),
  on(actions.cargarPagesSuccess, (state, { page }) => ({...state, page: page})),
  on(actions.cargarPagesError, (state, { payload }) => ({   ...state,
    error: {
      url: payload.url,
      name: payload.name,
      message: payload.message
    }
  })),
);
