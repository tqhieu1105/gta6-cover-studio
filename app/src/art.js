/* Neon Tide's entire poster is painted here. Preview and PNG share this compositor. */
// Every decorative mark below is generated at export resolution from simple paths.
export const FORMATS = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  landscape: [1920, 1080],
};

export const GRADES = [
  { id: 'sunset', name: 'Vice sunset', colors: ['#382951', '#e96887', '#ffc77e'], shadow: [35, 9, 70], light: [255, 178, 91], saturation: 1.34 },
  { id: 'neon', name: 'Neon noir', colors: ['#161539', '#ad319f', '#73e2e1'], shadow: [22, 10, 91], light: [247, 85, 172], saturation: 1.52 },
  { id: 'tropic', name: 'Tropic heat', colors: ['#154f64', '#41a5a3', '#ffda9a'], shadow: [0, 69, 82], light: [255, 207, 120], saturation: 1.24 },
  { id: 'rose', name: 'Pink hour', colors: ['#531c61', '#ed6991', '#ffe1bd'], shadow: [73, 13, 90], light: [255, 166, 178], saturation: 1.12 },
  { id: 'gold', name: 'Liquid gold', colors: ['#3a283e', '#cc8948', '#ffe6ac'], shadow: [45, 20, 66], light: [255, 197, 110], saturation: .97 },
  { id: 'blue', name: 'Blue afterglow', colors: ['#1a234a', '#737eae', '#f3cfc7'], shadow: [5, 25, 79], light: [177, 212, 244], saturation: .82 },
];

const cut = (points, role, source = 'photo', slot = 0) => ({ points, role, source, slot });
export const LAYOUTS = [
  { id: 'headliner', name: 'Headliner', panels: [
    cut([[0,0],[.29,0],[.25,.57],[0,.62]], 'THE CAPTAIN', 'photo', 1),
    cut([[.30,0],[.72,0],[.78,1],[.24,1]], 'THE DRIVER', 'photo', 0),
    cut([[.73,0],[1,0],[1,.41],[.755,.45]], 'PALM DISTRICT', 'establishing'),
    cut([[0,.64],[.245,.59],[.21,1],[0,1]], 'THE GETAWAY', 'coupe'),
    cut([[.76,.47],[1,.43],[1,.72],[.78,.74]], 'LAST FERRY', 'marina'),
    cut([[.785,.76],[1,.74],[1,1],[.80,1]], 'OCEAN DRIVE', 'motel'),
  ]},
  { id: 'crossfire', name: 'Crossfire', panels: [
    cut([[0,0],[.61,0],[.53,.66],[0,.58]], 'THE DRIVER', 'photo', 0),
    cut([[.625,0],[1,0],[1,.45],[.56,.55]], 'THE CAPTAIN', 'photo', 1),
    cut([[0,.60],[.24,.64],[.18,1],[0,1]], 'THE COAST', 'skyline'),
    cut([[.255,.645],[.54,.69],[.61,1],[.20,1]], 'THE GETAWAY', 'coupe'),
    cut([[.56,.575],[1,.47],[1,.75],[.595,.79]], 'THE LAST LIGHT', 'marina'),
    cut([[.61,.81],[1,.77],[1,1],[.64,1]], 'OCEAN DRIVE', 'motel'),
  ]},
  { id: 'triptych', name: 'Three acts', panels: [
    cut([[0,0],[.30,0],[.25,1],[0,1]], 'THE CAPTAIN', 'photo', 1),
    cut([[.315,0],[.70,0],[.75,1],[.265,1]], 'THE DRIVER', 'photo', 0),
    cut([[.715,0],[1,0],[1,.51],[.74,.55]], 'THE COAST', 'skyline'),
    cut([[.742,.57],[1,.53],[1,1],[.765,1]], 'THE GETAWAY', 'detail', 0),
  ]},
  { id: 'coastline', name: 'Coastline', panels: [
    cut([[0,0],[.66,0],[.59,1],[0,1]], 'THE DRIVER', 'photo', 0),
    cut([[.675,0],[1,0],[1,.38],[.65,.43]], 'THE CAPTAIN', 'photo', 1),
    cut([[.646,.45],[1,.40],[1,.72],[.625,.76]], 'PALM DISTRICT', 'skyline'),
    cut([[.62,.78],[1,.74],[1,1],[.605,1]], 'THE GETAWAY', 'detail', 0),
  ]},
  { id: 'split', name: 'Split scene', panels: [
    cut([[0,0],[.48,0],[.55,.54],[0,.62]], 'THE DRIVER', 'photo', 0),
    cut([[.495,0],[1,0],[1,.62],[.57,.54]], 'THE CAPTAIN', 'photo', 1),
    cut([[0,.64],[.43,.58],[.39,1],[0,1]], 'SOUTH COAST', 'skyline'),
    cut([[.45,.58],[1,.64],[1,1],[.41,1]], 'THE GETAWAY', 'detail', 0),
  ]},
  { id: 'sixpack', name: 'Six stories', panels: [
    cut([[0,0],[.32,0],[.29,.53],[0,.48]], 'THE CAPTAIN', 'photo', 1),
    cut([[.335,0],[.67,0],[.70,.48],[.305,.53]], 'THE DRIVER', 'photo', 0),
    cut([[.685,0],[1,0],[1,.53],[.715,.48]], 'PALM DISTRICT', 'skyline'),
    cut([[0,.50],[.29,.55],[.27,1],[0,1]], 'OFF THE GRID', 'detail', 1),
    cut([[.305,.55],[.70,.50],[.73,1],[.285,1]], 'THE GETAWAY', 'detail', 0),
    cut([[.715,.50],[1,.55],[1,1],[.745,1]], 'NO SIGNAL', 'marina'),
  ]},
  { id: 'riptide', name: 'Riptide', panels: [
    cut([[0,0],[.37,0],[.32,.40],[0,.48]], 'THE CAPTAIN', 'photo', 1),
    cut([[.385,0],[.74,0],[.79,.68],[.33,.55]], 'THE DRIVER', 'photo', 0),
    cut([[.755,0],[1,0],[1,.53],[.795,.60]], 'THE COAST', 'skyline'),
    cut([[0,.50],[.31,.42],[.26,1],[0,1]], 'THE GETAWAY', 'detail', 0),
    cut([[.325,.57],[.79,.70],[.82,1],[.28,1]], 'MIDNIGHT MARINA', 'marina'),
    cut([[.805,.62],[1,.55],[1,1],[.835,1]], 'OFF THE GRID', 'detail', 1),
  ]},
  { id: 'spotlight', name: 'Spotlight', panels: [
    cut([[0,0],[.24,0],[.20,.47],[0,.53]], 'THE CAPTAIN', 'photo', 1),
    cut([[.255,0],[.76,0],[.72,1],[.20,1]], 'THE DRIVER', 'photo', 0),
    cut([[.775,0],[1,0],[1,.50],[.75,.44]], 'THE COAST', 'skyline'),
    cut([[0,.55],[.195,.49],[.17,1],[0,1]], 'THE GETAWAY', 'detail', 0),
    cut([[.747,.46],[1,.52],[1,1],[.735,1]], 'NO SIGNAL', 'marina'),
  ]},
];

