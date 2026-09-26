#!/usr/bin/env python3
"""Batch 1.2 — merge v38 (user)  Core + NPC lorebooks into the card worldbook (src/worldbook)
and export standalone lorebooks (dist/lorebook_v39/). Re-runnable; source_original is never modified."""
import json, os, re, copy
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
core = json.load(open(P('source_original/eldrasil_v38_Core.json'), encoding='utf-8'))
npc = json.load(open(P('source_original/eldrasil_v38_NPC_Detailed.json'), encoding='utf-8'))
C = {e['uid']: e for e in core['entries'].values()}
N = {e['uid']: e for e in npc['entries'].values()}

def rep(e, old, new):
    assert old in e['content'], f"missing text in {e['uid']}: {old[:60]}"
    e['content'] = e['content'].replace(old, new)

def template_from(e, **kw):
    t = copy.deepcopy(e); t.update(kw); return t

# 1.3.0 NPC lore pass (owner brainstorm, approved 2026-09-25): full NPC entries in source_original/npc_lore_2026-09-25/lore_*.md
# (one "## <id> — <Full Name>" heading + fenced entry each) replace the v38 text. They were written against the card's own text,
# so Royhan's entry carries the card's EJS date gate; it is turned back into the v38 line here and re-applied below as before.
NPC_LORE_DIR = P('source_original/npc_lore_2026-09-25')
ROY_EJS = re.compile(r"<%_ const _rm = .*?\n<%_ \} _%>", re.S)
def overlay_npc_lore(N):
    byname = {e['comment'].replace('NPC — ', '').strip(): u for u, e in N.items() if e['comment'].startswith('NPC — ')}
    changed = []
    for f in sorted(os.listdir(NPC_LORE_DIR)):
        if not f.endswith('.md'): continue
        text = open(os.path.join(NPC_LORE_DIR, f), encoding='utf-8').read()
        for m in re.finditer(r'^## (\S+) — (.+?)\n```\n(.*?)\n```', text, re.M | re.S):
            full, body = m.group(2).strip(), m.group(3)
            assert full in byname, f'{f}: no NPC entry "NPC — {full}"'
            e = N[byname[full]]
            if ROY_EJS.search(body):
                old = re.search(r'Current trouble: This year, his last, he finally qualified[^\n]*', e['content']).group(0)
                body = ROY_EJS.sub(lambda _: old, body)
            if body.strip() != e['content'].strip():
                e['content'] = body; changed.append(m.group(1))
    return changed
print('NPC lore pass 2026-09-25:', len(overlay_npc_lore(N)), 'entries updated')

# 1.7.0 cohort 2 (owner-approved 2026-09-26, planning/DRAFT_cohort2_npcs.md): new NPC entries (source_original/npc_lore_cohort2_*/
# lore_cohort2.md: "## <id> — <Full Name>", "uid: N", "keys: a, b" and a fenced entry each), and lines added to existing NPC entries
# (lore_cohort2_additions.md: "## <id> — <Full Name>", "year: Y" and fenced lines). The added lines and the new names in the roster
# and the Regulars entries appear only from that campaign year: an EJS gate in the card, a "[from Year Y]" marker in the standalone
# export (tools/curate_data.py turns it into a year-gated field for the UI).
COHORT_DIRS = sorted(d for d in os.listdir(P('source_original')) if d.startswith('npc_lore_cohort'))
def cohort_files(kind):   # kind '' = new entries (lore_cohortN.md), '_additions' = lines for older NPCs (lore_cohortN_additions.md)
    return [P('source_original', d, f) for d in COHORT_DIRS for f in sorted(os.listdir(P('source_original', d))) if re.fullmatch(r'lore_cohort\d+' + kind + r'\.md', f)]
def add_cohort_npcs(N):
    added = []
    for f in cohort_files(''):
        text = open(f, encoding='utf-8').read()
        for m in re.finditer(r'^## (\S+) — (.+?)\nuid: (\d+)\nkeys: (.+?)\n```\n(.*?)\n```', text, re.M | re.S):
            uid = int(m.group(3)); assert uid not in N and uid not in C, f'cohort NPC uid {uid} is taken'
            N[uid] = template_from(N[106], uid=uid, displayIndex=uid, comment='NPC — ' + m.group(2).strip(),
                                   key=[k.strip() for k in m.group(4).split(',')], content=m.group(5))
            added.append(m.group(1))
    return added
