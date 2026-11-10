import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const categories = [
  ['shots', 8], ['angles', 7], ['moves', 9],
  ['frame', 8], ['light', 8], ['edit', 6]
];
const index = readFileSync('index.html', 'utf8');
const lab = readFileSync('lab.html', 'utf8');
const app = readFileSync('js/app.js', 'utf8');

function requireFile(path) {
  assert.ok(existsSync(path), '缺失文件：' + path);
}
for (const path of [
  'styles.css', 'art-direction.css', 'favicon.svg', 'js/facets.js', 'js/dictionary-tools.js', 'js/studio-set.js', 'docs/V0.4_ART_DIRECTION.md',
  'js/lab.js', 'js/lab-loader.js', 'js/studio-set.js', 'js/character-maquette.js', 'docs/CONTENT_AUDIT.md',
  'docs/V0.2_CONTENT_REVIEW.md', 'CHANGELOG.md'
]) requireFile(path);

// Only two user-facing modules: dictionary and camera lab. No quiz system.
assert.match(index, /href="lab\.html"/, '词典首页缺少实验室入口');
assert.match(index, /href="art-direction\.css"/, '词典未加载摄影美术体系');
assert.match(lab, /href="art-direction\.css"/, '实验室未加载摄影美术体系');
const setSource = readFileSync('js/studio-set.js','utf8');
assert.match(setSource, /export function createStudio\(THREE\)/,'摄影棚几何模块没有导出');
assert.match(readFileSync('js/lab.js','utf8'), /import \{ createStudio \} from '\.\/studio-set\.js'/,
  '摄影机没有加载独立美术场景');
const atlas = readFileSync('js/scene.js','utf8');
assert.match(atlas, /s-subject/, '词典主视觉丢失动画的人物锚点');
assert.match(atlas, /@@UID@@/, 'SVG 场景缺少独立渐变 ID，多个画面会冲突');
assert.match(atlas, /class="s-sun" cx="1850" cy="330"/,
  '主视觉太阳偏移会破坏“匹配剪辑”的日夜画面对应');
const editDemoSource=readFileSync('js/demos/edit.js','utf8');
assert.match(editDemoSource, /cx="1472" cy="192" r="94"/,
  '转场夜景的圆窗与 A 镜头太阳位置不再匹配');
assert.equal(Math.round((1850-470)/1500*1600),1472,'镜头匹配 X 坐标错误');
assert.equal(Math.round((330-150)/843.75*900),192,'镜头匹配 Y 坐标错误');

assert.match(app, /href="lab\.html"/, '词典侧栏缺少实验室入口');
assert.match(index, /src="js\/facets\.js"/, '词典缺少知识标签脚本');
assert.match(index, /id="term-search"/, '缺少术语查找输入框');
assert.match(index, /id="term-search-status"/, '缺少搜索状态提示');
assert.match(index, /id="compare-panel"/, '缺少并排对照容器');
assert.match(index, /id="compare-tray"/, '缺少并排对照选择条');
assert.match(index, /src="js\/dictionary-tools\.js"[\s\S]*src="js\/app\.js"/,
  '词典工具脚本应该在页面装配脚本之前加载');
