import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/firestore";

export class CheckList {

  /* Forma corta de crear un modelo en typescript */
  constructor(
    public checklist: Check[],
    public mes: string, 
    public periodo: number,
    public tipo: string, 
    public opciones?: string | Opcion[],
    public observaciones?: string,
    public local?: string,
    public orden?: number,
    public fotos?: Foto[],
  ){}
}

export class Check {
  constructor(
    public numero: number,
    public actividad: string,
    public checklist: string,
  ){}
}

export class Opcion {
  constructor(
     public titulo: string,
     public contenido: string
  ){}
}

export class Foto {
  constructor(
    public url: string,
    public estado: string
  ){}
}

/* Tipo que permite usar desestructuración de objeto en clase CausaFalla */
export type CheckListType = {
        checklist: string | any,
        mes: string, 
        periodo: number,
        tipo: string,
        opciones: string | any,
        observaciones: string,
        local: string,
        orden: number,
        fotos: string | any,
}


// Firestore data converter
export const CheckListConverter = {
  toFirestore: (tipo: CheckList) => {
      return {
        "checklist": tipo.checklist ,
        "mes": tipo.mes , 
        "periodo": tipo.periodo ,
        "tipo": tipo.tipo , 
        "opciones": tipo.opciones,
        "observaciones": tipo.observaciones,
        "local": tipo.local,
        "orden": tipo.orden,
        "fotos": tipo.fotos
          };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>,
                  options: SnapshotOptions) => {
      const data = snapshot.data(options);
      return new CheckList(
        data['checklist'],
        data['mes'],
        data['periodo'],
        data['tipo'],
        data['opciones'],
        data['observaciones'],
        data['local'],
        data['orden'],
        data['fotos'],
               
        );
  }
};
