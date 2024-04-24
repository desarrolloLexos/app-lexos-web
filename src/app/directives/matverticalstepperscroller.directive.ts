import { Directive, HostListener } from '@angular/core';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';

@Directive({
  selector: '[appMatVerticalStepperScroller]',
})
export class MatVerticalStepperScrollerDirective {
  constructor(private stepper: MatStepper) {}

  @HostListener('selectionChange', ['$event'])
  selectionChanged(selection: StepperSelectionEvent) {
    const stepId = this.stepper._getStepLabelId(selection.selectedIndex - 1);
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
      setTimeout(() => {
        stepElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
      }, 250);
    }
  }
}