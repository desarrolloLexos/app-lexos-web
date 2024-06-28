import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "@angular/fire/firestore";

export class TareaOT {
  /* Forma corta de crear un modelo en typescript */
  constructor(
    public wo_folio: string,
    public creation_date: string,
    public items_log_description: string,
    public tasks_log_task_type_main: string,
    public priorities_description: string,
    public requested_by: string,
    public description: string,
    public cal_date_maintenance: string,

    // argumentos opcionales para no sobre cargar una simple instancia.
    public cliente?: string,
    public local?: string,
    public latitud?: string,
    public longitud?: string,
    public altitud?: string,
    public description_general?: string,
    public materiales?: string,
    public foto1?: string,
    public foto2?: string,
    public foto3?: string,
    public foto4?: string,
    public foto5?: string,
    public observaciones?: string,
    public aceptado_por_rut?: string,
    public aceptado_por_cargo?: string,
    public revisado_por_nombre?: string,
    public revisado_por_rut?: string,
    public revisado_por_cargo?: string,
    public ejecutado_por_rut?: string,
    public ejecutado_por_cargo?: string,
    public direccion?: string,

    public id_work_order?: string,
    public id_company?: string,
    public id_work_orders_tasks?: string,
    public id_status_work_order?: number,
    public duration?: string,
    public id_assigned_user?: number,
    public initial_date?: string,
    public final_date?: string,
    public completed_percentage?: string,
    public id_created_by?: string,
    public created_by?: string,
    public signature?: string,
    public personnel_description?: string,
    public personnel_path_image?: string,
    public code?: string,
    public id_group?: string,
    public id_group_1?: string,
    public id_group_2?: string,
    public id_parent?: string,
    public items_log_id_priority?: string,
    public id_group_task?: string,
    public id_type_item?: string,
    public done?: string,
    public id_task?: string,
    public id_priorities?: string,
    public id_task_type_main?: string,
    public id_task_type?: string,
    public id_task_type_2?: string,
    public id_request?: string,
    public stop_assets?: string,
    public stop_assets_sec?: string,
    public parent_description?: string,
    public trigger_description?: string,
    public resources_hours?: string,
    public resources_inventory?: string,
    public resources_human_resources?: string,
    public resources_services?: string,
    public real_duration?: string,
    public date_maintenance?: string,
    public id_user_assigned?: number,
    public user_assigned?: string,
    public note?: string,
    public details_signature?: string,
    public responsible_path_signature?: string,
    public validator_path_signature?: string,
    public first_date_task?: string,
    public costs_center_description?: string,
    public id_item?: string,
    public id?: number,
    public tasks_duration?: string,
    public groups_description?: string,
    public groups_1_description?: string,
    public groups_2_description?: string,
    public id_validated_by?: number,
    public id_parent_wo?: number,
    public has_children?: boolean,
    public real_stop_assets_sec?: string,
    public wo_final_date?: string,
    public is_offline?: string,
    public id_account_offline?: string,
    public tasks_log_types_description?: string,
    public tasks_log_types_2_description?: string,
    public code_create_by?: string,
    public event_date?: string,
    public rating?: string,
    public id_custom_field_group?: string,
    public id_personnel_log?: string,
    public id_contacts_log?: string,
    public enable_budget?: string,
    public id_work_orders_status_custom?: string,
    public work_orders_status_custom_description?: string,
    public review_date?: string,
    public id_item_log?: string,
    public custom_fields_values?: string,
    public is_cyclical?: string,
    public id_task_trigger?: string,
    public barcode?: string,
    public last_date_maintenance?: string,
    public num_iterations?: string,
    public name_iterations?: string,
    public id_task_log?: string,
    public task_note?: string,
    public id_tasks_failures?: string,
    public id_failure_type?: string,
    public id_failure_cause?: string,
    public id_failure_detection_method?: string,
    public id_failure_severity?: string,
    public id_damage_type?: string,
    public types_description?: string,
    public causes_description?: string,
    public detection_method_description?: string,
    public severiry_description?: string,
    public damages_types_description?: string,
    public time_disruption?: string,
    public caused_disruption?: string,
    public caused_damage?: string,
    public items_log_priorities_description?: string,
    public items_log_types_description?: string,
    public hours_average_daily_use?: string,
    public validated_by_description?: string,
    public wo_folio_parent?: string,
    public id_assigned_user_actual?: string,
    public code_responsible?: string,
    public id_items_availability?: string,
    public item_available?: string,
    public dont_letgo_wo_without_stock?: string,
    public id_public?: string,
    public id_cost_center?: string,
    public total_cost_task?: string,
    public visible_to_all?: string,
    public uid?: string,
    public checklist?: string
  ) {}
}

