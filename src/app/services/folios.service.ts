import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, serverTimestamp, increment } from '@angular/fire/firestore';
import { FolioConverter } from '../models/folio.model';

@Injectable({
  providedIn: 'root'
})
export class FoliosService {

  constructor(private firestore: Firestore) { }

  async getFolioById(id: string) {
    const docRef = doc(this.firestore, "folios", id)
                  .withConverter(FolioConverter);
    const docSnap = await getDoc(docRef);

    return docSnap.data();
  }

  /**
   * Genera Folio para OT
   * @returns Numero de folio incrementado
   * @url https://firebase.google.com/docs/firestore/manage-data/add-data
   */
  async generarFolio(id: string) {
    const folioRef = doc(this.firestore, 'folios', id)
                      .withConverter(FolioConverter);

    // Atomically increment the folio by 1
    await updateDoc(folioRef, {
      numero: increment(1),
      timestamp: serverTimestamp()      
    }).then( () => {
      console.log('Folio generado correctamente.');
    }).catch( err => {
      console.error('Error al generar folio. ', err);
    })

    const docSnap = await getDoc(folioRef);
    return docSnap.data();
  }

}
