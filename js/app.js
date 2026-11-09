/*
 * 页面装配：左侧目录、并排对比条、卡片、滚动自动播放。
 * 后续分区（机位角度 / 运镜 / 构图 / 灯光 / 转场）在这里登记即可。
 */
(function () {
  var SECTIONS = [
    { id: 'shots', no: '01', zh: '景别', en: 'SHOT SIZE', count: 8, ready: true, href: '#section-shots' },
    { id: 'angles', no: '02', zh: '机位角度', en: 'CAMERA ANGLE', count: 7, ready: true, href: '#section-angles' },
    { id: 'moves', no: '03', zh: '运镜', en: 'CAMERA MOVE', count: 9, ready: true, href: '#section-moves' },
    { id: 'frame', no: '04', zh: '构图', en: 'COMPOSITION', count: 8, ready: true, href: '#section-frame' },
    { id: 'light', no: '05', zh: '灯光', en: 'LIGHTING', count: 8, ready: true, href: '#section-light' },
    { id: 'edit', no: '06', zh: '转场', en: 'TRANSITION', count: 6, ready: true, href: '#section-edit' }
  ];

  function renderRail() {
    var nav = document.getElementById('rail-nav');
    if (!nav) return;

    var html = '<p class="rail-label">目录</p><nav class="rail-nav">';
    SECTIONS.forEach(function (sec) {
      if (sec.ready) {
        html += '<a class="rail-item' + (sec.id === 'shots' ? ' is-active' : '') + '" href="' + sec.href + '">' +
          '<span class="rail-no">' + sec.no + '</span>' +
          '<span>' + sec.zh + '</span>' +
          '<span class="rail-count">' + sec.count + '</span></a>';
      } else {
        html += '<span class="rail-item is-soon">' +
          '<span class="rail-no">' + sec.no + '</span>' +
          '<span>' + sec.zh + '</span>' +
          '<span class="rail-badge">待补</span></span>';
      }
    });
    html += '</nav>';
    nav.innerHTML = html;
  }

  function renderFuture() {
    var box = document.getElementById('future-sections');
    if (!box) return;

    var rest = SECTIONS.filter(function (sec) { return !sec.ready; });
    if (!rest.length) { box.innerHTML = ''; return; }

    var html = '<section class="future" id="future">' +
      '<div class="future-head"><h2>后面还要补的分区</h2>' +
      '<span>数据与卡片结构已留好，按同一套模板继续加</span></div><div class="future-grid">';

    rest.forEach(function (sec) {
      html += '<article class="future-card" id="section-' + sec.id + '">' +
        '<h3><span>' + sec.no + '</span>' + sec.zh +
        '<span>' + sec.en + '</span></h3>' +
        '<p class="future-desc">' + sec.desc + '</p>' +
        '<div class="tags">' + sec.terms.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>' +
        '<span class="future-state">待补 · ' + sec.count + ' 个术语</span></article>';
    });

    html += '</div></section>';
    box.innerHTML = html;
  }

  function renderMore() {
    var box = document.getElementById('more-sections');
    if (!box) return;

    if (window.ANGLE_DATA && window.AngleDemo) {
      window.FilmSection.render(box, window.ANGLE_DATA, {
        stage: window.AngleDemo.stage,
        mini: window.AngleDemo.diagram,
        miniLabel: '机位侧视'
      });
    }

    if (window.MOVE_DATA && window.MoveDemo) {
      window.FilmSection.render(box, window.MOVE_DATA, {
        stage: window.MoveDemo.stage,
        mini: window.MoveDemo.path,
        miniLabel: '运动轨迹'
      });
    }

    if (window.FRAME_DATA && window.FrameDemo) {
      window.FilmSection.render(box, window.FRAME_DATA, {
        stage: window.FrameDemo.stage,
        mini: window.FrameDemo.mini,
        miniLabel: '构图示意'
      });
    }

    if (window.LIGHT_DATA && window.LightDemo) {
      window.FilmSection.render(box, window.LIGHT_DATA, {
        stage: window.LightDemo.stage,
        mini: window.LightDemo.mini,
        miniLabel: '光位示意'
      });
    }

    if (window.EDIT_DATA && window.EditDemo) {
      window.FilmSection.render(box, window.EDIT_DATA, {
        stage: window.EditDemo.stage,
        mini: window.EditDemo.mini,
        miniLabel: '接法示意'
      });
    }
  }

  function renderStrip(items) {
    var strip = document.getElementById('shots-strip');
    if (!strip) return;

    strip.innerHTML = items.map(function (item) {
      return '<button class="thumb" type="button" data-target="shot-' + item.id +
        '" aria-label="跳到' + item.zh + '">' +
        window.FilmScene.scene(item.crop) +
        '<span class="thumb-cap"><b>' + item.zh + '</b><i>' + item.no + '</i></span></button>';
    }).join('');
  }

  function scrollToCard(card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.remove('is-flash');
    void card.offsetWidth;
    card.classList.add('is-flash');
    setTimeout(function () { card.classList.remove('is-flash'); }, 1500);
  }

  function wire() {
    var strip = document.getElementById('shots-strip');
    if (strip) {
      strip.addEventListener('click', function (e) {
        var thumb = e.target.closest('.thumb');
        if (!thumb) return;
        var card = document.getElementById('' + thumb.getAttribute('data-target'));
        if (card) scrollToCard(card);
      });
    }

    document.addEventListener('click', function (e) {
      var stage = e.target.closest('.stage');
      if (!stage) return;
      window.FilmCards.play(stage);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var stage = e.target.closest('.stage');
      if (!stage) return;
      e.preventDefault();
      window.FilmCards.play(stage);
    });

    // 卡片进入视野时自动播一次，不用先点
    var stages = document.querySelectorAll('.stage');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var stage = entry.target;
          if (stage.getAttribute('data-played') === '1') return;
          stage.setAttribute('data-played', '1');
          io.unobserve(stage);
          setTimeout(function () { window.FilmCards.play(stage); }, 180);
        });
      }, { threshold: 0.55 });
      stages.forEach(function (s) { io.observe(s); });
    }
  }

  function boot() {
    renderRail();
    renderFuture();

    var items = window.SHOT_DATA.items;
    renderStrip(items);
    var cards = document.getElementById('shots-cards');
    window.FilmCards.render(cards, items);

    renderMore();

    wire();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
