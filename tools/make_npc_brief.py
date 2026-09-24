#!/usr/bin/env python3
"""1.2.2 — writes a self-contained NPC brainstorming handoff (docs/npc_brainstorm/): a compact brief with everything needed to
design NPC info and bond events, plus the full NPC lore split by group, to attach only when those NPCs are discussed.
Re-run after lore, NPC or bond-rule changes:  python3 tools/make_npc_brief.py"""
import json, os, re
from collections import defaultdict
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
OUT = P('docs', 'npc_brainstorm')
os.makedirs(OUT, exist_ok=True)
idx = json.load(open(P('src/worldbook/index.json'), encoding='utf-8'))
C = lambda u: open(P('src/worldbook/content', f'{u}.txt'), encoding='utf-8').read().strip()
npcs = json.load(open(P('data/npcs.json'), encoding='utf-8'))
locs = json.load(open(P('data/locations.json'), encoding='utf-8'))
BR = json.load(open(P('data/bond_rules.json'), encoding='utf-8'))
OPN = json.load(open(P('data/bond_openness.json'), encoding='utf-8'))
EV = json.load(open(P('data/bond_events.json'), encoding='utf-8'))['events']
tag = {nid: t for t in ('open', 'guarded', 'closed') for nid in OPN[t]}
def tok(s): return f'~{round(len(s) / 4 / 100) * 100:,} tokens'

# NPC lore entries by NPC id
LORE = {}
for e in idx:
    m = re.match(r'\[mvu_plot\] NPC — (\S+)', e['comment'])
    if m and m.group(1) in npcs: LORE[m.group(1)] = C(e['uid'])
GROUPS = [('year1', 'Halvard students — Year 1', lambda n: n['group'] == 'Year 1'),
          ('year2', 'Halvard students — Year 2', lambda n: n['group'] == 'Year 2'),
          ('year3', 'Halvard students — Year 3', lambda n: n['group'] == 'Year 3'),
          ('staff', 'Teaching staff and dorm heads', lambda n: n['group'] == 'Staff'),
          ('others', 'Doves, Cathedral, Liaison and facilities', lambda n: n['group'] in ('Doves', 'Cathedral', 'Facilities', 'Liaison')),
          ('rivals', 'Rival academy teams (Myrdath, Veyra, Ashvale)', lambda n: n['group'].endswith('team'))]

# ---- what each NPC is missing (fields absent from the lore, not the ones kept in <narrator_only>)
KEY = ['Personality', 'Loves', 'Hates', 'Goals', 'Backstory', 'Haunts', 'Magic', 'Relations']
def gaps(nid):
    t = LORE.get(nid, '')
    pub = re.sub(r'<narrator_only>[\s\S]*?</narrator_only>', '', t)
    nar = ' '.join(re.findall(r'<narrator_only>([\s\S]*?)</narrator_only>', t))
    miss, secret = [], []
    for k in KEY:
        if re.search(r'^' + k + r'\s*:', pub, re.M): continue
        (secret if re.search(r'(^|\s)' + k + r'\s*:', nar) else miss).append(k)
    return miss, secret
first = lambda s: re.split(r'(?<=[.;])\s', s.strip())[0] if s else ''
field = lambda n, lab: next((f['text'] for f in n['fields'] if f['label'] == lab), '')

# ---- brief
b = []
w = b.append
w('# NPC brainstorm brief — Eldrasil: Halvard Academy (SillyTavern card)\n')
w('## 0. How to use this (for the assistant)\n')
w("""You are helping the card's author design **NPC information** (missing lore fields, sharper personalities, loves/hates, goals,
haunts) and **bond events** (one per rank-up per NPC). You do not need the rest of the project: this brief holds the world
basics, the bond system, the formats, the NPC roster and the known gaps. The **full lore of an NPC group** is in a separate
file (`lore_<group>.md`, list in §8); if you need an NPC's full entry and it is not attached, ask for that group's file
instead of guessing.

Rules:
- The author's lore is canon. Do not contradict it; extend it. Keep everything the card uses in **English**; discuss with the
  author in **Indonesian** unless they write otherwise.
- `<narrator_only>` text is secret: characters never state it, and no rank reveals it (only the story does). Events at Rank 9→10
  may open a way toward a secret, never announce it.
- `{{user}}` is the player's first-year student (name, pronouns and magic are the player's). Never decide {{user}}'s feelings or
  actions in directions; offer choices.
- Be concise; prefer drafts the author can paste. Output formats:
  - **New or fixed lore fields:** `Label: text` lines to add to that NPC's lorebook entry (labels as in the roster: Personality,
    Loves, Hates, Goals, Haunts, Backstory, Relations, Speech, Emotional tells…). Secrets inside `<narrator_only>…</narrator_only>`.
  - **Bond events:** the exact format in §5, one entry per NPC per rank.
""")
w('## 1. World in brief (canon excerpts)\n')
for u in (1, 5, 12, 26, 122, 249, 253, 19):
    w('```\n' + C(u) + '\n```\n')
