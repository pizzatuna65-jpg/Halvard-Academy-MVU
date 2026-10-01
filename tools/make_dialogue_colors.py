"""Dialogue colours (data/dialogue_colors.json). 1.37.0; 1.37.1 (owner: "no two alike; I must tell A from B at a glance").

Seventy-one colours cannot all be told apart at a glance, so the guarantee is per scene: a small palette of colours that differ
by kind (red, orange, gold, lime, green, mint, cyan, blue, lavender, purple, magenta, pink), and nobody present at the same time
shares one (the engine, `stepCast`, moves a newcomer off a colour someone present already has, and the move sticks).

This tool writes the palette (each colour for a dark theme, and for a light theme at its own lightness with the chroma cut to
what sRGB can show) and every roster character's starting colour: characters who share scenes (relations, dorm and year, group,
classmates, dorm mates) start on different colours where possible. Existing starting colours are kept unless --fresh.
Run after adding NPCs:  python tools/make_dialogue_colors.py
"""
import json, math, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
OUT = P('data', 'dialogue_colors.json')
FRESH = '--fresh' in sys.argv

# OKLCH [hue, lightness %, chroma x100] on a dark theme
PALETTE = [('red', (25, 66, 20)), ('orange', (55, 76, 16)), ('gold', (95, 87, 15)), ('lime', (128, 86, 19)), ('green', (148, 68, 18)),
           ('mint', (178, 86, 11)), ('cyan', (215, 76, 13)), ('blue', (258, 66, 16)), ('lavender', (292, 80, 10)),
           ('purple', (315, 66, 20)), ('magenta', (345, 68, 22)), ('pink', (10, 85, 8))]
GENERIC, USER = (250, 74, 1.5), (80, 94, 3)   # the shared grey of the unnamed, and {{user}}
# a light theme: each colour at its own lightness (dark enough to read on a pale page, apart from its neighbours), chroma as
# high as sRGB allows up to 1.3x the dark one; the unnamed stay grey, {{user}} turns a warm brown
LIGHT_L = {'red': 50, 'orange': 58, 'gold': 52, 'lime': 50, 'green': 42, 'mint': 54, 'cyan': 50, 'blue': 44, 'lavender': 54,
           'purple': 42, 'magenta': 52, 'pink': 62, 'generic': 46, 'user': 42}

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
for name, c in PALETTE: assert in_gamut(c[0], c[1] / 100, c[2] / 100), name

npcs = json.load(open(P('data', 'npcs.json'), encoding='utf-8'))
rels = json.load(open(P('data', 'relations.json'), encoding='utf-8'))
old = {} if FRESH or not os.path.exists(OUT) else json.load(open(OUT, encoding='utf-8'))
start = {k: v for k, v in old.get('npcs', {}).items() if k in npcs and isinstance(v, int) and 0 <= v < len(PALETTE)}

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
clash = lambda k, i: sum(w / (D[i][start[b]] + 1) for b, w in W.get(k, {}).items() if b in start)
new = sorted([k for k in ids if k not in start], key=lambda k: (-sum(W.get(k, {}).values()), k))
use = [0] * K
for v in start.values(): use[v] += 1
for k in new:   # the colour that clashes least with the people they share scenes with; even use breaks ties
    best = min(range(K), key=lambda i: (round(clash(k, i), 6), use[i], i))
    start[k] = best; use[best] += 1
for _ in range(8):   # swaps while they lower the total clash
    changed = False
    for i, a in enumerate(new):
        for b in new[i + 1:]:
            ia, ib = start[a], start[b]
            if ia == ib: continue
            before = clash(a, ia) + clash(b, ib)
            start[a], start[b] = ib, ia
            if clash(a, ib) + clash(b, ia) < before - 1e-9: changed = True
            else: start[a], start[b] = ia, ib
    if not changed: break

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
same = [(a, b) for a in W for b, w in W[a].items() if a < b and w >= 1 and start[a] == start[b]]
closest = min((D[i][j], PALETTE[i][0], PALETTE[j][0]) for i in range(K) for j in range(i + 1, K))
print(f'dialogue colours: {K} colours (closest {closest[1]}/{closest[2]} {closest[0]:.1f}), {len(start)} starting colours, '
      f'{len(same)} strongly linked pairs on the same start (the engine separates them when they meet)')
