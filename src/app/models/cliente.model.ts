import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/firestore";

export class Cliente {

  /* Forma corta de crear un modelo en typescript */
  constructor(
    public uid: string,
    public cliente: string,
    public cantidad_locales: number,
    public cantidad_equipos: number,   
  ){}
}

/* Tipo que permite usar desestructuración de objeto en clase Cliente */
export type ClienteType = {
    uid: string,
    cliente: string,
    cantidad_locales: number,
    cantidad_equipos: number, 
}


// Firestore data converter
export const ClienteConverter = {
  toFirestore: (cliente: Cliente) => {
      return {
        "uid": cliente.uid,
        "cliente": cliente.cliente,
        "cantidad_locales": cliente.cantidad_locales,
        "cantidad_equipos": cliente.cantidad_equipos, 
          };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>,
                  options: SnapshotOptions) => {
      const data = snapshot.data(options);
      return new Cliente(
        data['uid'],
        data['cliente'],
        data['cantidad_locales'],
        data['cantidad_equipos'],       
        );
  }
};
