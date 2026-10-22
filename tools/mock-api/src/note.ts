export type { INote } from '../contract/index.d.ts';

export const maxNoteLength = 500;

export function isNoteText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxNoteLength;
}
