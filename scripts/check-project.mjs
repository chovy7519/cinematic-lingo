import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const categories = [
  ['shots',8], ['angles',7], ['moves',9],
  ['frame',8], ['light',8], ['edit',6]
];
const index = readFileSync('index.html','utf8');
const lab = readFileSync('lab.html','utf8');

function requireFile(file) {
 assert.ok(existsSync(file), '缺失文件：'+file);
}
requireFile('styles.css');
requireFile('js/lab.js');
requireFile('docs/CONTENT_AUDIT.md');
assert.match(index,/href="lab\.html"/,'词典主页缺少实验室入口');
assert.match(lab,/type="module" src="js\/lab\.js"/,'实验室入口缺少模块脚本');
assert.match(lab,/id="lab-spatial"/,'缺少空间视图');
assert.match(lab,/id="lab-shot"/,'缺少取景视图');

let total=0;
for (const [name,count] of categories) {
 const file='js/data/'+name+'.js';
 requireFile(file);
 const content=readFileSync(file,'utf8');
 const items=[...content.matchAll(/\n\s+id: '[^']+',\s*\n\s+no: '[^']+',/g)];
 assert.equal(items.length,count,`${file} 中的术语数与目录不一致`);
 total+=items.length;
}
assert.equal(total,46,'总术语数应保持为 46');

for (const [,src] of index.matchAll(/<script\s+src="([^"]+)"/g)) requireFile(src);
for (const [,src] of lab.matchAll(/<script\s+type="module"\s+src="([^"]+)"/g)) requireFile(src);
console.log('PASS：6 分类 / 46 条术语、页面入口与脚本路径均通过静态检查');
