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
  'styles.css', 'favicon.svg', 'js/facets.js',
  'js/lab.js', 'js/lab-loader.js', 'docs/CONTENT_AUDIT.md',
  'docs/V0.2_CONTENT_REVIEW.md', 'CHANGELOG.md'
]) requireFile(path);

assert.match(index, /href="lab\.html"/, '词典首页缺少实验室入口');
assert.match(app, /href="lab\.html"/, '目录缺少独立实验室入口');
assert.match(index, /src="js\/facets\.js"/, '词典缺少标签脚本');
assert.doesNotMatch(index, /id="learning"|js\/learning\.js/, '首页仍包含答题功能');
assert.doesNotMatch(app, /FilmLearning|#learning|概念辨析/, '首页脚本仍含答题依赖');
assert.ok(!existsSync('js/learning.js'), '旧版答题脚本未清理');
assert.match(lab, /type="module" src="js\/lab-loader\.js"/, '实验室缺少模块加载脚本');
assert.match(index, /href="favicon\.svg"/, '首页缺少站点图标');
assert.match(lab, /href="favicon\.svg"/, '实验室缺少站点图标');
assert.match(readFileSync('js/lab-loader.js', 'utf8'), /import\('\.\/lab\.js'\)/, '实验室加载器没有导入三维脚本');
assert.match(lab, /id="lab-spatial"/, '缺少空间视图');
assert.match(lab, /id="lab-shot"/, '缺少取景视图');

const terms = new Set();
let total = 0;
for (const [name, expected] of categories) {
  const path = 'js/data/' + name + '.js';
  requireFile(path);
  const content = readFileSync(path, 'utf8');
  const items = [...content.matchAll(/\n    \{\n      id: '([^']+)',\n      no: '[^']+',/g)];
  assert.equal(items.length, expected, path + ' 中的术语数量不一致');
  for (const [, id] of items) {
    const key = name + ':' + id;
    assert.ok(!terms.has(key), '术语 ID 重复：' + key);
    terms.add(key);
  }
  total += items.length;
}
assert.equal(total, 46, '术语总数应为 46');

const context = { window: {} };
vm.runInNewContext(readFileSync('js/facets.js', 'utf8'), context, {filename: 'js/facets.js'});
const facets = context.window.FilmFacets;
assert.ok(facets && typeof facets.facetHTML === 'function', '词典标签模块未正确导出');
const keys = Object.keys(facets.FACETS);
assert.equal(keys.length, 46, '知识标签数量必须等于 46');
assert.deepEqual(new Set(keys), terms, '知识标签未与现有词典全部对应');
for (const key of keys) {
  const labels = facets.FACETS[key];
  assert.ok(Array.isArray(labels) && labels.length === 2 &&
    labels.every(x => typeof x === 'string' && x.length > 0),
    '标签数据不完整：' + key);
}
for (const [, src] of index.matchAll(/<script\s+src="([^"]+)"/g)) requireFile(src);
for (const [, src] of lab.matchAll(/<script\s+type="module"\s+src="([^"]+)"/g)) requireFile(src);
console.log('PASS: 46 条术语及对应标签、词典入口、3D 实验室入口、脚本路径；概念答题已清理。');
