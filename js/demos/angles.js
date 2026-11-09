/*
 * 机位角度的演示：主画面用 SVG 3D 变换表现机位姿态，
 * 小图是机位侧视图（相机高度 + 视线），让“为什么看起来是这样”一眼可见。
 */
(function () {
  function tf(p) {
    return 'perspective(1100px) rotateX(' + p.rx + 'deg) rotateZ(' + p.rz +
      'deg) scale(' + p.s + ') translate(' + p.tx + '%, ' + p.ty + '%)';
  }

  // 过肩：前景人物的后脑勺与肩膀，从左侧压进画面
  function otsOverlay() {
    return '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<g fill="#2b2f35">' +
        '<ellipse cx="118" cy="392" rx="122" ry="146"/>' +
        '<rect x="60" y="500" width="118" height="170"/>' +
        '<path d="M0,900 L0,660 Q80,548 230,580 Q340,604 376,744 L396,900 Z"/>' +
      '</g>' +
      '<path d="M0,660 Q80,548 230,580 Q340,604 376,744" fill="none" stroke="#efe6d3" ' +
      'stroke-width="2" opacity=".32" vector-effect="non-scaling-stroke"/>' +
      '</svg>';
  }

  // 主观视角：画面底部露出自己的手
  function povOverlay() {
    return '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<g fill="#2b2f35">' +
        '<path d="M120,900 C136,812 196,772 306,780 C356,784 382,820 364,858 C346,896 260,900 120,900 Z"/>' +
        '<path d="M300,792 C348,770 372,798 344,818 Z"/>' +
        '<g transform="translate(1600,0) scale(-1,1)">' +
          '<path d="M120,900 C136,812 196,772 306,780 C356,784 382,820 364,858 C346,896 260,900 120,900 Z"/>' +
          '<path d="M300,792 C348,770 372,798 344,818 Z"/>' +
        '</g>' +
      '</g>' +
      '<path d="M120,900 C136,812 196,772 306,780 C356,784 382,820 364,858" fill="none" stroke="#efe6d3" ' +
      'stroke-width="2" opacity=".26" vector-effect="non-scaling-stroke"/>' +
      '<path d="M1480,900 C1464,812 1404,772 1294,780 C1244,784 1218,820 1236,858" fill="none" stroke="#efe6d3" ' +
      'stroke-width="2" opacity=".26" vector-effect="non-scaling-stroke"/>' +
      '</svg>';
  }

  function stage(item) {
    var view = item.view;
    var sceneSVG = view.type === 'top' ? window.FilmScene.topView(view.crop) : window.FilmScene.scene(view.crop);
    var anim = JSON.stringify({ from: view.from, to: view.to, overlay: item.overlay || '' });

    return [
      '<div class="stage" data-demo="angle" data-anim=\'' + anim + '\' tabindex="0" role="button"',
        ' aria-label="重播' + item.zh + '演示">',
        '<div class="scene-holder"><div class="angle-layer" style="transform:' + tf(view.to) + '">' +
          sceneSVG + '</div></div>',
        item.overlay === 'ots' ? '<div class="stage-fore">' + otsOverlay() + '</div>' : '',
        item.overlay === 'pov' ? '<div class="stage-fore">' + povOverlay() + '</div>' : '',
        '<div class="stage-top">',
          '<span class="chip chip-name">' + item.zh + ' <i>' + item.abbr + '</i></span>',
          '<span class="chip chip-zoom">' + item.cam + '</span>',
        '</div>',
        '<span class="corner c-tl"></span><span class="corner c-tr"></span>',
        '<span class="corner c-bl"></span><span class="corner c-br"></span>',
        '<button class="replay" type="button">↻ 重播</button>',
      '</div>'
    ].join('');
  }

  /* ---------------- 侧视示意图 ---------------- */

  function person(x, gy, s) {
    return '<g transform="translate(' + x + ',' + gy + ') scale(' + s + ')">' +
      '<circle class="d-sub" cx="0" cy="-64" r="10"/>' +
      '<path class="d-sub" d="M-6,-54 L6,-54 L12,0 L4,0 L0,-26 L-4,0 L-12,0 Z"/>' +
      '</g>';
  }

  function camera(x, y, gy) {
    return '<g class="d-cam">' +
      '<rect x="' + (x - 16) + '" y="' + (y - 9) + '" width="26" height="18" rx="2"/>' +
      '<path d="M' + (x + 10) + ',' + (y - 4) + ' L' + (x + 24) + ',' + (y - 10) +
        ' L' + (x + 24) + ',' + (y + 10) + ' L' + (x + 10) + ',' + (y + 4) + ' Z"/>' +
      '<path d="M' + (x - 8) + ',' + (y + 9) + ' L' + (x - 16) + ',' + gy +
        ' M' + (x - 8) + ',' + (y + 9) + ' L' + (x) + ',' + gy + '" fill="none" stroke="#2b2f35" stroke-width="2"/>' +
      '</g>';
  }

  function sight(x1, y1, x2, y2) {
    return '<path class="d-sight" d="M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2 + '"/>' +
      '<circle class="d-accent" cx="' + x2 + '" cy="' + y2 + '" r="2.6"/>';
  }

  function diagram(kind) {
    if (kind && kind.id) kind = kind.id;
    var g = 150;
    var svg = '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">';
    svg += '<path class="d-line" d="M22,' + g + ' L298,' + g + '"/>';

    if (kind === 'eye') {
      svg += '<path class="d-sight" d="M22,86 L298,86"/>';
      svg += '<text class="d-label" x="24" y="76">眼高 · 视线齐平</text>';
      svg += person(210, g, 1) + camera(56, 86, g) + sight(80, 86, 200, 86);

    } else if (kind === 'high') {
      svg += '<text class="d-label" x="24" y="34">高于头顶</text>';
      svg += '<path class="d-sight" d="M72,46 L200,84"/>';
      svg += '<path class="d-line" d="M56,46 L56,150" stroke-dasharray="3 5" opacity=".55"/>';
      svg += person(210, g, 1) + camera(56, 46, g) + sight(80, 46, 200, 84);

    } else if (kind === 'low') {
      svg += '<text class="d-label" x="24" y="140">低于胸口</text>';
      svg += '<path class="d-sight" d="M80,132 L200,94"/>';
      svg += person(210, g, 1) + camera(56, 132, g) + sight(80, 132, 200, 94);

    } else if (kind === 'bird') {
      svg += '<text class="d-label" x="146" y="28">正上方</text>';
      svg += '<path class="d-sight" d="M210,40 L210,76"/>';
      svg += '<g class="d-cam"><rect x="196" y="20" width="28" height="16" rx="4"/>' +
        '<path d="M200,36 L206,46 L214,46 L220,36 Z"/></g>';
      svg += person(210, g, 1);
      svg += '<path class="d-line" d="M262,70 L292,70 M262,78 L292,78" opacity=".55"/>' +
        '<text class="d-label" x="262" y="92">只看到头顶</text>';

    } else if (kind === 'dutch') {
      svg += '<g transform="rotate(-14 226 78)">' +
        '<rect x="188" y="42" width="76" height="62" fill="none" stroke="#b4522f" stroke-width="2"/>' +
        '<path d="M188,74 L264,74" stroke="#b4522f" stroke-width="1" stroke-dasharray="3 3" opacity=".55"/>' +
        '</g>';
      svg += '<text class="d-label" x="24" y="34">相机水平 · 画面倾斜</text>';
      svg += person(210, g, 1) + camera(56, 86, g) + sight(80, 86, 200, 86);

    } else if (kind === 'ots') {
      svg += '<text class="d-label" x="24" y="34">越过前景肩膀</text>';
      svg += person(96, g, 1.45) + person(250, g, 0.92);
      svg += camera(34, 96, g) + sight(60, 96, 240, 86);
      svg += '<path class="d-sight" d="M96,84 L118,84" opacity=".5"/>';

    } else if (kind === 'pov') {
      svg += '<text class="d-label" x="24" y="34">机位就是人物眼睛</text>';
      svg += person(96, g, 1);
      svg += '<g class="d-cam"><rect x="96" y="78" width="20" height="14" rx="3"/>' +
        '<path d="M116,81 L128,76 L128,94 L116,89 Z"/></g>';
      svg += sight(128, 85, 296, 85);
    }

    svg += '</svg>';
    return svg;
  }

  function play(stage) {
    var cfg;
    try { cfg = JSON.parse(stage.getAttribute('data-anim')); } catch (e) { return; }
    var layer = stage.querySelector('.angle-layer');
    if (!layer) return;

    if (stage._raf) cancelAnimationFrame(stage._raf);
    if (stage._timer) clearTimeout(stage._timer);

    var from = cfg.from;
    var to = cfg.to;
    var damp = cfg.overlay === 'pov';
    var dur = 1900;
    var keys = ['rx', 'rz', 's', 'tx', 'ty'];

    function apply(p) { layer.style.transform = tf(p); }

    apply(from);

    stage._timer = setTimeout(function () {
      var start = null;

      function step(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / dur);
        var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        var p = {};
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          p[k] = from[k] + (to[k] - from[k]) * e;
        }
        if (damp) {
          var amp = Math.sin(t * Math.PI);
          p.rx += Math.sin(t * 21) * 1.1 * amp;
          p.rz += Math.sin(t * 17 + 1) * 0.6 * amp;
          p.tx += Math.sin(t * 13) * 0.5 * amp;
        }
        apply(p);

        if (t < 1) {
          stage._raf = requestAnimationFrame(step);
        } else {
          stage._raf = null;
          stage._timer = null;
        }
      }

      stage._raf = requestAnimationFrame(step);
    }, 300);
  }

  window.FilmDemos = window.FilmDemos || {};
  window.FilmDemos.angle = play;

  window.AngleDemo = { stage: stage, diagram: diagram };
})();