fa = re.search(r'The twenty forbidden arts[^\n]*', C(32))
w('Forbidden arts (lore 32): ' + (fa.group(0) if fa else '') + ' Pacting = a pact with anything other than a spirit (forbidden).\n')
w('Races: Human, Elf, Beastkin (animal ears/tail; the type varies). The player\'s dorm is set by the Arbiter Stone at the Entrance Event (M1 W1 Mon).\n')

w('## 2. Calendar and timetable\n')
tpl = open(P('src/scripts/engine.template.js'), encoding='utf-8').read()
ev = re.findall(r"\{ m: (\d+), w: (\d), d: (\[[^\]]*\]|\w+), t: '([^']+)'", tpl)
w('Year = 12 months × 4 weeks × 7 days (Mon–Sun). Dates are written "M3 W2 Thu". Classes Mon–Sat in three periods: 08:00–10:00, 10:00–12:00, 13:00–16:00; Saturday afternoon is club time (13:00–16:00); curfew 20:00.\n')
w('Academy calendar (fixed events):\n')
for m, wk, d, t in ev:
    d = re.sub(r"[\[\]' ]", '', d).replace('MON_THU', 'Mon–Thu').replace('MON_FRI', 'Mon–Fri').replace('MON_SAT', 'Mon–Sat').replace('ALL', 'all week')
    w(f'- M{m} W{wk} {d}: {t}')
tt = re.search(r'const TIMETABLE = \{([\s\S]*?)\};', tpl).group(1)
w('\nWeekly timetable ([M] mixed dorms, [D] per dorm):')
for day, cells in re.findall(r"(\w{3}): \[([^\]]*)\]", tt):
    w(f'- {day}: ' + ' | '.join(re.findall(r"'([^']*)'", cells)))
w('')

w('## 3. Places (names to use in event conditions)\n')
bycat = defaultdict(list)
for l in locs.values(): bycat[l['category']].append(l['name'] + (f" ({l['floor']})" if l.get('floor') else ''))
for cat in sorted(bycat): w(f'- **{cat}:** ' + ', '.join(sorted(bycat[cat])))
cv = re.search(r'Club venues: ([^\n]*)', C(132))
w('\nClub venues: ' + (cv.group(1) if cv else '') + '\n')

w('## 4. The bond system (what ranks mean)\n')
w(f"""- Rank 0–10 per NPC. Time together fills an XP bar: a real talk ({BR['kind_xp']['talk']} XP, once a day), a hangout ({BR['kind_xp']['hangout']}, once a day),
  gifts ({BR['per_week']['gift']} a week: loved {BR['gift_xp']['loved']} (×{BR['gift_bonus_mult']} from Rank {BR['gift_bonus_rank']}), liked {BR['gift_xp']['liked']}, neutral {BR['gift_xp']['neutral']}, disliked 0 and +Tension), real help with their goal
  ({BR['kind_xp']['help']}, once a week). XP per rank at standard pace: {', '.join(f'{i}→{i + 1}: {x}' for i, x in enumerate(BR['xp_base']))}
  (about one semester of steady play to Rank 10; the player can pick a pace from ~1 month to ~1 year).
- A full bar opens that rank's **bond event**; when it has played out, the rank rises by 1 (choices change Trust, never block
  the rank). After a rank there is a short wait before the next event.
- Romance becomes official from Rank {BR['romance_default']} by default (player setting); feelings may grow earlier in the story.
- **What the NPC shares** at each rank (openness shifts the first tiers: open +2, guarded −1, closed −2; tiers from Rank
  {BR['share_real_from']} need the real rank; secrets never):""")
