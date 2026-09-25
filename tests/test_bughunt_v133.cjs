// 1.3.3 bug hunt (stress tests in tests/stress/): regressions for what they found.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { TEMPLATES, blankDraft, buildOps, draftFromState, manaOf, personal, youText, PACT_KINDS, moveCost };')();
console.log('Bug hunt 1.3.3');
const S0 = initState({ etnie: true });
const set = (S, p, v) => applyPatch(S, [{ op: 'replace', path: p, value: v }]);

// ---- the clock: typos are read, unreadable values keep the previous clock instead of jumping to 08:00 / Monday
const T = v => set(S0, '/World/Time', v).World;
ok(T('9.30').Time === '09:30' && T('7pm').Time === '19:00' && T('noon').Time === '12:00' && T('8:05 am').Time === '08:05', 'loose times: 9.30, 7pm, noon, 8:05 am');
const L = set(S0, '/World/Time', 'later');
ok(L.World.Time === '07:30' && L.World.Day === 'Mon' && L._Log.some(l => /Time could not be read/.test(l)), 'an unreadable time keeps the clock (was: 08:00, a day forward)');
ok(set(S0, '/World/Time', '25:61').World.Time === '07:30', 'an impossible time keeps the clock');
ok(set(S0, '/World/Day', 'tuesday').World.Day === 'Tue' && set(S0, '/World/Day', 'Funday').World.Day === 'Mon' && set(S0, '/World/Day', 'Funday').World.Week === 1, 'weekday names are read loosely; nonsense keeps the day (was: Monday, a week on)');
// ---- odd values: a command the schema rejects is dropped (as the MVU zod helper does), null text is not "null"
let D = applyPatch(S0, [{ op: 'replace', path: '/Hidden/Dove_attention', value: 30 }]);
D = applyPatch(D, [{ op: 'replace', path: '/Hidden/Dove_attention', value: 'lots' }, { op: 'replace', path: '/Player/Vitals/HP', value: 80 }]);
ok(D.Hidden.Dove_attention === 30 && D.Player.Vitals.HP === 80 && applyPatch.dropped.length === 1, 'a non-number is dropped on its own (the rest of the update lands)');
ok(set(S0, '/Bonds/Etnie/Title', null).Bonds.Etnie.Title === '' && set(S0, '/World/Location', null).World.Location !== 'null', 'null never becomes the text "null"');

// ---- bonds cannot be deleted or wiped by a whole-record replace
let B = applyPatch(S0, [{ op: 'replace', path: '/Scene/Present', value: { Trixie: { Note: '' } } }, { op: 'replace', path: '/Bonds/Etnie/Known_facts', value: ['f1', 'f2'] }]);
const W = set(B, '/Bonds', { Trixie: B.Bonds.Trixie });
ok(W.Bonds.Etnie && W.Bonds.Etnie.Rank === 3 && W._Log.some(l => /cannot be removed \(Etnie\)/.test(l)), 'replacing /Bonds without Etnie keeps her bond');
const R = set(B, '/Bonds/Etnie', { Rank: 3 });
ok(R.Bonds.Etnie.Known_facts.join() === 'f1,f2' && R.Bonds.Etnie.Milestones.length === 1 && R.Bonds.Etnie.Title === 'Self-declared big sister' && R.Bonds.Etnie.Trust === 70, 'a record rewritten whole keeps facts, milestones, title and trust');
const R2 = set(B, '/Bonds/Etnie/Known_facts', []);
ok(R2.Bonds.Etnie.Known_facts.length === 0, 'clearing only the facts (milestones kept) is allowed');

// ---- Builder: training leaves fractions; loading and saving must not round them away
const d = Object.assign(U.blankDraft(), U.TEMPLATES[0].make()); d.name = 'Aria Vale';
let S = applyPatch(S0, U.buildOps(d, S0), { mvu: true });
for (let i = 0; i < 3; i++) S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: `1${i}:00` }, { op: 'insert', path: '/Training/-', value: { Track: 'mana' } }]);
const mm = S.Player.Vitals.Mana_max, d2 = U.draftFromState(S);
ok(mm % 1 !== 0 && U.manaOf(d2) === mm && !U.buildOps(d2, S).some(o => o.path === '/Player/Vitals/Mana_max'), `an amend keeps a trained Mana_max of ${mm} (was rounded)`);
// ---- names in lore text
const N = JSON.parse(JSON.stringify(S0)); N.Player.Profile.Name = 'A$&B';
ok(U.personal('hi {{user}}', N) === 'hi A$&amp;B' && U.youText('{{user}}!', N) === 'A$&B!', 'a name with "$&" is shown as written');
// ---- pact: changing what the pact is made with rescales the abilities that have a strength
const sp = Object.assign(U.blankDraft(), U.TEMPLATES.find(t => t.id === 'spirit').make());
const p = sp.pacts[0]; p.kind = 'Monster'; p.tier = 'Grade I';
ok(U.moveCost(p, p.moves[0]).act === 25, 'a Grade I monster: Standard ability 25');
