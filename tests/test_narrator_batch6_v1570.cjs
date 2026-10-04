// 1.57.0 (audit/AUDIT_2026-10-04_1_beban_narator.md §6, batch 6; U3, owner-approved with the VectFox findings): the Journal the
// narrator reads is the story's spine (the engine's bookkeeping goes to $ui.jnotes), first visits and the Entrance tour are remembered,
// <current_state> is compact, and the project's VectFox EventBase prompt is valid for VectFox (commit 3623dc8).
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const go = (S, w, x = []) => applyPatch(S, Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x));
const base = initState({ etnie: true });
const S0 = go(base, { Week: 2, Day: 'Tue', Location: 'Canteen', Time: '12:00' }, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }]);
const NOTABLE = JSON.parse(rd('src/scripts/engine.js').match(/const NOTABLE = new Set\((\[[^\]]*\])\)/)[1]);

console.log('The Journal is the story\'s spine');
{
  const R = go(S0, { Time: '12:10' }, [{ op: 'insert', path: '/Rep_events/-', value: { Rep: 'Academy', XP: 20, Kind: 'event', Why: 'stopped a lab fire' } }]);
  ok(R.$ui.jnotes.some(l => /Academy reputation rose to \+1\./.test(l)) && !R.Journal.some(l => /reputation rose/.test(l)), 'a reputation level change is an engine note, not a Journal line');
  const old = _.cloneDeep(S0); old.$eng.ver = '1.56.0';
  old.Journal = ['[M1 W2 Mon] Bond with Etnie deepened to Rank 4.', '[M1 W2 Mon] Lied to Irene about the library; she no longer covers for {{user}}.', '[M1 W1 Sun] Week recap (M1 W1): a quiet week.'];
  old.$ui.archive = ['[M1 W1 Mon] Society reached Rank 1 (Sociable).'];
  const M = go(old, { Time: '12:05' });
  ok(M.Journal.length === 1 && /Lied to Irene/.test(M.Journal[0]), `an old save: bookkeeping leaves the Journal, the story line stays (${M.Journal.length})`);
  ok(['deepened to Rank 4', 'Week recap', 'reached Rank 1'].every(t => M.$ui.jnotes.some(l => l.includes(t))) && !M.$ui.archive.length, 'and goes to the notes, from the archive too');
  const r = renderEntry(card, 502, S0);
  ok(/Journal \(list\): the story's spine/.test(r) && /Not a scene summary: scene details are recalled from the chat memory/.test(r) && /stays open also goes in Hooks; remove the Hook once it is settled/.test(r), '502: the Journal rule (spine, not scene detail; 1.62.0: open matters go in Hooks)');
  let CHAT = {};   // the UI script's SillyTavern globals, as test_audit_batch7_v1480 stubs them
  global.window = { parent: { document: {} } };
  global.getVariables = o => (o && o.type === 'chat' ? CHAT : {});
  global.updateVariablesWith = (fn, o) => { if (o.type === 'chat') CHAT = fn(JSON.parse(JSON.stringify(CHAT))); };
  global.eventEmit = () => {};
  const U = new Function(rd('src/scripts/ui.js') + '\nreturn { nbJournal };')();
  const html = U.nbJournal(M);
  ok(/Lied to Irene/.test(html) && /class="old" title="Engine note[^"]*">[\s\S]*deepened to Rank 4/.test(html), 'the Journal panel shows the notes, faded, beside the story');
}

console.log('First visits and the Entrance tour');
{
  const place = NOTABLE.find(n => !/Dormitory|Seal Chamber|Warden/.test(n));
  const A = go(go(S0, { Time: '12:05' }, [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: '' } } }]), { Location: place, Time: '12:30' });
  ok(A.Journal.some(l => l.includes(`First visit to ${place}, with Etnie.`)), `a first visit to ${place} is a Journal line with who was there`);
  ok(/came to .+ for the first time today, with Etnie/.test(renderEntry(card, 505, A)), '<now>: the first time, today');
  const Bk = go(go(A, { Location: 'Canteen', Time: '13:30' }), { Week: 3, Day: 'Mon', Location: place, Time: '12:00' });
  ok(new RegExp(`has been to ${place} before \\(first on M1 W2 Tue, with Etnie\\)`).test(renderEntry(card, 505, Bk)) && Bk.Journal.filter(l => l.includes('First visit to')).length === 1, 'a later visit reads as a return, and is not journaled again');
  ok(!go(S0, { Location: 'Fire Dormitory', Time: '12:30' }).Journal.some(l => /First visit/.test(l)), 'the student\'s own dorm is everyday life');
  ok(!NOTABLE.includes('Reception and Gatehouse') && !NOTABLE.includes('Combat Grounds') && NOTABLE.includes('Restricted Section'), 'notable places: an access rule, not the everyday ones');
  const E = go(base, { Time: '17:00' }), T = E.Campus_State.Entrance_tour;
  const E2 = go(E, { Time: '18:10' });
  ok(T && T.FirstYears.length && E2.Journal.some(l => /Toured the grounds on Entrance Day with .+, guided by /.test(l)), `the Entrance tour, once over, is a Journal line (${(E2.Journal.find(l => /Toured/.test(l)) || '').slice(0, 90)})`);
}

