import { createAction, props } from '@ngrx/store';

import { Cliente } from 'app/models/cliente.model';

export const cargarCliente = createAction(
        '[Cliente] cargarCliente',
        props<{uid: string}>());

export const cargarClienteSuccess = createAction(
       '[Cliente] cargar Cliente Success',
        props<{cliente: Cliente}>());

export const cargarClienteError = createAction(
       '[Cliente] cargar Cliente Error',
        props<{ payload: any}>());