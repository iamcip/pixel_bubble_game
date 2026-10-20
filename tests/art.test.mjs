import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ART,ART_SCALE,loadArt,getArt,drawArt} from '../src/art.js';
test('four original PNGs have exact handoff dimensions',async()=>{
 for(const spec of Object.values(ART)){
  const data=await readFile(new URL('../assets/game/redesign-20261019/'+spec.path,import.meta.url));
  assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(data.readUInt32BE(16),spec.width);assert.equal(data.readUInt32BE(20),spec.height);
 }
 assert.equal(ART_SCALE,.5);
});
test('loader validates dimensions, caches images, and draws with shared scale and anchors',async()=>{
 class ImageMock {
  set src(url){const spec=Object.values(ART).find(s=>url.endsWith(s.path));assert.ok(spec);this.naturalWidth=spec.width;this.naturalHeight=spec.height;queueMicrotask(()=>this.onload());}
 }
 const pending=loadArt(ImageMock);assert.equal(loadArt(ImageMock),pending);
 assert.ok((await pending).every(r=>r.ok));
 for(const [name,spec] of Object.entries(ART)){
  let args;assert.equal(drawArt({drawImage(...a){args=a;}},name,100,200),true);
  assert.deepEqual(args,[getArt(name),100-spec.anchor[0]/2,200-spec.anchor[1]/2,spec.width/2,spec.height/2]);
 }
});
test('bad dimensions and network errors keep fallback drawing available',async()=>{
 const art=await import('../src/art.js?failure-test');
 class BrokenImage {set src(url){this.naturalWidth=1;this.naturalHeight=1;queueMicrotask(()=>url.endsWith('tree.png')?this.onerror():this.onload());}}
 assert.ok((await art.loadArt(BrokenImage)).every(r=>!r.ok));
 assert.equal(art.drawArt({},'tree',0,0),false);
});
