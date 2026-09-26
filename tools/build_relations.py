#!/usr/bin/env python3
"""Batch 4.3 — data/relations.json from data/npcs.json (replaces the 1.4 heuristic inside curate_data.py).
Fixes vs 1.4: names win over other keys (Florian's key 'Elion' no longer steals Elion), multi-word titles are matched
('Vice Headmaster', 'Acting Warden', 'Sky Dorm Head'), longest non-overlapping match wins ('Vice Headmaster' is not also
'Headmaster'), spirit/item/brand/shared-surname keys are ignored (same deny-list as the engine).
Edge = how FROM sees TO, told by VIA's file (1.6.10: VIA is often TO). Visibility: 'public' | 'rank:N' (bond with VIA >= N) | 'rank:99'
(story-only field: needs Secrets_revealed '<Via>.relationship')."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
npcs = json.load(open(P('data/npcs.json'), encoding='utf-8'))

GROUPISH = re.compile(r'club|library|council|committee|society|circle|troupe|newspaper|house|team|academy|order|choir|squad', re.I)
DENY = {'shub-niggurath', 'shub niggurath', 'lord of harvest', 'hastur', 'king in yellow', 'loki', 'hades', 'excalibur', 'gohn',
        'janna', 'laetano', 'velmora', 'niu', 'nocturne', 'deathaxe', 'ardenne', 'villeneuve', 'blood saint'}
alias = {}
for nid, n in npcs.items():                       # pass 1: identities (first name, full name, nickname)
    for a in [nid, n['name'], n.get('nickname')]:
        if a: alias[a] = nid
for nid, n in npcs.items():                       # pass 2: other keys, never overriding pass 1
    for k in n['keys']:
        if not k or not k[0].isupper() or len(k) < 3 or len(k.split()) > 4: continue
        if k.lower() in DENY or GROUPISH.search(k): continue
        alias.setdefault(k, nid)
PAT = sorted(alias, key=len, reverse=True)
RX = re.compile(r'\b(' + '|'.join(re.escape(a) for a in PAT) + r')\b')

def mentions(sent):
    """longest-first, non-overlapping (the alternation is ordered longest-first, and finditer never overlaps)."""
    return {alias[m.group(1)] for m in RX.finditer(sent)}

TYPE_RULES = [('family', r'\b(sister|brother|son|daughter|father|mother|cousin|sibling|twin|family|niece|nephew|aunt|uncle)\b'),
              ('romance', r'\b(in love|crush|lover|girlfriend|boyfriend|engaged|kiss|dating|sweetheart)\b'),
              ('rival', r'\b(rival|nemesis|compet\w*|grudge)\b'),
              ('fear', r'\b(fears?|afraid|terrif\w*|dreads?|wide berth)\b'),
              ('dislike', r'\b(hates?|loathes?|despises?|dislikes?|resents?|grates|looks down|contempt|annoy\w*|disgusted|distrusts?)\b'),
              ('mentor', r'\b(mentor\w*|apprentice|teaches|taught|student of|advises|pupil|tutor\w*)\b'),
              ('respect', r'\b(respects?|admires?|trusts?|looks up|listen to)\b'),
              ('friend', r'\b(friends?|best friend|companion|partner|teammates?|roommates?|covers for)\b')]
ORDER = [t for t, _ in TYPE_RULES] + ['knows']
PUBLIC_T = {'family', 'mentor'}
edges = {}
for nid, n in npcs.items():
    for f in n['fields']:
        for sent in re.split(r'(?<=[.!?])\s+', f['text']):
            for t in mentions(sent) - {nid}:
                typ = next((ty for ty, rx in TYPE_RULES if re.search(rx, sent, re.I)), 'knows')
                vis = 'rank:99' if f['rank'] >= 99 else ('public' if typ in PUBLIC_T else f'rank:{max(f["rank"], 5)}')
                e = edges.setdefault((nid, t), {'from': nid, 'to': t, 'types': [], 'notes': [], 'visibility': vis, 'frank': f['rank']})
                e['frank'] = min(e['frank'], f['rank'])
                if typ not in e['types']: e['types'].append(typ)
                if sent not in e['notes'] and len(e['notes']) < 3: e['notes'].append(sent)
                rank = lambda v: 0 if v == 'public' else int(v.split(':')[1])
                if rank(vis) < rank(e['visibility']): e['visibility'] = vis      # the most public mention wins
for e in edges.values():
    e['types'].sort(key=ORDER.index); e['type'] = e['types'][0]
# 1.4.1 (owner): the keyword guess above is only a starting point; the type of every line is curated by hand in
# data/relations_curated.json ('drop' = no line). A line the lore gains later must be curated before the build passes.
# 1.6.10 (owner): the direction is curated too. A sentence in A's file about B often says how B sees A ("Her Dorm Head, Kuroo,
# has started pushing it"), so the value is one line or a list: 'type' = A -> B, '<type' = B -> A; '/12' keeps only those
# sentences (0-based) as the line's notes, when the first one is the other person's side. The line keeps 'via' = A, the
# person whose file (and bond) tells you about it.
CUR = json.load(open(P('data/relations_curated.json'), encoding='utf-8'))
new = [f"{a}>{b}" for (a, b) in edges if f"{a}>{b}" not in CUR['edges']]
assert not new, f'relations_curated.json: lines without a curated type (add them): {new}'
src, edges = edges, {}
for key, e in src.items():
    k = f"{key[0]}>{key[1]}"
    vals = CUR['edges'][k]
    for v in ([vals] if isinstance(vals, str) else vals):
        if v == 'drop': continue
        m = re.fullmatch(r'(<?)(\w+)(?:/(\d+))?', v); assert m and m.group(2) in CUR['types'], (k, v)
        back, typ, pick = bool(m.group(1)), m.group(2), m.group(3)
        assert not pick or max(map(int, pick)) < len(e['notes']), (k, v, e['notes'])
        a, b = (key[1], key[0]) if back else key
        vis = 'rank:99' if e['frank'] >= 99 else ('public' if k in CUR['public'] else f"rank:{max(e['frank'], 5)}")
        edges[(a, b, key[0])] = {'from': a, 'to': b, 'types': [typ], 'type': typ, 'notes': [e['notes'][int(i)] for i in pick] if pick else e['notes'], 'visibility': vis, 'via': key[0]}
# 1.4.2 (owner): someone everyone at Halvard dislikes (one way): every Halvard person gets a dislike line to them (the lore note
# when there is one, else the curated note, opening at Rank 5), and none of their own lines is a dislike
for tgt, D in CUR.get('disliked_by_all', {}).items():
    if tgt.startswith('_'): continue
    for nid, n in npcs.items():
        if nid == tgt or n.get('group', '').endswith('team') or nid in D.get('except', []): continue   # 'except' keeps their curated line
        mine = [e for k, e in edges.items() if k[:2] == (nid, tgt)] or [edges.setdefault((nid, tgt, nid), {'from': nid, 'to': tgt, 'notes': [D['note']], 'visibility': 'rank:5', 'via': nid})]
        for e in mine: e['types'] = ['dislike']; e['type'] = 'dislike'
    assert not [k for k, e in edges.items() if k[0] == tgt and e['type'] == 'dislike'], f'{tgt} dislikes no one (relations_curated.json)'
# 1.4.2 (owner): group views (Caine hates mages; everyone's view of the Doves) become one-way lines to every member, opening at
# the rank of the field that states them; a line already curated between the two people wins. 'rule' marks them for the UI.
FAC = {f['id']: f for f in json.load(open(P('data/factions.json'), encoding='utf-8'))['factions']}
def members(to):
    if to == 'mages': return [nid for nid, n in npcs.items() if any(f['label'] == 'Magic' for f in n['fields'])]
    f = FAC[to.split(':', 1)[1]]
    return f.get('members') or [nid for nid, n in npcs.items() if n.get('group') in f.get('auto', [])]
for R in CUR.get('group_rules', {}).get('rules', []):
    for nid in (npcs if R['from'] == '*' else [R['from']]):
        f = next((f for f in npcs[nid]['fields'] if f['label'] == R['field']), None)
        typ = f and next((t for rx, t in R['match'].items() if re.search(rx, f['text'])), None)
        if not typ: continue
        assert typ in CUR['types'], (R['id'], typ)
        for tgt in members(R['to']):
            if tgt == nid or any(k[:2] == (nid, tgt) for k in edges): continue
            edges[(nid, tgt, nid)] = {'from': nid, 'to': tgt, 'types': [typ], 'type': typ, 'notes': [f"{R['field']}: {f['text']}"],
                                 'visibility': 'rank:99' if f['rank'] >= 99 else f"rank:{f['rank']}", 'rule': R['id'], 'rule_label': R['label'], 'via': nid}
out = sorted(edges.values(), key=lambda e: (e['from'], e['to'], e['via'] != e['from'], e['via']))   # the feeler's own file first
json.dump(out, open(P('data/relations.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
print('edges', len(out), Counter(e['type'] for e in out).most_common(), Counter(e['visibility'] for e in out).most_common())
