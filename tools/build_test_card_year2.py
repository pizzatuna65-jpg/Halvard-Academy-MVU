#!/usr/bin/env python3
"""1.7.5 (owner, 2026-09-27: "buat character card test yg memulai campaign sebagai year 2 dengan bond bervariasi (bond hasil year 1
biarkan new student masih kosong)"): a separate TEST card that starts on the first morning of campaign Year 2, the Entrance Event,
with {{user}} a Year 2 student and bonds of different ranks, Trust and Tension from Year 1. The new first-years (cohort 2) have no
bond yet. Graduation is left to the engine: on the first update it sends Year 1's third-years away (Etnie stays) and journals the
new first-years. Register in the Builder first; the engine then puts {{user}} in the dorm the Arbiter Stone read in Year 1.
Run after build/build_card.py. Output: dist/test/Eldrasil_TEST_Year2.png (+ .json). Usage: python tools/build_test_card_year2.py

The lorebook name differs from the real card's (and the Rank 7 TEST card's): the card installs its lorebook by that name."""
import base64, copy, json, os, struct, zlib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
NAME = 'Eldrasil — TEST Year 2'

v3 = json.load(open(P('dist/Eldrasil_Halvard.json'), encoding='utf-8'))
npcs = json.load(open(P('data/npcs.json'), encoding='utf-8'))
REW = json.load(open(P('data/bond_rewards.json'), encoding='utf-8'))['npcs']
# id: (Rank, Trust, Tension, Title, one known fact, the Year 1 milestone). Year 1 students (some graduated since), staff and Doves;
# never cohort 2 (they arrive today) or a rival team (no bonds).
BONDS = {
    'Etnie':    (6, 85, 0,  'Big Sister', 'Repeated her second year after the breach.', 'Decided {{user}} is her little sibling.'),
    'Saffi':    (5, 72, 0,  '', 'Runs before breakfast, every day, in any weather.', 'Dragged {{user}} round the Sports Field until both collapsed.'),
    'Gareth':   (5, 70, 0,  '', 'Heir to the Valkaryn house.', 'Sparred with {{user}} during Training Week.'),
    'Aiden':    (4, 62, 10, '', 'Runs the Tally betting book.', 'Lost a bet to {{user}} and paid in full.'),
    'Kanae':    (4, 60, 0,  '', 'Reads fortunes for anyone who asks.', 'Read {{user}}\'s fortune twice in one week.'),
    'Trixie':   (3, 66, 0,  '', 'Her family\'s circus visits in Month 8.', 'Took {{user}} backstage at the Traveling Circus.'),
    'Zara':     (3, 55, 0,  '', 'One of the Sky outcasts in the Gardens.', 'Shared a quiet lunch in the Gardens.'),
    'Irene':    (3, 58, 25, '', 'Was Council President.', 'Gave {{user}} a detention, then a warning, then a nod.'),
    'Ruby':     (3, 64, 0,  '', 'Everyone tells her things.', 'Traded rumours over tea.'),
    'Yvette':   (3, 60, 0,  '', 'Head of the Fire Dormitory.', 'Kept {{user}} after Magic Theory to talk.'),
    'Castor':   (2, 50, 0,  '', 'Easy to forget, somehow.', 'Sat next to {{user}} for a month before either noticed.'),
    'Royhan':   (2, 52, 0,  '', 'Sells potions for points.', 'Bought a healing draught from him.'),
    'Vera':     (2, 50, 15, '', 'Brews to see what happens.', 'Survived one of her experiments.'),
    'Gavlan':   (2, 48, 0,  '', 'Taught first-year Combat.', 'Assigned {{user}} a combat role.'),
    'Milena':   (2, 55, 0,  '', 'Teaches Dark Magic Defense to every year.', 'Stayed after her class to ask about the Doves.'),
    'Caralynn': (1, 40, 45, '', 'Top of the first-year Fire ranking.', 'Outshone her in Magic Theory; she has not forgiven it.'),
    'Florian':  (1, 35, 55, '', 'Third in the Sky ranking.', 'A public argument in the Canteen.'),
    'Alyssa':   (1, 50, 0,  '', 'Writes everything in her notebook.', 'She did not remember meeting {{user}} the week before.'),
    'Krieg':    (1, 30, 20, '', 'Dovecote Commander.', 'Questioned {{user}} once, politely.'),
}
for k in BONDS:
    assert k in npcs and npcs[k].get('arrives', 1) == 1 and not (npcs[k].get('group') or '').endswith('team'), k
q = lambda s: json.dumps(s, ensure_ascii=False)

d = copy.deepcopy(v3['data'])
d['name'] = NAME
d['extensions']['world'] = NAME
d['character_book']['name'] = NAME
d['tags'] = ['TEST'] + [t for t in d.get('tags', []) if t != 'TEST']
d['creator_notes'] = (f'TEST CARD, not for play: the campaign starts in Year 2 (Month 1 Week 1 Monday, the Entrance Event) with {{{{user}}}} a '
                      f'second-year and {len(BONDS)} bonds from Year 1 at Ranks 1-6 (three of them now graduated). The new first-years have no '
                      f'bond yet. Its lorebook is "{NAME}", separate from the real card\'s. Built from card {d.get("character_version")}.\n\n'
                      + d.get('creator_notes', ''))
