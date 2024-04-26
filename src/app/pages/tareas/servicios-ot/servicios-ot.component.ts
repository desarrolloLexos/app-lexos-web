import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { TareaOT } from "app/models/tarea-ot.model";
import { AuthService } from "app/services/auth.service";
import { TareasService } from "app/services/tareas.service";
import * as actions from "app/store/actions";
import { AppState } from "app/store/app.reducers";

@Component({
  selector: "app-servicios-ot",
  templateUrl: "./servicios-ot.component.html",
  styleUrls: ["./servicios-ot.component.scss"],
})
export class ServiciosOtComponent implements OnInit {
  tareas: TareaOT[] = [];

  error: any;
  loaded: boolean = false;
  loading: boolean = true;
  permission: boolean = true;
  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private route: Router,
    private tareasServices: TareasService
  ) {
    if (
      this.authService.esAdministrador ||
      this.authService.esSupervisor ||
      this.authService.esPersonalized ||
      this.authService.esBodeguero
    ) {
      this.store.dispatch(actions.getTareasOTAssignedAndPending());
    } else {
      this.store.dispatch(
        actions.getTareasOTByIdAssignerUser({
          person_id: this.authService.user.id_person,
        })
      );
    }
  }
  menuOpened(type: number, username: string, otNumber: string) {
    console.log("ok", type, username, otNumber);
    this.tareasServices
      .updateTarea(type, username, otNumber)
      .then(() => {
        this.loading = false;
        // La tarea se actualizó correctamente
        this.reloadTable(); // Se llama para recargar la tabla
      })
      .catch((error) => {
        // Manejo del error
        console.error("Error al actualizar la tarea", error);
      });
  }

  ngOnInit(): void {
    this.permission = localStorage.getItem("permission") === "Administrator";
    this.loading = true;
    this.reloadTable();
    this.loading = false;
  }

  public getRecord(tarea: TareaOT): void {
    this.route.navigate(["/", "task", "details"], {
      queryParams: { id: tarea.id },
    });
  }

  reloadTable() {
    // Aquí disparas la acción para cargar las tareas del servidor
    if (
      this.authService.esAdministrador ||
      this.authService.esSupervisor ||
      this.authService.esPersonalized ||
      this.authService.esBodeguero
    ) {
      this.store.dispatch(actions.getTareasOTAssignedAndPending());
    } else {
      this.store.dispatch(
        actions.getTareasOTByIdAssignerUser({
          person_id: this.authService.user.id_person,
        })
      );
    }

    // Suscripción al store de NgRx para recibir las tareas actualizadas
    this.store.select("tareas").subscribe((state) => {
      // ... Lógica para manejar el estado de las tareas ...
      this.tareas = state.tareas; // Asegúrate de que este estado esté actualizado
    });
  }
}