print('cohort NPC entries added:', add_cohort_npcs(N))
def cohort_additions():
    out = []
    for f in cohort_files('_additions'):
        text = open(f, encoding='utf-8').read()
        for m in re.finditer(r'^## (\S+) — (.+?)\nyear: (\d)\n```\n(.*?)\n```', text, re.M | re.S):
            out.append((m.group(2).strip(), int(m.group(3)), m.group(4).split('\n')))
    return out
YEAR_GATE = "<%_ if ((Number(getvar('stat_data.World.Year')) || 1) >= {y}) {{ _%>\n{body}\n<%_ }} _%>"
COHORT_ROSTER = {2: ['Linus (Viridian, M, ash-brown, loud, Academy Newspaper, the Tally)', 'Maple (Sky, red panda B, F, russet red, gentle, Greater Spirit)',
                     'Nerys (Fire, Elf, F, dark blue, deadpan, House Silvarenne)', 'Hadrian (Light, Elf, M, ash grey, shameless, Specialized Magic Club)',
                     'Wren (Fire, F, blonde, earnest, Deaf, Fishing Club)', 'Tsubaki (Light, wolf B, F, white, oblivious, Royal Mage, Duelling Club)']}
# Regulars entries (by the place in "Regulars — <place>") that gain a cohort's names, from each new NPC's Haunts
COHORT_REGULARS = {2: {'Announcement Room': ['Linus'], 'The Sparring Pavilion': ['Linus', 'Tsubaki'], 'Combat Grounds': ['Linus', 'Maple', 'Tsubaki'],
                       'Archive': ['Linus'], 'Common Rooms and Canteen': ['Linus', 'Nerys', 'Hadrian', 'Wren'], 'Gardens': ['Maple', 'Nerys'],
                       'Forest': ['Maple', 'Nerys'], 'Sky Dormitory': ['Maple'], 'Light Dormitory': ['Hadrian'], 'Fire Dormitory': ['Wren'],
                       'Mail Tower': ['Nerys'], "Founder's Park": ['Nerys'], 'Club Rooms': ['Hadrian', 'Wren'], 'Workshop': ['Hadrian'],
                       'Boathouse and Lake': ['Wren'], 'Main Library': ['Wren'], 'Observation Tower': ['Tsubaki'], 'Grassy Field and Hills': ['Tsubaki']}}
def apply_cohort(N, ejs):
    byname = {e['comment'].replace('NPC — ', '').strip(): u for u, e in N.items() if e['comment'].startswith('NPC — ')}
    for full, y, lines in cohort_additions():
        assert full in byname, f'cohort additions: no NPC entry "NPC — {full}"'
        e = N[byname[full]]
        e['content'] += '\n' + (YEAR_GATE.format(y=y, body='\n'.join(lines)) if ejs else '\n'.join(f'[from Year {y}] {l}' for l in lines))
    for y, segs in COHORT_ROSTER.items():   # the roster's Year 1 line (uid 97); the card's roster EJS places them by arrival year
        rep(N[97], "Alyssa (Sky, F, burgundy, quiet).", "Alyssa (Sky, F, burgundy, quiet); " + '; '.join(segs) + '.')
    regs = {e['comment'].replace('Regulars — ', '').strip(): u for u, e in N.items() if e['comment'].startswith('Regulars — ')}
    for y, R in COHORT_REGULARS.items():
        for place, ids in R.items():
            assert place in regs, f'cohort regulars: no entry "Regulars — {place}"'
            line = f"From campaign Year {y} also: {', '.join(ids)}."
            N[regs[place]]['content'] += '\n' + (YEAR_GATE.format(y=y, body=line) if ejs else f'[from Year {y}] {line}')

# v1.0.3 incoming cohorts (data/cohorts.json): an incoming NPC's card entry is empty until its campaign year (EJS gate);
# the standalone v39 export has no EJS, so it gets a plain note instead.
COH = json.load(open(P('data/cohorts.json'), encoding='utf-8'))
ARR = {nid: int(y) for y, ids in COH['incoming'].items() for nid in ids}
def npc_id(e): return e['comment'].replace('NPC — ', '').strip().split()[0] if e['comment'].startswith('NPC') else None
def gate_cohorts(D, ejs_gate):
    found = set()
    for u, e in D.items():
        a = ARR.get(npc_id(e))
        if not a: continue
        found.add(npc_id(e))
        e['content'] = (f"<%_ if ((Number(getvar('stat_data.World.Year')) || 1) >= {a}) {{ _%>\n{e['content']}\n<%_ }} _%>" if ejs_gate
                        else f"(Arrives at Halvard as a first-year in campaign Year {a}; not on campus before that.)\n{e['content']}")
    assert found == set(ARR), f'cohorts.json names without an NPC entry: {sorted(set(ARR) - found)}'

