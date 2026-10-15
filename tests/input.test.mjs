// DOM/canvas API smoke harness, not a substitute for browser layout or device QA.
import test from 'node:test';
import assert from 'node:assert/strict';
class Element {
  constructor(tag='div'){this.tag=tag;this.children=[];this.events={};this.attributes={};this.textContent='';this.style={};this.classList={add(){},remove(){},toggle(){}};this.width=390;this.height=400;}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=children;}
  setAttribute(k,v){this.attributes[k]=v;}
  addEventListener(k,f){this.events[k]=f;}
  getBoundingClientRect(){return {left:0,top:0,width:390,height:400};}
  getContext(){return context;}
  toDataURL(){return 'data:image/png;base64,';}
  setPointerCapture(){}
  showModal(){this.open=true;}
}
const gradient={addColorStop(){}};
const context=new Proxy({createRadialGradient:()=>gradient},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>(t[k]=v,true)});
const elements=new Map();const byId=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
let frame;
globalThis.document={hidden:false,querySelector:byId,createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),addEventListener(){}};
globalThis.ResizeObserver=class{constructor(fn){this.fn=fn;}observe(){this.fn();}};
globalThis.requestAnimationFrame=fn=>{frame=fn;};
await import('../src/main.js');
const click=id=>byId(id).onclick();
const canvas=byId('#world');
const pointer=(type,x,y,id=1)=>canvas.events[type]({type,pointerId:id,clientX:x,clientY:y,button:0});
const tap=(x,y)=>{pointer('pointerdown',x,y);pointer('pointerup',x,y);};
const tools=()=>byId('#tools').children;
const actions=()=>byId('#actions').children;
const title=()=>byId('#selection').children[0].textContent;
test('UI module initializes, renders both scenes, picks residents, supports markers and rejects drag/pinch taps',()=>{
  frame(1000);frame(1016);assert.equal(byId('#residents').children.length,5);
  byId('#residents').children[0].onclick();assert.match(title(),/米米/);actions()[2].onclick();frame(1032);
  click('#underground');frame(1048);assert.match(title(),/箱子/);
  tools().find(b=>b.textContent.includes('挖掘')).onclick();
  tap(165,272);assert.equal(byId('#mark-count').textContent,'1 個工作標記');
  tap(165,272);assert.equal(byId('#mark-count').textContent,'0 個工作標記');
  pointer('pointerdown',165,272);pointer('pointermove',195,302);pointer('pointerup',195,302);assert.equal(byId('#mark-count').textContent,'0 個工作標記');
  click('#recenter');
  pointer('pointerdown',140,220);pointer('pointerdown',240,220,2);pointer('pointermove',260,220,2);pointer('pointerup',260,220,2);pointer('pointerup',140,220);assert.equal(byId('#mark-count').textContent,'0 個工作標記');
  click('#surface');frame(1064);click('#help');assert.equal(byId('#help-dialog').open,true);
  byId('#stress').onchange({target:{checked:true}});frame(1080);assert.equal(byId('#residents').children.length,5);
  click('#pause');assert.equal(byId('#pause').attributes['aria-pressed'],'true');click('#speed');assert.equal(byId('#speed').textContent,'2×');
});