for t, s in BR['share']: w(f'  - Rank {t}: {s}')
w('- **Dossier fields unlock by rank** (what the player reads): Appearance/Role 0 · Age, Speech, Club, Haunts 1 · Magic, Skills, Equipment 2 ·'
  ' Loves, Hates, Hobby 3 · Personality, Emotional tells, Notes 4 · Goals, Current trouble 5 · Relations, Doves 6 · Backstory, Family, Home 7 · Trauma 8.'
  ' So a rank-up event is the natural moment the player learns that rank\'s fields.')
w('- **What the rank allows** (told to the narrator):')
for r, s in BR['perks'].items(): w(f'  - Rank {r}: {s}')
w('- **Default event theme per rank-up** (used when no event is written):')
for r, s in BR['themes'].items(): w(f'  - {r}→{int(r) + 1}: {s}')
w('')

w('## 5. Bond event format\n')
doc = open(P('docs/BOND_EVENTS.md'), encoding='utf-8').read()
w(doc[doc.index('## Format'):doc.index('## Adding them to the card')].replace('## Format', '').strip() + '\n')
w('Existing scripted events: ' + (', '.join(f"{e['npc']} {e['rank']}→{e['rank'] + 1}" for e in EV) or 'none yet') + '.\n')

w('## 6. NPC roster (one line each; full lore in the group files)\n')
w('Columns: id — full name · group · dorm/race · role · club · openness · has secrets · personality (first clause).\n')
for gid, gname, pred in GROUPS:
    ids = [i for i, n in npcs.items() if pred(n)]
    w(f'**{gname}**')
    for i in ids:
        n = npcs[i]
        race = n['race'] + (f" ({n['beast']})" if n.get('beast') else '')
        role = ', '.join(n.get('public_tags') or []) or first(field(n, 'Role')) or (n.get('team_role') or '')
        club = first(field(n, 'Club')).rstrip('.')
        pers = first(field(n, 'Personality')) or '—'
        w(f"- **{i}** — {n['name']} · {n['group']} · {n.get('dorm') or '-'}/{race} · {role or '-'} · {club or '-'} · {tag.get(i, 'normal')} · {'yes' if n.get('has_secret') else 'no'} · {pers[:140]}")
    w('')

w('## 7. Known gaps (fields missing from the lore; secrets kept in <narrator_only> are not gaps)\n')
w('Likely by design: rival academy teams and Doves are kept minimal; Bobby is a non-mage (no Magic); staff often lack Loves/Hates/Goals.\n')
for gid, gname, pred in GROUPS:
    rows = []
    for i, n in npcs.items():
        if not pred(n): continue
        miss, sec = gaps(i)
        if i == 'Bobby': miss = [x for x in miss if x != 'Magic']   # a non-mage by design
        if miss: rows.append(f"- {i}: missing {', '.join(miss)}" + (f" (in secrets: {', '.join(sec)})" if sec else ''))
    if rows: w(f'**{gname}**\n' + '\n'.join(rows) + '\n')

w('## 8. Group lore files (attach only what the discussion needs)\n')
files = []
for gid, gname, pred in GROUPS:
    ids = [i for i, n in npcs.items() if pred(n)]
    body = f'# NPC lore — {gname}\nFull lorebook entries, as in the card. `<narrator_only>` = secret (see the brief §0).\n\n' + \
           '\n\n'.join(f'## {i} — {npcs[i]["name"]}\n```\n{LORE.get(i, "(no entry)")}\n```' for i in ids) + '\n'
    open(os.path.join(OUT, f'lore_{gid}.md'), 'w', encoding='utf-8').write(body)
    files.append((gid, gname, ids, body))
    w(f"- `lore_{gid}.md` — {gname}: {', '.join(ids)} ({tok(body)})")
brief = '\n'.join(b) + '\n'
open(os.path.join(OUT, 'NPC_BRAINSTORM_BRIEF.md'), 'w', encoding='utf-8').write(brief + f'\nThis brief: {tok(brief)}.\n')
print('brief', tok(brief), '|', ', '.join(f'{g} {tok(bd)}' for g, _, _, bd in files))
