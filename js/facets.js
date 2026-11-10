/* Glossary-only classification metadata (not a quiz or assessment). */
(function () {
  'use strict';
  const FACETS = Object.freeze({
    'shots:ews': ['取景尺度', '环境关系'],
    'shots:ws': ['取景尺度', '环境关系'],
    'shots:fs': ['取景尺度', '人物全身'],
    'shots:ms': ['取景尺度', '动作与对话'],
    'shots:mcu': ['取景尺度', '表情与对话'],
    'shots:cs': ['取景尺度', '面部'],
    'shots:cu': ['取景尺度', '细节强调'],
    'shots:ecu': ['取景尺度', '局部细节'],
    'angles:eye': ['机位与俯仰', '平视'],
    'angles:high': ['机位与俯仰', '向下拍摄'],
    'angles:low': ['机位与俯仰', '向上拍摄'],
    'angles:bird': ['机位与俯仰', '顶拍与鸟瞰'],
    'angles:dutch': ['相机姿态', '滚转倾斜'],
    'angles:ots': ['人物关系', '过肩构图'],
    'angles:pov': ['叙事视点', '角色所见'],
    'moves:push': ['相机运动', '向前移动'],
    'moves:pull': ['相机运动', '向后移动'],
    'moves:pan': ['相机运动', '原地旋转'],
    'moves:move': ['相机运动', '水平位移'],
    'moves:follow': ['相机运动', '跟随主体'],
    'moves:rise': ['相机运动', '垂直位移'],
    'moves:orbit': ['相机运动', '围绕主体'],
    'moves:handheld': ['拍摄方式', '手持操作'],
    'moves:zoom': ['光学参数', '焦距变化'],
    'frame:thirds': ['画面组织', '三分布局'],
    'frame:center': ['画面组织', '中心布局'],
    'frame:symmetry': ['画面组织', '对称关系'],
    'frame:lines': ['画面组织', '线条引导'],
    'frame:framing': ['画面组织', '框中框'],
    'frame:depth': ['空间层次', '前中后景'],
    'frame:negative': ['画面组织', '留白与主次'],
    'frame:diagonal': ['画面组织', '对角关系'],
    'light:front': ['布光方向', '顺光'],
    'light:side': ['布光方向', '侧光'],
    'light:back': ['布光方向', '逆光'],
    'light:top': ['布光方向', '顶光'],
    'light:bottom': ['布光方向', '底光'],
    'light:rim': ['布光效果', '轮廓分离'],
    'light:soft': ['光线性质', '阴影软硬'],
    'light:keylevel': ['照明风格', '高调与低调'],
    'edit:cut': ['剪辑连接', '直接切换'],
    'edit:fade': ['画面过渡', '与纯色渐变'],
    'edit:dissolve': ['画面过渡', '两镜头叠化'],
    'edit:wipe': ['画面过渡', '边界扫过'],
    'edit:jump': ['剪辑连接', '不连续跳切'],
    'edit:match': ['剪辑连接', '视觉或意义匹配']
  });

  function facetHTML(sectionId, termId) {
    const tags = FACETS[sectionId + ':' + termId];
    if (!tags) return '';
    // FACETS 由本地常量定义，内容为无特殊标记的固定文本。
    return '<p class="facet-row" aria-label="知识维度"><span>知识维度</span><b>' +
      tags[0] + '</b><i>·</i><b>' + tags[1] + '</b></p>';
  }

  window.FilmFacets = { FACETS, facetHTML };
})();
