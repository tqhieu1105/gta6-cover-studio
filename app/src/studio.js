import {
  FORMATS, GRADES, LAYOUTS, canvasOf, clamp, cropTravel, createPanelState,
  drawPanelPreview, fitPhotoToAnchor, hitTestPanel, renderPoster,
} from './art.js';

const $ = id => document.getElementById(id);
const formats = Object.entries(FORMATS);
const names = { landscape: 'Wide', portrait: 'Portrait', square: 'Square' };
const samples = [
  ['Velvet', 'velvet', [.33,.11,.40,.53]],
  ['Night Shift', 'night-shift', [.32,.18,.45,.65]],
  ['Insider', 'insider', [.32,.17,.34,.51]],
  ['Boulevard', 'boulevard', [.37,.12,.23,.22]],
  ['Switchboard', 'switchboard', [.30,.16,.40,.57]],
  ['Pier', 'pier', [.35,.05,.27,.29]],
];
const query = new URLSearchParams(location.search);
const poster = $('poster');
let photos = [], selected = 0, geometry;
let undo = [], redo = [], pending, repaint, messageTimer;
let importQueue = Promise.resolve();
const localURLs = new Set();
const state = {
  title: 'NEON TIDE', subtitle: 'The coast is ours', tagline: 'THE CITY NEVER FORGETS',
  edition: 'SUNSET EDITION', layout: 'premiere', format: 'landscape', grade: 'ember',
  finish: 'chrome', strength: .79, inkAmount: .25, heroCutout: true,
  panels: createPanelState('premiere', 6), reserve: [],
};
for (const field of ['title','subtitle','tagline','edition']) {
  if(query.has(field)) state[field]=query.get(field).slice(0,$(field).maxLength);
}
for (const [field, options] of Object.entries({
  format:Object.keys(FORMATS),layout:LAYOUTS.map(x=>x.id),grade:GRADES.map(x=>x.id),
})) if(options.includes(query.get(field))) state[field]=query.get(field);
state.panels=createPanelState(state.layout,6);
const lead=Number(query.get('lead'));
if(Number.isInteger(lead)&&lead>0&&lead<state.panels.length) {
  const first=state.panels[0],other=state.panels[lead];
  [first.photo,other.photo]=[other.photo,first.photo];
  [first.role,other.role]=[other.role,first.role];
}

function element(tag, text, attributes={}) {
  const node=document.createElement(tag);
  if(text!==null) node.textContent=text;
  for(const [name,value] of Object.entries(attributes)) node.setAttribute(name,value);
  return node;
}
function action(text, handler, attributes={}) {
  const node=element('button',text,{type:'button',...attributes});
  node.addEventListener('click',handler);
  return node;
}
const current=()=>state.panels[selected];
const snapshot=()=>JSON.stringify({state,selected});

