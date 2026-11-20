import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
export const KIT = '/workspace/makefun/bounties/gta6-cover-art-01/kit';
// A fresh temporary Chrome target makes screenshots deterministic and offline.
export const pause = ms => new Promise(resolve => setTimeout(resolve,ms));

export async function withChrome(task) {
  const port = 9437;
  const profile = `${KIT}/research/chrome-neon-tide`;
  mkdirSync(profile,{recursive:true});
  const child = spawn('/usr/bin/google-chrome',[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    `--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,
    '--no-first-run','--hide-scrollbars','--force-device-scale-factor=1','about:blank',
  ],{stdio:'ignore'});
  let socket;
  let sequence = 0;
  const pending = new Map();
  const listeners = new Map();
  let server;
  try {
    try {
      const response=await fetch('http://127.0.0.1:8317/');
      if(!response.ok)throw Error('No local server');
    } catch {
      server=spawn(process.execPath,[resolve(import.meta.dirname,'../serve.ts'),'--port','8317'],{stdio:'ignore'});
      for(let attempt=0;attempt<50;attempt++){
        try{if((await fetch('http://127.0.0.1:8317/')).ok)break;}catch{}
        await pause(100);
      }
    }
    let page;
    for(let attempt=0;attempt<80;attempt++) {
      try {
        const targets=await(await fetch(`http://127.0.0.1:${port}/json`)).json();
        page=targets.find(tab=>tab.type==='page');
        if(page)break;
      } catch {}
      await pause(100);
    }
    if(!page)throw Error('Headless Chrome did not open a page target.');
    socket=new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
    socket.onmessage=event=>{
      const message=JSON.parse(event.data);
      if(message.id) {
        const work=pending.get(message.id);pending.delete(message.id);
        if(message.error)work?.reject(Error(JSON.stringify(message.error)));
        else work?.resolve(message.result);
      } else for(const handler of listeners.get(message.method)||[])handler(message.params);
    };
    const call=(method,params={})=>new Promise((resolve,reject)=>{
      const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));
    });
    const on=(name,handler)=>listeners.set(name,[...(listeners.get(name)||[]),handler]);
    const evaluate=async expression=>{
      const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
      if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const navigate=async(query='')=>{
      await call('Page.navigate',{url:`http://127.0.0.1:8317/${query}`});
      for(let attempt=0;attempt<150;attempt++) {
        await pause(100);
        if(await evaluate('window.__shotReady === true')) {await pause(150);return;}
      }
      throw Error(`Poster did not finish loading: ${query}`);
    };
    await call('Page.enable');await call('Runtime.enable');
    await task({call,evaluate,navigate,on});
  } finally {
    socket?.close();child.kill('SIGTERM');server?.kill('SIGTERM');
  }
}
