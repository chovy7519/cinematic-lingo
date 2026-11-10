/*
 * CINEMATIC LINGO — visual atlas / architectural dusk.
 * World coordinates and subject anchor intentionally preserve the 46 existing
 * shot-size, camera, composition and edit animations (2400x1350; subject x=1200).
 * No remote images and no license-restricted stills.
 */
(function () {
  'use strict';
  var W = 2400;
  var H = 1350;
  var serial = 0;

  // Each rendered SVG has independent gradient IDs, including A/B comparison clones.
  function stamp(source) {
    serial += 1;
    return source.replace(/@@UID@@/g, String(serial));
  }

  var INNER = [
    '<defs>',
      '<linearGradient id="sky-@@UID@@" x1="0" y1="0" x2=".08" y2="1">',
        '<stop offset="0" stop-color="#101f29"/>',
        '<stop offset=".38" stop-color="#344959"/>',
        '<stop offset=".77" stop-color="#8f9290"/>',
        '<stop offset="1" stop-color="#c7a48c"/>',
      '</linearGradient>',
      '<radialGradient id="glow-@@UID@@" cx="64%" cy="45%" r="62%">',
        '<stop offset="0" stop-color="#e8b88c" stop-opacity=".62"/>',
        '<stop offset=".36" stop-color="#d3a78c" stop-opacity=".22"/>',
        '<stop offset="1" stop-color="#d3a78c" stop-opacity="0"/>',
      '</radialGradient>',
      '<linearGradient id="portal-@@UID@@" x1="0" y1="0" x2=".15" y2="1">',
        '<stop offset="0" stop-color="#d4bca1"/>',
        '<stop offset=".53" stop-color="#b99f86"/>',
        '<stop offset="1" stop-color="#6e7976"/>',
      '</linearGradient>',
      '<linearGradient id="floor-@@UID@@" x1="0" y1="0" x2="0" y2="1">',
        '<stop offset="0" stop-color="#425055"/>',
        '<stop offset=".28" stop-color="#303b41"/>',
        '<stop offset="1" stop-color="#172127"/>',
      '</linearGradient>',
      '<linearGradient id="tower-@@UID@@" x1="0" y1="0" x2="1" y2=".25">',
        '<stop offset="0" stop-color="#182730"/>',
        '<stop offset=".62" stop-color="#31444b"/>',
        '<stop offset="1" stop-color="#526268"/>',
      '</linearGradient>',
      '<linearGradient id="coat-@@UID@@" x1="0" y1="0" x2="1" y2=".15">',
        '<stop offset="0" stop-color="#0e151a"/>',
        '<stop offset=".45" stop-color="#27323a"/>',
        '<stop offset="1" stop-color="#111b21"/>',
      '</linearGradient>',
      '<linearGradient id="face-@@UID@@" x1="0" y1="0" x2="1" y2=".4">',
        '<stop offset="0" stop-color="#7e716b"/>',
        '<stop offset=".52" stop-color="#bc9d88"/>',
        '<stop offset="1" stop-color="#e3b99c"/>',
      '</linearGradient>',
      '<radialGradient id="vignette-@@UID@@" cx="50%" cy="48%" r="67%">',
        '<stop offset=".4" stop-color="#0b1b23" stop-opacity="0"/>',
        '<stop offset="1" stop-color="#0b1419" stop-opacity=".34"/>',
      '</radialGradient>',
    '</defs>',
    '<g class="s-bg">',
      '<rect class="s-sky" x="0" y="0" width="2400" height="870" style="fill:url(#sky-@@UID@@)"/>',
      '<rect x="0" y="0" width="2400" height="900" style="fill:url(#glow-@@UID@@)"/>',
      '<circle class="s-halo" cx="1850" cy="330" r="138" style="fill:#dfaa81;opacity:.13"/>',
      '<circle class="s-sun" cx="1850" cy="330" r="58" style="fill:#f3c69c"/>',
      '<path d="M0,635 C350,622 730,629 1160,613 S2030,595 2400,608" fill="none" stroke="#deb8a0" stroke-width="4" opacity=".3"/>',
      // Distant architecture, softened by the atmospheric depth.
      '<g class="film-skyline">',
        '<path d="M0 762 V601 H178 V539 H334 V629 H492 V497 H628 V747 H820 V563 H1010 V721 H1370 V568 H1542 V483 H1682 V706 H1860 V577 H2018 V475 H2160 V570 H2400 V796 Z" fill="#40545c" opacity=".45"/>',
        '<path d="M0 810 V723 H218 V652 H350 V759 H602 V638 H730 V792 H941 V714 H1480 V690 H1655 V746 H1832 V664 H1990 V731 H2183 V641 H2400 V810 Z" fill="#405057" opacity=".72"/>',
      '</g>',
      // A monumental building is a legible depth cue at every shot size.
      '<path d="M674 840 V305 L728 275 V840 Z" fill="#1c2b33"/>',
      '<path d="M716 305 L827 256 L1728 260 L1818 303 L1818 843 L1697 843 L1697 369 L821 369 L821 840 Z" fill="#283940"/>',
      '<path d="M827 256 L1728 260 L1818 303 L716 305 Z" fill="#54646a"/>',
      '<path d="M821 369 H1697 V839 H821 Z" style="fill:url(#portal-@@UID@@)"/>',
      '<path d="M821 369 H1697 V383 H821 Z" fill="#c1b2a1" opacity=".45"/>',
      '<path d="M882 390 V830 M1634 390 V830" stroke="#46575a" stroke-width="8" opacity=".54"/>',
      '<rect x="1048" y="369" width="10" height="468" fill="#6c7774" opacity=".36"/>',
      '<rect x="1476" y="369" width="10" height="468" fill="#6c7774" opacity=".36"/>',
      '<path d="M821 687 H1697" stroke="#76817e" stroke-width="4" opacity=".52"/>',
      // Light spilling out from the inner portal.
      '<path d="M1088 840 L1418 840 L1705 1350 L699 1350 Z" fill="#cbaa8d" opacity=".19"/>',
      // Two architectural flanking masses, progressively darker toward the foreground.
      '<path d="M0 1360 V445 L286 367 L612 417 V1360 Z" style="fill:url(#tower-@@UID@@)"/>',
      '<path d="M0 445 L286 367 L612 417 L304 487 Z" fill="#66747a" opacity=".85"/>',
      '<path d="M304 487 V1360" stroke="#8b9996" stroke-width="7" opacity=".17"/>',
      '<g opacity=".55" stroke="#91a49e" stroke-width="7">',
        '<path d="M50 594 H264 M50 748 H264 M50 902 H264 M50 1056 H264"/>',
      '</g>',
      '<path d="M1935 1360 V388 L2265 300 L2400 319 V1360 Z" fill="#26363d"/>',
      '<path d="M1935 388 L2265 300 L2400 319 L2080 418 Z" fill="#5f6d71"/>',
      '<path d="M2080 418 V1350" stroke="#72848a" stroke-width="8" opacity=".28"/>',
      '<path d="M2200 450 V1100" stroke="#9ab0a9" stroke-width="5" opacity=".27"/>',
      '<g opacity=".5">',
        '<rect x="1957" y="560" width="84" height="140" fill="#9c8e7d"/>',
        '<rect x="2092" y="516" width="79" height="136" fill="#889995"/>',
        '<rect x="2230" y="475" width="82" height="137" fill="#788b89"/>',
      '</g>',
      // Ground, stepped edge and long directional perspective cues.
      '<rect class="s-ground" x="0" y="839" width="2400" height="511" style="fill:url(#floor-@@UID@@)"/>',
      '<path d="M0 840 H2400" stroke="#b8b5aa" stroke-width="6" opacity=".44"/>',
      '<path class="s-road" d="M1085 1350 H1454 L1277 839 H1190 Z" fill="#7d8681" opacity=".24"/>',
      '<path d="M1190 839 L985 1350 M1277 839 L1641 1350" stroke="#bbbab0" stroke-width="3" opacity=".38"/>',
      '<path d="M0 975 H2400 M0 1126 H2400 M0 1301 H2400" stroke="#a6b0aa" stroke-width="3" opacity=".12"/>',
      '<path d="M475 1350 L1080 840 M1925 1350 L1411 840" stroke="#b6b9af" stroke-width="4" opacity=".3"/>',
      // Foreground shadow and oblique structural axis.
      '<path d="M0 1090 L426 840 L559 840 L0 1350 Z" fill="#091318" opacity=".31"/>',
      '<path d="M2400 1000 L2090 840 L1940 840 L2400 1318 Z" fill="#0c171c" opacity=".24"/>',
      '<path d="M0 0 H2400 V1350 H0 Z" style="fill:url(#vignette-@@UID@@)"/>',
    '</g>',
    // The protagonist is a silhouetted adult in a tailored coat; head 660, feet 960.
    // Preserve the single s-subject group: animation modules translate this exact node.
    '<g class="s-subject">',
      '<ellipse class="s-shadow" cx="1218" cy="969" rx="108" ry="16" fill="#0e1518" opacity=".38"/>',
      '<path d="M1185 832 L1200 833 L1198 956 L1180 957 Q1177 901 1185 832 Z" style="fill:url(#coat-@@UID@@)"/>',
      '<path d="M1205 832 L1222 830 L1230 954 L1212 956 Q1207 893 1205 832 Z" style="fill:url(#coat-@@UID@@)"/>',
      '<path d="M1176 955 H1200 V965 H1175 Q1171 961 1176 955 Z M1210 954 H1234 L1240 964 H1212 Z" fill="#0b1115"/>',
      '<path class="s-figure" d="M1171 745 Q1201 732 1231 744 L1240 837 Q1200 851 1162 836 Z" style="fill:url(#coat-@@UID@@)"/>',
      '<path d="M1172 746 L1200 781 L1212 748 L1200 739 Z" fill="#667078" opacity=".38"/>',
      '<path d="M1212 748 L1230 746 L1216 830 L1201 839 Z" fill="#151f26" opacity=".57"/>',
      '<path d="M1167 759 Q1157 774 1158 807 L1145 862 L1158 866 Q1182 799 1184 758 Z" fill="#172127"/>',
      '<path d="M1234 758 Q1245 777 1244 803 L1256 857 L1241 861 Q1225 797 1217 758 Z" fill="#1b252b"/>',
      '<path d="M1155 860 L1145 860 L1143 874 Q1151 879 1159 868 Z M1243 855 L1256 856 L1257 870 Q1250 875 1241 864 Z" fill="#b59682"/>',
      '<path d="M1190 714 H1208 V747 H1190 Z" fill="#947a6d"/>',
      '<path d="M1174 680 Q1175 651 1202 649 Q1229 649 1230 680 L1222 716 Q1215 730 1198 728 Q1180 718 1174 680 Z" style="fill:url(#face-@@UID@@)"/>',
      '<path d="M1174 682 Q1168 643 1199 640 Q1215 642 1228 655 L1233 679 Q1220 665 1205 662 Q1185 677 1174 682 Z" fill="#121b20"/>',
      '<path d="M1173 679 Q1181 665 1187 663 L1191 650 L1177 650 Z" fill="#111a1e"/>',
      '<path d="M1226 688 Q1231 696 1225 701 L1221 702" fill="none" stroke="#9f7f70" stroke-width="1.2" vector-effect="non-scaling-stroke" opacity=".68"/>',
      '<path class="s-brow" d="M1187 678 Q1193 675 1200 678" stroke="#574743" stroke-width="1.1" vector-effect="non-scaling-stroke" fill="none" opacity=".72"/>',
      '<path class="s-eye" d="M1188 686 Q1194 683.6 1200 686" stroke="#332d2c" stroke-width="1.4" vector-effect="non-scaling-stroke" fill="none" opacity=".84"/>',
      '<path class="s-line" d="M1207 711 Q1213 713 1217 710" stroke="#825f56" stroke-width=".9" vector-effect="non-scaling-stroke" fill="none" opacity=".63"/>',
      '<path d="M1170 742 Q1185 749 1186 785 M1232 740 Q1225 760 1236 788" stroke="#c0b2a1" stroke-width="2" fill="none" opacity=".48"/>',
    '</g>'
  ].join('');

  var TOP = [
    '<rect x="0" y="0" width="2400" height="1350" fill="#27353c"/>',
    '<rect x="160" y="140" width="680" height="360" fill="#384a51"/>',
    '<path d="M160 140 H840 V185 H160 Z" fill="#66747a"/>',
    '<rect x="1580" y="100" width="660" height="400" fill="#394b51"/>',
    '<path d="M1580 100 H2240 V157 H1580 Z" fill="#718080"/>',
    '<rect x="220" y="760" width="570" height="385" fill="#44575c"/>',
    '<rect x="1660" y="780" width="590" height="365" fill="#46565b"/>',
    '<path class="s-road" d="M1074 0 H1294 V1350 H1074 Z" fill="#76817c"/>',
    '<path d="M1184 0 V1350" stroke="#c2aaa0" opacity=".47" stroke-width="4" stroke-dasharray="30 37"/>',
    '<path d="M0 650 H2400 M0 1250 H2400" stroke="#728286" stroke-width="12" opacity=".35"/>',
    '<g stroke="#a6aaa1" stroke-width="5" opacity=".42" fill="none">',
      '<path d="M230 280 H765 M230 410 H765 M1680 236 H2160 M1680 392 H2160"/>',
      '<path d="M320 810 H720 M320 940 H720 M1710 850 H2190 M1710 1000 H2190"/>',
    '</g>',
    '<ellipse class="s-shadow" cx="1230" cy="811" rx="74" ry="39" fill="#0b161c" opacity=".34"/>',
    '<ellipse class="s-figure" cx="1200" cy="770" rx="61" ry="42" fill="#1b272d"/>',
    '<circle class="s-figure" cx="1200" cy="742" r="29" fill="#a99282"/>',
    '<path d="M1170 732 Q1176 702 1200 712 Q1220 710 1231 733 Q1201 716 1170 732" fill="#172127"/>'
  ].join('');

  function svg(crop, label, markup, suffix) {
    var c = crop || { x:0, y:0, w:W, h:H };
    return '<svg class="scene" viewBox="' + c.x + ' ' + c.y + ' ' + c.w + ' ' + c.h +
      '" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + label + '">' +
      stamp(markup) + (suffix || '') + '</svg>';
  }

  function scene(crop) {
    return svg(crop,'同一电影建筑场景的取景演示',INNER);
  }

  function topView(crop) {
    return svg(crop,'建筑摄影场景的顶视图',TOP);
  }

  function minimap(crop) {
    var dims = [
      {x:0, y:0, w:W, h:crop.y},
      {x:0, y:crop.y+crop.h, w:W, h:H-crop.y-crop.h},
      {x:0, y:crop.y, w:crop.x, h:crop.h},
      {x:crop.x+crop.w, y:crop.y, w:W-crop.x-crop.w, h:crop.h}
    ];
    var shade = dims.map(function(d){
      return '<rect class="mini-dim" x="' + d.x + '" y="' + d.y +
        '" width="' + d.w + '" height="' + d.h + '"/>';
    }).join('');
    var overlays = shade +
      '<circle class="mini-dot" cx="1200" cy="690" r="30" vector-effect="non-scaling-stroke"/>' +
      '<rect class="mini-frame" x="' + crop.x + '" y="' + crop.y + '" width="' +
        crop.w + '" height="' + crop.h + '" vector-effect="non-scaling-stroke"/>';
    return '<svg class="mini" viewBox="0 0 ' + W + ' ' + H +
      '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      stamp(INNER) + overlays + '</svg>';
  }
  window.FilmScene = { W:W, H:H, personHeight:300, scene:scene, topView:topView, minimap:minimap };
})();
