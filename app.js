/* 狸奴安居 · 适猫化装修安全鉴定
 * 小工具合规版脚本：经典脚本（无 module/import）、ES2017、无内联事件、
 * 无网络请求、无 eval / Worker / a[download]。
 * 海报用 Canvas 2D 原生绘制；保存走 window.xhs.miniTool JSBridge，
 * 未注入 SDK 的环境降级为页内预览。 */
(function () {
  'use strict';

  /* ================= 状态 ================= */
  var state = { habits: [], pain: null, score: 0 };
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
      if (id === 'page-result') animateScore();
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

  Array.prototype.forEach.call(document.querySelectorAll('#habitTags .tag'), function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('on');
      var h = btn.getAttribute('data-habit');
      var i = state.habits.indexOf(h);
      if (i > -1) { state.habits.splice(i, 1); } else { state.habits.push(h); }
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('#painCards .pain'), function (btn) {
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('#painCards .pain'), function (b) {
        b.classList.remove('on');
      });
      btn.classList.add('on');
      state.pain = btn.getAttribute('data-pain');
    });
  });

  /* ================= 打分 ================= */
  function calculateScore() {
    var area = Number(areaRange.value);
    var floor = $('floorType').value;
    var s = 46;
    s += Math.round((area - 8) / 72 * 18);
    if (floor === 'loft') s += 10;
    if (floor === 'duplex') s += 14;
    var pen = { parkour: 10, high: 6, peeing: 12, alone: 0, clingy: 2, destroyer: 9 };
    for (var i = 0; i < state.habits.length; i++) { s -= pen[state.habits[i]] || 0; }
    var painPen = { window: 12, furniture: 8, litter: 8, aesthetic: 3 };
    if (state.pain) { s -= painPen[state.pain] || 0; }
    return Math.max(5, Math.min(96, s));
  }

  function moodOf(score) {
    if (score >= 80) return { text: '惬意躺平 🍃', comment: '你家底子不错，主子已经翻出肚皮了。稍加布置，就是它眼里最好的人间。' };
    if (score >= 60) return { text: '眯眼打盹 😌', comment: '整体安全，但有几处小刺挠。按下面的建议补齐，主子能睡得更沉。' };
    if (score >= 40) return { text: '耳朵警惕 👀', comment: '有几处隐患正让主子如坐针毡。别急，装修前改图纸，比入住后拆墙省十倍力气。' };
    return { text: '炸毛紧张 ⚡', comment: '警告：当前方案对猫不太友好。好在你在装修前看到了这份报告——现在改，一切都来得及。' };
  }

  function catFaceSVG(score) {
    var scared = score < 40;
    var alert = score >= 40 && score < 60;
    var cozy = score >= 60;
    var eye;
    if (cozy) {
      eye = '<path d="M-14 -2 Q -9 -8 -4 -2 M4 -2 Q 9 -8 14 -2" stroke="#F5F0E8" stroke-width="3" fill="none" stroke-linecap="round"/>';
    } else if (alert) {
      eye = '<circle cx="-9" cy="-3" r="3.4" fill="#F5F0E8"/><circle cx="9" cy="-3" r="3.4" fill="#F5F0E8"/>';
    } else {
      eye = '<circle cx="-9" cy="-3" r="4.4" fill="#F5F0E8"/><circle cx="-9" cy="-3" r="1.8" fill="#2B2B2B"/>'
          + '<circle cx="9" cy="-3" r="4.4" fill="#F5F0E8"/><circle cx="9" cy="-3" r="1.8" fill="#2B2B2B"/>';
    }
    var fur = scared
      ? '<g stroke="#2B2B2B" stroke-width="2.4" stroke-linecap="round">'
        + '<path d="M-24 -24 L-32 -34"/><path d="M-16 -30 L-20 -42"/>'
        + '<path d="M16 -30 L20 -42"/><path d="M24 -24 L32 -34"/></g>'
      : '';
    var mouth = scared
      ? '<ellipse cx="0" cy="15" rx="4" ry="5" fill="none" stroke="#F5F0E8" stroke-width="2"/>'
      : '<path d="M0 10 Q -5 15 -9 12 M0 10 Q 5 15 9 12" stroke="#F5F0E8" stroke-width="2" fill="none" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 100 80" style="width:100%;height:100%;">' + fur
      + '<g transform="translate(50,46)">'
      + '<circle cx="0" cy="0" r="28" fill="#2B2B2B"/>'
      + '<path d="M-20 -16 L-27 -38 L-6 -26 Z" fill="#2B2B2B"/>'
      + '<path d="M20 -16 L27 -38 L6 -26 Z" fill="#2B2B2B"/>'
      + '<path d="M-18 -19 L-22 -31 L-10 -24 Z" fill="#FF9E7D"/>'
      + '<path d="M18 -19 L22 -31 L10 -24 Z" fill="#FF9E7D"/>'
      + eye
      + '<path d="M-2 7 L2 7 L0 10 Z" fill="#FF9E7D"/>'
      + mouth
      + '<g stroke="#2B2B2B" stroke-width="1.4" opacity=".55" stroke-linecap="round">'
      + '<path d="M-22 6 L-38 2"/><path d="M-22 10 L-38 12"/>'
      + '<path d="M22 6 L38 2"/><path d="M22 10 L38 12"/></g>'
      + '</g></svg>';
  }

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
    var fi = 0;
    while (list.length < 3 && fi < FALLBACK.length) { list.push(FALLBACK[fi]); fi++; }
    return list.slice(0, 3);
  }

  /* ================= 结果渲染 ================= */
  function submitForm() {
    if (state.habits.length === 0) { formTip.textContent = '至少选一个猫咪习性哦 🐾'; return; }
    if (!state.pain) { formTip.textContent = '选一个当前最头疼的事吧 😿'; return; }
    formTip.textContent = '';
    state.score = calculateScore();
    var mood = moodOf(state.score);
    $('moodText').textContent = mood.text;
    $('scoreComment').textContent = mood.comment;
    $('catMoodBox').innerHTML = catFaceSVG(state.score);

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

  function animateScore() {
    var ring = $('ringFg');
    var num = $('scoreNum');
    var C = 301.6;
    ring.style.strokeDashoffset = C;
    ring.style.stroke = state.score >= 60 ? '#7BA87B' : (state.score >= 40 ? '#FF9E7D' : '#E05A5A');
    setTimeout(function () {
      ring.style.strokeDashoffset = C * (1 - state.score / 100);
    }, 60);
    if (num._timer) { clearInterval(num._timer); }
    var cur = 0;
    num._timer = setInterval(function () {
      cur += Math.max(1, Math.ceil(state.score / 30));
      if (cur >= state.score) { cur = state.score; clearInterval(num._timer); num._timer = null; }
      num.textContent = cur;
    }, 30);
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
    ctx.fillText('适猫化装修安全鉴定报告', W / 2, 158);

    ctx.fillStyle = '#FF9E7D';
    ctx.font = 'bold 150px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(String(state.score), W / 2, 370);
    ctx.fillStyle = '#2B2B2B';
    ctx.font = '26px sans-serif';
    ctx.fillText('猫咪安心指数', W / 2, 420);
    ctx.font = 'bold 34px "Kaiti SC","STKaiti",KaiTi,serif';
    ctx.fillText(moodOf(state.score).text, W / 2, 480);

    drawCat(ctx, W / 2, 620, 85);

    ctx.fillStyle = 'rgba(43,43,43,.75)';
    ctx.font = '28px "Kaiti SC","STKaiti",KaiTi,serif';
    ctx.fillText('「溪柴火软蛮毡暖，我与狸奴不出门」', W / 2, 770);
    ctx.fillStyle = 'rgba(43,43,43,.45)';
    ctx.font = '20px serif';
    ctx.fillText('—— 陆游 ·《十一月四日风雨大作》', W / 2, 810);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#2B2B2B';
    ctx.font = '22px "PingFang SC","Microsoft YaHei",sans-serif';
    var y = 875;
    for (var i = 0; i < lastAdvice.length && y < 990; i++) {
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
    if (lastAdvice.length === 0) { toast('先生成一份鉴定报告哦 🐾'); return; }
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
    if (lastAdvice.length === 0) { toast('先生成一份鉴定报告哦 🐾'); return; }
    var dataUrl = getPosterDataUrl();
    mt.postNote({
      title: '狸奴安居鉴定报告',
      content: '我家猫咪安心指数 ' + state.score + ' 分（满分 100）！装修前先给主子做个适猫化体检，铲屎官们快来测测你家能打几分。',
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
})();
