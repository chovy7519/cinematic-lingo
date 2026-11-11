/*
 * 灯光演示：同一张人像，用可插值的光位 / 光比 / 光质参数切换布光。
 * 高光与阴影是两个径向渐变叠层（screen / multiply），
 * 背后还有光晕、轮廓光和眼窝阴影，全部随参数一起动。
 */
(function () {
  var D = { lx: 800, ly: 260, glow: .35, dark: .08, halo: 0, rim: 0, eyes: 0, upper: 0, bg: 0, lift: 0, soft: .85 };

  function merge(base, extra) {
    var o = {};
    for (var k in base) o[k] = base[k];
    if (extra) for (var j in extra) o[j] = extra[j];
    return o;
  }

  function bust(uid) {
    return '<svg class="light-scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="lg-glow-' + uid + '" gradientUnits="userSpaceOnUse" cx="800" cy="260" r="600">' +
          '<stop class="lg-s0" offset="0" stop-color="#fff7e2" stop-opacity=".96"/>' +
          '<stop class="lg-s1" offset=".5" stop-color="#fff0cb" stop-opacity=".42"/>' +
          '<stop class="lg-s2" offset="1" stop-color="#fff0cb" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<radialGradient id="lg-dark-' + uid + '" gradientUnits="userSpaceOnUse" cx="800" cy="420" r="700">' +
          '<stop class="ld-s0" offset="0" stop-color="#0b0705" stop-opacity=".95"/>' +
          '<stop class="ld-s1" offset=".5" stop-color="#0b0705" stop-opacity=".55"/>' +
          '<stop class="ld-s2" offset="1" stop-color="#0b0705" stop-opacity="0"/>' +
        '</radialGradient>' +
      '</defs>' +

      '<rect class="lt-room" x="0" y="0" width="1600" height="900"/>' +
      '<path d="M110 0 H330 V900 H110 Z M1290 0 H1480 V900 H1290 Z" fill="#45545a" opacity=".16"/>' +
      '<path d="M370 0 V900 M1230 0 V900" fill="none" stroke="#a4afa7" opacity=".12" stroke-width="4"/>' +
      '<rect class="lt-floor" x="0" y="760" width="1600" height="140"/>' +
      '<rect class="lt-bgshade" x="0" y="0" width="1600" height="900" opacity="0"/>' +
      '<circle class="lt-halo" cx="800" cy="320" r="240" opacity="0"/>' +

      '<g class="lt-subject">' +
        '<path class="lt-cloth" d="M470,900 Q480,660 620,600 L980,600 Q1120,660 1130,900 Z"/>' +
        '<rect class="lt-skin" x="744" y="490" width="112" height="130" rx="8"/>' +
        '<path class="lt-hair" d="M645 348 Q627 212 735 171 Q798 146 876 182 Q970 227 951 358 L931 345 Q907 246 821 239 Q720 237 663 356 Z"/>' +
        '<path class="lt-skin" d="M799 189 C891 189 949 257 942 357 C935 467 893 527 802 540 C710 527 657 462 660 354 C663 258 709 193 799 189 Z"/>' +
        '<path class="lt-hair" d="M654 344 Q648 229 742 192 Q801 171 867 204 Q924 234 939 315 Q888 259 835 258 Q727 241 654 344 Z"/>' +
        '<path d="M668 347 Q679 252 743 220 Q705 288 710 359 Z" fill="#6f7270" opacity=".14"/>' +
        '<path d="M715 356 Q741 342 768 356" style="fill:none;stroke:#52433d;stroke-width:8;stroke-linecap:round"/>' +
        '<path d="M830 356 Q857 342 886 356" style="fill:none;stroke:#52433d;stroke-width:8;stroke-linecap:round"/>' +
        '<path class="lt-line" d="M712 315 Q742 308 772 318 M828 318 Q855 308 888 314"/>' +
        '<path class="lt-line" d="M801 346 L789 433 Q802 443 816 431"/>' +
        '<path class="lt-line" d="M771 470 Q802 475 833 468"/>' +
        '<path d="M682 599 Q730 653 801 655 L757 733 Z" fill="#5a686d" opacity=".56"/>' +
        '<path d="M918 599 Q871 653 801 655 L847 733 Z" fill="#43555a" opacity=".6"/>' +
        '<path class="lt-cloth" d="M700 600 Q800 646 900 600 L900 616 Q801 660 700 616 Z"/>' +
      '</g>' +

      '<ellipse class="lt-shadow lt-eyes" cx="742" cy="352" rx="44" ry="24" opacity="0"/>' +
      '<ellipse class="lt-shadow lt-eyes" cx="858" cy="352" rx="44" ry="24" opacity="0"/>' +
      '<ellipse class="lt-shadow lt-upper" cx="800" cy="290" rx="170" ry="138" opacity="0"/>' +

      '<rect class="lt-amb" x="0" y="0" width="1600" height="900" opacity="0"/>' +
      '<rect class="lt-glow" x="0" y="0" width="1600" height="900" fill="url(#lg-glow-' + uid + ')" opacity="0"/>' +
      '<rect class="lt-dark" x="0" y="0" width="1600" height="900" fill="url(#lg-dark-' + uid + ')" opacity="0"/>' +

      '<g class="lt-rims" opacity="0">' +
        '<path class="lt-rim" d="M800 188 C894 188 949 258 943 357 C934 467 891 532 800 542 C709 524 657 460 659 352 C660 259 710 190 800 188 Z"/>' +
        '<path class="lt-rim" d="M470,900 Q480,660 620,600 L980,600 Q1120,660 1130,900"/>' +
      '</g>' +

      '<g class="lt-sun" transform="translate(800,260)">' +
        '<circle cx="0" cy="0" r="19"/>' +
        '<path class="lt-sun-rays" d="M0,-31 L0,-42 M0,31 L0,42 M-31,0 L-42,0 M31,0 L42,0 ' +
          'M-22,-22 L-30,-30 M22,-22 L30,-30 M-22,22 L-30,30 M22,22 L30,30"/>' +
      '</g>' +
      '</svg>';
  }

  function stage(item) {
    var id = 'light-' + item.id;
    var from = merge(D, item.light.from);
    var to = merge(D, item.light.to);
    var cfg = { from: from, to: to, uid: item.id, dur: item.dur || 2400 };

    return [
      '<div class="stage" data-demo="light" data-anim=\'' + JSON.stringify(cfg) + '\' tabindex="0" role="button"',
        ' aria-label="重播' + item.zh + '演示">',
        '<div class="scene-holder"><div class="light-layer">' + bust(id) + '</div></div>',
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

  /* ---------------- 小图：光位示意 ---------------- */

  function half(cx, cy, r, dir) {
    if (dir === 'right') return 'M' + cx + ',' + (cy - r) + ' A' + r + ',' + r + ' 0 0 1 ' + cx + ',' + (cy + r) + ' Z';
    if (dir === 'left') return 'M' + cx + ',' + (cy - r) + ' A' + r + ',' + r + ' 0 0 0 ' + cx + ',' + (cy + r) + ' Z';
    if (dir === 'bottom') return 'M' + (cx - r) + ',' + cy + ' A' + r + ',' + r + ' 0 0 0 ' + (cx + r) + ',' + cy + ' Z';
    return 'M' + (cx - r) + ',' + cy + ' A' + r + ',' + r + ' 0 0 1 ' + (cx + r) + ',' + cy + ' Z';
  }

  function mini(kind) {
    if (kind && kind.id) kind = kind.id;

    var sun = { x: 160, y: 18 };
    var dir = 'bottom';
    var halo = false;
    var full = false;
    var dark = true;

    if (kind === 'side') { sun.x = 34; sun.y = 74; dir = 'right'; }
    else if (kind === 'back') { sun.x = 288; sun.y = 44; dir = 'right'; halo = true; full = true; }
    else if (kind === 'top') { sun.x = 160; sun.y = 14; dir = 'bottom'; }
    else if (kind === 'bottom') { sun.x = 160; sun.y = 168; dir = 'top'; }
    else if (kind === 'rim') { sun.x = 286; sun.y = 52; dir = 'left'; halo = true; full = true; }
    else if (kind === 'soft') { sun.x = 42; sun.y = 66; dir = 'right'; }
    else if (kind === 'key') { sun.x = 46; sun.y = 58; dir = 'right'; }

    var svg = '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<path class="d-line" d="M112,152 Q160,132 208,152"/>' +
      '<circle class="d-line" cx="160" cy="88" r="32"/>';

    if (halo) svg += '<circle class="d-accent" cx="160" cy="88" r="42" opacity=".12"/>';
    if (dark && full) svg += '<circle class="d-sub" opacity=".22" cx="160" cy="88" r="32"/>';
    else if (dark) svg += '<path class="d-sub" opacity=".22" d="' + half(160, 88, 32, dir) + '"/>';

    svg += '<path class="d-sight" d="M' + sun.x + ',' + sun.y + ' L160,88"/>';
    svg += '<circle class="d-accent" cx="' + sun.x + '" cy="' + sun.y + '" r="5"/>';

    if (kind === 'soft') {
      svg += '<path class="d-frame" d="M' + (160 - 32) + ',88 A32,32 0 0 1 160,56" opacity=".5"/>';
    }

    return svg + '</svg>';
  }

  /* ---------------- 播放 ---------------- */

  function play(stage) {
    var cfg;
    try { cfg = JSON.parse(stage.getAttribute('data-anim')); } catch (e) { return; }
    var svg = stage.querySelector('.light-scene');
    if (!svg) return;

    if (stage._raf) cancelAnimationFrame(stage._raf);
    if (stage._timer) clearTimeout(stage._timer);

    var glow = svg.querySelector('[id^="lg-glow-"]');
    var dark = svg.querySelector('[id^="lg-dark-"]');
    var s1 = svg.querySelector('.lg-s1');
    var s2 = svg.querySelector('.lg-s2');
    var d1 = svg.querySelector('.ld-s1');
    var d2 = svg.querySelector('.ld-s2');
    var amb = svg.querySelector('.lt-amb');
    var glowRect = svg.querySelector('.lt-glow');
    var darkRect = svg.querySelector('.lt-dark');
    var halo = svg.querySelector('.lt-halo');
    var rims = svg.querySelector('.lt-rims');
    var eyeA = svg.querySelectorAll('.lt-eyes');
    var upper = svg.querySelector('.lt-upper');
    var bg = svg.querySelector('.lt-bgshade');
    var sun = svg.querySelector('.lt-sun');

    var from = cfg.from;
    var to = cfg.to;
    var keys = ['lx', 'ly', 'glow', 'dark', 'halo', 'rim', 'eyes', 'upper', 'bg', 'lift', 'soft'];
    var dur = cfg.dur || 2400;

    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function apply(t) {
      var e = ease(t);
      var p = {};
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        p[k] = from[k] + (to[k] - from[k]) * e;
      }

      // 高光中心朝灯的方向偏移，但不用贴到灯上：这样灯可以从画面外照进来
      var gx = 800 + (p.lx - 800) * 0.55;
      var gy = 360 + (p.ly - 360) * 0.55;

      glow.setAttribute('cx', gx);
      glow.setAttribute('cy', gy);
      glow.setAttribute('r', 320 + 680 * p.soft);
      s1.setAttribute('offset', 0.4 + 0.16 * p.soft);
      s2.setAttribute('offset', 0.58 + 0.4 * p.soft);

      dark.setAttribute('cx', 800 + (800 - gx) * 0.78);
      dark.setAttribute('cy', 430 + (430 - gy) * 0.62);
      dark.setAttribute('r', 520 + 300 * p.soft);
      d1.setAttribute('offset', 0.24 + 0.22 * p.soft);
      d2.setAttribute('offset', 0.56 + 0.4 * p.soft);

      amb.setAttribute('opacity', p.lift);
      glowRect.setAttribute('opacity', p.glow);
      darkRect.setAttribute('opacity', p.dark);
      halo.setAttribute('opacity', p.halo);
      rims.setAttribute('opacity', p.rim);
      for (var j = 0; j < eyeA.length; j++) eyeA[j].setAttribute('opacity', p.eyes);
      upper.setAttribute('opacity', p.upper);
      bg.setAttribute('opacity', p.bg);
      sun.setAttribute('transform', 'translate(' + p.lx + ',' + p.ly + ')');
    }

    apply(0);

    stage._timer = setTimeout(function () {
      var start = null;
      function step(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / dur);
        apply(t);
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
  window.FilmDemos.light = play;

  window.LightDemo = { stage: stage, mini: mini };
})();
