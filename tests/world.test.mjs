import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, RECIPES, FOOD_BUDGET, RESIDENTS, ITEMS, TUTORIAL } from '../src/data.js';
import { initialWorld, project, unproject, reachable, key, toggleDig, digStatus, canPlaceZone, clampCamera } from '../src/world.js';
test('canonical opening: five outside, 15 food, 4×3 room plus entrance corridor, one chest',()=>{
  const w=initialWorld();assert.equal(w.residents.length,5);assert.ok(w.residents.every(b=>b.scene==='surface'));
  assert.equal(new Set(w.residents.map(b=>b.id)).size,5);assert.equal(w.inventory.food,15);
  assert.equal(w.floor.size,15);assert.equal(reachable(w.floor).size,w.floor.size);
  for(let y=3;y<6;y++)for(let x=5;x<9;x++)assert.ok(w.floor.has(key(x,y)));
  assert.ok(w.floor.has(key(w.chest.x,w.chest.y)));assert.equal(w.chest.capacity,20);
  assert.equal(w.zones.size,0);assert.equal(w.marks.size,0);
});
test('projection round trips preserve logical positions in both scenes',()=>{
  for(const scene of ['surface','underground'])for(let x=0;x<15;x+=.5)for(let y=0;y<19;y+=.5){const p=project(x,y,scene),r=unproject(p.x,p.y,scene);assert.ok(Math.abs(x-r.x)<1e-10);assert.ok(Math.abs(y-r.y)<1e-10);}
});
test('four-neighbour connectivity excludes diagonal cells',()=>{const floor=new Set(['7,0','8,1']);assert.equal(reachable(floor).size,1);});
test('digging toggles markers only, rejects floors and out of bounds, preserves world',()=>{
  const w=initialWorld(),floor=[...w.floor],inventory={...w.inventory};
  assert.equal(toggleDig(w,6,6),true);assert.equal(w.marks.size,1);assert.equal(toggleDig(w,6,6),true);assert.equal(w.marks.size,0);
  assert.equal(toggleDig(w,5,3),false);assert.equal(toggleDig(w,-1,5),false);assert.equal(toggleDig(w,15,5),false);
  assert.deepEqual([...w.floor],floor);assert.deepEqual(w.inventory,inventory);
  assert.equal(digStatus(w,6,6),'ready');assert.equal(digStatus(w,12,18),'waiting-path');
});
test('zones require connected empty floor and protect the chest and exit',()=>{
  const w=initialWorld();assert.equal(canPlaceZone(w,6,4),true);assert.equal(canPlaceZone(w,5,3),false);assert.equal(canPlaceZone(w,7,0),false);assert.equal(canPlaceZone(w,0,0),false);
  w.floor.add('1,15');assert.equal(canPlaceZone(w,1,15),false);
});
test('material supply covers five nests and a second chest without tools/workbench',()=>{
  const w=initialWorld(),needs={};for(const [recipe,count] of [[RECIPES.nest,5],[RECIPES.chest,1]])for(const [item,n]of Object.entries(recipe.materials))needs[item]=(needs[item]||0)+n*count;
  const wood=w.resources.filter(r=>['branch','tree'].includes(r.type)).reduce((a,r)=>a+r.amount,0),fiber=w.resources.filter(r=>r.type==='fiber').reduce((a,r)=>a+r.amount,0);
  assert.ok(wood>=needs.wood);assert.ok(fiber>=needs.fiber);assert.equal(needs.food,undefined);
  assert.equal(ITEMS.seed.edible,false);
});
test('five-day provisional budget survives a half-day delay and ends with a two-day reserve',()=>{
  let food=CONFIG.initialFood;for(const day of FOOD_BUDGET){assert.ok(food-day.consumption/2>0);food+=day.forage+day.crop-day.consumption;assert.ok(food>=0);}
  assert.equal(food,14);assert.ok(food>=RESIDENTS.length*2);assert.equal(FOOD_BUDGET.reduce((a,d)=>a+d.consumption,0),25);
  assert.equal(FOOD_BUDGET.slice(0,4).reduce((a,d)=>a+d.crop,0),0);
});
test('stable IDs are unique across source definitions and initial instances',()=>{
  const w=initialWorld(),all=[...RESIDENTS,...Object.values(ITEMS),...Object.values(RECIPES),...TUTORIAL,...w.resources,w.entrance,w.chest];
  assert.equal(new Set(all.map(x=>x.id)).size,all.length);
});
test('camera remains finite and bounded after extreme gestures',()=>{const c={x:1e9,y:-1e9,zoom:2};clampCamera(c,390,400,'surface');assert.ok(c.x<1100&&c.y>-1100);});
