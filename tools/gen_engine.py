#!/usr/bin/env python3
"""Batch 2.3 — generates src/scripts/engine.js from engine.template.js + data/npcs.json (alias map)."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
npcs = json.load(open(P('data/npcs.json'), encoding='utf-8'))
alias = {}
for nid, n in npcs.items():
    for a in [nid, n['name'], n.get('nickname')] + [k for k in n['keys'] if k[:1].isupper() and len(k.split()) <= 3]:
        if a: alias.setdefault(a.lower(), nid)
# drop keys that are clearly not names (clubs, places, titles shared by many)
BAD = re.compile(r'club|library|council|dorm|academy|team|circle|house|hall|tower|office|order|choir|lord|king|saint|squad|doves?$', re.I)
DENY = {'festival committee', 'divination society', 'theatre troupe', 'shub-niggurath', 'shub niggurath', 'hastur', 'loki', 'hades',
        'excalibur', 'gohn', 'janna', 'laetano', 'velmora', 'niu', 'ardenne', 'villeneuve'}  # spirits, items, brands, groups, shared surnames
alias = {k: v for k, v in alias.items() if (not BAD.search(k) or k == v.lower()) and k not in DENY}
forms = {nid: sorted({f for f in [nid, n['name'], n.get('nickname')] if f and len(f) > 1}, key=len, reverse=True) for nid, n in npcs.items()}
t = open(P('src/scripts/engine.template.js'), encoding='utf-8').read()
locs = json.load(open(P('data/locations.json'), encoding='utf-8'))
castle = sorted({n.lower() for l in locs.values() if l.get('pin') == 1 for n in (l['name'], re.sub(r'^The ', '', l['name']))} | {'castle', 'the castle'})
t = t.replace('/*@@CASTLE@@*/[]', json.dumps(castle, ensure_ascii=False))
# v1.0.3 (F01): all campus place names, so the engine can tell an off-grounds location from a campus one
campus = sorted({n.lower() for l in locs.values() for n in (l['name'], re.sub(r'^The ', '', l['name']))} | set(castle) | {'main courtyard', 'halvard', 'halvard academy', 'campus'})
t = t.replace('/*@@CAMPUS@@*/[]', json.dumps(campus, ensure_ascii=False))
# v1.0.3: Halvard students and their lorebook Year (group "Year N"; rival academy teams and staff are not included)
students = {nid: [n['year'], n.get('arrives', 1)] for nid, n in sorted(npcs.items()) if re.match(r'^Year \d$', n.get('group') or '') and n.get('year')}
assert students, 'no Halvard students found'
t = t.replace('/*@@STUDENTS@@*/{}', json.dumps(students, ensure_ascii=False, separators=(',', ':')))
arrives = {nid: n['arrives'] for nid, n in sorted(npcs.items()) if n.get('arrives', 1) > 1}   # v1.0.3 incoming cohorts
t = t.replace('/*@@ARRIVES@@*/{}', json.dumps(arrives, ensure_ascii=False, separators=(',', ':')))
# v1.1.0 (spec §4.8): outdoor places (lowercase names, with and without "the"); rule and canon corrections in tools/common.py
import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import outdoor_ids, place_keys
outdoor = sorted({k for lid in outdoor_ids(locs) for k in place_keys(locs[lid], lid)})
t = t.replace('/*@@OUTDOOR@@*/[]', json.dumps(outdoor, ensure_ascii=False))
# v1.1.0 (spec §9): Features settings, single source data/features.json (the engine needs id, control, field, paths, unlock)
feats = json.load(open(P('data/features.json'), encoding='utf-8'))['features']
t = t.replace('/*@@FEATURES@@*/[]', json.dumps([{k: f[k] for k in ('id', 'control', 'field', 'paths', 'unlock') if k in f} for f in feats], ensure_ascii=False, separators=(',', ':')))
hap = json.load(open(P('data/happenings.json'), encoding='utf-8'))['items']
WX_KINDS = {'snow', 'after_storm', 'dense_fog', 'clear_night'}
assert all(h.get('weather') in (None, *WX_KINDS) for h in hap), 'unknown happening weather'
locnames = {l['name'] for l in locs.values()}
assert all(h['where'] in locnames or h['where'] == '' for h in hap), [h['where'] for h in hap if h['where'] not in locnames]
t = t.replace('/*@@HAPPENINGS@@*/[]', json.dumps(hap, ensure_ascii=False, separators=(',', ':')))
# 1.2.2 bonds: rules, scripted events (tools/import_bond_events.py), and where each NPC is usually found (Haunts, first clause)
t = t.replace('/*@@BOND_RULES@@*/{}', json.dumps(json.load(open(P('data/bond_rules.json'), encoding='utf-8')), ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@BOND_EVENTS@@*/[]', json.dumps(json.load(open(P('data/bond_events.json'), encoding='utf-8'))['events'], ensure_ascii=False, separators=(',', ':')))
haunt = {}
for nid, n in npcs.items():
    f = next((f['text'] for f in n['fields'] if f['label'] == 'Haunts'), '')
    if f: haunt[nid] = re.split(r'[;.]', f.replace('{{user}}', 'you'))[0].strip()[:80]
t = t.replace('/*@@HAUNTS@@*/{}', json.dumps(haunt, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@NAME_FORMS@@*/{}', json.dumps(forms, ensure_ascii=False, separators=(',', ':')))
open(P('src/scripts/engine.js'), 'w', encoding='utf-8').write(t.replace('/*@@NPC_ALIAS@@*/{}', json.dumps(alias, ensure_ascii=False, separators=(',', ':'))))
assert '/*@@' not in open(P('src/scripts/engine.js'), encoding='utf-8').read(), 'unreplaced placeholder in engine.js'
print('aliases:', len(alias), '| outdoor names:', len(outdoor), '| features:', len(feats))
