#!/usr/bin/env python3
"""1.17.0 (planning/AUDIT_2026-09-29.md T6, an experiment): a TEST card whose keyword lore entries (every non-constant entry below
uid 500: NPCs, places, events) are injected at depth 2 instead of before/after the character. The prompt before the chat history
then changes only with the calendar and the rules, so the provider's prompt cache can cover the history too. Compare the cached
token counts (and the story quality) with the real card in SillyTavern before adopting it. Run after build/build_card.py.
Output: dist/test/Eldrasil_TEST_LoreDepth.png (+ .json). Its lorebook has its own name (the card installs its lorebook by name)."""
import copy, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import P, write_card_png
NAME, DEPTH = 'Eldrasil — TEST Lore at depth', 2
v3 = json.load(open(P('dist/Eldrasil_Halvard.json'), encoding='utf-8'))
d = copy.deepcopy(v3['data'])
d['name'] = d['extensions']['world'] = d['character_book']['name'] = NAME
d['tags'] = ['TEST'] + [t for t in d.get('tags', []) if t != 'TEST']
d['creator_notes'] = (f'TEST CARD (audit T6): keyword lore at depth {DEPTH} instead of before/after the character, to compare prompt caching '
                      f'with the real card. Its lorebook is "{NAME}". Built from card {d.get("character_version")}.\n\n' + d.get('creator_notes', ''))
moved = 0
for e in d['character_book']['entries']:
    if e['id'] < 500 and not e['constant'] and e['enabled']:
        e['extensions']['position'], e['extensions']['depth'], e['extensions']['role'] = 4, DEPTH, 0
        moved += 1
v3 = {**v3, 'data': d}
v2 = dict(name=NAME, description=d['description'], personality='', scenario=d.get('scenario', ''), first_mes=d['first_mes'], mes_example='',
          creatorcomment=d['creator_notes'], avatar='none', talkativeness='0.5', fav=False, tags=d['tags'], spec='chara_card_v2', spec_version='2.0', data=d)
os.makedirs(P('dist/test'), exist_ok=True)
write_card_png(v2, v3, P('dist/test/Eldrasil_TEST_LoreDepth.png'))
with open(P('dist/test/Eldrasil_TEST_LoreDepth.json'), 'w', encoding='utf-8', newline='\n') as f: json.dump(v3, f, ensure_ascii=False, indent=1)
print(f'test card: {NAME} | {moved} keyword entries at depth {DEPTH} | dist/test/Eldrasil_TEST_LoreDepth.png')
