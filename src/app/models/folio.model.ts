
import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/firestore";

export class Folio {
  
  /* Forma corta de crear un modelo en typescript */
  constructor(
    public numero: number,
    public timestamp: string
  ){}
}

// Firestore data converter
export const FolioConverter = {
    toFirestore: (folio: Folio) => {
        return {
          "numero": folio.numero,
          "timestamp": folio.timestamp
        };
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>,
                    options: SnapshotOptions) => {
        const data = snapshot.data(options);
        return new Folio(
          data['numero'],
          data['timestamp'],          
          );
    }
  };
  