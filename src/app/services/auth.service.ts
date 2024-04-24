import * as actions from '../store/actions';

import {
         Auth,
         authState,
         createUserWithEmailAndPassword,
         deleteUser,
         signInWithEmailAndPassword,
         signOut,
         User
} from '@angular/fire/auth';
import { Firestore, Unsubscribe, collection, doc, getDocs, query, where, addDoc } from '@angular/fire/firestore';
import { Usuario, UsuarioConverter } from '../models/usuario.model';

import { AppState } from '../store/app.reducers';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  unsubscribe!: Unsubscribe;

  private _user: Usuario | null = null;
  private _loadInitAuthListener: boolean = false; 
  private _userID: string;
  private _canViewOT = false;
  private _canEditOT = false;
  private _canCreateOT = false;
  // ----------------------------------
  private _esTecnico: boolean = false;
  private _esPersonalized: boolean = false;
  private _esSupervisor: boolean = false;
  private _esAdministrador: boolean = false;
  private _esBodeguero: boolean = false;
  public urlImage: string = 'https://firebasestorage.googleapis.com/v0/b/lexos-app-tareas.appspot.com/o/';

  constructor(public auth: Auth,
              public firestore: Firestore,
              private store: Store<AppState>) {
   }

  get user(){
    return this._user;
  }

  get userID(){
    return this._userID;
  }

  get canViewOT(){
    return this._canViewOT;
  }

  get canEditOT(){
    return this._canEditOT;
  }

  get canCreateOT(){
    return this._canCreateOT;
  }

  get esTecnico(){
    return this._esTecnico;
  }
  get esPersonalized(){
    return this._esPersonalized;
  }
  get esSupervisor(){
    return this._esSupervisor;
  }
  get esAdministrador(){
    return this._esAdministrador;
  }
  get esBodeguero(){
    return this._esBodeguero;
  }

  /**
   * Indica si ya se cargó el initAuthListener.
   * Será usado por LOGIN para detectar usuarios previamente identificados y que han mantenido la sesión.
   */
  get loadInitAuthListener(){
    return this._loadInitAuthListener;
  }

  initAuthListener(){
    return authState(this.auth).subscribe( async fuser => {
      this._loadInitAuthListener = true;
      if(fuser){  // fuser tiene información parcial del usuario pero no el nombre.        
          this.cargarUsuario(fuser);
      }
      else{
        console.log('cancelando subscrición user...');
        if(this.unsubscribe) this.unsubscribe(); // Stop listening to changes
        this._user = null;
        this.store.dispatch( actions.unSetUser());        
      }

    });
  }

  async cargarUsuario(fuser: User) {
    console.log('buscando usuario por id: ', fuser.uid);
    // Por lo que debemos consultar a firestore por el documento para obtener el nombre:
    const q = query(collection(this.firestore, "usuarios").withConverter(UsuarioConverter),
      where("uid", "==", fuser.uid));
    const querySnapshot = await getDocs(q);
    if (querySnapshot) {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        const usuario: Usuario = doc.data();
        this._user = usuario;
        this._userID = doc.id;
        
        switch(usuario?.profiles_description){
          case 'TECHNICAL': 
                this._esTecnico = true; 
                this._canEditOT = true;
                this._canViewOT = true;
                break;
          case 'PERSONALIZED': 
                this._esPersonalized = true;
                this._canCreateOT = true;
                this._canViewOT = true;
                break;
          case 'SUPERVISOR': 
                this._esSupervisor = true; 
                this._canCreateOT = true;
                this._canEditOT = true;
                break;
          case 'ADMINISTRATOR': 
                this._esAdministrador = true; 
                this._canCreateOT = true;
                this._canEditOT = true;
                this._canViewOT = true;                
                break;
          case 'STORAGE':
            this._esBodeguero = true; 
            this._canCreateOT = false;
            this._canEditOT = false;
            this._canViewOT = true; 
          default: console.log('Es ', usuario?.profiles_description);
        }

        if(usuario?.path_image){
          const nameImageAvatar = usuario.path_image.replace('/','%2F')?.concat('?alt=media');
          usuario.path_image = this.urlImage.concat(nameImageAvatar);
        }

        if(usuario?.path_signature){
          const nameImageSign = usuario.path_signature.replace('/','%2F')?.concat('?alt=media');
          usuario.path_signature = this.urlImage.concat(nameImageSign);
        }

        this.store.dispatch(actions.setUser({ user: usuario }));        
      });
      return true;   
    } else {
      console.log("Usuario no encontrado!");
      this._user = null;
      this.store.dispatch(actions.unSetUser());
      return false;
    }
  }

  crearUsuario(usuario: Usuario, password: string): Promise<any> {
    return createUserWithEmailAndPassword(this.auth, usuario.email, password)
    .then(  async ({ user }) => {
        console.log('usuario registrado', user);      
        usuario.uid = user.uid;
        usuario.id_person = (new Date()).getTime();
         const notesRef = collection(this.firestore, 'usuarios');
         return await addDoc(notesRef, usuario);
      }
    )
  }

  borraUsuario(usuario: Usuario){
    
    // deleteUser()
  }


  login(email: string, password: string){
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout(){
    return signOut(this.auth);
  }

  isAuth(){
    return authState(this.auth).pipe(
      map(fUser => (fUser !== null))
    )
  }


}
