import test from 'node:test';
import assert from 'node:assert/strict';
import {recolorBubblePixels,bubblePalette} from '../src/bubble-colors.js';
import {RESIDENTS} from '../src/data.js';
test('five distinct attribute palettes replace only body and shadow slots',()=>{
 const bodyColors=new Set();
 for(const resident of RESIDENTS){
  const pixels=new Uint8ClampedArray([251,236,213,255,190,174,196,255,70,42,75,255,248,208,178,255,253,247,231,255,251,236,213,0]);
  const before=pixels.slice();recolorBubblePixels(pixels,resident);
  const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  assert.deepEqual([...pixels.slice(0,3)],rgb(resident.bodyColor));
  assert.deepEqual([...pixels.slice(4,7)],rgb(resident.shadowColor));
  assert.deepEqual(pixels.slice(8),before.slice(8));
  assert.equal(pixels[3],255);assert.equal(pixels[7],255);
  bodyColors.add(pixels.slice(0,3).join(','));
 }
 assert.equal(bodyColors.size,5);
});
test('attributes override legacy colors and reject invalid colors',()=>{
 assert.equal(bubblePalette({bodyColor:'#123456',color:'#ffffff'}).bodyColor,'#123456');
 assert.equal(bubblePalette({color:'#123456'}).bodyColor,'#123456');
 assert.throws(()=>recolorBubblePixels(new Uint8ClampedArray(4),{bodyColor:'bad'}),TypeError);
});
