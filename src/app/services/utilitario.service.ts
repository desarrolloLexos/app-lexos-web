import { Injectable } from '@angular/core';
import { TareaOT } from 'app/models/tarea-ot.model';

@Injectable({
  providedIn: 'root'
})
export class UtilitarioService {

  constructor() { }

  // Verifica si la firma está vacía
  public checkSignatureWhite(imagen: string): boolean {
    const signatureWhite: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGhJREFUeF7t1IEJADAMAsF2/6EtdIuHywRyBu+2HUeAAIGAwDVYgZZEJEDgCxgsj0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIg8ACBlFZdWYR+vQAAAABJRU5ErkJggg==';
    if(imagen?.length > 0 && imagen !== signatureWhite){
      return true;
    }
    return false;
  }

  /**
   * Chequea si el encabezado de la Orden de Trabajo fue intervenida.
   * @param tarea Orden de trabajo ingresada o editada
   * @param tareaClone Orden de trabajo de comparación.
   * @returns 
   */
  public checkModificEncabezado(tarea: TareaOT, tareaClone: TareaOT): boolean {
    // console.log('tarea.cliente === tareaClone.cliente', (tarea.cliente === tareaClone.cliente));
    // console.log('tarea.local === tareaClone.local', ( tarea.local === tareaClone.local));
    // console.log('tarea.items_log_description === tareaClone.items_log_description', ( tarea.items_log_description === tareaClone.items_log_description));
    // console.log('tarea.tasks_log_task_type_main === tareaClone.tasks_log_task_type_main', (tarea.tasks_log_task_type_main === tareaClone.tasks_log_task_type_main));
    // console.log('tarea.priorities_description === tareaClone.priorities_description', (tarea.priorities_description === tareaClone.priorities_description ));
    // console.log('tarea.requested_by === tareaClone.requested_by', (tarea.requested_by === tareaClone.requested_by));
    // console.log('tarea.description === tareaClone.description', (tarea.description === tareaClone.description));
    // console.log('tarea.id_assigned_user === tareaClone.id_assigned_user', (tarea.id_assigned_user === tareaClone.id_assigned_user));
    // console.log('tarea.id_status_work_order === tareaClone.id_status_work_order', (tarea.id_status_work_order === tareaClone.id_status_work_order));
    // console.log('tarea.cal_date_maintenance === tareaClone.cal_date_maintenance', (tarea.cal_date_maintenance === tareaClone.cal_date_maintenance));
    // console.log('tarea.personnel_description === tareaClone.personnel_description', (tarea.personnel_description === tareaClone.personnel_description));
    if(tarea.cliente === tareaClone.cliente              // Cliente
      && tarea.local === tareaClone.local                // Local
      && tarea.items_log_description === tareaClone.items_log_description       // Equipo
      && tarea.tasks_log_task_type_main === tareaClone.tasks_log_task_type_main // Servicio
      && tarea.priorities_description === tareaClone.priorities_description     // Proridad
      && tarea.requested_by === tareaClone.requested_by                         // Autor de la OT.
      && tarea.description === tareaClone.description                           // Antecedentes del servicio
      && tarea.id_assigned_user === tareaClone.id_assigned_user                 // PersonID del técnico
      && tarea.id_status_work_order === tareaClone.id_status_work_order         // Estado
      && tarea.cal_date_maintenance === tareaClone.cal_date_maintenance         // Fecha Solicitud del servicio
      && tarea.personnel_description === tareaClone.personnel_description       // Técnico responsable.
      ){
        return false;
      }
    return true;
  }

