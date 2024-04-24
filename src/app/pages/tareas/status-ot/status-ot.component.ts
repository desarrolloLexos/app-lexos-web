import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { TareasService } from 'app/services/tareas.service';

@Component({
  selector: 'app-status-ot',
  templateUrl: './status-ot.component.html',
  styleUrls: ['./status-ot.component.scss']
})
export class StatusOtComponent implements OnInit {

  public showSearch:boolean = false;
  public searchText: string;
  public keywords = new Set(['angular', 'how-to', 'tutorial']);
  public formControl = new FormControl(['angular']);

  constructor(private tareasService: TareasService) { }

  ngOnInit(): void {
  }



  addKeywordFromInput(event: MatChipInputEvent) {
    if (event.value) {
      this.keywords.add(event.value);
      event.chipInput!.clear();
    }
  }

  removeKeyword(keyword: string) {
    this.keywords.delete(keyword);
  }
  //--------------------------------------------- Mantenedores

  hasChildrenFalse(){
    console.log('Iniciando...');
    this.tareasService.updateAllTaskHasChildren()
    .then( () => console.log('Listo...'))
    .catch( err => console.error(err));
}

deleteByFolio(){
  const folio = "60091";
  console.log('Iniciando delete folio ', folio);
  this.tareasService.deleteDocByFolio(folio)
    .then( () => console.log('Listo...'))
    .catch( err => console.error(err));
}

IdParentWoToNull(){
  console.log('Iniciando...');
  this.tareasService.updateAllTaskIdParantWo()
  .then( () => console.log('Listo...'))
  .catch( err => console.error(err));
}

changeStateFinallyWhenExistsWoFinalDate(){
  console.log('Iniciando...');
  this.tareasService.changeStateFinallyWhenExistsWoFinalDate()
  .then( () => console.log('Listo...'))
  .catch( err => console.error(err));
}

changeStatePendientePorRevisarWhenExistsHourFinal(){
  console.log('Iniciando...');
  this.tareasService.changeStatePendientePorRevisarWhenExistsHourFinal()
  .then( () => console.log('Listo...'))
  .catch( err => console.error(err));
}



}
