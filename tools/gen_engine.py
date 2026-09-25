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
# 1.3.4: the engine version is the card version (the [initvar] entry carries the same, see build/build_card.py)
t = t.replace("'@@VERSION@@'", json.dumps(json.load(open(P('src/card/card.json'), encoding='utf-8'))['character_version']))
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
from common import outdoor_ids, place_keys, place_aliases
# 1.3.1: place names for World.Location normalisation (engine canonLocation); dorm rooms every dorm shares are never promoted
pnames = {k: l['name'] for lid, l in sorted(locs.items()) for k in place_keys(l, lid)}
t = t.replace('/*@@PLACE_NAMES@@*/{}', json.dumps(pnames, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@PLACE_ALIAS@@*/{}', json.dumps(place_aliases(locs), ensure_ascii=False, separators=(',', ':')))
pins = json.load(open(P('data/map_pins.json'), encoding='utf-8'))
shared = sorted(locs[i]['name'] for i in locs if sum(i in p['cluster'] for p in pins) > 1)
t = t.replace('/*@@PLACE_SHARED@@*/[]', json.dumps(shared, ensure_ascii=False))
# 1.3.1 Settings for training and reputation (data/tuning.json); the defaults must be the numbers the data files use
tun = json.load(open(P('data/tuning.json'), encoding='utf-8'))
rows = [r for g in tun['groups'] for r in g['rows']]
_src = {'training': json.load(open(P('data/training.json'), encoding='utf-8')), 'reputation': json.load(open(P('data/reputation.json'), encoding='utf-8'))}
for r in rows:
    assert any(o[0] == r['def'] for o in r['opts']), f"tuning {r['id']}: default not an option"
    if r['src']:
        f, k = r['src'].split('.'); assert _src[f][k] == r['def'], f"tuning {r['id']}: default {r['def']} != {r['src']} {_src[f][k]}"
t = t.replace('/*@@TUNING@@*/[]', json.dumps([{k: r[k] for k in ('id', 'opts', 'def')} for r in rows], ensure_ascii=False, separators=(',', ':')))
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
# 1.3.0 bond rewards, reputation, training (data/*.json single sources) and each NPC's group for them
rew = json.load(open(P('data/bond_rewards.json'), encoding='utf-8'))
assert all(nid in npcs for nid in rew['npcs']) and all(nid in npcs for nid in rew['mask'] + [rew['krieg']['id']]), 'bond_rewards.json: unknown NPC'
rep = json.load(open(P('data/reputation.json'), encoding='utf-8'))
assert all(nid in npcs for nid in rep['anti_doves'] + rep['pro_doves'] + rep['doves_bond']), 'reputation.json: unknown NPC'
strip = lambda o: {k: v for k, v in o.items() if not k.startswith('_')}
t = t.replace('/*@@BOND_REWARDS@@*/{}', json.dumps(strip(rew), ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@REPUTATION@@*/{}', json.dumps(strip(rep), ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@TRAINING@@*/{}', json.dumps(strip(json.load(open(P('data/training.json'), encoding='utf-8'))), ensure_ascii=False, separators=(',', ':')))
grp = lambda n: 'rival' if (n.get('group') or '').endswith('team') else 'staff' if n.get('group') == 'Staff' else 'student' if re.match(r'^Year \d$', n.get('group') or '') else 'other'
t = t.replace('/*@@NPC_GROUP@@*/{}', json.dumps({nid: grp(n) for nid, n in sorted(npcs.items())}, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@HAUNTS@@*/{}', json.dumps(haunt, ensure_ascii=False, separators=(',', ':')))
# 1.3.8 Tension (data/tension.json): every bonded NPC has a category or an override
ten = strip(json.load(open(P('data/tension.json'), encoding='utf-8')))
bonded = [nid for nid, n in npcs.items() if grp(n) != 'rival']
assert not [i for i in bonded if i not in ten['npcs'] and i not in ten['overrides']], ('tension.json: NPC without a category', [i for i in bonded if i not in ten['npcs'] and i not in ten['overrides']])
assert all(c in ten['categories'] for c in ten['npcs'].values()) and all(i in npcs for i in list(ten['npcs']) + list(ten['overrides'])), 'tension.json: unknown category or NPC'
t = t.replace('/*@@TENSION@@*/{}', json.dumps(ten, ensure_ascii=False, separators=(',', ':')))
# 1.4.3 Trust (data/trust.json): the category is the NPC's openness (data/bond_openness.json; not listed = normal); friends are the
# Friends lines of People -> Connections (data/relations.json), for the spread of a betrayal
tru = strip(json.load(open(P('data/trust.json'), encoding='utf-8')))
opn = json.load(open(P('data/bond_openness.json'), encoding='utf-8'))
tru['npcs'] = {nid: next((c for c in ('open', 'guarded', 'closed') if nid in opn[c]), 'normal') for nid in bonded}
assert all(c in tru['categories'] for c in tru['npcs'].values()) and all(i in npcs for i in list(tru['overrides']) + list(tru['dorm_head'])), 'trust.json: unknown category or NPC'
assert all(v['category'] in tru['categories'] for v in tru['dorm_head'].values()), 'trust.json: dorm_head category'
fr = {}
for e in json.load(open(P('data/relations.json'), encoding='utf-8')):
    if e['type'] == 'friends' and not e.get('rule'): fr.setdefault(e['from'], set()).add(e['to']); fr.setdefault(e['to'], set()).add(e['from'])
tru['friends'] = {k: sorted(v) for k, v in sorted(fr.items())}
t = t.replace('/*@@TRUST@@*/{}', json.dumps(tru, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@NAME_FORMS@@*/{}', json.dumps(forms, ensure_ascii=False, separators=(',', ':')))
# 1.5.1 (P6): first names that are also ordinary words; a sentence-initial one is not counted as a mention
MENTION_DENY = ['Pip', 'Ruby']
# 1.6.0 (N2): stability type per NPC (owner canon; empty until the canon waves)
CANON = json.load(open(P('data/npc_canon.json'), encoding='utf-8'))
assert all(k in npcs for k in CANON['change']) and set(CANON['change'].values()) <= {'fixed', 'shaped', 'fluid'}
t = t.replace('/*@@CHANGE@@*/{}', json.dumps(CANON['change'], ensure_ascii=False))
assert all(x in npcs for x in MENTION_DENY)
t = t.replace('/*@@MENTION_DENY@@*/[]', json.dumps(MENTION_DENY))
open(P('src/scripts/engine.js'), 'w', encoding='utf-8').write(t.replace('/*@@NPC_ALIAS@@*/{}', json.dumps(alias, ensure_ascii=False, separators=(',', ':'))))
assert '/*@@' not in open(P('src/scripts/engine.js'), encoding='utf-8').read(), 'unreplaced placeholder in engine.js'
print('aliases:', len(alias), '| outdoor names:', len(outdoor), '| features:', len(feats))
