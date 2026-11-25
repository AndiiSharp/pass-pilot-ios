// Prueft Daten + Lernlogik: 460 Fragen, je 4 Optionen, Antwortindex, Bilder vorhanden, Uebersetzungen vollstaendig,
// Pruefungszusammenstellung (30+3, keine Doppelten), Bestehenschance, Serien, UI-Texte in allen Sprachen.
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path';
const W = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..', 'www');
const c = { console }; c.window = c; vm.createContext(c);
for (const f of ['data/fragen.js', 'i18n.js', 'engine.js', ...['en', 'tr', 'ru', 'fr', 'ar', 'uk', 'hi'].map((l) => `data/tr-${l}.js`)]) vm.runInContext(fs.readFileSync(path.join(W, f), 'utf8'), c, { filename: f });
const { PP } = c, E = PP.E; let n = 0, fail = 0; const ok = (b, m) => { n++; if (!b) { fail++; if (fail < 40) console.log('FEHLER', m); } };
ok(PP.Q.length === 460, 'Anzahl ' + PP.Q.length); ok(E.general().length === 300, 'allgemein 300');
const ids = new Set();
for (const q of PP.Q) {
  ok(!ids.has(q.id), 'doppelt ' + q.id); ids.add(q.id);
  ok(q.o.length === 4 && q.o.every((o) => o && o.trim()), 'Optionen ' + q.id); ok(q.a >= 0 && q.a <= 3, 'Antwort ' + q.id); ok(q.q && q.q.length > 5, 'Fragetext ' + q.id);
  ok(!/\b\w \w{1,2}\b.*\b(nisterin|taatliche|ufgabe)\b/.test(q.q), 'Textfehler ' + q.id);
  if (q.img) ok(fs.existsSync(path.join(W, 'data/img', q.img)), 'Bild fehlt ' + q.id);
  ok(E.CATS.includes(q.c), 'Kategorie ' + q.id + ' ' + q.c);
  for (const l of ['en', 'tr', 'ru', 'fr', 'ar', 'uk', 'hi']) { const t = PP.TR[l][q.id]; ok(t && t.q && t.o.length === 4 && t.o.every(Boolean), `Uebersetzung ${l} ${q.id}`); }
}
for (const st of PP.STATES) ok(E.stateQs(st.code).length === 10, 'Land ' + st.code);
// Pruefung
for (let k = 0; k < 2000; k++) { const st = PP.STATES[k % 16].code; const ex = E.exam(st); ok(ex.length === 33 && new Set(ex).size === 33, 'Pruefung 33'); ok(ex.filter((id) => id.startsWith(st + '-')).length === 3, 'Pruefung 3 Landesfragen'); ok(ex.filter((id) => /^\d+$/.test(id)).length === 30, 'Pruefung 30 allgemein'); }
const exam = E.exam('BY'); ok(E.grade(exam, exam.map((id) => E.byId(id).a)).ok === 33, 'Bewertung alles richtig'); ok(!E.grade(exam, exam.map(() => -1)).pass, 'Bewertung nichts');
// Lernstand
const P = {}; let r0 = E.readiness(P, 'BY').pass; ok(r0 < 0.01, 'Start-Chance klein ' + r0);
for (const q of E.pool('BY')) { E.answer(P, q.id, true, 0); E.answer(P, q.id, true, 0); E.answer(P, q.id, true, 0); }
ok(E.readiness(P, 'BY').pass > 0.99, 'Chance nach Lernen'); ok(E.counts(P, 'BY').sure === 310, 'alle sicher');
E.answer(P, '1', false, 0); ok(E.status(P['1']) === 'wrong', 'falsch nach Fehler'); ok(E.wrongList(P, 'BY').includes('1'), 'Fehlerliste');
const sm = E.smart(P, 'BY', 10, 1e13); ok(sm.length === 10 && sm.includes('1'), 'smarte Runde enthaelt Fehler');
const P2 = {}; const s2 = E.smart(P2, 'HH', 10, Date.now()); ok(s2.length === 10 && new Set(s2).size === 10, 'smart neu');
const days = {}; const t0 = new Date(2026, 10, 26); for (let k = 0; k < 5; k++) { const d = new Date(t0); d.setDate(d.getDate() - k); days[E.dayKey(d)] = 3; } ok(E.streak(days, t0) === 5, 'Serie');
ok(E.daysUntil('2026-12-01', new Date(2026, 10, 26)) === 5, 'Tage bis Test');
// UI-Texte vollstaendig
const keys = Object.keys(PP.TXT.de);
for (const l of Object.keys(PP.TXT)) for (const k of keys) ok(PP.TXT[l][k] !== undefined, `Text ${l}.${k}`);
console.log(`${n - fail}/${n} Pruefungen ok` + (fail ? `, ${fail} FEHLER` : '')); process.exit(fail ? 1 : 0);
