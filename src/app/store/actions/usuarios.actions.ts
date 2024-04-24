import { createAction, props } from '@ngrx/store';

import { Usuario } from '../../models/usuario.model';

export const cargarUsuarios = createAction('[Usuarios] cargarUsuarios');

export const cargarUsuariosSuccess = createAction(
       '[Usuarios] cargar Usuarios Success',
        props<{usuarios: Usuario[]}>());

export const cargarUsuariosError = createAction(
       '[Usuarios] cargar Usuarios Error',
        props<{ payload: any}>());  // El payload será algo grande.

export const setUsuarios = createAction(
       '[Usuarios] setUsuarios',
        props<{usuarios: Usuario[]}>()
  );

  export const UnSetUsuarios = createAction('[Usuarios] Unset Usuarios');
