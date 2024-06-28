import * as actions from "app/store/actions";

import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Store, select } from "@ngrx/store";
import { Cliente } from "app/models/cliente.model";
import { Equipo } from "app/models/equipo.model";
import { Folio } from "app/models/folio.model";
import { Local } from "app/models/local.model";
import { Usuario } from "app/models/usuario.model";
import { AuthService } from "app/services/auth.service";
import { AppState } from "app/store/app.reducers";
import {
  NgxMatCombobox,
  NgxMatComboboxFilterOptionsFn,
} from "ngx-mat-combobox";
import { Observable, Subject, lastValueFrom } from "rxjs";
import { filter, map, skip, take, takeUntil } from "rxjs/operators";
import { Servicio, TareaOT } from "../../../models/tarea-ot.model";

import {
  NgSignaturePadOptions,
  SignaturePadComponent,
} from "@almothafar/angular-signature-pad";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { Lista } from "app/models/lista.model";
import { FileUploadService } from "app/services/file-upload.service";
import Swal from "sweetalert2";
import { CausaFalla } from "../../../models/causa-falla.model";
import { MetodoDeteccion } from "../../../models/metodo-deteccion.model";
import { TipoFalla } from "../../../models/tipo-falla.model";

import { getDownloadURL, getStorage, ref } from "@angular/fire/storage";

