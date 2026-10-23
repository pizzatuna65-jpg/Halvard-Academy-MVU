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
from common import AGE_JS, now_data, name_forms, MENTION_DENY   # 1.48.0: shared with the engine (its <now> lines, audit 3.11)
ejs = open(P('src/worldbook/custom/505.template.ejs'), encoding='utf-8').read()
ejs = re.sub(r'^// Source of custom entry 505.*\n', '', ejs, flags=re.M)
OPN = json.load(open(P('data/bond_openness.json'), encoding='utf-8'))
REPD = json.load(open(P('data/reputation.json'), encoding='utf-8'))   # 1.3.0
REPD = {'reps': REPD['reps'], 'effects': REPD['effects']}
for k, v in {'BDAYS': {k:v['birthday'] for k,v in GIFTS.items() if v['birthday']}, 'REP': REPD, 'ARR': {k: v['arrives'] for k, v in npcs.items() if v.get('arrives', 1) > 1},
             'TRN': {k: v['transfer'] for k, v in npcs.items() if v.get('transfer')},   # 1.97.5: a transfer is at Halvard once Campus_State.Transfers names her
             'PRON': {nid: {'F': 'she/her', 'M': 'he/him'}.get(n.get('gender'), 'they/them') for nid, n in sorted(npcs.items())},
             # 1.80.0 (Megumin audit MS4): the engine's name forms; a first name that is also a word (MENTION_DENY) counts only in full
             'NAMES': {nid: [f for f in fs if not (nid in MENTION_DENY and f == nid)] for nid, fs in sorted(name_forms(npcs).items())}}.items():   # 1.3.8 (+1.4.0 apology_npc)
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
# 1.99.6 (T5): the keyword entry holds the public part, then the full lore after the marker (merge_lorebooks.py mention_brief)
GATE_RX = re.compile(r"^<%_ if \(!\(\(getvar\('stat_data\.\$ui\.cast'\) \|\| \{\}\)\.full \|\| \[\]\)\.includes\('(\w+)'\)\) \{ if \([^\n]*\) \{ _%>\n[\s\S]*?\n<%_ \} else \{ /\* full lore \*/ _%>\n([\s\S]*)\n<%_ \} \} _%>$")
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
            # 1.97.5: a tie between a transfer and a Halvard person waits for her transfer ('tr:<id>')
            'ties': [[r['to'], r['type'], 'tr:' + nid if n.get('transfer') and npcs[r['to']].get('group') != 'World teams' else 'tr:' + r['to'] if npcs[r['to']].get('transfer') else npcs[r['to']].get('arrives', 1)] for r in ties], 'secret': False, 'nobond': (grp.endswith('team') or grp == 'World teams'),
            'y': [n['year'], n.get('arrives', 1)] if grp.startswith('Year') and n.get('year') else None,
            **({'tr': n['transfer']} if n.get('transfer') else {})}   # 1.97.5: a transfer's line follows Campus_State.Transfers (cWho)
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
shop_all = json.load(open(P('data/shop.json'), encoding='utf-8'))['items']
cw_timed = lambda i: i.get('club') and (i.get('when') or i.get('from') or i.get('day') or i.get('days'))   # 1.90.0: a club stall with hours or a condition
shop = [i for i in shop_all if not i.get('ev') and not cw_timed(i)]   # 1.81.0: event stalls are listed on their own (PG.ev), only on their day; 1.90.0 club stalls (PG.cw)
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
PG = {'rows': rows, 'names': {k: l for l in rows for k in dict.fromkeys((locs[l]['name'].lower(), re.sub(r'^the ', '', locs[l]['name'].lower())))},
      'dir': {l: shop_line(l) for l in rows},
      'canon': 'Canon prices (never change): ' + '; '.join(f"{n} {p:,}" for n, p in canon) + '.'}
# 1.81.0 (planning/DRAFT_event_frame.md 4.1): event stalls by event id { shop, place, hours, rows }; 506 prints them while the engine
# says a stall of that event is open where {{user}} is ($ui.ev[].stall), else one "Event stalls today" line
PG['ev'] = {}
for i in shop_all:
    if not i.get('ev'): continue
    fx = effect_text(i)
    g = PG['ev'].setdefault(i['ev'], {'shop': i['shop'], 'place': locs[i['loc']]['name'], 'hours': ', '.join(f"{d} {f0}–{t0}" for d, (f0, t0) in i['days'].items()) if i.get('days') else f"{i.get('day', '') + ' ' if i.get('day') else ''}{i.get('from', '00:00')}–{i.get('to', '24:00')}", 'rows': []})
    g['rows'].append(f"- {i['item']}: {i['price']:,} pts{'; ' + i['note'] if i['note'] else ''}{'; ' + fx if fx else ''}")
# 1.90.0 (planning/DRAFT_kerja_club.md §3): club stalls by place { loc: [[item, text]] }; 506 prints the ones the engine says are open
# where {{user}} is ($ui.cw.open)
PG['cw'] = {}
for i in shop_all:
    if not cw_timed(i): continue
    fx = effect_text(i)
    hrs = ', '.join(f"{d} {f0}–{t0}" for d, (f0, t0) in i['days'].items()) if i.get('days') else f"{i.get('day', '') + ' ' if i.get('day') else ''}{i.get('from', '00:00')}–{i.get('to', '24:00')}"   # 1.91.0: days
    PG['cw'].setdefault(i['loc'], []).append([i['item'], f"- {i['item']}: {i['price']:,} pts; {i['shop']}, {hrs}{'; ' + i['note'] if i['note'] else ''}{'; ' + fx if fx else ''}"])
    for k in dict.fromkeys((locs[i['loc']]['name'].lower(), re.sub(r'^the ', '', locs[i['loc']]['name'].lower()))): PG['names'].setdefault(k, i['loc'])
