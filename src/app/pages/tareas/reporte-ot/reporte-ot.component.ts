import { AfterContentInit, Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Servicio, TareaOT } from 'app/models/tarea-ot.model';
import { Usuario } from 'app/models/usuario.model';
import * as moment from 'moment';
import { TareasService } from '../../../services/tareas.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { ClientesService } from '../../../services/clientes.service';
import { Local } from 'app/models/local.model';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import * as XLSX from 'xlsx';
import { FileSaverService } from 'ngx-filesaver';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store/app.reducers';
import * as actions from 'app/store/actions';
import { Cliente } from 'app/models/cliente.model';

const THUMBUP_ICON =
  `
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
width="24" height="24"
viewBox="0 0 24 24">
    <path d="M 14 3 L 2 5 L 2 19 L 14 21 L 14 19 L 21 19 C 21.552 19 22 18.552 22 18 L 22 6 C 22 5.448 21.552 5 21 5 L 14 5 L 14 3 z M 12 5.3613281 L 12 18.638672 L 4 17.306641 L 4 6.6933594 L 12 5.3613281 z M 14 7 L 16 7 L 16 9 L 14 9 L 14 7 z M 18 7 L 20 7 L 20 9 L 18 9 L 18 7 z M 5.1757812 8.296875 L 7.0605469 11.994141 L 5 15.703125 L 6.7363281 15.703125 L 7.859375 13.308594 C 7.934375 13.079594 7.9847656 12.908922 8.0097656 12.794922 L 8.0253906 12.794922 C 8.0663906 13.032922 8.1162031 13.202109 8.1582031 13.287109 L 9.2714844 15.701172 L 11 15.701172 L 9.0058594 11.966797 L 10.943359 8.296875 L 9.3222656 8.296875 L 8.2929688 10.494141 C 8.1929688 10.779141 8.1257969 10.998625 8.0917969 11.140625 L 8.0664062 11.140625 C 8.0084063 10.902625 7.9509531 10.692719 7.8769531 10.511719 L 6.953125 8.296875 L 5.1757812 8.296875 z M 14 11 L 16 11 L 16 13 L 14 13 L 14 11 z M 18 11 L 20 11 L 20 13 L 18 13 L 18 11 z M 14 15 L 16 15 L 16 17 L 14 17 L 14 15 z M 18 15 L 20 15 L 20 17 L 18 17 L 18 15 z"></path>
</svg>
`;



@Component({
  selector: 'app-reporte-ot',
  templateUrl: './reporte-ot.component.html',
  styleUrls: ['./reporte-ot.component.scss']
})
export class ReporteOtComponent implements OnInit, AfterContentInit  {

  dataSource : any = [];
  users: Usuario[] = [];
  locals: Local[] = [];
  clients: Cliente[] = [];
  tareas: TareaOT[] = [];
  loading: boolean = false;
  error: any;
  idResponsable: number;
  servicio: string;
  local: string;
  cliente: string;
  exportando: boolean = false;
  public filteredLocals: Local[] = [];

  columnsToDisplay = [
    'wo_folio','local',        // Nro OT y local
    'tasks_log_task_type_main',// Tipo de llamado 
    'description',            
    'equipo',  
    'personnel_description',   // Responsable
    'estado',
    'hora',
    'fecha',
    'tiempo'  
  ];

  tipoServicio = [
    { value: Servicio.SERVICIO_DE_EMERGENCIA, viewValue: Servicio.SERVICIO_DE_EMERGENCIA },
    { value: Servicio.MANTENIMIENTO_PREVENTIVO, viewValue: Servicio.MANTENIMIENTO_PREVENTIVO },
    { value: Servicio.TRABAJO_PROGRAMADO, viewValue: Servicio.TRABAJO_PROGRAMADO },
    { value: Servicio.REVISION_DE_EQUIPOS, viewValue: Servicio.REVISION_DE_EQUIPOS },
  ];

  opcionesPeriodo = [
    { value: "0", viewValue: "anual" },
    { value: "1", viewValue: "enero" },
    { value: "2", viewValue: "febrero" },
    { value: "3", viewValue: "marzo" },
    { value: "4", viewValue: "abril" },
    { value: "5", viewValue: "mayo" },
    { value: "6", viewValue: "junio" },
    { value: "7", viewValue: "julio" },
    { value: "8", viewValue: "agosto" },
    { value: "9", viewValue: "septiembre" },
    { value: "10", viewValue: "octubre" },
    { value: "11", viewValue: "noviembre" },
    { value: "12", viewValue: "diciembre" },
  ];

