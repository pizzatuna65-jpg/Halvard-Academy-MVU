#!/usr/bin/env python3
"""Shared data helpers for the generators (v1.1.0). Single source for club membership and outdoor places."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

CLUB_NAME = {'Theatre': 'Theatre Troupe', 'Newspaper': 'Academy Newspaper', 'Divination': 'Divination Society', 'Alchemy': 'Alchemy Circle',
             'Festival Committee': 'Festival Committee', 'Library Assistants': 'Library Assistants', 'Groundskeeping': 'Groundskeeping',
             'Medical Centre Volunteers': 'Medical Centre Volunteers', 'Warding Study': 'Warding Study Group',
             'Student Council': 'Student Council', 'Magic Duelling Club': 'Magic Duelling Club'}
# 1.2.0: Archery, Swimming, Gymnastics and Basketball are sport clubs (owner map review; lore: sport clubs ban magic in play)
SPORT = {'Soccer', 'Running', 'Magic Duelling Club', 'Archery', 'Swimming', 'Gymnastics', 'Basketball'}   # practice after 16:00; spell duelling is exempt from the sport no-magic rule

# 1.97.2: who has no bond: the Kingdom rival teams ("<academy> team") and the World Competition's foreign teams ("World teams").
# Code about the Kingdom Competition itself keeps reading only the "<academy> team" groups.
def nobond(n): g = (n or {}).get('group') or ''; return g.endswith('team') or g == 'World teams'

def load_clubs(npcs, locs):
    """Clubs from location club lists + NPC 'Club' fields (was inline in gen_ui.py, Batch 5.2)."""
    clubs = {}
    for lid, l in locs.items():
        for c in l['clubs']:
            base = re.sub(r'\s*\(.*\)$', '', c)
            clubs.setdefault(base, {'venues': []})['venues'].append(lid)
    for base, c in clubs.items():
        c.update(name=CLUB_NAME.get(base, base + ' Club'), key=base, sport=base in SPORT and base != 'Magic Duelling Club', practice=base in SPORT, members=[], advisors=[])
    for nid, n in npcs.items():
        # 1.75.0: a teacher's Role says which club they answer for ("advises the Smithing Club"); before, only a student's
        # "advised by X" was read, so 15 of the 16 teachers never showed as advisors
        role = next((f['text'] for f in n['fields'] if f['label'].lower() == 'role'), '')
        adv = re.search(r'\badvises the ([^.;,]+)', role, re.I)
        if adv:
            for base, c in clubs.items():
                if re.search(r'\b' + re.escape(base) + r'\b', adv.group(1), re.I) and nid not in c['advisors']: c['advisors'].append(nid)
        f = next((f for f in n['fields'] if f['label'].lower() == 'club'), None)
        if not f: continue
        first = re.split(r'[.,;]', f['text'])[0]
        if re.search(r'whichever club', first, re.I):
            for c in clubs.values(): c.setdefault('follows', []).append(nid)
            continue
        for base, c in clubs.items():
            if re.search(r'\b' + re.escape(base) + r'\b', first, re.I): c['members'].append(nid)
        m = re.search(r'advised by (\w+)', f['text'])
        if m and m.group(1) in npcs:
            for base, c in clubs.items():
                if re.search(r'\b' + re.escape(base) + r'\b', first, re.I) and m.group(1) not in c['advisors']: c['advisors'].append(m.group(1))
    return sorted(clubs.values(), key=lambda c: c['name'])

# v1.1.0 (spec §4.8): outdoor places. The spec rule is category "Sport and Grounds" + Courtyards + Rooftop. Canon corrections:
# the Gymnasium is indoor training ("used heavily in bad weather", lore 73) and the Old Hut is a shelter from sudden rain (lore 263);
# the Founder's Statue and Park (open parkland) and the Combat Grounds (training areas kept away from buildings) are outdoors.
OUTDOOR_ADD = {'courtyards', 'rooftop', 'founders_statue_and_park', 'combat_grounds'}
OUTDOOR_NOT = {'gymnasium', 'old_hut'}
def outdoor_ids(locs):
    return sorted(lid for lid, l in locs.items() if (l['category'] == 'Sport and Grounds' or lid in OUTDOOR_ADD) and lid not in OUTDOOR_NOT)

def place_keys(l, lid):
    """lowercase names a location can be written as (with and without a leading 'the', and its id with spaces)"""
    return sorted({l['name'].lower(), re.sub(r'^the ', '', l['name'].lower()), lid.replace('_', ' ')})

# 1.3.1 (owner playtest: "Boathouse" was not recognised as the Boathouse and Lake, so the map missed the player). Other ways the
# narrator writes a place -> its Campus Map name. Parts of an "X and Y" / "X / Y" name count when no other place claims them;
# the extra forms below are common short names. Used by the engine (World.Location is normalised to the map name) and the UI map.
PLACE_EXTRA = {'main courtyard': 'Courtyards', 'courtyard': 'Courtyards', 'the courtyard': 'Courtyards', 'library': 'Main Library',
               'arbiter hall': 'The Arbiter Hall', 'dining hall': 'The Ring Dining Hall', 'ring dining hall': 'The Ring Dining Hall',
               'common room': 'Common Rooms', 'lecture hall': 'Lecture Halls', 'seminar room': 'Seminar Rooms', 'study room': 'Study Rooms',
               'club room': 'Club Rooms', 'potion hall': 'Potion Halls', 'meditation room': 'Meditation Rooms', 'spirit house': 'Meditation Rooms', 'the spirit house': 'Meditation Rooms',
               'meditation rooms / spirit house': 'Meditation Rooms',   # 1.31.0: the old name (old chats) and the house's old nickname
               'pool': 'Swimming Pool', 'gym': 'Gymnasium', 'infirmary': 'Medical Centre', 'medical center': 'Medical Centre',
               'the woods': 'Forest', 'woods': 'Forest', 'the forest': 'Forest', 'clearing': 'Forest Clearing', 'the clearing': 'Forest Clearing',
               'fire dorm': 'Fire Dormitory', 'light dorm': 'Light Dormitory', 'sky dorm': 'Sky Dormitory', 'viridian dorm': 'Viridian Dormitory',
               'sparring pavilion': 'The Sparring Pavilion', 'the pavilion': 'The Sparring Pavilion', 'founders park': "Founder's Statue and Park",
               "founder's park": "Founder's Statue and Park", 'fishing hut': 'Fishing House', 'boat house': 'Boathouse and Lake',
               'the lake': 'Boathouse and Lake', 'lakeshore': 'Boathouse and Lake', 'lake shore': 'Boathouse and Lake', 'the hills': 'Grassy Field and Hills',
               'grassy field': 'Grassy Field and Hills', 'hills': 'Grassy Field and Hills', 'gate': 'Reception and Gatehouse', 'the gate': 'Reception and Gatehouse',
               'mall': 'The Mall', 'dovecote': 'The Dovecote', 'cathedral': 'The Cathedral', 'banking house': 'The Banking House', 'bank': 'The Banking House',
               'royal inspectorate': 'The Royal Inspectorate', 'inspectorate': 'The Royal Inspectorate', 'seal chamber': 'The Seal Chamber',
               "warden's office": "The Warden's Office", "headmaster's office": "Headmaster's Office", 'observatory': 'Observation Tower',
               'willow': 'Willow Island', 'the island': 'Willow Island', 'hut': 'Old Hut', 'the hut': 'Old Hut'}
def place_aliases(locs):
    """{alias (lowercase): Campus Map name} for names that are not a place's own name"""
    names = {l['name'] for l in locs.values()}
    own = {k for lid, l in locs.items() for k in place_keys(l, lid)}
    part = {}
    for l in locs.values():
        for p in re.split(r'\s+and\s+|\s*/\s*', l['name']):
            p = re.sub(r'^the ', '', p.strip().lower())
            if p and p != l['name'].lower(): part.setdefault(p, set()).add(l['name'])
    out = {p: next(iter(v)) for p, v in part.items() if len(v) == 1 and p not in own}
    for a, nm in PLACE_EXTRA.items():
        assert nm in names, f'PLACE_EXTRA: unknown place {nm}'
        if a not in own: out[a] = nm
    return dict(sorted(out.items()))

