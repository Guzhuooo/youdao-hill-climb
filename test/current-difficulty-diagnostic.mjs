import fs from 'node:fs';
const source = fs.readFileSync(new URL('../ui/src/physics/vehicle-physics.js', import.meta.url), 'utf8');
const physics = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const SCENE_HEIGHT = 166, CAR_X = 205;
function terrainElevation(x) { return 52 + Math.sin(x * 0.0054) * 27 + Math.sin(x * 0.0125 + 1.7) * 13 + Math.sin(x * 0.024 + 0.4) * 4; }
const groundYAt = x => SCENE_HEIGHT - terrainElevation(x);
const tuning = { engineForce: 0.55, maxSpeed: 13.5, traction: 0.90, spring: 0.092, damping: 0.19, angularSpring: 0.040, angularDamping: 0.88 };
const state = physics.createVehicleState(); physics.resetVehicle(state, groundYAt, CAR_X);
let uphill=[], downhill=[], steepUp=[], airRuns=[], run=0, maxGap=0;
for(let i=0;i<1500;i++){
  physics.stepVehicle(state,{gas:true,brake:false},tuning,groundYAt,CAR_X);
  const rear=groundYAt(state.distance+CAR_X+30), front=groundYAt(state.distance+CAR_X+84);
  const grade=(front-rear)/54;
  if(i>100){ if(grade < -0.08) uphill.push(state.speed); if(grade > 0.08) downhill.push(state.speed); if(grade < -0.25) steepUp.push(state.speed); }
  if(!state.grounded){run++; const wheelTop=Math.max(36,Math.min(57,state.rearGroundY-state.bodyY-25)); const gap=state.rearGroundY-(state.bodyY+wheelTop+25); maxGap=Math.max(maxGap,gap);} else if(run){airRuns.push(run);run=0;}
}
if(run)airRuns.push(run);
const stats=a=>({n:a.length,min:Math.min(...a),avg:a.reduce((x,y)=>x+y,0)/a.length,max:Math.max(...a)});
console.log(JSON.stringify({uphill:stats(uphill),steepUp:stats(steepUp),downhill:stats(downhill),airRuns,maxAir:Math.max(...airRuns),maxRenderedRearWheelGap:maxGap},null,2));
