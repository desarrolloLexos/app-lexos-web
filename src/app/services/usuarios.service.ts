import * as actions from '../store/actions';

import { Firestore, Unsubscribe, addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, getDocs, where, limit, collectionData, setDoc, updateDoc } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadString, uploadBytes, deleteObject } from '@angular/fire/storage';
import { AppState } from '../store/app.reducers';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Usuario, UsuarioConverter } from '../models/usuario.model';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  unsubscribe!: Unsubscribe;

  constructor(
    private firestore: Firestore,
    private storage: Storage) {
  }

  async getUsuarios(){
    const docRef = query(collection(this.firestore, "usuarios")
                   .withConverter(UsuarioConverter),
                    orderBy("name", "asc"));
    const docSnap = await getDocs(docRef);
    const usuarios: Usuario[] = [];
    docSnap.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      usuarios.push(doc.data());
    });
    return usuarios;
  }
  
  async getUsuarioByPersonId(id_person: number){
    const docRef = query(collection(this.firestore, "usuarios")
                         .withConverter(UsuarioConverter),
                         where('id_person','==',id_person), 
                         limit(1));
    return (await getDocs(docRef)).docs.map( (a) => a.data())[0];
  }

  async getUsuarioByFullName(fullName: string){
    const docRef = query(collection(this.firestore, "usuarios")
                         .withConverter(UsuarioConverter),
                         where('name','==',fullName), 
                         limit(1));
    return (await getDocs(docRef)).docs.map( (a) => a.data())[0];
  }

  unsubscribeUsuariosListener(){
    if(this.unsubscribe) this.unsubscribe();
  }

  borrarUsuario(uid: string){
    return deleteDoc(doc(this.firestore, "usuarios", uid));
  }

  getReponsables(): Observable<Usuario[]> {
    const q = query(
      collection(this.firestore, 'usuarios').withConverter(
        UsuarioConverter
      ),
      where('profiles_description', '==', 'TECHNICAL'),     
      orderBy("name", "asc"),
      limit(1000)
    );

    return collectionData(q, { idField: 'uid' }) as Observable<Usuario[]>;
  }


  async uploadUserImage(cameraFile: string, id_person: number) {
    const path = `fotos-rrhh/${id_person}.jpg`;
    const storageRef = ref(this.storage, path);
 
    try {
      await uploadString(storageRef, cameraFile, 'base64');
 
      const imageUrl = await getDownloadURL(storageRef);
 
      const userDocRef = doc(this.firestore, `usuarios/${id_person}`);
      await setDoc(userDocRef, {
        path_image: path
      });
      return imageUrl;
    } catch (e) {
      return null;
    }
  }


  async uploadUserSign(cameraFile: string, id_person: number) {
    console.log('Preparanfo guardar firma de id_person: ', id_person);
    const path = `fotos-rrhh/${id_person}.png`;
    const storageRef = ref(this.storage, path);
 
    try {
      await uploadString(storageRef, cameraFile, 'data_url')
      .catch( (err) => console.error(err));
 
      // const imageUrl = await getDownloadURL(storageRef);
 
      const userDocRef = query(collection(this.firestore, "usuarios")
                         .withConverter(UsuarioConverter),
                         where('id_person','==',id_person), 
                         limit(1));

      const docSnap = await getDocs(userDocRef);

      await updateDoc(docSnap.docs[0].ref, { path_signature: path});
     
      return path;
    } catch (e) {
      return null;
    }
  }

  async uploadUser(user: Usuario) {    
    const docRef = query(collection(this.firestore, "usuarios")
                         .withConverter(UsuarioConverter),
                         where('id_person','==',user.id_person), 
                         limit(1));
    const docSnap = await getDocs(docRef);
    
    docSnap.forEach(async (doc) => {
      await updateDoc(doc.ref, {...user});
    });
  }
}
