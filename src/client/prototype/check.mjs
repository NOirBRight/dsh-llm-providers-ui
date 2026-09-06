// Throwaway browser smoke. Run with Chrome CDP on localhost:9228 and preview on :3083.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const tabs=await (await fetch('http://127.0.0.1:9228/json')).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();const errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}});
async function call(method,params={}){const key=++id;const result=new Promise(r=>pending.set(key,r));ws.send(JSON.stringify({id:key,method,params}));const m=await result;if(m.error)throw Error(JSON.stringify(m.error));return m.result}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
await call('Runtime.enable');await call('Page.enable');
for(const width of [1280,390]){
 await call('Emulation.setDeviceMetricsOverride',{width,height:960,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:'http://127.0.0.1:3083/providers.html?variant=A'});
 // Readiness is tied to the document, not a fixed rendering delay.
 await evaluate('new Promise(resolve=>{function ready(){if(document.querySelector(".card"))resolve(true);else requestAnimationFrame(ready)}ready()})');
 for(const v of ['A','B','C']){
  await evaluate('switchVariant('+JSON.stringify(v)+')');
  assert.equal(await evaluate('variant'),v);
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'horizontal overflow '+v+' '+width);
  const image=await call('Page.captureScreenshot',{format:'png'});await writeFile('/tmp/provider-'+v+'-'+width+'.png',Buffer.from(image.data,'base64'));
 }
 await evaluate(`document.querySelector('[data-action="manage"][data-id="agy"]').click()`);
 assert.equal(await evaluate('drawer'),true);
 await evaluate(`document.querySelector('[data-action="tab"][data-id="模型"]').click();document.querySelector("[data-model]").click()`);
 assert.equal(await evaluate('dirty'),true);
 await evaluate(`document.querySelector('[data-action="save"]').click()`);assert.equal(await evaluate('dirty'),false);
 await evaluate(`document.querySelector('[data-action="close"]').click()`);assert.equal(await evaluate('drawer'),false);
}
assert.deepEqual(errors,[]);console.log('PASS: A/B/C desktop + mobile, no horizontal overflow or JS exceptions; drawer, model edit and save');ws.close();
