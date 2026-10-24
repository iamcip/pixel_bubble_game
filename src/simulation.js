// M2 fixed-step simulation core. Independent from rendering.
import { CONFIG } from './data.js';
import { key } from './world.js';
export const SAVE_VERSION = 2;
const directions=[[1,0],[-1,0],[0,1],[0,-1]];
export function route(start,goal,passable){
 const from=[Math.round(start.x),Math.round(start.y)],to=key(Math.round(goal.x),Math.round(goal.y)),q=[from],seen=new Set([key(...from)]),parent=new Map();
 for(let i=0;i<q.length;i++){const p=q[i],k=key(...p);if(k===to){const out=[p];let cur=k;while(parent.has(cur)){cur=parent.get(cur);out.push(cur.split(',').map(Number));}return out.reverse().map(([x,y])=>({x,y}));}
 for(const [dx,dy] of directions){const n=[p[0]+dx,p[1]+dy],nk=key(...n);if(!seen.has(nk)&&passable(...n)){seen.add(nk);parent.set(nk,k);q.push(n);}}}return null;
}
const itemFor=t=>['berry','mushroom','nut'].includes(t)?'food':['tree','branch'].includes(t)?'wood':'fiber';
export function createSimulation(world){return {version:SAVE_VERSION,seconds:0,day:1,inventory:{...world.inventory},resources:world.resources.map(r=>({...r})),residents:world.residents.map(r=>({...r,energy:1,hunger:0,taskId:null,carrying:null,resting:false})),jobs:[],nextJob:1,ledger:{foodConsumed:0,delivered:{food:0,wood:0,fiber:0}},events:[],floor:[...world.floor],zones:[...world.zones],rng:1};}
export function queueGather(s,id){const r=s.resources.find(r=>r.id===id);if(!r||r.amount<=0)return null;const active=s.jobs.find(j=>j.target===id&&!['done','cancelled'].includes(j.state));if(active)return active;const j={id:'job-'+s.nextJob++,type:'gather',target:id,state:'waiting',worker:null,remaining:4,reason:null};s.jobs.push(j);return j;}
export function cancelJob(s,id){const j=s.jobs.find(j=>j.target===id&&!['done','cancelled'].includes(j.state));if(!j||['hauling','delivering'].includes(j.state))return false;const b=s.residents.find(b=>b.id===j.worker);if(b)b.taskId=null;j.worker=null;j.state='cancelled';return true;}
function move(b,t,dt){const dx=t.x-b.x,dy=t.y-b.y,d=Math.hypot(dx,dy),distance=dt*1.5;if(d<=distance){b.x=t.x;b.y=t.y;return true;}b.x+=dx/d*distance;b.y+=dy/d*distance;return false;}
export function step(s,dt=1){if(!(dt>0&&dt<=1))throw Error('Invalid fixed step');
 const before=Math.floor(s.seconds/CONFIG.daySeconds);s.seconds+=dt;const after=Math.floor(s.seconds/CONFIG.daySeconds);
 for(let d=before;d<after;d++){for(const b of s.residents){if(s.inventory.food>0){s.inventory.food--;s.ledger.foodConsumed++;b.hunger=0;}else b.hunger=Math.min(1,b.hunger+.5);}s.day=d+2;s.events.push({type:'day',day:s.day});}
 for(const b of s.residents){if(b.energy<.25&&!b.carrying){b.resting=true;if(b.taskId){const j=s.jobs.find(j=>j.id===b.taskId);if(j){j.state='waiting';j.worker=null;j.reason='resting';}b.taskId=null;}}if(b.resting){b.energy=Math.min(1,b.energy+dt/(CONFIG.daySeconds*CONFIG.restFraction));if(b.energy>=.95)b.resting=false;}}
 for(const b of s.residents){if(b.taskId||b.resting||b.energy<.25)continue;const j=s.jobs.find(j=>j.state==='waiting');if(j){j.worker=b.id;j.state='travelling';j.reason=null;b.taskId=j.id;}}
 for(const b of s.residents){if(!b.taskId&&!b.resting){const i=s.residents.indexOf(b);const t=s.seconds*.17+i*1.8;const target={x:8+Math.cos(t)*(.8+i*.12),y:7+Math.sin(t)*(.6+i*.1)};move(b,target,dt*.45);}}
 for(const b of s.residents){if(!b.taskId)continue;const j=s.jobs.find(j=>j.id===b.taskId),r=s.resources.find(r=>r.id===j.target);if(!r){j.state='invalid';b.taskId=null;continue;}
 if(j.state==='travelling'){const path=route(b,r,(x,y)=>x>=0&&y>=0&&x<CONFIG.surface.width&&y<CONFIG.surface.height);if(!path){j.state='waiting';j.reason='blocked';j.worker=null;b.taskId=null;continue;}if(move(b,r,dt))j.state='working';}
 else if(j.state==='working'){j.remaining-=dt;b.energy=Math.max(0,b.energy-dt/CONFIG.daySeconds);if(j.remaining<=0){const amount=Math.min(CONFIG.carrySlots,r.amount);if(!amount){j.state='done';b.taskId=null;continue;}r.amount-=amount;b.carrying={item:itemFor(r.type),amount};j.state='hauling';}}
 else if(j.state==='hauling'||j.state==='delivering'){j.state='delivering';if(move(b,{x:8,y:5},dt)){const {item,amount}=b.carrying;s.inventory[item]=(s.inventory[item]||0)+amount;s.ledger.delivered[item]+=amount;b.carrying=null;b.taskId=null;j.state='done';s.events.push({type:'delivered',item,amount,worker:b.id});}}}
}
export function advance(s,seconds){if(!Number.isFinite(seconds)||seconds<0||seconds>100000)throw Error('Invalid duration');while(seconds>0){const dt=Math.min(1,seconds);step(s,dt);seconds-=dt;}return s;}
export const serialize=s=>JSON.stringify(s);
export function restore(json){const s=JSON.parse(json);if(s.version!==SAVE_VERSION)throw Error('Unsupported save version');if(!Array.isArray(s.residents)||!Array.isArray(s.jobs)||!Array.isArray(s.resources)||!s.inventory||!Number.isFinite(s.seconds))throw Error('Invalid save');return s;}
