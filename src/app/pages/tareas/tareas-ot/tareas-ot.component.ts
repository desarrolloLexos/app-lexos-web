import * as actions from "../../../store/actions";

import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";

import { SelectionModel } from "@angular/cdk/collections";
import {
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { Store, select } from "@ngrx/store";
import { Cliente } from "app/models/cliente.model";
import { Local } from "app/models/local.model";
import { Servicio, TareaOT } from "app/models/tarea-ot.model";
import { Usuario } from "app/models/usuario.model";
import { AuthService } from "app/services/auth.service";
import { TareasService } from "app/services/tareas.service";
import { UsuariosService } from "app/services/usuarios.service";
import { AppState } from "app/store/app.reducers";
import * as moment from "moment";
import { Subject, filter, map } from "rxjs";
import { skip, take } from "rxjs/operators";
import Swal from "sweetalert2";
import { ClientesService } from "../../../services/clientes.service";

@Component({
  selector: "app-tareas-ot",
  templateUrl: "./tareas-ot.component.html",
  styleUrls: ["./tareas-ot.component.scss"],
})
export class TareasOtComponent
  implements OnInit, OnDestroy, AfterContentChecked, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("backToTop") backToTop: any;
  @ViewChild("table", { read: ElementRef }) table: ElementRef;
  @ViewChild("tableHeader", { read: ElementRef }) tableHeader: ElementRef;

  selection = new SelectionModel<TareaOT>(true, []);
  public displayedColumns = [
    "select", // Checkbox de selección
    "wo_folio",
    "tasks_log_task_type_main",
    "id_status_work_order",
    "personnel_description",
    "local",
    "items_log_description",
    //  'code',
    //  'is_offline',
    "description",
    //  'trigger_description',
    //  'parent_description',
    //  'items_log_types_description',
    //  'groups_1_description',
    //  'groups_2_description',
    //  'completed_percentage',
    //  'duration',
    "real_duration",
    //  'num_iterations',
    "cal_date_maintenance",
    //  'date_maintenance',
    "initial_date",
    "final_date",
    //  'creation_date',
    "wo_final_date",
    //  'stop_assets',
    //  'stop_assets_sec',
    //  'real_stop_assets_sec',
    //  'resources_hours',
    //  'resources_inventory',
    //  'id_parent',
    "requested_by",
    "priorities_description",
    //  'task_note',
    //  'note',
    //  'event_date',
    //  'rating',
    //  'id_request',
    //  'work_orders_status_custom_description'
  ];

  private stop$ = new Subject<void>();
  public tareas: TareaOT[] = [];
  public reporte: TareaOT[] = [];
  public loading: boolean = false;
  public error: any;
  public dataSource: MatTableDataSource<TareaOT>;
  public step = 0;

  // Filtros
  public formControl = new FormControl();
  public showSearch: boolean = false;
  public users: Usuario[] = [];
  public locals: Local[] = [];
  public clients: Cliente[] = [];
  public idResponsable: number;
  public servicio: string;
  public estado: number;
  public local: string;
  public cliente: string;
  public exportando: boolean = false;
  public filteredLocals: Local[] = [];
  public keywords = new Map();
  public filtros = [];
  public fecha_inicio_start: string;
  public fecha_inicio_end: string;
  public dataFiltered: string = "";

  tipoServicio = [
    {
      value: Servicio.SERVICIO_DE_EMERGENCIA,
      viewValue: Servicio.SERVICIO_DE_EMERGENCIA,
    },
    {
      value: Servicio.MANTENIMIENTO_PREVENTIVO,
      viewValue: Servicio.MANTENIMIENTO_PREVENTIVO,
    },
    {
      value: Servicio.TRABAJO_PROGRAMADO,
      viewValue: Servicio.TRABAJO_PROGRAMADO,
    },
    {
      value: Servicio.REVISION_DE_EQUIPOS,
      viewValue: Servicio.REVISION_DE_EQUIPOS,
    },
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

  opcionesEstado = [
    { value: 1, viewValue: "En proceso" },
    { value: 2, viewValue: "En revisión" },
    { value: 3, viewValue: "Finalizada" },
    { value: 4, viewValue: "Cancelada" },
    { value: 5, viewValue: "Pendiente" },
    { value: 6, viewValue: "Téc. asignado" },
    { value: 7, viewValue: "Por asignar" },
    { value: 8, viewValue: "Por revisar" },
    { value: 9, viewValue: "Anulada" },
  ];

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(
    private store: Store<AppState>,
    private route: Router,
    public dialog: MatDialog,
    private authService: AuthService,
    private tareaService: TareasService,
    private userService: UsuariosService,
    private clienteService: ClientesService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.loading = true;
    // this.store.dispatch(action  s.setPages({page: {showTareasOT: true}}));
  }
  menuOpenedClick(type: number, username: string, otNumber: string) {
    console.log("ok", type, username, otNumber);
    let timerInterval;

    Swal.fire({
      title: "Actualizando datos...",
      html: "Por favor, espera <b></b>.",
      timerProgressBar: true,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        const timer = Swal.getPopup().querySelector("b");
        timerInterval = setInterval(() => {
          timer.textContent = `${Math.round(Swal.getTimerLeft() / 1000)}`;
        }, 1000);
      },
    });
    const dateUntil = moment();
    const dateFrom = moment().subtract("6", "months");

    // Actualizar tarea y obtener reporte
    this.tareaService
      .updateTarea(type, username, otNumber)
      .then(() => {
        return this.tareaService.getReporteTiemposPromiseStatus(
          dateFrom.toISOString(),
          dateUntil.toISOString()
        );
      })
      .then((data) => {
        this.dataSource = new MatTableDataSource<TareaOT>(data);
        if (this.dataFiltered) {
          this.dataSource.filter = this.dataFiltered.trim().toLowerCase();
        }

        // Cerrar el modal de espera
        clearInterval(timerInterval);
        Swal.close();

        // Mostrar la alerta de éxito
        Swal.fire({
          icon: "success",
          title: "Cambio de estado correcto",
          showConfirmButton: false,
          timer: 1500,
        });
      })
      .catch((error) => {
        // Manejar errores aquí, cerrar el intervalo y la alerta si algo falla
        clearInterval(timerInterval);
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: "No se pudo completar la actualización.",
        });
        console.error("Error al actualizar la tarea", error);
      });
  }
  public permission = false;
  ngOnInit(): void {
    this.permission = localStorage.getItem("permission") === "Administrator";

    console.log("this.permission", this.permission); // Debería mostrar 'Administrator'
    this.loading = true;
    this.userService.getReponsables().subscribe((response) => {
      this.users = response?.filter((user) => user.active);
    });

    this.clienteService.getLocales().subscribe((response) => {
      this.locals = response;
      this.filteredLocals = response.slice();
    });

    this.clienteService.getClientesObs().subscribe((response) => {
      this.clients = response;
    });

    // this.store.dispatch(actions.getTareasOT());

    this.store.select("tareas").subscribe(({ reporte, loading, error }) => {
      console.log("Tareas en reporte del STORE: ", reporte.length);
      // Solo mostramos las tareas padres, las hijas las dejamos en el STORE.
      this.reporte = reporte?.filter((tarea) => tarea.id_parent_wo === null);
      // this.tareas = this.reporte.slice(0, 500);
      this.tareas = this.reporte;
      this.loading = loading;
      this.error = error;
    });
    const dateUntil = moment();
    const dateFrom = moment().subtract("6", "months");
    this.tareaService
      .getReporteTiemposPromiseStatus(
        dateFrom.toISOString(),
        dateUntil.toISOString()
      )
      .then((data) => {
        this.dataSource = new MatTableDataSource<TareaOT>(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    console.log("this.tareas", this.tareas);
  }

  ngOnDestroy(): void {
    stop();
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource<TareaOT>(this.tareas);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  stop() {
    this.stop$.next();
    this.stop$.complete();
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tareas.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(
      ...this.tareas.filter((row) => row.id_status_work_order == 7)
    );
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: TareaOT): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
      row.wo_folio + 1
    }`;
  }

  combinarOT(tecnico: Usuario) {
    Swal.fire({
      title: `Está a un paso de combinar ${this.selection.selected.length} OT's`,
      html: " ¿Desea continuar?",
      icon: "question",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: `OK`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        let min_id = Infinity;
        console.log(this.selection.selected);
        this.selection.selected
          .filter((f) => f.id_status_work_order === 7)
          .forEach((sel) => {
            if (sel.id < min_id) {
              min_id = sel.id;
            }
          });
        console.log(`La OT principal es ${min_id}`);
        // -- Marcando tarea principal
        let tareaPrincipal: TareaOT = this.selection.selected
          .filter((f) => f.id_status_work_order === 7)
          .filter((tarea) => tarea.id === min_id)[0];
        const time = new Date();
        tareaPrincipal = {
          ...tareaPrincipal,
          has_children: true,
          personnel_description: tecnico.name,
          id_assigned_user: tecnico.id_person,
          first_date_task: time.toISOString(),
          id_status_work_order: 6,
        };

        this.store.dispatch(
          actions.actualizarTareaOT({ tareaOT: tareaPrincipal })
        );
        // --- Marcando tareas hijas
        this.selection.selected
          .filter((f) => f.id_status_work_order === 7)
          .forEach((tareaOT) => {
            if (tareaOT.id !== min_id) {
              const tareaHija: TareaOT = {
                ...tareaOT,
                id_parent_wo: min_id,
                has_children: false,
                personnel_description: tecnico.name,
                id_assigned_user: tecnico.id_person,
                first_date_task: time.toISOString(),
                id_status_work_order: 6,
              };
              this.store.dispatch(
                actions.actualizarTareaOT({ tareaOT: tareaHija })
              );
            }
          });

        this.store
          .pipe(select("tarea"), take(3), skip(2))
          .subscribe((state) => {
            console.log("verificando tiempos de union", state);
            if (state.loaded) {
              Swal.fire({
                title: "OT Unida correctamente.",
                html: ` La OT Principal es la N° ${tareaPrincipal.wo_folio}`,
                icon: "success",
                showDenyButton: false,
                showCancelButton: false,
                confirmButtonText: `OK`,
              }).then((res) => {
                // Refrescamos el listado de tareas.
                this.selection.clear();
                this.store.dispatch(actions.getTareasOT());
              });
            } else if (state.error) {
              console.error("Error al validar", state);
              Swal.fire("Error en la validación.", state.error?.error, "error");
            }
          });
      }
    });
  }

  anularOT() {
    const cantidad = this.selection.selected.filter(
      (f) => f.id_status_work_order !== 3
    )?.length;
    Swal.fire({
      title: `Se anularán ${cantidad} OT's`,
      text: "¿Desea continuar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, anular!",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const tasks: TareaOT[] = this.selection.selected
          .filter((t) => t.id_status_work_order !== 3)
          .map((s) => (s = { ...s, id_status_work_order: 9 }));

        this.tareaService.updateTareas(tasks).then((_) => {
          Swal.fire("¡Anulados!", "Las tareas fueron anuladas.", "success");
          // Refrescamos el listado de tareas.
          this.selection.clear();
          this.refresh();
        });
      }
    });
  }

  /**
   * Método que ejecuta el Scroll Infinito en la tabla de Órdenes de Trabajo.
   */
  onScroll() {
    if (!this.loading) {
      // Si el loading esta en true, es porque ya hay otro dispatch pendiente.
      this.store.dispatch(actions.getTareasOTScroll()); // Obtiene las 50 siguientes OT.
    }
  }

  /**
   * Filtra datos en la tabla cargada del store.
   * @param filterValue Palabra a buscar en la tabla
   */
  applyFilter(filterValue: string) {
    this.dataFiltered = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Mueve el scroll al principio de la tabla
   */
  public scrollToTop(): void {
    console.log("Preparando ScrollToTop()");
    this.table.nativeElement.scrollIntoView();
    this.tableHeader.nativeElement.scrollIntoView();
  }

  public getRecord(tarea: TareaOT): void {
    this.route.navigate(["/", "task", "details"], {
      queryParams: { id: tarea.id },
    });
  }

  /**
   * Abre un cuadro modal para seleccionar Usuario Responsable (Técnico)
   */
  openDialog(): void {
    this.dialog
      .open(TareaOtUser, {
        width: "300px",
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          const responsable: Usuario = JSON.parse(result);
          this.combinarOT(responsable);
        }
      });
  }

  realDuration(initial_date: string, final_date: string) {
    if (initial_date?.length > 0 && final_date?.length > 0) {
      const startDate = moment(initial_date);
      const endDate = moment(final_date);
      const realDuration = endDate.diff(startDate);
      return moment(realDuration).utc().format("HH:mm");
    }
    return "";
  }

  showCombinar() {
    return (
      this.selection.hasValue() &&
      this.selection.selected.length > 1 &&
      this.selection.selected.filter((f) => f.id_status_work_order === 7)
        ?.length > 1
    );
  }

  showAnular() {
    return (
      this.selection.hasValue() &&
      this.selection.selected.length > 0 &&
      this.selection.selected.filter((f) => f.id_status_work_order !== 3)
        ?.length > 0
    );
  }

  // Filtros
  private armaReporte() {
    this.tareas = this.tareas //.filter( (tarea) => tarea.id_parent_wo === null)
      .map((tarea) => {
        const fechaAsignada = tarea.first_date_task
          ? tarea.first_date_task
          : tarea.creation_date;
        let hora = null;
        let fecha = null;
        let duracion = null;
        if (moment(fechaAsignada).isValid()) {
          hora = moment.utc(fechaAsignada).local().format("HH:mm");
          fecha = moment.utc(fechaAsignada).local().format("DD/MM/YY");
        }
        if (tarea.real_duration) {
          duracion = moment(+tarea.real_duration).utc().format("HH:mm");
        }

        let estado: string;
        switch (tarea.id_status_work_order) {
          case 1: {
            estado = "EN PROCESO";
            break;
          }
          case 2: {
            estado = "EN REVISIÓN";
            break;
          }
          case 3: {
            estado = "FINALIZADA";
            break;
          }
          case 4: {
            estado = "CANDELADO";
            break;
          }
          case 5: {
            estado = "PENDIENTE";
            break;
          }
          case 6: {
            estado = "T. ASIGNADO";
            break;
          }
          case 7: {
            estado = "POR ASIGNAR";
            break;
          }
          case 8: {
            estado = "POR REVISAR";
            break;
          }
          case 9: {
            estado = "ANULADA";
            break;
          }
        }
        return {
          ...tarea,
          resources_hours: tarea.id_status_work_order !== 7 ? hora : null,
          date_maintenance: tarea.id_status_work_order !== 7 ? fecha : null,
          duration: tarea.id_status_work_order !== 7 ? duracion : null,
          work_orders_status_custom_description: estado,
        };
      });
    this.dataSource = new MatTableDataSource<TareaOT>(this.tareas);
    this.loading = false;
  }

  /**
   * Filtra el reporte para obtener las tareas según filtros.
   * @returns Las ultimas 500 OT filtradas
   */
  private filtrarOpciones(): TareaOT[] {
    let filterOT: TareaOT[] = this.reporte;

    if (this.cliente) {
      filterOT = filterOT.filter((t) => t.cliente.indexOf(this.cliente) !== -1);
    }

    if (this.local) {
      filterOT = filterOT.filter((t) => t.local.indexOf(this.local) !== -1);
    }

    if (this.servicio) {
      filterOT = filterOT.filter(
        (t) => t.tasks_log_task_type_main === this.servicio
      );
    }

    if (this.idResponsable && this.idResponsable > 0) {
      filterOT = filterOT.filter(
        (t) => t.id_assigned_user === this.idResponsable
      );
    }

    if (this.estado && this.estado > 0) {
      filterOT = filterOT.filter((t) => t.id_status_work_order === this.estado);
    }

    if (
      this.fecha_inicio_start?.length > 0 &&
      this.fecha_inicio_end?.length === 0
    ) {
      filterOT = filterOT.filter(
        (t) => t.initial_date.indexOf(this.fecha_inicio_start) !== -1
      );
    }

    if (
      this.fecha_inicio_start?.length > 0 &&
      this.fecha_inicio_end?.length > 0
    ) {
      filterOT = filterOT.filter(
        (t) =>
          t.initial_date >= this.fecha_inicio_start.concat("T00:00:00.000Z") &&
          t.initial_date <= this.fecha_inicio_end.concat("T23:59:59.999Z")
      );
    }
    // filterOT = filterOT.slice(0, 500);
    return filterOT;
  }

  eliminarFiltro(tipo: string, limpiarFiltro: boolean = false) {
    this.filtros.forEach((filtro, index) => {
      if (filtro.value === tipo) this.filtros.splice(index, 1);
    });

    if (limpiarFiltro) {
      switch (tipo) {
        case "cliente": {
          this.cliente = null;
          break;
        }
        case "local": {
          this.local = null;
          break;
        }
        case "idResponsable": {
          this.idResponsable = null;
          break;
        }
        case "servicio": {
          this.servicio = null;
          break;
        }
        case "estado": {
          this.estado = null;
          break;
        }
        case "fecha_inicio": {
          this.fecha_inicio_start = null;
          this.fecha_inicio_end = null;
          break;
        }
      }
      const filteredData = this.filtrarOpciones();
      this.dataSource = new MatTableDataSource<TareaOT>(filteredData);
      this.dataSource.paginator = this.paginator;
    }
  }

  onChangeLocal(event: any) {
    console.log("filtrando por local", event);
    this.local = event.value;
    this.eliminarFiltro("local");
    this.filtros.push({ value: "local", viewValue: this.local });
    const filteredData = this.filtrarOpciones();
    this.dataSource = new MatTableDataSource<TareaOT>(filteredData);
    this.dataSource.paginator = this.paginator;
  }

  onChangeCliente(event: any) {
    console.log("filtrando por cliente", event);
    this.eliminarFiltro("cliente");
    const cliente: string = event.value;
    this.cliente = cliente;
    this.filtros.push({ value: "cliente", viewValue: this.cliente });
    this.filteredLocals = this.locals.filter(
      (l) => l.codigo.indexOf(cliente.substring(0, 3).toUpperCase()) !== -1
    );
    const filteredData = this.filtrarOpciones();
    this.dataSource = new MatTableDataSource<TareaOT>(filteredData);
    this.dataSource.paginator = this.paginator;
  }

  onChangeUser(event: any) {
    console.log("filtrando por userID", event);
    this.eliminarFiltro("idResponsable");
    this.idResponsable = event.value?.id_person;
    this.filtros.push({ value: "idResponsable", viewValue: event.value?.name });
    const filteredData = this.filtrarOpciones();
    this.dataSource = new MatTableDataSource<TareaOT>(filteredData);
    this.dataSource.paginator = this.paginator;
  }

  onChangeServicio(event: any) {
    console.log("filtrando por servicio", event);
    this.eliminarFiltro("servicio");
    this.servicio = event;
    this.filtros.push({ value: "servicio", viewValue: this.servicio });
    const filteredData = this.filtrarOpciones();
    this.dataSource = new MatTableDataSource<TareaOT>(filteredData);
    this.dataSource.paginator = this.paginator;
  }

  onChangeEstado(event: any) {
    console.log("filtrando por estado", event);
    this.eliminarFiltro("estado");
    this.estado = event.value;
    this.filtros.push({ value: "estado", viewValue: event.viewValue });
    const filteredData = this.filtrarOpciones();
    this.dataSource = new MatTableDataSource<TareaOT>(filteredData);
    this.dataSource.paginator = this.paginator;
  }

  onChangeRange(event: MatDatepickerInputEvent<Date>) {
    this.eliminarFiltro("fecha_inicio");
    console.log("Rango", this.range);
    if (this.range) {
      let rango: string = "";
      if (this.range.value?.start !== null) {
        this.fecha_inicio_start = moment(this.range.value?.start)
          .utc()
          .format("YYYY-MM-DD")
          .toString();
      }
      if (this.range.value?.end !== null) {
        this.fecha_inicio_end = moment(this.range.value?.end)
          .utc()
          .format("YYYY-MM-DD")
          .toString();
      }

      if (
        this.fecha_inicio_start?.length > 0 &&
        this.fecha_inicio_end?.length === 0
      ) {
        rango = moment(this.range.value?.start).format("DD/MM/YYYY").toString();
      } else if (
        this.fecha_inicio_start?.length > 0 &&
        this.fecha_inicio_end?.length > 0
      ) {
        rango = moment(this.range.value?.start)
          .format("DD/MM/YYYY")
          .toString()
          .concat(
            " - ",
            moment(this.range.value?.end).format("DD/MM/YYYY").toString()
          );
      }
      if (rango.length > 0) {
        this.filtros.push({ value: "fecha_inicio", viewValue: rango });
      }
    }

    const filteredData = this.filtrarOpciones();
    this.dataSource = new MatTableDataSource<TareaOT>(filteredData);
    this.dataSource.paginator = this.paginator;
  }

  onClickClean() {
    this.servicio = null;
    this.idResponsable = null;
    this.local = null;
    this.cliente = null;
    // this.tareas = this.reporte.slice(0, 500);
    this.tareas = this.reporte;
    this.dataSource = new MatTableDataSource<TareaOT>(this.tareas);
    this.dataSource.paginator = this.paginator;
  }

  public getCssEstado(estado): string {
    let str: string;
    switch (estado) {
      case 1: {
        str = "por-revisar";
        break;
      }
      case 2: {
        str = "por-revisar";
        break;
      }
      case 3: {
        str = "finalizada";
        break;
      }
      case 4: {
        str = "por-revisar";
        break;
      }
      case 5: {
        str = "por-revisar";
        break;
      }
      case 6: {
        str = "t-asignado";
        break;
      }
      case 7: {
        str = "por-asignar";
        break;
      }
      case 8: {
        str = "por-revisar";
        break;
      }
    }

    return str;
  }

  removeKeyword(tipo: string) {
    // this.keywords.delete(keyword.key);
    this.eliminarFiltro(tipo, true);
  }

  refresh() {
    this.loading = true;
    // Ultimo semestre
    const dateUntil = moment();
    const dateFrom = moment().subtract("6", "months");

    console.log("actualizando listado desde Status.");
    this.store.dispatch(
      actions.getTareasReport({
        fechaDesde: dateFrom.toISOString(),
        fechaHasta: dateUntil.toISOString(),
      })
    );
  }
}

