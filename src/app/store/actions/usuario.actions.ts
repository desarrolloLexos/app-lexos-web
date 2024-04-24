import { createAction, props } from '@ngrx/store';

import { Usuario } from '../../models/usuario.model';

export const cargarUsuario = createAction(
        '[Usuario] cargarUsuario',
        props<{id: string}>());

export const cargarUsuarioSuccess = createAction(
       '[Usuario] cargar Usuario Success',
        props<{usuario: Usuario}>());

export const cargarUsuarioError = createAction(
       '[Usuario] cargar Usuario Error',
        props<{ payload: any}>());  // E payload será algo grande.

export const cargarUsuarioByPersonId = createAction(
        '[Usuario] cargar Usuario By PersonID',
        props<{person_id: number}>());

export const cargarUsuarioByPersonIdSuccess = createAction(
        '[Usuario] cargar Usuario By PersonID Success',
        props<{usuario: Usuario}>());

export const cargarUsuarioByPersonIdError = createAction(
        '[Usuario] cargar Usuario By PersonID Error',
        props<{ payload: any}>());  // E payload será algo grande.

