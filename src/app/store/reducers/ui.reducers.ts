import { createReducer, on } from '@ngrx/store';
import { isLoading, porcentage, stopLoading } from '../actions';

export interface UIState {
    isLoading: boolean;
    porcentaje: number;
}

export const initialUIState: UIState = {
   isLoading: false,
   porcentaje: null
}

export const uiReducer = createReducer(
  initialUIState,
  on(isLoading,   state => ({ ...state, isLoading: true })),
  on(stopLoading, state => ({ ...state, isLoading: false})),
  on(porcentage, (state, {porcentaje}) =>
                 ({ ...state, porcentaje: porcentaje}))
  );