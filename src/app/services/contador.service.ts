import { Firestore, doc, getDoc } from '@angular/fire/firestore';

import { ContadorConverter } from '../models/contador.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContadorService {

  constructor(private firestore: Firestore) { }

  async getContadorById(id: string) {
    const docRef = doc(this.firestore, "contadores", id)
                  .withConverter(ContadorConverter);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
    return docSnap.data();
  }


}
