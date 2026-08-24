import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../ui/src/physics/vehicle-physics.js', import.meta.url), 'utf8');
const physics = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const SCENE_HEIGHT = 166;
const CAR_X = 205;
function terrainElevation(worldX) {
  return 52 + Math.sin(worldX * 0.0054) * 27 + Math.sin(worldX * 0.0125 + 1.7) * 13 + Math.sin(worldX * 0.024 + 0.4) * 4;
}
const groundYAt = x => SCENE_HEIGHT - terrainElevation(x);
const tuning = { engineForce: 0.55, maxSpeed: 13.5, traction: 0.90, spring: 0.092, damping: 0.19, angularSpring: 0.040, angularDamping: 0.88 };
const state = physics.createVehicleState();
physics.resetVehicle(state, groundYAt, CAR_X);
const steepUp = [];
const downhill = [];
let airborneFrames = 0;
let longestAir = 0;
let currentAir = 0;
let maxWheelClearance = 0;
let maxLaunchVelocityChange = 0;
let maxWheelTopChange = 0;
let maxGroundedPenetration = 0;
let maxGroundedGap = 0;
let launches = 0;
for (let i = 0; i < 1500; i += 1) {
  const wasGrounded = state.grounded;
  const previousVelocityY = state.velocityY;
  const previousRearWheelTop = state.rearWheelTop;
  physics.stepVehicle(state, { gas: true, brake: false }, tuning, groundYAt, CAR_X);
  if (wasGrounded && !state.grounded) {
    launches += 1;
    maxLaunchVelocityChange = Math.max(maxLaunchVelocityChange, Math.abs(state.velocityY - previousVelocityY));
  }
  maxWheelTopChange = Math.max(maxWheelTopChange, Math.abs(state.rearWheelTop - previousRearWheelTop));
  if (state.grounded) {
    const rearContactDelta = state.bodyY + state.rearWheelTop + 25 - state.rearGroundY;
    const frontContactDelta = state.bodyY + state.frontWheelTop + 25 - state.frontGroundY;
    maxGroundedPenetration = Math.max(maxGroundedPenetration, rearContactDelta, frontContactDelta);
    maxGroundedGap = Math.max(maxGroundedGap, -rearContactDelta, -frontContactDelta);
  }
  const grade = (state.frontGroundY - state.rearGroundY) / 54;
  if (i > 100 && grade < -0.25) steepUp.push(state.speed);
  if (i > 100 && grade > 0.25) downhill.push(state.speed);
  if (!state.grounded) {
    airborneFrames += 1;
    currentAir += 1;
    longestAir = Math.max(longestAir, currentAir);
    maxWheelClearance = Math.max(maxWheelClearance, state.rearGroundY - (state.bodyY + state.rearWheelTop + 25));
  } else currentAir = 0;
}
const avg = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const result = { steepUphillAverage: avg(steepUp), downhillAverage: avg(downhill), airborneFrames, longestAir, maxWheelClearance, launches, maxLaunchVelocityChange, maxWheelTopChange, maxGroundedPenetration, maxGroundedGap };
console.log(JSON.stringify(result, null, 2));
assert.ok(result.steepUphillAverage < tuning.maxSpeed * 0.88, 'steep uphill must reduce full-throttle speed');
assert.ok(result.downhillAverage > result.steepUphillAverage + 1.0, 'slope direction must materially affect speed');
assert.ok(result.airborneFrames >= 300, 'jumps need longer total airtime during normal play');
assert.ok(result.longestAir >= 25, 'crest jumps need a longer, flatter airborne arc');
assert.ok(result.longestAir <= 34, 'crest jumps must not float unnaturally');
assert.ok(result.maxWheelClearance >= 24, 'airborne wheels must visibly leave the terrain');
assert.ok(result.maxWheelClearance <= 34, 'longer jumps must stay low and believable');
assert.ok(result.maxLaunchVelocityChange <= 2.5, 'takeoff velocity must not snap upward');
assert.ok(result.maxWheelTopChange <= 6.41, 'wheel extension must catch the terrain without teleporting');
assert.ok(result.maxGroundedPenetration <= 3.0, 'grounded wheels must not visibly sink through the terrain');
assert.ok(result.maxGroundedGap <= 2.2, 'a grounded axle must stay visually attached to the terrain');
