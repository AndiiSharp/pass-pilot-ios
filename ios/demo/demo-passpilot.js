// Pass-Pilot-Rundgang fuer das Pruefvideo: Einfuehrung (Sprache, Bundesland, Uebersetzung, Ziel), smarte Lernrunde mit
// richtigen/falschen Antworten + Erklaerung + Markieren, Themenliste + Suche, Pruefungssimulation (Abgabe + Auswertung),
// Fortschritt, Einstellungen, Hinweis "keine offizielle App".
(function () {
  const D = window.DEMO;
  const cur = () => { const Q = window.PPapp.Q; return Q && window.PP.E.byId(Q.ids[Q.i]); };
  async function answer(wrong) { const x = cur(); if (!x) return; const a = wrong ? (x.a + 1) % 4 : x.a; await D.tap(`[data-a="${a}"]`, { after: 1500 }); }
  async function nextQ() { await D.tap('[data-act=nextQ]', { after: 1200 }); }
  async function examAnswer(n) { for (let i = 0; i < n; i++) { const X = window.PP.S.exam; const x = window.PP.E.byId(X.ids[X.i]); const a = i % 4 === 3 ? (x.a + 1) % 4 : x.a; await D.tap(`[data-ea="${a}"]`, { after: 700 }); } }
  D.run([
    () => D.wait(800),
    () => D.tap('[data-ui=en]', { after: 900 }),
    () => D.tap('[data-act=obNext]', { after: 1000 }),
    () => D.tap('[data-st=BY]', { after: 800 }),
    () => D.tap('[data-act=obNext]', { after: 1000 }),
    () => D.tap('[data-tr=en]', { after: 1500 }),
    () => D.tap('[data-act=obNext]', { after: 1000 }),
    () => D.tap('[data-goal="20"]', { after: 700 }),
    () => D.tap('[data-act=obNext]', { after: 2200 }),
    () => D.scroll(450), () => D.scroll(-450),
    // Lernrunde
    () => D.tap('[data-act=smart]', { after: 1800 }),
    () => answer(false), nextQ,
    () => answer(true), async () => { const d = document.querySelector('.expl'); if (d && !d.open) await D.tap('.expl summary', { after: 1500 }); await D.scroll(400); await D.wait(800); }, nextQ,
    () => answer(false), () => D.tap('[data-act=mark]', { after: 900 }), nextQ,
    () => D.tap('[data-act=toggleTr]', { after: 1200 }), () => D.tap('[data-act=toggleTr]', { after: 1000 }),
    () => answer(false), nextQ,
    () => answer(false), nextQ,
    () => D.tap('[data-act=quitQuiz]', { after: 1500 }),
    // Lernen
    () => D.tap('#tabs [data-go=learn]', { after: 1500 }),
    () => D.type('#srch', 'Grundgesetz', { after: 1500 }),
    () => D.scroll(500), () => D.scroll(-500),
    () => D.tap('[data-cat=land]', { after: 1800 }),
    () => D.tap('.qrow', { after: 1800 }),
    () => answer(false), nextQ,
    () => D.tap('[data-act=quitQuiz]', { after: 1300 }),
    // Pruefung
    () => D.tap('#tabs [data-go=examIntro]', { after: 1800 }),
    () => D.tap('[data-act=startExam]', { after: 1800 }),
    () => examAnswer(10),
    () => D.tap('[data-act=grid]', { after: 1800 }),
    () => D.tap('.sheet [data-act=exSubmit]', { after: 1500 }),
    () => D.tap('#cfY', { after: 3500 }),
    () => D.scroll(700), () => D.scroll(700), () => D.scroll(-1400),
    () => D.tap('[data-go=home]', { after: 1800 }),
    // Fortschritt + Einstellungen
    () => D.tap('#tabs [data-go=stats]', { after: 2200 }),
    () => D.scroll(500), () => D.scroll(-500),
    () => D.tap('[data-go=settings]', { after: 1800 }),
    () => D.tap('[data-go=about]', { after: 3500 }),
    () => D.scroll(400), () => D.scroll(-400),
    () => D.tap('.top [data-go]', { after: 1200 }),
    () => D.tap('.top [data-go]', { after: 2000 }),
  ], 2500);
})();
