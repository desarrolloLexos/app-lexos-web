import { Storage, deleteObject, listAll, ref, uploadBytesResumable, getDownloadURL, getStorage, getBlob, getMetadata, uploadBytes, uploadString } from '@angular/fire/storage';

import { FileUpload } from '../models/file-upload.model';
import { Injectable } from '@angular/core';
import { Store, UPDATE } from '@ngrx/store';
import { AppState } from '../store/app.reducers';
import { isLoading } from 'app/store/actions';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(
    private storage: Storage,
    private store: Store<AppState>) { }

  /**
   * Coloca el archivo en el Firestore Storage
   * @param path Ruta en donde estará el archivo.
   * @param fileUpload Objeto con archivo y nombre especificado.
   * @returns
   */
  public pushFileToStorage(
    path: string,
    fileUpload: FileUpload) {
    const filePath = `${path}/${fileUpload.file.name}`;

    if (fileUpload) {
      this.store.dispatch(isLoading());
      const imgRef = ref(this.storage, filePath);

      // Desarrollar en el componente que invoca la lógica de porcentaje y finalizar.
      // https://firebase.google.com/docs/storage/web/upload-files?hl=es&authuser=0
      return uploadBytesResumable(imgRef, fileUpload.file);
    }
  }

  public pushBlobToStorage(path: string, blob: Blob, name: string, metadata?: any){
    const filePath = `${path}/${name}`;
    if (blob) {
      this.store.dispatch(isLoading());
      const imgRef = ref(this.storage, filePath);
      if(metadata){
        return uploadBytesResumable(imgRef, blob, metadata);
      }else{
        return uploadBytesResumable(imgRef, blob);
      }
    }
  }

  public pushBlobToStorageFullPath(pathWithName: string, blob: Blob, metadata?: any){
    if (blob) {
      this.store.dispatch(isLoading());
      const imgRef = ref(this.storage, pathWithName);
      if(metadata){
        return uploadBytesResumable(imgRef, blob, metadata);
      }else{
        return uploadBytesResumable(imgRef, blob);
      }
    }
  }

  public pushBase64ToStorage(path: string, base64: string, name: string){
    const filePath = `${path}/${name}`;
    if(base64){
      this.store.dispatch(isLoading());
      const imgRef = ref(this.storage, filePath);
      return uploadString(imgRef, base64, 'data_url');
    }
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }


  public getImages(path: string) {
    const imgRef = ref(this.storage, path);
    return listAll(imgRef);
  }


  public deleteFile(path: string, fileUpload: FileUpload): void {
    // Create a reference to the file to delete
    const desertRef = ref(this.storage, `${path}/${fileUpload.name}`);

    // Delete the file
    deleteObject(desertRef).then(() => {
      // File deleted successfully
      console.log('Archivo eliminado correctamente.');
    }).catch((error) => {
      // Uh-oh, an error occurred!
      console.error('No se pudo eliminar el archivo. ', error);
    });
  }

 /**
  * Elimina un archivo del Storage dado su URL.
  * @param url URL
  * @returns Promise<void | error>
  */
  public deleteFileByURL(url: string) {
    const urlRef = ref(this.storage, url);
   return  deleteObject(urlRef);
  }

  public getURLByReference(path: string) {
    // Create a reference to the file we want to download
    const storage = getStorage();
    const starsRef = ref(storage, path);

    // Get the download URL
    return getDownloadURL(starsRef);
  }

  public async compressFileByURL(url: string){
    const urlRef = ref(this.storage, url);
    const metadata = await getMetadata(urlRef);
    
    getBlob(urlRef).then( (blobFile) => {
      const $canvas = document.createElement("canvas");
      const imagen = new Image();
      imagen.onload = () => {
        $canvas.width = imagen.width;
        $canvas.height = imagen.height;
        $canvas.getContext("2d").drawImage(imagen, 0, 0);
        $canvas.toBlob(
          (blob) => {
            if (blob !== null) {
              uploadBytes(urlRef, blob).then( (result) => {
                console.log('archivo actualizado', result.metadata);
              })
            } else {
              console.log('No se pudo actualizar el archivo');
            }
          },
          "image/jpeg",
          20 / 100
        );
      };
      imagen.src = URL.createObjectURL(blobFile);
    });
  }
}
