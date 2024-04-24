import { createAction, props } from '@ngrx/store';

import { Contador } from 'app/models/contador.model';

export const cargarContador = createAction(
        '[Contador] cargarContador',
        props<{id: string}>());

export const cargarContadorSuccess = createAction(
       '[Contador] cargar Contador Success',
        props<{contador: Contador}>());

export const cargarContadorError = createAction(
       '[Contador] cargar Contador Error',
        props<{ payload: any}>());
