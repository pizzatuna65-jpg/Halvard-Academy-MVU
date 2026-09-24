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
