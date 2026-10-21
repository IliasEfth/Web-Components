import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-event-log',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="event-log">
      <h2>Events</h2>
      @if (entries().length === 0) {
        <p>No events yet. Select an order.</p>
      }
      <ol>
        @for (entry of entries(); track $index) {
          <li>{{ entry }}</li>
        }
      </ol>
    </section>
  `,
})
export class EventLog {
  readonly entries = input.required<string[]>();
}
