# Bond events: how to write and add them (card 1.2.2+)

A bond rises one rank at a time. Time together fills the bond's XP bar; a full bar opens that rank's **bond event**. When the
event plays out in the story, the narrator raises the rank by 1. Every rank has an event:

- **Scripted:** the one you write (this guide). The engine checks its conditions every reply and hands the narrator your
  directions when they are all true and the NPC is in the scene.
- **Default:** if you have not written one for that NPC and rank, the narrator improvises from the rank's theme
  (`data/bond_rules.json` → `themes`) and the NPC's lore, whenever the NPC is in the scene.

You can add events a few at a time; everything else keeps working on the defaults.

## Format

One lorebook entry per event. The entry's **comment (title)** is:

```
[Bond Event] Trixie — Rank 4→5
```

(first name as in the NPC roster; `→`, `->` or `-` all work; the second number is always the first + 1; `0→1` is the first event.)

The entry's **content**:

```
Syarat: Courtyards or Club Rooms | 16:00–20:00 | Mon–Fri | bukan hujan
Prasyarat: club = Theatre Troupe; month >= 2
Arah:
- Trixie practises a new trick alone and keeps failing; for once she is not cheerful.
- She admits she is afraid her family will be disappointed when the circus comes in Month 8.
- Wajib: she asks {{user}} to be her assistant in the show.
Pilihan:
- Say yes → Trust +5
- Turn her down gently → Trust −5
Hasil: Fact "afraid of disappointing her family"; Project "A show for the circus"; Perk: —
```

English labels work too: `Conditions:`, `Requires:`, `Directions:`, `Must:`, `Choices:`, `Results:`.

| Line | What it does | Notes |
|---|---|---|
| `Syarat:` / `Conditions:` | When the event can start | Parts separated by `|`, any order, all optional: **places** (Campus Map names, several joined with `or`); **time** `16:00–20:00` (can cross midnight); **days** `Mon–Fri`, `Sat/Sun`, `weekdays`, `weekend` (Indonesian day names work); **weather** `not rain` / `bukan hujan` (rain, storm, fog, overcast, cloudy, clear). No line = anywhere, any time. |
| `Prasyarat:` / `Requires:` | Extra prerequisites | `club = <name>`, `dorm = Fire`, `month >= 3`, `year >= 2` (campaign year), separated by `;`. |
| Everything else | Given to the narrator as written | Beats, lines marked `Wajib` / `Must` (these have to happen), choices and their effects, results (facts, a project, a perk). The narrator writes the scene and the dialogue. |

The NPC must also be **in the scene** (Scene.Present). The event is offered, never forced: the narrator plays it when the scene
allows. When the bar is full, the player sees "Bond event ready" with your place and time (People, the bracelet chip), so the
conditions are also the hint that tells the player where to go.

Choices change **Trust** (or Tension); the rank always rises once the event has played out.

## Adding them to the card

1. Put the entries in a lorebook and export it as JSON (or write them in a `.txt`, each event starting with its
   `[Bond Event] …` line). Example: `docs/examples/bond_events_example.txt`.
2. Check: `python3 tools/import_bond_events.py --check your_file.json` (lists the events or names every problem: unknown
   NPC, wrong rank step, a place that is not on the Campus Map, a malformed time).
3. Import: `python3 tools/import_bond_events.py your_file.json` → writes `data/bond_events.json`.
4. Rebuild: `gen_engine.py`, `gen_mvu_entries.py`, `gen_ui.py`, `build_card.py`, then `npm test`.

The event lorebook itself is not added to the card; its text travels inside the engine and reaches the narrator only while
an event is available and in the scene (a few hundred tokens at most, only then).

## Tuning (data/bond_rules.json)

- `xp_base`: XP from each rank to the next at standard pace (10, 20, 30 … 80: about one semester of diligent play in total).
- `pace`: multipliers for the Settings choice (fast ~1 month, brisk ~2 months, standard ~1 semester, slow ~1 year).
- `cool_base`: days after a rank before its next event can start (scaled by pace).
- `kind_xp`, `per_day`, `per_week`, `gift_xp`: what each interaction is worth and how often it counts.
- `themes`: the default event for each rank; `perks`: what each rank allows (told to the narrator for present NPCs).
- `share`: what an NPC talks about at each rank; `data/bond_openness.json` shifts the first tiers per NPC.
