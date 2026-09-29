#!/usr/bin/env python3
"""1.3.1 (owner playtest) — writes data/themes.json: colour themes for the panels and the bracelet, palette only.
1.21.0 (UI overhaul "Brass & Moonglass", owner-approved): the colours are tokens. ROLES gives each token's value in the default
Pewter palette, exactly as it is written in the token blocks of src/scripts/ui.template.js (CSS, `.ov{…}`) and
src/ui/statusbar.template.html (`:root{…}`); each theme gives the token its own value. tools/gen_ui.py injects the result; the UI
re-colours every occurrence of a default value (recolor()). Edit here, re-run, then run tools/gen_ui.py.
("r,g,b"; "a:r,g,b" = only where the colour is written as rgba(), e.g. faint white lines; a value "r,g,b*k" also scales that
rgba()'s alpha by k: light themes soften the dark overlays.) Paper notes, vital bars, dorm colours and the map are not themed."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROLES = {   # token -> default (Pewter) value; every value must be unique
    'backdrop': '8,10,16', 'night': '20,25,37', 'well': '16,20,29', 'sheet': '28,34,48', 'band': '33,40,56', 'card': '36,43,59',
    'card2': '42,50,68', 'btn': '44,52,70', 'btnh': '53,63,85', 'rule': '53,62,82', 'rule2': '74,84,108',
    'pewter-hi': '102,110,128', 'pewter': '70,77,93', 'pewter-lo': '42,47,59',
    'brass': '201,163,100', 'brass-hi': '236,212,159', 'brass-lo': '125,95,52', 'on-brass': '28,24,16',
    'moon': '163,230,219', 'moon-dim': '134,194,184', 'glass-hi': '31,74,79', 'glass': '14,33,36', 'glass-lo': '10,23,26', 'glass-ink': '215,239,233',
    'ink': '236,231,219', 'ink2': '195,190,178', 'ink3': '170,166,155', 'head': '243,232,207', 'white': '255,255,255',
    'good': '143,208,180', 'warn': '240,189,120', 'danger': '241,154,145', 'hid': '211,194,239', 'rom': '242,182,203', 'past': '232,198,141',
    'warn-line': '224,162,74', 'danger-line': '224,100,90',
    'shade': 'a:0,0,0', 'whiteA': 'a:255,255,255',
}
LIGHT_TEXT = {'shade': '70,52,30*0.45', 'whiteA': '0,0,0', 'good': '36,120,84', 'warn': '143,92,12', 'danger': '168,58,47', 'hid': '98,68,150',
              'rom': '160,48,90', 'past': '138,94,28', 'warn-line': '190,130,40', 'danger-line': '192,70,58'}
THEMES = {
    'midnight': ('Midnight (darker)', {
        'backdrop': '0,0,0', 'night': '7,9,14', 'well': '5,7,11', 'sheet': '13,16,23', 'band': '17,20,28', 'card': '20,24,33', 'card2': '25,29,40',
        'btn': '26,30,41', 'btnh': '36,41,55', 'rule': '38,43,56', 'rule2': '58,64,82', 'pewter-hi': '72,78,92', 'pewter': '44,49,60',
        'pewter-lo': '22,25,32', 'brass': '190,152,90', 'brass-hi': '228,202,148', 'brass-lo': '104,78,42', 'glass-hi': '18,50,55',
        'glass': '6,22,25', 'glass-lo': '3,13,15'}),
    'rosewood': ('Rosewood (warm dark)', {
        'backdrop': '14,8,9', 'night': '26,16,19', 'well': '20,12,14', 'sheet': '36,24,27', 'band': '42,28,32', 'card': '48,32,36',
        'card2': '56,38,42', 'btn': '58,39,43', 'btnh': '72,49,54', 'rule': '80,56,60', 'rule2': '108,80,84', 'pewter-hi': '128,96,98',
        'pewter': '88,62,65', 'pewter-lo': '50,34,37', 'brass': '212,154,106', 'brass-hi': '242,208,168', 'brass-lo': '132,88,62',
        'moon': '242,192,172', 'moon-dim': '214,160,142', 'glass-hi': '78,40,46', 'glass': '44,22,27', 'glass-lo': '30,14,18',
        'glass-ink': '246,216,202', 'head': '246,226,204', 'ink2': '205,190,184', 'ink3': '182,164,158'}),
    'parchment': ('Parchment (light)', dict(LIGHT_TEXT, **{
        'backdrop': '40,33,22', 'night': '233,225,208', 'well': '246,241,231', 'sheet': '251,248,241', 'band': '244,237,224', 'card': '243,237,225',
        'card2': '236,228,212', 'btn': '240,232,216', 'btnh': '229,218,197', 'rule': '215,203,178', 'rule2': '186,172,146',
        'pewter-hi': '253,250,243', 'pewter': '240,232,215', 'pewter-lo': '225,213,188', 'brass': '143,106,51', 'brass-hi': '109,79,34',
        'brass-lo': '184,154,106', 'on-brass': '255,250,240', 'moon': '23,104,94', 'moon-dim': '52,108,100', 'glass-hi': '246,251,249',
        'glass': '227,239,235', 'glass-lo': '211,229,224', 'glass-ink': '31,59,55', 'ink': '43,38,32', 'ink2': '87,79,67', 'ink3': '100,92,79',
        'head': '74,50,20', 'white': '30,26,20'})),
    'frost': ('Frost (light, cool)', dict(LIGHT_TEXT, **{
        'backdrop': '18,26,38', 'night': '226,232,240', 'well': '244,247,250', 'sheet': '252,253,254', 'band': '240,243,247', 'card': '243,246,250',
        'card2': '232,237,243', 'btn': '234,239,245', 'btnh': '218,225,234', 'rule': '208,215,225', 'rule2': '176,186,200',
        'pewter-hi': '255,255,255', 'pewter': '232,237,243', 'pewter-lo': '212,220,231', 'brass': '46,88,160', 'brass-hi': '26,58,116',
        'brass-lo': '150,168,196', 'on-brass': '255,255,255', 'moon': '18,100,110', 'moon-dim': '44,106,114', 'glass-hi': '245,251,252',
        'glass': '222,238,242', 'glass-lo': '205,227,233', 'glass-ink': '20,60,68', 'ink': '30,36,46', 'ink2': '64,72,86', 'ink3': '82,92,106',
        'head': '22,42,74', 'white': '20,26,36'})),
}

# text tokens that must stay readable (WCAG AA, 4.5:1) on the surfaces they sit on, in every theme
def _lum(v):
    c = [int(x) / 255 for x in v.split('*')[0].split(',')]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
def _ratio(a, b):
    x, y = sorted([_lum(a), _lum(b)]); return (y + 0.05) / (x + 0.05)
TEXT = ['ink', 'ink2', 'ink3', 'head', 'brass-hi', 'moon', 'good', 'warn', 'danger', 'hid', 'rom', 'past']
SURF = ['sheet', 'card', 'well']
GLASS = [('moon', 'glass'), ('moon-dim', 'glass'), ('glass-ink', 'glass'), ('on-brass', 'brass')]

out = {'_note': 'Generated by tools/make_themes.py (edit there). 1.3.1 (owner playtest): colour themes for the panels and the bracelet, palette '
                'only; 1.21.0: the colours are tokens (ROLES there). tools/gen_ui.py injects them into ui.js and statusbar.html. Each map sends a '
                'colour of the default Pewter palette ("r,g,b"; "a:r,g,b" = only its rgba() forms) to the theme\'s own. Colours not listed (dorm '
                'colours, bars, paper notes, the map) stay. The choice is kept per browser (localStorage "eld.theme").',
       'default': 'pewter', 'order': ['pewter', *THEMES], 'themes': {'pewter': {'name': 'Pewter (default)', 'map': {}}}}
vals = list(ROLES.values())
assert len(vals) == len(set(vals)), 'every default token value must be unique'
for key, (name, roles) in [('pewter', ('Pewter (default)', {})), *THEMES.items()]:
    assert set(roles) <= set(ROLES), set(roles) - set(ROLES)
    full = {r: roles.get(r, ROLES[r]) for r in ROLES if not ROLES[r].startswith('a:')}
    bad = [f'{t} on {s} {_ratio(full[t], full[s]):.2f}' for t in TEXT for s in SURF if _ratio(full[t], full[s]) < 4.5]
    bad += [f'{t} on {s} {_ratio(full[t], full[s]):.2f}' for t, s in GLASS if _ratio(full[t], full[s]) < 4.5]
    assert not bad, f'{key}: contrast below 4.5:1: {bad}'
    if key != 'pewter':
        out['themes'][key] = {'name': name, 'map': {ROLES[role]: rgb for role, rgb in roles.items()}}
with open(os.path.join(ROOT, 'data/themes.json'), 'w', encoding='utf-8', newline='\n') as f: json.dump(out, f, ensure_ascii=False, indent=1)
print('themes:', {k: len(v['map']) for k, v in out['themes'].items()})
