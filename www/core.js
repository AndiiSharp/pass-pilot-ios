// Pass Pilot – Speicher, Sprache, Vorlesen, Klang, Vibration, Konfetti
'use strict';
(function (root) {
  var PP = root.PP || (root.PP = {});
  var KEY = 'passpilot.v1';
  function defaults() {
    return { v: 1, set: { ui: 'auto', tr: '', state: '', date: '', goal: 20, mix: true, sound: true, haptic: true, speech: false, theme: 'auto', onboarded: false },
      P: {}, marks: {}, days: {}, exams: [], badges: [], stats: { answered: 0, right: 0, wrong: 0, bestCombo: 0 }, exam: null };
  }
  PP.load = function () {
    var d = null; try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
    var S = d && d.v === 1 ? d : defaults(); var def = defaults();
    for (var k in def) if (S[k] === undefined) S[k] = def[k];
    for (var s in def.set) if (S.set[s] === undefined) S.set[s] = def.set[s];
    PP.S = S; return S;
  };
  PP.save = function () { try { localStorage.setItem(KEY, JSON.stringify(PP.S)); } catch (e) { } };
  PP.reset = function () { var set = PP.S.set; PP.S = defaults(); PP.S.set = set; PP.save(); };

  // Sprache
  PP.lang = function () {
    var l = PP.S && PP.S.set.ui !== 'auto' ? PP.S.set.ui : (navigator.language || 'de').slice(0, 2).toLowerCase();
    return PP.TXT[l] ? l : (l === 'de' ? 'de' : 'en');
  };
  PP.t = function (k) {
    var s = PP.TXT[PP.lang()][k]; if (s === undefined) s = PP.TXT.en[k]; if (s === undefined) s = PP.TXT.de[k]; if (s === undefined) return k; if (typeof s !== 'string') return s;
    for (var i = 1; i < arguments.length; i++) s = s.split('%' + i).join(arguments[i]); return s;
  };
  PP.stateName = function (code) { var s = (PP.STATES || []).filter(function (x) { return x.code === code; })[0]; return s ? s.de : ''; };
  // Uebersetzungsdatei bei Bedarf nachladen
  PP.loadTr = function (l, cb) {
    if (!l || (PP.TR && PP.TR[l])) { cb && cb(); return; }
    var s = document.createElement('script'); s.src = 'data/tr-' + l + '.js'; s.onload = function () { cb && cb(); }; s.onerror = function () { cb && cb(); }; document.head.appendChild(s);
  };
  PP.trOf = function (id) { var l = PP.S.set.tr; return l && PP.TR && PP.TR[l] ? PP.TR[l][id] : null; };

  // Vorlesen (deutsche Systemstimme, offline)
  var voice = null;
  function pickVoice() { try { var vs = root.speechSynthesis.getVoices().filter(function (v) { return /^de/i.test(v.lang); }); voice = vs.filter(function (v) { return /premium|enhanced|anna|helena|petra|markus/i.test(v.name); })[0] || vs[0] || null; } catch (e) { voice = null; } }
  PP.say = function (text) {
    if (!text || !root.speechSynthesis) return;
    try { root.speechSynthesis.cancel(); pickVoice(); var u = new SpeechSynthesisUtterance(text.replace(/…/g, ' … ').replace(/\//g, ' oder ')); u.lang = 'de-DE'; if (voice) u.voice = voice; u.rate = 0.9; root.speechSynthesis.speak(u); } catch (e) { }
  };
  PP.hush = function () { try { root.speechSynthesis && root.speechSynthesis.cancel(); } catch (e) { } };

  // Klang (eigene Synthese)
  var ac = null;
  function actx() { if (!ac) { try { ac = new (root.AudioContext || root.webkitAudioContext)(); } catch (e) { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); return ac; }
  function tone(f, t0, d, type, vol) { var a = actx(); if (!a) return; var o = a.createOscillator(), g = a.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, a.currentTime + t0);
    g.gain.setValueAtTime(0.0001, a.currentTime + t0); g.gain.exponentialRampToValueAtTime(vol || 0.15, a.currentTime + t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + d);
    o.connect(g); g.connect(a.destination); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + d + 0.05); }
  PP.sfx = function (k) {
    if (!PP.S || !PP.S.set.sound) return;
    if (k === 'tap') tone(700, 0, 0.05, 'triangle', 0.06);
    else if (k === 'ok') { tone(740, 0, 0.12); tone(1110, 0.08, 0.2); }
    else if (k === 'no') { tone(280, 0, 0.18, 'triangle', 0.1); }
    else if (k === 'combo') { tone(988, 0, 0.09, 'square', 0.04); tone(1319, 0.07, 0.16, 'square', 0.04); }
    else if (k === 'win') { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, i * 0.1, 0.28, 'sine', 0.13); }); }
    else if (k === 'badge') { [784, 988, 1175].forEach(function (f, i) { tone(f, i * 0.08, 0.2, 'triangle', 0.1); }); }
  };
  PP.unlockAudio = function () { actx(); try { root.speechSynthesis && root.speechSynthesis.getVoices(); } catch (e) { } };
  PP.buzz = function (k) {
    if (!PP.S || !PP.S.set.haptic) return; var H = root.Capacitor && root.Capacitor.Plugins && root.Capacitor.Plugins.Haptics; if (!H) return;
    try { if (k === 'ok') H.notification({ type: 'SUCCESS' }); else if (k === 'no') H.notification({ type: 'ERROR' }); else H.impact({ style: k === 'heavy' ? 'HEAVY' : 'LIGHT' }); } catch (e) { }
  };

  // Konfetti in Schwarz-Rot-Gold + Akzent
  var cv = null, parts = [], raf = 0;
  PP.confetti = function (n) {
    if (!cv) { cv = document.createElement('canvas'); cv.id = 'confetti'; document.body.appendChild(cv); }
    var dpr = root.devicePixelRatio || 1; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cols = ['#1d1d1f', '#DD0000', '#FFCC00', '#2F6BFF', '#22C55E'];
    for (var i = 0; i < (n || 120); i++) { var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6, v = 7 + Math.random() * 10; parts.push({ x: innerWidth / 2, y: innerHeight * 0.45, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 4 + Math.random() * 4, c: cols[i % cols.length], rot: Math.random() * 6, vr: Math.random() * .4 - .2, life: 110 + Math.random() * 50 }); }
    if (!raf) { var step = function () { c.clearRect(0, 0, innerWidth, innerHeight); parts = parts.filter(function (p) { return p.life-- > 0 && p.y < innerHeight + 30; });
      parts.forEach(function (p) { p.vy += 0.3; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.c; c.globalAlpha = Math.min(1, p.life / 30); c.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); c.restore(); });
      if (parts.length) raf = requestAnimationFrame(step); else { raf = 0; c.clearRect(0, 0, innerWidth, innerHeight); } }; raf = requestAnimationFrame(step); }
  };
  PP.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
})(typeof window !== 'undefined' ? window : globalThis);