# 1.9.5 (playtest Batch 5): the mechanical effect of a shop item (data/shop.json gear / use), worded once for the Activities shop,
# the Bag (via ui.js DATA.shop) and the Price Guide (custom 506). The engine applies the same fields (SHOP_FX in engine.js).
GEAR_TEXT = {'umbrella': 'keeps rain off (not in wind or storm)', 'waterproof': 'waterproof: no Soaked from rain or snow',
             'warm': 'warm: holds off Chilled', 'sun': 'shade: Overheated only from 31 °C'}
def effect_text(item):
    if item.get('gear'): return 'Worn from the Bag: ' + GEAR_TEXT[item['gear']]
    u = item.get('use')
    if not u: return ''
    parts = []
    if u.get('clears'): parts.append('clears ' + ' and '.join(u['clears']))
    if u.get('buff'): parts.append(f"{GEAR_TEXT[u['buff']]} for {u['mins'] // 60} hours" if u['mins'] % 60 == 0 else f"{GEAR_TEXT[u['buff']]} for {u['mins']} minutes")
    if u.get('stamina'): parts.append(f"+{u['stamina']} stamina")
    if u.get('cure'): parts.append(f"a {u['cure'].lower()} ends by the next day")
    if u.get('heal'): parts.append('heals one minor injury' if u['heal'] == 'minor' else 'reduces one moderate injury to minor')
    if u.get('fitting'): parts.append(f"fitting item: +20 Fortune against {u['fitting']} (one use)")
    return 'When used: ' + '; '.join(parts)

