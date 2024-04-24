import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Servicio, TareaOT } from 'app/models/tarea-ot.model';
import { AppState } from 'app/store/app.reducers';
import * as moment from 'moment';
// import { analytics } from '../dashboard.data';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html'
})
export class AnalyticsComponent implements OnInit {

  public tareas: TareaOT[] = [];
  public servicios: any[] = [];
  public loading: boolean = false;
  public error: any;
  
  public analytics: any[] = [];
  public showXAxis = true;
  public showYAxis = true;
  public gradient = false;
  public showLegend = false;
  public showXAxisLabel = true;
  public xAxisLabel = 'Mes';
  public showYAxisLabel = true;
  public yAxisLabel = 'Servicios';

  tipoServicio = [
    { value: Servicio.SERVICIO_DE_EMERGENCIA, viewValue: Servicio.SERVICIO_DE_EMERGENCIA },
    { value: Servicio.MANTENIMIENTO_PREVENTIVO, viewValue: Servicio.MANTENIMIENTO_PREVENTIVO },
    { value: Servicio.TRABAJO_PROGRAMADO, viewValue: Servicio.TRABAJO_PROGRAMADO },
    { value: Servicio.REVISION_DE_EQUIPOS, viewValue: Servicio.REVISION_DE_EQUIPOS },
  ];

  public colorScheme = {
    domain: ['#FFFF26', '#039BE5', '#FF5252', '#283593']
  }; 

  opcionesPeriodo = [
    { value: "0", viewValue: "anual" },
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
  public autoScale = true;
  public roundDomains = true;
  @ViewChild('resizedDiv') resizedDiv:ElementRef;
  public previousWidthOfResizedDiv:number = 0; 

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    // this.analytics = analytics; 

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
    this.analytics = [];
    this.tipoServicio.forEach( tipo => {
        let analitic = {
            name: tipo.viewValue,
            series: []
        };
      
        this.opcionesPeriodo.forEach( mes => {
          if(mes.value !== this.opcionesPeriodo[0].value){ // Se omiten los anuales.
            const serie = {
              name: mes.viewValue,
              value: this.tareas.filter( ot => 
                ot.tasks_log_task_type_main === tipo.viewValue     // mismo servicio
                && (ot.initial_date?.substring(5,7) === mes.value  // en el mes.
                || ot.initial_date?.substring(5,7) === mes.value)
              ).length
            };
            analitic.series.push(serie);
          }            
        });

        this.analytics.push(analitic);
    });
    console.log('Servicios', this.analytics);
  }

  onSelect(event) {
    console.log(event);
  }

  ngAfterViewChecked() {    
    // if(this.previousWidthOfResizedDiv != this.resizedDiv.nativeElement.clientWidth){
    //   this.analytics = [...analytics];
    // }
    this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
  }
}