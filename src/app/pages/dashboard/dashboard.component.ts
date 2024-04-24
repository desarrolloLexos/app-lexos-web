import * as actions from 'app/store/actions';

import { Component, OnInit } from '@angular/core';

import { AppState } from '../../store/app.reducers';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { TareaOT } from 'app/models/tarea-ot.model';

const MAYOR_QUE = "% más que el mes anterior";
const MENOR_QUE = "% menos que el mes anterior";
const IGUAL = "igual cantidad que el mes anterior";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public tareas: TareaOT[] = [];
  public loading: boolean = false;
  public error: any;

  public ot_total_mes_actual  : number = 0;
  public ot_total_mes_anterior: string = '';
  public ot_total_mes_porcentual: string = '';
  public ot_total_diferencia:   number = 0;

  public ot_smu_mes_actual: number = 0;
  public ot_smu_mes_anterior: string = '';
  public ot_smu_mes_porcentual: string = '';
  public ot_smu_diferencia: number = 0;

  public ot_wallmart_mes_actual: number = 0;
  public ot_wallmart_mes_anterior: string = '';
  public ot_wallmart_mes_porcentual: string = '';
  public ot_wallmart_diferencia: number = 0;


  constructor(private store: Store<AppState>) {
    this.store.dispatch(actions.setPages({page: {showTareasOT: false}}));
    this.store.dispatch(actions.cargarUsuarios());

    // Ultimo semestre
    const dateUntil = moment();
    const dateFrom = moment().subtract("6", "months");

    console.log('cargando tareas de reporte deashboard.');
    this.store.dispatch(actions.getTareasReport(
    {
      fechaDesde: dateFrom.toISOString(),
      fechaHasta: dateUntil.toISOString()
    }
    ));
  }

  ngOnInit() {
    this.store.select('tareas')
    .subscribe(({reporte, loading, error}) => {
      if(reporte && reporte.length > 0){
        this.tareas = reporte;
        this.loading = loading;
        this.error = error;
        this.cargaValores();
      }       
    });
  }

  private cargaValores(){
    const month = moment(new Date()).format('YYYY-MM');;
    const month_old = moment(new Date()).subtract(1, 'months').format('YYYY-MM');
    
    // TOTAL
    this.ot_total_mes_actual =  this.tareas.filter( ot => 
                        ot.initial_date?.substring(0, 7) === month  
                        || ot.initial_date?.substring(0, 7) === month
                    ).length;
    const cant_mes_anterior =  this.tareas.filter( ot => 
                      ot.initial_date?.substring(0, 7) === month_old  
                      || ot.initial_date?.substring(0, 7) === month_old
                  ).length;
    this.ot_total_diferencia = ((this.ot_total_mes_actual / cant_mes_anterior) * 100) - 100;
    if(this.ot_total_diferencia > 0){
      this.ot_total_diferencia = Math.abs(this.ot_total_diferencia);
      this.ot_total_mes_porcentual = this.ot_total_diferencia.toFixed(2).concat(MAYOR_QUE);
    }else if(this.ot_total_diferencia < 0){
      this.ot_total_diferencia = Math.abs(this.ot_total_diferencia);
      this.ot_total_mes_porcentual = this.ot_total_diferencia.toFixed(2).concat(MENOR_QUE);      
    } else {
      this.ot_total_mes_porcentual =IGUAL;
    }
    

    // SMU
    this.ot_smu_mes_actual =  this.tareas.filter( ot => ot.cliente === 'SMU S.A' &&
           (ot.initial_date?.substring(0, 7) === month  
          || ot.initial_date?.substring(0, 7) === month)
      ).length;
    const cant_smu_anterior =  this.tareas.filter( ot => ot.cliente === 'SMU S.A' &&
           (ot.initial_date?.substring(0, 7) === month_old  
          || ot.initial_date?.substring(0, 7) === month_old)
    ).length;

    this.  ot_smu_diferencia = ((this.ot_smu_mes_actual / cant_smu_anterior) * 100) - 100;

    if(this.ot_smu_diferencia > 0){
      this.ot_smu_diferencia = Math.abs(this.ot_smu_diferencia);
      this.ot_smu_mes_porcentual = this.ot_smu_diferencia.toFixed(2).concat(MAYOR_QUE);
    }else if(this.ot_smu_diferencia < 0){
      this.ot_smu_diferencia = Math.abs(this.ot_smu_diferencia);
      this.ot_smu_mes_porcentual = this.ot_smu_diferencia.toFixed(2).concat(MENOR_QUE);      
    } else {
       this.ot_smu_mes_porcentual =  IGUAL;
    }

    // WALLMART
    this.ot_wallmart_mes_actual =  this.tareas.filter( ot => ot.cliente === 'Walmart Chile S.A' &&
           (ot.initial_date?.substring(0, 7) === month  
          || ot.initial_date?.substring(0, 7) === month)
      ).length;
    const cant_wallmart_anterior =  this.tareas.filter( ot => ot.cliente === 'Walmart Chile S.A' &&
           (ot.initial_date?.substring(0, 7) === month_old  
          || ot.initial_date?.substring(0, 7) === month_old)
    ).length;
    this.ot_wallmart_diferencia = ((this.ot_wallmart_mes_actual / cant_wallmart_anterior) * 100) - 100;
    if(this.ot_wallmart_diferencia > 0){
      this.ot_wallmart_diferencia = Math.abs(this.ot_wallmart_diferencia);
       this.ot_wallmart_mes_porcentual = this.ot_wallmart_diferencia.toFixed(2).concat(MAYOR_QUE);
    }else if(this.ot_wallmart_diferencia < 0){
      this.ot_wallmart_diferencia = Math.abs(this.ot_wallmart_diferencia);
       this.ot_wallmart_mes_porcentual = this.ot_wallmart_diferencia.toFixed(2).concat(MENOR_QUE);      
    } else {
       this.ot_wallmart_mes_porcentual = IGUAL;  
    }
    

    
  }

}