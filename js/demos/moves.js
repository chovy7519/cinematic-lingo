/*
 * 运镜演示：画框在场景里移动（推 / 拉 / 摇 / 移 / 升降 / 变焦），
 * 叠加层用屏幕空间轨迹线 + 一个沿轨迹走的小圆点表示相机怎么动；
 * 右侧小图是俯视或侧视的运动示意。
 */
(function () {
  function stage(item) {
    var view = item.view;
    var crop = view.to;
    var cfg = {
      from: view.from,
      to: view.to,
      subject: item.subject || null,
      orbit: !!item.orbit,
      handheld: !!item.handheld,
      dur: item.dur || 2400
    };
    var layerTf = item.orbit ? 'perspective(1400px) rotateY(7deg)' : '';
    var svg = window.FilmScene.scene(crop);
    if (item.subject) {
      svg = svg.replace('class="s-subject"', 'class="s-subject" transform="translate(' +
        item.subject.dx + ',' + item.subject.dy + ')"');
    }

    return [
      '<div class="stage" data-demo="move" data-anim=\'' + JSON.stringify(cfg) + '\' tabindex="0" role="button"',
        ' aria-label="重播' + item.zh + '演示">',
        '<div class="scene-holder"><div class="move-layer"' +
          (layerTf ? ' style="transform:' + layerTf + '"' : '') + '>' +
          svg + '</div></div>',
        '<div class="stage-traj">' + overlay(item) + '</div>',
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

  function overlay(item) {
    var t = item.traj;
    var head = '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';

    if (t.shape === 'frames') {
      return head +
        '<rect class="t-frame" x="340" y="180" width="900" height="506.25"/>' +
        '<path class="t-line" d="M340,180 L620,330 M1240,180 L960,330 M340,686.25 L620,521.25 M1240,686.25 L960,521.25" ' +
        'opacity=".5"/>' +
        '<rect class="t-frame t-frame-anim" x="340" y="180" width="900" height="506.25" ' +
        'data-to="620,330,340,191.25"/>' +
        '<text class="t-label" x="' + t.lx + '" y="' + t.ly + '">' + t.label + '</text>' +
        '</svg>';
    }

    return head +
      '<path class="t-line" d="' + t.d + '"/>' +
      '<circle class="t-dot" r="18" opacity="0"/>' +
      '<text class="t-label" x="' + t.lx + '" y="' + t.ly + '">' + t.label + '</text>' +
      '</svg>';
  }

  /* ---------------- 小图：俯视 / 侧视运动示意 ---------------- */

  function sidePerson(x, gy, s) {
    return '<g transform="translate(' + x + ',' + gy + ') scale(' + s + ')">' +
      '<circle class="d-sub" cx="0" cy="-52" r="8"/>' +
      '<path class="d-sub" d="M-5,-44 L5,-44 L10,0 L3,0 L0,-22 L-3,0 L-10,0 Z"/>' +
      '</g>';
  }

  function cam(x, y, rot) {
    return '<g class="d-cam" transform="translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')">' +
      '<rect x="-11" y="-7" width="15" height="14" rx="2"/>' +
      '<path d="M4,-4 L14,-8 L14,8 L4,4 Z"/>' +
      '<path d="M-4,7 L-8,17 M-4,7 L3,17" fill="none" stroke="#2b2f35" stroke-width="2"/>' +
      '</g>';
  }

  function topPerson(x, y) {
    return '<ellipse class="d-sub" cx="' + x + '" cy="' + (y + 9) + '" rx="16" ry="8"/>' +
      '<circle class="d-sub" cx="' + x + '" cy="' + y + '" r="8"/>';
  }

  function arrow(x1, y1, x2, y2, cls) {
    var ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    return '<path class="' + (cls || 'd-path') + '" d="M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2 + '"/>' +
      '<polygon class="d-head" points="0,-4.5 10,0 0,4.5" transform="translate(' + x2 + ',' + y2 +
      ') rotate(' + ang.toFixed(1) + ')"/>';
  }

  function label(x, y, text) {
    return '<text class="d-label" x="' + x + '" y="' + y + '">' + text + '</text>';
  }

  function path(kind) {
    if (kind && kind.id) kind = kind.id;
    var svg = '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">';

    if (kind === 'push' || kind === 'pull' || kind === 'rise') {
      svg += '<path class="d-line" d="M26,146 L300,146"/>';
    }

    if (kind === 'push') {
      svg += sidePerson(240, 146, 1) + cam(38, 104, 0);
      svg += arrow(64, 104, 206, 104) + label(58, 78, '相机前进');

    } else if (kind === 'pull') {
      svg += sidePerson(240, 146, 1) + cam(38, 104, 0);
      svg += arrow(206, 104, 64, 104) + label(58, 78, '相机后退');

    } else if (kind === 'rise') {
      svg += sidePerson(240, 146, 1) + cam(40, 126, 0);
      svg += arrow(40, 118, 40, 44) + label(58, 40, '机位升降');
      svg += '<path class="d-sight" d="M54,126 L214,96" opacity=".6"/>';

    } else if (kind === 'pan') {
      svg += topPerson(250, 56) + cam(44, 118, -38);
      svg += '<path class="d-sight" d="M64,110 L232,44 M64,110 L232,82" opacity=".55"/>';
      svg += '<path class="d-path" d="M228,48 A96,96 0 0 1 228,86"/>' +
        '<polygon class="d-head" points="0,-4.5 10,0 0,4.5" transform="translate(228,86) rotate(88)"/>';
      svg += label(52, 40, '原地转向');

    } else if (kind === 'move') {
      svg += topPerson(250, 56);
      svg += cam(36, 132, 0) + arrow(58, 132, 196, 132) + label(58, 158, '机位平移');

    } else if (kind === 'follow') {
      svg += topPerson(160, 42) + arrow(160, 66, 160, 104);
      svg += cam(160, 158, -90) + arrow(196, 158, 196, 116);
      svg += label(174, 78, '一起移动');

    } else if (kind === 'orbit') {
      svg += '<circle class="d-path" cx="160" cy="92" r="56" opacity=".55"/>';
      svg += topPerson(160, 92) + cam(160, 148, -90) + cam(104, 92, 180);
      svg += '<path class="d-path" d="M160,148 A56,56 0 0 1 104,92"/>' +
        '<polygon class="d-head" points="0,-4.5 10,0 0,4.5" transform="translate(104,92) rotate(-90)"/>';
      svg += label(176, 132, '绕主体');

    } else if (kind === 'handheld') {
      svg += topPerson(254, 58) + cam(52, 116, -6);
      svg += '<path class="d-path" d="M70,120 q14,-18 28,0 t28,0 t28,0"/>';
      svg += label(58, 82, '小幅抖动');

    } else if (kind === 'zoom') {
      svg += topPerson(254, 58);
      svg += cam(42, 118, -8);
      svg += '<path class="d-sight" d="M60,112 L238,44 M60,112 L238,76"/>';
      svg += '<rect class="d-frame" x="196" y="28" width="58" height="32"/>' +
        '<rect class="d-frame" x="212" y="36" width="26" height="15"/>';
      svg += label(56, 40, '机位不动·只改焦距');
    }

    svg += '</svg>';
    return svg;
  }

  /* ---------------- 播放 ---------------- */

  function addHead(svg, line) {
    if (svg.querySelector('.t-head-add')) return;
    var len = line.getTotalLength();
    var tip = line.getPointAtLength(len);
    var prev = line.getPointAtLength(Math.max(0, len - 24));
    var ang = Math.atan2(tip.y - prev.y, tip.x - prev.x) * 180 / Math.PI;
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', '0,-26 52,0 0,26');
    poly.setAttribute('transform', 'translate(' + tip.x + ',' + tip.y + ') rotate(' + ang.toFixed(1) + ')');
    poly.setAttribute('class', 't-head t-head-add');
    svg.appendChild(poly);
  }

  function play(stage) {
    var cfg;
    try { cfg = JSON.parse(stage.getAttribute('data-anim')); } catch (e) { return; }

    var layer = stage.querySelector('.move-layer');
    if (!layer) return;
    var svg = layer.querySelector('svg');
    if (!svg) return;

    if (stage._raf) cancelAnimationFrame(stage._raf);
    if (stage._timer) clearTimeout(stage._timer);

    var traj = stage.querySelector('.stage-traj svg');
    var dot = traj && traj.querySelector('.t-dot');
    var line = traj && traj.querySelector('.t-line');
    var head = null;
    var inner = traj && traj.querySelector('.t-frame-anim');
    var innerTo = inner ? inner.getAttribute('data-to').split(',').map(Number) : null;
    var outer = inner ? [340, 180, 900, 506.25] : null;

    if (line) {
      var len = line.getTotalLength();
      line._len = len;
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      addHead(traj, line);
      head = traj.querySelector('.t-head-add');
      if (head) head.style.opacity = 0;
    }

    var subject = svg.querySelector('.s-subject');
    var sdx = cfg.subject ? cfg.subject.dx : 0;
    var sdy = cfg.subject ? cfg.subject.dy : 0;
    if (subject) subject.setAttribute('transform', 'translate(' + sdx + ',' + sdy + ')');

    var keys = ['x', 'y', 'w', 'h'];
    var from = cfg.from;
    var to = cfg.to;
    var dur = cfg.dur || 2400;
    var amp = Math.min(to.w, to.h) * 0.012;

    function rectAt(t) {
      var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      var r = {};
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        r[k] = from[k] + (to[k] - from[k]) * e;
      }
      return r;
    }

    function applyTransform(t) {
      var tf = '';
      if (cfg.orbit) tf = 'perspective(1400px) rotateY(' + (-7 + 14 * t) + 'deg)';
      if (cfg.handheld) tf = 'rotate(' + (Math.sin(t * 19) * 0.5) + 'deg)';
      layer.style.transform = tf;
    }

    function apply(t) {
      var rect = rectAt(t);
      var jx = 0;
      var jy = 0;
      if (cfg.handheld) {
        jx = Math.sin(t * 26) * amp;
        jy = Math.cos(t * 21 + 1) * amp * 0.7;
        rect.x += jx;
        rect.y += jy;
      }
      svg.setAttribute('viewBox', rect.x + ' ' + rect.y + ' ' + rect.w + ' ' + rect.h);

      if (subject) {
        var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        subject.setAttribute('transform', 'translate(' + (sdx * e) + ',' + (sdy * e) + ')');
      }

      applyTransform(t);

      if (line) {
        var draw = Math.min(1, t / 0.45);
        line.style.strokeDashoffset = line._len * (1 - draw);
        if (head) head.style.opacity = draw;
        if (dot) {
          var pt = line.getPointAtLength(line._len * t);
          dot.setAttribute('cx', pt.x);
          dot.setAttribute('cy', pt.y);
          dot.setAttribute('opacity', 0.95);
        }
      }

      if (inner) {
        var e2 = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        inner.setAttribute('x', outer[0] + (innerTo[0] - outer[0]) * e2);
        inner.setAttribute('y', outer[1] + (innerTo[1] - outer[1]) * e2);
        inner.setAttribute('width', outer[2] + (innerTo[2] - outer[2]) * e2);
        inner.setAttribute('height', outer[3] + (innerTo[3] - outer[3]) * e2);
      }
    }

    applyTransform(0);
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
          if (line) {
            line.style.strokeDasharray = '7 6';
            line.style.strokeDashoffset = 0;
          }
        }
      }

      stage._raf = requestAnimationFrame(step);
    }, 300);
  }

  window.FilmDemos = window.FilmDemos || {};
  window.FilmDemos.move = play;

  window.MoveDemo = { stage: stage, path: path };
})();