import { MapsAPILoader } from "@agm/core";
import { MatStep, MatStepper } from "@angular/material/stepper";
import { CheckList, Foto } from "app/models/checklist.model";
import { ClientesService } from "app/services/clientes.service";
import { EmailService } from "app/services/email.service";
import { FoliosService } from "app/services/folios.service";
import { ListasService } from "app/services/listas.services";
import { LocalesSucursalesService } from "app/services/locales-sucursales.service";
import { TareasService } from "app/services/tareas.service";
import { UtilitarioService } from "app/services/utilitario.service";
import * as moment from "moment";
import { NgxImageCompressService } from "ngx-image-compress";
import { FileInput } from "ngx-material-file-input";
import {
  PerfectScrollbarConfigInterface,
  PerfectScrollbarDirective,
} from "ngx-perfect-scrollbar";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: "app-detalle-ot",
  templateUrl: "./detalle-ot.component.html",
  styleUrls: ["./detalle-ot.component.scss"],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
})
export class DetalleOtComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() tareaId: number;
  @Input() esChild: boolean;
  @Input() tareaParentId: number;
  @Input() vieneDe: string;
  imagenVacia: string =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5gcNDjAzJossHQAAAERJREFUWIXtzjEBwCAQALFS/54fCQw3wJAoyJqZ72X/7cCJYCVYCVaClWAlWAlWgpVgJVgJVoKVYCVYCVaClWAlWAlWGzKXA01428bXAAAAAElFTkSuQmCC";
  @ViewChildren(PerfectScrollbarDirective)
  pss: QueryList<PerfectScrollbarDirective>;
  @ViewChild("backToTop") backToTop: any;
  @ViewChild(MatStepper)
  private stepper: MatStepper;
  validador: Usuario;
  ejecutor: Usuario;
  public optionsPsConfig: PerfectScrollbarConfigInterface = {};

  private destroy$ = new Subject<void>();
  /**
   * Datos para GPS
   */
  public address: string;
  public zoom: number = 16;
  public latitud: number;
  public longitud: number;
  public altitud: number;
  public geoCoder;
  // ---------------------------------
  @ViewChild("search") public searchElementRef: ElementRef;
  @ViewChild("cbxCliente") public cbxCliente: NgxMatCombobox;
  // @ViewChild('imageFoto1') public imageFoto1: HTMLImageElement;

  public tarea: any;
  public tareaParent: TareaOT;
  public tareasChilds: TareaOT[] = [];
  public tareaClone: TareaOT; // Sirve para evitar actualizar datos no modificados.
  public folio: Folio;
  public hasChildren: boolean = false;
  public tituloCombo: string;
  public opcionCombo: string;

  //Tipo de Servicio
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

  // tipoPrioridadSeleccionado: string;
  tipoPrioridad = [
    { value: "Muy Alta", viewValue: "Muy Alta" },
    { value: "Alta", viewValue: "Alta" },
    { value: "Media", viewValue: "Media" },
  ];

  opcionesEquipoDetenido = [
    { value: "Sí", viewValue: "Sí" },
    { value: "No", viewValue: "No" },
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

  opcionesMantenimiento = [
    { value: "LAVADO DE MUEBLES", viewValue: "LAVADO DE MUEBLES" },
    { value: "CENTRAL FRIGORIFICA", viewValue: "CENTRAL FRIGORIFICA" },
    { value: "CONDENSADORES", viewValue: "CONDENSADORES" },
    { value: "TENDIDOS", viewValue: "TENDIDOS" },
    { value: "MUEBLES", viewValue: "MUEBLES" },
    { value: "CÁMARAS", viewValue: "CÁMARAS" },
    { value: "SALAS DE PROCESO", viewValue: "SALAS DE PROCESO" },
  ];

  checklist: CheckList[] = [];

  cliente: string;
  clientes: Cliente[] = [];

  local: Local;
  locales: Local[] = [];

  responsable: number;
  responsables: Usuario[] = [];
  urlFirmaValidador: string = "";
  urlFirmaEjecutor: string = "";
  public equipo: string;
  public equipos: Equipo[] = [];

  public tipoFallas: TipoFalla[] = [];
  public causaFallas: CausaFalla[] = [];
  public metodosDeteccion: MetodoDeteccion[] = [];
  public motivoDetencionFB: Lista;
  public motivosDetencion: Lista[] = [];

  public step = 0;

  public formTareaOT: UntypedFormGroup;
  public formFotosOT: UntypedFormGroup;
  public formFirmasOT: UntypedFormGroup;
  public formChechListGeneral: UntypedFormGroup;

  public puedeVerMapa: boolean = true;
  public cargando: boolean = false; // Usar con el spinner
  //public idURL: number;
  public ver: boolean = false;
  public crear: boolean = false;
  public editar: boolean = false;
  public procesandoEncabezado: boolean = false;
  public textoBotonEncabezado: string = "Crear OT";
  public existeFirmaAprobada = false;
  public esTecnico: boolean = false;
  public esSupervisor: boolean = false;
  public esPersonalized: boolean = false;
  public esAdministrador: boolean = false;
  public esBodeguero: boolean = false;
  public otFinalizada: boolean = false;
  public esMantencionPreventiva: boolean = false;
  /**
   * Variables para el registro de fotos
   */
  public clickedSub = new Subject<boolean>(); // Para el botón de subida de archivo.
  public clicked$ = this.clickedSub
    .pipe(take(1))
    .subscribe((click) => console.log("pressed"));
  public formTimerOT: UntypedFormGroup;
  public formTimerEndOT: UntypedFormGroup;
  public calidad: number = 20; // Hasta 20 para reducir el peso del archivo.
  public porcentaje: number = 0;
  public urlFoto1: string;
  public urlFoto2: string;
  public urlFoto3: string;
  public urlFoto4: string;
  public urlFoto5: string;
  public uploadFoto1: number = -1;
  public uploadFoto2: number = -1;
  public uploadFoto3: number = -1;
  public uploadFoto4: number = -1;
  public uploadFoto5: number = -1;
  public sizeFoto1: number = 0;
  public sizeFoto2: number = 0;
  public sizeFoto3: number = 0;
  public sizeFoto4: number = 0;
  public sizeFoto5: number = 0;
  public uploadFotoChecklist: number = -1;
  public fotosPorSubir: boolean = false;
  public fotosEnTarea: boolean = false;
  public fotosPorSubir$: Observable<boolean>;
  public fotosEnTarea$: Observable<boolean>;
  public desactivarBotonSubir: boolean = false;
  public mensajeSubirArchivo: string = "Subir archivos";
  public mensajeSubirArchivoChecklist: string = "Subir";
  public fechaHoraInicio: string = ""; // Fecha y hora para almacenar en Firebase
  public fechaHoraFin: string = ""; // Estas serán las que se ingresarán a la tarea.
  public horaTiempoEjecucion: string = "";
  public horaIniciada: boolean = false;
  public tiempoPausado: boolean = false;
  public stopTimer$: Subject<void>;
  public stopHoraFinal$: Subject<void>;
  public horaInicial: string; // Hora de la fecha inicial, solo para visualización.
  public horaFinal: string; // idem.
  public tiempoEjecucion: string = "";
  public fechaValidacion: string;
  public camposFaltantes: string = "";
  usuarios: Usuario[] = [];
  // ----------------------------
  constructor(
    private fb: UntypedFormBuilder,
    private store: Store<AppState>,
    private authService: AuthService,
    private clienteService: ClientesService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    public fileUploadServive: FileUploadService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private utilitarioService: UtilitarioService,
    private foliosService: FoliosService,
    private listasService: ListasService,
    private imageCompress: NgxImageCompressService,
    private tareasService: TareasService,
    private emailService: EmailService,
    private localesService: LocalesSucursalesService
  ) {
    this.creaFormGroups();
    this.editar = this.authService.canEditOT;
    this.ver = this.authService.canCreateOT;
    this.esTecnico = this.authService.esTecnico;
    this.esPersonalized = this.authService.esPersonalized;
    this.esSupervisor = this.authService.esSupervisor;
    this.esAdministrador = this.authService.esAdministrador;
    this.esBodeguero = this.authService.esBodeguero;
    this.cargando = false;
    this.store
      .pipe(select("usuarios"), takeUntil(this.destroy$))
      .subscribe((state) => {
        this.usuarios = state.usuarios;
      });
  }

  ngOnInit(): void {
    this.optionsPsConfig.wheelPropagation = false;
    if (!this.tareaId) {
      console.log("No se recibió tareaId, es un nuevo documento");
      this.crear = true;
    } else {
      this.obtieneTarea();
    }

    // Activamos Subscripciones a este Store.
    this.subscribirseAlStore();
  }

  ngAfterViewInit(): void {
    // Cargamos Maps
    this.cargarMaps();

    if (this.tarea?.wo_final_date) {
      this.otFinalizada = true;
      this.fechaValidacion = moment
        .utc(this.tarea.wo_final_date)
        .local()
        .format("DD/MM/YYYY HH:mm:ss");
      this.desactivarTodosLosControles();
    }
  }

  public get enumServicio(): typeof Servicio {
    return Servicio;
  }

  onChangeCheckList($e, item) {
    console.log("onChangeCheckList clicked", item);
    $e.stopImmediatePropagation();
  }

  /**
   * Inicializa la carga de mapas de google
   * https://www.itsolutionstuff.com/post/angular-google-maps-with-places-search-exampleexample.html
   */
  public inicializarMapaConBusqueda() {
    this.mapsAPILoader.load().then(() => {
      // Si se está creando, no tomar la geolocalización del autor.
      // Si ya tiene dirección, no volver a cargar una.
      console.log(
        `latitud: ${this.latitud}, longitud: ${this.longitud}, direccion: ${this.address}`
      );
      if (!this.crear && !this.address) {
        this.geoCoder = new google.maps.Geocoder();

        if (this.latitud && this.longitud) {
          this.getAddress(this.latitud, this.longitud); // Si ya lo hay, solo se obtiene la dirección.
        }

        let autocomplete = new google.maps.places.Autocomplete(
          this.searchElementRef.nativeElement
        );
        autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
            //get the place result
            let place: google.maps.places.PlaceResult = autocomplete.getPlace();

            //verify result
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }

            //set latitude, longitude and zoom
            this.latitud = place.geometry.location.lat();
            this.longitud = place.geometry.location.lng();
            // this.zoom = 12;
          });
        });
      }
    });
  }

  // -- Pruebas MAP
  private setCurrentLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitud = position.coords.latitude;
        this.longitud = position.coords.longitude;
        // this.zoom = 12;
        this.getAddress(this.latitud, this.longitud);
      });
    }
  }

  // -- Pruebas MAP
  getAddress(latitude, longitude) {
    if (!this.geoCoder) {
      this.geoCoder = new google.maps.Geocoder();
    }
    this.geoCoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            // this.zoom = 12;
            console.log(
              "Dirección obtenida desde GeoCode: ",
              results[0].formatted_address
            );
            this.address = results[0].formatted_address;
            this.formChechListGeneral.get("direccion").setValue(this.address);
            this.tarea = {
              ...this.tarea,
              direccion: this.address,
              latitud: this.latitud.toString(),
              longitud: this.longitud.toString(),
            };
          } else {
            this.openSnackBar("Búsqueda sin resultado", "OK");
          }
        } else {
          Swal.fire("Geocoder falló por:", status, "error");
        }
      }
    );
  }
  /*
  * Función que genera el PDF
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  */
  async createPDF() {
    await this.obtenerDatosTarea();

    setTimeout(async () => {
      await this.actualizarTarea();

      if (
        this.tarea?.tasks_log_task_type_main ===
        Servicio.MANTENIMIENTO_PREVENTIVO
      ) {
        console.log("Cargando Contenido PDF para Mantenciones Preventivas");
        this.cargarContenidoPDFMantencionesPreventivas();
      } else {
        console.log("Cargando Contenido PDF");
        this.cargarContenidoPDF();
      }
    }, 500);

    console.log("createPDF", this.tarea);
  }
  async getFirmaEjecutadoPor() {
    let firma: string = this.imagenVacia;
    if (this.tarea && this.tarea?.id_assigned_user === undefined) {
      return firma;
    }

    this.ejecutor = this.usuarios.filter(
      (user) => user.id_person === this.tarea?.id_assigned_user
    )[0];
    if (this.ejecutor && this.ejecutor?.path_signature) {
      const storage = getStorage();
      const pathReference = ref(storage, this.ejecutor?.path_signature);
      if (pathReference) {
        await getDownloadURL(ref(pathReference))
          .then((url) => {
            firma = url;
            return firma;
          })
          .catch((err) =>
            console.error("Firma del ejecutor no encontrada. ", err)
          );
      }
    } else {
      console.log("Ejecutor NO tiene firma.", this.ejecutor?.name);
    }
    return firma;
  }

  async getFirmaTrabajoRevisadoPor() {
    let firma: string = this.imagenVacia;
    this.validador = this.usuarios.filter(
      (user) => user.id_person === this.tarea?.id_validated_by
    )[0];

    if (this.validador?.email === "clepe@ingenierialexos.cl") {
      this.validador = {
        ...this.validador,
        groups_permissions_description: "Jefe de Operaciones",
      };
    } else if (this.validador?.email === "alepe@ingenierialexos.cl") {
      this.validador = {
        ...this.validador,
        groups_permissions_description: "Gerente Técnico",
      };
    }

    if (this.validador && this.validador?.path_signature) {
      const storage = getStorage();
      const pathReference = ref(storage, this.validador?.path_signature);
      if (pathReference) {
        await getDownloadURL(ref(pathReference))
          .then((url) => {
            firma = url;
            return firma;
          })
          .catch((err) =>
            console.error("imagen del visador no encontrado. ", err)
          );
      }
    }
    return firma;
  }
  async generarContenidoDinamico() {
    let resultado = [];
    if (this.tarea?.has_children && this.tareasChilds) {
      // Creamos una copia del Array de tareas para ordenarlas
      const taskChilds = [...this.tareasChilds];
      // Ordenamos las tareas hijas
      taskChilds.sort((a, b) => a.id - b.id);

      console.log("Generando contenido Dinámico");
      // Contenido tarea principal
      resultado.push(await this.generarContenidoChildDesdeTarea(this.tarea));
      taskChilds.forEach(async (tarea: TareaOT) => {
        resultado.push(await this.generarContenidoChildDesdeTarea(tarea));
      });
    } else {
      console.log("No se encontró tareas hijas, se procesa tarea standar");
      resultado.push(await this.generarContenidoChildDesdeTarea(this.tarea));
    }

    return resultado;
  }
  getEquipoDetenido() {
    let equipoDetenido: string = "";
    if (this.tarea?.time_disruption !== undefined) {
      if (this.tarea?.time_disruption === "No") {
        equipoDetenido = "NO";
      } else {
        equipoDetenido = "SÍ               MOTIVO DETENCIÓN:";
      }
    }
    return equipoDetenido;
  }
  async generarContenidoChildDesdeTarea(tarea: TareaOT) {
    let horaInicio: string;
    let horaTermino: string;
    let duracion: string = "";
    let fechaSolicitud: string = "";

    if (tarea?.initial_date?.length > 0) {
      horaInicio = tarea.initial_date;
    } else if (this.tarea?.initial_date?.length > 0) {
      horaInicio = this.tarea.initial_date;
    }
    if (tarea?.final_date) {
      horaTermino = tarea.final_date;
    } else if (this.tarea?.final_date) {
      horaTermino = this.tarea.final_date;
    }
    if (tarea?.real_duration) {
      duracion = moment.utc(Number(tarea.real_duration)).format("HH:mm:ss");
    } else if (this.tarea?.real_duration) {
      duracion = moment
        .utc(Number(this.tarea.real_duration))
        .format("HH:mm:ss");
    } else if (horaInicio?.length > 0 && horaTermino?.length > 0) {
      const startTime = moment(horaInicio);
      const endTime = moment(horaTermino);
      duracion = moment.utc(endTime.diff(startTime)).format("HH:mm:ss");
    }
    if (tarea?.cal_date_maintenance) {
      fechaSolicitud = moment
        .utc(tarea.cal_date_maintenance)
        .local()
        .format("DD/MM/YYYY HH:mm:ss");
    } else if (this.tarea?.cal_date_maintenance) {
      fechaSolicitud = moment
        .utc(this.tarea.cal_date_maintenance)
        .local()
        .format("DD/MM/YYYY HH:mm:ss");
    }

    console.log(
      "pdf, hora inicio ",
      horaInicio,
      " - hora término ",
      horaTermino,
      " . duration ",
      duracion
    );

    return {
      style: "tablaPrincipal",
      table: {
        widths: [150, "*", 200],
        body: [
          // Encabezado
          [
            {
              rowSpan: 2,
              image: "logo",
              width: 150,
              height: 80,
              border: [false, false, false, false],
            },
            {
              rowSpan: 2,
              text: "INGENIERÍA LEXOS LTDA.",
              style: "bold10",
              alignment: "left",
              border: [false, false, false, false],
            },
            {
              text: "ORDEN DE TRABAJO DE \n".concat(
                tarea?.tasks_log_task_type_main?.toUpperCase()
              ),
              style: "bold10",
              alignment: "center",
              border: [false, false, false, false],
            },
          ],
          [
            "",
            "",
            [
              {
                text: [
                  { text: "N° ", style: "numero" },
                  { text: tarea?.wo_folio?.toString(), fontSize: 11 },
                ],
                style: "margenFolio",
              },
              {
                text: [
                  { text: "FECHA: ", style: "bold10" },
                  {
                    text: tarea?.initial_date
                      ? moment
                          .utc(tarea.initial_date)
                          .local()
                          .format("DD/MM/YYYY")
                      : "",
                    style: "altoDesc",
                    fontSize: 10,
                  },
                ],
                style: "margenFecha",
              },
              {
                table: {
                  widths: [120, 45],
                  body: [
                    [
                      {
                        text: "HORA DE INICIO",
                        style: "bold9",
                        alignment: "center",
                      },
                      {
                        text: horaInicio
                          ? moment.utc(horaInicio).local().format("HH:mm:ss")
                          : "",
                        fontSize: 9,
                      },
                    ],
                    [
                      {
                        text: "HORA DE TÉRMINO",
                        style: "bold9",
                        alignment: "center",
                      },
                      {
                        text: horaTermino
                          ? moment.utc(horaTermino).local().format("HH:mm:ss")
                          : "",
                        fontSize: 9,
                      },
                    ],
                    [
                      {
                        text: "TIEMPO DE EJECUCIÓN",
                        style: "bold9",
                        alignment: "center",
                      },
                      { text: duracion, fontSize: 9 },
                    ],
                  ],
                },
                style: "margenTimer",
              },
            ],
          ],
          // divisor
          [
            {
              colSpan: 3,
              text: " ",
              fontSize: 4,
              border: [false, false, false, false],
            },
          ],
          // Descripción general de la solicitud
          [
            {
              colSpan: 3,
              text: "DESCRIPCIÓN GENERAL DE LA SOLICITUD",
              alignment: "center",
              style: "bold10",
            },
          ],
          [
            { text: "CLIENTE:" },
            { text: tarea?.cliente?.toString(), colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "LOCAL:" },
            { text: tarea?.local?.toString(), colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "FECHA Y HORA DE SOLICITUD DE SERVICIO:" },
            { text: fechaSolicitud, colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "EQUIPO A INTERVENIR:" },
            {
              text: tarea?.items_log_description,
              colSpan: 2,
              style: "altoDesc",
            },
            "",
          ],
          [
            { text: "TIPO DE SERVICIO:" },
            {
              text: tarea?.tasks_log_task_type_main,
              colSpan: 2,
              style: "altoDesc",
            },
            "",
          ],
          [
            { text: "PRIORIDAD:" },
            { text: this.getPrioridad(), colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "OT GENERADA POR:" },
            { text: tarea?.requested_by, colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "TÉCNICO EJECUTANTE DEL SERVICIO:" },
            {
              text: tarea?.personnel_description,
              colSpan: 2,
              style: "altoDesc",
            },
            "",
          ],
          // divisor
          [
            {
              colSpan: 3,
              text: " ",
              fontSize: 4,
              border: [false, false, false, false],
            },
          ],
          // Descripción general del servicio
          [
            {
              colSpan: 3,
              text: "DESCRIPCIÓN GENERAL DEL SERVICIO",
              alignment: "center",
              style: "bold10",
            },
          ],
          [
            {
              text: "ANTECEDENTES DEL LLAMADO: ",
              style: "bold10",
              alignment: "center",
            },
            { text: tarea?.description, colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "UBICACIÓN GEOGRÁFICA GPS: \n\n\n", alignment: "center" },
            { text: tarea?.direccion, colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            {
              text: "DESCRIPCIÓN GENERAL DEL TRABAJO:\n\n\n",
              alignment: "center",
            },
            { text: tarea?.description_general, colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "MATERIALES UTILIZADOS:\n\n\n", alignment: "center" },
            { text: tarea?.materiales, colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "TIPO DE FALLA:" },
            {
              text: tarea?.types_description?.toString(),
              colSpan: 2,
              style: "altoDesc",
            },
            "",
          ],
          [
            { text: "CAUSA DE LA FALLA:" },
            {
              text: tarea?.causes_description?.toString(),
              colSpan: 2,
              style: "altoDesc",
            },
            "",
          ],
          [
            { text: "MÉTODO DE DETECCIÓN DE FALLA" },
            {
              text: tarea?.detection_method_description?.toString(),
              colSpan: 2,
              style: "altoDesc",
            },
            "",
          ],
          [
            { text: "EQUIPO DETENIDO:" },
            {
              text: this.getEquipoDetenido(),
              style: "altoDesc",
              border: [true, true, false, true],
            },
            {
              text: tarea?.caused_disruption?.toString(),
              style: "altoDesc",
              border: [false, true, true, true],
            },
          ],
          // divisor
          [
            {
              colSpan: 3,
              text: " ",
              fontSize: 8,
              border: [false, false, false, false],
            },
          ],

          // Fotografías
          [
            {
              text: "FOTOGRAFÍAS DE TRABAJO EJECUTADO",
              colSpan: 3,
              alignment: "center",
              style: "bold10",
            },
            "",
            "",
          ],

          [
            {
              widths: ["250", "250"],
              table: {
                body: [
                  [
                    {
                      image: await this.getBase64ImageFromURL(tarea?.foto1),
                      width: tarea?.foto1 ? 244 : 30,
                      height: tarea?.foto1 ? 200 : 1,
                      alignment: "center",
                    },
                    {
                      image: await this.getBase64ImageFromURL(tarea?.foto2),
                      width: tarea?.foto2 ? 244 : 30,
                      height: tarea?.foto2 ? 200 : 1,
                      alignment: "center",
                    },
                  ],
                ],
              },
              layout: "noBorders",
              colSpan: 3,
              margin: [4, 4, 4, 4],
              alignment: "center",
            },
            "",
            "",
          ],
          [
            {
              widths: ["250", "250"],
              table: {
                body: [
                  [
                    {
                      image: await this.getBase64ImageFromURL(tarea?.foto3),
                      width: tarea?.foto3 ? 244 : 30,
                      height: tarea?.foto3 ? 200 : 1,
                      alignment: "center",
                    },
                    {
                      image: await this.getBase64ImageFromURL(tarea?.foto4),
                      width: tarea?.foto4 ? 244 : 30,
                      height: tarea?.foto4 ? 200 : 1,
                      alignment: "center",
                    },
                  ],
                ],
              },
              layout: "noBorders",
              colSpan: 3,
              margin: [4, 4, 4, 4],
              alignment: "center",
            },
            "",
            "",
          ],
          [
            {
              widths: ["*"],
              table: {
                body: [
                  [
                    {
                      image: await this.getBase64ImageFromURL(tarea?.foto5),
                      width: tarea?.foto5 ? 244 : 30,
                      height: tarea?.foto5 ? 200 : 1,
                    },
                  ],
                ],
              },
              layout: "noBorders",
              colSpan: 3,
              margin: [140, 4, 4, 4],
              alignment: "center",
            },
            "",
            "",
          ],

          // divisor
          [
            {
              colSpan: 3,
              text: "\n\n\n",
              fontSize: 16,
              border: [false, false, false, false],
            },
          ],
        ],
      },
    };
  }
  getPrioridad() {
    let prioridad: string = "";
    if (this.tarea?.priorities_description) {
      switch (this.tarea.priorities_description) {
        case "VERY_HIGH":
          prioridad = "Muy Alta";
          break;
        case "MEDIUM":
          prioridad = "Media";
          break;
        case "HIGH":
          prioridad = "Alta";
          break;
        default:
          prioridad = this.tarea.priorities_description;
      }
    }
    return prioridad;
  }
  async generarContenidoFirmas() {
    return {
      style: "tablaPrincipal",
      table: {
        widths: [150, "*", 165],
        body: [
          // Obs
          [
            {
              text: "OBSERVACIONES",
              colSpan: 3,
              alignment: "center",
              style: "bold10",
            },
            "",
            "",
          ],
          [
            {
              text: this.tarea?.observaciones
                ? this.tarea?.observaciones.toString()
                : "",
              colSpan: 3,
              style: "altoObs",
            },
            "",
            "",
          ],
          // divisor
          [
            {
              colSpan: 3,
              text: " ",
              fontSize: 8,
              border: [false, false, false, false],
            },
          ],
          // Firmas
          [
            {
              text: "TRABAJO ACEPTADO POR:",
              alignment: "center",
              style: "bold9",
            },
            {
              text: "TRABAJO REVISADO POR:",
              alignment: "center",
              style: "bold9",
            },
            {
              text: "TRABAJO EJECUTADO POR:",
              alignment: "center",
              style: "bold9",
            },
          ],
          [
            { image: "firmaAprobador", width: 150 },
            {
              image: await this.getBase64ImageFromURL(this.urlFirmaValidador),
              width: this.validador?.path_signature ? 150 : 30,
              alignment: "center",
            },
            {
              image: await this.getBase64ImageFromURL(this.urlFirmaEjecutor),
              width: this.ejecutor?.path_signature ? 150 : 30,
              alignment: "center",
            },
          ],

          // --------------------------------------------------------
          // Nombre
          [
            {
              text: [
                { text: "NOMBRE: ", bold: true },
                {
                  text: this.tarea?.details_signature
                    ? this.tarea.details_signature.toUpperCase()
                    : "",
                },
              ],
            },
            {
              text: [
                { text: "NOMBRE: ", bold: true },
                {
                  text: this.validador
                    ? this.validador.name?.toUpperCase()
                    : "",
                },
              ],
            },
            {
              text: [
                { text: "NOMBRE: ", bold: true },
                {
                  text: this.ejecutor ? this.ejecutor.name?.toUpperCase() : "",
                },
              ],
            },
          ],
          // Rut
          [
            {
              text: [
                { text: "RUT:", bold: true },
                {
                  text: "          ".concat(
                    this.tarea?.aceptado_por_rut
                      ? this.tarea.aceptado_por_rut
                      : ""
                  ),
                },
              ],
            },
            {
              text: [
                { text: "RUT:", bold: true },
                {
                  text: "          ".concat(
                    this.validador?.rut ? this.validador.rut : ""
                  ),
                },
              ],
            },
            {
              text: [
                { text: "RUT:", bold: true },
                {
                  text: "          ".concat(
                    this.ejecutor?.rut ? this.ejecutor.rut : ""
                  ),
                },
              ],
            },
          ],
          // Cargo					[
          [
            {
              text: [
                { text: "CARGO:", bold: true },
                {
                  text: "    ".concat(
                    this.tarea?.aceptado_por_cargo
                      ? this.tarea.aceptado_por_cargo
                      : ""
                  ),
                },
              ],
            },
            {
              text: [
                { text: "CARGO:", bold: true },
                {
                  text: "    ".concat(
                    this.validador?.groups_permissions_description
                      ? this.validador.groups_permissions_description
                      : ""
                  ),
                },
              ],
            },
            {
              text: [
                { text: "CARGO:", bold: true },
                {
                  text: "    ".concat(
                    this.ejecutor?.groups_permissions_description
                      ? this.ejecutor.groups_permissions_description
                      : ""
                  ),
                },
              ],
            },
          ],
        ],
      },
    };
  }

  async cargarContenidoPDF() {
    this.urlFirmaEjecutor = await this.getFirmaEjecutadoPor();
    this.urlFirmaValidador = await this.getFirmaTrabajoRevisadoPor();

    this.generarContenidoDinamico().then((contenido) => {
      if (Array.isArray(contenido)) {
        setTimeout(async () => {
          let pdfDefinition = {
            content: [contenido, await this.generarContenidoFirmas()],
            // Imagenes
            images: {
              // logo: 'data:image/png;base64,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'
              logo: "data:image/jpeg;base64,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",
              firmaVacia:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5gcNDjAzJossHQAAAERJREFUWIXtzjEBwCAQALFS/54fCQw3wJAoyJqZ72X/7cCJYCVYCVaClWAlWAlWgpVgJVgJVoKVYCVYCVaClWAlWAlWGzKXA01428bXAAAAAElFTkSuQmCC",
              firmaAprobador: this.tarea?.signature
                ? this.tarea.signature
                : this.imagenVacia,
            },
            pageMargins: [40, 35, 40, 15],
            // Estilos
            styles: {
              header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10],
              },
              subheader: {
                fontSize: 16,
                bold: true,
                margin: [0, 10, 0, 5],
              },
              numero: {
                fontSize: 12,
                bold: true,
                margin: [15, 4, 0, 5],
              },
              tablaPrincipal: {
                margin: [0, 0, 0, 0],
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: "black",
              },
              margenFolio: {
                margin: [60, 2, 10, 4],
              },
              margenFecha: {
                margin: [40, 0, 10, 8],
              },
              margenTimer: {
                margin: [8, 0, 10, 5],
              },
              altoObs: {
                margin: [10, 5, 20, 25],
                fontSize: 10,
              },
              altoDesc: {
                margin: [5, 1, 0, 1],
                fontSize: 9,
              },
              bold9: {
                bold: true,
                fontSize: 9,
              },
              bold10: {
                bold: true,
                fontSize: 10,
              },
            },
            defaultStyle: {
              fontSize: 8,
            },
          };
          const pdfDocGenerator = pdfMake.createPdf(pdfDefinition);
          const ceco = await this.extraerCECO(this.tarea.local);
          console.log("local", ceco);

          pdfDocGenerator.getBase64(async (base64String) => {
            try {
              const local: any =
                await this.localesService.findSucursalByDireccion(ceco);
              console.log("local", local);

              const data = {
                folio: this.tarea.wo_folio,
                ceco: local[0].ceco,
                email: [local[0].emailSupervisor, local[0].emailSucursal],
                nombre: local[0].nombre,
                emailOculto: local[0].emailSupervisorLexos,
                sucursal: local[0].direccion,
                pdfBase64: base64String,
              };

              const validEmails = data.email.filter((e) => e);
              if (validEmails.length === 0) {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "No hay correos electrónicos válidos para enviar.",
                });
                return;
              }

              console.log("data email to send", data);

              const response = await lastValueFrom(
                this.emailService.sendEmail(data)
              );
              console.log("Email sent successfully", response);

              Swal.fire({
                icon: "success",
                title: "Correo enviado",
                text: "El correo ha sido enviado exitosamente.",
              });
            } catch (error) {
              console.error("Error sending email", error);

              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un error al enviar el correo. Por favor, inténtelo nuevamente.",
              });
            }
          });
        }, 800);
      }
    });
  }
  async extraerCECO(local) {
    const regex = /\(CECO: ([A-Z0-9]+)\)/;
    const match = local.match(regex);
    return match ? match[1] : null;
  }
  private obtenerDatosTarea(): Promise<void> {
    return new Promise((resolve) => {
      if (this.vieneDe === "pages") {
        this.store.select("tarea").subscribe((state) => {
          if (state.loaded) {
            this.tarea = state.tareaOT;
            this.tareasChilds = state.tareaOTChilds;
            resolve();
          }
        });
      } else {
        this.store.select("tareas").subscribe((state) => {
          if (state.loaded) {
            this.tarea = state.reporte.find((t) => t.id === this.tareaId);
            this.tareasChilds = state.reporte
              .filter((t) => t.id_parent_wo === this.tareaId)
              .sort((a, b) => a.id - b.id);
            resolve();
          }
        });
      }
    });
  }
  async cargarContenidoPDFMantencionesPreventivas() {
    this.urlFirmaEjecutor = await this.getFirmaEjecutadoPor();
    this.urlFirmaValidador = await this.getFirmaTrabajoRevisadoPor();

    this.generarContenidoDinamicoMantencionesPreventivas().then((contenido) => {
      if (Array.isArray(contenido)) {
        console.log("contenido", contenido);
        setTimeout(async () => {
          let pdfDefinition = {
            content: [
              contenido,
              await this.generarContenidoCheckList(this.tarea),
              await this.generarContenidoFirmasMantencionesPreventivas(),
            ],
            // Imagenes
            images: {
              // logo: 'data:image/png;base64,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'
              logo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgEAYABgAAD//gASTEVBRFRPT0xTIHYyMC4wAP/bAIQAAgICBAIEBgMDBgYEBAQGBwYGBgYHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwECBAQFAwUGAwMGBwYFBgcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcH/8QBogAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoLAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+hEAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/8AAEQgAWgDDAwERAAIRAQMRAf/aAAwDAQACEQMRAD8A/fSgAoAAKAPxt+MP7S/i7VPEF5Dp19caPZWFzLbwW1uRHgQuU3SnG6R3KljuO0AgBQK/oDAZPg6eHpyq041ZzhGUpS1+JXtHokttNfM/knNuIsxq4yrDD1p0KdKpKEIQ93SLavJ2vJu19dOiR98fsqfFXU/ir4ce717D3un3LWrXAUIJ1CI6uVAChwH2vtABI3YBJFfmGd4GllmJUMLpCcVPlvfld2mu9tLq5+4cMZnXznBOrjdatKbpudrc6STTstL62dtLq/U6v4q/tA+Hvg5dWun68Z2nvwXVbeMSeXEGCmWXLLhd3AC7mOGIXiuHA5ViM0jOrhVFRhp7ztd2vyrR6272W2p6mZ57g8hnSoY1z56mqUI83LG9uaWqsr9rvR6HtcUizKJIzlHAZT6gjIP4ivnWuV2e6PsE1JKUdnqvmSUijw3xx+0N4c+HuvW3hPV2nW8vRGfMSPMMImbZH5rlgRuP9xX2jBbFfSYbKcTjaE8dQUeSF9G7Slyq75Vbp5tX6HxeNz7B5Xi6eV4pzVSpy6qN4Q5naPM7q132Tt1PZtRu/wCzreW62mTyI3k2L1bYpbaPdsYH1r5+EeeUYXtdpX7Xdrn11SXsoSqWb5YuVlu7K9l6n4l6/wDtQeN9b1B9Ui1OewG8tFbQbVgiXPyp5ZUiTA4YybixyT6V/RVLJsDRpqi6MZ6ayldyb6u99PK1rH8dV+JM0xFZ4mOInTV7xpwsoRXRctve83K7Z+sXwI8f3XxN8K2XiDUUEV3cK6S7BtR3idozIg7K+3djoCSBwBX4fmeFjl2KqYWi7wi01fdJpOz81ex/UGSY6eb4CjjsRHlqSTUrKybi3FyS7O1/LY9erwT6sKACgAoAKACgAoAKACgAoAKACgAoAKACgAoA+Zvij+yl4Y+JlzPq7LLp2q3KHM9u+2N5cYWSaEgq5zjcV2FwOTnmvscFneKy6McOmp0ov4ZLVR6qMt15b2PzrMuGMDm054pqVLESTvODsnK2kpR2b2vazfV31Pjj4B/EnUP2cvE0/gLxhmDTbicJIW+5bzNgRXUZPW3nXb5hHAXa/VGFff5ng6ee4WOZ4DWpGN13lFbwa/ni72Xe66o/JcjzGtwpjp5Hmvu0ZTs77Qm9I1Yv/n3NW5n2s+jM25P/AA0X8XAifvtLt7kKCOV+xWHJI7bZpAfY+bjuK2j/AMIOUX2qyj8/aVf1ivyOeX/GU8Q8q96hCdvL2NDV/Kcvv5j9cunA4A6Cvwk/qfYKAPzs/b08BmW3sPGNsuHt2NjcMvBCvmSByRz8rh1B7bx7V+r8MYnllVy+ezXtIrzWkl81Z/I/A+N8DzQoZtTWsH7KbXZ+9B/KV18yt42/a2Fr4B0+LSZR/wAJLqlqYLhlOWtBD+5mnb0klxmAdRuL/wAIzeGyLmzCrKvH/Zqc+aK6T5vejFeS+16W6meM4p9nlNCOFkvrtanyTa3pcvuTm+0pWvD15uhQ+Af7Hdj4l0mPxB45Fyst4RLb2kchixARlWnIG8tN97aCpVMZO5jjXNM/nhqzwuW8toaSm1f3uqj0tHa+t35GGR8J0sXh447OlNSqNShTUuW0Ojnpe897Jqyt1bt+jOj6Pa+HrWLTdNiS1tLVBHDFGMKiLwAB/MnknJJJJNfk1SpOtOVas3Kcndt7ts/f6NGnhaccPh4qFOCUYxSsklsl/XqaVYnQFABQAUAFABQAUAFABQAUAFABQAUAFABQBjeIo76TT7lNGZItRaCUWryjKLOUPlM45yofBPB47GuijyKpB4hN01Jc6W/Lf3redjkxCqujUjhGlWcJezcvhU7Plb8r2ufm8+jfH3TSSJbicgn7s1g4/AORx6DHTtX64qmQT+zGP/btVfkfz46PFtF6SnL0nQa+V7aHkfxG+G/xU+IEsd54o0y5vZ7SMxpLHDah9hO7axtyDIAclQ27GTt6mvdwmLyrAp08FWjCMndpyna+11zbedreZ8tmGX59mco1cyw06k4JpSjCkny72bp25lfa97Xdtz0T9hTV9K0fXb/T9QJg1m8hWK0DgKCkTFp4RnkTbgrFT1VCBypFeTxLTq1MPSq0taMJNztvdq0Zf4bXV+78z3uCquHoYqvQr+7iakVGnfRWi25wXVTuk7dVHyPuP4o/tCeGfhMrRapcC41AD5bG2xJOT23gHbCM95WX2Br83wWVYrMrSow5af8Az8lpH5dZf9upn7PmWfYHJE44mpzVulKFpT+a2ivOTXlc8d+HX7bnhvxbP9j12KTw/IzYiklcTW7DsHlRVMTeu9Ng/v17+L4cxOFj7TDSVdJapLlkvSLb5l6O/kfJ5fxlgsbP2ONi8K2/dlJqUH2vJJcr9Vb+8eg/tOeJtCg8C3p1SVJoNTiEVl5LK5luCQ8LREEghGUSOwOAitk8gHy8mo13j6fsItSpu87prljtJS7XTsl3Z7vEeJwsMqrfWZKUK0eWlytNyqbwcejSaUm9kkz8oPAfwt8VeKFj1rw1pk9/DBMNsoiR4TLEQcESkJIFONykMvY9xX7ficbhMNfD4utGDcdY3alZ/wCHVX6dT+YMDluPxajjMuw8qkYy0lyxcOaOtve0lZ7p3XRn1ns+P2pdrmEH0OnQ4/AEEfgK+H/4x+n/ACv/AMHSP1G3FtX+eP8A4Tx/I+tf2d9L8daXY3S/EmZZ5XlU2is8ckyJtPmb3iAXaW27FJLDDdAQK+FzWeAqVIPKI8qSfPo1FvpZS1va936H6lkFLNaNKouIJqUnJezV4yklb3ruOlm7WWrWvSx9D18ofehQAUAFABQAUAFABQAUAFABQAUAFABQBUv7+DSoHvLyRLe3gUvJJIwVERRkszHAAA6k1pCEqklTppuTdkkrtt9EjKc40Yyq1ZKMIpuUm7JJbtt6JGV4a8Vab4xtRqOh3MOoWhYp5sDh13L1U46MOMg4OCD0IratQq4SXscTCVOe9pKzs+voc2HxVDHU/rGCqRq07tc0GmrrdabPyZ0Fcp3HknxO+OHhz4Rx5125AumXdHZwjzLmQdiIwfkUn+OQonXnivdwWW4nM3/ssPcTs5y0gvn1fkrvyPlsyznB5HH/AG2p+8avGnH3qkv+3ei85WXmfk3rjal8e/Fs2s+AdKnsZ5nWQi3c/u5BwbmWcbI7d34L7WAzyNzMSf3GkqWS4SOHzOvGcUmveW6/kjHVyS6XX3JH8vVvb8S5hPF5HhZ05SafuS+GX/PyU9Iwk+tnvrq2fYXwt/Yds7Bl1Px7OdTumO9rSBmEG48nzpjiWc/3sbFJ6lh1+BxvEc5p0csj7OC0U5Jc1v7sfhj5bv0P1jLeDKVJrE53P21R6unFtQv/AH5aSm+/wr1R7L8SP2T/AAl4+hAtrddDvY0CR3FkqxjCgBRLDxHKAO5Cuf79eBhM8xeCl78/bQbu41G3vvaW8fxXkfW5hwvl+Zx/d01h6qVozpJR20XND4ZL7pf3j85viv8As3+LfhhF/pKSatolsWaOe1MjxRBsbi8By1uWAG9gpTgfOcCv1jA5vg8wfuNUq8rJxnZN22tLaduivfyPwDNOH8wyeP7xSr4WDbjOnzOMb7tw3p36tJr+8fav7PH7UHhfV7Wy8Hvb/wDCPXcapbW0QzJbSt0AjlA3LJIxJIlALMSd7E1+eZrk2KpSqY9S9vB3lJ7TivOO1kv5dl0R+w5BxJga9OjlLp/VaiShTjvTk+ijLdSk9bSSbb3bPt3FfnJ+xhg0AJjFABQAuDQAgFAC4xQAlAC4NABg0AJQAUALg0AGDQAlAGJrXiXTfDSLLq93baejnCtczRwhj6KZGXJ+ldNOjUrvlw8JTa35YuVvWyZx1sRRwaUsVVhST2c5xgn6czVzP8SaDp/xF0efSblhc6dqkDRs8Lggo3R43UkEqcMpGRkc5HFa0atTAVo14LlqU5J2ktmujT79TnxFCjmuGnhajUqNaDi3F7p9YtaaPVM/LDQNY1z9jTxa+m6iHutEvSDIFGEurfOFuYR0W5hzh0z6oflZGr9qq06HFWEVWjaNeG3eE+sJf3JdH8900fzRQq4rgLMHh8ReeFqPW21SneyqR6KpDZr5bNM/WTQddtPE1lDqulyrc2d3GJIZUOQyt/IjowOCpBBAINfh1WlPDTlQrRcZxdmn0f8AX3n9Q0K9PF04YrDSU6c0pRktmn/Wq3T0Z+Unxw0e38RfGOPS9QXzrS8vNMgmTJG6N1jVlyCCAQSOCCM8V+3ZbUlh8mdak7ThCtKL7NXadj+Ys5pQxXEkcNXV6dSph4SV2rxaimrrVXXY/Vfw/wCG9P8ACVsum6Nbw2FpFwsUKBF+pwPmY92bLHqSa/EqtapiZOriJynN7uTu/wCvI/puhh6OBgsPhKcadNbRikl+G783qz8jf+CjmtXul+KtOjsri4tUOj7isM0kYJ+0zjJCMoJxxk84wK/ZeGKcJ4aq5xi37bqk/sR7o/FuKqk6WKpKnKUV7G9k2vty7H6rfDV2k8OaU7kszadaEkkkkmBMkk8knuTya/IcUrYislolUn/6Uz9lwmuHot7+zh/6SjtiO3Y1wHoHgfiD9mzwtrWsWvii3tzpmpWNzHc7rTbHHM0bBgJotpjOSOWQI57sa+npZviqNGeClL2lKcXG07txTVvdle/yd15Hw9fh7AYjE08ypw9jWpzjUvTtGM3F396NuV36tJPzPgL/AIKE/FnXNO8QW3hLTruew0yGxS6lS3kaIzSyySDMjIVZlRIwEUnaCWOM4I/QeG8HRnQljKsIzqObinJJ8qSW19m29X6Hw3E+Nr08RDA0pyhTVNTai2uaUm97atJLRepwFh+xh8V7+CO6S6SNZkWQK2qThlDAMA2MjIB5wSM969KWeZZCThyPRtaUY20PMjkGazipqaV0nZ1pX1Pvr9kL4P8Aif4PadqNn40lW4nvbqOWArcvc4RYtrAs4BX5uw69a/Os6xuGzGpSngFyxjFqXuqGrd+m+h+l5HgcVllOrDMJJylJONpOWiVnvtqfWt5ZxX8L2twu+GdGjdeRuVwVYZGCMgkZBB9K+NjJwanHRppr1R9tKKmnCSummmvJ6M/Dj4taP4n/AGQvHUGpabd3d1pZlNzpxnnlkjntycTWc25ipdFYxsSNxUpKOTx++4KeG4iwUqVWEI1LctTljFOMvszjZbN6+t0fzxjoYnhnHRq0pzlSvzU+aTalH7VOV3ulo/K0j0P9rT9r+P4j6fZeGvAk00NreRQ3V/JGXSXzWwY7AFcNmJ+ZtvDuEVSVBz5uTZK8FOpiswinKLlGmnZqy3qa6ar4b7K7Z6md54sbTp4TLZSUZKM6jV1K72p6a6P4rbuyR9rfsifBK8+FWgjUvEktxca/rKrJOs8skn2WH70VsodmAcZ3zEclzs6IM/CZ1j4Y6t7LCqMaFJtRcYpc8ustFt0j5a9T9AyPL55dQ9ri3J16iTkpSb5I7qCu9+sn306H1Tqd5/Z1tNdgbvs8Ukm312KWx+OMV8hCPPKMNrtL73Y+ynL2cZT7Jv7lc/n08O3Hjz9qHxLNb2F/cTajcLLc7ZLuS3ghhVh8iKh2oqblRVROep7mv6QqrBZDh4yqU4qmrR0gpSlJrd31bdm22z+Y6Tx3EGJlClVk6j5pWc3GMYp7JLRJXSSSLfxT+GnxB/Z1ks77W7+e2e9ZxbTWmoTSEPEFZgfmUqQGBGQVPI9RUYPFYHOVOnh6cWopcynTitHp5/5l4zCZhkbp1cRUlFyb5XCrJ6xs3fa25+0/7O/jS8+IfgnSPEOrEPfXlrmdwAN7xyPEXIGAC/l72AAGScACvwvM6EMFjK2Go6QjL3V2TSdvlex+/ZXiJ43BUMVW1nKHvPu03G/ztc9H8W6rJoOk3upwANLY2dxcIG6FoondQfYlRn2ry6MFVq06MtFKcYv0bSPVrzdGlUrR3hCUl6qLZ+AXw/0nx9+05rVymm6hPc6isJvJ2nvZYI0jLqgVApwoDOqpGigKvoBX9GYmeByKjF1aUY078kVGmpNuzet/JXbb1P5ow0Mfn1aao1ZOolzycqjikrpaJbavRJHv2lfsW/FWzuoJ5ryIxxTRu4/tSc/KrqzcY54B47187PPMslGUYwd2ml+6ju0fS08gzWE4ylUVlJN/vpbJ69D9nVG0AegH8q/DD982PxX/AGu4tUi8b3r655nkNs+wF8+V9m2LtEJPy8Pu8wDnzNxbtX9D5C6TwNNYa3Mr+0tvz315uu1reVrH8fcVKvHNKrxt+R29i38Ps7K3L03vzW15r3NH4L2HxUk0pm+Hxu49IMzfxW6xGTA3GIXPJHTcY/k3dfmzWWYSypVUs05HW5e027dObk/C+tvI3yiGfPDt5F7RYfmfWmo83Xl9p078ul/MofG+3+I9tY24+JLlrUzH7Msr2TP5gX5jGIP3uAv3yPk+7u5xWuWvLXUl/ZCtPl96yqJWvpfm93fbrvYxzmOdQpQ/1gf7vm9xSdFy5ra8vJ71rb9Nr9DS+DFj8VZdIL/D5rpNHMz4w9ssZl48wxC55xnhjH8m7OfmzWOYSyqNa2aKDrcq6Tbt0vyfhfW3kdGUQz54e+ROosNzO2tNR5vtcvtNbd+XS/mYumxeIYfiZpaeNyza4NT0/wA8uYi23zI/L5h/d/cxjb+PNdE3h3llZ5bZUPZVeW11rZ3+LXfuclNYyOeYZZzf617ehz3cW7Xjy/B7u3Y/bE9a/nY/sM/F/wD4KVf8jZpv/YG/9uriv3Lhb/dav/X7/wBsifgnFn+9Uf8Arz/7fI/Wf4Y/8i1pP/YNtP8A0RHX47i/94rf9fJ/+lM/a8J/u1H/AK9Q/wDSUdxXnnoBQB+Hv/BQ7H/CfJnp/ZVt/wCjJ6/feGv9xf8A19l+UT+eOKP9/X/XqH5yLtrof7QvlJ9nfXRFsXZi4hA24G3Hz9MYrN1Miu+ZUL3192W/XoaRp8QWXK69rK3vR26dT73/AGQrPx7ZadqK/FA3rXZuozafbZFkbyvK+fYUZsLv6g96/O86lgpVKX9k8ijyvm5E0r30vfyP0rI446FOqs45+fmXJztN8ttbWb6n19XxR9yfE/7eeq+HbPwQ9p4hXzdRuZV/slEIEy3S9ZVJyRCkZIn4wysE+8ykfecOwryxinhnanFfvW/h5H0/xN/D5q+yZ+f8STw8ME4YpXqSa9kl8Smvtf4Uvi7p23aPy3/ZR1Tw7o/jrTrnxioazEhW3diPJivDgW8k4PWNX4ByAkhR2yqmv1rOIV6mCqwwWk7e8l8Th9pR82vvV0tz8cyWeHpY6lPHL3L+6/sxqfZcvJP7nZvY/ogr+aT+ozE8Tf8AINu/+vWf/wBFNXRR/iQ/xR/NHPW/hz/wy/Jn4s/8E8P+R8k/7Bdx/wCjIq/dOJf9yX/X2P5M/AeFv9+l/wBepfnE+gP+CmP/AB46B/183f8A6Kjr5zhX48R/hh+bPp+Lf4eG/wAU/wAkfVf7Hf8AyTPQf+vaX/0qnr5DO/8AkY4j/Ev/AEiJ9lkX/Itw3+F/+lyPf/EGkL4g0+60p2MaX1vNbswGSomjaMsB3IDZAr5ylP2M4VkruElK3o0z6arTVanOi3ZTjKN+101+p+Hlr+zF8XPg7qsreE4LtZFDQrfabcRqs8OcjILqwDYVjHIoKsPYGv3x5rleY0ksZKNt+SpF3jL7reV09UfzysozbK6sngozT1SnSkkpRv6p+dmtybw5+0X8TvhF4rt9K8XXl7M8dxBHeafqBSQNDOU5VsEoxjcPG8bjnGcjIpVcsy7McNKtgoQScZOFSndWlG/36qzTQ6Oa5llmKjQx1SbalFTp1LP3ZW27OzummfumDnkdDz+dfz7sf0YZuqaLZa0gi1G3gvEQ5VZ4klAPqA6sAfcVtCpOi70ZSg/7rcfysc1SjSxCUcRCE0tUpxUkvk0zH8WeJLL4d6Nc61dr5djpcDSskKgfKo4RFGAMnCjoBnJwK6KFGeOrQw8HepUkldvq+rf4nJisRSyrDVMXVVqVGDk1FdFskl9y6H5ZeEvDut/tjeLJNa1kvbaJZsBKUJ2QQZylnbnoZpBzI/UZaRv4Fr9pr1aHCuEWHw9pV5bX3lLrUl/dXRfLuz+acLh8Vx3mEsXi7wwtN2lbaEN1Sh055byl6yfRH6zaNo9r4dtItM02JLa0tI1jiiQYVEUYAA/Uk8k5JJJNfh1SpOvOVaq3Kcm22922f1FRo08LTjhsPFQpwSjGK0SS2R+T/wAc9Yt/DPxij1XUCYrWyu9NuJWCliIo1jZmCjlsAHgZzjA5r9vy2nLEZM6FLWc4VoxV7e820lfofzBnVWGD4jjiq7cadOph5ydm7RiottLd6dj9UvDPi3TPGlqupaFcw39q/SSFwwB9GH3kb1VwrDuK/FK1Crg5ujiYShJdJK33dGvNaH9MYbFUMfTWIwVSNSm+sXf5Pqn5NJn5vf8ABQT4K694zvNP8V+H7SbVLe2tHs7qO2UySxYlaVJPLX52jYOyllB2lRuwGBr9P4bx1DCwqYPETVOUpqcXJ2T0SavsmrLR73Py7ifL6+KnSxmFg6kYwcJKKvJauSdlq07vba3mfP2iftP/ABj8O2cGl2tpP5FlEkEe/RpWbZGoRQzeWMkKACcc9a+jqZTlNWcqs5xvJuTtXSV27u2p8zTzfOKMI0YQlywSir0HeyVlfTsfef7H/wAWfGPxPt9Wm+IEbWxsJLYWxezayG10maU/MF3gFFyf4e/WvzzOsHhMBKjHLXfnUua0+fVONttt36n6TkeNxeOjWlma5eRw5bw9no1Lm3t2Xp8z0bXv2nvC+laza+F7CVtWv766jtWNptaGBpH2ZkmJCMVJGVjLn1wa4qWTYqpRnjasfZU4Qc1z3UpWV9I7q/d2FX4kwNHE0stoSdatUqRpv2dnCDk7XlO9nbtG7Phz9v74K+Ite8QW/i3RrKfU9OksUtpjaxtK8EkUkh/eRoC4R1kUq4UjcGBIOM/c8OY6hRoSwVepGnUU3Jcz5VJNLZvS6a1R8hxNl+IrV443D05VKbpqL5U24uLe6Wtmno/U8ysP2q/jNp0EdpHazskCLGpfRpCxCgKCxEYy2BycDJ5r1ZZPlE5ObnFNtvSura9tTyI5znNOKgoSsklrh3fTvofff7IXxR8XfFDTtRuvHsTQXFpdRx24azazzG0W5iFZV3/N/F26V+c51hMLgKlKGXNOMotytPn1TstVtofpeR4zF4+nVnmUXGUZJRvDk0a10sr6n1ZrGrQ6DaTajd7hBaRtLJsVnfagLEKiAs7HGFVQSxwAM18hTg6so0oWvJpK7SV33b0S8z7SpNUYSqzvyxTbsm3ZdktW/JH4h+JdE8X/ALYPj+P7bZX2labI5jhNxbzRx2Onxnc7bpEVDPIPmIBy8zqo+VRj97pVMLw3gX7OpCpUSu+WUW6lR7bO/Kvwim92fz3WpYvibHr2lOpTpN2jzRaVOkt3qrcz385NLY98/bF/ZFttP0q28TeAbMg6TBFaXlnAhZ5oEAWO5VEG6SdCcTkAtIp8w8oSfnMkzmUqs8LmM/4knOE5OyjJ6uDb2i/s9E9Op9JnuRxhShi8sp/woqE4RWsorRTSW8l9rq1r0Pef2MPi9q/jDR/+EV8XW17batosaiG4ureaIXVqMKhLyIoM0PCOM7nXY+Cd5r57PcFSw1X63gpwdKo9YxlF8k93on8Mt12d12Ppcgx1bE0fqeOhONWktJSjJc8Nlq18Udn3Vn3PszUrP+0LaW0zt8+J48+m9Sufwzmvh4S5JRn2af3O595OPPGUNrpr71Y/n60Pw98Rf2aPEctzpGn3kF/bebbCUWT3VvPCzfeUqjI6OFV1YEEH0IIr+jqlXAZ3h1CtUg4O0rc6hKMktndppq7TP5lp0swyHESnQpTU480b+zc4yi3urJpp6Nalz4leLPid+0LJaWOvadfXj2bObaKDTJYBvlCqxY+WASQAMswUDJ9TUYWjl2TKdTDVYRUkuZyqqWi2tr+SNMXWzPOnTpYmlOXK3yqNFx1drt6fmftH+z74Hu/ht4L0jw3qmFvbG1xOqkEJJI7ysmRwdhk2EjglSQSK/C8yxEMbi62Jo/BKXu9LpJK/ztc/fcsw88Bg6GErfHCHvW6Nttr5XseheLr640vSb69sBuu7azuJYAF35lSJ2jGwctlwPlH3unevNoRjUq06dT4ZTipa20bSevTTqenXlKnSqVKXxxhJx0vqotrTrr06n43x/tcfGkqCbSXJAz/xJZf/AIiv27+xso/nX/g9f5n4R/bec/yP/wAEP/I8z0fwL4//AGi/GcOr6tY3f2u5uLZrq7ltHtbeCGAoMnciKAkaYVRud2wOSa9aeIwOS4SVGhUhyxjLlgpqcpSlfs29W9XskeRTw2PzvGRr16c+Zyg5TcHCMYxt3SWiWi3bP38A2gAdhiv5yP6Y2FoAr3dpFfxPbXSJNDKpR43UMjqwwVZSCCCOCCMGrjJ02pwbUk7pp2afdPoZzhGpF06iUotNNNXTT3TT0aZnaB4csPCtsNP0a3hsLVCWEUCLGm5urYUAFj3J56ela1atTEy9riJynLvJtu3bUwoYejgoKhhKcaVNXfLCKirvd2XV9zZrnOs8v+JPwZ8PfFeHyvEFoskyLtjuY/3dzF/uSqMkD+4+5PVa9rB5hiMsfNhZtR6wesH6x/VWfmfNZhlGDzqPJjqSckrRqR92pH0ktbeTuvI/IzxDaXnwW8Xy6P8ADjU7q+uIJFiD26EM8v8AFbPEu6O5Mf3WOzaTkBQVNfutKUM1wca+bUYQi03aT0Uek03Zwvutb+ep/LFeFTh/MZYTh/E1Kk4tRvBauXWm4q8ajjs9LX0smj65+GP7cEfmDSfiFbNYXMZ8tryBGChhwftFsf3kR/vFNw/2FFfC4zht29vlU+eL1UJNXt/dntLyvb1Z+qZbxkr/AFXPqbpzWjqQi7J/36fxRfe115I9i+I/7X/hPwPAP7NmGvXsiB44bRgYwGGVM05+SPryoDSDoUBrwMJkOLxcv30fYwTs3Na6fyx3frovM+szDivL8tj/ALPP6zVauo037qvtzT2j6ay8j87fiz8fPGPxOhWbVGl03RLtmWG3tlkitpdmNwMpw1yygjcCxXnhBX6tgcrweXNxoJVK8UuaUmnON9vd+xfppfzPwPNM8zLNoqeJcqOFm2owgpRpytuubeo111t5I+5/2df2a/CWkWVl4vhmPiG7lVLi3uHGyCFxz+7gBOJI2BUmUsysDgKRX5tm2b4upOpgJR9hBNxlFaykvOXZrX3bJruftGQcPZfQpUc1hL61UaU4TekIP+7BbSi7q8m2mujPtTpX54fsAZNACZoAUUAcf4d8cWPiLSv+EgV/sliGmVnuSsYTyJnhdnJYqq74yQS33SCcHigDW0XxHp/iNGm0i5t76ONtrNbypKFbGcMUJwSOcHtQBWsPGOk6rctp1lfWlzdpu3QRTxvINnD5RWLfKfvcfL3oAXUPF2k6PcLYX17a2t1JjZDLPGkjbjhcIzBvmPC8cnpQBY1rxJp/hlFl1a6t7BJCVRriVIgxAyQpdlyQOSB0oArap4qttOsU1WM/bLWZ4URrdo2DCeRY0dWLqhQFwSQxJGdoZsAgE2teJ9N8Nbf7Wu7aw83IT7RKkW7HXbvYZx3x0zzQBautas9PgW9uZ4YbV9m2Z5EWNt5ATa5O07yQFwTuzxmgAuL6eK6itooHkilDtLPuVUiCj5QQTvd3JwFUYABZmGACAZcvjbR4Lr+zJb+0S93iPyGnjEu89E2Ft245GFxk54oA6agAoAKAMbxEb5dPuToojOpC3l+yiX/V+fsPlb/9nfjPbHXiuij7P2kPrF/Z8y57b8t/et52OTEe1VGp9Tt7bkl7Pm+Hns+W/le1z83Htfj9qTEFriA5OdrWEa/hwePT2r9dT4fp9Iv5VWfz248W1XvOPo6EV8vI8b+JfjL4n/DmaPT/ABRq91b3FzGZBDFeRO4jzt3OIP8AVhjkLnBbBx0r38Hh8rx0XVwVCDjF25nTklfsube3U+SzHF55lUo0MyxdSE5ptRjVg3y7Xah8N+l97O2x6f8AsIadpOoa7f3d8vm6za26yWjOQQsbsVuJFB5MuSgLk5COcfeY143E06tOhShSdqMpNTS7pXin/dtfTuvQ+k4Jp4epiq9Wsr4mEFKm3soybVSS/vXaTfZ+bPu/4nfAfw18WIydatQl5jCXlviK4X0y4GJAP7sodfQCvzPB5nicsf8As8/c6wlrB/Lp6qzP2vMskwWdL/a6aVTpVh7tRfNfEvKSaPIPh1+xb4X8Fz/bdWaTxBMjboluVVIEHUZhQkSMPWQlT/cFe9i+IcVi4+zoJUI215G3J/8Abz2XpZ+Z8pl/B+By+ftsU5YmSd4qokoLteC0k/OTa8jtv2ntE0WTwNf/ANsRKsNhEHs/LCo0VzkJAIsDCgswRlAwYywI7jzsmqV1jqX1eT5pu076pw3lzfJXT72PZ4ko4V5VX+txSjTjeny2TjU2hy9rt2a25Wz8kPBHxF8S+GtmkeHdUuNMinmGEWfyoBJIQu5i2UQE43OcAdW9a/dMThMNXvXxVGNRxW/LeVl0VtX5I/lnBZhjsJy4TAYmdGMpbKfLBSlpd30jfq3p1Z9ef2B8fNOwyXFxOOo23FhKCPYkZP518L7XIJ6OEV/27VifqvsOLKWqqTkvKdCX6H1t+zvL47ksbr/hZSqsolUWhYRCYptPmeYIfk27tvlk/N97PGK+EzZYBVIf2Pe1nz/Fy36W5tb236beZ+pZA81dKp/rCkpcy9nflU7W97m5NLXty9d+lj6Ir5Q++FFAHzzbfDPUk8Gx+GJFha8XUBcMpcGMxf2qbsgsRgkwHlSMFvlPrSA9D0Lwq+ja5qmpqkUNnqNvZJF5eAd0C3IlLIoGP9amDyW59KYHzX8PLt5NV0Dw/b2kTjQ5bwzX9uJMOn2eeMPIHtoWjEjOudzsS/HzdaQHb+L/AIXahqOv32oTWn9saRqbWsn2ZL2O0XdBEsTC4zA00oBUOiJOsRBO5C1AHrmseE31XX9O1aSOKSzsbS8hkV8MVknNuU2qQc8RsCwxjj1pgcSnw51CPwlF4cVYlu4tQjuNoYCMRLqgu8A4wCIRwoGN3y+9AFX4p/D7U/EGswavYRtd2f2GSzuLeK5jtJWzMJRmaSGUiJhlXELRS5A+fbkUgOm1HwQ97p2h2FnaxWMOkX1pcSWhkEqQwwxSqURyMSlC67TgZ69RTA6BfD92vihtcyPsDaUloBvOfPW6klJ2dMeWw+frnjtQB4l42+E+seJtSuWki+0Jc39tcW959veKK2t4XgfynsVTErqYpPmyfMaRWLDbgID6rNMBKACgAoA+WPip+1t4b+Gl1PosQm1PVbVWDRwKPJjmx8scsrMMEHG8IHKjIPzcV9rgsixOPjHEPlp0pW1k/ece8Ypfde1/Q/M8z4pwWU1J4OPNVrwTvGCXJGVtIyk2rPvZO3XXQ+S/2d/hhfftAeI5/iB4xP2iwt7jzGDfduLlcNHAqngW9uu3cvQjZHzl6+5zXGU8jw0cry/3ako2Vt4Qe8m/55u9n6vsfl2QZbV4mxs89zb3qUJ3ae1SotYwS/5901a62ekerMjVl/4Z0+LYuEHk6ZcXIkwOF+x3+VcAdMQyFvp5efSt6f8Awu5RyPWrGNvP2lLVf+BK33nLVX+qvEKqR92hOfN5eyr6SXpCTfpyn64gg8ryD0NfhWx/U/oLQB+c/wC3p47KRaf4NtSS0zG+uFXqQpMdumB3ZzIwH+yPUV+s8MYbWrmE1ZL93F+us38lZfM/AON8baNDKKT1k/azS7K8aa+b5n8kW/G37JSXvgHT00uJV8S6RameXAAN0Zf309u57uhOIGPQrs6NxGGzx08wq+2b+rVZ8q/ucvuxkvJ/a9b9DXGcLKplNBYaKWNoU+aXT2vN784Pu03aD8rbM5L4CftiWvg3SY/DvjVbqb7EwitrqJBIwg6BJ1LK5MJ+UMu5imARlee7NMgliqrxWXOC5tZQb5Vzd4uzXvb2dlf1PLyPiyngMPHAZwqkvZvlhUiuZ8nRTV0/d2TV210utf0k0LXLTxNZw6rpcqXVndoJIZUPyup6EdwexBAKkEEAgivyKrSnhpyoVouM4uzT3TP6EoVqeLpwxOGkp05pSjJbNP8ArbdPR6mtWB1BQAUAFAC5oASgAoAKACgAoAKACgAoAKACgAHFAH48/GD9lrxdpuv3dxpFnLrFhf3MtxDPAVZgJnLlJlZgyMhYqSfkIAIbsP3zAZ1g54enGvUVKpCKjKMrpe6rXi0rNO1+/kfyfm3DWYUsXVnhKUq9KrOU4zg037zbtNNpppu19nvc+8v2WvhLqHwj8OvZ62VW+v7lrqSFGDLACiRrHuHys+E3OVyuTgE4zX5lnWOp5niVUwy/dwioKTVnLVtu26WtlfU/beGsrrZHg3RxjXtak3UcU7qF0oqN1o3ZXdtLu2tjr/if8BfDnxduLW+8QxStPp+VRoZTFvjLBjFLgHcm4Z42sMnDDNcGCzPE5XGdLCNKM901eztbmXZ29V5Hq5lkeDzydOtj4ycqWicZON4t35Zd439HvqexRxrAojjG1EAVQOgAGAPwFeA3d3e59akopRjoloh9IZ4t4z+APhrx7rlt4r1eGWS/sfLwFlKxS+U26Pzo8HfsPTBXIwGyK+hw+aYnBUJ4HDySpzvuveXMrPlfS/z8j5DF5FgsyxVPM8VCTq0+W1pNRlyu8eaPWz7W87nruo2Y1G3ltGYoLiN4yy9V3qVyPcZyPevChL2coztfladvR3PqqkPawlSbtzRcbrdXVrrzR+LOv/soeONF1FtLttPe/i3kRXULR+Q6Z+V2ZmHlZHLK4BU568E/0NSzvA1aarSqqm7awknzJ9Uklr5Nbn8gV+F80w9Z4anQdSN7RqRceRro221y+alt5n6r/Az4ez/C7wvZeHb2QTXVurvMUJKLJK7SMiE4yqbtoPcgt3r8SzLFRzDFVMVSXLCTSjfeySSb83a/4H9N5LgJ5NgaOArSUqkU3K2ylJuTS8le3nuet14R9SFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAH//Z",
              firmaVacia:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5gcNDjAzJossHQAAAERJREFUWIXtzjEBwCAQALFS/54fCQw3wJAoyJqZ72X/7cCJYCVYCVaClWAlWAlWgpVgJVgJVoKVYCVYCVaClWAlWAlWGzKXA01428bXAAAAAElFTkSuQmCC",
              firmaAprobador: this.tarea.signature
                ? this.tarea.signature
                : this.imagenVacia,
            },
            // Estilos
            styles: {
              header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10],
              },
              subheader: {
                fontSize: 16,
                bold: true,
                margin: [0, 10, 0, 5],
              },
              numero: {
                fontSize: 12,
                bold: true,
                margin: [15, 4, 0, 5],
              },
              tablaPrincipal: {
                margin: [0, 0, 0, 0],
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: "black",
              },
              margenFolio: {
                margin: [60, 2, 10, 4],
              },
              margenFecha: {
                margin: [40, 0, 10, 8],
              },
              margenTimer: {
                margin: [8, 0, 10, 5],
              },
              altoObs: {
                margin: [10, 5, 20, 25],
                fontSize: 10,
              },
              altoObs2: {
                margin: [10, 5, 20, 8],
                fontSize: 9,
              },
              altoDesc: {
                margin: [5, 1, 0, 1],
                fontSize: 9,
              },
              bold9: {
                bold: true,
                fontSize: 9,
              },
              bold10: {
                bold: true,
                fontSize: 10,
              },
              bold11: {
                bold: true,
                fontSize: 11,
              },
              bold12: {
                bold: true,
                fontSize: 12,
              },
            },
            defaultStyle: {
              fontSize: 8,
            },
          };
          const pdf = pdfMake.createPdf(pdfDefinition);
          pdf.download("OT_".concat(this.tarea.wo_folio, ".pdf"));
        }, 800);
      }
    });
  }

  async generarContenidoDinamicoMantencionesPreventivas() {
    let resultado = [];
    if (this.tarea?.has_children && this.tareasChilds) {
      // Creamos una copia del Array de tareas para ordenarlas
      const taskChilds = [...this.tareasChilds];
      // Ordenamos las tareas hijas
      taskChilds.sort((a, b) => a.id - b.id);

      console.log("Generando contenido Dinámico");
      // Contenido tarea principal
      resultado.push(
        await this.generarContenidoMantencionesPreventivasDesdeTarea(this.tarea)
      );
      taskChilds.forEach(async (tarea: TareaOT) => {
        resultado.push(
          await this.generarContenidoMantencionesPreventivasDesdeTarea(tarea)
        );
      });
    } else {
      console.log("No se encontró tareas hijas, se procesa tarea standar");
      resultado.push(
        await this.generarContenidoMantencionesPreventivasDesdeTarea(this.tarea)
      );
    }

    return resultado;
  }
  private async actualizarTarea(): Promise<void> {
    const data = await this.tareasService.getTareaOtByFolio(this.tarea);
    console.log("****", data[0]);
    this.tarea = { ...data[0] };
  }
  async generarContenidoMantencionesPreventivasDesdeTarea(tarea: TareaOT) {
    let horaInicio: string;
    let horaTermino: string;
    let duracion: string = "";
    let fechaSolicitud: string = "";
    if (tarea?.initial_date?.length > 0) {
      horaInicio = tarea.initial_date;
    } else if (this.tarea?.initial_date?.length > 0) {
      horaInicio = this.tarea.initial_date;
    }
    if (tarea?.final_date) {
      horaTermino = tarea.final_date;
    } else if (this.tarea?.final_date) {
      horaTermino = this.tarea.final_date;
    }
    if (tarea?.real_duration) {
      duracion = moment.utc(Number(tarea.real_duration)).format("HH:mm:ss");
    } else if (this.tarea?.real_duration) {
      duracion = moment
        .utc(Number(this.tarea.real_duration))
        .format("HH:mm:ss");
    } else if (horaInicio?.length > 0 && horaTermino?.length > 0) {
      const startTime = moment(horaInicio);
      const endTime = moment(horaTermino);
      duracion = moment.utc(endTime.diff(startTime)).format("HH:mm:ss");
    }
    if (tarea?.cal_date_maintenance) {
      fechaSolicitud = moment
        .utc(tarea.cal_date_maintenance)
        .local()
        .format("DD/MM/YYYY HH:mm:ss");
    } else if (this.tarea?.cal_date_maintenance) {
      fechaSolicitud = moment
        .utc(this.tarea.cal_date_maintenance)
        .local()
        .format("DD/MM/YYYY HH:mm:ss");
    }

    console.log(
      "pdf, hora inicio ",
      horaInicio,
      " - hora término ",
      horaTermino,
      " . duration ",
      duracion
    );

    return {
      style: "tablaPrincipal",
      table: {
        widths: [150, "*", 200],
        body: [
          // Encabezado
          [
            {
              rowSpan: 2,
              image: "logo",
              width: 150,
              height: 80,
              border: [false, false, false, false],
            },
            {
              rowSpan: 2,
              text: "INGENIERÍA LEXOS LTDA.\nRUT: 76.324.643-4\nHUÉRFANOS 1055, OF.503, SANTIAGO",
              style: "bold10",
              alignment: "center",
              border: [false, false, false, false],
            },
            {
              text: "ORDEN DE TRABAJO DE \n".concat(
                tarea?.tasks_log_task_type_main?.toUpperCase()
              ),
              style: "bold10",
              alignment: "center",
              border: [false, false, false, false],
            },
          ],
          [
            "",
            "",
            [
              {
                text: [
                  { text: "N° ", style: "numero" },
                  { text: tarea.wo_folio?.toString(), fontSize: 11 },
                ],
                style: "margenFolio",
              },
              {
                text: [
                  { text: "FECHA: ", style: "bold10" },
                  {
                    text: tarea.initial_date
                      ? moment
                          .utc(tarea.initial_date)
                          .local()
                          .format("DD/MM/YYYY")
                      : "",
                    style: "altoDesc",
                    fontSize: 10,
                  },
                ],
                style: "margenFecha",
              },
              {
                table: {
                  widths: [120, 45],
                  body: [
                    [
                      {
                        text: "HORA DE INICIO",
                        style: "bold9",
                        alignment: "center",
                      },
                      {
                        text: horaInicio
                          ? moment.utc(horaInicio).local().format("HH:mm:ss")
                          : "",
                        fontSize: 9,
                      },
                    ],
                    [
                      {
                        text: "HORA DE TÉRMINO",
                        style: "bold9",
                        alignment: "center",
                      },
                      {
                        text: horaTermino
                          ? moment.utc(horaTermino).local().format("HH:mm:ss")
                          : "",
                        fontSize: 9,
                      },
                    ],
                    [
                      {
                        text: "TIEMPO DE EJECUCIÓN",
                        style: "bold9",
                        alignment: "center",
                      },
                      { text: duracion, fontSize: 9 },
                    ],
                  ],
                },
                style: "margenTimer",
              },
            ],
          ],
          // divisor
          [
            {
              colSpan: 3,
              text: " ",
              fontSize: 4,
              border: [false, false, false, false],
            },
          ],
          // Descripción general de la solicitud
          [
            {
              colSpan: 3,
              text: "CHECK LIST MANTENIMIENTO PREVENTIVO ".concat(
                tarea?.cliente?.toUpperCase()
              ),
              alignment: "center",
              style: "bold12",
            },
          ],
          [
            {
              colSpan: 3,
              text: "DATOS DEL CLIENTE",
              alignment: "center",
              style: "bold10",
            },
          ],
          [
            { text: "RAZÓN SOCIAL:" },
            { text: tarea.cliente?.toString(), colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "LOCAL:" },
            { text: tarea.local?.toString(), colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "ENCARGADO LOCAL:" },
            { text: tarea.details_signature, colSpan: 2, style: "altoDesc" },
            "",
          ],
        ],
      },
    };
  }

  /*
  * Función que genera el PDF
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  ###############################################################
  */

  markerDragEnd($event: google.maps.MouseEvent) {
    // console.log($event);
    this.latitud = $event.latLng.lat();
    this.longitud = $event.latLng.lng();
    this.getAddress(this.latitud, this.longitud);
  }
  async generarContenidoCheckList(tarea: TareaOT) {
    let checkList: CheckList[];
    if (typeof tarea.checklist === "string") {
      checkList = JSON.parse(tarea.checklist);
    } else if (Array.isArray(tarea.checklist)) {
      checkList = tarea.checklist;
    }

    if (Array.isArray(checkList)) {
      checkList.forEach((check) => {
        if (typeof check.checklist === "string") {
          check.checklist = JSON.parse(check.checklist);
        }
        if (typeof check.opciones === "string") {
          check.opciones = JSON.parse(check.opciones);
        }
      });

      checkList = checkList.sort((a, b) => {
        if (a.orden && b.orden) {
          return a.orden - b.orden;
        }
      });
    }

    const divisor8 = [
      {
        colSpan: 4,
        text: " ",
        fontSize: 8,
        border: [false, false, false, false],
      },
      "",
      "",
      "",
    ];
    const divisor12 = [
      {
        colSpan: 4,
        text: " ",
        fontSize: 12,
        border: [false, false, false, false],
      },
      "",
      "",
      "",
    ];

    let bodyCheckList = [];
    if (Array.isArray(checkList)) {
      // https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop

      for (const item of checkList) {
        bodyCheckList.push(divisor12);
        // tipo
        const title = [
          { text: item.tipo, colSpan: 4, alignment: "center", style: "bold10" },
          "",
          "",
          "",
        ];
        bodyCheckList.push(title);

        // opciones
        bodyCheckList.push(divisor8);
        if (Array.isArray(item.opciones)) {
          item.opciones.forEach((opcion) => {
            const opt = [
              {
                text: opcion.titulo,
                style: "bold10",
                colSpan: 2,
                alignment: "center",
              },
              "",
              { text: opcion.contenido, colSpan: 2, fontSize: 9 },
              "",
            ];
            bodyCheckList.push(opt);
          });
        }

        // checklist
        const titleItems = [
          { text: "N°", alignment: "center", style: "bold9" },
          {
            text: "ACTIVIDAD",
            alignment: "center",
            style: "bold9",
            colSpan: 2,
          },
          "",
          { text: "CHECKLIST", alignment: "center", style: "bold9" },
        ];
        bodyCheckList.push(titleItems);
        if (Array.isArray(item.checklist)) {
          item.checklist.forEach((check) => {
            const row = [
              { text: check.numero, alignment: "center", fontSize: 9 },
              { text: check.actividad, colSpan: 2, fontSize: 9 },
              "",
              { text: check.checklist, alignment: "center", fontSize: 9 },
            ];
            bodyCheckList.push(row);
          });
        }

        // Observaciones
        const titleObs = [
          {
            colSpan: 4,
            text: "OBSERVACIONES",
            alignment: "center",
            style: "bold9",
            color: "#17202A",
          },
          "",
          "",
          "",
        ];
        const observaciones = [
          {
            colSpan: 4,
            style: "altoObs2",
            text: item.observaciones ? item.observaciones : "s/obs",
          },
          "",
          "",
          "",
        ];
        bodyCheckList.push(titleObs);
        bodyCheckList.push(observaciones);

        // fotos
        if (Array.isArray(item.fotos)) {
          const foto0 = await this.getBase64ImageFromURL(item.fotos[0].url);
          const foto2 = await this.getBase64ImageFromURL(item.fotos[2].url);
          const foto1 = await this.getBase64ImageFromURL(item.fotos[1].url);
          const foto3 = await this.getBase64ImageFromURL(item.fotos[3].url);
          const titleFotos = [
            {
              colSpan: 4,
              text: "FOTOGRAFÍAS",
              alignment: "center",
              style: "bold9",
              color: "#17202A",
            },
            "",
            "",
            "",
          ];
          const tableFotos = [
            {
              colSpan: 4,
              table: {
                widths: ["*", "*"],
                body: [
                  [
                    { text: "ANTES", style: "bold9", alignment: "center" },
                    { text: "DESPUÉS", style: "bold9", alignment: "center" },
                  ],
                  [
                    {
                      image: foto0,
                      width: item.fotos[0].url ? 244 : 30,
                      height: item.fotos[0].url ? 200 : 1,
                      alignment: "center",
                      border: [false, true, false, false],
                    },
                    {
                      image: foto2,
                      width: item.fotos[2].url ? 244 : 30,
                      height: item.fotos[2].url ? 200 : 1,
                      alignment: "center",
                      border: [true, true, false, false],
                    },
                  ],
                  [
                    {
                      image: foto1,
                      width: item.fotos[1].url ? 244 : 30,
                      height: item.fotos[1].url ? 200 : 1,
                      alignment: "center",
                      border: [false, true, false, false],
                    },
                    {
                      image: foto3,
                      width: item.fotos[3].url ? 244 : 30,
                      height: item.fotos[3].url ? 200 : 1,
                      alignment: "center",
                      border: [true, true, false, false],
                    },
                  ],
                ],
              },
              // layout: 'noBorders',
              // margin: [4, 4, 4, 4],
              alignment: "center",
            },
            "",
            "",
            "",
          ];
          bodyCheckList.push(titleFotos);
          bodyCheckList.push(tableFotos);
        }
        bodyCheckList.push(divisor12);
      }
    }

    return {
      style: "tablaPrincipal",
      table: {
        widths: [45, 35, "*", 50],
        body: bodyCheckList,
      },
    };
  }

  /**
   * Obtiene la OT principal y secundarias.
   * DEPRECATED: Obtiene la tarea desde el Store
   *
   */
  private async obtieneTarea() {
    await this.tareasService
      .getTareaOTById(this.tareaId)
      .then(async (tareas) => {
        // Tarea a editar
        this.tarea = tareas.find((t) => t.id === this.tareaId);
        // Tarea para detectar cambios
        this.tareaClone = tareas.find((t) => t.id === this.tareaId);
        // Tarea padre
        this.tareaParent = tareas[0];
        this.tareasChilds = tareas.filter(
          (t) => t.id_parent_wo === this.tareaParent.id
        );
        // Variabls de flujos.
        this.hasChildren = this.tarea?.has_children;
        this.otFinalizada = this.tarea?.id_status_work_order === 3;
        this.esMantencionPreventiva =
          this.tarea?.tasks_log_task_type_main ===
          Servicio.MANTENIMIENTO_PREVENTIVO;
        this.checklist = this.tarea?.checklist
          ? JSON.parse(this.tarea.checklist)
          : [];
        await this.cargarTareaEnFormulario(this.tarea);

        // OT visualizada
        if (
          this.tarea.id_assigned_user === this.authService?.user?.id_person &&
          !this.tarea.review_date
        ) {
          const time = new Date();
          this.tarea.review_date = time.toISOString();
          this.tareaParent.review_date = time.toISOString();
          this.tareasChilds.map((t) => {
            t.review_date = time.toISOString();
          });
        }
      });
  }

  refresh() {
    this.tareasService.getTareaOTById(this.tareaId).then((tareas) => {
      this.tarea = tareas.find((t) => t.id === this.tareaId);
      this.tareaParent = tareas[0];
      this.tareasChilds = tareas.filter(
        (t) => t.id_parent_wo === this.tareaParent.id
      );
    });
  }
  async generarContenidoFirmasMantencionesPreventivas() {
    return {
      style: "tablaPrincipal",
      table: {
        widths: [160, "*", 160],
        body: [
          // divisor
          [
            {
              colSpan: 3,
              text: " ",
              fontSize: 8,
              border: [false, false, false, false],
            },
            "",
            "",
          ],
          // Firmas
          [
            {
              text: "TRABAJO ACEPTADO POR:",
              alignment: "center",
              style: "bold9",
            },
            {
              text: "TRABAJO REVISADO POR:",
              alignment: "center",
              style: "bold9",
            },
            {
              text: "TRABAJO EJECUTADO POR:",
              alignment: "center",
              style: "bold9",
            },
          ],
          [
            { image: "firmaAprobador", width: 150 },
            {
              image: await this.getBase64ImageFromURL(this.urlFirmaValidador),
              width: this.validador?.path_signature ? 150 : 30,
              alignment: "center",
            },
            {
              image: await this.getBase64ImageFromURL(this.urlFirmaEjecutor),
              width: this.ejecutor?.path_signature ? 150 : 30,
              alignment: "center",
            },
          ],

          // --------------------------------------------------------
          // Nombre
          [
            {
              text: [
                { text: "NOMBRE: ", bold: true },
                {
                  text: this.tarea?.details_signature
                    ? this.tarea.details_signature.toUpperCase()
                    : "",
                },
              ],
            },
            {
              text: [
                { text: "NOMBRE: ", bold: true },
                {
                  text: this.validador
                    ? this.validador.name?.toUpperCase()
                    : "",
                },
              ],
            },
            {
              text: [
                { text: "NOMBRE: ", bold: true },
                {
                  text: this.ejecutor ? this.ejecutor.name?.toUpperCase() : "",
                },
              ],
            },
          ],
          // Rut
          [
            {
              text: [
                { text: "RUT:", bold: true },
                {
                  text: "          ".concat(
                    this.tarea.aceptado_por_rut
                      ? this.tarea.aceptado_por_rut
                      : ""
                  ),
                },
              ],
            },
            {
              text: [
                { text: "RUT:", bold: true },
                {
                  text: "          ".concat(
                    this.validador?.rut ? this.validador.rut : ""
                  ),
                },
              ],
            },
            {
              text: [
                { text: "RUT:", bold: true },
                {
                  text: "          ".concat(
                    this.ejecutor?.rut ? this.ejecutor.rut : ""
                  ),
                },
              ],
            },
          ],
          // Cargo					[
          [
            {
              text: [
                { text: "CARGO:", bold: true },
                {
                  text: "    ".concat(
                    this.tarea.aceptado_por_cargo
                      ? this.tarea.aceptado_por_cargo
                      : ""
                  ),
                },
              ],
            },
            {
              text: [
                { text: "CARGO:", bold: true },
                {
                  text: "    ".concat(
                    this.validador?.groups_permissions_description
                      ? this.validador.groups_permissions_description
                      : ""
                  ),
                },
              ],
            },
            {
              text: [
                { text: "CARGO:", bold: true },
                {
                  text: "    ".concat(
                    this.ejecutor?.groups_permissions_description
                      ? this.ejecutor.groups_permissions_description
                      : ""
                  ),
                },
              ],
            },
          ],
        ],
      },
    };
  }
  private requerido = [Validators.required];
  getBase64ImageFromURL(url) {
    // Si no hay URL, devolver una imagen vacía
    if (!url || url === undefined || url === null || url?.length === 0) {
      return new Promise((resolve) => resolve(this.imagenVacia));
    }

    return new Promise((resolve, reject) => {
      let img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        let dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = url;
    });
  }
  /**
   * Instancia los FormBuilders con o sin datos iniciales.
   */
  private creaFormGroups(update?: boolean) {
    this.formTimerOT = this.fb.group({
      numero: [{ value: "", disabled: true }, Validators.required],
      fecha: [
        { value: new Date().toISOString(), disabled: true },
        Validators.required,
      ],
      horaInicio: [
        { value: "", disabled: this.otFinalizada },
        [Validators.required, Validators.minLength(5)],
      ],
      horaTermino: [{ value: "", disabled: this.otFinalizada }],
      tiempoEjecucion: [{ value: "", disabled: this.otFinalizada }],
    });

    this.formTimerEndOT = this.fb.group({
      horaTermino: [
        { value: "", disabled: this.otFinalizada },
        [Validators.required, Validators.minLength(5)],
      ],
      tiempoEjecucion: [
        { value: "", disabled: this.otFinalizada },
        [Validators.required, Validators.minLength(5)],
      ],
    });

    this.formTareaOT = this.fb.group({
      cliente: [
        {
          value: "",
          disabled: this.esTecnico || this.esBodeguero || this.otFinalizada,
        },
        Validators.required,
      ],
      local: [
        {
          value: "",
          disabled: this.esTecnico || this.esBodeguero || this.otFinalizada,
        },
        Validators.required,
      ],
      fechaSolicitudServicio: [
        { value: new Date().toISOString(), disabled: true },
        Validators.required,
      ],
      equipo: [
        {
          value: "",
          disabled: this.esTecnico || this.esBodeguero || this.otFinalizada,
        },
        Validators.required,
      ],
      servicio: [
        {
          value: "",
          disabled: this.esTecnico || this.esBodeguero || this.otFinalizada,
        },
        Validators.required,
      ],
      prioridad: [
        {
          value: "",
          disabled: this.esTecnico || this.esBodeguero || this.otFinalizada,
        },
        Validators.required,
      ],
      autor: [{ value: this.authService.user?.name, disabled: true }],
      tecnico: [
        {
          value: "",
          disabled: this.esTecnico || this.esBodeguero || this.otFinalizada,
        },
      ],
      antecedentes: [
        {
          value: "",
          disabled: this.esTecnico || this.esBodeguero || this.otFinalizada,
        },
        Validators.required,
      ],
    });

    if (!update || update === undefined) {
      this.formFotosOT = this.fb.group({
        foto1: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
          Validators.required,
        ],
        foto2: [{ value: "", disabled: this.otFinalizada || this.esBodeguero }],
        foto3: [{ value: "", disabled: this.otFinalizada || this.esBodeguero }],
        foto4: [{ value: "", disabled: this.otFinalizada || this.esBodeguero }],
        foto5: [{ value: "", disabled: this.otFinalizada || this.esBodeguero }],
      });
    }

    if (!update || update === undefined) {
      this.formFirmasOT = this.fb.group({
        observaciones: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
          Validators.required,
        ],
        aceptado_por_nombre: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
          Validators.required,
        ],
        aceptado_por_rut: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
          Validators.required,
        ],
        aceptado_por_cargo: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
          Validators.required,
        ],
        aceptado_por_firma: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
          Validators.required,
        ],
        revisado_por_nombre: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
        ],
        revisado_por_rut: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
        ],
        revisado_por_cargo: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
        ],
        revisado_por_firma: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
        ],
        ejecutado_por_nombre: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
        ],
        ejecutado_por_rut: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
        ],
        ejecutado_por_cargo: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
        ],
        ejecutado_por_firma: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
        ],
      });
    }

    if (!update || update === undefined) {
      this.formChechListGeneral = this.fb.group({
        latitud: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
        ],
        longitud: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
        ],
        altitud: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
        ],
        direccion: [{ value: "", disabled: true }, Validators.required],
        descripcion: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
          Validators.required,
        ],
        materiales: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
          Validators.required,
        ],
        tipoFalla: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
          Validators.required,
        ],
        causaFalla: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
          Validators.required,
        ],
        metodoDeteccionFalla: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
          Validators.required,
        ],
        equipoDetenido: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
          Validators.required,
        ],
        motivoDetencion: [
          { value: "", disabled: this.otFinalizada || this.esBodeguero },
        ],
      });
    }

    if (!update || update === undefined) {
      this.formFotosOT.valueChanges.subscribe(() => {
        this.fotosPorSubir$.subscribe((u) => {
          this.fotosPorSubir = u;
        });
        this.fotosEnTarea$.subscribe((t) => {
          this.fotosEnTarea = t;
        });
      });

      // Guía de uso de Observables: https://rxjs.dev/guide/observable
      this.fotosPorSubir$ = new Observable((subscriber) => {
        const existsFotosPorSubir: boolean =
          this.formFotosOT.get("foto1")?.value instanceof FileInput ||
          this.formFotosOT.get("foto2")?.value instanceof FileInput ||
          this.formFotosOT.get("foto3")?.value instanceof FileInput ||
          this.formFotosOT.get("foto4")?.value instanceof FileInput ||
          this.formFotosOT.get("foto5")?.value instanceof FileInput;
        subscriber.next(existsFotosPorSubir);
      });

      this.fotosEnTarea$ = new Observable((subscriber) => {
        const existsFotosEnTarea: boolean =
          typeof this.formFotosOT.get("foto1")?.value === "string" ||
          typeof this.formFotosOT.get("foto2")?.value === "string" ||
          typeof this.formFotosOT.get("foto3")?.value === "string" ||
          typeof this.formFotosOT.get("foto4")?.value === "string" ||
          typeof this.formFotosOT.get("foto5")?.value === "string";
        subscriber.next(existsFotosEnTarea);
      });
    }

    if (this.esMantencionPreventiva) {
      this.onTipoServicioSelectionChange(Servicio.MANTENIMIENTO_PREVENTIVO);
    }
  }

  setStep(index: number) {
    this.step = index;
    if (index === 1) {
      console.log("Verificar permisos MAPS");
    }
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  ngOnDestroy(): void {
    this.formTareaOT = undefined;
    this.formFotosOT = undefined;
    this.formFirmasOT = undefined;
    this.formChechListGeneral = undefined;
    this.cliente = undefined;
    this.equipo = undefined;
    this.local = undefined;
    stop();
  }

  stop() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectionChangedStepper(event: any) {
    const matStep: MatStep = event.selectedStep;
    const stepId =
      matStep?.content?.elementRef?.nativeElement?.ownerDocument?.activeElement
        ?.id;
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
      stepElement.scrollIntoView({
        block: "start",
        inline: "nearest",
        behavior: "smooth",
      });
    }
  }

  tipoCheckList: string;
  jsonCheckList: CheckList;
  onTipoMantenimientoSelectionChange(event: any) {
    this.tipoCheckList = event;
    this.checklist.sort((a, b) => a.orden - b.orden);
    this.jsonCheckList = this.checklist.find((o) => o.tipo === event);
    if (typeof this.jsonCheckList.opciones === "string") {
      this.jsonCheckList.opciones = this.jsonCheckList.opciones
        ? JSON.parse(this.jsonCheckList.opciones)
        : [];
    }
    if (typeof this.jsonCheckList.checklist === "string") {
      this.jsonCheckList.checklist = this.jsonCheckList.checklist
        ? JSON.parse(this.jsonCheckList.checklist)
        : [];
    }
  }

  get servicio(): string {
    return this.formTareaOT?.get("servicio")?.value;
  }

  capitalizeWords(text: string): string {
    return text.replace(/(?:^|\s)\S/g, (res) => {
      return res.toUpperCase();
    });
  }

  /**
   * Método que reune todas las subscripciones al Store de NgRx.
   */
  private subscribirseAlStore(): void {
    // Nos subscribimos a los equipos y locales.
    this.store
      .select("clientes")
      .pipe(filter((state) => state.clientes != null))
      .subscribe((state) => {
        this.clientes = state.clientes;
      });

    this.store
      .select("locales")
      .pipe(filter((state) => state.locales != null))
      .subscribe((state) => {
        this.locales = state.locales.map((local: Local) => ({
          ...local,
          nombre: `${local.nombre} (CECO: ${local.ceco})`,
        }));
      });

    this.store
      .select("equipos")
      .pipe(filter((e) => e.loaded))
      .subscribe((state) => {
        if (state?.loaded) {
          this.equipos = state.equipos
            .filter((equipo) => equipo.codigolocal == this.local?.codigo)
            .map((equipo) => ({
              ...equipo,
              nombre: `${equipo.nombre} ${
                equipo.otro ? "- " + equipo.otro : ""
              } { ${equipo.codigo} }`,
            }));
        }
      });

    this.store
      .select("usuarios")
      .pipe(
        filter((state) => state.usuarios != null),
        map((state) =>
          state.usuarios.filter(
            (u) => u.profiles_description === "TECHNICAL" && u.active === true
          )
        )
      )
      .subscribe((usuarios) => {
        this.responsables = usuarios;
      });

    this.store
      .select("folio")
      .pipe(filter((state) => state.folio != null))
      .subscribe((state) => {
        this.folio = state.folio;
      });

    this.store
      .select("tipoFallas")
      .pipe(take(2), skip(1))
      .subscribe((state) => {
        if (state?.loaded) {
          this.tipoFallas = [...new Set(state.tipoFallas)]; // elimina duplicados.
        }
      });

    this.store
      .select("causaFallas")
      .pipe(take(2), skip(1))
      .subscribe((state) => {
        if (state?.loaded) {
          this.causaFallas = [...new Set(state.causaFallas)]; // elimina duplicados.
        }
      });

    this.store
      .select("metodosDeteccion")
      .pipe(take(2), skip(1))
      .subscribe((state) => {
        if (state?.loaded) {
          this.metodosDeteccion = [...new Set(state.metodosDeteccion)]; // elimina duplicados.
        }
      });

    this.store
      .select("motivosDetencion")
      .pipe(take(2), skip(1))
      .subscribe((state) => {
        if (state?.loaded) {
          this.motivosDetencion = [...new Set(state.motivosDetencion)]; // elimina duplicados.
          this.motivoDetencionFB = state.motivoDetencion;
        }
      });

    this.store.select("ui").subscribe(({ isLoading, porcentaje }) => {
      this.cargando = isLoading;
      this.porcentaje = porcentaje;
    });
  }

  /**
   * Carga datos de una tarea en todo el formulario.
   * Usado para Ver y Editar.
   * @param tarea
   */
  async cargarTareaEnFormulario(tarea: TareaOT) {
    // Si no se recibe tarea, no se procesa.
    if (!tarea || tarea === undefined) {
      console.log("Tarea no disponible, no se carga");
      return;
    }

    // Hora Inicio
    if (tarea.initial_date && tarea.initial_date?.length > 0) {
      // Obtenemos la fecha y hora completa del timer hora inicio
      this.fechaHoraInicio = tarea.initial_date;
      this.horaInicial = moment
        .utc(this.fechaHoraInicio)
        .local()
        .format("HH:mm:ss");
      this.formTimerOT.get("horaInicio").disable();
    }
    if (tarea.final_date && tarea.final_date?.length > 0) {
      // y del timer hora fin, para cargarla en pantalla solo en formato hora.
      this.fechaHoraFin = tarea.final_date;
      this.horaFinal = moment.utc(this.fechaHoraFin).local().format("HH:mm:ss");
      this.formTimerEndOT.get("horaTermino").disable();
      this.formTimerEndOT.get("tiempoEjecucion").disable();
    }

    if (tarea.signature && this.tarea.signature?.length > 0) {
      this.existeFirmaAprobada = true;
    }

    let fechaCreacion: string = "";
    if (tarea.creation_date && tarea.creation_date.indexOf("Z") > -1) {
      fechaCreacion = tarea.creation_date;
    } else if (tarea.creation_date) {
      fechaCreacion = new Date(tarea.creation_date).toISOString();
    }

    if (tarea.real_duration) {
      this.horaTiempoEjecucion = tarea.real_duration;
      this.tiempoEjecucion = moment
        .utc(Number(this.horaTiempoEjecucion))
        .format("HH:mm:ss");
    }

    if (tarea.id_assigned_user) {
      this.responsable = tarea.id_assigned_user;
    }

    console.log("Cargando Número OT: ", tarea.wo_folio);
    this.formTimerOT?.get("numero").setValue(tarea.wo_folio?.toString());
    this.formTimerOT?.get("fecha").setValue(tarea.initial_date);
    this.formTimerOT?.get("horaInicio").setValue(this.horaInicial);
    this.formTimerEndOT?.get("horaTermino").setValue(this.horaFinal);
    this.formTimerEndOT?.get("tiempoEjecucion").setValue(this.tiempoEjecucion);

    // Encabezados
    this.formTareaOT?.get("cliente").setValue({ cliente: tarea.cliente });
    this.formTareaOT?.get("local").setValue({ nombre: tarea.local });
    this.formTareaOT
      ?.get("fechaSolicitudServicio")
      .setValue(
        tarea.cal_date_maintenance ? new Date(tarea.cal_date_maintenance) : ""
      );
    this.formTareaOT
      ?.get("equipo")
      .setValue({ nombre: tarea.items_log_description });
    this.formTareaOT
      ?.get("servicio")
      .setValue(tarea.tasks_log_task_type_main?.toString());
    this.formTareaOT
      ?.get("prioridad")
      .setValue(tarea.priorities_description?.toString());
    this.formTareaOT?.get("autor").setValue(tarea.requested_by?.toString());
    this.formTareaOT?.get("tecnico").setValue({
      name: tarea.personnel_description ? tarea.personnel_description : "",
    });
    this.formTareaOT
      ?.get("antecedentes")
      .setValue(tarea.description?.toString());

    // Check List General
    this.formChechListGeneral
      ?.get("latitud")
      .setValue(tarea.latitud?.toString());
    this.formChechListGeneral
      ?.get("longitud")
      .setValue(tarea.longitud?.toString());
    this.formChechListGeneral
      ?.get("altitud")
      .setValue(tarea.altitud?.toString());
    this.formChechListGeneral
      ?.get("direccion")
      .setValue(tarea.direccion?.toString());
    this.formChechListGeneral
      ?.get("descripcion")
      .setValue(tarea.description_general?.toString());
    this.formChechListGeneral
      ?.get("materiales")
      .setValue(tarea.materiales?.toString());
    this.formChechListGeneral
      ?.get("tipoFalla")
      .setValue({ description: tarea.types_description });
    this.formChechListGeneral
      ?.get("causaFalla")
      .setValue({ description: tarea.causes_description });
    this.formChechListGeneral
      ?.get("metodoDeteccionFalla")
      .setValue({ description: tarea.detection_method_description });
    this.formChechListGeneral
      ?.get("equipoDetenido")
      .setValue(tarea.time_disruption?.toString());
    if (tarea.caused_disruption) {
      this.formChechListGeneral
        ?.get("motivoDetencion")
        .setValue({ nombre: tarea.caused_disruption?.toString() });
    }

    this.address = tarea.direccion?.toString();
    this.latitud = tarea.latitud ? Number(tarea.latitud) : undefined;
    this.longitud = tarea.longitud ? Number(tarea.longitud) : undefined;
    this.altitud = tarea.altitud ? Number(tarea.altitud) : undefined;

    this.inicializarMapaConBusqueda();

    // Fotos
    this.formFotosOT?.get("foto1").setValue(tarea.foto1?.toString());
    this.formFotosOT?.get("foto2").setValue(tarea.foto2?.toString());
    this.formFotosOT?.get("foto3").setValue(tarea.foto3?.toString());
    this.formFotosOT?.get("foto4").setValue(tarea.foto3?.toString());
    this.formFotosOT?.get("foto5").setValue(tarea.foto3?.toString());
    this.urlFoto1 = tarea.foto1?.toString();
    this.urlFoto2 = tarea.foto2?.toString();
    this.urlFoto3 = tarea.foto3?.toString();
    this.urlFoto4 = tarea.foto4?.toString();
    this.urlFoto5 = tarea.foto5?.toString();

    if (this.urlFoto1) {
      this.sizeFoto1 = (await fetch(this.urlFoto1).then((r) => r.blob()))?.size;
    }
    if (this.urlFoto2) {
      this.sizeFoto2 = (await fetch(this.urlFoto2).then((r) => r.blob()))?.size;
    }
    if (this.urlFoto3) {
      this.sizeFoto3 = (await fetch(this.urlFoto3).then((r) => r.blob()))?.size;
    }
    if (this.urlFoto4) {
      this.sizeFoto4 = (await fetch(this.urlFoto4).then((r) => r.blob()))?.size;
    }
    if (this.urlFoto5) {
      this.sizeFoto5 = (await fetch(this.urlFoto5).then((r) => r.blob()))?.size;
    }

    // Firmas
    this.formFirmasOT
      ?.get("observaciones")
      .setValue(tarea.observaciones?.toString());
    this.formFirmasOT
      ?.get("aceptado_por_nombre")
      .setValue(tarea.details_signature?.toString());
    this.formFirmasOT
      ?.get("aceptado_por_rut")
      .setValue(tarea.aceptado_por_rut?.toString());
    this.formFirmasOT
      ?.get("aceptado_por_cargo")
      .setValue(tarea.aceptado_por_cargo?.toString());
    this.formFirmasOT
      ?.get("aceptado_por_firma")
      .setValue(tarea.signature?.toString()); // Base64
    this.formFirmasOT
      ?.get("revisado_por_nombre")
      .setValue(tarea.revisado_por_nombre?.toString());
    this.formFirmasOT
      ?.get("revisado_por_rut")
      .setValue(tarea.revisado_por_rut?.toString());
    this.formFirmasOT
      ?.get("revisado_por_cargo")
      .setValue(tarea.revisado_por_cargo?.toString());
    this.formFirmasOT
      ?.get("revisado_por_firma")
      .setValue(tarea.validator_path_signature?.toString());
    this.formFirmasOT
      ?.get("ejecutado_por_nombre")
      .setValue(tarea.user_assigned?.toString());
    this.formFirmasOT
      ?.get("ejecutado_por_rut")
      .setValue(tarea.ejecutado_por_rut?.toString());
    this.formFirmasOT
      ?.get("ejecutado_por_cargo")
      .setValue(tarea.ejecutado_por_cargo?.toString());
    this.formFirmasOT
      ?.get("ejecutado_por_firma")
      .setValue(tarea.responsible_path_signature?.toString());

    // Otros
    this.equipo = tarea.code?.toString();

    this.cargando = false;

    // Bugfixed cuadros de selección que no muestra valor inyectado.
    let element: HTMLElement = document.getElementById(
      "formTarea"
    ) as HTMLElement;
    element?.click();
  }

  /**
   * Permite cargar el mapa de Google Maps, verifica permisos previamente.
   */
  public cargarMaps() {
    Notification.requestPermission(function (result) {
      if (result === "denied") {
        console.log("Permission wasn't granted. Allow a retry.");
        return;
      } else if (result === "default") {
        console.log("The permission request was dismissed.");
        return;
      }
      console.log("Permission was granted for notifications");
    });

    this.verificarPermisosGeolocalizacion();
  }

  /**
   * Check for Geolocation API permissions
   */
  public verificarPermisosGeolocalizacion(): void {
    navigator.permissions
      .query({ name: "geolocation" })
      .then(function (permissionStatus) {
        permissionStatus.onchange = function () {
          console.log(
            "geolocation permission state has changed to ",
            this.state
          );
        };
      });
  }

  // Propiedades para componente ngx-mat-combobox
  // URL: https://ngx-mat-combobox.web.app/
  fillInput: boolean = true;
  autocompleteMinChars: number = 0;
  autocompleteDebounceInterval: number = 400;
  get placeholder() {
    const c = this.autocompleteMinChars;
    if (c > 0) {
      return `Escriba al menos ${c} caracteres${c > 1 ? "s" : ""}...`;
    }
    return "Buscar...";
  }
  public filterOptionsFn(campo: string): NgxMatComboboxFilterOptionsFn {
    return (query: string, options: any[]): Observable<any[]> | any[] => {
      return options
        .filter((o) => {
          this.opcionCombo = query?.trim();
          return ("" + o[campo]).toLowerCase().includes(query?.toLowerCase());
        })
        .slice();
    };
  }

  // --------------------------- ngx-mat-combobox
  // Type con firma de dos parámetros y retorno de un tipo (funciones callbacks)
  // URL: https://www.tutorialesprogramacionya.com/angularya/detalleconcepto.php?punto=24&codigo=24&inicio=20#:~:text=Funciones%20an%C3%B3nimas.,valor1%20%2B%20valor2%3B%20%7D%20console.
  public onFilterOptionsFn: NgxMatComboboxFilterOptionsFn = (
    query: string,
    options: any[]
  ): Observable<any[]> | any[] => {
    return options
      .filter((o) =>
        ("" + o["nombre"]).toLowerCase().includes(query?.toLowerCase())
      )
      .slice();
  };

  /**
   * Establece la hora de inicio de una OT.
   */
  iniciarOT(): void {
    const time = new Date();
    this.horaInicial = time.toLocaleTimeString();
    this.fechaHoraInicio = time.toISOString();
    const fecha = moment.utc(this.fechaHoraInicio).local().format("HH:mm:ss");
    this.formTimerOT.get("horaInicio").setValue(fecha);
    this.formTimerOT.get("horaInicio").disable();

    if (this.esChild === undefined && this.tarea?.id_parent_wo === null) {
      this.tarea = {
        ...this.tarea,
        initial_date: this.fechaHoraInicio,
        // id_status_work_order: 1 // en proceso
      };
      this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
    } else {
      this.tareaParent = {
        ...this.tareaParent,
        initial_date: this.fechaHoraInicio,
        // id_status_work_order: 1 // en proceso
      };
      this.store.dispatch(
        actions.actualizarTareaOT({ tareaOT: this.tareaParent })
      );

      this.tareasChilds.forEach((task) => {
        let tarea: TareaOT = {
          ...task,
          initial_date: this.fechaHoraInicio,
          // id_status_work_order: 1 // en proceso
        };

        setTimeout(() => {
          this.store.dispatch(actions.actualizarTareaOT({ tareaOT: tarea }));
        }, 600);
      });
    }
  }

  pararOT() {
    // if(!this.verificaFormularios()) {
    //   this.openSnackBar("Aún faltan campos por completar, verifique.", "Ok");
    //   return;
    // }

    const time = new Date();
    this.horaFinal = time.toLocaleTimeString();
    this.fechaHoraFin = time.toISOString();

    const startTime = moment(this.fechaHoraInicio);
    const endTime = moment(this.fechaHoraFin);

    this.horaTiempoEjecucion = endTime.diff(startTime).toString(); // diff
    this.tiempoEjecucion = moment
      .utc(Number(this.horaTiempoEjecucion))
      .local()
      .format("HH:mm:ss");

    this.formTimerEndOT.get("horaTermino").setValue(this.horaFinal);
    this.formTimerEndOT.get("tiempoEjecucion").setValue(this.tiempoEjecucion);
    this.formTimerEndOT.get("horaTermino").disable();
    this.formTimerEndOT.get("tiempoEjecucion").disable();

    console.log(
      `Registrando hora de término: ${this.tiempoEjecucion} => ${this.horaTiempoEjecucion}`
    );

    if (this.esChild === undefined && this.tarea?.id_parent_wo === null) {
      this.tarea = {
        ...this.tarea,
        final_date: this.fechaHoraFin,
        real_duration: this.horaTiempoEjecucion,
        id_status_work_order: 8, // por revisar
      };
      setTimeout(() => {
        this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
      }, 600);
    } else {
      this.tareaParent = {
        ...this.tareaParent,
        final_date: this.fechaHoraFin,
        real_duration: this.horaTiempoEjecucion,
        id_status_work_order: 8, // por revisar
      };
      setTimeout(() => {
        this.store.dispatch(
          actions.actualizarTareaOT({ tareaOT: this.tareaParent })
        );
      }, 600);

      this.tareasChilds.forEach((tarea) => {
        const task: TareaOT = {
          ...tarea,
          final_date: this.fechaHoraFin,
          real_duration: this.horaTiempoEjecucion,
          id_status_work_order: 8, // por revisar
        };
        setTimeout(() => {
          this.store.dispatch(actions.actualizarTareaOT({ tareaOT: task }));
        }, 600);
      });
    }

    setTimeout(() => {
      this.router.navigate(["/task/services"]);
    }, 3000);
  }

  validarOT() {
    if ((this.esSupervisor || this.esAdministrador) && this.tarea) {
      Swal.fire({
        title: "Está a un paso de validar la OT N° ".concat(
          this.tareaParent.wo_folio
        ),
        html: " ¿Desea continuar?",
        icon: "question",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: `OK`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          const time = new Date();
          const fechaFinal = time.toISOString();

          if (this.esChild === undefined && this.tarea?.id_parent_wo === null) {
            this.tarea = {
              ...this.tarea,
              id_status_work_order: 3,
              id_validated_by: this.authService.user.id_person,
              validated_by_description: this.authService.user.name,
              wo_final_date: fechaFinal,
            };
            this.store.dispatch(
              actions.actualizarTareaOT({ tareaOT: this.tarea })
            );
          } else {
            this.tareaParent = {
              ...this.tareaParent,
              id_status_work_order: 3,
              id_validated_by: this.authService.user.id_person,
              validated_by_description: this.authService.user.name,
              wo_final_date: fechaFinal,
            };
            this.store.dispatch(
              actions.actualizarTareaOT({ tareaOT: this.tareaParent })
            );

            this.tareasChilds.forEach((tarea) => {
              const task: TareaOT = {
                ...tarea,
                id_status_work_order: 3,
                id_validated_by: this.authService.user.id_person,
                validated_by_description: this.authService.user.name,
                wo_final_date: fechaFinal,
              };
              this.store.dispatch(actions.actualizarTareaOT({ tareaOT: task }));
            });
          }

          this.store.pipe(select("tarea"), take(2)).subscribe((state) => {
            console.log("tarea validad take 1.");
            if (state.loaded) {
              Swal.fire({
                title: "OT Validada correctamente.",
                html: " Estado cambiado a FINALIZADA",
                icon: "success",
                showDenyButton: false,
                showCancelButton: false,
                confirmButtonText: `OK`,
              });
              // .then((res) => {
              //    setTimeout( () => {this.router.navigate(['/task/services']);}, 1000);
              // });
            } else if (state.error) {
              console.error("Error al validar", state);
              Swal.fire("Error en la valdiación.", state.error?.error, "error");
            }
          });
        }
      });
    }
  }

  onClienteSelectionChange(cliente: Cliente) {
    if (Array.isArray(cliente) && cliente.length > 0) {
      const _cliente: Cliente = cliente[0];
      if (_cliente?.uid) {
        this.cliente = _cliente.uid;
        this.store.dispatch(actions.cargarLocales({ uid: this.cliente }));
      } else if (_cliente.cliente) {
        // Tiene solo el nombre del cliente pero no su UID, se busca.
        this.clienteService
          .getClienteByName(_cliente.cliente)
          .then(async (clienteFB) => {
            console.log(
              "se recupera UID ",
              clienteFB.uid,
              " de cliente ",
              clienteFB.cliente
            );
            this.cliente = clienteFB.uid;
            this.store.dispatch(actions.cargarLocales({ uid: this.cliente }));

            // Cargando latitud y longitud desde local por default
            if (!this.latitud || this.latitud === undefined) {
              const v = this.tarea.local;
              const ceco = v.substring(v.indexOf("CECO:") + 6, v.length - 1);
              this.clienteService
                .getLocalByCECO(this.cliente, ceco)
                .then((local) => {
                  console.log(
                    "Buscando CECO: ",
                    ceco,
                    "lat",
                    local.latitude,
                    "lon",
                    local.longitud
                  );
                  this.latitud = Number(local.latitude);
                  this.longitud = Number(local.longitud);
                  this.getAddress(this.latitud, this.longitud);
                });
            }

            // Poblando información Checklist para Mantenimiento Preventivo
            if (
              this.tarea.tasks_log_task_type_main ===
              Servicio.MANTENIMIENTO_PREVENTIVO
            ) {
              this.onTipoServicioSelectionChange(
                Servicio.MANTENIMIENTO_PREVENTIVO
              );
              if (
                !this.tarea.checklist ||
                this.tarea.checklist?.length === 0 ||
                this.tarea.checklist === "[]"
              ) {
                console.log("generando checklist...");
                await this.obtenerCheckListDesdePlantilla();
              } else {
                console.log("checklist existe.");
              }
            }
          });
      }
    }
  }

  async obtenerCheckListDesdePlantilla() {
    const fecha = this.tarea?.cal_date_maintenance
      ? this.tarea.cal_date_maintenance
      : this.formTareaOT.get("fechaSolicitudServicio").value;
    // Se agrega un día más ya que las OT se crean un día anterior
    const month = moment(fecha).add(1, "days").format("M");
    const mes = this.opcionesPeriodo.find((o) => o.value === month)?.viewValue;

    let local = "";
    if (this.tarea !== undefined && this.tarea?.local !== undefined) {
      if (this.tarea?.local?.indexOf("Líder", 0) !== -1) {
        local = "Líder";
      } else if (this.tarea?.local?.indexOf("Ekono", 0) !== -1) {
        local = "Ekono";
      }
    }

    console.log("cliente", this.cliente, "mes", mes, "local", local);
    const list = await this.listasService.getCheckListMantencionPrenventiva(
      this.cliente,
      mes,
      local
    );
    if (list) {
      // console.log('mantencion recibida', list);
      if (list && list.length > 0) {
        this.checklist = list;
        this.checklist.forEach((check, index) => {
          console.log("checklist ", index, " => ", check);
          if (typeof check.checklist === "string") {
            check.checklist = JSON.parse(check.checklist);
          }
          if (typeof check.opciones === "string") {
            check.opciones = JSON.parse(check.opciones);
          }
          if (typeof check.fotos === "string") {
            check.fotos = JSON.parse(check.fotos);
          }
        });
        this.checklist.sort((a, b) => a.orden - b.orden);
      }
    }
  }

  async onTipoServicioSelectionChange(event: any) {
    if (event === Servicio.MANTENIMIENTO_PREVENTIVO) {
      if (
        this.tarea?.checklist === undefined ||
        this.tarea?.checklist?.length < 10
      ) {
        await this.obtenerCheckListDesdePlantilla();
      }
      this.esMantencionPreventiva = true;
      this.formTareaOT.get("equipo").clearValidators();
      this.formTareaOT.get("equipo").updateValueAndValidity();
      this.formTareaOT.get("equipo").disable();
      this.formChechListGeneral.get("descripcion").clearValidators();
      this.formChechListGeneral.get("descripcion").updateValueAndValidity();
      this.formChechListGeneral.get("materiales").clearValidators();
      this.formChechListGeneral.get("materiales").updateValueAndValidity();
      this.formChechListGeneral.get("tipoFalla").clearValidators();
      this.formChechListGeneral.get("tipoFalla").updateValueAndValidity();
      this.formChechListGeneral.get("causaFalla").clearValidators();
      this.formChechListGeneral.get("causaFalla").updateValueAndValidity();
      this.formChechListGeneral.get("metodoDeteccionFalla").clearValidators();
      this.formChechListGeneral
        .get("metodoDeteccionFalla")
        .updateValueAndValidity();
      this.formChechListGeneral.get("equipoDetenido").clearValidators();
      this.formChechListGeneral.get("equipoDetenido").updateValueAndValidity();
      this.formFotosOT.get("foto1").clearValidators();
      this.formFotosOT.get("foto1").updateValueAndValidity();
    } else {
      this.esMantencionPreventiva = false;
      this.formTareaOT.get("equipo").enable();
      this.formTareaOT.get("equipo").setValidators(this.requerido);
      this.formChechListGeneral
        .get("descripcion")
        .setValidators(this.requerido);
      this.formChechListGeneral.get("materiales").setValidators(this.requerido);
      this.formChechListGeneral.get("tipoFalla").setValidators(this.requerido);
      this.formChechListGeneral.get("causaFalla").setValidators(this.requerido);
      this.formChechListGeneral
        .get("metodoDeteccionFalla")
        .setValidators(this.requerido);
      this.formChechListGeneral
        .get("equipoDetenido")
        .setValidators(this.requerido);
    }
  }

  onEquipoDetenidoSelectionChange(event: any) {
    if (event == "No") {
      this.formChechListGeneral.get("motivoDetencion").clearValidators();
      this.formChechListGeneral.get("motivoDetencion").updateValueAndValidity();
      this.formChechListGeneral.get("motivoDetencion").disable();
    } else {
      this.formChechListGeneral.get("motivoDetencion").enable();
      this.formChechListGeneral
        .get("motivoDetencion")
        .setValidators(this.requerido);
    }
  }

  onLocalSelectionChange(locales: Local[]) {
    if (Array.isArray(locales) && locales.length > 0) {
      this.local = locales[0];
      if (this.local) {
        this.address = this.local.direccion;
        this.latitud = Number(this.local.latitude);
        this.longitud = Number(this.local.longitud);
        this.store.dispatch(
          actions.cargarEquipos({
            uid: this.cliente,
            codigolocal: this.local.codigo,
          })
        );
      }
    }
  }

  onTecnicoSelectionChange(tecnico: Usuario[]) {
    if (Array.isArray(tecnico) && tecnico.length > 0 && tecnico[0].id_person) {
      this.responsable = tecnico[0].id_person;
    }
  }

  async onFotoChecklistUploadChange(event: any, foto: Foto) {
    console.log("datos de la foto a subir", event);
    if (event.target?.files[0] instanceof File) {
      const path = this.generarPathDeFotos();
      const file: File = event.target?.files[0];
      const imageName: string = this.utilitarioService.addTimeToImageName(
        file.name
      );
      console.log("Preparando para guardar: ", imageName);
      var reader = new FileReader();
      reader.onload = (event: any) => {
        const localUrl = event.target.result;
        const orientation = -1;
        this.imageCompress
          .compressFile(localUrl, orientation, 50, 60, 480, 480)
          .then((result) => {
            const metadata = { resizedImage: true };
            const imageBlob = this.fileUploadServive.dataURItoBlob(
              result.split(",")[1]
            );
            const uploadTask = this.fileUploadServive.pushBlobToStorage(
              path,
              imageBlob,
              imageName,
              metadata
            );
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                // Progreso de subida
                this.uploadFotoChecklist =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              },
              (error) => {
                this.openSnackBar(error.message, "OK");
                this.uploadFotoChecklist = -1;
              },
              () => {
                // Success
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  console.log("foto.url generada", downloadURL);
                  foto.url = downloadURL;
                  this.uploadFotoChecklist = -1;
                  this.tarea = {
                    ...this.tarea,
                    checklist: JSON.stringify(this.checklist),
                  };
                  this.store.dispatch(actions.stopLoading());
                  this.store.dispatch(
                    actions.actualizarTareaOT({ tareaOT: this.tarea })
                  );
                });
              }
            );
          });
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Guarda el registro en Firebase
   * @param panel Opción a guardar
   * @returns
   */
  public async onSubmit(panel: string): Promise<void> {
    if (
      this.tarea?.id_status_work_order &&
      this.tarea?.id_status_work_order === 3
    ) {
      const mensaje = `OT ${this.tarea.wo_folio} terminada, no se permite modificar. `;
      console.log(mensaje);
      this.openSnackBar(mensaje, "OK");
      return;
    }

    console.log(
      "--------------------------------Preparando datos para: ",
      panel
    );
    switch (panel) {
      case "encabezado": {
        if (
          this.formTareaOT.invalid ||
          !this.formTareaOT.valid ||
          this.otFinalizada
        ) {
          return;
        }

        this.procesandoEncabezado = true;
        console.log(
          "Permiso Crear: ",
          this.crear,
          ", permiso Editar: ",
          this.editar
        );

        if (this.crear || this.editar || this.esPersonalized) {
          // Se crea una nueva instancia de TareaOT para enviar a Firebase
          const {
            cliente,
            local,
            fechaSolicitudServicio,
            equipo,
            servicio,
            prioridad,
            autor,
            antecedentes,
          } = this.formTareaOT.getRawValue();

          this.tarea = {
            ...this.tarea,
            cliente: cliente["cliente"],
            local: local["nombre"],
            items_log_description: equipo["nombre"],
            tasks_log_task_type_main: servicio,
            priorities_description: prioridad,
            requested_by: autor,
            description: antecedentes,
            cal_date_maintenance: new Date(
              fechaSolicitudServicio
            ).toISOString(),
            personnel_description: this.getPersonalTecnico(),
            id_assigned_user: this.responsable,
          };

          if (this.crear) {
            this.store.dispatch(actions.isLoading()); // Mostrar loading...
            // this.store.dispatch(actions.generarFolio({ id: 'tareas_ot' })); // Avanzar folio
            this.foliosService
              .generarFolio("tareas_ot")
              .then(async (_folio: Folio) => {
                const time = new Date();
                this.folio = _folio;
                this.tarea = {
                  ...this.tarea,
                  wo_folio: this.folio?.numero?.toString(),
                  creation_date: this.getFechaOT(),
                  has_children: false,
                  id_parent_wo: null,
                  // Estado: 6 Técnico asignado, 7 Por asignar técnico.
                  id_status_work_order:
                    this.getPersonalTecnico().length > 0 ? 6 : 7,
                  first_date_task:
                    this.getPersonalTecnico().length > 0
                      ? time.toISOString()
                      : null,
                  direccion: this.local.direccion,
                  latitud: this.local.latitude,
                  longitud: this.local.longitud,
                };

                if (servicio === Servicio.MANTENIMIENTO_PREVENTIVO) {
                  await this.obtenerCheckListDesdePlantilla();
                  this.tarea = {
                    ...this.tarea,
                    checklist: JSON.stringify(this.checklist),
                  };
                }

                this.store.dispatch(
                  actions.crearTareaOT({ tareaOT: this.tarea })
                );
              });
          } else if (this.editar || this.esPersonalized) {
            if (this.tarea.id_status_work_order === 7) {
              this.tarea = {
                ...this.tarea,
                id_status_work_order:
                  this.getPersonalTecnico().length > 0 ? 6 : 7,
              };
            }

            console.log("Verificando cambios en Encabezado...");
            // Verificamos si existen modificaciones para guardar, caso contrario omitimos.
            if (
              !this.utilitarioService.checkModificEncabezado(
                this.tarea,
                this.tareaClone
              )
            ) {
              console.log("Sin cambios en encabezado");
              return;
            }

            this.store.dispatch(
              actions.actualizarTareaOT({ tareaOT: this.tarea })
            );
            if (this.esPersonalized) {
              Swal.fire({
                title: "Registro actualizado",
                html: servicio.concat(" OT N° ", this.tarea.wo_folio),
                icon: "success",
                showDenyButton: false,
                showCancelButton: false,
                confirmButtonText: `OK`,
              }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                  this.router.navigate(["/task/status"]);
                }
              });
            }
          }

          this.store
            .pipe(select("tareas"), take(3), skip(2))
            .subscribe((state) => {
              console.log("pipe select tareas state:", state);
              if (state.loaded) {
                if (this.crear) {
                  this.formTimerOT
                    .get("numero")
                    .setValue(state.tareaOT.wo_folio);
                  this.formTimerOT
                    .get("fecha")
                    .setValue(state.tareaOT.initial_date);
                  Swal.fire({
                    title: "Registro creado",
                    html: servicio.concat(" OT N° ", state.tareaOT.wo_folio),
                    icon: "success",
                    showDenyButton: false,
                    showCancelButton: false,
                    confirmButtonText: `OK`,
                  }).then((result) => {
                    /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {
                      this.router.navigate(["/task/status"]);
                    }
                  });
                } else if (!this.esPersonalized) {
                  this.openSnackBar("Registro actualizado ", "OK");
                }
                this.store.dispatch(actions.stopLoading());
                this.tareaClone = this.tarea;
              } else if (state.error) {
                console.error("Error en encabezado.", state);
                Swal.fire("Error en encabezado.", state.error?.error, "error");
                this.store.dispatch(actions.stopLoading());
              }
            });
        }

        break;
      }

      case "timer":
        if (this.formTimerOT.invalid || this.otFinalizada) {
          return;
        }

        // La tarea ya está cargada en memoria, se debe simplemente actualizar sus campos
        if (!this.tarea?.initial_date) {
          // No hay hora inicial, se busca valor para insertar.
          this.tarea = {
            ...this.tarea,
            initial_date: this.fechaHoraInicio,
          };

          this.store.dispatch(
            actions.actualizarTareaOT({ tareaOT: this.tarea })
          );

          this.tareasChilds?.forEach((tarea) => {
            const task = { ...tarea, initial_date: this.fechaHoraInicio };
            setTimeout(
              () =>
                this.store.dispatch(
                  actions.actualizarTareaOT({ tareaOT: task })
                ),
              300
            );
          });

          this.store
            .pipe(select("tarea"), take(2), skip(1))
            .subscribe((state) => {
              console.log("verificando timer... updated? ", state?.updated);
              if (state.updated) {
                this.openSnackBar("Timer actualizado", "OK");
                this.tareaClone = this.tarea;
              } else if (state.error) {
                console.error("Error al obtener tarea. ", state);
                Swal.fire("Error obtener tarea.", state.error?.error, "error");
              }
            });
        } else {
          console.log("sin cambios en el timer");
        }

        break;

      case "general":
        if (this.otFinalizada) {
          console.log("OT finalizada, se omiten cambios");
        }
        if (
          this.formChechListGeneral.invalid &&
          this.tarea.tasks_log_task_type_main !==
            Servicio.MANTENIMIENTO_PREVENTIVO
        ) {
          console.log("El formulario general es inválido.");
          return;
        }

        if (this.crear || this.editar) {
          // Se obtienen datos GPS ya registrados
          if (this.utilitarioService.checkExistsRecordGPS(this.tareaClone)) {
            console.log("ya existen datos GPS");
            this.tarea = {
              ...this.tarea,
              latitud: this.tareaClone.latitud,
              longitud: this.tareaClone.longitud,
              altitud: this.tareaClone.altitud,
              direccion: this.tareaClone.direccion,
            };
          } else {
            console.log("datos GPS desde Maps");
            this.tarea = {
              ...this.tarea,
              latitud: this.latitud ? this.latitud.toString() : "",
              longitud: this.longitud ? this.longitud.toString() : "",
              altitud: this.altitud ? this.altitud.toString() : "",
              direccion: this.address,
            };
          }

          // Se crean variables apuntando a campos del FormGroup
          const {
            descripcion,
            materiales,
            tipoFalla,
            causaFalla,
            metodoDeteccionFalla,
            equipoDetenido,
            motivoDetencion,
          } = this.formChechListGeneral.getRawValue();

          // La tarea ya está cargada en memoria, se debe simplemente actualizar sus campos
          this.tarea = {
            ...this.tarea,
            description_general: descripcion,
            materiales: materiales,
            types_description: tipoFalla ? tipoFalla["description"] : "",
            causes_description: causaFalla ? causaFalla["description"] : "",
            detection_method_description: metodoDeteccionFalla
              ? metodoDeteccionFalla["description"]
              : "",
            time_disruption: equipoDetenido,
          };

          if (
            this.tarea.tasks_log_task_type_main ===
            Servicio.MANTENIMIENTO_PREVENTIVO
          ) {
            this.tarea = {
              ...this.tarea,
              checklist: JSON.stringify(this.checklist),
            };
          }

          if (equipoDetenido && equipoDetenido === "Sí") {
            this.tarea = {
              ...this.tarea,
              caused_disruption: motivoDetencion
                ? motivoDetencion["nombre"]
                : "",
            };
          }

          // Si no se han realizado modificaciones, se omite el guardar.
          if (
            !this.utilitarioService.checkModificGeneral(
              this.tarea,
              this.tareaClone
            ) &&
            this.servicio !== Servicio.MANTENIMIENTO_PREVENTIVO
          ) {
            console.log("No hay cambios en datos generales");
            return;
          }

          // Mostrar loading...
          this.store.dispatch(actions.isLoading());
          this.store.dispatch(
            actions.actualizarTareaOT({ tareaOT: this.tarea })
          );

          this.store
            .pipe(select("tarea"), take(2), skip(1))
            .subscribe((state) => {
              if (state.updated) {
                this.openSnackBar("Datos guardados.", "OK");
                this.tareaClone = this.tarea;
              } else if (state.error) {
                console.log("Error al actualizar general. ", state);
                Swal.fire(
                  "Error actualizar general",
                  state.error?.error,
                  "error"
                );
              }
              this.store.dispatch(actions.stopLoading());
            });
        }

        break;

      case "fotos":
        if (this.formFotosOT.invalid || this.otFinalizada) {
          //
          console.log("No pasó formulario.");
          return;
        }

        if (this.crear || this.editar) {
          // Se suben las  fotos al Storage y se espera una URL
          const { foto1, foto2, foto3, foto4, foto5 } = this.formFotosOT.value;
          const path = this.generarPathDeFotos();
          const metadata = { resizedImage: true };
          const orientation = -1;

          // Si la foto es un objeto File se sube el archivo.
          if (foto1 !== undefined && foto1 instanceof FileInput) {
            this.uploadFoto1 = 0;
            const file: File = foto1.files[0];
            const imageName: string = this.utilitarioService.addTimeToImageName(
              file.name
            );
            var reader = new FileReader();
            reader.onload = (event: any) => {
              const localUrl = event.target.result;
              this.imageCompress
                .compressFile(localUrl, orientation, 50, 60, 640, 640)
                .then((result) => {
                  const imageBlob = this.fileUploadServive.dataURItoBlob(
                    result.split(",")[1]
                  );
                  const uploadTask = this.fileUploadServive.pushBlobToStorage(
                    path,
                    imageBlob,
                    imageName,
                    metadata
                  );
                  uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                      // Progreso de subida
                      this.uploadFoto1 =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    },
                    (error) => {
                      this.openSnackBar(error.message, "OK");
                      this.uploadFoto1 = -1;
                    },
                    () => {
                      // Success
                      getDownloadURL(uploadTask.snapshot.ref).then(
                        (downloadURL) => {
                          this.urlFoto1 = downloadURL;
                          this.tarea = { ...this.tarea, foto1: this.urlFoto1 };
                          this.fotosEnTarea = true;
                          this.formFotosOT.get("foto1").setValue(this.urlFoto1); // Para activar el subscriber.
                          this.uploadFoto1 = -1;
                          if (!this.fotosPorSubir) {
                            // Si no hay fotos por subir, cancelamos el loading.
                            this.store.dispatch(actions.stopLoading());
                            this.store.dispatch(
                              actions.actualizarTareaOT({ tareaOT: this.tarea })
                            );
                          }
                        }
                      );
                    }
                  );
                });
            };
            reader.readAsDataURL(file);
          } else {
            this.uploadFoto1 = -1;
          }

          if (foto2 !== undefined && foto2 instanceof FileInput) {
            this.uploadFoto2 = 0;
            const file: File = foto2.files[0];
            const imageName: string = this.utilitarioService.addTimeToImageName(
              file.name
            );
            var reader = new FileReader();
            reader.onload = (event: any) => {
              const localUrl = event.target.result;
              this.imageCompress
                .compressFile(localUrl, orientation, 50, 60, 640, 640)
                .then((result) => {
                  const imageBlob = this.fileUploadServive.dataURItoBlob(
                    result.split(",")[1]
                  );
                  const uploadTask = this.fileUploadServive.pushBlobToStorage(
                    path,
                    imageBlob,
                    imageName,
                    metadata
                  );
                  uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                      // Progreso de subida
                      this.uploadFoto2 =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    },
                    (error) => {
                      this.openSnackBar(error.message, "OK");
                      this.uploadFoto2 = -1;
                    },
                    () => {
                      // Success
                      getDownloadURL(uploadTask.snapshot.ref).then(
                        (downloadURL) => {
                          this.urlFoto2 = downloadURL;
                          this.tarea = { ...this.tarea, foto2: this.urlFoto2 };
                          this.fotosEnTarea = true;
                          this.formFotosOT.get("foto2").setValue(this.urlFoto2); // Para activar el subscriber.
                          this.uploadFoto2 = -1;
                          if (!this.fotosPorSubir) {
                            // Si no hay fotos por subir, cancelamos el loading.
                            this.store.dispatch(actions.stopLoading());
                            this.store.dispatch(
                              actions.actualizarTareaOT({ tareaOT: this.tarea })
                            );
                          }
                        }
                      );
                    }
                  );
                });
            };
            reader.readAsDataURL(file);
          } else {
            this.uploadFoto2 = -1;
          }

          if (foto3 !== undefined && foto3 instanceof FileInput) {
            this.uploadFoto3 = 0;
            const file: File = foto3.files[0];
            const imageName: string = this.utilitarioService.addTimeToImageName(
              file.name
            );
            var reader = new FileReader();
            reader.onload = (event: any) => {
              const localUrl = event.target.result;
              this.imageCompress
                .compressFile(localUrl, orientation, 50, 60, 640, 640)
                .then((result) => {
                  const imageBlob = this.fileUploadServive.dataURItoBlob(
                    result.split(",")[1]
                  );
                  const uploadTask = this.fileUploadServive.pushBlobToStorage(
                    path,
                    imageBlob,
                    imageName,
                    metadata
                  );
                  uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                      // Progreso de subida
                      this.uploadFoto3 =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    },
                    (error) => {
                      this.openSnackBar(error.message, "OK");
                      this.uploadFoto3 = -1;
                    },
                    () => {
                      // Success
                      getDownloadURL(uploadTask.snapshot.ref).then(
                        (downloadURL) => {
                          this.urlFoto3 = downloadURL;
                          this.tarea = { ...this.tarea, foto3: this.urlFoto3 };
                          this.fotosEnTarea = true;
                          this.formFotosOT.get("foto3").setValue(this.urlFoto3); // Para activar el subscriber.
                          this.uploadFoto3 = -1;
                          if (!this.fotosPorSubir) {
                            // Si no hay fotos por subir, cancelamos el loading.
                            this.store.dispatch(actions.stopLoading());
                            this.store.dispatch(
                              actions.actualizarTareaOT({ tareaOT: this.tarea })
                            );
                          }
                        }
                      );
                    }
                  );
                });
            };
            reader.readAsDataURL(file);
          } else {
            this.uploadFoto3 = -1;
          }

          if (foto4 !== undefined && foto4 instanceof FileInput) {
            this.uploadFoto4 = 0;
            const file: File = foto4.files[0];
            const imageName: string = this.utilitarioService.addTimeToImageName(
              file.name
            );
            var reader = new FileReader();
            reader.onload = (event: any) => {
              const localUrl = event.target.result;
              this.imageCompress
                .compressFile(localUrl, orientation, 50, 60, 640, 640)
                .then((result) => {
                  const imageBlob = this.fileUploadServive.dataURItoBlob(
                    result.split(",")[1]
                  );
                  const uploadTask = this.fileUploadServive.pushBlobToStorage(
                    path,
                    imageBlob,
                    imageName,
                    metadata
                  );
                  uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                      // Progreso de subida
                      this.uploadFoto4 =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    },
                    (error) => {
                      this.openSnackBar(error.message, "OK");
                      this.uploadFoto4 = -1;
                    },
                    () => {
                      // Success
                      getDownloadURL(uploadTask.snapshot.ref).then(
                        (downloadURL) => {
                          this.urlFoto4 = downloadURL;
                          this.tarea = { ...this.tarea, foto4: this.urlFoto4 };
                          this.fotosEnTarea = true;
                          this.formFotosOT.get("foto4").setValue(this.urlFoto4); // Para activar el subscriber.
                          this.uploadFoto4 = -1;
                          if (!this.fotosPorSubir) {
                            // Si no hay fotos por subir, cancelamos el loading.
                            this.store.dispatch(actions.stopLoading());
                            this.store.dispatch(
                              actions.actualizarTareaOT({ tareaOT: this.tarea })
                            );
                          }
                        }
                      );
                    }
                  );
                });
            };
            reader.readAsDataURL(file);
          } else {
            this.uploadFoto4 = -1;
          }

          if (foto5 !== undefined && foto5 instanceof FileInput) {
            this.uploadFoto5 = 0;
            const file: File = foto5.files[0];
            const imageName: string = this.utilitarioService.addTimeToImageName(
              file.name
            );
            var reader = new FileReader();
            reader.onload = (event: any) => {
              const localUrl = event.target.result;
              this.imageCompress
                .compressFile(localUrl, orientation, 50, 60, 640, 640)
                .then((result) => {
                  const imageBlob = this.fileUploadServive.dataURItoBlob(
                    result.split(",")[1]
                  );
                  const uploadTask = this.fileUploadServive.pushBlobToStorage(
                    path,
                    imageBlob,
                    imageName,
                    metadata
                  );
                  uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                      // Progreso de subida
                      this.uploadFoto5 =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    },
                    (error) => {
                      this.openSnackBar(error.message, "OK");
                      this.uploadFoto5 = -1;
                    },
                    () => {
                      // Success
                      getDownloadURL(uploadTask.snapshot.ref).then(
                        (downloadURL) => {
                          this.urlFoto5 = downloadURL;
                          this.tarea = { ...this.tarea, foto5: this.urlFoto5 };
                          this.fotosEnTarea = true;
                          this.formFotosOT.get("foto5").setValue(this.urlFoto5); // Para activar el subscriber.
                          this.uploadFoto5 = -1;
                          if (!this.fotosPorSubir) {
                            // Si no hay fotos por subir, cancelamos el loading.
                            this.store.dispatch(actions.stopLoading());
                            this.store.dispatch(
                              actions.actualizarTareaOT({ tareaOT: this.tarea })
                            );
                          }
                        }
                      );
                    }
                  );
                });
            };
            reader.readAsDataURL(file);
          } else {
            this.uploadFoto5 = -1;
          }

          if (
            this.uploadFoto1 === -1 &&
            this.uploadFoto2 === -1 &&
            this.uploadFoto3 === -1 &&
            this.uploadFoto4 === -1 &&
            this.uploadFoto5 === -1
          ) {
            console.log("Sin fotos pendientes de guardar.");
          }

          if (!this.fotosPorSubir) {
            this.store
              .pipe(select("tarea"), take(2), skip(1))
              .subscribe((state) => {
                if (state.updated) {
                  this.openSnackBar("Fotos registradas", "OK");
                } else if (state.error) {
                  console.error("Error después de subir fotos.", state);
                  Swal.fire("Error en fotos", state.error?.error, "error");
                }
              });
          }
        }

        break;

      case "firmas":
        console.log("formFirmasOT.invalid  ", this.formFirmasOT.invalid);
        console.log("otFinalizada", this.otFinalizada);
        console.log(
          " this.editar",
          this.editar,
          "this.crear",
          this.crear,
          "this.esChild",
          this.esChild
        );
        if (this.formFirmasOT.invalid || this.otFinalizada) {
          return;
        }

        if (this.crear || this.editar) {
          const {
            observaciones,
            aceptado_por_nombre,
            aceptado_por_rut,
            aceptado_por_cargo,
            aceptado_por_firma,
          } = this.formFirmasOT.getRawValue();

          this.store
            .pipe(select("tareas"), take(3))
            .subscribe(async (state) => {
              console.log("state ot", state);
              if (state.loaded) {
                const idParent = this.tareaParentId
                  ? this.tareaParentId
                  : this.tareaId;
                this.tareasChilds = state.tareas.filter(
                  (f) => f.id_parent_wo === this.tareaParentId
                );
                this.tareaParent = state.tareas.find((t) => t.id === idParent);

                let tareas: TareaOT[] = [];

                this.tarea = {
                  ...this.tarea,
                  observaciones: observaciones,
                  details_signature: aceptado_por_nombre,
                  aceptado_por_cargo: aceptado_por_cargo,
                  aceptado_por_rut: aceptado_por_rut,
                  signature: aceptado_por_firma,
                };

                this.tareaParent = {
                  ...this.tareaParent,
                  observaciones: observaciones,
                  details_signature: aceptado_por_nombre,
                  aceptado_por_cargo: aceptado_por_cargo,
                  aceptado_por_rut: aceptado_por_rut,
                  signature: aceptado_por_firma,
                };
                tareas.push(this.tareaParent);

                this.tareasChilds?.map((task) => {
                  task = {
                    ...task,
                    observaciones: observaciones,
                    details_signature: aceptado_por_nombre,
                    aceptado_por_cargo: aceptado_por_cargo,
                    aceptado_por_rut: aceptado_por_rut,
                    signature: aceptado_por_firma,
                  };
                  tareas.push(task);
                });

                console.log("Prepando guardar tareas", tareas);
                await this.tareasService
                  .updateTareas(tareas)
                  .then((_) => {
                    this.openSnackBar("Datos guardados", "OK");
                    // this.refresh();
                  })
                  .catch((err) => {
                    Swal.fire("Error en firmas", err, "error");
                  });
              }
            });
        } // end crear or editar

        break;

      case "finalizar":
        if (this.formTimerEndOT.invalid) {
          return;
        }

        break;

      default:
        this.openSnackBar("sin form especificado en switch.", "OK");
    }
  }

  public scrollToTop(id: string) {
    this.pss.forEach((ps) => {
      if (ps.elementRef.nativeElement.id == id) {
        ps.scrollToTop(0, 250);
      }
    });
  }

  public verificaFormularios(): boolean {
    if (
      this.formTareaOT.invalid ||
      this.formTimerOT.invalid ||
      this.formChechListGeneral.invalid ||
      this.formFotosOT.invalid ||
      this.formFirmasOT.invalid
    ) {
      return false;
    }

    this.camposFaltantes = ""; // Reset

    // Chequeo de otras hojas
    if (this.tarea.id_status_work_order !== 3) {
      if (this.tarea?.id_parent_wo !== null) {
        // Fusion
        const campo = this.queCamposFaltan(this.tareaParent);
        if (campo?.length > 0) {
          this.camposFaltantes = "OT ".concat(
            this.tareaParent.wo_folio,
            " falta: ",
            campo,
            "\n"
          );
        }
        this.tareasChilds?.forEach((tarea) => {
          let campos = this.queCamposFaltan(tarea);
          if (campos?.length > 0) {
            this.camposFaltantes = "OT ".concat(
              tarea.wo_folio,
              " falta: ",
              campos,
              "\n"
            );
          }
        });
      } else {
        const campo = this.queCamposFaltan(this.tarea);
        if (campo?.length > 0) {
          this.camposFaltantes = "OT ".concat(
            this.tarea.wo_folio,
            " falta: ",
            campo,
            "\n"
          );
        }
      }

      return this.camposFaltantes?.length === 0;
    }

    return true;
  }

  public queCamposFaltan(tarea: TareaOT) {
    const esMP = tarea.tasks_log_task_type_main
      ? tarea.tasks_log_task_type_main === Servicio.MANTENIMIENTO_PREVENTIVO
      : false;
    let queCampos: string = "";
    if (tarea.wo_folio === undefined || tarea.wo_folio?.length === 0)
      queCampos += ", ".concat("folio");
    if (tarea.creation_date === undefined || tarea.creation_date?.length === 0)
      queCampos += ", ".concat("fecha creación");
    if (
      (tarea.items_log_description === undefined ||
        tarea.items_log_description?.length === 0) &&
      !esMP
    )
      queCampos += ", ".concat("equipo");
    if (
      tarea.tasks_log_task_type_main === undefined ||
      tarea.tasks_log_task_type_main?.length === 0
    )
      queCampos += ", ".concat("servicio");
    if (
      tarea.priorities_description === undefined ||
      tarea.priorities_description?.length === 0
    )
      queCampos += ", ".concat("prioridad");
    if (tarea.requested_by === undefined || tarea.requested_by?.length === 0)
      queCampos += ", ".concat("autor");
    if (tarea.description === undefined || tarea.description?.length === 0)
      queCampos += ", ".concat("antecedentes del llamado");
    if (
      tarea.cal_date_maintenance === undefined ||
      tarea.cal_date_maintenance?.length === 0
    )
      queCampos += ", ".concat("fecha solicitud del servicio");
    if (tarea.cliente === undefined || tarea.cliente?.length === 0)
      queCampos += ", ".concat("cliente");
    if (tarea.local === undefined || tarea.local?.length === 0)
      queCampos += ", ".concat("local");
    // if(tarea.latitud === undefined || tarea.latitud?.length === 0) queCampos +=', '.concat('latitud');
    // if(tarea.longitud === undefined || tarea.longitud?.length === 0) queCampos +=', '.concat('longitud');
    // if(tarea.direccion === undefined || tarea.direccion?.length === 0) queCampos +=', '.concat('dirección');
    if (
      (tarea.description_general === undefined ||
        tarea.description_general?.length === 0) &&
      !esMP
    )
      queCampos += ", ".concat("descripción gral. del trabajo");
    if (
      (tarea.materiales === undefined || tarea.materiales?.length === 0) &&
      !esMP
    )
      queCampos += ", ".concat("materiales");
    if (
      tarea.observaciones === undefined ||
      (tarea.observaciones?.length === 0 && !esMP)
    )
      queCampos += ", ".concat("observaciones");
    if (
      tarea.aceptado_por_rut === undefined ||
      tarea.aceptado_por_rut?.length === 0
    )
      queCampos += ", ".concat("rut aprobador");
    if (
      tarea.aceptado_por_cargo === undefined ||
      tarea.aceptado_por_cargo?.length === 0
    )
      queCampos += ", ".concat("aceptado_por_cargo?");
    if (tarea.id_assigned_user === undefined || tarea.id_assigned_user === 0)
      queCampos += ", ".concat("id técnico responsable");
    if (tarea.initial_date === undefined || tarea.initial_date?.length === 0)
      queCampos += ", ".concat("hora de inicio");
    if (tarea.signature === undefined || tarea.signature?.length === 0)
      queCampos += ", ".concat("firma cliente");
    if (
      tarea.personnel_description === undefined ||
      tarea.personnel_description?.length === 0
    )
      queCampos += ", ".concat("personnel_description");
    if (
      tarea.details_signature === undefined ||
      tarea.details_signature?.length === 0
    )
      queCampos += ", ".concat("nombre firmador");
    if (
      (tarea.types_description === undefined ||
        tarea.types_description?.length === 0) &&
      !esMP
    )
      queCampos += ", ".concat("tipo de falla");
    if (
      (tarea.causes_description === undefined ||
        tarea.causes_description?.length === 0) &&
      !esMP
    )
      queCampos += ", ".concat("causa de falla");
    if (
      (tarea.detection_method_description === undefined ||
        tarea.detection_method_description?.length === 0) &&
      !esMP
    )
      queCampos += ", ".concat("método de detección");
    if (
      (tarea.time_disruption === undefined ||
        tarea.time_disruption?.length === 0) &&
      !esMP
    )
      queCampos += ", ".concat("equipo detenido");
    if (tarea.time_disruption === "Sí") {
      if (
        (tarea.caused_disruption === undefined ||
          tarea.caused_disruption?.length === 0) &&
        !esMP
      )
        queCampos += ", ".concat("motivo detección");
    }
    if ((tarea.foto1 === undefined || tarea.foto1?.length === 0) && !esMP)
      queCampos += ", ".concat("foto1");
    // if(tarea.id_parent_wo   === undefined) queCampos +=', '.concat('vínculo OT principal');
    // if(tarea.id_status_work_order === 8){
    //   if(tarea.final_date === undefined || tarea.final_date?.length === 0) queCampos +=', '.concat('hora final');
    //   if(tarea.real_duration === undefined || tarea.real_duration?.length === 0) queCampos +=', '.concat('duración OT');
    // }

    return queCampos?.substring(1, queCampos.length);
  }

  async modalFaltanCampos(proceso?: string) {
    console.log(
      "modalFaltanCampos esMantencionPreventiva?",
      this.esMantencionPreventiva
    );
    let campos: String[] = [];
    if (this.esMantencionPreventiva) {
      console.log("this.checklist", this.checklist);
      this.checklist?.forEach((item) => {
        item.checklist?.forEach((check) => {
          if (!check.checklist || check.checklist === "") {
            const text = item.tipo + ", N° " + check.numero?.toString();
            campos.push(text);
          }
        });
        if (item.fotos.filter((f) => f.url === "")?.length === 4) {
          const text = item.tipo + ", foto";
          campos.push(text);
        }
        if (!item.observaciones || item.observaciones?.trim().length === 0) {
          const text = item.tipo + ", observaciones";
          campos.push(text);
        }
      });
    } else {
      if (
        !this.tarea?.items_log_description ||
        this.tarea?.items_log_description?.trim() === ""
      ) {
        campos.push("Equipo");
      }
      if (
        !this.tarea?.tasks_log_task_type_main ||
        this.tarea?.tasks_log_task_type_main?.trim() === ""
      ) {
        campos.push("Tipo de servicio");
      }
      if (
        !this.tarea?.description_general ||
        this.tarea?.description_general?.trim() === ""
      ) {
        campos.push("Descripción general del trabajo");
      }
      if (!this.tarea?.materiales || this.tarea?.materiales?.trim() === "") {
        campos.push("Materiales");
      }
      if (
        !this.tarea?.types_description ||
        this.tarea?.types_description?.trim() === ""
      ) {
        campos.push("Tipo falla");
      }
      if (
        !this.tarea?.causes_description ||
        this.tarea?.causes_description?.trim() === ""
      ) {
        campos.push("Causa falla");
      }
      if (
        !this.tarea?.detection_method_description ||
        this.tarea?.detection_method_description?.trim() === ""
      ) {
        campos.push("Método detección");
      }
      if (!this.tarea?.foto1 || this.tarea?.foto1?.trim() === "") {
        campos.push("Al menos una foto.");
      }
      if (
        this.tarea?.time_disruption === "Sí" &&
        (!this.tarea?.caused_disruption || this.tarea?.caused_disruption === "")
      ) {
        campos.push("Motivo detención");
      }
    }

    console.log("campos", campos);

    if (campos?.length === 0) {
      if (proceso && proceso === "parar") {
        this.pararOT();
      } else {
        this.openDialog();
      }
    } else {
      this.openModalMessage(campos);
    }
  }

  async openModalMessage(msg: String[]) {
    this.dialog.open(DetalleOtDialogMsg, {
      data: {
        titulo: "Campos que faltan",
        vector: msg,
      },
    });
  }

  // Buenas prácticas para enviar varios operadores ternarios.
  getFechaOT(): string {
    if (this.crear) {
      return new Date().toISOString();
    }
    const { fecha } = this.formFirmasOT.getRawValue();
    return this.tarea.creation_date ? this.tarea.creation_date : fecha;
  }

  getPersonalTecnico(): string {
    const { tecnico } = this.formTareaOT.getRawValue();
    if (tecnico && tecnico.name) {
      return tecnico.name;
    }

    if (this.tarea && this.tarea.personnel_description) {
      return this.tarea.personnel_description;
    }

    return "";
  }

  generarPathDeFotos(): string {
    let MyDate = new Date();
    const MyDateString =
      "fotos/" +
      MyDate.getFullYear() +
      "/" +
      ("0" + (MyDate.getMonth() + 1)).slice(-2) +
      "/" +
      ("0" + MyDate.getDate()).slice(-2);

    return MyDateString.toString();
  }

  eliminarFoto(numero: number) {
    const foto = `foto${numero}`;
    let urlFoto: string = "";
    switch (numero) {
      case 1:
        urlFoto = this.tarea.foto1;
        break;
      case 2:
        urlFoto = this.tarea.foto2;
        break;
      case 3:
        urlFoto = this.tarea.foto3;
        break;
      case 4:
        urlFoto = this.tarea.foto4;
        break;
      case 5:
        urlFoto = this.tarea.foto5;
        break;
      default: // OK
    }

    this.fileUploadServive
      .deleteFileByURL(urlFoto)
      .then(() => {
        console.log(`Archivo de ${foto} borrado.`);
        this.setearFotoNull(numero);
        this.tareasService.updateTareas([this.tarea]);
        // this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
      })
      .catch((error) => {
        console.error(error);
        switch (error.code) {
          case "storage/object-not-found":
            // El objeto no existe, se debe limpiar del formulario
            this.openSnackBar(
              `No existe ningún objeto en ${foto}, se quitará para limpiar.`,
              "Ok"
            );
            this.setearFotoNull(numero);
            // this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
            this.tareasService.updateTareas([this.tarea]);
            break;
          case "storage/unauthorized":
            this.openSnackBar(
              "No tiene permisos para obtener la " + foto,
              "Ok"
            );
            break;
          case "storage/unknown":
            this.openSnackBar(
              "Error desconocido, informe al administrador",
              "Ok"
            );
            break;
          case "storage/quota-exceeded":
            this.openSnackBar(
              "Quota de acceso excedida, informe al administrador",
              "Ok"
            );
            break;
          default: //OK
        }
      });
  }

  eliminarFotoDeCheckList(foto: Foto) {
    //TODO:  Falta quitar la url del objeto checklist.
    this.fileUploadServive
      .deleteFileByURL(foto.url)
      .then(() => {
        foto.url = "";
        this.checklist.map((check) => {
          check.fotos.map((f) => {
            if (f.url === foto.url) {
              f.url = "";
            }
          });
        });
        this.tarea = {
          ...this.tarea,
          checklist: JSON.stringify(this.checklist),
        };
        this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
      })
      .catch((error) => {
        switch (error.code) {
          case "storage/object-not-found":
            this.openSnackBar(
              `No existe ningún objeto en ${foto.url}, se quitará para limpiar.`,
              "Ok"
            );
            foto.url = "";
            this.tarea = {
              ...this.tarea,
              checklist: JSON.stringify(this.checklist),
            };
            this.store.dispatch(
              actions.actualizarTareaOT({ tareaOT: this.tarea })
            );
            break;
          case "storage/unauthorized":
            this.openSnackBar(
              "No tiene permisos para obtener la " + foto,
              "Ok"
            );
            break;
          case "storage/unknown":
            this.openSnackBar(
              "Error desconocido, informe al administrador",
              "Ok"
            );
            break;
          case "storage/quota-exceeded":
            this.openSnackBar(
              "Quota de acceso excedida, informe al administrador",
              "Ok"
            );
            break;
          default: //OK
        }
      });
  }

  // Para cuando la imagen se redimenciona, se agrega este método como parche.
  repararLink(numero: number) {
    const foto = `foto${numero}`;
    let urlFoto: string = "";
    switch (numero) {
      case 1:
        urlFoto = decodeURIComponent(this.tarea.foto1);
        urlFoto = urlFoto.slice(75, urlFoto.indexOf("?"));
        break;

      case 2:
        urlFoto = decodeURIComponent(this.tarea.foto2);
        urlFoto = urlFoto.slice(75, urlFoto.indexOf("?"));
        break;

      case 3:
        urlFoto = decodeURIComponent(this.tarea.foto3);
        urlFoto = urlFoto.slice(75, urlFoto.indexOf("?"));
        break;

      case 4:
        urlFoto = decodeURIComponent(this.tarea.foto4);
        urlFoto = urlFoto.slice(75, urlFoto.indexOf("?"));
        break;

      case 5:
        urlFoto = decodeURIComponent(this.tarea.foto5);
        urlFoto = urlFoto.slice(75, urlFoto.indexOf("?"));
        break;

      default: // OK
    }
    urlFoto = urlFoto.split("").reverse().join(""); // Reverse
    let extension = urlFoto.slice(0, urlFoto.indexOf("."));
    extension = extension.split("").reverse().join(""); // Extension
    let fileName = urlFoto.slice(urlFoto.indexOf(".") + 1, urlFoto.length);
    // Generación del Path del archivo reducido 1024x1024
    let path = fileName.split("").reverse().join("");
    // Verificando si ya cuenta con el literal _1024x1024
    if (path.indexOf("_1024x1024") == -1) {
      path = fileName
        .split("")
        .reverse()
        .join("")
        .concat("_1024x1024.", extension);
    } else {
      path = fileName.split("").reverse().join("").concat(".", extension);
    }

    console.log("Buscando la referencia en: ", path);
    this.fileUploadServive
      .getURLByReference(path)
      .then((url) => {
        console.log("Nueva URL Generada: ", url);
        // Se actualiza la URL
        this.setearFotoConNuevaURL(numero, url);
        this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
      })
      .catch((error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case "storage/object-not-found":
            // File doesn't exist
            break;
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            break;
          case "storage/canceled":
            // User canceled the upload
            break;

          // ...

          case "storage/unknown":
            // Unknown error occurred, inspect the server response
            break;
        }
      });
  }

  repararLinkFotoCheckList(foto: Foto) {
    let urlFoto = decodeURIComponent(foto.url);
    urlFoto = urlFoto.slice(75, urlFoto.indexOf("?"));
    urlFoto = urlFoto.split("").reverse().join(""); // Reverse
    let extension = urlFoto.slice(0, urlFoto.indexOf("."));
    extension = extension.split("").reverse().join(""); // Extension
    let fileName = urlFoto.slice(urlFoto.indexOf(".") + 1, urlFoto.length);
    // Generación del Path del archivo reducido 1024x1024
    let path = fileName.split("").reverse().join("");
    // Verificando si ya cuenta con el literal _1024x1024
    if (path.indexOf("_1024x1024") == -1) {
      path = fileName
        .split("")
        .reverse()
        .join("")
        .concat("_1024x1024.", extension);
    } else {
      path = fileName.split("").reverse().join("").concat(".", extension);
    }

    console.log("Buscando la referencia en: ", path);
    this.fileUploadServive
      .getURLByReference(path)
      .then((url) => {
        // Se actualiza la URL
        foto.url = url;
        this.tarea = {
          ...this.tarea,
          checklist: JSON.stringify(this.checklist),
        };
        this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
      })
      .catch((error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case "storage/object-not-found":
            // File doesn't exist
            break;
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            break;
          case "storage/canceled":
            // User canceled the upload
            break;
          case "storage/unknown":
            // Unknown error occurred, inspect the server response
            break;
        }
      });
  }

  async comprimirFoto(numero: number) {
    const foto = `foto${numero}`;
    let urlFoto: string = "";
    let fullUrl: string = "";
    switch (numero) {
      case 1:
        fullUrl = decodeURIComponent(this.tarea.foto1);
        urlFoto = fullUrl.slice(75, fullUrl.indexOf("?"));
        fullUrl = this.tarea.foto1;
        break;

      case 2:
        fullUrl = decodeURIComponent(this.tarea.foto2);
        urlFoto = fullUrl.slice(75, fullUrl.indexOf("?"));
        fullUrl = this.tarea.foto2;
        break;

      case 3:
        fullUrl = decodeURIComponent(this.tarea.foto3);
        urlFoto = fullUrl.slice(75, fullUrl.indexOf("?"));
        fullUrl = this.tarea.foto3;
        break;

      case 4:
        fullUrl = decodeURIComponent(this.tarea.foto4);
        urlFoto = fullUrl.slice(75, fullUrl.indexOf("?"));
        fullUrl = this.tarea.foto4;
        break;

      case 5:
        fullUrl = decodeURIComponent(this.tarea.foto5);
        urlFoto = fullUrl.slice(75, fullUrl.indexOf("?"));
        fullUrl = this.tarea.foto5;
        break;

      default: // OK
    }

    console.log("Comprimiendo foto: ", urlFoto);
    const response = await fetch(fullUrl); // here image is url/location of image
    const blob = await response.blob();
    const file = new File([blob], "image.jpg", { type: blob.type });
    const orientation = -1;
    const metadata = { resizedImage: "true" };
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const localUrl = event.target.result;
      this.imageCompress
        .compressFile(localUrl, orientation, 50, 60, 640, 640)
        .then((result) => {
          const imageBlob = this.fileUploadServive.dataURItoBlob(
            result.split(",")[1]
          );
          const uploadTask = this.fileUploadServive.pushBlobToStorageFullPath(
            urlFoto,
            imageBlob,
            metadata
          );
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Progreso de subida
              // this.uploadFoto2 = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            },
            (error) => {
              this.openSnackBar(error.message, "OK");
            },
            () => {
              // Success
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                switch (numero) {
                  case 1:
                    this.tarea = { ...this.tarea, foto1: downloadURL };
                    this.sizeFoto1 = imageBlob.size;
                    break;
                  case 2:
                    this.tarea = { ...this.tarea, foto2: downloadURL };
                    this.sizeFoto2 = imageBlob.size;
                    break;
                  case 3:
                    this.tarea = { ...this.tarea, foto3: downloadURL };
                    this.sizeFoto3 = imageBlob.size;
                    break;
                  case 4:
                    this.tarea = { ...this.tarea, foto4: downloadURL };
                    this.sizeFoto4 = imageBlob.size;
                    break;
                  case 5:
                    this.tarea = { ...this.tarea, foto5: downloadURL };
                    this.sizeFoto5 = imageBlob.size;
                    break;
                }
                this.openSnackBar(foto + " comprimida", "OK");
                this.store.dispatch(
                  actions.actualizarTareaOT({ tareaOT: this.tarea })
                );
              });
            }
          );
        })
        .catch((err) => console.error("no se pudo comprimir", err));
    };
    reader.readAsDataURL(file);
  }

  checkNameFotoNotInclude1024(numero: number) {
    const foto = `foto${numero}`;
    let urlFoto: string = "";
    switch (numero) {
      case 1:
        urlFoto = this.tarea.foto1;
        break;
      case 2:
        urlFoto = this.tarea.foto2;
        break;
      case 3:
        urlFoto = this.tarea.foto3;
        break;
      case 4:
        urlFoto = this.tarea.foto4;
        break;
      case 5:
        urlFoto = this.tarea.foto5;
        break;
      default: // OK
    }

    return urlFoto ? urlFoto.indexOf("1024x1024") === -1 : false;
  }

  setearFotoNull(numero: number) {
    switch (numero) {
      case 1:
        this.tarea = { ...this.tarea, foto1: undefined };
        this.urlFoto1 = undefined;
        break;
      case 2:
        this.tarea = { ...this.tarea, foto2: undefined };
        this.urlFoto2 = undefined;
        break;
      case 3:
        this.tarea = { ...this.tarea, foto3: undefined };
        this.urlFoto3 = undefined;
        break;
      case 4:
        this.tarea = { ...this.tarea, foto4: undefined };
        this.urlFoto4 = undefined;
        break;
      case 5:
        this.tarea = { ...this.tarea, foto5: undefined };
        this.urlFoto5 = undefined;
        break;
      default: // OK
    }
  }

  setearFotoConNuevaURL(numero: number, url: string) {
    switch (numero) {
      case 1:
        this.tarea = { ...this.tarea, foto1: url };
        this.urlFoto1 = url;
        break;
      case 2:
        this.tarea = { ...this.tarea, foto2: url };
        this.urlFoto2 = url;
        break;
      case 3:
        this.tarea = { ...this.tarea, foto3: url };
        this.urlFoto3 = url;
        break;
      case 4:
        this.tarea = { ...this.tarea, foto4: url };
        this.urlFoto4 = url;
        break;
      case 5:
        this.tarea = { ...this.tarea, foto5: url };
        this.urlFoto5 = url;
        break;
      default: // OK
    }
  }

  desactivarSubir() {
    this.desactivarBotonSubir = true;
    return true;
  }

  //Call this method in the image source, it will sanitize it.
  transformBase64() {
    const { aceptado_por_firma } = this.formFirmasOT.getRawValue();
    return this.sanitizer.bypassSecurityTrustResourceUrl(aceptado_por_firma);
  }

  /**
   * Abre un pequeño mensaje emergente
   * @param message Mensaje a mostrar en el diálogo emergente
   * @param action  Nombre de la acción para cerrar diálogo
   */
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2 * 1000,
    });
  }

  /**
   * Abre un cuadro modal para la firma
   */
  openDialog(): void {
    this.dialog
      .open(DetalleOtDialogFirma, {
        width: "300px",
      })
      .afterClosed()
      .pipe(filter((data) => data != null))
      .subscribe(({ data }) => {
        console.log("firma => ", data);
        if (data) {
          this.formFirmasOT.get("aceptado_por_firma").setValue(data);
          this.existeFirmaAprobada = true;
        } else {
          this.existeFirmaAprobada = false;
        }
      });
  }

  openDialogRegistrarOpcion(titulo: string): void {
    this.tituloCombo = titulo;
    let opciones: any = { titulo: this.tituloCombo, opcion: this.opcionCombo };

    switch (titulo) {
      case "local": {
        opciones = { ...opciones, uid: this.cliente, vector: this.locales };
        break;
      }
      case "tipoFalla": {
        opciones = { ...opciones, vector: this.tipoFallas };
        break;
      }
      case "causaFalla": {
        opciones = { ...opciones, vector: this.causaFallas };
        break;
      }
      case "motivo": {
        opciones = { ...opciones, vector: this.motivosDetencion };
        break;
      }
      case "metodoDeteccion": {
        opciones = { ...opciones, vector: this.metodosDeteccion };
        break;
      }
      case "equipo": {
        opciones = {
          ...opciones,
          uid: this.cliente,
          codigoLocal: this.local.codigo,
          vector: this.equipos,
        };
        break;
      }
    }

    const dialogRef = this.dialog.open(DetalleOtDialogRegistrar, {
      width: "300px",
      data: opciones,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("resultado modal: ", result);
      this.opcionCombo = result;
      this.asignarOpcionFormGroup(titulo);
    });
  }

  asignarOpcionFormGroup(titulo: string) {
    if (this.opcionCombo) {
      switch (titulo) {
        case "local":
          const local: Local = JSON.parse(this.opcionCombo);
          this.formTareaOT.get("local").setValue(local);
          this.store.dispatch(actions.cargarLocales({ uid: this.cliente }));
          break;
        case "tipoFalla":
          const tipoFalla: TipoFalla = JSON.parse(this.opcionCombo);
          this.formChechListGeneral.get("tipoFalla").setValue(tipoFalla);
          this.store.dispatch(actions.cargarTipoFalla());
          break;
        case "causaFalla":
          const causaFalla: CausaFalla = JSON.parse(this.opcionCombo);
          this.formChechListGeneral.get("causaFalla").setValue(causaFalla);
          this.store.dispatch(actions.cargarCausaFalla());
          break;
        case "motivo":
          const lista: Lista = JSON.parse(this.opcionCombo);
          this.formChechListGeneral.get("motivoDetencion").setValue(lista);
          this.store.dispatch(actions.cargarMotivoDetencion());
          break;
        case "equipo":
          const equipo: Equipo = JSON.parse(this.opcionCombo);
          this.formTareaOT.get("equipo")?.setValue(equipo);
          this.store.dispatch(
            actions.cargarEquipos({
              uid: this.cliente,
              codigolocal: this.local?.codigo,
            })
          );
          break;
        case "metodoDeteccion":
          const metodo: MetodoDeteccion = JSON.parse(this.opcionCombo);
          this.formChechListGeneral
            .get("metodoDeteccionFalla")
            .setValue(metodo);
          this.store.dispatch(actions.cargarMetodoDeteccion());
          break;
        default:
        // OK
      }
    }
  }

  clickUpload(): void {
    this.clickedSub.next(true);
  }

  existsArchivosPorSubir(): boolean {
    const uploads: boolean =
      this.uploadFoto1 == -1 &&
      this.uploadFoto2 == -1 &&
      this.uploadFoto3 == -1 &&
      this.uploadFoto4 == -1 &&
      this.uploadFoto5 == -1;
    if (!uploads) {
      this.mensajeSubirArchivo = "Espere...";
    } else {
      this.mensajeSubirArchivo = "Subir archivos";
    }
    return uploads;
  }

  existsArchivosPorSubirEnChecklist(): boolean {
    const uploads: boolean = this.uploadFotoChecklist == -1;
    if (!uploads) {
      this.mensajeSubirArchivoChecklist = "Espere...";
    } else {
      this.mensajeSubirArchivoChecklist = "Subir archivos";
    }
    return uploads;
  }

  /**
   * Deshabilita todos los controles de los formularios.
   */
  desactivarTodosLosControles() {
    for (let control in this.formTimerOT.controls) {
      this.formTimerOT.controls[control].disable();
    }
    for (let control in this.formTareaOT.controls) {
      this.formTareaOT.controls[control].disable();
    }
    for (let control in this.formChechListGeneral.controls) {
      this.formChechListGeneral.controls[control].disable();
    }
    for (let control in this.formFirmasOT.controls) {
      this.formFirmasOT.controls[control].disable();
    }

    for (let control in this.formFotosOT.controls) {
      this.formFotosOT.controls[control].disable();
    }
  }

  recargarListado(tipo) {
    switch (tipo) {
      case "equipo": {
        if (this.local && !this.local.codigo) {
          this.store.dispatch(actions.cargarLocales({ uid: this.cliente }));
          this.store
            .select("locales")
            .pipe(take(2), skip(1))
            .subscribe((state) => {
              if (state?.loaded) {
                const buscar = this.local.nombre;
                const ceco = buscar?.substring(
                  buscar.indexOf("CECO:") + 6,
                  buscar.length - 1
                );
                this.locales = state.locales;
                this.local = state.locales.find((l) => l.ceco === ceco);
              }
            });
        }
        this.store.dispatch(
          actions.cargarEquipos({
            uid: this.cliente,
            codigolocal: this.local.codigo,
          })
        );
        this.store
          .select("equipos")
          .pipe(take(2), skip(1))
          .subscribe((state) => {
            if (state?.loaded) {
              this.equipos = state.equipos
                .filter((equipo) => equipo.codigolocal === this.local.codigo)
                .map((equipo) => ({
                  ...equipo,
                  nombre: `${equipo.nombre} ${
                    equipo.otro ? "- " + equipo.otro : ""
                  } { ${equipo.codigo} }`,
                }));
            }
          });
        break;
      }
    }
  }

  subirYGuardarCambios() {
    this.onSubmit("general");
    // scroll to selected step
    const stepId = this.stepper._getStepLabelId(this.stepper.selectedIndex);
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
      setTimeout(() => {
        stepElement.scrollIntoView({
          block: "start",
          inline: "nearest",
          behavior: "smooth",
        });
      }, 250);
    }
  }
}

