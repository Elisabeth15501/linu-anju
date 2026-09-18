/* 狸奴安居 · 适猫化装修建议
 * 小工具合规版脚本：经典脚本（无 module/import）、ES2017、无内联事件、
 * 无网络请求、无 eval / Worker / a[download]。
 * 海报用 Canvas 2D 原生绘制；保存走 window.xhs.miniTool JSBridge，
 * 未注入 SDK 的环境降级为页内预览。
 * v0.2 方向：删除安心指数，北极星 = 画像（户型+居住情况+猫咪画像+痛点）→ 定制建议。 */
(function () {
  'use strict';

  /* ================= 状态 ================= */
  var state = { habits: [], pain: null, living: null, kids: null, allergy: null };
  var lastAdvice = [];

  function $(id) { return document.getElementById(id); }

  /* ================= 页面切换 ================= */
  var switching = false;
  function goPage(id) {
    var cur = document.querySelector('.page.active');
    if (cur && cur.id === id) return;
    if (switching) return;
    switching = true;
    function show() {
      var next = $(id);
      next.classList.add('active');
      window.scrollTo(0, 0);
      switching = false;
    }
    if (cur) {
      cur.style.animation = 'none';
      cur.style.transition = 'opacity .25s ease, transform .25s ease';
      cur.style.opacity = '0';
      cur.style.transform = 'translateY(-10px)';
      setTimeout(function () {
        cur.classList.remove('active');
        cur.style.opacity = '';
        cur.style.transform = '';
        show();
      }, 260);
    } else {
      show();
    }
  }

  /* ================= Toast ================= */
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2200);
  }

  /* ================= 输入交互 ================= */
  var areaRange = $('areaRange');
  var areaVal = $('areaVal');
  var formTip = $('formTip');

  function syncSlider() {
    areaVal.textContent = areaRange.value;
    var pct = (areaRange.value - 8) / 72 * 100;
    areaRange.style.setProperty('--fill', pct + '%');
  }
  areaRange.addEventListener('input', syncSlider);
  syncSlider();

  /* 习性：多选 */
  Array.prototype.forEach.call(document.querySelectorAll('#habitTags .tag'), function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('on');
      var h = btn.getAttribute('data-habit');
      var i = state.habits.indexOf(h);
      if (i > -1) { state.habits.splice(i, 1); } else { state.habits.push(h); }
    });
  });

  /* 单选组通用绑定（居住情况三问） */
  function singleSelect(containerId, key, attr) {
    var btns = document.querySelectorAll('#' + containerId + ' .tag');
    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(btns, function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        state[key] = btn.getAttribute(attr);
      });
    });
  }
  singleSelect('liveTags', 'living', 'data-live');
  singleSelect('kidsTags', 'kids', 'data-kids');
  singleSelect('allergyTags', 'allergy', 'data-allergy');

  /* 痛点：单选 */
  Array.prototype.forEach.call(document.querySelectorAll('#painCards .pain'), function (btn) {
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('#painCards .pain'), function (b) {
        b.classList.remove('on');
      });
      btn.classList.add('on');
      state.pain = btn.getAttribute('data-pain');
    });
  });

  /* ================= 建议库 ================= */
  var ADVICE = {
    parkour:   { for: '爱跑酷',  color: '#7BA87B', text: '利用垂直空间，安装通顶猫爬架或墙面跳板，释放地面面积；跑酷动线尽量避免正对玻璃窗和脆弱摆件。' },
    high:      { for: '喜欢高处', color: '#7BA87B', text: '在墙面错落安装 2-3 块承重跳板（间距≤40cm），或利用衣柜顶部打造制高点，猫从高处俯瞰领地会更有安全感。' },
    peeing:    { for: '玻璃胃/乱尿', color: '#E05A5A', text: '避开动线死角，预留带排气扇的柜体空间放置猫砂盆；数量建议＝猫数+1，分布在彼此听得见但闻得到的位置。' },
    destroyer: { for: '破坏王',  color: '#E05A5A', text: '沙发优选猫抓布/科技布，墙角和门框贴剑麻贴片；与其对抗天性，不如在它最爱挠的位置旁边立一个更舒服的猫抓柱。' },
    clingy:    { for: '粘人精',  color: '#FF9E7D', text: '在厨房、书桌旁预留人猫共享位——吧台边一块 30cm 深的猫台，让它守着你又不挡道。' },
    alone:     { for: '独处型',  color: '#FF9E7D', text: '给主子留一处视线好又隐蔽的猫洞（书柜挖格/床底通道），独处型的猫需要的不是热闹，是角落。' }
  };
  var PAIN_ADVICE = {
    window:    { for: '封窗安全', color: '#E05A5A', text: '必须使用金刚网纱窗（目数≤1.0cm）并做防撞加固，四角用膨胀螺丝固定；推拉窗加装限位器，开口≤10cm。' },
    furniture: { for: '家具保护', color: '#E05A5A', text: '浅色系选猫抓布、深色系选雪尼尔，都能扛爪；真皮慎入。家具腿包剑麻带，每隔 2m 设一个合法抓挠点。' },
    litter:    { for: '猫砂盆布局', color: '#E05A5A', text: '优先做浴室半分区或阳台家政柜预留位：柜内放盆、侧面开 20cm 圆洞、顶部装排气扇。别挨着洗衣机——震动会让猫拒绝如厕。' },
    aesthetic: { for: '人猫共居美学', color: '#FF9E7D', text: '走嵌入式路线：爬架换墙面木质跳板、猫窝藏进书柜格、猫砂盆进柜体，猫用品全用哑光木色/奶油色，水墨感就保住了。' }
  };
  /* 居住情况派生建议（依据：猫听觉约为人 6 倍/噪音应激源；Fel d 1 蛋白附着织物，
     ISFM 环境控制清单：硬质地面、少布艺、HEPA、卧室禁区；独处 8h+ 行为问题率上升） */
  var LIVE_ADVICE = {
    alone:  { for: '独居陪伴', color: '#FF9E7D', text: '一个人养猫，上班时间的空白靠环境填：窗边观景位 + 漏食玩具 + 藏食点轮流上岗，回家后固定 15 分钟逗猫棒时间。' },
    family: { for: '多人家庭', color: '#FF9E7D', text: '猫的听觉约为人的 6 倍，电视声和孩子哭闹都是应激源；在客厅高处留一个「退路位」，并全家统一规则——能不能上床，一个口径。' },
    share:  { for: '合租改造', color: '#FF9E7D', text: '租房大概率不能打孔：垂直空间用顶天立地猫柱、免钉层板和衣柜顶动线替代墙面跳板，搬家可带走；动工前先拿到室友同意。' }
  };
  var KIDS_ADVICE = { for: '儿童与猫共处', color: '#E05A5A', text: '婴儿房设为猫禁区，婴儿床装防护网；教孩子摸背不拽尾、猫吃饭睡觉时不打扰；猫砂盆放在孩子够不到的分区，铲屎后洗手——弓形虫和猫抓病都防在这一步。' };
  var ALLERGY_ADVICE = { for: '防过敏选材', color: '#7BA87B', text: '致敏的是 Fel d 1 蛋白不是猫毛：地面选木地板/瓷砖慎用地毯，沙发选易清洁的猫抓布，少用厚布艺窗帘，预留空气净化器电位，过敏者卧室设猫禁区。' };
  var FALLBACK = [
    { for: '动线安全', color: '#7BA87B', text: '提前规划猫高速路：从窗户到制高点的路线避开过道正上方，人走人的路，猫飞猫的桥，互不打扰。' },
    { for: '水电收纳', color: '#7BA87B', text: '裸露电线全部入槽或缠麻绳防啃，插座选带防溅盖的款式——好奇猫的舌头比你想的离插座更近。' },
    { for: '绿植预警', color: '#7BA87B', text: '装修后添绿植避开百合、绿萝、滴水观音等对猫有毒品种，选猫草、散尾葵、波士顿蕨更稳妥。' }
  ];

  function buildAdvice() {
    var list = [];
    if (state.pain && PAIN_ADVICE[state.pain]) { list.push(PAIN_ADVICE[state.pain]); }
    for (var i = 0; i < state.habits.length; i++) {
      var a = ADVICE[state.habits[i]];
      if (a) { list.push(a); }
    }
    if (state.kids === 'yes') { list.push(KIDS_ADVICE); }
    if (state.allergy === 'yes') { list.push(ALLERGY_ADVICE); }
    var la = state.living && LIVE_ADVICE[state.living];
    if (la) { list.push(la); }
    var fi = 0;
    while (list.length < 3 && fi < FALLBACK.length) { list.push(FALLBACK[fi]); fi++; }
    return list.slice(0, 5);
  }

  /* ================= 结果渲染 ================= */
  function submitForm() {
    if (state.habits.length === 0) { formTip.textContent = '至少选一个猫咪习性哦 🐾'; return; }
    if (!state.pain) { formTip.textContent = '选一个当前最头疼的事吧 😿'; return; }
    formTip.textContent = '';

    lastAdvice = buildAdvice();
    var box = $('adviceList');
    var html = '';
    for (var i = 0; i < lastAdvice.length; i++) {
      var a = lastAdvice[i];
      html += '<div class="advice card" style="margin-bottom:0;">'
        + '<div class="advice-icon" style="background:' + a.color + '22;">'
        + '<svg viewBox="0 0 40 40"><g transform="translate(20,21) scale(.42)">'
        + '<circle cx="0" cy="0" r="26" fill="#2B2B2B"/>'
        + '<path d="M-18 -15 L-25 -36 L-5 -24 Z" fill="#2B2B2B"/>'
        + '<path d="M18 -15 L25 -36 L5 -24 Z" fill="#2B2B2B"/>'
        + '<circle cx="-9" cy="-3" r="3" fill="#F5F0E8"/><circle cx="9" cy="-3" r="3" fill="#F5F0E8"/>'
        + '<path d="M-2 7 L2 7 L0 10 Z" fill="#FF9E7D"/>'
        + '<g stroke="#2B2B2B" stroke-width="1.6" opacity=".55" stroke-linecap="round"><path d="M-22 6 L-38 2"/><path d="M22 6 L38 2"/></g>'
        + '</g></svg></div>'
        + '<div class="advice-body">'
        + '<p class="advice-for" style="color:' + a.color + ';">针对「' + a.for + '」</p>'
        + '<p class="advice-text">🐾 ' + a.text + '</p>'
        + '</div></div>';
    }
    box.innerHTML = html;
    goPage('page-result');
  }

  /* ================= 避坑指南弹窗 ================= */
  var GUIDE = [
    ['🪟 封窗篇', '金刚网纱窗是底线（不是普通纱网！）；推拉窗加限位器、平开窗装儿童锁；封窗完成后做猫压测试——用手掌用力推网面，不变形才算合格。'],
    ['🧗 垂直空间篇', '跳板承重≥15kg、入墙固定件优于石膏板膨胀栓；板材选防抓面（PET 亚克力面或包剑麻）；路线终点最好是有靠背的观景台。'],
    ['💧 猫砂盆篇', '数量=猫数+1；位置避开洗衣机/空调外机等噪音源；柜体方案务必留排气扇和检修口；自动猫砂盆要预留离地 1m 插座。'],
    ['🪚 家具篇', '沙发选猫抓布/科技布；窗帘选垂直帘或百叶（布帘=猫的空中秋千）；踢脚线做圆弧处理，既防撞又好清理猫毛。'],
    ['🔌 水电篇', '电线入槽、插座防溅盖；嵌入式家电开门前先敲一敲——猫爱钻暖的机器；厨房角落别留 15-20cm 的夹缝。'],
    ['🌿 软装篇', '有毒植物黑名单：百合（剧毒！）、绿萝、滴水观音、杜鹃；猫抓柱放在它已经挠坏的地方，而不是你觉得好看的地方。']
  ];
  function openGuide() {
    var html = '';
    for (var i = 0; i < GUIDE.length; i++) {
      html += '<div class="guide-item"><p class="guide-item-title">' + GUIDE[i][0] + '</p>'
        + '<p class="guide-item-text">' + GUIDE[i][1] + '</p></div>';
    }
    $('guideContent').innerHTML = html;
    $('guideMask').classList.add('open');
  }
  function closeGuide() { $('guideMask').classList.remove('open'); }

  /* ================= 海报：Canvas 2D 原生绘制 ================= */
  function wrapText(ctx, text, maxWidth) {
    var lines = [], cur = '';
    for (var i = 0; i < text.length; i++) {
      var t = cur + text.charAt(i);
      if (ctx.measureText(t).width > maxWidth && cur) { lines.push(cur); cur = text.charAt(i); }
      else { cur = t; }
    }
    if (cur) { lines.push(cur); }
    return lines;
  }

  function drawCat(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#2B2B2B';
    ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.55); ctx.lineTo(-r * 0.95, -r * 1.35); ctx.lineTo(-r * 0.2, -r * 0.9); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(r * 0.7, -r * 0.55); ctx.lineTo(r * 0.95, -r * 1.35); ctx.lineTo(r * 0.2, -r * 0.9); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#F5F0E8'; ctx.lineWidth = r * 0.09; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.08, r * 0.2, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.08, r * 0.2, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.fillStyle = '#FF9E7D';
    ctx.beginPath(); ctx.moveTo(-r * 0.08, r * 0.25); ctx.lineTo(r * 0.08, r * 0.25); ctx.lineTo(0, r * 0.38); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#F5F0E8'; ctx.lineWidth = r * 0.06;
    ctx.beginPath(); ctx.moveTo(0, r * 0.38); ctx.quadraticCurveTo(-r * 0.15, r * 0.52, -r * 0.3, r * 0.44); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, r * 0.38); ctx.quadraticCurveTo(r * 0.15, r * 0.52, r * 0.3, r * 0.44); ctx.stroke();
    ctx.strokeStyle = 'rgba(43,43,43,.6)'; ctx.lineWidth = r * 0.045;
    var dirs = [-1, 1];
    for (var d = 0; d < 2; d++) {
      var s = dirs[d];
      ctx.beginPath(); ctx.moveTo(s * r * 0.75, r * 0.15); ctx.lineTo(s * r * 1.35, r * 0.05); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s * r * 0.75, r * 0.28); ctx.lineTo(s * r * 1.35, r * 0.33); ctx.stroke();
    }
    ctx.restore();
  }

  function drawPoster() {
    var W = 720, H = 1080;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#F5F0E8';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';

    ctx.fillStyle = '#2B2B2B';
    ctx.font = 'bold 52px "Kaiti SC","STKaiti",KaiTi,serif';
    ctx.fillText('狸奴安居', W / 2, 110);
    ctx.fillStyle = 'rgba(43,43,43,.55)';
    ctx.font = '24px sans-serif';
    ctx.fillText('适猫化装修建议', W / 2, 158);

    drawCat(ctx, W / 2, 420, 115);

    ctx.fillStyle = 'rgba(43,43,43,.75)';
    ctx.font = '28px "Kaiti SC","STKaiti",KaiTi,serif';
    ctx.fillText('「溪柴火软蛮毡暖，我与狸奴不出门」', W / 2, 640);
    ctx.fillStyle = 'rgba(43,43,43,.45)';
    ctx.font = '20px serif';
    ctx.fillText('—— 陆游 ·《十一月四日风雨大作》', W / 2, 680);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#2B2B2B';
    ctx.font = '22px "PingFang SC","Microsoft YaHei",sans-serif';
    var y = 750;
    for (var i = 0; i < lastAdvice.length && y < 985 && i < 3; i++) {
      var lines = wrapText(ctx, '🐾 ' + lastAdvice[i].for + '：' + lastAdvice[i].text, 580);
      for (var j = 0; j < lines.length && j < 2; j++) {
        ctx.fillText(lines[j], 70, y);
        y += 32;
      }
      y += 12;
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(43,43,43,.35)';
    ctx.font = '18px sans-serif';
    ctx.fillText('狸奴安居 · 小红书装修小工具', W / 2, 1045);
    return c;
  }

  function getPosterDataUrl() { return drawPoster().toDataURL('image/png'); }

  /* JSBridge 判空与调用（严格按 jsbridge-api.md 约定） */
  function getMiniTool() {
    return (window.xhs && window.xhs.miniTool && typeof window.xhs.miniTool.saveImageToPhotosAlbum === 'function')
      ? window.xhs.miniTool : null;
  }

  function exportPoster() {
    if (lastAdvice.length === 0) { toast('先生成一份建议哦 🐾'); return; }
    var dataUrl = getPosterDataUrl();
    var mt = getMiniTool();
    if (mt) {
      var p = Promise.resolve(dataUrl);
      if (typeof mt.writeTempFile === 'function') {
        p = mt.writeTempFile({ data: dataUrl }).then(function (res) { return res.filePath; });
      }
      p.then(function (filePath) {
        return mt.saveImageToPhotosAlbum({ filePath: filePath });
      }).then(function () {
        toast('海报已保存到相册 🐾');
      }).catch(function (err) {
        toast('保存失败：' + ((err && err.errMsg) || '未知原因'));
      });
    } else {
      /* 非 SDK 环境（浏览器预览）：降级为页内预览 */
      $('posterImg').src = dataUrl;
      $('posterHint').textContent = '当前环境无法直接写相册，长按图片即可保存';
      $('posterMask').classList.add('open');
    }
  }

  function publishNote() {
    var mt = getMiniTool();
    if (!mt || typeof mt.postNote !== 'function') { toast('请在小红书客户端内使用'); return; }
    if (lastAdvice.length === 0) { toast('先生成一份建议哦 🐾'); return; }
    var dataUrl = getPosterDataUrl();
    mt.postNote({
      title: '狸奴安居适猫化建议',
      content: '用「狸奴安居」给家里生成了一份适猫化装修建议，从封窗到猫砂盆柜体都安排上了，铲屎官们快来抄作业 🐾',
      pageType: 'photo_publish',
      mediaInfo: { image_resources: [{ url: dataUrl }] }
    }).then(function () {
      toast('已唤起发布页，等你点发布 📤');
    }).catch(function (err) {
      toast('发布失败：' + ((err && err.errMsg) || '未知原因'));
    });
  }

  function closePoster() { $('posterMask').classList.remove('open'); }

  /* ================= 事件绑定 ================= */
  $('btnStart').addEventListener('click', function () { goPage('page-input'); });
  $('btnBackHome').addEventListener('click', function () { goPage('page-home'); });
  $('btnBackInput').addEventListener('click', function () { goPage('page-input'); });
  $('btnSubmit').addEventListener('click', submitForm);
  $('btnGuide').addEventListener('click', openGuide);
  $('btnCloseGuide').addEventListener('click', closeGuide);
  $('btnSavePoster').addEventListener('click', exportPoster);
  $('btnPostNote').addEventListener('click', publishNote);
  $('btnClosePoster').addEventListener('click', closePoster);
  $('guideMask').addEventListener('click', function (e) { if (e.target === this) closeGuide(); });
  $('posterMask').addEventListener('click', function (e) { if (e.target === this) closePoster(); });

  /* 有端能力 SDK 时才显示发布按钮 */
  if (getMiniTool() && typeof getMiniTool().postNote === 'function') {
    $('btnPostNote').style.display = '';
  }

  /* 容器环境：给 body 打标记，CSS 据此让出顶部原生标题栏高度，
     避免页面返回键与容器返回/分享按钮重叠（浏览器预览不加，版面不变） */
  if (getMiniTool()) {
    document.body.className += ' xhs-app';
  }
})();
