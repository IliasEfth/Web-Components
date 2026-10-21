export interface INotesConfig {
  apiBase: string;
  getAuthToken?: () => string | undefined;
}
