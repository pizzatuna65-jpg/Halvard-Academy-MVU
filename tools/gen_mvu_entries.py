#!/usr/bin/env python3
"""Batch 2.2 — writes custom MVU worldbook index (uid 500+) and generates the EJS 'Now' entry (505) from data/locations.json."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
locs = json.load(open(P('data/locations.json'), encoding='utf-8'))
ARRIVES = {k: v['arrives'] for k, v in json.load(open(P('data/npcs.json'), encoding='utf-8')).items() if v.get('arrives', 1) > 1}   # v1.0.3
import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import effect_text
npcs = json.load(open(P('data/npcs.json'), encoding='utf-8'))
GIFTS = json.load(open(P('data/gift_prefs.json'), encoding='utf-8'))['npcs']
J = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
# 1.6.0 (N13): the age of a dated line ("M2 W1 Tue ..." or "M2 W1") against the world clock, in words; unreadable -> ''.
# One campus year is 12 months x 4 weeks x 7 days. 1.7.4: a line dated with its year ("Y1 M2 W1 Tue", the engine's form from campaign
# Year 2) is aged exactly ("over a year ago"; a date still ahead gets no age); a line without a year is from the last 12 months.
AGE_JS = ("const ageOf = (w, W) => { const m = /(?:Y(\\d+) )?M(\\d{1,2}) W([1-4])(?: (Mon|Tue|Wed|Thu|Fri|Sat|Sun))?/.exec(String(w || '')); if (!m || !W || !W.Month) return '';"
          " const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], di = Math.max(0, D.indexOf(W.Day)), Y = Math.max(1, Number(W.Year) || 1), yl = m[1] ? Math.max(1, +m[1]) : Y;"
          " const far = n => (n < 2 ? 'over a year ago' : 'over ' + n + ' years ago');"
          " if (!m[4]) { let k = ((Y - 1) * 48 + (W.Month - 1) * 4 + W.Week - 1) - ((yl - 1) * 48 + (+m[2] - 1) * 4 + +m[3] - 1); if (k < 0) { if (m[1]) return ''; k += 48; } if (k >= 48) return far(Math.floor(k / 48));"
          " return k === 0 ? 'this week' : k === 1 ? 'last week' : k < 4 ? k + ' weeks ago' : k < 8 ? 'last month' : Math.floor(k / 4) + ' months ago'; }"
          " let d = ((Y - 1) * 336 + (W.Month - 1) * 28 + (W.Week - 1) * 7 + di) - ((yl - 1) * 336 + (+m[2] - 1) * 28 + (+m[3] - 1) * 7 + D.indexOf(m[4])); if (d < 0) { if (m[1]) return ''; d += 336; } if (d >= 336) return far(Math.floor(d / 336));"
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
# 1.41.0: Sunreach Bay for <now>: fares, the bet limit, and the names of everyone who may be met there
_srd = json.load(open(P('data/sunreach.json'), encoding='utf-8'))
SRD = {**{k: _srd['rates'][k] for k in ('carriage', 'boat', 'tour', 'bet_max')},
       'names': {nid: [npcs[nid]['name'], npcs[nid]['group'].replace(' team', '') if npcs[nid].get('group', '').endswith('team') else 'Halvard']
                 for g in _srd['meet'].values() for nid in g}}
for k, v in {'BDAYS': {k:v['birthday'] for k,v in GIFTS.items() if v['birthday']}, 'REP': REPD, 'BOND': BOND, 'RANK4': json.load(open(P('data/rank4_partners.json'), encoding='utf-8'))['npcs'], 'TRUST': TRUST, 'ARR': {k: v['arrives'] for k, v in npcs.items() if v.get('arrives', 1) > 1},
             'WENDIGO': {'line': json.load(open(P('data/expedition.json'), encoding='utf-8'))['wendigo']['line']}, 'SUNREACH': SRD, 'AVALON': {'fare': json.load(open(P('data/avalon.json'), encoding='utf-8'))['rates']['ride_coin'], 'rivals': {nid: [n['name'], n['group'].replace(' team', ''), n['year']] for nid, n in sorted(npcs.items()) if (n.get('group') or '').endswith('team')}}, 'PRON': {nid: {'F': 'she/her', 'M': 'he/him'}.get(n.get('gender'), 'they/them') for nid, n in sorted(npcs.items())},
             'TENSION': {k: v for k, v in json.load(open(P('data/tension.json'), encoding='utf-8')).items() if k in ('bands', 'categories', 'npcs', 'peaks', 'overrides', 'apology_npc')}}.items():   # 1.3.8 (+1.4.0 apology_npc)
    ph = '/*@@' + k + '@@*/' + ('[]' if isinstance(v, list) else '{}')
    assert ph in ejs, ph
    ejs = ejs.replace(ph, J(v))
ejs = ejs.replace('/*@@AGE@@*/', AGE_JS)
from common import shared_js
assert ejs.count('/*@@SHARED@@*/') == 1
ejs = ejs.replace('/*@@SHARED@@*/', shared_js(presence=False))   # 1.43.0 (audit batch 2): the rules and constants every runtime shares
from common import fill_data
assert json.load(open(P('data/expedition.json'), encoding='utf-8'))['hunt']['hours'] == 24, '505 says the hunt ends at the same hour the next day'
ejs = fill_data(ejs)   # 1.43.0 (2.8): times and numbers in the text come from the data ({@file.path})
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
    ties = [r for i, r in enumerate(ties) if r['to'] not in [x['to'] for x in ties[:i]]]   # 1.6.10: one tie per person (two files can tell the same line)
    ties = [r for r in ties if not (r['type'] == 'dislike' and r['to'] == 'Althair')][:8]   # everyone dislikes Althair one way (1.4.2)
    o = ten_d['overrides'].get(nid) or {}
    ten_never = o.get('never') or (ten_d['categories'].get(ten_d['npcs'].get(nid)) or {}).get('never')
    tru_never = tru_d['categories'][OPEN_OF.get(nid, 'normal')]['never']
    grp = n.get('group') or ''
    who = ("@YEAR@ student" if grp.startswith('Year') else grp) + (f", {n['dorm']} dorm" if n.get('dorm') else '') + ('; ' + ', '.join(n['public_tags']) if n.get('public_tags') else '') + '.'
    full = n['name']; sur = full.split()[-1] if len(full.split()) > 1 else ''
    called = nid + (f"; full name {full}" if full != nid else '') + (f"; nickname {n['nickname']}" if n.get('nickname') else '')
    return {'name': full, 'first': nid, 'pron': {'F': 'she/her', 'M': 'he/him'}.get(n.get('gender'), 'they/them'), 'called': called, 'who': who,
            'never': '; '.join(x for x in [tru_never and tru_never + ' (Trust)', ten_never and ten_never + ' (when strained)'] if x),
            # 1.7.0 cohorts: the sheet shows the first 4 ties with people already at Halvard ([to, type, campaign year they arrive]),
            # and the school year as it is in the current campaign year (lorebook Year + campaign Year - arrival year)
            'ties': [[r['to'], r['type'], npcs[r['to']].get('arrives', 1)] for r in ties], 'secret': False, 'nobond': (grp.endswith('team')),
            'y': [n['year'], n.get('arrives', 1)] if grp.startswith('Year') and n.get('year') else None}
CANON = json.load(open(P('data/npc_canon.json'), encoding='utf-8'))
CHANGE_TEXT = {'fixed': 'Experience deepens who they are; it never rewrites them.', 'shaped': 'A major, repeated experience can change one part of them for good; the old self still shows under stress.', 'fluid': 'They change with their surroundings over months (a new year, a new circle), never within one scene.'}
CAST = {'npcs': {}, 'rel': {}, 'trust_bands': tru_d['bands'], 'tension_bands': ten_d['bands'], 'change': {k: v for k, v in CANON['change'].items()}}   # 1.11.0: the meaning of each type is in the <cast> header
# Batch G (owner-approved canon waves): each NPC's voice, terms, props, stage by rank band and anchor (data/npc_canon.json voice)
CAST['gifts'] = {k: 'Gifts: loves ' + v['text']['loved'] + ' Hates: ' + v['text']['hated'] for k,v in GIFTS.items()}
CAST['voice'] = CANON.get('voice', {})
assert all(k in npcs for k in CAST['voice']) and all(k in npcs for k in CANON['change']), 'npc_canon.json names an unknown NPC'
assert all(set(v['stages']) == {'0-2', '3-5', '6-8', '9-10'} for v in CAST['voice'].values()), 'every voice needs the four stage bands'
# 1.6.8 (owner): the Rank 8 branch lines match the NPC's branch (A: romance and rival, B: rival, C: romance, D: neither)
_BR_LINES = {'A': {'romance', 'rival'}, 'B': {'rival'}, 'C': {'romance'}, 'D': set()}
assert all({k for k in ('romance', 'rival') if k in v} == _BR_LINES[CANON['branch'][i]] for i, v in CAST['voice'].items()), 'a voice has Rank 8 branch lines that do not match its branch'
CAST['branch'] = CANON['branch']
# 1.7.0 (cohort 2, owner): a line per week of the campaign year for some NPCs (Nerys's hobby), printed in their Cast Sheet
CAST['weekly'] = CANON.get('weekly', {})
assert all(k in npcs and len(w['lines']) == 48 and all(0 <= i < 48 for i in w['pinned']) for k, w in CAST['weekly'].items()), 'npc_canon.json weekly: 48 lines per NPC'   # 1.6.9: the sheet of a character with no romance branch (B, D) says so from Rank 6
# 1.48.0 (audit 2.7): the Cast Sheet is one entry per NPC (uid CAST_UID + i, order 301 + i, after the head 509 and before the tail 599,
# all @D1 before <now>), each opening with an @@if line: Prompt Template drops the entry before the scan unless the engine put the NPC
# in $ui.cast, so a generate compiles only the sheets of the people here (was one 679 KB template). The entries join with "\n" in
# order, as SillyTavern joins one depth's entries; each carries the helpers and only its own NPC's data.
CAST_UID, CAST_ORDER = 600, 301
sheets = {}
for nid, n in sorted(npcs.items()):
    raw = open(P(f"src/worldbook/content/{n['uid_card']}.txt"), encoding='utf-8').read()
    m = GATE_RX.match(raw); assert m and m.group(1) == nid, f'NPC entry {n["uid_card"]} ({nid}) has no Cast Sheet gate (merge_lorebooks.py)'
    lore = re.sub(r'^\[[^\]\n]+\]\n', '', m.group(2).strip('\n'))
    CAST['npcs'][nid] = cast_npc(nid, n); CAST['npcs'][nid]['secret'] = '<narrator_only>' in lore
    sheets[nid] = (f"<%_ if (FULL.includes('{nid}')) {{ _%>\n<%- cHead('{nid}', true) %>\n{lore}\n<%_ const _t{nid} = [cVoice('{nid}', true), cTail('{nid}'), cMem('{nid}', true)].filter(Boolean).join('\\n'); if (_t{nid}) {{ _%>\n<%- _t{nid} %>\n<%_ }} _%>\n"
                   f"<%_ }} else if (BRIEF.includes('{nid}')) {{ _%>\n<%- [cHead('{nid}', false), cVoice('{nid}', false), cMem('{nid}', false)].filter(Boolean).join('\\n') %>\n<%_ }} _%>")
assert len(sheets) <= 89, 'the Cast Sheet orders 301-389 are full: move the tail (599) and the head'
for r in rels:
    if r['from'] in npcs and r['to'] in npcs:
        CAST['rel'].setdefault(r['from'], {}).setdefault(r['to'], r['type'] + (('. ' + r['notes'][0]) if r.get('notes') else ''))
def cast_part(name, data, **subs):
    s = open(P('src/worldbook/custom/' + name), encoding='utf-8').read()
    s = re.sub(r'^// .*\n', '', s, flags=re.M)
    assert s.count('/*@@CAST@@*/{}') == 1, name
    s = s.replace('/*@@CAST@@*/{}', J(data)).replace('/*@@AGE@@*/', AGE_JS)
    for k, v in subs.items(): s = s.replace('@@' + k + '@@', v)
    assert '@@' not in s, name
    return s
CC = P('src/worldbook/custom/content')
for f in os.listdir(CC):   # the sheets of an earlier build (an NPC may be gone)
    if re.match(r'^\d+\.txt$', f) and CAST_UID <= int(f[:-4]) < CAST_UID + 100: os.remove(os.path.join(CC, f))
open(os.path.join(CC, '509.txt'), 'w', encoding='utf-8', newline='\n').write(cast_part('509.template.ejs', {'change': CAST['change'], 'voice': {k: 1 for k in CAST['voice']},
    'npcs': {k: {'secret': True} for k, v in CAST['npcs'].items() if v['secret']}}))
open(os.path.join(CC, '599.txt'), 'w', encoding='utf-8', newline='\n').write(cast_part('509_tail.template.ejs', {'rel': CAST['rel']}))
CAST_ENTRIES = []
for i, nid in enumerate(sheets):
    one = {'npcs': {nid: CAST['npcs'][nid]}, 'trust_bands': CAST['trust_bands'], 'tension_bands': CAST['tension_bands'],
           **{k: {nid: CAST[k][nid]} for k in ('change', 'gifts', 'voice', 'branch', 'weekly') if nid in CAST[k]}}
    cond = f"[...((getvar('stat_data.$ui.cast') || {{}}).full || []), ...((getvar('stat_data.$ui.cast') || {{}}).brief || [])].includes('{nid}')"
    body = cast_part('509_sheet.template.ejs', one, SHEET=sheets[nid])
    open(os.path.join(CC, f'{CAST_UID + i}.txt'), 'w', encoding='utf-8', newline='\n').write(f'@@if {cond}\n' + body)
    CAST_ENTRIES.append((CAST_UID + i, f"[mvu_plot] Cast Sheet — {npcs[nid]['name']} (EJS, only while present)", CAST_ORDER + i))
shop = json.load(open(P('data/shop.json'), encoding='utf-8'))['items']
# 1.17.0 (audit T2): the Price Guide lists the shop {{user}} is at (in season), the canon prices, and one line per other shop; the
# whole list used to arrive (~3.7k tokens) whenever a message said "cost" or "shop"
rows = {}
for i in shop:
    price = 'varies' if i['price'] is None else f"{i['price']:,} pts"
    fx = effect_text(i)   # 1.9.5
    season = 'all' if i.get('season', 'all') == 'all' else i['season']   # 1.1.0
    text = f"- {i['item']}: {price}{' (canon)' if i['canon'] else ''}; {i['shop']}{'; ' + i['note'] if i['note'] else ''}{'' if season == 'all' else '; in season: ' + ', '.join(season)}{'; ' + fx if fx else ''}"
    rows.setdefault(i['loc'], []).append([text, season])
assert all(l in locs for l in rows), 'shop.json: loc is not a location'
canon = sorted({(i['item'], i['price']) for i in shop if i['canon'] and i['price'] is not None}, key=lambda x: (x[1], x[0]))   # 1.43.0: ties by name (a set's order changed between builds)
def shop_line(l):
    it = [i for i in shop if i['loc'] == l]; ps = [i['price'] for i in it if i['price'] is not None]
    return f"{locs[l]['name']}: {len(it)} items, {min(ps):,}-{max(ps):,} pts ({', '.join(x['item'] for x in it[:4])}...)"
PG = {'rows': rows, 'names': {k: l for l in rows for k in {locs[l]['name'].lower(), re.sub(r'^the ', '', locs[l]['name'].lower())}},
      'dir': {l: shop_line(l) for l in rows},
      'canon': 'Canon prices (never change): ' + '; '.join(f"{n} {p:,}" for n, p in canon) + '.'}
pg = open(P('src/worldbook/custom/506.template.ejs'), encoding='utf-8').read()
assert pg.count('/*@@SHARED@@*/') == 1
pg = pg.replace('/*@@SHARED@@*/', shared_js(presence=False))   # 1.43.0 (audit batch 2)
PG_SHARED_LEN = len(re.sub(r'^// .*\n', '', shared_js(presence=False), flags=re.M))   # code only, never sent: left out of the Settings estimate
pg = re.sub(r'^// .*\n', '', pg, flags=re.M)
assert '/*@@PG@@*/{}' in pg
craft_sale = [[i['name'], i['sale']] for i in json.load(open(P('data/crafts.json'), encoding='utf-8'))['recipes'] if i.get('sale')]
assert '/*@@CRAFT_SALE@@*/[]' in pg
open(P('src/worldbook/custom/content/506.txt'), 'w', encoding='utf-8', newline='\n').write(pg.replace('/*@@PG@@*/{}', J(PG)).replace('/*@@CRAFT_SALE@@*/[]', J(craft_sale)))
base = json.load(open(P('src/worldbook/index.json')))[0]
def mk(uid, comment, constant, disable, position, depth, order, keys=(), whole=None, scan=None):
    e = dict(base)
    e.update(uid=uid, displayIndex=uid, comment=comment, key=list(keys), keysecondary=[], constant=constant, disable=disable,
             position=position, depth=depth, order=order, role=0, selective=True, selectiveLogic=0, probability=100,
             useProbability=True, excludeRecursion=True, preventRecursion=True, group='', scanDepth=scan, caseSensitive=None,
             matchWholeWords=whole, ignoreBudget=True)   # 1.35.0: the budget would count the raw EJS (see merge_lorebooks.py)
    return e
idx = [
    mk(500, '[initvar] Eldrasil starting state', False, True, 1, 4, 1),
    mk(501, 'MVU — Current State (variable list)', True, False, 4, 1, 500),
    mk(502, '[mvu_update] MVU — Variable Update Rules', True, False, 1, 4, 501),
    mk(503, '[mvu_update] MVU — Output Format', True, False, 4, 0, 900),
    mk(504, '[mvu_plot] Campus Rules — State, Presence, Cognitive Isolation', True, False, 1, 4, 502),
    mk(505, 'Now — Clock, Curfew & Presence (EJS)', True, False, 4, 1, 499),
    mk(506, '[mvu_plot] Price Guide (EJS, by place)', False, False, 1, 4, 503, keys=['buy', 'buys', 'bought', 'price', 'prices', 'afford', 'shop', 'shopping', 'Commissary', 'Mall', 'bakery', 'store', 'points for', 'how much', 'Banking House', 'special order'], whole=True, scan=2),   # 1.17.0 (audit T2): no 'cost' / 'order', whole words, the last two messages
    mk(507, '[config_override]', False, True, 1, 4, 999),   # MVU card config override (5.3): disabled on purpose, read by MVU
    mk(508, "[mvu_plot] Event — {{user}}'s Birthday (EJS, only on the day)", True, False, 1, 4, 85),   # 1.2.0: hand-written, gated on Profile.Birthday
    mk(509, '[mvu_plot] Cast Sheet — opens <cast> (EJS)', True, False, 4, 1, 300),   # 1.5.1: 509.template.ejs; 1.48.0 the head, sheets 600+
    mk(510, '[mvu_plot] Last-mile cast gate (EJS, only with people present)', True, False, 4, 0, 899),   # 1.5.1 (D1): hand-written; before 503
    mk(599, '[mvu_plot] Cast Sheet — ties and Extras, closes </cast> (EJS)', True, False, 4, 1, 390),   # 1.48.0 (audit 2.7)
]
idx[-1:-1] = [mk(u, c, True, False, 4, 1, o) for u, c, o in CAST_ENTRIES]   # 1.48.0 (audit 2.7): one Cast Sheet per NPC
json.dump(idx, open(P('src/worldbook/custom/index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
exec(open(P('tools/feature_cost.py'), encoding='utf-8').read())   # v1.1.0: writes data/feature_cost.json
print('custom entries:', [e['uid'] for e in idx])
