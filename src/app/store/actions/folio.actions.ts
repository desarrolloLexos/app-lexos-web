import { createAction, props } from '@ngrx/store';

import { Folio } from 'app/models/folio.model';

export const cargarFolio = createAction(
        '[Folio] cargar Folio',
        props<{id: string}>());

export const cargarFolioSuccess = createAction(
       '[Folio] cargar Folio Success',
        props<{folio: Folio}>());

export const cargarFolioError = createAction(
       '[Folio] cargar Folio Error',
        props<{ payload: any}>());


export const generarFolio = createAction(
        '[Folio] generar Folio',
        props<{id: string}>());

export const generarFolioSuccess = createAction(
       '[Folio] generar Folio Success',
        props<{folio: Folio}>());

export const generarFolioError = createAction(
       '[Folio] generar Folio Error',
        props<{ payload: any}>());