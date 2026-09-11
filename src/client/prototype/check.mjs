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
for(const width of [1280,390,320]) for(const theme of ['light','dark']){
 await call('Emulation.setDeviceMetricsOverride',{width,height:960,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:'http://127.0.0.1:3083/providers.html?variant=A&theme='+theme});
 await evaluate('new Promise(resolve=>{function ready(){if(document.querySelector(".card"))resolve(true);else requestAnimationFrame(ready)}ready()})');
 assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'closed overflow '+width);
 assert.equal(await evaluate('getComputedStyle(document.querySelector(".agent-card")).borderLeftWidth'),'0px');
 const image=await call('Page.captureScreenshot',{format:'png'});await writeFile('/tmp/provider-clean-'+width+'-'+theme+'.png',Buffer.from(image.data,'base64'));
 await evaluate("document.querySelector('[data-action=\"open\"][data-id=\"agy\"]').click()");
 assert.equal(await evaluate('opened'),'agy');
 assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'expanded overflow '+width);
 await evaluate('document.querySelector("[data-model]").click()');assert.equal(await evaluate('dirty'),true);
 await evaluate("document.querySelector('[data-action=\"save\"]').click()");assert.equal(await evaluate('dirty'),false);
 await evaluate("document.querySelector('[data-action=\"open\"][data-id=\"agy\"]').click()");assert.equal(await evaluate('opened'),null);
 assert.equal(await evaluate('document.querySelectorAll(".cardHeader .mark svg").length'),8);
 await evaluate("document.querySelector('[data-action=\"open\"][data-id=\"agy\"]').click()");
 await evaluate("document.querySelector('[data-action=\"model-settings\"][data-index=\"0\"]').click()");
 await evaluate('document.querySelector("[data-pref=effort]").value="high";document.querySelector("[data-pref=effort]").dispatchEvent(new Event("change",{bubbles:true}))');
 assert.equal(await evaluate('prefs.agy[0].effort'),'high');
 await evaluate('document.querySelector("[data-pref=thinking]").click()');
 assert.equal(await evaluate('prefs.agy[0].effort'),'auto');
 assert.equal(await evaluate('document.querySelector("[data-pref=effort]").disabled'),true);
 assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'model menu overflow');
 await evaluate("document.querySelector('[data-action=\"model-sort\"]').click()");
 await evaluate("document.querySelector('[data-scope=\"agy\"][data-id=\"0\"][data-offset=\"1\"]').click()");
 assert.deepEqual(await evaluate('modelOrder.agy'),['1','0','2']);
 await evaluate("document.querySelector('[data-action=\"model-sort\"]').click()");
 await evaluate("document.querySelector('[data-action=\"provider-sort\"]').click()");
 await evaluate("document.querySelector('[data-scope=\"providers\"][data-id=\"agy\"][data-offset=\"-1\"]').click()");
 assert.equal(await evaluate('providerOrder[0]'),'agy');
 assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'sort overflow');
 const points=await evaluate('[...document.querySelectorAll(".sortrow")].slice(0,2).map(r=>{const b=r.querySelector(".grip").getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})');
 if(width<681){await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...points[0],id:1}]});await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...points[1],id:1}]});await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
 else {await call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...points[0]});await call('Input.dispatchMouseEvent',{type:'mouseMoved',button:'left',buttons:1,...points[1]});await call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...points[1]})}
 assert.equal(await evaluate('providerOrder[0]'),'codex','drag reorder');
}
assert.deepEqual(errors,[]);console.log('PASS: selected A, light/dark, desktop/390/320; no side accents or overflow; eight icons, capabilities, effort, model ordering, mouse/touch provider dragging and save');ws.close();
