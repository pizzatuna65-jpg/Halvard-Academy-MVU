#!/usr/bin/env python3
"""Batch 4.3 — data/relations.json from data/npcs.json (replaces the 1.4 heuristic inside curate_data.py).
Fixes vs 1.4: names win over other keys (Florian's key 'Elion' no longer steals Elion), multi-word titles are matched
('Vice Headmaster', 'Acting Warden', 'Sky Dorm Head'), longest non-overlapping match wins ('Vice Headmaster' is not also
'Headmaster'), spirit/item/brand/shared-surname keys are ignored (same deny-list as the engine).
Edge = what the FROM character's file says involving TO. Visibility: 'public' | 'rank:N' (bond with FROM >= N) | 'rank:99'
(story-only field: needs Secrets_revealed '<From>.relationship')."""
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
                e = edges.setdefault((nid, t), {'from': nid, 'to': t, 'types': [], 'notes': [], 'visibility': vis})
                if typ not in e['types']: e['types'].append(typ)
                if sent not in e['notes'] and len(e['notes']) < 3: e['notes'].append(sent)
                rank = lambda v: 0 if v == 'public' else int(v.split(':')[1])
                if rank(vis) < rank(e['visibility']): e['visibility'] = vis      # the most public mention wins
for e in edges.values():
    e['types'].sort(key=ORDER.index); e['type'] = e['types'][0]
out = sorted(edges.values(), key=lambda e: (e['from'], e['to']))
json.dump(out, open(P('data/relations.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
print('edges', len(out), Counter(e['type'] for e in out).most_common(), Counter(e['visibility'] for e in out).most_common())