# 1.10.0 (FP7): the weekly timetable with venues, the teachers and each club's venues, shared by gen_mvu_entries (the Now entry)
# and gen_engine (attendance). data/calendar.json is the single source of the lessons.
norm_place = lambda s: re.sub(r'^the ', '', s.strip().lower())
def class_data(npcs, locs):
    timetable = json.load(open(P('data/calendar.json'), encoding='utf-8'))['timetable']
    VENUE_ALIAS = {'warded seminar room': 'Seminar Rooms'}
    def venues_of(paren):
        out = []
        for chunk in re.split(r';|\bor\b', paren or ''):
            c = chunk.strip().lower()
            if not c or c in ('doves', 'club venues'): continue
            name = VENUE_ALIAS.get(c) or next((l['name'] for l in locs.values() if norm_place(l['name']) == norm_place(c)), None)
            assert name, f'timetable venue is not a location: {chunk!r}'
            out.append(norm_place(name))
        return out
    TT = {}
    for day, row in timetable.items():
        TT[day] = []
        for cell in row:
            m = re.match(r'^(.*?)(?:\s*\[(M|D)\])?(?:\s*\((.*)\))?$', cell)
            subj, mode, paren = m.group(1).strip(), m.group(2) or '', m.group(3)
            if subj.startswith('Study Hall'): TT[day].append(['Study Hall', '', ['main library'], 'study'])
            elif subj == 'Clubs': TT[day].append(['Clubs', '', [], 'clubs'])
            else: TT[day].append([re.sub(r'\s+practical$', '', subj), mode, venues_of(paren) or ['lecture halls'], 'class'])
    assert TT['Mon'][0] == ['Magic Theory', 'M', ['lecture halls'], 'class'] and TT['Fri'][2][2] == ['combat grounds', 'seminar rooms'] and TT['Wed'][2][2] == ['menagerie', 'forest'], TT
    TEACH = {nid: n['teaches'] for nid, n in sorted(npcs.items()) if n.get('teaches')}
    CLUBS = {c['name']: [norm_place(locs[v]['name']) for v in c['venues']] for c in load_clubs(npcs, locs)}
    return TT, TEACH, CLUBS


# 1.17.0: a card PNG with its v2 (chara) and v3 (ccv3) JSON in tEXt chunks, like build/build_card.py (for TEST card variants)
def write_card_png(v2, v3, out_path):
    import base64, struct, zlib
    chunk = lambda t, body: struct.pack('>I', len(body)) + t + body + struct.pack('>I', zlib.crc32(t + body) & 0xffffffff)
    raw = open(P('src/card/avatar.png'), 'rb').read()
    out, p = [raw[:8]], 8
    while p < len(raw):
        l = struct.unpack('>I', raw[p:p + 4])[0]; t = raw[p + 4:p + 8]
        if t == b'IEND':
            for k, obj in (('chara', v2), ('ccv3', v3)):
                out.append(chunk(b'tEXt', k.encode() + b'\x00' + base64.b64encode(json.dumps(obj, ensure_ascii=False).encode('utf-8'))))
        if t not in (b'tEXt', b'iTXt', b'zTXt'):
            out.append(raw[p:p + 12 + l])
        p += 12 + l
    open(out_path, 'wb').write(b''.join(out))


def npc_aliases(npcs):
    """Every name a roster character goes by (lowercase) -> id: the engine's NPC_ALIAS and the UI's dialogue colours."""
    alias = {}
    for nid, n in npcs.items():
        for a in [nid, n['name'], n.get('nickname')] + [k for k in n['keys'] if k[:1].isupper() and len(k.split()) <= 3]:
            if a: alias.setdefault(a.lower(), nid)
    # drop keys that are clearly not names (clubs, places, titles shared by many)
    BAD = re.compile(r'club|library|council|dorm|academy|team|circle|house|hall|tower|office|order|choir|lord|king|saint|squad|doves?$', re.I)
    DENY = {'festival committee', 'divination society', 'theatre troupe', 'shub-niggurath', 'shub niggurath', 'hastur', 'loki', 'hades',
            'excalibur', 'gohn', 'janna', 'laetano', 'velmora', 'niu', 'ardenne', 'villeneuve', 'sobek', 'royal mage', 'youngest royal mage', 'crane'}   # 1.7.0: Maple's spirit, Tsubaki's title; 1.33.0: crane (the bird)  # spirits, items, brands, groups, shared surnames
    alias = {k: v for k, v in alias.items() if (not BAD.search(k) or k == v.lower()) and k not in DENY}
    return alias


def name_forms(npcs):
    """Proper-case name forms (id, full name, nickname), longest first: the engine's NAME_FORMS and 505's player-message recall (1.80.0)."""
    return {nid: sorted({f for f in [nid, n['name'], n.get('nickname')] if f and len(f) > 1}, key=len, reverse=True) for nid, n in npcs.items()}

