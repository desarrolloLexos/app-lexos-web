import { createAction, props } from '@ngrx/store';

import { Pages } from 'app/models/pages.model';

export const cargarPages = createAction(
    '[Pages] Cargar Pages');

export const cargarPagesSuccess = createAction(
  '[Pages] cargar Pages Success',
    props<{page: Pages}>());

export const cargarPagesError = createAction(
  '[Pages] cargar Pages Error',
    props<{ payload: any}>());

export const setPages = createAction(
      '[Pages] Setear Pages', props<{page: Pages}>());
