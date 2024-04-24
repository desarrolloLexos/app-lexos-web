import { Firestore, collection, getDocs, orderBy, query, addDoc, getDoc, where } from '@angular/fire/firestore';

import { Injectable } from '@angular/core';
import { TipoFalla, TipoFallaConverter } from '../models/tipo-falla.model';
import { CausaFalla, CausaFallaConverter } from '../models/causa-falla.model';
import { MetodoDeteccion, MetodoDeteccionConverter } from '../models/metodo-deteccion.model';
import { Lista, ListaConverter } from 'app/models/lista.model';
import { CheckListConverter } from 'app/models/checklist.model';

@Injectable({
  providedIn: 'root'
})
export class ListasService {

  constructor(private firestore: Firestore) { }

  async getListaTipoFalla() {
    const docRef = query(collection(this.firestore, "tipo_falla")
                    .withConverter(TipoFallaConverter),
                    orderBy("description", "asc"));
    const docSnap = await getDocs(docRef);
    return docSnap.docs.map( (o) => o.data());
  }

  async getListaCausaFalla(){
    const docRef = query(collection(this.firestore, "lista_causas_fallas")
                   .withConverter(CausaFallaConverter),
                   orderBy("description", "asc"));
    const docSnap = await getDocs(docRef);
    return docSnap.docs.map( (o) => o.data());
  }

  async getListaMetodoDeteccion(){
    const docRef = query(collection(this.firestore, "lista_metodo_deteccion")
                   .withConverter(MetodoDeteccionConverter),
                   orderBy("description", "asc"));
    const docSnap = await getDocs(docRef);
    return docSnap.docs.map( (o) => o.data());
  }

  async getListaMotivosDetencion(){
    const docRef = query(collection(this.firestore, "lista_motivo_detencion")
                   .withConverter(ListaConverter),
                   orderBy("nombre", "asc"));
    const docSnap = await getDocs(docRef);
    return docSnap.docs.map( (o) => o.data());
  }

  async setTipoFalla(tipoFalla: TipoFalla){
    const tipoFallaRef = await addDoc(
      collection(this.firestore, "tipo_falla")
      .withConverter(TipoFallaConverter), {...tipoFalla});

    const docSnap = await getDoc(tipoFallaRef.withConverter(TipoFallaConverter));
    return docSnap?.data();
  }

  async setCausaFalla(causaFalla: CausaFalla){
    const causaFallaRef = await addDoc(
      collection(this.firestore, "lista_causas_fallas")
      .withConverter(CausaFallaConverter), {...causaFalla});

    const docSnap = await getDoc(causaFallaRef.withConverter(CausaFallaConverter));
    return docSnap?.data();
  }

  async setMotivoDetencion(motivoDetencion: Lista){
    const motivoRef = await addDoc(
      collection(this.firestore, "lista_motivo_detencion")
      .withConverter(ListaConverter), {...motivoDetencion});

    const docSnap = await getDoc(motivoRef.withConverter(ListaConverter));
    return docSnap?.data();
  }

  async setMetodoDeteccion(metodoDeteccion: MetodoDeteccion){
    const motivoRef = await addDoc(
      collection(this.firestore, "lista_metodo_deteccion")
      .withConverter(MetodoDeteccionConverter), {...metodoDeteccion});

    const docSnap = await getDoc(motivoRef.withConverter(MetodoDeteccionConverter));
    return docSnap?.data();
  }

  
  async getCheckListMantencionPrenventivaPorTipo(cliente: string, mes: string, tipo: string){
    const docRef = query(collection(this.firestore, "clientes", cliente, "checklist")
                   .withConverter(CheckListConverter),
                   where("mes", "==", mes),
                   where("tipo", "==", tipo));
    const docSnap = await getDocs(docRef);
    return docSnap.docs.map( (o) => o.data());
  }

  async getCheckListMantencionPrenventiva(cliente: string, mes: string, local?: string) {
    if (!local || (local.length === 0 || local === 'SMU')) {
      const docRef = query(collection(this.firestore, `clientes/${cliente}/checklist`)
        .withConverter(CheckListConverter),
        where("mes", "in", [mes, 'todo']));
      const docSnap = await getDocs(docRef);
      return docSnap.docs.map((o) => o.data());
    } else {
      const docRef = query(collection(this.firestore, `clientes/${cliente}/checklist`)
        .withConverter(CheckListConverter),
        where("mes", "in", [mes, 'todo']),
        where("local","==",local));
      const docSnap = await getDocs(docRef);
      return docSnap.docs.map((o) => o.data());
    }
  }


}
