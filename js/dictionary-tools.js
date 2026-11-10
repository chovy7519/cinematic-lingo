/*
 * Cinematic Lingo dictionary utilities.
 * Pure text search + on-demand two-term visual comparison.
 * No accounts, quizzes, dependencies, or saved user data.
 */
(function () {
  'use strict';

  function normalize(value) {
    return String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function matches(value, query) {
    var words = normalize(query).split(' ').filter(Boolean);
    var haystack = normalize(value);
    return words.every(function(word) { return haystack.includes(word); });
  }
  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function init() {
    var input = document.getElementById('term-search');
    var status = document.getElementById('term-search-status');
    var clearSearch = document.getElementById('term-search-clear');
    var tray = document.getElementById('compare-tray');
    var summary = document.getElementById('compare-summary');
    var openButton = document.getElementById('compare-open');
    var clearButton = document.getElementById('compare-clear');
    var panel = document.getElementById('compare-panel');
    var columns = document.getElementById('compare-columns');
    var closePanel = document.getElementById('compare-panel-close');
    if (!input || !tray || !panel) return;

    var cards = Array.from(document.querySelectorAll('.card'));
    var sections = Array.from(document.querySelectorAll('.section'));
    var entries = cards.map(function (card) {
      var headings = Array.from(card.querySelectorAll(
        '.card-head h3, .card-abbr, .card-plain, .stage-foot, .meta-list dd'
      )).map(function (node) { return node.textContent; }).join(' ');
      var title = card.querySelector('.card-head h3');
      var zh = title && title.firstChild ? title.firstChild.textContent.trim() : card.id;
      var button = document.createElement('button');
      button.className = 'card-compare-btn';
      button.type = 'button';
      button.textContent = '＋ 加入对照';
      button.setAttribute('aria-label', '将' + zh + '加入并排对照');
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', function () { toggleCompare(card.id); });
      card.querySelector('.card-head').appendChild(button);
      // Only link terms the current camera lab can actually demonstrate.
      var links = {
        'moves-push': 'lab.html?mode=dolly&preset=0',
        'moves-zoom': 'lab.html?mode=dolly&preset=1',
        'angles-low': 'lab.html?mode=angle&preset=0',
        'angles-high': 'lab.html?mode=angle&preset=1'
      };
      if (links[card.id]) {
        var link = document.createElement('a');
        link.className = 'card-lab-link';
        link.href = links[card.id];
        link.textContent = '在 3D 实验室观察这个机位 ↗';
        card.querySelector('.card-meta').appendChild(link);
      }
      return {card:card, id:card.id, zh:zh, index:normalize(headings), button:button};
    });
    var byId = new Map(entries.map(function(entry) { return [entry.id,entry]; }));
    var selected = [];
    var compareExpanded = false;

    function applySearch() {
      var query = input.value;
      var count = 0;
      entries.forEach(function (entry) {
        var visible = matches(entry.index, query);
        entry.card.hidden = !visible;
        if (visible) count++;
      });
      sections.forEach(function(section) {
        var visible = Array.from(section.querySelectorAll('.card')).some(function(card) {
          return !card.hidden;
        });
        section.hidden = !visible;
      });
      var strip = document.querySelector('#section-shots .strip-panel');
      if (strip) strip.hidden = !!normalize(query);
      clearSearch.hidden = !normalize(query);
      status.textContent = normalize(query)
        ? count ? '找到 ' + count + ' 个匹配术语 · 可点击卡片“加入对照”' : '没有匹配结果。试试中文、英文或缩写。'
        : '共 ' + entries.length + ' 个术语 · 按主题浏览或直接搜索';
      window.dispatchEvent(new Event('scroll'));
    }

    function remapSvgIds(stage, prefix) {
      var idMap = new Map();
      stage.querySelectorAll('[id]').forEach(function(node) {
        var oldId = node.getAttribute('id');
        var newId = oldId + '-' + prefix; // preserve prefixes used by SVG animation selectors
        idMap.set(oldId, newId);
        node.setAttribute('id', newId);
      });
      if (!idMap.size) return;
      stage.querySelectorAll('*').forEach(function(node) {
        Array.from(node.attributes).forEach(function(attr) {
          var value = attr.value;
          idMap.forEach(function(newId, oldId) {
            value = value.split('url(#' + oldId + ')').join('url(#' + newId + ')');
            if (value === '#' + oldId) value = '#' + newId;
          });
          if (value !== attr.value) node.setAttribute(attr.name, value);
        });
      });
    }

    function renderPanel() {
      if (!compareExpanded || selected.length !== 2) {
        panel.hidden = true;
        columns.replaceChildren();
        return;
      }
      panel.hidden = false;
      columns.replaceChildren();
      var stages = [];
      selected.forEach(function(id, i) {
        var entry = byId.get(id);
        if (!entry) return;
        var article = document.createElement('article');
        article.className = 'compare-item';
        var header = document.createElement('div');
        header.className = 'compare-item-head';
        var caption = document.createElement('div');
        caption.innerHTML = '<span class="compare-side">' + (i===0?'A':'B') +
          '</span><h3>' + escapeText(entry.zh) + '</h3>';
        var remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = '移除';
        remove.setAttribute('aria-label','移除' + entry.zh + '对照');
        remove.addEventListener('click', function() { toggleCompare(id); });
        header.append(caption, remove);
        article.append(header);

        var stage = entry.card.querySelector('.stage');
        if (stage) {
          var clone = stage.cloneNode(true);
          clone.removeAttribute('data-played');
          remapSvgIds(clone,'compare-' + i + '-');
          clone.setAttribute('aria-label','重播对照镜头：' + entry.zh);
          article.append(clone);
          stages.push(clone);
        }
        var plain = entry.card.querySelector('.card-plain');
        if (plain) {
          var desc = document.createElement('p');
          desc.className = 'compare-plain';
          desc.textContent = plain.textContent;
          article.append(desc);
        }
        var note = entry.card.querySelector('.stage-foot');
        if (note) {
          var detail = document.createElement('p');
          detail.className = 'compare-detail';
          detail.textContent = note.textContent;
          article.append(detail);
        }
        columns.append(article);
      });
      if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        requestAnimationFrame(function(){
          stages.forEach(function(stage) { window.FilmCards.play(stage); });
        });
      }
    }

    function refreshCompare() {
      entries.forEach(function(entry) {
        var chosen = selected.includes(entry.id);
        entry.button.textContent = chosen ? '✓ 已加入对照' : '＋ 加入对照';
        entry.button.setAttribute('aria-pressed', String(chosen));
      });
      tray.hidden = selected.length === 0;
      document.body.classList.toggle('has-compare-tray', selected.length > 0);
      openButton.disabled = selected.length !== 2;
      summary.textContent = selected.length === 0 ? '' :
        selected.map(function(id) { return byId.get(id).zh; }).join(' / ') +
        (selected.length === 1 ? ' · 还可选择一个术语' : ' · 可以并排观看');
      renderPanel();
    }

    function toggleCompare(id) {
      var oldIndex = selected.indexOf(id);
      if (oldIndex !== -1) selected.splice(oldIndex, 1);
      else if (selected.length >= 2) selected[1] = id;
      else selected.push(id);
      if (selected.length !== 2) compareExpanded = false;
      refreshCompare();
    }

    input.addEventListener('input', applySearch);
    clearSearch.addEventListener('click', function() {
      input.value = '';
      applySearch();
      input.focus();
    });
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && input.value) {
        event.preventDefault();
        input.value = '';
        applySearch();
      }
      if (event.key === 'Enter') {
        var first = entries.find(function(entry){ return !entry.card.hidden; });
        if (first) {
          first.card.scrollIntoView({behavior:'smooth',block:'center'});
          first.card.querySelector('.stage')?.focus({preventScroll:true});
        }
      }
    });
    document.addEventListener('keydown', function(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        input.focus();
        input.select();
      }
    });
    openButton.addEventListener('click', function() {
      if (selected.length !== 2) return;
      compareExpanded = true;
      renderPanel();
      panel.scrollIntoView({behavior:'smooth',block:'start'});
    });
    closePanel.addEventListener('click', function(){
      compareExpanded = false;
      renderPanel();
    });
    clearButton.addEventListener('click', function(){
      selected = [];
      compareExpanded = false;
      refreshCompare();
    });
    applySearch();
    refreshCompare();
  }

  window.FilmDictionaryTools = { init:init, normalize:normalize, matches:matches };
})();