# 1.5.1 (P6): first names that are also ordinary words; a sentence-initial one is not a mention. 1.7.0: maple (the tree), wren (the bird)
MENTION_DENY = ['Pip', 'Ruby', 'Maple', 'Wren']

def lore_key(s):
    """1.60.0: a Lore_changes subject or a lore entry name as one key; the engine (lcKey) and build_card's EJS do the same."""
    return re.sub(r'\s+', ' ', re.sub(r'^the\s+', '', str(s).strip().lower()))


def lore_names(e):
    """1.60.0: the names a Lore_changes subject may use for a lore entry: its title's last part (an NPC's first name too) and its
    plain keys. [] for an entry a change never attaches to (constant, disabled, custom uid 500+)."""
    if e.get('constant') or e.get('disable') or e['uid'] >= 500:
        return []
    title = re.sub(r'^\[[^\]]*\]\s*', '', e.get('comment', ''))
    parts = re.split(r'\s+[—–-]\s+', title)
    names = [parts[-1]] + ([parts[-1].split()[0]] if parts[0] == 'NPC' else [])
    names += [k for k in e.get('key', []) if not k.startswith('/') and len(k) >= 3]
    return list(dict.fromkeys(n for n in map(lore_key, names) if n))


def shared_js(presence=True):
    """1.43.0 (audit batch 2): src/scripts/shared.js with its data filled in (data/calendar.json), for the engine, the panels,
    the bracelet and the <now> entry (each template marks the spot with a SHARED placeholder). presence=False (1.47.0) leaves out
    the whereabouts section, which only the engine and the panels run."""
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cal = json.load(open(os.path.join(root, 'data/calendar.json'), encoding='utf-8'))
    data = {k: cal[k] for k in ('periods', 'exam_months', 'seasons', 'dorm_colors')}
    data['trips'] = [{'m': e['m'], 'w': e['w'], 'd': e['d'][0], 'name': e['trip']} for e in cal['events'] if e.get('trip')]
    # 1.83.0: the breaks (events with home), one key per break (the Month 12 weeks are one holiday)
    data['breaks'] = [{'key': re.sub(r'_\d+$', '', e['id']), 'm': e['m'], 'w': e['w'], 'd': e['d'], 'name': e['t'].split(' (')[0].split(':')[0]} for e in cal['events'] if e.get('home')]
    src = open(os.path.join(root, 'src/scripts/shared.js'), encoding='utf-8').read()
    ph = "/*@@SHARED_DATA@@*/{ periods: [], exam_months: [], seasons: [], trips: [], dorm_colors: {}, breaks: [] }"
    assert ph in src, 'shared.js lost its data placeholder'
    if not presence:
        s, e = src.index('// ---- whereabouts ('), src.index('// ---- end of whereabouts')
        src = src[:s] + src[src.index('\n', e) + 1:]
    return src.replace(ph, json.dumps(data, ensure_ascii=False, separators=(',', ':')))


def presence_data(npcs, locs):
    """1.47.0 (audit 3.8): the data shared.js whereabouts / presenceAt read, for the engine (it writes $ui.here for <now>) and the
    Map panel. reg: place key -> regulars (the name, the name without "the", the id in words); stu: Halvard student -> [lorebook
    year, campaign year they arrive, dorm]; arr: NPC -> campaign year they arrive (later cohorts only); teach, tt: class_data;
    clubv: place key -> [club, members, all its venues outdoors, the Fishing Club]; outd: outdoor place keys; vn: place key -> name."""
    norm = lambda s: re.sub(r'^the ', '', s.strip().lower())
    reg = {}
    for lid, l in locs.items():
        if not l['regulars']: continue
        for k in sorted({l['name'].lower(), re.sub(r'^the ', '', l['name'].lower()), lid.replace('_', ' ')}):
            reg[k] = l['regulars']
    reg['main courtyard'] = locs['courtyards']['regulars']
    stu = {nid: [n['year'], n.get('arrives', 1), n.get('dorm') or ''] for nid, n in sorted(npcs.items()) if re.match(r'^Year \d$', n.get('group') or '') and n.get('year')}
    tt, teach, _clubs = class_data(npcs, locs)
    out_ids = outdoor_ids(locs)
    clubv = {}
    for c in load_clubs(npcs, locs):
        allout = all(v in out_ids for v in c['venues'])
        for v in c['venues']:
            clubv.setdefault(norm(locs[v]['name']), []).append([c['name'], c['members'], allout, c['key'] == 'Fishing'])
    # 1.52.0 (owner-approved planning/DRAFT_npc_routines.md, feature batch 4): weekly routines, rt: NPC -> [[days, from, to (minutes),
    # place key, map name, what they do, the "Mon-Fri 16:00-18:00" label]], rate: the % chance a routine holds on a day (shared roll100)
    R = json.load(open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'npc_routines.json'), encoding='utf-8'))
    W = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    def days(spec):
        if '-' in spec:
            a, b = (W.index(x.strip()) for x in spec.split('-'))
            return [W[(a + i) % 7] for i in range((b - a) % 7 + 1)]
        return [W[W.index(x.strip())] for x in spec.split(',')]
    byname = {l['name']: l['name'] for l in locs.values()}
    mins = lambda s: int(s[:2]) * 60 + int(s[3:])
    rt = {}
    for nid, rows in R['npcs'].items():
        assert nid in npcs and not nobond(npcs[nid]), nid
        for d, f, to, place, what in rows:
            assert place in byname and mins(f) < mins(to), (nid, place, f, to)
            rt.setdefault(nid, []).append([days(d), mins(f), mins(to), norm(place), place, what, f"{d.replace('-', '–')} {f}–{to}"])
    return {'reg': reg, 'stu': stu, 'arr': {k: v['arrives'] for k, v in npcs.items() if v.get('arrives', 1) > 1}, 'teach': teach, 'tt': tt, 'clubv': clubv,
            'outd': sorted({norm(k) for lid in out_ids for k in place_keys(locs[lid], lid)}), 'vn': {norm(l['name']): l['name'] for l in locs.values()},
            'rt': rt, 'rate': R['rate'], 'ct': contest_data(stu)}


