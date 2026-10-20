import { access, copyFile } from 'node:fs/promises';

const projectFolder = new URL('../', import.meta.url);

export const seedFile = new URL('db.seed.json', projectFolder);
export const databaseFile = new URL('db.json', projectFolder);

export async function ensureDatabase(): Promise<void> {
  try {
    await access(databaseFile);
  } catch {
    await resetDatabase();
  }
}

export async function resetDatabase(): Promise<void> {
  await copyFile(seedFile, databaseFile);
}
