/*
 * 转场演示：A = 黄昏建筑廊道（近景人物），B = 夜里室内（圆窗前的人物）。
 * 两段画面在色彩、亮度、内容上都完全不同，方便专看“怎么换过去的”。
 * jump（跳剪）的 B 用的是同一场景的另一个取景，才能体现“同一个人突然跳一下”。
 */
(function () {
  var A_CROP = { x: 470, y: 150, w: 1500, h: 843.75 };
  var JUMP_CROP = { x: 790, y: 560, w: 1000, h: 562.5 };

  // B：夜里的室内。圆窗里的月亮与 A 的太阳在同一位置、同样大小，给匹配剪辑用。
  function bScene() {
    return [
      '<svg class="ed-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">',
        '<rect x="0" y="0" width="1600" height="900" fill="#101d24"/>',
        '<rect x="0" y="0" width="1600" height="640" fill="#22313a"/>',
        '<path d="M0 0 H190 V900 H0 Z M1120 0 H1600 V900 H1120 Z" fill="#121f26" opacity=".50"/>',
        '<path d="M206 0 V900 M1108 0 V900" stroke="#6a7878" stroke-width="5" opacity=".2"/>',
        '<rect x="0" y="700" width="1600" height="200" fill="#0c171d"/>',
        '<rect x="0" y="686" width="1600" height="18" fill="#536468"/>',

        // 圆窗 + 月亮（与 A 的太阳同位同大）
        '<circle cx="1472" cy="192" r="94" fill="#12232d"/>',
        '<circle cx="1472" cy="192" r="70" fill="#cfe0ff" opacity=".14"/>',
        '<circle cx="1490" cy="172" r="34" fill="#eaf1ff"/>',
        '<g stroke="#7c8b8b" stroke-width="9" fill="none">',
          '<circle cx="1472" cy="192" r="94"/>',
          '<path d="M1472,98 L1472,286 M1378,192 L1566,192"/>',
        '</g>',

        // 桌子
        '<rect x="120" y="660" width="680" height="26" fill="#66594e"/>',
        '<rect x="170" y="686" width="18" height="200" fill="#1b110b"/>',
        '<rect x="736" y="686" width="18" height="200" fill="#1b110b"/>',

        // 台灯的暖光（多层同心圆当柔和的光晕）
        '<circle cx="300" cy="600" r="196" fill="#ffb469" opacity=".05"/>',
        '<circle cx="300" cy="600" r="152" fill="#ffb469" opacity=".05"/>',
        '<circle cx="300" cy="600" r="112" fill="#ffb469" opacity=".06"/>',
        '<circle cx="300" cy="600" r="76" fill="#ffb469" opacity=".07"/>',
        '<ellipse cx="300" cy="662" rx="132" ry="12" fill="#ffb469" opacity=".16"/>',
        '<path d="M258,600 L342,600 L322,556 L278,556 Z" fill="#b48969"/>',
        '<rect x="296" y="600" width="8" height="62" fill="#8d6a45"/>',
        '<rect x="278" y="656" width="44" height="8" rx="3" fill="#8d6a45"/>',

        // 坐在桌边、侧对镜头的人（剪影）
        '<path d="M452,900 L452,596 Q505,550 558,596 L558,900 Z" fill="#05070c"/>',
        '<circle cx="505" cy="500" r="46" fill="#05070c"/>',
        '<path d="M540,628 L648,654 L644,692 L536,666 Z" fill="#05070c"/>',

        // 暗角
        '<rect x="0" y="760" width="1600" height="140" fill="#05070c" opacity=".55"/>',
      '</svg>'
    ].join('');
  }

  /* ---------------- 主演示 ---------------- */

  function stage(item) {
    var kind = item.kind || 'cut';
    var aSVG = window.FilmScene.scene(A_CROP);
    var bSVG = kind === 'jump' ? window.FilmScene.scene(JUMP_CROP) : bScene();
    var anim = JSON.stringify({ kind: kind });

    return [
      '<div class="stage" data-demo="edit" data-anim=\'' + anim + '\' tabindex="0" role="button"',
        ' aria-label="重播' + item.zh + '演示">',
        '<div class="ed-wrap">',
          '<div class="ed-a">' + aSVG + '</div>',
          '<div class="ed-b">' + bSVG + '</div>',
          '<span class="ed-fx"></span>',
          '<span class="ed-edge"></span>',
          '<span class="ed-ring"></span>',
          '<span class="ed-badge">A</span>',
        '</div>',
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

  function clamp(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function smooth(v) { v = clamp(v); return v * v * (3 - 2 * v); }

  function play(stage) {
    var cfg;
    try { cfg = JSON.parse(stage.getAttribute('data-anim')); } catch (e) { return; }
    var kind = cfg.kind || 'cut';

    var aEl = stage.querySelector('.ed-a');
    var bEl = stage.querySelector('.ed-b');
    var fx = stage.querySelector('.ed-fx');
    var edge = stage.querySelector('.ed-edge');
    var ring = stage.querySelector('.ed-ring');
    var badge = stage.querySelector('.ed-badge');
    if (!aEl || !bEl) return;

    if (stage._raf) cancelAnimationFrame(stage._raf);
    if (stage._timer) clearTimeout(stage._timer);

    function reset() {
      aEl.style.opacity = 1;
      bEl.style.opacity = 0;
      bEl.style.clipPath = 'inset(0 100% 0 0)';
      fx.style.opacity = 0;
      edge.style.opacity = 0;
      ring.style.opacity = 0;
      badge.textContent = 'A';
    }

    function showB() {
      bEl.style.opacity = 1;
      aEl.style.opacity = 0;
      badge.textContent = 'B';
    }

    reset();

    var D = 2400;
    var lead = 520;

    stage._timer = setTimeout(function () {
      var start = null;

      function step(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / D);

        if (kind === 'cut' || kind === 'jump') {
          if (t >= 0.5) showB();

        } else if (kind === 'fade') {
          // 先压到全黑，再亮出 B
          var f = t < 0.5 ? t / 0.5 : (1 - t) / 0.5;
          fx.style.opacity = smooth(f);
          if (t >= 0.5) showB();

        } else if (kind === 'dissolve') {
          var k = smooth((t - 0.15) / 0.7);
          aEl.style.opacity = 1 - k;
          bEl.style.opacity = k;
          if (t >= 0.5) badge.textContent = 'B';

        } else if (kind === 'wipe') {
          var w = smooth((t - 0.15) / 0.7);
          bEl.style.opacity = 1;
          bEl.style.clipPath = 'inset(0 ' + ((1 - w) * 100) + '% 0 0)';
          edge.style.left = (w * 100) + '%';
          edge.style.opacity = w > 0.001 && w < 0.999 ? 1 : 0;
          if (w > 0.5) {
            aEl.style.opacity = 0;
            badge.textContent = 'B';
          } else {
            aEl.style.opacity = 1;
          }

        } else if (kind === 'match') {
          // 虚线圆圈先亮起，把两边共同的“圆”指出来，再在中间切过去
          var m = t < 0.38 ? smooth(t / 0.38) : (t > 0.8 ? smooth((1 - t) / 0.2) : 1);
          ring.style.opacity = m;
          if (t >= 0.55) showB();
        }

        if (t < 1) {
          stage._raf = requestAnimationFrame(step);
        } else {
          stage._raf = null;
          stage._timer = null;
        }
      }

      stage._raf = requestAnimationFrame(step);
    }, lead);
  }

  /* ---------------- 小图：两段画面怎么接 ---------------- */

  function mini(kind) {
    if (kind && kind.id) kind = kind.id;
    var svg = '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">';
    var box = 'x="24" y="40" width="118" height="76"';
    var box2 = 'x="178" y="40" width="118" height="76"';

    if (kind === 'cut') {
      svg += '<rect ' + box + ' fill="#e6d6b4"/>' + '<circle cx="83" cy="78" r="14" fill="#b4522f"/>';
      svg += '<rect ' + box2 + ' fill="#1d2840"/>' + '<circle cx="237" cy="78" r="14" fill="#eaf1ff"/>';
      svg += '<path class="d-line" d="M160,30 L160,126"/>';
      svg += '<text class="d-label" x="126" y="146">硬切</text>';
      svg += '<path class="d-path" d="M112,150 L208,150"/>' +
        '<path class="d-head" d="M208,150 l-8,-3 l0,6 Z"/>';

    } else if (kind === 'fade') {
      svg += '<rect ' + box + ' fill="#e6d6b4"/>';
      svg += '<rect x="142" y="40" width="36" height="76" fill="#241f1a"/>';
      svg += '<rect ' + box2 + ' fill="#1d2840"/>';
      svg += '<text class="d-label" x="126" y="134">黑场</text>';
      svg += '<path class="d-path" d="M104,30 L150,30"/>' +
        '<path class="d-path" d="M170,30 L216,30"/>';

    } else if (kind === 'dissolve') {
      svg += '<rect ' + box + ' fill="#e6d6b4"/>';
      svg += '<rect x="86" y="40" width="148" height="76" fill="#1d2840" opacity=".55"/>';
      svg += '<rect ' + box2 + ' fill="#1d2840"/>';
      svg += '<text class="d-label" x="112" y="134">两层交叠</text>';
      svg += '<path class="d-path" d="M84,150 L236,150"/>';

    } else if (kind === 'wipe') {
      svg += '<rect ' + box + ' fill="#e6d6b4"/>';
      svg += '<path d="M178,40 L296,40 L296,116 L150,116 Z" fill="#1d2840"/>';
      svg += '<path class="d-line" d="M150,34 L178,122" stroke-width="2.4"/>';
      svg += '<text class="d-label" x="196" y="146">边界扫过</text>';
      svg += '<path class="d-head" d="M104,146 l14,-4 l0,8 Z"/>';

    } else if (kind === 'jump') {
      svg += '<rect ' + box + ' fill="#e6d6b4"/>' +
        '<circle cx="83" cy="90" r="12" fill="#2b2f35"/>';
      svg += '<rect ' + box2 + ' fill="#e6d6b4"/>' +
        '<circle cx="240" cy="72" r="19" fill="#2b2f35"/>';
      svg += '<path class="d-path" d="M150,84 L172,84"/>';
      svg += '<text class="d-label" x="112" y="146">同一人 · 取景突变</text>';

    } else if (kind === 'match') {
      svg += '<rect ' + box + ' fill="#e6d6b4"/>' +
        '<circle cx="83" cy="78" r="17" fill="#b4522f"/>';
      svg += '<rect ' + box2 + ' fill="#1d2840"/>' +
        '<circle cx="237" cy="78" r="17" fill="#eaf1ff"/>';
      svg += '<circle cx="160" cy="78" r="24" fill="none" stroke="#b4522f" stroke-width="1.4" stroke-dasharray="4 3"/>';
      svg += '<path class="d-path" d="M104,78 L216,78"/>';
      svg += '<text class="d-label" x="104" y="146">图形与位置对齐</text>';
    }

    svg += '</svg>';
    return svg;
  }

  window.FilmDemos = window.FilmDemos || {};
  window.FilmDemos.edit = play;
  window.EditDemo = { stage: stage, mini: mini };
})();