  constructor(private service: TareasService, 
              private userService: UsuariosService,
              private clienteService: ClientesService,
              private fileSaver: FileSaverService,
              private store: Store<AppState>,
              iconRegistry: MatIconRegistry, 
              sanitizer: DomSanitizer) {
      iconRegistry.addSvgIconLiteral('thumbs-up', 
                    sanitizer.bypassSecurityTrustHtml(THUMBUP_ICON));
      // Cargando reporte de último semestre
      const dateUntil = moment();
      const dateFrom = moment().subtract("12", "months");
      console.log('dateFrom: ', dateFrom.toISOString(), "dateUntil: ", dateUntil.toISOString());

      this.store.dispatch(actions.getTareasReport(
      {
        fechaDesde: dateFrom.toISOString(),
        fechaHasta: dateUntil.toISOString()
      }
      ));
  }


  ngOnInit(): void {
    this.loading = true;

    this.userService.getReponsables().subscribe( (response) => {
      this.users = response?.filter(user => user.active);
    });

    this.clienteService.getLocales().subscribe( (response) => {
      this.locals = response;
      this.filteredLocals = response.slice();
    });

    this.clienteService.getClientesObs().subscribe( (response) => {
      this.clients = response;
    });
  }

  ngAfterContentInit(): void {
    this.store.select('tareas')
    .subscribe(({reporte, error}) => {
        console.log('Cargando reporte de tareas');
        this.tareas = reporte.filter( t => t.id_status_work_order !== 9);
        this.error = error;        
        setTimeout( () => { this.armaReporte(); }, 1000);
    });
  }

  private armaReporte(){
      this.tareas = this.tareas //.filter( (tarea) => tarea.id_parent_wo === null)
                    .map( (tarea) => {
                      const fechaAsignada = tarea.first_date_task?tarea.first_date_task:tarea.creation_date;
                      let hora = null;
                      let fecha = null;
                      let duracion = null;
                      if(moment(fechaAsignada).isValid()){
                        hora = moment.utc(fechaAsignada).local().format("HH:mm");
                        fecha = moment.utc(fechaAsignada).local().format("DD/MM/YY");
                      }                    
                      if(tarea.real_duration){
                        duracion = moment(+tarea.real_duration).utc().format("HH:mm");
                      }
                    
                      let estado: string;
                      switch(tarea.id_status_work_order){
                        case 1: {estado = 'EN PROCESO'; break;}
                        case 2: {estado = 'EN REVISIÓN'; break;}
                        case 3: {estado = 'FINALIZADA'; break;}
                        case 4: {estado = 'CANDELADO'; break;}
                        case 5: {estado = 'PENDIENTE'; break;}
                        case 6: {estado = 'T. ASIGNADO'; break;}
                        case 7: {estado = 'POR ASIGNAR'; break;}
                        case 8: {estado = 'POR REVISAR'; break;}
                        case 9: {estado = 'ANULADA'; break;}
                      };
                      return {...tarea, 
                        resources_hours: tarea.id_status_work_order !== 7? hora: null,
                        date_maintenance: tarea.id_status_work_order !== 7? fecha: null,
                        duration: tarea.id_status_work_order !== 7? duracion: null,
                        work_orders_status_custom_description: estado};
                    });
      this.dataSource = new MatTableDataSource<TareaOT>(this.tareas);
      this.loading = false;
  }

  private filtrarOpciones(): TareaOT[] {
    let filterOT: TareaOT[] = this.tareas;
    
    if(this.cliente){
      filterOT = filterOT.filter(t => t.cliente.indexOf(this.cliente) !== -1);
    }
    
    if(this.local){
      filterOT = filterOT.filter(t => t.local.indexOf(this.local) !== -1);
    }

    if(this.servicio){
      filterOT = filterOT.filter(t => t.tasks_log_task_type_main === this.servicio);
    }

    if(this.idResponsable && this.idResponsable > 0){
      filterOT = filterOT.filter(t => t.id_assigned_user === this.idResponsable);
    }

    return filterOT;
  }
  
