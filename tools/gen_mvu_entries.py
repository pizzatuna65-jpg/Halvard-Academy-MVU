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
# 1.6.0 (N13): the age of a dated line ("M2 W1 Tue ..." or "M2 W1") against the world clock, in words; unreadable -> ''.
# One campus year is 12 months x 4 weeks x 7 days; a date later in the year than today is from the year before.
AGE_JS = ("const ageOf = (w, W) => { const m = /M(\d{1,2}) W([1-4])(?: (Mon|Tue|Wed|Thu|Fri|Sat|Sun))?/.exec(String(w || '')); if (!m || !W || !W.Month) return '';"
          " const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], di = Math.max(0, D.indexOf(W.Day));"
          " if (!m[3]) { let k = ((W.Month - 1) * 4 + W.Week - 1) - ((+m[1] - 1) * 4 + +m[2] - 1); if (k < 0) k += 48;"
          " return k === 0 ? 'this week' : k === 1 ? 'last week' : k < 4 ? k + ' weeks ago' : k < 8 ? 'last month' : Math.floor(k / 4) + ' months ago'; }"
          " let d = ((W.Month - 1) * 28 + (W.Week - 1) * 7 + di) - ((+m[1] - 1) * 28 + (+m[2] - 1) * 7 + D.indexOf(m[3])); if (d < 0) d += 336;"
          " return d === 0 ? 'earlier today' : d === 1 ? 'yesterday' : d < 7 ? d + ' days ago' : d < 14 ? 'last week' : d < 28 ? Math.floor(d / 7) + ' weeks ago' : d < 56 ? 'last month' : Math.floor(d / 28) + ' months ago'; };")
ejs = open(P('src/worldbook/custom/505.template.ejs'), encoding='utf-8').read()
ejs = re.sub(r'^// Source of custom entry 505.*\n', '', ejs, flags=re.M)
# 1.2.2 bonds: what a present NPC shares at their rank (openness shifts the first tiers), what the rank allows, the event text
BR = json.load(open(P('data/bond_rules.json'), encoding='utf-8'))
OPN = json.load(open(P('data/bond_openness.json'), encoding='utf-8'))
off = {nid: BR['openness'][tag] for tag in ('open', 'guarded', 'closed') for nid in OPN[tag]}
assert all(nid in npcs for nid in off), [nid for nid in off if nid not in npcs]
BOND = {'share': BR['share'], 'real': BR['share_real_from'], 'perks': BR['perks'], 'off': off, 'recent_now': BR['recent']['now'],
        'tag': {nid: tag for tag in ('open', 'guarded', 'closed') for nid in OPN[tag]}}
# 1.4.3 Trust for the Now entry: bands, share shifts, perk gates, category texts (category = openness), personal rules, Dorm Heads
_tru = json.load(open(P('data/trust.json'), encoding='utf-8'))
TRUST = {'bands': _tru['bands'], 'share': _tru['effects']['share'], 'early': _tru['effects']['confidant_real_early'], 'gates': _tru['perk_gates'],
         'susp': _tru['suspend_r10_below'], 'cats': {k: {'name': v['name'], 'bands': v['bands'], 'never': v['never']} for k, v in _tru['categories'].items()},
         'npcs': {nid: tag for tag in ('open', 'guarded', 'closed') for nid in OPN[tag]},
         'overrides': {k: {x: o[x] for x in ('text', 'until_secret', 'no_gates') if x in o} for k, o in _tru['overrides'].items() if o.get('text') or o.get('no_gates')},
         'dorm_head': {k: {x: v[x] for x in ('dorm', 'category', 'text')} for k, v in _tru['dorm_head'].items()}}
REPD = json.load(open(P('data/reputation.json'), encoding='utf-8'))   # 1.3.0
REPD = {'reps': REPD['reps'], 'effects': REPD['effects']}
for k, v in {'REP': REPD, 'BOND': BOND, 'TRUST': TRUST, 'REG': reg, 'ARR': {k: v['arrives'] for k, v in npcs.items() if v.get('arrives', 1) > 1}, 'STU': STU, 'TEACH': TEACH, 'TT': TT,
             'CLUBV': CLUBV, 'OUTD': OUTD, 'VN': VN, 'MOODS': MOODS, 'PRON': {nid: {'F': 'she/her', 'M': 'he/him'}.get(n.get('gender'), 'they/them') for nid, n in sorted(npcs.items())},
             'TENSION': {k: v for k, v in json.load(open(P('data/tension.json'), encoding='utf-8')).items() if k in ('bands', 'categories', 'npcs', 'peaks', 'overrides', 'apology_npc')}}.items():   # 1.3.8 (+1.4.0 apology_npc)
    ph = '/*@@' + k + '@@*/' + ('[]' if isinstance(v, list) else '{}')
    assert ph in ejs, ph
    ejs = ejs.replace(ph, J(v))
