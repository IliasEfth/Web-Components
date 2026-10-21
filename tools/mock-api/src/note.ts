export const maxNoteLength = 500;

export interface INote {
  id: number;
  orderId: string;
  text: string;
  createdAt: string;
}

export function isNoteText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxNoteLength;
}
