// 1.16.1 (planning/AUDIT_2026-09-29.md, Batch 1): club names, used items need the item, happenings never repeat within two days,
// one "away" rule, Rank 10 suspension before the exam perks, discovered places, no generic milestone, the engine's error rollback,
// _Log in <current_state>, the OOC line.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, runEngine, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data.character_book.entries;
const entry = id => card.find(x => x.id === id).content;
const at = (S, W, ops = []) => applyPatch(S, [...Object.entries(W).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })), ...ops]);

console.log('B1 club names');
for (const [club, want] of [['Soccer Club', 1], ['Soccer', 1], ['soccer club', 1], ['Theatre', 0], ['Chess Club', 0]]) {
  let T = initState();
  T = at(T, { Month: 2, Week: 2, Day: 'Sat', Time: '13:00', Location: club === 'Theatre' ? 'Club Rooms' : 'Sports Field' }, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }, { op: 'replace', path: '/Player/Profile/Club', value: club }]);
  const x0 = T.Player.Profile.Reputation.$xp.Student;
  T = at(T, { Time: '15:30' });
  const got = T.Player.Profile.Reputation.$xp.Student - x0;
  if (club === 'Theatre') ok(T.Player.Profile.Club === 'Theatre Troupe' && got === 1, '"Theatre" is the Theatre Troupe and its Saturday time counts');
  // 1.75.0: an unknown club is one {{user}} founds (tests/test_founded_club_v1750.cjs); {{user}} joins it once it is founded
  else if (club === 'Chess Club') ok(T.Player.Profile.Club === '' && T.Campus_State.Founded_club.Name === 'Chess Club' && got === 0 && T._Log.some(l => /not a club yet/.test(l)), 'an unknown club is being founded, logged, and earns nothing yet');
  else ok(T.Player.Profile.Club === 'Soccer Club' && got === want, `"${club}" becomes the Soccer Club and its Saturday time counts`);
}

console.log('B2 used items need the item');
{
  let S = at(initState(), { Day: 'Tue', Time: '09:00' }, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }, { op: 'replace', path: '/Player/Vitals/Resting', value: 'sleep' }]);
  S = at(S, { Time: '09:05' }, [{ op: 'replace', path: '/Player/Vitals/Stamina', value: 40 }]);
  const s0 = S.Player.Vitals.Stamina;
  S = at(S, { Time: '09:06' }, [{ op: 'insert', path: '/Consumables/-', value: 'Blossom honey cake' }]);
  ok(S.Player.Vitals.Stamina === s0 && S._Log.some(l => /has none/.test(l)), 'not in the Bag and not bought: no effect, logged');
  S = at(S, { Time: '09:10' }, [{ op: 'insert', path: '/Inventory/Blossom honey cake', value: { Qty: 1, Kind: 'food' } }]);
  const s1 = S.Player.Vitals.Stamina;
  S = at(S, { Time: '09:11' }, [{ op: 'insert', path: '/Consumables/-', value: 'Blossom honey cake' }]);
  ok(S.Player.Vitals.Stamina === s1 + 10 && !S.Inventory['Blossom honey cake'], 'from the Bag: the effect applies and the Bag loses it');
  const s2 = S.Player.Vitals.Stamina;
  S = at(S, { Time: '09:20' }, [{ op: 'delta', path: '/Player/Wallet/Points', value: -12 }, { op: 'insert', path: '/Player/Wallet/Transactions/-', value: '-12 blossom honey cake (The Mall — bakery)' }, { op: 'insert', path: '/Consumables/-', value: 'Blossom honey cake' }]);
  ok(S.Player.Vitals.Stamina === s2 + 10, 'bought and eaten in the same reply: the effect applies');
}

console.log('B3 happenings');
{
  const src = rd('src/scripts/engine.js');
  const E = new Function(src + '\nreturn { happeningOn, HAPPEN_RATE };')();
  let rep = 0, n = 0;
  for (const seed of [11, 222, 3333, 44444, 555555]) {
    let prev = [null, null];   // the last two DAYS (a day without a happening counts)
    for (let d = 0; d < 336 * 2; d++) { const h = E.happeningOn(seed, d, E.HAPPEN_RATE.often, 'full'), id = (h && h.id) || null; if (id) { n++; if (prev.includes(id)) rep++; } prev = [id, prev[0]]; }
  }
  ok(n > 1000 && rep === 0, `no happening repeats within two days (${n} happenings, ${rep} repeats)`);
}

