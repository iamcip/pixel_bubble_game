import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
test('static entry and modules load with correct MIME; traversal and missing files are rejected',async()=>{
 const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'4175'},stdio:['ignore','pipe','pipe']});
 try {
  await once(server.stdout,'data');
  for(const [path,mime] of [['','text/html'],['styles.css','text/css'],['src/main.js','text/javascript'],['src/data.js','text/javascript'],['src/world.js','text/javascript'],['src/render.js','text/javascript']]){
   const r=await fetch('http://127.0.0.1:4175/'+path);assert.equal(r.status,200);assert.ok(r.headers.get('content-type').includes(mime));assert.ok((await r.text()).length>0);
  }
  assert.equal((await fetch('http://127.0.0.1:4175/not-a-file')).status,404);
  assert.equal((await fetch('http://127.0.0.1:4175/%2e%2e%2fpackage.json')).status,403);
 }finally{server.kill();await once(server,'exit');}
});
