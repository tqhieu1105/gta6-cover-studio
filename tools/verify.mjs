// Verify the real browser flow and downloaded PNGs; no renderer mocks.
// This intentionally exercises every layout, grade and export size.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { withChrome, KIT, pause } from './chrome.mjs';

const proofDirectory=resolve(KIT,'research','exports');
mkdirSync(proofDirectory,{recursive:true});
const repository=resolve(import.meta.dirname,'..');
const checks=[];
const report={checks,exports:[],errors:[],remoteRequests:[]};
function verify(value,label){if(!value)throw Error(label);checks.push(label);}
await withChrome(async({call,evaluate,navigate,on})=>{
  await call('Network.enable');
  on('Runtime.exceptionThrown',event=>report.errors.push(event.exceptionDetails.text));
  on('Network.requestWillBeSent',event=>{
    if(/^https?:/.test(event.request.url)&&!event.request.url.startsWith('http://127.0.0.1:8317/'))report.remoteRequests.push(event.request.url);
  });
  const completed=[];
  on('Browser.downloadProgress',event=>{if(event.state==='completed')completed.push(event.guid);});
  await call('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:proofDirectory,eventsEnabled:true});
  await call('Emulation.setDeviceMetricsOverride',{width:1280,height:960,deviceScaleFactor:1,mobile:false});
  await navigate();
  verify(await evaluate('neonTide.photos.length===2 && neonTide.state.panels.length===6'),'Two kit photos and six panels load offline');
  for(const layout of ['headliner','crossfire','triptych','coastline','split','sixpack','riptide','spotlight']){
    await evaluate(`document.querySelector('[data-layout="${layout}"]').click()`);
    for(const format of ['square','portrait','landscape']){
      await evaluate(`document.querySelector('[data-format="${format}"]').click()`);
      await pause(45);
      const dimensions=await evaluate('({w:poster.width,h:poster.height,layout:neonTide.state.layout,format:neonTide.state.format,shown:poster.getBoundingClientRect().toJSON()})');
      const size={square:[1080,1080],portrait:[1080,1350],landscape:[1920,1080]}[format];
      verify(dimensions.w===size[0]&&dimensions.h===size[1]&&dimensions.layout===layout,`${layout} renders at ${format} resolution`);
      verify(Math.abs(dimensions.shown.width/dimensions.shown.height-size[0]/size[1])<.01,`${layout}/${format} preview preserves its aspect ratio`);
    }
  }
  const hashes=[];
  for(const grade of ['sunset','neon','tropic','rose','gold','blue']){
    await evaluate(`document.querySelector('[data-grade="${grade}"]').click()`);await pause(100);
    hashes.push(await evaluate('poster.toDataURL().slice(-1400)'));
    verify(await evaluate(`neonTide.state.grade==='${grade}'`),`${grade} applies through the real controls`);
  }
  verify(new Set(hashes).size>=5,'Color grades produce visibly different canvas bytes');
  await navigate();
  const previousTitle=await evaluate('neonTide.state.title');
  await evaluate(`document.getElementById('title-input').value='TEST\\nDRIVE';document.getElementById('title-input').dispatchEvent(new Event('input',{bubbles:true}))`);
  verify(await evaluate("neonTide.state.title==='TEST\\nDRIVE'"),'Caption editing reaches poster state');
  await evaluate("document.getElementById('undo').click()");
  verify(await evaluate(`neonTide.state.title===${JSON.stringify(previousTitle)}`),'Undo restores the caption');
  await evaluate("document.getElementById('redo').click()");
  verify(await evaluate("neonTide.state.title==='TEST\\nDRIVE'"),'Redo reapplies the caption');
  const doc=await call('DOM.getDocument');
  const input=await call('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#photo-files'});
  await call('DOM.setFileInputFiles',{nodeId:input.nodeId,files:[resolve(repository,'app/samples/boulevard.jpg'),resolve(repository,'app/samples/pier.jpg')]});
  for(let i=0;i<40;i++){if(await evaluate('neonTide.photos.length===4'))break;await pause(100);}
  verify(await evaluate("neonTide.photos.length===4&&neonTide.state.panels.every(p=>p.source==='photo'&&p.photo>=2)"),'Local imports automatically fill all panels with the incoming photos');
  await evaluate("document.getElementById('fill-panels').click()");
  verify(await evaluate("neonTide.state.panels.every(p=>p.source==='photo')"),'Auto-fill replaces every illustrated panel with a photo');
  await evaluate("document.getElementById('zoom-range').value=160;document.getElementById('zoom-range').dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('crop-x').value=35;document.getElementById('crop-x').dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('role-input').value='THE PROOF';document.getElementById('role-input').dispatchEvent(new Event('input',{bubbles:true}))");
  verify(await evaluate("neonTide.state.panels[1].zoom===1.6&&neonTide.state.panels[1].x===.35&&neonTide.state.panels[1].role==='THE PROOF'"),'Zoom, position and role editing apply to the selected panel');
  await evaluate("document.getElementById('flip-photo').click()");
  verify(await evaluate('neonTide.state.panels[1].flip'),'Flip applies to the selected photo');
  const activeSource=await evaluate('neonTide.state.panels[1].source');
  await evaluate("document.getElementById('panel-photo').value='scene';document.getElementById('panel-photo').dispatchEvent(new Event('change',{bubbles:true}))");
  verify(await evaluate("neonTide.state.panels[1].source==='photo'"),'Panel selector restores the layout’s photo source after a local assignment');
  for(const format of ['square','portrait','landscape']){
    const count=completed.length;
    await evaluate(`document.querySelector('.export-size[data-export="${format}"]').click()`);
    for(let wait=0;wait<100;wait++){if(completed.length>count)break;await pause(100);}
    const bytes=readFileSync(resolve(proofDirectory,`neon-tide-${format}-poster.png`));
    verify(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),`${format} download is a real PNG`);
    const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
    const desired={square:[1080,1080],portrait:[1080,1350],landscape:[1920,1080]}[format];
    verify(width===desired[0]&&height===desired[1],`${format} PNG has exact export dimensions`);
    report.exports.push({format,width,height,bytes:bytes.length});
  }
  verify(report.remoteRequests.length===0,'No assets or photos requested a remote origin');
  verify(report.errors.length===0,'Chrome reported no JavaScript exceptions');
});
writeFileSync(resolve(KIT,'research','browser-verification.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({passed:checks.length,exports:report.exports,errors:report.errors,remoteRequests:report.remoteRequests},null,2));
