import { createAction, props } from '@ngrx/store';

import { Cliente } from 'app/models/cliente.model';

export const cargarClientes = createAction(
        '[Clientes] cargar Clientes');

export const cargarClientesSuccess = createAction(
       '[Clientes] cargar Clientes Success',
        props<{clientes: Cliente[]}>());

export const cargarClientesError = createAction(
       '[Clientes] cargar Clientes Error',
        props<{ payload: any}>());
