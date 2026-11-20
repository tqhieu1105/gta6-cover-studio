import {writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {withChrome,RESEARCH,pause} from './chrome.mjs';

const assertions=[];
function check(name,passed,detail=''){assertions.push({name,passed:Boolean(passed),detail});if(!passed)throw Error(name+': '+detail);}
await mkdir(resolve(RESEARCH,'exports'),{recursive:true});
const exceptions=[],remote=[],badResponses=[];
await withChrome(async({call,evaluate,navigate,on,until,origin})=>{
  on('Runtime.exceptionThrown',event=>exceptions.push(event.exceptionDetails.exception?.description||event.exceptionDetails.text));
  on('Network.requestWillBeSent',event=>{if(!event.request.url.startsWith(origin)&&!event.request.url.startsWith('data:')&&!event.request.url.startsWith('blob:'))remote.push(event.request.url);});
  on('Network.responseReceived',event=>{if(event.response.status>=400)badResponses.push(event.response.url);});
  await call('Emulation.setDeviceMetricsOverride',{width:1280,height:960,deviceScaleFactor:1,mobile:false});
  await navigate();
  let report=await evaluate(`(()=>{const app=window.neonTide;return {photos:app.photos.length,distinct:new Set(app.state.panels.filter(p=>p.source==='photo').map(p=>p.photo)).size,panels:app.state.panels.length,library:document.querySelectorAll('.library-photo').length,formats:document.querySelectorAll('[data-export]').length,ready:app.ready};})()`);
  check('App initialized',report.ready);check('At least four local sample subjects',report.photos>=4,String(report.photos));check('Five meaningful photo panels',report.panels===6);check('Five distinct default cast photos',report.distinct===5,String(report.distinct));check('Library shows every sample',report.library===report.photos);check('Three one-click export sizes',report.formats===3);
  // Export all three sizes through the exact compositor used by the preview.
  for(const [format,w,h] of [['square',1080,1080],['portrait',1080,1350],['landscape',1920,1080]]){
    const exported=await evaluate(`(()=>{const c=neonTide.exportCanvas('${format}');return {w:c.width,h:c.height,data:c.toDataURL('image/png')};})()`);
    check(format+' exact PNG dimensions',exported.w===w&&exported.h===h,`${exported.w}×${exported.h}`);
    const png=Buffer.from(exported.data.split(',')[1],'base64');check(format+' PNG signature',png.subarray(1,4).toString()==='PNG');await writeFile(resolve(RESEARCH,'exports',`neon-tide-${format}.png`),png);
  }
  const before=await evaluate(`document.getElementById('poster').toDataURL()`);
  await evaluate(`(()=>{const t=document.getElementById('title-input');t.value='YOUR CITY';t.dispatchEvent(new Event('input',{bubbles:true}));t.dispatchEvent(new Event('change',{bubbles:true}));})()`);await until('window.__shotReady');
  check('Caption input changes state',await evaluate(`neonTide.state.title==='YOUR CITY'`));
  check('Caption edit reaches export canvas',await evaluate(`neonTide.exportCanvas().toDataURL()!==${JSON.stringify(before)}`));
  await evaluate(`document.getElementById('undo').click()`);await until('window.__shotReady');check('Undo restores title',await evaluate(`neonTide.state.title==='NEON TIDE'`));
  await evaluate(`document.getElementById('redo').click()`);await until('window.__shotReady');check('Redo restores edit',await evaluate(`neonTide.state.title==='YOUR CITY'`));
  // Real local file chooser import, with four different files from this entry.
  const doc=await call('DOM.getDocument');const input=await call('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#photo-files'});
  const samples=['boulevard.jpg','fixer.jpg','siren.jpg','lookout.jpg'].map(name=>resolve(import.meta.dirname,'../app/samples',name));
  await call('DOM.setFileInputFiles',{nodeId:input.nodeId,files:samples});await until('neonTide.photos.length===9&&window.__shotReady');
  report=await evaluate(`(()=>{const p=neonTide.state.panels.filter(p=>p.source==='photo');return {count:neonTide.photos.length,library:document.querySelectorAll('.library-photo').length,distinct:new Set(p.map(p=>p.photo)).size,allLocal:p.every(p=>p.photo>=5),names:neonTide.photos.slice(5).map(p=>p.name)};})()`);
  check('Four files imported from local chooser',report.count===9);check('Imported photos appear in library',report.library===9);check('Imported cast auto-fills at least four unique photos',report.distinct===4);check('Every photo panel uses the imported cast',report.allLocal);
  await evaluate(`neonTide.selectPanel(2);document.getElementById('zoom-range').value='1.65';document.getElementById('zoom-range').dispatchEvent(new Event('input'));document.getElementById('zoom-range').dispatchEvent(new Event('change'));document.getElementById('crop-x').value='.35';document.getElementById('crop-x').dispatchEvent(new Event('input'));document.getElementById('crop-y').value='-.4';document.getElementById('crop-y').dispatchEvent(new Event('input'));`);await until('window.__shotReady');
  check('Selected panel state visible',await evaluate(`document.getElementById('selected-number').textContent==='03'`));check('Per-panel zoom and crop controls work',await evaluate(`(()=>{const p=neonTide.state.panels[2];return p.zoom===1.65&&p.x===.35&&p.y===-.4;})()`));
  const cropImage=await evaluate(`neonTide.exportCanvas().toDataURL()`);
  await evaluate(`document.getElementById('flip-photo').click()`);await until('window.__shotReady');check('Flip updates the export',await evaluate(`neonTide.state.panels[2].flip&&neonTide.exportCanvas().toDataURL()!==${JSON.stringify(cropImage)}`));
  await evaluate(`document.getElementById('role-input').value='THE HEADLINER';document.getElementById('role-input').dispatchEvent(new Event('input'));document.getElementById('role-input').dispatchEvent(new Event('change'));`);await until('window.__shotReady');check('Role editing changes selected panel',await evaluate(`neonTide.state.panels[2].role==='THE HEADLINER'`));
  await evaluate(`document.getElementById('reset-crop').click()`);await until('window.__shotReady');check('Reset restores crop and flip',await evaluate(`(()=>{const p=neonTide.state.panels[2];return p.x===0&&p.y===0&&p.zoom===1&&!p.flip;})()`));
  // Every preset is rendered at every exact aspect ratio to catch geometry errors.
  for(const layout of ['headliner','crossfire','triptych','coastline','split','sixpack','riptide','spotlight'])for(const format of ['square','portrait','landscape']){
    const result=await evaluate(`(()=>{neonTide.state.layout='${layout}';neonTide.state.format='${format}';neonTide.render();const c=document.getElementById('poster');return c.width>0&&c.getContext('2d').getImageData(30,30,1,1).data[3]===255;})()`);check(layout+' '+format+' renders',result);
  }
  for(const grade of ['sunset','neon','gold','tropic','rose','blue']){check('Color grade '+grade,await evaluate(`(()=>{document.querySelector('[data-grade="${grade}"]').click();neonTide.render();return neonTide.state.grade==='${grade}';})()`));}
  await navigate('?format=landscape');
  // Exercise pointer dragging and wheel zoom on the selected lead panel.
  const rect=await evaluate(`(()=>{const r=document.getElementById('poster').getBoundingClientRect();return {x:r.x+r.width*.5,y:r.y+r.height*.34};})()`);
  await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:rect.x,y:rect.y});await call('Input.dispatchMouseEvent',{type:'mouseWheel',x:rect.x,y:rect.y,deltaY:-300,deltaX:0});await pause(100);
  await call('Input.dispatchMouseEvent',{type:'mousePressed',x:rect.x,y:rect.y,button:'left',clickCount:1});await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:rect.x+18,y:rect.y+16,buttons:1});await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:rect.x+18,y:rect.y+16,button:'left',clickCount:1});await until('window.__shotReady');
  check('Wheel zoom changes lead panel',await evaluate(`neonTide.state.panels[1].zoom>1`));check('Dragging changes lead crop',await evaluate(`neonTide.state.panels[1].x!==0||neonTide.state.panels[1].y!==0`));
  check('No browser exceptions',exceptions.length===0,exceptions.join('\n'));check('No external requests',remote.length===0,remote.join('\n'));check('No failed local assets',badResponses.length===0,badResponses.join('\n'));
});
await writeFile(resolve(RESEARCH,'verification.json'),JSON.stringify({time:new Date().toISOString(),assertions,exceptions,remote,badResponses},null,2));
console.log(`${assertions.length} browser checks passed; 3 exact PNG exports; 0 exceptions; 0 remote requests.`);
