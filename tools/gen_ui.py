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
PUBLIC_ROLE = {k: v for k, v in json.load(open(P('data/public_roles.json'), encoding='utf-8')).items() if not k.startswith('_')}   # 1.43.0: data file
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
DATA['assets'] = {'base': man['base_url'], 'map': man['map'], 'size': man['map_size'],
                  'variants': man.get('map_variants', [])}   # 1.13.0: map by calendar (event, then season)
# 1.46.0 (audit 2.1): the outside areas' Map tabs in one shape for one renderer (20_map.js renderArea): pins (in the forest each place
# is its own pin), places with their card text (vibe, desc; Sunreach's night face too) and the "I head to ..." words, the legs for the
# walk search the engine also uses (shared.js), fares, the unit of a walk and where visits start. Built from the areas' data files:
# 1.38.0 the Grand Vast Forest (the cards show the description and the feel; the possible encounters are the narrator's, lore only),
# 1.39.0 Avalon (the castle pin hides until a Kingdom win, the Rookery until visited), 1.40.0 the airship (no map image: four places
# aboard, only during a flight), 1.41.0 Sunreach Bay (a day image and a night image, 18:00-06:00, with the same pins).
def _cap(s):
    return s[:1].upper() + s[1:].lower()
def _go(name, bare=()):
    """the words for "I head to ..." (an article before a place unless its name is bare)"""
    return name if name in bare else 'the ' + (name[4:] if name.startswith('The ') else name)