  public checkModificGeneral(tarea: TareaOT, tareaClone: TareaOT): boolean {
    if( tarea.latitud === tareaClone.latitud           // Latitud GPS
        && tarea.longitud === tareaClone.longitud      // Longitud GPS
        && tarea.altitud === tareaClone.altitud        // Altitud GPS
        && tarea.direccion === tareaClone.direccion    // Direccion GPS
        && tarea.description_general === tareaClone.description_general   // Descripcion general del trabajo
        && tarea.materiales === tareaClone.materiales                     // Materiales
        && tarea.types_description === tareaClone.types_description       // Tipo falla
        && tarea.causes_description === tareaClone.causes_description     // Causa falla
        && tarea.detection_method_description === tareaClone.detection_method_description // Metodo deteccion de falla
        && tarea.time_disruption === tareaClone.time_disruption           // ¿Equipo detenido?
        && tarea.caused_disruption === tareaClone.caused_disruption       // Motivo Detencion
        && tarea.checklist === tareaClone.checklist       // Motivo Detencion
    ){
      return false;
    }
    return true;
  }

  public checkExistsRecordGPS(tareaClone: TareaOT): boolean {
    if(tareaClone.latitud !== undefined && tareaClone.latitud?.trim().length > 0
    && tareaClone.longitud !== undefined && tareaClone.longitud?.trim().length > 0
    && tareaClone.direccion !== undefined && tareaClone.direccion?.trim().length > 0){
      return true;
    }
    return false;
  }

  public checkModificFirmas(tarea: TareaOT, tareaClone: TareaOT):boolean {    
    if(tarea.observaciones === tareaClone.observaciones
      && tarea.details_signature === tareaClone.details_signature   // Nombre cliente aceptador
      && tarea.aceptado_por_rut === tareaClone.aceptado_por_rut     // Rut cliente aceptador
      && tarea.aceptado_por_cargo === tareaClone.aceptado_por_cargo // Cargo cliente aceptador
      && tarea.signature === tareaClone.signature                   // Firma cliente aceptador
      && tarea.revisado_por_nombre === tareaClone.revisado_por_nombre // Nombre revisor
      && tarea.revisado_por_rut === tareaClone.revisado_por_rut       // Rut revisor
      && tarea.revisado_por_cargo === tareaClone.revisado_por_cargo   // Cargo revisor
      && tarea.validator_path_signature === tareaClone.validator_path_signature // Firma revisor
      && tarea.user_assigned === tareaClone.user_assigned           // Nombre técnico ejecutor
      && tarea.ejecutado_por_rut === tareaClone.ejecutado_por_rut   // Rut técnico ejecutor
      && tarea.ejecutado_por_cargo === tareaClone.ejecutado_por_cargo // Cargo técnico ejecutor
      && tarea.responsible_path_signature === tareaClone.responsible_path_signature // firma técnico.
      ){
        return false;
      }
    return true;
  }


  /**
   * Comprime una foto en el cliente antes de subir al servidor
   * @param imagenComoArchivo archivo File a comprimir
   * @param porcentajeCalidad número entero de 1 a 100
   * @returns 
   * @url  'https://parzibyte.me/blog'
   */
   compressImage(imagenComoArchivo, porcentajeCalidad): Promise<File>{
    return new Promise((resolve, reject) => {
      const $canvas = document.createElement("canvas");
      const imagen = new Image();
      imagen.onload = () => {
        $canvas.width = imagen.width;
        $canvas.height = imagen.height;
        $canvas.getContext("2d").drawImage(imagen, 0, 0);
        $canvas.toBlob(
          (blob) => {
            const file = new File([blob], imagenComoArchivo?.name);
            if (blob === null) {
              return reject(file);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          porcentajeCalidad / 100
        );
      };
      imagen.src = URL.createObjectURL(imagenComoArchivo);
    });
  
  }

  /**
   * Agrega el getTime al nombre de la imagen.
   * @param name Name of image.
   * @returns Name with getTime before extension.
   */
  public addTimeToImageName(name: string): string{
    const str = '_'.concat((new Date()).getTime().toString());
    const imageName: string = name.split(".").join('_').replace(/_([^_]*)$/, str+'.$1');
    return imageName;
  }
  
}
