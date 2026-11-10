/*
 * 卡片渲染 + 取景动画。
 * 每张卡片的动画都从“上一级景别”的取景框推到本级的取景框，
 * 所以相邻两级差多少，是直接看出来的。
 */
(function () {
  var ZOOM_BASE = window.FilmScene.H;

  function formatZoom(h) {
    var z = ZOOM_BASE / h;
    return z < 10 ? z.toFixed(1) : Math.round(z).toString();
  }

  function stageHTML(item, fromCrop) {
    return [
      '<div class="stage" data-demo="shots" tabindex="0" role="button"',
        ' data-from=\'' + JSON.stringify(fromCrop) + '\'',
        ' data-to=\'' + JSON.stringify(item.crop) + '\'',
        ' aria-label="重播' + item.zh + '演示">',
        '<div class="scene-holder">' + window.FilmScene.scene(item.crop) + '</div>',
        '<div class="stage-top">',
          '<span class="chip chip-name">' + item.zh + ' <i>' + item.abbr + '</i></span>',
          '<span class="chip chip-zoom">放大 ×' + formatZoom(fromCrop.h) + '</span>',
        '</div>',
        '<span class="corner c-tl"></span><span class="corner c-tr"></span>',
        '<span class="corner c-bl"></span><span class="corner c-br"></span>',
        '<button class="replay" type="button">↻ 重播</button>',
      '</div>'
    ].join('');
  }

  function cardHTML(item, fromCrop) {
    return [
      '<article class="card" id="shot-' + item.id + '">',
        '<header class="card-head">',
          '<span class="card-no">' + item.no + '</span>',
          '<div class="card-title"><h3>' + item.zh +
            '<span class="card-en">' + item.en + '</span></h3></div>',
          '<span class="card-abbr">' + item.abbr + '</span>',
        '</header>',
        window.FilmLearning.facetHTML('shots', item.id),
        '<p class="card-plain">' + item.plain + '</p>',
        '<div class="card-body">',
          '<div class="stage-wrap">',
            stageHTML(item, fromCrop),
            '<p class="stage-foot">' + item.note + '</p>',
          '</div>',
          '<aside class="card-meta">',
            '<div class="mini-wrap"><span class="mini-label">取景范围</span>' +
              window.FilmScene.minimap(item.crop) + '</div>',
            '<dl class="meta-list">',
              '<div><dt>常见用途</dt><dd>' + item.use + '</dd></div>',
              '<div><dt>可能的表达 · 依语境而变</dt><dd>' + item.mood + '</dd></div>',
              '<div class="meta-caution"><dt>新手上手易混淆</dt><dd>' + item.caution + '</dd></div>',
            '</dl>',
          '</aside>',
        '</div>',
      '</article>'
    ].join('');
  }

  function render(container, items) {
    var html = '';
    for (var i = 0; i < items.length; i++) {
      // 第一级没有“更宽的上一级”，就从下一级往回拉
      var from = i === 0 ? items[1].crop : items[i - 1].crop;
      html += cardHTML(items[i], from);
    }
    container.innerHTML = html;
  }

  function play(stage) {
    var type = stage.getAttribute('data-demo');
    if (type && window.FilmDemos && window.FilmDemos[type]) {
      window.FilmDemos[type](stage);
      return;
    }

    var holder = stage.querySelector('.scene-holder');
    var svg = holder && holder.querySelector('svg');
    if (!svg) return;

    var from, to;
    try {
      from = JSON.parse(stage.getAttribute('data-from'));
      to = JSON.parse(stage.getAttribute('data-to'));
    } catch (err) { return; }

    if (stage._raf) cancelAnimationFrame(stage._raf);
    if (stage._timer) clearTimeout(stage._timer);

    var zoomEl = stage.querySelector('.chip-zoom');
    var keys = ['x', 'y', 'w', 'h'];
    var duration = 1900;

    function setRect(rect) {
      svg.setAttribute('viewBox', keys.map(function (k) { return rect[k]; }).join(' '));
      if (zoomEl) zoomEl.textContent = '放大 ×' + formatZoom(rect.h);
    }

    setRect(from);

    stage._timer = setTimeout(function () {
      var start = null;

      function step(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / duration);
        // easeInOutCubic：起步和收尾都慢，中间快，像真正的推镜
        var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        var rect = {};
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          rect[k] = from[k] + (to[k] - from[k]) * e;
        }
        setRect(rect);

        if (t < 1) {
          stage._raf = requestAnimationFrame(step);
        } else {
          stage._raf = null;
          stage._timer = null;
        }
      }

      stage._raf = requestAnimationFrame(step);
    }, 260);
  }

  window.FilmCards = {
    render: render,
    play: play
  };
})();
