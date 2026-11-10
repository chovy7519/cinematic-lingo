import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const categories = [
  ['shots',8], ['angles',7], ['moves',9],
  ['frame',8], ['light',8], ['edit',6]
];
const index = readFileSync('index.html','utf8');
const lab = readFileSync('lab.html','utf8');

function requireFile(file) {
 assert.ok(existsSync(file), '缺失文件：'+file);
}
for (const f of ['styles.css','js/lab.js','js/learning.js','docs/CONTENT_AUDIT.md','docs/V0.2_CONTENT_REVIEW.md']) requireFile(f);
assert.match(index,/href="lab\.html"/,'词典首页缺少实验室入口');
assert.match(index,/id="learning"/,'缺少学习区锚点');
assert.match(index,/src="js\/learning\.js"/,'缺少学习区脚本');
assert.match(lab,/type="module" src="js\/lab\.js"/,'实验室入口缺少模块脚本');
assert.match(lab,/id="lab-spatial"/,'缺少空间视图');
assert.match(lab,/id="lab-shot"/,'缺少取景视图');

const terms = new Set();
const validAnchors = new Set();
let total = 0;
for (const [name,count] of categories) {
 const file='js/data/'+name+'.js';
 requireFile(file);
 const content=readFileSync(file,'utf8');
 const items=[...content.matchAll(/\n    \{\n      id: '([^']+)',\n      no: '[^']+',/g)];
 assert.equal(items.length,count,`${file} 中的术语数与目录不一致`);
 for(const [,id] of items) {
  const key=name+':'+id;
  assert.ok(!terms.has(key),'术语 ID 重复：'+key);
  terms.add(key);
  validAnchors.add('#'+(name==='shots'?'shot-':'')+(name==='shots'?'':name+'-')+id);
 }
 total+=items.length;
}
assert.equal(total,46,'总术语数应保持为 46');

const context={window:{}};
vm.runInNewContext(readFileSync('js/learning.js','utf8'),context,{filename:'js/learning.js'});
const learning=context.window.FilmLearning;
assert.ok(learning,'学习模块没有导出 FilmLearning');
const facetKeys=Object.keys(learning.FACETS);
assert.equal(facetKeys.length,46,'知识维度标签应该一一覆盖 46 个术语');
assert.deepEqual(new Set(facetKeys),terms,'知识维度标签与源数据的 ID 不一致');
for (const key of facetKeys) {
 const labels=learning.FACETS[key];
 assert.ok(Array.isArray(labels)&&labels.length===2&&labels.every(x=>typeof x==='string'&&x.length>0),'标签不完整：'+key);
}
assert.equal(learning.EXERCISES.length,4,'应保留四道关键概念辨析练习');
const exerciseIds=new Set();
for(const ex of learning.EXERCISES) {
 assert.ok(ex.id&&!exerciseIds.has(ex.id),'练习 ID 不唯一：'+ex.id);
 exerciseIds.add(ex.id);
 assert.ok(typeof ex.question==='string'&&ex.question.trim()&&typeof ex.explanation==='string'&&ex.explanation.trim(),'题目或解释缺失：'+ex.id);
 assert.ok(ex.choices.length>=2&&Number.isInteger(ex.correct)&&ex.correct>=0&&ex.correct<ex.choices.length,'选项/正确答案错误：'+ex.id);
 assert.ok(ex.links.length>=2,'缺少相关术语跳转：'+ex.id);
 for(const link of ex.links) {
  assert.ok(link.label&&link.href,'练习引用缺失：'+ex.id);
  if(link.href.startsWith('#'))assert.ok(validAnchors.has(link.href),'练习指向不存在的术语：'+link.href);
  else assert.equal(link.href,'lab.html','存在未知外部/页面地址：'+link.href);
 }
}
for (const [,src] of index.matchAll(/<script\s+src="([^"]+)"/g)) requireFile(src);
for (const [,src] of lab.matchAll(/<script\s+type="module"\s+src="([^"]+)"/g)) requireFile(src);
console.log('PASS: 46 个术语、46 组知识维度、4 道辨析题、关联卡片和页面脚本校验通过');
