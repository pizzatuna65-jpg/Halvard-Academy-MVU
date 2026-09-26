#!/usr/bin/env python3
"""1.7.1 (owner: "buat update lorebook silly tavern biasa berdasarkan 1.7") — a plain SillyTavern lorebook for use without the card
(no MVU, no EJS, no variables): dist/lorebook_st/Eldrasil_<version>_Core.json and _NPC_Detailed.json.

Source: the standalone v39 export (tools/merge_lorebooks.py: the owner's v38 + every card lore edit, the 2026-09-25 NPC pass and
the cohorts) plus the approved voice canon (data/npc_canon.json), which the card otherwise prints only in its Cast Sheet.
What changes for a plain lorebook:
- Campaign years become {{user}}'s school years: an incoming cohort's entry says when they arrive, the lines they add to older NPCs
  read "From {{user}}'s second year: ...", and the roster lists them on their own line instead of among today's first-years.
- Each bonded NPC's entry gains its voice block (scene examples, never sounds like, terms, props, don't flatten, how the bond grows,
  what the closest bond can become, anchor, change). Secret parts stay inside <narrator_only>.
Nothing mechanical (ranks, Trust, rewards, the weekly hobby list) is carried over: those need the card's engine.
Run after merge_lorebooks.py:  python3 tools/export_st_lorebook.py"""
import json, os, re, copy
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
VER = json.load(open(P('src/card/card.json'), encoding='utf-8'))['character_version']
CAN = json.load(open(P('data/npc_canon.json'), encoding='utf-8'))
COH = {nid: int(y) for y, ids in json.load(open(P('data/cohorts.json'), encoding='utf-8'))['incoming'].items() for nid in ids}
ORD = {2: 'second', 3: 'third', 4: 'fourth'}
def yr(y): return f"{{{{user}}}}'s {ORD.get(y, f'year-{y}')} year"

def load(name): return json.load(open(P(f'dist/lorebook_v39/eldrasil_v39_{name}.json'), encoding='utf-8'))
core, npc = load('Core'), load('NPC_Detailed')

STAGE = {'0-2': 'Just met', '3-5': 'Friendly', '6-8': 'Close', '9-10': 'Closest'}
BRANCH = {'A': 'a best friend, a romance or a sworn rival', 'B': 'a best friend or a sworn rival (never a romance)',
          'C': 'a best friend or a romance (never a sworn rival)', 'D': 'a best friend only (never a romance or a rival)'}
CHANGE = {'fixed': 'experience deepens who they are; it never rewrites them.',
          'shaped': 'a major, repeated experience can change one part of them for good; the old self still shows under stress.',
          'fluid': 'they change with their surroundings over months (a new year, a new circle), never within one scene.'}
def voice_block(nid):
    v = CAN['voice'].get(nid)
    if not v: return ''
    out = ['', f'Voice (canon; examples of how {nid} sounds, not lines to repeat):']
    out += ['- ' + s for s in v['scenes']]
    if v.get('alone'): out.append('<narrator_only>Alone (the mask off; {{user}} never sees this unless the story earns it):\n'
                                  + '\n'.join('- ' + s for s in v['alone']) + '</narrator_only>')
    out.append('Never sounds like: ' + v['never_sounds'])
    out.append('How they address people: ' + v['term_used'])
    out.append('Carries: ' + v['carries'])
    out.append("Don't flatten: " + v['dont_flatten'])
    out.append('As the bond with {{user}} grows: ' + ' '.join(f"{STAGE[b]}: {v['stages'][b]}" for b in ('0-2', '3-5', '6-8', '9-10')))
    br = CAN['branch'].get(nid)
    if br: out.append(f'At its closest the bond can become {BRANCH[br]}.'
                      + (' As a romance: ' + v['romance'] if v.get('romance') else '') + (' As a sworn rival: ' + v['rival'] if v.get('rival') else ''))
    out.append('Anchor: ' + v['anchor'])
    if CAN['change'].get(nid): out.append(f"Change ({CAN['change'][nid]}): {CHANGE[CAN['change'][nid]]}")
    return '\n'.join(out)

def plain(text):
    text = re.sub(r'\(Arrives at Halvard as a first-year in campaign Year (\d); not on campus before that\.\)',
                  lambda m: f'(Arrives at Halvard as a first-year in {yr(int(m.group(1)))}; not on campus before that.)', text)
    text = re.sub(r'^\[from Year (\d)\] From campaign Year \d also: ', lambda m: f'From {yr(int(m.group(1)))} also: ', text, flags=re.M)
    text = re.sub(r'^\[from Year (\d)\] ', lambda m: f'From {yr(int(m.group(1)))}: ', text, flags=re.M)
    return text

out_npc = copy.deepcopy(npc)
for e in out_npc['entries'].values():
    e['content'] = plain(e['content'])
    m = re.match(r'NPC — (\S+)', e['comment'])
    if m and m.group(1) in CAN['voice']: e['content'] = e['content'].rstrip('\n') + '\n' + voice_block(m.group(1))
    if e['uid'] == 97:   # the roster: incoming students on their own line, not among today's first-years
        later = {}
        def pull(line):
            if not line.startswith('Year 1:'): return line
            segs = re.split(r';\s*(?![^()]*\))', line[len('Year 1:'):].strip().rstrip('.'))
            keep = [s for s in segs if s.split()[0] not in COH]
            for s in segs:
                if s.split()[0] in COH: later.setdefault(COH[s.split()[0]], []).append(s.strip())
            return 'Year 1: ' + '; '.join(s.strip() for s in keep) + '.'
        lines = [pull(l) for l in e['content'].split('\n')]
        i = next(k for k, l in enumerate(lines) if l.startswith('Year 1:'))
        for y in sorted(later, reverse=True):
            lines.insert(i + 1, f"Arriving as first-years in {yr(y)} (not at Halvard before then): " + '; '.join(later[y]) + '.')
        lines.append("In later years everyone moves up a year; third-years leave after Graduation.")
        e['content'] = '\n'.join(lines)
out_core = copy.deepcopy(core)
for e in out_core['entries'].values(): e['content'] = plain(e['content'])

for D in (out_core, out_npc):
    for e in D['entries'].values():
        assert '<%' not in e['content'] and '[from Year' not in e['content'] and 'campaign Year' not in e['content'], (e['uid'], e['comment'])
os.makedirs(P('dist/lorebook_st'), exist_ok=True)
for f in os.listdir(P('dist/lorebook_st')): os.remove(P('dist/lorebook_st', f))
for name, D in (('Core', out_core), ('NPC_Detailed', out_npc)):
    json.dump(D, open(P(f'dist/lorebook_st/Eldrasil_{VER}_{name}.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=2)
print(f'plain SillyTavern lorebook {VER}: core {len(out_core["entries"])} entries, NPC {len(out_npc["entries"])} entries,',
      sum(1 for e in out_npc['entries'].values() if 'Voice (canon' in e['content']), 'with a voice block')