# ---------- v1.0.3 calendar (owner decision): World Competition M11 W4 Wed-Sat (Graduation's old slot), Graduation M11 W4 Sun ----------
# A third-year picked for the national four now competes before graduating; graduates leave on the first morning of the Month 12
# holiday. Edited in C itself, so the card calendar (uid 134), the card lore and the standalone v39 export all agree.
rep(C[144], "W4 Sat Graduation.", "W4 Wed-Sat World Competition, abroad (the national four). W4 Sun Graduation (third-years leave the next morning).")
rep(C[145], "Kingdom-wide holiday all month, students go home, campus nearly empty. W4 Thu-Sun World Competition, abroad.",
    "Kingdom-wide holiday all month, students go home, campus nearly empty.")
rep(C[248], "When: Month 11 Week 4, Saturday. Third-years leave; everyone attends.",
    "When: Month 11 Week 4, Sunday, the day after the World Competition ends (the national four fly home overnight). Third-years leave; everyone attends.")
rep(C[248], "Evening: feast; graduates leave by airship the next morning.",
    "Evening: feast; graduates leave by airship the next morning, the first day of the Kingdom-wide holiday.")

# ---------- 1.3.1 (owner playtest): the Entrance Event with its times; club sign-up runs all week and closes Friday 18:00 ----------
# Same plan as the engine's EVENTS (calendar, _Event_today). Edited in C itself, so the card and the v39 export agree.
rep(C[21], "- Sorting: new students place a hand on the Arbiter Stone to decide their dorm.",
    "- 07:00-09:00 Arrival: new students check in at Reception and Gatehouse.\n"
    "- 09:00 Sorting, in the Arbiter Hall: new students place a hand on the Arbiter Stone to decide their dorm.")
rep(C[21], "- Tour: each new student is grouped with 3 other newcomers and 1 senior to tour the whole campus all day.",
    "- 10:00-18:00 Tour: each new student is grouped with 3 other newcomers and 1 senior to tour the whole campus all day.")
rep(C[21], "- Club promotion: stands across the academy; registration closes at 5pm. Held on sorting day on purpose, so clubs recruit before dorm loyalty settles.",
    "- Club promotion: stands across the academy, 10:00-18:00 on sorting day, then every afternoon after classes (16:00-18:00) until Friday; registration closes Friday at 18:00. It opens on sorting day on purpose, so clubs recruit before dorm loyalty settles.")
rep(C[21], "- Seniors show new students their rooms inside the dorms.", "- Late afternoon: seniors show new students their rooms inside the dorms.")
rep(C[21], "- Entrance Feast, 7pm, Ring Dining Hall head master and vice head master speech before dining.",
    "- 19:00 Entrance Feast in the Ring Dining Hall: the Headmaster and the Vice Headmaster speak before dinner.")
rep(C[134], "W1 Mon Entrance Event.", "W1 Mon Entrance Event (09:00 sorting, tour all day, 19:00 feast). W1 Tue-Fri club booths 16:00-18:00, club registration closes Fri 18:00.")

