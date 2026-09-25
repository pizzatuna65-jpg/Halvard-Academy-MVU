#!/usr/bin/env python3
"""1.4.0 (owner): a separate TEST card for checking People → Connections in SillyTavern: the built card, renamed, with its own
lorebook name, whose starting state has every bonded NPC already at Rank 7. Run after build/build_card.py.
Output: dist/test/Eldrasil_TEST_Rank7.png (+ .json). Usage: python tools/build_test_card.py [rank=7]

The lorebook name must differ from the real card's: the card installs its lorebook by that name (ensureLorebook, 1.3.6), so a
shared name would offer to overwrite the real lorebook with this one."""
import base64, copy, json, os, re, struct, sys, zlib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
RANK = int(sys.argv[1]) if len(sys.argv) > 1 else 7
NAME = f'Eldrasil — TEST Rank {RANK}'

v3 = json.load(open(P('dist/Eldrasil_Halvard.json'), encoding='utf-8'))
npcs = json.load(open(P('data/npcs.json'), encoding='utf-8'))
bonded = sorted(k for k, n in npcs.items() if not (n.get('group') or '').endswith('team'))   # rival academy teams have no bonds
d = copy.deepcopy(v3['data'])
d['name'] = NAME
d['extensions']['world'] = NAME
d['character_book']['name'] = NAME
d['tags'] = ['TEST'] + [t for t in d.get('tags', []) if t != 'TEST']
d['creator_notes'] = (f'TEST CARD, not for play: every bonded character ({len(bonded)}) starts at Rank {RANK} with you, to check People → Connections '
                      f'and the dossiers. Its lorebook is "{NAME}", separate from the real card\'s. Built from card {d.get("character_version")}.\n\n' + d.get('creator_notes', ''))
d['first_mes'] = (f'*[TEST CARD — every bond starts at Rank {RANK}. Open People → Connections. You can also register a student in the Builder first.]*\n\n'
                  + d['first_mes'])
# the starting state: all bonds at RANK (their Rank 5 milestone reputation counts as already paid by the engine's migration)
e500 = next(e for e in d['character_book']['entries'] if e['id'] == 500)
assert '\nBonds: {}\n' in e500['content'], 'initvar 500 has no empty Bonds block'
lines = ['Bonds:']
for k in bonded:
    lines += [f'  {k}:', f'    Rank: {RANK}', '    Trust: 70', '    Tension: 0', '    Title: ""', '    Romance: false', '    Known_facts: []',
              '    Milestones:', f'      - "Test card: started at Rank {RANK}"', '    Last_seen: ""']
e500['content'] = e500['content'].replace('\nBonds: {}\n', '\n' + '\n'.join(lines) + '\n')
v3 = {**v3, 'data': d}
v2 = dict(name=NAME, description=d['description'], personality='', scenario=d.get('scenario', ''), first_mes=d['first_mes'], mes_example='',
          creatorcomment=d['creator_notes'], avatar='none', talkativeness='0.5', fav=False, tags=d['tags'], spec='chara_card_v2', spec_version='2.0', data=d)

def chunk(t, body):
    c = t + body
    return struct.pack('>I', len(body)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
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
open(P(f'dist/test/Eldrasil_TEST_Rank{RANK}.png'), 'wb').write(b''.join(out))
with open(P(f'dist/test/Eldrasil_TEST_Rank{RANK}.json'), 'w', encoding='utf-8', newline='\n') as f: json.dump(v3, f, ensure_ascii=False, indent=1)
print(f'test card: {NAME} | {len(bonded)} bonds at Rank {RANK} | dist/test/Eldrasil_TEST_Rank{RANK}.png')
