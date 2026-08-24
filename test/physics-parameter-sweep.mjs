import fs from 'node:fs';
const base = fs.readFileSync(new URL('../ui/src/physics/vehicle-physics.js', import.meta.url), 'utf8');
const SCENE_HEIGHT=166,CAR_X=205;
function terrainElevation(x){return 52+Math.sin(x*.0054)*27+Math.sin(x*.0125+1.7)*13+Math.sin(x*.024+.4)*4;}
const groundYAt=x=>SCENE_HEIGHT-terrainElevation(x);
const tuning={engineForce:.55,maxSpeed:13.5,traction:.90,spring:.092,damping:.19,angularSpring:.040,angularDamping:.88};
const avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
for(const slope of [1.8,2.0,2.2,2.4]) for(const launch of [4.2,4.8,5.4]){
 const source=base.replace('* 1.05','* '+slope.toFixed(2)).replace(', -3.0);',', -'+launch.toFixed(1)+');');
 const p=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64')+'#'+slope+'-'+launch);
 const state=p.createVehicleState();p.resetVehicle(state,groundYAt,CAR_X);
 let up=[],down=[],air=0,long=0,run=0,maxClear=-99,minSpeed=99;
 for(let i=0;i<1500;i++){
  p.stepVehicle(state,{gas:true,brake:false},tuning,groundYAt,CAR_X);
  const grade=(state.frontGroundY-state.rearGroundY)/54;
  if(i>100&&grade<-.25)up.push(state.speed); if(i>100&&grade>.25)down.push(state.speed);
  if(!state.grounded){air++;run++;long=Math.max(long,run);maxClear=Math.max(maxClear,state.rearGroundY-(state.bodyY+36+25));}else run=0;
  if(i>100)minSpeed=Math.min(minSpeed,state.speed);
 }
 console.log({slope,launch,up:+avg(up).toFixed(2),down:+avg(down).toFixed(2),air,long,clear:+maxClear.toFixed(1),min:+minSpeed.toFixed(2),distance:+state.distance.toFixed(0)});
}