pg = open(P('src/worldbook/custom/506.template.ejs'), encoding='utf-8').read()
assert pg.count('/*@@SHARED@@*/') == 1
pg = pg.replace('/*@@SHARED@@*/', shared_js(presence=False))   # 1.43.0 (audit batch 2)
PG_SHARED_LEN = len(re.sub(r'^// .*\n', '', shared_js(presence=False), flags=re.M))   # code only, never sent: left out of the Settings estimate
pg = re.sub(r'^// .*\n', '', pg, flags=re.M)
assert '/*@@PG@@*/{}' in pg
craft_sale = [[i['name'], i['sale']] for i in json.load(open(P('data/crafts.json'), encoding='utf-8'))['recipes'] if i.get('sale')]
assert '/*@@CRAFT_SALE@@*/[]' in pg
open(P('src/worldbook/custom/content/506.txt'), 'w', encoding='utf-8', newline='\n').write(pg.replace('/*@@PG@@*/{}', J(PG)).replace('/*@@CRAFT_SALE@@*/[]', J(craft_sale)))
# 1.54.0 (narrator-load audit U1, stage 1): the rule cards entry prints the cards the engine listed ($ui.now.rules); with no list
# (a state the engine has not run on yet) it prints every card whose feature is on (fail-open)
RC = json.load(open(P('data/rule_cards.json'), encoding='utf-8'))['cards']
_feat_ids = {f['id'] for f in json.load(open(P('data/features.json'), encoding='utf-8'))['features']}
assert all(not v['feature'] or v['feature'] in _feat_ids for v in RC.values()), 'rule_cards.json: unknown feature'
rc = open(P('src/worldbook/custom/511.template.ejs'), encoding='utf-8').read()
assert rc.count('/*@@RULE_CARDS@@*/{}') == 1
assert rc.count('/*@@CHANGE@@*/{}') == 1
# 1.58.0 (U9): the Imprints card names the change type of those here, so an update model without <cast> can follow it
open(P('src/worldbook/custom/content/511.txt'), 'w', encoding='utf-8', newline='\n').write(rc.replace('/*@@RULE_CARDS@@*/{}', J(RC)).replace('/*@@CHANGE@@*/{}', J({'type': CAST['change'], 'def': CHANGE_TEXT})))
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
    mk(506, 'Price Guide (EJS, by place)', False, False, 1, 4, 503, keys=['buy', 'buys', 'bought', 'price', 'prices', 'afford', 'shop', 'shopping', 'Commissary', 'Mall', 'bakery', 'store', 'points for', 'how much', 'Banking House', 'special order'], whole=True, scan=2),   # 1.17.0 (audit T2): no 'cost' / 'order', whole words, the last two messages; 1.58.0 (U9): untagged, the update model writes /Purchases with its names
    mk(507, '[config_override]', False, True, 1, 4, 999),   # MVU card config override (5.3): disabled on purpose, read by MVU
    mk(508, "[mvu_plot] Event — {{user}}'s Birthday (EJS, only on the day)", True, False, 1, 4, 85),   # 1.2.0: hand-written, gated on Profile.Birthday
    mk(509, '[mvu_plot] Cast Sheet — opens <cast> (EJS)', True, False, 4, 1, 300),   # 1.5.1: 509.template.ejs; 1.48.0 the head, sheets 600+
    mk(510, '[mvu_plot] Last-mile cast gate (EJS, only with people present)', True, False, 4, 0, 899),   # 1.5.1 (D1): hand-written; before 503
    mk(511, '[mvu_update] Rule cards — the update rules for what is going on now (EJS)', True, False, 4, 1, 498),   # 1.54.0 (U1): before <now>
    mk(512, '[mvu_plot] Student rule — alcohol and tobacco', False, False, 1, 4, 504, keys=['alcohol', 'alcoholic', 'wine', 'ale', 'beer', 'mead', 'liquor', 'drink', 'drinks', 'drinking', 'drunk', 'tipsy', 'tobacco', 'smoke', 'smoking', 'cigar', 'cigarette', 'bar', 'tavern', 'Barrow & Vine'], whole=True, scan=2),   # 1.54.0 (U1): hand-written, was in 502
    mk(599, '[mvu_plot] Cast Sheet — ties and Extras, closes </cast> (EJS)', True, False, 4, 1, 390),   # 1.48.0 (audit 2.7)
]
idx[-1:-1] = [mk(u, c, True, False, 4, 1, o) for u, c, o in CAST_ENTRIES]   # 1.48.0 (audit 2.7): one Cast Sheet per NPC
json.dump(idx, open(P('src/worldbook/custom/index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
exec(open(P('tools/feature_cost.py'), encoding='utf-8').read())   # v1.1.0: writes data/feature_cost.json
print('custom entries:', [e['uid'] for e in idx])
