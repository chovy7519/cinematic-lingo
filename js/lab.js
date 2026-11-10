/* 独立实验页：不依赖原词典的全局脚本，也不修改 46 个 SVG 演示。 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const MODES = {
  dolly: {
    title: '真实推进与光学变焦，为什么画面不一样？',
    guide: '从同一机位和焦距出发，分别播放 A 与 B：A 移动摄影机，B 固定机位并改变焦距。比较运动过程，以及结束时前后景的相对大小。',
    fact: '同一机位只变焦，相机与物体的投影中心不变，透视关系不变；推进相机则会产生视差与遮挡变化。不要把 SVG 画面放大当作真实推轨的完整模拟。',
    presets: [
      { label: 'A · 播放推镜', distance: 3, focal: 50, height: 1.6 },
      { label: 'B · 播放变焦', distance: 6, focal: 100, height: 1.6 }
    ]
  },
  angle: {
    title: '机位高度改变观看关系',
    guide: '低机位与高机位都对准人物上身。比较画面中天空、地面和背景建筑的关系，再手动调整高度观察。',
    fact: '俯拍与仰拍是摄影机相对于主体的视线角度。它们常用于塑造叙事关系，但没有固定、必然的情绪含义。',
    presets: [
      { label: 'A · 低机位（仰拍）', distance: 6, focal: 50, height: 0.6 },
      { label: 'B · 高机位（俯拍）', distance: 6, focal: 50, height: 3.2 }
    ]
  },
  lens: {
    title: '焦距影响视角；透视取决于机位',
    guide: 'A 为近距离广角，B 为远距离长焦。它们的“焦距/距离”比例相近，所以人物大小接近，但前后物体的相对大小并不一样。',
    fact: '保持机位固定，只改焦距，相当于改变视野范围。为了用不同焦距保持人物大小，需要同时改变机位距离，这时透视差异主要来自机位改变。',
    presets: [
      { label: 'A · 24 mm 广角近拍', distance: 3, focal: 24, height: 1.6 },
      { label: 'B · 72 mm 长焦远拍', distance: 9, focal: 72, height: 1.6 }
    ]
  }
};
const dollyStart = { distance: 6, focal: 50, height: 1.6 };
const state = { mode: 'dolly', ...dollyStart, activePreset: null };
let animationId = null;
function stopAnimation() {
 if (animationId !== null) cancelAnimationFrame(animationId);
 animationId = null;
}
const els = {
  spatial: document.getElementById('lab-spatial'),
  shot: document.getElementById('lab-shot'),
  presets: document.getElementById('lab-presets'),
  guideTitle: document.getElementById('lab-guide-title'),
  guideBody: document.getElementById('lab-guide-body'),
  factTitle: document.getElementById('lab-fact-title'),
  fact: document.getElementById('lab-fact'),
  shotLabel: document.getElementById('lab-shot-label'),
  distance: document.getElementById('distance'),
  focal: document.getElementById('focal'),
  height: document.getElementById('height'),
  distanceValue: document.getElementById('distance-value'),
  focalValue: document.getElementById('focal-value'),
  heightValue: document.getElementById('height-value')
};

const scene = new THREE.Scene();
scene.background = new THREE.Color('#cbd9d9');
scene.add(new THREE.HemisphereLight(0xe8f5fa, 0x73766c, 2.15));
const sun = new THREE.DirectionalLight(0xffe8c8, 2);
sun.position.set(-3, 9, 6);
scene.add(sun);
const mat = (color, roughness = 0.9) => new THREE.MeshStandardMaterial({color, roughness});
function box(w,h,d,x,y,z,material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material);
  mesh.position.set(x,y,z);
  scene.add(mesh);
  return mesh;
}
function sphere(r,x,y,z,material) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r,18,12), material);
  mesh.position.set(x,y,z);
  scene.add(mesh);
  return mesh;
}
const ground = new THREE.Mesh(new THREE.PlaneGeometry(60,60), mat('#b7c8b7'));
ground.rotation.x = -Math.PI/2;
ground.position.y = -0.035;
scene.add(ground);
const grid = new THREE.GridHelper(20,20,0x79918a,0x9aafa4);
grid.position.y=0.005;
scene.add(grid);

// 主体：简化人物，朝向 +Z；近处标尺与远处建筑用于辨认视差。
const coat = mat('#344d4d');
const skin = mat('#e5a77c');
const hair = mat('#343b44');
box(0.65,0.85,0.34,0,1.02,0,coat);
box(0.22,0.62,0.24,-0.18,0.31,0,coat);
box(0.22,0.62,0.24,0.18,0.31,0,coat);
box(0.19,0.74,0.23,-0.45,1.05,0,coat);
box(0.19,0.74,0.23,0.45,1.05,0,coat);
sphere(0.285,0,1.7,0,skin);
sphere(0.042,-0.11,1.72,0.268,hair);
sphere(0.042,0.11,1.72,0.268,hair);
box(0.52,0.11,0.36,0,1.95,-0.03,hair);
box(0.15,2.3,0.15,-0.65,1.15,1.8,mat('#bc5f42'));  // 近景柱
box(0.22,1.2,0.22,1.5,0.6,1.0,mat('#a98f5e'));
const buildingA=mat('#6e8e93');
const buildingB=mat('#c4a57b');
box(2.4,3.6,1.6,-2.7,1.8,-6,buildingA);
box(1.7,2.7,1.5,2.6,1.35,-7,buildingB);
box(1.2,4.5,1.1,0.9,2.25,-10,mat('#849ea8'));
for(let i=0;i<4;i++){
 box(0.35,0.46,0.025,-3.3+(i%2)*1.15,1.3+Math.floor(i/2)*1.15,-5.18,mat('#f7e3b9'));
}
const camera = new THREE.PerspectiveCamera(40,1,0.08,100);
const overviewCamera = new THREE.PerspectiveCamera(47,1,0.1,120);
overviewCamera.position.set(10,6,12);
overviewCamera.lookAt(0,1,-2);
overviewCamera.layers.enable(1);
const helper = new THREE.CameraHelper(camera);
helper.layers.set(1);  // 不让取景画面看到自己的机位线框
scene.add(helper);
const cameraBody = new THREE.Mesh(new THREE.BoxGeometry(0.28,0.2,0.45), mat('#b4522f'));
cameraBody.layers.set(1);
scene.add(cameraBody);

function makeRenderer(host) {
 const r = new THREE.WebGLRenderer({antialias:true,alpha:false});
 r.setPixelRatio(Math.min(window.devicePixelRatio || 1,2));
 r.outputColorSpace = THREE.SRGBColorSpace;
 r.toneMapping = THREE.ACESFilmicToneMapping;
 r.toneMappingExposure = 1.3;
 host.appendChild(r.domElement);
 return r;
}
let spaceRenderer, shotRenderer;
function resize(renderer,host,cam) {
 const bounds=host.getBoundingClientRect();
 const w=Math.max(2,Math.round(bounds.width)), h=Math.max(2,Math.round(bounds.height));
 renderer.setSize(w,h,false);
 cam.aspect=w/h;
 cam.updateProjectionMatrix();
}
function paint() {
 if(!spaceRenderer || !shotRenderer) return;
 resize(spaceRenderer,els.spatial,overviewCamera);
 resize(shotRenderer,els.shot,camera);
 camera.fov=2*Math.atan(24/(2*state.focal))*180/Math.PI;
 camera.position.set(0,state.height,state.distance);
 camera.lookAt(0,1.35,0);
 camera.updateProjectionMatrix();
 camera.updateMatrixWorld();
 cameraBody.position.copy(camera.position);
 cameraBody.rotation.copy(camera.rotation);
 helper.update();
 spaceRenderer.render(scene,overviewCamera);
 shotRenderer.render(scene,camera);
}
function updateUI() {
 els.distance.value=state.distance;
 els.focal.value=state.focal;
 els.height.value=state.height;
 els.distanceValue.textContent=state.distance.toFixed(1)+' m';
 els.focalValue.textContent=state.focal+' mm';
 els.heightValue.textContent=state.height.toFixed(1)+' m';
 els.shotLabel.textContent=state.focal+' mm · '+state.distance.toFixed(1)+' m';
 document.querySelectorAll('.mode-btn').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.mode===state.mode)));
 els.presets.querySelectorAll('.preset-btn').forEach((btn,i)=>btn.dataset.selected=String(i===state.activePreset));
 const m=MODES[state.mode];
 els.guideTitle.textContent=m.title;
 els.guideBody.textContent=m.guide;
 els.fact.textContent=m.fact;
 els.factTitle.textContent=state.activePreset===null?'自由参数 · 观察结果':'当前预设 '+(state.activePreset===0?'A':'B')+' · 关键观察';
}
function update() {updateUI();paint();}
function setPreset(index) {
 stopAnimation();
 const preset = MODES[state.mode].presets[index];
 state.activePreset=index;
 if (state.mode === 'dolly') {
   Object.assign(state,dollyStart);
   update();
   let startTime;
   function animate(time) {
     if (startTime === undefined) startTime = time;
     const progress = Math.min((time-startTime)/1800,1);
     state.distance = dollyStart.distance + (preset.distance-dollyStart.distance)*progress;
     state.focal = Math.round(dollyStart.focal + (preset.focal-dollyStart.focal)*progress);
     update();
     if (progress < 1) animationId=requestAnimationFrame(animate);
     else animationId=null;
   }
   animationId=requestAnimationFrame(animate);
   return;
 }
 Object.assign(state,preset);
 update();
}
function setMode(mode) {
 if(!MODES[mode]) return;
 stopAnimation();
 state.mode=mode;
 els.presets.replaceChildren();
 MODES[mode].presets.forEach((preset,i)=>{
   const btn=document.createElement('button');
   btn.type='button';
   btn.className='preset-btn';
   btn.textContent=preset.label;
   btn.addEventListener('click',()=>setPreset(i));
   els.presets.appendChild(btn);
 });
 if (mode === 'dolly') {
   Object.assign(state,dollyStart);
   state.activePreset=null;
   update();
 } else setPreset(0);
}
for(const btn of document.querySelectorAll('.mode-btn')){
 btn.addEventListener('click',()=>setMode(btn.dataset.mode));
}
for(const key of ['distance','focal','height']) {
 els[key].addEventListener('input',()=>{
   stopAnimation();
   state[key]=Number(els[key].value);
   state.activePreset=null;
   update();
 });
}
document.getElementById('lab-reset').addEventListener('click',()=>{
 if (state.mode === 'dolly') {
   stopAnimation();
   Object.assign(state,dollyStart);
   state.activePreset=null;
   update();
 } else setPreset(0);
});

try {
 spaceRenderer=makeRenderer(els.spatial);
 shotRenderer=makeRenderer(els.shot);
 setMode('dolly');
 new ResizeObserver(paint).observe(els.spatial);
 new ResizeObserver(paint).observe(els.shot);
} catch(error) {
 console.error('摄影机实验室初始化失败',error);
 els.spatial.innerHTML='<p class="lab-error">无法启动三维视图。请确认浏览器支持 WebGL，并通过本地 HTTP 服务联网运行。</p>';
 els.shot.innerHTML='<p class="lab-error">摄影机取景不可用。</p>';
}
