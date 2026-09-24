#!/usr/bin/env python3
"""Batch 3.2 — generates src/scripts/ui.js from ui.template.js.
Injects: magic subtypes parsed from lore entries 33-36 (standard / notable / forbidden) and the NPC list (for "who knows")."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

def parse_subtypes(uid):
    t = open(P('src/worldbook/content', f'{uid}.txt'), encoding='utf-8').read()
    std = re.search(r'^Standard:\s*(.+)$', t, re.M).group(1).rstrip('.')
    standard = [x.strip() for x in std.split(',') if x.strip()]
    notes = re.search(r'^Notes:\s*(.+?)(?=^\S+†:|\Z)', t, re.M | re.S)
    notable = []
    if notes:
        body = notes.group(1)
        for m in re.finditer(r"(?:^|[.:]\s+)([A-Z][A-Za-z' ]{1,30}?) — ([^.]+)", body):
            notable.append({'name': m.group(1).strip(), 'desc': m.group(2).strip()})
    forbidden = [{'name': m.group(1).strip(), 'desc': m.group(2).strip()} for m in re.finditer(r'^([A-Z][A-Za-z ]+?)†:\s*([^.]+)', t, re.M)]
    forbidden += [{'name': m.group(1).strip(), 'desc': m.group(2).strip()} for m in re.finditer(r'(?<=\. )([A-Z][A-Za-z ]+?)†:\s*([^.]+)', t)]
    seen, fb = set(), []
    for f in forbidden:
        if f['name'] not in seen: seen.add(f['name']); fb.append(f)
    return {'standard': standard, 'notable': notable, 'forbidden': fb}

SUB = {'Elemental': parse_subtypes(33), 'Mystic': parse_subtypes(34), 'Spiritual': parse_subtypes(35), 'Occult': parse_subtypes(36)}
npcs = json.load(open(P('data/npcs.json'), encoding='utf-8'))
NPCS = sorted([{'id': k, 'name': v['name'], 'dorm': v.get('dorm') or '', 'year': v.get('year') or 0, 'group': v.get('group') or '', 'a': v.get('arrives', 1)}
               for k, v in npcs.items()], key=lambda x: x['name'])
# ---- Batch 4: people / map data ----
# Rank-0 public role (D14 table: appearance, dorm/year, public role). Curated: roster tags mix roles with traits and secrets.
PUBLIC_ROLE = {
    'Irene': 'Student Council President', 'Caspian': 'Student Council Vice President', 'Royhan': 'Third-year alchemist',
    'Gavlan': 'Combat teacher', 'Yvette': 'Magic Theory teacher, Fire Dorm Head', 'Krieg': 'Dovecote Commander',
    'Milena': 'Senior Dove, Dark Magic Defense teacher', 'Baelin': 'Headmaster', 'Layla': 'History teacher',
    'Vallie': 'Creature Studies teacher', 'Gareth': "Halvard's top-ranked student (#1)", 'Sophia': "Halvard's #2 student, the Blood Saint",
    'Florian': "Halvard's #3 student", 'Rei': 'Acting Warden', 'Kuroo': 'Etiquette teacher, Viridian Dorm Head',
    'Mimosa': 'Potion Crafting teacher', 'Althair': 'Vice Headmaster', 'Tristan': 'Cathedral Steward',
    'Ezrel': 'Magic Theory teacher, Light Dorm Head', 'Ottavio': 'Etiquette teacher, Sky Dorm Head',
    'Caine': "Butler of the Noble Houses' Liaison", 'Bobby': 'Maintenance worker',
    'Ines': 'Myrdath team captain', 'Cassius': 'Veyra team captain',
}
YEARW = {1: 'first-year', 2: 'second-year', 3: 'third-year'}
def descriptor(nid, n):
    hair = (n.get('hair') or '').replace(' hair', '').strip()
    hw = (hair[:1].upper() + hair[1:] + '-haired ') if hair and hair != 'bald' else ('Bald ' if hair == 'bald' else '')
    race = f"{n['beast']}-beastkin " if n.get('beast') else ('elf ' if n.get('race') == 'Elf' else '')
    g = n.get('group') or ''
    if g.startswith('Year'): who = f"{YEARW.get(n.get('year'), 'student')}"
    elif g.endswith('team'): who = f"student from the {g}"
    elif g == 'Staff': who = 'member of staff'
    elif g == 'Doves': who = 'Dove officer'
    else: who = 'stranger'
    return (hw + race + who).strip()[:1].upper() + (hw + race + who).strip()[1:]
DATA = {'npcs': {}, 'rel': [], 'locs': {}, 'pins': json.load(open(P('data/map_pins.json'), encoding='utf-8'))}
man = json.load(open(P('data/assets_manifest.json'), encoding='utf-8'))
DATA['assets'] = {'base': man['base_url'], 'map': man['map'], 'size': man['map_size']}
CAST = {}
for nid, n in npcs.items():
    first = nid
    DATA['npcs'][nid] = {'n': n['name'], 'g': n.get('group') or '', 'y': n.get('year') or 0, 'a': n.get('arrives', 1), 'dm': n.get('dorm') or '',
        'dc': n.get('dorm_color') or '#6b6b7b', 'd': descriptor(nid, n), 'r': PUBLIC_ROLE.get(nid, ''),
        'p': n['portrait'], 't': n['thumb'], 'fc': n.get('focus') or [50, 25],
        'fl': [[f['label'], f['text'], f['rank']] for f in n['fields']]}
    CAST[nid] = [n['thumb'], PUBLIC_ROLE.get(nid) or descriptor(nid, n), first, n.get('dorm_color') or '#6b6b7b']
for e in json.load(open(P('data/relations.json'), encoding='utf-8')):
    DATA['rel'].append([e['from'], e['to'], e['type'], e['types'], e['visibility'], e['notes']])
for lid, l in json.load(open(P('data/locations.json'), encoding='utf-8')).items():
    DATA['locs'][lid] = {k: l[k] for k in ('name', 'category', 'kind', 'description', 'vibe', 'regulars', 'connections', 'walk_min',
                                         'clubs', 'access', 'lore', 'floor', 'pin', 'discoverable')}
# ---- Batch 5.2: clubs, shop, team roles ----
import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import load_clubs   # v1.1.0: club data shared with gen_mvu_entries.py (Saturday club time in the Now entry)
DATA['clubs'] = load_clubs(npcs, json.load(open(P('data/locations.json'), encoding='utf-8')))
DATA['shop'] = json.load(open(P('data/shop.json'), encoding='utf-8'))['items']
for nid, n in npcs.items():
    if n.get('team_role'): DATA['npcs'][nid]['tr'] = n['team_role']
# v1.1.0 Features settings (spec §9): rows from data/features.json, rule costs measured by tools/feature_cost.py
DATA['features'] = json.load(open(P('data/features.json'), encoding='utf-8'))['features']
DATA['fcost'] = json.load(open(P('data/feature_cost.json'), encoding='utf-8'))
bar = open(P('src/ui/statusbar.template.html'), encoding='utf-8').read()
bar = bar.replace('/*@@CAST@@*/{}', json.dumps(CAST, ensure_ascii=False, separators=(',', ':'))).replace('/*@@BASE@@*/""', json.dumps(man['base_url']))
open(P('src/ui/statusbar.html'), 'w', encoding='utf-8').write(bar)

t = open(P('src/scripts/ui.template.js'), encoding='utf-8').read()
parts = ''.join(open(P('src/ui/parts', f), encoding='utf-8').read() + '\n' for f in sorted(os.listdir(P('src/ui/parts'))) if f.endswith('.js'))
t = t.replace('/*@@PARTS@@*/', parts)
eng = open(P('src/scripts/engine.template.js'), encoding='utf-8').read()
cal = re.search(r'(const ALL = DAYS.*?\n\};\n)(?=// monthly payout)', eng, re.S).group(1)   # EVENTS + TIMETABLE, single source of truth
t = t.replace('/*@@CALENDAR@@*/{ EVENTS: [], TIMETABLE: {} }', '(() => {\n' + cal + 'return { EVENTS, TIMETABLE };\n})()')
assert '@@CALENDAR@@' not in t
t = t.replace('/*@@DATA@@*/{}', json.dumps(DATA, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@SUBTYPES@@*/{}', json.dumps(SUB, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@NPCS@@*/[]', json.dumps(NPCS, ensure_ascii=False, separators=(',', ':')))
open(P('src/scripts/ui.js'), 'w', encoding='utf-8').write(t)
print('clubs:', len(DATA['clubs']), 'with members:', sum(1 for c in DATA['clubs'] if c['members']), '| shop items:', len(DATA['shop']))
print('data KB:', len(json.dumps(DATA)) // 1024, '| subtypes:', {k: (len(v['standard']), len(v['notable']), len(v['forbidden'])) for k, v in SUB.items()}, '| npcs:', len(NPCS))