_exp = json.load(open(P('data/expedition.json'), encoding='utf-8'))
_av = json.load(open(P('data/avalon.json'), encoding='utf-8'))
_air = json.load(open(P('data/airship.json'), encoding='utf-8'))
_srm = json.load(open(P('data/sunreach.json'), encoding='utf-8'))
_tour = next(l for l in _srm['legs'] if len(l) > 3 and l[3])
_dock = next(p['name'] for p in _srm['places'] if p['pin'] == _tour[0] and 'Dock' in p['name'])
_AV_BARE = ('Crown Square', 'Spellwright Row', 'Old Town', 'Eldrasil Castle')
from common import presence_data   # 1.47.0 (audit 3.8): the Map card's Regulars use the engine's whereabouts (shared.js)
DATA['presence'] = presence_data(npcs, json.load(open(P('data/locations.json'), encoding='utf-8')))
DATA['areas'] = {
    'forest': {'area': _exp['area'], 'map': _exp['map'], 'unit': 'h', 'arrive': 'base_camp', 'start': 'base_camp', 'reveal': 'near', 'paths': True,
               'offGo': 'Only during the Expedition', 'offText': 'You are not in the forest now. The map shows what you found on your Expedition.',
               'legs': [l[:3] for l in _exp['legs']], 'modes': {},
               'pins': [{k: p[k] for k in ('id', 'name', 'x', 'y')} for p in _exp['places']],
               'places': [{'id': p['id'], 'name': p['name'], 'pin': p['id'], 'vibe': _cap(_exp['groups'][p['group']]['feel']), 'desc': _exp['groups'][p['group']]['desc'],
                           'go': p['name'][:4].replace('The ', 'the ') + p['name'][4:]} for p in _exp['places']]},
    'avalon': {'area': _av['area'], 'map': _av['map'], 'unit': 'min', 'arrive': 'skyport', 'start': 'square',
               'offGo': 'Only while in Avalon', 'offText': 'You are not in Avalon now. The map shows the city as you saw it.',
               'legs': _av['legs'], 'modes': {'carriage': {'fare': _av['rates']['ride_coin'], 'name': 'hire carriage'}},
               'pins': [{k: p[k] for k in ('id', 'name', 'x', 'y', 'locked', 'kc') if k in p} for p in _av['pins']],
               'places': [{**{k: p[k] for k in ('id', 'name', 'pin', 'in', 'locked', 'hidden', 'kc', 'desc', 'vibe') if k in p}, 'go': _go(p['name'], _AV_BARE)} for p in _av['places']]},
    'sunreach': {'area': _srm['area'], 'maps': _srm['maps'], 'night': _srm['night'], 'unit': 'min', 'arrive': _srm['arrive'], 'start': 'strand',
                 'offGo': f"Only while in {_srm['area']}", 'offText': f"You are not in {_srm['area']} now. The map shows the city as you saw it.",
                 'legs': _srm['legs'], 'modes': {'carriage': {'fare': _srm['rates']['carriage'], 'name': 'carriage'}, 'boat': {'fare': _srm['rates']['boat'], 'name': 'water taxi'},
                                                 'tour': {'fare': _srm['rates']['tour'], 'from': 'the ' + _dock}},
                 'pins': _srm['pins'],
                 'places': [{'id': p['id'], 'name': p['name'], 'pin': p['pin'], 'in': p['in'], 'vibe': p['feel'], 'vibe_night': p['night_feel'], 'desc': p['desc'], 'desc_night': p['night'],
                             'go': 'the open sea' if p['name'] == 'Open Sea' else _go(p['name'])} for p in _srm['places']]},
    'airship': {'area': _air['area'], 'kind': 'cards', 'legs': [], 'pins': [], 'modes': {},
                'places': [{'id': p['id'], 'name': p['name'], 'vibe': p['line'], 'desc': p['desc'], 'go': _go(p['name'])} for p in _air['places']]},
}
CAST = {}
for nid, n in npcs.items():
    first = nid
    DATA['npcs'][nid] = {'n': n['name'], 'g': n.get('group') or '', 'y': n.get('year') or 0, 'a': n.get('arrives', 1), 'dm': n.get('dorm') or '',
        'gn': n.get('gender') or '', 'dc': n.get('dorm_color') or '#6b6b7b', 'd': descriptor(nid, n), 'r': PUBLIC_ROLE.get(nid, ''),
        'p': n['portrait'], 't': n['thumb'], 'fc': n.get('focus') or [50, 25],
        'fl': [[f['label'], f['text'], f['rank']] + ([f['year']] if f.get('year') else []) for f in n['fields']]}   # 1.7.0: [3] = shown from that campaign year
    # 1.52.0 (feature batch 4): the weekly routine as a dossier field right after Haunts, opened with it
    _rt = DATA['presence']['rt'].get(nid)
    if _rt:
        _fl = DATA['npcs'][nid]['fl']
        _hi = next((i for i, f in enumerate(_fl) if f[0] == 'Haunts'), None)
        _row = ['Routine', 'Usually: ' + '; '.join(f"{r[6]} at {r[4]}{', ' + r[5] if r[5] else ''}" for r in _rt) + '.', _fl[_hi][2] if _hi is not None else 1]
        _fl.insert(_hi + 1 if _hi is not None else len(_fl), _row)
    if n.get('academy') == 'Halvard': DATA['npcs'][nid]['ag'] = 1   # 1.7.4: ages in their fields follow the campaign year (see ageNow)
    CAST[nid] = [n['thumb'], descriptor(nid, n) if nid in ('Irene', 'Caspian') else PUBLIC_ROLE.get(nid) or descriptor(nid, n), first, n.get('dorm_color') or '#6b6b7b']
for e in json.load(open(P('data/relations.json'), encoding='utf-8')):
    DATA['rel'].append([e['from'], e['to'], e['type'], e['types'], e['visibility'] + (f"@{e['via']}" if e['via'] != e['from'] and e['visibility'] != 'public' else ''), e['notes']] + ([[e['rule'], e['rule_label']]] if e.get('rule') else []))   # 1.4.2 group-rule lines carry [id, label]; 1.6.10 'rank:N@Via' = told by Via's file
DATA['wind'] = {k: v for k, v in json.load(open(P('data/wind_casting.json'), encoding='utf-8')).items() if not k.startswith('_')}   # 1.42.0: the Battle panel's casting cost
DATA['rom1'] = {k: v for k, v in json.load(open(P('data/relations_curated.json'), encoding='utf-8')).get('romance_one_way', {}).items() if not k.startswith('_')}   # 1.4.2
for lid, l in json.load(open(P('data/locations.json'), encoding='utf-8')).items():
    DATA['locs'][lid] = {k: l[k] for k in ('name', 'category', 'kind', 'description', 'vibe', 'regulars', 'connections', 'walk_min',
                                         'clubs', 'access', 'lore', 'floor', 'pin', 'discoverable', 'near')}
    if l.get('seasons'): DATA['locs'][lid]['seasons'] = l['seasons']
    if l.get('gate'): DATA['locs'][lid]['gate'] = l['gate']
    if l.get('floors'): DATA['locs'][lid].update(floors=l['floors'], fnote=l['floor_notes'])   # 1.24.2: a place on each year's floor   # 1.24.0: shown once the place that leads to it was visited   # 1.14.0: the place in each season (location card)
