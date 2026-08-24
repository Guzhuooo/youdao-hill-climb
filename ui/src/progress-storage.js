export const PROGRESS_STORAGE_KEY = '/userdata/miniapp/hill_climb_ridge/progress.json';
export const LEGACY_PROGRESS_STORAGE_KEY = 'hill_climb_progress_v7';

function parseStored(result) {
  if (!result || result.data === undefined || result.data === null || result.data === '') return null;
  return typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
}

async function readKey(storage, key) {
  try { return parseStored(await storage.getStorage({ key })); }
  catch (error) { return null; }
}

export async function loadProgressData(storage) {
  const current = await readKey(storage, PROGRESS_STORAGE_KEY);
  if (current) return current;
  const legacy = await readKey(storage, LEGACY_PROGRESS_STORAGE_KEY);
  if (!legacy) return null;
  await saveProgressData(storage, legacy);
  return legacy;
}

export function saveProgressData(storage, data) {
  return storage.setStorage({ key: PROGRESS_STORAGE_KEY, data: JSON.stringify(data) });
}