export function createPanelState(layoutId, photoCount = 2) {
  const layout = LAYOUTS.find(item => item.id === layoutId) || LAYOUTS[0];
  return layout.panels.map((panel) => ({
    photo: panel.slot % Math.max(1, photoCount),
    role: panel.role,
    source: panel.source,
    zoom: panel.source === 'photo' ? 1.02 : 1,
    x: panel.slot === 0 ? .03 : -.04,
    y: -.92,
    flip: false,
  }));
}

function canvasOf(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
function polygon(ctx, points) {
  ctx.beginPath();
  points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.closePath();
}
function linear(ctx, x, y, xx, yy, stops) {
  const gradient = ctx.createLinearGradient(x,y,xx,yy);
  stops.forEach(([at, color]) => gradient.addColorStop(at,color));
  return gradient;
}
function label(ctx, text, x, y, size, color = '#fff0d5', align = 'left', weight = 700) {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.font = `${weight} ${size}px Arial, sans-serif`;
  ctx.fillText(text,x,y);
}
function spaced(ctx, text, x, y, size, gap, color = '#ffe4b8', align = 'center') {
  ctx.font = `700 ${size}px Arial, sans-serif`;
  const chars = [...text];
  const width = chars.reduce((sum,c) => sum + ctx.measureText(c).width,0) + gap*(chars.length-1);
  let left = align === 'center' ? x-width/2 : x;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  for (const c of chars) {
    ctx.fillText(c,left,y);
    left += ctx.measureText(c).width + gap;
  }
}

const photoGradeCache = new WeakMap();
export function gradePhotoToPoster(image, gradeId, strength, ink) {
  strength = Math.round(strength / 3) * 3;
  const key = `${gradeId}-${strength}-${ink}`;
  let grades = photoGradeCache.get(image);
  if (!grades) { grades = new Map(); photoGradeCache.set(image,grades); }
  if (grades.has(key)) return grades.get(key);
  const scale = Math.min(1, 1500 / Math.max(image.naturalWidth || image.width,image.naturalHeight || image.height));
  const canvas = canvasOf(Math.round((image.naturalWidth || image.width)*scale),Math.round((image.naturalHeight || image.height)*scale));
  const ctx = canvas.getContext('2d',{ willReadFrequently: true });
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const pixels = ctx.getImageData(0,0,canvas.width,canvas.height);
  const data = pixels.data;
  const original = new Uint8ClampedArray(data);
  const grade = GRADES.find(g => g.id === gradeId) || GRADES[0];
  const power = strength / 100;
  const w = canvas.width;
  for (let i=0;i<data.length;i+=4) {
    const luma = original[i]*.25 + original[i+1]*.6 + original[i+2]*.15;
    const shadows = Math.pow(1-luma/255,1.8)*.62*power;
    const highlights = Math.pow(luma/255,1.25)*.39*power;
    const sky = Math.max(0,original[i+2]-original[i])*power*.44;
    let edge = 0;
    if (ink && i >= w*4 && i < data.length-w*4-4) {
      const dx = Math.abs(luma - (original[i+4]*.25+original[i+5]*.6+original[i+6]*.15));
      const dy = Math.abs(luma - (original[i+w*4]*.25+original[i+w*4+1]*.6+original[i+w*4+2]*.15));
      edge = Math.min(78, Math.max(0, dx+dy-10)*1.3);
    }
    for(let channel=0;channel<3;channel++) {
      const c = original[i+channel];
      let graded = luma + (c-luma)*grade.saturation;
      graded = (graded-124)*(1+.34*power)+124;
      graded = graded*(1-shadows-highlights)+grade.shadow[channel]*shadows+grade.light[channel]*highlights;
      graded += sky * [1.4,-.45,.5][channel];
      if (ink) {
        graded = Math.round(graded/15)*15;
        graded -= edge * (channel === 2 ? .65 : 1);
      }
      data[i+channel] = graded;
    }
  }
  ctx.putImageData(pixels,0,0);
  if(grades.size >= 4) grades.delete(grades.keys().next().value);
  grades.set(key,canvas);
  return canvas;
}

export function posterGeometry(state, width, height) {
  const wide = width/height > 1.4;
  const inset = width * (wide ? .018 : .025);
  const art = { x: inset, y: height*.082, w: width-inset*2, h: height*(wide ? .790 : .775) };
  const layout = LAYOUTS.find(item => item.id === state.layout) || LAYOUTS[0];
  const panels = layout.panels.map((panel,index) => {
    const points = panel.points.map(([x,y]) => [art.x+x*art.w, art.y+y*art.h]);
    const xs = points.map(p=>p[0]), ys = points.map(p=>p[1]);
    const bounds = { x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys) };
    return { ...panel,index,points,bounds };
  });
  return { wide, inset, art, panels };
}