# ---------- lore clarifications shared by card + v39 (D23-D25) ----------
def apply_lore_edits(C, N):
    rep(C[52], "Spent mana makes the air shiver at dusk.",
        "Spent mana makes the air shiver at dusk. Beside the rings stands the Sparring Pavilion, the one building the four training areas share: equipment store, rest area, and the Duelling Club's headquarters.")
    C[52]['key'] = C[52]['key'] + ['Sparring Pavilion']
    C[267] = template_from(C[52], uid=267, displayIndex=267,
        comment="Academy Location - Academic - The Sparring Pavilion",
        key=["Sparring Pavilion", "the pavilion", "Duelling Club headquarters", "equipment store", "training gear"],
        content=("[The Sparring Pavilion] A small round pavilion with a domed roof at the far corner of the Combat Grounds, "
                 "the one building all four dorm training areas share. Inside: racks of practice staves, ward-chalk and spare training gear "
                 "signed out by bracelet; benches, a water pump and a basic first-aid chest for the walk back after a hard session; a board of "
                 "duel challenges and club standings. It is the Duelling Club's headquarters, the standing exception to dorm separation, so it is "
                 "the one place on the grounds where students of rival dorms share a bench. Gavlan Haverton, who advises the club, keeps a desk in the back. "
                 "Unwritten rule: grudges from the rings are settled in the rings, never under the roof.\n"
                 "Feel: sweat, liniment, chalk dust, tired laughter."))
    # 1.2.0 (owner): the Oracle Shell is Merryhew's stock
    rep(C[215], "A palm-sized novelty shell from the Mall that", "A palm-sized novelty shell sold at Merryhew's, the Mall's joke shop, that")
    rep(C[86], "[Detention Tower] Where punished students",
        "[Detention Tower] One of the castle core's towers, climbed by its own narrow spiral stair from Floor 1. Where punished students")
    rep(C[89], "A formal grey stone office building flying the crown's banners, standing near the Cathedral and the Dovecote.",
        "A suite of offices on Castle Floor 1 behind a heavy door hung with the crown's banners: academy stone, crown ground. The Headmaster's authority stops at that door. Its wing is the same Floor 1 wing as the Warden's corridor, which neither side enjoys.")
    rep(C[89], "[Royal Inspectorate]", "[Royal Inspectorate]")
    rep(C[256], "since the Headmaster has no authority inside their walls.",
        "since the Headmaster has no authority inside the Dovecote's walls or past the Inspectorate's door.")
    m = C[132]
    rep(m, "Warden's Office (own corridor off Floor 1) – Seal Chamber.",
        "Warden's Office (own corridor off Floor 1) – Seal Chamber. Royal Inspectorate (Floor 1 wing, near the Warden's corridor). Detention Tower (own spiral stair from Floor 1).")
    rep(m, "the Warden's Office down its own corridor.",
        "the Warden's Office down its own corridor; the Royal Inspectorate's bannered door in the same wing; the foot of the Detention Tower stair.")
    rep(m, "Rooftop: flat lead roofs, the Bell Tower belfry, the Potion Hall tower tops.",
        "Rooftop: flat lead roofs, the Bell Tower belfry, the Potion Hall tower tops, the top of the Detention Tower.")
    rep(m, "the Dovecote, Cathedral, Royal Inspectorate and Noble Houses' Liaison stand together on one side of the grounds; between them and the Fire Dormitory, in the trees, stands the Broken Statue; the Detention Tower stands alone. All but the Detention Tower sit on academy land the academy does not control.",
        "the Dovecote, Cathedral and Noble Houses' Liaison stand together on one side of the grounds; between them and the Fire Dormitory, in the trees, stands the Broken Statue. All three sit on academy land the academy does not control, as does the Royal Inspectorate's suite inside the castle (Floor 1).")
    rep(m, "Sports Field – Gymnasium, Archery Range.", "Sports Field – Gymnasium, Archery Range. Combat Grounds – Sparring Pavilion.")
    rep(m, "Duelling – Combat Grounds;", "Duelling – Combat Grounds (headquarters: Sparring Pavilion);")
    rep(m, "Combat Grounds and Sports Field 10;", "Combat Grounds, Sparring Pavilion and Sports Field 10;")
    # 1.2.0 (owner, map review): club venues follow the owner's map. The Sports Field has a running track round the pitch; the
    # Archery Club uses the Archery Range; the Gymnasium houses the Swimming, Gymnastics and Basketball clubs; the Divination
    # Society meets in the Observation Tower. The Fishing House and Willow Island get their own entries (and map pins).
    rep(m, "Soccer – Sports Field; Running, Walking – Hills;",
        "Soccer, Running – Sports Field (running track around the pitch); Archery – Archery Range; Swimming, Gymnastics, Basketball – Gymnasium; Swimming – Swimming Pool; Walking – Hills;")
    rep(m, "Fishing – Lake;", "Fishing – Fishing House (on the lake shore);")
    rep(m, "Music, Card, Board Game, Divination, Tailoring,", "Divination – Observation Tower; Music, Card, Board Game, Tailoring,")
    rep(m, "- Far edge: Gardens – Boathouse/Lake – Forest.", "- Far edge: Gardens – Boathouse/Lake – Forest. Boathouse/Lake – Fishing House (beside the boathouse), Willow Island (by boat only).")
    # 1.2.1 (owner playtest: the Gatehouse is nearer the Mall than the Main Courtyard): walking times follow the map. They are the
    # shortest paths tools/curate_data.py computes (map distance, 0.22 min per unit; forest and boat legs keep their lore times).
    old = re.search(r"castle core and dormitories under 5 min;.*?Forest Clearing 40\.", m['content'])
    assert old, 'Campus Map walking-times line changed'
    m['content'] = m['content'].replace(old.group(0),
        "castle core 5-7 (more for the upper floors); Sky and Light Dormitories 4-5, Viridian 6, Fire 8; the Mall and Medical Centre 5-6, "
        "Mail Tower 7, Cathedral 8, Commissary 8, Banking House 10; Founder's Park 7; Reception and Gatehouse 9 (the Mall is only 6 from the gate); "
        "Gardens, Hills and Broken Statue 10; Archery Range, Spirit House and Groundskeeper's Lodge 11; Dovecote and Noble Houses' Liaison 12; "
        "Menagerie and Observation Tower 13; Combat Grounds, Gymnasium, Swimming Pool, Boathouse and Lake, Fishing House 14; Sports Field and Old Hut 15; "
        "Sparring Pavilion 17; Willow Island 24 (the last stretch by boat); Forest treeline 28; Forest Clearing 43.")
    rep(C[72], "[Sports Field] Soccer, running, and Sports Day in Month 6.",
        "[Sports Field] Soccer, running, and Sports Day in Month 6. A running track circles the soccer pitch: home ground of the Soccer Club and the Running Club.")
    rep(C[73], "[Gymnasium] Indoor training,", "[Gymnasium] Home of the Gymnastics and Basketball clubs, and of the Swimming Club, which trains in the outdoor pool beside it. Indoor training,")
    rep(C[81], "most important to Mystic students and the Divination Society.", "most important to Mystic students; the Divination Society meets here.")
    rep(C[78], " Beside the boathouse stands the Fishing Club's fishing house, a timber hut full of rods, nets and tackle, with its own long dock built for fishing rather than boats. Behind it, a stone-edged pond raises fish for the Canteen kitchen and the Fishing Club's breeding projects.",
        " Beside the boathouse stands the Fishing Club's Fishing House, with its own dock.")
    rep(C[78], " A small island sits in the middle of the lake with a big willow tree on it; at night the tree glows in the distance from the many fireflies that inhabit the island.",
        " Willow Island sits in the middle of the lake, reached only by boat.")
    for u in (268, 269): assert u not in C and u not in N
    C[268] = template_from(C[78], uid=268, displayIndex=268, comment="Academy Location - Sport and Grounds - Fishing House",
        key=["Fishing House", "fishing hut", "fishing dock", "Fishing Club", "fish pond", "the long dock"],
        content=("[Fishing House] The Fishing Club's timber hut on the lake shore beside the boathouse, full of rods, nets and tackle, with its own long dock "
                 "built for fishing rather than boats. Behind it, a stone-edged pond raises fish for the Canteen kitchen and the Fishing Club's breeding projects. "
                 "The club meets here; the dock is busiest at dawn, and quiet enough that people come to sit on it without a rod.\n"
                 "Feel: tar, wet rope, early mist on the water."))
    C[269] = template_from(C[78], uid=269, displayIndex=269, comment="Academy Location - Sport and Grounds - Willow Island",
        key=["Willow Island", "willow tree", "the island", "fireflies", "the willow"],
        content=("[Willow Island] A small island in the middle of the lake with one great willow tree on it, reached only by a boat from the boathouse, "
                 "which refuses bookings after dark. At night the willow glows in the distance from the many fireflies that live on the island, "
                 "so anyone out there after dark was either rowed out before sunset or took a boat without asking.\n"
                 "Feel: still water, trailing leaves, firefly light."))
    assert 332 not in N and 332 not in C
    N[332] = template_from(N[283], uid=332, displayIndex=332, comment="Regulars — The Sparring Pavilion",
        key=["Sparring Pavilion", "the pavilion", "Duelling Club headquarters"],
        content="[Regulars — The Sparring Pavilion] Gavlan, Sophia, Caspian (as a guest).")

