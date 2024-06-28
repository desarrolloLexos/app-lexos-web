import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class EmailService {
  constructor(private http: HttpClient) {}

  sendEmail(data: {
    folio: string;
    ceco: string;
    nombre: string;
    email: string[];
    pdfBase64: string;
  }) {
    return this.http.post(
      "https://us-central1-send-email-service-5195e.cloudfunctions.net/app/api/email-file",
      data
    );
  }
}
