import fs from 'node:fs';
const base=fs.readFileSync(new URL('../ui/src/physics/vehicle-physics.js',import.meta.url),'utf8');
const H=166,X=205;
const elevation=x=>52+Math.sin(x*.0054)*27+Math.sin(x*.0125+1.7)*13+Math.sin(x*.024+.4)*4;
const ground=x=>H-elevation(x);
const tuning={engineForce:.55,maxSpeed:13.5,traction:.90,spring:.092,damping:.19,angularSpring:.040,angularDamping:.88};
const avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
for(const slack of [3,4,5]) for(const motion of [.2]) for(const launch of [6.3,6.6]){
 let src=base.replace('desiredBodyY - 8','desiredBodyY - '+slack).replace('terrainMotion < 0.20','terrainMotion < '+motion.toFixed(2)).replace('state.speed * 0.075, -4.8','state.speed * 0.075, -'+launch.toFixed(1));
 const p=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64')+'#'+slack+'-'+motion+'-'+launch);
 const st=p.createVehicleState();p.resetVehicle(st,ground,X);let up=[],down=[],air=0,long=0,run=0,clear=-99,trans=0,prev=st.grounded;
 for(let i=0;i<1500;i++){p.stepVehicle(st,{gas:true,brake:false},tuning,ground,X);const grade=(st.frontGroundY-st.rearGroundY)/54;if(i>100&&grade<-.25)up.push(st.speed);if(i>100&&grade>.25)down.push(st.speed);if(!st.grounded){air++;run++;long=Math.max(long,run);clear=Math.max(clear,st.rearGroundY-(st.bodyY+38+25));}else run=0;if(st.grounded!==prev){trans++;prev=st.grounded;}}
 if(air>=130||long>=30)console.log({slack,motion,launch,up:+avg(up).toFixed(2),down:+avg(down).toFixed(2),air,long,clear:+clear.toFixed(1),trans});
}