  onChangeLocal(event: any){
    console.log('filtrando por local', event);
    this.local = event.value;
    const filteredData = this.filtrarOpciones();
    this.dataSource = new MatTableDataSource(filteredData);
  }

  onChangeCliente(event: any){
    console.log('filtrando por cliente', event);
    const cliente: string = event.value;
    this.cliente = cliente;
    this.filteredLocals = this.locals.filter( l => l.codigo.indexOf(cliente.substring(0,3).toUpperCase()) !== -1);
    const filteredData = this.filtrarOpciones();
    this.dataSource = new MatTableDataSource(filteredData);
  }


  onChangeUser(event: any){
    console.log('filtrando por userID', event);
    this.idResponsable = event.value;
    const filteredData = this.filtrarOpciones();
    this.dataSource = new MatTableDataSource(filteredData);
  }
  
  onChangeServicio(event: any){
    console.log('filtrando por servicio', event);
    this.servicio = event;
    const filteredData = this.filtrarOpciones();  
    this.dataSource = new MatTableDataSource(filteredData);
  }

  onClickClean(){
    this.servicio = null;
    this.idResponsable = null;
    this.local = null;
    this.cliente = null;
    this.dataSource = new MatTableDataSource(this.tareas);
  }

  onExportExcel(){
    this.exportando = true;
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';

    let jsonData = [];
    this.filtrarOpciones().forEach( ot => {
      // Se agrega un día más ya que las OT se crean un día anterior
        const fecha = ot.initial_date? ot.initial_date : ot.creation_date;
        const month = moment(fecha).format('M');
        const mes = this.opcionesPeriodo.find(o => o.value === month)?.viewValue;
        jsonData.push({
            "N° OT": ot.wo_folio,
            "Fecha": ot.date_maintenance,
            "Cliente": ot.cliente,
            "Local": ot.local?.substring(0, ot.local.indexOf(" (CECO:")),
            // "Ceco": ot.local?.substring(ot.local.indexOf("CECO:") + 6, ot.local.length - 1),
            "Mes": mes,
            "Tipo de llamado": ot.tasks_log_task_type_main,
            "Descripción": ot.description,
            "Código Equipo":  ot.items_log_description?.substring(ot.items_log_description.indexOf(" { ") + 3, ot.items_log_description.length - 2),
            "Equipo":  ot.items_log_description?.substring(0, ot.items_log_description.indexOf(" { ")),
            "Responsable": ot.personnel_description,
            // "Id Estado": ot.id_status_work_order,
            "Estado": ot.work_orders_status_custom_description,            
            "Hora Inicio": ot.initial_date?moment.utc(ot.initial_date).local().format("HH:mm"):'',
            "Tiempo": ot.duration,
            "Tipo falla": ot.types_description,
            "Causa falla": ot.causes_description,
            "Método detección": ot.detection_method_description,
            "Equipo detenido": ot.time_disruption,
            "Motivo detención": ot.caused_disruption,
            "Descripción general del trabajo": ot.description_general,
            "Materiales utilizados": ot.materiales,
            "Nombre del firmante": ot.details_signature
        });
    });
    const worksheet = XLSX.utils.json_to_sheet(jsonData);

    const workboot = {
      Sheets: {
        'DATA_OT': worksheet
      },
      SheetNames: ['DATA_OT']
    }

    const excelBuffer  = XLSX.write(workboot, {bookType: 'xlsx', type:'array'});

    const blobData = new Blob([excelBuffer], {type: EXCEL_TYPE});
    
    this.fileSaver.save(blobData, "reporte_" + new Date().getTime() + EXCEL_EXTENSION);
    this.exportando = false;
  }

  public getCssEstado(estado): string{
    let str: string;
    switch(estado){
      case 1: { str ='por-revisar'; break;}
      case 2: { str ='por-revisar'; break;}
      case 3: { str ='finalizada'; break;}
      case 4: { str ='por-revisar'; break;}
      case 5: { str ='por-revisar'; break;}
      case 6: { str ='t-asignado'; break;}
      case 7: { str ='por-asignar'; break;}
      case 8: { str ='por-revisar'; break;}
    }

    return str;
  }

}
