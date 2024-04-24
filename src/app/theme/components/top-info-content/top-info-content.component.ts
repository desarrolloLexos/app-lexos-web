import { NgSignaturePadOptions, SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { Component, OnInit, Input, Output, EventEmitter, AfterContentInit, ViewChild, AfterViewInit  } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Usuario } from 'app/models/usuario.model';
import { AuthService } from 'app/services/auth.service';
import { UsuariosService } from 'app/services/usuarios.service';
import { UtilitarioService } from 'app/services/utilitario.service';
import { AppState } from 'app/store/app.reducers';
import { filter, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { emailValidator } from '../../utils/app-validators';

@Component({
  selector: 'app-top-info-content',
  templateUrl: './top-info-content.component.html',
  styleUrls: ['./top-info-content.component.scss']
})
export class TopInfoContentComponent implements OnInit, AfterContentInit, AfterViewInit {
  @Input('showInfoContent') showInfoContent:boolean = false;
  @Output() onCloseInfoContent: EventEmitter<any> = new EventEmitter();
 
  @ViewChild('signatureUser')
  public signaturePad: SignaturePadComponent;
  public firmaBase64: string;
  public editarFirma: boolean = false;

  // Configuración de firma canvas:
  public signaturePadOptions: NgSignaturePadOptions = { // passed through to szimek/signature_pad constructor
    minWidth: 0.25,
    canvasWidth: 300,
    canvasHeight: 150,
    backgroundColor: "#fff",
    dotSize: 0.25
  };

  contactForm: UntypedFormGroup;
  controls = [
    { name: 'Notifications', checked: true },
    { name: 'Tasks', checked: true },
    { name: 'Events', checked: false },
    { name: 'Downloads', checked: true },
    { name: 'Messages', checked: true },
    { name: 'Updates', checked: false },
    { name: 'Settings', checked: true }
  ];

  public userImage = "assets/img/user-icon.png";
  public signImage = "assets/img/lienzo.png";
  
  usuario?: Usuario | null;
  usuarioSubs: Subscription;
  nombre: String;
  cargo: String;

  constructor(public formBuilder: UntypedFormBuilder,
              public utilitarioService: UtilitarioService,
              private usuarioService: UsuariosService,
              private authService: AuthService,
              private store: Store<AppState>) { }

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, emailValidator])],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });

    this.usuarioSubs = this.store.select('user')
                                  .pipe( filter( ({user}) => user != null))
                                  .subscribe( ({user}) => this.usuario = user);
  }

  ngAfterContentInit(): void {
    const vectorNombre = this.usuario?.name.split(' ');
    this.nombre = vectorNombre.filter( (_, index) => index !== 1)?.join(' ');
    switch(this.usuario?.profiles_description){
      case 'PERSONALIZED': {this.cargo = 'ADMINISTRATIVO'; break;}
      case 'TECHNICAL': {this.cargo = 'TÉCNICO'; break;}
      case 'SUPERVISOR': {this.cargo = 'SUPERVISOR'; break;}
      case 'ADMINISTRATOR': {this.cargo = 'ADMINISTRADOR'; break;}
      case 'STORAGE': {this.cargo = 'BODEGUERO'; break;}
      default: this.cargo = 'SIN CARGO';
    }
    if(this.usuario?.path_image){
      this.userImage = this.usuario?.path_image;
    }

    if(this.usuario?.path_signature){
      this.signImage = this.usuario?.path_signature;
    }
  }

  ngAfterViewInit(): void {
    this.signaturePad?.set('minWidth', 0.3); // set szimek/signature_pad options at runtime
    this.signaturePad?.clear(); // invoke functions from szimek/signature_pad API
  }

  public onContactFormSubmit(values:Object):void {
    if (this.contactForm.valid) {
      console.log(values);
    }
  }

  public closeInfoContent(event){
    this.onCloseInfoContent.emit(event);
  }

  /**
 * Notifica que la firma inició
 * @param event
 */
  drawStart(event: MouseEvent | Touch) {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('Start drawing', event);
  }

  downloadSignature(dataURL: any, nombreArchivo: string) {
    if (navigator.userAgent.indexOf('Safari') > -1
      && navigator.userAgent.indexOf('Chrome') === -1) {
      window.open(dataURL);
    } else {
      const blob = this.URLtoBlob(dataURL);
    }
  }

  /** Convierte el dato URL del canvas, en un texto de base64 */
  URLtoBlob(dataURL: any) {
    const partes = dataURL.split(';base64');
    const contentType = partes[0].split(':')[1];
    const raw = window.atob(partes[1]);
    const rawL = raw.length;
    const array = new Uint8Array(rawL);
    for (let i = 0; i < rawL; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return new Blob([array], { type: contentType });
  }

  save() {
    console.log('Preparando a guardar', this.signaturePad.toDataURL());
    if(this.utilitarioService.checkSignatureWhite(
      this.signaturePad.toDataURL()
     )){
      this.usuarioService.uploadUserSign(this.signaturePad.toDataURL(), this.usuario.id_person)
      .then( (url) => {
          const nameImageSign = url.replace('/','%2F')?.concat('?alt=media');
          this.signImage =  this.authService.urlImage.concat(nameImageSign, '&random+\=' + Math.random());          
      })
      .catch( (err) => {
        console.error('Error al firmar', err);
      });
    } else {
      Swal.fire('Firma vacía', 'No se detectó firma en el cuadro, limpie y firme de nuevo.', 'error');
    }
    this.editarFirma = false;
  }

}
