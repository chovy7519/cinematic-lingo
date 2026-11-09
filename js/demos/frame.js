/*
 * 构图演示：取景框在场景里移动，同时把参考线 / 遮挡示意淡入，
 * 让“同一场景、不同构图”的差别一眼可见。
 */
(function () {
  var LABEL = 38;

  function stage(item) {
    var cfg = {
      from: item.view.from,
      to: item.view.to,
      subject: item.subject || null,
      dur: item.dur || 2200
    };
    var svg = window.FilmScene.scene(item.view.to);
    if (item.subject) {
      svg = svg.replace('class="s-subject"', 'class="s-subject" transform="translate(' +
        item.subject.dx + ',' + item.subject.dy + ')"');
    }

    return [
      '<div class="stage" data-demo="frame" data-anim=\'' + JSON.stringify(cfg) + '\' tabindex="0" role="button"',
        ' aria-label="重播' + item.zh + '演示">',
        '<div class="scene-holder"><div class="frame-layer">' + svg + '</div></div>',
        '<div class="stage-traj">' + guides(item.guides) + '</div>',
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

  function guides(kind) {
    var svg = '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<g class="g-fade">';

    if (kind === 'thirds') {
      svg += '<path class="g-line" d="M533,0 L533,900 M1067,0 L1067,900 M0,300 L1600,300 M0,600 L1600,600"/>' +
        '<circle class="g-ring" cx="533" cy="300" r="56"/>' +
        '<text class="g-label" x="590" y="284">头落在交点</text>';

    } else if (kind === 'center') {
      svg += '<path class="g-line" d="M800,0 L800,900 M0,450 L1600,450"/>' +
        '<circle class="g-ring" cx="800" cy="450" r="150"/>' +
        '<text class="g-label" x="860" y="150">左右留白相等</text>';

    } else if (kind === 'symmetry') {
      svg += '<path class="g-hot" d="M800,0 L800,900"/>' +
        '<path class="g-draw" d="M420,500 L800,500 M800,500 L1180,500"/>' +
        '<path class="g-line" d="M420,470 L420,530 M1180,470 L1180,530"/>' +
        '<text class="g-label" x="470" y="560">等距</text>' +
        '<text class="g-label" x="1010" y="560">等距</text>';

    } else if (kind === 'lines') {
      svg += '<path class="g-draw g-hot" d="M120,900 L867,361 M1480,900 L867,361"/>' +
        '<circle class="g-ring" cx="867" cy="361" r="62"/>' +
        '<text class="g-label" x="980" y="150">这条路本身就是引导线</text>';

    } else if (kind === 'frame') {
      svg += '<path class="g-bars" d="M0,0 H1600 V110 H0 Z M0,790 H1600 V900 H0 Z ' +
        'M0,110 H150 V790 H0 Z M1450,110 H1600 V790 H1450 Z"/>' +
        '<rect class="g-hot" x="150" y="110" width="1300" height="680" fill="none"/>' +
        '<text class="g-label" x="220" y="840">前景围出的“窗口”</text>';

    } else if (kind === 'depth') {
      svg += '<path class="g-fg" d="M0,900 L0,640 Q140,600 260,700 Q360,790 430,900 Z"/>' +
        '<text class="g-label" x="70" y="590">前景</text>' +
        '<text class="g-label" x="520" y="700">中景（人物）</text>' +
        '<text class="g-label" x="1120" y="270">背景（山）</text>' +
        '<path class="g-line" d="M150,620 L230,690 M700,650 L830,620 M1190,310 L1080,350"/>';

    } else if (kind === 'negative') {
      svg += '<rect class="g-line" x="40" y="70" width="700" height="440" fill="none"/>' +
        '<text class="g-label" x="90" y="150">留白（没有信息的区域）</text>' +
        '<circle class="g-ring" cx="1067" cy="600" r="78"/>' +
        '<text class="g-label" x="760" y="520">主体退到右下角</text>';

    } else if (kind === 'diagonal') {
      svg += '<path class="g-draw g-hot" d="M120,525 L1480,80"/>' +
        '<circle class="g-ring" cx="615" cy="363" r="62"/>' +
        '<text class="g-label" x="700" y="300">人物压在对角线上</text>';
    }

    return svg + '</g></svg>';
  }

  /* ---------------- 小图：构图示意 ---------------- */

  function mini(kind) {
    if (kind && kind.id) kind = kind.id;
    var svg = '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<rect class="d-frame" x="4" y="4" width="312" height="172"/>';

    if (kind === 'thirds') {
      svg += '<path class="d-line" d="M108,4 L108,176 M212,4 L212,176 M4,60 L316,60 M4,120 L316,120"/>' +
        '<circle class="d-accent" cx="108" cy="60" r="6"/>';
    } else if (kind === 'center') {
      svg += '<path class="d-line" d="M160,4 L160,176 M4,90 L316,90"/>' +
        '<circle class="d-accent" cx="160" cy="90" r="7"/>' +
        '<circle class="d-line" cx="160" cy="90" r="30"/>';
    } else if (kind === 'symmetry') {
      svg += '<path class="d-path" d="M160,4 L160,176"/>' +
        '<path class="d-line" d="M80,90 L160,90 M160,90 L240,90"/>' +
        '<circle class="d-accent" cx="160" cy="90" r="7"/>';
    } else if (kind === 'lines') {
      svg += '<path class="d-path" d="M24,166 L160,70 M296,166 L160,70"/>' +
        '<circle class="d-accent" cx="160" cy="70" r="7"/>';
    } else if (kind === 'frame') {
      svg += '<rect class="d-sub" x="4" y="4" width="312" height="172" opacity=".16"/>' +
        '<rect class="d-frame" x="62" y="36" width="196" height="108"/>' +
        '<circle class="d-accent" cx="160" cy="90" r="7"/>';
    } else if (kind === 'depth') {
      svg += '<path class="d-sub" d="M4,176 L4,120 L60,150 L96,176 Z" opacity=".5"/>' +
        '<circle class="d-accent" cx="160" cy="96" r="7"/>' +
        '<path class="d-line" d="M240,46 q20,-8 40,0 q20,8 40,0" opacity=".7"/>';
    } else if (kind === 'negative') {
      svg += '<rect class="d-frame" x="20" y="20" width="170" height="120"/>' +
        '<circle class="d-accent" cx="232" cy="132" r="7"/>';
    } else if (kind === 'diagonal') {
      svg += '<path class="d-path" d="M24,154 L296,26"/>' +
        '<circle class="d-accent" cx="128" cy="102" r="7"/>';
    }

    return svg + '</svg>';
  }

  /* ---------------- 播放 ---------------- */

  function play(stage) {
    var cfg;
    try { cfg = JSON.parse(stage.getAttribute('data-anim')); } catch (e) { return; }

    var layer = stage.querySelector('.frame-layer');
    if (!layer) return;
    var svg = layer.querySelector('svg');
    if (!svg) return;

    if (stage._raf) cancelAnimationFrame(stage._raf);
    if (stage._timer) clearTimeout(stage._timer);

    var fade = stage.querySelector('.g-fade');
    var draws = [];
    stage.querySelectorAll('.g-draw').forEach(function (p) {
      var len = p.getTotalLength();
      p._len = len;
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      draws.push(p);
    });

    var subject = svg.querySelector('.s-subject');
    var sdx = cfg.subject ? cfg.subject.dx : 0;
    var sdy = cfg.subject ? cfg.subject.dy : 0;
    if (subject) subject.setAttribute('transform', 'translate(' + sdx + ',' + sdy + ')');

    if (fade) fade.style.opacity = 0;

    var keys = ['x', 'y', 'w', 'h'];
    var from = cfg.from;
    var to = cfg.to;
    var dur = cfg.dur || 2200;

    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function apply(t) {
      var e = ease(t);
      var r = {};
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        r[k] = from[k] + (to[k] - from[k]) * e;
      }
      svg.setAttribute('viewBox', r.x + ' ' + r.y + ' ' + r.w + ' ' + r.h);

      if (subject) {
        subject.setAttribute('transform', 'translate(' + (sdx * e) + ',' + (sdy * e) + ')');
      }

      if (fade) {
        var o = Math.max(0, Math.min(1, (t - 0.18) / 0.42));
        fade.style.opacity = o;
      }
      for (var j = 0; j < draws.length; j++) {
        var d = Math.max(0, Math.min(1, (t - 0.3) / 0.45));
        draws[j].style.strokeDashoffset = draws[j]._len * (1 - d);
      }
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
  window.FilmDemos.frame = play;

  window.FrameDemo = { stage: stage, mini: mini };
})();
