import * as actions from './../store/actions';

import { Component, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PerfectScrollbarConfigInterface, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

import { AppSettings } from '../app.settings';
import { AppState } from '../store/app.reducers';
import { Contador } from '../models/contador.model';
import { MenuService } from '../theme/components/menu/menu.service';
import { Pages } from '../models/pages.model';
import { Settings } from '../app.settings.model';
import { select, Store } from '@ngrx/store';
import { take, skip } from 'rxjs';
import { rotate } from '../theme/utils/app-animation';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
  animations: [ rotate ],
  providers: [ MenuService ]
})
export class PagesComponent implements OnInit {
  @ViewChild('sidenav') sidenav:any;
  @ViewChild('backToTop') backToTop:any;
  @ViewChildren(PerfectScrollbarDirective) pss: QueryList<PerfectScrollbarDirective>;
  public optionsPsConfig: PerfectScrollbarConfigInterface = {};
  public settings:Settings;
  public showSidenav:boolean = false;
  public showInfoContent:boolean = false;
  public toggleSearchBar:boolean = false;
  private defaultMenu:string; //declared for return default menu when window resized
  public menus = ['vertical', 'horizontal'];
  public menuOption:string;
  public menuTypes = ['default', 'compact', 'mini'];
  public menuTypeOption:string;
  /* Variables locales para usar con el Store */
  public page: Pages;
  public contador: Contador;
  public tareasOCRecibidas: number = 0;
  constructor(public appSettings:AppSettings,
              public router:Router,
              private menuService: MenuService,
              private snackBar: MatSnackBar,
              private store: Store<AppState>){
    this.settings = this.appSettings.settings;
    this.store.dispatch(actions.cargarPages());    
  }

  ngOnInit() {
    this.optionsPsConfig.wheelPropagation = false;
    if(window.innerWidth <= 960){
      this.settings.menu = 'vertical';
      this.settings.sidenavIsOpened = false;
      this.settings.sidenavIsPinned = false;
    }
    this.menuOption = this.settings.menu;
    this.menuTypeOption = this.settings.menuType;
    this.defaultMenu = this.settings.menu;

    this.store.select('page').subscribe( ({page}) => {
        this.page = page;
    });
    this.store.select('contadores').subscribe( ({contador}) => {
      this.contador = contador;
    });
    this.store.select('tareas').subscribe( ({reporte}) => {
      this.tareasOCRecibidas = reporte?.length;
    });
  }

  ngAfterViewInit(){
    setTimeout(() => { this.settings.loadingSpinner = false }, 300);
    this.backToTop.nativeElement.style.display = 'none';
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.scrollToTop();
      }
      if(window.innerWidth <= 960){
        this.sidenav?.close();
      }
    });
    if(this.settings.menu == "vertical")
      this.menuService?.expandActiveSubMenu(this.menuService.getVerticalMenuItems());
  }

  public toggleSidenav(){
    this.sidenav.toggle();
  }

  public chooseMenu(){
    this.settings.menu = this.menuOption;
    this.defaultMenu = this.menuOption;
    if(this.menuOption == 'horizontal'){
      this.settings.fixedSidenav = false;
    }
    this.router.navigate(['/']);
  }

  public chooseMenuType(){
    this.settings.menuType = this.menuTypeOption;
  }

  public changeTheme(theme){
    this.settings.theme = theme;
  }

  public closeInfoContent(showInfoContent){
    this.showInfoContent = !showInfoContent;
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    if(window.innerWidth <= 960){
      this.settings.sidenavIsOpened = false;
      this.settings.sidenavIsPinned = false;
      this.settings.menu = 'vertical'
    }
    else{
      (this.defaultMenu == 'horizontal') ? this.settings.menu = 'horizontal' : this.settings.menu = 'vertical'
      this.settings.sidenavIsOpened = true;
      this.settings.sidenavIsPinned = true;
    }
  }

  public onPsScrollY(event){
    (event.target.scrollTop > 50) ? this.backToTop.nativeElement.style.display = 'flex' : this.backToTop.nativeElement.style.display = 'none';
  }

  public scrollToTop() {
    this.pss.forEach(ps => {
      if(ps.elementRef.nativeElement.id == 'main'){
        ps.scrollToTop(0,250);
      }
    });
  }

  public closeSubMenus(){
    if(this.settings.menu == "vertical"){
      this.menuService.closeAllSubMenus();
    }
  }

  // ---------------------------------- new
  buscando: boolean = false;
  buscar(input){
    this.buscando = true;
    // Cargamos en memoria la tarea
    this.store.dispatch( actions.cargarTareaOTByFolio({folio: input.target?.value}));
    
    this.store.pipe(select('tarea'), take(2), skip(1)).subscribe( (state) => {
      
        if(state && state.tareaOT?.wo_folio){
          setTimeout(() => {
            this.buscando = false;
            this.router.navigateByUrl('/', {skipLocationChange: true})
                       .then(() => this.router.navigate(['/', 'task', 'details'],
                                    { queryParams: { id: input.target?.value, from: 'pages'} }));           
          
          }, 1200);
        } else {
          this.snackBar.open("No existe el folio " + input.target?.value, "OK", {
            duration: 2 * 1000,
          });  
          setTimeout(() => {
            this.buscando = false;            
          }, 1200);
        }
    }); 

   
  }
}
