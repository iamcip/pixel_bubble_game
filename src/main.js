import { createSimulation, queueGather, cancelJob, advance, serialize, restore } from './simulation.js?v=m2-20261023';
import { CONFIG } from './data.js?v=colors-20261022';
import { initialWorld, project, unproject, inBounds, key, toggleDig, digStatus, canPlaceZone, clampCamera } from './world.js?v=colors-20261022';
import { Renderer, bubbleSprite, clearSpriteCache } from './render.js?v=colors-20261022';
import { loadArt } from './art.js';
const $=s=>document.querySelector(s), world=initialWorld(), canvas=$('#world'), renderer=new Renderer(canvas,world);
const SAVE_KEY='bubble-colony-m2';
let simulation;
try { simulation=restore(localStorage.getItem(SAVE_KEY)); } catch { simulation=null; }
if(!simulation)simulation=createSimulation(world);
// New colonies start with visible, useful work instead of five motionless residents.
if(simulation.jobs.length===0 && simulation.seconds<CONFIG.daySeconds)for(const id of ['berry-01','mushroom-01','branch-01','fiber-01','nut-01'])queueGather(simulation,id);
function syncSimulation(){world.inventory={...simulation.inventory};world.resources=simulation.resources;world.residents=simulation.residents;for(const j of simulation.jobs){if(j.state==='done'||j.state==='cancelled'||j.state==='invalid')world.marks.delete(j.target);}}
syncSimulation();
for(const j of simulation.jobs)if(!['done','cancelled','invalid'].includes(j.state))world.marks.set(j.target,{id:j.id,type:'gather',target:j.target});
let saveElapsed=0;
function saveGame(){try{localStorage.setItem(SAVE_KEY,serialize(simulation));}catch(e){console.warn('Save failed',e);}}
const cameras={surface:{x:0,y:-155,zoom:1},underground:{x:0,y:-90,zoom:1}};
const view={scene:'surface',camera:cameras.surface,selected:null,tool:'inspect',stress:false,animations:{},previewSeconds:0};
let paused=false,speed=1,animationTime=0,lastTime=0,hidden=document.hidden,toastTimer,frames=0,fpsAt=0,lastFps=0;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2800);}
function resize(){const bounds=canvas.getBoundingClientRect();renderer.resize(bounds.width,bounds.height);}
new ResizeObserver(resize).observe(canvas);
function resetCamera(){Object.assign(view.camera,{x:0,y:view.scene==='surface'?-155:-90,zoom:view.scene==='underground'?Math.min(1,(renderer.width-28)/450):1});}
function switchScene(scene){view.scene=scene;view.camera=cameras[scene];view.selected=null;view.tool='inspect';
  for(const name of ['surface','underground']){$('#'+name).classList.toggle('active',name===scene);$('#'+name).setAttribute('aria-pressed',String(name===scene));}
  $('#scene-label').textContent=scene==='surface'?'微光森林':'還沒寫下的家';
  $('#scene-detail').textContent=scene==='surface'?'五個新朋友，一個家的開始。':'同一層平面 · 上方開口通往地表';
  canvas.setAttribute('aria-label',scene==='surface'?'等角森林地表，可拖曳與縮放。使用下方居民按鈕選取泡泡。':'15 格寬地下平面，可拖曳與縮放。選擇挖掘工具後標記泥土。');
  renderPanel();renderTools();renderResidents();
}
$('#surface').onclick=()=>switchScene('surface');$('#underground').onclick=()=>switchScene('underground');
function zoomTo(zoom,x=renderer.width/2,y=renderer.height/2){
  const c=view.camera,old=c.zoom,next=Math.max(CONFIG.zoom.min,Math.min(CONFIG.zoom.max,zoom));
  c.x=x-renderer.width/2-(x-renderer.width/2-c.x)*next/old;
  c.y=y-renderer.height/2-(y-renderer.height/2-c.y)*next/old;c.zoom=next;clampCamera(c,renderer.width,renderer.height,view.scene);
}
$('#zoom-in').onclick=()=>zoomTo(view.camera.zoom*1.2);$('#zoom-out').onclick=()=>zoomTo(view.camera.zoom/1.2);$('#recenter').onclick=resetCamera;
$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'▶':'Ⅱ';$('#pause').setAttribute('aria-label',paused?'播放動畫':'暫停動畫');$('#pause').setAttribute('aria-pressed',String(paused));};
$('#speed').onclick=()=>{speed=speed===1?2:1;$('#speed').textContent=speed+'×';};
$('#help').onclick=()=>{$('#fps').textContent=`目前約 ${lastFps} FPS · 僅供此瀏覽器參考` ;$('#help-dialog').showModal();};
$('#stress').onchange=e=>{view.stress=e.target.checked;toast(view.stress?'已加入 15 隻動作樣本；正式居民仍為五隻':'回到五隻正式居民');};
document.addEventListener('visibilitychange',()=>{hidden=document.hidden;lastTime=0;});
function renderResidents(){
  $('#residents').replaceChildren();
  world.residents.forEach(b=>{const button=document.createElement('button'),img=document.createElement('img');img.src=bubbleSprite(b).toDataURL();img.alt='';button.append(img,document.createTextNode(b.name));button.classList.toggle('active',view.selected?.id===b.id);button.setAttribute('aria-label',`查看${b.name}`);button.onclick=()=>{if(view.scene!=='surface')switchScene('surface');view.selected={id:b.id,type:'resident'};const p=project(b.x,b.y,'surface');view.camera.x=-p.x*view.camera.zoom;view.camera.y=-p.y*view.camera.zoom+15;renderPanel();renderResidents();};$('#residents').append(button);});
}
function action(label,fn,primary=false){const b=document.createElement('button');b.textContent=label;b.classList.toggle('primary',primary);b.onclick=fn;$('#actions').append(b);return b;}
function panel(title,note){$('#selection').replaceChildren();const h=document.createElement('h2'),p=document.createElement('p');h.textContent=title;p.textContent=note;$('#selection').append(h,p);$('#actions').replaceChildren();}
function updateResources(){const inv=simulation.inventory;const values=document.querySelectorAll('.resource-row strong');[inv.food,inv.wood,inv.fiber].forEach((n,i)=>{if(values[i])values[i].textContent=n;});}
function updateMarks(){$('#mark-count').textContent=`${world.marks.size} 個工作標記`;}
function renderPanel(){
  updateMarks();const id=view.selected?.id;
  if(!id){panel(view.scene==='surface'?'森林裡，發現一個新家。':'一個箱子，和無限可能。',view.scene==='surface'?'點一隻泡泡認識牠，或到地下看看空山洞。':'先觀察房間；選擇工具後點格子，預覽未來的家。');return;}
  if(id==='entrance'){panel(view.scene==='surface'?'被森林藏起來的山洞':'通往微光森林',view.scene==='surface'?'裡面只有一間小房間與一個箱子，正等著泡泡們。':'上下方向只是地圖方向，這裡沒有樓層或梯子。');action(view.scene==='surface'?'進入山洞 →':'回到地表 →',()=>switchScene(view.scene==='surface'?'underground':'surface'),true);return;}
  if(id==='chest-initial'){panel('最初的小箱子','容量 20 單位 · 目前空箱。15 份食物仍在洞口行囊，待 M2 接入搬運。');return;}
  const resident=world.residents.find(b=>b.id===id);
  if(resident){panel(`${resident.name} · 小小探險家`,resident.note);for(const [mode,label] of [['idle','待機'],['hop','跳行'],['haul','搬運'],['work','工作']]){const b=action(label,()=>{view.animations[id]=mode;renderPanel();});b.setAttribute('aria-pressed',String((view.animations[id]||'idle')===mode));}return;}
  const r=world.resources.find(r=>r.id===id);
  if(r){const labels={berry:'一叢野莓',mushroom:'柔光蘑菇',nut:'落下的堅果',branch:'乾燥枝條',fiber:'柔軟纖維',tree:'小型軟木樹'};
    const verb=r.type==='tree'?'砍伐':'採集';
    panel(labels[r.type],`${r.amount} ${['berry','mushroom','nut'].includes(r.type)?'份食物':'單位材料'} · ${world.marks.has(id)?`已標記，等待泡泡${verb}；再點物品可取消`:'點一下物品即可標記'}。泡泡會自動領取工作。`);
    action(world.marks.has(id)?'取消標記':'標記'+verb,()=>{toggleResource(r);renderPanel();},true);return;
  }
  if(id.startsWith('cell-')){const {x,y}=view.selected,open=world.floor.has(key(x,y));
    panel(open?'可以慢慢安家的地方':`未開挖泥土 · ${x+1}, ${y+1}`,open?(world.zones.get(key(x,y))==='sleep'?'睡眠區預覽 · 地板也可以休息。':world.zones.get(key(x,y))==='storage'?'儲物區預覽 · 還未實際存放物品。':'已開挖地面 · 可指定區域。'):(digStatus(world,x,y)==='waiting-path'?'已標記時需等待通路開通，才可挖掘。':world.marks.has(key(x,y))?'已標記，等待泡泡挖掘；目前為操作預覽。':'相鄰通路可達 · 點一下即可標記。'));
    if(!open)action(world.marks.has(key(x,y))?'取消挖掘標記':'標記挖掘',()=>{markDig(x,y);renderPanel();},true);
    else if(canPlaceZone(world,x,y))for(const [type,label] of [['sleep','睡眠區'],['storage','儲物區'],['clear','清除區域']])action(label,()=>{if(type==='clear')world.zones.delete(key(x,y));else world.zones.set(key(x,y),type);renderPanel();});
  }
}
function renderTools(){
  $('#tools').replaceChildren();
  const list=view.scene==='surface'?[['inspect','⌖ 觀察'],['gather','♧ 採集'],['entrance','⌂ 找山洞']]:[['inspect','⌖ 觀察'],['dig','⚒ 挖掘'],['sleep','☾ 睡眠區'],['storage','▧ 儲物區']];
  for(const [id,label] of list){const b=document.createElement('button');b.textContent=label;b.setAttribute('aria-pressed',String(view.tool===id));b.onclick=()=>{if(id==='entrance'){view.selected={id:'entrance'};const p=project(8,5,'surface');view.camera.x=-p.x*view.camera.zoom;view.camera.y=-p.y*view.camera.zoom+25;renderPanel();return;}view.tool=id;renderTools();toast(({inspect:'點選目標查看資訊',gather:'點一下資源標記，再點一下取消',dig:'點泥土標記，再點取消',sleep:'點已開挖地面指定睡眠區',storage:'點已開挖地面指定儲物區'})[id]);};$('#tools').append(b);}
}
const pointers=new Map();let gesture=null,pinch=null,suppressTap=false;
function local(e){const b=canvas.getBoundingClientRect();return {x:e.clientX-b.left,y:e.clientY-b.top};}
function pair(){const [a,b]=[...pointers.values()];return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)};}
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;canvas.setPointerCapture(e.pointerId);const p=local(e);pointers.set(e.pointerId,p);
  if(pointers.size===1){gesture={x:p.x,y:p.y,lastX:p.x,lastY:p.y,moved:false};suppressTap=false;}
  else{pinch=pair();suppressTap=true;if(gesture)gesture.moved=true;}
});
canvas.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;const p=local(e);pointers.set(e.pointerId,p);
  if(pointers.size>=2){const next=pair();if(pinch&&pinch.d>0){zoomTo(view.camera.zoom*next.d/pinch.d,pinch.x,pinch.y);view.camera.x+=next.x-pinch.x;view.camera.y+=next.y-pinch.y;}pinch=next;}
  else if(gesture){if(Math.hypot(p.x-gesture.x,p.y-gesture.y)>8)gesture.moved=true;if(gesture.moved){view.camera.x+=p.x-gesture.lastX;view.camera.y+=p.y-gesture.lastY;}gesture.lastX=p.x;gesture.lastY=p.y;}
  clampCamera(view.camera,renderer.width,renderer.height,view.scene);
});
function endPointer(e){
  if(!pointers.has(e.pointerId))return;const p=local(e),tap=e.type==='pointerup'&&pointers.size===1&&gesture&&!gesture.moved&&!suppressTap;
  pointers.delete(e.pointerId);pinch=null;
  if(pointers.size===1){const a=[...pointers.values()][0];gesture={x:a.x,y:a.y,lastX:a.x,lastY:a.y,moved:true};}else if(!pointers.size)gesture=null;
  if(tap)selectAt(p.x,p.y);
}
canvas.addEventListener('pointerup',endPointer);canvas.addEventListener('pointercancel',endPointer);canvas.addEventListener('lostpointercapture',e=>{if(pointers.has(e.pointerId)){pointers.delete(e.pointerId);gesture=null;pinch=null;suppressTap=true;}});
canvas.addEventListener('wheel',e=>{e.preventDefault();const p=local(e);zoomTo(view.camera.zoom*Math.exp(-e.deltaY*.001),p.x,p.y);},{passive:false});
function toggleResource(r){
  const verb=r.type==='tree'?'砍伐':'採集';
  if(world.marks.has(r.id)){if(!cancelJob(simulation,r.id)){toast('正在搬運，無法取消');return;}world.marks.delete(r.id);toast('已取消'+verb+'標記');}
  else{const job=queueGather(simulation,r.id);if(!job){toast('資源已採完');return;}world.marks.set(r.id,{id:job.id,type:'gather',target:r.id});toast(`已標記，等待泡泡${verb}`);}
}
function markDig(x,y){
  if(!toggleDig(world,x,y)){toast('這裡已經挖開，請選擇泥土格');return;}
  toast(world.marks.has(key(x,y))?(digStatus(world,x,y)==='waiting-path'?'已標記，等待通路開通後挖掘':'已標記，等待泡泡挖掘（目前為操作預覽）'):'已取消挖掘標記');
}
function activateTarget(h){
  if(h.id==='entrance'){switchScene(view.scene==='surface'?'underground':'surface');return;}
  view.selected={id:h.id,type:h.type};
  const r=world.resources.find(r=>r.id===h.id);
  if(r)toggleResource(r);
  renderPanel();renderResidents();
}
function selectAt(x,y){
  const hits=renderer.pick(x,y);
  // Doorways navigate immediately, including while a zone/dig tool is active.
  if(hits[0]?.id==='entrance'){
    switchScene(view.scene==='surface'?'underground':'surface');return;
  }
  if(hits.length&&(view.tool==='inspect'||view.scene==='surface')){
    activateTarget(hits[0]);
    // Nearby candidates use the same one-tap operation as canvas targets.
    if(hits.length>1)for(const h of hits.slice(1,4)){const b=world.residents.find(r=>r.id===h.id),r=world.resources.find(r=>r.id===h.id);action('附近：'+(b?.name||({berry:'野莓',tree:'小樹',fiber:'纖維',mushroom:'蘑菇',nut:'堅果',branch:'枝條'})[r?.type]||'洞口'),()=>activateTarget(h));}
    return;
  }
  if(view.scene==='underground'){
    const c=view.camera,p=unproject((x-renderer.width/2-c.x)/c.zoom,(y-renderer.height/2-c.y)/c.zoom,view.scene),gx=Math.floor(p.x+.5),gy=Math.floor(p.y+.5);
    if(!inBounds(gx,gy,'underground'))return;
    view.selected={id:`cell-${gx}-${gy}`,x:gx,y:gy};
    if(view.tool==='dig'||(view.tool==='inspect'&&!world.floor.has(key(gx,gy))))markDig(gx,gy);
    if(view.tool==='sleep'||view.tool==='storage'){if(canPlaceZone(world,gx,gy)){const k=key(gx,gy);if(world.zones.get(k)===view.tool)world.zones.delete(k);else world.zones.set(k,view.tool);}else toast('請選擇可達空地，並避開箱子與出口');}
    renderPanel();renderResidents();
  }else{view.selected=null;renderPanel();renderResidents();}
}
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','0'].includes(e.key)){e.preventDefault();if(e.key==='+')zoomTo(view.camera.zoom*1.2);else if(e.key==='-')zoomTo(view.camera.zoom/1.2);else if(e.key==='0')resetCamera();else{view.camera.x+=e.key==='ArrowLeft'?30:e.key==='ArrowRight'?-30:0;view.camera.y+=e.key==='ArrowUp'?30:e.key==='ArrowDown'?-30:0;clampCamera(view.camera,renderer.width,renderer.height,view.scene);}}});
function frame(now){
  const dt=lastTime?Math.min((now-lastTime)/1000,.1):0;lastTime=now;
  if(!paused&&!hidden){animationTime+=dt*speed;const elapsed=dt*speed;advance(simulation,elapsed);view.previewSeconds=simulation.seconds;syncSimulation();saveElapsed+=elapsed;if(saveElapsed>=5){saveElapsed=0;saveGame();}updateResources();}
  if(!hidden){renderer.draw(view,animationTime);frames++;if(now-fpsAt>=1000){lastFps=Math.round(frames*1000/(now-fpsAt));fpsAt=now;frames=0;}}
  const totalMinutes=Math.floor(simulation.seconds/CONFIG.daySeconds*1440+480),minutes=totalMinutes%1440;
  $('#clock').textContent=`第 ${1+Math.floor(totalMinutes/1440)} 天 · ${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
  requestAnimationFrame(frame);
}
resize();resetCamera();renderResidents();renderTools();renderPanel();updateResources();requestAnimationFrame(frame);
window.addEventListener('pagehide',saveGame);
loadArt().then(results=>{
  clearSpriteCache();renderResidents();
  if(results.some(r=>!r.ok))toast('部分新素材未載入，暫時使用原圖；請重新整理。');
});
