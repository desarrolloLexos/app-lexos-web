import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { LocalesSucursalesService } from "app/services/locales-sucursales.service";
import Swal from "sweetalert2";
import { CreateClienteComponent } from "../ui/modal/create-cliente/create-cliente.component";
import { DialogComponentComponent } from "../ui/modal/dialog-component/dialog-component.component";

@Component({
  selector: "app-status-ot-v2",
  templateUrl: "./status-ot-v2.component.html",
  styleUrls: ["./status-ot-v2.component.scss"],
})
export class StatusOtV2Component implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  cargando: boolean = true;
  constructor(
    private localesSucursales: LocalesSucursalesService,
    public dialog: MatDialog
  ) {}

  TREE_DATA: any[] = [];

  ngOnInit() {
    this.loadClientesConSucursales();
  }

  loadClientesConSucursales() {
    this.localesSucursales.getClientesConSucursales().then((locales) => {
      console.log("LOCALES", locales);
      this.cargando = false;
      this.TREE_DATA = locales.map((cliente) => ({
        ...cliente,
        filteredSucursales: cliente.sucursales,
      }));
    });
  }

  applyFilter(event: Event, cliente: any) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    cliente.filteredSucursales = cliente.sucursales.filter(
      (sucursal: any) =>
        sucursal.nombre.toLowerCase().includes(filterValue) ||
        sucursal.ceco.toLowerCase().includes(filterValue)
    );
  }

  openDialog(action: string, sucursal: any, cliente: any, type: string): void {
    console.log("cliente", cliente);
    const dialogRef = this.dialog.open(DialogComponentComponent, {
      width: "450px",
      data: {
        email:
          type === "supervisor"
            ? sucursal.emailSupervisor
            : type === "sucursal"
            ? sucursal.emailSucursal
            : sucursal.emailSupervisorLexos,
        isEdit: action === "edit",
        type: type,
        uid: sucursal.uid, // Asegúrate de pasar el uid de la sucursal
        uidCliente: cliente.cliente.uid, // Asegúrate de pasar el uid del cliente
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("Dialog result:", result);
        if (result.type === "supervisor") {
          if (result.isEdit) {
            this.localesSucursales
              .editEmailSupervisor(result.email, result.uidCliente, result.uid)
              .then(() =>
                this.updateSucursalEmail(
                  cliente,
                  sucursal.uid,
                  result.email,
                  "emailSupervisor"
                )
              );
          } else {
            this.localesSucursales
              .addEmailSupervisor(result.email, result.uidCliente, result.uid)
              .then(() =>
                this.updateSucursalEmail(
                  cliente,
                  sucursal.uid,
                  result.email,
                  "emailSupervisor"
                )
              );
          }
        } else if (result.type === "sucursal") {
          if (result.isEdit) {
            this.localesSucursales
              .editEmailSucursal(result.email, result.uidCliente, result.uid)
              .then(() =>
                this.updateSucursalEmail(
                  cliente,
                  sucursal.uid,
                  result.email,
                  "emailSucursal"
                )
              );
          } else {
            this.localesSucursales
              .addEmailSucursal(result.email, result.uidCliente, result.uid)
              .then(() =>
                this.updateSucursalEmail(
                  cliente,
                  sucursal.uid,
                  result.email,
                  "emailSucursal"
                )
              );
          }
        } else if (result.type === "lexos") {
          if (result.isEdit) {
            this.localesSucursales
              .editEmailSupervisorLexos(
                result.email,
                result.uidCliente,
                result.uid
              )
              .then(() =>
                this.updateSucursalEmail(
                  cliente,
                  sucursal.uid,
                  result.email,
                  "emailSupervisorLexos"
                )
              );
          } else {
            this.localesSucursales
              .addemailSupervisorLexos(
                result.email,
                result.uidCliente,
                result.uid
              )
              .then(() =>
                this.updateSucursalEmail(
                  cliente,
                  sucursal.uid,
                  result.email,
                  "emailSupervisorLexos"
                )
              );
          }
        }
      }
    });
  }

  updateSucursalEmail(
    cliente: any,
    sucursalUid: string,
    email: string,
    emailType: string
  ) {
    const sucursal = cliente.sucursales.find((s: any) => s.uid === sucursalUid);
    if (sucursal) {
      sucursal[emailType] = email;
    }
  }
  eliminarSucursal(sucursal, cliente) {
    console.log(sucursal, cliente);
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Estás seguro de que quieres eliminar este cliente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    })
      .then((result) => {
        if (result.value) {
          this.cargando = true;
          this.localesSucursales
            .eliminarSucursal(sucursal, cliente)
            .then(() => {
              this.cargando = true;
              this.loadClientesConSucursales();
            });
        }
      })
      .catch((err) => {
        this.cargando = false;
        console.log("error", err);
      });
  }
  eliminarCliente(event: Event, cliente: any) {
    event.stopPropagation(); // Detener la propagación del evento

    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Estás seguro de que quieres eliminar este cliente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    })
      .then((result) => {
        if (result.value) {
          this.cargando = true;
          this.localesSucursales
            .eliminarCliente(cliente.cliente.uid)
            .then(() => {
              this.cargando = false;
              this.loadClientesConSucursales();
            });
        }
      })
      .catch((err) => {
        this.cargando = false;
        console.log("error", err);
      });
  }
  openDialogCreateCliente() {
    const dialogRef = this.dialog.open(CreateClienteComponent, {
      width: "450px",
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("Dialog result:", result);
      }
    });
  }
}