// -----------------------------------------------------------------------

@Component({
  selector: "detalle-ot-dialog-firma",
  templateUrl: "detalle-ot-dialog-firma.html",
})
export class DetalleOtDialogFirma {
  @ViewChild("signature")
  public signaturePad: SignaturePadComponent;
  public firmaBase64: string;
  constructor(
    public dialogRef: MatDialogRef<DetalleOtDialogFirma>,
    public utilitarioService: UtilitarioService
  ) {}

  // Configuración de firma canvas:
  public signaturePadOptions: NgSignaturePadOptions = {
    // passed through to szimek/signature_pad constructor
    minWidth: 0.5,
    canvasWidth: 300,
    canvasHeight: 150,
    backgroundColor: "#fff",
    dotSize: 0.5,
  };

  ngAfterViewInit(): void {
    this.signaturePad.set("minWidth", 0.5); // set szimek/signature_pad options at runtime
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  }

  /**
   * Notifica que la firma inició
   * @param event
   */
  drawStart(event: MouseEvent | Touch) {
    // will be notified of szimek/signature_pad's onBegin event
    console.log("Start drawing", event);
  }

  downloadSignature(dataURL: any, nombreArchivo: string) {
    if (
      navigator.userAgent.indexOf("Safari") > -1 &&
      navigator.userAgent.indexOf("Chrome") === -1
    ) {
      window.open(dataURL);
    } else {
      const blob = this.URLtoBlob(dataURL);
    }
  }

