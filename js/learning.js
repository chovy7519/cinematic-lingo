/*
 * V0.2: 正交知识标签 + 辨析练习。
 * 六个章节保留旧导航，但“镜头景别/视点/机位/光质/剪辑方式”等维度不再被混为一类。
 * 纯原生 DOM；无请求、无账户、无持久化，刷新后可重新练习。
 */
(function () {
  'use strict';

  // 分类键为 <章节>:<术语ID>，必须和 js/data/*.js 的 46 条内容一一对应。
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

  // 术语链接必须是已经存在的卡片 ID；可通过 scripts/check-project.mjs 自动核对。
  const EXERCISES = Object.freeze([
    {
      id: 'dolly-zoom',
      title: '推镜 / 变焦',
      question: '人物的取景大小差不多，但背景相对人物的大小改变了。最可能改变的是什么？',
      choices: ['只在原地调整焦距', '摄影机与主体的相对位置', '仅对已有画面进行裁切'],
      correct: 1,
      explanation: '固定机位改变焦距只会改变视角；空间透视与前后景比例由机位关系决定。可以配合焦距调整，让人物在画面中保持相近大小。',
      links: [{href:'#moves-push',label:'查看推镜'}, {href:'#moves-zoom',label:'查看变焦'}, {href:'lab.html',label:'打开 3D 对照'}]
    },
    {
      id: 'ots-pov',
      title: '过肩镜头 / 主观视角',
      question: '画面前景能看到 A 的肩膀，主要拍摄 A 对面的 B。这最典型地属于哪种构图？',
      choices: ['过肩镜头', '主观视角', '鸟瞰顶拍'],
      correct: 0,
      explanation: '过肩镜头通过前景的肩部交代两个人的位置关系；POV 是让观众理解为角色所见，两者不是同一个概念维度。',
      links: [{href:'#angles-ots',label:'查看过肩'}, {href:'#angles-pov',label:'查看 POV'}]
    },
    {
      id: 'pan-truck',
      title: '摇镜 / 移镜',
      question: '摄影机的支点保持在原处，只向左右改变拍摄方向，这属于什么？',
      choices: ['水平移镜 Truck', '环绕 Orbit', '水平摇镜 Pan'],
      correct: 2,
      explanation: 'Pan 是机位原地旋转；Truck 是相机实际平移；Orbit 是绕主体沿弧线移动。单纯二维画面横向扫过并不能证明相机真的移动了。',
      links: [{href:'#moves-pan',label:'查看摇镜'}, {href:'#moves-move',label:'查看移镜'}]
    },
    {
      id: 'soft-highkey',
      title: '柔光 / 高调',
      question: '如果想让人物脸上的阴影边缘更柔和，最直接影响它的是哪项？',
      choices: ['把相机升高到俯拍位置', '增加光源相对主体的视角大小', '单纯提高画面整体曝光'],
      correct: 1,
      explanation: '柔硬光主要与光源的相对大小有关；高调则是一种整体照明反差与亮度组织。画面亮，不等于光线就柔。',
      links: [{href:'#light-soft',label:'查看柔硬光'}, {href:'#light-keylevel',label:'查看高低调'}]
    }
  ]);

  function facetHTML(sectionId, termId) {
    const tags = FACETS[sectionId + ':' + termId];
    if (!tags) return '';
    // FACETS 由本地常量定义，内容为无特殊标记的固定文本。
    return '<p class="facet-row" aria-label="知识维度"><span>知识维度</span><b>' +
      tags[0] + '</b><i>·</i><b>' + tags[1] + '</b></p>';
  }

  function element(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function render(host) {
    if (!host) return;
    host.replaceChildren();
    const intro = element('div','learning-head');
    const introCopy = element('div');
    introCopy.append(element('p','kicker','V0.2 / CONCEPT CHECK'));
    introCopy.append(element('h2','learning-title','先辨析，再看镜头'));
    introCopy.append(element('p','learning-desc','六章是浏览目录，不是互斥的摄影维度。先尝试四道易混淆知识题；选错后也能直接跳到对应术语观看动画。'));
    intro.append(introCopy);
    const progress = element('p','learning-progress');
    progress.setAttribute('role','status');
    progress.setAttribute('aria-live','polite');
    intro.append(progress);
    host.append(intro);

    const grid = element('div','learning-grid');
    host.append(grid);
    const chosen = new Map();
    const refs = [];

    const updateProgress = () => {
      let correctCount = 0;
      for (const exercise of EXERCISES) {
        if (chosen.get(exercise.id) === exercise.correct) correctCount++;
      }
      progress.textContent = '已练习 ' + chosen.size + ' / ' + EXERCISES.length + ' · 判断正确 ' + correctCount;
    };

    for (const exercise of EXERCISES) {
      const card = element('article','learning-card');
      const head = element('h3','learning-card-title',exercise.title);
      const question = element('p','learning-question',exercise.question);
      const choiceBox = element('div','learning-choices');
      choiceBox.setAttribute('role','group');
      choiceBox.setAttribute('aria-label',exercise.title + '选项');
      const feedback = element('p','learning-feedback');
      feedback.setAttribute('role','status');
      feedback.setAttribute('aria-live','polite');
      feedback.hidden = true;
      const linkBox=element('div','learning-links');
      for (const link of exercise.links) {
        const a=element('a',null,link.label);
        a.href=link.href;
        linkBox.append(a);
      }
      const buttons=[];
      exercise.choices.forEach((choice,index)=>{
        const button=element('button','learning-choice',String.fromCharCode(65+index)+' · '+choice);
        button.type='button';
        button.setAttribute('aria-pressed','false');
        button.addEventListener('click',()=>{
          chosen.set(exercise.id,index);
          buttons.forEach((btn,j)=>{
            btn.setAttribute('aria-pressed',String(j===index));
            btn.dataset.result=j===index?(index===exercise.correct?'correct':'incorrect'):'';
          });
          const correct=index===exercise.correct;
          feedback.hidden=false;
          feedback.dataset.result=correct?'correct':'incorrect';
          feedback.textContent=(correct?'判断正确。':'还可以再想想。')+exercise.explanation;
          updateProgress();
        });
        buttons.push(button);
        choiceBox.append(button);
      });
      card.append(head,question,choiceBox,feedback,linkBox);
      grid.append(card);
      refs.push({buttons,feedback});
    }
    const foot=element('div','learning-footer');
    foot.append(element('p',null,'这些练习只验证几个关键概念，不构成完整的学习成绩评估。'));
    const reset=element('button','learning-reset','重新练习');
    reset.type='button';
    reset.addEventListener('click',()=>{
      chosen.clear();
      refs.forEach(({buttons,feedback})=>{
        buttons.forEach(button=>{
          button.setAttribute('aria-pressed','false');
          delete button.dataset.result;
        });
        feedback.hidden=true;
        feedback.textContent='';
      });
      updateProgress();
    });
    foot.append(reset);
    host.append(foot);
    updateProgress();
  }

  window.FilmLearning={FACETS,EXERCISES,facetHTML,render};
})();
