import assert from 'node:assert/strict';
import fs from 'node:fs';
const profileSource = fs.readFileSync(new URL('../ui/src/screen-profile.js', import.meta.url), 'utf8');
const profileModule = await import('data:text/javascript;base64,' + Buffer.from(profileSource).toString('base64'));
const { describeScreen, logicalHeightForPhysical } = profileModule;

assert.equal(logicalHeightForPhysical(800, 254), 254);
assert.equal(logicalHeightForPhysical(254, 800), 254);
assert.equal(logicalHeightForPhysical(854, 480), 450);
assert.equal(logicalHeightForPhysical(1280, 720), 450);
assert.deepEqual(describeScreen(800, 254), {
  designWidth: 800,
  logicalHeight: 254,
  extraSkyHeight: 0,
  compact: true
});
assert.equal(describeScreen(854, 480).extraSkyHeight, 196);
assert.equal(describeScreen(854, 480).compact, false);

const less = fs.readFileSync(new URL('../ui/src/pages/index/index.less', import.meta.url), 'utf8');
assert.match(less, /\.page \{[^}]*height: 100%;[^}]*min-height: 254px;/);
assert.match(less, /\.sky \{[^}]*min-height: 204px;[^}]*flex: 1;/);
assert.match(less, /\.scene \{[^}]*bottom: 0px;[^}]*height: 166px;/);
assert.match(less, /\.controls \{[^}]*flex-shrink: 0;/);
assert.match(less, /\.about-mask \{[^}]*height: 100%;[^}]*min-height: 254px;/);

console.log('adaptive-layout-smoke: passed');

