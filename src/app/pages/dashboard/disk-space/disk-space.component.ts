import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Cliente } from 'app/models/cliente.model';
import { Equipo } from 'app/models/equipo.model';
import { Local } from 'app/models/local.model';
import { Select } from 'app/models/select.model';
import { TareaOT } from 'app/models/tarea-ot.model';
import { ClientesService } from 'app/services/clientes.service';
import { AppState } from 'app/store/app.reducers';
// import { disk_space } from '../dashboard.data';
import { porcentage } from '../../../store/actions/ui.actions';

@Component({
  selector: 'app-disk-space',
  templateUrl: './disk-space.component.html',
  styles: [`.custom-label-text {
            background-color: #00b400;
            color: #fff;
          }`]
})
export class DiskSpaceComponent implements OnInit {
  public data: any = []
  public showLegend = false;
  public gradient = true;
  public colorScheme = {
    domain: ['#2F3E9E', '#D22E2E', '#378D3B']
  };
  public showLabels = true;
  public explodeSlices = true;
  public doughnut = false;
  @ViewChild('resizedDiv') resizedDiv:ElementRef;
  public previousWidthOfResizedDiv:number = 0;

  public tareas: TareaOT[] = [];
  public loading: boolean = false;
  public error: any;

  public clients: Cliente[] = [];

  // public locals: Local[] = [];
  // public equipments: Equipo[] = [];
  // public filteredLocals: Local[] = [];
  // public filteredEquipments: Equipo[] = [];

  public locals: Select[] = [];
  public equipments: Select[] = [];
  public filteredClients: string[] = [];
  public filteredLocals: Select[] = [];
  public filteredEquipments: Select[] = [];
  public totalOTPeriodo: number = 0;

  public mesActual: string = '';
  public anioActual: string = '';
  public muestraServicio: string = 'Clientes';

