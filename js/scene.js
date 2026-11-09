/*
 * 所有卡片共用同一个 2400 x 1350 的「世界场景」。
 * 不同景别只是换一个 SVG viewBox：同一个场景，取不同的框。
 */
(function () {
  var W = 2400;
  var H = 1350;

  var INNER = [
    '<g class="s-bg">',
    '<rect class="s-sky" x="0" y="0" width="' + W + '" height="' + H + '"/>',
    '<circle class="s-halo" cx="1850" cy="330" r="150"/>',
    '<circle class="s-sun" cx="1850" cy="330" r="88"/>',
    '<g class="s-clouds">',
      '<ellipse cx="760" cy="292" rx="112" ry="26"/>',
      '<ellipse cx="862" cy="276" rx="72" ry="18"/>',
      '<ellipse cx="1500" cy="240" rx="132" ry="30"/>',
      '<ellipse cx="1612" cy="226" rx="82" ry="20"/>',
      '<ellipse cx="2090" cy="468" rx="100" ry="24"/>',
    '</g>',

    // 远山
    '<path class="s-far" d="M0,840 L0,655 L150,600 L300,690 L440,590 L580,660 L720,570 L860,665 L1000,610 L1140,700 L1280,605 L1420,675 L1560,590 L1700,680 L1840,600 L1980,670 L2120,585 L2260,660 L2400,610 L2400,840 Z"/>',
    // 中景山
    '<path class="s-mid" d="M0,840 L0,760 L170,715 L330,780 L500,705 L670,770 L840,720 L1010,785 L1180,715 L1350,775 L1520,720 L1690,780 L1860,725 L2030,775 L2200,720 L2400,760 L2400,840 Z"/>',
    // 近处丘陵
    '<path class="s-hill" d="M0,840 L0,795 C180,755 340,805 520,790 C700,776 860,815 1040,798 C1220,782 1400,812 1580,798 C1760,785 1940,812 2120,795 C2240,785 2330,800 2400,792 L2400,840 Z"/>',

    '<rect class="s-ground" x="0" y="840" width="' + W + '" height="' + (H - 840) + '"/>',
    '<path class="s-road" d="M1070,1350 L1230,1350 L1216,840 L1184,840 Z"/>',

    // 远处的小房子
    '<g class="s-house">',
      '<rect class="s-house-body" x="1472" y="858" width="96" height="72"/>',
      '<path class="s-house-roof" d="M1456,858 L1520,812 L1584,858 Z"/>',
      '<rect class="s-house-window" x="1508" y="878" width="24" height="26"/>',
      '<rect class="s-house-door" x="1480" y="898" width="16" height="32"/>',
    '</g>',
    '<g class="s-house">',
      '<rect class="s-house-body" x="1626" y="880" width="64" height="48"/>',
      '<path class="s-house-roof" d="M1614,880 L1658,848 L1702,880 Z"/>',
      '<rect class="s-house-window" x="1644" y="894" width="16" height="18"/>',
    '</g>',
    '<g class="s-house">',
      '<rect class="s-house-body" x="1330" y="900" width="56" height="40"/>',
      '<path class="s-house-roof" d="M1318,900 L1358,870 L1398,900 Z"/>',
    '</g>',

    // 左右两棵树
    '<g class="s-tree">',
      '<rect class="s-trunk" x="732" y="930" width="18" height="130"/>',
      '<circle class="s-canopy" cx="741" cy="890" r="74"/>',
      '<circle class="s-canopy" cx="690" cy="930" r="50"/>',
      '<circle class="s-canopy" cx="792" cy="930" r="50"/>',
    '</g>',
    '<g class="s-tree">',
      '<rect class="s-trunk" x="1952" y="900" width="16" height="110"/>',
      '<circle class="s-canopy" cx="1960" cy="866" r="60"/>',
      '<circle class="s-canopy" cx="1920" cy="900" r="40"/>',
      '<circle class="s-canopy" cx="2000" cy="900" r="40"/>',
    '</g>',

    // 飞鸟
    '<path class="s-bird" d="M1040,430 q8,-8 16,0 q8,-8 16,0"/>',
    '<path class="s-bird" d="M1124,408 q6,-6 12,0 q6,-6 12,0"/>',
    '</g>',

    // 人形剪影：身高 300，脚底 960，头顶 655
    '<g class="s-subject">',
    '<ellipse class="s-shadow" cx="1200" cy="966" rx="52" ry="9"/>',
    '<path class="s-figure" d="M1180,834 L1198,834 L1196,958 L1184,958 Z"/>',
    '<path class="s-figure" d="M1202,834 L1220,834 L1218,958 L1206,958 Z"/>',
    '<path class="s-figure" d="M1160,742 Q1200,730 1240,742 L1233,832 Q1200,842 1167,832 Z"/>',
    '<path class="s-figure" d="M1163,748 Q1147,800 1145,850 L1159,854 Q1167,802 1181,760 Z"/>',
    '<path class="s-figure" d="M1237,748 Q1253,800 1255,850 L1241,854 Q1233,802 1219,760 Z"/>',
    '<rect class="s-figure" x="1191" y="712" width="18" height="30"/>',
    '<ellipse class="s-figure" cx="1200" cy="686" rx="27" ry="31"/>',

    // 脸部细节（细线不随缩放变粗）
    '<g>',
      '<path class="s-brow" vector-effect="non-scaling-stroke" d="M1185,672 C1189,668 1194,668 1199,671"/>',
      '<path class="s-brow" vector-effect="non-scaling-stroke" d="M1201,671 C1206,668 1211,668 1215,672"/>',
      '<ellipse class="s-eye" cx="1191.5" cy="682.5" rx="5.8" ry="3.3"/>',
      '<ellipse class="s-eye" cx="1208.5" cy="682.5" rx="5.8" ry="3.3"/>',
      '<circle class="s-pupil" cx="1192.8" cy="682.8" r="1.5"/>',
      '<circle class="s-pupil" cx="1207.2" cy="682.8" r="1.5"/>',
      '<path class="s-line" vector-effect="non-scaling-stroke" d="M1200,682 L1197.5,698 Q1200,701 1204,698"/>',
      '<path class="s-line" vector-effect="non-scaling-stroke" d="M1189,709 Q1200,714 1211,709"/>',
    '</g>',
    '</g>'
  ].join('');

  // 顶视图：鸟瞰/顶拍用的正上方俯视场景（同一片田野，换一个观察方向）
  var TOP = [
    '<rect class="s-ground" x="0" y="0" width="' + W + '" height="' + H + '"/>',
    '<rect class="s-field" x="180" y="140" width="640" height="340"/>',
    '<rect class="s-field" x="1620" y="120" width="620" height="420"/>',
    '<rect class="s-field" x="220" y="760" width="500" height="380"/>',
    '<rect class="s-field" x="1700" y="760" width="540" height="400"/>',
    '<rect class="s-road" x="1148" y="0" width="104" height="1350"/>',
    '<path class="s-road-line" d="M1200,30 L1200,1320"/>',

    '<g class="s-house">',
      '<rect class="s-house-roof" x="1398" y="596" width="132" height="108"/>',
      '<path class="s-house-ridge" d="M1464,596 L1464,704"/>',
      '<rect class="s-house-chimney" x="1494" y="586" width="16" height="16"/>',
    '</g>',
    '<g class="s-house">',
      '<rect class="s-house-roof" x="1548" y="742" width="96" height="80"/>',
      '<path class="s-house-ridge" d="M1596,742 L1596,822"/>',
    '</g>',
    '<g class="s-house">',
      '<rect class="s-house-roof" x="1318" y="758" width="72" height="60"/>',
      '<path class="s-house-ridge" d="M1354,758 L1354,818"/>',
    '</g>',

    '<g class="s-tree">',
      '<circle class="s-canopy" cx="820" cy="720" r="92"/>',
      '<circle class="s-canopy" cx="782" cy="752" r="50"/>',
      '<circle class="s-canopy" cx="858" cy="752" r="50"/>',
      '<circle class="s-trunk" cx="820" cy="720" r="11"/>',
    '</g>',
    '<g class="s-tree">',
      '<circle class="s-canopy" cx="1780" cy="960" r="76"/>',
      '<circle class="s-canopy" cx="1780" cy="960" r="11" class="s-trunk"/>',
    '</g>',

    // 俯视时只能看见头顶和肩膀
    '<ellipse class="s-shadow" cx="1226" cy="812" rx="50" ry="32"/>',
    '<ellipse class="s-figure" cx="1200" cy="786" rx="56" ry="36"/>',
    '<circle class="s-figure" cx="1200" cy="756" r="29"/>'
  ].join('');

  function topView(crop) {
    var c = crop || { x: 0, y: 0, w: W, h: H };
    return '<svg class="scene" viewBox="' + c.x + ' ' + c.y + ' ' + c.w + ' ' + c.h +
      '" preserveAspectRatio="xMidYMid slice" role="img" aria-label="鸟瞰顶视场景">' +
      TOP + '</svg>';
  }

  function scene(crop) {
    return '<svg class="scene" viewBox="' + crop.x + ' ' + crop.y + ' ' + crop.w + ' ' + crop.h +
      '" preserveAspectRatio="xMidYMid slice" role="img" aria-label="同一场景的取景演示">' +
      INNER + '</svg>';
  }

  // 缩略图：整个场景上盖一层纸色遮罩，只留取景框
  function minimap(crop) {
    var dims = [
      { x: 0, y: 0, w: W, h: crop.y },
      { x: 0, y: crop.y + crop.h, w: W, h: H - crop.y - crop.h },
      { x: 0, y: crop.y, w: crop.x, h: crop.h },
      { x: crop.x + crop.w, y: crop.y, w: W - crop.x - crop.w, h: crop.h }
    ];
    var shade = dims.map(function (d) {
      return '<rect class="mini-dim" x="' + d.x + '" y="' + d.y + '" width="' + d.w + '" height="' + d.h + '"/>';
    }).join('');

    return '<svg class="mini" viewBox="0 0 ' + W + ' ' + H +
      '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + INNER + shade +
      '<circle class="mini-dot" cx="1200" cy="686" r="30" vector-effect="non-scaling-stroke"/>' +
      '<rect class="mini-frame" x="' + crop.x + '" y="' + crop.y + '" width="' + crop.w + '" height="' + crop.h +
      '" vector-effect="non-scaling-stroke"/></svg>';
  }

  window.FilmScene = {
    W: W,
    H: H,
    personHeight: 300,
    scene: scene,
    topView: topView,
    minimap: minimap
  };
})();
