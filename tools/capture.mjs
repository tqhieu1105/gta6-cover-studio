import {readFile,writeFile,mkdir,readdir,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {withChrome} from './chrome.mjs';

const root=resolve(import.meta.dirname,'..');
const shots=JSON.parse(await readFile(resolve(root,'shots.json'),'utf8'));
await mkdir(resolve(root,'screenshots'),{recursive:true});
await withChrome(async({call,navigate})=>{
  for(const shot of shots){
    await call('Emulation.setDeviceMetricsOverride',{width:shot.w,height:shot.h,deviceScaleFactor:1,mobile:false});
    await navigate(shot.query);
    let data;
    for(const quality of [93,88,83,77,70]){
      const result=await call('Page.captureScreenshot',{format:'jpeg',quality,captureBeyondViewport:false,fromSurface:true});
      data=Buffer.from(result.data,'base64');if(data.length<=262144)break;
    }
    if(data.length>262144)throw Error('Screenshot exceeds 256 KiB: '+shot.name);
    await writeFile(resolve(root,'screenshots',shot.name),data);console.log(`${shot.name}: ${shot.w}×${shot.h}, ${data.length} bytes`);
  }
});
const retained=new Set(shots.map(shot=>shot.name));
for(const name of await readdir(resolve(root,'screenshots')))if(!retained.has(name))await unlink(resolve(root,'screenshots',name));
