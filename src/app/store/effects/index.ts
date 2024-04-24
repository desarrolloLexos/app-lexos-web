import { ContadorEffects } from "./contador.effects";
import { TareasEffects } from "./tareas.effects";
import { UsuarioEffects } from "./usuario.effects";
import { PagesEffects } from './pages.effects';
import { ClientesEffects } from './clientes.effects';
import { EquiposEffects } from "./equipos.effects";
import { LocalesEffects } from "./locales.effects";
import { UsuariosEffects } from './usuarios.effects';
import { FolioEffects } from './folio.effects';
import { TareaEffects } from './tarea.effects';
import { ListasEffects } from './listas.effects';

export const EffectsArray: any[] = [
  UsuarioEffects,
  TareasEffects,
  TareaEffects,
  ContadorEffects,
  PagesEffects,
  ClientesEffects,
  EquiposEffects,
  LocalesEffects,
  UsuariosEffects,
  FolioEffects,
  ListasEffects
];