# ---- Batch 5.2: clubs, shop, team roles ----
import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import load_clubs   # v1.1.0: club data shared with gen_mvu_entries.py (Saturday club time in the Now entry)
from common import place_aliases   # 1.3.1: short place names -> location id (map "you are here")
from common import npc_aliases     # 1.37.0: dialogue colours by every name a character goes by
from common import effect_text     # 1.9.5: shop item effects (shop and Bag)
from common import fill_data
_mst = json.load(open(P('data/mastery.json'), encoding='utf-8'))   # 1.43.0 (2.8): Rank 5 perks and their numbers
DATA['mastery'] = {'arcana_cost': _mst['arcana_cost'], 'perks': {k: fill_data(v) for k, v in _mst['perks'].items()}}
_byname = {l['name']: lid for lid, l in DATA['locs'].items()}
DATA['palias'] = {re.sub(r'^the ', '', a): _byname[nm] for a, nm in place_aliases(json.load(open(P('data/locations.json'), encoding='utf-8'))).items()}
DATA['tune'] = json.load(open(P('data/tuning.json'), encoding='utf-8'))['groups']   # 1.3.1 Settings rows
DATA['practice'] = json.load(open(P('data/practice.json'), encoding='utf-8'))
DATA['chances'] = json.load(open(P('data/event_frame.json'), encoding='utf-8'))['chances']   # 1.81.0: the Activities Event tab
DATA['restful'] = {lid: {'what': v['restores'], 'usual': v['usual'], 'sum': v['summary']} for lid, v in json.load(open(P('data/restore_places.json'), encoding='utf-8'))['places'].items()}   # 1.31.0
_crafts = json.load(open(P('data/crafts.json'), encoding='utf-8'))
DATA['crafts'] = [{**i, 'effect': effect_text(i)} for i in _crafts['recipes']]
DATA['craftGroups'] = {g: v['actions'] for g, v in _crafts['groups'].items()}   # 1.29.0: Practice actions each craft is done under
# 1.4.1 factions for People → Connections (data/factions.json; 'auto' = every NPC of those groups)
_fac = json.load(open(P('data/factions.json'), encoding='utf-8'))['factions']
DATA['factions'] = [{'id': f['id'], 'name': f['name'], 'secret': f.get('secret', []),
                     'members': sorted(set(f.get('members', [])) | {nid for nid, n in npcs.items() if (n.get('group') or '') in f.get('auto', [])})} for f in _fac]
assert all(m in npcs for f in DATA['factions'] for m in f['members']), 'factions.json: unknown NPC'
DATA['dormhead'] = {nid: m.group(1) for nid, n in npcs.items() for m in [re.search(r'\b(Fire|Light|Sky|Viridian) Dorm Head', ' '.join(n.get('public_tags') or []))] if m}   # 1.4.1
_ten = json.load(open(P('data/tension.json'), encoding='utf-8'))   # 1.3.8: bands and who is exempt / locked (no behaviour texts: they are narrator-side)
DATA['ten'] = {'bands': _ten['bands'], 'effects': _ten['effects'], 'exempt': [k for k, o in _ten['overrides'].items() if o.get('exempt')], 'lock': [k for k, o in _ten['overrides'].items() if o.get('lock')]}
_tru = json.load(open(P('data/trust.json'), encoding='utf-8'))   # 1.4.3: bands, perk gates, who is exempt (texts are narrator-side)
DATA['tru'] = {'bands': _tru['bands'], 'gates': _tru['perk_gates'], 'susp': _tru['suspend_r10_below'], 'effects': _tru['effects'],
               'nogates': [k for k, o in _tru['overrides'].items() if o.get('no_gates')], 'lock': {k: o['lock'] for k, o in _tru['overrides'].items() if 'lock' in o}}
