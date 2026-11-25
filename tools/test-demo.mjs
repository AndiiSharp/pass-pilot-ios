// Spielt den Pruefvideo-Rundgang lokal in WebKit ab (iPhone-Groesse) und meldet nicht gefundene Schritte.
import { createRequire } from 'node:module'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const require = createRequire('C:/Users/Andrej/projekte/test1/boardgames/tools/webkit-test/package.json');
const { webkit } = require('playwright');
const D = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p === '/') p = '/index.html';
  let f = path.join(D, 'www', p); if (/^\/demo-/.test(p)) f = path.join(D, 'ios', 'demo', p);
  if (!fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
  let body = fs.readFileSync(f); if (p === '/index.html') body = String(body).replace('</body>', '<script src="/demo-core.js"></script><script src="/demo-passpilot.js"></script></body>');
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(body); });
await new Promise((r) => srv.listen(5162, '127.0.0.1', r));
const br = await webkit.launch();
const lang = process.argv[2] || 'de';
const ctx = await br.newContext({ viewport: { width: 402, height: 874 }, locale: lang === 'en' ? 'en-US' : 'de-DE', hasTouch: true, recordVideo: process.argv[3] ? { dir: process.argv[3], size: { width: 402, height: 874 } } : undefined });
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
await pg.goto('http://127.0.0.1:5162/'); const t0 = Date.now();
await pg.waitForFunction(() => window.DEMO && window.DEMO.done, null, { timeout: 300000 });
const log = await pg.evaluate(() => window.DEMO.log);
console.log('Dauer', Math.round((Date.now() - t0) / 1000), 's, Schritte', log.length);
console.log('Probleme:', log.filter((l) => /NICHT|FEHLER/.test(l)).join(' | ') || 'keine', '| JS-Fehler:', errs.join(' | ') || 'keine');
console.log('Stand:', await pg.evaluate(() => JSON.stringify({ answered: PP.S.stats.answered, exams: PP.S.exams.length, lang: PP.S.set.ui })));
await pg.screenshot({ path: path.join(D, 'tools', 'demo-end.png') });
await ctx.close(); await br.close(); srv.close();
