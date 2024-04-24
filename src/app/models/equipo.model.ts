import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/firestore";

export class Equipo {

  /* Forma corta de crear un modelo en typescript */
  constructor(
      public codigo: string,
      public nombre: string,
      public tipo: string,
      public codigolocal: string,
      public fabricante?: string,
      public modelo?: string,
      public serial?: string,
      public otro?: string,
  ){}
}

/* Tipo que permite usar desestructuración de objeto en clase Equipo */
export type EquipoType = {
      codigo: string,
      nombre: string,
      tipo: string,
      codigolocal: string,
      fabricante?: string,
      modelo?: string,
      serial?: string,
      otro?: string,
}

  
// Firestore data converter
export const EquipoConverter = {
  toFirestore: (equipo: Equipo) => {
      return {
        "codigo": equipo.codigo,
        "nombre": equipo.nombre,
        "tipo": equipo.tipo,
        "codigolocal": equipo.codigolocal,
        "fabricante": equipo.fabricante,
        "modelo": equipo.modelo,
        "serial": equipo.serial,
        "otro": equipo.otro,
        
          };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>,
                  options: SnapshotOptions) => {
      const data = snapshot.data(options);
      return new Equipo(
        data['codigo'],
        data['nombre'],
        data['tipo'],
        data['codigolocal'],               
        data['fabricante'],
        data['modelo'],
        data['serial'],
        data['otro'],
        );
  }
};