console.log('B4 one away rule');
{
  const src = rd('src/scripts/engine.js');
  const E = new Function(src + '\nreturn { npcAwayIn };')();
  const S = { Campus_State: { Graduated: ['Gareth'], NPC_status: { 'Irene Chanare': 'expelled for a term', Etnie: 'back from the capital', Zara: 'in hospital' } } };
  ok(E.npcAwayIn(S, 'Irene') && E.npcAwayIn(S, 'Zara') && E.npcAwayIn(S, 'Gareth'), 'expelled, in hospital and graduated are away (full names and first names both found)');
  ok(!E.npcAwayIn(S, 'Etnie') && !E.npcAwayIn(S, 'Castor'), 'a status that does not keep them away, or none, is not away');
  // initiative: a harmless status no longer blocks it
  const eng = rd('src/scripts/engine.template.js');
  ok(!/NPC_status\[id\]|NPC_status\[I\.id\]/.test(eng), 'NPC initiative reads the away rule, not any status');
}

console.log('B5 Rank 10 suspension before the exam perks');
{
  const eng = rd('src/scripts/engine.template.js');
  ok(eng.indexOf('S.$ui.tsusp = tsuspOf(S, (hasB && B.Bonds) || S.Bonds)') < eng.indexOf('const perkOn = '), 'tsusp is set before the exam perks read it');
}

console.log('B6 discovered places');
{
  let S = initState();
  S = at(S, { Time: '08:00', Location: 'Sunreach Bay — beachfront' });
  S = at(S, { Time: '09:00', Location: 'Main Library' });
  ok(!S.$ui.discovered.some(p => /Sunreach/.test(p)) && S.$ui.discovered.includes('Main Library'), 'only Campus Map places are recorded');
}

console.log('T4 no generic milestone');
{
  ok(!/Grew closer through ordinary time together/.test(rd('src/scripts/engine.js')), 'a rank-up writes no generic Milestone');
}

console.log('B8 the engine error rolls back');
{
  const handlers = {};
  const ctx = { eventOn: (ev, fn) => { handlers[ev] = fn; }, waitGlobalInitialized: async () => {}, Mvu: { events: { VARIABLE_UPDATE_STARTED: 's', COMMAND_PARSED: 'c', VARIABLE_UPDATE_ENDED: 'e' } }, SillyTavern: { chat: [] } };
  new Function('eventOn', 'waitGlobalInitialized', 'Mvu', 'SillyTavern', rd('src/scripts/engine.js'))(ctx.eventOn, ctx.waitGlobalInitialized, ctx.Mvu, ctx.SillyTavern);
  setTimeout(() => {
    const before = initState(), after = _.cloneDeep(before);
    after.Magic.Casts = 5; after.Player.Wallet.Points = 999999;   // Casts that are no list make the engine throw halfway
    const quiet = console.error; console.error = () => {};
    handlers.e({ stat_data: after }, { stat_data: before });
    console.error = quiet;
    ok(after.Player.Wallet.Points === before.Player.Wallet.Points && Array.isArray(after.Magic.Casts), 'the half-run update is not kept: the state is the one before the reply');
    ok(after._Log.some(l => /^Engine error/.test(l)) && after.$ui.toasts.some(t => /Engine error/.test(t)), 'the player is told (Log and toast)');
  }, 20);
}

console.log('T7 _Log in <current_state>, P3 OOC');
{
  let S = initState();
  S = at(S, { Month: 2, Time: '09:00' });   // a time-jump line now
  S._Log = ['[M1 W1 Mon 07:30] an old line', ...S._Log];
  const txt = ejs.render(entry(501), { getvar: k => _.get({ stat_data: S }, k) });
  ok(/Time moved 28 days/.test(txt) && !/an old line/.test(txt), '<current_state> shows only the latest update\'s _Log lines');
  ok(/out-of-character \(OOC\)/.test(entry(503)), '503 says an OOC answer has no block');
}