function record(before) {
  if(!before||before===snapshot()) return;
  undo.push(before);
  if(undo.length>80) undo.shift();
  redo=[];
}
function commitField() {
  record(pending);
  pending=undefined;
}
function transaction(edit) {
  commitField();
  const before=snapshot();
  edit();record(before);refresh();
}
function restore(forward) {
  commitField();
  const from=forward?redo:undo,to=forward?undo:redo;
  if(!from.length) return;
  to.push(snapshot());
  const restored=JSON.parse(from.pop());
  Object.assign(state,restored.state);
  selected=restored.selected;
  refresh();
}
function choosePanel(index) {
  commitField();
  selected=clamp(index,0,state.panels.length-1);
  refresh();
}
function manual() {
  const crop=current();
  if(crop.autoFrame) {
    Object.assign(crop,fitPhotoToAnchor(photos[crop.photo],geometry.panels[selected],crop));
    crop.autoFrame=false;
  }
  return crop;
}
function assign(photo) {
  Object.assign(current(),{photo,zoom:1,x:0,y:0,autoFrame:true});
}
function fill(start=0,count=photos.length) {
  transaction(()=>state.panels.forEach((crop,i)=>{
    Object.assign(crop,{photo:start+i%count,zoom:1,x:0,y:0,autoFrame:true});
  }));
}
function notify(text) {
  clearTimeout(messageTimer);
  $('toast').textContent=text;
  $('toast').classList.add('show');
  messageTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);
}
async function loadImage(url) {
  const image=new Image();
  image.decoding='async';image.src=url;
  await image.decode();
  if(image.naturalWidth<1||image.naturalHeight<1) throw Error('The photo is empty.');
  return image;
}
function drawLibrary() {
  const list=photos.map((photo,i)=>{
    const button=action(null,()=>transaction(()=>assign(i)),{
      'data-photo':i,'aria-label':`Assign ${photo.name} to this panel`,title:photo.name,
    });
    const image=photo.image.cloneNode();image.alt='';
    button.append(image,element('span',photo.name));
    return button;
  });
  $('library').replaceChildren(...list);
  $('assigned-photo').replaceChildren(...photos.map((p,i)=>new Option(p.name,String(i))));
  $('photo-count').textContent=`${photos.length} photos`;
}
function importPhotos(fileList) {
  const images=Array.from(fileList).filter(f=>f.type.startsWith('image/')).slice(0,36);
  if(!images.length) {notify('Choose a photo your browser can open.');return;}
  importQueue=importQueue.then(async()=>{
    const first=photos.length;
    for(const file of images) {
      const url=URL.createObjectURL(file);
      try {
        const image=await loadImage(url);
        photos.push({name:file.name.replace(/\.[^.]+$/,'').slice(0,60)||'Your photo',image,imported:true});
        localURLs.add(url);
      } catch {URL.revokeObjectURL(url);}
    }
    const count=photos.length-first;
    if(!count) {notify('No readable photos found. Try JPG, PNG or WebP.');return;}
    drawLibrary();fill(first,count);
    notify(`Added ${count} photo${count===1?'':'s'} on this device`);
  }).catch(error=>{console.error(error);notify('Could not import those files.');});
}
function exportCanvas(format) {
  if(!FORMATS[format]) throw Error('Unknown export format.');
  const canvas=canvasOf(...FORMATS[format]);
  renderPoster(canvas,state,photos,format);
  return canvas;
}
async function download(format) {
  commitField();
  const canvas=exportCanvas(format);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob) {notify('PNG encoding failed. Try again.');return;}
  const url=URL.createObjectURL(blob);
  const slug=state.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'neon-tide';
  const link=element('a',null,{href:url,download:`${slug}-${format}.png`});
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),15000);
  notify(`${names[format]} PNG · ${FORMATS[format].join(' × ')} pixels`);
}
function showExports() {
  commitField();
  $('export-cards').replaceChildren(...formats.map(([format,size])=>{
    const card=element('article',null,{class:'export-card'});
    const art=element('div',null,{class:'export-art'});
    const canvas=exportCanvas(format);
    canvas.setAttribute('aria-label',`${names[format]} ${size.join(' by ')} pixel export`);
    art.append(canvas);
    card.append(art,element('h3',names[format]),element('p',size.join(' × ')),
      action('Download PNG ↗',()=>download(format),{'data-tray-export':format}));
    return card;
  }));
  $('export-tray').showModal();
}
function resize() {
  const area=$('preview-area');
  const scale=Math.min((area.clientWidth-24)/poster.width,(area.clientHeight-24)/poster.height);
  if(scale>0) {
    $('preview-frame').style.width=Math.floor(poster.width*scale)+'px';
    $('preview-frame').style.height=Math.floor(poster.height*scale)+'px';
  }
}
function overlay() {
  const frame=geometry.panels[selected];
  $('selection').setAttribute('viewBox',`0 0 ${poster.width} ${poster.height}`);
  for(const id of ['selection-border','clip-border']) $(id).setAttribute('points',frame.vertices.map(p=>p.join(',')).join(' '));
  const strokes=[];
  for(const fraction of [1/3,2/3]) {
    strokes.push(`M${frame.x+frame.w*fraction} ${frame.y}v${frame.h}`);
    strokes.push(`M${frame.x} ${frame.y+frame.h*fraction}h${frame.w}`);
  }
  $('crop-grid').setAttribute('d',strokes.join(''));
  $('crop-handles').replaceChildren(...frame.vertices.map(([x,y])=>{
    const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
    for(const [k,v] of Object.entries({cx:x,cy:y,r:6.5*geometry.unit})) dot.setAttribute(k,v);
    return dot;
  }));
  $('crop-hud').textContent=`PANEL ${selected+1} / ${state.panels.length} · ${current().zoom.toFixed(2)}× · DRAG TO POSITION`;
}
function controls() {
  const crop=current();
  const values={...state,role:crop.role,zoom:crop.zoom,'pan-x':crop.x,'pan-y':crop.y,
    'assigned-photo':crop.photo,'ink-amount':state.inkAmount};
  for(const [id,value] of Object.entries(values)) {
    const input=$(id);
    if(input&&input.value!==String(value)) input.value=String(value);
  }
  $('preview-dimensions').textContent=FORMATS[state.format].join(' × ');
  $('panel-number').textContent=`${selected+1} / ${state.panels.length}`;
  $('cast-status').textContent=`${new Set(state.panels.map(c=>c.photo)).size} photos · ${state.panels.length} panels`;
  const outputs={'zoom-value':crop.zoom.toFixed(2)+'×','x-value':Math.round(crop.x*100)+'%',
    'y-value':Math.round(crop.y*100)+'%','strength-value':Math.round(state.strength*100)+'%',
    'ink-value':Math.round(state.inkAmount*100)+'%','grade-label':GRADES.find(g=>g.id===state.grade).name};
  for(const [id,value] of Object.entries(outputs)) $(id).textContent=value;
  $('hero-cutout').checked=state.heroCutout;
  $('hero-cutout').disabled=!photos[state.panels[0].photo]?.silhouette;
  $('flip').setAttribute('aria-pressed',String(crop.flip));
  $('undo').disabled=!undo.length&&!pending;$('redo').disabled=!redo.length;
  for(const kind of ['format','grade','photo']) {
    const value=kind==='photo'?crop.photo:state[kind];
    document.querySelectorAll(`[data-${kind}]`).forEach(button=>{
      button.setAttribute('aria-pressed',String(button.dataset[kind]===String(value)));
    });
  }
}
function panelStrip() {
  $('panel-picker').replaceChildren(...state.panels.map((crop,i)=>{
    const item=action(null,()=>choosePanel(i),{'aria-pressed':String(i===selected),
      'aria-label':`Panel ${i+1}: ${crop.role||'Untitled'}`});
    const tile=canvasOf(148,86);
    drawPanelPreview(tile,photos[crop.photo],crop,state);
    item.append(tile,element('span',crop.role||`PANEL ${i+1}`));
    return item;
  }));
  drawPanelPreview($('panel-tile'),photos[current().photo],current(),state);
}
function refresh() {
  controls();cancelAnimationFrame(repaint);
  repaint=requestAnimationFrame(()=>{
    geometry=renderPoster(poster,state,photos);
    resize();overlay();panelStrip();
    document.documentElement.dataset.ready='true';
  });
}
function bindInputs() {
  const crops={zoom:'zoom','pan-x':'x','pan-y':'y'};
  const fields=['title','subtitle','tagline','edition','role','strength','ink-amount',...Object.keys(crops)];
  for(const id of fields) {
    $(id).addEventListener('input',event=>{
      pending??=snapshot();
      const value=event.currentTarget.value;
      if(crops[id]) manual()[crops[id]]=Number(value);
      else if(id==='role') current().role=value;
      else if(id==='ink-amount') state.inkAmount=Number(value);
      else state[id]=id==='strength'?Number(value):value;
      refresh();
    });
    for(const event of ['change','blur']) $(id).addEventListener(event,()=>{commitField();controls();});
  }
  $('layout').addEventListener('change',event=>transaction(()=>{
    state.reserve=state.panels.concat(state.reserve.slice(state.panels.length));
    state.layout=event.target.value;
    state.panels=createPanelState(state.layout,photos.length,state.reserve);
    selected=Math.min(selected,state.panels.length-1);
  }));
  $('finish').addEventListener('change',event=>transaction(()=>{state.finish=event.target.value;}));
  $('assigned-photo').addEventListener('change',event=>transaction(()=>assign(Number(event.target.value))));
  $('hero-cutout').addEventListener('change',event=>transaction(()=>{state.heroCutout=event.target.checked;}));
  $('flip').addEventListener('click',()=>transaction(()=>{current().flip=!current().flip;}));
  $('face-fit').addEventListener('click',()=>transaction(()=>{current().autoFrame=true;}));
  $('reset-crop').addEventListener('click',()=>transaction(()=>Object.assign(current(),{
    zoom:1,x:0,y:0,flip:false,autoFrame:false,
  })));
  $('auto-fill').addEventListener('click',()=>fill());
  $('undo').addEventListener('click',()=>restore(false));
  $('redo').addEventListener('click',()=>restore(true));
  $('open-exports').addEventListener('click',showExports);
  $('close-exports').addEventListener('click',()=>$('export-tray').close());
  $('download-all').addEventListener('click',async()=>{for(const [format] of formats) await download(format);});
  $('photo-input').addEventListener('change',event=>{importPhotos(event.target.files);event.target.value='';});
  for(const type of ['dragenter','dragover','dragleave','drop']) $('drop-zone').addEventListener(type,event=>{
    event.preventDefault();$('drop-zone').classList.toggle('over',type==='dragenter'||type==='dragover');
    if(type==='drop') importPhotos(event.dataTransfer.files);
  });
  document.addEventListener('keydown',event=>{
    if(/^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) return;
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z') {
      event.preventDefault();restore(event.shiftKey);return;
    }
    const arrows={ArrowLeft:[-.025,0],ArrowRight:[.025,0],ArrowUp:[0,-.025],ArrowDown:[0,.025]};
    if(arrows[event.key]&&document.activeElement===poster) {
      event.preventDefault();transaction(()=>{
        const crop=manual(),[dx,dy]=arrows[event.key];
        crop.x=clamp(crop.x+dx,-1,1);crop.y=clamp(crop.y+dy,-1,1);
      });
    }
  });
}
function bindGestures() {
  let drag;
  const position=event=>{
    const box=poster.getBoundingClientRect();
    return [(event.clientX-box.x)*poster.width/box.width,(event.clientY-box.y)*poster.height/box.height];
  };
  poster.addEventListener('pointerdown',event=>{
    if(event.button!==0) return;
    const [x,y]=position(event),index=hitTestPanel(geometry,x,y);
    if(index<0) return;
    choosePanel(index);
    const before=snapshot();
    drag={x,y,before,crop:{...manual()},id:event.pointerId};
    poster.setPointerCapture(event.pointerId);poster.classList.add('dragging');
    event.preventDefault();
  });
  poster.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId) return;
    const [x,y]=position(event),crop=current();
    const travel=cropTravel(photos[crop.photo].image,geometry.panels[selected],crop.zoom);
    crop.x=travel.x>.1?clamp(drag.crop.x+(x-drag.x)/travel.x,-1,1):0;
    crop.y=travel.y>.1?clamp(drag.crop.y+(y-drag.y)/travel.y,-1,1):0;
    refresh();
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture']) poster.addEventListener(type,()=>{
    if(!drag) return;
    record(drag.before);drag=null;poster.classList.remove('dragging');controls();
  });
  poster.addEventListener('wheel',event=>{
    event.preventDefault();
    transaction(()=>{const crop=manual();crop.zoom=clamp(crop.zoom*Math.exp(-event.deltaY*.0016),1,3);});
  },{passive:false});
}
async function start() {
  await document.fonts.load('60px Yellowtail');
  photos=await Promise.all(samples.map(async([name,file,face])=>({
    name,face,image:await loadImage(new URL(`../samples/${file}.jpg`,import.meta.url)),
    silhouette:file==='velvet',
    matteImage:file==='velvet'?await loadImage(new URL('../samples/velvet-matte.png',import.meta.url)):null,
  })));
  drawLibrary();
  for(const [format,size] of formats) {
    $('format-picker').append(action(names[format],()=>transaction(()=>{state.format=format;}),{'data-format':format}));
    const button=action(null,()=>download(format),{'data-export':format});
    button.append(element('strong',names[format]),element('small',size.join('×')));
    $('export-sizes').append(button);
  }
  for(const layout of LAYOUTS) $('layout').add(new Option(layout.name,layout.id));
  for(const grade of GRADES) {
    const swatch=action(null,()=>transaction(()=>{state.grade=grade.id;}),{
      'data-grade':grade.id,title:grade.name,'aria-label':grade.name,
    });
    swatch.style.setProperty('--swatch',`linear-gradient(135deg,${grade.sky.join(',')})`);
    $('grades').append(swatch);
  }
  geometry=renderPoster(poster,state,photos);
  bindInputs();bindGestures();refresh();
  new ResizeObserver(resize).observe($('preview-area'));
  window.addEventListener('pagehide',event=>{
    if(!event.persisted) for(const url of localURLs) URL.revokeObjectURL(url);
  });
}
if(query.has('qa')||query.has('shot')) window.coverStudio={
  inspect:()=>({state:structuredClone(state),selected,photoCount:photos.length,
    geometry:geometry&&structuredClone(geometry),
    photoMeta:photos.map(p=>({name:p.name,anchored:Boolean(p.face),silhouette:Boolean(p.silhouette),imported:Boolean(p.imported)})),
  }),
  exportCanvas,
};
start().catch(error=>{console.error(error);notify('The studio could not start. Please reload.');});
