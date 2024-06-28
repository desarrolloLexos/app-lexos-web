import {
  DocumentData,
  Firestore,
  QueryDocumentSnapshot,
  addDoc,
  collection,
  collectionData,
  collectionGroup,
  deleteDoc,
  deleteField,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from "@angular/fire/firestore";
import { TareaOT, TareaOTConverter } from "../models/tarea-ot.model";

import { Injectable } from "@angular/core";
import { Unsubscribe } from "@reduxjs/toolkit";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class TareasService {
  unsubscribe!: Unsubscribe;
  lastVisible: QueryDocumentSnapshot<DocumentData>;

  constructor(private firestore: Firestore, private authService: AuthService) {}

  /**
   * @description: Pagina una consulta.
   * @url: https://firebase.google.com/docs/firestore/query-data/query-cursors?hl=es&authuser=4#paginate_a_query
   */
  async initTareasOTListener() {
    // Query the first page of docs
    const first = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      // where("id_parent_wo","==",null),
      orderBy("id", "desc"),
      limit(50)
    );

    const documentSnapshots = await getDocs(first);

    // Get the last visible document
    this.lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];

    const tareasOT: TareaOT[] = [];
    documentSnapshots.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      tareasOT.push(doc.data());
    });

    return tareasOT;
  }

  async getNextTareasOT() {
    // Construct a new query starting at this document
    const next = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      // where("id_parent_wo","==",null),
      orderBy("id", "desc"),
      startAfter(this.lastVisible),
      limit(50)
    );

    const documentSnapshots = await getDocs(next);
    this.lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];

    const tareasOT: TareaOT[] = [];
    documentSnapshots.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      tareasOT.push(doc.data());
    });

    return tareasOT;
  }

  /**
   * Obtiene las tareas asignadas y pendientes por resolver.
   */
  async getTaskAssignedAndPending() {
    console.log("getTaskAssignedAndPending preparando collectionGroup");
    // Query the first page of docs
    const first = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      // where("id_parent_wo","==",null),
      orderBy("id", "desc"),
      limit(100)
    );

    const tareasOT: TareaOT[] = [];
    const documentSnapshots = await getDocs(first);

    documentSnapshots.forEach((doc) => {
      if (
        doc.data()?.id_status_work_order === 3 ||
        doc.data()?.id_status_work_order === 5 ||
        doc.data()?.id_status_work_order === 6 ||
        doc.data()?.id_status_work_order === 7 ||
        doc.data()?.id_status_work_order === 8
      ) {
        tareasOT.push(doc.data());
      }
    });

    console.log("Cantidad de Tareas OT recibidas: ", tareasOT?.length);
    return tareasOT;
  }

  /**
   * Método que crea el registro de una tarea dentro de la colección usuarios.
   * Se genera una subcolección de nombre tareas_ot y se autogenera un ID por
   * cada documento creado.
   * @param tarea
   */
  async crearTareaOT(tarea: TareaOT) {
    const userID = this.authService.userID;

    delete tarea.uid;

    // Generamos el documento
    const tareaRef = await addDoc(
      collection(this.firestore, "usuarios", userID, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      {
        ...tarea,
        id: Date.parse(tarea.creation_date),
      }
    );

    // Actualizamos el valor obtenido en el mismo documento generado
    // await updateDoc(tareaRef, {
    //   id: tareaRef.id
    // });

    // Retornamos el objeto actualizado.
    return (await getDoc(tareaRef.withConverter(TareaOTConverter)))?.data();
  }

  async getTareaOTById(id: number) {
    const tareas: TareaOT[] = [];
    let idTarea: number;
    const q = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      where("id", "==", id),
      limit(1)
    );

    let tarea = (await getDocs(q)).docs.map((o) => o.data())[0];

    // Buscando la OT principal en caso de existir y todas las hijas.
    if (tarea?.id_parent_wo) {
      idTarea = tarea.id_parent_wo;
      const qp = query(
        collectionGroup(this.firestore, "tareas_ot").withConverter(
          TareaOTConverter
        ),
        where("id", "==", tarea?.id_parent_wo),
        limit(1)
      );
      tarea = (await getDocs(qp)).docs.map((o) => o.data())[0];
    }

    tareas.push(tarea);

    if (tarea?.has_children) {
      const qc = query(
        collectionGroup(this.firestore, "tareas_ot").withConverter(
          TareaOTConverter
        ),
        where("id_parent_wo", "==", tarea?.id)
      );
      const tasks = (await getDocs(qc)).docs.map((o) => o.data());
      tasks.forEach((task) => {
        tareas.push(task);
      });
    }

    return tareas;
  }

  async getTareasOTByIdParent(id_parent: number) {
    console.log("getTareasOTByIdParent id_parent", id_parent);
    const q = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      where("id_parent_wo", "==", Number(id_parent))
    );

    return (await getDocs(q)).docs.map((o) => o.data());
  }

  async getTareasOTByFolio(folio: string) {
    const tareas = [];
    let idTarea: number;
    const q = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      where("wo_folio", "==", folio),
      limit(1)
    );

    let tarea = (await getDocs(q)).docs.map((o) => o.data())[0];

    // Buscando la OT principal en caso de existir y todas las hijas.
    if (tarea?.id_parent_wo) {
      idTarea = tarea.id_parent_wo;
      const qp = query(
        collectionGroup(this.firestore, "tareas_ot").withConverter(
          TareaOTConverter
        ),
        where("id", "==", tarea?.id_parent_wo),
        limit(1)
      );
      tarea = (await getDocs(qp)).docs.map((o) => o.data())[0];
    }

    tareas.push(tarea);

    if (tarea?.has_children) {
      const qc = query(
        collectionGroup(this.firestore, "tareas_ot").withConverter(
          TareaOTConverter
        ),
        where("id_parent_wo", "==", tarea?.id)
      );
      const tasks = (await getDocs(qc)).docs.map((o) => o.data());
      tasks.forEach((task) => {
        tareas.push(task);
      });
    }

    return tareas;
  }

  /**
   * Obtiene las tareas de un usuario asignado.
   * @param id person_id del usuario asignado.
   * @returns
   */
  async getTareaOTByIdAssignerUser(id: number) {
    const q = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      where("id_assigned_user", "==", id),
      // where("id_parent_wo","==",null),
      orderBy("id", "desc"),
      limit(50)
    );

    return (await getDocs(q)).docs.map((o) => o.data());
  }

  /**
   * Método que actualiza un documento completo, reemplazando el existente
   * por el dado.
   * @param tareaOT nueva tarea OT
   */
  async actualizarTareaOT(tareaOT: TareaOT) {
    const q = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      where("id", "==", Number(tareaOT.id)),
      limit(1)
    );

    // Obtenemos el documento para actualizar
    const querySnapshot = (await getDocs(q)).docs;

    // Recorremos el querySnapshot y lo actualizamos (ya sabemos que es 1 por limit)
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, tareaOT);
    });
  }

  // Mantenedores:
  // Coloca el campo has_children en false a todos los documentos que no tengan el campo.
  async updateAllTaskHasChildren() {
    console.log(
      "updateAllTaskHasChildren preparando actualizar todos los campos"
    );
    // Query the first page of docs
    const full = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      )
    );

    const tareasOT: TareaOT[] = [];
    const documentSnapshots = await getDocs(full);

    documentSnapshots.forEach(async (doc) => {
      if (doc.data()?.has_children === undefined) {
        const task = doc.data();
        await updateDoc(doc.ref, { ...task, has_children: false });
      }
    });
  }

  // id_parent_wo

  async updateAllTaskIdParantWo() {
    console.log(
      "updateAllTaskIdParantWo preparando actualizar todos los campos"
    );
    // Query the first page of docs
    const full = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      )
    );

    const tareasOT: TareaOT[] = [];
    const documentSnapshots = await getDocs(full);

    documentSnapshots.forEach(async (doc) => {
      if (doc.data()?.id_parent_wo === 1658501053710) {
        const task = doc.data();
        await updateDoc(doc.ref, { ...task, id_parent_wo: null });
      }
    });
  }

  // Mantenedores:
  // Elimina documentos según folio
  async deleteDocByFolio(folio: string) {
    console.log("deleteDocByFolio preparando eliminar");
    // Query the first page of docs
    const full = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      where("wo_folio", "==", folio)
    );
    const documentSnapshots = await getDocs(full);
    documentSnapshots.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  }

  async changeStateFinallyWhenExistsWoFinalDate() {
    console.log(
      "changeStateFinallyWhenExistsWoFinalDate preparando actualizar todos los campos"
    );
    // Query the first page of docs
    const full = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      )
    );

    const tareasOT: TareaOT[] = [];
    const documentSnapshots = await getDocs(full);

    documentSnapshots.forEach(async (doc) => {
      if (
        doc.data()?.wo_final_date !== undefined &&
        doc.data()?.id_status_work_order !== 3
      ) {
        const task = doc.data();
        await updateDoc(doc.ref, { ...task, id_status_work_order: 3 });
      }
    });
  }

  async changeStatePendientePorRevisarWhenExistsHourFinal() {
    console.log(
      "changeStatePendientePorRevisarWhenExistsHourFinal preparando actualizar todos los campos"
    );
    // Query the first page of docs
    const full = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      )
    );

    const tareasOT: TareaOT[] = [];
    const documentSnapshots = await getDocs(full);

    documentSnapshots.forEach(async (doc) => {
      if (
        doc.data()?.final_date !== undefined &&
        doc.data()?.id_status_work_order !== 8 &&
        doc.data()?.wo_final_date === undefined
      ) {
        const task = doc.data();
        await updateDoc(doc.ref, { ...task, id_status_work_order: 8 });
      }
    });
  }

  async updateTareas(tareas: TareaOT[]) {
    const ids = tareas.map((task) => task.id);
    const q = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      where("id", "in", ids)
    );

    const querySnapshot = (await getDocs(q)).docs;

    tareas.forEach(async (tarea) => {
      const docRef = querySnapshot.find(
        (doc) => doc.data().wo_folio === tarea.wo_folio
      );
      let jsonTarea = JSON.parse(JSON.stringify(tarea));
      jsonTarea = {
        ...jsonTarea,
        foto1: jsonTarea.foto1 ? jsonTarea.foto1 : deleteField(),
        foto2: jsonTarea.foto2 ? jsonTarea.foto2 : deleteField(),
        foto3: jsonTarea.foto3 ? jsonTarea.foto3 : deleteField(),
        foto4: jsonTarea.foto4 ? jsonTarea.foto4 : deleteField(),
        foto5: jsonTarea.foto5 ? jsonTarea.foto5 : deleteField(),
      };
      await updateDoc(docRef.ref, jsonTarea);
    });
  }

  getReporteTiempos(fechaDesde, fechaHasta): Observable<TareaOT[]> {
    const q = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      where("id_status_work_order", "in", [3, 6, 7, 8]),
      where("creation_date", ">=", fechaDesde),
      where("creation_date", "<=", fechaHasta),
      orderBy("creation_date", "desc")
      // limit(2000)
    );

    return collectionData(q, { idField: "uid" }) as Observable<TareaOT[]>;
  }

  async getReporteTiemposPromise(fechaDesde: string, fechaHasta: string) {
    const q = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      where("id_status_work_order", "in", [3, 6, 7, 8]),
      where("creation_date", ">=", fechaDesde),
      where("creation_date", "<=", fechaHasta),
      orderBy("creation_date", "desc")
      //limit(50) //TODO: remover esto
    );

    return (await getDocs(q)).docs.map((o) => o.data());
  }

  async getReporteTiemposPromiseStatus(fechaDesde: string, fechaHasta: string) {
    const q = query(
      collectionGroup(this.firestore, "tareas_ot").withConverter(
        TareaOTConverter
      ),
      where("id_status_work_order", "in", [3, 6, 7, 8]),
      where("creation_date", ">=", fechaDesde),
      where("creation_date", "<=", fechaHasta),
      orderBy("creation_date", "desc"),
      limit(550)
    );

    return (await getDocs(q)).docs.map((o) => o.data());
  }
  async updateTarea(idstatus: number, userName: string, folio: string) {
    console.log("updateTarea", idstatus, userName, folio);
    // Primero, obtén el ID del usuario basándote en el nombre.
    const usersRef = collection(this.firestore, "usuarios");
    const userQueryRef = query(usersRef, where("name", "==", userName));
    const userQuerySnapshot = await getDocs(userQueryRef);

    if (userQuerySnapshot.empty) {
      console.log("No se encontró ningún usuario con ese nombre");
      return;
    }

    // Suponiendo que 'name' es único, obtenemos el primer resultado.
    const userId = userQuerySnapshot.docs[0].id;
    console.log(`ID del usuario encontrado: ${userId}`);

    // Después de obtener el ID del usuario, continúa con la actualización de la tarea.
    const tareasRef = collection(
      this.firestore,
      `usuarios/${userId}/tareas_ot`
    );
    const tareaQueryRef = query(
      tareasRef,
      where("wo_folio", "==", folio)
      /// where("id_status_work_order", "==", idstatus)
    );
    const tareaQuerySnapshot = await getDocs(tareaQueryRef);
    if (tareaQuerySnapshot.empty) {
      console.log("No se encontraron tareas con el folio especificado");
      return;
    }
    tareaQuerySnapshot.forEach(async (docSnapshot) => {
      const tareaRef = docSnapshot.ref;
      await updateDoc(tareaRef, { id_status_work_order: idstatus });
      console.log(`Estado actualizado para la tarea con ID ${docSnapshot.id}`);
    });
  }

  async forzarFinalizarTarea(tarea: TareaOT) {
    const { requested_by, wo_folio, id_status_work_order } = tarea;
    const usersRef = collection(this.firestore, "usuarios");
    const userQueryRef = query(usersRef, where("name", "==", requested_by));
    const userQuerySnapshot = await getDocs(userQueryRef);

    if (userQuerySnapshot.empty) {
      console.log("No se encontró ningún usuario con ese nombre");
      return;
    }
    const userId = userQuerySnapshot.docs[0].id;
    console.log(`ID del usuario encontrado: ${userId}`);
    const tareasRef = collection(
      this.firestore,
      `usuarios/${userId}/tareas_ot`
    );
    const tareaQueryRef = query(tareasRef, where("wo_folio", "==", wo_folio));
    const tareaQuerySnapshot = await getDocs(tareaQueryRef);
    if (tareaQuerySnapshot.empty) {
      console.log("No se encontraron tareas con el folio especificado");
      return;
    }

    tareaQuerySnapshot.forEach(async (docSnapshot) => {
      const tareaRef = docSnapshot.ref;
      await updateDoc(tareaRef, { id_status_work_order: 3 });
      console.log(`Estado actualizado para la tarea con ID ${docSnapshot.id}`);
    });
    console.log("############ forzarFinalizarTarea ############");
    console.log(tarea);
  }

  async getTareaOtByFolio(tarea: TareaOT) {
    console.log("getTareaOtByFolio", tarea);
    const { requested_by, wo_folio, id_status_work_order } = tarea;
    const usersRef = collection(this.firestore, "usuarios");
    const userQueryRef = query(usersRef, where("name", "==", requested_by));
    const userQuerySnapshot = await getDocs(userQueryRef);
    if (userQuerySnapshot.empty) {
      console.log("No se encontró ningún usuario con ese nombre");
      return;
    }
    const userId = userQuerySnapshot.docs[0].id;
    console.log(`ID del usuario encontrado: ${userId}`);
    const tareasRef = collection(
      this.firestore,
      `usuarios/${userId}/tareas_ot`
    );
    const tareaQueryRef = query(tareasRef, where("wo_folio", "==", wo_folio));
    const tareaQuerySnapshot = await getDocs(tareaQueryRef);
    if (tareaQuerySnapshot.empty) {
      console.log("No se encontraron tareas con el folio especificado");
      return;
    }
    return tareaQuerySnapshot.docs.map((o) => o.data());
  }

  async listadoCausaFalla() {
    //listado de la tabla firestore lista_causas_fallas
    const q = query(collection(this.firestore, "lista_causas_fallas"));
    return (await getDocs(q)).docs.map((o) => o.data());
  }
  async listadoTipoDeFalla() {
    const q = query(collection(this.firestore, "tipo_falla"));
    return (await getDocs(q)).docs.map((o) => o.data());
  }
  async listadoMetodoDeteccion() {
    const q = query(collection(this.firestore, "lista_metodo_deteccion"));
    return (await getDocs(q)).docs.map((o) => o.data());
  }
  async listadoMotivoDetencion() {
    const q = query(collection(this.firestore, "lista_motivo_detencion"));
    return (await getDocs(q)).docs.map((o) => o.data());
  }
}
