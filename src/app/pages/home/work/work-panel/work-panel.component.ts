import { Component, ViewEncapsulation, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkItem } from '../work.data';

/**
 * One accordion card. Attribute component so the <article class="acc-panel"> stays a direct
 * flex child of .acc:
 *   <article class="acc-panel" tabindex="0" appWorkPanel [item]="item"></article>
 * The open/close class (`is-open`) is toggled by WorkAccordionComponent.
 */
@Component({
  selector: '[appWorkPanel]',
  standalone: true,
  imports: [RouterLink],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[attr.aria-label]': 'item().title',
    '[style.--img]': '"url(\'" + item().img + "\')"',
    '[style.--grad]': 'item().gradient',
    '[style.--d]': 'item().delay',
  },
  templateUrl: './work-panel.component.html',
  styleUrl: './work-panel.component.css',
})
export class WorkPanelComponent {
  readonly item = input.required<WorkItem>();
}
