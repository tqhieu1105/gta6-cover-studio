import { FORMATS, GRADES, LAYOUTS, createPanelState, cropTravel, hitTestPanel, posterGeometry, renderPanelThumbnail, renderPoster } from './art.js';

// The editor keeps all state in memory so local photos never leave the browser.
const byId = id => document.getElementById(id);
const canvas = byId('poster');
const ui = {
  photoFiles: byId('photo-files'), photoLibrary: byId('photo-library'), photoCount: byId('photo-count'),
  fillPanels: byId('fill-panels'), title: byId('title-input'), tagline: byId('tagline-input'),
  edition: byId('edition-input'), year: byId('year-input'), layoutGrid: byId('layout-grid'),
  gradeList: byId('grade-list'), gradeStrength: byId('grade-strength'), gradeValue: byId('grade-value'),
  filmstrip: byId('filmstrip'), formatReadout: byId('canvas-resolution'), panelPhoto: byId('panel-photo'),
  selectedNumber: byId('selected-number'), selectedName: byId('selected-name'), role: byId('role-input'),
  zoom: byId('zoom-range'), zoomValue: byId('zoom-value'), cropX: byId('crop-x'), cropY: byId('crop-y'),
  center: byId('center-crop'), flip: byId('flip-photo'), reset: byId('reset-crop'),
  ink: byId('ink-toggle'), palms: byId('palms-toggle'), frame: byId('frame-toggle'),
  toast: byId('toast'), project: byId('project-title'), undo: byId('undo'), redo: byId('redo'),
};
const samplePhotos = [
  { id:'driver',name:'Boulevard driver',file:'boulevard.jpg',description:'THE DRIVER' },
  { id:'pier',name:'Pier-side night',file:'pier.jpg',description:'THE CAPTAIN' },
];
let photos = [];
let selectedPanel = 1;
let history = [];
let future = [];
let drag = null;
let toastTimer = 0;
let renderFrame = 0;
let filmstripTimer = 0;
const query = new URLSearchParams(location.search);

const baseState = {
  title:'NEON\nVOW', subtitle:'one last summer', tagline:'SOME NIGHTS NEVER LET GO.', edition:'MIDNIGHT EDITION', year:'2026',
  layout:'headliner', format:'portrait', grade:'sunset', strength:78, finish:'chrome', ink:true,
  palms:true, frame:true, panels:createPanelState('headliner'),
};
const state = baseState;

