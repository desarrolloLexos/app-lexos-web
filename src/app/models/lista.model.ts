
import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/firestore";

export class Lista {
  
  /* Forma corta de crear un modelo en typescript */
  constructor(
    public nombre: string
  ){}
}

// Firestore data converter
export const ListaConverter = {
    toFirestore: (lista: Lista) => {
        return {
          "nombre": lista.nombre,
        };
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>,
                    options: SnapshotOptions) => {
        const data = snapshot.data(options);
        return new Lista(
          data['nombre'],
          );
    }
  };
  