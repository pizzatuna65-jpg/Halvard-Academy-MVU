// 1.48.0 (audit batch 7): the Cast Sheet as one entry per NPC (2.7), <now> from the engine ($ui.now, 3.11), the state diet (2.6) and
// the small items (2.9).
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { Schema, runEngine, initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data, ENT = card.character_book.entries, X = id => ENT.find(e => e.id === id);

console.log('The Cast Sheet, one entry per NPC (2.7)');
const npcs = JSON.parse(read('data/npcs.json')), sheets = ENT.filter(e => e.id >= 600 && e.id < 700);
ok(sheets.length === Object.keys(npcs).length && sheets.every(e => /^@@if \[\.\.\.\(\(getvar\('stat_data\.\$ui\.cast'\)/.test(e.content)), 'every NPC has its own sheet entry, which opens with its @@if gate');
const at = e => [e.extensions.position, e.extensions.depth, e.constant, e.extensions.ignore_budget].join();
ok([X(509), X(599), ...sheets].every(e => at(e) === '4,1,true,true') && sheets.every(e => e.insertion_order > X(509).insertion_order && e.insertion_order < X(599).insertion_order)
  && X(599).insertion_order < X(505).insertion_order && new Set(sheets.map(e => e.insertion_order)).size === sheets.length,
  'all @D1, constant, outside the budget: the head 509, the sheets in id order, the tail 599, then <now>');
ok(sheets.every(e => e.content.length < 40000) && X(509).content.length < 10000, `no entry is large any more (the biggest sheet ${Math.max(...sheets.map(e => e.content.length))} chars; was one 679 KB template)`);
// tests/fixtures/cast_1560.json: each scenario's Cast Sheet as 1.56.0 renders it (sha1 and length). 1.47.0's record (cast_1470.json)
// proved the 1.48.0 split; 1.56.0 (U2) changed the text on purpose (the Now block, band words), so the record was renewed then;
// 1.75.0 renewed it for the Ties line 1.74.0 added; 1.76.0 for the Lenna and Dorian club lines (club spread); 1.78.0 for 1.77.1's
// Carries label (220 scenarios differed, every one only by that label). 1.89.0 renewed it for the info layers: 208 scenarios differed,
// each only by the Bond line, the Rank 5 perk text, or the Trust category of the NPCs moved from open to normal (Florian, Aiden, Dorian, Hadrian).
// 1.97.2 renewed it for Gavlan's World Competition line and Vera's Caelmar line: 18 scenarios differed, each only by those added lines (the scenarios
// leave the World teams out, so they keep their people). 1.99.4 renewed it for the head's "Changed by experience" line (bug-hunt audit
// R4): 27 scenarios differed, each only by that line.
// 1.99.5 renewed it for the style pass (bug-hunt audit batch 4, planning/DRAFT_slop_pass.md): 210 scenarios differed, and 1.99.4's
// own renders (its engine and card, in a worktree) with the approved replacements applied are exactly 1.99.5's.
// 1.99.9 renewed it for the tags on fields a bond still holds back (owner playtest): 127 scenarios differed, and 1.99.8's renders (a
// worktree) equal 1.99.9's with the 741 " [not told yet: Rank N]" tags removed.
// 1.99.10 renewed it for the Birthday line of the full sheets: 219 scenarios differed, and 1.99.9's renders equal 1.99.10's with the
// 545 Birthday lines removed.
// 2.0.0 renewed it for the tags at Trust Betrayed (audit A2): 33 scenarios differed, and 1.99.13's renders (a worktree) equal 2.0.0's
// with the 175 " [not told yet: Trust Betrayed]" tags removed (the Gifts prefix back to "Gifts: ").
const { scenario, N } = require('./fixtures/cast_scenarios.cjs');
const REC = JSON.parse(read('tests/fixtures/cast_1560.json'));
const bad = [];
for (let i = 0; i < N; i++) { const t = renderEntry(card, 509, scenario(i)); if (crypto.createHash('sha1').update(t).digest('hex').slice(0, 16) + ' ' + t.length !== REC[i]) bad.push(i); }
ok(REC.length === N && !bad.length, `every scenario's <cast> is the same text as before (${N} scenarios: full and brief sheets, ties, Extras, secrets, memory, Year 2, Entrance morning)` + (bad.length ? ': differs in ' + bad.slice(0, 5).join(', ') : ''));
const S1 = applyPatch(initState(), [{ op: 'replace', path: '/Scene/Present', value: { Irene: { Note: 'here' } } }]);
const kept = ENT.filter(e => e.id >= 600 && e.id < 700).filter(e => require('ejs').render('<%- !!(' + e.content.split('\n')[0].slice(5) + ') %>', { getvar: k => _.get({ stat_data: S1 }, k) }) === 'true');
ok(kept.length === 1 && /Irene/.test(kept[0].comment), 'with one person here, only their sheet survives the @@if');

console.log('<now> from the engine (3.11)');
// tests/fixtures/now_1470.json: <now> as 1.47.0 rendered it (its EJS rules on its engine's state) along update chains on the campus
// with people present, in the forest, Avalon, aboard and in Sunreach Bay; the same chains now print the engine's $ui.now. The whole
// suite was also run with NOW_DIFF (harness): 8,200 <now> renders identical to 1.47.0.
const { chains } = require('./fixtures/now_scenarios.cjs');
const ver = JSON.parse(read('src/card/card.json')).character_version, NREC = JSON.parse(read('tests/fixtures/now_1470.json'));
// 1.52.0: with the NPC routines off (Features), as before them
const CH = chains((S, B, t) => { S.$ui.off = [...new Set([...(S.$ui.off || []), 'npc_routines'])]; return runEngine(S, B, t); }, ver), nbad = [];
// 1.49.0 (feature batch 1): a day whose initiative reason is a favour reads differently by design, 1.51.0 (batch 3) so does a
// "nearby" beat that became a pair moment; every other update is unchanged
// 1.57.0 (U3): a chain whose Journal lost engine notes to $ui.jnotes, or at a notable place (the visit line), reads differently too
// 1.77.0: so does a chain where {{user}} is hurt, wet or tired (the "How {{user}} looks" line)
// 1.53.0 (narrator-load batch 1): "Journal dates" names each date once, so a Journal with a repeated date reads shorter
const dupJ = S => { const d = (S.Journal || []).slice(-5).map(l => (/^\[([^\]]+)\]/.exec(String(l)) || [])[1]).filter(Boolean); return new Set(d).size < d.length; };
CH.forEach((S, i) => { const t = renderEntry(card, 505, S); if (crypto.createHash('sha1').update(t).digest('hex').slice(0, 16) + ' ' + t.length !== NREC[i] && !((S.$ui || {}).initiative || {}).favour && !(((S.$ui || {}).amb || {}).beat || {}).pair && !dupJ(S) && !((S.$ui || {}).now || {}).visit && !((S.$ui || {}).now || {}).looks && !((S.$ui || {}).jnotes || []).length) nbad.push(i); });
ok(CH.length === NREC.length && !nbad.length, `every chain's <now> is the same text as 1.47.0's (${CH.length} updates)` + (nbad.length ? ': differs in ' + nbad.slice(0, 5).join(', ') : ''));
const tmpl = read('src/worldbook/custom/505.template.ejs');
ok(['area', 'pres', 'walk', 'amb'].every(k => tmpl.includes('NOW.' + k)) && !/AREA_EV|AREA_WALK|bandOf\(TEN|TRUST\.cats|BOND\.share/.test(tmpl), '<now> prints the engine\'s lines and no longer holds those rules');

console.log('The state diet (2.6)');
const D = CH[10];   // the campus chain, people present
ok(Object.values(D.$ui.moods).every(m => Object.keys(m).join() === 'mood') && Object.values(D.$ui.now.people || {}).some(L => L.some(l => /^Mood: \w+ \(/.test(l))), 'moods keep only the mood; the reasons are in each person\'s block (1.56.0)');
ok(Object.values(D.$ui.area).every(a => !('walks' in a) && !('near' in a)) && /^Walks from here/.test(D.$ui.now.walk[0]), 'an area keeps no walks of its own: they are <now>\'s line');
ok(D.$ui.file === undefined || typeof D.$ui.file === 'object', 'the Builder record ($ui.file) stays (DECISIONS §2: it restores the Builder-only fields)');

console.log('Small items (2.9)');
const EW = new Function(read('src/scripts/engine.js') + '\nreturn { WXC, wxDay, happeningOn, YEAR_DAYS };')();
for (let d = 0; d < 200; d++) EW.wxDay(12345, 2 * EW.YEAR_DAYS + 100 + d);   // the days a chat has already looked at
EW.happeningOn(12345, 3 * EW.YEAR_DAYS + 5, 1, 'full');
ok(EW.WXC.size > 450 && EW.WXC.has('12345|' + (2 * EW.YEAR_DAYS + 100)), `building a year's happenings no longer empties the weather cache (${EW.WXC.size} days kept; it emptied at 400)`);
{
  let CHAT = {};
  global.window = { parent: { document: {} } };
  global.getVariables = o => (o && o.type === 'chat' ? CHAT : {});
  global.updateVariablesWith = (fn, o) => { if (o.type === 'chat') CHAT = fn(JSON.parse(JSON.stringify(CHAT))); };
  global.eventEmit = () => {};
  const U = new Function(read('src/scripts/ui.js') + '\nreturn { newsMark, newsGet, newsWrite, themed, recolor };')();
  U.newsWrite({ seen: ['stat:Arcana:1', 'stat:Craft:2'], noticed: [] });
  U.newsMark(['stat:Arcana:2'], 'seen');
  ok(U.newsGet().seen.join() === 'stat:Craft:2,stat:Arcana:2', 'eld_seen: a new rank replaces the old rank\'s key');
  U.newsMark(Array.from({ length: 900 }, (_, i) => 'lore:' + i), 'seen');
  ok(U.newsGet().seen.length === 800 && U.newsGet().seen.slice(-1)[0] === 'lore:899', 'eld_seen keeps at most 800 keys, the newest');
  const html = '<p style="color:#1c2230">x</p>';
  ok(U.themed(html) === html, 'the default theme passes the HTML through untouched');
}
