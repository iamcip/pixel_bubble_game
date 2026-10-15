import { CONFIG, RESIDENTS } from './data.js';
export const key = (x, y) => `${x},${y}`;
export function initialWorld() {
  const floor = new Set();
  for (let y = 0; y <= 3; y++) floor.add(key(7, y));
  for (let y = 3; y < 6; y++) for (let x = 5; x < 9; x++) floor.add(key(x, y));
  const resources = [
    ['berry-01','berry',5,8,4], ['mushroom-01','mushroom',10,8,4], ['nut-01','nut',6,13,3],
    ['berry-02','berry',13,10,4], ['mushroom-02','mushroom',12,14,3],
    ['branch-01','branch',8,12,4], ['branch-02','branch',4,10,4],
    ['fiber-01','fiber',6,10,6], ['fiber-02','fiber',11,12,6],
    ['tree-soft-01','tree',3,7,4], ['tree-soft-02','tree',14,8,4], ['tree-soft-03','tree',9,15,4],
  ].map(([id, type, x, y, amount]) => ({ id, type, x, y, amount }));
  return {
    version: CONFIG.schemaVersion, floor, marks: new Map(), zones: new Map(), resources,
    entrance: { id: 'entrance-surface', x: 8, y: 5 },
    chest: { id: 'chest-initial', x: 5, y: 3, capacity: CONFIG.chestCapacity },
    inventory: { food: CONFIG.initialFood, wood: 0, fiber: 0, seed: 2 },
    residents: RESIDENTS.map((r, i) => ({ ...r, scene: 'surface', x: 7 + (i % 3) * 1.25, y: 7 + Math.floor(i / 3) * 1.4 })),
  };
}
export function project(x, y, scene) {
  return scene === 'surface' ? { x: (x - y) * 19, y: (x + y) * 10 } : { x: (x - 7) * 30, y: y * 27 };
}
export function unproject(x, y, scene) {
  return scene === 'surface' ? { x: (x / 19 + y / 10) / 2, y: (y / 10 - x / 19) / 2 } : { x: x / 30 + 7, y: y / 27 };
}
export function inBounds(x, y, scene) {
  const m = CONFIG[scene];
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < m.width && y < m.height;
}
export function reachable(floor, start = [7, 0], blocked = new Set()) {
  const seen = new Set(), queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i], k = key(x, y);
    if (seen.has(k) || !floor.has(k) || blocked.has(k)) continue;
    seen.add(k);
    queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  return seen;
}
export function canPlaceZone(world, x, y) {
  return world.floor.has(key(x,y)) && reachable(world.floor).has(key(x,y)) && !(world.chest.x === x && world.chest.y === y) && y > 0;
}
export function digStatus(world, x, y) {
  if (!inBounds(x,y,'underground') || world.floor.has(key(x,y))) return 'invalid';
  const connected = reachable(world.floor);
  return [[x-1,y],[x+1,y],[x,y-1],[x,y+1]].some(([a,b])=>connected.has(key(a,b))) ? 'ready' : 'waiting-path';
}
export function toggleDig(world, x, y) {
  if (digStatus(world,x,y) === 'invalid') return false;
  const k=key(x,y); if(world.marks.has(k)) world.marks.delete(k); else world.marks.set(k,{id:`dig-${x}-${y}`,type:'dig',x,y});
  return true;
}
export function cameraPoint(point, camera, width, height) {
  return { x: width/2 + camera.x + point.x*camera.zoom, y: height/2 + camera.y + point.y*camera.zoom };
}
// Keep the world centre near the viewport, even after very long drag gestures.
export function clampCamera(camera, width, height, scene) {
  const limit = scene === 'surface' ? 460 : 760;
  camera.x=Math.max(-limit*camera.zoom-width/3,Math.min(limit*camera.zoom+width/3,camera.x));
  camera.y=Math.max(-limit*camera.zoom-height/3,Math.min(limit*camera.zoom+height/3,camera.y));
}
