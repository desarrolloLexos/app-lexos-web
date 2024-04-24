import { createAction, props } from '@ngrx/store';

export const isLoading   = createAction('[UI Component] Is Loading');
export const stopLoading = createAction('[UI Component] Stop Loading');
export const porcentage  = createAction('[UI Component] Porcentage',
                                props<{ porcentaje: number}>()
                            );
