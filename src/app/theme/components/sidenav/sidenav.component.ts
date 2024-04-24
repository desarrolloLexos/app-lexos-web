import {
  AfterContentInit,
  Component,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import {
  Storage,
  getDownloadURL,
  getStorage,
  ref,
} from "@angular/fire/storage";
import { AuthService } from "app/services/auth.service";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { AppSettings } from "../../../app.settings";
import { Settings } from "../../../app.settings.model";
import { MenuService } from "../menu/menu.service";

@Component({
  selector: "app-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService],
})
export class SidenavComponent implements OnInit, AfterContentInit {
  public psConfig: PerfectScrollbarConfigInterface = {
    wheelPropagation: true,
  };
  public menuItems: Array<any>;
  public settings: Settings;
  public usuario: string;
  public email: string;
  public rol: string;
  public userImage = "assets/img/user-icon.png";

  constructor(
    public appSettings: AppSettings,
    public menuService: MenuService,
    public authService: AuthService,
    public storage: Storage
  ) {
    this.settings = this.appSettings.settings;
    this.usuario = authService.user?.name;
    this.email = authService.user?.email;
    this.rol = authService.user?.profiles_description;

    //localstorage
    localStorage.setItem(
      "permission",
      authService.user.groups_permissions_description
    );
    console.log("authService.user", authService.user);
  }

  async ngOnInit() {
    const fromDb = this.menuService.getVerticalMenuItems();
    const arr = fromDb || [];

    if (this.rol === "TECHNICAL" || this.rol === "GROCER") {
      this.menuItems = arr.filter(
        (item) =>
          item?.id !== 2 && // Status
          item?.id !== 5 && // Status
          item?.id !== 6 && // Reporte
          item?.id !== 10 &&
          item?.id !== 16 &&
          item?.id !== 18
      );
    } else if (this.rol === "PERSONALIZED") {
      this.menuItems = arr.filter(
        (item) => item?.id !== 2 && item?.id !== 10 && item?.id !== 16
      );
    } else if (this.rol === "SUPERVISOR") {
      this.menuItems = arr.filter(
        (item) => item?.id !== 2 && item?.id !== 16 && item?.id !== 17
      );
    } else if (this.rol === "STORAGE") {
      this.menuItems = arr.filter(
        (item) =>
          item?.id !== 2 &&
          item?.id !== 5 &&
          item?.id !== 6 && // Reporte
          item?.id !== 10 &&
          item?.id !== 16 &&
          item?.id !== 17 &&
          item?.id !== 18
      );
    } else {
      this.menuItems = arr;
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.cargarFotoPerfil();
    }, 1000);
  }

  private cargarFotoPerfil() {
    if (this.authService.user?.path_image) {
      if (this.authService.user.path_image.indexOf("https") !== -1) {
        this.userImage = this.authService.user?.path_image;
      } else {
        const storage = getStorage();
        const pathReference = ref(storage, this.authService.user?.path_image);
        if (pathReference) {
          getDownloadURL(ref(pathReference))
            .then((url) => {
              this.userImage = url;
            })
            .catch((err) =>
              console.error("imagen de usuario no encontrado. ", err)
            );
        }
      }
    }
  }

  ngDoCheck() {
    if (this.settings.fixedSidenav) {
      if (this.psConfig.wheelPropagation) {
        this.psConfig.wheelPropagation = false;
      }
    } else {
      if (!this.psConfig.wheelPropagation) {
        this.psConfig.wheelPropagation = true;
      }
    }
  }

  public closeSubMenus() {
    let menu = document.getElementById("vertical-menu");
    if (menu) {
      for (let i = 0; i < menu.children[0].children.length; i++) {
        let child = menu.children[0].children[i];
        if (child) {
          if (child.children[0].classList.contains("expanded")) {
            child.children[0].classList.remove("expanded");
            child.children[1].classList.remove("show");
          }
        }
      }
    }
  }
}
