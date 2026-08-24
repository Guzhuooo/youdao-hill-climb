import fs from 'node:fs';
const source = fs.readFileSync(new URL('../ui/src/physics/vehicle-physics.js', import.meta.url), 'utf8');
const physics = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const SCENE_HEIGHT = 166;
const CAR_X = 205;
function terrainElevation(worldX) {
  return 52 + Math.sin(worldX * 0.0054) * 27 + Math.sin(worldX * 0.0125 + 1.7) * 13 + Math.sin(worldX * 0.024 + 0.4) * 4;
}
const groundYAt = (x) => SCENE_HEIGHT - terrainElevation(x);
const state = physics.createVehicleState();
physics.resetVehicle(state, groundYAt, CAR_X);
const tuning = { engineForce: 0.55, maxSpeed: 13.5, traction: 0.90, spring: 0.092, damping: 0.19, angularSpring: 0.040, angularDamping: 0.88 };
let airborneFrames = 0;
let longestAir = 0;
let currentAir = 0;
let transitions = 0;
let previous = state.grounded;
for (let i = 0; i < 1500; i += 1) {
  physics.stepVehicle(state, { gas: true, brake: false }, tuning, groundYAt, CAR_X);
  if (!state.grounded) { airborneFrames += 1; currentAir += 1; longestAir = Math.max(longestAir, currentAir); } else currentAir = 0;
  if (state.grounded !== previous) { transitions += 1; previous = state.grounded; }
}
console.log(JSON.stringify({ distance: state.distance, speed: state.speed, airborneFrames, longestAir, transitions, angle: state.angle }, null, 2));
if (airborneFrames < 20 || longestAir < 4 || transitions < 2) throw new Error('vehicle never develops meaningful airtime');
