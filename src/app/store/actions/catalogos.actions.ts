import { createAction, props } from '@ngrx/store';

import { Usuario } from 'app/models/usuario.model';

export const setUsuarios = createAction('[Catalogo] setUsuarios',
      props<{usuarios: Usuario[]}>()
);

export const UnSetUsuarios = createAction('[Catalogo] setUsuarios');
