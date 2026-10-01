"""Dialogue colours (data/dialogue_colors.json). 1.37.0; 1.37.1 (owner: "no two alike; I must tell A from B at a glance").

Seventy-one colours cannot all be told apart at a glance, so the guarantee is per scene: a small palette of light colours that differ
by kind (red, orange, gold, lime, green, mint, cyan, blue, lavender, purple, magenta, pink), and nobody present at the same time
shares one. 1.37.2: each character has a first, second and third colour; a newcomer takes the first one nobody present has, then
any free colour (the engine, end of `stepCast`). Whoever was already in the scene keeps theirs.

This tool writes the palette (each colour for a dark theme, and for a light theme at its own lightness with the chroma cut to
what sRGB can show) and every roster character's three colours: characters who share scenes (relations, dorm and year, group,
classmates, dorm mates) get different first colours where possible, and second and third colours away from those. Existing
colours are kept unless --fresh.
Run after adding NPCs:  python tools/make_dialogue_colors.py
"""
import json, math, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
OUT = P('data', 'dialogue_colors.json')
FRESH = '--fresh' in sys.argv

# OKLCH [hue, lightness %, chroma x100] on a dark theme. 1.37.2 (owner: no dark colours): lightness 72-89, chroma cut to sRGB
PALETTE = [('red', (25, 72, 20)), ('orange', (58, 80, 16)), ('gold', (95, 88, 16)), ('lime', (128, 89, 20)), ('green', (150, 78, 18)),
           ('mint', (172, 89, 12)), ('cyan', (222, 82, 13)), ('blue', (262, 74, 15)), ('lavender', (290, 82, 10)),
           ('purple', (308, 76, 17)), ('magenta', (350, 75, 19)), ('pink', (5, 84, 9))]
GENERIC, USER = (250, 74, 1.5), (80, 94, 3)   # the shared grey of the unnamed, and {{user}}
# a light theme: each colour at its own lightness, never dark (50-60), chroma as high as sRGB allows up to 1.3x the dark one; the
# unnamed stay grey, {{user}} turns a warm brown
LIGHT_L = {'red': 52, 'orange': 58, 'gold': 54, 'lime': 52, 'green': 50, 'mint': 54, 'cyan': 52, 'blue': 50, 'lavender': 56,
           'purple': 50, 'magenta': 54, 'pink': 60, 'generic': 46, 'user': 46}

def in_gamut(h, L, C):
    a, b = C * math.cos(math.radians(h)), C * math.sin(math.radians(h))
    l, m, s = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    rgb = (4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
           -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)
    return all(-0.001 <= v <= 1.001 for v in rgb)
def light(c, name):
    h, L, C = c; L2 = LIGHT_L[name]; C = round(C * 1.3, 1) if name not in ('generic', 'user') else (C if name == 'generic' else 7)
    while C > 0 and not in_gamut(h, L2 / 100, C / 100): C = round(C - 0.5, 1)
    return [h, L2, C]
def lab(c): h, L, C = c; return (L, C * math.cos(math.radians(h)), C * math.sin(math.radians(h)))
def dist(x, y): return math.dist(lab(x), lab(y))
def fit(c):
    h, L, C = c
    while C > 0 and not in_gamut(h, L / 100, C / 100): C = round(C - 0.5, 1)
    return (h, L, C)
PALETTE = [(n, fit(c)) for n, c in PALETTE]

npcs = json.load(open(P('data', 'npcs.json'), encoding='utf-8'))
rels = json.load(open(P('data', 'relations.json'), encoding='utf-8'))
old = {} if FRESH or not os.path.exists(OUT) else json.load(open(OUT, encoding='utf-8'))
start = {k: v for k, v in old.get('npcs', {}).items() if k in npcs and isinstance(v, list) and len(v) == 3}
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

K = len(PALETTE)
D = [[dist(PALETTE[i][1], PALETTE[j][1]) for j in range(K)] for i in range(K)]
first = {k: v[0] for k, v in start.items()}
clash = lambda k, i, at: sum(w / (D[i][at[b]] + 1) for b, w in W.get(k, {}).items() if b in at)
new = sorted([k for k in ids if k not in start], key=lambda k: (-sum(W.get(k, {}).values()), k))
use = [0] * K
for v in first.values(): use[v] += 1
for k in new:   # first colour: the one that clashes least with the first colours of the people they share scenes with
    best = min(range(K), key=lambda i: (round(clash(k, i, first), 6), use[i], i))
    first[k] = best; use[best] += 1
for _ in range(8):   # swaps while they lower the total clash
    changed = False
    for i, a in enumerate(new):
        for b in new[i + 1:]:
            ia, ib = first[a], first[b]
            if ia == ib: continue
            before = clash(a, ia, first) + clash(b, ib, first)
            first[a], first[b] = ib, ia
            if clash(a, ib, first) + clash(b, ia, first) < before - 1e-9: changed = True
            else: first[a], first[b] = ia, ib
    if not changed: break
# second and third colours: used only when the earlier ones are taken in a scene, so they avoid the first colours of the people
# this character shares scenes with, and each other
for k in new:
    alt = sorted((i for i in range(K) if i != first[k]), key=lambda i: (round(clash(k, i, first), 6), -D[i][first[k]], i))
    second = alt[0]
    third = min((i for i in alt[1:]), key=lambda i: (round(clash(k, i, first), 6) - D[i][second] / 200, i))
    start[k] = [first[k], second, third]

out = {
    '_note': 'Dialogue colours (1.37.1, tools/make_dialogue_colors.py; --fresh rebuilds the starting colours). palette: colours that '
             'differ by kind, OKLCH [hue, lightness %, chroma x100] for a dark and a light theme. npcs: each roster character\'s '
             'starting colour (palette index); the engine moves anyone off a colour a present character already has ($ui.say), '
             'so nobody in one scene shares a colour. generic: unnamed or unrecorded speakers. user: {{user}}.',
    'palette': [{'name': n, 'dark': list(c), 'light': light(c, n)} for n, c in PALETTE],
    'generic': {'dark': list(GENERIC), 'light': light(GENERIC, 'generic')}, 'user': {'dark': list(USER), 'light': light(USER, 'user')},
    'dist': [[round(x, 1) for x in row] for row in D],
    'npcs': {k: start[k] for k in sorted(start)},
}
json.dump(out, open(OUT, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
same = [(a, b) for a in W for b, w in W[a].items() if a < b and w >= 1 and start[a][0] == start[b][0]]
closest = min((D[i][j], PALETTE[i][0], PALETTE[j][0]) for i in range(K) for j in range(i + 1, K))
print(f'dialogue colours: {K} colours (closest {closest[1]}/{closest[2]} {closest[0]:.1f}), {len(start)} starting colours, '
      f'{len(same)} strongly linked pairs on the same first colour (they meet on their second)')
