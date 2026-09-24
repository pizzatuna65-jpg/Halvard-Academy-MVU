#!/usr/bin/env python3
"""Batch 2.2 — writes custom MVU worldbook index (uid 500+) and generates the EJS 'Now' entry (505) from data/locations.json."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
locs = json.load(open(P('data/locations.json'), encoding='utf-8'))
ARRIVES = {k: v['arrives'] for k, v in json.load(open(P('data/npcs.json'), encoding='utf-8')).items() if v.get('arrives', 1) > 1}   # v1.0.3
import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import outdoor_ids, place_keys, load_clubs
npcs = json.load(open(P('data/npcs.json'), encoding='utf-8'))
reg = {}
for lid, l in locs.items():
    if not l['regulars']: continue
    for k in sorted({l['name'].lower(), re.sub(r'^the ', '', l['name'].lower()), lid.replace('_', ' ')}):
        reg[k] = l['regulars']
reg['main courtyard'] = locs['courtyards']['regulars']
# ---- v1.1.0 (spec §1) class-aware presence: students, teachers, timetable with venues (engine TIMETABLE = single source) ----
norm = lambda s: re.sub(r'^the ', '', s.strip().lower())
VN = {norm(l['name']): l['name'] for l in locs.values()}
STU = {nid: [n['year'], n.get('arrives', 1), n.get('dorm') or ''] for nid, n in sorted(npcs.items()) if re.match(r'^Year \d$', n.get('group') or '') and n.get('year')}
TEACH = {nid: n['teaches'] for nid, n in sorted(npcs.items()) if n.get('teaches')}
eng = open(P('src/scripts/engine.template.js'), encoding='utf-8').read()
tt_src = re.search(r'const TIMETABLE = \{(.*?)\n\};', eng, re.S).group(1)
VENUE_ALIAS = {'warded seminar room': 'Seminar Rooms'}
def venues_of(paren):
    out = []
    for chunk in re.split(r';|\bor\b', paren or ''):
        c = chunk.strip().lower()
        if not c or c in ('doves', 'club venues'): continue
        name = VENUE_ALIAS.get(c) or next((l['name'] for l in locs.values() if norm(l['name']) == norm(c)), None)
        assert name, f'timetable venue is not a location: {chunk!r}'
        out.append(norm(name))
    return out
TT = {}
for day, row in re.findall(r"(\w{3}): \[(.*?)\],", tt_src):
    TT[day] = []
    for cell in re.findall(r"'([^']*)'", row):
        m = re.match(r'^(.*?)(?:\s*\[(M|D)\])?(?:\s*\((.*)\))?$', cell)
        subj, mode, paren = m.group(1).strip(), m.group(2) or '', m.group(3)
        if subj.startswith('Study Hall'): TT[day].append(['Study Hall', '', ['main library'], 'study'])
        elif subj == 'Clubs': TT[day].append(['Clubs', '', [], 'clubs'])
        else: TT[day].append([re.sub(r'\s+practical$', '', subj), mode, venues_of(paren) or ['lecture halls'], 'class'])
assert TT['Mon'][0] == ['Magic Theory', 'M', ['lecture halls'], 'class'] and TT['Fri'][2][2] == ['combat grounds', 'seminar rooms'] and TT['Wed'][2][2] == ['menagerie', 'forest'], TT
OUT_IDS = outdoor_ids(locs)
OUTD = sorted({norm(k) for lid in OUT_IDS for k in place_keys(locs[lid], lid)})
CLUBV = {}
for c in load_clubs(npcs, locs):
    allout = all(v in OUT_IDS for v in c['venues'])
    for v in c['venues']:
        CLUBV.setdefault(norm(locs[v]['name']), []).append([c['name'], c['members'], allout, c['key'] == 'Fishing'])
MOODS = json.load(open(P('data/weather_moods.json'), encoding='utf-8'))['moods']
assert all(m['id'] in npcs for m in MOODS)
J = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
ejs = open(P('src/worldbook/custom/505.template.ejs'), encoding='utf-8').read()
ejs = re.sub(r'^// Source of custom entry 505.*\n', '', ejs, flags=re.M)
for k, v in {'REG': reg, 'ARR': {k: v['arrives'] for k, v in npcs.items() if v.get('arrives', 1) > 1}, 'STU': STU, 'TEACH': TEACH, 'TT': TT,
             'CLUBV': CLUBV, 'OUTD': OUTD, 'VN': VN, 'MOODS': MOODS}.items():
    ph = '/*@@' + k + '@@*/' + ('[]' if isinstance(v, list) else '{}')
    assert ph in ejs, ph
    ejs = ejs.replace(ph, J(v))
assert '@@' not in ejs
open(P('src/worldbook/custom/content/505.txt'), 'w', encoding='utf-8').write(ejs)
shop = json.load(open(P('data/shop.json'), encoding='utf-8'))['items']
lines, seen = [], set()
for i in shop:
    k = (i['item'], i['price'])
    if k in seen: continue
    seen.add(k)
    where = ', '.join(sorted({x['shop'] for x in shop if x['item'] == i['item']}))
    price = 'varies' if i['price'] is None else f"{i['price']:,} pts"
    season = '' if i.get('season', 'all') == 'all' else '; in season: ' + ', '.join(i['season'])   # 1.1.0
    lines.append(f"- {i['item']}: {price}{' (canon)' if i['canon'] else ''}; {where}{'; ' + i['note'] if i['note'] else ''}{season}")
open(P('src/worldbook/custom/content/506.txt'), 'w', encoding='utf-8').write(
    "[Price Guide] What things cost on campus, in points. Use these prices; items not listed cost what a comparable listed item costs.\n"
    + "\n".join(lines) + "\nPaid work pays 20-40 points a shift. The Banking House changes points and coin 1:1. At the Academy Bazaar prices are whatever the trader says. Out-of-season items are not stocked.\n")
base = json.load(open(P('src/worldbook/index.json')))[0]
def mk(uid, comment, constant, disable, position, depth, order, keys=()):
    e = dict(base)
    e.update(uid=uid, displayIndex=uid, comment=comment, key=list(keys), keysecondary=[], constant=constant, disable=disable,
             position=position, depth=depth, order=order, role=0, selective=True, selectiveLogic=0, probability=100,
             useProbability=True, excludeRecursion=True, preventRecursion=True, group='', scanDepth=None, caseSensitive=None,
             matchWholeWords=None)
    return e
idx = [
    mk(500, '[initvar] Eldrasil starting state', False, True, 1, 4, 1),
    mk(501, 'MVU — Current State (variable list)', True, False, 4, 1, 500),
    mk(502, '[mvu_update] MVU — Variable Update Rules', True, False, 1, 4, 501),
    mk(503, '[mvu_update] MVU — Output Format', True, False, 4, 0, 900),
    mk(504, '[mvu_plot] Campus Rules — State, Presence, Cognitive Isolation', True, False, 1, 4, 502),
    mk(505, 'Now — Clock, Curfew & Presence (EJS)', True, False, 4, 1, 499),
    mk(506, '[mvu_plot] Price Guide', False, False, 1, 4, 503, keys=['buy', 'price', 'cost', 'afford', 'shop', 'Commissary', 'Mall', 'bakery', 'store', 'points for', 'how much', 'Banking House', 'coin', 'order']),
    mk(507, '[config_override]', False, True, 1, 4, 999),   # MVU card config override (5.3): disabled on purpose, read by MVU
]
json.dump(idx, open(P('src/worldbook/custom/index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
exec(open(P('tools/feature_cost.py'), encoding='utf-8').read())   # v1.1.0: writes data/feature_cost.json
print('custom entries:', [e['uid'] for e in idx], '| REG keys', len(reg))
