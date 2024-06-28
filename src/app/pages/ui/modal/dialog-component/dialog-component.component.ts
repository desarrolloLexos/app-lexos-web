import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DialogComponent } from "../../dialog/dialog.component";

@Component({
  selector: "app-dialog-component",
  templateUrl: "./dialog-component.component.html",
  styleUrls: ["./dialog-component.component.scss"],
})
export class DialogComponentComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  emailValid: boolean = true;
  onCancel(): void {
    this.dialogRef.close();
  }
  onSave(): void {
    if (this.emailValid) {
      this.dialogRef.close(this.data);
    }
  }
  validateEmail(): void {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.emailValid = emailPattern.test(this.data.email);
  }
}
