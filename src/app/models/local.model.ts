import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "@angular/fire/firestore";

export class Local {
  /* Forma corta de crear un modelo en typescript */
  constructor(
    public nombre: string,
    public direccion: string,
    public ciudad: string,
    public ceco: string,
    public codigo: string,
    public latitude: string,
    public longitud: string,
    public emailSucursal: string,
    public emailSupervisor: string,
    public emailSupervisorLexos: string,
    public disabled: boolean
  ) {}
}

/* Tipo que permite usar desestructuración de objeto en clase Local */
export type LocalType = {
  nombre: string;
  direccion: string;
  ciudad: string;
  ceco: string;
  codigo: string;
  latitude: string;
  longitud: string;
  emailSucursal: string;
  emailSupervisor: string;
  emailSupervisorLexos: string;
};

// Firestore data converter
export const LocalConverter = {
  toFirestore: (local: Local) => {
    return {
      nombre: local.nombre,
      direccion: local.direccion,
      ciudad: local.ciudad,
      ceco: local.ceco,
      codigo: local.codigo,
      latitude: local.latitude,
      longitud: local.longitud,
      emailSucursal: local.emailSucursal,
      emailSupervisor: local.emailSupervisor,
      emailSupervisorLexos: local.emailSupervisorLexos,
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    return new Local(
      data["nombre"],
      data["direccion"],
      data["ciudad"],
      data["ceco"],
      data["codigo"],
      data["latitude"],
      data["longitud"],
      data["emailSucursal"],
      data["emailSupervisor"],
      data["emailSupervisorLexos"],
      data["disabled"]
    );
  },
};
