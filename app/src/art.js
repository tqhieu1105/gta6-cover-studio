import { linear, print, renderChromeTitle, renderSignature, titleSafeRegion } from './lettering.js';
import { alpha, canvasOf, paintPhoto, paintIsolatedSubject, projectedFace } from './photo.js';
import { polygon, waterfront, sunsetStage, getawayCar, collectorSeal } from './scenes.js';
export { canvasOf, clamp, cropTravel, fitPhotoToAnchor } from './photo.js';

export const FORMATS = Object.freeze({ landscape: [1920, 1080], portrait: [1080, 1350], square: [1080, 1080] });
const palette = (id, name, sky, warm, rim, cool, hot) => ({ id, name, sky, warm, rim, cool, hot });
export const GRADES = [
  palette('ember', 'Tangerine Dusk', ['#6d254c','#f27967','#ffd394'], '#ffc580','#fff0ba','#413067','#ec5686'),
  palette('violet', 'Velvet Sunset', ['#523163','#e4769c','#ffca9e'], '#ffbd97','#ffe2bd','#382865','#ea558e'),
  palette('copper', 'Sunlit Brass', ['#8a3855','#f29d66','#ffe2a5'], '#ffc779','#ffedb9','#2d535f','#ee6668'),
  palette('glass', 'Sea Glass', ['#254d75','#72c9b2','#f9e2aa'], '#ffcc9e','#e2fff4','#186b72','#f67e9e'),
  palette('pearl', 'Pink Pearl', ['#655774','#c995ae','#ffdfba'], '#ffdeb5','#ffeadd','#465a77','#c077a1'),
  palette('noir', 'Electric Bay', ['#25194c','#aa4bad','#efa4ac'], '#ffb2a8','#bffff1','#2e4081','#f45db9'),
];
export const LAYOUTS = [
  ['premiere','Premiere · six cast',6], ['rush','Spotlight · six cast',6],
  ['cascade','Cascade · six cast',6], ['overdrive','Overdrive · four cast',4],
  ['double','Double feature',2], ['trio','Three tickets',3],
  ['single','One night only',1], ['seaside','Seaside · four cast',4],
].map(([id, name, count]) => ({ id, name, count }));
const roles = ['THE SIREN','THE FIXER','THE INSIDER','THE DRIVER','THE SWITCH','THE CAPTAIN'];
const black = '#180e23', cream = '#fff0d3';
export function createPanelState(layout, photoCount, previous = []) {
  const design = LAYOUTS.find(item => item.id === layout) || LAYOUTS[0];
  return Array.from({ length: design.count }, (_, index) => previous[index] || {
    photo: index % Math.max(1, photoCount), role: roles[index],
    x: 0, y: 0, zoom: 1, flip: false, autoFrame: true,
  });
}
function panelVertices(design, format) {
  if (design.count === 1) return [[[0,0],[1,0],[1,1],[0,1]]];
  if (design.count === 6 && format === 'landscape' && design.id === 'premiere') {
    const joint = [.365,.48], crown = [.393,0], foot = [.337,1];
    return [ [[0,0],crown,foot,[0,1]],
      [crown,[.61,0],[.588,.48],joint],
      [[.61,0],[.81,0],[.80,.48],[.588,.48]],
      [[.81,0],[1,0],[1,.48],[.80,.48]],
      [joint,[.687,.48],[.659,1],foot],
      [[.687,.48],[1,.48],[1,1],[.659,1]] ];
  }
  if (design.count === 6 && format === 'portrait') return [
    [[.263,.265],[.718,.245],[.767,1],[.215,1]],
    [[0,0],[.34,0],[.263,.265],[.239,.62],[0,.59]],
    [[.34,0],[.714,0],[.718,.245],[.263,.265]],
    [[.714,0],[1,0],[1,.57],[.744,.61],[.718,.245]],
    [[0,.59],[.239,.62],[.215,1],[0,1]],
    [[.744,.61],[1,.57],[1,1],[.767,1]],
  ];
  if (design.count === 6) {
    const a = design.id === 'rush' ? [.43,.37] : [.28,.31];
    const b = design.id === 'cascade' ? [.75,.68] : [.72,.76];
    const point = (edge, y) => [edge[0] * (1-y) + edge[1] * y, y];
    const cell = (left, right, top, bottom) => [point(left,top),point(right,top),point(right,bottom),point(left,bottom)];
    return [cell(a,b,0,1),cell([0,0],a,0,.48),cell([0,0],a,.48,1),
      cell(b,[1,1],0,.36),cell(b,[1,1],.36,.70),cell(b,[1,1],.70,1)];
  }
  return Array.from({length:design.count}, (_, i) => {
    const l=i/design.count, r=(i+1)/design.count, lt=i ? .032 : 0, rt=i+1<design.count ? .032 : 0;
    const points=[[l+lt,0],[r+rt,0],[r-rt,1],[l-lt,1]];
    return design.id==='seaside' ? points.map(([x,y])=>[y,x]) : points;
  });
}
export function posterGeometry(state, width, height) {
  const format = width > height*1.12 ? 'landscape' : height > width*1.12 ? 'portrait' : 'square';
  const unit = Math.min(width,height)/1080, edge=16*unit, top=59*unit;
  const fieldHeight=height*(format==='landscape' ? .744 : .727);
  const title=titleSafeRegion(width,height);
  const design=LAYOUTS.find(item=>item.id===state.layout)||LAYOUTS[0];
  const panels=panelVertices(design,format).map((points,index)=>{
    const vertices=points.map(([x,y])=>[edge+x*(width-edge*2),top+y*fieldHeight]);
    const xs=vertices.map(p=>p[0]),ys=vertices.map(p=>p[1]);
    const x=Math.min(...xs),y=Math.min(...ys);
    return {index,vertices,x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y,safeBottom:title.y-8*unit};
  });
  return {width,height,unit,edge,top,fieldHeight,format,wide:format==='landscape',panels,title};
}
function crossings(vertices, y) {
  const values=[];
  for (let i=0;i<vertices.length;i++) {
    const [x0,y0]=vertices[i], [x1,y1]=vertices[(i+1)%vertices.length];
    if ((y0>y)!==(y1>y)) values.push(x0+(x1-x0)*(y-y0)/(y1-y0));
  }
  return values.sort((a,b)=>a-b);
}
export function hitTestPanel(geometry, x, y) {
  for (const panel of geometry?.panels || []) {
    const edges=crossings(panel.vertices,y);
    for(let i=0;i<edges.length-1;i+=2) if(x>=edges[i]&&x<=edges[i+1]) return panel.index;
  }
  return -1;
}
function paintRole(ctx, panel, text, geometry, tone) {
  if (!text.trim()) return;
  const u=geometry.unit,size=(panel.index===0?23:20)*u;
  const y=panel.y+(panel.index===0?panel.h*.53:31*u);
  if(y>=geometry.title.y-13*u) return;
  const bounds=crossings(panel.vertices,y-size*.5);
  if(bounds.length<2) return;
  ctx.save();ctx.font=`900 ${size}px Arial`;
  const width=Math.min(bounds.at(-1)-bounds[0]-24*u,ctx.measureText(text.toUpperCase()).width+19*u);
  if(width>34*u) {
    const x=bounds[0]+12*u;
    ctx.fillStyle=alpha(black,.88);ctx.fillRect(x,y-size,width,size*1.3);
    ctx.fillStyle=tone.hot;ctx.fillRect(x,y-size,3*u,size*1.3);
    print(ctx,text.toUpperCase(),x+9*u,y,size,{color:cream,limit:width-17*u,spacing:.3*u});
  }
  ctx.restore();
}
let castLayer;
function paintCast(ctx, state, photos, geometry, tone) {
  const {width,height,unit}=geometry;
  castLayer ||= canvasOf(width,height);
  castLayer.width=width;castLayer.height=height;
  const layer=castLayer.getContext('2d');layer.imageSmoothingQuality='high';
  for(const panel of geometry.panels) {
    const crop=state.panels[panel.index],photo=photos[crop.photo];
    layer.save();polygon(layer,panel.vertices);layer.clip();
    if(panel.index===0 && state.heroCutout && photo?.matteImage) {
      sunsetStage(layer,panel,tone);
      paintIsolatedSubject(layer,photo,panel,crop,tone,state.strength,state.inkAmount);
    } else paintPhoto(layer,photo,panel,crop,tone,state.strength,state.inkAmount);
    layer.restore();
    polygon(layer,panel.vertices);layer.lineJoin='round';layer.strokeStyle=black;
    layer.lineWidth=7*unit;layer.stroke();layer.strokeStyle=alpha(tone.rim,.78);
    layer.lineWidth=1.8*unit;layer.stroke();
  }
  layer.globalCompositeOperation='destination-in';
  layer.fillStyle=linear(layer,0,height*.60,0,height*.865,
    [[0,'#ffffffff'],[.28,'#ffffffff'],[.76,'#ffffff77'],[1,'#ffffff00']]);
  layer.fillRect(0,0,width,height);
  ctx.drawImage(castLayer,0,0);
}
function roadScene(ctx, geometry, tone) {
  if(!geometry.wide) return;
  const {width:w,height:h,unit:u}=geometry;
  const points=[[w*.014,h*.585],[w*.345,h*.57],[w*.332,h*.714],[w*.014,h*.714]];
  ctx.save();polygon(ctx,points);ctx.clip();
  sunsetStage(ctx,{x:w*.014,y:h*.57,w:w*.333,h:h*.165},tone);
  ctx.fillStyle='#261a37';
  polygon(ctx,[[0,h*.687],[w*.36,h*.641],[w*.36,h*.74],[0,h*.74]]);ctx.fill();
  ctx.strokeStyle=alpha(tone.rim,.55);ctx.lineWidth=2*u;
  ctx.beginPath();ctx.moveTo(w*.015,h*.708);ctx.lineTo(w*.34,h*.674);ctx.stroke();
  getawayCar(ctx,w*.045,h*.609,w*.258,tone);
  ctx.restore();polygon(ctx,points);ctx.strokeStyle=black;ctx.lineWidth=6*u;ctx.stroke();
  ctx.strokeStyle=alpha(tone.rim,.75);ctx.lineWidth=1.5*u;ctx.stroke();
}
function paintPublication(ctx, g, tone, state) {
  const {width:w,height:h,unit:u,edge:e}=g;
  ctx.save();ctx.strokeStyle=alpha(tone.rim,.68);ctx.lineWidth=1.5*u;
  ctx.strokeRect(e-3*u,13*u,w-e*2+6*u,h-26*u);
  print(ctx,'★★★★★',e+9*u,43*u,21*u,{color:tone.rim,spacing:2*u});
  print(ctx,'“EVERY PARADISE HAS A PRICE”',w/2,43*u,21*u,{align:'center',limit:w*.51,spacing:2.1*u});
  print(ctx,state.edition.toUpperCase(),w-e-10*u,43*u,18*u,{align:'right',limit:w*.23,color:tone.rim,spacing:1.3*u});
  const baseline=h-68*u;
  ctx.fillStyle=black;ctx.fillRect(e,baseline,w-e*2,55*u);
  ctx.fillStyle=alpha(tone.rim,.65);ctx.fillRect(e,baseline,w-e*2,1.5*u);
  print(ctx,'COMING SOON',e+13*u,baseline+33*u,17*u,{color:tone.rim,spacing:3.2*u,limit:w*.16});
  print(ctx,state.tagline.toUpperCase(),w/2,baseline+23*u,19*u,{align:'center',spacing:1.4*u,limit:w*.55});
  print(ctx,'SUN COAST PICTURES   ·   AN INDEPENDENT PRODUCTION',w/2,baseline+42*u,10*u,
    {align:'center',spacing:1.8*u,limit:w*.55,color:'#e7c7ba'});
  const barcodeX=w-e-84*u;
  ctx.fillStyle=cream;ctx.fillRect(barcodeX,baseline+11*u,73*u,32*u);ctx.fillStyle=black;
  let x=barcodeX+5*u;
  Array.from('13212321213121231231321',Number).forEach((bar,i)=>{
    ctx.fillRect(x,baseline+15*u,bar*u,(i%4?18:21)*u);x+=(bar+1)*u;
  });
  ctx.restore();
}
export function renderPoster(canvas, state, photos, format=state.format) {
  const [width,height]=FORMATS[format];
  if(canvas.width!==width) canvas.width=width;
  if(canvas.height!==height) canvas.height=height;
  const ctx=canvas.getContext('2d'),g=posterGeometry(state,width,height);
  const tone=GRADES.find(item=>item.id===state.grade)||GRADES[0];
  ctx.save();ctx.imageSmoothingQuality='high';
  waterfront(ctx,width,height,tone);paintCast(ctx,state,photos,g,tone);
  g.panels.forEach(panel=>paintRole(ctx,panel,state.panels[panel.index].role,g,tone));
  roadScene(ctx,g,tone);
  renderChromeTitle(ctx,state.title,width,height,state.finish);
  renderSignature(ctx,state.subtitle,width,height,tone.rim,tone.hot);
  collectorSeal(ctx,width*.948,height*.898,g.unit*(g.wide?38:28),tone);
  paintPublication(ctx,g,tone,state);ctx.restore();
  g.faces=g.panels.map(panel=>projectedFace(photos[state.panels[panel.index].photo],panel,state.panels[panel.index]));
  return g;
}
export function drawPanelPreview(canvas, photo, crop, state) {
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
  paintPhoto(ctx,photo,{x:0,y:0,w:canvas.width,h:canvas.height},crop,
    GRADES.find(item=>item.id===state.grade)||GRADES[0],state.strength,state.inkAmount);
}
