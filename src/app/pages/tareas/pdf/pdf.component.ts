import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { getDownloadURL, getStorage, ref } from "@angular/fire/storage";
import { Store, select } from "@ngrx/store";
import { Servicio, TareaOT } from "app/models/tarea-ot.model";
import { Usuario } from "app/models/usuario.model";
import { AppState } from "app/store/app.reducers";

import { CheckList } from "app/models/checklist.model";
import { TareasService } from "app/services/tareas.service";
import { UsuariosService } from "app/services/usuarios.service";
import * as moment from "moment";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Subject, takeUntil } from "rxjs";
import Swal from "sweetalert2";
import { AuthService } from "../../../services/auth.service";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: "app-pdf",
  templateUrl: "./pdf.component.html",
  styleUrls: ["./pdf.component.scss"],
})
export class PdfComponent implements OnInit, OnDestroy {
  @Input() tareaId: number;
  @Input() vieneDe: string;
  private destroy$ = new Subject<void>();
  tarea: any;
  tareasChilds: TareaOT[] = [];
  usuarios: Usuario[] = [];
  imagenVacia: string =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5gcNDjAzJossHQAAAERJREFUWIXtzjEBwCAQALFS/54fCQw3wJAoyJqZ72X/7cCJYCVYCVaClWAlWAlWgpVgJVgJVoKVYCVYCVaClWAlWAlWGzKXA01428bXAAAAAElFTkSuQmCC";
  validador: Usuario;
  ejecutor: Usuario;
  urlFirmaValidador: string = "";
  urlFirmaEjecutor: string = "";
  botonPDF: string = "Crear PDF";
  botonAnular: string = "Anular OT";
  botonActivo: boolean = true;
  botonActivoAnular: boolean = true;
  constructor(
    private store: Store<AppState>,
    private usuariosService: UsuariosService,
    private tareaService: TareasService,
    private authService: AuthService
  ) {
    this.store
      .pipe(select("usuarios"), takeUntil(this.destroy$))
      .subscribe((state) => {
        this.usuarios = state.usuarios;
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async buscarDatosDelEjecutor() {
    if (this.tarea && this.tarea.id_assigned_user !== undefined) {
      console.log(
        "Preparando buscar datos del usuario PERSON_ID: #",
        this.tarea.id_user_assigned
      );
      this.ejecutor = await this.usuariosService.getUsuarioByPersonId(
        this.tarea.id_user_assigned
      );
    } else {
      console.log("La tarea no tiene un id_assigned_user");
    }
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

  getEstado() {
    let estado: string = "";
    if (this.tarea?.id_status_work_order) {
      switch (this.tarea?.id_status_work_order) {
        case 1:
          estado = "En Proceso";
          break;
        case 2:
          estado = "En Revisión";
          break;
        case 3:
          estado = "Finalizadas";
          break;
        case 4:
          estado = "Cancelado";
          break;
        case 5:
          estado = "Pendiente";
          break;
        case 6:
          estado = "Técnico asignado";
          break;
        case 7:
          estado = "Por asignar técnico";
          break;
        case 8:
          estado = "Por revisar";
          break;
      }
    }

    return estado;
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

  // id_assigned_user
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

  showAnular() {
    return (
      (this.authService.esAdministrador || this.authService.esPersonalized) &&
      this.tarea?.id_status_work_order !== 9 &&
      this.tarea?.id_status_work_order !== 3 &&
      (!this.tareasChilds ||
        this.tareasChilds.length === 0 ||
        this.tareasChilds.filter(
          (f) => f.id_status_work_order !== 3 && f.id_status_work_order !== 9
        )?.length > 0)
    );
  }

  async anularOT() {
    this.botonActivoAnular = false;
    // Obtenemos los últimos registros del STORE
    if (this.vieneDe && this.vieneDe === "pages") {
      this.store.select("tarea").subscribe((state) => {
        if (state.loaded) {
          this.tarea = state.tareaOT;
          this.tareasChilds = state.tareaOTChilds;
        }
      });
    } else {
      this.store.select("tareas").subscribe((state) => {
        if (state.loaded) {
          this.tarea = state.reporte.filter((t) => t.id === this.tareaId)[0];
          this.tareasChilds = state.reporte
            .filter((t) => t.id_parent_wo == this.tareaId)
            .sort((a, b) => a.id - b.id);
        }
      });
    }

    this.botonAnular = "Anulando...";
    setTimeout(() => {
      let tasks: TareaOT[] = [];
      this.tarea = { ...this.tarea, id_status_work_order: 9 };
      this.tareasChilds?.map((tarea) => {
        tarea = { ...tarea, id_status_work_order: 9 };
      });

      tasks.push(this.tarea);
      this.tareasChilds?.forEach((tarea) => {
        tasks.push(tarea);
      });
      this.tareaService.updateTareas(tasks).then((_) => {
        Swal.fire("¡Anulados!", "Las tareas fueron anuladas.", "success");
      });
    }, 500);
  }

  /**
   * Método principal para crear el archivo PDF de la OT.
   */
  async createPDF() {
    await this.obtenerDatosTarea();

    this.botonActivo = false;
    this.botonPDF = "Espere...";

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

  private async actualizarTarea(): Promise<void> {
    const data = await this.tareaService.getTareaOtByFolio(this.tarea);
    console.log("****", data[0]);
    this.tarea = { ...data[0] };
  }
  /**
   * Método que crea la estructura del PDF y le carga los datos
   */
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
          const pdf = pdfMake.createPdf(pdfDefinition);
          pdf.download("OT_".concat(this.tarea.wo_folio, ".pdf"));

          this.botonActivo = true;
          this.botonPDF = "Crear PDF";
        }, 800);
      }
    });
  }

