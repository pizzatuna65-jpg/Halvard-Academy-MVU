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


def shared_js():
    """1.43.0 (audit batch 2): src/scripts/shared.js with its data filled in (data/calendar.json), for the engine, the panels,
    the bracelet and the <now> entry (each template marks the spot with a SHARED placeholder)."""
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cal = json.load(open(os.path.join(root, 'data/calendar.json'), encoding='utf-8'))
    data = {k: cal[k] for k in ('periods', 'exam_months', 'seasons', 'dorm_colors')}
    data['trips'] = [{'m': e['m'], 'w': e['w'], 'd': e['d'][0], 'name': e['trip']} for e in cal['events'] if e.get('trip')]
    src = open(os.path.join(root, 'src/scripts/shared.js'), encoding='utf-8').read()
    ph = "/*@@SHARED_DATA@@*/{ periods: [], exam_months: [], seasons: [], trips: [], dorm_colors: {} }"
    assert ph in src, 'shared.js lost its data placeholder'
    return src.replace(ph, json.dumps(data, ensure_ascii=False, separators=(',', ':')))


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