def contest_data(stu):
    """1.82.0 (planning/DRAFT_event_frame.md section 3): the Dorm Competition data the shared contest section reads as PD.ct
    (data/event_frame.json contest without its notes), checked: every role names a Halvard student and a combat role, every pin a
    student, every role a format."""
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ef = json.load(open(os.path.join(root, 'data/event_frame.json'), encoding='utf-8'))
    ct = {k: v for k, v in ef['contest'].items() if not k.startswith('_')}
    # 1.83.0: the break stayers and the Fools Day draw ride along (planning/DRAFT_event_frame.md 4.2, 4.3)
    ct['breaks'] = {k: v for k, v in ef['breaks'].items() if not k.startswith('_')}
    ct['fools'] = {k: v for k, v in ef['fools'].items() if not k.startswith('_')}
    assert all(nid in stu for nid in ct['breaks']['stay']) and 0 <= ct['breaks']['chance'] <= 100, 'event_frame.json breaks'
    roles5 = {'Attack', 'Defense', 'Healing', 'Support', 'Control'}
    assert all(nid in stu and r in roles5 for nid, r in ct['roles'].items()), 'event_frame.json contest.roles: a non-student or an unknown role'
    assert all(nid in stu for nid in ct['pins']), 'event_frame.json contest.pins: not a Halvard student'
    assert set(ct['dorm']['format']) == roles5 == set(ct['dorm']['quota']), 'event_frame.json contest.dorm: every role needs a format and a quota'
    assert all(len(ct['dorm']['times'][f]) >= 1 for f in ('knockout', 'heats')), 'event_frame.json contest.dorm.times'
    # 1.84.0 (planning/DRAFT_kingdom_competition.md): the Kingdom Competition's rounds, and the rival teams from data/npcs.json
    # (academy: [[id, team role, lorebook school year]]); its places are Avalon's (kc 1: the Kingsmeadow, kc 2: the Undercroft)
    kd = {k: v for k, v in ef['kingdom'].items() if not k.startswith('_')}
    npcs = json.load(open(os.path.join(root, 'data/npcs.json'), encoding='utf-8'))
    kd['rivals'] = {}
    for nid, n in sorted(npcs.items()):
        if (n.get('group') or '').endswith('team') and n.get('team_role'):
            kd['rivals'].setdefault(n['academy'], []).append([nid, n['team_role'], n['year']])
    av = {p['id']: p for p in json.load(open(os.path.join(root, 'data/avalon.json'), encoding='utf-8'))['places']}
    assert kd['teams'][0] == 'Halvard' and set(kd['teams'][1:]) == set(kd['rivals']), 'event_frame.json kingdom.teams: Halvard and the rival academies'
    assert all(len(v) == 4 and {r for _i, r, _y in v} <= roles5 for v in kd['rivals'].values()), 'npcs.json: a rival team needs four members with combat roles'
    assert set(kd['tactic']) == set(kd['teams']) and set(kd['tactic'].values()) <= set(kd['tact']), 'event_frame.json kingdom.tactic'
    assert all(any(nid == x[0] for v in kd['rivals'].values() for x in v) for nid in kd['pins']), 'event_frame.json kingdom.pins: not a rival team member'
    R1, R2 = kd['r1'], kd['r2']
    assert all(av.get(i, {}).get('kc') == 1 for i in [R1['pavilion'], *R1['spots']]) and len(R1['spots']) >= R1['flowers'], 'event_frame.json kingdom.r1: not a Kingsmeadow place'
    assert all(av.get(i, {}).get('kc') == 2 for i in [R2['gates'], *(r for r, _g in R2['rooms'])]), 'event_frame.json kingdom.r2: not an Undercroft place'
    assert all(g in R2['beasts'] and g in R2['boss'] for _r, g in R2['rooms']) and R2['win'] * 2 <= len(R2['rooms']) < R2['win'] * 3, 'event_frame.json kingdom.r2: grades, or rooms for exactly two holders'
    ct['kingdom'] = kd
    # 1.97.4 (planning/DRAFT_world_competition.md §1b, §3): the World Competition. The foreign fours are their team entries' Team lines
    # (the generated lore: "Name (Role, Y<n>, ...)"); a standout with its own NPC entry goes by its id. magic: the magic type (the
    # Magic field's first word) of every competitor the World panel may pick (Halvard students, the Kingdom rivals); rel: the
    # relations among them (data/relations.json), for the panel's synergy.
    wd = {k: v for k, v in ef['world'].items() if not k.startswith('_')}
    cal = json.load(open(os.path.join(root, 'data/calendar.json'), encoding='utf-8'))
    ev = next(e for e in cal['events'] if e.get('id') == wd['event'] and e['w'] == wd['w'])
    assert ev['m'] == wd['m'] and ev['d'][0] == wd['draw'][0], 'event_frame.json world: m / w / draw against the calendar'
    assert wd['teams'][0] == 'Eldrasil' and set(wd['tactic']) == set(wd['teams']) and set(wd['tactic'].values()) <= set(wd['tact']), 'event_frame.json world.tactic'
    assert set(wd['favour']) == set(wd['teams'][1:]), 'event_frame.json world.favour: every foreign four'
    byname = {n['name']: nid for nid, n in npcs.items() if n.get('group') == 'World teams'}
    cdir = os.path.join(root, 'src/worldbook/content')
    wd['rivals'] = {}
    for f in sorted(os.listdir(cdir)):
        txt = open(os.path.join(cdir, f), encoding='utf-8').read()
        m = re.match(r'^\[(\w+) team\]\nTeam: (.+)', txt)
        if not m or m.group(1) not in wd['teams']: continue
        team = []
        for seg in re.split(r';\s*(?![^()]*\))', m.group(2).rstrip('.')):
            x = re.match(r'^\s*(.+?) \((Attack|Defense|Healing|Support|Control), Y([123])\b', seg)
            assert x, ('world team line', f, seg)
            team.append([byname.get(x.group(1), x.group(1)), x.group(2), int(x.group(3))])
        wd['rivals'][m.group(1)] = team
    assert set(wd['rivals']) == set(wd['teams'][1:]) and all(len(v) == 4 and len({r for _i, r, _y in v}) == 4 for v in wd['rivals'].values()), 'world teams: four members with four roles each'
    assert all(any(nid == x[0] for v in wd['rivals'].values() for x in v) for nid in wd['pins']), 'event_frame.json world.pins: not a World team member'
    cands = set(stu) | {x[0] for v in kd['rivals'].values() for x in v}
    magic = {}
    for nid in sorted(cands):
        f = next((f['text'] for f in npcs.get(nid, {}).get('fields', []) if f['label'].split(' (')[0] == 'Magic'), '')
        t = re.match(r'^(Elemental|Mystic|Spiritual|Occult|Divine)\b', f)
        if t: magic[nid] = t.group(1)
    wd['magic'] = magic
    PN = wd['panel']
    assert all(c[0] in cands for c in PN['counter']), 'event_frame.json world.panel.counter: not a Kingdom competitor'
    wd['rel'] = sorted({(e['from'], e['to'], e['type']) for e in json.load(open(os.path.join(root, 'data/relations.json'), encoding='utf-8'))
                        if not e.get('rule') and e['type'] in PN['rel'] and e['from'] in cands and e['to'] in cands})
    wd['rel'] = [list(x) for x in wd['rel']]
    ct['world'] = wd
    # 1.86.0 (planning/DRAFT_event_frame.md 4.7): Founder Day's hunt, its places [place key, name] (campus places with lore)
    hu = {k: v for k, v in ef['hunt'].items() if not k.startswith('_')}
    locs = json.load(open(os.path.join(root, 'data/locations.json'), encoding='utf-8'))
    assert all(x in locs for x in hu['exclude']), 'event_frame.json hunt.exclude: not a location'
    hu['places'] = [[re.sub(r'^the ', '', l['name'].lower()), l['name']] for i, l in sorted(locs.items()) if l.get('lore') and i not in hu['exclude']]
    assert len(hu['places']) >= hu['stops'] * 2, 'event_frame.json hunt: too few places'
    del hu['exclude']
    ct['hunt'] = hu
    # 1.87.0 (planning/DRAFT_event_frame.md 3.1, release C): the tally format, its clubs as members (data/npcs.json through load_clubs)
    npcs_all = json.load(open(os.path.join(root, 'data/npcs.json'), encoding='utf-8'))
    clubs = {c['name']: c['members'] for c in load_clubs(npcs_all, locs)}
    ct['tally'] = {}
    for k, v in ef['tally'].items():
        if k.startswith('_'): continue
        assert all(x in clubs for x in v['clubs']), f'event_frame.json tally.{k}: unknown club'
        ct['tally'][k] = {**{x: y for x, y in v.items() if x != 'clubs'}, 'members': sorted({m for x in v['clubs'] for m in clubs[x] if m in stu})}
    return ct