CAL_M4_OLD = "W2 Tue Independence Crowning Day (kingdom holiday, celebrated on campus)."
CAL_M4_NEW = "W2 Tue Independence Crowning Day (kingdom holiday: the academy flies to the capital by airship; fireworks on campus at night)."
ROY_OLD = re.compile(r'Current trouble: This year, his last, he finally qualified from the Dorm Competition at rank 16, but no team will take him, since "illusionist-alchemist" doesn\'t count as a role\.')

# ================= v39 standalone =================
C39, N39 = copy.deepcopy(C), copy.deepcopy(N)
apply_lore_edits(C39, N39)
apply_cohort(N39, False)   # 1.7.0 cohort 2
gate_cohorts(N39, False)
rep(C39[137], CAL_M4_OLD, CAL_M4_NEW)
assert ROY_OLD.search(N39[101]['content'])
N39[101]['content'] = ROY_OLD.sub(
    'Current trouble: This year is his last chance at the Dorm Competition (Month 3 Week 4). Before it, he is training to qualify and already knows the harder problem: '
    'no team wants him, since "illusionist-alchemist" doesn\'t count as a role. Canon outcome afterwards, unless the story changes it: he qualifies at rank 16, and still no team will take him.',
    N39[101]['content'])
os.makedirs(P('dist/lorebook_v39'), exist_ok=True)
for name, src, D in (('Core', core, C39), ('NPC_Detailed', npc, N39)):
    out = copy.deepcopy(src); out['entries'] = {str(u): D[u] for u in sorted(D)}
    json.dump(out, open(P(f'dist/lorebook_v39/eldrasil_v39_{name}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

# ================= card worldbook =================
Cc, Nc = copy.deepcopy(C), copy.deepcopy(N)
apply_lore_edits(Cc, Nc)
apply_cohort(Nc, True)   # 1.7.0 cohort 2
# D19: remap NPC uid collisions 254-262 -> 401-409
REMAP = {u: 401 + i for i, u in enumerate(range(254, 263))}
for old, new in REMAP.items():
    e = Nc.pop(old); e['uid'] = new; e['displayIndex'] = new; Nc[new] = e
# D18 Royhan — EJS date gate
assert ROY_OLD.search(Nc[101]['content'])
Nc[101]['content'] = ROY_OLD.sub(lambda _: (
    "<%_ const _rm = Number(getvar('stat_data.World.Month')) || 1, _rw = Number(getvar('stat_data.World.Week')) || 1, _rd = String(getvar('stat_data.World.Day') || ''); _%>\n"
    "<%_ if (_rm < 3 || (_rm === 3 && (_rw < 4 || !['Sat', 'Sun'].includes(_rd)))) { _%>\n"
    'Current trouble: This year is his last chance. He is training to qualify from the Dorm Competition (Month 3 Week 4) and already knows the harder problem: even if he qualifies, no team wants him, since "illusionist-alchemist" doesn\'t count as a role.\n'
    "<%_ } else if (_rm === 3) { _%>\n"
    'Current trouble: This year is his last chance, and the Dorm Competition is being fought this weekend: he needs a top-16 finish. Even if he makes it, no team wants him, since "illusionist-alchemist" doesn\'t count as a role. '
    'If the story has already changed what this depends on (he is hurt, away or out of the competition), adapt it to the story as it is now; never replay it as if nothing happened.\n'
    "<%_ } else { _%>\n"
    'Current trouble: This year, his last, he qualified from the Dorm Competition at rank 16, but no team will take him, since "illusionist-alchemist" doesn\'t count as a role. (Campus_State overrides this if the story played out differently.)\n'
    "<%_ } _%>"), Nc[101]['content'])
gate_cohorts(Nc, True)   # v1.0.3 incoming cohorts (defined at the top)
# 1.5.1 (Batch B, P1): while an NPC has a full sheet in the Cast Sheet (custom 509, engine $ui.cast.full) their keyword entry
# prints nothing, so the lore is not sent twice. Mentioned but not present, or present beyond the cap: the keyword entry works as before.
for u, e in Nc.items():
    nid = npc_id(e)
    if nid: e['content'] = f"<%_ if (!((getvar('stat_data.$ui.cast') || {{}}).full || []).includes('{nid}')) {{ _%>\n{e['content']}\n<%_ }} _%>"
# v1.0.3 NPC roster (uid 97, always on): the Year lines become year-aware. In campaign Year Y a student listed as Year y who arrived
# in year a is now in year y + Y - a; incoming cohorts appear only once they arrive; Campus_State.Graduated moves students to a
# "Graduated" line; a student the story kept back past Year 3 shows as repeating.
def roster_ejs(text):
    lines, studs, at = text.split('\n'), [], None
    keep = []
    for i, line in enumerate(lines):
        m = re.match(r'Year ([123]):\s*(.*)', line)
        if not m: keep.append(line); continue
        if at is None: at = len(keep); keep.append('@@YEARS@@')
        for seg in re.split(r';\s*(?![^()]*\))', m.group(2).strip().rstrip('.')):
            seg = seg.strip()
            if seg: studs.append([seg.split()[0], int(m.group(1)), ARR.get(seg.split()[0], 1), seg])
    assert at is not None and studs, 'roster: no Year lines found'
    block = ("<%_\nconst _R = " + json.dumps(studs, ensure_ascii=False) + ";\n"
             "const _Y = Math.max(1, Number(getvar('stat_data.World.Year')) || 1), _G = getvar('stat_data.Campus_State.Graduated') || [];\n"
             "const _by = { 1: [], 2: [], 3: [] }, _gone = [];\n"
             "for (const [id, y, a, seg] of _R) {\n"
             "  if (a > _Y) continue;\n"
             "  if (_G.includes(id)) { _gone.push(id); continue; }\n"
             "  const c = y + _Y - a;\n"
             "  _by[Math.min(3, Math.max(1, c))].push(c > 3 ? seg.replace(/\\)\\s*$/, ', repeating)') : seg);\n"
             "}\n_%>\n"
             "Year 3: <%- _by[3].join('; ') || 'none on record' %>.\n"
             "Year 2: <%- _by[2].join('; ') || 'none on record' %>.\n"
             "Year 1: <%- _by[1].join('; ') || 'none on record yet (the story may introduce new first-years)' %>.\n"
             "<%_ if (_gone.length) { _%>\nGraduated, no longer at Halvard: <%- _gone.join(', ') %>.\n<%_ } _%>")
    keep[at] = block
    return '\n'.join(keep)
Nc[97]['content'] = roster_ejs(Nc[97]['content'])

# D17 + calendar automation: 12 month entries -> one EJS entry (uid 134)
months = {}
for u in range(134, 146):
    t = C[u]['content'].replace(CAL_M4_OLD, CAL_M4_NEW)
    months[u - 133] = re.sub(r'^\[Current month: Month \d+\]\n?', '', t).strip()
cal_js = ',\n'.join(f"  {k}: {json.dumps(v, ensure_ascii=False)}" for k, v in months.items())
cal = copy.deepcopy(C[134])
cal.update(disable=False, constant=True, comment='Calendar — Current Month (auto)', key=['calendar', 'this month', 'next month'],
    content=("<%_\nconst _cal = {\n" + cal_js + "\n};\n"
             "const _m = Math.min(12, Math.max(1, Number(getvar('stat_data.World.Month')) || 1));\n"
             "const _n = _m === 12 ? 1 : _m + 1;\n_%>\n"
             "[Current month: Month <%- _m %>]\n<%- _cal[_m] %>\n[Next month (Month <%- _n %>) preview: <%- _cal[_n] %>]"))
for u in range(134, 146): Cc.pop(u)
Cc[134] = cal
# merge + tagging (D2): lore -> [mvu_plot]; shared state/navigation entries stay untagged (sent to both models)
UNTAGGED_CORE = {0, 132, 134, 131, 20}
UNTAGGED_NPC = {97}
merged = []
for src, untag in ((Cc, UNTAGGED_CORE), (Nc, UNTAGGED_NPC)):
    for u, e in src.items():
        e = copy.deepcopy(e)
        if u not in untag and not e['comment'].startswith('[mvu_'):
            e['comment'] = '[mvu_plot] ' + e['comment']
        merged.append(e)
merged.sort(key=lambda e: e['uid'])
assert len({e['uid'] for e in merged}) == len(merged)
cdir = P('src/worldbook/content'); os.makedirs(cdir, exist_ok=True)
for f in os.listdir(cdir): os.remove(os.path.join(cdir, f))
index = []
for e in merged:
    open(os.path.join(cdir, f"{e['uid']}.txt"), 'w', encoding='utf-8').write(e['content'])
    index.append({k: v for k, v in e.items() if k != 'content'})
json.dump(index, open(P('src/worldbook/index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump({str(k): v for k, v in REMAP.items()}, open(P('data/uid_remap_npc.json'), 'w'), indent=1)
print('card worldbook entries:', len(merged), '| v39 core', len(C39), 'npc', len(N39))
