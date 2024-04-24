import { createAction, props } from '@ngrx/store';

import { Local } from 'app/models/local.model';

export const cargarLocales = createAction(
        '[Locales] cargar Locales',
        props<{uid: string}>());

export const cargarLocalesSuccess = createAction(
       '[Locales] cargar Locales Success',
        props<{locales: Local[]}>());

export const cargarLocalesError = createAction(
       '[Locales] cargar Locales Error',
        props<{ payload: any}>());


// Crear un nuevo local
// -------------------------------------------- Local
export const insertarLocal = createAction(
        "[Locales] insertar Local",
        props<{ uid: string, local: Local }>()
);

export const insertarLocalSuccess = createAction(
        "[Locales] insertar Local Success",
        props<{ local: Local }>()
);

export const insertarLocalError = createAction(
        "[Locales] insertar Local Error",
        props<{ payload: any }>()
);