// ------------------------ Clase Dialogo

export interface DialogData {
  titulo: string;
  opcion: string;
  codigoLocal?: string;
  uid?: string; // Id de Cliente en caso de Equipo o Local
}

@Component({
  selector: "tarea-ot-user",
  templateUrl: "tarea-ot-user.html",
  styles: [".mat-form-field { display: inline !important; }"],
})
export class TareaOtUser {
  responsable: Usuario;
  responsables: Usuario[] = [];
  titulo: string = "";
  formResponsable: UntypedFormGroup;
  constructor(
    public dialogRef: MatDialogRef<TareaOtUser>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private store: Store<AppState>,
    private fb: UntypedFormBuilder
  ) {
    this.store
      .select("usuarios")
      .pipe(
        filter((state) => state.usuarios != null),
        map((state) =>
          state.usuarios.filter(
            (u) => u.profiles_description === "TECHNICAL" && u.active
          )
        )
      )
      .subscribe((usuarios) => {
        this.responsables = usuarios;
      });
    this.titulo = "Técnico Responsable";

    this.formResponsable = this.fb.group({
      tecnico: [{ value: "" }, Validators.required],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onClick(): void {
    if (this.formResponsable.invalid) {
      return;
    }
    const { tecnico } = this.formResponsable.getRawValue();
    this.responsable = this.responsables.filter(
      (user) => user.id_person === tecnico
    )[0];

    console.log("Técnico Resposnable: ", this.responsable);
    this.dialogRef.close(JSON.stringify(this.responsable));
  }
  onMoreVertClick(event: MouseEvent, row: any): void {
    console.log("Mouse entered on button, row data:", row);
    event.stopPropagation();
  }
}
