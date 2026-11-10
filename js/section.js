/*
 * 通用分区渲染：角度、运镜等分区共用同一套卡片结构。
 * 只要传入 stage(item) 与 mini(item) 两个渲染函数即可。
 */
(function () {
  function cardHTML(sectionId, item, opts) {
    return [
      '<article class="card" id="' + sectionId + '-' + item.id + '">',
        '<header class="card-head">',
          '<span class="card-no">' + item.no + '</span>',
          '<div class="card-title"><h3>' + item.zh +
            '<span class="card-en">' + item.en + '</span></h3></div>',
          '<span class="card-abbr">' + item.abbr + '</span>',
        '</header>',
        window.FilmFacets.facetHTML(sectionId, item.id),
        '<p class="card-plain">' + item.plain + '</p>',
        '<div class="card-body">',
          '<div class="stage-wrap">',
            opts.stage(item),
            '<p class="stage-foot">' + item.note + '</p>',
          '</div>',
          '<aside class="card-meta">',
            '<div class="mini-wrap"><span class="mini-label">' + opts.miniLabel + '</span>' +
              opts.mini(item) + '</div>',
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

  function render(container, section, opts) {
    var html = '<section class="section" id="section-' + section.id + '">' +
      '<div class="section-head">' +
        '<div><p class="kicker">' + section.kicker + '</p>' +
          '<h2>' + section.zh + '</h2>' +
          '<p class="section-desc">' + section.desc + '</p></div>' +
        '<span class="section-count">' + section.items.length + ' 个术语</span>' +
      '</div>' +
      '<div class="cards">';

    for (var i = 0; i < section.items.length; i++) {
      html += cardHTML(section.id, section.items[i], opts);
    }

    html += '</div></section>';
    container.insertAdjacentHTML('beforeend', html);
  }

  window.FilmSection = { render: render };
})();
