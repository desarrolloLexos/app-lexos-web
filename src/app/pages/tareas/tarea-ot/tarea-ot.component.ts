import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from 'app/services/auth.service';
import { AppState } from 'app/store/app.reducers';
import * as actions from 'app/store/actions';
import { TareaOT } from 'app/models/tarea-ot.model';
import { TareasService } from 'app/services/tareas.service';
import { Subject } from 'rxjs';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-tarea-ot',
  templateUrl: './tarea-ot.component.html',
  styleUrls: ['./tarea-ot.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true, displayDefaultIndicatorType: false },
    },
  ],
})
export class TareaOtComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  public esTecnico: boolean = false;
  public esSupervisor: boolean = false;
  public esPersonalized: boolean = false;
  public esAdministrador: boolean = false;
  public esBodeguero: boolean = false;
  public otFinalizada: boolean = false;
  public tareaParentId: number;
  public crear: boolean = true;
  public tareasChilds: TareaOT[] = [];
  public tarea: TareaOT;
  public folioPrincipal: string;
  public existeFirmaAprobada = false;
  public vieneDe: string;
  constructor( private authService: AuthService,
               private store: Store<AppState>,
               private route: ActivatedRoute,
               private tareasService: TareasService,
               public dialog: MatDialog  ) { 
    this.tarea = null;
    this.tareasChilds = [];
    this.esTecnico = this.authService.esTecnico;
    this.esPersonalized = this.authService.esPersonalized;
    this.esSupervisor = this.authService.esSupervisor;
    this.esAdministrador = this.authService.esAdministrador;
    this.esBodeguero = this.authService.esBodeguero;

    this.route.queryParams.subscribe(params => {
      if (params) {
        if(params.id){
          console.log('QuertParams ID: ', params.id);
          this.crear = false;
          this.tareaParentId = Number(params.id);
        }

        if(params.from){
          this.vieneDe = params.from;
        }
      }else{
        console.log('QuertParams: ', params);
        this.crear = true;
       }
    });
  }

  ngOnInit(): void {
    // Obtenemos la tareas del STORE ya cargada.
    if(!this.crear){
      if(this.vieneDe && this.vieneDe === 'pages'){
        this.store.select('tarea').subscribe( state =>
          {
            this.tarea = state.tareaOT;
            this.tareaParentId = this.tarea?.id_parent_wo? this.tarea?.id_parent_wo: this.tarea?.id;
            this.folioPrincipal = this.tarea?.id_parent_wo? '' : this.tarea?.wo_folio;
            this.tareasChilds = state.tareaOTChilds;
          }
        );
      }else{
        this.store.select('tareas').subscribe( state =>
          {            
            // Cargamos la Tarea Principal y guardamos su folio
            this.tarea = state.reporte?.filter(tarea => tarea.id === this.tareaParentId)[0];
            this.folioPrincipal = this.tarea?.wo_folio;
            // Buscamos posibles tareas hijas
            this.tareasChilds = state.reporte?.filter( tarea => tarea.id_parent_wo == this.tarea?.id)
                                             .sort(((a, b) => a.id - b.id));
          }
        );
      }      
    } 
    
    this.dispararAccionesAlStore();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga en el STORE todos los listados para los combobox
   * que están en el detalle-ot.
   */
  private dispararAccionesAlStore(): void {
    this.store.dispatch(actions.cargarFolio({ id: 'tareas_ot' }));
    this.store.dispatch(actions.cargarClientes());
    this.store.dispatch(actions.cargarTipoFalla());
    this.store.dispatch(actions.cargarCausaFalla());
    this.store.dispatch(actions.cargarMetodoDeteccion());
    this.store.dispatch(actions.cargarMotivoDetencion());
  }

  cargarObjetos(){
    this.existeFirmaAprobada = (this.tarea.signature?.length > 0);
  }

  //--------------------------------------------- Mantenedores

  hasChildrenFalse(){
      console.log('Iniciando...');
      this.tareasService.updateAllTaskHasChildren()
      .then( () => console.log('Listo...'))
      .catch( err => console.error(err));
  }

  deleteByFolio(){
    const folio = "60091";
    console.log('Iniciando delete folio ', folio);
    this.tareasService.deleteDocByFolio(folio)
      .then( () => console.log('Listo...'))
      .catch( err => console.error(err));
  }

  IdParentWoToNull(){
    console.log('Iniciando...');
    this.tareasService.updateAllTaskIdParantWo()
    .then( () => console.log('Listo...'))
    .catch( err => console.error(err));
  }
}