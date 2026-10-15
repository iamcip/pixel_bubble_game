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
// Stable texture: never use frame-dependent randomness for terrain or foliage.
const noise=(x,y,seed=0)=>{const n=Math.sin(x*127.1+y*311.7+seed*73.3)*43758.5453;return n-Math.floor(n);};
function tree(c,x,y,small=false,fade=false){
  const s=small?.75:1;c.save();c.translate(x,y);c.scale(s,s);
  rect(c,-22,-1,44,7,'#193c3744');
  poly(c,[[-12,3],[-5,-13],[-6,-58],[7,-58],[6,-13],[16,4],[5,1],[-3,1]],'#46382c');
  rect(c,-3,-53,7,52,'#87603b');rect(c,-2,-48,3,43,'#b28248');
  poly(c,[[0,-26],[-19,-45],[-17,-50],[3,-35],[20,-55],[23,-50],[5,-23]],'#715034');
  rect(c,4,-31,3,26,'#513d2e');
  c.globalAlpha=fade?.32:1;
  const lobes=[[-21,-83,23,21],[-6,-96,29,25],[15,-80,24,24],[-37,-65,30,25],[-16,-71,34,30],[8,-59,34,27],[-27,-44,28,21],[-3,-39,26,17]];
  for(let i=0;i<lobes.length;i++){
    const [a,b,w,h]=lobes[i];
    poly(c,[[a+5,b],[a+w-7,b],[a+w-7,b+3],[a+w,b+3],[a+w,b+h-6],[a+w-5,b+h-6],[a+w-5,b+h],[a+4,b+h],[a+4,b+h-4],[a,b+h-4],[a,b+5],[a+5,b+5]],['#254e49','#315e4d','#38694e','#28594b','#47774c','#305e49','#285348','#254a40'][i]);
    for(let j=0;j<13;j++){
      const px=a+4+Math.floor(noise(i,j,1)*(w-9)/3)*3,py=b+3+Math.floor(noise(i,j,2)*(h-8)/3)*3;
      rect(c,px,py,3+Math.floor(noise(i,j,3)*3)*2,3+Math.floor(noise(i,j,4)*2)*2,['#729545','#90a64f','#5e873f','#47794b'][j%4]);
    }
  }
  c.restore();
}
function cave(c,x,y){
  rect(c,x-54,y-3,108,12,'#19372e66');
  poly(c,[[x-57,y],[x-56,y-38],[x-42,y-66],[x-20,y-87],[x+19,y-89],[x+45,y-65],[x+59,y-26],[x+57,y]],'#3d392f');
  poly(c,[[x-52,y-5],[x-49,y-40],[x-34,y-66],[x-15,y-81],[x+18,y-80],[x+38,y-59],[x+51,y-25],[x+51,y-5]],'#78634b');
  const stones=[[-49,-30,15,20],[-43,-50,18,17],[-30,-67,19,16],[-12,-78,24,15],[14,-73,19,17],[32,-56,17,20],[40,-32,14,25]];
  stones.forEach(([a,b,w,h],i)=>{rect(c,x+a,y+b,w,h,'#514336');rect(c,x+a+2,y+b+2,w-3,h-4,['#9a7e57','#877153','#ac8d5c'][i%3]);rect(c,x+a+3,y+b+2,w-5,2,'#c1a272');});
  // An open, dark doorway: the starting cave is still unfurnished.
  poly(c,[[x-23,y],[x-23,y-35],[x-17,y-46],[x-8,y-53],[x+8,y-53],[x+19,y-43],[x+23,y-30],[x+23,y]],'#302c29');
  rect(c,x-17,y-33,34,33,'#182c29');rect(c,x-12,y-39,24,8,'#182c29');
  for(let i=0;i<18;i++){const a=-44+noise(i,0)*83,b=-78+Math.abs(a)*.38;rect(c,x+a,y+b,8,5,['#527641','#789347','#9aa34e'][i%3]);}
  rect(c,x-28,y-1,56,6,'#c0ae85');rect(c,x-31,y+5,62,5,'#85785f');rect(c,x-34,y+10,68,4,'#ae9b75');
  rect(c,x+31,y-39,2,9,'#3c3023');rect(c,x+26,y-31,12,3,'#443323');rect(c,x+27,y-28,10,13,'#c58a36');rect(c,x+30,y-26,4,9,'#ffe0a0');rect(c,x+26,y-15,12,3,'#443323');
  const glow=c.createRadialGradient(x+32,y-23,1,x+32,y-23,36);glow.addColorStop(0,'#ffcc6a55');glow.addColorStop(1,'#edce7c00');c.fillStyle=glow;c.fillRect(x-5,y-60,75,75);
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
function diamond(c,x,y,color,edge){poly(c,[[x,y-10],[x+19,y],[x,y+10],[x-19,y]],color);if(edge){c.strokeStyle=edge;c.lineWidth=1;c.stroke();}}
export class Renderer {
  constructor(canvas,world){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.world=world;this.hits=[];this.width=1;this.height=1;}
  resize(w,h){this.width=w;this.height=h;this.canvas.width=Math.ceil(w/2);this.canvas.height=Math.ceil(h/2);}
  draw(view,time){
    const c=this.ctx,w=this.width,h=this.height;this.hits=[];
    c.setTransform(this.canvas.width/w,0,0,this.canvas.height/h,0,0);c.imageSmoothingEnabled=false;
    c.fillStyle=view.scene==='surface'?'#25473e':'#31251f';c.fillRect(0,0,w,h);
    c.save();c.translate(w/2+view.camera.x,h/2+view.camera.y);c.scale(view.camera.zoom,view.camera.zoom);
    if(view.scene==='surface')this.surface(c,view,time);else this.underground(c,view,time);
    c.restore();
    const vignette=c.createRadialGradient(w/2,h*.5,w*.15,w/2,h*.5,w*.78);vignette.addColorStop(0,'#0b202000');vignette.addColorStop(1,'#11191736');c.fillStyle=vignette;c.fillRect(0,0,w,h);
  }
  addHit(view,id,x,y,r=18,extra={}){this.hits.push({id,x:this.width/2+view.camera.x+x*view.camera.zoom,y:this.height/2+view.camera.y+y*view.camera.zoom,r:Math.max(18,r*view.camera.zoom),...extra,zoom:view.camera.zoom});}
  surface(c,v,t){
    for(let y=0;y<19;y++)for(let x=0;x<19;x++){
      const p=project(x,y,'surface'),n=noise(x,y);
      const water=x<3&&y>10;
      const path=(Math.abs(x-8)<1.7&&y>=5&&y<12)||(Math.abs(y-10)<1.5&&x>6&&x<15);
      diamond(c,p.x,p.y,water?'#3d8588':path?'#b7a16b':['#7c9352','#809653','#829855'][Math.floor(n*3)]);
      for(let j=0;j<7;j++){
        const dx=Math.floor(noise(x+j,y,4)*27)-13,dy=Math.floor(noise(x,y+j,5)*10)-5;
        if(Math.abs(dx)/18+Math.abs(dy)/9>.9)continue;
        rect(c,p.x+dx,p.y+dy,water?5:2+(j%2)*2,water?1:2,water?'#73b0a2':path?['#a98f5d','#c4b07a','#b39a64'][j%3]:['#9ba75b','#6d8b4d','#91a25a'][j%3]);
      }
      if(!water&&!path&&n>.83){rect(c,p.x+5,p.y-4,2,5,'#567444');rect(c,p.x+8,p.y-6,2,6,'#648346');}
      if(water&&n>.65){rect(c,p.x-5,p.y-1,9,3,'#648d52');rect(c,p.x-3,p.y-2,6,1,'#a3b775');}

    }
    const objects=[];
    const cavePos=project(8,5,'surface');objects.push({depth:13,draw:()=>{cave(c,cavePos.x,cavePos.y);this.addHit(v,'entrance',cavePos.x,cavePos.y-28,34,{bounds:{left:-24,top:-26,right:24,bottom:42}});}});
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
    for(const [x,y] of [[2,12],[3,14],[14,4],[16,12],[4,3]]){
      const p=project(x,y,'surface');objects.push({depth:x+y,draw:()=>{
        poly(c,[[p.x-13,p.y+2],[p.x-16,p.y-8],[p.x-7,p.y-21],[p.x+5,p.y-23],[p.x+15,p.y-10],[p.x+13,p.y+2]],'#515e59');
        poly(c,[[p.x-14,p.y-8],[p.x-7,p.y-21],[p.x+5,p.y-23],[p.x+10,p.y-12],[p.x,p.y-6]],'#8c9380');
        rect(c,p.x-11,p.y-1,11,3,'#76934e');
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
    rect(c,-1100,-1000,2200,2400,'#493222');
    for(let y=-35;y<50;y++)for(let x=-36;x<37;x++){
      const n=noise(x,y,23),px=x*30,py=y*27;
      if(n>.65){rect(c,px,py,16,11,'#412e21');rect(c,px+3,py-2,9,3,'#62432a');}
      if(n<.18)rect(c,px,py,4,2,'#765033');
    }
    for(let y=0;y<24;y++)for(let x=0;x<15;x++){
      const p=project(x,y,'underground'),k=key(x,y),open=floor.has(k);
      rect(c,p.x-15,p.y-13,31,28,open?['#bb894a','#bb894a','#bb894a'][Math.floor(noise(x,y)*3)]:['#493222','#493222','#493222','#493222'][Math.floor(noise(x,y)*4)]);
      if(open){
        if(!floor.has(key(x,y-1))){rect(c,p.x-15,p.y-13,30,5,'#754b2c');rect(c,p.x-15,p.y-8,30,2,'#e2ac5c');}
        if(!floor.has(key(x-1,y)))rect(c,p.x-15,p.y-13,3,27,'#dda45a');
        if(!floor.has(key(x+1,y)))rect(c,p.x+12,p.y-13,3,27,'#925c30');
        if(!floor.has(key(x,y+1)))rect(c,p.x-15,p.y+10,30,4,'#73492b');
      }else{
        // Broken rock silhouettes avoid a conspicuous regular dirt grid.
        const n=noise(x,y,7);
        if(n>.42){const dx=Math.floor(noise(x,y,8)*12)-6,dy=Math.floor(noise(x,y,9)*10)-5;
          rect(c,p.x+dx-6,p.y+dy-3,12,7,'#3c2a21');rect(c,p.x+dx-4,p.y+dy-5,8,3,'#62432b');}
        for(const [dx,dy] of [[0,-1],[-1,0],[1,0],[0,1]])if(floor.has(key(x+dx,y+dy))){
          const ex=dx<0?-15:dx>0?10:-15,ey=dy<0?-13:dy>0?9:-13;
          rect(c,p.x+ex,p.y+ey,dx?5:30,dy?5:27,'#6d482b');
          rect(c,p.x+ex+(dx>0?2:0),p.y+ey+(dy>0?2:0),dx?3:30,dy?3:27,'#906035');
        }
      }
      for(let j=0;j<4;j++)rect(c,p.x-12+Math.floor(noise(x+j,y,10)*24),p.y-9+Math.floor(noise(x,y+j,11)*18),2+(j%2),1,open?'#d09c5544':'#76503533');

      const zone=this.world.zones.get(k);
      if(zone){rect(c,p.x-12,p.y-10,24,20,zone==='sleep'?'#b3b9d15a':'#a9bf8b55');c.fillStyle=zone==='sleep'?'#e3d9e7':'#e2e6bd';c.font='10px sans-serif';c.textAlign='center';c.fillText(zone==='sleep'?'☾':'▧',p.x,p.y+3);}
      if(this.world.marks.has(k)){c.strokeStyle='#ddc891';c.setLineDash([3,3]);c.strokeRect(p.x-12,p.y-10,24,20);c.setLineDash([]);rect(c,p.x-3,p.y-3,6,6,'#d6bf8566');}
      if(v.selected?.id===`cell-${x}-${y}`){c.strokeStyle='#f8dfa3';c.lineWidth=2;c.strokeRect(p.x-14,p.y-12,28,24);}
    }
    const chest=project(this.world.chest.x,this.world.chest.y,'underground');
    rect(c,chest.x-10,chest.y-10,21,18,'#594c34');rect(c,chest.x-8,chest.y-8,17,14,'#b28b50');rect(c,chest.x-8,chest.y-8,17,4,'#ccab67');rect(c,chest.x-2,chest.y-5,4,7,'#e1c17a');
    this.addHit(v,'chest-initial',chest.x,chest.y-3,18);
    const p=project(7,0,'underground');
    rect(c,p.x-19,p.y-49,38,48,'#805836');rect(c,p.x-16,p.y-49,32,45,'#c5d7b4');
    rect(c,p.x-13,p.y-49,26,15,'#96c7ca');rect(c,p.x-13,p.y-34,26,13,'#b0bd6c');
    rect(c,p.x-13,p.y-21,26,15,'#d9b777');
    rect(c,p.x-10,p.y-26,21,24,'#513a25');rect(c,p.x-8,p.y-24,17,20,'#d7a355');
    c.fillStyle='#503923';c.font='18px sans-serif';c.textAlign='center';c.fillText('↑',p.x,p.y);
    this.addHit(v,'entrance',p.x,p.y-4,20);
    const glow=c.createRadialGradient(p.x,20,5,p.x,20,115);glow.addColorStop(0,'#ecdc9a33');glow.addColorStop(1,'#ecdc9a00');c.fillStyle=glow;c.fillRect(p.x-120,-90,240,240);
  }
  pick(x,y){return this.hits.filter(h=>h.bounds?(x>=h.x+h.bounds.left*h.zoom&&x<=h.x+h.bounds.right*h.zoom&&y>=h.y+h.bounds.top*h.zoom&&y<=h.y+h.bounds.bottom*h.zoom):Math.hypot(x-h.x,y-h.y)<=h.r).sort((a,b)=>Math.hypot(x-a.x,y-a.y)-Math.hypot(x-b.x,y-b.y));}
}
