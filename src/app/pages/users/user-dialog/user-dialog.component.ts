import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import { Usuario } from 'app/models/usuario.model';
import { UsuariosService } from 'app/services/usuarios.service';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  public form:UntypedFormGroup;
  public passwordHide:boolean = true;
  public colors = [
    {value: 'gradient-purple', viewValue: 'Purple'},
    {value: 'gradient-indigo', viewValue: 'Indigo'},
    {value: 'gradient-teal', viewValue: 'Teal'},
    {value: 'gradient-blue', viewValue: 'Blue'},
    {value: 'gradient-orange', viewValue: 'Orange'},
    {value: 'gradient-green', viewValue: 'Green'},
    {value: 'gradient-pink', viewValue: 'Pink'},
    {value: 'gradient-red', viewValue: 'Red'},
    {value: 'gradient-amber', viewValue: 'Amber'},
    {value: 'gradient-gray', viewValue: 'Gray'},
    {value: 'gradient-brown', viewValue: 'Brown'},
    {value: 'gradient-lime', viewValue: 'Lime'}
  ];
  public permisos = [
    {value: 'Administración Lexos', viewValue: 'Administración Lexos'},
    {value: 'Administrator', viewValue: 'Administrator'},
    {value: 'Bodega Lexos', viewValue: 'Bodega Lexos'},
    {value: 'Supervisores Lexos', viewValue: 'Supervisores Lexos'},
    {value: 'Técnicos Lexos', viewValue: 'Técnicos Lexos'},
  ];
  public roles = [
    {value: 'ADMINISTRATOR', viewValue: 'Administrador'},
    {value: 'PERSONALIZED', viewValue: 'Administrativo'},
    {value: 'STORAGE', viewValue: 'Bodeguero'},
    {value: 'SUPERVISOR', viewValue: 'Supervisor'},
    {value: 'TECHNICAL', viewValue: 'Técnico'},
  ];

  public file: File;
  public imageURL: string;
  uploadFotoPerfil: any;

  constructor(public dialogRef: MatDialogRef<UserDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public   user: Usuario,
              public fb: UntypedFormBuilder,             
              private usuarioService: UsuariosService) {
    this.form = this.fb.group({
      uid: null,
      id_person: null,
      email: [null, Validators.compose([Validators.required, Validators.minLength(5)])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(6)])],       
      name: [null, Validators.compose([Validators.required, Validators.minLength(5)])],
      rut: null,
      // surname: null,  
      // birthday: null,
      // gender: null,
      // image: null,
      path_image: null,
      path_signature: null,
      active: null,
      permiso: null,
      rol: null,
      tracking: null,
      // work: this.fb.group({
      //   company: null,
      //   position: null,
      //   salary: null
      // }),
      // contacts: this.fb.group({
      //   // email: null,
      //   phone: null,
      //   address: null          
      // }),
      // social: this.fb.group({
      //   facebook: null,
      //   twitter: null,
      //   google: null
      // }),
      // settings: this.fb.group({
      //   isActive: null,
      //   isDeleted: null,
      //   registrationDate: null,
      //   joinedDate: null,
      //   bgColor: null
      // })
    });
  }

  ngOnInit() {
    this.file = undefined;

    console.log('Editar el user', this.user);
    if(this.user && this.user.uid){
      this.form.reset();
      this.form.controls.uid.setValue(this.user.uid);
      this.form.controls.email.setValue(this.user.email);
      this.form.controls.password.setValue('password');
      this.form.controls.name.setValue(this.user.name);
      this.form.controls.id_person.setValue(this.user.id_person);
      this.form.controls.rut.setValue(this.user.rut);
      this.form.controls.path_image.setValue(this.user.path_image);
      this.form.controls.path_signature.setValue(this.user.path_signature);      
      this.form.controls.active.setValue(this.user.active);
      this.form.controls.permiso.setValue(this.user.groups_permissions_description);
      this.form.controls.rol.setValue(this.user.profiles_description);
      this.imageURL = this.user.tracking;
    }   
  }

  close(): void {
    this.dialogRef.close();
  }

  async onFotoPerfilChange(event: any) {   
    console.log('datos de la foto perfil a subir', event); 
    if (event.target?.files[0] instanceof File) {
       
        this.file = event.target?.files[0];       
        
        this.form.patchValue({
          tracking: this.file
        });
        this.form.get('tracking').updateValueAndValidity()

       // File Preview
        const reader = new FileReader();
        reader.onload = () => {
          this.imageURL = reader.result as string;
        }
        reader.readAsDataURL(this.file);
    }
  }

}
