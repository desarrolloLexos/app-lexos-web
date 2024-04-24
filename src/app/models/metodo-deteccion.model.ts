import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/firestore";

export class MetodoDeteccion {

  /* Forma corta de crear un modelo en typescript */
  constructor(
    public id: number,
    public id_company: number, 
    public description: string,
    public enabled: boolean, 
  ){}
}

/* Tipo que permite usar desestructuración de objeto en clase MetodoDeteccion */
export type MetodoDeteccionType = {
        id: number,
        id_company: number, 
        description: string,
        enabled: boolean,
}


// Firestore data converter
export const MetodoDeteccionConverter = {
  toFirestore: (tipo: MetodoDeteccion) => {
      return {
        "id": tipo.id ,
        "id_company": tipo.id_company , 
        "description": tipo.description ,
        "enabled": tipo.enabled , 
          };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>,
                  options: SnapshotOptions) => {
      const data = snapshot.data(options);
      return new MetodoDeteccion(
        data['id'],
        data['id_company'],
        data['description'],
        data['enabled'],
               
        );
  }
};
