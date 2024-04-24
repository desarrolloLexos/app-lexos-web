import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common'

@Component({
  selector: 'app-content-header',
  templateUrl: './content-header.component.html',
  styleUrls: ['./content-header.component.scss']
})
export class ContentHeaderComponent implements OnInit {
  @Input('icon') icon:any;
  @Input('title') title:any;
  @Input('desc') desc:any;
  @Input('hideBreadcrumb') hideBreadcrumb:boolean = false;
  @Input('hasBgImage') hasBgImage:boolean = false;
  @Input('class') class:any;
  @Input('backButton') backButton: boolean = false;
  constructor(private location: Location) { }

  ngOnInit() {
  }

  back(): void {
    this.location.back();
  }

}


