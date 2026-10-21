import type { InjectionKey, Ref } from 'vue';

export const themes = {
  Green: '#16a34a',
  Dark: '#1f2937',
  Orange: '#ea580c',
} as const;

export type ThemeName = keyof typeof themes;

export const themeNames = Object.keys(themes) as ThemeName[];

export const themeKey: InjectionKey<Ref<ThemeName>> = Symbol('theme');
