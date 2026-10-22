let notesReady: Promise<void> | undefined;

export function loadNotesElements(): Promise<void> {
  notesReady ??= import('notes/elements')
    .then(({ defineElements }) => defineElements())
    .catch((error: unknown) => {
      notesReady = undefined;
      throw error;
    });
  return notesReady;
}
