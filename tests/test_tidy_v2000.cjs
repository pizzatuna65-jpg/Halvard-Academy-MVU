// 2.0.0: the bug-hunt audit's batch 8 (audit/AUDIT_2026-10-23_2_audit_menyeluruh.md §8: K1 long functions split, K2 canon data out of
// the engine, K3 one helper for each duplicate; proven with ENGINE_DIFF against 1.99.13, no difference) and the short audit before it
// (§11: A1 the "Around campus today" thread, A2 the held tags at Trust Betrayed, A3 the dossier's Look for, A4 rule cards read the prose).
const fs = require('fs'), path = require('path'), _ = require('lodash');
const { initState, applyPatch, renderEntry, ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const tpl = rd('src/scripts/engine.template.js'), eng = rd('src/scripts/engine.js');
const E = new Function(eng + '\nreturn { ENGINE_STEPS, COUNCIL, DW, userBday, isBday, pactKey };')();
global.window = { parent: { document: {} } };
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { DATA, PANELS, view };')();
const put = (p, v) => ({ op: 'replace', path: p, value: v });
const T = (S, time, ops, o) => applyPatch(S, [put('/World/Time', time), ...(ops || [])], o);

console.log('K1: the long functions, split');
{
  const names = E.ENGINE_STEPS.map(f => f.name);
  ok(names.indexOf('stepBondRecords') === names.indexOf('stepBonds') - 1 && names.indexOf('stepPromises') === names.indexOf('stepBondRecords') - 1, 'stepBondRecords runs where the start of stepBonds did (after stepPromises)');
  const len = name => { const i = tpl.indexOf('\nfunction ' + name + '('), j = tpl.indexOf('\n}\n', i); return tpl.slice(i, j).split('\n').length; };
  ok(len('stepBonds') < 200 && ['bondOwned', 'bondXP', 'bondTrust', 'bondTension', 'bondRecent', 'stepBondRecords'].every(f => len(f) > 10 && len(f) < 100), `stepBonds ${len('stepBonds')} lines (was 501), its parts each under 100`);
  ok(len('stepTime') < 200 && len('councilYear') > 30, `stepTime ${len('stepTime')} lines (was 233): the Student Council is councilYear`);
}

console.log('K2: canon data lives in data/');
{
  for (const w of ['Percival', 'Sir Krieg Valforth', 'Milena Sagona', 'returning student and the assigned senior guide', "'Bobby'", "NOBLES = ['", "'Bianca'"])
    ok(!tpl.includes(w), `the engine template no longer names ${w}`);
  const C = JSON.parse(rd('data/council.json'));
  ok(_.isEqual(E.COUNCIL.members, C.members) && E.DW.interview.second === 'Milena' && E.DW.interview.names.Krieg === 'Sir Krieg Valforth', 'data/council.json and dove_watch.json names reach the engine');
  const init = rd('src/worldbook/custom/content/500.txt');   // the starting state ([initvar]) is hand-written: it must agree
  ok(init.includes(`"1": { First: ${C.candidates['1'][0]}, Second: ${C.candidates['1'][1]} }`) && init.includes(`President: ${C.year1.President}\n`) && init.includes(`VicePresident: ${C.year1.VicePresident}\n`)
    && init.includes(`Members: [${C.members['1'].join(', ')}]`), 'the starting state (500) has the same Year 1 Council as data/council.json');
  const S = initState();
  ok(_.isEqual(S.Campus_State.Council.Members, C.members['1']) && S.Campus_State.Council.President === C.year1.President && _.isEqual(S.Campus_State.Council.Candidates['1'], { First: 'Florian', Second: 'Dante' }), 'Year 1: the sitting Council and its nominees from data/council.json');
  // Year 2 with {{user}} on the Council: the second nominee is {{user}}, and sits on the Council with Caralynn
  let Y2 = applyPatch(initState(), [put('/World/Year', 2), put('/World/Month', 2), put('/Player/Profile/Council', true), put('/Player/Profile/Name', 'Aria Vale')]);
  const Cn = Y2.Campus_State.Council;
  ok(Cn.Candidates['2'] && Cn.Candidates['2'].First === 'Caralynn' && Cn.Candidates['2'].Second === 'Aria Vale', 'Year 2: Caralynn and {{user}} are the nominees');
  ok(Cn.Results['1'] && Cn.Results['1'].President === 'Florian' && Cn.President === 'Florian' && Cn.VicePresident === 'Dante', 'a save that skipped the Year 1 election: Florian and Dante (council.json skipped)');
  ok(_.isEqual(Cn.Members, ['Florian', 'Dante', 'Caralynn', 'Aria Vale']), `Year 2 members: the elected pair, Caralynn, the second nominee (${Cn.Members.join(', ')})`);
  const Y3 = applyPatch(initState(), [put('/World/Year', 3), put('/World/Month', 2)]);
  ok(['Hadrian', 'Nerys', 'Bianca'].every(x => Y3.Campus_State.Council.Members.includes(x)), 'Year 3 members from the last row');
  const back = applyPatch(initState(), [put('/World/Year', 2), put('/World/Month', 1), put('/World/Week', 1), put('/World/Day', 'Mon'), put('/World/Time', '09:00')]);
  ok(back.World._Event_today.includes('(' + JSON.parse(rd('data/calendar.json')).events.find(e => e.entr).back + ')'), 'the Entrance Event for a returning student: calendar.json back');
}

console.log('K3: one helper for each duplicate');
{
  ok((tpl.match(/\.exec\(String\(S\.Player\.Profile\.Birthday/g) || []).length === 1 && (tpl.match(/\\\[pact\\\]/g) || []).length === 1, "one birthday reading (userBday), one [pact] pattern (pactKey)");
  ok(_.isEqual(E.userBday({ Player: { Profile: { Birthday: 'M3 W2 Thu' } } }), { m: 3, w: 2, d: 'Thu' }) && E.userBday({ Player: { Profile: { Birthday: '' } } }) === null
    && E.isBday({ m: 3, w: 2, d: 'Thu' }, { Month: 3, Week: 2, Day: 'Thu' }) && !E.isBday(null, {}), 'userBday / isBday');
  ok(E.pactKey({ Notes: '[pact] Ember ' }) === 'Ember' && E.pactKey({ Notes: 'a fire spell' }) === '' && E.pactKey(undefined) === '', 'pactKey');
  ok((tpl.match(/roll\('resc'\)/g) || []).length === 1 && JSON.parse(rd('data/avalon.json')).raid.why && JSON.parse(rd('data/hanakaze.json')).raid.why, 'one raid (areaRaid), its words in avalon.json and hanakaze.json');
}

console.log('A1: "Around campus today" counts among the optional threads');
{
  const S = T(initState(), '10:00', [put('/World/Location', 'Main Library')]);
  S.World._Happening = 'Now, until 14:00, around campus: a test happening.';
  const txt = renderEntry(card, 505, S, null, { lastUserMessage: '' });
  ok(/^Around campus today \(optional, use only if it fits\): /m.test(txt) && /Optional threads \([^)]*Around campus today[^)]*\): use at most one/.test(txt), 'the happening is printed and counted (1.99.11 had turned it into a comment)');
}

console.log('A2: held fields are tagged at Trust Betrayed too');
{
  const sheet = S => renderEntry(card, 509, S, null, { lastUserMessage: '' });
  let S = T(initState(), '09:00', [put('/Scene/Present', { Trixie: { Note: '' } }), { op: 'insert', path: '/Bonds/Trixie', value: { Rank: 0 } }]);
  S.Bonds.Trixie.Trust = 5; S = T(S, '09:10', []);
  ok(S.Bonds.Trixie.Trust < 15 && ((S.$ui.now || {}).held || {}).Trixie && S.$ui.now.held.Trixie.Loves === 'Trust Betrayed', `Trust ${S.Bonds.Trixie.Trust} (Betrayed): the engine holds Loves back`);
  const t = sheet(S);
  ok(/^Loves \[not told yet: Trust Betrayed\]: /m.test(t) && /^Gifts \[not told yet: Trust Betrayed; they only react when given one\]: /m.test(t) && /shares nothing new with \{\{user\}\}/.test(t), 'the sheet tags her Loves and the gift line, as the Bond line says');
  ok(/^Personality: /m.test(t), 'the ways she behaves stay untagged');
}

console.log('A3: the dossier\'s Look for only where the engine rolls it');
{
  const base = T(initState({ etnie: true }), '12:30', [put('/World/Location', 'Canteen')]);
  const T5 = _.cloneDeep(base); T5.Bonds.Trixie = { Rank: 5, Trust: 70, Tension: 0, Known_facts: [], Milestones: [] };
  U.view.arg = 'Trixie'; U.view.look = '';
  ok(/data-look="Trixie"/.test(U.PANELS.npc.render(T5)), 'on: the button is there');
  const off = _.cloneDeep(T5); off.$ui.off = ['presence_roll']; off.$ui.on = { ...(off.$ui.on || {}), presence_roll: false };
  ok(!/data-look="Trixie"/.test(U.PANELS.npc.render(off)), 'Who is here off: no button (the engine would not roll it)');
  const late = _.cloneDeep(T5); late.World._Curfew = 'CURFEW (Fire Dormitory)';
  ok(!/data-look="Trixie"/.test(U.PANELS.npc.render(late)), 'after curfew: no button');
  const away = _.cloneDeep(T5); away.$ui.area = { ...(away.$ui.area || {}), avalon: { on: true } };
  ok(!/data-look="Trixie"/.test(U.PANELS.npc.render(away)), 'in an outside area: no button');
}

console.log('A4: rule cards read the story through proseOf');
{
  const S0 = T(initState(), '10:00', [put('/World/Location', 'Main Library')]);
  const thought = 'She reads.\n<npc_thoughts>\n- **Irene**: the Old Hut again, tonight.\n</npc_thoughts>';
  const A = T(S0, '10:10', [], { text: thought });
  ok(!((A.$ui.now || {}).rules || []).includes('old_hut'), "an NPC's thought about the Old Hut opens no card");
  const B = T(S0, '10:10', [], { text: 'Irene mentions the Old Hut by the lake.' });
  ok(((B.$ui.now || {}).rules || []).includes('old_hut'), 'the story naming it does (fail-open by a word)');
}
