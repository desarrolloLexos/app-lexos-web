import { createReducer, on } from '@ngrx/store';
import { setUser, unSetUser } from '../actions/auth.actions';

import { Usuario } from 'app/models/usuario.model';

export interface AuthState {
    user: Usuario | null;
}

export const initialState: AuthState = {
   user: null,
}

export const authReducer = createReducer(
  initialState,
  on(setUser, (state, { user }) => ({ ...state, user:{ ...user }})),
  on(unSetUser, state => ({ ...state, user: null })),

);
