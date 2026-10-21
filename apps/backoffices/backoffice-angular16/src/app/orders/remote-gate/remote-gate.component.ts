import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';

type RemoteState = 'loading' | 'ready' | 'failed';

@Component({
  selector: 'app-remote-gate',
  templateUrl: './remote-gate.component.html',
})
export class RemoteGateComponent implements OnInit {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) load!: () => Promise<void>;

  @ContentChild(TemplateRef) content: TemplateRef<unknown> | null = null;

  state: RemoteState = 'loading';
  message = '';

  ngOnInit(): void {
    this.attempt();
  }

  retry(): void {
    this.attempt();
  }

  private attempt(): void {
    this.state = 'loading';
    this.load().then(
      () => {
        this.state = 'ready';
      },
      (error: unknown) => {
        this.state = 'failed';
        this.message = String(error);
      },
    );
  }
}
