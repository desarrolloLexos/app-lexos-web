import * as reducers from './reducers';

import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
   usuarios: reducers.UsuariosState,
   usuario: reducers.UsuarioState,
   tareas: reducers.TareasOTState,
   tarea: reducers.TareaOTState,
   contadores: reducers.ContadorState,
   page: reducers.PageState,
   ui: reducers.UIState,
   user: reducers.AuthState,
   clientes: reducers.ClientesState,
   cliente: reducers.ClienteState,
   equipos: reducers.EquiposState,
   locales: reducers.LocalesState,
   folio: reducers.FolioState,
   tipoFallas: reducers.TipoFallasState,
   causaFallas: reducers.CausaFallasState,
   metodosDeteccion: reducers.MetodosDeteccionState,
   motivosDetencion: reducers.MotivosDetencionState
}

export const appReducers: ActionReducerMap<AppState> = {
   usuarios: reducers.usuariosReducer,
   usuario: reducers.UsuarioReducer,
   tareas: reducers.tareasOTReducer,
   tarea: reducers.tareaOTReducer,
   contadores: reducers.contadorReducer,
   page: reducers.pagesReducer,
   ui: reducers.uiReducer,
   user: reducers.authReducer,
   clientes: reducers.clientesReducer,
   cliente: reducers.clienteReducer,
   equipos: reducers.equiposReducer,
   locales: reducers.localesReducers,
   folio: reducers.folioReducer,
   tipoFallas: reducers.tipoFallasReducer,
   causaFallas: reducers.causaFallasReducer,
   metodosDeteccion: reducers.metodosDeteccionReducer,
   motivosDetencion: reducers.motivosDetencionReducer

}
