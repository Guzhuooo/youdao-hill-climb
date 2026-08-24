import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../ui/src/progress-storage.js', import.meta.url), 'utf8');
const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const { LEGACY_PROGRESS_STORAGE_KEY, PROGRESS_STORAGE_KEY, loadProgressData, saveProgressData } = await import(moduleUrl);

function storageWith(seed = {}) {
  const values = { ...seed };
  const writes = [];
  return {
    values, writes,
    async getStorage({ key }) { if (!(key in values)) throw new Error('missing'); return { data: values[key] }; },
    async setStorage({ key, data }) { values[key] = data; writes.push({ key, data }); return { ok: true }; }
  };
}

const current = storageWith({ [PROGRESS_STORAGE_KEY]: JSON.stringify({ bankCoins: 42 }) });
assert.deepEqual(await loadProgressData(current), { bankCoins: 42 });
assert.equal(current.writes.length, 0);

const legacy = storageWith({ [LEGACY_PROGRESS_STORAGE_KEY]: JSON.stringify({ bankCoins: 77 }) });
assert.deepEqual(await loadProgressData(legacy), { bankCoins: 77 });
assert.equal(legacy.writes.length, 1);
assert.equal(legacy.writes[0].key, PROGRESS_STORAGE_KEY);

const empty = storageWith();
assert.equal(await loadProgressData(empty), null);
await saveProgressData(empty, { bankCoins: 10000030 });
assert.deepEqual(JSON.parse(empty.values[PROGRESS_STORAGE_KEY]), { bankCoins: 10000030 });
console.log('progress storage smoke: passed');