console.log('A compact <current_state>');
{
  const S = _.cloneDeep(S0);
  S.Bonds.Irene = { Rank: 3, Trust: 52, Tension: 0, Title: 'Council President', Known_facts: ['a', 'b', 'c', 'd'], Milestones: [], Next: { What: 'Council budget', Where: 'Council Chamber', Until: 'M1 W2 Tue 16:00' } };
  S.Bonds.Ruby = { Rank: 2, Trust: 60, Tension: 12, Title: '', Known_facts: ['likes sweets', 'hates rain'], Milestones: [] };
  S.$ui.cast = { full: [], brief: [], ment: ['Ruby'] };
  S.Player.Wallet.Transactions = ['-1 a', '-2 b', '-3 c', '-4 d', '-5 e'];
  S.Campus_State.Council.Candidates = { 1: { First: 'Florian', Second: 'Dante' } };
  S.Mysteries = { 'The weeping water': { Status: 'solved', Summary: 'x' } };
  S.Clues = { 'Wet stones': { Thread: 'The weeping water', Detail: 'x', Where: 'Lake', Links: [] } };
  const t = renderEntry(card, 501, S);
  ok(/Irene: "?Rank 3; Trust 52; Title: Council President; Next: Council budget at Council Chamber until M1 W2 Tue 16:00/.test(t) && !/- d\n/.test(t), 'someone not here: one line, no facts');
  ok(/Ruby:\n\s+Rank: 2[\s\S]*Known_facts:[\s\S]*likes sweets/.test(t), 'someone just mentioned keeps their latest facts');
  ok((t.match(/^\s+- "?-\d/gm) || []).length === 3, 'the latest three Transactions');
  ok(!/Candidates/.test(t) && !/Entrance_tour/.test(t) && !/Wet stones/.test(t), 'out of season or over: Council candidates, the Entrance tour, clues of a solved mystery');
  const TQ = _.cloneDeep(S0); TQ.Magic._Techniques = { 'Glamour Veil': { Type: 'Occult', Subtype: 'Glamour', Effect: 'A light illusion.', Cannot_do: 'Fools the eye only.', Cost_mode: 'sustained', Activation: 4, Upkeep_per_min: 0.1, Trigger: 0, Hidden: false, Forbidden: false, Notes: '' } };
  ok(/Glamour Veil: "?Occult\/Glamour; lasting, 4 \+ 0\.1\/min: A light illusion\. Cannot: Fools the eye only\./.test(renderEntry(card, 501, TQ)), 'a technique is one line');
  const Bet = _.cloneDeep(S0); Bet.Sunreach = { Ride: '', Bet: { Game: '', Stake: 0 } };
  ok(!/Stake: 0/.test(renderEntry(card, 501, Bet)), 'a record holding only a default 0 is hidden');
}

console.log('The VectFox EventBase prompt (docs/vectfox_eventbase_prompt.txt)');
{
  const p = rd('docs/vectfox_eventbase_prompt.txt');
  ok((p.match(/\{\{text\}\}/g) || []).length === 1 && (p.match(/\{\{maxCount\}\}/g) || []).length === 1 && !/\{\{user\}\}/.test(p), 'VectFox substitutes {{text}} and {{maxCount}} only (core/eventbase-schema.js buildExtractionPrompt): no other macro');
  const TYPES = ['main_quest_update', 'side_quest_update', 'combat', 'travel', 'discovery', 'dialogue_significant', 'relationship_change', 'character_introduction', 'character_state_change', 'item_acquired', 'item_lost', 'faction_change', 'location_change', 'revelation', 'promise_or_oath', 'betrayal', 'death', 'other'];
  ok(p.includes('[' + TYPES.join(', ') + ']'), 'the event types are VectFox\'s EVENT_TYPES');
  const ex = JSON.parse(p.match(/^\[\{"event_type".*\}\]$/m)[0])[0];
  const F = ['event_type', 'importance', 'summary', 'cause', 'result', 'characters', 'locations', 'factions', 'DateTime', 'scene_time', 'items', 'concepts', 'keywords', 'open_threads', 'should_persist'];
  ok(F.every(k => k in ex) && TYPES.includes(ex.event_type) && Number.isInteger(ex.importance) && ex.DateTime === null && ex.should_persist === true, 'the example event has every field VectFox validates');
  const eco = rd('docs/ECOSYSTEM.md'), blk = (eco.match(/````text\n([\s\S]*?)````/) || [])[1];
  ok(blk === p, 'docs/ECOSYSTEM.md carries the same prompt as docs/vectfox_eventbase_prompt.txt');
  ok(/\[In-world time: <date>, at <place>\]/.test(p) && /never list "Eldrasil"/.test(p) && /Never speculative "Will X/.test(p), 'it reads the card\'s clock line, skips the card name, and keeps open threads to stated matters');
}