def campus_map(locs, pins):
    """1.47.0 (audit 3.2): the campus as an Area for the engine (AR.campus): every place its own node with its floors, the walking
    legs of data/locations.json near (each pair once, minutes), the Campus Map's pins (label, places), the dorm-room places every
    dorm shares (walked from {{user}}'s own dorm), and each dorm's place."""
    legs = sorted({tuple(sorted((a, b))) + (w,) for a, l in locs.items() for b, w in l.get('near') or [] if b in locs})
    shared = sorted(i for i in locs if sum(i in p['cluster'] for p in pins) > 1)
    return {'area': 'Halvard', 'places': [{'id': i, 'name': l['name'], 'pin': i, **({'floor': l['floor'], 'floors': l['floors']} if l.get('floors') else {})} for i, l in sorted(locs.items())],
            'pins': [{'id': i, 'name': l['name']} for i, l in sorted(locs.items())], 'legs': [list(x) for x in legs],
            'map': [[p['label'], [i for i in p['cluster'] if i not in shared]] for p in pins], 'shared': shared,
            'dorms': {d: f'{d.lower()}_dormitory' for d in ('Fire', 'Light', 'Sky', 'Viridian') if f'{d.lower()}_dormitory' in locs}}


# 1.6.0 (N13): the age of a dated line ("M2 W1 Tue ..." or "M2 W1") against the world clock, in words; unreadable -> ''.
# One campus year is 12 months x 4 weeks x 7 days. 1.7.4: a line dated with its year ("Y1 M2 W1 Tue", the engine's form from campaign
# Year 2) is aged exactly ("over a year ago"; a date still ahead gets no age); a line without a year is from the last 12 months.
AGE_JS = ("const fxWords = fx => { const s = String(fx || ''), w = []; if (/Rank \\d+ → /.test(s)) w.push('grew closer'); else if (/Rank fell/.test(s)) w.push('drifted apart'); if (/Trust −/.test(s)) w.push('trust shaken'); else if (/Trust \\+/.test(s)) w.push('trust grew'); if (/Tension \\+/.test(s)) w.push('tension rose'); else if (/Tension −/.test(s)) w.push('tension eased'); if (/romance/.test(s)) w.push('romance began'); return w.join(', '); };   // 1.56.0 (U2): a moment's effect in words, never numbers\n"
          "const ageOf = (w, W) => { const m = /(?:Y(\\d+) )?M(\\d{1,2}) W([1-4])(?: (Mon|Tue|Wed|Thu|Fri|Sat|Sun))?/.exec(String(w || '')); if (!m || !W || !W.Month) return '';"
          " const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], di = Math.max(0, D.indexOf(W.Day)), Y = Math.max(1, Number(W.Year) || 1), yl = m[1] ? Math.max(1, +m[1]) : Y;"
          " const far = n => (n < 2 ? 'over a year ago' : 'over ' + n + ' years ago');"
          " if (!m[4]) { let k = ((Y - 1) * 48 + (W.Month - 1) * 4 + W.Week - 1) - ((yl - 1) * 48 + (+m[2] - 1) * 4 + +m[3] - 1); if (k < 0) { if (m[1]) return ''; k += 48; } if (k >= 48) return far(Math.floor(k / 48));"
          " return k === 0 ? 'this week' : k === 1 ? 'last week' : k < 4 ? k + ' weeks ago' : k < 8 ? 'last month' : Math.floor(k / 4) + ' months ago'; }"
          " let d = ((Y - 1) * 336 + (W.Month - 1) * 28 + (W.Week - 1) * 7 + di) - ((yl - 1) * 336 + (+m[2] - 1) * 28 + (+m[3] - 1) * 7 + D.indexOf(m[4])); if (d < 0) { if (m[1]) return ''; d += 336; } if (d >= 336) return far(Math.floor(d / 336));"
          " return d === 0 ? 'earlier today' : d === 1 ? 'yesterday' : d < 7 ? d + ' days ago' : d < 14 ? 'last week' : d < 28 ? Math.floor(d / 7) + ' weeks ago' : d < 56 ? 'last month' : Math.floor(d / 28) + ' months ago'; };")

