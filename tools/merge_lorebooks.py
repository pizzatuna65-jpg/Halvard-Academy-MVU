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
# 1.33.0 (owner-approved planning/DRAFT_classes_and_teachers.md): the new teaching staff use the same two files in
# source_original/npc_lore_staff_*/ (lore_staff.md, lore_staff_additions.md); a "year: 1" addition is a plain line (no gate).
COHORT_DIRS = sorted(d for d in os.listdir(P('source_original')) if d.startswith(('npc_lore_cohort', 'npc_lore_staff')))
def cohort_files(kind):   # kind '' = new entries (lore_cohortN.md), '_additions' = lines for older NPCs (lore_cohortN_additions.md)
    return [P('source_original', d, f) for d in COHORT_DIRS for f in sorted(os.listdir(P('source_original', d))) if re.fullmatch(r'lore_(?:cohort\d+|staff)' + kind + r'\.md', f)]
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
                     'Wren (Fire, F, blonde, earnest, Deaf, Fishing Club)', 'Tsubaki (Light, wolf B, F, white, oblivious, Royal Mage, Duelling Club)'],
                 3: ['Aurelian (Fire, Elf, M, honey-gold, hero, Basketball Club)', 'William (Sky, crow B, M, dark teal, dramatic, Board Game Club)',
                     'Bruno (Fire, M, blue-black, brawler, Duelling Club)', 'Bianca (Light, F, blue-black, social, Swimming Club, Council)',
                     'Rigel (Sky, rabbit B, M, white, Ardenne, Festival Committee)', 'Topaz (Light, Elf, F, orange, rival, follows {{user}} into their club)',
                     'Faye (Viridian, Elf, F, periwinkle, calm, Walking Club)']}
# Regulars entries (by the place in "Regulars — <place>") that gain a cohort's names, from each new NPC's Haunts
COHORT_REGULARS = {2: {'Announcement Room': ['Linus'], 'The Sparring Pavilion': ['Linus', 'Tsubaki'], 'Combat Grounds': ['Linus', 'Maple', 'Tsubaki'],
                       'Archive': ['Linus'], 'Common Rooms and Canteen': ['Linus', 'Nerys', 'Hadrian', 'Wren'], 'Gardens': ['Maple', 'Nerys'],
                       'Forest': ['Maple', 'Nerys'], 'Sky Dormitory': ['Maple'], 'Light Dormitory': ['Hadrian'], 'Fire Dormitory': ['Wren'],
                       'Mail Tower': ['Nerys'], "Founder's Park": ['Nerys'], 'Club Rooms': ['Hadrian', 'Wren'], 'Workshop': ['Hadrian'],
                       'Boathouse and Lake': ['Wren'], 'Main Library': ['Wren'], 'Observation Tower': ['Tsubaki'], 'Grassy Field and Hills': ['Tsubaki'],
                       'Forest Clearing': ['Maple']},
                   3: {'Sports Field and Gymnasium': ['Aurelian', 'Bianca'], 'Fire Dormitory': ['Aurelian', 'Bruno'],
                       'Combat Grounds': ['Aurelian', 'Bruno', 'Topaz'], 'Announcement Room': ['Aurelian'],
                       'Common Rooms and Canteen': ['Aurelian', 'Bruno', 'Bianca', 'Topaz'],
                       'The Sparring Pavilion': ['Bruno', 'Topaz', 'William'], 'Student Council Chamber': ['Bianca', 'Hadrian', 'Nerys'],
                       'Light Dormitory': ['Bianca', 'Topaz'], 'Courtyards': ['Bianca'],
                       'Boathouse and Lake': ['Rigel'], 'Sky Dormitory': ['Rigel', 'William'], 'The Mall': ['Rigel', 'William'],
                       'The Cathedral': ['Rigel'], 'Rooftop': ['William'], 'Club Rooms': ['William'],
                       'Main Library': ['William'], 'Spirit Path': ['William'],
                       'Viridian Dormitory': ['Faye'], 'Grassy Field and Hills': ['Faye'],
                       'Meditation Rooms': ['Faye'], 'Menagerie': ['Faye']}}
def apply_cohort(N, ejs):
    byname = {e['comment'].replace('NPC — ', '').strip(): u for u, e in N.items() if e['comment'].startswith('NPC — ')}
    for full, y, lines in cohort_additions():
        assert full in byname, f'cohort additions: no NPC entry "NPC — {full}"'
        e = N[byname[full]]
        if y <= 1:   # 1.33.0: on campus from the start: the lines join the entry's Relations line (dossier Rank 6)
            e['content'], n = re.subn(r'^(Relations: .*)$', lambda m: m.group(1) + ' ' + ' '.join(lines), e['content'], count=1, flags=re.M)
            if not n: e['content'] += '\n' + '\n'.join(lines)
            continue
        e['content'] += '\n' + (YEAR_GATE.format(y=y, body='\n'.join(lines)) if ejs else '\n'.join(f'[from Year {y}] {l}' for l in lines))
    # The roster's source Year 1 line includes all incoming names; roster_ejs sorts them by arrival year.
    segs = [seg for year in sorted(COHORT_ROSTER) for seg in COHORT_ROSTER[year]]
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
    "- 09:00 Ceremony in the Arbiter Hall: Headmaster Baelin and Vice Headmaster Althair address the new class before sorting begins. The first-years then touch the Arbiter Stone one by one. Immediately after each sorting, a Student Council member gives that student the vest of their new dorm; they sit with that dorm and remain in the hall until everyone is sorted at 10:00. Do not send a sorted first-year outside to wait or offer free time between their sorting and the end of the ceremony.")
rep(C[21], "- Tour: each new student is grouped with 3 other newcomers and 1 senior to tour the whole campus all day.",
    "- 10:00-18:00 Tour: after sorting ends, each group is exactly two new first-years and one senior. The assigned trio meets in the Arbiter Hall and tours the campus together; club booths are stops along the way. Keep the same trio until the tour ends. Use the recorded Campus_State.Entrance_tour assignment; choose available roster students of this year's entering cohort before inventing a new first-year, and a roster senior before inventing a guide. If every suitable roster student is unavailable, a narrator-created student may fill the place.")
rep(C[21], "- Club promotion: stands across the academy; registration closes at 5pm. Held on sorting day on purpose, so clubs recruit before dorm loyalty settles.",
    "- Club promotion: stands across the academy, 10:00-18:00 on sorting day, then every afternoon after classes (16:00-18:00) until Friday; registration closes Friday at 18:00. It opens on sorting day on purpose, so clubs recruit before dorm loyalty settles.")
rep(C[21], "- Seniors show new students their rooms inside the dorms.", "- Late afternoon: seniors show new students their rooms inside the dorms.")
rep(C[21], "- Entrance Feast, 7pm, Ring Dining Hall head master and vice head master speech before dining.",
    "- 19:00 Entrance Feast in the Ring Dining Hall: dinner follows the day's ceremony; the Headmaster and Vice Headmaster have already spoken before sorting.")
rep(C[134], "W1 Mon Entrance Event.", "W1 Mon Entrance Event (09:00 speeches then sorting until 10:00, assigned trio tours 10:00-18:00, 19:00 feast). W1 Tue-Fri club booths 16:00-18:00, club registration closes Fri 18:00.")
# The roster lists eventual dorms for narrator continuity, not knowledge that the incoming students already possess.
N[97]['content'] += ("\nEntrance morning (Month 1 Week 1 Monday): the current year's Year 1 roster are new arrivals. "
                    "Before each student's own sorting, their listed dorm is future narrator information only: no dorm vest, resident experience, "
                    "first-hand common-room or teacher stories, or knowledge of classmates gained at Halvard yet. "
                    "A documented earlier acquaintance may know only what they actually experienced. After sorting, a Council member hands over the vest.")
rep(C[143], "W3 open.", "W3 Mon-Thu Student Council election campaign; W3 Fri 16:00-18:00 debate in the Seminar Rooms; W3 Sat 13:00-16:00 voting in the Main Courtyard replaces clubs, with results after counting.")

# ---------- 1.9.7 lore audit (owner-approved planning/DRAFT_lore_audit.md) ----------
# Stale lines that contradicted approved decisions (World Competition M11 W4 since 1.0.3), the season table of 1.9.4, and the
# owner's season notes on the Harvest Festival, the Sunreach Bay trip and Etnie's old cohort. Edited in C/N itself, so the card and
# the standalone v39 export agree; {{user}}'s current year is set per export below (card: EJS, v39: plain).
rep(C[0], "Competitions: Dorm M3W4, Academy M6W4, Kingdom M9W4, World M12W4.", "Competitions: Dorm M3W4, Academy M6W4, Kingdom M9W4, World M11W4 (abroad).")
rep(C[0], "\nCombat role.\n", "\nCombat roles: attack, defense, healing, support, control.\n")
rep(C[0], "Calendar: 12 months x 4 weeks x 7 days.", "Calendar: 12 months x 4 weeks x 7 days. Seasons: M1-3 spring, M4-6 summer, M7-9 autumn, M10-12 winter.")
# 1.11.2 (preset audit C7): setting facts the preset's Bridge used to carry belong to the card, which must work with any preset
rep(C[0], "announcement pillars (live broadcast, no recording).",
    "announcement pillars (live broadcast, no recording). No phones, computers or recording devices: messages travel by letter through the Mail Tower. Units are metric (°C, metres, kilometres, kilograms, litres).")
rep(C[0], "Ring dining hall is feast location restricted only for feast after big academy event never open for regular daily use.",
    "The Ring Dining Hall opens only for feasts after major academy events, never for daily meals.")
rep(C[18], "Month 12 is a full holiday for the whole kingdom while four students compete abroad in Week 4.",
    "Month 12 is a full holiday for the whole kingdom; the World Competition abroad is in Month 11 Week 4, before Graduation.")
rep(C[245], "The largest festival of the year, the last loud thing before exams.",
    "The largest festival of the year, the last loud thing before exams: the last harvest is in and winter is setting in, so the stalls run on braziers.")
rep(C[247], "Where: Sunreach Bay, half a day by airship.",
    "Where: Sunreach Bay, half a day by airship, a southern resort that stays warm all year: a few days of summer in Halvard's winter.")
rep(N[100], "graduated last spring without her", "graduated last year without her")

# ---------- 1.32.0 calendar (owner): Dorm Days on Sundays, Final Ranking on Monday, a longer Academy Trip, the Kingdom Competition in the capital ----------
# Same dates as data/calendar.json (engine, UI and the month entries read it).
rep(C[23], "When: Saturdays, one dorm each. Spiritual M1W4, Mystic M4W3, Elemental M8W4, Occult M10W2.",
    "When: Sundays, one dorm each. Spiritual M1W4, Mystic M4W3, Elemental M8W4, Occult M10W2.")
rep(C[237], "Month 11 Week 2 Friday.", "Month 11 Week 2 Monday.")
rep(C[246], "half a day from Halvard by airship.", "a full day from Halvard by airship.")
rep(C[247], "When: Month 11 Week 3, Monday to Wednesday.", "When: Month 11 Week 2 Saturday to Week 3 Thursday.")
rep(C[247], "Where: Sunreach Bay, half a day by airship, a southern resort",
    "Where: Sunreach Bay, a full day by airship each way (the Saturday and the Thursday are spent flying, morning to night), a southern resort")
rep(C[19], "3. Kingdom. One team per academy, four in total, knockout. Each member of the winning team earns 5,000 points.",
    "3. Kingdom. One team per academy, four in total, knockout, at the arena in the capital. Each member of the winning team earns 5,000 points. "
    "Only the teams travel: they arrive the day before and stay at a hotel near the arena, and fly home the day after. "
    "Halvard's team goes with Gavlan Haverton as its escort; the rest of the academy stays at school and follows the news.")
# ---------- 1.33.0 classes and teachers (owner-approved planning/DRAFT_classes_and_teachers.md) ----------
# The one-year rule holds only for Magic Theory, History, Etiquette and Potion Crafting; Creature Studies, Dark Magic Defense and
# the five Practical Magic classes (the old Combat Class, now one class per combat role) have one teacher for every year. Baelin
# and Althair teach too. Eight new teachers (source_original/npc_lore_staff_*). The roster's attributes feed tools/curate_data.py
# (`teaches`: "History Y2", "Creature Studies teacher for every year", "Healing class for every year").
rep(N[97], "Baelin (Elf, M, ash-blond, patient, Headmaster)", "Baelin (Elf, M, ash-blond, patient, Headmaster, History Y2)")
rep(N[97], "Althair (M, white, cheerful, Vice Headmaster)", "Althair (M, white, cheerful, Vice Headmaster, Magic Theory Y3)")
rep(N[97], "Gavlan (Elf, M, silver, stern, Combat Y1)", "Gavlan (Elf, M, silver, stern, Attack class for every year)")
rep(N[97], "Vallie (ox B, F, red, jovial, Creature Studies Y1,", "Vallie (ox B, F, red, jovial, Creature Studies teacher for every year,")
rep(N[97], "Rei (F, black, cool, Acting Warden, the old Warden's apprentice).",
    "Rei (F, black, cool, Acting Warden, the old Warden's apprentice); Hester (F, black, macabre, Healing class for every year, Head Nurse); "
    "Anselm (sheep B, M, grey wool, convoluted, Defense class for every year); Magnus (Elf, M, dark, cunning, Support class for every year); "
    "Dorian (fox B, M, russet, slick, Control class for every year); Cedric (M, grey, doomed, History Y3); Anya (F, white, serene, Etiquette Y2); "
    "Kotaro (tanuki B, M, brown, carefree, Potion Crafting Y2); Valentin (M, blond, vain, Potion Crafting Y3).")
rep(N[97], "Each teacher teaches one subject to one year level only; posts not named here (Magic Theory Y3, Etiquette Y2, History Y2-3, Combat Y2-3, Creature Studies Y2-3, Potion Crafting Y2-3) are unknown.",
    "Magic Theory, History, Etiquette and Potion Crafting have one teacher per year level; Creature Studies, Dark Magic Defense and the five "
    "Practical Magic classes (Attack, Defense, Healing, Support, Control) have one teacher each for all three years.")
rep(C[10], "Teaching staff: Teach the six academy classes, each teacher one subject to one year level only. Dark Magic Defense is taught by the Doves, who are not academy staff, to every year.",
    "Teaching staff: Teach the academy classes. Magic Theory, History, Etiquette and Potion Crafting have a different teacher for each year level. "
    "Creature Studies and the five Practical Magic classes (one per combat role) have one teacher each for all three years. "
    "Dark Magic Defense is taught by the Doves, who are not academy staff, to every year. "
    "The Headmaster and the Vice Headmaster teach a class each as well (second-year History, third-year Magic Theory).\n"
    "Free periods: now and then a teacher cannot come (called away, ill, a meeting, an emergency); the class is not held, it counts against no one, and the hour is free.")
rep(N[109], "Role: Teaching first-year Combat for two decades;",
    "Role: Teaches Attack, one of the five Practical Magic classes, to all three years at the Combat Grounds, after two decades teaching first-year Combat;")
rep(N[115], "Role: Teaching first-year Creature Studies for two years, and leads the Creature Studies Expedition for all three years;",
    "Role: Teaches Creature Studies to all three years, for two years now, and leads the Creature Studies Expedition;")
rep(N[112], "Teaches Dark Magic Defense to every year; as a Dove rather than academy staff, she is the one teacher outside the one-year rule.",
    "Teaches Dark Magic Defense to every year, as a Dove rather than academy staff.")
rep(N[112], "she secretly wishes she could join Combat Class sparring.", "she secretly wishes she could join Practical Magic sparring.")
rep(N[113], "Role: In post for forty years.", "Role: In post for forty years; also teaches second-year History himself, the one class he has never given up.")
rep(N[127], "Role: Late twenties, which is absurd for the post and the first thing anyone notices about him.",
    "Role: Late twenties, which is absurd for the post and the first thing anyone notices about him. Also teaches third-year Magic Theory, and is annoyingly good at it.")
rep(C[19], "1. Dorm. Solo, open to the whole dorm, run as a ranking tournament so every entrant finishes with a placement. Top 16 per dorm qualify.",
    "1. Dorm. Solo, open to the whole dorm, in five brackets, one per combat role, each judged by that role's Practical Magic teacher: "
    "Attack is a knockout duel; Defense holds a ring against rising attacks, longest standing wins; Healing races to treat staged injuries, "
    "judged on speed and precision; Support is paired at random with an Attack fighter of the same dorm and judged on that partner's bout; "
    "Control is a duel won by holding the opponent still for ten seconds, no injury needed. Every entrant finishes with a placement. "
    "Sixteen per dorm qualify for the Academy Competition by role, whoever goes furthest in their bracket: Attack 4, Defense 3, Healing 3, Support 3, Control 3; "
    "winning is not required. Each bracket's champion earns 100 points and its runner-up 50.")