  opcionesPeriodo = [
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

  opcionesMuestraServicio = [
    "Clientes", "Locales", "Equipos"
  ];

  formClientes = new FormControl();
  formLocales = new FormControl();
  formEquipos = new FormControl();

  clientesFilter: Cliente[];


  constructor(private store: Store<AppState>,
              private clienteService: ClientesService) { 
                this.store.select('tareas')
                .subscribe(({reporte, loading, error}) => {
                    console.log('recibiendo ',reporte.length, ' tareas en disk-space constructor');
                    this.tareas = reporte.filter( t => t.id_status_work_order !== 9);
                    this.loading = loading;
                    this.error = error;                    
                    this.cargaValores();
                });
    }

  ngOnInit(){
    // this.data = disk_space;
    this.anioActual = (new Date()).getFullYear().toString();

    const mesHoy = (new Date()).toISOString().substring(5, 7);
    this.opcionesPeriodo.forEach( mes => {
      if(mes.value === mesHoy){
        this.mesActual = mes.viewValue;
      }
    });
  }

  private cargaValores(){
    const anioYmes = (new Date()).toISOString().substring(0,7);
    this.totalOTPeriodo = this.tareas.filter(
      (ot) => ot.initial_date?.substring(0, 7) === anioYmes).length;

    this.clienteService.getClientesObs().subscribe( (response) => {
      this.clients = response;
      this.formClientes = new FormControl(this.clients);
      this.filteredClients = [];
      this.filteredLocals = [];
      this.filteredEquipments = [];

      this.clients.forEach( (item) => {
          this.filteredClients.push( item.cliente);
      });
    
      this.cargarFiltros();
      this.cargarTortaClientes();
    });
  }

  // filtros
  private cargarFiltros(){
    const anioYmes = (new Date()).toISOString().substring(0,7);
      this.tareas.forEach(ot => {
        if(ot.initial_date?.substring(0, 7) === anioYmes){                 
          if(ot.local && this.locals.findIndex((item) => item.value === ot.local) === -1){
            this.locals.push({id: ot.cliente, value: ot.local});
          }
          if(ot.items_log_description
            && this.equipments.findIndex((item) => item.value === ot.items_log_description) === -1){
            this.equipments.push({id: ot.cliente, value: ot.items_log_description});
          }
        }
      });

      // console.log('locales inicial: ', this.locals);
      this.locals = this.locals.filter(this.onlyUnique).sort();
      this.equipments = this.equipments.filter(this.onlyUnique).sort();
      this.filteredLocals = this.locals;
      this.filteredEquipments = this.equipments;
      this.formLocales =   new FormControl(this.locals);
      this.formEquipos = new FormControl(this.equipments);
  }


  private cargarTortaClientes(){
    this.data = [];
    const anioYmes = (new Date()).toISOString().substring(0,7);
    console.log('cargarTortaClientes year and month: ', anioYmes);
    this.filteredClients.forEach((cliente) => {
        const countOT = this.tareas.filter(ot => ot.cliente === cliente
                       && ot.initial_date?.substring(0, 7) === anioYmes).length;
        const porcentage = Math.round(((countOT * 100) / this.totalOTPeriodo) * 10) / 10;
        const dato = {
            name: cliente.concat(' (', porcentage.toString(), '%)'),
            value: countOT
        };

        this.data.push(dato);
    });

  }

  private cargarTortaLocales(){
    this.data = [];
    const anioYmes = (new Date()).toISOString().substring(0,7);

    this.filteredClients.forEach((item) => {
      this.filteredLocals.forEach( (local) => {
        const countOT = this.tareas.filter(ot => ot.cliente === item
                      && ot.initial_date?.substring(0, 7) === anioYmes
                      && ot.local === local.value).length;
        const porcentage = Math.round(((countOT * 100) / this.totalOTPeriodo) * 10) / 10;
        const dato = {
            name: local.value.concat(' (', porcentage.toString(), '%)'),
            value: countOT
        };

        this.data.push(dato);
      });
    });
  }

  private cargarTortaEquipos(){
    this.data = [];
    const anioYmes = (new Date()).toISOString().substring(0,7);
    console.log('cargarTortaEquipos OT del anio y mes: ', anioYmes);

    this.filteredClients.forEach((item) => {
      this.filteredEquipments.forEach( (equipo) => {
        if(equipo){
          const countOT = this.tareas.filter(ot => ot.cliente === item
                        && ot.initial_date?.substring(0, 7) === anioYmes
                        && ot.items_log_description?.toString() === equipo.value).length;
          const porcentage = Math.round(((countOT * 100) / this.totalOTPeriodo) * 10) / 10;
          const dato = {
            name: equipo.value.concat(' (', porcentage.toString(), '%)'),
            value: countOT
          };
          
          this.data.push(dato);
        }
      });
    });
  }

  private onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  public onSelect(event) {
    console.log(event);
  }

  ngAfterViewChecked() {
    if(this.previousWidthOfResizedDiv != this.resizedDiv.nativeElement.clientWidth){
      // setTimeout(() => this.data = [...disk_space] );
    }
    this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
  }

  changeCliente(event: MatSelectChange){
    const clientes: Cliente[] = event.value;
    console.log('Clientes seleccionados -> ', clientes);
    this.filteredClients = [];
    this.filteredLocals = [];
    this.filteredEquipments = [];

    clientes.forEach(item => {
        this.filteredClients.push(item.cliente);

        this.tareas.forEach( ot => {
          if(ot.cliente === item.cliente){            
            if(ot.local && this.filteredLocals.findIndex((item) => item.value === ot.local) === -1){
              this.filteredLocals.push({id: ot.cliente, value: ot.local});              
            }
            if(ot.items_log_description
              && this.filteredEquipments.findIndex((item) => item.value === ot.items_log_description) === -1){
              this.filteredEquipments.push({id: ot.cliente, value: ot.items_log_description});             
            }
          }
        });

        this.locals = this.filteredLocals;
        this.equipments = this.filteredEquipments;
        this.formLocales =   new FormControl(this.locals);
        this.formEquipos = new FormControl(this.equipments);
    });

    this.changeMuestraServicio();
  }

  changeLocal(event: MatSelectChange){
    console.log('Locales seleccionados -> ', event);

    const locales: Select[] = event.value;
    this.filteredLocals = []
    locales.forEach(local => {
        this.filteredLocals.push(local);
    });

    this.changeMuestraServicio();
  }

  changeEquipo(event: MatSelectChange){
    console.log('Locales seleccionados -> ', event);

    const equipos: Select[] = event.value;
    this.filteredEquipments = []
    equipos.forEach(equipo => {
        this.filteredEquipments.push(equipo);
    });

    this.changeMuestraServicio();
  }

  changeMuestraServicio(){
    console.log('Servicio realizado seleccionado:', this.muestraServicio);
    switch(this.muestraServicio){
        case this.opcionesMuestraServicio[0]: { // Clientes
          this.cargarTortaClientes();
          break;
        }

        case this.opcionesMuestraServicio[1]: { // Locales
          this.cargarTortaLocales();
          break;
        }

        case this.opcionesMuestraServicio[2]: { // Equipos
          this.cargarTortaEquipos();
          break;
        }
    }
  }

  setLabelFormatting(c: any): string {
    // return `${c.label}<br/><span class="custom-label-text">${c.value}</span>`;
    return c;
  }

}