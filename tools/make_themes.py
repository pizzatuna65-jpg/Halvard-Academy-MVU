#!/usr/bin/env python3
"""1.3.1 (owner playtest) — writes data/themes.json: colour themes for the panels and the bracelet, palette only.
Each theme gives a colour per role; a role is the set of colours of the default Pewter palette that play it. Edit here, re-run,
then run tools/gen_ui.py. ("r,g,b"; "a:r,g,b" = only where the colour is written as rgba(), e.g. faint white lines;
a value "r,g,b*k" also scales that rgba()'s alpha by k: light themes soften the dark overlays.)"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROLES = {
    'backdrop': ['10,12,14'], 'bg0': ['29,33,38'], 'bg1': ['38,42,48'], 'bg2': ['43,47,53'], 'hdA': ['61,65,72'], 'hdB': ['48,52,58'],
    'btn': ['48,52,59'], 'btnH': ['58,62,70'], 'tog': ['35,39,44'], 'card': ['45,49,55'], 'item': ['42,46,52'],
    'gA': ['38,43,49'], 'gB': ['27,30,34'], 'fbA': ['35,40,46'], 'fbB': ['32,36,42'], 'plab': ['20,22,26'], 'crop': ['15,17,20'],
    'glassA': ['33,57,59'], 'glass': ['24,41,43'], 'glassLine': ['14,23,24'], 'band': ['70,74,82'], 'pewter': ['59,63,70'], 'pewterLo': ['42,45,51'],
    'line0': ['61,66,74'], 'line': ['71,76,85'], 'line2': ['83,88,98'], 'line3': ['111,115,123'], 'lineBrass': ['111,90,61'], 'brassLo': ['124,98,64'],
    'brass': ['179,144,98'], 'ink': ['230,227,220'], 'inkIn': ['238,233,223'], 'head': ['240,226,196'], 'head2': ['246,234,208'], 'h3': ['232,211,168'],
    'dim': ['169,166,159'], 'faint': ['142,138,130'], 'txt1': ['201,197,188'], 'txt2': ['220,215,204'], 'txt3': ['207,203,194'], 'txtPre': ['207,214,212'],
    'white': ['255,255,255'], 'whiteA': ['a:255,255,255'], 'shade': ['a:0,0,0'], 'glow': ['185,234,223'], 'nowTxt': ['207,233,227'], 'clockD': ['143,191,181'],
    'glowShadow': ['120,220,200'], 'warnTxt': ['241,207,149'], 'dangerTxt': ['244,176,169'], 'hidTxt': ['211,194,239'], 'romTxt': ['242,182,203'],
    'pastTxt': ['232,198,141'], 'typeTxt': ['217,211,199'],
}
LIGHT_TEXT = {'shade': '70,52,30*0.45','warnTxt': '150,94,18', 'dangerTxt': '168,48,38', 'hidTxt': '98,68,150', 'romTxt': '160,48,90', 'pastTxt': '138,94,28', 'whiteA': '0,0,0',
              'glowShadow': '255,255,255'}
THEMES = {
    'midnight': ('Midnight (darker)', {
        'backdrop': '0,0,0', 'bg0': '11,12,14', 'bg1': '19,20,23', 'bg2': '22,23,27', 'hdA': '32,34,38', 'hdB': '24,26,30', 'btn': '30,32,36',
        'btnH': '40,42,47', 'tog': '22,24,27', 'card': '26,28,32', 'item': '24,26,29', 'gA': '22,24,28', 'gB': '9,10,12', 'fbA': '20,22,25',
        'fbB': '17,19,22', 'plab': '10,11,13', 'crop': '8,9,11', 'glassA': '16,34,36', 'glass': '9,20,22', 'glassLine': '4,9,10', 'band': '40,42,46',
        'pewter': '30,32,36', 'pewterLo': '18,19,22', 'line0': '40,43,48', 'line': '48,51,57', 'line2': '58,61,68', 'line3': '82,86,92'}),
    'rosewood': ('Rosewood (warm dark)', {
        'backdrop': '14,8,9', 'bg0': '30,20,22', 'bg1': '44,30,32', 'bg2': '50,34,36', 'hdA': '72,47,49', 'hdB': '57,38,40', 'btn': '58,38,40',
        'btnH': '74,49,51', 'tog': '40,27,29', 'card': '53,36,38', 'item': '49,33,35', 'gA': '46,31,33', 'gB': '27,18,20', 'fbA': '40,27,29',
        'fbB': '36,24,26', 'plab': '26,17,19', 'crop': '20,12,14', 'glassA': '60,35,39', 'glass': '40,24,28', 'glassLine': '20,10,12',
        'band': '84,55,57', 'pewter': '68,44,46', 'pewterLo': '46,30,32', 'line0': '82,58,60', 'line': '98,70,72', 'line2': '112,82,84',
        'line3': '142,108,108', 'lineBrass': '132,88,62', 'brassLo': '132,88,62', 'brass': '200,142,98', 'glow': '242,192,172',
        'nowTxt': '246,216,202', 'clockD': '214,160,142', 'glowShadow': '240,160,130'}),
    'parchment': ('Parchment (light)', dict(LIGHT_TEXT, **{
        'backdrop': '40,33,22', 'bg0': '255,252,245', 'bg1': '246,240,228', 'bg2': '238,230,214', 'hdA': '236,226,206', 'hdB': '227,215,191',
        'btn': '240,232,216', 'btnH': '229,218,197', 'tog': '244,237,224', 'card': '251,247,238', 'item': '251,247,238', 'gA': '245,239,227',
        'gB': '229,220,202', 'fbA': '232,224,208', 'fbB': '224,215,198', 'plab': '251,247,238', 'crop': '251,247,238', 'glassA': '238,247,243',
        'glass': '223,238,232', 'glassLine': '168,198,188', 'band': '250,244,232', 'pewter': '240,232,216', 'pewterLo': '226,214,190',
        'line0': '214,202,180', 'line': '200,187,163', 'line2': '188,174,148', 'line3': '158,148,130', 'lineBrass': '176,146,104',
        'brassLo': '176,146,104', 'brass': '150,110,56', 'ink': '43,38,32', 'inkIn': '40,34,26', 'head': '74,50,20', 'head2': '74,50,20',
        'h3': '122,84,36', 'dim': '108,98,84', 'faint': '132,122,108', 'txt1': '80,72,60', 'txt2': '60,54,44', 'txt3': '70,64,54',
        'txtPre': '50,58,56', 'white': '30,26,20', 'glow': '28,118,102', 'nowTxt': '30,72,62', 'clockD': '52,112,100', 'typeTxt': '60,54,44'})),
    'frost': ('Frost (light, cool)', dict(LIGHT_TEXT, **{
        'backdrop': '18,26,38', 'bg0': '255,255,255', 'bg1': '240,243,247', 'bg2': '232,237,243', 'hdA': '226,232,240', 'hdB': '213,221,231',
        'btn': '228,234,241', 'btnH': '213,221,231', 'tog': '236,240,245', 'card': '248,250,252', 'item': '248,250,252', 'gA': '238,242,247',
        'gB': '219,226,235', 'fbA': '228,233,240', 'fbB': '218,224,232', 'plab': '248,250,252', 'crop': '248,250,252', 'glassA': '236,247,248',
        'glass': '220,237,240', 'glassLine': '158,194,200', 'band': '246,248,251', 'pewter': '232,237,243', 'pewterLo': '214,222,232',
        'line0': '208,215,225', 'line': '191,200,212', 'line2': '176,186,200', 'line3': '140,150,164', 'lineBrass': '150,168,196',
        'brassLo': '150,168,196', 'brass': '58,98,168', 'ink': '30,36,46', 'inkIn': '26,32,42', 'head': '22,42,74', 'head2': '22,42,74',
        'h3': '40,70,120', 'dim': '88,98,112', 'faint': '118,128,142', 'txt1': '64,72,86', 'txt2': '50,58,70', 'txt3': '60,68,80',
        'txtPre': '40,50,60', 'white': '20,26,36', 'glow': '24,112,122', 'nowTxt': '20,70,76', 'clockD': '40,108,116', 'typeTxt': '50,58,70'})),
}
out = {'_note': 'Generated by tools/make_themes.py (edit there). 1.3.1 (owner playtest): colour themes for the panels and the bracelet, palette '
                'only; tools/gen_ui.py injects them into ui.js and statusbar.html. Each map sends a colour of the default Pewter palette '
                '("r,g,b"; "a:r,g,b" = only its rgba() forms) to the theme\'s own. Colours not listed (dorm colours, bars, paper notes) stay. '
                'The choice is kept per browser (localStorage "eld.theme").',
       'default': 'pewter', 'order': ['pewter', 'midnight', 'rosewood', 'parchment', 'frost'], 'themes': {'pewter': {'name': 'Pewter (default)', 'map': {}}}}
for key, (name, roles) in THEMES.items():
    assert set(roles) <= set(ROLES), set(roles) - set(ROLES)
    out['themes'][key] = {'name': name, 'map': {src: rgb for role, rgb in roles.items() for src in ROLES[role]}}
assert out['order'] == ['pewter', *THEMES]
with open(os.path.join(ROOT, 'data/themes.json'), 'w', encoding='utf-8', newline='\n') as f: json.dump(out, f, ensure_ascii=False, indent=1)
print('themes:', {k: len(v['map']) for k, v in out['themes'].items()})