DATA['clubs'] = load_clubs(npcs, json.load(open(P('data/locations.json'), encoding='utf-8')))
DATA['mallShops'] = next(p['cluster'] for p in json.load(open(P('data/map_pins.json'), encoding='utf-8')) if 'mall' in p['cluster'])
DATA['shop'] = [{**i, 'effect': effect_text(i)} for i in json.load(open(P('data/shop.json'), encoding='utf-8'))['items']]
for nid, n in npcs.items():
    if n.get('team_role'): DATA['npcs'][nid]['tr'] = n['team_role']
# v1.1.0 Features settings (spec §9): rows from data/features.json, rule costs measured by tools/feature_cost.py
OPN = json.load(open(P('data/bond_openness.json'), encoding='utf-8'))
DATA['birthdayOffsets'] = {nid: shift for tag,shift in [('open',2), ('guarded',-1), ('closed',-2)] for nid in OPN[tag]}
for nid, n in DATA['npcs'].items():
    for f in n['fl']:
        if f[0] == 'Birthday': f[2] = max(1, 3 - DATA['birthdayOffsets'].get(nid, 0))
DATA['bond'] = {k: v for k, v in json.load(open(P('data/bond_rules.json'), encoding='utf-8')).items() if not k.startswith('_')}   # 1.2.2
DATA['rank4'] = json.load(open(P('data/rank4_partners.json'), encoding='utf-8'))['npcs']
DATA['branch'] = json.load(open(P('data/npc_canon.json'), encoding='utf-8')).get('branch', {})   # 1.6.8: Rank 8 branches A-D
_rep = json.load(open(P('data/reputation.json'), encoding='utf-8'))   # 1.3.0
DATA['rep'] = {k: _rep[k] for k in ('reps', 'about', 'thresholds', 'effects')}
DATA['trn'] = {k: v for k, v in json.load(open(P('data/training.json'), encoding='utf-8')).items() if not k.startswith('_')}
DATA['features'] = json.load(open(P('data/features.json'), encoding='utf-8'))['features']
DATA['fcost'] = json.load(open(P('data/feature_cost.json'), encoding='utf-8'))
# 1.37.0/1.37.1: dialogue colours. who: every name a roster character goes by -> their id; start: id -> palette index (the engine's
# $ui.say holds the moves and the Extras colours)
_say = json.load(open(P('data/dialogue_colors.json'), encoding='utf-8'))
DATA['say'] = {'palette': [[p['dark'], p['light']] for p in _say['palette']], 'generic': [_say['generic']['dark'], _say['generic']['light']],
               'user': [_say['user']['dark'], _say['user']['light']], 'start': _say['npcs'], 'who': {}}
for _id in _say['npcs']:
    for _a in [_id.lower(), npcs[_id]['name'].split()[0].lower()]: DATA['say']['who'].setdefault(_a, _id)
for _a, _id in npc_aliases(npcs).items():
    if _id in _say['npcs']: DATA['say']['who'].setdefault(_a, _id)
