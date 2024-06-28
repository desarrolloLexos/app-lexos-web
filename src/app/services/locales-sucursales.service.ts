import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  Firestore,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "@angular/fire/firestore";
import { Cliente, ClienteConverter } from "../models/cliente.model";
import { Local, LocalConverter } from "../models/local.model";

@Injectable({
  providedIn: "root",
})
export class LocalesSucursalesService {
  constructor(private http: HttpClient, private firestore: Firestore) {}

  async findSucursalByDireccion(codigo: string): Promise<any[]> {
    const clientesRef = collection(this.firestore, "clientes");
    const clientesSnapshot = await getDocs(clientesRef);
    const localesEncontrados: any[] = [];

    for (const clienteDoc of clientesSnapshot.docs) {
      const localesRef = collection(clienteDoc.ref, "locales");
      const localesQuery = query(localesRef, where("ceco", "==", codigo));
      const localesSnapshot = await getDocs(localesQuery);

      if (!localesSnapshot.empty) {
        localesSnapshot.forEach((localDoc) => {
          localesEncontrados.push({
            clienteId: clienteDoc.id,
            ...localDoc.data(),
          });
        });
      }
    }
    return localesEncontrados;
  }

  async getClientesConSucursales() {
    //mostrar los locales y clientes que disabled tenga false
    const clientesRef = collection(this.firestore, "clientes").withConverter(
      ClienteConverter
    );
    const clientesSnapshot = await getDocs(clientesRef);

    const clientesConSucursales = [];

    for (const clienteDoc of clientesSnapshot.docs) {
      const clienteData = clienteDoc.data() as Cliente;

      const localesRef = collection(clienteDoc.ref, "locales").withConverter(
        LocalConverter
      );

      if (clienteData.disabled) {
        continue;
      }
      const localesSnapshot = await getDocs(localesRef);

      const sucursales = localesSnapshot.docs
        .map((localDoc) => {
          const localData = localDoc.data() as Local;
          return {
            ...localData,
            uid: localDoc.id, // Captura el ID del documento
          };
        })
        .filter((local) => !local.disabled); // Filtra locales que no estén deshabilitados

      clientesConSucursales.push({
        cliente: clienteData,
        sucursales: sucursales,
      });
    }
    console.log("clientesConSucursales", clientesConSucursales);
    return clientesConSucursales;
  }

  async addEmailSupervisor(
    emailSupervisor: string,
    uidCliente: string,
    uidSucursal: string
  ) {
    try {
      const sucursalRef = doc(
        this.firestore,
        `clientes/${uidCliente}/locales/${uidSucursal}`
      );
      await setDoc(sucursalRef, { emailSupervisor }, { merge: true });
      console.log(`Email supervisor added for sucursal ${uidSucursal}`);
    } catch (error) {
      console.error(
        `Error adding email supervisor for sucursal ${uidSucursal}:`,
        error
      );
    }
  }

  async editEmailSupervisor(
    emailSupervisor: string,
    uidCliente: string,
    uidSucursal: string
  ) {
    try {
      const sucursalRef = doc(
        this.firestore,
        `clientes/${uidCliente}/locales/${uidSucursal}`
      );
      await updateDoc(sucursalRef, { emailSupervisor });
      console.log(`Email supervisor updated for sucursal ${uidSucursal}`);
    } catch (error) {
      console.error(
        `Error updating email supervisor for sucursal ${uidSucursal}:`,
        error
      );
    }
  }

  async addEmailSucursal(
    emailSucursal: string,
    uidCliente: string,
    uidSucursal: string
  ) {
    try {
      const sucursalRef = doc(
        this.firestore,
        `clientes/${uidCliente}/locales/${uidSucursal}`
      );
      await setDoc(sucursalRef, { emailSucursal }, { merge: true });
      console.log(`Email sucursal added for sucursal ${uidSucursal}`);
    } catch (error) {
      console.error(
        `Error adding email sucursal for sucursal ${uidSucursal}:`,
        error
      );
    }
  }

  async editEmailSucursal(
    emailSucursal: string,
    uidCliente: string,
    uidSucursal: string
  ) {
    try {
      const sucursalRef = doc(
        this.firestore,
        `clientes/${uidCliente}/locales/${uidSucursal}`
      );
      await updateDoc(sucursalRef, { emailSucursal });
      console.log(`Email sucursal updated for sucursal ${uidSucursal}`);
    } catch (error) {
      console.error(
        `Error updating email sucursal for sucursal ${uidSucursal}:`,
        error
      );
    }
  }
  async addemailSupervisorLexos(
    emailSupervisorLexos: string,
    uidCliente: string,
    uidSucursal: string
  ) {
    try {
      const sucursalRef = doc(
        this.firestore,
        `clientes/${uidCliente}/locales/${uidSucursal}`
      );
      await setDoc(sucursalRef, { emailSupervisorLexos }, { merge: true });
      console.log(`Email supervisor added for sucursal ${uidSucursal}`);
    } catch (error) {
      console.error(
        `Error updating email supervisor for sucursal ${uidSucursal}:`,
        error
      );
    }
  }
  async editEmailSupervisorLexos(
    emailSupervisorLexos: string,
    uidCliente: string,
    uidSucursal: string
  ) {
    try {
      const sucursalRef = doc(
        this.firestore,
        `clientes/${uidCliente}/locales/${uidSucursal}`
      );
      await updateDoc(sucursalRef, { emailSupervisorLexos });
      console.log(`Email supervisor updated for sucursal ${uidSucursal}`);
    } catch (error) {
      console.error(
        `Error updating email supervisor for sucursal ${uidSucursal}:`,
        error
      );
    }
  }
  async eliminarSucursal(uidSucursal: string, cliente: any) {
    const sucursalRef = doc(
      this.firestore,
      `clientes/${cliente}/locales/${uidSucursal}`
    );
    await updateDoc(sucursalRef, { disabled: true });
    console.log(`Sucursal ${uidSucursal} eliminado`);
  }
  async eliminarCliente(uidCliente: string) {
    try {
      const clienteRef = doc(this.firestore, `clientes/${uidCliente}`);
      await updateDoc(clienteRef, { disabled: true });
      console.log(`Cliente ${uidCliente} eliminado`);
    } catch (error) {
      console.error(`Error eliminando cliente ${uidCliente}:`, error);
    }
  }
}
