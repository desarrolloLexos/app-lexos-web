import { createAction, props } from "@ngrx/store";
import { CausaFalla } from "app/models/causa-falla.model";
import { Equipo } from "app/models/equipo.model";
import { Lista } from "app/models/lista.model";
import { MetodoDeteccion } from "app/models/metodo-deteccion.model";
import { TipoFalla } from "app/models/tipo-falla.model";

export const cargarTipoFalla = createAction("[TipoFalla] cargar TipoFalla");
export const cargarTipoFallaSuccess = createAction(
  "[TipoFalla] cargar TipoFalla Success",
  props<{ tipoFallas: TipoFalla[] }>()
);
export const cargarTipoFallaError = createAction(
  "[TipoFalla] cargar TipoFalla Error",
  props<{ payload: any }>()
);

export const cargarCausaFalla = createAction("[CausaFalla] cargar CausaFalla");
export const cargarCausaFallaSuccess = createAction(
  "[CausaFalla] cargar CausaFalla Success",
  props<{ causaFallas: CausaFalla[] }>()
);
export const cargarCausaFallaError = createAction(
  "[CausaFalla] cargar CausaFalla Error",
  props<{ payload: any }>()
);

// Métodos de Detección
export const cargarMetodoDeteccion = createAction(
  "[MetodoDeteccion] cargar MetodoDeteccion"
);
export const cargarMetodoDeteccionSuccess = createAction(
  "[MetodoDeteccion] cargar MetodoDeteccion Success",
  props<{ metodosDeteccion: MetodoDeteccion[] }>()
);
export const cargarMetodoDeteccionError = createAction(
  "[MetodoDeteccion] cargar MetodoDeteccion Error",
  props<{ payload: any }>()
);


// Motivos de Detención
export const cargarMotivoDetencion = createAction(
  "[MotivoDetencion] cargar MotivoDetencion"
);
export const cargarMotivoDetencionSuccess = createAction(
  "[MotivoDetencion] cargar MotivoDetencion Success",
  props<{ motivosDetencion: Lista[] }>()
);
export const cargarMotivoDetencionError = createAction(
  "[MotivoDetencion] cargar MotivoDetencion Error",
  props<{ payload: any }>()
);

/**
 * Opciones para crear una opción más en el cuadro de selección.
 */
// -------------------------------------------- Motivo Detencion
export const insertarMotivoDetencion = createAction(
  "[MotivoDetencion] insertar MotivoDetencion",
  props<{ motivoDetencion: Lista }>()
);

export const insertarMotivoDetencionSuccess = createAction(
  "[MotivoDetencion] insertar MotivoDetencion Success",
  props<{ motivoDetencion: Lista }>()
);

export const insertarMotivoDetencionError = createAction(
  "[MotivoDetencion] insertar MotivoDetencion Error",
  props<{ payload: any }>()
);
// -------------------------------------------- Método Detección
export const insertarMetodoDeteccion = createAction(
  "[MetodoDeteccion] insertar MetodoDeteccion",
  props<{ metodoDeteccion: MetodoDeteccion }>()
);

export const insertarMetodoDeteccionSuccess = createAction(
  "[MetodoDeteccion] insertar MetodoDeteccion Success",
  props<{ metodoDeteccion: MetodoDeteccion }>()
);

export const insertarMetodoDeteccionError = createAction(
  "[MetodoDeteccion] insertar MetodoDeteccion Error",
  props<{ payload: any }>()
);
// -------------------------------------------- Tipo Falla
export const insertarTipoFalla = createAction(
  "[TipoFalla] insertar TipoFalla",
  props<{ tipoFalla: TipoFalla }>()
);

export const insertarTipoFallaSuccess = createAction(
  "[TipoFalla] insertar TipoFalla Success",
  props<{ tipoFalla: TipoFalla }>()
);

export const insertarTipoFallaError = createAction(
  "[TipoFalla] insertar TipoFalla Error",
  props<{ payload: any }>()
);

// -------------------------------------------- Causa Falla
export const insertarCausaFalla = createAction(
  "[CausaFalla] insertar CausaFalla",
  props<{ causaFalla: CausaFalla }>()
);

export const insertarCausaFallaSuccess = createAction(
  "[CausaFalla] insertar CausaFalla Success",
  props<{ causaFalla: CausaFalla }>()
);

export const insertarCausaFallaError = createAction(
  "[CausaFalla] insertar CausaFalla Error",
  props<{ payload: any }>()
);