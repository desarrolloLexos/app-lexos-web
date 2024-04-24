import * as actions from "app/store/actions";

import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, Inject, NgZone, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { filter, map, take, skip } from "rxjs/operators";
import { Observable, Subject, takeUntil } from 'rxjs';
import { Local } from "app/models/local.model";
import { Cliente } from "app/models/cliente.model";
import { Equipo } from "app/models/equipo.model";
import { select, Store } from "@ngrx/store";
import { AppState } from "app/store/app.reducers";
import { NgxMatCombobox, NgxMatComboboxFilterOptionsFn } from "ngx-mat-combobox";
import { AuthService } from "app/services/auth.service";
import { Usuario } from "app/models/usuario.model";
import { TareaOT, Servicio } from '../../../models/tarea-ot.model';
import { Folio } from "app/models/folio.model";

import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { CausaFalla } from '../../../models/causa-falla.model';
import { MetodoDeteccion } from '../../../models/metodo-deteccion.model';
import { TipoFalla } from '../../../models/tipo-falla.model';
import { NgSignaturePadOptions, SignaturePadComponent } from "@almothafar/angular-signature-pad";
import { DomSanitizer } from "@angular/platform-browser";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Lista } from "app/models/lista.model";
import { FileUploadService } from "app/services/file-upload.service";

import { getDownloadURL } from "@angular/fire/storage";

