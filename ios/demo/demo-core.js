// Automatischer App-Rundgang fuer Bildschirmaufnahmen (nur im Demo-Build, nie im Store-Build).
// Zeigt einen halbtransparenten "Finger" und tippt Elemente der Reihe nach an.
(function () {
  const D = (window.DEMO = {});
  const finger = document.createElement('div');
  finger.style.cssText = 'position:fixed;left:50%;top:110%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;' +
    'background:rgba(120,120,120,.45);border:2px solid rgba(255,255,255,.85);box-shadow:0 2px 8px rgba(0,0,0,.35);' +
    'z-index:2147483647;pointer-events:none;transition:left .55s ease,top .55s ease,transform .12s ease;';
  const add = () => document.body.appendChild(finger);
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  D.log = [];
  D.wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && r.bottom > 0 && r.top < innerHeight + 2000; };
  // Element per CSS-Selektor oder sichtbarem Text finden (kleinstes passendes Element, bevorzugt klickbar)
  D.find = (q, root = document) => {
    if (q instanceof Element) return q;
    if (/^[.#\[]|^[a-z]+[.#\[]/i.test(q)) { const all = [...root.querySelectorAll(q)].filter(vis); return all[0] || null; }
    const want = q.toLowerCase();
    const cands = [...root.querySelectorAll('button,a,[role=button],[onclick],label,li,.btn,.card,.tile,div,span,p,h1,h2,h3,input,select')]
      .filter((el) => vis(el) && ((el.innerText || el.value || el.getAttribute('aria-label') || '').trim().toLowerCase().includes(want)));
    if (!cands.length) return null;
    cands.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length);
    let el = cands[0];
    const click = el.closest('button,a,[role=button],[onclick],label,li,.btn,.card,.tile');
    return click && (click.innerText || '').length < 200 ? click : el;
  };
  D.waitFor = async (q, ms = 8000) => { const t = Date.now(); let el; while (!(el = D.find(q)) && Date.now() - t < ms) await D.wait(200); return el; };
  D.moveTo = async (x, y) => { finger.style.left = x + 'px'; finger.style.top = y + 'px'; await D.wait(650); };
  D.tap = async (q, opt = {}) => {
    const el = await D.waitFor(q, opt.timeout || 8000);
    if (!el) { D.log.push('NICHT GEFUNDEN: ' + q); console.warn('DEMO nicht gefunden', q); return null; }
    el.scrollIntoView({ block: 'center', behavior: 'smooth' }); await D.wait(350);
    const r = el.getBoundingClientRect();
    const x = r.left + (opt.dx != null ? opt.dx : r.width / 2), y = r.top + (opt.dy != null ? opt.dy : r.height / 2);
    await D.moveTo(x, y);
    finger.style.transform = 'scale(.8)';
    const o = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, pointerType: 'touch', isPrimary: true, view: window };
    const tgt = document.elementFromPoint(x, y) || el;
    const t2 = (el.contains(tgt) || tgt === el) ? tgt : el;
    try { t2.dispatchEvent(new PointerEvent('pointerdown', o)); } catch (e) {}
    t2.dispatchEvent(new MouseEvent('mousedown', o));
    await D.wait(110);
    try { t2.dispatchEvent(new PointerEvent('pointerup', o)); } catch (e) {}
    t2.dispatchEvent(new MouseEvent('mouseup', o));
    if (opt.noClick !== true) { if (t2.tagName === 'CANVAS' || opt.dx != null || !t2.click) t2.dispatchEvent(new MouseEvent('click', o)); else t2.click(); }
    finger.style.transform = '';
    D.log.push('tap ' + (typeof q === 'string' ? q : q.tagName));
    await D.wait(opt.after != null ? opt.after : 1100);
    return el;
  };
  D.type = async (q, text, opt = {}) => {
    const el = await D.tap(q, { after: 400 }); if (!el) return;
    const inp = el.matches('input,textarea') ? el : el.querySelector('input,textarea') || el;
    inp.focus();
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inp), 'value');
    if (opt.clear !== false) { setter.set.call(inp, ''); inp.dispatchEvent(new Event('input', { bubbles: true })); }
    for (const ch of String(text)) {
      setter.set.call(inp, inp.value + ch);
      inp.dispatchEvent(new InputEvent('input', { bubbles: true, data: ch, inputType: 'insertText' }));
      await D.wait(opt.speed || 120);
    }
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    if (opt.enter) { inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true })); inp.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true })); }
    inp.blur && opt.blur !== false && inp.blur();
    await D.wait(opt.after != null ? opt.after : 900);
  };
  D.scroll = async (dy, sel) => {
    const box = sel ? D.find(sel) : (document.scrollingElement || document.body);
    const cand = [...document.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 40 && /(auto|scroll)/.test(getComputedStyle(e).overflowY) && vis(e));
    const t = box && box.scrollHeight > box.clientHeight + 40 ? box : cand.sort((a, b) => b.clientHeight - a.clientHeight)[0] || document.scrollingElement;
    await D.moveTo(innerWidth * 0.5, innerHeight * 0.7);
    const steps = 18; for (let i = 0; i < steps; i++) { t.scrollBy(0, dy / steps); finger.style.top = (innerHeight * 0.7 - (dy > 0 ? 1 : -1) * i * 12) + 'px'; await D.wait(28); }
    await D.wait(900);
  };
  D.park = () => { finger.style.top = '110%'; };
  D.run = (steps, delay = 3500) => {
    setTimeout(async () => {
      for (const s of steps) { try { await s(); } catch (e) { D.log.push('FEHLER ' + e.message); console.warn('DEMO', e); } }
      D.park(); D.done = true; console.log('DEMO FERTIG', JSON.stringify(D.log));
    }, delay);
  };
})();
