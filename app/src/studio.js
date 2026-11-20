import {FORMATS,GRADES,LAYOUTS,createCanvas,createPanelState,cropTravel,hitTestPanel,posterGeometry,renderPanelThumbnail,renderPoster} from './art.js';

const find=id=>document.getElementById(id);
const poster=find('poster');
const query=new URLSearchParams(location.search);
const photos=[];
const state={title:'NEON TIDE',subtitle:'one last summer',tagline:'GOOD PEOPLE. BAD DECISIONS.',edition:'MIDNIGHT EDITION',year:'2026',layout:'headliner',format:'portrait',grade:'sunset',strength:72,finish:'chrome',ink:true,palms:true,frame:true,panels:createPanelState()};
let selectedPanel=1;
let history=[];
let future=[];
let pendingFrame=0;
let drag=null;
let toastTimer;
let updateTimer;
let selectedPhoto=0;
const objectUrls=new Set();
const samples=[
 {file:'boulevard.jpg',name:'The Driver',focus:{x:.52,y:.32}},
 {file:'pier.jpg',name:'The Captain',focus:{x:.5,y:.34}},
 {file:'fixer.jpg',name:'The Fixer',focus:{x:.5,y:.43}},
 {file:'siren.jpg',name:'The Siren',focus:{x:.51,y:.42}},
 {file:'lookout.jpg',name:'The Courier',focus:{x:.52,y:.42}},
];
function notify(message){find('toast').textContent=message;find('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>find('toast').classList.remove('visible'),2300);}
function captureState(){return JSON.stringify({state,selectedPanel});}
function checkpoint(){const snapshot=captureState();if(history.at(-1)!==snapshot){history.push(snapshot);history=history.slice(-55);future=[];}syncHistory();}
function syncHistory(){find('undo').disabled=history.length<2;find('redo').disabled=!future.length;}
function restore(snapshot){const saved=JSON.parse(snapshot);Object.assign(state,saved.state);selectedPanel=saved.selectedPanel;syncAll();scheduleRender();}
function undo(){if(history.length<2)return;future.push(history.pop());restore(history.at(-1));syncHistory();notify('Previous edit restored');}
function redo(){if(!future.length)return;const next=future.pop();history.push(next);restore(next);syncHistory();}
function bound(value,min,max){return Math.max(min,Math.min(max,Number(value)||0));}
function loadImage(url){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('This image could not be decoded. Try JPG, PNG or WebP.'));image.src=url;});}
function activeCrop(){return state.panels[selectedPanel];}
function setPanel(index,flash=true){selectedPanel=bound(index,0,state.panels.length-1);syncInspector();drawSelection();document.querySelectorAll('.scene-button').forEach((b,i)=>b.classList.toggle('active',i===selectedPanel));if(flash){find('poster-wrap').classList.add('show-selection');clearTimeout(updateTimer);updateTimer=setTimeout(()=>find('poster-wrap').classList.remove('show-selection'),1200);}}
function drawSelection(){const geometry=posterGeometry(state,poster.width,poster.height);find('selection-overlay').setAttribute('viewBox',`0 0 ${poster.width} ${poster.height}`);find('selection-polygon').setAttribute('points',geometry.panels[selectedPanel].vertices.map(p=>p.join(',')).join(' '));}
function fitPreview(){
 const stage=find('preview-stage');const rect=stage.getBoundingClientRect();const scale=Math.min(rect.width/poster.width,rect.height/poster.height);
 const w=Math.floor(poster.width*scale),h=Math.floor(poster.height*scale);poster.style.width=w+'px';poster.style.height=h+'px';find('poster-wrap').style.width=w+'px';find('poster-wrap').style.height=h+'px';
}
function drawScenes(){
 const buttons=[...find('filmstrip').children];
 for(let i=0;i<state.panels.length;i++){
  let button=buttons[i];
  if(!button){button=document.createElement('button');button.className='scene-button';button.innerHTML='<canvas></canvas><span></span>';button.addEventListener('click',()=>setPanel(i));find('filmstrip').append(button);}
  button.classList.toggle('active',i===selectedPanel);button.setAttribute('aria-label',`Select panel ${i+1}: ${state.panels[i].role}`);button.setAttribute('aria-pressed',String(i===selectedPanel));
  button.querySelector('span').textContent=`0${i+1} / ${state.panels[i].role.replace('THE ','')}`;
  renderPanelThumbnail(button.querySelector('canvas'),state,photos,i);
 }
}
function renderNow(){renderPoster(poster,state,photos);fitPreview();drawSelection();drawScenes();window.__shotReady=true;}
function scheduleRender(){window.__shotReady=false;cancelAnimationFrame(pendingFrame);pendingFrame=requestAnimationFrame(renderNow);}
function syncInspector(){
 const crop=activeCrop();
 selectedPhoto=crop.photo;document.querySelectorAll('.library-photo').forEach((button,index)=>button.classList.toggle('active',crop.source==='photo'&&index===crop.photo));
 find('selected-number').textContent=String(selectedPanel+1).padStart(2,'0');find('selected-name').textContent=crop.role.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
 find('role-input').value=crop.role;find('panel-photo').value=String(crop.photo);find('panel-photo').disabled=crop.source!=='photo';
 for(const [id,key] of [['zoom-range','zoom'],['crop-x','x'],['crop-y','y']])find(id).value=crop[key];
 find('zoom-value').textContent=Math.round(crop.zoom*100)+'%';find('crop-x-value').textContent=Math.round(crop.x*100);find('crop-y-value').textContent=Math.round(crop.y*100);
 find('flip-photo').classList.toggle('active',crop.flip);
}
function syncFormats(){
 document.querySelectorAll('[data-format]').forEach(button=>{const active=button.dataset.format===state.format;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
 const [w,h]=FORMATS[state.format];find('canvas-resolution').textContent=`${w} × ${h}`;find('export-hint').textContent=`${state.format==='landscape'?'Wide':state.format[0].toUpperCase()+state.format.slice(1)} · ${w} × ${h} · No watermark`;
}
function syncAll(){
 for(const [id,key] of [['title-input','title'],['subtitle-input','subtitle'],['tagline-input','tagline'],['edition-input','edition'],['year-input','year']])find(id).value=state[key];
 find('grade-strength').value=state.strength;find('grade-value').textContent=state.strength+'%';find('grade-name').textContent=GRADES.find(g=>g.id===state.grade).name;
 for(const key of ['ink','palms','frame'])find(key+'-toggle').checked=state[key];
 document.querySelectorAll('[data-layout]').forEach(b=>b.classList.toggle('active',b.dataset.layout===state.layout));document.querySelectorAll('[data-grade]').forEach(b=>b.classList.toggle('active',b.dataset.grade===state.grade));
 find('project-name').textContent=(state.title.replace(/\n/g,' ')||'Untitled')+' / '+state.edition.toLowerCase();syncFormats();syncInspector();syncHistory();
}
function drawLibrary(){
 const library=find('photo-library');library.replaceChildren();
 photos.forEach((photo,index)=>{
  const button=document.createElement('button');button.className='library-photo';button.classList.toggle('active',index===selectedPhoto);button.title=`Use ${photo.name} in the selected panel`;
  const image=document.createElement('img');image.src=photo.url;image.alt=photo.name;const label=document.createElement('span');label.textContent=photo.name;button.append(image,label);
  button.addEventListener('click',()=>{selectedPhoto=index;const crop=activeCrop();crop.photo=index;crop.source='photo';crop.zoom=1;crop.x=0;crop.y=0;drawLibrary();syncInspector();scheduleRender();checkpoint();notify(`${photo.name} → panel ${selectedPanel+1}`);});library.append(button);
 });
 find('photo-count').textContent=`${photos.length} photos`;
 const select=find('panel-photo');select.replaceChildren();photos.forEach((photo,i)=>{const option=document.createElement('option');option.value=i;option.textContent=photo.name;select.append(option);});
 find('scene-count').textContent=`${state.panels.length} panels · ${new Set(state.panels.filter(p=>p.source==='photo').map(p=>p.photo)).size} cast photos`;syncInspector();
}
function autoFill(first=0,count=photos.length){
 let next=0;for(const panel of state.panels){if(panel.source==='photo'){panel.photo=first+(next++%Math.max(1,count));panel.zoom=1;panel.x=0;panel.y=0;}}
 drawLibrary();syncAll();scheduleRender();checkpoint();notify('Cast assigned. Select a panel to reframe.');
}
async function importPhotos(files){
 const accepted=[...files].filter(file=>file.type.startsWith('image/'));
 if(!accepted.length){notify('Choose a JPG, PNG, WebP or another browser-supported image.');return 0;}
 const offset=photos.length;let failed=0;
 for(const file of accepted.slice(0,20)){
  let url;
  try{url=URL.createObjectURL(file);const image=await loadImage(url);objectUrls.add(url);photos.push({image,url,name:file.name.replace(/\.[^.]+$/,'').slice(0,28),focus:{x:.5,y:.43},local:true});}
  catch(error){if(url)URL.revokeObjectURL(url);failed++;}
 }
 const added=photos.length-offset;
 if(added){autoFill(offset,added);notify(`${added} local photo${added===1?'':'s'} added${failed?`; ${failed} unreadable`:''}. Nothing uploaded.`);}
 else notify('Those images could not be opened. Try JPG, PNG or WebP.');
 find('photo-files').value='';return added;
}
function edit(key,value){state[key]=value;syncAll();scheduleRender();}
function exportCanvas(format=state.format){const result=createCanvas(...FORMATS[format]);renderPoster(result,{...state,format},photos);return result;}
async function exportPng(format=state.format){
 const output=exportCanvas(format);const blob=await new Promise(resolve=>output.toBlob(resolve,'image/png'));
 if(!blob){notify('PNG export could not be created. Try a smaller photo.');return;}
 const url=URL.createObjectURL(blob);const link=document.createElement('a');const [w,h]=FORMATS[format];link.href=url;link.download=`${state.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'neon-tide'}-${w}x${h}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify(`PNG exported · ${w} × ${h}`);
}
function populateDesigns(){
 const grid=find('layout-grid');
 for(const layout of LAYOUTS){
  const button=document.createElement('button');button.className='layout-button';button.dataset.layout=layout.id;button.title=layout.hint;
  const geometry=posterGeometry({...state,layout:layout.id},100,65);
  button.innerHTML=`<svg viewBox="0 0 100 65" aria-hidden="true">${geometry.panels.map((p,i)=>`<polygon points="${p.vertices.map(v=>v.join(',')).join(' ')}" fill="${i===1?'#e49cb6':'#695268'}" stroke="#24202d" stroke-width="2"/>`).join('')}</svg><span>${layout.name}</span>`;
  button.addEventListener('click',()=>{state.layout=layout.id;syncAll();scheduleRender();checkpoint();});grid.append(button);
 }
 for(const grade of GRADES){const button=document.createElement('button');button.className='grade-button';button.dataset.grade=grade.id;button.style.background=`linear-gradient(140deg,${grade.top},${grade.mid},${grade.bottom})`;button.title=grade.name;button.setAttribute('aria-label',grade.name);button.addEventListener('click',()=>{edit('grade',grade.id);checkpoint();});find('grade-list').append(button);}
}
function wireControls(){
 find('undo').addEventListener('click',undo);find('redo').addEventListener('click',redo);
 find('photo-files').addEventListener('change',event=>importPhotos(event.target.files));
 find('fill-panels').addEventListener('click',()=>autoFill());
 const drop=find('drop-zone');
 for(const name of ['dragenter','dragover'])drop.addEventListener(name,event=>{event.preventDefault();drop.classList.add('dragging');});
 for(const name of ['dragleave','drop'])drop.addEventListener(name,event=>{event.preventDefault();drop.classList.remove('dragging');if(name==='drop')importPhotos(event.dataTransfer.files);});
 for(const [id,key] of [['title-input','title'],['subtitle-input','subtitle'],['tagline-input','tagline'],['edition-input','edition'],['year-input','year']]){
  find(id).addEventListener('input',event=>{state[key]=event.target.value;find('project-name').textContent=state.title.replace(/\n/g,' ')+' / '+state.edition.toLowerCase();scheduleRender();});find(id).addEventListener('change',checkpoint);
 }
 find('role-input').addEventListener('input',event=>{activeCrop().role=event.target.value.toUpperCase();scheduleRender();});find('role-input').addEventListener('change',()=>{syncInspector();checkpoint();});
 find('panel-photo').addEventListener('change',event=>{Object.assign(activeCrop(),{photo:Number(event.target.value),source:'photo',zoom:1,x:0,y:0});syncInspector();drawLibrary();scheduleRender();checkpoint();});
 for(const [id,key,min,max] of [['zoom-range','zoom',1,3],['crop-x','x',-1,1],['crop-y','y',-1,1]]){
  find(id).addEventListener('input',event=>{activeCrop()[key]=bound(event.target.value,min,max);syncInspector();scheduleRender();});find(id).addEventListener('change',checkpoint);
 }
 find('center-crop').addEventListener('click',()=>{Object.assign(activeCrop(),{x:0,y:0});syncInspector();scheduleRender();checkpoint();});
 find('reset-crop').addEventListener('click',()=>{Object.assign(activeCrop(),{x:0,y:0,zoom:1,flip:false});syncInspector();scheduleRender();checkpoint();});
 find('flip-photo').addEventListener('click',()=>{activeCrop().flip=!activeCrop().flip;syncInspector();scheduleRender();checkpoint();});
 find('grade-strength').addEventListener('input',event=>{state.strength=Number(event.target.value);find('grade-value').textContent=state.strength+'%';scheduleRender();});find('grade-strength').addEventListener('change',checkpoint);
 for(const key of ['ink','palms','frame'])find(key+'-toggle').addEventListener('change',event=>{state[key]=event.target.checked;scheduleRender();checkpoint();});
 document.querySelectorAll('[data-format]').forEach(button=>button.addEventListener('click',()=>{edit('format',button.dataset.format);checkpoint();}));
 find('export-current').addEventListener('click',()=>exportPng());document.querySelectorAll('[data-export]').forEach(button=>button.addEventListener('click',()=>exportPng(button.dataset.export)));
 poster.addEventListener('pointerdown',event=>{
  const rect=poster.getBoundingClientRect();const x=(event.clientX-rect.left)*poster.width/rect.width,y=(event.clientY-rect.top)*poster.height/rect.height;
  const index=hitTestPanel(state,x,y,poster.width,poster.height);if(index<0)return;
  setPanel(index);poster.setPointerCapture(event.pointerId);drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,cropX:activeCrop().x,cropY:activeCrop().y,scale:poster.width/rect.width};
 });
 poster.addEventListener('pointermove',event=>{
  if(!drag)return;const crop=activeCrop();const photo=photos[crop.photo];if(!photo||crop.source!=='photo')return;
  const box=posterGeometry(state,poster.width,poster.height).panels[selectedPanel];const travel=cropTravel(photo.image,box,crop.zoom);
  crop.x=bound(drag.cropX+(event.clientX-drag.startX)*drag.scale/Math.max(travel.x,1),-1,1);
  crop.y=bound(drag.cropY+(event.clientY-drag.startY)*drag.scale/Math.max(travel.y,1),-1,1);syncInspector();scheduleRender();
 });
 function finishDrag(){if(drag){drag=null;checkpoint();}}
 poster.addEventListener('pointerup',finishDrag);poster.addEventListener('pointercancel',finishDrag);
 poster.addEventListener('wheel',event=>{event.preventDefault();activeCrop().zoom=bound(activeCrop().zoom-event.deltaY*.0012,1,3);syncInspector();scheduleRender();clearTimeout(updateTimer);updateTimer=setTimeout(checkpoint,200);},{passive:false});
 document.addEventListener('keydown',event=>{if(!(event.ctrlKey||event.metaKey)||event.key.toLowerCase()!=='z')return;if(/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;event.preventDefault();event.shiftKey?redo():undo();});
 window.addEventListener('resize',fitPreview);window.addEventListener('beforeunload',()=>objectUrls.forEach(url=>URL.revokeObjectURL(url)));
 find('close-help').addEventListener('click',()=>find('help-dialog').close());
}
async function initialize(){
 for(const sample of samples){const url='./samples/'+sample.file;const image=await loadImage(url);photos.push({...sample,url,image});}
 if(FORMATS[query.get('format')])state.format=query.get('format');
 if(LAYOUTS.some(l=>l.id===query.get('layout')))state.layout=query.get('layout');
 if(GRADES.some(g=>g.id===query.get('grade')))state.grade=query.get('grade');
 for(const key of ['subtitle','tagline','edition','year','finish'])if(query.has(key))state[key]=query.get(key).slice(0,56);
 if(query.has('caption'))state.title=query.get('caption').replace(/\|/g,'\n').slice(0,28);
 if(query.get('shot')==='cover')document.body.classList.add('cover-mode');
 populateDesigns();wireControls();drawLibrary();syncAll();checkpoint();renderNow();
 // Expose the same state and compositor to the browser verifier and capture tool.
 window.neonTide={state,photos,get selectedPanel(){return selectedPanel;},selectPanel:setPanel,render:renderNow,exportCanvas,exportPng,importPhotos,autoFill,undo,redo,checkpoint,snapshot:()=>JSON.parse(captureState()),ready:true};
 window.__shotReady=true;
}
initialize().catch(error=>{console.error(error);notify(error.message);});
