// 1.99.6 (bug-hunt audit 2026-10-23 T5): someone only mentioned gets what is commonly known about them. An NPC's keyword entry prints
// the public part (data/bond_rules.json layers.of.public, the first sentence of their Personality, their Now line, no <narrator_only>)
// unless they are here or the player's new message names them; with a full sheet it prints nothing (1.5.1); Features: mention_brief.
// tools/merge_lorebooks.py mention_brief, tools/gen_mvu_entries.py GATE_RX; replay: node tests/lore_replay.cjs <chat.jsonl>.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, renderEntry, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const npcs = JSON.parse(read('data/npcs.json')), K = npcs.Kanae.uid_card, P = npcs.Percival.uid_card;
const op = (p, value) => ({ op: 'replace', path: p, value });
const S0 = initState();
const cast = (S, full, brief) => { const T = JSON.parse(JSON.stringify(S)); T.$ui.cast = { ...(T.$ui.cast || {}), full, brief }; return T; };
const R = (uid, S, msg) => renderEntry(card, uid, S, null, { lastUserMessage: msg }).trim();
const tok = s => Math.round(s.length / 4);

console.log('Only mentioned: the public part');
const brief = R(K, cast(S0, [], []), 'I wonder who runs the Observation Tower queue. (scene: Canteen · t3)');
ok(/^\[Kanae Quveno\]\nOnly mentioned, not here/.test(brief) && /Appearance: Long straight black hair/.test(brief) && /Club: Divination Society/.test(brief)
  && /Speech: Sweet and charming/.test(brief) && /- Creation: conjured chains/.test(brief), 'Kanae: header, note, looks, magic (both lines), club, speech');
ok(!/narrator_only|Plan|isolate|Backstory|Loves|Goals|Relations|Emotional tells/.test(brief) && /Personality \(public\): Sweet, charming/.test(brief), 'no secret, no backstory, loves, goals, relations or tells; the public personality');
const full = R(K, cast(S0, [], []), 'I go to the Observation Tower to find Kanae.');
ok(/<narrator_only>/.test(full) && /Backstory: Second daughter/.test(full) && !/Only mentioned/.test(full), 'the player names her: the whole lore (she may be about to appear)');
ok(tok(brief) * 2.5 < tok(full), `the public part is much shorter (${tok(brief)} vs ${tok(full)} tokens)`);
ok(/Backstory/.test(R(K, cast(S0, [], []), 'Have you seen Miss Quveno today?')) && /Backstory/.test(R(K, cast(S0, [], []), 'kanae?')), 'a surname or a lower-case name counts as naming her');
ok(/Only mentioned/.test(R(K, cast(S0, [], []), 'We sit down.\n(scene: Kanae, Zara · Canteen · t3)')), 'the engine\'s scene marker is not the player\'s words');
ok(/Only mentioned/.test(R(K, cast(S0, [], []), 'I check my Kanaebook.')) , 'a longer word is no name');

console.log('Here, or with a sheet');
const here = applyPatch(S0, [op('/Scene/Present', { Kanae: { Note: 'by the window' } })]);
ok(/Backstory/.test(R(K, cast(here, [], ['Kanae']), 'Hello there.')), 'present beyond the cap (a brief sheet): the whole lore by keyword, as before');
ok(/Backstory/.test(R(K, cast(here, [], []), 'Hello there.')), 'in Scene.Present (no cast yet): the whole lore');
ok(R(K, cast(here, ['Kanae'], []), 'Kanae, hi.') === '', 'with a full sheet: nothing (1.5.1)');

console.log('Features');
const off = cast(S0, [], []); off.$ui.off = ['mention_brief'];
ok(/Backstory/.test(R(K, off, 'Nothing to say.')), 'mention_brief off: the whole lore whenever the name comes up');
const F = JSON.parse(read('data/features.json')).features.find(f => f.id === 'mention_brief');
ok(F && F.control === 'toggle', 'Settings > Features lists it as a toggle');

console.log('Every NPC entry, and the Cast Sheet');
const KW = card.character_book.entries.filter(e => Object.values(npcs).some(n => n.uid_card === e.id));
const parts = KW.map(e => /\{ if \([^\n]*\) \{ _%>\n([\s\S]*?)\n<%_ \} else \{ \/\* full lore \*\/ _%>\n/.exec(e.content));
ok(KW.length === Object.keys(npcs).length && parts.every(Boolean), `every NPC keyword entry (${KW.length}) has the public part and the full lore`);
ok(parts.every(m => !/<narrator_only>/.test(m[1])), 'no public part carries <narrator_only>');
const S1 = cast(S0, [], []);
const bad = KW.filter(e => { try { const t = R(e.id, S1, 'Hello.'); return !/Only mentioned, not here/.test(t) && !/graduated|Former student/.test(t) && t !== ''; } catch (x) { return true; } });
ok(!bad.length, 'every public part renders on its own (EJS blocks still balance)' + (bad.length ? ': ' + bad.map(e => e.comment).join(', ') : ''));
const sheet = renderEntry(card, 509, applyPatch(here, [op('/$ui/cast', { full: ['Kanae'], brief: [] })]));
ok(/\[Kanae Quveno\] full sheet/.test(sheet) && /Backstory: Second daughter/.test(sheet) && !/Only mentioned, not here/.test(sheet), 'the Cast Sheet still carries the full lore (gen_mvu_entries GATE_RX)');
ok(/Percival/.test(R(P, S1, 'The bell rings.')) && tok(R(P, S1, 'The bell rings.')) < 600, 'Percival, mentioned four times in the owner\'s Entrance morning, costs a few hundred tokens');
