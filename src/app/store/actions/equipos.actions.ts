import { createAction, props } from '@ngrx/store';

import { Equipo } from 'app/models/equipo.model';

export const cargarEquipos = createAction(
        '[Equipos] cargar Equipos',
        props<{uid: string, codigolocal: string}>());

export const cargarEquiposSuccess = createAction(
       '[Equipos] cargar Equipos Success',
        props<{equipos: Equipo[]}>());

export const cargarEquiposError = createAction(
       '[Equipos] cargar Equipos Error',
        props<{ payload: any}>());

// Crear un nuevo equipo
// -------------------------------------------- Equipo
export const insertarEquipo = createAction(
        "[Equipo] insertar Equipo",
        props<{ uid: string, equipo: Equipo }>()
);

export const insertarEquipoSuccess = createAction(
        "[Equipo] insertar Equipo Success",
        props<{ equipo: Equipo }>()
);

export const insertarEquipoError = createAction(
        "[Equipo] insertar Equipo Error",
        props<{ payload: any }>()
);