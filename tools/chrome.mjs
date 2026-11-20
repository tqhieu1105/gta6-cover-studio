import {spawn} from 'node:child_process';
import {mkdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';

export const RESEARCH=resolve(import.meta.dirname,'../../research');
export const pause=milliseconds=>new Promise(done=>setTimeout(done,milliseconds));
export async function withChrome(work){
  const httpPort=8321,debugPort=9441;
  const profile=`/tmp/neon-tide-browser-${process.pid}`;
  const started=[];let socket;let nextId=0;const inflight=new Map();const handlers=new Map();
  const launch=(command,args)=>{const child=spawn('timeout',['180',command,...args],{stdio:'ignore',detached:true});started.push(child);return child;};
  try{
    await mkdir(RESEARCH,{recursive:true});
    launch(process.execPath,[resolve(import.meta.dirname,'../serve.ts'),'--port',String(httpPort)]);
    launch('/usr/bin/google-chrome',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-extensions','--disable-component-extensions-with-background-pages',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--hide-scrollbars','--force-device-scale-factor=1','about:blank']);
    let target;
    for(let attempt=0;attempt<100;attempt++){
      try{const targets=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();target=targets.find(item=>item.type==='page');if(target&&(await fetch(`http://127.0.0.1:${httpPort}`)).ok)break;}catch{}
      await pause(100);
    }
    if(!target)throw Error('Chrome did not create a page target within 10 seconds.');
    socket=new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((done,fail)=>{socket.onopen=done;socket.onerror=fail;});
    socket.onmessage=event=>{
      const message=JSON.parse(event.data);
      if(message.id){const pending=inflight.get(message.id);if(!pending)return;clearTimeout(pending.timer);inflight.delete(message.id);message.error?pending.fail(Error(message.error.message)):pending.done(message.result);}
      else for(const handler of handlers.get(message.method)||[])handler(message.params);
    };
    const call=(method,params={})=>new Promise((done,fail)=>{const id=++nextId;const timer=setTimeout(()=>{inflight.delete(id);fail(Error('Browser command timed out: '+method));},25000);inflight.set(id,{done,fail,timer});socket.send(JSON.stringify({id,method,params}));});
    const on=(event,handler)=>handlers.set(event,[...(handlers.get(event)||[]),handler]);
    const evaluate=async expression=>{const response=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(response.exceptionDetails)throw Error(response.exceptionDetails.exception?.description||response.exceptionDetails.text);return response.result.value;};
    const until=async(expression,attempts=150)=>{for(let i=0;i<attempts;i++){if(await evaluate(expression))return;await pause(100);}throw Error('Browser condition timed out: '+expression.slice(0,100));};
    const navigate=async(query='')=>{await call('Page.navigate',{url:`http://127.0.0.1:${httpPort}/${query}`});await until('window.__shotReady===true');await pause(120);};
    await call('Page.enable');await call('Runtime.enable');await call('Network.enable');
    await work({call,evaluate,navigate,on,until,origin:`http://127.0.0.1:${httpPort}`});
  }finally{
    for(const pending of inflight.values()){clearTimeout(pending.timer);pending.fail(Error('Browser closed'));}
    socket?.close();
    for(const child of started){try{process.kill(-child.pid,'SIGTERM');}catch{}}
    await pause(100);await rm(profile,{recursive:true,force:true}).catch(()=>{});
  }
}
