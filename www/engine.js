// Pass Pilot – Lernlogik (ohne Oberflaeche, in Node testbar)
// Ideen aus Open-Source-Trainern: Pruefungssimulation 33/60 Min (alle), Fehler-Stapel & Markieren (leben-in-deutschland-app, MIT),
// Kategorien (leben-in-deutschland-app), Bundesland-Auswahl (flexsurfer, MIT), Lernkarten-Wiederholung (anki-german-citizen-test, Idee).
'use strict';
(function (root) {
  var PP = root.PP || (root.PP = {});
  var E = PP.E = {};
  var rnd = Math.random;
  E.seed = function (s) { var x = s >>> 0 || 1; rnd = function () { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; };
  E.unseed = function () { rnd = Math.random; };
  var shuffle = E.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  E.CATS = ['hist', 'rights', 'const', 'demo', 'elect', 'law', 'fed', 'work', 'society', 'land'];
  E.byId = function (id) { if (!E._idx) { E._idx = {}; PP.Q.forEach(function (q) { E._idx[q.id] = q; }); } return E._idx[id]; };
  E.general = function () { return PP.Q.filter(function (q) { return !q.l; }); };
  E.stateQs = function (st) { return PP.Q.filter(function (q) { return q.l === st; }); };
  E.pool = function (st) { return E.general().concat(st ? E.stateQs(st) : []); };

  // ---- Lernstand je Frage: { r: richtig gesamt, w: falsch gesamt, s: Serie richtig, b: Kasten 0-5, t: zuletzt (ms) }
  E.rec = function (P, id) { return P[id] || null; };
  E.status = function (r) { if (!r || (!r.r && !r.w)) return 'new'; if (r.b >= 3) return 'sure'; if (r.s >= 1 && r.b >= 1) return 'learning'; return 'wrong'; };
  E.answer = function (P, id, ok, now) {
    var r = P[id] || (P[id] = { r: 0, w: 0, s: 0, b: 0, t: 0 }); r.t = now || Date.now();
    if (ok) { r.r++; r.s++; r.b = Math.min(5, r.b + 1); } else { r.w++; r.s = 0; r.b = 0; }
    return r;
  };
  var INTERVAL_H = [0, 0.5, 20, 72, 168, 504]; // Kasten -> Wiederholung nach Stunden
  E.due = function (r, now) { if (!r) return true; return (now - r.t) / 3600000 >= INTERVAL_H[r.b]; };
  E.pCorrect = function (r) { if (!r || (!r.r && !r.w)) return 0.25; return [0.4, 0.6, 0.75, 0.88, 0.95, 0.98][r.b]; };

  // Bestehenswahrscheinlichkeit: 30 allgemeine + 3 Landesfragen, >= 17 richtig (Normalnaeherung der Summe)
  E.readiness = function (P, st) {
    var g = E.general(), s = st ? E.stateQs(st) : [];
    var pg = g.reduce(function (a, q) { return a + E.pCorrect(P[q.id]); }, 0) / g.length;
    var ps = s.length ? s.reduce(function (a, q) { return a + E.pCorrect(P[q.id]); }, 0) / s.length : pg;
    var mean = 30 * pg + 3 * ps, v = 30 * pg * (1 - pg) + 3 * ps * (1 - ps);
    var z = (16.5 - mean) / Math.sqrt(Math.max(v, 0.01));
    var pass = 1 - phi(z);
    return { pass: Math.max(0, Math.min(1, pass)), expect: mean };
  };
  function phi(z) { var t = 1 / (1 + 0.2316419 * Math.abs(z)); var d = 0.3989423 * Math.exp(-z * z / 2); var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }

  E.counts = function (P, st) {
    var c = { new: 0, wrong: 0, learning: 0, sure: 0, total: 0 };
    E.pool(st).forEach(function (q) { c[E.status(P[q.id])]++; c.total++; });
    return c;
  };
  E.catCounts = function (P, st, cat) {
    var qs = cat === 'land' ? E.stateQs(st) : E.general().filter(function (q) { return q.c === cat; });
    var c = { total: qs.length, sure: 0, seen: 0 };
    qs.forEach(function (q) { var s = E.status(P[q.id]); if (s === 'sure') c.sure++; if (s !== 'new') c.seen++; });
    return c;
  };

  // ---- Sitzungen
  // smart: faellige falsche zuerst, dann faellige in Lernen, dann neue (in Katalogreihenfolge), dann Auffrischen
  E.smart = function (P, st, n, now) {
    now = now || Date.now();
    var pool = E.pool(st), wrong = [], learn = [], fresh = [], sure = [];
    pool.forEach(function (q) { var r = P[q.id], s = E.status(r); if (s === 'new') fresh.push(q); else if (!E.due(r, now)) return; else if (s === 'wrong') wrong.push(q); else if (s === 'learning') learn.push(q); else sure.push(q); });
    var out = shuffle(wrong).slice(0, Math.ceil(n * 0.4));
    out = out.concat(shuffle(learn).slice(0, Math.ceil(n * 0.3)));
    out = out.concat(fresh.slice(0, n - out.length));
    if (out.length < n) out = out.concat(shuffle(sure).slice(0, n - out.length));
    if (out.length < n) out = out.concat(shuffle(pool.filter(function (q) { return out.indexOf(q) < 0; })).slice(0, n - out.length));
    return shuffle(out.slice(0, n)).map(function (q) { return q.id; });
  };
  E.byCat = function (st, cat) { return (cat === 'land' ? E.stateQs(st) : E.general().filter(function (q) { return q.c === cat; })).map(function (q) { return q.id; }); };
  E.wrongList = function (P, st) { return E.pool(st).filter(function (q) { return E.status(P[q.id]) === 'wrong'; }).map(function (q) { return q.id; }); };
  E.all = function (st) { return E.pool(st).map(function (q) { return q.id; }); };
  // Pruefung: 30 allgemeine + 3 aus dem Bundesland (amtliches Format), 60 Minuten, bestanden ab 17
  E.exam = function (st) {
    var g = shuffle(E.general()).slice(0, 30), s = st ? shuffle(E.stateQs(st)).slice(0, 3) : shuffle(E.general().filter(function (q) { return g.indexOf(q) < 0; })).slice(0, 3);
    return shuffle(g.concat(s)).map(function (q) { return q.id; });
  };
  E.EXAM_N = 33; E.EXAM_PASS = 17; E.EXAM_MIN = 60; E.CITIZEN_PASS = 17; E.LID_PASS = 15;
  E.grade = function (ids, answers) { var ok = 0; ids.forEach(function (id, i) { var q = E.byId(id); if (answers[i] === q.a) ok++; }); return { ok: ok, n: ids.length, pass: ok >= E.EXAM_PASS }; };

  // Antwortoptionen mischen (ausser bei festen Reihenfolgen wie Bild 1-4 oder Zuordnungen)
  E.order = function (q, mix) { var o = [0, 1, 2, 3]; if (!mix || q.k || q.img) return o; return shuffle(o); };

  // ---- Serie / Tage
  E.dayKey = function (d) { d = d || new Date(); return d.getFullYear() + '-' + (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1) + '-' + (d.getDate() < 10 ? '0' : '') + d.getDate(); };
  E.streak = function (days, today) { today = today || new Date(); var n = 0, d = new Date(today.getFullYear(), today.getMonth(), today.getDate()); if (!days[E.dayKey(d)]) d.setDate(d.getDate() - 1); while (days[E.dayKey(d)]) { n++; d.setDate(d.getDate() - 1); } return n; };
  E.daysUntil = function (iso, now) { if (!iso) return null; var t = new Date(iso + 'T12:00:00'); now = now || new Date(); return Math.ceil((t - new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)) / 86400000); };

  // ---- Erfolge
  E.BADGES = [
    { id: 'first', t: function (s) { return s.answered >= 1; } },
    { id: 'q50', t: function (s) { return s.answered >= 50; } },
    { id: 'q300', t: function (s) { return s.answered >= 300; } },
    { id: 'sure100', t: function (s) { return s.sure >= 100; } },
    { id: 'sureAll', t: function (s) { return s.sure >= s.total; } },
    { id: 'exam1', t: function (s) { return s.exams >= 1; } },
    { id: 'pass1', t: function (s) { return s.passes >= 1; } },
    { id: 'perfect', t: function (s) { return s.perfect >= 1; } },
    { id: 'pass5', t: function (s) { return s.passes >= 5; } },
    { id: 'streak3', t: function (s) { return s.best >= 3; } },
    { id: 'streak7', t: function (s) { return s.best >= 7; } },
    { id: 'streak30', t: function (s) { return s.best >= 30; } },
    { id: 'land', t: function (s) { return s.landSure >= 10; } },
    { id: 'combo10', t: function (s) { return s.combo >= 10; } },
    { id: 'combo25', t: function (s) { return s.combo >= 25; } }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
