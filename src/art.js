// All four source pixels use the same world scale; never resize the source files.
export const ART_SCALE = 0.5;
export const ART = Object.freeze({
  bubble: {path:'residents/bubble-base.png',width:64,height:72,anchor:[32,60]},
  cave: {path:'objects/cave-entrance.png',width:256,height:224,anchor:[128,220]},
  tree: {path:'objects/tree.png',width:160,height:224,anchor:[80,220]},
  grass: {path:'tiles/surface-grass.png',width:76,height:40,anchor:[38,20]},
});
const images = new Map();
let loading;
export function getArt(name) { return images.get(name); }
export function loadArt(ImageClass = globalThis.Image) {
  if (!ImageClass) return Promise.resolve([]);
  return loading ??= Promise.all(Object.entries(ART).map(([name,spec]) => new Promise(resolve => {
    const image = new ImageClass();
    image.onload = () => {
      const ok = image.naturalWidth === spec.width && image.naturalHeight === spec.height;
      if (ok) images.set(name,image);
      resolve({name,ok});
    };
    image.onerror = () => resolve({name,ok:false});
    image.src = new URL('../assets/game/redesign-20261019/'+spec.path,import.meta.url).href;
  })));
}
export function drawArt(c,name,x,y) {
  const image = images.get(name);
  if (!image) return false;
  const {width,height,anchor} = ART[name];
  c.drawImage(image,x-anchor[0]*ART_SCALE,y-anchor[1]*ART_SCALE,width*ART_SCALE,height*ART_SCALE);
  return true;
}
