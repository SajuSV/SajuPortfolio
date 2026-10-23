import { Component, ViewEncapsulation } from '@angular/core';
import { WorkAccordionComponent } from './work-accordion/work-accordion.component';

/** "Work in Focus" section: heading + accordion of the three work categories. */
@Component({
  selector: 'app-work',
  standalone: true,
  imports: [WorkAccordionComponent],
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display: block; width: 100%;' },
  templateUrl: './work.component.html',
  styleUrl: './work.component.css',
})
export class WorkComponent {}
