// Echte App-Bilder (WebKit) mit Beispiel-Lernstand fuer die Store-Grafiken: 6 Sprachen x iPhone 6,9" + iPad 13".
import { createRequire } from 'node:module'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const require = createRequire('C:/Users/Andrej/projekte/test1/boardgames/tools/webkit-test/package.json');
const { webkit } = require('playwright');
const D = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const OUT = 'C:/Users/Andrej/projekte/ios-tools/aso/raw5/pass';
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p === '/') p = '/index.html'; const f = path.join(D, 'www', p); if (!fs.existsSync(f)) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(5163, '127.0.0.1', r));
const DEV = { iphone: { viewport: { width: 440, height: 956 }, deviceScaleFactor: 3 }, ipad: { viewport: { width: 1032, height: 1376 }, deviceScaleFactor: 2 } };
const LANGS = { de: 'en', en: 'en', tr: 'tr', ar: 'ar', uk: 'uk', ru: 'ru' };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const only = process.argv[2];
const br = await webkit.launch();
for (const [ui, trl] of Object.entries(LANGS)) for (const [dev, cfg] of Object.entries(DEV)) {
  if (only && only !== ui) continue;
  const ctx = await br.newContext({ ...cfg, locale: ui, isMobile: dev === 'iphone', hasTouch: true, reducedMotion: 'reduce', colorScheme: 'light' });
  const pg = await ctx.newPage(); pg.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  const dir = path.join(OUT, ui, dev); fs.mkdirSync(dir, { recursive: true });
  const shot = async (n) => { await wait(450); await pg.evaluate(() => { const t = document.getElementById('toast'); if (t) t.className = ''; const c = document.getElementById('confetti'); if (c) c.remove(); }); await pg.screenshot({ path: path.join(dir, n + '.png') }); console.log(ui, dev, n); };
  await pg.goto('http://127.0.0.1:5163/'); await pg.evaluate(() => localStorage.clear());
  await pg.evaluate(([ui, trl]) => {
    const S = { v: 1, set: { ui, tr: trl, state: 'BY', date: '', goal: 20, mix: true, sound: false, haptic: true, speech: false, theme: 'light', onboarded: true, showTr: true }, P: {}, marks: {}, days: {}, exams: [], badges: [], stats: { answered: 0, right: 0, wrong: 0, bestCombo: 0 }, exam: null };
    const d = new Date(); d.setDate(d.getDate() + 18); S.set.date = d.toISOString().slice(0, 10);
    localStorage.setItem('passpilot.v1', JSON.stringify(S));
  }, [ui, trl]);
  await pg.reload(); await wait(700);
  await pg.evaluate(() => {
    const E = PP.E, S = PP.S; E.seed(7); const pool = E.pool('BY'); const now = Date.now();
    pool.forEach((q, i) => { if (i % 10 < 5) S.P[q.id] = { r: 4, w: 0, s: 4, b: 4, t: now - 5 * 3600000 }; else if (i % 10 < 7) S.P[q.id] = { r: 2, w: 1, s: 1, b: 2, t: now - 30 * 3600000 }; else if (i % 10 < 9 && i % 3 === 0) S.P[q.id] = { r: 0, w: 1, s: 0, b: 0, t: now - 2 * 3600000 }; });
    for (let k = 0; k < 7; k++) { const x = new Date(); x.setDate(x.getDate() - k); S.days[E.dayKey(x)] = k === 0 ? 14 : [20, 25, 31, 22, 40, 18][k - 1]; }
    S.exams = [21, 24, 27, 26, 30, 31].map((ok, i) => ({ t: now - (6 - i) * 86400000, ok, st: 'BY', dur: 1500 + i * 60, ids: [], ans: [] }));
    S.stats = { answered: 1184, right: 1032, wrong: 152, bestCombo: 27, bestStreak: 9 }; S.marks = { '21': 1, '87': 1, '130': 1 };
    S.badges = ['first', 'q50', 'q300', 'sure100', 'exam1', 'pass1', 'pass5', 'streak3', 'streak7', 'combo10', 'combo25', 'land'];
    PP.save();
  });
  await pg.reload(); await wait(900);
  await shot('01-home');
  // Frage mit Uebersetzung + Erklaerung (richtig beantwortet)
  await pg.evaluate(() => { PPapp.startQuiz(['87', '58', '3'], 'list'); }); await wait(500);
  await pg.evaluate(() => { const x = PP.E.byId('87'); document.querySelector(`[data-a="${x.a}"]`).click(); }); await wait(500);
  await pg.evaluate(() => { const d = document.querySelector('.expl'); if (d) d.open = true; document.getElementById('app').scrollTo(0, 0); });
  await shot('02-frage');
  // Pruefung laeuft
  await pg.evaluate(() => { PP.E.seed(3); PP.S.exam = { ids: PP.E.exam('BY'), ans: [], i: 0, start: Date.now() - 14 * 60000 - 23000, st: 'BY' }; const X = PP.S.exam; for (let i = 0; i < 12; i++) X.ans[i] = PP.E.byId(X.ids[i]).a; X.i = 12; PP.save(); PPapp.go({ n: 'exam' }); }); await wait(500);
  await pg.evaluate(() => { const X = PP.S.exam; document.querySelector(`[data-ea="${PP.E.byId(X.ids[X.i]).a}"]`).classList.add('sel'); });
  await shot('03-pruefung');
  // Ergebnis bestanden
  await pg.evaluate(() => { const X = PP.S.exam; X.ids.forEach((id, i) => { X.ans[i] = i === 5 || i === 17 || i === 29 ? (PP.E.byId(id).a + 1) % 4 : PP.E.byId(id).a; }); PPapp.finishExam(); }); await wait(900);
  await shot('04-ergebnis');
  // Bundesland mit Wappen
  await pg.evaluate(() => { PPapp.startQuiz(['BY-1', 'BY-8'], 'list'); }); await wait(400);
  await pg.evaluate(() => { document.querySelector('[data-a="1"]').click(); document.getElementById('app').scrollTo(0, 0); }); await wait(400);
  await shot('05-bundesland');
  await pg.evaluate(() => PPapp.go({ n: 'learn' })); await shot('06-lernen');
  await pg.evaluate(() => PPapp.go({ n: 'stats' })); await shot('07-fortschritt');
  await ctx.close();
}
await br.close(); srv.close();
