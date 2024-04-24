import { Injectable } from '@angular/core';
import { Pages } from '../models/pages.model';

/**
 * Este servicio podría ser mejorado obteniendo configuraciones de página desde el Firestore.
 * Por ahora, solo manejará el estado de un objeto Pages.
 */
@Injectable({
  providedIn: 'root'
})
export class PagesService {

  private page: Pages;
  constructor() { }

  setPage(page: Pages): Promise<Pages>{
    this.page = page;
    return new Promise(resolve => resolve(this.page));
  }

  getPage(): Promise<Pages>{
    return new Promise(resolve => resolve(this.page));
  }

}
