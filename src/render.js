import { project, key } from './world.js';
const spriteCache=new Map();
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
export function bubbleSprite(resident, mode='idle', frame=0){
  const phase=mode==='hop'?Math.round((Math.sin(frame)+1)*2):mode==='work'?(Math.sin(frame*3)>0?1:0):Math.sin(frame*.3)>.995?1:0;
  const cacheKey=resident.id+':'+mode+':'+phase;
  if(spriteCache.has(cacheKey))return spriteCache.get(cacheKey);
  const canvas=document.createElement('canvas');canvas.width=32;canvas.height=36;
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  const bob=mode==='hop'?phase-2:0;
  c.translate(0,-bob);
  rect(c,7,28,20,3,'#112b2755');
  const outline='#3d4840';
  [[10,9,12,2],[7,11,18,3],[5,14,22,10],[3,20,26,4],[6,24,20,5],[8,28,6,2],[20,28,5,2]].forEach(([x,y,w,h])=>rect(c,x,y,w,h,outline));
  [[10,11,12,2],[8,13,16,3],[6,16,20,8],[5,21,23,2],[8,24,16,4]].forEach(([x,y,w,h])=>rect(c,x,y,w,h,resident.color));
  rect(c,7,24,18,3,resident.shade);rect(c,8,15,3,5,'#fff7db88');
  const blink=Math.sin(frame*.3)>0.995;
  rect(c,12,18,2,blink?1:3,'#34463f');rect(c,21,18,2,blink?1:3,'#34463f');
  rect(c,16,22,3,1,'#6e6652');rect(c,10,22,3,1,'#e7a897');rect(c,23,22,2,1,'#e7a897');
  if(resident.accessory==='sprout'||resident.accessory==='leaf'){rect(c,16,6,2,5,'#687e49');rect(c,12,4,5,3,'#9eb66f');rect(c,17,3,5,3,'#c4ce81');}
  if(resident.accessory==='cap'){rect(c,8,10,14,2,'#638ea0');rect(c,11,7,9,3,'#b2d4d4');}
  if(resident.accessory==='flower'){rect(c,7,9,6,2,'#e9c8bd');rect(c,9,7,2,6,'#e5bdd5');rect(c,9,9,2,2,'#efdb98');}
  if(resident.accessory==='tuft'){rect(c,15,6,4,5,'#ddaf76');rect(c,18,5,3,3,'#f4d391');}
  if(mode==='haul'){rect(c,17,22,13,9,'#725435');rect(c,19,22,9,7,'#bc945b');rect(c,22,22,2,9,'#e0b876');}
  if(mode==='work'){const a=Math.sin(frame*3)>0?0:3;rect(c,26,14+a,2,14,'#bc9660');rect(c,22,13+a,10,3,'#bac5b3');rect(c,29,16+a,3,3,'#9ea794');}
  spriteCache.set(cacheKey,canvas);return canvas;
}
function tree(c,x,y,small=false,fade=false){
  const s=small?.75:1;c.save();c.translate(x,y);c.scale(s,s);
  rect(c,-16,-1,34,6,'#142c2755');rect(c,-5,-43,11,46,'#4c4a35');rect(c,-3,-40,4,38,'#887348');rect(c,3,-34,4,31,'#63543d');
  c.globalAlpha=fade?.35:1;
  const blocks=[[-12,-87,26,11],[-25,-77,50,18],[-35,-62,68,20],[-29,-44,62,15],[-16,-30,36,10]];
  blocks.forEach(([a,b,w,h],i)=>rect(c,a,b,w,h,['#59754c','#4d704b','#365c48','#2f5143','#25483c'][i]));
  rect(c,-25,-65,17,9,'#648154');rect(c,-13,-79,24,9,'#6d8854');rect(c,-31,-47,17,7,'#426a4d');rect(c,10,-61,18,8,'#55784e');
  c.restore();
}
function cave(c,x,y){
  rect(c,x-42,y-3,84,12,'#172d28aa');
  poly(c,[[x-52,y],[x-47,y-47],[x-25,y-77],[x+19,y-81],[x+47,y-52],[x+54,y]],'#424f3e');
  poly(c,[[x-45,y-6],[x-39,y-44],[x-20,y-68],[x+17,y-70],[x+39,y-45],[x+44,y-6]],'#70735a');
  rect(c,x-24,y-39,48,38,'#273e35');rect(c,x-16,y-48,32,10,'#273e35');rect(c,x-17,y-34,34,33,'#132b29');
  rect(c,x-46,y-46,17,11,'#7e8d53');rect(c,x-29,y-69,20,10,'#8b985d');rect(c,x-9,y-76,29,10,'#799055');rect(c,x+26,y-50,19,12,'#718750');
  rect(c,x-24,y-1,48,6,'#aaa484');rect(c,x-29,y+5,58,6,'#7e846b');
  rect(c,x+28,y-28,5,13,'#d8ad59');rect(c,x+26,y-26,9,7,'#f5d58b');
  const glow=c.createRadialGradient(x+30,y-23,1,x+30,y-23,31);glow.addColorStop(0,'#edce7c55');glow.addColorStop(1,'#edce7c00');c.fillStyle=glow;c.fillRect(x,y-55,62,64);
}
function resource(c,r){const {x,y}=project(r.x,r.y,'surface');
  if(r.type==='tree'){tree(c,x,y,true,r.fade);return;}
  rect(c,x-11,y+1,24,4,'#133e3055');
  if(r.type==='berry'){rect(c,x-11,y-9,22,11,'#416347');rect(c,x-7,y-14,15,8,'#628255');[[-7,-7],[3,-9],[-1,-3]].forEach(([a,b])=>{rect(c,x+a,y+b,5,5,'#ce8d89');rect(c,x+a,y+b,2,1,'#f4c0ac');});}
  if(r.type==='mushroom'){for(const [a,b] of [[-6,0],[5,-5]]){rect(c,x+a,y+b-8,4,9,'#dbd3b1');rect(c,x+a-4,y+b-12,11,5,'#ce8d7f');rect(c,x+a-2,y+b-15,7,3,'#e5ad90');rect(c,x+a-1,y+b-12,2,2,'#f1e0ae');}}
  if(r.type==='nut'){[[-5,-4],[3,0],[7,-6]].forEach(([a,b])=>{rect(c,x+a,y+b-5,6,7,'#cda369');rect(c,x+a-1,y+b-6,8,3,'#886e49');});}
  if(r.type==='branch'){rect(c,x-12,y-4,23,5,'#ab8857');rect(c,x-4,y-10,4,8,'#c1a174');rect(c,x+6,y-4,4,4,'#d4bb8a');}
  if(r.type==='fiber'){[[-8,-5],[-2,-11],[5,-7]].forEach(([a,b])=>{rect(c,x+a,y+b,3,-b,'#a7b477');rect(c,x+a-3,y+b,3,5,'#769360');});}
}
function diamond(c,x,y,color,edge){poly(c,[[x,y-9],[x+18,y],[x,y+9],[x-18,y]],color);if(edge){c.strokeStyle=edge;c.lineWidth=1;c.stroke();}}
export class Renderer {
  constructor(canvas,world){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.world=world;this.hits=[];this.width=1;this.height=1;}
  resize(w,h){this.width=w;this.height=h;this.canvas.width=Math.ceil(w/2);this.canvas.height=Math.ceil(h/2);}
  draw(view,time){
    const c=this.ctx,w=this.width,h=this.height;this.hits=[];
    c.setTransform(this.canvas.width/w,0,0,this.canvas.height/h,0,0);c.imageSmoothingEnabled=false;
    c.fillStyle=view.scene==='surface'?'#233f36':'#2a302a';c.fillRect(0,0,w,h);
    c.save();c.translate(w/2+view.camera.x,h/2+view.camera.y);c.scale(view.camera.zoom,view.camera.zoom);
    if(view.scene==='surface')this.surface(c,view,time);else this.underground(c,view,time);
    c.restore();
    const vignette=c.createRadialGradient(w/2,h*.5,w*.15,w/2,h*.5,w*.78);vignette.addColorStop(0,'#0b202000');vignette.addColorStop(1,'#071f2375');c.fillStyle=vignette;c.fillRect(0,0,w,h);
  }
  addHit(view,id,x,y,r=18,extra={}){this.hits.push({id,x:this.width/2+view.camera.x+x*view.camera.zoom,y:this.height/2+view.camera.y+y*view.camera.zoom,r:Math.max(18,r*view.camera.zoom),...extra});}
  surface(c,v,t){
    for(let y=0;y<19;y++)for(let x=0;x<19;x++){
      const p=project(x,y,'surface'),n=(x*17+y*31)%9;
      diamond(c,p.x,p.y,['#647b50','#657c50','#6a8053','#71865a','#697f52','#6b8256','#6c8356','#657c51','#6c8255'][n]);
      if(x<3&&y>10)diamond(c,p.x,p.y,['#3f7371','#457c75','#4c8279'][n%3]);
      if((x===8&&y<9)||(y===9&&x>7&&x<14))diamond(c,p.x,p.y,'#a69c70');
      if(n===0&&x>3){rect(c,p.x+5,p.y-2,2,3,'#8e9a65');rect(c,p.x+8,p.y-4,2,4,'#81955d');}
    }
    const objects=[];
    const cavePos=project(8,5,'surface');objects.push({depth:13,draw:()=>{cave(c,cavePos.x,cavePos.y);this.addHit(v,'entrance',cavePos.x,cavePos.y-22,34);}});
    this.world.resources.forEach(r=>objects.push({depth:r.x+r.y,draw:()=>{const p=project(r.x,r.y,'surface');const selected=v.selected?.id;const target=this.world.residents.find(b=>b.id===selected);const bp=target&&project(target.x,target.y,'surface');r.fade=!!(bp&&Math.abs(bp.x-p.x)<40&&bp.y<p.y&&bp.y>p.y-90);resource(c,r);this.addHit(v,r.id,p.x,p.y-(r.type==='tree'?18:7),r.type==='tree'?24:18,{type:r.type});if(this.world.marks.has(r.id)){diamond(c,p.x,p.y+6,'#e4d29555','#f7dda0');}}}));
    const positions=[];
    const count=v.stress?20:5;
    for(let i=0;i<count;i++){
      const b=this.world.residents[i%5];const x=i<5?b.x:5+(i%5)*1.3,y=i<5?b.y:9+Math.floor((i-5)/5)*1.25;
      const p=project(x,y,'surface');positions.push({x:p.x,y:p.y});
      objects.push({depth:x+y+.1,draw:()=>{
        const selected=i<5&&v.selected?.id===b.id;
        if(selected)diamond(c,p.x,p.y+3,'#e5d69d33','#eedaa1');
        const mode=i<5?(v.animations[b.id]||'idle'):['idle','hop','haul','work'][i%4];
        const sprite=bubbleSprite(b,mode,t+i*2);c.drawImage(sprite,Math.round(p.x-16),Math.round(p.y-30));
        if(i<5)this.addHit(v,b.id,p.x,p.y-14,19,{type:'resident'});
        if(selected){rect(c,p.x-2,p.y-42+Math.sin(t)*2,4,4,'#f4d893');}
      }});
    }
    const trees=[[1,2],[3,2],[5,1],[7,1],[10,2],[13,3],[16,4],[17,6],[17,9],[17,13],[16,16],[13,17],[10,18],[6,17],[3,15],[1,10],[1,6],[2,4]];
    trees.forEach(([x,y])=>{const p=project(x,y,'surface');const fade=positions.some(b=>Math.abs(b.x-p.x)<36&&b.y<p.y&&b.y>p.y-86);objects.push({depth:x+y,draw:()=>tree(c,p.x,p.y,false,fade)});});
    objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
    for(let i=0;i<8;i++){const p=project(4+i*1.4,6+(i*3%9),'surface'),dx=Math.sin(t*.3+i)*7,dy=Math.cos(t*.5+i)*5;rect(c,p.x+dx,p.y-20+dy,2,2,Math.sin(t+i)>.2?'#e8dca2':'#d7dda333');}
    const night=(1-Math.cos((v.previewSeconds/720)*Math.PI*2))*.14;
    c.fillStyle=`rgba(20,38,64,${night})`;c.fillRect(-700,-100,1400,1000);
  }
  underground(c,v,t){
    const floor=this.world.floor;
    for(let y=0;y<24;y++)for(let x=0;x<15;x++){
      const p=project(x,y,'underground'),k=key(x,y),open=floor.has(k);
      rect(c,p.x-15,p.y-13,30,27,open?['#9e8a5e','#a08c60','#a38f63'][(x+y)%3]:['#444236','#454337','#484538','#414035'][(x*11+y*17)%4]);
      if(open){
        if(!floor.has(key(x,y-1))){rect(c,p.x-15,p.y-13,30,5,'#716749');rect(c,p.x-15,p.y-8,30,2,'#c0a576');}
        if(!floor.has(key(x-1,y)))rect(c,p.x-15,p.y-13,3,27,'#b49c6d');
        if(!floor.has(key(x+1,y)))rect(c,p.x+12,p.y-13,3,27,'#746a4c');
        if(!floor.has(key(x,y+1)))rect(c,p.x-15,p.y+10,30,4,'#665d43');
      }else if((x*7+y)%5===0){rect(c,p.x-9,p.y-5,8,5,'#54503e');rect(c,p.x-8,p.y-6,5,1,'#5b5643');}
      const zone=this.world.zones.get(k);
      if(zone){rect(c,p.x-12,p.y-10,24,20,zone==='sleep'?'#b3b9d15a':'#a9bf8b55');c.fillStyle=zone==='sleep'?'#e3d9e7':'#e2e6bd';c.font='10px sans-serif';c.textAlign='center';c.fillText(zone==='sleep'?'☾':'▧',p.x,p.y+3);}
      if(this.world.marks.has(k)){c.strokeStyle='#ddc891';c.setLineDash([3,3]);c.strokeRect(p.x-12,p.y-10,24,20);c.setLineDash([]);rect(c,p.x-3,p.y-3,6,6,'#d6bf8566');}
      if(v.selected?.id===`cell-${x}-${y}`){c.strokeStyle='#f8dfa3';c.lineWidth=2;c.strokeRect(p.x-14,p.y-12,28,24);}
    }
    const chest=project(this.world.chest.x,this.world.chest.y,'underground');
    rect(c,chest.x-10,chest.y-10,21,18,'#594c34');rect(c,chest.x-8,chest.y-8,17,14,'#b28b50');rect(c,chest.x-8,chest.y-8,17,4,'#ccab67');rect(c,chest.x-2,chest.y-5,4,7,'#e1c17a');
    this.addHit(v,'chest-initial',chest.x,chest.y-3,18);
    const p=project(7,0,'underground');rect(c,p.x-12,p.y-20,24,26,'#b8c293');rect(c,p.x-9,p.y-18,18,21,'#d1d5ac');
    c.fillStyle='#5f7557';c.font='18px sans-serif';c.textAlign='center';c.fillText('↑',p.x,p.y);
    this.addHit(v,'entrance',p.x,p.y-4,20);
    const glow=c.createRadialGradient(p.x,20,5,p.x,20,115);glow.addColorStop(0,'#ecdc9a33');glow.addColorStop(1,'#ecdc9a00');c.fillStyle=glow;c.fillRect(p.x-120,-90,240,240);
  }
  pick(x,y){return this.hits.filter(h=>Math.hypot(x-h.x,y-h.y)<=h.r).sort((a,b)=>Math.hypot(x-a.x,y-a.y)-Math.hypot(x-b.x,y-b.y));}
}