def now_data(npcs):
    """1.48.0 (audit 3.11): the data <now>'s engine-made lines read (engine NOW_D): BOND, TRUST, TENSION (bands, categories, personal
    texts), WENDIGO, AVALON (the carriage fare, the rival students), SUNREACH (fares, the bet limit, who may be met)."""
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    _p = lambda *a: os.path.join(root, *a)
    # 1.2.2 bonds: what a present NPC shares at their rank, what the rank allows, the event text
    # 1.89.0 (info layers): what they share is their own dossier fields by rank ([rank, lore heading, from campaign year]), the same
    # data the dossier opens (tools/curate_data.py); story-only secrets (99) and the unlabelled Notes are left out
    BR = json.load(open(_p('data/bond_rules.json'), encoding='utf-8'))
    OPN = json.load(open(_p('data/bond_openness.json'), encoding='utf-8'))
    tag = {nid: t for t in ('open', 'guarded', 'closed') for nid in OPN[t]}
    assert all(nid in npcs for nid in tag), [nid for nid in tag if nid not in npcs]
    flds = {nid: [[f['rank'], re.sub(r'\s*\(.*\)$', '', f['label']), f.get('year', 0)] for f in n['fields'] if f['rank'] < 99 and f['label'] != 'Notes']
            for nid, n in sorted(npcs.items())}
    BOND = {'fields': flds, 'seen': BR['layers']['seen'], 'perks': BR['perks'], 'recent_now': BR['recent']['now'], 'tag': tag}
    # 1.4.3 Trust for the Now entry: bands, share shifts, perk gates, category texts (category = openness), personal rules, Dorm Heads
    _tru = json.load(open(_p('data/trust.json'), encoding='utf-8'))
    TRUST = {'bands': _tru['bands'], 'share': _tru['effects']['share'], 'gates': _tru['perk_gates'],
             'susp': _tru['suspend_r10_below'], 'cats': {k: {'name': v['name'], 'bands': v['bands'], 'never': v['never']} for k, v in _tru['categories'].items()},
             'npcs': {nid: tag for tag in ('open', 'guarded', 'closed') for nid in OPN[tag]},
             'overrides': {k: {x: o[x] for x in ('text', 'until_secret', 'no_gates') if x in o} for k, o in _tru['overrides'].items() if o.get('text') or o.get('no_gates')},
             'dorm_head': {k: {x: v[x] for x in ('dorm', 'category', 'text')} for k, v in _tru['dorm_head'].items()}}
    # 1.41.0: Sunreach Bay for <now>: fares, the bet limit, and the names of everyone who may be met there
    _srd = json.load(open(_p('data/sunreach.json'), encoding='utf-8'))
    SRD = {**{k: _srd['rates'][k] for k in ('carriage', 'boat', 'tour', 'bet_max')},
           'names': {nid: [npcs[nid]['name'], npcs[nid]['group'].replace(' team', '') if npcs[nid].get('group', '').endswith('team') else 'Halvard']
                     for g in _srd['meet'].values() for nid in g}}
    return {'BOND': BOND, 'TRUST': TRUST, 'SUNREACH': SRD,
            'TENSION': {k: v for k, v in json.load(open(_p('data/tension.json'), encoding='utf-8')).items() if k in ('bands', 'categories', 'npcs', 'peaks', 'overrides', 'apology_npc')},
            'WENDIGO': {'line': json.load(open(_p('data/expedition.json'), encoding='utf-8'))['wendigo']['line']},
            'AVALON': {'fare': json.load(open(_p('data/avalon.json'), encoding='utf-8'))['rates']['ride_coin'],
                       'rivals': {nid: [n['name'], n['group'].replace(' team', ''), n['year']] for nid, n in sorted(npcs.items()) if (n.get('group') or '').endswith('team')}}}


