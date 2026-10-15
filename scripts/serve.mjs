import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.md':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
  try {
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root, `.${name === '/' ? '/index.html' : name}`);
    if(!file.startsWith(root.endsWith(sep)?root:root+sep)) {res.writeHead(403).end();return;}
    const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(body);
  } catch {res.writeHead(404).end('Not found');}
}).listen(Number(process.env.PORT||4173),'0.0.0.0',()=>console.log('Bubble Colony: http://localhost:'+ (process.env.PORT||4173)));
