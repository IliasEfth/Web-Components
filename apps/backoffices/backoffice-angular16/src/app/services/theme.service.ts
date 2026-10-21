import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

export const themes = {
  Red: '#dc2626',
  Dark: '#1f2937',
  Orange: '#ea580c',
} as const;

export type ThemeName = keyof typeof themes;

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly names = Object.keys(themes) as ThemeName[];
  current: ThemeName = 'Red';

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  apply(name: ThemeName): void {
    this.current = name;
    this.document.documentElement.style.setProperty('--shop-color-primary', themes[name]);
  }
}
