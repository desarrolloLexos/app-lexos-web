import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Servicio, TareaOT } from 'app/models/tarea-ot.model';
import { AppState } from 'app/store/app.reducers';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';

@Component({
  selector: 'app-info-cards',
  templateUrl: './info-cards.component.html',
  styleUrls: ['./info-cards.component.scss']
})
export class InfoCardsComponent implements OnInit { 
  public tareas: TareaOT[] = [];
  public loading: boolean = false;
  public error: any;

  
  public programados: any[];
  public emergencias: any[];
  public revisiones: any[];
  public mantenciones: any[];
  public colorScheme = {
    domain: ['rgba(255,255,255,0.8)']
  }; 
  public autoScale = true;
  @ViewChild('resizedDiv') resizedDiv:ElementRef;
  public previousWidthOfResizedDiv:number = 0; 
  public settings: Settings;

  tipoServicio = [
    { value: Servicio.SERVICIO_DE_EMERGENCIA, viewValue: Servicio.SERVICIO_DE_EMERGENCIA },
    { value: Servicio.MANTENIMIENTO_PREVENTIVO, viewValue: Servicio.MANTENIMIENTO_PREVENTIVO },
    { value: Servicio.TRABAJO_PROGRAMADO, viewValue: Servicio.TRABAJO_PROGRAMADO },
    { value: Servicio.REVISION_DE_EQUIPOS, viewValue: Servicio.REVISION_DE_EQUIPOS },
  ];

  opcionesPeriodo = [
    // { value: "0", viewValue: "anual" },
    { value: "01", viewValue: "enero" },
    { value: "02", viewValue: "febrero" },
    { value: "03", viewValue: "marzo" },
    { value: "04", viewValue: "abril" },
    { value: "05", viewValue: "mayo" },
    { value: "06", viewValue: "junio" },
    { value: "07", viewValue: "julio" },
    { value: "08", viewValue: "agosto" },
    { value: "09", viewValue: "septiembre" },
    { value: "10", viewValue: "octubre" },
    { value: "11", viewValue: "noviembre" },
    { value: "12", viewValue: "diciembre" },
  ];
  
  constructor(public appSettings:AppSettings,
              private store: Store<AppState>){
    this.settings = this.appSettings.settings; 
  }

  ngOnInit(){
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
    this.emergencias = [];
    this.revisiones = [];
    this.programados = [];
    this.mantenciones = [];

    const revision = { 
      name: "Revisiones",
      series: []
    }

    const programado = { 
      name: "Programados",
      series: []
    }
   
    this.opcionesPeriodo.forEach( mes => {
      const totalMes =  this.tareas.filter( ot => 
                           ot.initial_date?.substring(5,7) === mes.value
                        || ot.initial_date?.substring(5,7) === mes.value).length;
      const cant_emergencias = this.tareas.filter( ot => 
                        ot.tasks_log_task_type_main === Servicio.SERVICIO_DE_EMERGENCIA
                        && (ot.initial_date?.substring(5,7) === mes.value
                        || ot.initial_date?.substring(5,7) === mes.value) ).length;
      const cant_revisiones = this.tareas.filter( ot => 
                        ot.tasks_log_task_type_main === Servicio.REVISION_DE_EQUIPOS
                        && (ot.initial_date?.substring(5,7) === mes.value
                        || ot.initial_date?.substring(5,7) === mes.value) ).length;
      const cant_programados = this.tareas.filter( ot => 
                        ot.tasks_log_task_type_main === Servicio.TRABAJO_PROGRAMADO
                        && (ot.initial_date?.substring(5,7) === mes.value
                        || ot.initial_date?.substring(5,7) === mes.value) ).length;
      const cant_mantenciones = this.tareas.filter( ot => 
                        ot.tasks_log_task_type_main === Servicio.MANTENIMIENTO_PREVENTIVO
                        && (ot.initial_date?.substring(5,7) === mes.value
                        || ot.initial_date?.substring(5,7) === mes.value) ).length;
      
      let valor = cant_emergencias;
      if(cant_emergencias > 0){
         const porcentaje = (cant_emergencias * 100) / totalMes;
         valor = Number(porcentaje.toFixed(2));
      }
      const emergencia = {
        name: mes.viewValue,
        value: valor
      };
      this.emergencias.push(emergencia);

      valor = cant_revisiones;
      if(cant_revisiones > 0){
        const proporcion = cant_revisiones / totalMes;
        valor = Number(proporcion.toFixed(2));
      }
      const revision_serie = {
        name: mes.viewValue,
        value: valor
      };
      revision.series.push(revision_serie);

      valor = cant_programados;
      if(cant_programados > 0){
        const proporcion = cant_programados / totalMes;
        valor = Number(proporcion.toFixed(3));
      }
      const programado_serie = {
        name: mes.viewValue,
        value: valor
      };
      programado.series.push(programado_serie);

      valor = cant_mantenciones;
      if(cant_mantenciones > 0){
         const porcentaje = (cant_mantenciones * 100) / totalMes;
         valor = Number(porcentaje.toFixed(3));
      }
      const mantencion = {
        name: mes.viewValue,
        value: valor
      };
      this.mantenciones.push(mantencion);
    });

    
    this.revisiones.push(revision);
    this.programados.push(programado);
  }
  
  public onSelect(event) {
    console.log(event);
  }

  ngOnDestroy(){
    // if(Array.isArray(this.programados)){
    //   this.programados[0].series.length = 0;
    //   this.revisiones[0].series.length = 0;
    // }   
    this.programados = []; 
    this.emergencias = []; 
    this.revisiones = []; 
    this.mantenciones = []; 
  }

  ngAfterViewChecked() {    
    if(this.previousWidthOfResizedDiv != this.resizedDiv.nativeElement.clientWidth){
      setTimeout(() => this.programados = [] ); 
      setTimeout(() => this.emergencias = [] ); 
      setTimeout(() => this.revisiones = [] ); 
      setTimeout(() => this.mantenciones = [] );
    }
    this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
  }

}