  async generarContenidoStandar() {
    let horaInicio: string = "";
    let horaTermino: string = "";
    let duracion: string = "";
    let fechaSolicitud: string = "";

    if (this.tarea?.initial_date) {
      horaInicio = this.tarea.initial_date;
    }
    if (this.tarea?.final_date) {
      horaTermino = this.tarea.final_date;
    }
    if (this.tarea?.real_duration) {
      duracion = moment
        .utc(Number(this.tarea.real_duration))
        .format("HH:mm:ss");
    } else if (horaInicio && horaTermino) {
      const startTime = moment(horaInicio);
      const endTime = moment(horaTermino);
      duracion = moment.utc(endTime.diff(startTime)).format("HH:mm:ss");
    }
    if (this.tarea?.cal_date_maintenance) {
      fechaSolicitud = moment
        .utc(this.tarea.cal_date_maintenance)
        .local()
        .format("DD/MM/YYYY HH:mm:ss");
    }

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
              text: "ORDEN DE TRABAJO EN TERRENO",
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
                  { text: this.tarea.wo_folio?.toString(), fontSize: 11 },
                ],
                style: "margenFolio",
              },
              {
                text: [
                  { text: "FECHA: ", style: "bold10" },
                  {
                    text: this.tarea.initial_date
                      ? moment
                          .utc(this.tarea.initial_date)
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
                        text: moment.utc(horaInicio).local().format("HH:mm:ss"),
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
                        text: moment
                          .utc(horaTermino)
                          .local()
                          .format("HH:mm:ss"),
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
            {
              text: this.tarea.cliente?.toString(),
              colSpan: 2,
              style: "altoDesc",
            },
            "",
          ],
          [
            { text: "LOCAL:" },
            {
              text: this.tarea.local?.toString(),
              colSpan: 2,
              style: "altoDesc",
            },
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
              text: this.tarea.items_log_description,
              colSpan: 2,
              style: "altoDesc",
            },
            "",
          ],
          [
            { text: "TIPO DE SERVICIO:" },
            {
              text: this.tarea.tasks_log_task_type_main,
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
            { text: this.tarea.requested_by, colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "TÉCNICO EJECUTANTE DEL SERVICIO:" },
            {
              text: this.tarea.personnel_description,
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
            { text: this.tarea.description, colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "UBICACIÓN GEOGRÁFICA GPS: \n\n\n", alignment: "center" },
            { text: this.tarea.direccion, colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            {
              text: "DESCRIPCIÓN GENERAL DEL TRABAJO:\n\n\n",
              alignment: "center",
            },
            {
              text: this.tarea.description_general,
              colSpan: 2,
              style: "altoDesc",
            },
            "",
          ],
          [
            { text: "MATERIALES UTILIZADOS:\n\n\n", alignment: "center" },
            { text: this.tarea.materiales, colSpan: 2, style: "altoDesc" },
            "",
          ],
          [
            { text: "TIPO DE FALLA:" },
            {
              text: this.tarea.types_description?.toString(),
              colSpan: 2,
              style: "altoDesc",
            },
            "",
          ],
          [
            { text: "CAUSA DE LA FALLA:" },
            {
              text: this.tarea.causes_description?.toString(),
              colSpan: 2,
              style: "altoDesc",
            },
            "",
          ],
          [
            { text: "MÉTODO DE DETECCIÓN DE FALLA" },
            {
              text: this.tarea.detection_method_description?.toString(),
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
              text: this.tarea.caused_disruption?.toString(),
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
                      image: await this.getBase64ImageFromURL(this.tarea.foto1),
                      width: this.tarea.foto1 ? 245 : 30,
                      height: this.tarea.foto1 ? 200 : 1,
                      alignment: "center",
                    },
                    {
                      image: await this.getBase64ImageFromURL(this.tarea.foto2),
                      width: this.tarea.foto2 ? 245 : 30,
                      height: this.tarea.foto2 ? 210 : 1,
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
                      image: await this.getBase64ImageFromURL(this.tarea.foto3),
                      width: this.tarea.foto3 ? 245 : 30,
                      height: this.tarea.foto3 ? 210 : 1,
                      alignment: "center",
                    },
                    {
                      image: await this.getBase64ImageFromURL(this.tarea.foto4),
                      width: this.tarea.foto4 ? 245 : 30,
                      height: this.tarea.foto4 ? 210 : 1,
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
                      image: await this.getBase64ImageFromURL(this.tarea.foto5),
                      width: this.tarea.foto5 ? 245 : 30,
                      height: this.tarea.foto5 ? 210 : 1,
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
              text: " ",
              fontSize: 8,
              border: [false, false, false, false],
            },
          ],

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
              text: this.tarea.observaciones
                ? this.tarea.observaciones.toString()
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

  // ------------------------------------------------------ Mantenciones Preventivas
  /**
   * Método que crea la estructura del PDF y le carga los datos
   */
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
              logo: "data:image/jpeg;base64,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",
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

          this.botonActivo = true;
          this.botonPDF = "Crear PDF";
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

  async generarContenidoFotografias(tarea: TareaOT) {
    return {
      style: "tablaPrincipal",
      table: {
        widths: [150, "*", 165],
        body: [
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
                      image: await this.getBase64ImageFromURL(tarea.foto1),
                      width: tarea.foto1 ? 244 : 30,
                      height: tarea.foto1 ? 200 : 1,
                      alignment: "center",
                    },
                    {
                      image: await this.getBase64ImageFromURL(tarea.foto2),
                      width: tarea.foto2 ? 244 : 30,
                      height: tarea.foto2 ? 200 : 1,
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
                      image: await this.getBase64ImageFromURL(tarea.foto3),
                      width: tarea.foto3 ? 244 : 30,
                      height: tarea.foto3 ? 200 : 1,
                      alignment: "center",
                    },
                    {
                      image: await this.getBase64ImageFromURL(tarea.foto4),
                      width: tarea.foto4 ? 244 : 30,
                      height: tarea.foto4 ? 200 : 1,
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
                      image: await this.getBase64ImageFromURL(tarea.foto5),
                      width: tarea.foto5 ? 244 : 30,
                      height: tarea.foto5 ? 200 : 1,
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
}
