// Pass Pilot – Oberflaeche
'use strict';
(function () {
  var PP = window.PP, E = PP.E, t = PP.t, esc = PP.esc;
  var $app = document.getElementById('app'), $tabs = document.getElementById('tabs'), $ov = document.getElementById('ov');
  var route = { n: 'home' }, Q = null, X = null, timer = 0, obStep = 0;

  function h(s) { $app.innerHTML = s; $app.scrollTop = 0; }
  function q(s, el) { return (el || document).querySelector(s); }
  function qa(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function go(r) { PP.hush(); clearInterval(timer); route = r; render(); }
  function S() { return PP.S; }
  var I = {
    back: '<path d="M15 5l-7 7l7 7"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>', gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3a1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5a1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1a1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5a1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    home: '<path d="M3 11l9-7l9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>', book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>', exam: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', speak: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/>', mark: '<path d="M6 3h12v18l-6-4l-6 4z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', fire: '<path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5c0 2 1 3 2 3c0-3 1-5.5 1-8.5z"/>', clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M7 7l10 10M17 7L7 17"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', bolt: '<path d="M13 2L4 14h7l-1 8l9-12h-7z"/>', target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    pin: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>', trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'
  };
  function ic(n, cls) { return '<svg viewBox="0 0 24 24" class="i ' + (cls || '') + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[n] + '</svg>'; }
  function top(title, back, extra) { return '<header class="top"><button class="ib" data-go="' + (back || 'home') + '" aria-label="' + t('back') + '">' + ic('back', 'flip') + '</button><h1>' + esc(title) + '</h1><span class="sp"></span>' + (extra || '') + '</header>'; }
  function ring(frac, inner, sub, size) { var r = 42, c = 2 * Math.PI * r; return '<div class="ring" style="--sz:' + (size || 120) + 'px"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="' + r + '" class="rg-bg"/><circle cx="50" cy="50" r="' + r + '" class="rg-fg" stroke-dasharray="' + (c * Math.max(0.001, Math.min(1, frac))).toFixed(1) + ' ' + c.toFixed(1) + '"/></svg><div class="rg-in"><b>' + inner + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div></div>'; }
  function modal(html) { $ov.innerHTML = '<div class="ovbg" data-act="closeModal"></div><div class="sheet">' + html + '</div>'; $ov.classList.add('on'); }
  function closeModal() { $ov.classList.remove('on'); $ov.innerHTML = ''; }
  function confirmBox(msg, yesLabel, yes) { modal('<p class="cfm">' + esc(msg) + '</p><div class="row2"><button class="btn ghost" data-act="closeModal">' + t('cancel') + '</button><button class="btn danger" id="cfY">' + esc(yesLabel) + '</button></div>'); q('#cfY').onclick = function () { closeModal(); yes(); }; }
  function toast(msg, cls) { var s = document.getElementById('toast'); s.innerHTML = msg; s.className = 'on ' + (cls || ''); clearTimeout(toast.t); toast.t = setTimeout(function () { s.className = ''; }, 2600); }
  function tabs(active) {
    if (!active) { $tabs.innerHTML = ''; document.body.classList.remove('hastabs'); return; }
    document.body.classList.add('hastabs');
    $tabs.innerHTML = [['home', 'home', 'tabHome'], ['learn', 'book', 'tabLearn'], ['examIntro', 'exam', 'tabExam'], ['stats', 'chart', 'tabStats']].map(function (x) {
      return '<button class="tab ' + (x[0] === active ? 'on' : '') + '" data-go="' + x[0] + '">' + ic(x[1]) + '<span>' + t(x[2]) + '</span></button>'; }).join('');
  }
  function stateLabel() { return PP.stateName(S().set.state) || '—'; }
  function today() { return S().days[E.dayKey()] || 0; }

  // ---------- Onboarding ----------
  function vOnboard() {
    tabs(null); var s = S().set, step = obStep;
    var dots = '<div class="dots">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i === step ? 'on' : '') + '"></i>'; }).join('') + '</div>';
    var body = '';
    if (step === 0) body = '<div class="ob-hero"><div class="logo-big">' + logo() + '</div><h1>' + t('ob1t') + '</h1><p>' + t('ob1s') + '</p></div>' +
      '<label class="lab">' + t('obLang') + '</label><div class="chips wrap">' + PP.UILANGS.map(function (l) { return '<button class="chip ' + (PP.lang() === l[0] ? 'on' : '') + '" data-ui="' + l[0] + '">' + l[1] + '</button>'; }).join('') + '</div>';
    if (step === 1) body = '<h2 class="ob-h">' + t('obState') + '</h2><p class="muted">' + t('obStateS') + '</p><div class="states">' + PP.STATES.map(function (st) { return '<button class="stb ' + (s.state === st.code ? 'on' : '') + '" data-st="' + st.code + '">' + esc(st.de) + '</button>'; }).join('') + '</div>';
    if (step === 2) body = '<h2 class="ob-h">' + t('obTr') + '</h2><p class="muted">' + t('obTrS') + '</p><div class="chips wrap">' + PP.TRLANGS.map(function (l) { return '<button class="chip ' + (s.tr === l[0] ? 'on' : '') + '" data-tr="' + l[0] + '">' + l[1] + '</button>'; }).join('') + '</div>' +
      '<div class="demo-q card"><p class="dq-de" dir="ltr">Wer wählt in Deutschland die Abgeordneten zum Bundestag?</p><p class="dq-tr" id="demoTr"></p></div>';
    if (step === 3) body = '<h2 class="ob-h">' + t('obDate') + '</h2><input type="date" class="inp" id="obDate" value="' + esc(s.date) + '">' +
      '<h2 class="ob-h">' + t('obGoal') + '</h2><div class="chips wrap">' + [10, 20, 30, 50].map(function (g) { return '<button class="chip ' + (s.goal === g ? 'on' : '') + '" data-goal="' + g + '">' + t('obGoalN', g) + '</button>'; }).join('') + '</div>';
    h('<div class="scr ob">' + dots + body + '<div class="ob-foot">' + (step ? '<button class="btn ghost" data-act="obBack">' + t('back') + '</button>' : '<span></span>') +
      '<button class="btn primary" data-act="obNext" ' + (step === 1 && !s.state ? 'disabled' : '') + '>' + (step === 3 ? t('start') : t('next')) + '</button></div></div>');
    qa('[data-ui]').forEach(function (b) { b.onclick = function () { s.ui = b.dataset.ui; PP.save(); applyLang(); vOnboard(); }; });
    qa('[data-st]').forEach(function (b) { b.onclick = function () { s.state = b.dataset.st; PP.save(); vOnboard(); }; });
    qa('[data-tr]').forEach(function (b) { b.onclick = function () { s.tr = b.dataset.tr; PP.save(); PP.loadTr(s.tr, vOnboard); }; });
    qa('[data-goal]').forEach(function (b) { b.onclick = function () { s.goal = +b.dataset.goal; PP.save(); vOnboard(); }; });
    var dt = q('#obDate'); if (dt) dt.onchange = function () { s.date = dt.value; PP.save(); };
    var demo = q('#demoTr'); if (demo) { var dq = PP.Q.filter(function (x) { return /Abgeordneten zum Bundestag/.test(x.q); })[0] || PP.Q[0]; q('.dq-de').textContent = dq.q;
      var tr = s.tr && PP.TR && PP.TR[s.tr] && PP.TR[s.tr][dq.id]; demo.textContent = tr ? tr.q : ''; demo.dir = 'auto'; }
  }
  function logo() { return '<svg viewBox="0 0 64 64" class="logo"><rect x="6" y="4" width="44" height="56" rx="7" fill="var(--navy)"/><rect x="6" y="4" width="8" height="56" rx="3" fill="#1d1d1f"/><rect x="14" y="4" width="0" height="0"/><path d="M50 22h0" /><rect x="40" y="4" width="10" height="18" fill="#DD0000"/><rect x="40" y="22" width="10" height="0" fill="#FFCC00"/><circle cx="28" cy="30" r="10" fill="none" stroke="#FFCC00" stroke-width="3"/><path d="M22 30.5l4.2 4.2L34 26" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><rect x="18" y="46" width="22" height="3" rx="1.5" fill="#ffffff55"/></svg>'; }

  // ---------- Startseite ----------
  function vHome() {
    tabs('home'); var s = S(), st = s.set.state, rd = E.readiness(s.P, st), c = E.counts(s.P, st), streak = E.streak(s.days), d = today(), goal = s.set.goal;
    var days = E.daysUntil(s.set.date), wrongN = E.wrongList(s.P, st).length, markN = Object.keys(s.marks).length;
    var pct = Math.round(rd.pass * 100);
    var bar = ['sure', 'learning', 'wrong', 'new'].map(function (k) { return '<i class="sg-' + k + '" style="flex:' + c[k] + '"></i>'; }).join('');
    h('<div class="scr home"><header class="htop"><div class="brand">' + logo() + '<div><b>' + t('app') + '</b><small>' + t('tagline') + '</small></div></div><span class="sp"></span><button class="ib" data-go="settings" aria-label="' + t('settings') + '">' + ic('gear') + '</button></header>' +
      (days !== null && days >= 0 ? '<div class="countdown">' + ic('clock') + (days === 0 ? t('today') : t('daysLeft', days)) + '</div>' : '') +
      '<section class="card hero"><div class="hero-ring">' + ring(rd.pass, pct + '%', t('ready'), 132) + '</div><div class="hero-r"><div class="segbar">' + bar + '</div>' +
      '<div class="legend">' + ['sure', 'learning', 'wrong', 'new'].map(function (k) { return '<span><i class="sg-' + k + '"></i>' + t('st_' + k) + ' <b>' + c[k] + '</b></span>'; }).join('') + '</div><small class="muted">' + t('readyS') + '</small></div></section>' +
      '<section class="duo"><div class="card mini"><span class="mi fire ' + (streak ? '' : 'off') + '">' + ic('fire') + '</span><div><b>' + (streak ? t('streak', streak) : t('streak0')) + '</b></div></div>' +
      '<div class="card mini"><span class="mi">' + ic('target') + '</span><div><b>' + (d >= goal ? t('goalDone') : t('goal')) + '</b><small>' + t('goalOf', Math.min(d, goal), goal) + '</small><i class="pbar"><em style="width:' + Math.min(100, d / goal * 100) + '%"></em></i></div></div></section>' +
      '<button class="cta" data-act="smart"><span class="cta-ic">' + ic('bolt') + '</span><span><b>' + t('cont') + '</b><small>' + t('contS') + '</small></span><span class="cta-go">›</span></button>' +
      '<section class="tiles"><button class="tile" data-go="examIntro"><span class="ti c1">' + ic('exam') + '</span><b>' + t('simul') + '</b><small>' + t('simulS') + '</small></button>' +
      '<button class="tile" data-act="wrong"><span class="ti c2">' + ic('x') + '</span><b>' + t('mistakes') + '</b><small>' + wrongN + '</small></button>' +
      '<button class="tile" data-act="marked"><span class="ti c3">' + ic('mark') + '</span><b>' + t('marked') + '</b><small>' + markN + '</small></button>' +
      '<button class="tile" data-act="land"><span class="ti c4">' + ic('pin') + '</span><b>' + t('stateQ') + '</b><small>' + esc(stateLabel()) + '</small></button></section></div>');
  }

  // ---------- Lernen ----------
  function vLearn() {
    tabs('learn'); var s = S(), st = s.set.state;
    var cats = E.CATS.map(function (c) { var cc = E.catCounts(s.P, st, c); var name = c === 'land' ? t('cat_land', stateLabel()) : t('cat_' + c);
      return '<button class="lrow card" data-cat="' + c + '"><span class="lr-ic cat-' + c + '">' + catIcon(c) + '</span><span class="lr-tx"><b>' + esc(name) + '</b><small>' + cc.sure + ' / ' + cc.total + ' · ' + t('st_sure') + '</small><i class="pbar"><em style="width:' + (cc.total ? cc.sure / cc.total * 100 : 0) + '%"></em><em class="seen" style="width:' + (cc.total ? (cc.seen - cc.sure) / cc.total * 100 : 0) + '%"></em></i></span></button>'; }).join('');
    h('<div class="scr learn"><header class="top"><h1>' + t('tabLearn') + '</h1><span class="sp"></span><button class="ib" data-go="settings">' + ic('gear') + '</button></header>' +
      '<label class="search card">' + ic('search') + '<input id="srch" placeholder="' + esc(t('searchPh')) + '" autocomplete="off"></label><div id="srchRes"></div>' +
      '<button class="lrow card all" data-cat="all"><span class="lr-ic cat-all">' + ic('book') + '</span><span class="lr-tx"><b>' + t('allQ') + '</b><small>' + E.pool(st).length + '</small></span></button>' + cats + '</div>');
    var inp = q('#srch'); inp.oninput = function () { var v = inp.value.trim().toLowerCase(), out = q('#srchRes'); if (v.length < 2) { out.innerHTML = ''; return; }
      var res = E.pool(st).filter(function (x) { return x.id.toLowerCase() === v || x.q.toLowerCase().indexOf(v) >= 0 || x.o.some(function (o) { return o.toLowerCase().indexOf(v) >= 0; }); }).slice(0, 30);
      out.innerHTML = res.length ? res.map(rowQ).join('') : '<p class="muted pad">' + t('none') + '</p>'; };
  }
  function catIcon(c) { var m = { hist: '🏛', rights: '⚖️', const: '📜', demo: '🗳', elect: '✉️', law: '🏢', fed: '🗺', work: '💼', society: '👪', land: '📍' }; return '<span class="emo">' + (m[c] || '•') + '</span>'; }
  function rowQ(x) { var s = E.status(S().P[x.id]); return '<button class="qrow" data-q="' + x.id + '"><span class="dot st-' + s + '"></span><span class="qn">' + esc(x.id) + '</span><span class="qt" dir="ltr">' + esc(x.q) + '</span></button>'; }
  function vList() {
    tabs('learn'); var s = S(), st = s.set.state, cat = route.cat, f = route.f || 'all';
    var ids = cat === 'all' ? E.all(st) : cat === 'wrong' ? E.wrongList(s.P, st) : cat === 'marked' ? Object.keys(s.marks).filter(function (id) { return E.byId(id); }) : E.byCat(st, cat);
    var list = ids.map(E.byId).filter(function (x) { return f === 'all' || E.status(s.P[x.id]) === f; });
    var title = cat === 'all' ? t('allQ') : cat === 'wrong' ? t('mistakes') : cat === 'marked' ? t('marked') : cat === 'land' ? t('cat_land', stateLabel()) : t('cat_' + cat);
    h('<div class="scr list">' + top(title, 'learn') + '<div class="chips scroll">' + ['all', 'new', 'wrong', 'learning', 'sure'].map(function (k) { return '<button class="chip ' + (f === k ? 'on' : '') + '" data-f="' + k + '">' + (k === 'all' ? t('allQ') : t('st_' + k)) + '</button>'; }).join('') + '</div>' +
      (list.length ? '<button class="btn primary wide" data-act="practiceList">' + ic('bolt') + t('cont') + ' (' + list.length + ')</button><div class="qlist card">' + list.map(rowQ).join('') + '</div>' : '<p class="empty">' + (cat === 'wrong' ? t('noneWrong') : cat === 'marked' ? t('noneMarked') : t('none')) + '</p>') + '</div>');
    qa('[data-f]').forEach(function (b) { b.onclick = function () { route.f = b.dataset.f; vList(); }; });
    route._list = list.map(function (x) { return x.id; });
  }

  // ---------- Ueben ----------
  function startQuiz(ids, mode, title) { if (!ids.length) { toast(t('none')); return; } Q = { ids: ids, i: 0, mode: mode, title: title, ok: 0, combo: 0, res: [], orders: {} }; go({ n: 'quiz' }); }
  function vQuiz() {
    tabs(null); var s = S(), id = Q.ids[Q.i], x = E.byId(id), n = Q.ids.length, tr = PP.trOf(id);
    var order = Q.orders[id] || (Q.orders[id] = E.order(x, s.set.mix)), showTr = s.set.showTr !== false && !!tr, marked = !!s.marks[id];
    var answered = Q.res[Q.i] !== undefined;
    h('<div class="scr quiz"><header class="qtop"><button class="ib" data-act="quitQuiz" aria-label="' + t('back') + '">' + ic('close') + '</button><div class="qprog"><i style="width:' + ((Q.i + (answered ? 1 : 0)) / n * 100) + '%"></i></div><span class="qcount">' + (Q.i + 1) + '/' + n + '</span></header>' +
      '<div class="qmeta"><span class="tag">' + esc(x.l ? t('cat_land', PP.stateName(x.l)) : t('cat_' + x.c)) + '</span><span class="tag ghost">' + t('qNum', x.id) + '</span><span class="sp"></span>' +
      (tr ? '<button class="ib sm ' + (showTr ? 'on' : '') + '" data-act="toggleTr" aria-label="' + t('showTr') + '">' + ic('globe') + '</button>' : '') +
      '<button class="ib sm" data-act="say" aria-label="' + t('listen') + '">' + ic('speak') + '</button><button class="ib sm ' + (marked ? 'on mk' : '') + '" data-act="mark" aria-label="' + t('mark') + '">' + ic('mark') + '</button></div>' +
      '<h2 class="qtext" dir="ltr" lang="de">' + esc(x.q) + '</h2>' + (showTr ? '<p class="qtr" dir="auto">' + esc(tr.q) + '</p>' : '') +
      (x.img ? '<figure class="qimg" data-act="zoom"><img src="data/img/' + x.img + '" alt="">' + (x.cr ? '<figcaption>' + t('imgCredit') + ' ' + esc(x.cr) + '</figcaption>' : '') + '</figure>' : '') +
      '<div class="answers">' + order.map(function (oi, k) { return '<button class="ans" data-a="' + oi + '"><span class="al">' + 'ABCD'[k] + '</span><span class="at"><span dir="ltr" lang="de">' + esc(x.o[oi]) + '</span>' + (showTr && tr.o[oi] && tr.o[oi].trim() !== x.o[oi].trim() ? '<small dir="auto">' + esc(tr.o[oi]) + '</small>' : '') + '</span></button>'; }).join('') + '</div>' +
      '<div id="fb"></div><span class="combo" id="combo"></span></div>');
    if (answered) showFeedback(Q.res[Q.i].chosen, true); else if (s.set.speech) setTimeout(function () { PP.say(x.q); }, 300);
    qa('[data-a]').forEach(function (b) { b.onclick = function () { if (Q.res[Q.i] !== undefined) return; answerQuiz(+b.dataset.a); }; });
  }
  function answerQuiz(oi) {
    var s = S(), id = Q.ids[Q.i], x = E.byId(id), ok = oi === x.a;
    E.answer(s.P, id, ok); Q.res[Q.i] = { chosen: oi, ok: ok };
    s.days[E.dayKey()] = (s.days[E.dayKey()] || 0) + 1; s.stats.answered++; ok ? s.stats.right++ : s.stats.wrong++;
    if (ok) { Q.ok++; Q.combo++; s.stats.bestCombo = Math.max(s.stats.bestCombo, Q.combo); } else Q.combo = 0;
    PP.save();
    PP.sfx(ok ? (Q.combo && Q.combo % 5 === 0 ? 'combo' : 'ok') : 'no'); PP.buzz(ok ? 'ok' : 'no');
    if (ok && Q.combo >= 5 && Q.combo % 5 === 0) { var c = q('#combo'); c.textContent = '🔥 ' + t('combo', Q.combo); c.className = 'combo on'; }
    if (s.days[E.dayKey()] === s.set.goal) setTimeout(function () { toast('🎯 ' + t('goalDone'), 'good'); PP.confetti(80); PP.sfx('win'); }, 400);
    showFeedback(oi, false); checkBadges();
  }
  function showFeedback(oi, quiet) {
    var s = S(), id = Q.ids[Q.i], x = E.byId(id), ok = oi === x.a, tr = PP.trOf(id), showTr = s.set.showTr !== false && !!tr;
    qa('[data-a]').forEach(function (b) { var a = +b.dataset.a; b.disabled = true; if (a === x.a) b.classList.add('right'); else if (a === oi) b.classList.add('wrong'); else b.classList.add('dim'); });
    var R = t('right'); var head = ok ? R[(Q.i + x.n) % R.length] : t('wrong');
    var expl = x.x ? '<details class="expl" ' + (ok ? '' : 'open') + '><summary>' + ic('info') + t('why') + '</summary><p dir="ltr" lang="de">' + esc(x.x) + '</p>' + (showTr && tr.x ? '<p class="xtr" dir="auto">' + esc(tr.x) + '</p>' : '') + '</details>' : '';
    q('#fb').innerHTML = '<div class="fb ' + (ok ? 'ok' : 'no') + '"><div class="fb-h">' + ic(ok ? 'check' : 'x') + '<b>' + esc(head) + '</b></div>' + (ok ? '' : '<p class="fb-c">' + t('correctIs') + ' <b dir="ltr">' + esc(x.o[x.a]) + '</b></p>') + expl +
      '<button class="btn primary wide" data-act="nextQ">' + t('nextQ') + ' ›</button></div>';
    if (!quiet) setTimeout(function () { var f = q('#fb'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 60);
  }
  function nextQ() { if (Q.i + 1 >= Q.ids.length) return go({ n: 'done' }); Q.i++; vQuiz(); }
  function vDone() {
    tabs(null); var n = Q.res.filter(Boolean).length, ok = Q.ok, frac = n ? ok / n : 0;
    var wrongIds = Q.ids.filter(function (id, i) { return Q.res[i] && !Q.res[i].ok; });
    h('<div class="scr done"><div class="done-card card">' + ring(frac, ok + '/' + n, '', 150) + '<h1>' + t('done') + '</h1><p class="muted">' + t('doneS', ok, n) + '</p>' +
      '<div class="done-stats"><div><b>' + Math.round(E.readiness(S().P, S().set.state).pass * 100) + '%</b><small>' + t('ready') + '</small></div><div><b>' + E.streak(S().days) + '</b><small>' + t('best').split(' ')[0] + ' 🔥</small></div></div></div>' +
      '<button class="btn primary wide" data-act="smart">' + ic('bolt') + t('again') + '</button>' + (wrongIds.length ? '<button class="btn wide" data-act="redoWrong">' + t('reviewWrong') + ' (' + wrongIds.length + ')</button>' : '') + '<button class="btn ghost wide" data-go="home">' + t('home') + '</button></div>');
    Q._wrong = wrongIds; if (frac >= 0.8) { PP.confetti(110); PP.sfx('win'); }
  }

  // ---------- Pruefung ----------
  function vExamIntro() {
    tabs('examIntro'); var s = S(), ex = s.exams.slice(-12);
    var hist = ex.length ? '<div class="hist card">' + ex.map(function (e) { return '<div class="hbar ' + (e.ok >= 17 ? 'pass' : 'fail') + '"><i style="height:' + (e.ok / 33 * 100) + '%"></i><small>' + e.ok + '</small></div>'; }).join('') + '<span class="hline" style="bottom:calc(' + (17 / 33 * 100) + '% + 18px)"></span></div>' : '<p class="empty">' + t('noExams') + '</p>';
    h('<div class="scr examintro"><header class="top"><h1>' + t('simul') + '</h1><span class="sp"></span><button class="ib" data-go="settings">' + ic('gear') + '</button></header>' +
      '<section class="card exhero"><div class="exbig">' + ic('exam') + '</div><p>' + esc(t('examIntro', stateLabel())) + '</p>' +
      (s.exam ? '<button class="btn primary wide" data-act="resumeExam">' + t('resume') + '</button>' : '') + '<button class="btn ' + (s.exam ? '' : 'primary') + ' wide" data-act="startExam">' + ic('clock') + t('examStart') + '</button></section>' +
      '<h2 class="sec">' + t('history') + '</h2>' + hist + '</div>');
  }
  function startExam() { var s = S(); s.exam = { ids: E.exam(s.set.state), ans: [], i: 0, start: Date.now(), st: s.set.state }; PP.save(); go({ n: 'exam' }); }
  function vExam() {
    tabs(null); var s = S(); X = s.exam; if (!X) return go({ n: 'examIntro' });
    var id = X.ids[X.i], x = E.byId(id), done = X.ans.filter(function (a) { return a !== undefined && a !== null; }).length;
    h('<div class="scr quiz exam"><header class="qtop"><button class="ib" data-act="quitExam">' + ic('close') + '</button><div class="qprog"><i style="width:' + (done / 33 * 100) + '%"></i></div><span class="timer" id="timer"></span></header>' +
      '<div class="qmeta"><span class="tag">' + t('qOf', X.i + 1, 33) + '</span><span class="sp"></span><button class="ib sm" data-act="say">' + ic('speak') + '</button><button class="ib sm" data-act="grid">' + ic('grid') + '</button></div>' +
      '<h2 class="qtext" dir="ltr" lang="de">' + esc(x.q) + '</h2>' + (x.img ? '<figure class="qimg" data-act="zoom"><img src="data/img/' + x.img + '" alt="">' + (x.cr ? '<figcaption>' + t('imgCredit') + ' ' + esc(x.cr) + '</figcaption>' : '') + '</figure>' : '') +
      '<div class="answers">' + [0, 1, 2, 3].map(function (oi, k) { return '<button class="ans ' + (X.ans[X.i] === oi ? 'sel' : '') + '" data-ea="' + oi + '"><span class="al">' + 'ABCD'[k] + '</span><span class="at" dir="ltr" lang="de">' + esc(x.o[oi]) + '</span></button>'; }).join('') + '</div>' +
      '<div class="exnav"><button class="btn ghost" data-act="exPrev" ' + (X.i ? '' : 'disabled') + '>‹</button>' + (X.i === 32 || done === 33 ? '<button class="btn primary" data-act="exSubmit">' + t('examSubmit') + '</button>' : '<button class="btn primary" data-act="exNext">' + t('nextQ') + ' ›</button>') + '</div></div>');
    qa('[data-ea]').forEach(function (b) { b.onclick = function () { X.ans[X.i] = +b.dataset.ea; PP.save(); PP.sfx('tap'); PP.buzz('light'); qa('[data-ea]').forEach(function (o) { o.classList.toggle('sel', o === b); }); setTimeout(function () { if (route.n === 'exam' && X.i < 32) { X.i++; PP.save(); vExam(); } else if (route.n === 'exam') vExam(); }, 260); }; });
    tick(); clearInterval(timer); timer = setInterval(tick, 1000);
  }
  function tick() { if (!X) return; var left = E.EXAM_MIN * 60000 - (Date.now() - X.start); var el = q('#timer'); if (left <= 0) { clearInterval(timer); toast(t('timeUp')); return finishExam(); }
    if (el) { var m = Math.floor(left / 60000), sec = Math.floor(left % 60000 / 1000); el.textContent = m + ':' + (sec < 10 ? '0' : '') + sec; el.classList.toggle('warn', left < 300000); } }
  function examGrid() { modal('<h2>' + t('examGrid') + '</h2><div class="egrid">' + X.ids.map(function (id, i) { var a = X.ans[i]; return '<button class="eg ' + (a !== undefined && a !== null ? 'done' : '') + (i === X.i ? ' cur' : '') + '" data-eg="' + i + '">' + (i + 1) + '</button>'; }).join('') + '</div><button class="btn primary wide" data-act="exSubmit">' + t('examSubmit') + '</button>');
    qa('[data-eg]').forEach(function (b) { b.onclick = function () { X.i = +b.dataset.eg; closeModal(); vExam(); }; }); }
  function finishExam() {
    var s = S(); clearInterval(timer); var g = E.grade(X.ids, X.ans);
    X.ids.forEach(function (id, i) { if (X.ans[i] !== undefined && X.ans[i] !== null) { E.answer(s.P, id, X.ans[i] === E.byId(id).a); s.stats.answered++; } });
    s.days[E.dayKey()] = (s.days[E.dayKey()] || 0) + 33;
    var rec = { t: Date.now(), ok: g.ok, st: X.st, dur: Math.round((Date.now() - X.start) / 1000), ids: X.ids, ans: X.ans }; s.exams.push(rec); if (s.exams.length > 30) s.exams.shift();
    s.exam = null; PP.save(); route = { n: 'examResult', rec: s.exams.length - 1 }; render(); checkBadges();
    if (g.pass) { PP.confetti(180); PP.sfx('win'); PP.buzz('heavy'); } else PP.sfx('no');
  }
  function vExamResult() {
    tabs(null); var s = S(), r = s.exams[route.rec]; if (!r) return go({ n: 'examIntro' }); var pass = r.ok >= 17;
    var list = r.ids.map(function (id, i) { var x = E.byId(id), a = r.ans[i], ok = a === x.a;
      return '<div class="rv ' + (ok ? 'ok' : 'no') + '"><div class="rv-h"><span class="rv-n">' + (i + 1) + '</span>' + ic(ok ? 'check' : 'x') + '<span class="sp"></span><span class="tag ghost">' + t('qNum', x.id) + '</span></div><p dir="ltr" lang="de">' + esc(x.q) + '</p>' +
        (ok ? '<p class="rv-a good" dir="ltr">' + esc(x.o[x.a]) + '</p>' : '<p class="rv-a bad" dir="ltr">' + t('yourAns') + ': ' + esc(a !== undefined && a !== null ? x.o[a] : '—') + '</p><p class="rv-a good" dir="ltr">' + t('correctIs') + ' ' + esc(x.o[x.a]) + '</p>') + '</div>'; }).join('');
    h('<div class="scr exres"><div class="card res ' + (pass ? 'pass' : 'fail') + '">' + ring(r.ok / 33, r.ok + '/33', '', 150) + '<h1>' + (pass ? '🎉 ' + t('passed') : t('failed')) + '</h1><p class="muted">' + t('scoreOf', r.ok) + ' · ' + Math.round(r.dur / 60) + ' ' + t('min') + '</p>' +
      '<div class="thr"><span class="' + (r.ok >= 17 ? 'y' : 'n') + '">' + ic(r.ok >= 17 ? 'check' : 'x') + t('passCit') + '</span><span class="' + (r.ok >= 15 ? 'y' : 'n') + '">' + ic(r.ok >= 15 ? 'check' : 'x') + t('passLid') + '</span></div></div>' +
      '<button class="btn primary wide" data-act="startExam">' + t('again') + '</button><button class="btn ghost wide" data-go="home">' + t('home') + '</button><h2 class="sec">' + t('review') + '</h2>' + list + '</div>');
  }

  // ---------- Fortschritt ----------
  function vStats() {
    tabs('stats'); var s = S(), st = s.set.state, c = E.counts(s.P, st), acc = s.stats.right + s.stats.wrong ? Math.round(s.stats.right / (s.stats.right + s.stats.wrong) * 100) : 0;
    var passes = s.exams.filter(function (e) { return e.ok >= 17; }).length, info = badgeInfo();
    var week = []; for (var i = 6; i >= 0; i--) { var d = new Date(); d.setDate(d.getDate() - i); var v = s.days[E.dayKey(d)] || 0; week.push('<div class="wd"><i style="height:' + Math.min(100, v / Math.max(s.set.goal, 1) * 100) + '%" class="' + (v >= s.set.goal ? 'hit' : '') + '"></i><small>' + d.toLocaleDateString(PP.lang(), { weekday: 'narrow' }) + '</small></div>'); }
    h('<div class="scr stats"><header class="top"><h1>' + t('statsT') + '</h1><span class="sp"></span><button class="ib" data-go="settings">' + ic('gear') + '</button></header>' +
      '<div class="sgrid"><div class="card"><b>' + s.stats.answered + '</b><small>' + t('answered') + '</small></div><div class="card"><b>' + acc + '%</b><small>' + t('accuracy') + '</small></div><div class="card"><b>' + c.sure + '/' + c.total + '</b><small>' + t('sureN') + '</small></div>' +
      '<div class="card"><b>' + s.exams.length + '</b><small>' + t('examsN') + '</small></div><div class="card"><b>' + passes + '</b><small>' + t('passesN') + '</small></div><div class="card"><b>' + info.best + '</b><small>' + t('best') + '</small></div></div>' +
      '<div class="card week">' + week.join('') + '</div><h2 class="sec">' + t('badges') + '</h2><div class="bgrid">' + E.BADGES.map(function (b) { var got = s.badges.indexOf(b.id) >= 0; return '<div class="bdg ' + (got ? 'got' : '') + '"><span>' + badgeEmoji(b.id) + '</span><small>' + t('b_' + b.id) + '</small></div>'; }).join('') + '</div></div>');
  }
  function badgeEmoji(id) { return { first: '🌱', q50: '📘', q300: '📚', sure100: '💪', sureAll: '🎓', exam1: '📝', pass1: '✅', perfect: '💯', pass5: '🏆', streak3: '🔥', streak7: '⚡', streak30: '🌟', land: '📍', combo10: '🎯', combo25: '🚀' }[id] || '⭐'; }
  function badgeInfo() { var s = S(), st = s.set.state, c = E.counts(s.P, st), best = E.streak(s.days); s.stats.bestStreak = Math.max(s.stats.bestStreak || 0, best);
    return { answered: s.stats.answered, sure: c.sure, total: c.total, exams: s.exams.length, passes: s.exams.filter(function (e) { return e.ok >= 17; }).length, perfect: s.exams.filter(function (e) { return e.ok === 33; }).length,
      best: s.stats.bestStreak, landSure: st ? E.stateQs(st).filter(function (x) { return E.status(s.P[x.id]) === 'sure'; }).length : 0, combo: s.stats.bestCombo }; }
  function checkBadges() { var s = S(), info = badgeInfo(), fresh = E.BADGES.filter(function (b) { return s.badges.indexOf(b.id) < 0 && b.t(info); });
    fresh.forEach(function (b, i) { s.badges.push(b.id); setTimeout(function () { toast('<span class="tb">' + badgeEmoji(b.id) + '</span><span><b>' + t('newBadge') + '</b><br>' + t('b_' + b.id) + '</span>', 'badge'); PP.sfx('badge'); }, 900 + i * 2800); });
    if (fresh.length) PP.save(); }

  // ---------- Einstellungen ----------
  function vSettings() {
    tabs(null); var s = S().set;
    function sel(key, opts) { return '<select data-set="' + key + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(s[key]) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }
    function tog(key, label, sub) { return '<label class="srow"><span>' + label + (sub ? '<small>' + sub + '</small>' : '') + '</span><input type="checkbox" class="sw" data-tog="' + key + '"' + (s[key] ? ' checked' : '') + '></label>'; }
    h('<div class="scr settings">' + top(t('settings'), 'home') + '<div class="card slist">' +
      '<label class="srow"><span>' + t('setLang') + '</span>' + sel('ui', [['auto', 'Auto']].concat(PP.UILANGS)) + '</label>' +
      '<label class="srow"><span>' + t('setTr') + '</span>' + sel('tr', PP.TRLANGS) + '</label>' +
      '<label class="srow"><span>' + t('setState') + '</span>' + sel('state', PP.STATES.map(function (x) { return [x.code, x.de]; })) + '</label>' +
      '<label class="srow"><span>' + t('setDate') + '</span><input type="date" data-date value="' + esc(s.date) + '"></label>' +
      '<label class="srow"><span>' + t('setGoal') + '</span>' + sel('goal', [10, 20, 30, 50, 80].map(function (g) { return [g, t('obGoalN', g)]; })) + '</label>' +
      '<label class="srow"><span>' + t('setDark') + '</span>' + sel('theme', [['auto', t('themeAuto')], ['light', t('themeLight')], ['dark', t('themeDark')]]) + '</label></div>' +
      '<div class="card slist">' + tog('mix', t('setMix'), t('setMixS')) + tog('speech', t('setSpeech')) + tog('sound', t('setSound')) + tog('haptic', t('setHaptic')) + '</div>' +
      '<div class="card slist"><button class="srow lnk" data-go="about">' + t('about') + ' · ' + t('sources') + '<span>›</span></button><button class="srow lnk danger" data-act="reset">' + t('setReset') + '</button></div>' +
      '<p class="fine">' + esc(t('privacyT')) + '</p></div>');
    qa('[data-set]').forEach(function (el) { el.onchange = function () { var k = el.dataset.set; s[k] = k === 'goal' ? +el.value : el.value; PP.save(); if (k === 'ui') applyLang(); if (k === 'theme') applyTheme(); if (k === 'tr') PP.loadTr(s.tr, function () {}); vSettings(); }; });
    qa('[data-tog]').forEach(function (el) { el.onchange = function () { s[el.dataset.tog] = el.checked; PP.save(); }; });
    q('[data-date]').onchange = function (e) { s.date = e.target.value; PP.save(); };
  }
  function vAbout() {
    tabs(null);
    h('<div class="scr about">' + top(t('about'), 'settings') + '<div class="card pad"><div class="ab-logo">' + logo() + '<div><b>' + t('app') + ' 1.0</b><small>' + t('tagline') + '</small></div></div>' +
      '<p class="note">' + esc(t('disclaimer')) + '</p><h3>' + t('sources') + '</h3><p>' + esc(t('srcText')) + '</p><h3>' + t('privacy') + '</h3><p>' + esc(t('privacyT')) + '</p><p class="fine">© 2026 Lumvero</p></div></div>');
  }

  // ---------- Router ----------
  function applyLang() { var l = PP.lang(); document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'; }
  function applyTheme() { var th = S().set.theme; document.documentElement.dataset.theme = th === 'auto' ? '' : th; }
  function render() {
    closeModal(); applyLang();
    if (!S().set.onboarded) return vOnboard();
    var n = route.n;
    if (n === 'home') vHome(); else if (n === 'learn') vLearn(); else if (n === 'list') vList(); else if (n === 'quiz') (Q ? vQuiz() : vHome()); else if (n === 'done') vDone();
    else if (n === 'examIntro') vExamIntro(); else if (n === 'exam') vExam(); else if (n === 'examResult') vExamResult(); else if (n === 'stats') vStats(); else if (n === 'settings') vSettings(); else if (n === 'about') vAbout();
  }
  document.addEventListener('click', function (e) {
    PP.unlockAudio();
    var g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); PP.sfx('tap'); go({ n: g.dataset.go }); return; }
    var c = e.target.closest('[data-cat]'); if (c) { PP.sfx('tap'); go({ n: 'list', cat: c.dataset.cat }); return; }
    var r = e.target.closest('[data-q]'); if (r) { var lst = route._list && route._list.indexOf(r.dataset.q) >= 0 ? route._list : [r.dataset.q]; var start = lst.indexOf(r.dataset.q); startQuiz(lst.slice(start).concat(lst.slice(0, start)), 'list'); return; }
    var a = e.target.closest('[data-act]'); if (!a || a.disabled) return; var act = a.dataset.act, s = S();
    if (act === 'obNext') { if (obStep < 3) { obStep++; vOnboard(); } else { s.set.onboarded = true; PP.save(); PP.loadTr(s.set.tr, function () { go({ n: 'home' }); }); } }
    else if (act === 'obBack') { obStep = Math.max(0, obStep - 1); vOnboard(); }
    else if (act === 'smart') { PP.loadTr(s.set.tr, function () { startQuiz(E.smart(s.P, s.set.state, 10), 'smart'); }); }
    else if (act === 'wrong') go({ n: 'list', cat: 'wrong' });
    else if (act === 'marked') go({ n: 'list', cat: 'marked' });
    else if (act === 'land') go({ n: 'list', cat: 'land' });
    else if (act === 'practiceList') startQuiz(route._list.slice(), 'list');
    else if (act === 'redoWrong') startQuiz(Q._wrong.slice(), 'wrong');
    else if (act === 'quitQuiz') { Q = null; go({ n: 'home' }); }
    else if (act === 'nextQ') nextQ();
    else if (act === 'toggleTr') { s.set.showTr = s.set.showTr === false; PP.save(); vQuiz(); }
    else if (act === 'say') { var id = route.n === 'exam' ? X.ids[X.i] : Q.ids[Q.i], x = E.byId(id); PP.say(x.q + ' … ' + x.o.join(' … ')); }
    else if (act === 'mark') { var mid = Q.ids[Q.i]; if (s.marks[mid]) delete s.marks[mid]; else s.marks[mid] = Date.now(); PP.save(); a.classList.toggle('on'); a.classList.toggle('mk'); PP.buzz('light'); }
    else if (act === 'zoom') { var im = a.querySelector('img'); modal('<img class="zoom" src="' + im.getAttribute('src') + '" alt=""><button class="btn wide" data-act="closeModal">OK</button>'); }
    else if (act === 'startExam') { if (s.exam) confirmBox(t('examQuit'), t('yes'), startExam); else startExam(); }
    else if (act === 'resumeExam') go({ n: 'exam' });
    else if (act === 'exNext') { X.i = Math.min(32, X.i + 1); PP.save(); vExam(); }
    else if (act === 'exPrev') { X.i = Math.max(0, X.i - 1); PP.save(); vExam(); }
    else if (act === 'grid') examGrid();
    else if (act === 'exSubmit') { closeModal(); var open = X.ans.filter(function (v) { return v !== undefined && v !== null; }).length; open = 33 - open; if (open) confirmBox(t('examSubmitQ', open), t('examSubmit'), finishExam); else finishExam(); }
    else if (act === 'quitExam') confirmBox(t('examQuit'), t('yes'), function () { s.exam = null; PP.save(); go({ n: 'examIntro' }); });
    else if (act === 'reset') confirmBox(t('setResetQ'), t('del'), function () { PP.reset(); go({ n: 'home' }); });
    else if (act === 'closeModal') closeModal();
  });
  document.addEventListener('touchstart', function () { PP.unlockAudio(); }, { passive: true, once: true });

  PP.load(); applyTheme();
  if (window.__PP_TEST_BOOT) window.__PP_TEST_BOOT(PP);
  PP.loadTr(PP.S.set.tr, function () { render(); });
  window.PPapp = { go: go, render: render, startQuiz: startQuiz, get Q() { return Q; }, get route() { return route; }, finishExam: finishExam, answerQuiz: answerQuiz };
})();
