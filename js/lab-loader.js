// 独立捕获模块加载错误，包括外部 Three.js 无法下载的情况。
import('./lab.js').catch((error) => {
  console.error('摄影机实验室加载失败', error);
  for (const id of ['lab-spatial', 'lab-shot']) {
    const message = document.createElement('p');
    message.className = 'lab-error';
    message.setAttribute('role', 'alert');
    message.textContent = '摄影机实验室加载失败。请检查网络连接后刷新页面，或确认浏览器支持 JavaScript 和 WebGL。';
    document.getElementById(id).replaceChildren(message);
  }
});