bar = open(P('src/ui/statusbar.template.html'), encoding='utf-8').read()
NEWS = open(P('src/ui/news.shared.js'), encoding='utf-8').read()   # 1.25.0 red "new" dots, shared by the bracelet and the panels
# 1.43.0 (2.8): the places with a Practice action, from data/practice.json (a new practice place gets its red dot)
_pnames = list(dict.fromkeys(DATA['locs'][a['loc']]['name'] for a in json.load(open(P('data/practice.json'), encoding='utf-8'))))
assert NEWS.count('/*@@PRACTICE_NAMES@@*/[]') == 1
NEWS = NEWS.replace('/*@@PRACTICE_NAMES@@*/[]', json.dumps(_pnames, ensure_ascii=False, separators=(',', ':')))
bar = bar.replace('/*@@NEWS@@*/', NEWS)
# 1.43.0 (2.8): the "Shop here" chip at a shop place: the Commissary and the Mall's cluster (the Shop tab's places), by name
_shops = ['commissary'] + DATA['mallShops']
_shop_rx = '|'.join(re.sub(r'^the ', '', DATA['locs'][i]['name'].lower()).replace("'", "'?") for i in _shops)
assert bar.count('/*@@SHOP_RX@@*/') == 1
bar = bar.replace('/*@@SHOP_RX@@*/', '/^(the\\s+)?(' + _shop_rx + ')\\b/i')
from common import shared_js
assert bar.count('/*@@SHARED@@*/') == 1
bar = bar.replace('/*@@SHARED@@*/', shared_js(presence=False))   # 1.43.0 (audit batch 2)
THEMES = json.load(open(P('data/themes.json'), encoding='utf-8')); THEMES.pop('_note', None)   # 1.3.1 colour themes (tools/make_themes.py)
bar = bar.replace('/*@@THEMES@@*/{}', json.dumps(THEMES, ensure_ascii=False, separators=(',', ':')))
bar = bar.replace('/*@@CAST@@*/{}', json.dumps(CAST, ensure_ascii=False, separators=(',', ':'))).replace('/*@@BASE@@*/""', json.dumps(man['base_url']))
assert '/*@@' not in bar, 'unreplaced placeholder in statusbar.html'
open(P('src/ui/statusbar.html'), 'w', encoding='utf-8', newline='\n').write(bar)

t = open(P('src/scripts/ui.template.js'), encoding='utf-8').read()
parts = ''.join(open(P('src/ui/parts', f), encoding='utf-8').read() + '\n' for f in sorted(os.listdir(P('src/ui/parts'))) if f.endswith('.js'))
t = t.replace('/*@@PARTS@@*/', parts)
from common import shared_js
assert t.count('/*@@SHARED@@*/') == 1
t = t.replace('/*@@SHARED@@*/', shared_js())   # 1.43.0 (audit batch 2)
from common import fill_data
t = fill_data(t)   # 1.43.0 (2.8): times and numbers in panel texts come from the data ({@file.path})
t = t.replace('/*@@NEWS@@*/', NEWS)
cal = json.load(open(P('data/calendar.json'), encoding='utf-8'))
cal_js = '(() => { const EVENTS = ' + json.dumps(cal['events'], ensure_ascii=False, separators=(',', ':')) + '; const TIMETABLE = ' + json.dumps(cal['timetable'], ensure_ascii=False, separators=(',', ':')) + '; const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]; const schedOf = (e, day) => (!e.s ? "" : typeof e.s === "string" ? e.s : e.s[day] || ""); const timetableFor = (W, S) => { const row = TIMETABLE[W.Day]; if (!row) return row; const tt = [...row]; if (W.Day === "Sat" && S && ((S.Player || {}).Profile || {}).Council && !councilRemedial(S.Commitments, W)) tt[1] = "Student Council (Student Council Chamber)"; if (W.Month === 10 && W.Week === 3 && W.Day === "Sat") tt[2] = "Student Council Election (Main Courtyard)"; return tt; }; return {EVENTS, TIMETABLE, timetableFor, schedOf}; })()'
t = t.replace('/*@@CALENDAR@@*/{ EVENTS: [], TIMETABLE: {} }', cal_js)
assert '@@CALENDAR@@' not in t
t = t.replace("/*@@THEMES@@*/{ default: 'pewter', order: [], themes: {} }", json.dumps(THEMES, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@DATA@@*/{}', json.dumps(DATA, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@SUBTYPES@@*/{}', json.dumps(SUB, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@NPCS@@*/[]', json.dumps(NPCS, ensure_ascii=False, separators=(',', ':')))
assert '/*@@' not in t, 'unreplaced placeholder in ui.js'
open(P('src/scripts/ui.js'), 'w', encoding='utf-8', newline='\n').write(t)
print('clubs:', len(DATA['clubs']), 'with members:', sum(1 for c in DATA['clubs'] if c['members']), '| shop items:', len(DATA['shop']))
print('data KB:', len(json.dumps(DATA)) // 1024, '| subtypes:', {k: (len(v['standard']), len(v['notable']), len(v['forbidden'])) for k, v in SUB.items()}, '| npcs:', len(NPCS))