  /** Convierte el dato URL del canvas, en un texto de base64 */
  URLtoBlob(dataURL: any) {
    const partes = dataURL.split(";base64");
    const contentType = partes[0].split(":")[1];
    const raw = window.atob(partes[1]);
    const rawL = raw.length;
    const array = new Uint8Array(rawL);
    for (let i = 0; i < rawL; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return new Blob([array], { type: contentType });
  }

  save() {
    if (
      this.utilitarioService.checkSignatureWhite(this.signaturePad.toDataURL())
    ) {
      this.dialogRef.close({ data: this.signaturePad.toDataURL() });
    } else {
      Swal.fire(
        "Firma vacía",
        "No se detectó firma en el cuadro, limpie y firme de nuevo.",
        "error"
      );
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}

export interface DialogData {
  titulo: string;
  opcion: string;
  codigoLocal?: string;
  uid?: string; // Id de Cliente en caso de Equipo o Local
  vector: any[];
}

@Component({
  selector: "detalle-ot-dialog-registrar",
  templateUrl: "detalle-ot-dialog-registrar.html",
  styles: [".mat-form-field { display: inline !important; }"],
})
export class DetalleOtDialogRegistrar {
  public opcion: Lista;
  public equipo: Equipo;
  public local: Local;
  public tipoFalla: TipoFalla;
  public causaFalla: CausaFalla;
  public metodoDeteccion: MetodoDeteccion;
  public titulo: string;

  constructor(
    public dialogRef: MatDialogRef<DetalleOtDialogRegistrar>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private store: Store<AppState>
  ) {
    switch (this.data.titulo) {
      case "local":
        this.local = new Local(
          "",
          "",
          "Santiago",
          "",
          "",
          "0",
          "0",
          "",
          "",
          "",
          false
        );
        this.titulo = "Local";
        break;
      case "tipoFalla":
        const nuevaTipoFalla: TipoFalla = {
          id: Date.parse(new Date().toString()) - 1600000000000,
          id_company: 2346,
          description: "",
          enabled: true,
        };
        this.tipoFalla = nuevaTipoFalla;
        this.titulo = "Tipo de Falla";
        break;
      case "causaFalla":
        const nuevaCausaFalla: CausaFalla = {
          id: Date.parse(new Date().toString()) - 1600000000000,
          id_company: 2346,
          description: "",
          enabled: true,
        };
        this.causaFalla = nuevaCausaFalla;
        this.titulo = "Causa de Falla";
        break;
      case "equipo":
        this.equipo = new Equipo("", "", "", this.data?.codigoLocal);
        this.titulo = "Equipo";
        break;
      case "motivo":
        const nuevoMotivo: Lista = {
          nombre: this.data.opcion?.trim(),
        };
        this.opcion = nuevoMotivo;
        this.titulo = "Motivo Detención";
        break;
      case "metodoDeteccion":
        const nuevoMetodo: MetodoDeteccion = {
          id: Date.parse(new Date().toString()) - 1600000000000,
          id_company: 2346,
          description: "",
          enabled: true,
        };
        this.metodoDeteccion = nuevoMetodo;
        this.titulo = "Método Detección";
        break;
      default:
        this.titulo = "Titulo";
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onClick(): void {
    switch (this.data.titulo) {
      case "local": {
        this.local.codigo = this.local.codigo?.trim();
        this.local.nombre = this.local.nombre?.trim();
        this.local.ciudad = this.local.ciudad?.trim();
        this.store.dispatch(
          actions.insertarLocal({ uid: this.data.uid, local: this.local })
        );
        this.data.opcion = JSON.stringify(this.local);
        break;
      }
      case "tipoFalla": {
        this.tipoFalla.description = this.tipoFalla.description.trim();
        this.store.dispatch(
          actions.insertarTipoFalla({ tipoFalla: this.tipoFalla })
        );
        this.data.opcion = JSON.stringify(this.tipoFalla);
        break;
      }
      case "causaFalla": {
        this.causaFalla.description = this.causaFalla.description.trim();
        this.store.dispatch(
          actions.insertarCausaFalla({ causaFalla: this.causaFalla })
        );
        this.data.opcion = JSON.stringify(this.causaFalla);
        break;
      }
      case "motivo": {
        this.opcion.nombre = this.opcion.nombre.trim();
        this.store.dispatch(
          actions.insertarMotivoDetencion({ motivoDetencion: this.opcion })
        );
        this.data.opcion = JSON.stringify(this.opcion);
        break;
      }
      case "metodoDeteccion": {
        this.metodoDeteccion.description =
          this.metodoDeteccion.description.trim();
        this.store.dispatch(
          actions.insertarMetodoDeteccion({
            metodoDeteccion: this.metodoDeteccion,
          })
        );
        this.data.opcion = JSON.stringify(this.metodoDeteccion);
        break;
      }
      case "equipo": {
        this.equipo.codigo = this.equipo.codigo?.trim();
        this.equipo.nombre = this.equipo.nombre?.trim();
        this.equipo.tipo = this.equipo.tipo?.toUpperCase()?.trim();
        this.store.dispatch(
          actions.insertarEquipo({ uid: this.data.uid, equipo: this.equipo })
        );
        this.data.opcion = JSON.stringify(this.equipo);
        break;
      }
      default:
      //OK
    }

    this.dialogRef.close(this.data.opcion);
  }

  verificarExistencia(): boolean {
    let existe: boolean = false;
    switch (this.data.titulo) {
      case "local": {
        const buscarCodigo = this.local.codigo?.toLocaleLowerCase().trim();
        const buscarNombre = this.local.nombre?.toLocaleLowerCase().trim();
        existe =
          this.data.vector.filter(
            (local) =>
              local.codigo?.toLocaleLowerCase().trim() === buscarCodigo &&
              local.nombre?.toLocaleLowerCase().trim() === buscarNombre
          )?.length > 0;
        break;
      }
      case "tipoFalla": {
        const buscar = this.tipoFalla.description?.toLocaleLowerCase().trim();
        existe =
          this.data.vector.filter(
            (falla) => falla.description?.toLocaleLowerCase().trim() === buscar
          )?.length > 0;
        break;
      }
      case "causaFalla": {
        const buscar = this.causaFalla.description?.toLocaleLowerCase().trim();
        existe =
          this.data.vector.filter(
            (causa) => causa.description?.toLocaleLowerCase().trim() === buscar
          )?.length > 0;
        break;
      }
      case "motivo": {
        const buscar = this.opcion?.nombre?.toLocaleLowerCase().trim();
        existe =
          this.data.vector.filter(
            (motivo) => motivo.nombre?.toLocaleLowerCase().trim() === buscar
          )?.length > 0;
        break;
      }
      case "metodoDeteccion": {
        const buscar = this.metodoDeteccion?.description
          ?.toLocaleLowerCase()
          .trim();
        existe =
          this.data.vector.filter(
            (metodo) =>
              metodo.description?.toLocaleLowerCase().trim() === buscar
          )?.length > 0;
        break;
      }
      case "equipo": {
        const buscarCodigo = this.equipo.codigo?.toLocaleLowerCase().trim();
        const buscarNombre = this.equipo.nombre?.toLocaleLowerCase().trim();
        existe =
          this.data.vector.filter(
            (equipo) =>
              equipo.codigo?.toLocaleLowerCase().trim() === buscarCodigo &&
              equipo.nombre?.toLocaleLowerCase().trim() === buscarNombre
          )?.length > 0;
        break;
      }
      default:
      //OK
    }
    return existe;
  }
}

@Component({
  selector: "detalle-ot-dialog-msg",
  templateUrl: "detalle-ot-dialog-msg.html",
})
export class DetalleOtDialogMsg {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
