/** Neon Tide — original, resolution-independent cover compositor. */
export const FORMATS = { square: [1080,1080], portrait: [1080,1350], landscape: [1920,1080] };
export const GRADES = [
  {id:'sunset',name:'Vice sunset',top:'#372044',mid:'#e75c87',bottom:'#ffc37b',accent:'#ff81b5',shade:'#2e164a'},
  {id:'neon',name:'Electric night',top:'#171841',mid:'#a348b3',bottom:'#4de4dc',accent:'#69f2eb',shade:'#25103d'},
  {id:'gold',name:'Gold coast',top:'#42303f',mid:'#de8b59',bottom:'#ffe4a2',accent:'#ffcf83',shade:'#38213e'},
  {id:'tropic',name:'Tropic heat',top:'#173f57',mid:'#42b8b1',bottom:'#ffe0a1',accent:'#86ffe0',shade:'#123d4e'},
  {id:'rose',name:'Velvet dusk',top:'#3d2449',mid:'#ca628c',bottom:'#f6b8a0',accent:'#ff9fc5',shade:'#3d183c'},
  {id:'blue',name:'Blue hour',top:'#142f4b',mid:'#517b9f',bottom:'#cec8d1',accent:'#9de4f6',shade:'#142438'},
];
export const LAYOUTS = [
  {id:'headliner',name:'Headliner',hint:'A lead. A crew. A city.'},
  {id:'crossfire',name:'Crossfire',hint:'Two sides to every story.'},
  {id:'triptych',name:'Three acts',hint:'Three cinematic chapters.'},
  {id:'coastline',name:'Coastline',hint:'The coast belongs to you.'},
  {id:'split',name:'Split scene',hint:'Partners in paradise.'},
  {id:'sixpack',name:'Six stories',hint:'Every face has a secret.'},
  {id:'riptide',name:'Riptide',hint:'Nothing stays in its lane.'},
  {id:'spotlight',name:'Spotlight',hint:'All eyes on the lead.'},
];
const INK='#170e25';
const CREAM='#fff0cf';
const ROLES=['THE FIXER','THE DRIVER','THE SIREN','THE CAPTAIN','THE COURIER','THE GETAWAY'];
const SOURCES=[2,0,3,1,4,0];
export function createPanelState(layout='headliner',count=5) {
  return ROLES.map((role,i)=>({role,photo:SOURCES[i]%Math.max(count,1),source:i===5?'coupe':'photo',zoom:1,x:0,y:0,flip:false}));
}
export function createCanvas(width,height) {
  const result=document.createElement('canvas');result.width=width;result.height=height;return result;
}
function path(context,vertices) {
  context.beginPath();vertices.forEach(([x,y],i)=>i?context.lineTo(x,y):context.moveTo(x,y));context.closePath();
}
function gradient(context,x,y,x2,y2,colors) {
  const value=context.createLinearGradient(x,y,x2,y2);
  colors.forEach((color,i)=>value.addColorStop(i/(colors.length-1),color));return value;
}
function text(context,value,x,y,size,color=CREAM,align='left',weight=700,font='Arial') {
  context.font=`${weight} ${size}px ${font},sans-serif`;context.textAlign=align;context.textBaseline='middle';context.fillStyle=color;context.fillText(value,x,y);
}
function tracked(context,value,x,y,size,spacing,color=CREAM,align='center') {
  context.font=`700 ${size}px Arial,sans-serif`;context.textBaseline='middle';context.fillStyle=color;
  const chars=[...value];const width=chars.reduce((n,c)=>n+context.measureText(c).width,0)+spacing*(chars.length-1);
  let cursor=x-(align==='center'?width/2:0);
  for(const c of chars){context.fillText(c,cursor,y);cursor+=context.measureText(c).width+spacing;}
}
function bounds(vertices) {
  const xs=vertices.map(p=>p[0]),ys=vertices.map(p=>p[1]);
  const x=Math.min(...xs),y=Math.min(...ys);return {x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y};
}
export function posterGeometry(state,width,height) {
  const wide=width/height>1.4;
  const border=Math.min(width,height)*.023;
  const area={x:border*1.5,y:height*.102,w:width-border*3,h:height*.737};
  let shapes;
  if(wide){
    shapes=[
      [[0,0],[.272,0],[.243,.49],[0,.47]],
      [[.277,0],[.719,0],[.755,1],[.215,1]],
      [[.724,0],[1,0],[1,.48],[.742,.51]],
      [[0,.485],[.242,.505],[.218,1],[0,1]],
      [[.744,.525],[1,.495],[1,1],[.76,1]],
      [[0,.78],[.22,.78],[.213,1],[0,1]],
    ];
  } else {
    shapes=[
      [[0,0],[.275,0],[.25,.42],[0,.47]],
      [[.286,0],[.713,0],[.765,1],[.19,1]],
      [[.725,0],[1,0],[1,.45],[.75,.42]],
      [[0,.485],[.247,.439],[.21,.96],[0,1]],
      [[.754,.44],[1,.47],[1,1],[.777,.96]],
      [[0,.82],[.22,.79],[.21,1],[0,1]],
    ];
  }
  if(state.layout==='crossfire'||state.layout==='split'){
    shapes=[[[0,0],[.48,0],[.53,.66],[0,.6]],[[.49,0],[1,0],[1,.62],[.54,.67]],[[0,.62],[.27,.65],[.24,1],[0,1]],[[.28,.65],[.53,.69],[.56,1],[.25,1]],[[.55,.69],[1,.64],[1,1],[.58,1]],[[.02,.84],[.24,.84],[.23,1],[.02,1]]];
  }
  if(state.layout==='triptych')shapes=[[[0,0],[.275,0],[.245,1],[0,1]],[[.286,0],[.71,0],[.75,1],[.256,1]],[[.722,0],[1,0],[1,.47],[.74,.5]],[[.742,.52],[1,.49],[1,1],[.76,1]],[[0,.58],[.257,.58],[.245,1],[0,1]],[[.76,.82],[1,.8],[1,1],[.765,1]]];
  if(state.layout==='coastline'||state.layout==='spotlight')shapes=[[[.648,0],[1,0],[1,.34],[.637,.37]],[[0,0],[.633,0],[.59,1],[0,1]],[[.636,.39],[1,.36],[1,.7],[.62,.73]],[[.62,.75],[1,.72],[1,1],[.607,1]],[[0,.64],[.245,.64],[.23,1],[0,1]],[[.235,.82],[.6,.8],[.59,1],[.23,1]]];
  if(state.layout==='sixpack')shapes=[[[0,0],[.324,0],[.303,.51],[0,.47]],[[.336,0],[.663,0],[.685,.49],[.316,.53]],[[.675,0],[1,0],[1,.52],[.698,.49]],[[0,.49],[.301,.53],[.282,1],[0,1]],[[.314,.55],[.687,.51],[.707,1],[.295,1]],[[.7,.51],[1,.54],[1,1],[.72,1]]];
  if(state.layout==='riptide')shapes=[[[0,0],[.32,0],[.275,.49],[0,.42]],[[.333,0],[.705,0],[.77,.7],[.29,.55]],[[.718,0],[1,0],[1,.58],[.784,.66]],[[0,.44],[.274,.51],[.22,1],[0,1]],[[.285,.57],[.774,.72],[.8,1],[.235,1]],[[.788,.74],[1,.6],[1,1],[.815,1]]];
  const panels=shapes.map((shape,index)=>{
    const vertices=shape.map(([x,y])=>[area.x+x*area.w,area.y+y*area.h]);return {index,vertices,...bounds(vertices)};
  });
  return {width,height,wide,border,area,panels,titleY:wide?.656:.704,titleH:wide?.183:.162,titleW:wide?.80:.88};
}
export function hitTestPanel(state,x,y,width,height) {
  const context=createCanvas(1,1).getContext('2d');
  for(const panel of [...posterGeometry(state,width,height).panels].reverse()){
    path(context,panel.vertices);if(context.isPointInPath(x,y))return panel.index;
  }
  return -1;
}
export function cropTravel(image,panel,zoom=1) {
  const scale=Math.max(panel.w/image.width,panel.h/image.height)*zoom;
  return {scale,x:Math.max(0,(image.width*scale-panel.w)/2),y:Math.max(0,(image.height*scale-panel.h)/2)};
}
function drawPhoto(context,photo,panel,crop,grade,strength,ink) {
  const image=photo?.image||photo?.img||photo;
  if(!image?.width){context.fillStyle=grade.mid;context.fillRect(panel.x,panel.y,panel.w,panel.h);return;}
  const travel=cropTravel(image,panel,crop.zoom);
  let focus=photo.focus||{x:.5,y:.43};
  const dw=image.width*travel.scale,dh=image.height*travel.scale;
  const fx=panel.x-Math.min(dw-panel.w,Math.max(0,dw*focus.x-panel.w/2-crop.x*travel.x));
  const fy=panel.y-Math.min(dh-panel.h,Math.max(0,dh*focus.y-panel.h*.43-crop.y*travel.y));
  context.save();
  if(crop.flip){context.translate(panel.x*2+panel.w,0);context.scale(-1,1);}
  context.filter=`saturate(${1+strength*.0042}) contrast(${ink?1.1:1.02}) brightness(1.015)`;
  context.drawImage(image,fx,fy,dw,dh);context.filter='none';context.restore();
  context.save();context.globalAlpha=strength*.0032;context.globalCompositeOperation='soft-light';
  context.fillStyle=gradient(context,0,panel.y,0,panel.y+panel.h,[grade.bottom,grade.mid,grade.shade]);context.fillRect(panel.x,panel.y,panel.w,panel.h);
  context.globalCompositeOperation='multiply';context.globalAlpha=strength*.001;
  context.fillStyle=grade.shade;context.fillRect(panel.x,panel.y,panel.w,panel.h);context.restore();
  context.fillStyle=gradient(context,0,panel.y,0,panel.y+panel.h,['#00000000','#00000000','#170b2b93']);context.fillRect(panel.x,panel.y,panel.w,panel.h);
}
function palm(context,x,y,height,lean=1,color=INK) {
  context.save();context.translate(x,y);context.fillStyle=color;context.strokeStyle=color;
  context.beginPath();context.moveTo(0,0);context.bezierCurveTo(height*.035,-height*.4,-height*.05*lean,-height*.75,-height*.01*lean,-height);context.lineTo(height*.027,-height);context.bezierCurveTo(height*.015,-height*.6,height*.06,-height*.35,height*.035,0);context.fill();
  context.translate(0,-height);
  for(let i=0;i<7;i++){
    const a=-Math.PI*.94+i*Math.PI*.15;
    const end=[Math.cos(a)*height*.31,Math.sin(a)*height*.21];
    context.beginPath();context.moveTo(0,0);context.quadraticCurveTo(end[0]*.6,end[1]-height*.10,end[0],end[1]+height*.1);context.quadraticCurveTo(end[0]*.45,end[1]-height*.01,0,0);context.fill();
  }
  context.restore();
}
function skyline(context,width,height,grade) {
  context.save();context.fillStyle=grade.shade;
  const base=height*.93;
  for(let i=0;i<34;i++){
    const x=width*i/33,w=width*(.017+(i%4)*.005),h=height*(.022+((i*17)%11)*.009);
    context.fillRect(x,base-h,w,h);
    if(i%3===0){context.fillRect(x+w*.45,base-h-height*.018,w*.09,height*.018);}
    context.fillStyle='#ecb99b';
    for(let r=1;r<5;r++)for(let c=1;c<3;c++)if((r+c+i)%3)context.fillRect(x+c*w*.24,base-h+r*h*.16,w*.07,height*.0022);
    context.fillStyle=grade.shade;
  }
  context.restore();
}
function coupe(context,panel,grade) {
  const {x,y,w,h}=panel;context.save();context.translate(x,y);context.scale(w/500,h/300);
  context.fillStyle=gradient(context,0,0,0,300,[grade.top,grade.mid,grade.bottom]);context.fillRect(0,0,500,300);
  context.fillStyle='#ffe8ad';context.beginPath();context.arc(380,75,42,0,Math.PI*2);context.fill();
  palm(context,440,222,190,1);palm(context,45,226,150,-1);
  context.fillStyle='#352033';context.fillRect(0,221,500,79);context.fillStyle='#e8a471';context.fillRect(0,246,500,3);
  context.save();context.translate(59,155);
  context.fillStyle=INK;context.beginPath();context.ellipse(190,95,190,19,0,0,Math.PI*2);context.fill();
  path(context,[[0,58],[28,30],[97,25],[145,0],[253,0],[302,28],[350,42],[365,75],[14,75]]);context.fillStyle='#ed7187';context.fill();context.lineWidth=5;context.stroke();
  path(context,[[112,27],[149,5],[246,5],[279,29]]);context.fillStyle='#203849';context.fill();
  context.fillStyle='#ffdcc0';context.fillRect(28,45,58,8);context.fillRect(306,47,39,8);context.fillStyle='#fff0d1';context.fillRect(5,70,355,6);
  for(const wx of [75,289]){context.fillStyle=INK;context.beginPath();context.ellipse(wx,77,27,31,0,0,Math.PI*2);context.fill();context.fillStyle='#b98c9f';context.beginPath();context.ellipse(wx,77,14,17,0,0,Math.PI*2);context.fill();}
  context.restore();context.restore();
}
function panelLabel(context,panel,value,index,width,height) {
  if(index===1)return;
  const size=Math.min(width,height)*.0127;
  const labelW=Math.min(panel.w*.88,context.measureText(value).width+size*3);
  const px=panel.x+Math.min(width,height)*.012;
  const py=panel.y+Math.min(width,height)*.018;
  context.save();context.font=`900 ${size}px Arial`;const measured=context.measureText(value).width;
  context.translate(px,py);context.rotate(-.025);
  context.fillStyle=INK;context.fillRect(2,3,measured+size*2,size*1.8);
  context.fillStyle=CREAM;context.fillRect(0,0,measured+size*2,size*1.8);
  text(context,value,size,size*.92,size,INK,'left',900);context.restore();
}
// Hand-drawn block glyphs. These paths are our own alphabet, not a game font.
const GLYPHS={
 A:'M0 140L29 0H73L100 140H72L67 107H32L27 140ZM39 79H61L50 31Z',
 B:'M0 0H66L90 17V57L77 70L96 85V120L76 140H0ZM27 26V57H59L64 51V32L58 26ZM27 83V114H62L68 108V91L61 83Z',
 C:'M24 0H76L100 24V46H72V31L66 25H34L28 32V108L34 115H66L72 108V94H100V116L76 140H24L0 116V24Z',
 D:'M0 0H69L100 29V111L69 140H0ZM28 27V113H56L72 98V42L56 27Z',
 E:'M0 0H96V27H28V55H82V82H28V113H96V140H0Z',
 F:'M0 0H96V27H28V56H83V84H28V140H0Z',
 G:'M24 0H76L100 24V45H72V32L66 25H34L28 32V108L34 115H66L72 108V88H51V63H100V116L76 140H24L0 116V24Z',
 H:'M0 0H28V55H72V0H100V140H72V83H28V140H0Z',
 I:'M0 0H78V26H53V114H78V140H0V114H25V26H0Z',
 J:'M15 0H100V115L75 140H24L0 116V90H28V107L35 114H64L72 106V27H15Z',
 K:'M0 0H28V53H39L68 0H100L62 69L100 140H68L38 84H28V140H0Z',
 L:'M0 0H28V113H96V140H0Z',
 M:'M0 140V0H29L50 58L72 0H100V140H74V54L57 100H43L26 54V140Z',
 N:'M0 140V0H28L73 87V0H100V140H72L27 53V140Z',
 O:'M24 0H76L100 24V116L76 140H24L0 116V24ZM35 27L28 34V106L35 113H65L72 106V34L65 27Z',
 P:'M0 0H75L100 25V67L75 92H28V140H0ZM28 27V65H63L72 56V36L63 27Z',
 Q:'M24 0H76L100 24V116L87 130L100 140H65L59 135L53 140H24L0 116V24ZM35 27L28 34V106L35 113H47L38 102H66L72 107V34L65 27Z',
 R:'M0 0H75L100 25V65L80 85L103 140H71L52 91H28V140H0ZM28 27V64H63L72 55V36L63 27Z',
 S:'M23 0H77L100 23V46H72V32L65 25H35L28 32V48L35 55H77L100 78V117L77 140H23L0 117V94H28V108L35 115H65L72 108V91L65 84H23L0 61V23Z',
 T:'M0 0H100V28H64V140H36V28H0Z',
 U:'M0 0H28V106L35 113H65L72 106V0H100V116L76 140H24L0 116Z',
 V:'M0 0H29L50 104L71 0H100L69 140H31Z',
 W:'M0 0H27L33 97L50 51L67 97L73 0H100L88 140H62L50 106L38 140H12Z',
 X:'M0 0H32L50 44L68 0H100L66 70L100 140H68L50 96L32 140H0L34 70Z',
 Y:'M0 0H31L50 50L69 0H100L64 83V140H36V83Z',
 Z:'M0 0H100V25L34 113H100V140H0V115L66 27H0Z',
 '0':'M24 0H76L100 24V116L76 140H24L0 116V24ZM35 27L28 34V106L35 113H65L72 106V34L65 27Z',
 '1':'M14 20L40 0H65V114H90V140H10V114H37V35H14Z',
 '2':'M0 24L24 0H76L100 24V58L34 113H100V140H0V109L72 47V34L65 27H35L28 34V47H0Z',
 '3':'M0 0H76L100 24V57L86 70L100 84V116L76 140H0V113H65L72 106V90L65 83H27V56H65L72 49V34L65 27H0Z',
 '4':'M0 0H28V56H62V0H90V56H100V83H90V140H62V83H0Z',
 '5':'M0 0H100V27H28V54H76L100 78V116L76 140H0V113H65L72 106V89L65 82H0Z',
 '6':'M24 0H100V27H35L28 34V55H76L100 79V116L76 140H24L0 116V24ZM28 82V106L35 113H65L72 106V89L65 82Z',
 '7':'M0 0H100V27L48 140H17L69 27H0Z',
 '8':'M24 0H76L100 24V57L87 70L100 83V116L76 140H24L0 116V83L13 70L0 57V24ZM35 27L28 34V49L35 56H65L72 49V34L65 27ZM35 83L28 90V106L35 113H65L72 106V90L65 83Z',
 '9':'M24 0H76L100 24V116L76 140H0V113H65L72 106V85H24L0 61V24ZM35 27L28 34V51L35 58H72V34L65 27Z',
};
function wordPath(value) {
  const result=new Path2D();let advance=0;
  for(const char of value.toUpperCase()){
    if(char===' '){advance+=48;continue;}
    const data=GLYPHS[char];
    if(data){result.addPath(new Path2D(data),new DOMMatrix().translate(advance,0));advance+=(char==='I'?88:110);}
  }
  return {path:result,width:Math.max(advance-10,1)};
}
function titleLine(context,value,x,y,width,height,finish,accent) {
  const glyph=wordPath(value);context.save();
  context.translate(x,y);context.transform(1,0,-.105,1,0,0);context.scale(width/glyph.width,height/140);
  context.lineJoin='round';
  const lineScale=Math.max(glyph.width/width,140/height);
  for(let d=11;d>=1;d--){context.save();context.translate(d*.75*lineScale,d*lineScale);context.fillStyle=d===11?'#070815':'#5d254f';context.strokeStyle='#100d20';context.lineWidth=11*lineScale;context.stroke(glyph.path);context.fill(glyph.path,'evenodd');context.restore();}
  context.lineWidth=10*lineScale;context.strokeStyle='#120b1e';context.stroke(glyph.path);
  context.lineWidth=4*lineScale;context.strokeStyle='#fff5ce';context.stroke(glyph.path);
  const colors=finish==='sunset'?['#fff6ba','#ffdb77','#ff9c59','#ee457b','#943456']:['#ffffff','#fff2c7','#ffc475','#70334e','#f779a8','#ffd0c9'];
  context.fillStyle=gradient(context,0,0,0,140,colors);context.fill(glyph.path,'evenodd');
  context.save();context.clip(glyph.path,'evenodd');context.fillStyle='#fff6d5';context.globalAlpha=.8;context.fillRect(0,68,glyph.width,2);context.globalAlpha=.3;context.fillStyle=accent;for(let yy=90;yy<140;yy+=7)context.fillRect(0,yy,glyph.width,1);context.restore();
  context.restore();
}
function titleTreatment(context,state,geometry,grade) {
  const {width:w,height:h,wide}=geometry;
  const parts=String(state.title||'UNTITLED').trim().split(/\n|\|/).filter(Boolean).slice(0,2);
  const joined=parts.join(' ');const separate=!wide&&joined.length>12;
  const titleW=w*geometry.titleW;
  const x=(w-titleW)/2+(wide?w*.014:w*.01);
  if(separate){
    const start=h*.65;titleLine(context,parts[0]||joined,x,start,titleW,h*.105,state.finish,grade.accent);
    titleLine(context,parts[1]||'',x,start+h*.116,titleW,h*.105,state.finish,grade.accent);
  } else titleLine(context,joined,x,h*geometry.titleY,titleW,h*geometry.titleH,state.finish,grade.accent);
  const sy=h*(separate?.889:wide?.868:.90);
  context.save();context.translate(w*.51,sy);context.rotate(-.045);context.shadowColor=INK;context.shadowBlur=0;context.shadowOffsetX=2;context.shadowOffsetY=4;
  context.font=`italic 700 ${h*(wide?.067:.042)}px Georgia,serif`;context.textAlign='center';context.textBaseline='middle';context.lineWidth=h*.007;context.strokeStyle=INK;context.strokeText(state.subtitle,w*-.01,0,w*.78);context.fillStyle=CREAM;context.fillText(state.subtitle,w*-.01,0,w*.78);context.restore();
}
function seal(context,x,y,r,year,accent) {
  context.save();context.translate(x,y);context.rotate(.1);
  const teeth=48;const pts=[];
  for(let i=0;i<teeth*2;i++){const a=i*Math.PI/teeth;const rad=r*(i%2?.94:1);pts.push([Math.cos(a)*rad,Math.sin(a)*rad]);}
  path(context,pts);context.fillStyle=accent;context.fill();context.lineWidth=r*.04;context.strokeStyle=INK;context.stroke();
  context.beginPath();context.arc(0,0,r*.78,0,Math.PI*2);context.fillStyle=INK;context.fill();context.strokeStyle=CREAM;context.lineWidth=r*.016;context.stroke();
  text(context,'SOUTH COAST',0,-r*.38,r*.14,CREAM,'center',900);
  text(context,String(year).slice(0,4),0,0,r*.35,accent,'center',900);
  text(context,'ORIGINAL CUT',0,r*.33,r*.12,CREAM,'center',700);context.restore();
}
function barcode(context,x,y,w,h) {
  context.fillStyle=CREAM;context.fillRect(x,y,w,h);context.fillStyle=INK;
  let cursor=x+w*.07;
  for(let i=0;i<35;i++){const bar=w*(i%5===0?.026:.009);context.fillRect(cursor,y+h*.12,bar,h*.7);cursor+=bar+w*.009;}
}
export function renderPoster(canvas,state,photos,options={}) {
  const [w,h]=options.dimensions||FORMATS[state.format]||FORMATS.portrait;
  if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
  const context=canvas.getContext('2d');context.clearRect(0,0,w,h);
  const g=posterGeometry(state,w,h),grade=GRADES.find(item=>item.id===state.grade)||GRADES[0];
  context.fillStyle=gradient(context,0,0,0,h,[grade.top,'#2a1638','#160f22']);context.fillRect(0,0,w,h);
  if(state.frame!==false){
    context.strokeStyle='#eab98b';context.lineWidth=h*.002;context.strokeRect(g.border*.62,g.border*.62,w-g.border*1.24,h-g.border*1.24);
    context.strokeStyle='#6d465c';context.lineWidth=h*.001;context.strokeRect(g.border*.86,g.border*.86,w-g.border*1.72,h-g.border*1.72);
  }
  const topY=h*.055;
  text(context,'★★★★★',g.area.x,topY,h*.018,grade.accent,'left',900);
  tracked(context,'PARADISE IS A DANGEROUS PLACE',w*.48,topY,h*.013,h*.0023,CREAM);
  const edition=String(state.edition||'MIDNIGHT EDITION').toUpperCase();
  context.fillStyle=grade.accent;context.fillRect(w-g.area.x-w*.145,topY-h*.014,w*.145,h*.027);
  text(context,edition,w-g.area.x-w*.0725,topY,h*.0105,INK,'center',900);
  context.fillStyle=INK;context.fillRect(g.area.x-3,g.area.y-3,g.area.w+6,g.area.h+6);
  for(const panel of g.panels){
    const crop=state.panels[panel.index]||createPanelState()[panel.index];
    context.save();path(context,panel.vertices);context.clip();
    if(crop.source==='coupe')coupe(context,panel,grade);else drawPhoto(context,photos[crop.photo%Math.max(photos.length,1)],panel,crop,grade,state.strength, state.ink);
    context.restore();path(context,panel.vertices);context.lineWidth=h*.0055;context.strokeStyle=INK;context.stroke();
    path(context,panel.vertices);context.lineWidth=h*.001;context.strokeStyle='#efbd91aa';context.stroke();
  }
  context.save();context.fillStyle=gradient(context,0,h*.57,0,h*.91,['#160e2200','#24112e88','#1b1025']);context.fillRect(g.area.x,h*.56,g.area.w,h*.35);context.restore();
  skyline(context,w,h,grade);
  if(state.palms){palm(context,w*.032,h*.938,h*.203,1);palm(context,w*.974,h*.938,h*.167,-1);}
  for(const panel of g.panels){const s=state.panels[panel.index];if(s&&panel.index!==5)panelLabel(context,panel,s.role,panel.index,w,h);}
  // Lead caption is placed below the face rather than across it.
  const lead=g.panels[1];const leadX=lead.x+lead.w*.5;
  context.fillStyle=INK;context.fillRect(leadX-w*.061,h*.584,w*.122,h*.022);
  text(context,state.panels[1]?.role||'THE DRIVER',leadX,h*.595,h*.0105,CREAM,'center',900);
  titleTreatment(context,state,g,grade);
  if(g.wide)seal(context,w*.946,h*.878,h*.043,state.year,grade.accent);
  else seal(context,w*.887,h*.665,h*.038,state.year,grade.accent);
  tracked(context,String(state.tagline||'').toUpperCase(),w*.5,h*.94,h*(g.wide?.012:.01),h*.0017,CREAM);
  context.strokeStyle='#ad707e';context.lineWidth=h*.001;context.beginPath();context.moveTo(w*.06,h*.962);context.lineTo(w*.94,h*.962);context.stroke();
  tracked(context,'A NEON TIDE PRODUCTION  •  STARRING YOUR CREW  •  SHOT ON YOUR TERMS',w*.5,h*.978,h*(g.wide?.008:.0065),h*.001,'#d4a3ae');
  text(context,'VOL. 01 / '+state.year,w*.04,h*.98,h*.009,'#d4a3ae');
  barcode(context,w*.906,h*.970,w*.054,h*.019);
  return canvas;
}
export function renderPanelThumbnail(canvas,state,photos,index) {
  canvas.width=180;canvas.height=110;
  const context=canvas.getContext('2d'),panel={x:0,y:0,w:180,h:110};
  const grade=GRADES.find(item=>item.id===state.grade)||GRADES[0];
  const crop=state.panels[index];
  if(crop.source==='coupe')coupe(context,panel,grade);
  else drawPhoto(context,photos[crop.photo],panel,crop,grade,state.strength,state.ink);
}
