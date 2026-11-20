import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { withChrome, KIT, pause } from './chrome.mjs';

const repository=resolve(import.meta.dirname,'..');
// Capture uses the same query states the dossier advertises in shots.json.
const destination=process.argv.includes('--final')?resolve(repository,'screenshots'):resolve(KIT,'research','review');
mkdirSync(destination,{recursive:true});
const shots=JSON.parse(readFileSync(resolve(repository,'shots.json'),'utf8'));
await withChrome(async({call,evaluate,navigate})=>{
  for(const shot of shots) {
    await call('Emulation.setDeviceMetricsOverride',{width:shot.w,height:shot.h,deviceScaleFactor:1,mobile:false});
    await navigate(shot.query);
    await pause(150);
    let quality=82,bytes;
    do {
      const image=await call('Page.captureScreenshot',{format:'jpeg',quality,captureBeyondViewport:false});
      bytes=Buffer.from(image.data,'base64');quality-=4;
    } while(bytes.length>262144&&quality>=60);
    if(bytes.length>262144)throw Error(`${shot.name} exceeds the screenshot byte cap.`);
    writeFileSync(resolve(destination,shot.name),bytes);
    const dimensions=await evaluate('({width:neonTide.exportCanvas().width,height:neonTide.exportCanvas().height})');
    console.log(`${shot.name}: ${bytes.length} bytes; export ${dimensions.width} × ${dimensions.height}`);
  }
});
