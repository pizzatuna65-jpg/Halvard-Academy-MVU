#!/usr/bin/env python3
"""Shared data helpers for the generators (v1.1.0). Single source for club membership and outdoor places."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

CLUB_NAME = {'Theatre': 'Theatre Troupe', 'Newspaper': 'Academy Newspaper', 'Divination': 'Divination Society', 'Alchemy': 'Alchemy Circle',
             'Festival Committee': 'Festival Committee', 'Library Assistants': 'Library Assistants', 'Groundskeeping': 'Groundskeeping',
             'Medical Centre Volunteers': 'Medical Centre Volunteers', 'Warding Study': 'Warding Study Group'}
# 1.2.0: Archery, Swimming, Gymnastics and Basketball are sport clubs (owner map review; lore: sport clubs ban magic in play)
SPORT = {'Soccer', 'Running', 'Duelling', 'Archery', 'Swimming', 'Gymnastics', 'Basketball'}   # practise informally after 16:00 (lore Clubs); magic is banned only in sport clubs (not Duelling)

def load_clubs(npcs, locs):
    """Clubs from location club lists + NPC 'Club' fields (was inline in gen_ui.py, Batch 5.2)."""
    clubs = {}
    for lid, l in locs.items():
        for c in l['clubs']:
            base = re.sub(r'\s*\(.*\)$', '', c)
            clubs.setdefault(base, {'venues': []})['venues'].append(lid)
    for base, c in clubs.items():
        c.update(name=CLUB_NAME.get(base, base + ' Club'), key=base, sport=base in SPORT and base != 'Duelling', practice=base in SPORT, members=[], advisors=[])
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
               'club room': 'Club Rooms', 'potion hall': 'Potion Halls', 'meditation room': 'Meditation Rooms / Spirit House',
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