rep(C[253], "Five roles used in Combat Class, exams and team competitions. A student may fill more than one.",
    "Five roles used in Practical Magic (one class per role), exams and team competitions. A student may fill more than one, and then attends the class of the role they want most.")
rep(C[82], "busiest after Combat Class,", "busiest after Practical Magic,")
rep(C[131], "Each academy teacher teaches one subject to one year level only; a [D] class is that same teacher taking each dorm separately. Dark Magic Defense is the exception: the Doves teach it to every year.",
    "Magic Theory, History, Etiquette and Potion Crafting have one teacher per year level; Creature Studies and the Practical Magic classes have one teacher each for all three years, and the Doves teach Dark Magic Defense to every year. A [D] class is its teacher taking each dorm separately. "
    "Practical Magic is five classes at the same hour, one per combat role (Attack, Support and Control at the Combat Grounds, Defense at the Sparring Pavilion, Healing in the Healing Ward of the Medical Centre); each student attends their own role's class with the rest of their year from every dorm. "
    "Now and then a teacher cannot come: that class is a free period, not held and counted against no one.")
STAFF_REGULARS = {'Medical Centre': ['Hester', 'Anya'], 'Staff Quarters': ['Hester', 'Kotaro'], 'Meditation Rooms': ['Anselm'],
                  "Founder's Park": ['Anselm'], 'Main Library': ['Anselm', 'Magnus'], 'Mail Tower': ['Anselm', 'Magnus'],
                  'Faculty Offices and Staff Room': ['Magnus', 'Valentin'], 'Workshop': ['Dorian'], 'Courtyards': ['Dorian', 'Anya', 'Valentin'],
                  'The Mall': ['Dorian'], 'Lecture Halls': ['Cedric', 'Anya'], 'Archive': ['Cedric'], 'Gardens': ['Cedric'],
                  'Common Rooms and Canteen': ['Cedric', 'Anya', 'Kotaro', 'Valentin'], 'The Cathedral': ['Anya'], 'Boathouse and Lake': ['Anya'],
                  'Potion Halls': ['Kotaro', 'Valentin']}
def staff_regulars(N):   # after apply_lore_edits, which renames some Regulars entries (Meditation Rooms)
    regs = {e['comment'].replace('Regulars — ', '').strip(): u for u, e in N.items() if e['comment'].startswith('Regulars — ')}
    for place, ids in STAFF_REGULARS.items():
        assert place in regs, f'staff regulars: no entry "Regulars — {place}"'
        e = N[regs[place]]
        e['content'], n = re.subn(r'^(\[Regulars — [^\]]+\][^\n]*?)\.?$', lambda m: m.group(1) + ', ' + ', '.join(ids) + '.', e['content'], count=1, flags=re.M)
        assert n == 1, place
def practical_magic_class(C):   # after add_nations (which edits the old Combat Class entry): the class becomes Practical Magic
    C[30]['comment'] = 'Classes - Practical Magic'
    C[30]['key'] = list(dict.fromkeys(['Practical Magic', 'Attack class', 'Defense class', 'Healing class', 'Support class', 'Control class'] + C[30]['key']))
    C[30]['content'] = (
        "[Practical Magic]\n"
        "Formerly called Combat Class; students still say \"Combat\".\n"
        "Purpose: Practical casting under pressure, taught by combat role. The direct feeder into all four competition tiers.\n"
        "Classes: five, one per combat role, each with one teacher for all three years: Attack (Gavlan Haverton, Combat Grounds), "
        "Defense (Anselm Graywater, the Sparring Pavilion), Healing (Hester Mortlake, the Healing Ward of the Medical Centre), "
        "Support (Magnus Tarrant, Combat Grounds), Control (Dorian Pryce, Combat Grounds). All five meet at the same time, "
        "Monday and Thursday afternoons; a role class mixes the four dorms and is taught by year.\n"
        "Roles: a student attends the class of their combat role; a student with two roles picks the one they want most. "
        "The first class of the year (Month 1 Week 1 Thursday) is a joint assessment: the five teachers watch the first-years in drills and assign their roles.\n"
        "Activity: Spellcasting drills, sparring and duels, marked by the role's own standard. Sparring partners come from one's own dorm "
        "except in Training Week; this is a class rule, not a ban on casting elsewhere.\n"
        "Covers: the five combat roles, and preparation for the Dorm and Academy Competitions.")
USER_YEAR_OLD = "{{user}} is a first-year at Halvard."
USER_YEAR_CARD = ("{{user}} is a Year <%- Math.max(1, Math.min(3, Number(getvar('stat_data.Player.Profile.Year')) || 1)) %> student at Halvard "
                  "(a first-year when the story began; Player.Profile.Year is authoritative).")
USER_YEAR_V39 = "{{user}} starts as a first-year at Halvard and moves up one year each campaign year."

