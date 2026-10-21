export const themes = {
  Blue: '#2563eb',
  Dark: '#1f2937',
  Orange: '#ea580c',
} as const;

export type ThemeName = keyof typeof themes;

export const themeNames = Object.keys(themes) as ThemeName[];

export interface IThemeContext {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}
