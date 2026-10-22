import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  standalone: false,
})
export class SettingsPageComponent {
  constructor(readonly theme: ThemeService) {}
}
