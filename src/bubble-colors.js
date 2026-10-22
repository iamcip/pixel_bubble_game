// Exact palette slots from the approved PNG. Eyes, outline, blush and highlights
// are intentionally absent: they must never be recolored by a global hue filter.
const rgb = hex => {
  if(!/^#[0-9a-f]{6}$/i.test(hex))throw new TypeError('Expected #RRGGBB color');
  return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
};
const mix = (a,b,t) => a.map((v,i)=>Math.round(v+(b[i]-v)*t));
export function bubblePalette(resident){
  return {bodyColor:resident.bodyColor??resident.color??'#fbecd5',shadowColor:resident.shadowColor??resident.shade??'#beaec4'};
}
export function recolorBubblePixels(data,resident){
  const palette=bubblePalette(resident),body=rgb(palette.bodyColor),shadow=rgb(palette.shadowColor);
  const slots=new Map([
    ['251,236,213',body],['251,236,211',body],
    ['190,174,196',shadow],['195,178,197',mix(shadow,body,.12)],
    ['157,138,176',mix(shadow,[70,42,75],.28)],
  ]);
  for(let i=0;i<data.length;i+=4){
    if(!data[i+3])continue;
    const color=slots.get(`${data[i]},${data[i+1]},${data[i+2]}`);
    if(color)data.set(color,i);
  }
  return data;
}
let variants=new WeakMap();
export function clearBubbleColors(){variants=new WeakMap();}
export function coloredBubble(image,resident){
  let cache=variants.get(image);
  if(!cache){cache=new Map();variants.set(image,cache);}
  const key=JSON.stringify(bubblePalette(resident));
  if(cache.has(key))return cache.get(key);
  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(image,0,0);
  const pixels=c.getImageData(0,0,canvas.width,canvas.height);
  recolorBubblePixels(pixels.data,resident);c.putImageData(pixels,0,0);
  cache.set(key,canvas);return canvas;
}
