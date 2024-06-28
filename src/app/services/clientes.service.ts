import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  updateDoc,
  where,
} from "@angular/fire/firestore";

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Cliente, ClienteConverter } from "../models/cliente.model";
import { Equipo, EquipoConverter } from "../models/equipo.model";
import { Local, LocalConverter } from "../models/local.model";

@Injectable({
  providedIn: "root",
})
export class ClientesService {
  constructor(private firestore: Firestore) {}

  async getClientesById(uid: string) {
    const docRef = doc(this.firestore, "clientes", uid).withConverter(
      ClienteConverter
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
    return docSnap.data();
  }

  async getClienteByName(cliente: string) {
    const docRef = query(
      collection(this.firestore, "clientes").withConverter(ClienteConverter),
      where("cliente", "==", cliente)
    );
    const docSnap = await getDocs(docRef);

    return docSnap.docs.map((cliente) => cliente.data())[0];
  }

  async getClientes() {
    const docRef = query(
      collection(this.firestore, "clientes").withConverter(ClienteConverter)
    );
    const docSnap = await getDocs(docRef);
    const clientes: Cliente[] = [];
    docSnap.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      clientes.push(doc.data());
    });
    return clientes;
  }

  async getEquiposByClienteIDAndLocalCode(uid: string, codigolocal: string) {
    const next = query(
      collection(this.firestore, "clientes", uid, "equipos").withConverter(
        EquipoConverter
      ),
      where("codigolocal", "==", codigolocal),
      orderBy("nombre", "asc")
    );

    const documentSnapshots = await getDocs(next);

    const equipos: Equipo[] = [];
    documentSnapshots.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      equipos.push(doc.data());
    });

    return equipos;
  }

  async getEquiposByClienteID(uid: string) {
    const next = query(
      collection(this.firestore, "clientes", uid, "equipos").withConverter(
        EquipoConverter
      ),
      orderBy("nombre", "asc")
    );

    const documentSnapshots = await getDocs(next);

    const equipos: Equipo[] = [];
    documentSnapshots.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      equipos.push(doc.data());
    });

    return equipos;
  }

  async getLocalesByClienteID(uid: string) {
    const next = query(
      collection(this.firestore, "clientes", uid, "locales").withConverter(
        LocalConverter
      ),
      orderBy("nombre", "asc")
    );

    const documentSnapshots = await getDocs(next);

    const equipos: Local[] = [];
    documentSnapshots.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      equipos.push(doc.data());
    });

    return equipos;
  }

  async getLocalByCECO(uid: string, ceco: string) {
    const q = query(
      collection(this.firestore, "clientes", uid, "locales").withConverter(
        LocalConverter
      ),
      where("ceco", "==", ceco),
      orderBy("nombre", "asc")
    );

    return (await getDocs(q)).docs.map((o) => o.data())[0];
  }

  async setEquipo(uid: string, equipo: Equipo) {
    const equipoRef = await addDoc(
      collection(this.firestore, "clientes", uid, "equipos").withConverter(
        EquipoConverter
      ),
      { ...equipo }
    );

    const docSnap = await getDoc(equipoRef.withConverter(EquipoConverter));
    const clienteRef = doc(this.firestore, "clientes", uid);

    await updateDoc(clienteRef, {
      cantidad_equipos: increment(1),
    });

    return docSnap?.data();
  }

  async setLocal(uid: string, local: Local) {
    const localRef = await addDoc(
      collection(this.firestore, "clientes", uid, "locales").withConverter(
        LocalConverter
      ),
      { ...local }
    );

    const docSnap = await getDoc(localRef.withConverter(LocalConverter));
    const clienteRef = doc(this.firestore, "clientes", uid);

    await updateDoc(clienteRef, {
      cantidad_locales: increment(1),
    });

    return docSnap?.data();
  }

  getLocales(): Observable<Local[]> {
    const q = query(
      collectionGroup(this.firestore, "locales").withConverter(LocalConverter),
      orderBy("nombre", "asc")
    );

    return collectionData(q, { idField: "uid" }) as Observable<Local[]>;
  }

  getEquipos(): Observable<Equipo[]> {
    const q = query(
      collectionGroup(this.firestore, "equipos").withConverter(EquipoConverter),
      orderBy("nombre", "asc")
    );

    return collectionData(q, { idField: "uid" }) as Observable<Equipo[]>;
  }

  getClientesObs(): Observable<Cliente[]> {
    const q = query(
      collectionGroup(this.firestore, "clientes").withConverter(
        ClienteConverter
      )
    );

    return collectionData(q, { idField: "uid" }) as Observable<Cliente[]>;
  }
}