import { FileInput } from "ngx-material-file-input";
import { MapsAPILoader } from '@agm/core';
import * as moment from "moment";
import { ClientesService } from "app/services/clientes.service";
import { MatStep, MatStepper } from "@angular/material/stepper";
import { UtilitarioService } from "app/services/utilitario.service";
import { FoliosService } from "app/services/folios.service";
import { ListasService } from "app/services/listas.services";
import { CheckList, Foto } from "app/models/checklist.model";
import { PerfectScrollbarConfigInterface, PerfectScrollbarDirective } from "ngx-perfect-scrollbar";
import { NgxImageCompressService } from "ngx-image-compress";
import { TareasService } from "app/services/tareas.service";

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

  @ViewChildren(PerfectScrollbarDirective) pss: QueryList<PerfectScrollbarDirective>;
  @ViewChild('backToTop') backToTop:any;
  @ViewChild(MatStepper) 
  private stepper: MatStepper;

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
  @ViewChild('search') public searchElementRef: ElementRef;
  @ViewChild('cbxCliente') public cbxCliente: NgxMatCombobox;
  // @ViewChild('imageFoto1') public imageFoto1: HTMLImageElement;


  public tarea: TareaOT;
  public tareaParent: TareaOT;
  public tareasChilds: TareaOT[] = [];
  public tareaClone: TareaOT;   // Sirve para evitar actualizar datos no modificados.
  public folio: Folio;
  public hasChildren: boolean = false; 
  public tituloCombo: string;
  public opcionCombo: string;
  
  //Tipo de Servicio
  tipoServicio = [
    { value: Servicio.SERVICIO_DE_EMERGENCIA, viewValue: Servicio.SERVICIO_DE_EMERGENCIA },
    { value: Servicio.MANTENIMIENTO_PREVENTIVO, viewValue: Servicio.MANTENIMIENTO_PREVENTIVO },
    { value: Servicio.TRABAJO_PROGRAMADO, viewValue: Servicio.TRABAJO_PROGRAMADO },
    { value: Servicio.REVISION_DE_EQUIPOS, viewValue: Servicio.REVISION_DE_EQUIPOS },
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
  public cargando: boolean = false;   // Usar con el spinner
  //public idURL: number;
  public ver: boolean = false;
  public crear: boolean = false;
  public editar: boolean = false;
  public procesandoEncabezado: boolean = false;
  public textoBotonEncabezado: string = 'Crear OT';
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
  public clicked$ = this.clickedSub.pipe(take(1)).subscribe((click) => console.log('pressed'));
  public formTimerOT: UntypedFormGroup;
  public formTimerEndOT: UntypedFormGroup;
  public calidad: number = 20;  // Hasta 20 para reducir el peso del archivo.
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
  public sizeFoto5: number = 0
  public uploadFotoChecklist: number = -1;
  public fotosPorSubir: boolean = false;
  public fotosEnTarea: boolean = false;
  public fotosPorSubir$: Observable<boolean>;
  public fotosEnTarea$: Observable<boolean>;
  public desactivarBotonSubir: boolean = false;
  public mensajeSubirArchivo: string = 'Subir archivos';
  public mensajeSubirArchivoChecklist: string = 'Subir';
  public fechaHoraInicio: string = "";   // Fecha y hora para almacenar en Firebase
  public fechaHoraFin: string = "";      // Estas serán las que se ingresarán a la tarea.
  public horaTiempoEjecucion: string = "";
  public horaIniciada: boolean = false;
  public tiempoPausado: boolean = false;
  public stopTimer$: Subject<void>;
  public stopHoraFinal$: Subject<void>;
  public horaInicial: string;       // Hora de la fecha inicial, solo para visualización.
  public horaFinal: string;         // idem.
  public tiempoEjecucion: string = "";
  public fechaValidacion: string;
  public camposFaltantes: string = "";
  
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
    private tareasService: TareasService
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
  }

  ngOnInit(): void {
    this.optionsPsConfig.wheelPropagation = false;
    if (!this.tareaId) {
      console.log('No se recibió tareaId, es un nuevo documento');
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
    
    if(this.tarea?.wo_final_date){
      this.otFinalizada = true;
      this.fechaValidacion = moment.utc(this.tarea.wo_final_date).local().format("DD/MM/YYYY HH:mm:ss");
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
      console.log(`latitud: ${this.latitud}, longitud: ${this.longitud}, direccion: ${this.address}`)
      if (!this.crear && !this.address) {

        this.geoCoder = new google.maps.Geocoder;

        if (this.latitud && this.longitud) {
          this.getAddress(this.latitud, this.longitud); // Si ya lo hay, solo se obtiene la dirección.
        }

        let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
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
    if ('geolocation' in navigator) {
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
    if(!this.geoCoder){
      this.geoCoder = new google.maps.Geocoder;
    }
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          // this.zoom = 12;
          console.log('Dirección obtenida desde GeoCode: ', results[0].formatted_address);
          this.address = results[0].formatted_address;
          this.formChechListGeneral.get('direccion').setValue(this.address);
          this.tarea = {...this.tarea, 
                      direccion: this.address,
                        latitud: this.latitud.toString(),
                        longitud: this.longitud.toString()};
        } else {
          this.openSnackBar('Búsqueda sin resultado', 'OK');
        }
      } else {
        Swal.fire('Geocoder falló por:', status, 'error');
      }

    });
  }

  markerDragEnd($event: google.maps.MouseEvent) {
    // console.log($event);
    this.latitud = $event.latLng.lat();
    this.longitud = $event.latLng.lng();
    this.getAddress(this.latitud, this.longitud);
  }

  /**
   * Obtiene la OT principal y secundarias.
   * DEPRECATED: Obtiene la tarea desde el Store
   * 
   */
  private async obtieneTarea() {
    await this.tareasService.getTareaOTById(this.tareaId).then( async (tareas) => {
      // Tarea a editar
      this.tarea = tareas.find(t => t.id === this.tareaId); 
      // Tarea para detectar cambios
      this.tareaClone =  tareas.find(t => t.id === this.tareaId); 
      // Tarea padre
      this.tareaParent = tareas[0];
      this.tareasChilds = tareas.filter(t => t.id_parent_wo === this.tareaParent.id);
      // Variabls de flujos.
      this.hasChildren = this.tarea?.has_children;
      this.otFinalizada = this.tarea?.id_status_work_order === 3;
      this.esMantencionPreventiva = this.tarea?.tasks_log_task_type_main === Servicio.MANTENIMIENTO_PREVENTIVO;
      this.checklist = this.tarea?.checklist? JSON.parse(this.tarea.checklist): [];
      await this.cargarTareaEnFormulario(this.tarea);

       // OT visualizada
    if(this.tarea.id_assigned_user === this.authService?.user?.id_person 
      && !this.tarea.review_date){
      const time = new Date();
      this.tarea.review_date = time.toISOString();
      this.tareaParent.review_date = time.toISOString();
      this.tareasChilds.map( (t) => { t.review_date = time.toISOString()} );
      }
    });    
  }

  refresh(){
    this.tareasService.getTareaOTById(this.tareaId).then( (tareas) => {
        this.tarea = tareas.find(t => t.id === this.tareaId);
        this.tareaParent = tareas[0];
        this.tareasChilds = tareas.filter( t => t.id_parent_wo === this.tareaParent.id);
    });
  }

  private requerido = [
    Validators.required
  ];

  /**
   * Instancia los FormBuilders con o sin datos iniciales.
   */
  private creaFormGroups(update?: boolean) {
  
    this.formTimerOT = this.fb.group({
      numero: [{ value: "", disabled: true }, Validators.required],
      fecha: [{ value: (new Date()).toISOString(), disabled: true }, Validators.required],
      horaInicio: [{ value: "", disabled: this.otFinalizada }, [Validators.required, Validators.minLength(5)]],
      horaTermino: [{ value: "", disabled: this.otFinalizada }],
      tiempoEjecucion: [{ value: "", disabled: this.otFinalizada }]
    });  

    this.formTimerEndOT = this.fb.group({
      horaTermino: [{ value: "", disabled: this.otFinalizada }, [Validators.required, Validators.minLength(5)]],
      tiempoEjecucion: [{ value: "", disabled: this.otFinalizada }, [Validators.required, Validators.minLength(5)]],       
    });    

    this.formTareaOT = this.fb.group({
      cliente: [{ value: "", disabled: (this.esTecnico || this.esBodeguero || this.otFinalizada)}, Validators.required],
      local: [{ value: "", disabled: (this.esTecnico  || this.esBodeguero || this.otFinalizada) }, Validators.required],
      fechaSolicitudServicio: [{ value: (new Date()).toISOString(), disabled: true }, Validators.required],
      equipo: [{ value: "", disabled: (this.esTecnico  || this.esBodeguero|| this.otFinalizada) }, Validators.required],
      servicio: [{ value: "", disabled: (this.esTecnico || this.esBodeguero || this.otFinalizada) }, Validators.required],
      prioridad: [{ value: "", disabled: (this.esTecnico || this.esBodeguero || this.otFinalizada) }, Validators.required],
      autor: [{ value: this.authService.user?.name, disabled: true }],
      tecnico: [{ value: "", disabled: (this.esTecnico || this.esBodeguero || this.otFinalizada) }],
      antecedentes: [{ value: "", disabled: (this.esTecnico || this.esBodeguero || this.otFinalizada) }, Validators.required]
    });

    if(!update || update === undefined){
      this.formFotosOT = this.fb.group({
        foto1: [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}, Validators.required],
        foto2: [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        foto3: [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        foto4: [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        foto5: [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
      });
    }    

    if(!update || update === undefined){
      this.formFirmasOT = this.fb.group({
        observaciones       : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}, Validators.required],
        aceptado_por_nombre : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}, Validators.required],
        aceptado_por_rut    : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}, Validators.required],
        aceptado_por_cargo  : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}, Validators.required],
        aceptado_por_firma  : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}, Validators.required],
        revisado_por_nombre : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        revisado_por_rut    : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        revisado_por_cargo  : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        revisado_por_firma  : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        ejecutado_por_nombre: [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        ejecutado_por_rut   : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        ejecutado_por_cargo : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        ejecutado_por_firma : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
      });
    }

    if(!update || update === undefined){
      this.formChechListGeneral = this.fb.group({
        latitud          : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        longitud         : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        altitud          : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}],
        direccion        : [{ value: "", disabled: true }, Validators.required],
        descripcion      : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}, Validators.required],
        materiales       : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}, Validators.required],
        tipoFalla        : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}, Validators.required],
        causaFalla       : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}, Validators.required],
        metodoDeteccionFalla: [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}, Validators.required],
        equipoDetenido   : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}, Validators.required],
        motivoDetencion  : [{value: "", disabled: (this.otFinalizada || this.esBodeguero)}]
      });
    }

    if(!update || update === undefined){
      this.formFotosOT.valueChanges.subscribe(() => {
        this.fotosPorSubir$.subscribe((u) => { this.fotosPorSubir = u });
        this.fotosEnTarea$.subscribe((t) => { this.fotosEnTarea = t });
      });
  
      // Guía de uso de Observables: https://rxjs.dev/guide/observable
      this.fotosPorSubir$ = new Observable(subscriber => {
        const existsFotosPorSubir: boolean =
          (this.formFotosOT.get('foto1')?.value instanceof FileInput
            || this.formFotosOT.get('foto2')?.value instanceof FileInput
            || this.formFotosOT.get('foto3')?.value instanceof FileInput
            || this.formFotosOT.get('foto4')?.value instanceof FileInput
            || this.formFotosOT.get('foto5')?.value instanceof FileInput);
        subscriber.next(existsFotosPorSubir);
      });

      this.fotosEnTarea$ = new Observable(subscriber => {
        const existsFotosEnTarea: boolean =
          (typeof this.formFotosOT.get('foto1')?.value === 'string'
            || typeof this.formFotosOT.get('foto2')?.value === 'string'
            || typeof this.formFotosOT.get('foto3')?.value === 'string'
            || typeof this.formFotosOT.get('foto4')?.value === 'string'
            || typeof this.formFotosOT.get('foto5')?.value === 'string'
          );
        subscriber.next(existsFotosEnTarea);
      });
    }

    if(this.esMantencionPreventiva){
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
    this.formFirmasOT =  undefined;
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

  selectionChangedStepper(event: any){
    const matStep: MatStep = event.selectedStep;
    const stepId = matStep?.content?.elementRef?.nativeElement?.ownerDocument?.activeElement?.id;
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
      stepElement.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
    }
  }

  tipoCheckList: string;
  jsonCheckList: CheckList;
  onTipoMantenimientoSelectionChange(event: any){    
    this.tipoCheckList = event;
    this.checklist.sort(((a, b) => a.orden - b.orden)); 
    this.jsonCheckList = this.checklist.find( (o) => o.tipo === event);   
    if(typeof this.jsonCheckList.opciones === 'string'){
      this.jsonCheckList.opciones = this.jsonCheckList.opciones? JSON.parse(this.jsonCheckList.opciones) : [];
    }
    if(typeof this.jsonCheckList.checklist === 'string'){
      this.jsonCheckList.checklist = this.jsonCheckList.checklist? JSON.parse(this.jsonCheckList.checklist) : [];
    }
  }

  get servicio(): string {
    return this.formTareaOT?.get("servicio")?.value;
  }

  capitalizeWords(text: string): string{
    return text.replace(/(?:^|\s)\S/g,(res)=>{ return res.toUpperCase();})
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
        this.locales = state.locales.map(
          (local: Local) => ({
            ...local,
            nombre: `${local.nombre} (CECO: ${local.ceco})`
          })
        )
      });

    this.store
      .select("equipos")
      .pipe(filter( e => e.loaded))
      .subscribe((state) => {
        if(state?.loaded){
          this.equipos = state.equipos
          .filter((equipo) => equipo.codigolocal == this.local?.codigo)
          .map((equipo) => ({ ...equipo, nombre: `${equipo.nombre} ${equipo.otro ? '- ' + equipo.otro : ''} { ${equipo.codigo} }` }));
        }        
      });

    this.store
      .select("usuarios")
      .pipe(filter((state) => state.usuarios != null),
            map((state) => state.usuarios.filter(u => 
              u.profiles_description === 'TECHNICAL' && u.active === true))
      )
      .subscribe((usuarios) => {
        this.responsables = usuarios;
      });

    this.store.select("folio")
      .pipe(filter((state) => state.folio != null))
      .subscribe((state) => {
        this.folio = state.folio;
      });

    this.store.select("tipoFallas")
      .pipe( take(2), skip(1) )
      .subscribe((state) => {
        if(state?.loaded){
          this.tipoFallas = [...new Set(state.tipoFallas)]; // elimina duplicados.
        }        
      });

    this.store.select("causaFallas")
      .pipe(take(2), skip(1))
      .subscribe((state) => {
        if(state?.loaded){
          this.causaFallas = [...new Set(state.causaFallas)]; // elimina duplicados.
        }
      });

    this.store.select("metodosDeteccion")
      .pipe(take(2), skip(1))
      .subscribe((state) => {
        if(state?.loaded){
          this.metodosDeteccion =  [...new Set(state.metodosDeteccion)]; // elimina duplicados.
        }
      });

    this.store.select("motivosDetencion")
      .pipe(take(2), skip(1))
      .subscribe((state) => {
        if(state?.loaded){
          this.motivosDetencion =  [...new Set(state.motivosDetencion)]; // elimina duplicados.
          this.motivoDetencionFB = state.motivoDetencion;
        }       
      });

    this.store.select('ui')
      .subscribe(({ isLoading, porcentaje }) => {
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
    if(!tarea || tarea === undefined){   
      console.log('Tarea no disponible, no se carga');
      return;
    }

    // Hora Inicio
    if (tarea.initial_date && tarea.initial_date?.length > 0) {
      // Obtenemos la fecha y hora completa del timer hora inicio
      this.fechaHoraInicio = tarea.initial_date;
      this.horaInicial = moment.utc(this.fechaHoraInicio).local().format("HH:mm:ss");
      this.formTimerOT.get('horaInicio').disable();
    }
    if (tarea.final_date && tarea.final_date?.length > 0) {
      // y del timer hora fin, para cargarla en pantalla solo en formato hora.
      this.fechaHoraFin = tarea.final_date;
      this.horaFinal = moment.utc(this.fechaHoraFin).local().format("HH:mm:ss");
      this.formTimerEndOT.get('horaTermino').disable();
      this.formTimerEndOT.get('tiempoEjecucion').disable();
    }

    if(tarea.signature && this.tarea.signature?.length > 0){
      this.existeFirmaAprobada = true;
    }

    let fechaCreacion: string = '';
    if (tarea.creation_date && tarea.creation_date.indexOf('Z') > -1) {
      fechaCreacion = tarea.creation_date
    } else if (tarea.creation_date) {
      fechaCreacion = (new Date(tarea.creation_date)).toISOString();
    }

    if (tarea.real_duration) {
      this.horaTiempoEjecucion = tarea.real_duration;      
      this.tiempoEjecucion = moment.utc(Number(this.horaTiempoEjecucion)).format("HH:mm:ss");      
    }

    if (tarea.id_assigned_user) {      
      this.responsable = tarea.id_assigned_user;
    }

    console.log('Cargando Número OT: ', tarea.wo_folio);
    this.formTimerOT?.get('numero').setValue(tarea.wo_folio?.toString());
    this.formTimerOT?.get('fecha').setValue(tarea.initial_date);
    this.formTimerOT?.get('horaInicio').setValue(this.horaInicial);
    this.formTimerEndOT?.get('horaTermino').setValue(this.horaFinal);
    this.formTimerEndOT?.get('tiempoEjecucion').setValue(this.tiempoEjecucion);

    // Encabezados
    this.formTareaOT?.get('cliente').setValue({ cliente: tarea.cliente });   
    this.formTareaOT?.get('local').setValue({ nombre: tarea.local });
    this.formTareaOT?.get('fechaSolicitudServicio').setValue(tarea.cal_date_maintenance ? new Date(tarea.cal_date_maintenance) : "");
    this.formTareaOT?.get('equipo').setValue({ nombre: tarea.items_log_description });
    this.formTareaOT?.get('servicio').setValue(tarea.tasks_log_task_type_main?.toString());
    this.formTareaOT?.get('prioridad').setValue(tarea.priorities_description?.toString());
    this.formTareaOT?.get('autor').setValue(tarea.requested_by?.toString());
    this.formTareaOT?.get('tecnico').setValue({ name: tarea.personnel_description ? tarea.personnel_description : '' });
    this.formTareaOT?.get('antecedentes').setValue(tarea.description?.toString());

    // Check List General
    this.formChechListGeneral?.get('latitud').setValue(tarea.latitud?.toString());
    this.formChechListGeneral?.get('longitud').setValue(tarea.longitud?.toString());
    this.formChechListGeneral?.get('altitud').setValue(tarea.altitud?.toString());
    this.formChechListGeneral?.get('direccion').setValue(tarea.direccion?.toString());
    this.formChechListGeneral?.get('descripcion').setValue(tarea.description_general?.toString());
    this.formChechListGeneral?.get('materiales').setValue(tarea.materiales?.toString());
    this.formChechListGeneral?.get('tipoFalla').setValue({ description: tarea.types_description });
    this.formChechListGeneral?.get('causaFalla').setValue({ description: tarea.causes_description });
    this.formChechListGeneral?.get('metodoDeteccionFalla').setValue({ description: tarea.detection_method_description });
    this.formChechListGeneral?.get('equipoDetenido').setValue(tarea.time_disruption?.toString());
    if (tarea.caused_disruption) {
      this.formChechListGeneral?.get('motivoDetencion').setValue({ nombre: tarea.caused_disruption?.toString() });
    }

    this.address = tarea.direccion?.toString();
    this.latitud = tarea.latitud ? Number(tarea.latitud) : undefined;
    this.longitud = tarea.longitud ? Number(tarea.longitud) : undefined;
    this.altitud = tarea.altitud ? Number(tarea.altitud) : undefined;

    this.inicializarMapaConBusqueda();

    // Fotos
    this.formFotosOT?.get('foto1').setValue(tarea.foto1?.toString());
    this.formFotosOT?.get('foto2').setValue(tarea.foto2?.toString());
    this.formFotosOT?.get('foto3').setValue(tarea.foto3?.toString());
    this.formFotosOT?.get('foto4').setValue(tarea.foto3?.toString());
    this.formFotosOT?.get('foto5').setValue(tarea.foto3?.toString());
    this.urlFoto1 = tarea.foto1?.toString();
    this.urlFoto2 = tarea.foto2?.toString();
    this.urlFoto3 = tarea.foto3?.toString();
    this.urlFoto4 = tarea.foto4?.toString();
    this.urlFoto5 = tarea.foto5?.toString();

    if(this.urlFoto1){ this.sizeFoto1 = (await fetch(this.urlFoto1).then(r => r.blob()))?.size;  }
    if(this.urlFoto2){ this.sizeFoto2 = (await fetch(this.urlFoto2).then(r => r.blob()))?.size;  }
    if(this.urlFoto3){ this.sizeFoto3 = (await fetch(this.urlFoto3).then(r => r.blob()))?.size;  }
    if(this.urlFoto4){ this.sizeFoto4 = (await fetch(this.urlFoto4).then(r => r.blob()))?.size;  }
    if(this.urlFoto5){ this.sizeFoto5 = (await fetch(this.urlFoto5).then(r => r.blob()))?.size;  }

    // Firmas
    this.formFirmasOT?.get('observaciones').setValue(tarea.observaciones?.toString());
    this.formFirmasOT?.get('aceptado_por_nombre').setValue(tarea.details_signature?.toString());
    this.formFirmasOT?.get('aceptado_por_rut').setValue(tarea.aceptado_por_rut?.toString());
    this.formFirmasOT?.get('aceptado_por_cargo').setValue(tarea.aceptado_por_cargo?.toString());
    this.formFirmasOT?.get('aceptado_por_firma').setValue(tarea.signature?.toString()); // Base64
    this.formFirmasOT?.get('revisado_por_nombre').setValue(tarea.revisado_por_nombre?.toString());
    this.formFirmasOT?.get('revisado_por_rut').setValue(tarea.revisado_por_rut?.toString());
    this.formFirmasOT?.get('revisado_por_cargo').setValue(tarea.revisado_por_cargo?.toString());
    this.formFirmasOT?.get('revisado_por_firma').setValue(tarea.validator_path_signature?.toString());
    this.formFirmasOT?.get('ejecutado_por_nombre').setValue(tarea.user_assigned?.toString());
    this.formFirmasOT?.get('ejecutado_por_rut').setValue(tarea.ejecutado_por_rut?.toString());
    this.formFirmasOT?.get('ejecutado_por_cargo').setValue(tarea.ejecutado_por_cargo?.toString());
    this.formFirmasOT?.get('ejecutado_por_firma').setValue(tarea.responsible_path_signature?.toString());


    // Otros
    this.equipo = tarea.code?.toString();

    this.cargando = false;   

    // Bugfixed cuadros de selección que no muestra valor inyectado.
    let element: HTMLElement = document.getElementById('formTarea') as HTMLElement;
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
          return ("" + o[campo]).toLowerCase().includes(query?.toLowerCase())
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
    this.formTimerOT.get('horaInicio').disable();

    if(this.esChild === undefined && this.tarea?.id_parent_wo === null){
      this.tarea = {
        ...this.tarea,
        initial_date: this.fechaHoraInicio,    
        // id_status_work_order: 1 // en proceso
      };
      this.store.dispatch( actions.actualizarTareaOT({ tareaOT: this.tarea}));
    }else{
      this.tareaParent = {
        ...this.tareaParent,
        initial_date: this.fechaHoraInicio,    
        // id_status_work_order: 1 // en proceso
      };
      this.store.dispatch( actions.actualizarTareaOT({ tareaOT: this.tareaParent}));
      
      this.tareasChilds.forEach( (task) => {
        let tarea: TareaOT = {
          ...task,
          initial_date: this.fechaHoraInicio,
          // id_status_work_order: 1 // en proceso
        };
        
        setTimeout( () => {
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
    this.tiempoEjecucion = moment.utc(Number(this.horaTiempoEjecucion)).local().format("HH:mm:ss");

    this.formTimerEndOT.get("horaTermino").setValue(this.horaFinal);
    this.formTimerEndOT.get("tiempoEjecucion").setValue(this.tiempoEjecucion);
    this.formTimerEndOT.get('horaTermino').disable();
    this.formTimerEndOT.get('tiempoEjecucion').disable();

    console.log(`Registrando hora de término: ${this.tiempoEjecucion} => ${this.horaTiempoEjecucion}`);
    
    if (this.esChild === undefined && this.tarea?.id_parent_wo === null) {
      this.tarea = {
        ...this.tarea,
        final_date: this.fechaHoraFin,
        real_duration: this.horaTiempoEjecucion,
        id_status_work_order: 8 // por revisar
      };
      setTimeout( () => { this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));}, 600); 
    } else {
      this.tareaParent = {
        ...this.tareaParent,
        final_date: this.fechaHoraFin,
        real_duration: this.horaTiempoEjecucion,
        id_status_work_order: 8 // por revisar
      };
      setTimeout( () => {this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tareaParent }));}, 600); 
      
      this.tareasChilds.forEach((tarea) => {
        const task: TareaOT = {
          ...tarea,
          final_date: this.fechaHoraFin,
          real_duration: this.horaTiempoEjecucion,
          id_status_work_order: 8 // por revisar
        }
        setTimeout( () => {this.store.dispatch(actions.actualizarTareaOT({ tareaOT: task }))}, 600); 
      });
    }

    setTimeout(() => {this.router.navigate(['/task/services'])}, 3000);

  }

  validarOT() {
    if ((this.esSupervisor || this.esAdministrador) && this.tarea) {

      Swal.fire({
        title: 'Está a un paso de validar la OT N° '.concat(this.tareaParent.wo_folio),
        html: ' ¿Desea continuar?',
        icon: 'question',
        showDenyButton: false, showCancelButton: true,
        confirmButtonText: `OK`
      }).then((result) => {

        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          const time = new Date();
          const fechaFinal = time.toISOString();

          if(this.esChild === undefined && this.tarea?.id_parent_wo === null){
            this.tarea = {...this.tarea,
              id_status_work_order: 3,
              id_validated_by: this.authService.user.id_person,
              validated_by_description: this.authService.user.name,
              wo_final_date: fechaFinal
             };
             this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea  }));
          } else {
            this.tareaParent = {...this.tareaParent,
              id_status_work_order: 3,
              id_validated_by: this.authService.user.id_person,
              validated_by_description: this.authService.user.name,
              wo_final_date: fechaFinal
             };
             this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tareaParent  }));

            this.tareasChilds.forEach( tarea => {
              const task: TareaOT =  {...tarea,
                id_status_work_order: 3,
                id_validated_by: this.authService.user.id_person,
                validated_by_description: this.authService.user.name,
                wo_final_date: fechaFinal
               };
               this.store.dispatch(actions.actualizarTareaOT({ tareaOT: task }));
            });
          }
         
          this.store.pipe(select('tarea'), take(2)).subscribe(
            (state) => {
              console.log('tarea validad take 1.');
              if (state.loaded) {

                    Swal.fire({
                      title: "OT Validada correctamente.",
                      html: ' Estado cambiado a FINALIZADA',
                      icon: 'success',
                      showDenyButton: false, showCancelButton: false,
                      confirmButtonText: `OK`
                    });
                    // .then((res) => {                     
                    //    setTimeout( () => {this.router.navigate(['/task/services']);}, 1000);                               
                    // });

              } else if (state.error) {
                console.error('Error al validar', state);
                Swal.fire('Error en la valdiación.', state.error?.error, 'error');
              }
            }
          );
        }
      });
    }
  }

  onClienteSelectionChange(cliente: Cliente) {
    if (Array.isArray(cliente) && cliente.length > 0){
      const _cliente: Cliente = cliente[0];
      if(_cliente?.uid){
        this.cliente = _cliente.uid;
        this.store.dispatch(actions.cargarLocales({ uid: this.cliente }));
      }else if(_cliente.cliente){
        // Tiene solo el nombre del cliente pero no su UID, se busca.
        this.clienteService.getClienteByName(_cliente.cliente)
        .then( async (clienteFB) => {
            console.log('se recupera UID ', clienteFB.uid, ' de cliente ', clienteFB.cliente);
            this.cliente = clienteFB.uid;
            this.store.dispatch(actions.cargarLocales({ uid: this.cliente }));      
            
            // Cargando latitud y longitud desde local por default
            if(!this.latitud || this.latitud === undefined){
              const v = this.tarea.local;
              const ceco = v.substring(v.indexOf("CECO:") + 6, v.length - 1);
              this.clienteService.getLocalByCECO(this.cliente, ceco)
              .then( (local) => {
                console.log('Buscando CECO: ', ceco, 'lat',local.latitude,'lon',local.longitud);
                this.latitud = Number(local.latitude);
                this.longitud = Number(local.longitud);
                this.getAddress(this.latitud, this.longitud);
              });
             }
            
            
            // Poblando información Checklist para Mantenimiento Preventivo
            if(this.tarea.tasks_log_task_type_main === Servicio.MANTENIMIENTO_PREVENTIVO){ 
              this.onTipoServicioSelectionChange(Servicio.MANTENIMIENTO_PREVENTIVO); 
              if(!this.tarea.checklist 
                || this.tarea.checklist?.length === 0 
                || this.tarea.checklist === '[]'){        
                console.log('generando checklist...');        
                await this.obtenerCheckListDesdePlantilla();
              }else{
                console.log('checklist existe.');
              }
            }
        });
      }
    }   
  }

  async obtenerCheckListDesdePlantilla() {
    const fecha = this.tarea?.cal_date_maintenance? 
                  this.tarea.cal_date_maintenance : this.formTareaOT.get("fechaSolicitudServicio").value;
    // Se agrega un día más ya que las OT se crean un día anterior
    const month = moment(fecha).add(1, 'days').format('M');
    const mes = this.opcionesPeriodo.find(o => o.value === month)?.viewValue;

    let local = "";
      if(this.tarea !== undefined && this.tarea?.local !== undefined){
      if (this.tarea?.local?.indexOf("Líder", 0) !== -1) {
        local = "Líder"
      } else if (this.tarea?.local?.indexOf("Ekono", 0) !== -1) {
        local = "Ekono";
      }
    }
    
    console.log('cliente', this.cliente, 'mes', mes, 'local', local);
    const list = await this.listasService.getCheckListMantencionPrenventiva(this.cliente, mes, local);
    if(list) {
      // console.log('mantencion recibida', list);
        if (list && list.length > 0) {
          this.checklist = list;
          this.checklist.forEach((check, index) => {
            console.log('checklist ', index, ' => ', check);
            if (typeof check.checklist === 'string') {
              check.checklist = JSON.parse(check.checklist);
            }
            if (typeof check.opciones === 'string') {
              check.opciones = JSON.parse(check.opciones);
            }
            if (typeof check.fotos === 'string') {
              check.fotos = JSON.parse(check.fotos);
            }
          });
          this.checklist.sort(((a, b) => a.orden - b.orden));
        }
    }
  }

  async onTipoServicioSelectionChange(event: any){
    if(event === Servicio.MANTENIMIENTO_PREVENTIVO){
      
      if(this.tarea?.checklist === undefined 
        || this.tarea?.checklist?.length < 10){
        await this.obtenerCheckListDesdePlantilla();
      }
      this.esMantencionPreventiva = true;
      this.formTareaOT.get('equipo').clearValidators();
      this.formTareaOT.get('equipo').updateValueAndValidity();
      this.formTareaOT.get('equipo').disable();
      this.formChechListGeneral.get('descripcion').clearValidators();
      this.formChechListGeneral.get('descripcion').updateValueAndValidity();
      this.formChechListGeneral.get('materiales').clearValidators();
      this.formChechListGeneral.get('materiales').updateValueAndValidity();
      this.formChechListGeneral.get('tipoFalla').clearValidators();
      this.formChechListGeneral.get('tipoFalla').updateValueAndValidity();
      this.formChechListGeneral.get('causaFalla').clearValidators();
      this.formChechListGeneral.get('causaFalla').updateValueAndValidity();
      this.formChechListGeneral.get('metodoDeteccionFalla').clearValidators();
      this.formChechListGeneral.get('metodoDeteccionFalla').updateValueAndValidity();
      this.formChechListGeneral.get('equipoDetenido').clearValidators();
      this.formChechListGeneral.get('equipoDetenido').updateValueAndValidity();
      this.formFotosOT.get('foto1').clearValidators();
      this.formFotosOT.get('foto1').updateValueAndValidity();
    }else{
      this.esMantencionPreventiva = false;
      this.formTareaOT.get('equipo').enable();
      this.formTareaOT.get('equipo').setValidators(this.requerido);
      this.formChechListGeneral.get('descripcion').setValidators(this.requerido);
      this.formChechListGeneral.get('materiales').setValidators(this.requerido);
      this.formChechListGeneral.get('tipoFalla').setValidators(this.requerido);
      this.formChechListGeneral.get('causaFalla').setValidators(this.requerido);
      this.formChechListGeneral.get('metodoDeteccionFalla').setValidators(this.requerido);
      this.formChechListGeneral.get('equipoDetenido').setValidators(this.requerido);
    }
  }

  onEquipoDetenidoSelectionChange(event: any){
    if(event == "No"){
      this.formChechListGeneral.get('motivoDetencion').clearValidators();
      this.formChechListGeneral.get('motivoDetencion').updateValueAndValidity();
      this.formChechListGeneral.get('motivoDetencion').disable();
    }else{
      this.formChechListGeneral.get('motivoDetencion').enable();
      this.formChechListGeneral.get('motivoDetencion').setValidators(this.requerido)
    }
  }

  onLocalSelectionChange(locales: Local[]) {
    if (Array.isArray(locales) && locales.length > 0) {
      this.local = locales[0];
      if (this.local) {
        this.address = this.local.direccion;
        this.latitud = Number(this.local.latitude);
        this.longitud = Number(this.local.longitud);      
        this.store.dispatch(actions.cargarEquipos({ uid: this.cliente, codigolocal: this.local.codigo }))
      }
    }
  }

  onTecnicoSelectionChange(tecnico: Usuario[]) {
    if (Array.isArray(tecnico) && tecnico.length > 0 && tecnico[0].id_person) {
      this.responsable = tecnico[0].id_person;
    }
  }

  async onFotoChecklistUploadChange(event: any, foto: Foto) {   
    console.log('datos de la foto a subir', event); 
    if (event.target?.files[0] instanceof File) {
        const path = this.generarPathDeFotos();      
        const file: File = event.target?.files[0];
        const imageName: string = this.utilitarioService.addTimeToImageName(file.name);
        console.log('Preparando para guardar: ', imageName);
        var reader = new FileReader();
        reader.onload = (event: any) => {
          const localUrl = event.target.result;
          const orientation = -1;
          this.imageCompress.compressFile(localUrl, orientation, 50, 60, 480, 480)
            .then((result) => {
              const metadata = { resizedImage: true };
              const imageBlob = this.fileUploadServive.dataURItoBlob(result.split(',')[1]);
              const uploadTask = this.fileUploadServive
                .pushBlobToStorage(path, imageBlob, imageName, metadata)
              uploadTask.on(
                'state_changed', (snapshot) => { // Progreso de subida
                  this.uploadFotoChecklist = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                },
                (error) => {
                  this.openSnackBar(error.message, "OK");
                  this.uploadFotoChecklist = -1;
                },
                () => { // Success
                  getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('foto.url generada', downloadURL);
                    foto.url = downloadURL;
                    this.uploadFotoChecklist = -1;
                    this.tarea = { ...this.tarea, checklist: JSON.stringify(this.checklist) };
                    this.store.dispatch(actions.stopLoading());
                    this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
                  });
                }
              );
            });

        }
        reader.readAsDataURL(file);
      
    }
  }

  /**
  * Guarda el registro en Firebase
  * @param panel Opción a guardar
  * @returns
  */
  public async onSubmit(panel: string): Promise<void> {

    if(this.tarea?.id_status_work_order && this.tarea?.id_status_work_order === 3){      
       const mensaje = `OT ${this.tarea.wo_folio} terminada, no se permite modificar. `; 
       console.log(mensaje);
       this.openSnackBar(mensaje, 'OK');
       return;
    }

    console.log('--------------------------------Preparando datos para: ', panel);
    switch (panel) {
      case 'encabezado': {
        if (this.formTareaOT.invalid || !(this.formTareaOT.valid) || this.otFinalizada) { return; }
        
        this.procesandoEncabezado = true;
        console.log('Permiso Crear: ', this.crear, ', permiso Editar: ', this.editar);

        if (this.crear || this.editar || this.esPersonalized) {
           // Se crea una nueva instancia de TareaOT para enviar a Firebase
           const { cliente, local, fechaSolicitudServicio, equipo, servicio,
            prioridad, autor, antecedentes } = this.formTareaOT.getRawValue();
            
            this.tarea = {
              ...this.tarea,
              cliente: cliente['cliente'],
              local: local['nombre'],
              items_log_description: equipo['nombre'],
              tasks_log_task_type_main: servicio,
              priorities_description: prioridad,
              requested_by: autor,
              description: antecedentes,
              cal_date_maintenance: (new Date(fechaSolicitudServicio)).toISOString(),
              personnel_description: this.getPersonalTecnico(),
              id_assigned_user: this.responsable              
            };

          if (this.crear) {
            
            this.store.dispatch(actions.isLoading());                       // Mostrar loading...
            // this.store.dispatch(actions.generarFolio({ id: 'tareas_ot' })); // Avanzar folio
            this.foliosService.generarFolio('tareas_ot')
            .then( async (_folio: Folio) => {
              const time = new Date();
              this.folio = _folio;
              this.tarea = {
                ...this.tarea,
                wo_folio: this.folio?.numero?.toString(),
                creation_date: this.getFechaOT(),
                has_children: false,
                id_parent_wo: null,                
                // Estado: 6 Técnico asignado, 7 Por asignar técnico. 
                id_status_work_order: (this.getPersonalTecnico().length > 0) ? 6 : 7,
                first_date_task:  (this.getPersonalTecnico().length > 0) ? time.toISOString() : null,
                direccion: this.local.direccion,
                latitud: this.local.latitude,
                longitud: this.local.longitud
              };
              
              if(servicio === Servicio.MANTENIMIENTO_PREVENTIVO){
                await this.obtenerCheckListDesdePlantilla();
                this.tarea = {
                  ...this.tarea,
                  checklist: JSON.stringify(this.checklist)
                }
              }

              this.store.dispatch(actions.crearTareaOT({ tareaOT: this.tarea}))
            });
          } else if (this.editar || this.esPersonalized) {
            
            if(this.tarea.id_status_work_order === 7){
              this.tarea = {
                ...this.tarea, 
                id_status_work_order: (this.getPersonalTecnico().length > 0) ? 6 : 7
              };
            }
            
            console.log('Verificando cambios en Encabezado...');
            // Verificamos si existen modificaciones para guardar, caso contrario omitimos.
            if(!this.utilitarioService.checkModificEncabezado(this.tarea, this.tareaClone)){
              console.log('Sin cambios en encabezado');
              return;
            }

            this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
            if(this.esPersonalized){
              Swal.fire({
                title: 'Registro actualizado',
                html: servicio.concat(' OT N° ', this.tarea.wo_folio),
                icon: 'success',
                showDenyButton: false, showCancelButton: false,
                confirmButtonText: `OK`
              }).then((result) => {                 
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                  this.router.navigate(["/task/status"]);
                }
              });
            }
          } 

           this.store.pipe(select('tareas'), take(3), skip(2)).subscribe(
            (state) => {
              console.log('pipe select tareas state:', state);
              if (state.loaded) {
                if (this.crear) {
                  this.formTimerOT.get('numero').setValue(state.tareaOT.wo_folio);
                  this.formTimerOT.get('fecha').setValue(state.tareaOT.initial_date);
                  Swal.fire({
                    title: 'Registro creado',
                    html: servicio.concat(' OT N° ', state.tareaOT.wo_folio),
                    icon: 'success',
                    showDenyButton: false, showCancelButton: false,
                    confirmButtonText: `OK`
                  }).then((result) => {
                    /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {
                      this.router.navigate(["/task/status"]);
                    }
                  });
                } else if(!this.esPersonalized){
                  this.openSnackBar('Registro actualizado ', 'OK');
                }
                this.store.dispatch(actions.stopLoading());
                this.tareaClone = this.tarea;
              } else if (state.error) {
                console.error('Error en encabezado.', state);
                Swal.fire('Error en encabezado.', state.error?.error, 'error');
                this.store.dispatch(actions.stopLoading());
              }
            });
        }

        break;
      }

      case 'timer':
        if (this.formTimerOT.invalid || this.otFinalizada) { return; }
       
        // La tarea ya está cargada en memoria, se debe simplemente actualizar sus campos
        if (!this.tarea?.initial_date) {    // No hay hora inicial, se busca valor para insertar.
          this.tarea = {
            ...this.tarea,
            initial_date: this.fechaHoraInicio
          };

          this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));

          this.tareasChilds?.forEach((tarea) => {
              const task = { ...tarea, initial_date: this.fechaHoraInicio  };
              setTimeout( ()=> this.store.dispatch(actions.actualizarTareaOT({ tareaOT: task})), 300);
          });          

          this.store.pipe(select('tarea'), take(2), skip(1)).subscribe(
            (state) => {
              console.log('verificando timer... updated? ', state?.updated);
              if (state.updated) {
                this.openSnackBar('Timer actualizado', 'OK');
                this.tareaClone = this.tarea;
              } else if (state.error) {
                console.error('Error al obtener tarea. ', state);
                Swal.fire('Error obtener tarea.', state.error?.error, 'error');
              }
            });
        } else {
          console.log('sin cambios en el timer');
        }

        break;

      case 'general':
        if(this.otFinalizada){
          console.log('OT finalizada, se omiten cambios');
        }
        if (this.formChechListGeneral.invalid 
            && this.tarea.tasks_log_task_type_main !== Servicio.MANTENIMIENTO_PREVENTIVO) { 
          console.log('El formulario general es inválido.');
          return; 
        }

        if (this.crear || this.editar) {
          // Se obtienen datos GPS ya registrados
          if (this.utilitarioService.checkExistsRecordGPS(this.tareaClone)) {
            console.log('ya existen datos GPS');
            this.tarea = {
              ...this.tarea,
              latitud: this.tareaClone.latitud,
              longitud: this.tareaClone.longitud,
              altitud: this.tareaClone.altitud,
              direccion: this.tareaClone.direccion
            };
          } else {
            console.log('datos GPS desde Maps')
            this.tarea = {
              ...this.tarea,
              latitud: this.latitud ? this.latitud.toString() : '',
              longitud: this.longitud ? this.longitud.toString() : '',
              altitud: this.altitud ? this.altitud.toString() : '',
              direccion: this.address
            };
          }

          // Se crean variables apuntando a campos del FormGroup
          const { descripcion, materiales, tipoFalla, causaFalla, metodoDeteccionFalla,
                  equipoDetenido, motivoDetencion } = this.formChechListGeneral.getRawValue();

          // La tarea ya está cargada en memoria, se debe simplemente actualizar sus campos
          this.tarea = {
            ...this.tarea,           
            description_general: descripcion,
            materiales: materiales,
            types_description: tipoFalla ? tipoFalla['description'] : '',
            causes_description: causaFalla ? causaFalla['description'] : '',
            detection_method_description: metodoDeteccionFalla ? metodoDeteccionFalla['description'] : '',
            time_disruption: equipoDetenido,
          };

          if(this.tarea.tasks_log_task_type_main === Servicio.MANTENIMIENTO_PREVENTIVO){            
            this.tarea = {
              ...this.tarea,
              checklist: JSON.stringify(this.checklist)
            }
          }

          if(equipoDetenido && equipoDetenido === 'Sí'){
            this.tarea = {
              ...this.tarea,
              caused_disruption: motivoDetencion? motivoDetencion['nombre'] : ''
            };
          }

          // Si no se han realizado modificaciones, se omite el guardar.
          if(!this.utilitarioService.checkModificGeneral(this.tarea, this.tareaClone) && this.servicio !== Servicio.MANTENIMIENTO_PREVENTIVO){
              console.log('No hay cambios en datos generales');
              return;
          }

          // Mostrar loading...
          this.store.dispatch(actions.isLoading());
          this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));

          this.store.pipe(select('tarea'), take(2), skip(1)).subscribe(
            (state) => {
              if (state.updated) {
                this.openSnackBar('Datos guardados.', 'OK');
                this.tareaClone = this.tarea;
              } else if (state.error) {
                console.log('Error al actualizar general. ', state);
                Swal.fire('Error actualizar general', state.error?.error, 'error');
              }
              this.store.dispatch(actions.stopLoading());
            });
        }

        break;

      case 'fotos':
        if (this.formFotosOT.invalid || this.otFinalizada) { //
          console.log('No pasó formulario.');
          return;
        }

        if (this.crear || this.editar) {
          // Se suben las  fotos al Storage y se espera una URL
          const { foto1, foto2, foto3, foto4, foto5 } = this.formFotosOT.value;
          const path = this.generarPathDeFotos();
          const metadata = { resizedImage: true };          
          const orientation = -1;

          // Si la foto es un objeto File se sube el archivo.
          if (foto1 !== undefined && (foto1 instanceof FileInput)) {
            this.uploadFoto1 = 0;
            const file: File = foto1.files[0];
            const imageName: string = this.utilitarioService.addTimeToImageName(file.name);
            var reader = new FileReader();
            reader.onload = (event: any) => {
              const localUrl = event.target.result;              
              this.imageCompress.compressFile(localUrl, orientation, 50, 60, 640, 640)
                .then((result) => {
                  const imageBlob = this.fileUploadServive.dataURItoBlob(result.split(',')[1]);
                  const uploadTask = this.fileUploadServive
                    .pushBlobToStorage(path, imageBlob, imageName, metadata)
                  uploadTask.on(
                    'state_changed', (snapshot) => { // Progreso de subida
                      this.uploadFoto1 = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    },
                    (error) => {
                      this.openSnackBar(error.message, "OK");
                      this.uploadFoto1 = -1;
                    },
                    () => { // Success
                      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        this.urlFoto1 = downloadURL;
                        this.tarea = { ...this.tarea, foto1: this.urlFoto1 }                      
                        this.fotosEnTarea = true;
                        this.formFotosOT.get('foto1').setValue(this.urlFoto1); // Para activar el subscriber.
                        this.uploadFoto1 = -1;
                        if (!this.fotosPorSubir) {  // Si no hay fotos por subir, cancelamos el loading.
                          this.store.dispatch(actions.stopLoading());
                          this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
                        }
                      });
                    }
                  );
                });
            }
            reader.readAsDataURL(file);
          } else {
            this.uploadFoto1 = -1;
          }

          if (foto2 !== undefined && (foto2 instanceof FileInput)) {
            this.uploadFoto2 = 0;
            const file: File = foto2.files[0];  
            const imageName: string = this.utilitarioService.addTimeToImageName(file.name);
            var reader = new FileReader();
            reader.onload = (event: any) => {
              const localUrl = event.target.result;
              this.imageCompress.compressFile(localUrl, orientation, 50, 60, 640, 640)
                .then((result) => {
                  const imageBlob = this.fileUploadServive.dataURItoBlob(result.split(',')[1]);
                  const uploadTask = this.fileUploadServive
                    .pushBlobToStorage(path, imageBlob, imageName, metadata)
                  uploadTask.on(
                    'state_changed', (snapshot) => { // Progreso de subida
                      this.uploadFoto2 = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    },
                    (error) => {
                      this.openSnackBar(error.message, "OK");
                      this.uploadFoto2 = -1;
                    },
                    () => { // Success
                      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        this.urlFoto2 = downloadURL;
                        this.tarea = { ...this.tarea, foto2: this.urlFoto2 }
                        this.fotosEnTarea = true;
                        this.formFotosOT.get('foto2').setValue(this.urlFoto2); // Para activar el subscriber.
                        this.uploadFoto2 = -1;
                        if (!this.fotosPorSubir) {  // Si no hay fotos por subir, cancelamos el loading.
                          this.store.dispatch(actions.stopLoading());
                          this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
                        }
                      });
                    }
                  );
                });
            }
            reader.readAsDataURL(file);
          } else {
            this.uploadFoto2 = -1;
          }

          if (foto3 !== undefined && (foto3 instanceof FileInput)) {
            this.uploadFoto3 = 0;
            const file: File = foto3.files[0];  
            const imageName: string = this.utilitarioService.addTimeToImageName(file.name);
            var reader = new FileReader();
            reader.onload = (event: any) => {
              const localUrl = event.target.result;
              this.imageCompress.compressFile(localUrl, orientation, 50, 60, 640, 640)
                .then((result) => {
                  const imageBlob = this.fileUploadServive.dataURItoBlob(result.split(',')[1]);
                  const uploadTask = this.fileUploadServive
                    .pushBlobToStorage(path, imageBlob, imageName, metadata)
                  uploadTask.on(
                    'state_changed', (snapshot) => { // Progreso de subida
                      this.uploadFoto3 = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    },
                    (error) => {
                      this.openSnackBar(error.message, "OK");
                      this.uploadFoto3 = -1;
                    },
                    () => { // Success
                      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        this.urlFoto3 = downloadURL;
                        this.tarea = { ...this.tarea, foto3: this.urlFoto3 }
                        this.fotosEnTarea = true;
                        this.formFotosOT.get('foto3').setValue(this.urlFoto3); // Para activar el subscriber.
                        this.uploadFoto3 = -1;
                        if (!this.fotosPorSubir) {  // Si no hay fotos por subir, cancelamos el loading.
                          this.store.dispatch(actions.stopLoading());
                          this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
                        }
                      });
                    }
                  );
                });
            }
            reader.readAsDataURL(file);
          } else {
            this.uploadFoto3 = -1;
          }

          if (foto4 !== undefined && (foto4 instanceof FileInput)) {
            this.uploadFoto4 = 0;
            const file: File = foto4.files[0];  
            const imageName: string = this.utilitarioService.addTimeToImageName(file.name);
            var reader = new FileReader();
            reader.onload = (event: any) => {
              const localUrl = event.target.result;
              this.imageCompress.compressFile(localUrl, orientation, 50, 60, 640, 640)
                .then((result) => {
                  const imageBlob = this.fileUploadServive.dataURItoBlob(result.split(',')[1]);
                  const uploadTask = this.fileUploadServive
                    .pushBlobToStorage(path, imageBlob, imageName, metadata)
                  uploadTask.on(
                    'state_changed', (snapshot) => { // Progreso de subida
                      this.uploadFoto4 = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    },
                    (error) => {
                      this.openSnackBar(error.message, "OK");
                      this.uploadFoto4 = -1;
                    },
                    () => { // Success
                      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        this.urlFoto4 = downloadURL;
                        this.tarea = { ...this.tarea, foto4: this.urlFoto4 }
                        this.fotosEnTarea = true;
                        this.formFotosOT.get('foto4').setValue(this.urlFoto4); // Para activar el subscriber.
                        this.uploadFoto4 = -1;
                        if (!this.fotosPorSubir) {  // Si no hay fotos por subir, cancelamos el loading.
                          this.store.dispatch(actions.stopLoading());
                          this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
                        }
                      });
                    }
                  );
                });
            }
            reader.readAsDataURL(file);
          } else {
            this.uploadFoto4 = -1;
          }

          if (foto5 !== undefined && (foto5 instanceof FileInput)) {
            this.uploadFoto5 = 0;
            const file: File = foto5.files[0];  
            const imageName: string = this.utilitarioService.addTimeToImageName(file.name);
            var reader = new FileReader();
            reader.onload = (event: any) => {
              const localUrl = event.target.result;
              this.imageCompress.compressFile(localUrl, orientation, 50, 60, 640, 640)
                .then((result) => {
                  const imageBlob = this.fileUploadServive.dataURItoBlob(result.split(',')[1]);
                  const uploadTask = this.fileUploadServive
                    .pushBlobToStorage(path, imageBlob, imageName, metadata)
                  uploadTask.on(
                    'state_changed', (snapshot) => { // Progreso de subida
                      this.uploadFoto5 = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    },
                    (error) => {
                      this.openSnackBar(error.message, "OK");
                      this.uploadFoto5 = -1;
                    },
                    () => { // Success
                      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        this.urlFoto5 = downloadURL;
                        this.tarea = { ...this.tarea, foto5: this.urlFoto5 }
                        this.fotosEnTarea = true;
                        this.formFotosOT.get('foto5').setValue(this.urlFoto5); // Para activar el subscriber.
                        this.uploadFoto5 = -1;
                        if (!this.fotosPorSubir) {  // Si no hay fotos por subir, cancelamos el loading.
                          this.store.dispatch(actions.stopLoading());
                          this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
                        }
                      });
                    }
                  );
                });
            }
            reader.readAsDataURL(file);
          } else {
            this.uploadFoto5 = -1;
          }

          if(this.uploadFoto1 === -1 
            && this.uploadFoto2 === -1
            && this.uploadFoto3 === -1
            && this.uploadFoto4 === -1
            && this.uploadFoto5 === -1){
              console.log('Sin fotos pendientes de guardar.');
            }

          if (!this.fotosPorSubir) {
            this.store.pipe(select('tarea'), take(2), skip(1)).subscribe(
              (state) => {
                if (state.updated) {
                  this.openSnackBar('Fotos registradas', 'OK');
                } else if (state.error) {
                  console.error('Error después de subir fotos.', state)
                  Swal.fire('Error en fotos', state.error?.error, 'error');
                }
              });
          }
        }

        break;

      case 'firmas':
        console.log('formFirmasOT.invalid  ', this.formFirmasOT.invalid);
        console.log('otFinalizada', this.otFinalizada);
        console.log(' this.editar',  this.editar, 'this.crear', this.crear, 'this.esChild', this.esChild);
        if (this.formFirmasOT.invalid || this.otFinalizada) { return; }

        if (this.crear || this.editar) {
          const { observaciones,
            aceptado_por_nombre, aceptado_por_rut, aceptado_por_cargo, aceptado_por_firma           
          } = this.formFirmasOT.getRawValue();

            this.store.pipe(select('tareas'), take(3)).subscribe(
              async (state) => {
                console.log('state ot', state);
                if(state.loaded){
                  const idParent = this.tareaParentId? this.tareaParentId : this.tareaId;
                  this.tareasChilds = state.tareas.filter( f => f.id_parent_wo === this.tareaParentId);
                  this.tareaParent = state.tareas.find( t => t.id === idParent);

                  let tareas: TareaOT[] = [];

                  this.tarea = {...this.tarea, 
                    observaciones: observaciones
                  , details_signature: aceptado_por_nombre
                  , aceptado_por_cargo: aceptado_por_cargo
                  , aceptado_por_rut: aceptado_por_rut
                  , signature: aceptado_por_firma};

                  this.tareaParent = {...this.tareaParent, 
                                observaciones: observaciones
                              , details_signature: aceptado_por_nombre
                              , aceptado_por_cargo: aceptado_por_cargo
                              , aceptado_por_rut: aceptado_por_rut
                              , signature: aceptado_por_firma};
                  tareas.push(this.tareaParent);

                  this.tareasChilds?.map( (task) => {
                    task = {...task
                             , observaciones: observaciones
                             , details_signature: aceptado_por_nombre
                             , aceptado_por_cargo: aceptado_por_cargo
                             , aceptado_por_rut: aceptado_por_rut
                             , signature: aceptado_por_firma };
                    tareas.push(task);                               
                  });

                  console.log('Prepando guardar tareas', tareas);
                  await this.tareasService.updateTareas(tareas).then ( _ => {
                    this.openSnackBar('Datos guardados', 'OK');
                    // this.refresh();
                  }).catch( err => {
                    Swal.fire('Error en firmas', err, 'error');
                  });                         
                  
                }      
              });
        
        } // end crear or editar

        break;   

        case 'finalizar':
        if (this.formTimerEndOT.invalid) { return; }

        break;

      default:
        this.openSnackBar('sin form especificado en switch.', 'OK');
    }
  }

  public scrollToTop(id: string) {
    this.pss.forEach(ps => {
      if(ps.elementRef.nativeElement.id == id){
        ps.scrollToTop(0,250);
      }
    });
  }

  public verificaFormularios(): boolean {
    if (this.formTareaOT.invalid
      || this.formTimerOT.invalid
      || this.formChechListGeneral.invalid
      || this.formFotosOT.invalid
      || this.formFirmasOT.invalid) {
      return false;
    }

    this.camposFaltantes = ''; // Reset

    // Chequeo de otras hojas
    if(this.tarea.id_status_work_order !== 3){

      if(this.tarea?.id_parent_wo !== null){ // Fusion
        const campo = this.queCamposFaltan(this.tareaParent);
        if(campo?.length > 0){
          this.camposFaltantes = 'OT '.concat(this.tareaParent.wo_folio,' falta: ', campo, '\n');
        }
        this.tareasChilds?.forEach( (tarea) => {
          let campos = this.queCamposFaltan(tarea);
          if(campos?.length > 0){
            this.camposFaltantes = 'OT '.concat(tarea.wo_folio,' falta: ', campos, '\n');
          }
        });
      } else {
        const campo = this.queCamposFaltan(this.tarea);
        if(campo?.length > 0){
          this.camposFaltantes = 'OT '.concat(this.tarea.wo_folio,' falta: ', campo, '\n');
        }
      }

      
      return (this.camposFaltantes?.length === 0);
    }

    return true;
  }

  public queCamposFaltan(tarea: TareaOT){
    const esMP = tarea.tasks_log_task_type_main? (tarea.tasks_log_task_type_main === Servicio.MANTENIMIENTO_PREVENTIVO): false;
    let queCampos: string = '';
    if(tarea.wo_folio === undefined || tarea.wo_folio?.length === 0) queCampos +=', '.concat('folio');
    if(tarea.creation_date === undefined || tarea.creation_date?.length === 0) queCampos +=', '.concat('fecha creación');
    if((tarea.items_log_description === undefined || tarea.items_log_description?.length === 0) && !esMP) queCampos +=', '.concat('equipo');
    if(tarea.tasks_log_task_type_main === undefined || tarea.tasks_log_task_type_main?.length === 0) queCampos +=', '.concat('servicio');
    if(tarea.priorities_description === undefined || tarea.priorities_description?.length === 0) queCampos +=', '.concat('prioridad');
    if(tarea.requested_by === undefined || tarea.requested_by?.length === 0) queCampos +=', '.concat('autor');
    if(tarea.description === undefined || tarea.description?.length === 0) queCampos +=', '.concat('antecedentes del llamado');
    if(tarea.cal_date_maintenance === undefined || tarea.cal_date_maintenance?.length === 0) queCampos +=', '.concat('fecha solicitud del servicio');
    if(tarea.cliente === undefined || tarea.cliente?.length === 0) queCampos +=', '.concat('cliente');
    if(tarea.local === undefined || tarea.local?.length === 0) queCampos +=', '.concat('local');
    // if(tarea.latitud === undefined || tarea.latitud?.length === 0) queCampos +=', '.concat('latitud');
    // if(tarea.longitud === undefined || tarea.longitud?.length === 0) queCampos +=', '.concat('longitud');
    // if(tarea.direccion === undefined || tarea.direccion?.length === 0) queCampos +=', '.concat('dirección');
    if((tarea.description_general === undefined || tarea.description_general?.length === 0) && !esMP) queCampos +=', '.concat('descripción gral. del trabajo');
    if((tarea.materiales === undefined || tarea.materiales?.length === 0) && !esMP) queCampos +=', '.concat('materiales');    
    if(tarea.observaciones === undefined || tarea.observaciones?.length === 0  && !esMP) queCampos +=', '.concat('observaciones');
    if(tarea.aceptado_por_rut === undefined || tarea.aceptado_por_rut?.length === 0) queCampos +=', '.concat('rut aprobador');
    if(tarea.aceptado_por_cargo === undefined || tarea.aceptado_por_cargo?.length === 0) queCampos +=', '.concat('aceptado_por_cargo?');
    if(tarea.id_assigned_user === undefined || tarea.id_assigned_user === 0) queCampos +=', '.concat('id técnico responsable');
    if(tarea.initial_date === undefined || tarea.initial_date?.length === 0) queCampos +=', '.concat('hora de inicio');
    if(tarea.signature === undefined || tarea.signature?.length === 0) queCampos +=', '.concat('firma cliente');
    if(tarea.personnel_description === undefined || tarea.personnel_description?.length === 0) queCampos +=', '.concat('personnel_description');
    if(tarea.details_signature === undefined || tarea.details_signature?.length === 0) queCampos +=', '.concat('nombre firmador');
    if((tarea.types_description === undefined || tarea.types_description?.length === 0) && !esMP) queCampos +=', '.concat('tipo de falla');
    if((tarea.causes_description === undefined || tarea.causes_description?.length === 0) && !esMP) queCampos +=', '.concat('causa de falla');
    if((tarea.detection_method_description === undefined || tarea.detection_method_description?.length === 0) && !esMP) queCampos +=', '.concat('método de detección');
    if((tarea.time_disruption === undefined || tarea.time_disruption?.length === 0) && !esMP) queCampos +=', '.concat('equipo detenido');
    if(tarea.time_disruption === 'Sí'){
            if((tarea.caused_disruption === undefined || tarea.caused_disruption?.length === 0)  && !esMP) queCampos +=', '.concat('motivo detección');
    }
    if((tarea.foto1 === undefined || tarea.foto1?.length === 0)  && !esMP) queCampos +=', '.concat('foto1');
    // if(tarea.id_parent_wo   === undefined) queCampos +=', '.concat('vínculo OT principal');    
    // if(tarea.id_status_work_order === 8){
    //   if(tarea.final_date === undefined || tarea.final_date?.length === 0) queCampos +=', '.concat('hora final');
    //   if(tarea.real_duration === undefined || tarea.real_duration?.length === 0) queCampos +=', '.concat('duración OT');
    // }
    
    return queCampos?.substring(1, queCampos.length);
  }

  async modalFaltanCampos(proceso?: string){
    console.log('modalFaltanCampos esMantencionPreventiva?', this.esMantencionPreventiva);
    let campos: String[] = [];
    if(this.esMantencionPreventiva){
      console.log('this.checklist', this.checklist);
      this.checklist?.forEach( (item) => {        
         item.checklist?.forEach( check => {
          if(!check.checklist || check.checklist === ''){
              const text = item.tipo + ", N° " + check.numero?.toString();
              campos.push(text);
          }
         });
         if(item.fotos.filter( f => f.url === '')?.length === 4){
              const text = item.tipo + ", foto";
              campos.push(text)
         }
         if(!item.observaciones || item.observaciones?.trim().length === 0){
              const text = item.tipo + ", observaciones";
              campos.push(text);
         }
      });
    }else{
        if(!this.tarea?.items_log_description || this.tarea?.items_log_description?.trim() === ''){
              campos.push("Equipo");
        }
        if(!this.tarea?.tasks_log_task_type_main || this.tarea?.tasks_log_task_type_main?.trim() === ''){
              campos.push("Tipo de servicio");
        }
        if(!this.tarea?.description_general || this.tarea?.description_general?.trim() === ''){
              campos.push("Descripción general del trabajo");
        }
        if(!this.tarea?.materiales || this.tarea?.materiales?.trim() === ''){
              campos.push("Materiales");
        }
        if(!this.tarea?.types_description || this.tarea?.types_description?.trim() === ''){
              campos.push("Tipo falla");
        }
        if(!this.tarea?.causes_description || this.tarea?.causes_description?.trim() === ''){
              campos.push("Causa falla");
        }
        if(!this.tarea?.detection_method_description || this.tarea?.detection_method_description?.trim() === ''){
              campos.push("Método detección");
        }
        if(!this.tarea?.foto1 || this.tarea?.foto1?.trim() === ''){
              campos.push("Al menos una foto.");
        }
        if(this.tarea?.time_disruption === 'Sí' && (!this.tarea?.caused_disruption || this.tarea?.caused_disruption === '')){
              campos.push("Motivo detención");
        }   
    }

    console.log('campos', campos);

    if(campos?.length === 0){
      if(proceso && proceso === 'parar'){
        this.pararOT();
      }else{
        this.openDialog();
      }
    }else{
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
      return (new Date()).toISOString();
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

    return '';
  }

  generarPathDeFotos(): string {
    let MyDate = new Date();
    const MyDateString = 'fotos/' + MyDate.getFullYear() + '/' +
      ('0' + (MyDate.getMonth() + 1)).slice(-2) + '/' +
      ('0' + MyDate.getDate()).slice(-2);

    return MyDateString.toString();
  }

  eliminarFoto(numero: number) {
    const foto = `foto${numero}`;
    let urlFoto: string = '';
    switch (numero) {
      case 1: urlFoto = this.tarea.foto1; break;
      case 2: urlFoto = this.tarea.foto2; break;
      case 3: urlFoto = this.tarea.foto3; break;
      case 4: urlFoto = this.tarea.foto4; break;
      case 5: urlFoto = this.tarea.foto5; break;
      default: // OK
    }

    this.fileUploadServive.deleteFileByURL(urlFoto)
      .then(() => {
        console.log(`Archivo de ${foto} borrado.`);
        this.setearFotoNull(numero);
        this.tareasService.updateTareas([this.tarea]);
        // this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
      })
      .catch(error => {
        console.error(error);
        switch (error.code) {
          case 'storage/object-not-found':
            // El objeto no existe, se debe limpiar del formulario
            this.openSnackBar(`No existe ningún objeto en ${foto}, se quitará para limpiar.`, "Ok");
            this.setearFotoNull(numero);
            // this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
            this.tareasService.updateTareas([this.tarea]);
            break;
          case 'storage/unauthorized':
            this.openSnackBar('No tiene permisos para obtener la ' + foto, "Ok");
            break;
          case 'storage/unknown':
            this.openSnackBar('Error desconocido, informe al administrador', 'Ok');
            break;
          case 'storage/quota-exceeded':
            this.openSnackBar('Quota de acceso excedida, informe al administrador', 'Ok');
            break;
          default: //OK
        }
      });
  }

  eliminarFotoDeCheckList(foto: Foto) {    
    //TODO:  Falta quitar la url del objeto checklist.
    this.fileUploadServive.deleteFileByURL(foto.url)
      .then(() => {
        foto.url = "";
        this.checklist.map( (check) => {            
              check.fotos.map( (f) => {
                  if(f.url === foto.url){
                    f.url = "";
                  }
              });            
        });
        this.tarea = {...this.tarea, checklist: JSON.stringify(this.checklist)}
        this.store.dispatch(actions.actualizarTareaOT({tareaOT: this.tarea})); 
      })
      .catch(error => {
        switch (error.code) {
          case 'storage/object-not-found':
            this.openSnackBar(`No existe ningún objeto en ${foto.url}, se quitará para limpiar.`, "Ok");
            foto.url = "";
            this.tarea = {...this.tarea, checklist: JSON.stringify(this.checklist)}
            this.store.dispatch(actions.actualizarTareaOT({tareaOT: this.tarea}));     
            break;
          case 'storage/unauthorized':
            this.openSnackBar('No tiene permisos para obtener la ' + foto, "Ok");
            break;
          case 'storage/unknown':
            this.openSnackBar('Error desconocido, informe al administrador', 'Ok');
            break;
          case 'storage/quota-exceeded':
            this.openSnackBar('Quota de acceso excedida, informe al administrador', 'Ok');
            break;
          default: //OK
        }
      });
  }

  // Para cuando la imagen se redimenciona, se agrega este método como parche.
  repararLink(numero: number) {
    const foto = `foto${numero}`;
    let urlFoto: string = '';
    switch (numero) {
      case 1:
        urlFoto = decodeURIComponent(this.tarea.foto1);
        urlFoto = urlFoto.slice(75, urlFoto.indexOf('?'));
        break;

      case 2:
        urlFoto = decodeURIComponent(this.tarea.foto2);
        urlFoto = urlFoto.slice(75, urlFoto.indexOf('?'));
        break;

      case 3:
        urlFoto = decodeURIComponent(this.tarea.foto3);
        urlFoto = urlFoto.slice(75, urlFoto.indexOf('?'));
        break;

      case 4:
        urlFoto = decodeURIComponent(this.tarea.foto4);
        urlFoto = urlFoto.slice(75, urlFoto.indexOf('?'));
        break;

      case 5:
        urlFoto = decodeURIComponent(this.tarea.foto5);
        urlFoto = urlFoto.slice(75, urlFoto.indexOf('?'));
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
      path = fileName.split("").reverse().join("").concat('_1024x1024.', extension);
    } else {
      path = fileName.split("").reverse().join("").concat('.', extension);
    }

    console.log('Buscando la referencia en: ', path);
    this.fileUploadServive.getURLByReference(path)
      .then((url) => {
        console.log('Nueva URL Generada: ', url);
        // Se actualiza la URL
        this.setearFotoConNuevaURL(numero, url)
        this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
      })
      .catch((error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/object-not-found':
            // File doesn't exist
            break;
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;

          // ...

          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
        }
      });
  }

  repararLinkFotoCheckList(foto: Foto) {
    let urlFoto = decodeURIComponent(foto.url);
        urlFoto = urlFoto.slice(75, urlFoto.indexOf('?'));       
        urlFoto = urlFoto.split("").reverse().join("");     // Reverse
    let extension = urlFoto.slice(0, urlFoto.indexOf("."));
        extension = extension.split("").reverse().join(""); // Extension
    let fileName = urlFoto.slice(urlFoto.indexOf(".") + 1, urlFoto.length);
    // Generación del Path del archivo reducido 1024x1024
    let path = fileName.split("").reverse().join("");
    // Verificando si ya cuenta con el literal _1024x1024
    if (path.indexOf("_1024x1024") == -1) {
      path = fileName.split("").reverse().join("").concat('_1024x1024.', extension);
    } else {
      path = fileName.split("").reverse().join("").concat('.', extension);
    }

    console.log('Buscando la referencia en: ', path);
    this.fileUploadServive.getURLByReference(path)
      .then((url) => {       
        // Se actualiza la URL
        foto.url = url;
        this.tarea = {...this.tarea, checklist: JSON.stringify(this.checklist)}
        this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
      })
      .catch((error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/object-not-found':
            // File doesn't exist
            break;
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;
          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
        }
      });
  }

  async comprimirFoto(numero: number) {
    const foto = `foto${numero}`;
    let urlFoto: string = '';
    let fullUrl: string = '';
    switch (numero) {
      case 1:
        fullUrl = decodeURIComponent(this.tarea.foto1);
        urlFoto = fullUrl.slice(75, fullUrl.indexOf('?'));
        fullUrl = this.tarea.foto1;
        break;

      case 2:
        fullUrl = decodeURIComponent(this.tarea.foto2);
        urlFoto = fullUrl.slice(75, fullUrl.indexOf('?'));
        fullUrl = this.tarea.foto2;
        break;

      case 3:
        fullUrl = decodeURIComponent(this.tarea.foto3);
        urlFoto = fullUrl.slice(75, fullUrl.indexOf('?'));
        fullUrl = this.tarea.foto3;
        break;

      case 4:
        fullUrl = decodeURIComponent(this.tarea.foto4);
        urlFoto = fullUrl.slice(75, fullUrl.indexOf('?'));
        fullUrl = this.tarea.foto4;
        break;

      case 5:
        fullUrl = decodeURIComponent(this.tarea.foto5);
        urlFoto = fullUrl.slice(75, fullUrl.indexOf('?'));
        fullUrl = this.tarea.foto5;
        break;

      default: // OK
    }
   
    console.log('Comprimiendo foto: ', urlFoto);
    const response = await fetch(fullUrl);   // here image is url/location of image
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type });
    const orientation = -1;
    const metadata = { resizedImage: 'true' };
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const localUrl = event.target.result;
      this.imageCompress.compressFile(localUrl, orientation, 50, 60, 640, 640)
        .then((result) => {
          const imageBlob = this.fileUploadServive.dataURItoBlob(result.split(',')[1]);
          const uploadTask = this.fileUploadServive
            .pushBlobToStorageFullPath(urlFoto, imageBlob, metadata)
          uploadTask.on(
            'state_changed', (snapshot) => { // Progreso de subida
              // this.uploadFoto2 = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            },
            (error) => {
              this.openSnackBar(error.message, "OK");
            },
            () => { // Success
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                switch (numero) {
                  case 1: this.tarea = { ...this.tarea, foto1: downloadURL }; this.sizeFoto1 = imageBlob.size; break;
                  case 2: this.tarea = { ...this.tarea, foto2: downloadURL }; this.sizeFoto2 = imageBlob.size; break;
                  case 3: this.tarea = { ...this.tarea, foto3: downloadURL }; this.sizeFoto3 = imageBlob.size; break;
                  case 4: this.tarea = { ...this.tarea, foto4: downloadURL }; this.sizeFoto4 = imageBlob.size; break;
                  case 5: this.tarea = { ...this.tarea, foto5: downloadURL }; this.sizeFoto5 = imageBlob.size; break;
                }
                this.openSnackBar(foto + " comprimida", "OK");              
                this.store.dispatch(actions.actualizarTareaOT({ tareaOT: this.tarea }));
              });
            }
          );
        }).catch(err => console.error('no se pudo comprimir', err));
    }
    reader.readAsDataURL(file);
    
  }

  checkNameFotoNotInclude1024(numero: number) {
    const foto = `foto${numero}`;
    let urlFoto: string = '';
    switch (numero) {
      case 1: urlFoto = this.tarea.foto1; break;
      case 2: urlFoto = this.tarea.foto2; break;
      case 3: urlFoto = this.tarea.foto3; break;
      case 4: urlFoto = this.tarea.foto4; break;
      case 5: urlFoto = this.tarea.foto5; break;
      default: // OK
    }

    return (urlFoto)? (urlFoto.indexOf("1024x1024") === -1) : false;
  }

  setearFotoNull(numero: number) {
    switch (numero) {
      case 1:
        this.tarea = {...this.tarea, foto1: undefined};
        this.urlFoto1 = undefined;
        break;
      case 2:
        this.tarea = {...this.tarea, foto2: undefined};
        this.urlFoto2 = undefined;
        break;
      case 3:
        this.tarea = {...this.tarea, foto3: undefined};
        this.urlFoto3 = undefined;
        break;
      case 4:
        this.tarea = {...this.tarea, foto4: undefined};
        this.urlFoto4 = undefined;
        break;
      case 5:
        this.tarea = {...this.tarea, foto5: undefined};
        this.urlFoto5 = undefined;
        break;
      default: // OK
    }
  }

  setearFotoConNuevaURL(numero: number, url: string) {
    switch (numero) {
      case 1:
        this.tarea = { ...this.tarea, foto1: url }
        this.urlFoto1 = url;
        break;
      case 2:
        this.tarea = { ...this.tarea, foto2: url }
        this.urlFoto2 = url;
        break;
      case 3:
        this.tarea = { ...this.tarea, foto3: url }
        this.urlFoto3 = url;
        break;
      case 4:
        this.tarea = { ...this.tarea, foto4: url }
        this.urlFoto4 = url;
        break;
      case 5:
        this.tarea = { ...this.tarea, foto5: url }
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
    this.dialog.open(DetalleOtDialogFirma, {
      width: '300px'
    }).afterClosed().pipe(
      filter(data => data != null)
    ).subscribe(({ data }) => {
      console.log('firma => ', data);
      if(data){
        this.formFirmasOT.get("aceptado_por_firma").setValue(data);
        this.existeFirmaAprobada = true;
      }else{
        this.existeFirmaAprobada = false;
      }
    })
  }

  openDialogRegistrarOpcion(titulo: string): void {
    this.tituloCombo = titulo;
    let opciones: any = { titulo: this.tituloCombo, opcion: this.opcionCombo };

    switch(titulo){
      case 'local': {
        opciones = {...opciones, 
                      uid: this.cliente,                      
                      vector: this.locales};
        break;
      }
      case 'tipoFalla': {
        opciones = {...opciones, vector: this.tipoFallas};
        break;
      }
      case 'causaFalla': {
        opciones = {...opciones, vector: this.causaFallas};
        break;
      }
      case 'motivo': {
        opciones = {...opciones, vector: this.motivosDetencion};
        break;
      }
      case 'metodoDeteccion': {
        opciones = {...opciones, vector: this.metodosDeteccion};
        break;
      }
      case 'equipo': {
        opciones = {...opciones, 
                      uid: this.cliente, 
                      codigoLocal: this.local.codigo,
                      vector: this.equipos};
        break;
      }
    }    

    const dialogRef = this.dialog.open(DetalleOtDialogRegistrar, {
      width: '300px',
      data: opciones,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('resultado modal: ', result);
      this.opcionCombo = result;
      this.asignarOpcionFormGroup(titulo);
    });
  }

  asignarOpcionFormGroup(titulo: string) {

    if (this.opcionCombo) {
      switch (titulo) {
        case 'local':
          const local: Local = JSON.parse(this.opcionCombo);
          this.formTareaOT.get('local').setValue(local);
          this.store.dispatch(actions.cargarLocales({uid: this.cliente}));
          break;
        case 'tipoFalla':
          const tipoFalla: TipoFalla = JSON.parse(this.opcionCombo);
          this.formChechListGeneral.get('tipoFalla').setValue(tipoFalla);
          this.store.dispatch(actions.cargarTipoFalla());
          break;
        case 'causaFalla':
          const causaFalla: CausaFalla = JSON.parse(this.opcionCombo);
          this.formChechListGeneral.get('causaFalla').setValue(causaFalla);
          this.store.dispatch(actions.cargarCausaFalla());
          break;
        case 'motivo':
          const lista: Lista = JSON.parse(this.opcionCombo);
          this.formChechListGeneral.get('motivoDetencion').setValue(lista);
          this.store.dispatch(actions.cargarMotivoDetencion());
          break;
        case 'equipo':
          const equipo: Equipo = JSON.parse(this.opcionCombo);
          this.formTareaOT.get('equipo')?.setValue(equipo);
          this.store.dispatch(actions.cargarEquipos({uid: this.cliente, codigolocal: this.local?.codigo}));
          break;
        case 'metodoDeteccion':
          const metodo: MetodoDeteccion = JSON.parse(this.opcionCombo);
          this.formChechListGeneral.get('metodoDeteccionFalla').setValue(metodo);
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
      (this.uploadFoto1 == -1
        && this.uploadFoto2 == -1
        && this.uploadFoto3 == -1
        && this.uploadFoto4 == -1
        && this.uploadFoto5 == -1);
    if (!uploads) {
      this.mensajeSubirArchivo = 'Espere...';
    } else {
      this.mensajeSubirArchivo = 'Subir archivos';
    }
    return uploads;
  }

  existsArchivosPorSubirEnChecklist(): boolean {
    const uploads: boolean = (this.uploadFotoChecklist == -1);
    if (!uploads) {
      this.mensajeSubirArchivoChecklist = 'Espere...';
    } else {
      this.mensajeSubirArchivoChecklist = 'Subir archivos';
    }
    return uploads;
  }

  /**
   * Deshabilita todos los controles de los formularios.
   */
  desactivarTodosLosControles(){
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

  recargarListado(tipo){
    switch(tipo){
      case 'equipo': {
        if(this.local && !this.local.codigo){
          this.store.dispatch(actions.cargarLocales({ uid: this.cliente }));
          this.store.select('locales').pipe(take(2), skip(1))
                    .subscribe( (state) => {
                        if(state?.loaded){
                          const buscar = this.local.nombre;
                          const ceco = buscar?.substring(buscar.indexOf("CECO:") + 6, buscar.length - 1);
                          this.locales = state.locales;
                          this.local = state.locales.find( l => l.ceco === ceco);                        
                        }
                    });          
        }
        this.store.dispatch(actions.cargarEquipos({ uid: this.cliente, codigolocal: this.local.codigo }))
        this.store.select("equipos").pipe(take(2), skip(1))
                  .subscribe((state) => {
                    if(state?.loaded){
                      this.equipos = state.equipos.filter(equipo => equipo.codigolocal === this.local.codigo)
                      .map((equipo) => ({ ...equipo, nombre: `${equipo.nombre} ${equipo.otro ? '- ' + equipo.otro : ''} { ${equipo.codigo} }` }));
                    }        
                  });
        break;
      }
    }
  }

  subirYGuardarCambios(){       
    this.onSubmit('general');
    // scroll to selected step
    const stepId = this.stepper._getStepLabelId(this.stepper.selectedIndex);
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
      setTimeout(() => {
        stepElement.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
      }, 250);
    }
  }
}

// -----------------------------------------------------------------------

@Component({
  selector: 'detalle-ot-dialog-firma',
  templateUrl: 'detalle-ot-dialog-firma.html',
})
export class DetalleOtDialogFirma {
  @ViewChild('signature')
  public signaturePad: SignaturePadComponent;
  public firmaBase64: string;
  constructor(public dialogRef: MatDialogRef<DetalleOtDialogFirma>,
              public utilitarioService: UtilitarioService) { }

  // Configuración de firma canvas:
  public signaturePadOptions: NgSignaturePadOptions = { // passed through to szimek/signature_pad constructor
    minWidth: 0.5,
    canvasWidth: 300,
    canvasHeight: 150,
    backgroundColor: "#fff",
    dotSize: 0.5
  };

  ngAfterViewInit(): void {
    this.signaturePad.set('minWidth', 0.5); // set szimek/signature_pad options at runtime
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  }

  /**
 * Notifica que la firma inició
 * @param event
 */
  drawStart(event: MouseEvent | Touch) {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('Start drawing', event);
  }

  downloadSignature(dataURL: any, nombreArchivo: string) {
    if (navigator.userAgent.indexOf('Safari') > -1
      && navigator.userAgent.indexOf('Chrome') === -1) {
      window.open(dataURL);
    } else {
      const blob = this.URLtoBlob(dataURL);
    }
  }

  /** Convierte el dato URL del canvas, en un texto de base64 */
  URLtoBlob(dataURL: any) {
    const partes = dataURL.split(';base64');
    const contentType = partes[0].split(':')[1];
    const raw = window.atob(partes[1]);
    const rawL = raw.length;
    const array = new Uint8Array(rawL);
    for (let i = 0; i < rawL; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return new Blob([array], { type: contentType });
  }

  save() {
    if(this.utilitarioService.checkSignatureWhite(
      this.signaturePad.toDataURL()
     )){
      this.dialogRef.close({ data: this.signaturePad.toDataURL() });
    } else {
      Swal.fire('Firma vacía', 'No se detectó firma en el cuadro, limpie y firme de nuevo.', 'error');
    }
  }

  cancel(){
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
  selector: 'detalle-ot-dialog-registrar',
  templateUrl: 'detalle-ot-dialog-registrar.html',
  styles: ['.mat-form-field { display: inline !important; }']
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
    switch(this.data.titulo){
      case 'local':
                    this.local = new Local('', '', 'Santiago', '', '', '0', '0');
                    this.titulo = "Local";
                    break;
      case 'tipoFalla':
                    const nuevaTipoFalla: TipoFalla = {
                      id: (Date.parse((new Date()).toString()) - 1600000000000),
                      id_company: 2346,
                      description: '',
                      enabled: true
                    };
                    this.tipoFalla = nuevaTipoFalla;
                    this.titulo = "Tipo de Falla";
                    break;
      case 'causaFalla':
                    const nuevaCausaFalla: CausaFalla = {
                      id: (Date.parse((new Date()).toString()) - 1600000000000),
                      id_company: 2346,
                      description: '',
                      enabled: true
                    };
                    this.causaFalla = nuevaCausaFalla;
                    this.titulo = "Causa de Falla";
                    break;
      case 'equipo':
                    this.equipo = new Equipo('', '', '', this.data?.codigoLocal);
                    this.titulo = "Equipo";
                    break;
      case 'motivo':
                    const nuevoMotivo: Lista = {
                      nombre: this.data.opcion?.trim()
                    };
                    this.opcion = nuevoMotivo;
                    this.titulo = "Motivo Detención";
                    break;
      case 'metodoDeteccion':
                    const nuevoMetodo: MetodoDeteccion = {
                      id: (Date.parse((new Date()).toString()) - 1600000000000),
                      id_company: 2346,
                      description: '',
                      enabled: true
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
        case 'local': {
          this.local.codigo = this.local.codigo?.trim();
          this.local.nombre = this.local.nombre?.trim();
          this.local.ciudad = this.local.ciudad?.trim();
          this.store.dispatch(actions.insertarLocal({uid: this.data.uid, local: this.local}));
          this.data.opcion = JSON.stringify(this.local);
          break;
        }
        case 'tipoFalla': {
          this.tipoFalla.description = this.tipoFalla.description.trim();          
          this.store.dispatch(actions.insertarTipoFalla({tipoFalla: this.tipoFalla }));
          this.data.opcion = JSON.stringify(this.tipoFalla);
          break;
        }
        case 'causaFalla': {  
          this.causaFalla.description = this.causaFalla.description.trim();
          this.store.dispatch(actions.insertarCausaFalla({causaFalla: this.causaFalla }));
          this.data.opcion = JSON.stringify(this.causaFalla);
          break;
        }
        case 'motivo': {
          this.opcion.nombre = this.opcion.nombre.trim();
          this.store.dispatch(actions.insertarMotivoDetencion({motivoDetencion: this.opcion }));
          this.data.opcion = JSON.stringify(this.opcion);
          break;
        }
        case 'metodoDeteccion': {
          this.metodoDeteccion.description = this.metodoDeteccion.description.trim();
          this.store.dispatch(actions.insertarMetodoDeteccion({metodoDeteccion: this.metodoDeteccion}));
          this.data.opcion = JSON.stringify(this.metodoDeteccion);
          break;
        }
        case 'equipo': {
          this.equipo.codigo = this.equipo.codigo?.trim();
          this.equipo.nombre = this.equipo.nombre?.trim();
          this.equipo.tipo = this.equipo.tipo?.toUpperCase()?.trim();
          this.store.dispatch(actions.insertarEquipo({uid: this.data.uid, equipo: this.equipo}));
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
      case 'local': {
        const buscarCodigo = this.local.codigo?.toLocaleLowerCase().trim();
        const buscarNombre = this.local.nombre?.toLocaleLowerCase().trim();
        existe = this.data.vector
                .filter( local => local.codigo?.toLocaleLowerCase().trim() === buscarCodigo
                                && local.nombre?.toLocaleLowerCase().trim() === buscarNombre)?.length > 0;
       break;
      }
      case 'tipoFalla': {
        const buscar = this.tipoFalla.description?.toLocaleLowerCase().trim();
        existe = this.data.vector
                .filter( falla => falla.description?.toLocaleLowerCase().trim() === buscar)?.length > 0;        
        break;
      }
      case 'causaFalla': {  
        const buscar = this.causaFalla.description?.toLocaleLowerCase().trim();
        existe = this.data.vector
                .filter( causa => causa.description?.toLocaleLowerCase().trim() === buscar)?.length > 0;  
        break;
      }
      case 'motivo': {
        const buscar = this.opcion?.nombre?.toLocaleLowerCase().trim();
        existe = this.data.vector
                .filter( motivo => motivo.nombre?.toLocaleLowerCase().trim() === buscar)?.length > 0;  
        break;
      }
      case 'metodoDeteccion': {
        const buscar = this.metodoDeteccion?.description?.toLocaleLowerCase().trim();
        existe = this.data.vector
                .filter( metodo => metodo.description?.toLocaleLowerCase().trim() === buscar)?.length > 0;
        break;
      }
      case 'equipo': {
         const buscarCodigo = this.equipo.codigo?.toLocaleLowerCase().trim();
         const buscarNombre = this.equipo.nombre?.toLocaleLowerCase().trim();
         existe = this.data.vector
                 .filter( equipo => equipo.codigo?.toLocaleLowerCase().trim() === buscarCodigo
                                 && equipo.nombre?.toLocaleLowerCase().trim() === buscarNombre)?.length > 0;
        break;
      }
      default:
      //OK
    }
    return existe;
  }
}

@Component({
  selector: 'detalle-ot-dialog-msg',
  templateUrl: 'detalle-ot-dialog-msg.html',
})
export class DetalleOtDialogMsg {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}