d['first_mes'] = (
    '*[TEST CARD — campaign Year 2. Register your student in the Builder first (set your age to 19): your dorm follows your dominant '
    'magic, as the Arbiter Stone read it a year ago. Bonds from Year 1 are already there; the new first-years are strangers.]*\n\n'
    'You come back through the gatehouse a little after seven, and Halvard looks exactly the way you left it, which is '
    'somehow the strange part. The Bell Tower, the gatehouse, the smell of the Canteen ovens drifting across the Main Courtyard.\n\n'
    'What has changed is you. Last year you stood at this gate with a trunk and no idea where anything was. This year the gatekeeper '
    'barely glances at your bracelet before he waves you through, and a harried member of staff presses a slip of paper into your hand '
    'on the way in: *Senior guide, group seven. Collect four first-years after the sorting, 10:00, Main Courtyard.*\n\n'
    'Across the courtyard the new ones are already arriving, in uniforms that still have the fold lines in them, trunks on their '
    'shoulders, trying very hard not to look lost. Some of the faces you would have looked for are not here any more: last year\'s '
    'third-years left by airship the morning after Graduation.\n\n'
    '*Year 2, Month 1, Week 1, Monday, 07:30. Reception and Gatehouse.*')

e500 = next(e for e in d['character_book']['entries'] if e['id'] == 500)
c = e500['content']
def rep(old, new):
    global c
    assert c.count(old) == 1, old
    c = c.replace(old, new)
rep('World:\n  Year: 1\n', 'World:\n  Year: 2\n')
rep('    Age: 18\n', '    Age: 19\n')
rep('    Year: 1\n    Dorm: Unsorted\n', '    Year: 2\n    Dorm: Unsorted\n')
rep('    Points: 300\n', '    Points: 1450\n')
rep('      - "+300 starting allowance (first-year)"\n', '      - "+300 starting allowance (first-year)"\n      - "Year 1: payouts, prizes and spending (test card)"\n')
rep('  - "[M1 W1 Mon] Arrived at Halvard Academy as a first-year."\n',
    '  - "[Y1 M1 W1 Mon] Arrived at Halvard Academy as a first-year."\n'
    '  - "[Y1 M3 W4 Sat] Fought in the Dorm Competition."\n'
    '  - "[Y1 M6 W3 Sat] Sports Day: no magic, a lot of mud."\n'
    '  - "[Y1 M9 W3 Sat] Academy Founder Day."\n'
    '  - "[Y1 M11 W4 Sun] Watched the third-years graduate."\n'
    '  - "[Y2 M1 W1 Mon] Back at Halvard for Year 2, as a senior guide at the Entrance Event."\n')
lines = ['Bonds:']
for k, (rank, trust, ten, title, fact, ms) in BONDS.items():
    lines += [f'  {k}:', f'    Rank: {rank}', f'    Trust: {trust}', f'    Tension: {ten}', f'    Title: {q(title)}', '    Romance: false',
              '    Known_facts:', f'      - {q(fact)}', '    Milestones:', f'      - {q("Year 1: " + ms)}', '    Last_seen: "Y1 M11 W4 Sun"']
rep('\nBonds: {}\n', '\n' + '\n'.join(lines) + '\n')
# Rank 5 gifts already given in Year 1 (the engine records a gift when the 4->5 event is played; here it was played last year)
perks = ['_Perks:']
for k, (rank, *_rest) in BONDS.items():
    g = (REW.get(k) or {}).get('gift')
    if rank >= 5 and g:
        perks += [f'  {q(g["name"])}:', f'    From: {k}', '    Kind: gift',
                  f'    Effect: {q(g["text"] + (" <narrator_only>" + g["secret"] + "</narrator_only>" if g.get("secret") else ""))}', f'    Uses: {g.get("uses", 0)}']
assert len(perks) > 1
rep('\n$eng:\n', '\n' + '\n'.join(perks) + '\n$eng:\n')
e500['content'] = c

v3 = {**v3, 'data': d}
v2 = dict(name=NAME, description=d['description'], personality='', scenario=d.get('scenario', ''), first_mes=d['first_mes'], mes_example='',
          creatorcomment=d['creator_notes'], avatar='none', talkativeness='0.5', fav=False, tags=d['tags'], spec='chara_card_v2', spec_version='2.0', data=d)

def chunk(t, body):
    cc = t + body
    return struct.pack('>I', len(body)) + cc + struct.pack('>I', zlib.crc32(cc) & 0xffffffff)
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
os.makedirs(P('dist/test'), exist_ok=True)
open(P('dist/test/Eldrasil_TEST_Year2.png'), 'wb').write(b''.join(out))
with open(P('dist/test/Eldrasil_TEST_Year2.json'), 'w', encoding='utf-8', newline='\n') as f: json.dump(v3, f, ensure_ascii=False, indent=1)
print(f'test card: {NAME} | {len(BONDS)} Year 1 bonds, {len(perks) // 5} gifts | dist/test/Eldrasil_TEST_Year2.png')
