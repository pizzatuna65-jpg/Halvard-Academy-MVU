#!/usr/bin/env python3
"""Batch 1.4 — curated UI data from the v39 lorebooks: data/npcs.json, locations.json, relations.json, map_pins.json.
Secrets (<narrator_only>) are never copied into UI data; only a has_secret flag is kept."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
C = {e['uid']: e for e in json.load(open(P('dist/lorebook_v39/eldrasil_v39_Core.json'), encoding='utf-8'))['entries'].values()}
N = {e['uid']: e for e in json.load(open(P('dist/lorebook_v39/eldrasil_v39_NPC_Detailed.json'), encoding='utf-8'))['entries'].values()}
REMAP = {int(k): v for k, v in json.load(open(P('data/uid_remap_npc.json'))).items()}
MAN = json.load(open(P('data/assets_manifest.json'), encoding='utf-8'))
SECRET = re.compile(r'<narrator_only>.*?</narrator_only>', re.S)
slug = lambda s: re.sub(r'_+', '_', re.sub(r"[^a-z0-9]+", '_', s.lower().replace("'", ''))).strip('_')
DORM_COLOR = {'Fire': '#c0392b', 'Light': '#d4a017', 'Sky': '#2e6fd8', 'Viridian': '#2e9e5b'}

# ---------------- NPCs ----------------
RANK = {'Role': 0, 'Teaching': 0, 'Duties': 0, 'Appearance': 0, 'Full name': 1, 'Age': 1, 'Club': 1, 'Speech': 1, 'Haunts': 1,
        'Stigma': 1, 'Magic': 2, 'Skills': 2, 'Weapon': 2, 'Equipment': 2, 'Pact': 2, 'Loves': 3, 'Hates': 3, 'Hobby': 3,
        'Inventory': 3, 'Personality': 4, 'Emotional tells': 4, 'Notes': 4, 'Goals': 5, 'Now': 5, 'Current trouble': 5,
        'Relations': 6, 'Doves': 6, 'Politics': 6, 'Conflicts': 6, 'Backstory': 7, 'Family': 7, 'Home': 7, 'Trauma': 8,
        'Name': 1, 'Standing': 1, 'Business': 2, 'Quirk': 3, 'Hobbies': 3, 'Traits': 4, 'Current case': 5, 'Quietly distrusts': 6, 'History': 7,
        'Nickname': 1, 'Work': 0, 'Reputation': 1, 'Consultations': 2, 'Fee': 3, 'Cupid': 3, 'Peak season': 3,
        'Serious mode': 4, 'Discretion': 4, 'Flaw': 4, 'Competing clients': 4}
STORY_ONLY = 99  # revealed only through Campus_State.Secrets_revealed ('<npc>.<label>')
FOVR = json.load(open(P('data/field_overrides.json'))) if os.path.exists(P('data/field_overrides.json')) else {}
MIN_RANK_ANY = 4  # unknown labels
def parse_attr_block(seg):
    """'Gareth (Fire, Elf, M, red, kind, #1)' or team style 'Ines Vauclair (Attack, Y3, F, ash-grey, expressionless, Captain)'."""
    m = re.match(r"\s*([^()]+?)\s*\((.*)\)\s*$", seg)
    if not m: return None
    who, inner = m.group(1).strip(), m.group(2)
    nick = None
    if ';' in inner: nick, inner = [x.strip() for x in inner.split(';', 1)]
    attrs = [a.strip() for a in inner.split(',')]
    info = {'nickname': nick, 'race': 'Human', 'beast': None, 'dorm': None, 'gender': None, 'hair': None, 'trait': None, 'extra': [], 'year': None, 'team_role': None}
    rest = []
    for a in attrs:
        if a in DORM_COLOR: info['dorm'] = a
        elif a == 'Elf': info['race'] = 'Elf'
        elif re.fullmatch(r'\w+ B', a): info['race'], info['beast'] = 'Beastkin', a.split()[0]
        elif a in ('M', 'F'): info['gender'] = a
        elif re.fullmatch(r'Y[123]', a): info['year'] = int(a[1])
        elif a in ('Attack', 'Defense', 'Control', 'Healing', 'Support'): info['team_role'] = a
        else: rest.append(a)
    if rest: info['hair'] = rest[0]
    if len(rest) > 1: info['trait'] = rest[1]
    info['extra'] = rest[2:]
    return who, info
roster = {}
for line in N[97]['content'].split('\n'):
    m = re.match(r'(Staff|Facilities|Cathedral|Doves|Liaison|Year \d):\s*(.*)', line)
    if not m: continue
    group = m.group(1)
    for seg in re.split(r';\s*(?![^()]*\))', m.group(2).rstrip('.')):
        r = parse_attr_block(seg)
        if r:
            who, info = r; info['group'] = group
            if group.startswith('Year'): info['year'] = int(group[-1]); info['academy'] = 'Halvard'
            else: info['academy'] = 'Halvard'
            roster[who.split()[0]] = info
for u, team in ((270, 'Myrdath'), (271, 'Veyra'), (272, 'Ashvale')):
    tl = re.search(r'Team:\s*(.*)', N[u]['content']).group(1)
    for seg in re.split(r';\s*(?![^()]*\))', tl.rstrip('.')):
        r = parse_attr_block(seg)
        if r:
            who, info = r; info['group'] = f'{team} team'; info['academy'] = team
            roster[who.split()[0]] = info

def split_fields(text):
    fields, notes = [], []
    for line in text.split('\n')[1:]:
        line = line.strip()
        if not line: continue
        m = re.match(r'^([A-Z][A-Za-z /]{1,24}):\s*(.+)$', line)
        if m and (m.group(1) in RANK or len(m.group(1).split()) <= 2):
            fields.append([m.group(1), m.group(2).strip()])
        else:
            notes.append(line)
    if notes: fields.append(['Notes', ' '.join(notes)])
    return fields

SENSITIVE = re.compile(r'\b(cult|Morning Choir|demon|forbidden|Lucifer|Shub|Hastur|King in Yellow|Loki|spy|secretly|nobody knows|no one knows|hidden|in truth|actually)\b', re.I)
npcs, flags = {}, []
for u, e in sorted(N.items()):
    if not e['comment'].startswith('NPC'): continue
    name = e['comment'].replace('NPC — ', '').strip(); nid = name.split()[0]
    raw = e['content']; has_secret = '<narrator_only>' in raw
    clean = SECRET.sub('', raw)
    clean = re.sub(r'\n{2,}', '\n', clean)
    fields = []
    for label, val in split_fields(clean):
        val = re.sub(r'\s{2,}', ' ', val).strip()
        if not val: continue
        rank = RANK.get(label, MIN_RANK_ANY)
        if f'{nid}.{label}' in FOVR: rank = FOVR[f'{nid}.{label}']
        fields.append({'label': label, 'text': val, 'rank': rank})
        for m in SENSITIVE.finditer(val):
            flags.append(f"{nid}.{label}: …{val[max(0, m.start()-50):m.end()+50]}…")
    r = roster.get(nid, {})
    a = MAN['npcs'][nid]
    npcs[nid] = {
        'id': nid, 'name': name, 'uid_card': REMAP.get(u, u), 'keys': e['key'],
        'academy': r.get('academy', 'Halvard'), 'group': r.get('group'), 'dorm': r.get('dorm'),
        'dorm_color': DORM_COLOR.get(r.get('dorm'), '#6b6b7b'), 'year': r.get('year'), 'race': r.get('race'), 'beast': r.get('beast'),
        'gender': r.get('gender'), 'hair': r.get('hair'), 'impression': r.get('trait'), 'public_tags': r.get('extra', []),
        'team_role': r.get('team_role'), 'nickname': r.get('nickname'), 'portrait': a['portrait'], 'thumb': a['thumb'], 'focus': a['focus'],
        'has_secret': has_secret, 'fields': fields}
# v1.0.3: campaign year each NPC is at Halvard from (1 = from the start; incoming cohorts from data/cohorts.json)
_coh = json.load(open(P('data/cohorts.json'), encoding='utf-8'))['incoming']
for _y, _ids in _coh.items():
    for _id in _ids:
        assert _id in npcs, f'cohorts.json: unknown NPC {_id}'
        npcs[_id]['arrives'] = int(_y)
for _n in npcs.values(): _n.setdefault('arrives', 1)
# v1.1.0 (spec §1): what each staff member teaches, from the roster's Staff/Doves lines: [[subject, year]], year 0 = every year.
# Only posts the roster names; unknown posts stay unknown (never invent a teacher).
SUBJECTS = ('Magic Theory', 'History', 'Combat', 'Dark Magic Defense', 'Potion Crafting', 'Etiquette', 'Creature Studies')
for _id, _r in roster.items():
    if _id not in npcs or _r.get('group') not in ('Staff', 'Doves'): continue
    _t = []
    for _x in [_r.get('hair') or '', _r.get('trait') or ''] + _r.get('extra', []):
        _m = re.fullmatch(r'(%s) Y([123])' % '|'.join(SUBJECTS), _x.strip())
        if _m: _t.append([_m.group(1), int(_m.group(2))]); continue
        _m = re.fullmatch(r'(%s) teacher for every year' % '|'.join(SUBJECTS), _x.strip())
        if _m: _t.append([_m.group(1), 0])
    if _t: npcs[_id]['teaches'] = _t
assert npcs['Yvette'].get('teaches') == [['Magic Theory', 1]] and npcs['Milena'].get('teaches') == [['Dark Magic Defense', 0]], 'teaches parse'
missing_roster = [k for k in npcs if k not in roster]
json.dump(npcs, open(P('data/npcs.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# ---------------- Relations: moved to tools/build_relations.py (Batch 4.3), run at the end ----------------

# ---------------- Locations ----------------
locs = {}
def add_loc(uid, name, cat, entry_text, kind='location'):
    txt = SECRET.sub('', entry_text).strip()
    vibe = None
    m = re.search(r'\n?Feel:\s*(.+)$', txt)
    if m: vibe = m.group(1).strip(); txt = txt[:m.start()].strip()
    txt = re.sub(r'^\[[^\]]+\]\s*', '', txt)
    lid = slug(re.sub(r'^The ', '', name))
    locs[lid] = {'id': lid, 'name': name, 'uid': uid, 'category': cat, 'kind': kind, 'description': txt, 'vibe': vibe,
                 'has_secret': '<narrator_only>' in entry_text, 'regulars': [], 'connections': [], 'walk_min': None,
                 'clubs': [], 'access': None, 'lore': [], 'floor': None, 'pin': None, 'discoverable': False}
    return lid
for u, e in C.items():
    m = re.match(r'Academy Location - ([^-]+?) - (.+)$', e['comment'])
    if m: add_loc(u, m.group(2).split(' - ')[-1].strip(), m.group(1).strip(), e['content'])
for u, nm in ((214, 'Nightwell'), (216, "Merryhew's"), (217, 'The Snug')):
    add_loc(u, nm, 'Mall shop', C[u]['content'], kind='shop')
L = lambda name: slug(re.sub(r'^The ', '', name))
def need(*ids):
    for i in ids: assert i in locs, i
    return ids
# adjacency from Core 132 Campus Map (+ D23-D25)
ADJ = [('Reception and Gatehouse', 'Courtyards'), ('Reception and Gatehouse', "Groundskeeper's Lodge"),
       *[('Courtyards', x) for x in ('Arbiter Hall', 'Canteen', 'Club Rooms', 'Main Library', 'Notice Board', 'Lecture Halls', 'Faculty Offices',
                                     'Fire Dormitory', 'Light Dormitory', 'Sky Dormitory', 'Viridian Dormitory', 'The Mall', 'Mail Tower',
                                     "Founder's Statue and Park", 'Combat Grounds', 'Sports Field', 'Gardens', 'Grassy Field and Hills', 'The Dovecote')],
       ('Arbiter Hall', 'Ring Dining Hall'), ('Arbiter Hall', 'Portrait Hall'), ('Portrait Hall', 'Bell Tower'), ('Bell Tower', 'Rooftop'),
       ('Club Rooms', 'Student Council Chamber'), ('Club Rooms', 'Announcement Room'), ('Lecture Halls', 'Seminar Rooms'),
       ('Lecture Halls', 'Potion Halls'), ('Lecture Halls', 'Workshop'), ('Lecture Halls', 'Storage and Lockers'), ('Main Library', 'Study Rooms'),
       ('Main Library', 'Archive'), ('Archive', 'Restricted Section'), ('Faculty Offices', 'Staff Room'), ('Faculty Offices', "Headmaster's Office"),
       ("Warden's Office", 'Seal Chamber'), ('Notice Board', "Warden's Office"), ('Notice Board', 'The Royal Inspectorate'),
       ('Notice Board', 'Detention Tower'), ('Notice Board', 'Staff Quarters'), ("Warden's Office", 'The Royal Inspectorate'),
       ('The Mall', 'Medical Centre'), ('The Mall', 'Commissary'), ('The Mall', 'The Banking House'), ('The Mall', 'Meditation Rooms / Spirit House'),
       ("Founder's Statue and Park", 'Gardens'), ("Founder's Statue and Park", 'Sports Field'), ('Sports Field', 'Gymnasium'),
       ('Sports Field', 'Archery Range'), ('Gymnasium', 'Swimming Pool'), ('Gardens', 'Menagerie'), ('Grassy Field and Hills', 'Observation Tower'),
       ('Grassy Field and Hills', 'Old Hut'), ('Combat Grounds', 'The Sparring Pavilion'), ('Gardens', 'Boathouse and Lake'),
       ('Boathouse and Lake', 'Forest'), ('Grassy Field and Hills', 'Forest'), ('Forest', 'Forest Clearing'),
       ('The Dovecote', 'The Cathedral'), ('The Dovecote', "The Noble Houses' Liaison"), ('The Cathedral', "The Noble Houses' Liaison"),
       ('Broken Statue', 'The Dovecote'), ('Broken Statue', 'Fire Dormitory'),
       *[(d, x) for d in ('Fire Dormitory', 'Light Dormitory', 'Sky Dormitory', 'Viridian Dormitory')
         for x in ('Common Rooms', 'Laundry', 'Bathhouse and Washrooms')],
       *[('The Mall', s) for s in ('Nightwell', "Merryhew's", 'The Snug')]]
for a, b in ADJ:
    a, b = need(L(a), L(b))
    if b not in locs[a]['connections']: locs[a]['connections'].append(b)
    if a not in locs[b]['connections']: locs[b]['connections'].append(a)
WALK = {5: ['The Mall', 'Medical Centre', 'Commissary', 'The Banking House', 'Meditation Rooms / Spirit House', "Founder's Statue and Park", 'Broken Statue', 'Mail Tower'],
        10: ['Combat Grounds', 'The Sparring Pavilion', 'Sports Field', 'Gymnasium', 'Swimming Pool', 'Archery Range'],
        15: ['Gardens', 'Menagerie', 'Grassy Field and Hills', 'Observation Tower'], 20: ['Old Hut', 'Boathouse and Lake'],
        25: ['Forest'], 40: ['Forest Clearing'], 0: ['Courtyards']}
FLOORS = {'Undercroft': ['Workshop', 'Archive', 'Restricted Section', 'Seal Chamber'],
          'Floor 1': ['Arbiter Hall', 'Ring Dining Hall', 'Canteen', 'Main Library', 'Club Rooms', 'Student Council Chamber', 'Announcement Room',
                      'Notice Board', "Warden's Office", 'The Royal Inspectorate', 'Detention Tower'],
          'Floor 2': ['Lecture Halls', 'Study Rooms', 'Portrait Hall', 'Storage and Lockers'], 'Floor 3': ['Seminar Rooms'], 'Floor 4': ['Potion Halls'],
          'Floor 5': ['Faculty Offices', 'Staff Room', "Headmaster's Office"], 'Towers & Roof': ['Bell Tower', 'Rooftop']}
for fl, names in FLOORS.items():
    for nm in names:
        locs[need(L(nm))[0]]['floor'] = fl; locs[L(nm)]['walk_min'] = 4
for mins, names in WALK.items():
    for nm in names: locs[need(L(nm))[0]]['walk_min'] = mins
for d in ('Fire Dormitory', 'Light Dormitory', 'Sky Dormitory', 'Viridian Dormitory', 'Staff Quarters'): locs[L(d)]['walk_min'] = 4
ACCESS = {'Seal Chamber': 'Forbidden — the Warden only; magic near it is banned', "Warden's Office": 'Staff only, when summoned',
          'Restricted Section': 'Restricted — permission required; being caught inside is serious', 'Ring Dining Hall': 'Feasts after major events only',
          'Rooftop': 'Officially out of bounds', "Headmaster's Office": 'When it matters: discipline, requests, bad news',
          'Fire Dormitory': 'Residents only (bracelet door)', 'Light Dormitory': 'Residents only (bracelet door)', 'Sky Dormitory': 'Residents only (bracelet door)',
          'Viridian Dormitory': 'Residents only (bracelet door)', 'Staff Quarters': 'Staff residence', 'The Dovecote': "Crown ground — the Doves' compound",
          'The Royal Inspectorate': 'Crown office — the Headmaster has no authority past the door', "The Noble Houses' Liaison": 'By invitation',
          'Detention Tower': 'When assigned detention', 'Meditation Rooms / Spirit House': 'Students are not to go alone',
          'Reception and Gatehouse': 'The only way in or out', 'Forest': 'Far edge of the grounds; curfew applies after dark',
          'Combat Grounds': 'Dorm-separated training areas; duels only inside a warded ring', 'Staff Room': 'Staff only',
          'Faculty Offices': 'Staff; students by visit'}
for nm, a in ACCESS.items(): locs[need(L(nm))[0]]['access'] = a
locs['rooftop']['discoverable'] = True
# clubs from the Campus Map venue line
venue = re.search(r'Club venues: (.*?)\n', C[132]['content']).group(1)
for part in venue.rstrip('.').split(';'):
    clubs, place = part.split('–', 1)
    place = re.sub(r'\s*\(.*?\)', '', place).strip()
    PLACE_ALIAS = {'Lake': 'boathouse_and_lake', 'Hills': 'grassy_field_and_hills', 'Council Chamber': 'student_council_chamber'}
    tgt = PLACE_ALIAS.get(place) or next((lid for nm, lid in sorted(((v['name'], k) for k, v in locs.items()), key=lambda x: -len(x[0]))
                                         if re.sub(r'^The ', '', place).startswith(re.sub(r'^The ', '', nm))), None) or L(place)
    need(tgt)
    for c in clubs.split(','):
        c = c.strip()
        if c: locs[tgt]['clubs'].append(c)
locs['sparring_pavilion']['clubs'].append('Duelling (headquarters)')
# lore links (ghost stories, superstitions, brands, games)
LORE = {'bathhouse_and_washrooms': [205], 'lecture_halls': [206, 209], 'fire_dormitory': [207], 'light_dormitory': [207], 'sky_dormitory': [207],
        'viridian_dormitory': [207], 'boathouse_and_lake': [208], 'founders_statue_and_park': [223], 'main_library': [224], 'forest': [225],
        'canteen': [211], 'commissary': [210, 213], 'mall': [210, 212, 213, 215, 222], 'common_rooms': [218], 'club_rooms': [218]}
for lid, uids in LORE.items():
    for u in uids:
        first = re.sub(r'^\[[^\]]+\]\s*', '', C[u]['content']).split('\n')[0].split('. ')[0].strip().rstrip('.') + '.'
        locs[need(lid)[0]]['lore'].append({'uid': u, 'title': re.sub(r'^\w+ - ', '', C[u]['comment']), 'summary': first})
# regulars
def reg_targets(title):
    t = title.replace('Regulars — ', '')
    special = {'Sports Field and Gymnasium': ['sports_field', 'gymnasium', 'swimming_pool', 'archery_range'],
               'Faculty Offices and Staff Room': ['faculty_offices', 'staff_room'], 'Common Rooms and Canteen': ['common_rooms', 'canteen'],
               "Founder's Park": ['founders_statue_and_park'], 'Archive': ['archive'], 'Lecture Halls': ['lecture_halls']}
    return special.get(t, [L(t)])
unmatched_reg = []
for u, e in N.items():
    if not e['comment'].startswith('Regulars'): continue
    body = re.sub(r'^\[[^\]]+\]\s*', '', e['content'])
    ids = [w for w in re.findall(r"[A-Z][a-z]+", body) if w in npcs]
    for lid in reg_targets(e['comment']):
        if lid in locs: locs[lid]['regulars'] = sorted(set(locs[lid]['regulars'] + ids))
        else: unmatched_reg.append(e['comment'])
json.dump(locs, open(P('data/locations.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# ---------------- Map pins ----------------
PINS = {1: ('Castle', ['canteen', 'main_library', 'club_rooms', 'student_council_chamber', 'announcement_room', 'notice_board', 'wardens_office',
                       'royal_inspectorate', 'detention_tower', 'lecture_halls', 'study_rooms', 'storage_and_lockers', 'seminar_rooms', 'potion_halls',
                       'faculty_offices', 'staff_room', 'headmasters_office', 'bell_tower', 'rooftop', 'workshop', 'archive', 'restricted_section',
                       'seal_chamber']),
        2: ('Main Courtyard', ['courtyards']), 3: ('Fire Dormitory', ['fire_dormitory', 'common_rooms', 'laundry', 'bathhouse_and_washrooms']),
        4: ('Sky Dormitory', ['sky_dormitory', 'common_rooms', 'laundry', 'bathhouse_and_washrooms']),
        5: ('Viridian Dormitory', ['viridian_dormitory', 'common_rooms', 'laundry', 'bathhouse_and_washrooms']),
        6: ('Light Dormitory', ['light_dormitory', 'common_rooms', 'laundry', 'bathhouse_and_washrooms']),
        7: ('Arbiter Hall', ['arbiter_hall', 'ring_dining_hall', 'portrait_hall']), 8: ('Staff Quarters', ['staff_quarters']),
        9: ('Observation Tower', ['observation_tower']), 10: ('Old Hut', ['old_hut']), 11: ('Forest Clearing', ['forest_clearing', 'forest']),
        12: ('Boathouse and Lake', ['boathouse_and_lake']), 13: ('Gardens', ['gardens']), 14: ('Menagerie', ['menagerie']),
        15: ('Archery Range', ['archery_range']), 16: ('Gymnasium', ['gymnasium', 'swimming_pool']), 17: ('Sports Field', ['sports_field']),
        18: ('Combat Grounds', ['combat_grounds']), 19: ('The Sparring Pavilion', ['sparring_pavilion']), 20: ("Groundskeeper's Lodge", ['groundskeepers_lodge']),
        21: ("Founder's Park", ['founders_statue_and_park']), 22: ('The Mall', ['mall', 'nightwell', 'merryhews', 'snug']),
        23: ('Commissary', ['commissary']), 24: ('Medical Centre', ['medical_centre']), 25: ('Mail Tower', ['mail_tower']),
        26: ('Gatehouse', ['reception_and_gatehouse']), 27: ('Banking House', ['banking_house']), 28: ('The Dovecote', ['dovecote']),
        29: ('The Cathedral', ['cathedral']), 30: ("Noble Houses' Liaison", ['noble_houses_liaison']), 32: ('Spirit House', ['meditation_rooms_spirit_house']),
        33: ('Broken Statue', ['broken_statue']), 34: ('Fishing House', ['boathouse_and_lake']), 35: ('Willow Island', ['boathouse_and_lake']),
        36: ('Grassy Field and Hills', ['grassy_field_and_hills'])}
XY = json.load(open(P('data/pins_pct.json')))
pins = []
for n, (label, cluster) in PINS.items():
    need(*cluster)
    pins.append({'pin': n, 'label': label, 'x': XY[str(n)][0], 'y': XY[str(n)][1], 'cluster': cluster,
                 'tabs': list(FLOORS) if n == 1 else None})
    for lid in cluster:
        if locs[lid]['pin'] is None: locs[lid]['pin'] = n
json.dump(pins, open(P('data/map_pins.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(locs, open(P('data/locations.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
unpinned = [k for k, v in locs.items() if v['pin'] is None]
print(f'npcs {len(npcs)} | locations {len(locs)} | pins {len(pins)}')
import runpy; runpy.run_path(P('tools/build_relations.py'))
print('npc without roster data:', missing_roster)
print('unpinned locations:', unpinned, '| unmatched regulars:', unmatched_reg)
json.dump(flags, open(P('data/_review_sensitive_flags.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('sensitive-word flags for review:', len(flags))