_DATA_REF = re.compile(r'\{@([a-z_]+)\.([A-Za-z0-9_.]+)(?::([a-z]+))?\}')
_DAY_FULL = {'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday'}


def fill_data(text):
    """1.43.0 (audit batch 2, 2.8): a player- or narrator-facing text names its numbers and times as {@file.path} (data/<file>.json,
    list indices as numbers), so the text follows the data. Formats: {@…:n} 5,000; {@…:day} Sat -> Saturday; {@…:nextday} Thu ->
    Friday; {@…:clock} 12:00 -> noon; {@…:pctoff} 0.9 -> 10%; {@…:times} 2 -> double."""
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cache = {}
    def sub(m):
        f, path, fmt = m.group(1), m.group(2), m.group(3)
        if f not in cache: cache[f] = json.load(open(os.path.join(root, 'data', f + '.json'), encoding='utf-8'))
        v = cache[f]
        for part in path.split('.'): v = v[int(part)] if isinstance(v, list) else v[part]
        if fmt == 'n': return f'{v:,}'
        if fmt == 'day': return _DAY_FULL[v]
        if fmt == 'nextday': d = list(_DAY_FULL); return _DAY_FULL[d[(d.index(v) + 1) % 7]]
        if fmt == 'clock': return 'noon' if v == '12:00' else 'midnight' if v == '00:00' else v
        if fmt == 'pctoff': return f'{round((1 - v) * 100)}%'
        if fmt == 'times': return {2: 'double', 3: 'triple'}.get(v, f'{v} times as much')
        assert fmt is None, f'unknown data format {fmt}'
        return str(v)
    out = _DATA_REF.sub(sub, text)
    assert '{@' not in out, 'a data reference was not filled: ' + out[out.index('{@'):][:60]
    return out
