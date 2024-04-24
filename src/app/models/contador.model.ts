import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/firestore";

export class Contador {

  /* Forma corta de crear un modelo en typescript */
  constructor(
    public total: number
  ){}
}


// Firestore data converter
export const ContadorConverter = {
  toFirestore: (count: Contador) => {
      return {
        "total": count.total,
      };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>,
                  options: SnapshotOptions) => {
      const data = snapshot.data(options);
      return new Contador(
        data['total'],
        );
  }
};
