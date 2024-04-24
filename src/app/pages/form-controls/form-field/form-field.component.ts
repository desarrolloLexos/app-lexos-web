import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html'
})
export class FormFieldComponent {
  options: UntypedFormGroup;
  email = new UntypedFormControl('', [Validators.required, Validators.email]);
  hide:boolean = true;
  themingForm: UntypedFormGroup;
  public settings: Settings;
  constructor(public appSettings:AppSettings, public formBuilder:UntypedFormBuilder) {
    this.settings = this.appSettings.settings;     
  }

  ngOnInit(){
    this.options = this.formBuilder.group({
      hideRequired: false,
      floatLabel: 'auto',
    });
    this.themingForm = this.formBuilder.group({
      'color': 'primary',
      'fontSize': [16, Validators.min(10)],
    });
  }
  
  getErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a value' :
        this.email.hasError('email') ? 'Not a valid email' :
            '';
  }

  getFontSize() {
    return Math.max(10, this.themingForm.value.fontSize);
  }

}