function cleanPanelSettings() {
  for(const [index,panel] of state.panels.entries()) {
    panel.photo = Math.max(0,Math.min(photos.length-1,Number(panel.photo)||0));
    panel.x = Math.max(-1,Math.min(1,Number(panel.x)||0));
    panel.y = Math.max(-1,Math.min(1,Number(panel.y)||0));
    panel.zoom = Math.max(1,Math.min(2.5,Number(panel.zoom)||1));
    panel.role = String(panel.role || `SCENE ${index+1}`).slice(0,20).toUpperCase();
  }
}
function snapshot() {
  return JSON.stringify({title:state.title,subtitle:state.subtitle,tagline:state.tagline,edition:state.edition,year:state.year,layout:state.layout,format:state.format,grade:state.grade,strength:state.strength,finish:state.finish,ink:state.ink,palms:state.palms,frame:state.frame,panels:state.panels});
}
function restore(value) {
  Object.assign(state,JSON.parse(value));
  cleanPanelSettings();
  syncControls();
  update();
}
function remember() {
  const value=snapshot();
  if(history.at(-1)!==value){history.push(value);if(history.length>35)history.shift();}
  future=[];
  ui.undo.disabled=history.length<2;
  ui.redo.disabled=true;
}
function undo() {
  if(history.length<2)return;
  future.push(history.pop());restore(history.at(-1));ui.undo.disabled=history.length<2;ui.redo.disabled=false;
}
function redo() {
  const value=future.pop();if(!value)return;
  history.push(value);restore(value);ui.redo.disabled=future.length===0;
}
function notice(text) {
  ui.toast.textContent=text;ui.toast.classList.add('is-visible');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove('is-visible'),1900);
}
function render() {
  cancelAnimationFrame(renderFrame);
  renderFrame=requestAnimationFrame(()=>{
    renderPoster(canvas,state,photos);
    fitPreview();
    clearTimeout(filmstripTimer);
    filmstripTimer=setTimeout(drawFilmstrip,95);
  });
}
function fitPreview() {
  if(document.body.classList.contains('poster-only'))return;
  const well=byId('canvas-well');
  const [width,height]=FORMATS[state.format];
  const factor=Math.min((well.clientWidth-2)/width,(well.clientHeight-36)/height);
  canvas.style.width=`${Math.max(1,width*factor)}px`;
  canvas.style.height=`${Math.max(1,height*factor)}px`;
  canvas.style.aspectRatio=`${width} / ${height}`;
}
function update() {
  render();
  ui.project.textContent=state.title.replace(/[\n|]/g,' ').trim()||'Untitled picture';
  const [w,h]=FORMATS[state.format];
  ui.formatReadout.textContent=`${w} × ${h}`;
  document.querySelectorAll('[data-format]').forEach(button=>button.classList.toggle('is-active',button.dataset.format===state.format));
  document.querySelectorAll('[data-export]').forEach(button=>button.classList.toggle('featured-export',button.dataset.export===state.format));
  document.querySelectorAll('[data-finish]').forEach(button=>button.classList.toggle('is-active',button.dataset.finish===state.finish));
  document.querySelectorAll('[data-layout]').forEach(button=>button.classList.toggle('is-active',button.dataset.layout===state.layout));
  document.querySelectorAll('[data-grade]').forEach(button=>button.classList.toggle('is-active',button.dataset.grade===state.grade));
  ui.gradeValue.textContent=`${state.strength}%`;
  ui.gradeStrength.value=state.strength;
  ui.ink.checked=state.ink;ui.palms.checked=state.palms;ui.frame.checked=state.frame;
  ui.year.value=state.year;ui.edition.value=state.edition;ui.tagline.value=state.tagline;ui.title.value=state.title;
  updateSelectedPanel();
}
function updateSelectedPanel() {
  const panel=state.panels[selectedPanel];if(!panel)return;
  const geometry=posterGeometry(state,canvas.width||FORMATS[state.format][0],canvas.height||FORMATS[state.format][1]);
  ui.selectedNumber.textContent=String(selectedPanel+1).padStart(2,'0');
  ui.selectedName.textContent=panel.role.replace(/\b\w/g,c=>c.toUpperCase());
  ui.role.value=panel.role;
  ui.panelPhoto.innerHTML='';
  const illustrated=['skyline','establishing','marina','coupe','motel'].includes(panel.source);
  if(illustrated){
    const option=document.createElement('option');option.value='scene';option.textContent='Illustrated scene';option.selected=true;ui.panelPhoto.append(option);
  }
  photos.forEach((photo,index)=>{
    const option=document.createElement('option');option.value=String(index);option.textContent=photo.name;option.selected=!illustrated&&panel.photo===index;ui.panelPhoto.append(option);
  });
  ui.zoom.value=Math.round(panel.zoom*100);ui.zoomValue.textContent=`${Math.round(panel.zoom*100)}%`;
  ui.cropX.value=Math.round(panel.x*100);ui.cropY.value=Math.round(panel.y*100);
  ui.filmstrip.querySelectorAll('.film-card').forEach((card,index)=>card.classList.toggle('is-active',index===selectedPanel));
}
function iconForLayout(item) {
  const wrap=document.createElement('span');wrap.className='layout-icon';
  item.panels.slice(0,4).forEach((panel,index)=>{
    const tile=document.createElement('i');
    const points=panel.points;
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    const minx=Math.min(...xs),miny=Math.min(...ys),w=Math.max(...xs)-minx,h=Math.max(...ys)-miny;
    tile.style.left=`${minx*100}%`;tile.style.top=`${miny*100}%`;tile.style.width=`${w*100}%`;tile.style.height=`${h*100}%`;
    tile.style.background=['#dc8b95','#f1c484','#ae85a5','#587d86'][index];
    wrap.append(tile);
  });return wrap;
}
function createLayoutChoices() {
  ui.layoutGrid.replaceChildren();
  LAYOUTS.forEach(item=>{
    const button=document.createElement('button');button.type='button';button.className='layout-choice';button.dataset.layout=item.id;button.append(iconForLayout(item));
    button.append(document.createTextNode(item.name));
    button.addEventListener('click',()=>changeLayout(item.id));ui.layoutGrid.append(button);
  });
}
function createGradeChoices() {
  ui.gradeList.replaceChildren();
  GRADES.forEach(item=>{
    const button=document.createElement('button');button.type='button';button.className='grade-choice';button.dataset.grade=item.id;
    const swatch=document.createElement('span');swatch.className='grade-swatch';
    swatch.style.background=`linear-gradient(115deg,${item.colors.join(',')})`;
    const name=document.createElement('strong');name.textContent=item.name;
    button.append(swatch,name);button.addEventListener('click',()=>{state.grade=item.id;remember();update();});ui.gradeList.append(button);
  });
}
function drawFilmstrip() {
  ui.filmstrip.replaceChildren();
  state.panels.forEach((panel,index)=>{
    const article=document.createElement('button');article.type='button';article.className='film-card';
    const img=document.createElement('img');
    const miniature=document.createElement('canvas');miniature.width=160;miniature.height=90;
    renderPanelThumbnail(miniature,panel,photos[panel.photo%photos.length],state.grade,state.strength,state.ink);
    img.src=miniature.toDataURL('image/jpeg',.78);
    article.append(img);
    const label=document.createElement('span');label.textContent=panel.role;article.append(label);
    const number=document.createElement('b');number.textContent=String(index+1).padStart(2,'0');article.append(number);
    if(['skyline','establishing','marina','coupe','motel'].includes(panel.source))article.classList.add('illustrated-card');
    article.addEventListener('click',()=>selectPanel(index));
    article.addEventListener('dragover',event=>event.preventDefault());
    article.addEventListener('drop',event=>{event.preventDefault();const number=Number(event.dataTransfer.getData('text/photo-index'));if(Number.isInteger(number))assignPhoto(index,number);});
    ui.filmstrip.append(article);
  });
}
function drawPhotoLibrary() {
  ui.photoLibrary.replaceChildren();
  photos.forEach((photo,index)=>{
    const tile=document.createElement('button');tile.type='button';tile.className='photo-chip';tile.draggable=true;
    if(state.panels[selectedPanel]?.photo===index)tile.classList.add('is-selected');
    tile.addEventListener('click',()=>assignPhoto(selectedPanel,index));
    tile.addEventListener('dragstart',event=>event.dataTransfer.setData('text/photo-index',String(index)));
    const img=document.createElement('img');img.src=photo.url;img.alt='';tile.append(img);
    const caption=document.createElement('span');caption.textContent=photo.name;tile.append(caption);ui.photoLibrary.append(tile);
  });
  ui.photoCount.textContent=`${photos.length} PHOTO${photos.length===1?'':'S'}`;
  updateSelectedPanel();
}
function selectPanel(index) {
  selectedPanel=Math.max(0,Math.min(state.panels.length-1,index));
  render();updateSelectedPanel();
}
function assignPhoto(panelIndex,photoIndex) {
  if(!photos[photoIndex]||!state.panels[panelIndex])return;
  state.panels[panelIndex].photo=photoIndex;
  state.panels[panelIndex].source='photo';
  state.panels[panelIndex].zoom=Math.max(1.02,state.panels[panelIndex].zoom);
  remember();
  drawPhotoLibrary();update();notice(`Photo assigned to ${state.panels[panelIndex].role.toLowerCase()}`);
}
function changeLayout(layoutId) {
  if(!LAYOUTS.some(item=>item.id===layoutId))return;
  state.layout=layoutId;state.panels=createPanelState(layoutId,photos.length);remember();
  selectedPanel=Math.min(selectedPanel,state.panels.length-1);update();
}
function syncControls() {
  createLayoutChoices();createGradeChoices();
}
function photoFromFile(file,index) {
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(Error('This image could not be read.'));
    reader.onload=()=>{
      const image=new Image();
      image.onload=()=>resolve({id:`local-${Date.now()}-${index}`,name:file.name.replace(/\.[^.]+$/,'').slice(0,22)||`Your photo ${index+1}`,image,url:reader.result,description:'YOUR PHOTO'});
      image.onerror=()=>reject(Error('Chrome could not open this image.'));
      image.src=reader.result;
    };reader.readAsDataURL(file);
  });
}
async function addFiles(list) {
  const incoming=[...list].filter(file=>file.type.startsWith('image/')).slice(0,12);
  if(!incoming.length)return;
  remember();
  try {
    const loaded=await Promise.all(incoming.map((file,index)=>photoFromFile(file,index)));
    const start=photos.length;photos.push(...loaded);cleanPanelSettings();
    state.panels.forEach((panel,index)=>{
      panel.photo=start+index%loaded.length;panel.source='photo';panel.zoom=1.02;panel.x=0;panel.y=-.1;
    });
    remember();
    drawPhotoLibrary();update();notice(`${loaded.length} photo${loaded.length===1?'':'s'} added · local only`);
  } catch(error) {notice(error.message||'Photo import did not finish.');}
}
function autoFill() {
  if(!photos.length)return;
  state.panels.forEach((panel,index)=>{panel.photo=index%photos.length;panel.source='photo';panel.zoom=1.02;panel.x=0;panel.y=0;});remember();
  update();notice('Every panel has a photo');
}
function editField(field,value) {
  if(state[field]===value)return;
  state[field]=value;remember();render();
  if(field==='title')ui.project.textContent=value.replace(/[\n|]/g,' ').trim()||'Untitled picture';
}
function exportPoster(format) {
  if(!FORMATS[format])return;
  const output=document.createElement('canvas');renderPoster(output,{...state,format},photos);
  output.toBlob(blob=>{
    if(!blob){notice('The PNG could not be created.');return;}
    const link=document.createElement('a');const url=URL.createObjectURL(blob);
    link.href=url;link.download=`neon-tide-${format}-poster.png`;document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
    notice(`PNG exported · ${FORMATS[format][0]} × ${FORMATS[format][1]}`);
  },'image/png');
}
function handleQuery() {
  const format=query.get('format');if(FORMATS[format])state.format=format;
  const requestedLayout=query.get('layout');if(LAYOUTS.some(layout=>layout.id===requestedLayout))state.layout=requestedLayout;
  state.panels=createPanelState(state.layout,2);
  const caption=query.get('caption');if(caption)state.title=caption.replace(/\|/g,'\n').slice(0,34);
  const tagline=query.get('tagline');if(tagline)state.tagline=tagline.slice(0,58);
  const grade=query.get('grade');if(GRADES.some(item=>item.id===grade))state.grade=grade;
  const finish=query.get('finish');if(['chrome','sunset','ice'].includes(finish))state.finish=finish;
  const subtitle=query.get('subtitle');if(subtitle)state.subtitle=subtitle.slice(0,30);
  if(query.get('shot')==='cover')document.body.classList.add('poster-only');
}
async function loadSamples() {
  photos=await Promise.all(samplePhotos.map((photo,index)=>new Promise((resolve,reject)=>{
    const image=new Image();image.onload=()=>resolve({...photo,image,url:image.src});image.onerror=reject;
    image.src=`./samples/${photo.file}`;
  })));
  drawPhotoLibrary();
}
function pointerPosition(event) {
  const bounds=canvas.getBoundingClientRect();return [(event.clientX-bounds.left)*canvas.width/bounds.width,(event.clientY-bounds.top)*canvas.height/bounds.height];
}
function startCrop(event) {
  if(document.body.classList.contains('poster-only'))return;
  const [x,y]=pointerPosition(event);const index=hitTestPanel(state,canvas.width,canvas.height,x,y);
  if(index<0)return;
  selectPanel(index);remember();drag={x:event.clientX,y:event.clientY,panel:index,scaleX:canvas.width/canvas.clientWidth,scaleY:canvas.height/canvas.clientHeight};
  canvas.setPointerCapture(event.pointerId);
}
function moveCrop(event) {
  if(!drag)return;
  const panel=state.panels[drag.panel];const geometry=posterGeometry(state,canvas.width,canvas.height).panels[drag.panel].bounds;
  const photo=photos[panel.photo%photos.length];
  const travel=cropTravel(photo.image,geometry,panel.zoom);
  const extraX=Math.max(1,travel.x),extraY=Math.max(1,travel.y);
  panel.x=Math.max(-1,Math.min(1,panel.x-(event.movementX*drag.scaleX)/extraX*2));
  panel.y=Math.max(-1,Math.min(1,panel.y-(event.movementY*drag.scaleY)/extraY*2));
  render();ui.cropX.value=Math.round(panel.x*100);ui.cropY.value=Math.round(panel.y*100);
}
function finishCrop() {if(drag)remember();drag=null;}
function wireControls() {
  ui.photoFiles.addEventListener('change',event=>{addFiles(event.target.files);event.target.value='';});
  const drop=byId('workspace');
  drop.addEventListener('dragover',event=>{if([...event.dataTransfer.types].includes('Files'))event.preventDefault();});
  drop.addEventListener('drop',event=>{if([...event.dataTransfer.files].some(file=>file.type.startsWith('image/'))){event.preventDefault();addFiles(event.dataTransfer.files);}});
  ui.fillPanels.addEventListener('click',autoFill);
  ui.title.addEventListener('input',()=>editField('title',ui.title.value));
  ui.tagline.addEventListener('input',()=>editField('tagline',ui.tagline.value));
  ui.edition.addEventListener('input',()=>editField('edition',ui.edition.value));
  ui.year.addEventListener('input',()=>editField('year',ui.year.value));
  document.querySelectorAll('[data-finish]').forEach(button=>button.addEventListener('click',()=>{state.finish=button.dataset.finish;remember();update();}));
  document.querySelectorAll('[data-format]').forEach(button=>button.addEventListener('click',()=>{state.format=button.dataset.format;remember();update();}));
  document.querySelectorAll('[data-export]').forEach(button=>button.addEventListener('click',()=>exportPoster(button.dataset.export)));
  ui.gradeStrength.addEventListener('input',()=>{state.strength=Number(ui.gradeStrength.value);ui.gradeValue.textContent=`${state.strength}%`;render();});
  ui.gradeStrength.addEventListener('change',remember);
  ui.panelPhoto.addEventListener('change',()=>{
    if(ui.panelPhoto.value==='scene'){
      const definition=LAYOUTS.find(item=>item.id===state.layout).panels[selectedPanel];
      state.panels[selectedPanel].source=definition.source;
      state.panels[selectedPanel].role=definition.role;
      remember();update();return;
    }
    assignPhoto(selectedPanel,Number(ui.panelPhoto.value));
  });
  ui.role.addEventListener('input',()=>{state.panels[selectedPanel].role=ui.role.value.toUpperCase().slice(0,20);ui.selectedName.textContent=state.panels[selectedPanel].role.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());drawFilmstrip();render();});
  ui.role.addEventListener('change',remember);
  ui.zoom.addEventListener('input',()=>{state.panels[selectedPanel].zoom=Number(ui.zoom.value)/100;ui.zoomValue.textContent=`${ui.zoom.value}%`;render();});ui.zoom.addEventListener('change',remember);
  ui.cropX.addEventListener('input',()=>{state.panels[selectedPanel].x=Number(ui.cropX.value)/100;render();});ui.cropX.addEventListener('change',remember);
  ui.cropY.addEventListener('input',()=>{state.panels[selectedPanel].y=Number(ui.cropY.value)/100;render();});ui.cropY.addEventListener('change',remember);
  ui.center.addEventListener('click',()=>{state.panels[selectedPanel].x=0;state.panels[selectedPanel].y=0;remember();update();});
  ui.reset.addEventListener('click',()=>{state.panels[selectedPanel].x=0;state.panels[selectedPanel].y=0;state.panels[selectedPanel].zoom=1.02;remember();update();});
  ui.flip.addEventListener('click',()=>{state.panels[selectedPanel].flip=!state.panels[selectedPanel].flip;remember();render();});
  for(const [element,key] of [[ui.ink,'ink'],[ui.palms,'palms'],[ui.frame,'frame']])element.addEventListener('change',()=>{state[key]=element.checked;remember();update();});
  ui.undo.addEventListener('click',undo);ui.redo.addEventListener('click',redo);
  byId('preview-toggle').addEventListener('click',()=>{document.body.classList.toggle('is-fullscreen');setTimeout(render,80);});
  canvas.addEventListener('pointerdown',startCrop);canvas.addEventListener('pointermove',moveCrop);canvas.addEventListener('pointerup',finishCrop);canvas.addEventListener('pointercancel',finishCrop);
  canvas.addEventListener('wheel',event=>{const [x,y]=pointerPosition(event);const index=hitTestPanel(state,canvas.width,canvas.height,x,y);if(index<0)return;event.preventDefault();selectPanel(index);const panel=state.panels[index];panel.zoom=Math.max(1,Math.min(2.5,panel.zoom+(event.deltaY<0?.04:-.04)));ui.zoom.value=Math.round(panel.zoom*100);ui.zoomValue.textContent=`${ui.zoom.value}%`;render();},{passive:false});
  window.addEventListener('keydown',event=>{
    const editing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
    if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='z') {event.preventDefault();event.shiftKey?redo():undo();}
    else if(!editing&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){const delta=event.shiftKey?.1:.025;const panel=state.panels[selectedPanel];if(event.key==='ArrowLeft')panel.x-=delta;if(event.key==='ArrowRight')panel.x+=delta;if(event.key==='ArrowUp')panel.y-=delta;if(event.key==='ArrowDown')panel.y+=delta;cleanPanelSettings();remember();update();}
    else if(!editing&&event.key==='Escape')document.body.classList.remove('poster-only','is-fullscreen');
  });
}

async function boot() {
  handleQuery();syncControls();wireControls();
  if(query.has('title'))state.title=query.get('title').replace(/\|/g,'\n').slice(0,34);
  if(query.has('tagline'))state.tagline=query.get('tagline').slice(0,58);
  await loadSamples();
  cleanPanelSettings();
  selectedPanel=Number(query.get('panel')||1);selectedPanel=Math.max(0,Math.min(state.panels.length-1,selectedPanel));
  syncControls();update();remember();remember();
  new ResizeObserver(fitPreview).observe(byId('canvas-well'));
  window.addEventListener('resize',fitPreview);
  window.neonTide={state,photos,render,exportCanvas(format){const out=document.createElement('canvas');renderPoster(out,{...state,format:format||state.format},photos);return out;}};
  window.__shotReady=true;
}
boot().catch(error=>{console.error('Neon Tide could not start',error);notice('Poster studio did not finish loading.');});
