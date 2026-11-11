/* 独立实验页：不依赖原词典的全局脚本，也不修改 46 个 SVG 演示。 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { createStudio } from './studio-set.js';

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
  heightValue: document.getElementById('height-value'),
  overviewReset: document.getElementById('lab-overview-reset'),
  captureStatus: document.getElementById('lab-capture-status'),
  captureFrameA: document.getElementById('lab-capture-a'),
  captureFrameB: document.getElementById('lab-capture-b'),
  captureCaptionA: document.getElementById('lab-capture-caption-a'),
  captureCaptionB: document.getElementById('lab-capture-caption-b')
};
const captures = { a: null, b: null };

// V0.4 authored film-stage art stays independent of camera mathematics.
const { scene, mat } = createStudio(THREE);

const camera = new THREE.PerspectiveCamera(40,1,0.08,100);
const overviewCamera = new THREE.PerspectiveCamera(47,1,0.1,120);
overviewCamera.position.set(10,6,12);
overviewCamera.lookAt(0,1,-2);
overviewCamera.layers.enable(1);

// An independent, inspectable overview camera. It does not affect the shot camera.
const overviewPivot = new THREE.Vector3(0, 1, -2);
const overviewOffset = overviewCamera.position.clone().sub(overviewPivot);
const overviewDefaults = {
 radius: overviewOffset.length(),
 azimuth: Math.atan2(overviewOffset.x, overviewOffset.z),
 elevation: Math.asin(overviewOffset.y / overviewOffset.length())
};
const overviewState = { ...overviewDefaults };
function orientOverview() {
 const horizontal = overviewState.radius * Math.cos(overviewState.elevation);
 overviewCamera.position.set(
   overviewPivot.x + Math.sin(overviewState.azimuth) * horizontal,
   overviewPivot.y + Math.sin(overviewState.elevation) * overviewState.radius,
   overviewPivot.z + Math.cos(overviewState.azimuth) * horizontal
 );
 overviewCamera.lookAt(overviewPivot);
 overviewCamera.updateMatrixWorld();
}
function resetOverview() {
 Object.assign(overviewState, overviewDefaults);
 orientOverview();
 paint();
}
const helper = new THREE.CameraHelper(camera);
helper.setColors(0xd5a27e,0x91aaab,0x85999a,0x607b83,0xa2b8b6);
helper.material.transparent=true;
helper.material.opacity=.42;
helper.material.depthTest=false;
helper.material.toneMapped=false;
helper.layers.set(1);  // 不让取景画面看到自己的机位线框
scene.add(helper);
const cameraBody = new THREE.Mesh(new THREE.BoxGeometry(.31,.23,.47),mat('#b88b6b',.52,.35));
cameraBody.layers.set(1);
scene.add(cameraBody);

function makeRenderer(host, keepDrawingBuffer = false) {
 // Retain the shot canvas only so it can be captured from a direct user click.
 const r = new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:keepDrawingBuffer});
 r.shadowMap.enabled=true;
 r.shadowMap.type=THREE.PCFSoftShadowMap;
 r.setPixelRatio(Math.min(window.devicePixelRatio || 1,2));
 r.outputColorSpace = THREE.SRGBColorSpace;
 r.toneMapping = THREE.ACESFilmicToneMapping;
 r.toneMappingExposure = 1.08;
 host.appendChild(r.domElement);
 return r;
}
let spaceRenderer, shotRenderer;
function resize(renderer,host,cam) {
 const bounds=host.getBoundingClientRect();
 const w=Math.max(2,Math.round(bounds.width)), h=Math.max(2,Math.round(bounds.height));
 const ratio = renderer.getPixelRatio();
 const targetW = Math.floor(w * ratio);
 const targetH = Math.floor(h * ratio);
 if (renderer.domElement.width !== targetW || renderer.domElement.height !== targetH) {
   renderer.setSize(w,h,false);
 }
 if (cam.aspect !== w/h) {
   cam.aspect=w/h;
   cam.updateProjectionMatrix();
 }
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
 const verticalFov = 2*Math.atan(24/(2*state.focal))*180/Math.PI;
 els.shotLabel.textContent=state.focal+' mm · '+state.distance.toFixed(1)+' m · 视角 '+verticalFov.toFixed(1)+'°';
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
 const changed = state.mode !== mode;
 state.mode=mode;
 if (changed) clearCaptures();
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

function renderCaptures() {
 for (const key of ['a','b']) {
   const item = captures[key];
   const frame = key === 'a' ? els.captureFrameA : els.captureFrameB;
   const caption = key === 'a' ? els.captureCaptionA : els.captureCaptionB;
   frame.replaceChildren();
   if (item) {
     const img = document.createElement('img');
     img.src = item.url;
     img.alt = '画面 ' + key.toUpperCase() + '，' + item.label;
     frame.append(img);
     caption.textContent = item.label;
   } else {
     const empty = document.createElement('span');
     empty.textContent = '画面 ' + key.toUpperCase() + ' 尚未保存';
     frame.append(empty);
     caption.textContent = '选择参数后点击“记为 ' + key.toUpperCase() + '”';
   }
 }
}
function clearCaptures() {
 captures.a = null;
 captures.b = null;
 renderCaptures();
 els.captureStatus.textContent = '已清空画面对照；每次切换实验类型也会清空快照。';
}
function captureShot(key) {
 if (!shotRenderer) return;
 try {
   paint(); // render the current camera state before serializing its canvas
   const url = shotRenderer.domElement.toDataURL('image/png');
   if (!url.startsWith('data:image/png')) throw new Error('Canvas capture unavailable');
   captures[key] = {
     url,
     label: (state.mode === 'dolly' ? '推镜 / 变焦' : state.mode === 'angle' ? '机位角度' : '焦距与透视') +
       ' · ' + state.focal + ' mm · ' + state.distance.toFixed(1) + ' m · 高 ' + state.height.toFixed(1) + ' m'
   };
   renderCaptures();
   els.captureStatus.textContent = '已记录画面 ' + key.toUpperCase() +
     '。参数继续变化也不会覆盖已保存画面；可保存另一张并排比较。';
 } catch(error) {
   console.error('无法保存画面对照',error);
   els.captureStatus.textContent = '当前浏览器无法保存 WebGL 画面，请检查浏览器支持或重新加载实验室。';
 }
}
function setupOverviewInteraction() {
 const canvas = spaceRenderer.domElement;
 canvas.style.touchAction = 'none';
 let drag = null;
 canvas.addEventListener('pointerdown',function(event) {
   if (event.pointerType === 'mouse' && event.button !== 0) return;
   drag = { id:event.pointerId, x:event.clientX, y:event.clientY };
   canvas.setPointerCapture(event.pointerId);
 });
 canvas.addEventListener('pointermove',function(event) {
   if (!drag || event.pointerId !== drag.id) return;
   const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
   drag.x = event.clientX; drag.y = event.clientY;
   overviewState.azimuth -= dx * 0.006;
   overviewState.elevation = THREE.MathUtils.clamp(overviewState.elevation + dy * 0.006, 0.1, 1.47);
   orientOverview();
   paint();
 });
 function stopDrag(event) {
   if (drag && event.pointerId === drag.id) drag = null;
 }
 canvas.addEventListener('pointerup',stopDrag);
 canvas.addEventListener('pointercancel',stopDrag);
 canvas.addEventListener('lostpointercapture',function(){drag = null;});
 canvas.addEventListener('wheel',function(event) {
   event.preventDefault();
   overviewState.radius = THREE.MathUtils.clamp(
     overviewState.radius * (event.deltaY > 0 ? 1.09 : 0.91), 6, 40
   );
   orientOverview();
   paint();
 },{passive:false});
 els.spatial.addEventListener('keydown',function(event) {
   const delta = 0.14;
   if (event.key === 'ArrowLeft') overviewState.azimuth -= delta;
   else if (event.key === 'ArrowRight') overviewState.azimuth += delta;
   else if (event.key === 'ArrowUp') overviewState.elevation += delta;
   else if (event.key === 'ArrowDown') overviewState.elevation -= delta;
   else if (event.key === '+' || event.key === '=') overviewState.radius *= 0.91;
   else if (event.key === '-' || event.key === '_') overviewState.radius *= 1.09;
   else return;
   event.preventDefault();
   overviewState.elevation = THREE.MathUtils.clamp(overviewState.elevation,0.1,1.47);
   overviewState.radius = THREE.MathUtils.clamp(overviewState.radius,6,40);
   orientOverview();
   paint();
 });
 els.overviewReset.addEventListener('click',resetOverview);
}
document.getElementById('lab-save-a').addEventListener('click',()=>captureShot('a'));
document.getElementById('lab-save-b').addEventListener('click',()=>captureShot('b'));
document.getElementById('lab-clear-captures').addEventListener('click',clearCaptures);

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
 shotRenderer=makeRenderer(els.shot,true);
 orientOverview();
 setupOverviewInteraction();
 const params = new URLSearchParams(window.location.search);
 const requestedMode = params.get('mode');
 setMode(requestedMode && MODES[requestedMode] ? requestedMode : 'dolly');
 const requestedPreset = params.get('preset');
 if (requestedPreset === '0' || requestedPreset === '1') {
   setPreset(Number(requestedPreset));
 }
 renderCaptures();
 new ResizeObserver(paint).observe(els.spatial);
 new ResizeObserver(paint).observe(els.shot);
} catch(error) {
 console.error('摄影机实验室初始化失败',error);
 els.spatial.innerHTML='<p class="lab-error">无法启动三维视图。请确认浏览器支持 WebGL，并通过本地 HTTP 服务联网运行。</p>';
 els.shot.innerHTML='<p class="lab-error">摄影机取景不可用。</p>';
}
