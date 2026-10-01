"""1.37.0: dialogue colours for the roster (data/dialogue_colors.json).

Each roster character gets a fixed OKLCH [hue, band] pair (band 0 bright, 1 deeper); the UI picks the lightness from the chat theme (light text = dark
theme). Characters who are often in the same scene (relations, same dorm and year, same group) get colours far apart; a
colourful hair colour pulls the choice toward its hue. Existing entries are kept, so an edited colour stays: only characters
without one are assigned. Run after adding NPCs:  python tools/make_dialogue_colors.py
"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
OUT = P('data', 'dialogue_colors.json')

npcs = json.load(open(P('data', 'npcs.json'), encoding='utf-8'))
rels = json.load(open(P('data', 'relations.json'), encoding='utf-8'))
old = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
col = {k: v for k, v in old.get('npcs', {}).items() if k in npcs}

HAIR = [('dark red', 20), ('burgundy', 10), ('russet', 40), ('white-red', 25), ('red', 25), ('orange', 55), ('pink', 350),
        ('purple', 305), ('turquoise', 190), ('dark blue', 265), ('blue-black', 265), ('blue', 255), ('green', 145),
        ('platinum', 95), ('blond', 90)]   # OKLCH hues
def hair_hue(v):
    h = str(v.get('hair') or '').lower()
    return next((hue for k, hue in HAIR if k in h), None)

W = {}
def link(a, b, w):
    if a != b and a in npcs and b in npcs:
        W.setdefault(a, {}); W.setdefault(b, {})
        W[a][b] = W[a].get(b, 0) + w; W[b][a] = W[b].get(a, 0) + w
for r in rels: link(r['from'], r['to'], 1)
ids = sorted(npcs)
for i, a in enumerate(ids):
    for b in ids[i + 1:]:
        A, B = npcs[a], npcs[b]
        if A.get('dorm') and A.get('dorm') == B.get('dorm') and A.get('year') == B.get('year'): link(a, b, 1)
        elif A.get('group') and A.get('group') == B.get('group'): link(a, b, 0.5)
        if A.get('dorm') and A.get('dorm') == B.get('dorm') and A.get('year') != B.get('year'): link(a, b, 0.3)   # common room
        if A.get('year') and A.get('year') == B.get('year') and A.get('dorm') != B.get('dorm'): link(a, b, 0.3)   # classes

import math
BAND = {0: (80, 14), 1: (68, 11)}   # band -> OKLCH lightness x100 and chroma x100 on a dark theme (the UI shifts both for light themes)
def lab(x):
    L, C = BAND[x[1]]
    return (L, C * math.cos(math.radians(x[0])), C * math.sin(math.radians(x[0])))
def dist(x, y):   # OKLab distance x100: the eye's distance, so the greens do not crowd and a band apart counts
    return math.dist(lab(x), lab(y))

combos = [(h, b) for b in (0, 1) for h in range(0, 360, 10)]
combos += [(h + 5, b) for b in (0, 1) for h in range(0, 360, 10)]   # only once the first 72 are taken
used = {tuple(v) for v in col.values()}
for a in sorted([k for k in ids if k not in col], key=lambda k: (-sum(W.get(k, {}).values()), k)):
    free = [c for c in combos[:72] if c not in used] or [c for c in combos if c not in used] or combos
    hh = hair_hue(npcs[a])
    def cost(c):   # repulsion: every placed character pushes a little, linked ones push hard; colourful hair pulls
        push = sum((0.15 + W.get(a, {}).get(b, 0)) / (dist(c, tuple(col[b])) + 1) for b in col)
        pull = 0 if hh is None else min(abs(c[0] - hh) % 360, 360 - abs(c[0] - hh) % 360) / 180 * 1.5
        return (round(push + pull, 6), c[0], c[1])
    best = min(free, key=cost)
    col[a] = list(best); used.add(best)

out = {
    '_note': 'Dialogue colours (1.37.0, tools/make_dialogue_colors.py keeps existing entries). npcs: id -> [OKLCH hue 0-359, band 0 bright / 1 deeper]; '
             'OKLCH; the UI sets lightness from the chat theme. generic: unnamed or unrecorded speakers. user: {{user}}. Extras get a hue '
             'from the engine ($say) when their record is written.',
    'generic': old.get('generic', [250, 'g']),
    'user': old.get('user', [80, 'u']),
    'npcs': dict(sorted(col.items())),
}
json.dump(out, open(OUT, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
same = [(a, b) for a in W for b in W[a] if a < b and dist(tuple(col[a]), tuple(col[b])) < 3]
print(f'dialogue colours: {len(col)} characters, {len(same)} linked pairs closer than 3')