# ---------- lore clarifications shared by card + v39 (D23-D25) ----------
def apply_lore_edits(C, N):
    shops = json.load(open(P('data/gift_shops.json'), encoding='utf-8'))
    C[66]['content'] += '\nGift shops inside The Mall:\n' + '\n'.join(k + ': ' + v for k,v in shops.items())
    C[66]['key'] = list(dict.fromkeys(C[66]['key'] + list(shops)))

    C[6]['content'] = (
        "The Student Council meets on Saturday mornings, 10:00-12:00, in the Student Council Chamber, in place of its members' Study Hall; members keep their own clubs in the 13:00-16:00 block. Students with an F attend their required remedial instead. "
        "It has a President, a Vice President, and members from each of the four dorms; there is no fixed membership limit. "
        "Together they handle club administration, events, student discipline, cross-dorm mediation, and speaking for students to staff.\n"
        "The President is elected each year in Month 10 Week 3: campaigning Monday-Thursday, a debate after Friday classes in the Seminar Rooms, "
        "and voting in the Main Courtyard during Saturday's club block. The President-elect names the losing candidate Vice President-elect. "
        "The serving leaders keep their authority through Graduation; the successors take office at the start of the next school year. "
        "Membership alone grants neither disciplinary immunity nor executive authority.")
    C[336] = template_from(C[233], uid=336, displayIndex=336, comment='Event - Student Council Election',
        key=['Student Council Election', 'Council election', 'presidential election', 'election campaign'],
        content=("[Student Council Election]\n"
                 "When: Month 10 Week 3, Monday through Saturday. The election chooses next year's Student Council President and Vice President.\n"
                 "Campaign, Monday-Thursday: Classes run as usual. The serving Council nominees campaign outside class through dorm conversations, brochures, posters and public promises. The current President and Vice President oversee the election; campaigning does not transfer their authority.\n"
                 "<%_ { const _y = Number(getvar('stat_data.World.Year')) || 1, _c = getvar('stat_data.Campus_State.Council') || {}, _p = (_c.Candidates || {})[String(_y)] || {}; if (_y === 1) { _%>\n"
                 "Year 1 nominees: Florian Villeneuve of Sky and Dante Kleinn of Light, both second-years and Council members since the start of the year. Florian promises visible results and stronger club support; Dante promises consistent rules and safer students.\n"
                 "<%_ } else if (_y === 2) { const second = _p.Second === (getvar('stat_data.Player.Profile.Name') || '{{user}}') ? '{{user}}' : 'Percival Applethorne'; const dorm = second === '{{user}}' ? (getvar('stat_data.Player.Profile.Dorm') || 'their dorm') : 'Viridian'; _%>\n"
                 "Year 2 nominees: Caralynn Veyturone of Fire and <%- second %> of <%- dorm %>, both second-years and Council members since the start of the year. Caralynn promises a Halvard the whole kingdom talks about: bigger festivals, a proper stage and the academy's name in every newspaper. <%- second === '{{user}}' ? '{{user}} writes their own platform.' : 'Percival promises a code of chivalry for every student: nobody left behind, the weak protected, and a knight’s oath at every Entrance Event.' %>\n"
                 "<%_ } else { _%>\n"
                 "Year 3 nominees: Hadrian Quelloris of Light and Nerys Silvarenne of Fire, both second-years and Council members since the start of the year. Hadrian promises efficiency: fewer meetings, shorter queues for the deserving, and rules that exist for a reason. Nerys promises, in the same flat voice, a weekly bread-sculpture competition and a Canteen Lucky Roll she has baked herself; at the debate she answers every question in flawless court speech.\n"
                 "<%_ } } _%>\n"
                 "Debate, Friday: Classes run as usual. After the last class, 16:00-18:00, the nominees debate in the Seminar Rooms and answer students' questions.\n"
                 "Voting, Saturday: Morning Etiquette runs as usual. Council members meet 10:00-12:00 in place of Study Hall, unless required to attend remedial. The 13:00-16:00 club block is replaced academy-wide by private presidential voting in the Main Courtyard; no ordinary club meeting takes place that afternoon.\n"
                 "Results, Saturday: After the ballots are counted, the result is announced in the Main Courtyard. The winner becomes President-elect and names the losing candidate Vice President-elect. {{user}} has one vote, not automatic control of the result.\n"
                 "Handover: The serving President and Vice President remain in office through Graduation; their successors take office at the start of the next school year."))
    rep(N[290], 'Irene, Caspian.', 'Irene, Caspian, Florian, Dante.')
    rep(N[328], 'otherwise only its own students.', 'Castor and Percival come here often; otherwise only its own students.')
    rep(N[313], 'Dante, Lenna.', 'Dante, Lenna, Vera.')
    rep(N[97], 'Florian (Sky, M, turquoise, arrogant, #3)', 'Florian (Sky, M, turquoise, arrogant, #3, Council member)')
    rep(N[97], 'Dante (Light, M, black-white, fatherly)', 'Dante (Light, M, black-white, fatherly, Council member)')
    rep(C[36], 'Wearing†: binding a spirit into a living person.', "Wearing†: binding a spirit into a living person, another's body or one's own; the same when the spirit does it under a pact.")
    rep(N[252], 'Family: Youngest child of the Ardenne family, the house behind the luxury equipment brand. Money has never been something she thinks about.',
        'Family: Second-youngest child of the Ardenne family, the house behind the luxury equipment brand. Money has never been something she thinks about. Her little brother Rigel, two years younger, is the youngest; she has treated him as her favourite toy since he could walk, and nobody else is allowed to touch him.')
    rep(C[52], "Spent mana makes the air shiver at dusk.",
        "Spent mana makes the air shiver at dusk. Beside the rings stands the Sparring Pavilion, the one building the four training areas share: equipment store, rest area, and the Duelling Club's headquarters.")
    C[52]['key'] = C[52]['key'] + ['Sparring Pavilion']
    C[267] = template_from(C[52], uid=267, displayIndex=267,
        comment="Academy Location - Academic - The Sparring Pavilion",
        key=["Sparring Pavilion", "the pavilion", "Duelling Club headquarters", "equipment store", "training gear"],
        content=("[The Sparring Pavilion] A small round pavilion with a domed roof at the far corner of the Combat Grounds, "
                 "the one building all four dorm training areas share. Inside: racks of training foci, ward-chalk and spare casting gear "
                 "signed out by bracelet; benches, a water pump and a basic first-aid chest for the walk back after a hard session; a board of "
                 "duel challenges and club standings. The club duels with spells inside warded rings, not staves. It is the Duelling Club's headquarters, the standing exception to dorm separation, so it is "
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
    rep(m, 'Festival Committee – Council Chamber;', 'Festival Committee, Student Council – Council Chamber;')
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
        "Gardens, Hills and Broken Statue 10; Archery Range, Meditation Rooms and Groundskeeper's Lodge 11; Dovecote and Noble Houses' Liaison 12; "
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
    # 1.31.0 (owner-approved planning/DRAFT_spirit_path.md, 2026-09-30): the old "Meditation Rooms / Spirit House" is two places. The
    # riad is only the Meditation Rooms now, calm and silent (the bound spirits and the unexplained sounds are gone); the spirits have
    # the Spirit Path, a footpath through the trees east of the Gymnasium (pin 38). Regulars: Caspian and Tristan (Haunts) meditate;
    # Ruby and Royhan walk their pact partners.
    C[87]['comment'] = 'Academy Location - Services - Meditation Rooms'
    C[87]['key'] = ['Meditation Room', 'Meditation Rooms', 'meditation', 'meditate']
    C[87]['content'] = ("[Meditation Rooms] An old, weathered building built like a riad: blank outer walls with few windows, every room facing inward "
        "onto a shaded central courtyard with a still, shallow pool. Moss and vines cover its walls and dense, leafy trees crowd close around it; "
        "between the thick walls and the trees, no sound from the campus gets in. Small, dim rooms with floor cushions serve will-focus training, "
        "and the courtyard is for anyone who simply needs to sit. Open to every student, for training or just to take a breath. The one house rule: "
        "speak no louder than a murmur, and leave others to their silence. Mana settles and refills faster in the silence; students come before "
        "exams and after long practicals.\n"
        "Feel: calm, serene, hushed, moss and cool stone.")
    assert 347 not in C and 347 not in N and 348 not in C and 348 not in N
    C[347] = template_from(C[269], uid=347, displayIndex=347, comment="Academy Location - Sport and Grounds - Spirit Path",
        key=["Spirit Path", "spirit walk", "lesser spirit", "lesser spirits", "first pact", "the cairns"],
        content=("[Spirit Path] A narrow footpath that leaves the grounds behind the Gymnasium and winds through old trees along the eastern edge of "
                 "the academy, a loop short enough to walk in a quarter of an hour. Spirits like it here: the air under the trees is still and green, "
                 "lesser spirits drift among the roots and branches, and small stone cairns that students have stacked over the years mark the way. "
                 "Spirit users bring their pact partners here to let them out for a short walk. It is also where beginners come to meet a lesser "
                 "spirit and try their first Spirit Pact; the custom is to go slowly, offer something small, and let the spirit choose. Almost any "
                 "Occult student can bond a lesser spirit; a pact is a lasting contract, and the Occult teachers expect to be told of one. Anyone may "
                 "come to watch: a stone bench at each bend faces the trees, and at dusk and dawn the lesser spirits are easy to see, a flicker in the "
                 "ferns, a small light keeping pace along a branch. Most are shy; now and then one comes close out of curiosity, and it is considered "
                 "lucky to be looked over and left in peace.\n"
                 "Feel: green, dappled, hushed, quietly watched (never unkindly)."))
    rep(N[314], "[Regulars — Meditation Rooms / Spirit House] Caspian, Ruby, Royhan.", "[Regulars — Meditation Rooms] Caspian, Tristan.")
    N[314]['comment'] = "Regulars — Meditation Rooms"
    N[314]['key'] = ['Meditation Room', 'Meditation Rooms', 'meditation', 'meditate']
    N[348] = template_from(N[314], uid=348, displayIndex=348, comment="Regulars — Spirit Path", key=["Spirit Path", "lesser spirit", "the cairns"],
        content="[Regulars — Spirit Path] Ruby, Royhan, Florian.")   # 1.31.1 (owner): Florian walks Hades here
    # 1.31.0 (owner-approved planning/DRAFT_restore_places.md and DRAFT_location_activities.md): why a place restores, the Cathedral's
    # service, the bell-keeper's shift, letters home, and talk in the laundry
    def add_to_first(uid, text):
        e = C[uid]; lines = e['content'].split('\n'); i = next(n for n, l in enumerate(lines) if l.startswith('['))
        lines[i] = lines[i].rstrip() + ' ' + text; e['content'] = '\n'.join(lines)
    add_to_first(64, "A long soak here takes the ache out of anything short of an injury.")
    add_to_first(63, "Talk carries over the rune tubs, and half the rumours on campus pass through here.")
    add_to_first(47, "On a fair day, an hour on the grass restores more than an hour anywhere indoors.")
    add_to_first(82, "The ward's beds are for the injured first, but a nurse will let an exhausted student lie down for an hour.")
    add_to_first(90, "A service is held every Sunday morning, from nine to eleven, and the pews are open every day for anyone who wants to sit in "
                     "quiet. Students of every dormitory come: some to pray, some for the singing, some because it is the one place a conversation "
                     "with a stranger does not seem strange. Mana comes back a little faster in the quiet of the nave; the clergy call it Asmoday's "
                     "grace, the academy calls it the silence, and both are glad to see students on the pews.")
    add_to_first(254, "Sitting among the oak's roots, a mage feels their mana refill like water finding its level.")
    add_to_first(48, "A bell-keeper looks after the bells and their ropes, and takes on a student for a paid shift now and then.")
    add_to_first(70, "Students write home from the desks on the sorting floor; a reply takes about a week, and sometimes a small parcel comes with it.")
    add_world_myths(C)
    add_nations(C)

# 1.7.1 World Myth (owner-approved 2026-09-27, planning/DRAFT_world_myth.md): five continent-wide myths, the same size and settings
# as the Superstition entries, linked to each other, and a short mention in the entries that should know they exist (like the brands).
WORLD_MYTHS = [
    (273, "The Devoured Kingdom", ["Azathoth", "Lord of All", "Primal Desert", "Devoured Kingdom"],   # 1.7.2: Arslan keys -> its nation entry
     "[The Devoured Kingdom]\n"
     "Story: thousands of years ago, a king made a pact with Azathoth, Lord of All, greatest of Asmoday's spirits. Its price was his whole kingdom, "
     "devoured to the last stone; the Primal Desert, where the Arslan Sultanate stands today, is what remains.\n"
     "Told: everywhere, always beside the First Bargain.\n"
     "Lesson: a lawful pact can still cost everything.\n"
     "Status: the terms, the king and the kingdom's name are all forgotten."),
    (274, "The Four Who Saved the World", ["King of Knights", "Lady of the Lake", "Empress of the Fractured Vow", "Fractured Vow", "four heroes",
                                          "Four Who Saved the World"],
     "[The Four Who Saved the World]\n"
     "Story: when the First Bargain nearly ended the world, four heroes saved it: the King of Knights from the north, the Archmage from the east, "
     "the Lady of the Lake from the south, the Empress of the Fractured Vow from the west.\n"
     "Told: across the continent; each land calls its own hero the greatest. Eldrasil, in the east, claims the Archmage.\n"
     "Lesson: no land saves the world alone.\n"
     "Status: their names and faces are lost. Some say each carried one of the four fractured magics.\n"
     "<narrator_only>The Archmage's part was sealing what shone. Lucifer has called them the thief ever since.</narrator_only>"),
    (275, "The First Bargain", ["First Bargain", "magic was whole", "fractured into four", "why four types"],
     "[The First Bargain]\n"
     "Story: when magic was still whole, a mortal bargained with something that shone brighter than any star and asked for all of magic. "
     "The bargain was kept to the letter, and the world nearly broke. Magic was then fractured into four; nearly every mage since is born to one type.\n"
     "Told: everywhere; Dark Magic Defense opens its Pacting lesson with it.\n"
     "Lesson: never make a pact with anything but a spirit.\n"
     "Status: the mortal is forgotten. The Cathedral says Asmoday fractured magic to save her world.\n"
     "<narrator_only>What shone was Lucifer. Freed, he could give any magic to anyone again.</narrator_only>"),
    (276, "The Holy Grail", ["Holy Grail", "the Grail", "wish-granting cup"],
     "[The Holy Grail]\n"
     "Story: a cup that grants any wish to whoever drinks from it. Some say the Lady of the Lake hid it after the First Bargain, "
     "so no one could wish the world broken again.\n"
     "Told: everywhere; the favourite tale of treasure hunters.\n"
     "Lesson: every wish has a shape the wisher did not see.\n"
     "Status: where it is, what it looks like and whether it was ever real are unknown. It is not Ashvale's Elixir, which only heals."),
    (277, "The Shaping of the World", ["Shaping of the World", "creation myth", "how the world was made", "Goddess of Creation"],
     "[The Shaping of the World]\n"
     "Story: before anything there was formless dark. Asmoday, Goddess of Creation, shaped it: first the spirits, then land, sea, sky and every "
     "living thing. Last, mortals were born from the soil of her world, and she gave them magic to shape things too.\n"
     "Told: by the Cathedral word for word; the version most children grow up with.\n"
     "Lesson: what you shape, you answer for.\n"
     "Status: the Cathedral teaches it as truth; History Class leaves it to the Cathedral.\n"
     "<narrator_only>The last line is the goddess wearing another's credit: Lucifer made magic, not Asmoday.</narrator_only>"),
]
# 1.7.2 Nations (owner-approved 2026-09-27, planning/DRAFT_nations.md): five nations with the settings of Sunreach Bay (uid 246),
# each with its own trade, and woven into the entries that should know they exist (WORLD INDEX, Kingdom, the World Competition...).
NATIONS = [
    (278, "Arslan Sultanate", ["Arslan Sultanate", "Arslan", "World Bank", "the Sultan"],
     "[Arslan Sultanate]\n"
     "What: a sultanate in the Primal Desert, where the Devoured Kingdom once stood, and the money capital of the world. The desert grows nothing, "
     "so the whole country trades: bankers, brokers and moneylenders.\n"
     "Known for: the World Bank, in its capital, which sets what every nation's coin is worth and lends to every crown, Eldrasil's included.\n"
     "People: rich, exact, and very polite to anyone who owes them.\n"
     "Status: the sand still turns up stones of the devoured kingdom. Nobody digs deeper than they have to."),
    (279, "Norvaine", ["Norvaine", "Yog-Sothoth", "Lord of the Cosmos", "Chosen of the Cosmos"],
     "[Norvaine]\n"
     "What: the richest kingdom of the north, with the strongest army on the continent. For generations its kings have held a pact with "
     "Yog-Sothoth, Lord of the Cosmos, a Spirit Lord; each heir inherits it with the crown.\n"
     "Export: starglass, a glass that holds the night sky; the finest telescope lenses and scrying crystals in the world.\n"
     "Star Night: at midnight, over the royal castle, every star becomes an eye and every comet a tentacle.\n"
     "Price: at that midnight Yog-Sothoth takes one person, the Chosen of the Cosmos, erased from the world's memory with every proof they "
     "existed and their soul. The kingdom remembers the rule, never the person.\n"
     "People: they fear Yog-Sothoth, revere it, and bow to the sky every Star Night.\n"
     "Status: nobody knows what the kings gained, or why the Chosen are taken."),
    (333, "Velmora", ["Velmora", "Velmoran"],
     "[Velmora]\n"
     "What: an old kingdom on Eldrasil's northern border: green valleys and walled orchards between Eldrasil and the north. "
     "Its court is the most formal on the continent.\n"
     "Known for: diplomats, dancing masters and etiquette tutors, hired by noble houses everywhere; anyone who wants to sound well-bred "
     "copies Velmoran court manners.\n"
     "Ties: a long, quiet friendship with Eldrasil's crown.\n"
     "Status: Velmorans abroad are gracious, careful, and never discuss their king.\n"
     "<narrator_only>Behind the manners, the succession is a blood sport: the king lets his children fight for the crown, and betrayal, "
     "coups, assassination and blackmail are all fair. Whoever is left standing is heir.</narrator_only>"),
    (334, "Caelmar", ["Caelmar", "Caelmari", "city of layers"],
     "[Caelmar]\n"
     "What: a nation that is a single city in the west, as wide as a kingdom, built hundreds of floors into the sky and dozens deep into "
     "the earth, split into hundreds of districts and dozens of layers.\n"
     "Rule: the king lives on the highest layer, above the clouds; the lower you live, the less you matter.\n"
     "Below: the deepest layers are slums that never see the sun, where the city's refuse, workshops and outlaws collect.\n"
     "Export: the continent's workshop. Mana lanterns, rune heaters, pens, locks, anything made by the thousand comes up from the lower layers.\n"
     "Status: most Caelmari die on the layer they were born on."),
    (335, "Yozakura", ["Yozakura", "Yozakuran", "Alpha of Yozakura"],
     "[Yozakura]\n"
     "What: a kingdom in the south of the continent, mostly Beastkin, known for cherry blossoms and courtesy. Its companies run hotels, "
     "restaurants, bathhouses and airship lines all over the world.\n"
     "Rule: the throne is won, not inherited. A grand tournament crowns the ruler, titled Alpha, who reigns until beaten in the next one.\n"
     "Known for: a passion for competing in everything, from academy duels to cooking contests; its team is always a favourite at the "
     "World Competition. Its smiths forge the katana, the finest blade a mage can hold.\n"
     "Status: a Yozakuran never refuses a fair challenge."),
]
def add_nations(C):
    for uid, name, keys, content in NATIONS:
        assert uid not in C and uid not in N, f'nation uid {uid} is taken'
        C[uid] = template_from(C[246], uid=uid, displayIndex=uid, comment="Nation — " + name, key=keys, content=content)
    rep(C[0], "Sunreach Bay: foreign resort nation, academy Trip destination.",
        "Nations: Sunreach Bay (resort, academy Trip destination), the Arslan Sultanate (money; the World Bank), Norvaine (the strongest army; "
        "Yog-Sothoth), Velmora (the most formal court), Caelmar (a hive city), Yozakura (Beastkin, service companies, rulers crowned by tournament).")
    rep(C[1], "Sunreach Bay, Velmora and the Arslan Sultanate are named.",
        "Sunreach Bay, Velmora, the Arslan Sultanate, Norvaine, Caelmar and Yozakura are named.")
    rep(C[19], "Eldrasil has never won in living memory.",
        "Eldrasil has never won in living memory. Nations at the World Competition include Yozakura, Norvaine and Caelmar, the usual favourites, "
        "the Arslan Sultanate, Velmora and Sunreach Bay.")
    # 1.13.1 (owner, 2026-09-29: "ubah sedikit entry event bazaar untuk mention kingdom kingdom luar"): the traders abroad are the
    # five nations of planning/DRAFT_nations.md, each with its approved trade
    rep(C[243], "foreign fashion, items nobody can explain.",
        "foreign fashion, items nobody can explain.\n- From abroad: Yozakuran tea, blossom sweets and a smith's katana far more students admire than "
        "can afford; Norvaine starglass lenses and scrying crystals; Caelmari mana lanterns, rune heaters and locks by the crate; Velmoran "
        "orchard preserves and court fashion; and Arslan brokers who change the coin of every crown.")
    # 1.13.2 (owner, 2026-09-29: "agree semua point 3"): the visual lore of planning/DRAFT_event_maps.md [?1]-[?7], so the narrator
    # tells what the season and event maps show; Eldrasil's royal colours are deep blue and gold
    rep(C[243], "change the coin of every crown.",
        "change the coin of every crown. Each nation's traders keep to their colours: Yozakuran blossom pink and paper lanterns, "
        "Velmoran green and ivory, Arslan desert gold.")
    rep(C[254], "Patrols turn students back at dusk, and nobody answers their name out here after dark.",
        "Patrols turn students back at dusk, and nobody answers their name out here after dark. In winter the clearing stays green "
        "and in flower while snow lies everywhere around it.")
    rep(C[96], "- Ends with a feast in the Ring Dining Hall.",
        "- Ends with a feast in the Ring Dining Hall.\n- From dusk to dawn the renewed wards are visible: a thin shell of pale-gold "
        "rune light rising from the outer wall over the grounds.")
    # 1.14.4 (owner, 2026-09-29: "untuk kembang api dan airship edit lore agar sesuai map"): the Crowning night map puts the
    # fireworks over the lake beyond Willow Island (watched from the Hills and the shore, as at the Harvest Festival's close) and the
    # airship at the edge of the grounds beyond the Menagerie and the Gymnasium
    rep(C[24], "Night: fireworks over the Grassy Field and Hills; curfew moves to 10pm.",
        "Night: fireworks over the lake, bursting beyond Willow Island and doubled in the water, watched from the Grassy Field and Hills "
        "and the shore; curfew moves to 10pm.\nThe royal banners, deep blue and gold, fly from the castle towers all day; that night the "
        "hired airship rides at anchor at the edge of the grounds, beyond the Menagerie and the Gymnasium.")
    rep(C[1], "- Eldrasil has never won the World Competition in living memory.",
        "- Eldrasil has never won the World Competition in living memory.\n- The royal colours are deep blue and gold.")
    rep(C[9], "Mood: a week of hearing things through the walls.",
        "- The wards along the outer wall flicker faintly all week, and the birds leave the grounds until it is over.\n"
        "Mood: a week of hearing things through the walls.")
    rep(C[241], "Stalls take points.",
        "Stalls take points. Its great tent is striped crimson and cream, and its painted wagons park inside the wall by the Gatehouse.")
    rep(C[245], "Nothing judged, no tally.",
        "Nothing judged, no tally. The older corridors turned haunted houses glow a sickly green from outside.")
    rep(C[22], "A wish made during it is believed to come true.",
        "A wish made during it is believed to come true.\n- Far to the north, the same midnight is the one Norvaine dreads: the night Yog-Sothoth takes its Chosen.")
    rep(C[28], "and conduct at Graduation.",
        "and conduct at Graduation. Its lessons on noble conduct follow Velmoran court manners, the continent's standard.")
    rep(C[30], "Drills, sparring and marking are adjusted to each student's combat role.",
        "Spellcasting drills, sparring and marking are adjusted to each student's combat role.")
    rep(C[55], "Enchantment sparks hang in the air a moment too long.",
        "Enchantment sparks hang in the air a moment too long. Its lathes and tool racks are Caelmari-made.")
    rep(C[66], "The top deck belongs to the practice studios and meditation nooks.",
        "The top deck belongs to the practice studios and meditation nooks. Its busiest tea house is a Yozakuran chain.")
    rep(C[81], "Instruments turn by themselves at night.",
        "Instruments turn by themselves at night. Its great telescope has a Norvaine starglass lens, the Divination Society's pride.")
    rep(C[83], "reagents and equipment on the back shelves.",
        "reagents and equipment on the back shelves. Its cheap stationery and everyday kit are Caelmari-made.")
    rep(C[91], "Students who do not catch its attention usually never learn it exists.",
        "Students who do not catch its attention usually never learn it exists. Its protocol follows Velmoran court manners.")
    rep(C[92], "It stands outside the mall, so a visit is a deliberate errand.",
        "It stands outside the mall, so a visit is a deliberate errand. A branch of the World Bank of the Arslan Sultanate; its clerks answer to "
        "the Sultanate, not the academy.")
    rep(C[219], "is the clearest daily sign that it is working.",
        "is the clearest daily sign that it is working. Most lanterns and wall torches are Caelmari-made, bought by the thousand.")
    rep(C[231], "Nothing aboard records or sends anything.",
        "Nothing aboard records or sends anything. Most airship lines on the continent are Yozakuran companies, and so are their crews.")
    rep(C[246], "Policy: gives you whatever you came for and asks no questions.",
        "Policy: gives you whatever you came for and asks no questions.\nHalf its hotels are Yozakuran.")
    rep(C[248], "the Dovecote, the Bank,", "the Dovecote, the World Bank (Arslan Sultanate),")
    # 1.14.1 (owner, 2026-09-29: "edit agar graduation event ada vibes winter chrismast vibenya dengan stall, boneka salju dsb"): a
    # winter farewell market, the Farewell Pine and the graduates' airship; no Christmas in this world, so no name for it
    rep(C[248], "Offers made and refused on the spot.",
        "Offers made and refused on the spot.\nFarewell market: from noon the Main Courtyard is a winter market for the day. Clubs and dorm "
        "floors run stalls of hot cider, roasted chestnuts, sweets and small farewell gifts under evergreen garlands and strings of lanterns, "
        "and families browse them between the ceremony and the tables. If there is snow, each dorm builds a snowman in its colours at the "
        "courtyard's edge. At the centre stands the Farewell Pine, a tall evergreen hung with ribbons: underclassmen tie one for each "
        "graduate they will miss, a wish written on it, and graduates look for their own before the feast. The market spills down into "
        "Founder's Park, the one winter day its lawns are full: more stalls between the paths, snowmen built by anyone with cold hands, "
        "and a small wooden stage by the statue where the Music Club plays through the afternoon and graduates are pulled up to sing.")
    rep(C[248], "the first day of the Kingdom-wide holiday.",
        "the first day of the Kingdom-wide holiday. Their airship arrives at dusk and rides at anchor above the Grassy Field overnight, "
        "lit like a lantern.")

def add_world_myths(C):
    for uid, title, keys, content in WORLD_MYTHS:
        assert uid not in C and uid not in N, f'world myth uid {uid} is taken'
        C[uid] = template_from(C[222], uid=uid, displayIndex=uid, comment="World Myth - " + title, key=keys, content=content)
    rep(C[0], "Kingdom: Eldrasil.", "Kingdom: Eldrasil, in the east of the continent.")
    rep(C[0], "Taken (never answer your name after dark).",
        "Taken (never answer your name after dark).\nWorld myths, told across the continent, not history: the Devoured Kingdom (Azathoth), "
        "the Four Who Saved the World, the First Bargain (why magic has four types), the Holy Grail, the Shaping of the World (Asmoday).")
    rep(C[1], "Other nations: exist; Sunreach Bay and Velmora are named.",
        "Location: the east of the continent.\nOther nations: exist; Sunreach Bay, Velmora and the Arslan Sultanate are named.")
    rep(C[1], "- Eldrasil has never won the World Competition in living memory.",
        "- Eldrasil has never won the World Competition in living memory.\n- Eldrasil claims the Archmage of the Four Who Saved the World as its own hero.")
    rep(C[3], "Site description: The resting place of the Archmage, full of treasure and spellbooks.",
        "Site description: The resting place of the Archmage, full of treasure and spellbooks.\n"
        "Veyra calls itself the hero's academy: the Archmage of the Four Who Saved the World rests beneath it.")
    rep(C[17], "Spirit Pact and Spirit Tiers.",
        "Spirit Pact and Spirit Tiers.\nThe First Bargain is the folk answer to why magic has four types; Magic Theory teaches the structure and leaves the story to Dark Magic Defense.")
    rep(C[27], "and the academy records in the Archive.",
        "and the academy records in the Archive.\nDraws the line between myth and record: the Four Who Saved the World and the First Bargain are legend; the Archmage's seals are history.")
    rep(C[32], "Defensive drills against staff-cast approximations.",
        "Defensive drills against staff-cast approximations. The lesson on Pacting opens with the First Bargain.")
    rep(C[56], "In exam weeks, Firetooth tins and Star Cookies cover the study tables.",
        "In exam weeks, Firetooth tins and Star Cookies cover the study tables. A battered book of world myths (the Holy Grail, the Four Who Saved the World) "
        "is the most borrowed title in a first-year's first month.")
    rep(C[90], "teach that Asmoday created magic and gifted it to mortals.",
        "teach that Asmoday created magic and gifted it to mortals. Every service opens with the Shaping of the World; the clergy teach that Asmoday fractured magic after the First Bargain.")
    rep(C[93], "The Archmage was a coward.",
        "The Archmage was a coward. Tells the First Bargain as scripture: the mortal asked well, and the thief punished the world for it.")
    rep(C[94], "Every mage's mana is his light.",
        "Every mage's mana is his light. He was what shone in the First Bargain. He kept that bargain to the letter, and remembers the mortal fondly.")
    rep(C[122], "not forbidden Pacting.",
        "not forbidden Pacting. Every pact-holder has heard the Devoured Kingdom: Azathoth, Lord of All, took a whole kingdom as its price.")

CAL_M4_OLD = "W2 Tue Independence Crowning Day (kingdom holiday, celebrated on campus)."
CAL_M4_NEW = "W2 Tue Independence Crowning Day (kingdom holiday: the academy flies to the capital by airship; fireworks on campus at night)."
ROY_OLD = re.compile(r'Current trouble: This year, his last, he finally qualified from the Dorm Competition at rank 16, but no team will take him, since "illusionist-alchemist" doesn\'t count as a role\.')

# 1.14.0 (owner-approved planning/DRAFT_dynamic_lore.md, 2026-09-29: "semua saya approve"): lore that follows the calendar.
# Season lines by calendar month (the engine's 1.9.4 table, so Weather Off does not matter): the card prints only the current
# season's line (EJS); the v39 export keeps all four as "In <season>: ..." lines (tools/curate_data.py lifts them into the UI's
# location data). Phase lines (exam weeks, the week before a long break) print only while they apply; in v39 they stay as they were.
SEASON_MONTHS = {'spring': (1, 3), 'summer': (4, 6), 'autumn': (7, 9), 'winter': (10, 12)}
SEASONAL = {
    263: {'winter': "Hardly anyone climbs to the Old Hut in winter: snow drifts against the door, the path over the Hills disappears, and a secret told there in the cold is one someone went to real trouble for."},
    76: {'spring': "Kites go up on every windy afternoon.", 'summer': "Long evenings on blankets until the eight o'clock bell.",
         'autumn': "The grass turns gold and the wind picks up.", 'winter': "The slopes become sledding runs, on trays borrowed from the Canteen."},
    77: {'spring': "Foraging season opens: wild garlic and early greens at the edges.", 'summer': "The canopy closes and the Forest is at its darkest by day.",
         'autumn': "Mushrooms and nuts; Creature Studies warns about the ones that look alike.",
         'winter': "Dusk comes early, so the patrols turn students back from the treeline by late afternoon; tracks in the snow show what else walks there."},
    254: {'spring': "The flower field comes in weeks before anything else on campus."},
    78: {'spring': "Rowing season opens once the water warms.", 'summer': "The lake is at its busiest: rowers, swimmers off the jetty, the Fishing Club at dawn.",
         'autumn': "Morning mist sits on the water until mid-morning.",
         'winter': "The boats are stored, ice forms along the shallows, and the boathouse lends a boat only on a still, mild day."},
    269: {'winter': "The fireflies stay all winter, even over the ice, which Creature Studies cannot explain."},
    268: {'winter': "A stove burns in the hut, and the dawn regulars fish from the end of the dock through the mist."},
    79: {'spring': "Planting season: seedling rows under glass cloches.", 'summer': "Everything overgrows; the Gardening Club weeds daily.",
         'autumn': "The harvest comes in for the Harvest Festival.",
         'winter': "The beds sleep under straw and snow; the reagents grow on in the greenhouses, which glow warm through the dark afternoons."},
    80: {'spring': "Young ones are born and the handlers barely sleep.",
         'winter': "The animals grow thick coats, the pens are strawed deep, and the smaller specimens sleep through the cold in heated boxes."},
    85: {'autumn': "Groundskeeping rakes leaves from dawn.", 'winter': "Groundskeeping clears the paths of snow before the seven o'clock bell."},
    72: {'winter': "Once the snow settles the field closes; the Soccer and Running Clubs move into the Gymnasium and onto the cleared paths."},
    74: {'summer': "Crowded from the last class to the eight o'clock bell.",
         'winter': "The rune-warmed water steams in the cold; the Swimming Club trains through it and sprints the few steps to the Gymnasium."},
    73: {'winter': "It is shared by every club that normally trains outside, and booking slots are fought over."},
    47: {'spring': "The first warm day fills every lawn.", 'summer': "Busiest of all: picnic blankets from lunch to dusk.",
         'autumn': "Leaf piles along the paths, and the benches move into the last sun.",
         'winter': "The benches stand empty, snowmen appear on the lawns overnight, and the exam-morning queue to the Founder's Hand stamps a path through the snow."},
    71: {'summer': "Students chase the shade around the stone.", 'winter': "Swept stone in the middle, snowball fights in the drifts at the edges."},
    255: {'summer': "Every corner is taken at sunset.", 'winter': "The lead roofs ice over and even the couples stay away."},
    81: {'summer': "Short nights; the Divination Society waits for midnight.",
         'winter': "Winter nights are the clearest and the coldest; the Divination Society works in coats and gloves."},
    262: {'spring': "The inner oak comes into new leaf.", 'summer': "Deep shade over the meditation stones.",
          'autumn': "The oak turns gold and leaves drift into the common area.", 'winter': "Bare branches over the roofline; the meditation stones sit under snow."},
    260: {'summer': "The dome turns the common area into a greenhouse by afternoon.",
          'winter': "Snow slides off the warm glass dome, which glows brighter against the early dark."},
    259: {'summer': "The hearth burns anyway, and the common room is the hottest place on campus.", 'winter': "The hearth is the envy of the other three dormitories."},
    61: {'summer': "Windows open, and the arguments carry outside.", 'winter': "Everyone crowds the heaters and the kettle never cools."},
    64: {'winter': "The most crowded room in each dorm after dinner."},
    62: {'spring': "Spring greens and new potatoes.", 'summer': "Cold soups, fruit, iced tea.", 'autumn': "Stews and roast squash.",
         'winter': "Porridge, thick broth and second helpings."},
    66: {'summer': "The Sunfizz counter queue reaches the door.", 'winter': "The warmest crowded place on campus; nobody hurries out."},
    82: {'summer': "Sunburn and sports injuries.", 'winter': "The winter cold that goes round campus fills its ward with head colds."},
    87: {'winter': "The bare vines let more pale light into the courtyard, and the pool wears a thin skin of ice."},
    347: {'spring': "Lesser spirits are thickest when the new leaves come; the path is busy with first-years.",
          'autumn': "Fallen leaves stir on windless days. It is only the spirits.",
          'winter': "Snow shows small tracks that stop in the middle of the path."},
}
EXAM_WEEK = "[3, 5, 9, 11].includes(+_w.Month) && +_w.Week === 1"
PHASES = [   # (uid, sentence already in the entry or None, card gate on _w = World, line printed while it applies)
    (56, " In exam weeks, Firetooth tins and Star Cookies cover the study tables.", EXAM_WEEK,
     "In exam weeks, Firetooth tins and Star Cookies cover the study tables."),
    (59, None, "([2, 4, 8, 10].includes(+_w.Month) && +_w.Week >= 3) || (" + EXAM_WEEK + ")",
     "Every slot is booked; fights over booking slots are at their worst."),
    (47, ", with a queue that snakes across the lawn on exam mornings", EXAM_WEEK + " && ['Mon', 'Tue', 'Wed', 'Thu'].includes(_w.Day) && String(_w.Time || '') < '12:00'",
     "This exam morning a queue snakes across the lawn to the Founder's Hand."),
    (70, None, "(+_w.Month === 5 && +_w.Week === 3) || (+_w.Month === 11 && +_w.Week === 4)",
     "Before the long breaks the sorting floor overflows with parcels going home."),
]
def apply_dynamic_lore(C, ejs):
    for uid, lines in SEASONAL.items():
        assert uid in C and lines, f'seasonal lore: no entry {uid}'
        order = [s for s in SEASON_MONTHS if s in lines]
        if not ejs:
            C[uid]['content'] += '\n' + '\n'.join(f'In {s}: {lines[s]}' for s in order)
            continue
        conds = [f"_sm >= {SEASON_MONTHS[s][0]} && _sm <= {SEASON_MONTHS[s][1]}" for s in order]
        body = "\n<%_ { const _sm = Number(getvar('stat_data.World.Month')) || 1; _%>"
        for i, s in enumerate(order):
            body += f"\n<%_ {'} else ' if i else ''}if ({conds[i]}) {{ _%>\nIn {s}: {lines[s]}"
        C[uid]['content'] += body + "\n<%_ } } _%>"
    for uid, old, gate, line in PHASES:
        if not ejs:
            if uid == 70: C[uid]['content'] += '\n' + line   # the only new text; it says itself when it applies
            continue
        if old is not None: rep(C[uid], old, '')
        C[uid]['content'] += "\n<%_ { const _w = getvar('stat_data.World') || {}; if (" + gate + ") { _%>\n" + line + "\n<%_ } } _%>"

def batch3_magic_canon(C, N):
    """Apply the public club name to both exports after all cohort/calendar edits."""
    for D in (C, N):
        for e in D.values():
            e['content'] = re.sub(r'(?<!Magic )Duelling Club', 'Magic Duelling Club', e['content'])
            e['key'] = [re.sub(r'(?<!Magic )Duelling Club', 'Magic Duelling Club', k) for k in e.get('key', [])]
    rep(C[132], 'Club venues: Duelling – Combat Grounds', 'Club venues: Magic Duelling Club – Combat Grounds')
    rep(C[132], 'Walking times are measured FROM Main Courtyard', 'Ordinary walking estimates (minutes) are measured FROM Main Courtyard')
    # 1.24.2 (owner): every year's Lecture Hall floor has Study Rooms (and lockers), so second- and third-years have their own
    rep(C[132], 'Floor 3: second-year Lecture Halls, Seminar Rooms,', 'Floor 3: second-year Lecture Halls with their own Study Rooms, Seminar Rooms,')
    rep(C[132], 'Floor 4: third-year Lecture Halls, the four', 'Floor 4: third-year Lecture Halls with their own Study Rooms, the four')
    rep(C[132], 'Movement: adjacent places are reached directly, usually in four or five minutes. Characters do not pass through the Courtyard to reach a neighbour. Crossing between distant clusters does take real time; say so rather than skipping it.',
        'Movement: adjacent places are reached directly, usually in four or five minutes on foot. Characters do not pass through the Courtyard to reach a neighbour. Crossing distant clusters on foot takes time. A described speed spell can shorten the actual route according to its effect and mana cost; never impose the walking estimate on magical travel.')
    rep(C[0], 'Casual casting is normal and allowed anywhere on campus;', 'Casual casting, including ordinary movement magic, is normal and allowed anywhere on campus;')
    rep(C[0], 'and anything that damages property or endangers people.', 'and anything that damages property or endangers people. Doves intervene for an actual restriction, harm, or established suspicion, not for an ordinary safe spell.')
    rep(C[26], 'full magical duelling in a warded ring, never swordplay or fistfights.', 'spell duelling inside warded rings, never swordplay, staves or fistfights. Practice with spells also stays in the rings.')
    rep(N[415], 'Club: Magic Duelling Club, where she has asked every member for a match and is in the Sparring Pavilion before dawn every day.',
        'Club: Magic Duelling Club, where she has asked every member for a match and is in the Sparring Pavilion before dawn every day. In club bouts her blade channels Astral spells inside an outdoor warded ring; mundane sword cuts alone are not a club duel.')

def formal_and_far_grounds(C, N):
    """1.15.1 (owner, 2026-09-29). Speeches: "sebelum feast ada speech dari headmaster dan vice headmaster. ini jadi pola setiap awal
    event formal dan setiap akhir event formal/setiap feast" (v38 already had it for the Entrance Feast). Distances: the Fishing
    House is three minutes along the shore from the boathouse; the Lake, the Grassy Field and Hills and the Forest are wide and far
    ("boathouse ke garden itu bukan 4 menit tapi 20 menit"); the numbers are the paths tools/curate_data.py computes (FAR_LEGS)."""
    rep(C[0], "The Ring Dining Hall opens only for feasts after major academy events, never for daily meals.",
        "The Ring Dining Hall opens only for feasts after major academy events, never for daily meals. Every formal academy event opens "
        "with speeches from Headmaster Baelin and Vice Headmaster Althair, and they speak again at its close: every feast begins with "
        "their speeches before the food is served.")
    rep(C[21], "dinner follows the day's ceremony; the Headmaster and Vice Headmaster have already spoken before sorting.",
        "Headmaster Baelin and Vice Headmaster Althair speak again before dinner is served.")
    rep(C[96], "- Ends with a feast in the Ring Dining Hall.", "- Ends with a feast in the Ring Dining Hall, opened by the Headmaster's and Vice Headmaster's speeches.")
    rep(C[25], "Evening: feast in the Ring Dining Hall.", "Evening: the Headmaster and Vice Headmaster speak, then the feast in the Ring Dining Hall.")
    rep(C[237], "Arbiter Hall assembly: trial results given stage by stage,",
        "Arbiter Hall assembly: the Headmaster and Vice Headmaster open it with speeches, then the trial results are given stage by stage,")
    rep(C[237], "Evening: feast in the Ring Dining Hall.", "Evening: the Headmaster and Vice Headmaster speak, then the feast in the Ring Dining Hall.")
    rep(C[248], "The Headmaster speaks, dorm heads", "The Headmaster and Vice Headmaster speak, dorm heads")
    rep(C[248], "Evening: feast; graduates", "Evening: the Headmaster and Vice Headmaster speak once more, then the feast; graduates")
    if "19:00 feast)." in C[134]['content']:
        rep(C[134], "19:00 feast).", "19:00 speeches and feast).")
    # 1.15.2 (owner, 2026-09-29): Remembrance Day has speeches from the Headmaster, the Vice Headmaster and Acting Warden Rei before
    # the lantern release (replaces v38's "not asked to speak"; "rei tetap tidak suka speak tpi dia tahu ini kewajiban warden"); Crowning Day opens with the Headmaster's and Vice Headmaster's
    # speeches before the academy boards the airship
    rep(C[244], "The Acting Warden attends and is not asked to speak.", "Acting Warden Rei Kestrane attends.")
    rep(C[244], "Evening: lantern release on the Grassy Field and Hills, one lantern per person.",
        "Evening: on the Grassy Field and Hills, Headmaster Baelin, Vice Headmaster Althair and Acting Warden Rei speak, then the lantern "
        "release, one lantern per person.")
    rei = N if 118 in N else C
    rep(rei[118], "Attends Remembrance Day and is never asked to speak.",
        "Has no patience for ceremonial speeches (formal addresses only: she is not shy, and in conversation she stays as blunt and "
        "self-assured as ever), and still gives one at Remembrance Day, after the Headmaster and Vice Headmaster and before the lantern "
        "release, because it is the Warden's duty: short and plain, no ceremony, then she steps back.")
    rep(C[24], "Morning: the whole academy flies by airship to the capital.",
        "Morning: Headmaster Baelin and Vice Headmaster Althair speak to the assembled academy, then everyone boards the airship to the capital.")
    # distances
    m = C[132]
    rep(m, "Boathouse/Lake – Fishing House (beside the boathouse)", "Boathouse/Lake – Fishing House (three minutes along the shore from the boathouse)")
    rep(m, "The Mall – Medical Centre, Commissary (each its own building beside it)",
        "The Mall – Medical Centre, Commissary (each its own building, three or four minutes' walk from it)")
    rep(m, "Gardens, Hills and Broken Statue 10;", "Gardens and Broken Statue 10;")
    rep(m, "Menagerie and Observation Tower 13; Combat Grounds, Gymnasium, Swimming Pool, Boathouse and Lake, Fishing House 14; Sports Field and Old Hut 15; "
           "Sparring Pavilion 17; Willow Island 24 (the last stretch by boat); Forest treeline 28; Forest Clearing 43.",
        "Menagerie 13; Combat Grounds, Gymnasium, Swimming Pool 14; Sports Field 15; Sparring Pavilion 17. The far grounds: Grassy Field and Hills 20, "
        "Observation Tower 25, Boathouse and Lake 30, Old Hut 30, Fishing House 33, Forest treeline 35, Willow Island 40 (the last stretch by boat), "
        "Forest Clearing 65.")
    rep(m, "Movement: adjacent places are reached directly, usually in four or five minutes on foot.",
        "Movement: on the castle grounds, adjacent places are reached directly, usually in four or five minutes on foot.")
    rep(m, "Crossing distant clusters on foot takes time.",
        "Crossing distant clusters on foot takes time. The far grounds (the Lake, the Grassy Field and Hills, the Forest) are wide open "
        "country, much farther than the map makes them look, and far from each other too: Gardens to the boathouse 20 minutes, the Hills to "
        "the lake shore 15, the Hills to the Forest treeline 15, the treeline to the Forest Clearing 30. Only the Fishing House is close to "
        "the boathouse, three minutes along the shore; nothing out there is next door to anything else.")
    rep(C[76], "[Grassy Field and Hills] Open rolling ground at the edge of campus,",
        "[Grassy Field and Hills] Wide open rolling ground in the far grounds, twenty minutes' walk from the Main Courtyard,")
    rep(C[76], "the castle small in the distance.",
        "the castle small in the distance. It is big: the Observation Tower stands on its nearer crest, the Old Hut is another ten minutes out on "
        "the far slope, and the lake shore and the Forest treeline are each a quarter of an hour away.")
    rep(C[77], "[Forest] Wooded ground bordering the hills.",
        "[Forest] Wide old woodland at the farthest edge of the grounds, past the far slope of the Hills (a quarter of an hour from the "
        "field, twenty-five minutes along the lake shore).")
    rep(C[77], "A deer path leads to the Forest Clearing", "A deer path, half an hour's walk, leads deep in to the Forest Clearing")
    rep(C[78], "[Boathouse and Lake] Vast Open water", "[Boathouse and Lake] Vast open water in the far grounds, twenty minutes' walk beyond the Gardens,")
    rep(C[78], "Beside the boathouse stands the Fishing Club's Fishing House, with its own dock.",
        "Three minutes' walk along the shore from the boathouse stands the Fishing Club's Fishing House, with its own dock.")
    rep(C[81], "[Observation Tower] A high tower", "[Observation Tower] A high tower on the nearer crest of the Hills, five minutes up from the field,")
    rep(C[254], "A deer path leads in from the treeline, about fifteen minutes' walk.",
        "A deer path leads in from the treeline, about thirty minutes' walk.")
    rep(C[268], "on the lake shore beside the boathouse,", "on the lake shore, three minutes' walk along the shore from the boathouse,")
    rep(C[82], "A white-walled building of its own beside the Mall,", "A white-walled building of its own, four minutes' walk from the Mall,")
    rep(C[83], "a big open-sided stall beside the Mall:", "a big open-sided stall of its own, three minutes' walk from the Mall:")
    rep(C[52], "Beside the rings stands the Sparring Pavilion,", "At the far corner of the grounds, three minutes' walk from the rings, stands the Sparring Pavilion,")

GHOST_STORIES = [   # 1.16.0 (owner-approved planning/DRAFT_dynamic_ambience.md §7): uid, title, keys, content
    (337, 'The Thirteenth Stroke', ['Thirteenth Stroke', 'extra stroke', 'one stroke too many'],
     "[The Thirteenth Stroke]\nWhere: anywhere outdoors after the eight o'clock bell.\nStory: the Bell Tower sometimes strikes once more than the hour, a single stroke after the rest, when no one is in the tower.\nRule: count the strokes. If there is one too many, go indoors and do not count again that night.\nKnown for: nobody agrees on what the extra stroke is for; the bell ringers say the mechanism settles, and never ring it themselves.\n"),
    (338, 'The Night Swimmer', ['Night Swimmer', 'swimmer in the steam'],
     '[The Night Swimmer]\nWhere: the Swimming Pool after dark, most often in winter when the rune-warmed water steams.\nStory: someone swims steady lengths through the steam, the lane rope lifting as they pass, but when the steam clears the water is empty and still.\nRule: never swim alone after dark, and do not call out to them.\nKnown for: the Swimming Club claims the fastest lap on record and will not say who swam it.\n'),
    (339, 'The Walking Lantern', ['Walking Lantern', 'lantern on the ridge'],
     '[The Walking Lantern]\nWhere: the Grassy Field and Hills, after dark.\nStory: a single lantern light crosses the ridge at walking pace with no one carrying it, and stops when anyone stops to watch.\nRule: do not walk toward it, and do not follow it towards the Forest.\nKnown for: the Walking Club keeps to the lower path after dusk and will not say why.\n'),
    (340, 'Breath on the Glass', ['Breath on the Glass', 'handprint on the glass'],
     "[Breath on the Glass]\nWhere: inside the Gardens' greenhouses, in the late afternoon and evening.\nStory: the glass fogs from the inside, as if someone warm stood close to it, around a handprint that belongs to nobody present.\nRule: do not press your own hand over it, and do not sleep in the greenhouses.\nKnown for: the Gardening Club blames the heat pipes, and still leaves in pairs.\n"),
    (341, 'When the Pens Go Quiet', ['Pens Go Quiet', 'pens go quiet', 'animals fell silent'],
     '[When the Pens Go Quiet]\nWhere: the Menagerie, from dusk into the night.\nStory: every animal in the pens falls silent at once and turns to face the Forest, and stays that way for a long moment before the noise comes back.\nRule: when the pens go quiet, walk away in the other direction and do not look where they are looking.\nKnown for: the handlers call it weather sense; the Creature Studies teacher does not call it anything.\n'),
    (342, 'The Faraway Laugh', ['Faraway Laugh', 'laugh in the trees', 'laughing in the trees'],
     "[The Faraway Laugh]\nWhere: Founder's Park and the tree-lined paths, after dark.\nStory: a woman laughs somewhere up in the old trees. The laugh always sounds far away.\nRule: the fainter it sounds, the closer she is. If it sounds far, walk the other way at once and do not look up.\nKnown for: students who hear it say it was only an owl, and take the long way round for a week.\n"),
    (343, 'The Polite Walker', ['Polite Walker'],
     '[The Polite Walker]\nWhere: the long paths out to the far grounds (the Gardens to the lake, the courtyard to the Hills), at dusk and after dark.\nStory: footsteps fall in behind whoever walks alone, matching their pace, stopping when they stop. Turning round shows an empty path.\nRule: step off the path and say "after you". The steps go on past, and the path is yours again.\nKnown for: seniors teach first-years the words on their first walk to the lake, and laugh while they do it.\n'),
    (344, 'The Last Bed', ['Last Bed', 'the last curtain'],
     '[The Last Bed]\nWhere: the Medical Centre, at night, for students kept in overnight.\nStory: the curtain round the last bed on the ward is drawn, and someone behind it breathes slowly in their sleep. The ward register says that bed is empty.\nRule: never open the last curtain. Ask the night nurse in the morning; she will tell you it was empty, and she will be kind about it.\nKnown for: patients who are well enough ask to be moved nearer the door.\n'),
    (345, 'The Other Climber', ['Other Climber', 'the far gable'],
     "[The Other Climber]\nWhere: the Rooftop, at night.\nStory: someone sits on the far gable in exactly your posture, wearing your dorm's vest, looking out over the grounds as you are.\nRule: leave the roof before they turn round, and do not come up again that night.\nKnown for: why students who know the way up never go up alone.\n"),
    (346, 'The Applause', ['The Applause', 'empty tiers'],
     '[The Applause]\nWhere: the old amphitheatre off the Club Rooms corridor, during a late rehearsal.\nStory: at the end of a scene, applause comes from the empty upper tiers, and one seat up there has been folded down.\nRule: bow, and end the rehearsal. Do not run the scene again that night.\nKnown for: the Theatre Troupe bows to the empty tiers at the end of every rehearsal, and calls it tradition.\n'),
]

def ghost_stories(C, N):
    """1.16.0: the ten approved ghost stories (Ghost Story entries like the Third Stall), a "Home of" line in each place's entry,
    the World Index list, and Tilly's journal (owner: "buat tilly juga aware dengan hal ini")."""
    for uid, title, keys, content in GHOST_STORIES:
        assert uid not in C and uid not in N, f'ghost story uid {uid} is taken'
        C[uid] = template_from(C[205], uid=uid, displayIndex=uid, comment="Ghost Story - " + title, key=keys, content=content.rstrip('\n'))
    for uid, title in [(48, 'Thirteenth Stroke'), (74, 'Night Swimmer'), (76, 'Walking Lantern'), (79, 'Breath on the Glass'),
                       (80, 'When the Pens Go Quiet'), (47, 'Faraway Laugh'), (82, 'Last Bed'), (255, 'Other Climber'), (67, 'Applause')]:
        e = C[uid]; assert e['content'].count('\nFeel:') == 1, uid
        e['content'] = e['content'].replace('\nFeel:', f'\nHome of the {title} story.\nFeel:', 1)
    rep(C[132], "nothing out there is next door to anything else.",
        "nothing out there is next door to anything else. The long paths out are home of the Polite Walker story.")
    # 1.30.6 (owner: "connected to" follows the map picture): the outdoor adjacency is what the map draws side by side. The same
    # list is tools/curate_data.py ADJ (the map panel's data); keep the two together.
    for head, line in (
        ("- Perimeter:", "- Perimeter: Gatehouse/Reception (with its visiting parlour) – Main Courtyard (up the main avenue), Commissary, Medical Centre, "
                         "Mail Tower, Groundskeeper's Lodge."),
        ("- Dormitories:", "- Dormitories: Main Courtyard – Fire, Light, Sky and Viridian Dormitories, four separate buildings around it; each dormitory – "
                           "its Common Room, Laundry, Bathhouse. Fire Dormitory – Sky Dormitory, Broken Statue. Sky Dormitory – The Mall, Cathedral, "
                           "Broken Statue. Viridian Dormitory – Arbiter Hall, Staff Quarters, Gardens, Light Dormitory. Light Dormitory – Medical Centre, "
                           "Founder's Park, Archery Range."),
        ("- Student life:", "- Student life: Main Courtyard – The Mall, Medical Centre. The Mall – Medical Centre, Commissary (each its own building, three "
                            "or four minutes' walk from it), Banking House, Cathedral. Medical Centre – Mail Tower, Commissary. Commissary – Banking House. "
                            "Banking House – Meditation Rooms. Mail Tower – Groundskeeper's Lodge."),
        ("- Outer grounds:", "- Outer grounds: Main Courtyard – Founder's Park. Founder's Park – Light Dormitory, Medical Centre, Mail Tower, Groundskeeper's "
                             "Lodge, Combat Grounds, Sports Field, Archery Range. Arbiter Hall – Staff Quarters. Staff Quarters – Gardens. Gardens – "
                             "Menagerie, Archery Range. Archery Range – Menagerie, Gymnasium, Sports Field. Gymnasium – Menagerie, Sports Field, Swimming "
                             "Pool (outdoor). Sports Field – Combat Grounds, Sparring Pavilion. Combat Grounds – Sparring Pavilion, Groundskeeper's Lodge. "
                             "Spirit Path (the footpath through the trees east of the Gymnasium) – Gymnasium, Menagerie, Sports Field."),
        ("- Far edge:", "- Far edge: the long path out from Main Courtyard, past Arbiter Hall and the Staff Quarters, climbs to the Grassy Field/Hills. "
                        "Hills – Observation Tower, Old Hut, Boathouse/Lake, Fishing House, Forest. Gardens – Boathouse/Lake. Boathouse/Lake – Fishing "
                        "House (three minutes along the shore from the boathouse), Willow Island (by boat only), Forest. Old Hut – Forest. Forest – "
                        "Forest Clearing."),
        ("- Set apart from the core:", "- Set apart from the core: the Dovecote, Cathedral and Noble Houses' Liaison stand together on one side of the "
                                       "grounds, with the Meditation Rooms below them; between them and the Fire Dormitory, in the trees, "
                                       "stands the Broken Statue. The Dovecote, Cathedral and Liaison sit on academy land the academy does not control, "
                                       "as does the Royal Inspectorate's suite inside the castle (Floor 1). Dovecote – Cathedral, Noble Houses' Liaison, "
                                       "Broken Statue. Cathedral – Noble Houses' Liaison, Broken Statue, Meditation Rooms. Noble Houses' Liaison – Meditation Rooms.")):
        m = C[132]
        assert m['content'].count('\n' + head) == 1, head
        m['content'] = re.sub(r'(?m)^' + re.escape(head) + r'.*$', lambda _: line, m['content'], count=1)
    # the shortest paths curate_data.py computes without the old Courtyard links
    rep(C[132], "Mail Tower 7,", "Mail Tower 8,")
    rep(C[132], "Sports Field 15;", "Sports Field 16;")
    rep(C[132], "Sparring Pavilion 17.", "Sparring Pavilion 17; Spirit Path 17.")   # 1.31.0
    rep(C[0], "the crying on the water, the night student.",
        "the crying on the water, the night student, the thirteenth stroke, the night swimmer, the walking lantern, breath on the glass, "
        "when the pens go quiet, the faraway laugh, the polite walker, the last bed, the other climber, the applause.")
    tilly = N if 323 in N else C
    rep(tilly[323], "now and then she finds something real.",
        "now and then she finds something real. Halvard Unexplained has a page for every newer story too (the Thirteenth Stroke, the "
        "Night Swimmer, the Walking Lantern, Breath on the Glass, When the Pens Go Quiet, the Faraway Laugh, the Polite Walker, the Last "
        "Bed, the Other Climber, the Applause), each with dates, witnesses and a theory: she has counted bell strokes from the courtyard "
        "after curfew, sat up in the Medical Centre hoping for the Last Bed, and said \"after you\" to an empty path more than once.")

# 1.35.0 (owner, lore activation audit: "I only said spirit and the narrator did not know spirits have tiers"): a topic entry also
# fires on the plain word a player says (keys were compound phrases such as "Spirit Tier"; a whole-word key never matches its plural,
# so plurals and forms are SillyTavern regex keys, /.../i), and the WORLD INDEX carries one core line per system topic, so the
# narrator knows a topic exists before its entry fires. Secret topics (the Morning Choir, Lucifer) stay keyword-only.
# tests/test_lore_activation_v1350.cjs checks both with SillyTavern's own matching rules.
KEY_ADDS = {
    122: [r'/\bspirits?\b/i', r'/\b(?:my|his|her|their|your|its|a spirit) familiars?\b|\bfamiliars\b/i'],
    249: [r'/\bpacts?\b/i', r'/\bpact(?:ed|-holders?)\b/i', r'/\bsummon(?:s|ed|ing)?\b/i'],
    33: ['Elemental', r'/\bsub-?types?\b/i'],
    34: ['Mystic', r'/\bsub-?types?\b/i'],
    35: ['Spiritual', r'/\bsub-?types?\b/i'],
    36: ['Occult', r'/\bsub-?types?\b/i'],
    32: ['dark magic', 'dark arts', r'/\bdark mages?\b/i', r'/\bcurse[sd]?\b/i'],
    5: [r'/\bdemons?\b/i', 'demonic'],
    7: [r'/\bseals\b/i'],
    6: [r'/\bcouncil\b/i'],
    336: [r'/\belections?\b/i'],
    26: [r'/\bclubs\b/i', r'/\b(?:my|your|our|his|her|their|a|the|any|new) club\b/i', 'club activities', 'club president'],
    19: [r'/\bcompetitions?\b/i', r'/\btournaments?\b/i', r'/\bbrackets?\b/i', r'/\bqualif(?:y|ied|ies|ying|ier|iers)\b/i'],
    203: [r'/\bexams?\b/i'],
    2: [r'/\b(?:other|rival|four|sister) academ(?:y|ies)\b/i'],
    3: [r'/\b(?:other|rival|four|sister) academ(?:y|ies)\b/i'],
    4: [r'/\b(?:other|rival|four|sister) academ(?:y|ies)\b/i'],
    90: [r'/\bchurch(?:es)?\b/i', 'chapel', r'/\bgoddess\b/i'],
    277: ['Asmoday', r'/\bgoddess\b/i'],
    91: [r'/\bnobles?\b/i', 'nobility', r'/\baristocra(?:t|ts|cy)\b/i'],
    267: [r'/\bduel(?:s|led|ling|ing|ist|ists)?\b/i'],
    229: [r'/\bbeasts?\b/i', r'/\bmonsters?\b/i', r'/\bcreatures?\b/i'],
}
CORE_FACTS = """CORE FACTS (the short version; a topic's full entry is added when it comes up)
Magic types: Elemental (the elements and advanced elements), Mystic (changing the material world: creation, telekinesis, divination, warding), Spiritual (the mage's own will: enhancement, healing), Occult (illusions, charms, spirits). About thirty subtypes each.
Forbidden arts: every type has forbidden subtypes next to what it practises daily (Blightfire, Puppetry, Mind Control, Pacting and others); using one means arrest. Dark Magic Defense, taught by the Doves, covers them and curses.
Spirits: four tiers. Lesser (common; most familiars; almost any Occult student can bond one), Basic (a regular spirit user's working spirit), Greater (rare, old, willful; a failed binding is dangerous), Spirit Lord (extremely rare; bound to a whole domain of the world). A spirit user's standing is the highest tier they hold.
Spirit Pact: the one lawful pact, a contract a spirit agrees to and cannot be forced into; a pact with anything else is Pacting, a forbidden art. A pact spirit is summoned (it drains mana while present) or, Greater and Spirit Lord only, channelled.
Seals: every academy stands on a sealed site; the seals draw the residual mana left behind by casting (students are never drained).
Four academies, one per region, each on a sealed site: Halvard (west: the Crack, a rift to the demon world), Myrdath (north: a sealed Monster), Veyra (south: the Archmage's Rest), Ashvale (east: the Elixir).
The breach: two years ago, during the Thinning, something came through the Crack for one night and killed several students; Halvard's Warden resealed it and died, and the apprentice is now Acting Warden.
Magical beasts: graded IV (nuisance) to I (settlement-scale); students handle nothing above III; some beasts are protected by law.
Dorm ladder: students stay in one dorm for all three years and climb its ranked ladder (exams, competitions, achievements); rank sets the monthly payout.
Academic year: three years of two semesters each; repeating a year needs the Headmaster's approval and is rare.
Staff: Headmaster; Vice Headmaster and Warden; teaching staff and Dorm Heads; other staff.
Student Council: a President, a Vice President and members from all four dorms; meets Saturday mornings; handles club administration, events, discipline and cross-dorm mediation; the President is elected in M10W3.
Clubs: about thirty; the one place the four dorms mix freely; founding takes a teacher's signature and five members; sport clubs ban magic in play.
Competitions: Dorm (solo, a bracket per combat role), Academy (teams of four covering the roles), Kingdom (one team per academy, in Avalon, the capital), World (a national four picked from every Kingdom entrant). Losing ends a student's competitive year.
Airships: the kingdom's long-distance transport, hired for the Expedition, the Academy Trip, the long breaks and the Kingdom and World Competitions."""
def beast_names(text):   # every creature in the Magical Beasts list, for one regex key
    names = []
    for line in text.split('\n'):
        if not re.match(r'^[A-Z]{4,}', line): continue
        for sent in line.split(': ', 1)[1].split('. '):
            items = re.split(r'[,;]', sent.split(': ')[-1])
            if len(items) < 3: continue
            for it in items:
                n = re.sub(r'\s*\((?:I|II|III|IV)\)\.?|\.$', '', it).strip()
                n = re.sub(r'^the ', '', n)
                if re.fullmatch(r"[a-z][a-z' -]*", n.lower()) and n.lower() != 'giant': names.append(n.lower())
    return sorted(set(names), key=lambda n: (-len(n), n))
def grand_vast_forest(C, ejs):
    """1.38.0 (owner-approved planning/DRAFT_outside_maps.md, part 1): the Grand Vast Forest from data/expedition.json: an overview
    (neighbours and every shortest walk, computed from the legs), one entry per place group, the Wendigo; the Expedition entry (230)
    and the beast list (229). Card: constant, behind a gate on $ui.area.forest.on (nothing outside the Expedition). v39: keyword entries.
    1.41.0 (owner): 360 is the forest's index (constant during the Expedition, one line per place); every place entry is a keyword
    entry, like the campus map (132) and the campus places."""
    X = json.load(open(P('data/expedition.json'), encoding='utf-8'))
    PL = {p['id']: p for p in X['places']}
    nb = {}
    for a, b, h, m, note in X['legs']:
        nb.setdefault(a, []).append((b, h, note)); nb.setdefault(b, []).append((a, h, note))
    def walks(src):
        d, done = {src: 0}, set()
        while True:
            u = min((k for k in d if k not in done), key=lambda k: d[k], default=None)
            if u is None: return d
            done.add(u)
            for v, h, _n in nb.get(u, []):
                if v not in d or d[u] + h < d[v]: d[v] = d[u] + h
    nm = lambda i: 'the ' + PL[i]['name'][4:] if PL[i]['name'].startswith('The ') else PL[i]['name'] if i in ('base_camp', 'blightbriar', 'falls') else 'the ' + PL[i]['name']
    hrs = lambda h: ('%g' % h)
    ids = [p['id'] for p in X['places']]
    lead = lambda s: s[0].upper() + s[1:]
    neigh = ' '.join(lead(nm(a)) + ' – ' + ', '.join(nm(b) + ' ' + hrs(h) + (f' ({n})' if n and n != 'spore' else '') for b, h, n in nb[a] if ids.index(b) > ids.index(a)) + '.'
                     for a in ids if any(ids.index(b) > ids.index(a) for b, _h, _n in nb[a]))
    rows = []
    for i, a in enumerate(ids[:-1]):
        d = walks(a)
        rest = sorted(ids[i + 1:], key=lambda b: (d[b], ids.index(b)))
        rows.append(lead(nm(a)) + ': ' + ', '.join(nm(b) + ' ' + hrs(d[b]) for b in rest) + '.')
    rules = ("Rules for the narrator: the engine decides when the assigned target and any other beast appear (<now> says so). Never bring the "
             "target in on your own, never let a beast appear because it would be convenient, and never tell {{user}} where a beast lives: let "
             "tracks, class knowledge and the signs <now> gives show the way. Possible encounters in a place entry are what may appear there, "
             "not what is waiting. Every walk takes its hours on the clock; nobody crosses this forest in minutes.")
    brief = {'base_camp': 'the meadow at the southern edge: tents, the command tent, the Huntsmen\'s Lodge', 'wildwood': 'the ordinary rainforest west, north and east of Base Camp',
             'blightbriar': 'poisoned thorns and spore fungus', 'gloaming': 'the oldest, darkest stand, where noon looks like dusk',
             'falls': 'the Silverrun river falling in a dozen tiers', 'terraces': 'hundreds of cold stepped pools above the falls',
             'cave': 'a cliff mouth onto caves nobody has mapped', 'old_heart': 'the single giant tree at the northern edge'}
    places = 'Places: ' + ', '.join(f"{G['title']} ({brief[g]})" for g, G in X['groups'].items()) + '. Each has its own entry when it comes up.\n'
    overview = ("[GRAND VAST FOREST INDEX]\nWhat: Eldrasil's great rainforest, half a day from Halvard by airship, so vast that crossing it takes weeks and "
                "nobody has walked all of it. Hunting-company country. Halvard comes once a year, for the Creature Studies Expedition (Month 2 "
                "Week 3), and uses only its southern rim: from Base Camp to the farthest point of that country is about half a day on foot.\n"
                "Landmark: the Old Heart, a single giant tree at the rim's northern edge, rising far above the canopy and seen from anywhere in "
                "the southern forest; everyone steers by it. Beyond it the deep forest runs on, unmapped.\n"
                "Climate: warm and wet all year. Mornings start in mist, the air is heavy and humid, and most afternoons a downpour comes "
                "through the canopy; nothing ever fully dries. Buttress-rooted giants, palms, tree ferns, hanging vines and moss on everything.\n"
                + places + "Neighbours (hours on foot): " + neigh + " Any other walk passes through the places between.\n"
                "Shortest walks (hours, the same both ways):\n" + '\n'.join(rows) + "\n"
                "Walking costs stamina; half a day on foot without rest leaves anyone exhausted. The three Wildwood stretches (west, north, east) "
                "are one forest in three directions from Base Camp.\n" + rules)
    gate0, gate1 = "<%_ if ((getvar('stat_data.$ui.area.forest') || {}).on) { _%>\n", "\n<%_ } _%>"
    def entry(uid, comment, keys, text, index=False):
        assert uid not in C and uid not in N, f'forest uid {uid} is taken'
        e = template_from(C[230], uid=uid, displayIndex=uid, comment=comment, key=keys, content=(gate0 + text + gate1) if ejs and index else text)
        if ejs and index: e.update(constant=True)
        C[uid] = e
    entry(360, 'Grand Vast Forest', ['Grand Vast Forest', 'rainforest'], overview, index=True)
    for k, (g, G) in enumerate(X['groups'].items()):
        names = [p['name'] for p in X['places'] if p['group'] == g]
        keys = list(dict.fromkeys([G['title'].replace('The ', '')] + [n.replace('The ', '') for n in names]))
        entry(361 + k, 'Grand Vast Forest - ' + G['title'], keys, f"[{G['title']}] {G['desc']}\nFeel: {G['feel']}.\n{G['enc']}")
    entry(369, 'Grand Vast Forest - The Wendigo', ['Wendigo'],
          "[The Wendigo] Grade I. A gaunt humanoid about three metres tall: grey-white skin drawn tight over bone, a deer's skull for a head, with "
          "antlers and a dim light in the sockets, and long clawed fingers. The air turns cold around it, frost forms where it stands, and it smells "
          "of rot. It speaks in the voices of people it has heard. It lives in the Gloaming of the Grand Vast Forest and is sometimes seen at the "
          "edge of the Old Heart.\nAdapts: every spell of a kind (an element or a school) that has already hit it this fight does a fifth less than "
          "the one before: the first in full, then 80%, 60%, 40%, and 20% from the fifth on, never less. A new kind of spell starts again at full. "
          "It forgets after a day without a fight. Weapons do not make it adapt, but its hide is Grade I hard. Only overwhelming power (a Gareth "
          "Valkaryn) can force a way through a kind it has learned.\nBehaviour: territorial. It stalks first and calls in borrowed voices, then "
          "tests intruders and drives them out; it does not follow anyone out of the Gloaming. Hunting companies do not take work there because of it.")
    assert len(X['groups']) == 8
    rep(C[230], "The Creature Studies practical exam, run by the Creature Studies teachers, one per year level, with the first-year teacher (the ex-monster hunter) leading.",
        "The Creature Studies practical exam, led by Vallie Goredust; one airship per year level, each with two other members of staff aboard by rota, and the Doves travel along.")
    rep(C[230], "Wed: flight, then camp (tents, cookfires, watch rotations) and gear prep.\n"
                "Thu: each group is assigned a beast to bring back within 24 hours. Years 1-2 get Grade III targets, year 3 Grade II. Staff shadow at a distance and pull out groups in trouble.\n"
                "Fri: break camp, fly home. Catches count dead or alive.",
        "Wed: flight, then Base Camp (tents, cookfires, watch rotations) and gear prep.\n"
        "Thu: from 08:00 each group is told its target (Years 1-2 Grade III, Year 3 Grade II) but not where to find it, heads out, and pitches its own camp in the wild wherever the hunt takes it; 24 hours. Staff shadow at a distance and pull out groups in trouble.\n"
        "Fri: groups return to Base Camp by noon; break camp, fly home. Catches count dead or alive. A group that comes back without its target fails the practical and hears about it all year.\n"
        "The evening before: the queue to touch the Founder's Statue's hand fills Founder's Park.\n"
        "Bracelets: before the flight, staff bind every bracelet to a reading board in Vallie's command tent, which shows where each student is and their heartbeat. Staff watch it day and night and go to any group whose readings spike or stop. The binding is lifted on return. Inside the Grand Cave Network the reading fades past the first chamber.\n"
        "Flare: every group also carries one red recall flare. Firing it is no failure: staff come within minutes and the group is marked on what it did before. A group that should have fired and did not is marked down harder.\n"
        "Catches: live ones are marked, then released at the treeline (Halvard's Menagerie keeps Grade IV only); dead ones are sold to the Huntsmen's Lodge for the academy. Students carry coin; points do not work here.\n"
        "Nights: Wednesday night everyone stays in Base Camp except the watch. Thursday the hunt runs through the night.")
    rep(C[230], "Where: the Grand Vast Forest, half a day by airship; one ship per year level.",
        "Where: the Grand Vast Forest (its own entries: a rainforest, mapped for the Expedition), half a day by airship; one ship per year level.")
    rep(C[229], "lesser drake, cockatrice, gargoyle (III).", "lesser drake, cockatrice, gargoyle, torrent eel, echo bat, hush owl, spore shambler (III); chime toad (IV).")
    rep(C[229], "displacer cat, gorgon, rime elk.", "displacer cat, gorgon, rime elk, bloom maw.")
    rep(C[229], "the Sablemaw, the Gaunt Herd.", "the Sablemaw, the Gaunt Herd.\nGRAND FOREST (I): the Wendigo, which lives in the Gloaming of the Grand Vast Forest (its own entry); the one Grade I a student may ever meet, and nothing a student can beat.")

def avalon(C, ejs):
    """1.39.0 (owner-approved planning/DRAFT_outside_maps.md, part 2): Avalon, the capital, from data/avalon.json: an overview (rings,
    the White Line, pins and their places, every shortest walk between pins, the Herald Spires, rules for the narrator), one entry per
    part of the city, the Rookery, the Royal Mages on Crowning Day; the World Index, the kingdom, Crowning Day (24) and the Kingdom
    Competition (19). Card: constant, behind a gate on $ui.area.avalon.on (nothing outside Avalon). v39: keyword entries.
    1.41.0 (owner): 370 is the city's index (constant in Avalon, one line per place); every place has its own keyword entry in the
    campus location format ([Name] description, Feel), like the campus map (132) and the campus places."""
    A = json.load(open(P('data/avalon.json'), encoding='utf-8'))
    PL, PIN = {p['id']: p for p in A['places']}, {p['id']: p for p in A['pins']}
    nb = {}
    for a, b, m in A['legs']:
        nb.setdefault(a, []).append((b, m)); nb.setdefault(b, []).append((a, m))
    def walks(src):   # minutes between pins; the castle is never a way through
        d, done = {src: 0}, set()
        while True:
            u = min((k for k in d if k not in done), key=lambda k: d[k], default=None)
            if u is None: return d
            done.add(u)
            if u != src and PIN[u].get('locked'): continue
            for v, m in nb.get(u, []):
                if v not in d or d[u] + m < d[v]: d[v] = d[u] + m
    ids = [p['id'] for p in A['pins']]
    brief = {'eldrasil_castle': 'the royal seat on the hill', 'noble_ring': 'the noble houses on the castle terraces', 'crown_square': 'the great square, the King\'s speech',
             'grand_cathedral': 'the kingdom\'s cathedral', 'chancery': 'the crown\'s offices and courts', 'high_dovecote': 'the Doves\' tower',
             'royal_bank': 'the kingdom\'s bank', 'skyport': 'airship masts outside the Great Gate', 'gilded_arcade': 'glass-roofed shopping arcades',
             'lantern_market': 'the biggest market, under lanterns', 'spellwright_row': 'the magic trades', 'old_town': 'the grey old quarter',
             'skywheel_fair': 'the fairground and its giant wheel', 'great_spire': 'the tallest Herald Spire, open to climb',
             'garden_of_avalon': 'the great garden and the Archmage statue', 'grand_theatre': 'the domed opera house',
             'royal_arena': 'the Kingdom Competition\'s stadium', 'whitestone_hotel': 'where the four academies\' teams stay'}
    pin_line = lambda p: p['name'] + ': ' + ', '.join(f"{x['name']} ({brief[x['id']]})" for x in A['places'] if x['pin'] == p['id'] and not x.get('hidden')) + '.'
    rows = []
    for i, a in enumerate(ids[:-1]):
        d = walks(a)
        rows.append(PIN[a]['name'] + ': ' + ', '.join(PIN[b]['name'] + ' ' + str(d[b]) for b in sorted(ids[i + 1:], key=lambda b: (d[b], ids.index(b)))) + '.')
    Cr = A['crowning']
    overview = ("[AVALON INDEX — the capital. Each place has its own entry when it comes up.]\nAvalon is the capital of Eldrasil and its largest city, some two hours from Halvard by airship. A round city of white "
                "stone on a gentle hill, inside one great white wall with four gates; the Great Gate in the south faces the Skyport. Past the wall there "
                "are no more walls: the city is laid out in rings by its streets alone, each ring a little higher than the one outside it, rising to "
                "Eldrasil Castle on its hill, which can be seen from every street.\n"
                "Rings, from the castle out: the Noble Ring, the houses of the noble families on the castle's terraces; the Crown Ring, where the kingdom "
                "is run, around Crown Square; and the Lower City, the widest ring by far, where most of Avalon lives, works, shops and plays. Great "
                "avenues run from the gates to Crown Square, and the Ring Boulevard circles the Lower City just inside the wall; between them lie homes, "
                "workshops and the quarters visitors come for.\n"
                "The White Line: a band of white marble set into every street where the Noble Ring begins. The Royal Guard stands on it. Nobody crosses "
                "without a royal summons or a noble's household badge, and the guards do not argue; the Doves are never far away. Students never cross it, "
                "except the team that wins the Kingdom Competition, received by the King at the castle.\n"
                "The city was rebuilt in white after the War of Independence. Old Town alone keeps the grey stone of the years before, left as it was on "
                "purpose. Royal banners, deep blue and gold, fly from the castle towers; on Crowning Day they hang along every avenue.\n"
                "The Herald Spires: seven tall white spires across the city, the city-sized version of the academy's announcement pillars. Each carries the "
                "same broadcast at once, live and never recorded: royal proclamations, the noon news, a bell and a few bars of music on every hour, and on "
                "Crowning Day the King's own voice. At night they glow faintly. The Great Spire in the north is the one the public may climb.\n"
                "The city map (parts, then their places): " + ' '.join(pin_line(PIN[i]) for i in ids) + "\n"
                "Walks between the parts (minutes on foot, the same both ways; a place inside one part is five to fifteen minutes from the next):\n"
                + '\n'.join(rows) + "\n"
                "Getting around: on foot, or by hire carriage from the stands at the Skyport, Crown Square and every quarter: half the time, for coin. "
                "Bracelet points do not work in Avalon; students carry coin, changed at the Banking House before they leave.\n"
                "Rules for the narrator: what happens in the streets each hour (pickpockets, processions, students of the other academies, a raid) is the "
                "engine's, listed in <now>; never add trouble or luck of your own. Crowds, sellers, music, smells and colour are yours. Every walk takes "
                "its minutes on the clock. {{user}} never crosses the White Line unless <now> says the team was summoned.")
    gate0, gate1 = "<%_ if ((getvar('stat_data.$ui.area.avalon') || {}).on) { _%>\n", "\n<%_ } _%>"
    def entry(uid, comment, keys, text, index=False):
        assert uid not in C and uid not in N, f'avalon uid {uid} is taken'
        e = template_from(C[230], uid=uid, displayIndex=uid, comment=comment, key=keys, content=(gate0 + text + gate1) if ejs and index else text)
        if ejs and index: e.update(constant=True)
        C[uid] = e
    entry(370, 'Avalon', ['Avalon', 'the capital', 'Herald Spire', 'White Line'], overview, index=True)
    uids = iter([371, 372, 373, 374, 375] + list(range(452, 465)))
    for q in A['places']:
        if q['id'] == 'rookery': continue
        nm = q['name']
        entry(next(uids), 'Avalon - ' + nm, list(dict.fromkeys([nm, nm[4:] if nm.startswith('The ') else nm])),
              f"[{nm}] {q['desc']}" + (f"\nFeel: {q['vibe']}" if q.get('vibe') else ''))
    entry(376, 'Avalon - The Rookery', ['Rookery', 'rooks', 'Drowned Rat'],
          '[Avalon — The Rookery]\nThe Rookery: ' + PL['rookery']['desc'] + ' Buying or practising a forbidden art there is still arrest, as everywhere; being caught there is a serious offence for a student.\n'
          '<narrator_only>The way in: the cellar door behind the bar of the Drowned Rat, a tavern on the lowest lane of Old Town; the barkeep opens it for anyone who asks for "the cellar wine". '
          'A few Old Town locals will point the way for coin; nobody else will. The City Watch raids the Rookery now and then (the engine decides when, in <now>), and the rooks usually hear it coming.</narrator_only>')
    tsu = ('Tsubaki Hoshikage this year: seventeen, long white hair tied back badly, grey wolf ears and tail, calm gold eyes, a katana in a plain black scabbard, '
           'the silver star on her collar. Frank, calm, brief; introduces herself as "Tsubaki Hoshikage. Royal Mage. Do you spar?" A genius with the sword who cannot '
           'find her way anywhere and does not understand hints or jokes. She is not a Halvard student yet: the Crown sends her there next year.')
    mages = ('[Avalon — the Royal Mages on Crowning Day]\nThe Royal Mages, the Crown\'s own mages, lead the Crowning Day parade: ranks in white and deep blue, the silver '
             'star of the order on every collar, casting light and colour over Crown Avenue as they march. The youngest of them, Tsubaki Hoshikage, a wolf Beastkin with a katana, marches among them.\n')
    entry(377, 'Avalon - The Royal Mages', ['Royal Mage', 'Royal Mages', 'parade'],
          mages + (("<%_ if ((Number(getvar('stat_data.World.Year')) || 1) < 2) { _%>\n" + tsu + "\n<%_ } _%>") if ejs else '(Before campaign Year 2) ' + tsu))
    rep(C[0], "Kingdom: Eldrasil, in the east of the continent.", "Kingdom: Eldrasil, in the east of the continent; its capital is Avalon.")
    rep(C[1], "Location: the east of the continent.", "Location: the east of the continent.\nCapital: Avalon, a round white city on a hill in the heart of the kingdom, with Eldrasil Castle, the royal seat, at its centre.")
    rep(C[24], "Morning: Headmaster Baelin and Vice Headmaster Althair speak to the assembled academy, then everyone boards the airship to the capital.\n"
               "Capital: parade, the King's speech, then free time until the afternoon muster (markets, food, sights). Groups of four only. Points do not work; students carry coin.\n"
               "Late afternoon: back before dark, passenger lists counted twice.",
        f"The day before: students change bracelet points into coin at the Banking House; points do not work in the capital.\n"
        f"Morning: Headmaster Baelin and Vice Headmaster Althair speak to the assembled academy at 07:00, then everyone boards the airship to Avalon, the capital (about two hours).\n"
        f"Avalon: the airship lands at the Skyport at {Cr['arrive']}. {Cr['parade']} the parade on Crown Avenue, the Royal Mages at its head, watched from the stands reserved for Halvard; {Cr['speech']} the King's speech at Crown Square, carried by the Herald Spires to the whole city. "
        f"Then free time from {Cr['free']} until the muster at the Skyport at {Cr['muster']} (markets, food, sights; the city's own entries). Groups of four only. Points do not work; students carry coin.\n"
        f"Late afternoon: the airship leaves at {Cr['depart']}, back before dark, passenger lists counted twice. A student late for the muster is searched for, and punished as for a detention.")
    rep(C[19], "3. Kingdom. One team per academy, four in total, knockout, at the arena in the capital. Each member of the winning team earns 5,000 points. Only the teams travel: they arrive the day before and stay at a hotel near the arena, and fly home the day after.",
        "3. Kingdom. One team per academy, four in total, knockout, at the Royal Arena in Avalon, the capital. Each member of the winning team earns 5,000 points, and the winning team is received by the King at Eldrasil Castle on the last evening. Only the teams travel: they arrive the day before and stay at the Whitestone Hotel beside the arena, and fly home the day after. Evenings are free in the city until 21:00, the hotel by 22:00.")

def airship(C, ejs):
    """1.40.0 (owner-approved planning/DRAFT_airship.md): the four places aboard the academy's airship, from data/airship.json (378-381).
    Card: keyword entries (1.41.0, owner), and a small index (465) constant behind a gate on $ui.airship (on during a flight, soon
    in the 90 minutes before one), like the campus map (132) and the campus places. v39: keyword entries."""
    A = json.load(open(P('data/airship.json'), encoding='utf-8'))
    gate0, gate1 = "<%_ if ((getvar('stat_data.$ui.area.airship') || {}).on || (getvar('stat_data.$ui.area.airship') || {}).soon) { _%>\n", "\n<%_ } _%>"
    keys = {'promenade_deck': ['Promenade Deck', 'airship promenade'], 'common_room': ['Airship — Common Room', 'airship common room', 'airship bar', 'airship stage'],
            'cabin_deck': ['Cabin Deck', 'bathing stalls'], 'cargo_hold': ['Cargo Hold', 'quartermaster']}
    for uid, p in zip(range(378, 382), A['places']):
        assert uid not in C, f'airship uid {uid} is taken'
        text = f"[Airship: {p['name']}] " + p['desc']
        C[uid] = template_from(C[230], uid=uid, displayIndex=uid, comment='Airship - ' + p['name'], key=keys[p['id']], content=text)
    brief = {'promenade_deck': 'the glassed gallery and the view', 'common_room': 'the canteen counter, a small bar, the stage',
             'cabin_deck': 'a cabin to each group of four, hot bathing stalls', 'cargo_hold': 'luggage and gear, the most private corner'}
    idx = ("[AIRSHIP INDEX] Aboard the academy's airship: " + ', '.join(f"{p['name']} ({brief[p['id']]})" for p in A['places'])
           + ". Two minutes apart; each place has its own entry when it comes up.")
    assert 465 not in C, 'airship uid 465 is taken'
    e = template_from(C[230], uid=465, displayIndex=465, comment='Airship - index', key=['airship'], content=(gate0 + idx + gate1) if ejs else idx)
    if ejs: e.update(constant=True)
    C[465] = e

def sunreach(C, ejs):
    """1.41.0 (owner-approved planning/DRAFT_outside_maps.md, part 3): Sunreach Bay from data/sunreach.json. The Academy Trip entry (247)
    carries the city's index (constant from Month 11 Week 1 to the end of the Trip; the index only in Sunreach) and one keyword entry
    per place (431-451) in the campus location format, its night lines only from 18:00 to 06:00. v39: keyword entries."""
    D = json.load(open(P('data/sunreach.json'), encoding='utf-8'))
    PIN = {p['id']: p for p in D['pins']}
    nb = {}
    for a, b, m, *_t in D['legs']:
        nb.setdefault(a, []).append((b, m)); nb.setdefault(b, []).append((a, m))
    def walks(src):
        d, done = {src: 0}, set()
        while True:
            u = min((k for k in d if k not in done), key=lambda k: d[k], default=None)
            if u is None: return d
            done.add(u)
            for v, m in nb.get(u, []):
                if v not in d or d[u] + m < d[v]: d[v] = d[u] + m
    ids = [p['id'] for p in D['pins']]
    rows = []
    for i, a in enumerate(ids[:-1]):
        d = walks(a)
        rows.append(PIN[a]['name'] + ': ' + ', '.join(PIN[b]['name'] + ' ' + str(d[b]) for b in sorted(ids[i + 1:], key=lambda b: (d[b], ids.index(b)))) + '.')
    R = D['rates']
    index = ("SUNREACH BAY INDEX — the city of the Academy Trip. Each place has its own entry when it comes up.\n"
             "One city around a turquoise bay. By day a seaside paradise; from 18:00 to 06:00 the same streets are lit by rune-light: "
             "glowing coloured glass signs, painted banners under rune lamps, lanterns. No electricity anywhere.\n"
             + '\n'.join(PIN[k]['name'] + ': ' + ', '.join(f"{q['name']} ({q['brief']})" for q in D['places'] if q['pin'] == k) + '.' for k in ids) + "\n"
             "Walks between the parts (minutes on foot, the same both ways; a place inside one part is five to ten minutes from the next):\n"
             + '\n'.join(rows) + "\n"
             f"Getting around: horse carriages anywhere on land ({R['carriage']} coin) and water taxis between the shore parts ({R['boat']} coin), "
             f"both half the time; the Open Sea only by tour boat from the Sea Dock ({R['tour']} coin each way). Points do not work; coin only.\n"
             "Also in Sunreach these weeks: students of Myrdath, Ashvale and Veyra on their own trips, in the hotels along Coral Strand.\n"
             "Rules for the narrator: who is met, street sights, hustlers, the sea and the dice are the engine's, listed in <now>; never add "
             "encounters or luck of your own, and never decide a bet.")
    trip = ("[Academy Trip]\nWhen: Month 11 Week 2 Saturday to Week 3 Thursday. All three years; the third-years' last event as students.\n"
            "Where: Sunreach Bay, a full day by airship each way (the Saturday and the Thursday are spent flying, morning to night), a southern resort that "
            "stays warm all year: a few days of summer in Halvard's winter. Halvard has The Hanabira, a Yozakuran beachfront hotel on Coral Strand, four "
            "to a room; the rest is free time.\n"
            "Days: Saturday night the landing at the Skydock and check-in; Sunday 09:00 the teachers' briefing in the hotel garden; free time until "
            "Wednesday; Wednesday 19:00 the farewell dinner at The Hanabira, then packing; Thursday 08:00 check out and board.\n"
            "Rules: the teachers in the same hotel set a curfew at 22:00; leave the hotel only in groups of four. The city by day is allowed; its night "
            "side (the casinos and the Velvet Lanes) is out of bounds, which some students ignore every year.\n"
            "Also there: Myrdath, Ashvale and Veyra send their students to Sunreach the same weeks.\n"
            "Money: points do not work abroad; this is what a year of saving is for, and Sunreach is expensive.\n"
            "Mood: students return tired, sunburnt and poorer than planned.")
    if ejs:
        C[247]['content'] = ("<%_ { const _m = Number(getvar('stat_data.World.Month')) || 0, _w = Number(getvar('stat_data.World.Week')) || 0, "
                             "_on = (getvar('stat_data.$ui.area.sunreach') || {}).on; if ((_m === 11 && _w <= 3) || _on) { _%>\n" + trip
                             + "\n<%_ if (_on) { _%>\n" + index + "\n<%_ } } } _%>")
        C[247]['constant'] = True
    else:
        C[247]['content'] = trip + '\n' + index
    n0, n1 = "<%_ { const _hh = Number(String(getvar('stat_data.World.Time') || '').slice(0, 2)); if (_hh >= 18 || _hh < 6) { _%>\n", "\n<%_ } } _%>"
    for uid, q in zip(range(431, 452), D['places']):
        assert uid not in C, f'sunreach uid {uid} is taken'
        nm = q['name']
        night = f"At night: {q['night']}\nFeel at night: {q['night_feel']}."
        text = (f"[{nm}] {q['desc']}\nFeel: {q['feel']}.\n" + ((n0 + night + n1) if ejs else night)
                + (f"\n<narrator_only>{q['narrator']}</narrator_only>" if q.get('narrator') else ''))
        C[uid] = template_from(C[230], uid=uid, displayIndex=uid, comment='Sunreach Bay - ' + nm, key=list(dict.fromkeys([nm, nm[4:] if nm.startswith('The ') else nm])), content=text)
    assert len(D['places']) == 21

def lore_activation(C):
    beasts = beast_names(C[229]['content'])
    assert len(beasts) >= 80 and 'dire wolf' in beasts and 'unicorn' in beasts, len(beasts)
    adds = dict(KEY_ADDS)
    adds[229] = adds[229] + ['/\\b(?:' + '|'.join(re.escape(n).replace('\\ ', ' ') for n in beasts) + ')(?:s|es)?\\b/i']
    for uid, keys in adds.items():
        C[uid]['key'] = list(dict.fromkeys(C[uid]['key'] + keys))
    rep(C[0], "\n\nThe Ring Dining Hall opens only", "\n\n" + CORE_FACTS + "\n\nThe Ring Dining Hall opens only")

# Weekly timetable lore follows the same data as the engine and Notebook in both exports.
def calendar_timetable_lore(core_entries):
    tt = json.load(open(P('data/calendar.json'), encoding='utf-8'))['timetable']
    for day, label in [('Mon','Monday'),('Tue','Tuesday'),('Wed','Wednesday'),('Thu','Thursday'),('Fri','Friday'),('Sat','Saturday')]:
        row = ' | '.join(tt[day])
        core_entries[131]['content'] = re.sub(r'^- ' + label + r': .*$', '- ' + label + ': ' + row,
                                               core_entries[131]['content'], count=1, flags=re.M)

# ================= v39 standalone =================
C39, N39 = copy.deepcopy(C), copy.deepcopy(N)
apply_lore_edits(C39, N39)
calendar_timetable_lore(C39)
apply_dynamic_lore(C39, False)   # 1.14.0
rep(C39[0], USER_YEAR_OLD, USER_YEAR_V39)   # 1.9.7
apply_cohort(N39, False)   # 1.7.0 cohort 2
gate_cohorts(N39, False)
assert ROY_OLD.search(N39[101]['content'])
N39[101]['content'] = ROY_OLD.sub(
    'Current trouble: This year is his last chance at the Dorm Competition (Month 3 Week 4). Before it, he is training to qualify and already knows the harder problem: '
    'no team wants him, since "illusionist-alchemist" doesn\'t count as a role. Canon outcome afterwards, unless the story changes it: he qualifies in the last Control place of his dorm, and still no team will take him.',
    N39[101]['content'])
# 1.7.5 (owner, 2026-09-27: "edit entry entrance event agar menjelaskan bahwa di year 2/3 user sebagai senior yg mengajak new student
# tour"): from {{user}}'s second year the Entrance Event is theirs to host, not to go through. Card: an EJS section on Player.Profile.Year;
# the v39 export: a plain line.
ENTR_SENIOR = ("{{user}} is a returning Year <%- _py %> student: sorted in their first year and never sorted again. Today {{user}} is one of the "
               "seniors: at 10:00 {{user}} meets the two assigned new first-years in Campus_State.Entrance_tour and takes them round the whole campus until 18:00 (their questions, "
               "the shortcuts, the places to avoid, the club booths on the way), and in the late afternoon shows them their rooms if they were "
               "sorted into {{user}}'s dorm. {{user}} watches the speeches and sorting from the gallery, and eats at the Entrance Feast with their own year.")
C39[21]['content'] += "\nFrom {{user}}'s second year: " + ENTR_SENIOR.replace("a returning Year <%- _py %> student", "a returning student")
batch3_magic_canon(C39, N39)
formal_and_far_grounds(C39, N39)   # 1.15.1
ghost_stories(C39, N39)   # 1.16.0
practical_magic_class(C39)   # 1.33.0
staff_regulars(N39)   # 1.33.0
grand_vast_forest(C39, False)   # 1.38.0
avalon(C39, False)   # 1.39.0
airship(C39, False)   # 1.40.0
sunreach(C39, False)   # 1.41.0
lore_activation(C39)   # 1.35.0
calendar_months = json.load(open(P('data/calendar.json'), encoding='utf-8'))['months']
for month in range(1, 13):
    C39[133 + month]['content'] = f'[Current month: Month {month}]\n' + calendar_months[str(month)]
os.makedirs(P('dist/lorebook_v39'), exist_ok=True)
for name, src, D in (('Core', core, C39), ('NPC_Detailed', npc, N39)):
    out = copy.deepcopy(src); out['entries'] = {str(u): D[u] for u in sorted(D)}
    json.dump(out, open(P(f'dist/lorebook_v39/eldrasil_v39_{name}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

# ================= card worldbook =================
Cc, Nc = copy.deepcopy(C), copy.deepcopy(N)
Cc[21]['content'] += ("\n<%_ { const _py = Math.max(1, Math.min(3, Number(getvar('stat_data.Player.Profile.Year')) || 1)); if (_py > 1) { _%>\n"
                      + ENTR_SENIOR + "\n<%_ } } _%>")
apply_lore_edits(Cc, Nc)
calendar_timetable_lore(Cc)
apply_dynamic_lore(Cc, True)   # 1.14.0
rep(Cc[0], USER_YEAR_OLD, USER_YEAR_CARD)   # 1.9.7: never a first-year from Year 2 on
# 1.11.0 (token audit A3): the roster's Entrance-morning paragraph is sent only on Entrance day
_ENT = Nc[97]['content'][Nc[97]['content'].index('\nEntrance morning (Month 1 Week 1 Monday)'):].split('\n<%')[0]
Nc[97]['content'] = Nc[97]['content'].replace(_ENT, "\n<%_ { const _w = getvar('stat_data.World') || {}; if (+_w.Month === 1 && +_w.Week === 1 && _w.Day === 'Mon') { _%>" + _ENT + "\n<%_ } } _%>", 1)
apply_cohort(Nc, True)   # 1.7.0 cohort 2
# D19: remap NPC uid collisions 254-262 -> 401-409
REMAP = {u: 401 + i for i, u in enumerate(range(254, 263))}
for old, new in REMAP.items():
    e = Nc.pop(old); e['uid'] = new; e['displayIndex'] = new; Nc[new] = e
# D18 Royhan — EJS date gate
assert ROY_OLD.search(Nc[101]['content'])
Nc[101]['content'] = ROY_OLD.sub(lambda _: (
    "<%_ const _rm = Number(getvar('stat_data.World.Month')) || 1, _rw = Number(getvar('stat_data.World.Week')) || 1, _rd = String(getvar('stat_data.World.Day') || ''), _ry = Number(getvar('stat_data.World.Year')) || 1; _%>\n"
    "<%_ if (_ry > 1) { _%>\n"   # 1.7.4: his last year is campaign Year 1; from Year 2 he has graduated (or the story kept him)
    "<%_ } else if (_rm < 3 || (_rm === 3 && (_rw < 4 || !['Sat', 'Sun'].includes(_rd)))) { _%>\n"
    'Current trouble: This year is his last chance. He is training to qualify from the Dorm Competition (Month 3 Week 4) and already knows the harder problem: even if he qualifies, no team wants him, since "illusionist-alchemist" doesn\'t count as a role.\n'
    "<%_ } else if (_rm === 3) { _%>\n"
    'Current trouble: This year is his last chance, and the Dorm Competition is being fought this weekend: he needs one of the three Control places in his dorm. Even if he makes it, no team wants him, since "illusionist-alchemist" doesn\'t count as a role. '
    'If the story has already changed what this depends on (he is hurt, away or out of the competition), adapt it to the story as it is now; never replay it as if nothing happened.\n'
    "<%_ } else { _%>\n"
    'Current trouble: This year, his last, he qualified from the Dorm Competition in the last Control place of his dorm, but no team will take him, since "illusionist-alchemist" doesn\'t count as a role. (Campus_State overrides this if the story played out differently.)\n'
    "<%_ } _%>"), Nc[101]['content'])
gate_cohorts(Nc, True)   # v1.0.3 incoming cohorts (defined at the top)
# 1.7.4 (Year 2 bug hunt): a Halvard NPC's age follows the campaign year (lore ages are as of Year 1, or a cohort's arrival year;
# rival academy teams keep theirs), and a student's own entry says so once they have graduated (Campus_State.Graduated).
YEAR_NOW = "(Number(getvar('stat_data.World.Year')) || 1)"
RIVAL_RX = re.compile(r'^Role: Student, (?!Halvard)\w+ Academy', re.M)
STUDENT_IDS = {seg.split()[0] for m in re.finditer(r'^Year [123]:\s*(.*)$', Nc[97]['content'], re.M) for seg in re.split(r';\s*(?![^()]*\))', m.group(1)) if seg.strip()}
aged = 0
for u, e in Nc.items():
    nid = npc_id(e)
    if not nid or RIVAL_RX.search(e['content']): continue
    a = ARR.get(nid, 1)
    e['content'], n = re.subn(r'(^Age: |\bAge )(\d+)\b', lambda m: f"{m.group(1)}<%- {m.group(2)} + Math.max(0, {YEAR_NOW} - {a}) %>", e['content'], flags=re.M)
    aged += n
    if nid in STUDENT_IDS:
        e['content'], n = re.subn(r'^(\[[^\]\n]+\]\n)', lambda m: m.group(1) + (
            f"<%_ if ((getvar('stat_data.Campus_State.Graduated') || []).includes('{nid}')) {{ _%>\n"
            "Now: graduated; has left Halvard (a visit or a letter is still possible). What follows describes their time as a student.\n<%_ } _%>\n"), e['content'], count=1, flags=re.M)
        assert n == 1, f'no [Name] header in the entry of {nid}'
assert aged >= 30 and len(STUDENT_IDS) >= 28, (aged, len(STUDENT_IDS))
for uid, nid in ((128, 'Dante'), (250, 'Florian')):
    role_line = ("<%_ { const _c = getvar('stat_data.Campus_State.Council') || {}; "
                 "const _g = getvar('stat_data.Campus_State.Graduated') || []; "
                 f"const _id = '{nid}'; "
                 "const _role = _c.President === _id ? 'President' : _c.VicePresident === _id ? 'Vice President' : "
                 "_c.PresidentElect === _id ? 'President-elect' : _c.VicePresidentElect === _id ? 'Vice President-elect' : "
                 "_g.includes(_id) ? '' : 'member'; if (_role) { _%>\n"
                 "Current Student Council role: <%- _role %>.\n<%_ } } _%>\n")
    header = f'[{N[uid]["comment"].replace("NPC — ", "").strip()}]\n'
    assert header in Nc[uid]['content'], header
    Nc[uid]['content'] = Nc[uid]['content'].replace(header, header + role_line, 1)
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
Nc[97]['content'] += ("\n<%_ { const _c = getvar('stat_data.Campus_State.Council') || {}; _%>\n"
                     "Council leadership now: <%- _c.President ? _c.President + ' (President)' : 'no active President on campus' %>, "
                     "<%- _c.VicePresident ? _c.VicePresident + ' (Vice President)' : 'no active Vice President on campus' %>.\n"
                     "<%_ if (_c.PresidentElect) { _%>\n"
                     "Incoming Council leadership: <%- _c.PresidentElect %> (President-elect), <%- _c.VicePresidentElect %> (Vice President-elect).\n"
                     "<%_ } } _%>")

# D17 + calendar automation: 12 month entries -> one EJS entry (uid 134)
calendar = json.load(open(P('data/calendar.json'), encoding='utf-8'))
months = {int(k): v for k, v in calendar['months'].items()}
cal_js = ',\n'.join(f"  {k}: {json.dumps(v, ensure_ascii=False)}" for k, v in months.items())
cal = copy.deepcopy(C[134])
cal.update(disable=False, constant=True, comment='Calendar — Current Month (auto)', key=['calendar', 'this month', 'next month'],
    content=("<%_\nconst _cal = {\n" + cal_js + "\n};\n"
             "const _m = Math.min(12, Math.max(1, Number(getvar('stat_data.World.Month')) || 1));\n"
             "const _n = _m === 12 ? 1 : _m + 1;\n_%>\n"
             "[Current month: Month <%- _m %>]\n<%- _cal[_m] %>\n[Next month (Month <%- _n %>) preview: <%- _cal[_n] %>]"))
for u in range(134, 146): Cc.pop(u)
Cc[134] = cal
# 1.7.4 (owner, 2026-09-27: "tim akademi rival yg year 3 ikut lulus jadi nanti year 2 tim baru yg gk pake year 3 dari year
# sebelumnya"): rival academy students move up a year each campaign year and graduate after their third, like Halvard's. Their
# Role line follows the campaign year (school year, age), a graduate's entry says they left the team, and each team entry names who
# has graduated; new members for the places are not written yet (the owner adds them later).
RIVAL_ROLE = re.compile(r'^Role: Student, (\w+) Academy\. (First|Second|Third) year, age (\d+)', re.M)
ORDINAL = {'First': 1, 'Second': 2, 'Third': 3}
rivals = 0
for u, e in Nc.items():
    nid = npc_id(e); m = RIVAL_ROLE.search(e['content']) if nid else None
    if not m: continue
    y, acad, age, sy = ORDINAL[m.group(2)], m.group(1), int(m.group(3)), f"({ORDINAL[m.group(2)]} + {YEAR_NOW} - 1)"
    e['content'] = (e['content'][:m.start()] + f"Role: <%- {sy} > 3 ? 'Former student' : 'Student' %>, {acad} Academy. "
                    f"<%- {sy} > 3 ? 'Graduated' : ['First', 'Second', 'Third'][{sy} - 1] + ' year' %>, age <%- {age} + {YEAR_NOW} - 1 %>" + e['content'][m.end():])
    e['content'], n = re.subn(r'^(\[[^\]\n]+\]\n)', lambda mm: mm.group(1) + (
        f"<%_ if ({sy} > 3) {{ _%>\nNow: graduated from {acad} Academy at the end of campaign Year {4 - y}; no longer on its team (a visit or a letter "
        "is still possible). What follows describes their time as a student.\n<%_ } _%>\n"), e['content'], count=1, flags=re.M)
    assert n == 1, nid
    rivals += 1
teams = 0
for D in (Cc, Nc):
    for u, e in D.items():
        m = re.search(r'^Team: (.*)$', e['content'], re.M)
        if not m or not re.search(r'\(\w+, Y[123],', m.group(1)): continue
        T = [[x.group(1), int(x.group(2))] for x in re.finditer(r'([A-Z][\w\' -]+?) \(\w+, Y([123]),', m.group(1))]
        e['content'] += ("\n<%_ { const _Y = " + YEAR_NOW + ", _T = " + json.dumps(T) + ", _g = _T.filter(([n, y]) => y + _Y - 1 > 3).map(t => t[0]); if (_Y > 1) { _%>\n"
                         "From campaign Year <%- _Y %>: the school years above are as of Year 1; everyone has moved up <%- _Y - 1 %> year<%- _Y > 2 ? 's' : '' %>."
                         "<%- _g.length ? ' Graduated and off the team: ' + _g.join(', ') + '. The academy fields new members in their places (none on record yet).' : '' %>\n<%_ } } _%>")
        teams += 1
assert rivals == 12 and teams == 3, (rivals, teams)
batch3_magic_canon(Cc, Nc)
formal_and_far_grounds(Cc, Nc)   # 1.15.1
ghost_stories(Cc, Nc)   # 1.16.0
practical_magic_class(Cc)   # 1.33.0
staff_regulars(Nc)   # 1.33.0
grand_vast_forest(Cc, True)   # 1.38.0
avalon(Cc, True)   # 1.39.0
airship(Cc, True)   # 1.40.0
sunreach(Cc, True)   # 1.41.0
lore_activation(Cc)   # 1.35.0
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
    e['ignoreBudget'] = True   # 1.35.0: SillyTavern counts the WI budget on unrendered EJS (the Cast Sheet alone is ~180k tokens raw)
    open(os.path.join(cdir, f"{e['uid']}.txt"), 'w', encoding='utf-8').write(e['content'])
    index.append({k: v for k, v in e.items() if k != 'content'})
json.dump(index, open(P('src/worldbook/index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump({str(k): v for k, v in REMAP.items()}, open(P('data/uid_remap_npc.json'), 'w'), indent=1)
print('card worldbook entries:', len(merged), '| v39 core', len(C39), 'npc', len(N39))