assert.match(app, /FilmDictionaryTools\.init\(\)/, '词典工具没有完成初始化');
assert.doesNotMatch(index, /id="learning"|js\/learning\.js/, '首页仍有旧的答题模块');
assert.doesNotMatch(app, /FilmLearning|#learning|概念辨析/, '主页面脚本仍有测验依赖');
assert.ok(!existsSync('js/learning.js'), '旧版测验脚本未清理');

// Camera lab structure and screenshot/orbit wiring.
assert.match(lab, /type="module" src="js\/lab-loader\.js"/, '实验室缺少模块加载脚本');
assert.match(index, /href="favicon\.svg"/, '首页缺少站点图标');
assert.match(lab, /href="favicon\.svg"/, '实验室缺少站点图标');
assert.match(readFileSync('js/lab-loader.js','utf8'), /import\('\.\/lab\.js'\)/,
  '实验室模块加载器没有导入 Three.js 实验页面');
for (const id of ['lab-spatial', 'lab-shot', 'lab-overview-reset',
  'lab-save-a', 'lab-save-b', 'lab-clear-captures', 'lab-capture-a',
  'lab-capture-b', 'lab-capture-status']) {
  assert.ok(lab.includes('id="' + id + '"'), '实验室缺少控件：' + id);
}
const studioSource = readFileSync('js/studio-set.js','utf8');
const characterSource = readFileSync('js/character-maquette.js','utf8');
assert.match(studioSource, /import\s*\{\s*createCharacter\s*\}\s*from/, '摄影棚场景未导入独立角色模块');
assert.match(studioSource, /createCharacter\(THREE,scene\)/, '摄影棚没有装配角色模型');
assert.match(characterSource, /one-piece-sculpted-head/, '角色没有连续雕塑化头部网格');
const dictionaryScene = readFileSync('js/scene.js','utf8');
assert.match(dictionaryScene, /face-side-@@UID@@/, '词典人物缺少面部明暗体块');
const labScript = readFileSync('js/lab.js', 'utf8');
assert.match(labScript, /function setupOverviewInteraction\(\)/, '缺少空间观察交互');
assert.match(labScript, /function captureShot\(key\)/, '缺少 A\/B 画面捕获');
assert.match(labScript, /preserveDrawingBuffer:keepDrawingBuffer/, '缺少捕获用绘图缓冲区配置');

// Every term and visible facet must still be present.
const terms = new Set();
let total = 0;
for (const [name, expected] of categories) {
  const path = 'js/data/' + name + '.js';
  requireFile(path);
  const source = readFileSync(path, 'utf8');
  const items = [...source.matchAll(/\n    \{\n      id: '([^']+)',\n      no: '[^']+',/g)];
  assert.equal(items.length, expected, path + ' 中术语数量不一致');
  for (const [, id] of items) {
    const key = name + ':' + id;
    assert.ok(!terms.has(key), '术语 ID 重复：' + key);
    terms.add(key);
  }
  total += items.length;
}
assert.equal(total, 46, '术语总数应当为 46');
const context = { window: {} };
vm.runInNewContext(readFileSync('js/facets.js','utf8'), context, { filename:'js/facets.js' });
const facets = context.window.FilmFacets;
assert.ok(facets && typeof facets.facetHTML === 'function', '词典标签模块没有导出');
const keys = Object.keys(facets.FACETS);
assert.equal(keys.length, 46, '词典知识标签数量不完整');
assert.deepEqual(new Set(keys), terms, '知识标签与术语 ID 没有完全对应');
for (const key of keys) {
  const labels = facets.FACETS[key];
  assert.ok(Array.isArray(labels) && labels.length === 2 &&
    labels.every(v => typeof v === 'string' && v.length > 0),
    '术语标签格式错误：' + key);
}

// Pure search matcher tests do not need browser DOM.
vm.runInNewContext(readFileSync('js/dictionary-tools.js','utf8'), context, { filename:'js/dictionary-tools.js' });
const finder = context.window.FilmDictionaryTools;
assert.ok(finder && typeof finder.init === 'function', '搜索与并排对照模块没有导出');
assert.equal(finder.normalize('ＰＯＶ　Shot'), 'pov shot', '全角英文字母未规范化');
assert.equal(finder.matches('Push In 推镜 Dolly', 'push'), true, '英文查找失败');
assert.equal(finder.matches('Low Angle 仰拍', '仰拍'), true, '中文查找失败');
assert.equal(finder.matches('Close Up 特写', 'close 特写'), true, '多词查找失败');
assert.equal(finder.matches('Orbit 环绕', 'pan'), false, '无关术语误匹配');
for (const [, src] of index.matchAll(/<script\s+src="([^"]+)"/g)) requireFile(src);
for (const [, src] of lab.matchAll(/<script\s+type="module"\s+src="([^"]+)"/g)) requireFile(src);
console.log('PASS: 46 条术语、搜索匹配和对照入口、摄影机观察与 A/B 截图结构、脚本引用均通过静态检查。');