export function hitTestPanel(state, width, height, x, y) {
  const panels = posterGeometry(state,width,height).panels;
  for(const panel of panels) {
    let inside = false;
    for(let i=0,j=panel.points.length-1;i<panel.points.length;j=i++) {
      const [xi,yi]=panel.points[i], [xj,yj]=panel.points[j];
      if(((yi>y)!==(yj>y)) && x<(xj-xi)*(y-yi)/(yj-yi)+xi) inside=!inside;
    }
    if(inside)return panel.index;
  }
  return -1;
}

export function cropTravel(image, bounds, zoom) {
  const iw=image.naturalWidth || image.width, ih=image.naturalHeight || image.height;
  const scale=Math.max(bounds.w/iw,bounds.h/ih)*zoom;
  return {drawW:iw*scale,drawH:ih*scale,x:Math.max(0,iw*scale-bounds.w),y:Math.max(0,ih*scale-bounds.h)};
}
function drawFittedPhoto(ctx, image, bounds, panelState) {
  const {drawW,drawH,x:extraX,y:extraY}=cropTravel(image,bounds,panelState.zoom);
  const x = bounds.x-extraX*(.5+Math.max(-1,Math.min(1,panelState.x))*.5);
  const y = bounds.y-extraY*(.5+Math.max(-1,Math.min(1,panelState.y))*.5);
  ctx.save();
  if(panelState.flip) {ctx.translate(bounds.x*2+bounds.w,0);ctx.scale(-1,1);}
  ctx.drawImage(image,x,y,drawW,drawH);
  ctx.restore();
}
export function renderPanelThumbnail(canvas, panel, photo, grade, strength, ink) {
  const ctx=canvas.getContext('2d');
  const bounds={x:0,y:0,w:canvas.width,h:canvas.height};
  if(['skyline','establishing','marina','coupe','motel'].includes(panel.source)){
    skyScene(ctx,bounds,panel.source==='establishing'?'skyline':panel.source,{grade});
  } else if(photo?.image) {
    const image=gradePhotoToPoster(photo.image,grade,strength,ink);
    drawFittedPhoto(ctx,image,bounds,panel);
    if(ink)drawHalftone(ctx,bounds);
  } else {
    ctx.fillStyle='#352442';ctx.fillRect(0,0,canvas.width,canvas.height);
  }
  const shade=ctx.createLinearGradient(0,0,0,canvas.height);
  shade.addColorStop(0,'#19122800');shade.addColorStop(.68,'#20132b44');shade.addColorStop(1,'#1810229a');
  ctx.fillStyle=shade;ctx.fillRect(0,0,canvas.width,canvas.height);
}
function drawHalftone(ctx, bounds) {
  ctx.save();ctx.globalAlpha=.12;ctx.fillStyle='#21152b';
  for(let y=bounds.y+2;y<bounds.y+bounds.h;y+=12){
    const row=Math.floor(y/12)%2;
    for(let x=bounds.x+5+row*6;x<bounds.x+bounds.w;x+=12){
      ctx.beginPath();ctx.arc(x,y,1.25,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.restore();
}

function palm(ctx, x, y, scale, lean = .2, color = '#19142e') {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  ctx.fillStyle = color;
  ctx.beginPath();ctx.moveTo(-3,0);ctx.bezierCurveTo(-6,-38,lean*55-6,-85,lean*60,-108);ctx.lineTo(lean*60+3,-109);ctx.bezierCurveTo(lean*40-1,-70,4,-31,4,0);ctx.fill();
  const crownX = lean*60, crownY=-108;
  for(let f=0;f<9;f++) {
    const angle=-Math.PI+.14+f*(Math.PI*1.9/8);
    const len=29+(f%3)*8;
    const ex=crownX+Math.cos(angle)*len, ey=crownY+Math.sin(angle)*len*.45+12;
    ctx.beginPath();ctx.moveTo(crownX,crownY);
    ctx.quadraticCurveTo((crownX+ex)/2,Math.min(crownY,ey)-22,ex,ey);
    ctx.quadraticCurveTo((crownX+ex)/2+2,(crownY+ey)/2-3,crownX,crownY+4);ctx.fill();
    for(let k=1;k<6;k++) {
      const t=k/6;const px=crownX+(ex-crownX)*t, py=crownY+(ey-crownY)*t-17*Math.sin(t*Math.PI);
      ctx.lineWidth=1.3;ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(angle)*6,py+8+3*t);ctx.stroke();
    }
  }
  ctx.restore();
}

function skyline(ctx, width, horizon, color = '#221832', seed = 1, heightScale = 1) {
  ctx.fillStyle=color;
  let x=0;let n=seed;
  while(x<width) {
    n=(n*1664525+1013904223)>>>0;
    const bw=width*(.018+(n%20)/1000), bh=width*(.024+((n>>>5)%70)/1000)*heightScale;
    ctx.fillStyle=color;ctx.fillRect(x,horizon-bh,bw,bh+2);
    if(n%5===0)ctx.fillRect(x+bw*.4,horizon-bh-width*.025*heightScale,bw*.15,width*.025*heightScale);
    ctx.fillStyle='#f4bc7a';
    for(let wy=horizon-bh+5;wy<horizon-4;wy+=7)for(let wx=x+4;wx<x+bw-3;wx+=6)if(((wx+wy+n)%5)<2)ctx.fillRect(wx,wy,1.5,2.7);
    x+=bw+width*.006;
  }
}

function skyScene(ctx, bounds, kind, state) {
  ctx.save();ctx.translate(bounds.x,bounds.y);ctx.scale(bounds.w/500,bounds.h/500);
  const neon=state.grade==='neon'||state.grade==='blue';
  ctx.fillStyle=linear(ctx,0,0,0,500,neon?[[0,'#211646'],[.4,'#87418e'],[.70,'#ee8eab'],[1,'#1c5363']]:[[0,'#70486f'],[.32,'#da8596'],[.65,'#ffd191'],[1,'#795e86']]);
  ctx.fillRect(0,0,500,500);
  const glow=ctx.createRadialGradient(300,245,5,300,245,230);
  glow.addColorStop(0,'#ffe6acaa');glow.addColorStop(1,'#ffc9a000');ctx.fillStyle=glow;ctx.fillRect(0,0,500,500);
  ctx.fillStyle='#ffe4a7';ctx.beginPath();ctx.arc(305,247,105,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(305,247,105,0,Math.PI*2);ctx.clip();
  for(let i=0;i<6;i++){ctx.fillStyle=neon?'#b45c9a':'#e89d9f';ctx.fillRect(180,258+i*16,250,2+i*1.2);}ctx.restore();
  ctx.fillStyle=neon?'#22536c':'#557d86';ctx.fillRect(0,350,500,150);
  skyline(ctx,500,354,'#332842',42);
  for(let i=0;i<32;i++){ctx.fillStyle=`rgba(255,211,157,${.12+(i%5)*.02})`;ctx.fillRect(260-i*2+(i%3)*18,363+i*4,45+i*3,1);}
  if(kind==='skyline') {
    palm(ctx,35,500,3.3,.13);palm(ctx,475,500,2.7,-.32);
    ctx.fillStyle='#241c36';ctx.save();ctx.translate(270,112);ctx.rotate(-.08);
    polygon(ctx,[[-36,2],[-5,-1],[16,-17],[23,-17],[13,-1],[44,3],[45,7],[11,8],[0,22],[-8,22],[-7,7],[-36,5]]);ctx.fill();ctx.restore();
    spaced(ctx,'SOUTH COAST',250,438,16,3,'#ffe5b9');
    spaced(ctx,'25°46′ N  /  80°12′ W',250,461,8,1,'#d5c7c2');
  } else if(kind==='motel') {
    ctx.fillStyle='#292139';
    ctx.fillRect(27,278,177,159);ctx.fillRect(40,230,150,56);
    ctx.fillStyle='#de7a8d';ctx.fillRect(27,278,177,7);
    ctx.fillStyle='#edb174';ctx.fillRect(42,249,144,3);
    for(let floor=0;floor<3;floor++)for(let room=0;room<5;room++){
      const x=43+room*32,y=294+floor*42;
      ctx.fillStyle=(room+floor)%3===0?'#efb976':'#81738a';
      ctx.fillRect(x,y,20,24);ctx.fillStyle='#2a2038';ctx.fillRect(x+2,y+2,16,17);
      ctx.fillStyle='#ffd382';ctx.fillRect(x+5,y+5,2,2);ctx.fillRect(x+11,y+5,2,2);
    }
    ctx.fillStyle='#f5c36f';ctx.fillRect(76,208,102,32);
    ctx.strokeStyle='#311b3b';ctx.lineWidth=5;ctx.strokeRect(76,208,102,32);
    spaced(ctx,'MOTEL',127,224,17,2,'#a72c70');
    ctx.fillStyle='#281d37';polygon(ctx,[[205,276],[274,247],[342,276],[342,438],[205,438]]);ctx.fill();
    ctx.fillStyle='#ffc66e';for(let i=0;i<4;i++)ctx.fillRect(231+i*25,295,13,3);
    ctx.fillStyle='#fd7da1';ctx.fillRect(0,442,500,4);
    for(let i=0;i<10;i++){ctx.fillStyle=i%2?'#f9bb69':'#ad477d';ctx.fillRect(i*53,449+(i%2)*5,26,3);}
    palm(ctx,445,478,2.15,-.32);
  } else if(kind==='coupe') {
    ctx.fillStyle='#f7c17c';ctx.beginPath();ctx.ellipse(304,380,110,19,-.04,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#26203b';polygon(ctx,[[35,386],[95,365],[147,325],[264,318],[322,350],[398,362],[447,386],[451,424],[37,424]]);ctx.fill();
    ctx.fillStyle='#ea5279';polygon(ctx,[[53,382],[113,368],[159,338],[260,332],[312,356],[393,371],[428,388],[429,412],[53,412]]);ctx.fill();
    ctx.fillStyle='#1d2139';polygon(ctx,[[150,342],[198,338],[198,365],[116,367]]);ctx.fill();polygon(ctx,[[208,338],[253,339],[292,359],[208,365]]);ctx.fill();
    ctx.fillStyle='#f4ce94';ctx.fillRect(67,383,53,6);ctx.fillRect(361,385,48,6);
    ctx.fillStyle='#161323';for(const wheel of [130,353]){ctx.beginPath();ctx.arc(wheel,414,23,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c18a90';ctx.beginPath();ctx.arc(wheel,414,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#161323';}
    ctx.strokeStyle='#ffd388';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(54,429);ctx.lineTo(440,429);ctx.stroke();
    spaced(ctx,'ONE LAST SUMMER',250,478,10,2,'#fff0cf');
  } else if(kind==='marina') {
    ctx.fillStyle='#28223b';polygon(ctx,[[0,417],[500,382],[500,500],[0,500]]);ctx.fill();
    ctx.strokeStyle='#d7a5ac';ctx.lineWidth=3;
    for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(40+i*65,395-i*2);ctx.lineTo(40+i*65,454-i*3);ctx.stroke();}
    // A coupe and marina are original vector scenes, never borrowed artwork.
    ctx.fillStyle=neon?'#ed5cae':'#c84b6b';polygon(ctx,[[65,422],[113,390],[278,382],[346,412],[410,423],[425,457],[52,457]]);ctx.fill();
    ctx.fillStyle='#342a49';polygon(ctx,[[135,391],[203,391],[204,418],[104,420]]);ctx.fill();polygon(ctx,[[213,391],[273,389],[321,416],[214,418]]);ctx.fill();
    ctx.fillStyle='#f7ae9c';ctx.fillRect(72,432,49,7);ctx.fillStyle='#fff0cc';ctx.fillRect(357,428,38,8);
    ctx.fillStyle='#17142c';for(const x of [126,347]){ctx.beginPath();ctx.ellipse(x,457,23,22,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ad92a2';ctx.beginPath();ctx.ellipse(x,457,11,11,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#17142c';}
    ctx.strokeStyle='#ffe2be';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(68,420);ctx.lineTo(319,414);ctx.lineTo(401,427);ctx.stroke();
    palm(ctx,468,400,2.1,-.3);
    spaced(ctx,'LAST LIGHT • 7:46 PM',250,486,9,1.5,'#f8d6b9');
  }
  ctx.restore();
}

function roleTag(ctx, text, x, y, size, tilt = -.04) {
  ctx.save();ctx.translate(x,y);ctx.rotate(tilt);
  ctx.font=`900 ${size}px Arial, sans-serif`;
  const w=ctx.measureText(text).width+size*1.6,h=size*2.0;
  ctx.fillStyle='#171326';ctx.strokeStyle='#eed4ac';ctx.lineWidth=size*.09;
  polygon(ctx,[[0,0],[w+size*.5,0],[w,h],[0,h]]);ctx.fill();ctx.stroke();
  label(ctx,text,size*.7,h*.52,size,'#fff4d9');ctx.restore();
}

// Angular display alphabet: bespoke 5-unit outlines, independent of system/game fonts.
const GLYPHS = {
  A: [[[0,7],[1.65,0],[3.5,0],[5,7],[3.65,7],[3.28,5.2],[1.65,5.2],[1.25,7]], [[2.0,4],[2.55,1.5],[3.05,4]]],
  B: [[[0,0],[3.8,0],[5,.9],[5,2.8],[4.25,3.45],[5,4.1],[5,6.1],[3.9,7],[0,7]],[[1.35,1.25],[1.35,2.9],[3.45,2.9],[3.65,2.65],[3.65,1.5],[3.4,1.25]],[[1.35,4.1],[1.35,5.7],[3.5,5.7],[3.7,5.45],[3.7,4.35],[3.45,4.1]]],
  C: [[[5,.8],[4.1,0],[.9,0],[0,.9],[0,6.1],[.9,7],[4.1,7],[5,6.2],[5,4.9],[3.65,4.9],[3.65,5.7],[1.4,5.7],[1.4,1.3],[3.65,1.3],[3.65,2.2],[5,2.2]]],
  D: [[[0,0],[3.85,0],[5,1.1],[5,5.9],[3.85,7],[0,7]],[[1.4,1.3],[1.4,5.7],[3.1,5.7],[3.6,5.2],[3.6,1.8],[3.1,1.3]]],
  E: [[[0,0],[5,0],[5,1.3],[1.4,1.3],[1.4,2.8],[4.3,2.8],[4.3,4.15],[1.4,4.15],[1.4,5.7],[5,5.7],[5,7],[0,7]]],
  F: [[[0,0],[5,0],[5,1.3],[1.4,1.3],[1.4,2.9],[4.3,2.9],[4.3,4.25],[1.4,4.25],[1.4,7],[0,7]]],
  G: [[[5,.9],[4.1,0],[.9,0],[0,.9],[0,6.1],[.9,7],[4.1,7],[5,6.1],[5,3.1],[2.6,3.1],[2.6,4.4],[3.65,4.4],[3.65,5.7],[1.4,5.7],[1.4,1.3],[3.65,1.3],[3.65,2.0],[5,2.0]]],
  H: [[[0,0],[1.4,0],[1.4,2.8],[3.6,2.8],[3.6,0],[5,0],[5,7],[3.6,7],[3.6,4.2],[1.4,4.2],[1.4,7],[0,7]]],
  I: [[[0,0],[3,0],[3,1.2],[2.2,1.2],[2.2,5.8],[3,5.8],[3,7],[0,7],[0,5.8],[.8,5.8],[.8,1.2],[0,1.2]]],
  J: [[[0,4.7],[1.35,4.7],[1.35,5.7],[3.6,5.7],[3.6,0],[5,0],[5,6.1],[4.1,7],[.9,7],[0,6.1]]],
  K: [[[0,0],[1.4,0],[1.4,2.9],[3.6,0],[5,0],[2.5,3.45],[5,7],[3.35,7],[1.4,4.05],[1.4,7],[0,7]]],
  L: [[[0,0],[1.4,0],[1.4,5.7],[5,5.7],[5,7],[0,7]]],
  M: [[[0,7],[0,0],[1.3,0],[2.5,2.7],[3.7,0],[5,0],[5,7],[3.65,7],[3.65,2.7],[2.5,5],[1.35,2.7],[1.35,7]]],
  N: [[[0,7],[0,0],[1.4,0],[3.6,4.4],[3.6,0],[5,0],[5,7],[3.6,7],[1.4,2.6],[1.4,7]]],
  O: [[[.9,0],[4.1,0],[5,.9],[5,6.1],[4.1,7],[.9,7],[0,6.1],[0,.9]],[[1.4,1.3],[1.4,5.7],[3.6,5.7],[3.6,1.3]]],
  P: [[[0,7],[0,0],[4.1,0],[5,.9],[5,3.6],[4.1,4.5],[1.4,4.5],[1.4,7]],[[1.4,1.3],[1.4,3.2],[3.6,3.2],[3.6,1.3]]],
  Q: [[[.9,0],[4.1,0],[5,.9],[5,5.7],[4.4,6.3],[5,7],[3.4,7],[3.1,6.6],[.9,6.6],[0,5.7],[0,.9]],[[1.4,1.3],[1.4,5.3],[2.1,5.3],[1.7,4.7],[3.1,4.7],[3.6,5.3],[3.6,1.3]]],
  R: [[[0,7],[0,0],[4.1,0],[5,.9],[5,3.5],[4.1,4.4],[3.5,4.4],[5,7],[3.4,7],[1.9,4.4],[1.4,4.4],[1.4,7]],[[1.4,1.3],[1.4,3.1],[3.6,3.1],[3.6,1.3]]],
  S: [[[5,0],[5,1.3],[1.4,1.3],[1.4,2.8],[4.1,2.8],[5,3.7],[5,6.1],[4.1,7],[0,7],[0,5.7],[3.6,5.7],[3.6,4.1],[.9,4.1],[0,3.2],[0,.9],[.9,0]]],
  T: [[[0,0],[5,0],[5,1.35],[3.2,1.35],[3.2,7],[1.8,7],[1.8,1.35],[0,1.35]]],
  U: [[[0,0],[1.4,0],[1.4,5.7],[3.6,5.7],[3.6,0],[5,0],[5,6.1],[4.1,7],[.9,7],[0,6.1]]],
  V: [[[0,0],[1.45,0],[2.5,5.2],[3.55,0],[5,0],[3.35,7],[1.65,7]]],
  W: [[[0,0],[1.2,0],[1.6,4.8],[2.55,2.7],[3.4,4.8],[3.8,0],[5,0],[4.3,7],[3.05,7],[2.5,5.5],[1.9,7],[.7,7]]],
  X: [[[0,0],[1.6,0],[2.5,2.3],[3.4,0],[5,0],[3.3,3.5],[5,7],[3.4,7],[2.5,4.7],[1.6,7],[0,7],[1.7,3.5]]],
  Y: [[[0,0],[1.55,0],[2.5,2.7],[3.45,0],[5,0],[3.2,4.2],[3.2,7],[1.8,7],[1.8,4.2]]],
  Z: [[[0,0],[5,0],[5,1.3],[1.8,5.7],[5,5.7],[5,7],[0,7],[0,5.7],[3.2,1.3],[0,1.3]]],
};

function titlePath(text) {
  const path = new Path2D();let cursor=0;
  for(const char of [...text.toUpperCase()]) {
    if(char===' ') {cursor+=2.4;continue;}
    const glyph=GLYPHS[char];
    if(!glyph) {cursor+=3.2;continue;}
    for(const outline of glyph) {
      outline.forEach(([x,y],index)=> index ? path.lineTo(cursor+x,y) : path.moveTo(cursor+x,y));path.closePath();
    }
    cursor+=(char==='I'?3:5)+.55;
  }
  return {path,width:Math.max(1,cursor-.55)};
}

function star(ctx,x,y,size,color='#fff7d9') {
  ctx.fillStyle=color;ctx.beginPath();
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const r=i%2?size*.13:size;const xx=x+Math.cos(a)*r, yy=y+Math.sin(a)*r;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.closePath();ctx.fill();
}

export function drawOriginalChromeTitle(ctx,text,centerX,top,width,height,finish) {
  const shape=titlePath(text);
  ctx.save();ctx.translate(centerX-width/2+height*.05,top);ctx.transform(1,0,-.10,1,0,0);
  ctx.scale(width/shape.width,height/7);
  const sx=shape.width/width,sy=7/height;
  ctx.lineJoin='round';
  // The stepped extruded edge makes every letter a separate, tangible foil object.
  for(let d=13;d>=0;d--) {
    ctx.save();ctx.translate(d*sx*.75,d*sy);
    ctx.strokeStyle=d>4?'#21152e':'#40203f';ctx.lineWidth=height*.082*sx;
    ctx.stroke(shape.path);ctx.fillStyle='#321c3c';ctx.fill(shape.path,'evenodd');ctx.restore();
  }
  ctx.strokeStyle='#f9d29d';ctx.lineWidth=height*.035*sx;ctx.stroke(shape.path);
  ctx.strokeStyle='#28142e';ctx.lineWidth=height*.019*sx;ctx.stroke(shape.path);
  const colors=finish==='ice'?['#fbffff','#bfece8','#58bebf','#e9ffff','#5093be','#d6a0e6']:finish==='sunset'?['#fff6c0','#ffe697','#ffbd66','#fff7d2','#f36579','#c63883']:['#fffdea','#fff5d6','#e8c296','#ffffeb','#ed8b9f','#b94184'];
  const g=ctx.createLinearGradient(0,0,0,7);
  [[0,colors[0]],[.19,colors[1]],[.42,colors[2]],[.45,colors[3]],[.49,colors[3]],[.52,colors[4]],[1,colors[5]]].forEach(([v,c])=>g.addColorStop(v,c));
  ctx.fillStyle=g;ctx.fill(shape.path,'evenodd');
  ctx.save();ctx.clip(shape.path,'evenodd');
  for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#fff4c680':'#48124466';ctx.fillRect(-1,4.5+i*.42,shape.width+3,.045+i*.015);}
  ctx.strokeStyle='#fffceaa8';ctx.lineWidth=.025;ctx.beginPath();ctx.moveTo(-1,.19);ctx.lineTo(shape.width+1,.19);ctx.stroke();ctx.restore();ctx.restore();
  star(ctx,centerX-width*.43,top+height*.22,height*.105);
  star(ctx,centerX+width*.39,top+height*.06,height*.074);
}

function paintBrushSubtitle(ctx,text,x,y,size,maxWidth) {
  ctx.save();ctx.translate(x,y);ctx.rotate(-.06);
  ctx.font=`italic 800 ${size}px Georgia, serif`;
  const scale=Math.min(1,maxWidth/ctx.measureText(text).width);ctx.scale(scale,1);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  ctx.strokeStyle='#3b153b';ctx.lineWidth=size*.19;ctx.strokeText(text,0,5);
  ctx.strokeStyle='#ce3d87';ctx.lineWidth=size*.10;ctx.strokeText(text,0,0);
  ctx.fillStyle='#fff0e0';ctx.fillText(text,0,0);
  ctx.strokeStyle='#f3a2c1';ctx.lineWidth=size*.035;ctx.beginPath();ctx.moveTo(-maxWidth*.32,size*.52);ctx.bezierCurveTo(-maxWidth*.1,size*.72,maxWidth*.19,size*.62,maxWidth*.34,size*.35);ctx.stroke();ctx.restore();
}

function seal(ctx,x,y,r,year) {
  ctx.save();ctx.translate(x,y);ctx.rotate(.13);
  ctx.fillStyle='#edca84';ctx.strokeStyle='#21162c';ctx.lineWidth=r*.07;
  const points=[];for(let i=0;i<48;i++){const a=i/48*Math.PI*2,rr=r*(i%2?.88:1);points.push([Math.cos(a)*rr,Math.sin(a)*rr]);}
  polygon(ctx,points);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,r*.73,0,Math.PI*2);ctx.strokeStyle='#5d3449';ctx.lineWidth=r*.02;ctx.stroke();
  label(ctx,'AFTER DARK',0,-r*.37,r*.16,'#312037','center',900);
  label(ctx,year,0,-r*.02,r*.44,'#312037','center',900);
  label(ctx,'NO CURFEW',0,r*.30,r*.13,'#312037','center',900);
  label(ctx,'✦  ✦  ✦',0,r*.5,r*.10,'#6e3d53','center');ctx.restore();
}

function posterTexture(ctx,width,height,ink) {
  if(!ink)return;
  ctx.save();ctx.globalAlpha=.07;ctx.fillStyle='#ffebc2';
  for(let y=3;y<height;y+=5)for(let x=(y%10?2:4);x<width;x+=5){if((x*13+y*29)%17<5)ctx.fillRect(x,y,.8,.8);}
  ctx.globalAlpha=.025;ctx.fillStyle='#160e2b';for(let y=0;y<height;y+=3)ctx.fillRect(0,y,width,.8);ctx.restore();
}

export function renderPoster(canvas, state, photos, options = {}) {
  const [width,height]=FORMATS[state.format] || FORMATS.portrait;
  canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');
  const {wide,inset,art,panels}=posterGeometry(state,width,height);
  const unit=Math.min(width,height)/1080;
  const bg=linear(ctx,0,0,width,height,[[0,'#24172f'],[.43,'#21192e'],[1,'#53304a']]);
  ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  const radiusGlow=ctx.createRadialGradient(width*.55,height*.26,0,width*.55,height*.26,width*.7);
  radiusGlow.addColorStop(0,'#da8a5d33');radiusGlow.addColorStop(1,'#fca67b00');ctx.fillStyle=radiusGlow;ctx.fillRect(0,0,width,height);
  if(state.frame) {
    for(const [offset,color,line] of [[.009,'#5d3e58',7],[.014,'#e6c28b',1.6],[.019,'#b18576',.7]]) {
      ctx.strokeStyle=color;ctx.lineWidth=line*unit;ctx.strokeRect(width*offset,width*offset,width-width*offset*2,height-width*offset*2);
    }
  }
  const topY=height*.045;
  label(ctx,'★★★★★',inset*1.25,topY,wide?19*unit:15*unit,'#f5c578');
  label(ctx,'“ONE COAST. NO WAY BACK.”',inset*1.25+(wide?132:99)*unit,topY,wide?14*unit:11*unit,'#fff0d4','left',800);
  if(wide)spaced(ctx,'THE COASTAL CHRONICLE',width*.55,topY,10*unit,2*unit,'#bd9ca7');
  ctx.fillStyle='#e9c485';ctx.fillRect(width-inset-111*unit,topY-14*unit,106*unit,28*unit);
  label(ctx,'VOL. 01 / '+state.year,width-inset-58*unit,topY,11*unit,'#302039','center',900);
  for(const panel of panels) {
    const settings=state.panels[panel.index] || createPanelState(state.layout)[panel.index];
    ctx.save();polygon(ctx,panel.points);ctx.clip();
    if(['skyline','establishing','marina','coupe','motel'].includes(settings.source))
      skyScene(ctx,panel.bounds,settings.source==='establishing'?'skyline':settings.source,state);
    else {
      const photo=photos[settings.photo%photos.length];
      if(photo?.image) {
        const image=gradePhotoToPoster(photo.image,state.grade,state.strength,state.ink);
        drawFittedPhoto(ctx,image,panel.bounds,settings);
        if(state.ink)drawHalftone(ctx,panel.bounds);
      }
    }
    const b=panel.bounds;
    // Warm highlight haze and violet shadow glaze integrate the photographic panels.
    const haze=ctx.createRadialGradient(b.x+b.w*.75,b.y+b.h*.08,0,b.x+b.w*.75,b.y+b.h*.08,b.h*.76);
    haze.addColorStop(0,state.grade==='neon'?'#ee64bc66':'#ffd16c69');haze.addColorStop(1,'#ffd8a000');
    ctx.globalCompositeOperation='screen';ctx.fillStyle=haze;ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=state.strength/100*.42;
    ctx.fillStyle=state.grade==='neon'?'#bc35b0':state.grade==='blue'?'#486bba':state.grade==='tropic'?'#1eaaa4':'#ef7046';
    ctx.fillRect(b.x,b.y,b.w,b.h);ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';ctx.fillStyle=linear(ctx,0,b.y,0,b.y+b.h,[[0,'#1d0b3200'],[.61,'#2b154400'],[1,'#2910336e']]);ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.restore();
    polygon(ctx,panel.points);ctx.strokeStyle='#100e22';ctx.lineWidth=10*unit;ctx.stroke();
    ctx.strokeStyle=state.frame?'#eac597':'#fff0cf';ctx.lineWidth=2*unit;ctx.stroke();
    if(options.selection===panel.index) {polygon(ctx,panel.points);ctx.strokeStyle='#ffba88';ctx.lineWidth=4*unit;ctx.stroke();}
    const tagY=b.y+Math.min(30*unit,b.h*.16);
    const edgeXs=panel.points.flatMap(([x,y],i)=>{
      const [xx,yy]=panel.points[(i+1)%panel.points.length];
      return (y<=tagY&&yy>tagY)||(yy<=tagY&&y>tagY)?[x+(xx-x)*(tagY-y)/(yy-y)]:[];
    });
    const tagX=(edgeXs.length?Math.min(...edgeXs):b.x)+b.w*.05;
    if(settings.role) roleTag(ctx,settings.role,tagX,tagY,wide?15*unit:11*unit,panel.index%2?-.025:.025);
  }
  // A shadow bed supports the title without taking the photograph out of the composition.
  const titleZone=wide?height*.505:height*.565;
  const fade=linear(ctx,0,titleZone-height*.035,0,art.y+art.h,[[0,'#22102700'],[.38,'#2d123220'],[1,'#1a102d84']]);
  ctx.fillStyle=fade;ctx.fillRect(inset,titleZone-height*.035,width-inset*2,art.y+art.h-titleZone+height*.035);
  let titleLines=state.title.toUpperCase().split(/\n|\|/).map(t=>t.trim()).filter(Boolean).slice(0,2);
  if(!titleLines.length)titleLines=['YOUR','STORY'];
  const flattened=titleLines.join(' ');
  const total=flattened.length;
  const singleLine=wide && total<19;
  const titleWidth=width*(wide?.76:.88);
  if(singleLine) {
    const th=height*(total>12?.185:.21);
    drawOriginalChromeTitle(ctx,flattened,width*.51,height*.555,titleWidth,th,state.finish);
    paintBrushSubtitle(ctx,state.subtitle||'one last summer',width*.56,height*.755,height*.058,width*.62);
  } else {
    const rows=titleLines.length;
    const th=height*(rows===1?.17:.137);
    const firstY=height*(rows===1?.65:.535);
    titleLines.forEach((line,index)=>drawOriginalChromeTitle(ctx,line,width*.51,firstY+index*(th+height*.009),Math.min(titleWidth,titleWidth*(line.length/(Math.max(...titleLines.map(t=>t.length))))),th,state.finish));
    paintBrushSubtitle(ctx,state.subtitle||'one last summer',width*.55,height*.838,height*.042,width*.76);
  }
  seal(ctx,width*(wide?.896:.872),height*(wide?.515:.518),height*(wide?.074:.049),state.year);
  const footerY=height*.895;
  ctx.strokeStyle='#bf947c';ctx.lineWidth=.8*unit;ctx.beginPath();ctx.moveTo(inset*1.4,footerY-13*unit);ctx.lineTo(width-inset*1.4,footerY-13*unit);ctx.stroke();
  spaced(ctx,state.tagline.toUpperCase(),width*.5,footerY+3*unit,wide?17*unit:12*unit,wide?4*unit:2.4*unit,'#ffe6bd');
  if(state.palms) {
    const silhouetteY=height*.976;
    palm(ctx,width*.12,silhouetteY,.44*unit,.17,'#c78b7c77');
    palm(ctx,width*.87,silhouetteY,.43*unit,-.17,'#c78b7c77');
    ctx.save();
    const strip=height*.013;
    ctx.beginPath();ctx.rect(inset,height*.977,width-inset*2,strip);ctx.clip();
    skyline(ctx,width,height*.99,'#1a132a',5,.11);
    ctx.restore();
  }
  spaced(ctx,'A NEON TIDE PICTURE  •  STARRING YOU',width*.5,height*.933,wide?10*unit:7*unit,wide?2*unit:1.4*unit,'#dcbca9');
  spaced(ctx,'SHOT ON YOUR CAMERA  /  GRADED IN THE ATELIER  /  '+state.edition.toUpperCase(),width*.5,height*.951,wide?7*unit:5.5*unit,wide?1.8*unit:.7*unit,'#ac8d9e');
  label(ctx,'COMING SOON',inset*1.6,height*.953,wide?12*unit:7*unit,'#f5d9c1','left',900);
  const bx=width-inset-97*unit,by=height*.931,bw=90*unit,bh=38*unit;
  ctx.fillStyle='#f7e9cc';ctx.fillRect(bx,by,bw,bh);ctx.fillStyle='#23192d';
  let pos=bx+5*unit;for(let i=0;i<42;i++){const line=(i*17%5+1)*.32*unit;if(pos+line>bx+bw-4*unit)break;ctx.fillRect(pos,by+4*unit,line,bh-13*unit);pos+=line+.72*unit;}
  label(ctx,'N T — 2 6 0 1',bx+bw*.5,by+bh-5*unit,4.5*unit,'#281c31','center',900);
  posterTexture(ctx,width,height,state.ink);
  return canvas;
}
