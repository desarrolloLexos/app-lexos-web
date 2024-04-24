import * as actions from 'app/store/actions';

import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription, filter } from 'rxjs';
import { User, UserContacts, UserProfile, UserSettings, UserSocial, UserWork } from './user.model';

import { AppSettings } from '../../app.settings';
import { AppState } from 'app/store/app.reducers';
import { MatDialog } from '@angular/material/dialog';
import { Settings } from '../../app.settings.model';
import { Store } from '@ngrx/store';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { UsersService } from './users.service';
import { UsuariosService } from 'app/services/usuarios.service';
import { Usuario } from 'app/models/usuario.model';
import { AuthService } from 'app/services/auth.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { FileUploadService } from 'app/services/file-upload.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ UsersService ]
})
export class UsersComponent implements OnInit, OnDestroy {
    public urlImage: string = 'https://firebasestorage.googleapis.com/v0/b/lexos-app-tareas.appspot.com/o/';
    public userSubs?: Subscription;
    public users: Usuario[] // User[];
    public usuarios: Usuario[];
    public searchText: string;
    public page:any;
    public settings: Settings;
    public showSearch:boolean = false;
    public viewType:string = 'grid';
    public path: string = 'fotos-rrhh'; 
    public imageName: string;
    public uploadFotoPerfil: number = -1;

    constructor(public appSettings:AppSettings,
                public dialog: MatDialog,
                public usersService:UsersService,
                private usuarioService: UsuariosService,
                private authService: AuthService,
                private imageCompress: NgxImageCompressService,
                public fileUploadServive: FileUploadService,
                private _snackBar: MatSnackBar,
                private store: Store<AppState>){
        this.settings = this.appSettings.settings;
        this.store.dispatch(actions.setPages({page: {showTareasOT: false}}));

    }

    ngOnInit() {
        this.getUsers();
    }

    ngOnDestroy(): void {
      this.userSubs?.unsubscribe();
    }

    public async getUsers(): Promise<void> {
        this.users = null; //for show spinner each time
        // this.usersService.getUsers().subscribe(users => this.users = users);
        this.usuarios = await this.usuarioService.getUsuarios();
        this.users = this.usuarios;
    }
    public async addUser(user: Usuario, pass: string){
        // this.usersService.addUser(user).subscribe(user => this.getUsers());
        await this.authService.crearUsuario(user, pass);
        setTimeout( () => {this.getUsers();}, 2000);// Refresh         
    }
    public async updateUser(user:Usuario){
        await this.usuarioService.uploadUser(user);
        setTimeout( () => {this.getUsers();}, 2000);// Refresh
    }

    public deleteUser(user:Usuario){
    //    this.authService.
       this.usuarioService.borrarUsuario(user.uid);
    //    this.usersService.deleteUser(user.id).subscribe(user => this.getUsers());
    }

    public changeView(viewType){
        this.viewType = viewType;
        this.showSearch = false;
    }

    public onPageChanged(event){
        this.page = event;
        // this.getUsers();
        document.getElementById('main').scrollTop = 0;
    }

    public search(event){
        this.page = 1;
        // this.users = this.usuarios.filter(u => 
        //     u.name.toLocaleLowerCase().indexOf(event?.target?.value?.toLowerCase()) !== -1);
    }

    public openUserDialog(user){
        let dialogRef = this.dialog.open(UserDialogComponent, {
            data: user
        });
        dialogRef.afterClosed().subscribe(user => {
            if(user){
                console.log('User recibido de Modal => ', user);

                // Sube foto perfil a Cloud Storage
                if(user.tracking && user.tracking instanceof File){
                  user.path_image = this.guardaFotoPerfil(user.tracking, user);
                }   

                let usuario: Usuario;
                usuario = { ...usuario,
                    email: user.email,
                    id_person: user.id_person,
                    name: user.name,
                    rut: user.rut,
                    path_image: user.path_image,
                    path_signature: user.path_signature,
                    groups_permissions_description: user.permiso,
                    profiles_description: user.rol
                }           

                if(user?.uid){
                    this.updateUser(usuario);
                 }else{
                    // this.authService
                    usuario.active = true;
                    usuario.id_company = '2346';
                    usuario.last_date_forward_email = null;
                    usuario.platform = 'LexusAPP/0.1.0 web';
                    usuario.type_user = 'HUMAN_RESOURCES';
                    this.addUser(usuario, user.password);
                 }                  
            }
        });
        this.showSearch = false;
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
          duration: 2 * 1000,
        });
      }

    public guardaFotoPerfil(file: File, user: Usuario): string{
        const time = (new Date()).getTime();
        this.imageName = user.email.split('@')[0].concat('_',time.toString(), '.jpg');

        console.log('Preparando para guardar: ', this.imageName);
    
        var reader = new FileReader();
            reader.onload = (event: any) => {
              const localUrl = event.target.result;
              const orientation = -1;
              this.imageCompress.compressFile(localUrl, orientation, 50, 90, 640, 640)
                .then((result) => {
                  const metadata = { resizedImage: true };
                  const imageBlob = this.fileUploadServive.dataURItoBlob(result.split(',')[1]);
                  const uploadTask = this.fileUploadServive
                    .pushBlobToStorage(this.path, imageBlob, this.imageName, metadata)
                  uploadTask.on(
                    'state_changed', (snapshot) => { // Progreso de subida
                      this.uploadFotoPerfil = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    },
                    (error) => {
                      this.openSnackBar(error.message, "OK");
                      this.uploadFotoPerfil = -1;
                    },
                    () => { // Success
                        return this.path.concat('/', this.imageName);
                    //   getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    //     user.path_image = this.path.concat('/', this.imageName);                        
                    //   });
                    }
                  );
                }).catch( e => {
                  console.error('No se pudo guardar la foto.', e);                 
                });
    
            }
            reader.readAsDataURL(file);

            return this.path.concat('/', this.imageName);
      }

    cambiaEstado(user: Usuario){
        user.active = !user.active;
        this.updateUser(user);
    }

    obtenerURL(user: Usuario){
        let usuario = this.users?.find( usuario => usuario.id_person === user.id_person);        
        if(usuario?.path_image && usuario?.path_image?.length > 10){
            const nameImageAvatar = usuario.path_image.replace('/','%2F')?.concat('?alt=media');
            usuario.tracking = this.urlImage.concat(nameImageAvatar);
        } else {
            usuario = {...usuario, tracking: "assets/img/user-icon.png"};            
        }
        return usuario.tracking;
    }

    obtenerCargo(profiles_description: string){
        let cargo: string = '';
        switch(profiles_description){
            case 'PERSONALIZED': {cargo = 'Administrativo'; break;}
            case 'TECHNICAL': {cargo = 'Técnico'; break;}
            case 'SUPERVISOR': {cargo = 'Supervisor'; break;}
            case 'ADMINISTRATOR': {cargo ='Administrador'; break;}
            case 'STORAGE': {cargo = 'Bodeguero'; break;}
            default: cargo = 'Sin cargo';
          }
        return cargo;
    }

    obtenerBgColor(profiles_description: string){
        let cargo: string = '';
        switch(profiles_description){
            case 'PERSONALIZED': {cargo = 'gradient-purple'; break;}
            case 'TECHNICAL': {cargo = 'gradient-indigo'; break;}
            case 'SUPERVISOR': {cargo = 'gradient-amber'; break;}
            case 'ADMINISTRATOR': {cargo ='gradient-brown'; break;}
            case 'STORAGE': {cargo = 'gradient-teal'; break;}
            default: cargo = 'gradient-green';
          }
        return cargo;
    }

}
