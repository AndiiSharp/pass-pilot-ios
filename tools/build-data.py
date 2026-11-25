# Baut die App-Daten aus geprueften Quellen:
#  - Wortlaut/Reihenfolge/Antworten: amtlicher Gesamtfragenkatalog (BAMF, Stand 07.05.2025, amtliches Werk § 5 UrhG),
#    deutscher Text + Englisch + Kurzerklaerungen + Bilder: IndrajeetPatil/einbuergerungstest (MIT; Bilder teils CC BY-SA),
#  - Uebersetzungen TR/RU/FR/AR/UK/HI + ausfuehrliche Erklaerungen: leben-in-deutschland/leben-in-deutschland-app (MIT),
#    Antwortreihenfolge auf den amtlichen Katalog umgestellt (lid-refs/amtlich/merge.py).
# Antworten wurden gegen beide Quellen geprueft (0 Abweichungen) und Bildfragen per Augenschein.
import json, os, shutil, re
REF = 'C:/Users/Andrej/projekte/lid-refs'
OUT = os.path.join(os.path.dirname(__file__), '..', 'www', 'data')
os.makedirs(os.path.join(OUT, 'img'), exist_ok=True)
P = json.load(open(f'{REF}/IndrajeetPatil__einbuergerungstest/src/data/catalogue.json', encoding='utf-8'))
F = {f['id']: f for f in json.load(open(f'{REF}/amtlich/fragen.json', encoding='utf-8'))}
CAT = {'History & Geography': 'hist', 'Rights & Freedoms': 'rights', 'Democracy & Politics': 'demo', 'Economy & Employment': 'work', 'Constitution': 'const',
       'Education & Religion': 'society', 'Law & Governance': 'law', 'Federal System': 'fed', 'Assembly & Protests': 'rights', 'Elections': 'elect'}
Q, TR = [], {l: {} for l in ['en', 'tr', 'ru', 'fr', 'ar', 'uk', 'hi']}
for q in P['questions']:
    key = (q['state'] + '-' if q['state'] else '') + str(q['num'])
    f = F[key]
    assert f['a'] == q['answer'], key
    img = None
    if q['image']:
        src = f'{REF}/IndrajeetPatil__einbuergerungstest/public/{q["image"]}'
        dst = os.path.basename(q['image']); shutil.copy(src, os.path.join(OUT, 'img', dst)); img = dst
    cat = CAT.get((f.get('cat') or '').strip("'"), 'law') if not q['state'] else 'land'
    ex = q.get('explanation') or {}
    item = {'id': key, 'l': q['state'], 'n': q['num'], 'q': q['de']['q'], 'o': q['de']['o'], 'a': q['answer'], 'c': cat}
    if img: item['img'] = img
    if q.get('credit'): item['cr'] = q['credit']
    if q.get('keepOrder'): item['k'] = 1
    item['x'] = ex.get('de') or f.get('x') or ''
    if f.get('x') and f['x'] != item['x']: item['xl'] = f['x']
    Q.append(item)
    TR['en'][key] = {'q': q['en']['q'], 'o': q['en']['o'], 'x': ex.get('en') or (f['tr'].get('en') or {}).get('x', '')}
    for l in ['tr', 'ru', 'fr', 'ar', 'uk', 'hi']:
        t = (f.get('tr') or {}).get(l)
        if t and t.get('q') and all(t['o']): TR[l][key] = {'q': t['q'], 'o': t['o'], 'x': t.get('x') or ''}
# Im Katalog 2025 inhaltlich geaenderte Optionen: alte Uebersetzungen ersetzen (eigene Uebersetzung)
FIX = {
    ('14', 1): {'tr': 'fikrimi internette ifade edebilirim.', 'ru': 'могу выражать своё мнение в интернете.', 'fr': 'je peux exprimer mon opinion sur Internet.', 'ar': 'يمكنني التعبير عن رأيي على الإنترنت.', 'uk': 'можу висловлювати свою думку в інтернеті.', 'hi': 'इंटरनेट पर अपनी राय व्यक्त कर सकता/सकती हूँ।'},
    ('MV-9', 0): {'tr': 'Birinci Bakan', 'ru': 'Первый министр', 'fr': 'Ministre principal(e)', 'ar': 'الوزير الأول', 'uk': 'Перший міністр', 'hi': 'प्रथम मंत्री'},
    ('MV-10', 2): {'tr': 'Maliye Bakanı', 'ru': 'Министр финансов', 'fr': 'Ministre des Finances', 'ar': 'وزير المالية', 'uk': 'Міністр фінансів', 'hi': 'वित्त मंत्री'},
}
for (qid, idx), tr in FIX.items():
    for l, txt in tr.items():
        TR[l][qid]['o'][idx] = txt
        if qid == '14': TR[l][qid]['x'] = ''  # alte Erklaerung bezog sich auf "Leserbriefe" -> englische Kurzerklaerung zeigen
states = P['states']
with open(os.path.join(OUT, 'fragen.js'), 'w', encoding='utf-8') as fh:
    fh.write('// Gesamtfragenkatalog "Leben in Deutschland"/Einbuergerungstest, Stand 07.05.2025 (BAMF, amtliches Werk). Quellen: siehe tools/build-data.py\n')
    fh.write("'use strict';(window.PP||(window.PP={})).Q=" + json.dumps(Q, ensure_ascii=False, separators=(',', ':')) + ';\n')
    fh.write('PP.STATES=' + json.dumps(states, ensure_ascii=False, separators=(',', ':')) + ';PP.CATALOG_DATE="07.05.2025";\n')
for l, d in TR.items():
    with open(os.path.join(OUT, f'tr-{l}.js'), 'w', encoding='utf-8') as fh:
        fh.write("'use strict';(window.PP||(window.PP={})).TR=PP.TR||{};PP.TR." + l + '=' + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('Fragen', len(Q), 'Bilder', sum(1 for x in Q if 'img' in x), {l: len(d) for l, d in TR.items()})
print({k: os.path.getsize(os.path.join(OUT, k)) // 1024 for k in os.listdir(OUT) if k.endswith('.js')})