// Firestore data converter
export const TareaOTConverter = {
  toFirestore: (ot: TareaOT) => {
    return {
      wo_folio: ot.wo_folio,
      creation_date: ot.creation_date,
      items_log_description: ot.items_log_description,
      tasks_log_task_type_main: ot.tasks_log_task_type_main,
      priorities_description: ot.priorities_description,
      requested_by: ot.requested_by,
      description: ot.description,
      cal_date_maintenance: ot.cal_date_maintenance,
      cliente: ot.cliente,
      local: ot.local,
      latitud: ot.latitud,
      longitud: ot.longitud,
      altitud: ot.altitud,
      description_general: ot.description_general,
      materiales: ot.materiales,
      foto1: ot.foto1,
      foto2: ot.foto2,
      foto3: ot.foto3,
      foto4: ot.foto4,
      foto5: ot.foto5,
      observaciones: ot.observaciones,
      aceptado_por_rut: ot.aceptado_por_rut,
      aceptado_por_cargo: ot.aceptado_por_cargo,
      revisado_por_nombre: ot.revisado_por_nombre,
      revisado_por_rut: ot.revisado_por_rut,
      revisado_por_cargo: ot.revisado_por_cargo,
      ejecutado_por_rut: ot.ejecutado_por_rut,
      ejecutado_por_cargo: ot.ejecutado_por_cargo,
      direccion: ot.direccion,
      id_work_order: ot.id_work_order,
      id_company: ot.id_company,
      id_work_orders_tasks: ot.id_work_orders_tasks,
      id_status_work_order: ot.id_status_work_order,
      duration: ot.duration,
      id_assigned_user: ot.id_assigned_user,
      initial_date: ot.initial_date,
      final_date: ot.final_date,
      completed_percentage: ot.completed_percentage,
      id_created_by: ot.id_created_by,
      created_by: ot.created_by,
      signature: ot.signature,
      personnel_description: ot.personnel_description,
      personnel_path_image: ot.personnel_path_image,
      code: ot.code,
      id_group: ot.id_group,
      id_group_1: ot.id_group_1,
      id_group_2: ot.id_group_2,
      id_parent: ot.id_parent,
      items_log_id_priority: ot.items_log_id_priority,
      id_group_task: ot.id_group_task,
      id_type_item: ot.id_type_item,
      done: ot.done,
      id_task: ot.id_task,
      id_priorities: ot.id_priorities,
      id_task_type_main: ot.id_task_type_main,
      id_task_type: ot.id_task_type,
      id_task_type_2: ot.id_task_type_2,
      id_request: ot.id_request,
      stop_assets: ot.stop_assets,
      stop_assets_sec: ot.stop_assets_sec,
      parent_description: ot.parent_description,
      trigger_description: ot.trigger_description,
      resources_hours: ot.resources_hours,
      resources_inventory: ot.resources_inventory,
      resources_human_resources: ot.resources_human_resources,
      resources_services: ot.resources_services,
      real_duration: ot.real_duration,
      date_maintenance: ot.date_maintenance,
      id_user_assigned: ot.id_user_assigned,
      user_assigned: ot.user_assigned,
      note: ot.note,
      details_signature: ot.details_signature,
      responsible_path_signature: ot.responsible_path_signature,
      validator_path_signature: ot.validator_path_signature,
      first_date_task: ot.first_date_task,
      costs_center_description: ot.costs_center_description,
      id_item: ot.id_item,
      id: ot.id,
      tasks_duration: ot.tasks_duration,
      groups_description: ot.groups_description,
      groups_1_description: ot.groups_1_description,
      groups_2_description: ot.groups_2_description,
      id_validated_by: ot.id_validated_by,
      id_parent_wo: ot.id_parent_wo,
      has_children: ot.has_children,
      real_stop_assets_sec: ot.real_stop_assets_sec,
      wo_final_date: ot.wo_final_date,
      is_offline: ot.is_offline,
      id_account_offline: ot.id_account_offline,
      tasks_log_types_description: ot.tasks_log_types_description,
      tasks_log_types_2_description: ot.tasks_log_types_2_description,
      code_create_by: ot.code_create_by,
      event_date: ot.event_date,
      rating: ot.rating,
      id_custom_field_group: ot.id_custom_field_group,
      id_personnel_log: ot.id_personnel_log,
      id_contacts_log: ot.id_contacts_log,
      enable_budget: ot.enable_budget,
      id_work_orders_status_custom: ot.id_work_orders_status_custom,
      work_orders_status_custom_description:
        ot.work_orders_status_custom_description,
      review_date: ot.review_date,
      id_item_log: ot.id_item_log,
      custom_fields_values: ot.custom_fields_values,
      is_cyclical: ot.is_cyclical,
      id_task_trigger: ot.id_task_trigger,
      barcode: ot.barcode,
      last_date_maintenance: ot.last_date_maintenance,
      num_iterations: ot.num_iterations,
      name_iterations: ot.name_iterations,
      id_task_log: ot.id_task_log,
      task_note: ot.task_note,
      id_tasks_failures: ot.id_tasks_failures,
      id_failure_type: ot.id_failure_type,
      id_failure_cause: ot.id_failure_cause,
      id_failure_detection_method: ot.id_failure_detection_method,
      id_failure_severity: ot.id_failure_severity,
      id_damage_type: ot.id_damage_type,
      types_description: ot.types_description,
      causes_description: ot.causes_description,
      detection_method_description: ot.detection_method_description,
      severiry_description: ot.severiry_description,
      damages_types_description: ot.damages_types_description,
      time_disruption: ot.time_disruption,
      caused_disruption: ot.caused_disruption,
      caused_damage: ot.caused_damage,
      items_log_priorities_description: ot.items_log_priorities_description,
      items_log_types_description: ot.items_log_types_description,
      hours_average_daily_use: ot.hours_average_daily_use,
      validated_by_description: ot.validated_by_description,
      wo_folio_parent: ot.wo_folio_parent,
      id_assigned_user_actual: ot.id_assigned_user_actual,
      code_responsible: ot.code_responsible,
      id_items_availability: ot.id_items_availability,
      item_available: ot.item_available,
      dont_letgo_wo_without_stock: ot.dont_letgo_wo_without_stock,
      id_public: ot.id_public,
      id_cost_center: ot.id_cost_center,
      total_cost_task: ot.total_cost_task,
      visible_to_all: ot.visible_to_all,
      uid: ot.uid,
      checklist: ot.checklist,
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    return new TareaOT(
      data["wo_folio"],
      data["creation_date"],
      data["items_log_description"],
      data["tasks_log_task_type_main"],
      data["priorities_description"],
      data["requested_by"],
      data["description"],
      data["cal_date_maintenance"],
      data["cliente"],
      data["local"],
      data["latitud"],
      data["longitud"],
      data["altitud"],
      data["description_general"],
      data["materiales"],
      data["foto1"],
      data["foto2"],
      data["foto3"],
      data["foto4"],
      data["foto5"],
      data["observaciones"],
      data["aceptado_por_rut"],
      data["aceptado_por_cargo"],
      data["revisado_por_nombre"],
      data["revisado_por_rut"],
      data["revisado_por_cargo"],
      data["ejecutado_por_rut"],
      data["ejecutado_por_cargo"],
      data["direccion"],
      data["id_work_order"],
      data["id_company"],
      data["id_work_orders_tasks"],
      data["id_status_work_order"],
      data["duration"],
      data["id_assigned_user"],
      data["initial_date"],
      data["final_date"],
      data["completed_percentage"],
      data["id_created_by"],
      data["created_by"],
      data["signature"],
      data["personnel_description"],
      data["personnel_path_image"],
      data["code"],
      data["id_group"],
      data["id_group_1"],
      data["id_group_2"],
      data["id_parent"],
      data["items_log_id_priority"],
      data["id_group_task"],
      data["id_type_item"],
      data["done"],
      data["id_task"],
      data["id_priorities"],
      data["id_task_type_main"],
      data["id_task_type"],
      data["id_task_type_2"],
      data["id_request"],
      data["stop_assets"],
      data["stop_assets_sec"],
      data["parent_description"],
      data["trigger_description"],
      data["resources_hours"],
      data["resources_inventory"],
      data["resources_human_resources"],
      data["resources_services"],
      data["real_duration"],
      data["date_maintenance"],
      data["id_user_assigned"],
      data["user_assigned"],
      data["note"],
      data["details_signature"],
      data["responsible_path_signature"],
      data["validator_path_signature"],
      data["first_date_task"],
      data["costs_center_description"],
      data["id_item"],
      data["id"],
      data["tasks_duration"],
      data["groups_description"],
      data["groups_1_description"],
      data["groups_2_description"],
      data["id_validated_by"],
      data["id_parent_wo"],
      data["has_children"],
      data["real_stop_assets_sec"],
      data["wo_final_date"],
      data["is_offline"],
      data["id_account_offline"],
      data["tasks_log_types_description"],
      data["tasks_log_types_2_description"],
      data["code_create_by"],
      data["event_date"],
      data["rating"],
      data["id_custom_field_group"],
      data["id_personnel_log"],
      data["id_contacts_log"],
      data["enable_budget"],
      data["id_work_orders_status_custom"],
      data["work_orders_status_custom_description"],
      data["review_date"],
      data["id_item_log"],
      data["custom_fields_values"],
      data["is_cyclical"],
      data["id_task_trigger"],
      data["barcode"],
      data["last_date_maintenance"],
      data["num_iterations"],
      data["name_iterations"],
      data["id_task_log"],
      data["task_note"],
      data["id_tasks_failures"],
      data["id_failure_type"],
      data["id_failure_cause"],
      data["id_failure_detection_method"],
      data["id_failure_severity"],
      data["id_damage_type"],
      data["types_description"],
      data["causes_description"],
      data["detection_method_description"],
      data["severiry_description"],
      data["damages_types_description"],
      data["time_disruption"],
      data["caused_disruption"],
      data["caused_damage"],
      data["items_log_priorities_description"],
      data["items_log_types_description"],
      data["hours_average_daily_use"],
      data["validated_by_description"],
      data["wo_folio_parent"],
      data["id_assigned_user_actual"],
      data["code_responsible"],
      data["id_items_availability"],
      data["item_available"],
      data["dont_letgo_wo_without_stock"],
      data["id_public"],
      data["id_cost_center"],
      data["total_cost_task"],
      data["visible_to_all"],
      data["uid"],
      data["checklist"]
    );
  },
};

export enum Servicio {
  SERVICIO_DE_EMERGENCIA = "Servicio de Emergencia",
  MANTENIMIENTO_PREVENTIVO = "Mantenimiento Preventivo",
  TRABAJO_PROGRAMADO = "Trabajo Programado",
  REVISION_DE_EQUIPOS = "Revisión De Equipos",
}
