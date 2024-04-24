import { createAction, props } from '@ngrx/store';

import { Usuario } from 'app/models/usuario.model';

export const setUser = createAction('[Auth Component] setUser',
      props<{user: Usuario}>()
);

export const unSetUser = createAction('[Auth Component] unSetUser');
