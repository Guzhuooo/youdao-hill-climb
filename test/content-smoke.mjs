import assert from 'node:assert/strict';
import fs from 'node:fs';
const load = async path => { const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8'); return import('data:text/javascript;base64,' + Buffer.from(source).toString('base64')); };
const content = await load('../ui/src/game-content.js');
const physics = await load('../ui/src/physics/vehicle-physics.js');
assert.equal(content.MAPS.length, 4);
assert.equal(content.VEHICLES.length, 4);
assert.equal(new Set(content.MAPS.map(item => item.id)).size, 4);
assert.equal(new Set(content.VEHICLES.map(item => item.id)).size, 4);
const results = [];
for (const map of content.MAPS) {
  let min = Infinity; let max = -Infinity;
  for (let x = 0; x <= 5000; x += 25) { const y = content.terrainElevation(map.id, x); min = Math.min(min, y); max = Math.max(max, y); assert.ok(Number.isFinite(y)); }
  assert.ok(min > 4 && max < 135, map.id + ' terrain must fit the scene');
  for (const vehicle of content.VEHICLES) {
    const groundYAt = x => 166 - content.terrainElevation(map.id, x);
    const state = physics.createVehicleState(); physics.resetVehicle(state, groundYAt, 205);
    const tuning = { engineForce: 0.55 * vehicle.engine * map.engine, maxSpeed: 13.5 * vehicle.maxSpeed * map.maxSpeed, traction: Math.min(1.18, 0.90 * vehicle.traction * map.traction), spring: 0.092 * vehicle.spring, damping: 0.19 * vehicle.damping, angularSpring: 0.040, angularDamping: 0.88, gravity: map.gravity, airControl: vehicle.airControl };
    for (let i = 0; i < 600; i += 1) physics.stepVehicle(state, { gas: true, brake: false }, tuning, groundYAt, 205);
    assert.ok(Number.isFinite(state.distance) && state.distance > 500, map.id + '/' + vehicle.id + ' must drive');
    assert.ok(Number.isFinite(state.bodyY) && Number.isFinite(state.angle));
    results.push({ map: map.id, vehicle: vehicle.id, distance: Math.round(state.distance), speed: Number(state.speed.toFixed(2)) });
  }
}
assert.notEqual(content.MAPS[0].gravity, content.MAPS[2].gravity);
assert.notEqual(content.VEHICLES[0].airControl, content.VEHICLES[1].airControl);
console.log(JSON.stringify(results, null, 2));