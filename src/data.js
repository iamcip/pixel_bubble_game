// All unconfirmed balance values live here. M1 does not consume or award resources.
export const CONFIG = Object.freeze({
  schemaVersion: 1, daySeconds: 720, dailyFood: 1, restFraction: 0.25,
  underground: { width: 15, height: 24 }, surface: { width: 19, height: 19 },
  initialFood: 15, chestCapacity: 20, carrySlots: 2, season: 'spring',
  zoom: { min: 0.65, max: 2.5 },
});
export const RESIDENTS = [
  { id: 'bubble-01', name: '米米', bodyColor: '#FBECD5', shadowColor: '#BEAEC4', accessory: 'sprout', note: '第一個發現山洞，現在正在想像新家的模樣。' },
  { id: 'bubble-02', name: '芽芽', bodyColor: '#BBCBA8', shadowColor: '#8E8AA5', accessory: 'leaf', note: '喜歡森林的氣味，想找一個暖暖的角落。' },
  { id: 'bubble-03', name: '露露', bodyColor: '#B5CFDC', shadowColor: '#9290B1', accessory: 'cap', note: '小心地打量四周，口袋裡裝著一點勇氣。' },
  { id: 'bubble-04', name: '朵朵', bodyColor: '#D0BFE2', shadowColor: '#9D88B4', accessory: 'flower', note: '說這裡的微光，看起來像掉下來的星星。' },
  { id: 'bubble-05', name: '桃桃', bodyColor: '#E4BBBE', shadowColor: '#AD8FA9', accessory: 'tuft', note: '有朋友、有食物，就可以慢慢把這裡變成家。' },
];
export const ITEMS = {
  food: { id: 'food', name: '食物', slots: 1, edible: true },
  wood: { id: 'wood', name: '木材', slots: 1, edible: false },
  fiber: { id: 'fiber', name: '纖維', slots: 1, edible: false },
  seed: { id: 'seed', name: '種子', slots: 1, edible: false },
};
export const RECIPES = {
  nest: { id: 'nest', name: '草窩', materials: { wood: 1, fiber: 2 }, workSeconds: 12, footprint: [1, 1], blocks: false },
  chest: { id: 'chest', name: '箱子', materials: { wood: 3, fiber: 1 }, workSeconds: 18, footprint: [1, 1], blocks: true, capacity: 20 },
};
export const CROP = { id: 'moon-turnip', name: '月光蕪菁', growthSeconds: 720, foodYield: 2, seedYield: 1, seedCost: 1, waterVisits: 1 };
export const TASK_STATES = ['waiting', 'claimed', 'travelling', 'working', 'hauling', 'delivering', 'done', 'paused', 'cancelled', 'invalid'];
export const TUTORIAL = [
  { id: 'tutorial-settle', day: 1, title: '住下來', conditions: ['resident-inspected', 'food-delivered', 'sleep-zone-used'] },
  { id: 'tutorial-home', day: 2, title: '第一個家', conditions: ['wood-delivered', 'five-nests-built'] },
  { id: 'tutorial-expand', day: 3, title: '擴建', conditions: ['reachable-dig', 'second-chest', 'sleep-and-storage-zones'] },
  { id: 'tutorial-farm', day: 4, title: '種植', conditions: ['crop-seeded', 'crop-watered'] },
  { id: 'tutorial-stable', day: 5, title: '穩定生活', conditions: ['priority-changed', 'crop-delivered', 'two-day-food-reserve'] },
];
// Planning scenario, not guaranteed/secret income. A real scheduler must validate in M2–M4.
export const FOOD_BUDGET = [
  { day: 1, forage: 4, crop: 0, consumption: 5 },
  { day: 2, forage: 5, crop: 0, consumption: 5 },
  { day: 3, forage: 5, crop: 0, consumption: 5 },
  { day: 4, forage: 4, crop: 0, consumption: 5 },
  { day: 5, forage: 4, crop: 2, consumption: 5 },
];