ejs = ejs.replace('/*@@AGE@@*/', AGE_JS)
assert '@@' not in ejs
open(P('src/worldbook/custom/content/505.txt'), 'w', encoding='utf-8').write(ejs)
# ---- 1.5.1 (Batch B): Cast Sheet (509) and the last-mile cast gate (510) ----
rels = json.load(open(P('data/relations.json'), encoding='utf-8'))
TIE_ORDER = ['friends', 'rivals', 'softspot', 'protective', 'respect', 'wary', 'dislike']
ten_d = json.load(open(P('data/tension.json'), encoding='utf-8')); tru_d = json.load(open(P('data/trust.json'), encoding='utf-8'))
OPEN_OF = {nid: tag for tag in ('open', 'guarded', 'closed') for nid in OPN[tag]}
GATE_RX = re.compile(r"^<%_ if \(!\(\(getvar\('stat_data\.\$ui\.cast'\) \|\| \{\}\)\.full \|\| \[\]\)\.includes\('(\w+)'\)\) \{ _%>\n([\s\S]*)\n<%_ \} _%>$")
def cast_npc(nid, n):
    ties = sorted([r for r in rels if r['from'] == nid], key=lambda r: (TIE_ORDER.index(r['type']), r['to']))
    ties = [r for r in ties if not (r['type'] == 'dislike' and r['to'] == 'Althair')][:4]   # everyone dislikes Althair one way (1.4.2)
    o = ten_d['overrides'].get(nid) or {}
    ten_never = o.get('never') or (ten_d['categories'].get(ten_d['npcs'].get(nid)) or {}).get('never')
    tru_never = tru_d['categories'][OPEN_OF.get(nid, 'normal')]['never']
    grp = n.get('group') or ''
    who = (f"{grp} student" if grp.startswith('Year') else grp) + (f", {n['dorm']} dorm" if n.get('dorm') else '') + ('; ' + ', '.join(n['public_tags']) if n.get('public_tags') else '') + '.'
    full = n['name']; sur = full.split()[-1] if len(full.split()) > 1 else ''
    called = nid + (f"; full name {full}" if full != nid else '') + (f"; nickname {n['nickname']}" if n.get('nickname') else '')
    return {'name': full, 'first': nid, 'pron': {'F': 'she/her', 'M': 'he/him'}.get(n.get('gender'), 'they/them'), 'called': called, 'who': who,
            'never': '; '.join(x for x in [tru_never and tru_never + ' (Trust)', ten_never and ten_never + ' (when strained)'] if x),
            'ties': ', '.join(f"{r['to']} ({r['type']})" for r in ties), 'secret': False, 'nobond': (grp.endswith('team'))}
CANON = json.load(open(P('data/npc_canon.json'), encoding='utf-8'))
CHANGE_TEXT = {'fixed': 'Experience deepens who they are; it never rewrites them.', 'shaped': 'A major, repeated experience can change one part of them for good; the old self still shows under stress.', 'fluid': 'They change with their surroundings over months (a new year, a new circle), never within one scene.'}
CAST = {'npcs': {}, 'rel': {}, 'trust_bands': tru_d['bands'], 'tension_bands': ten_d['bands'], 'change': {k: v + ': ' + CHANGE_TEXT[v] for k, v in CANON['change'].items()}}
# Batch G (owner-approved canon waves): each NPC's voice, terms, props, stage by rank band and anchor (data/npc_canon.json voice)
CAST['voice'] = CANON.get('voice', {})
assert all(k in npcs for k in CAST['voice']) and all(k in npcs for k in CANON['change']), 'npc_canon.json names an unknown NPC'
assert all(set(v['stages']) == {'0-2', '3-5', '6-8', '9-10'} for v in CAST['voice'].values()), 'every voice needs the four stage bands'
sheets = []
for nid, n in sorted(npcs.items()):
    raw = open(P(f"src/worldbook/content/{n['uid_card']}.txt"), encoding='utf-8').read()
    m = GATE_RX.match(raw); assert m and m.group(1) == nid, f'NPC entry {n["uid_card"]} ({nid}) has no Cast Sheet gate (merge_lorebooks.py)'
    lore = re.sub(r'^\[[^\]\n]+\]\n', '', m.group(2).strip('\n'))
    CAST['npcs'][nid] = cast_npc(nid, n); CAST['npcs'][nid]['secret'] = '<narrator_only>' in lore
    sheets.append(f"<%_ if (FULL.includes('{nid}')) {{ _%>\n<%- cHead('{nid}', true) %>\n{lore}\n<%_ const _t{nid} = [cVoice('{nid}', true), cTail('{nid}'), cMem('{nid}', true)].filter(Boolean).join('\\n'); if (_t{nid}) {{ _%>\n<%- _t{nid} %>\n<%_ }} _%>\n"
                  f"<%_ }} else if (BRIEF.includes('{nid}')) {{ _%>\n<%- [cHead('{nid}', false), cVoice('{nid}', false), cMem('{nid}', false)].filter(Boolean).join('\\n') %>\n<%_ }} _%>")
for r in rels:
    if r['from'] in npcs and r['to'] in npcs:
        CAST['rel'].setdefault(r['from'], {})[r['to']] = r['type'] + (('. ' + r['notes'][0]) if r.get('notes') else '')
cs = open(P('src/worldbook/custom/509.template.ejs'), encoding='utf-8').read()
cs = re.sub(r'^// .*\n', '', cs, flags=re.M)
assert '/*@@CAST@@*/{}' in cs and '@@SHEETS@@' in cs
cs = cs.replace('/*@@CAST@@*/{}', J(CAST)).replace('@@SHEETS@@', '\n'.join(sheets)).replace('/*@@AGE@@*/', AGE_JS)
assert '@@' not in cs
open(P('src/worldbook/custom/content/509.txt'), 'w', encoding='utf-8').write(cs)
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
    mk(508, "[mvu_plot] Event — {{user}}'s Birthday (EJS, only on the day)", True, False, 1, 4, 85),   # 1.2.0: hand-written, gated on Profile.Birthday
    mk(509, '[mvu_plot] Cast Sheet — present characters (EJS)', True, False, 4, 1, 498),   # 1.5.1: generated from 509.template.ejs + lore
    mk(510, '[mvu_plot] Last-mile cast gate (EJS, only with people present)', True, False, 4, 0, 899),   # 1.5.1 (D1): hand-written; before 503
]
json.dump(idx, open(P('src/worldbook/custom/index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
exec(open(P('tools/feature_cost.py'), encoding='utf-8').read())   # v1.1.0: writes data/feature_cost.json
print('custom entries:', [e['uid'] for e in idx], '| REG keys', len(reg))
