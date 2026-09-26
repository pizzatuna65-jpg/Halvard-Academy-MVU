# Test checklist — card v1.6.11 with the edited preset and VectFox

Automated (all passing at 1.6.9): `npm test` = 39 suites + static QA, 1159 checks (every save from 1.4.6 to 1.6.8 loads);
`npm run stress` plus the fuzz on seeds 2-9 (48,000 random updates, no problems); `tests/preview/smoke_all_panels.py` 550 views,
no errors; token audit ~12.3k start / ~17.2k heavy mid-game; the preset built twice, byte-identical. Checked in upstream source:
SillyTavern puts depth-0 prompts of the system role after the user-role ones (`openai.js` `populationInjectionPrompts`), so the
card's cast gate (510) and `<update_format>` (503) are still the last thing the model reads after the preset's Player Input
Authority and BOLT; `{{lastUserMessage}}` skips hidden messages, so a Builder or Settings note is never taken for the player's input.

Everything below can only be checked inside SillyTavern. Most important first. Earlier checklists still apply
(`TEST_CHECKLIST_v1.0.3.md` first, then `v1.1`, `v1.0`, `v0.5`).

## Setup (once)
- [ ] Import `dist/Eldrasil_Halvard.png`. The card offers to install (or update) its lorebook: accept. The bracelet shows no
      "old lorebook" warning, and the MVU panel shows the card config as overriding.
- [ ] Import `presets/Realistic_Frankenstein_2_2_Eldrasil.json` and select it. Leave its toggles as shipped: BOLT ON (MAX and
      Micro CoT OFF), Player Input Authority ON, "⏰ Time and Place" OFF, every Internal States toggle OFF (Relationships RPG,
      GM's Notebook, Internal Agenda, Chekhov's Gun, World Sim, Fate & Routine, Internal Thoughts, DnD Simulator, Inventory).
- [ ] VectFox (`docs/VECTFOX.md`): Text Cleaning in Custom mode, "Strip <UpdateVariable> Tags (MVU)" unticked, the five
      patterns of `docs/vectfox_cleaning_patterns.json` added in that order; Semantic World Info OFF for the card's lorebook;
      Summarizer Injection OFF; EventBase ON; injection position "After Main Prompt" (or In-Chat at depth 2 or more); Ghosting OFF
      while the card's trim regex is on.

## Preset + card
- [ ] Open the prompt of a reply (Prompt Itemization or the prompt inspector). At the bottom: your message, then the preset's
      `<input_authority>` and BOLT, then one system block that ends with the cast gate (only when someone is present) and
      `<update_format>`. No `<%` anywhere (EJS rendered).
- [ ] The reasoning opens with `Now: M? W? Day HH:MM at <place>` and runs through BOLT task 11 (three options, one a HOLD);
      the reply ends with a complete `</UpdateVariable>` and the bracelet sits above the narration.
- [ ] Coloured dialogue (Colored Dialogue 2.0) shows in colour, and the update block is folded. With two people talking in the
      same reply, the next reply's prompt gives full sheets to those who spoke (the colour tags do not hide the speakers).
- [ ] With four or more people present: the `<cast>` block has at most four full sheets, the rest brief; their keyword entries
      print nothing; the request goes out without a noticeable delay (the Cast Sheet is the largest EJS entry). Note the prompt
      size: about 9k tokens for the Cast Sheet with four full and four brief sheets.
- [ ] Save something in Student file → Settings, then write a story message: the reply answers your story message (the hidden
      Settings note is not read as your input).

## VectFox + card
- [ ] After a few replies, open VectFox's stored events: each is the prose without colour tags or graphics, plus one line
      `[In-world time: M? W? Day HH:MM, at <place>]`. No `<UpdateVariable>`, no `<StatusPlaceHolderImpl/>`, and nothing from
      the Cast Sheet (Mind, Knows, Next).
- [ ] Swipe the latest reply twice: no duplicate events for it. Builder and Settings notes never appear as events.
- [ ] Recall an old scene ("remember the library flood?"): the narrator uses the memory but keeps the current wallet, clock and
      each character's Cast Sheet over what the memory says.

## Card 1.6.9 fixes (use `dist/test/Eldrasil_TEST_Rank7.png`, every bond at Rank 7)
- [ ] Irene with Trust 47-49 (lower it in the story): the bond event's direction says it can only become a sworn rivalry;
      after the event the Cast Sheet shows "Sworn rival of {{user}}: …" (before 1.6.9 it recorded a best friendship here).
- [ ] Gavlan or Krieg present: their sheet says "Not a romance: … does not become {{user}}'s romance". Flirt with them: they
      answer in character, and the Romance flag stays off.
- [ ] Settings → romance from Rank 10: Ruby's dossier says "romance (from Rank 10 in Settings)".

## Continuing a chat across versions
- [ ] Open a chat started on 1.6.8 after importing 1.6.9: the card asks to update its lorebook; after that the next reply keeps
      every bond, rank, Trust, perk and Journal line (check Student file and People).

## Card 1.6.10: Connections direction
- [ ] People → Connections with Kuroo, Etnie and Mimosa met: arrows from Kuroo to Etnie and from Kuroo to Mimosa (protective,
      one way); Gavlan and Gareth: one arrow from Gavlan. Click a line: each "X's side" note describes X's own view or doing.

## Card 1.6.11: first meetings
- [ ] Meet someone new (Trixie in the Courtyards): their dossier shows Trust at their start (Trixie 60, Neutral), never Betrayed.
- [ ] People → Connections, Groups: Club on: someone you met at Rank 0 is not in a club yet; at Rank 1 they join their club's label.
