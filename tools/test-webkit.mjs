// End-to-End-Test in WebKit: Einfuehrung, smarte Runde, Fehlerliste, Markieren, Suche, komplette Pruefung (bestanden + nicht bestanden),
// Fortschritt, Einstellungen (alle 6 Sprachen inkl. Arabisch RTL), Neustart behaelt Lernstand. Aufruf: node tools/test-webkit.mjs
import { createRequire } from 'node:module'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const require = createRequire('C:/Users/Andrej/projekte/test1/boardgames/tools/webkit-test/package.json');
const { webkit } = require('playwright');
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..', 'www');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p === '/') p = '/index.html'; const f = path.join(ROOT, p); if (!fs.existsSync(f)) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(5161, '127.0.0.1', r));
let n = 0, fail = 0; const ok = (b, m) => { n++; if (!b) { fail++; console.log('FEHLER', m); } };
const br = await webkit.launch();
for (const loc of ['de-DE', 'en-US']) {
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: loc, hasTouch: true }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message)); pg.on('response', (r) => { if (r.status() >= 400 && !/capacitor\.js$/.test(r.url())) errs.push(r.status() + ' ' + r.url()); });
  await pg.goto('http://127.0.0.1:5161/'); await pg.evaluate(() => localStorage.clear()); await pg.reload();
  // Einfuehrung
  ok(await pg.locator('.ob').count() === 1, loc + ' Einfuehrung');
  await pg.click('[data-act=obNext]'); ok(await pg.locator('[data-act=obNext][disabled]').count() === 1, loc + ' ohne Bundesland gesperrt');
  await pg.click('[data-st=NW]'); await pg.click('[data-act=obNext]'); await pg.click('[data-tr=uk]'); await pg.waitForTimeout(300);
  ok((await pg.locator('#demoTr').textContent()).length > 5, loc + ' Uebersetzungs-Vorschau');
  await pg.click('[data-act=obNext]'); await pg.click('[data-goal="10"]'); await pg.click('[data-act=obNext]');
  ok(await pg.locator('.home').count() === 1, loc + ' Startseite'); await pg.evaluate(() => { PP.S.set.sound = false; });
  // smarte Runde: 10 Fragen, abwechselnd richtig/falsch
  await pg.click('[data-act=smart]'); await pg.waitForSelector('.quiz');
  for (let i = 0; i < 10; i++) {
    const a = await pg.evaluate(() => { const id = PPapp.Q.ids[PPapp.Q.i]; return PP.Q.find((x) => x.id === id).a; });
    const pick = i % 3 === 0 ? (a + 1) % 4 : a; await pg.click(`[data-a="${pick}"]`);
    ok(await pg.locator('.fb').count() === 1, loc + ' Rueckmeldung'); ok(await pg.locator(`[data-a="${a}"].right`).count() === 1, loc + ' richtige markiert');
    if (i === 2) { ok(await pg.locator('.ans small').count() >= 1, loc + ' Uebersetzung unter Antworten'); await pg.click('[data-act=mark]'); }
    await pg.click('[data-act=nextQ]');
  }
  ok(await pg.locator('.done').count() === 1, loc + ' Rundenende'); ok((await pg.locator('.done-card .rg-in b').textContent()) === '6/10', loc + ' 6 von 10');
  ok(await pg.locator('[data-act=redoWrong]').count() === 1, loc + ' Fehler wiederholen');
  await pg.click('[data-go=home]'); await pg.click('[data-act=wrong]'); ok(await pg.locator('.qrow').count() === 4, loc + ' Fehlerliste 4');
  await pg.click('[data-go=home]'); await pg.click('[data-act=marked]'); ok(await pg.locator('.qrow').count() === 1, loc + ' markiert 1');
  await pg.click('[data-go=learn]'); await pg.fill('#srch', 'Grundgesetz'); ok(await pg.locator('#srchRes .qrow').count() > 5, loc + ' Suche');
  await pg.click('[data-cat=land]'); ok(await pg.locator('.qrow').count() === 10, loc + ' Landesfragen 10');
  await pg.click('.qrow >> nth=0'); ok(await pg.locator('.qimg').count() === 1, loc + ' Wappenbild');
  await pg.click('[data-act=quitQuiz]');
  // Pruefung: alles richtig -> bestanden
  for (const mode of ['right', 'wrong']) {
    await pg.click('[data-go=examIntro]'); await pg.click('[data-act=startExam]'); await pg.waitForSelector('.exam');
    ok((await pg.locator('#timer').textContent()).startsWith('59:') || (await pg.locator('#timer').textContent()).startsWith('60:'), loc + ' Timer');
    for (let i = 0; i < 33; i++) {
      const a = await pg.evaluate(() => { const X = PP.S.exam; return PP.Q.find((x) => x.id === X.ids[X.i]).a; });
      await pg.click(`[data-ea="${mode === 'right' ? a : (a + 1) % 4}"]`); await pg.waitForTimeout(300);
    }
    await pg.click('[data-act=exSubmit]'); await pg.waitForSelector('.exres');
    const txt = await pg.locator('.res .rg-in b').textContent(); ok(txt === (mode === 'right' ? '33/33' : '0/33'), loc + ' Pruefung ' + mode + ' ' + txt);
    ok(await pg.locator('.rv').count() === 33, loc + ' Auswertung 33'); ok(await pg.locator(mode === 'right' ? '.res.pass' : '.res.fail').count() === 1, loc + ' bestanden-Status');
    await pg.click('[data-go=home]');
  }
  // Pruefung abbrechen + fortsetzen
  await pg.click('[data-go=examIntro]'); await pg.click('[data-act=startExam]'); await pg.click('[data-ea="0"]'); await pg.waitForTimeout(350); await pg.reload(); await pg.waitForTimeout(300);
  await pg.evaluate(() => PPapp.go({ n: 'examIntro' })); ok(await pg.locator('[data-act=resumeExam]').count() === 1, loc + ' Pruefung fortsetzbar');
  await pg.click('[data-act=resumeExam]'); ok(await pg.evaluate(() => PP.S.exam.i) === 1, loc + ' Fortsetzen an Stelle 2');
  await pg.click('[data-act=quitExam]'); await pg.click('#cfY');
  // Fortschritt
  await pg.click('[data-go=stats]'); ok(await pg.locator('.bdg.got').count() >= 5, loc + ' Erfolge ' + await pg.locator('.bdg.got').count());
  // Einstellungen: alle Sprachen
  for (const l of ['en', 'tr', 'ar', 'uk', 'ru', 'de']) {
    await pg.evaluate((l) => { PP.S.set.ui = l; PP.save(); PPapp.go({ n: 'settings' }); }, l);
    ok(await pg.evaluate(() => document.documentElement.dir) === (l === 'ar' ? 'rtl' : 'ltr'), loc + ' Richtung ' + l);
    for (const v of ['home', 'learn', 'examIntro', 'stats']) { await pg.evaluate((v) => PPapp.go({ n: v }), v); ok(!(await pg.content()).includes('undefined'), `${loc} ${l} ${v} ohne undefined`); }
  }
  await pg.reload(); ok(await pg.evaluate(() => PP.S.exams.length) === 2 && await pg.evaluate(() => PP.S.stats.answered) >= 76, loc + ' Lernstand bleibt');
  await pg.evaluate(() => PPapp.go({ n: 'settings' })); await pg.click('[data-act=reset]'); await pg.click('#cfY'); ok(await pg.evaluate(() => PP.S.stats.answered) === 0 && await pg.evaluate(() => PP.S.set.state) === 'NW', loc + ' Zuruecksetzen behaelt Einstellungen');
  ok(errs.length === 0, loc + ' Fehler: ' + errs.slice(0, 3).join(' | '));
  await ctx.close();
}
await br.close(); srv.close(); console.log(`${n - fail}/${n} ok` + (fail ? ` – ${fail} FEHLER` : '')); process.exit(fail ? 1 : 0);
