import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { TareaOT } from 'app/models/tarea-ot.model';
import { DialogData } from 'app/pages/tareas/detalle-ot/detalle-ot.component';
import { AppState } from 'app/store/app.reducers';
import * as moment from 'moment';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-tiles',
  templateUrl: './tiles.component.html',
  styleUrls: ['./tiles.component.scss']
})
export class TilesComponent implements OnInit {
    
  public tareas: TareaOT[] = [];
  public loading: boolean = false;
  public error: any;
  public count_ot_por_revisar: number;
  public count_ot_finalizadas: number;
  public count_ot_tecasignado: number;
  public count_ot_eq_detenido: number;
  public count_ot_emergencias: number;
  public count_ot_mpreventiva: number;
  
  public esTecnico: boolean = false;
  constructor(private store: Store<AppState>,
              public dialog: MatDialog,
              public authService: AuthService) { }

  ngOnInit() {
    this.esTecnico = this.authService.esTecnico;
      
    this.store.select('tareas')
    .subscribe(({reporte, loading, error}) => {
        console.log('recibiendo ',reporte.length, ' tareas en reporte');
        this.tareas = reporte.filter( t => t.id_status_work_order !== 9);
        this.loading = loading;
        this.error = error;
        this.cargaValores();
    });
  }

  private cargaValores(){
    this.count_ot_por_revisar = this.tareas.filter( t => t.id_status_work_order === 8).length;
    this.count_ot_finalizadas = this.tareas.filter( t => t.id_status_work_order === 3).length;
    this.count_ot_tecasignado = this.tareas.filter( t => t.id_status_work_order === 6).length;
    this.count_ot_eq_detenido = this.tareas.filter( t => t.time_disruption === 'Sí').length;
    this.count_ot_emergencias = this.tareas.filter( t => t.tasks_log_task_type_main === 'Servicio de Emergencia').length;
    this.count_ot_mpreventiva = this.tareas.filter( t => t.tasks_log_task_type_main === 'Mantenimiento Preventivo').length;
  }


  openDialog(titulo: string) {
    let title: string = '';
    switch(titulo){
      case 'por_revisar': { title = 'OT Por Revisar'; break; }
      case 'finalizadas': { title = 'OT Finalizadas'; break; }
      case 'tec_asignado': { title = 'OT Técnico Asignado'; break; }
      case 'eq_detenido': { title = 'OT Equipos Detenidos'; break; }
      case 'emergencias': { title = 'OT Emergencias'; break; }
      case 'mp_preventiva': { title = 'OT Mantenciones Preventivas'; break; }
    }
    const dialogRef = this.dialog.open(TilesDialog, {
      data: { titulo: title, opcion: titulo}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}


@Component({
  selector: 'tiles-dialog',
  templateUrl: 'tiles-dialog.html',
})
export class TilesDialog {
  public tareas: TareaOT[] = [];
  public reporte: TareaOT[] = [];
  public loading: boolean = false;
  public error: any;
  public dataSource: any;
  public step = 0;

  selection = new SelectionModel<TareaOT>(true, []);
  
  public displayedColumns = [
    'wo_folio',
    'tasks_log_task_type_main',
    'id_status_work_order',
    'personnel_description',
    'local',
    'items_log_description',  
    'description',   
    'real_duration',           
    'cal_date_maintenance',
    'initial_date',
    'final_date',
    'wo_final_date',  
    'requested_by',
    'priorities_description'
];


  constructor(
    public dialogRef: MatDialogRef<TilesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private store: Store<AppState>
  ){
    
  }

  ngOnInit() {
      
    this.store.select('tareas')
    .subscribe(({reporte, loading, error}) => {
        console.log('recibiendo ',reporte.length, ' tareas en reporte');
        this.tareas = reporte.filter( t => t.id_status_work_order !== 9);
        this.loading = loading;
        this.error = error;
        this.cargaValores();
    });
  }

  private cargaValores(){
    switch(this.data.opcion){
      case 'por_revisar': {
        this.dataSource = this.tareas.filter( t => t.id_status_work_order === 8);
        break;
      }
      case 'finalizadas': {
        this.dataSource = this.tareas.filter( t => t.id_status_work_order === 3);
        break;
      }
      case 'tec_asignado': {
        this.dataSource = this.tareas.filter( t => t.id_status_work_order === 6);
        break;
      }
      case 'eq_detenido': {
        this.dataSource = this.tareas.filter( t => t.time_disruption === 'Sí');
        break;
      }
      case 'emergencias': {
        this.dataSource = this.tareas.filter( t => t.tasks_log_task_type_main === 'Servicio de Emergencia');
        break;
      }
      case 'mp_preventiva': {
        this.dataSource = this.tareas.filter( t => t.tasks_log_task_type_main === 'Mantenimiento Preventivo');
        break;
      }
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tareas.length;
    return numSelected === numRows;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: TareaOT): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.wo_folio + 1}`;
  }

  realDuration(initial_date: string, final_date: string){
    if(initial_date?.length > 0 && final_date?.length > 0){
      const startDate = moment(initial_date);
      const endDate = moment(final_date);
      const realDuration = endDate.diff(startDate);
      return moment(realDuration).utc().format("HH:mm");
    }
    return '';
  }
}

