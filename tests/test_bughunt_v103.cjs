// v1.0.3: regression checks for the two v1.0.2 bug-hunt reports (model A #1-#6, model B F01-F14).
// Each block names the report item it covers. Uses the same schema + engine path as MVU (tests/harness.cjs).
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, runEngine, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const W = S => `Y${S.World.Year} M${S.World.Month} W${S.World.Week} ${S.World.Day} ${S.World.Time}`;
const set = (S, o, x) => applyPatch(S, Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x || []));
const S0 = initState({ etnie: true });
const builder = (S, tech, extra = []) => applyPatch(S, [{ op: 'replace', path: '/Magic/_Techniques', value: tech },
  { op: 'replace', path: '/Player/Vitals/Mana', value: 100 }, { op: 'replace', path: '/$eng/auth', value: 'builder' }, ...extra]);

console.log('A#1 time rollover');
ok(W(set(set(S0, { Day: 'Sun', Time: '07:00' }), { Day: 'Mon', Time: '09:00' })) === 'Y1 M1 W2 Mon 09:00', 'Sun -> Mon without Week: next week');
ok(W(set(set(S0, { Week: 4, Day: 'Sun', Time: '20:00' }), { Week: 1, Day: 'Mon', Time: '08:00' })) === 'Y1 M2 W1 Mon 08:00', 'W4 -> W1 without Month: next month');
const y12 = set(S0, { Month: 12, Week: 4, Day: 'Sun', Time: '20:00' }), y2 = set(y12, { Month: 1, Week: 1, Day: 'Mon', Time: '08:00' });
ok(W(y2) === 'Y2 M1 W1 Mon 08:00', `M12 -> M1 without Year: next year (${W(y2)})`);
ok(y2._Log.some(l => /Player\.Profile\.Year/.test(l)), 'new academic year: the log reminds the narrator about Player.Profile.Year');
ok(W(set(set(S0, { Month: 12, Week: 4, Day: 'Sun', Time: '20:00' }), { Year: 2, Month: 1, Week: 1, Day: 'Mon', Time: '08:00' })) === 'Y2 M1 W1 Mon 08:00', 'explicit Year still fine');
ok(W(set(set(S0, { Day: 'Sun', Time: '22:00' }), { Day: 'Mon', Time: '08:00' })) === 'Y1 M1 W2 Mon 08:00', 'regression: Sun 22:00 -> Mon 08:00');
ok(W(set(set(S0, { Time: '23:00' }), { Time: '01:00' })) === 'Y1 M1 W1 Tue 01:00', 'regression: 23:00 -> 01:00, same Day = next day');

console.log('A#2 / F04 due dates anchored once');
let C = applyPatch(S0, [{ op: 'insert', path: '/Commitments/X', value: { Desc: 'x', Due: 'tomorrow 9am' } }]);
ok(C.Commitments.X._When === 'tomorrow 09:00', 'tomorrow 9am parsed');
C = set(C, { Day: 'Tue', Time: '08:00' }); ok(C.Commitments.X._When === 'today 09:00', `next day it is today (${C.Commitments.X._When})`);
C = set(C, { Time: '10:00' }); ok(C.Commitments.X._Late && C.$ui.toasts.includes('Overdue: X'), 'then it goes overdue');
C = set(C, { Day: 'Wed' }); ok(C.Commitments.X._Late, 'and stays overdue');
let F = applyPatch(S0, [{ op: 'insert', path: '/Commitments/F', value: { Desc: 'x', Due: 'Fri 18:00' } }]);
F = set(F, { Day: 'Fri', Time: '19:00' }); ok(F.Commitments.F._Late, 'Fri 18:00 overdue on Friday evening');
F = set(F, { Day: 'Sat', Time: '09:00' }); ok(F.Commitments.F._Late && !F.$ui.toasts.includes('Overdue: F'), 'still overdue on Saturday, no second toast');
const rep = { ...F.Commitments.F }; delete rep.$abs; rep.With = 'Etnie';
F = applyPatch(F, [{ op: 'replace', path: '/Commitments/F', value: rep }]); ok(F.Commitments.F._Late, 'record replaced whole (no $abs) with the same Due keeps its anchor');
F = applyPatch(F, [{ op: 'replace', path: '/Commitments/F/Due', value: 'M1 W2 Fri 18:00' }]); ok(!F.Commitments.F._Late, 'rescheduling (new Due text) re-parses');
let N = applyPatch(S0, [{ op: 'insert', path: '/Notices/Lost cat', value: { Text: 'x', By: 'y', Until: 'Wed' } }]);
N = set(N, { Day: 'Tue' }); ok(N.Notices['Lost cat'], 'notice Until Wed still up Tuesday');
N = set(N, { Day: 'Thu' }); ok(!N.Notices['Lost cat'], 'notice Until Wed gone Thursday');
let U = set(S0, { Week: 4, Day: 'Wed' });
U = applyPatch(U, [{ op: 'insert', path: '/Commitments/Essay', value: { Desc: 'x', Due: 'W1 Mon 08:00' } }]);
ok(!U.Commitments.Essay._Late && U.Commitments.Essay.$abs === 28 * 1440 + 480, `week without month rolls to next month (${U.Commitments.Essay._When})`);
let L = set(S0, { Day: 'Tue', Time: '10:00' }, [{ op: 'insert', path: '/Commitments/Old', value: { Desc: 'x', Due: 'M1 W1 Mon 09:00' } }]);
L = set(L, { Month: 9 }); ok(L.Commitments.Old._Late && L.Commitments.Old.$abs === 540, `a past date stays past after a long skip ($abs ${L.Commitments.Old.$abs})`);

console.log('A#3 hidden $ fields survive a whole-record replace');
const TQ = { 'Warm Aura': { Type: 'Elemental', Cost_mode: 'sustained', Activation: 15, Upkeep_per_min: 0.2 }, 'Lifesense': { Type: 'Spiritual', Cost_mode: 'sustained', Activation: 4, Upkeep_per_min: 0.1 },
  'Ice Wall': { Type: 'Elemental', Cost_mode: 'hybrid', Activation: 10, Upkeep_per_min: 0.5, Trigger: 6 } };
const SQ = builder(S0, TQ);
const A1 = applyPatch(SQ, [{ op: 'insert', path: '/Magic/Active/Warm Aura', value: { Technique: 'Warm Aura' } }]);
const A2 = applyPatch(A1, [{ op: 'replace', path: '/World/Time', value: '07:40' }, { op: 'replace', path: '/Magic/Active', value: { 'Warm Aura': { Technique: 'Warm Aura', Note: '' }, 'Lifesense': { Technique: 'Lifesense', Note: '' } } }]);
ok(A2.Player.Vitals.Mana === 79, `replace /Magic/Active keeps the running effect's start (mana ${A2.Player.Vitals.Mana}, want 79)`);
let E = applyPatch(S0, [{ op: 'replace', path: '/Bonds/Etnie/Known_facts', value: Array.from({ length: 14 }, (_x, i) => 'fact ' + i) }]);
const eb = { ...E.Bonds.Etnie }; delete eb.$Known_old; eb.Trust = 75;
ok(applyPatch(E, [{ op: 'replace', path: '/Bonds/Etnie', value: eb }]).Bonds.Etnie.$Known_old.length === 4, 'replace /Bonds/Etnie keeps $Known_old');
const all = _.mapValues(E.Bonds, b => _.omit(b, '$Known_old'));
ok(applyPatch(E, [{ op: 'replace', path: '/Bonds', value: all }]).Bonds.Etnie.$Known_old.length === 4, 'replace /Bonds keeps $Known_old');

console.log('A#4 / F05 one charge per activation (D11)');
ok(applyPatch(SQ, [{ op: 'insert', path: '/Magic/Active/Warm Aura', value: { Technique: 'Warm Aura' } }, { op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Warm Aura', Times: 1 } }]).Player.Vitals.Mana === 85, 'sustained start reported as Active + Casts charges Activation once (85)');
ok(applyPatch(SQ, [{ op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Warm Aura' } }, { op: 'insert', path: '/Magic/Active/Warm Aura', value: { Technique: 'Warm Aura' } }]).Player.Vitals.Mana === 85, 'same, in the other order (85)');
ok(applyPatch(SQ, [{ op: 'insert', path: '/Magic/Active/Ice Wall', value: { Technique: 'Ice Wall' } }, { op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Ice Wall', Times: 1 } }]).Player.Vitals.Mana === 84, 'hybrid start + a Casts entry = activation + one triggered use (84)');

console.log('A#5 names stay gated in toasts and the log');
const K = applyPatch(S0, [{ op: 'replace', path: '/Scene/Present', value: { Kanae: { Note: 'a tall stranger watching' } } }]);
ok(K.$ui.toasts.includes('New acquaintance: {npc:Kanae}') && !K.$ui.toasts.some(t => /(^|[^:])Kanae/.test(t)), `toast carries a token, not the name (${K.$ui.toasts})`);
const K2 = applyPatch(S0, [{ op: 'replace', path: '/Scene/Present', value: { Kanae: { Note: 'x' } } }], { text: '"I\'m Kanae," she says.' });
ok(K2.$ui.names.includes('Kanae'), 'a name spoken in the same reply is recorded before the bond is created');

console.log('A#6 Star Night lifts curfew only from Saturday evening to Sunday dawn');
const at = (w, d, t) => set(S0, { Week: w, Day: d, Time: t }).World._Curfew;
ok(/CURFEW/.test(at(3, 'Sat', '01:00')), 'W3 Sat 01:00 (Friday night): curfew');
ok(at(3, 'Sat', '22:00') === '', 'W3 Sat 22:00: none');
ok(at(3, 'Sun', '03:00') === '', 'W3 Sun 03:00: none');
ok(/CURFEW/.test(at(3, 'Sun', '21:00')), 'W3 Sun 21:00: curfew again');

console.log('F01 away from campus: no dorm curfew');
const away = (o, x) => set(S0, o, x).World._Curfew;
ok(/Away from campus/.test(away({ Month: 11, Week: 3, Day: 'Mon', Time: '21:00', Location: 'Sunreach Bay hotel' }, [{ op: 'replace', path: '/Trip/Active', value: true }, { op: 'replace', path: '/Trip/Destination', value: 'Sunreach Bay' }])), 'Sunreach Bay hotel at night: away');
ok(/Away from campus/.test(away({ Month: 2, Week: 3, Day: 'Wed', Time: '21:00', Location: 'Grade III country' })), 'Creature Studies Expedition at night: away');
ok(/CURFEW/.test(away({ Month: 11, Week: 3, Day: 'Mon', Time: '21:00', Location: 'Fire Dormitory' }, [{ op: 'replace', path: '/Trip/Active', value: true }])), 'back on campus: curfew even if Trip.Active was left on');
ok(/CURFEW/.test(away({ Month: 6, Week: 2, Day: 'Mon', Time: '21:00', Location: 'Somewhere in town' })), 'an unknown place on an ordinary day: curfew (no trip, no outing)');
ok(away({ Month: 4, Week: 2, Day: 'Tue', Time: '21:00', Location: 'Courtyards' }) === '' && /CURFEW \(22/.test(away({ Month: 4, Week: 2, Day: 'Tue', Time: '22:30', Location: 'Courtyards' })), 'Crowning Day on campus: curfew 22:00');

console.log('F03 / calendar 1.0.3: World Competition M11 W4 Wed-Sat, Graduation M11 W4 Sun');
ok(/Graduation/.test(set(S0, { Month: 11, Week: 4, Day: 'Sun', Time: '09:00' }).World._Event_today), 'Graduation is on M11 W4 Sunday');
ok(/World Competition/.test(set(S0, { Month: 11, Week: 4, Day: 'Wed' }).World._Event_today) && /World Competition/.test(set(S0, { Month: 11, Week: 4, Day: 'Sat' }).World._Event_today), 'World Competition Wed-Sat of that week');
ok(/^P1/.test(set(S0, { Month: 11, Week: 4, Day: 'Wed', Time: '09:00', Location: 'Lecture Halls' }).World._Period), 'classes go on at Halvard for everyone not competing');

console.log('F06 engine-ended summon clears Summoned');
let P = builder(S0, { 'Summon Ember': { Type: 'Occult', Cost_mode: 'hybrid', Activation: 5, Upkeep_per_min: 1, Trigger: 2, Notes: '[pact] Ember' } },
  [{ op: 'replace', path: '/Magic/Pacts', value: { Ember: { Spirit: 'Ember', Tier: 'Basic' } } }]);
P = applyPatch(P, [{ op: 'insert', path: '/Magic/Active/Ember', value: { Technique: 'Summon Ember' } }, { op: 'replace', path: '/Magic/Pacts/Ember/Summoned', value: true }]);
ok(P.Magic.Pacts.Ember.Summoned && P.Player.Vitals.Mana === 95, 'summoned');
P = set(P, { Time: '10:00' });
ok(!P.Magic.Active.Ember && P.Magic.Pacts.Ember.Summoned === false, 'mana ran out: effect gone and Summoned false');

console.log('F07 death is not undone by sleep (D13)');
let D = applyPatch(S0, [{ op: 'replace', path: '/Player/Vitals/HP', value: 30 }, { op: 'replace', path: '/Player/Vitals/Lethal_flag', value: true }, { op: 'insert', path: '/Player/Injuries/Cut', value: { Severity: 'minor' } }]);
D = applyPatch(D, [{ op: 'replace', path: '/Player/Vitals/HP', value: 0 }]); ok(D.Player.Vitals._Condition === 'Dead', 'dead');
D = applyPatch(D, [{ op: 'replace', path: '/World/Time', value: '14:00' }, { op: 'replace', path: '/Player/Vitals/Resting', value: 'sleep' }]);
ok(D.Player.Vitals.HP === 0 && D.Player.Vitals._Condition === 'Dead', 'sleep does not bring HP back from 0');
let Lv = applyPatch(S0, [{ op: 'replace', path: '/Player/Vitals/HP', value: 60 }, { op: 'insert', path: '/Player/Injuries/Cut', value: { Severity: 'minor' } }]);
ok(applyPatch(Lv, [{ op: 'replace', path: '/World/Time', value: '14:00' }, { op: 'replace', path: '/Player/Vitals/Resting', value: 'sleep' }]).Player.Vitals.HP === 65, 'the living still recover +5');

console.log('F08 Kingdom prize once per year');
let Q = set(S0, { Month: 9, Week: 4, Day: 'Sun', Time: '10:00' });
const pts0 = Q.Player.Wallet.Points, comp = (S, st) => applyPatch(S, [{ op: 'replace', path: '/Competition/Tier', value: 'Kingdom' }, { op: 'replace', path: '/Competition/Status', value: st }]);
Q = comp(Q, 'champion'); Q = comp(Q, 'qualified'); Q = comp(Q, 'champion');
ok(Q.Player.Wallet.Points === pts0 + 5000, `champion -> qualified -> champion pays once (+${Q.Player.Wallet.Points - pts0})`);
Q = set(Q, { Year: 2, Month: 9, Week: 4, Day: 'Sun' }); const p1 = Q.Player.Wallet.Points;
Q = comp(comp(Q, 'entered'), 'champion'); ok(Q.Player.Wallet.Points - p1 === 5000, 'a win the next year pays again');

console.log('F09 alias keys merge into the canonical record');
const AL = applyPatch(S0, [{ op: 'insert', path: '/Bonds/etnie', value: { Trust: 60 } }]);   // 1.4.3: a drop (the narrator can no longer raise Trust)
ok(!AL.Bonds.etnie && AL.Bonds.Etnie.Trust === 60 && AL.Bonds.Etnie.Rank === 3 && AL.Bonds.Etnie.Known_facts.length === 1, `Trust 60 kept, rank and facts intact (Trust ${AL.Bonds.Etnie.Trust}, Rank ${AL.Bonds.Etnie.Rank})`);
const AP = applyPatch(applyPatch(S0, [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: 'old' } } }]), [{ op: 'insert', path: '/Scene/Present/etnie', value: { Note: 'waving' } }]);
ok(AP.Scene.Present.Etnie.Note === 'waving' && !AP.Scene.Present.etnie, 'Scene.Present alias note merges');

console.log('F11 World Competition has its own dates');
ok(!/World Competition/.test(set(S0, { Month: 12, Week: 4, Day: 'Thu' }).World._Event_today), 'Month 12 is holiday only now');
ok(/Away from campus/.test(set(S0, { Month: 11, Week: 4, Day: 'Thu', Time: '21:00', Location: 'the World Competition arena' }).World._Curfew), 'the national four abroad at night: away');

console.log('F12 player tools survive the MVU zod helper (paths with "_" segments are dropped)');
global.window = { parent: { document: {} } };
const UI = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { TEMPLATES, blankDraft, buildOps, techRecord, builderMismatch, revealed, fieldUnlocked, pLog };')();
const d = Object.assign(UI.blankDraft(), UI.TEMPLATES[0].make()); d.name = 'Aria';
const R = applyPatch(S0, UI.buildOps(d, S0), { mvu: true });
ok(Object.keys(R.Magic._Techniques).length === Object.keys(UI.techRecord(d)).length && R.Magic._Affinity.Dominant === d.dominant, `registration writes techniques through the helper (${Object.keys(R.Magic._Techniques).join(', ')})`);
ok(UI.builderMismatch(d, R).length === 0, 'verification finds nothing missing');
ok(UI.builderMismatch(d, S0).length > 0, 'verification reports what did not land (so the UI will not claim success)');
const AIhack = applyPatch(R, [{ op: 'replace', path: '/Magic/_Techniques/Frost Lance/Activation', value: 0 }], { mvu: true });
ok(AIhack.Magic._Techniques['Frost Lance'].Activation === R.Magic._Techniques['Frost Lance'].Activation, 'an AI "_" path is dropped by the helper');
const AIhack2 = applyPatch(R, [{ op: 'replace', path: '/Magic', value: { ...R.Magic, _Techniques: {} } }], { mvu: true });
ok(Object.keys(AIhack2.Magic._Techniques).length === Object.keys(R.Magic._Techniques).length, 'an AI whole-/Magic replace is still reverted by the engine');

console.log('F13 revealed secrets are permanent for unlocks');
let X = applyPatch(S0, [{ op: 'insert', path: '/Campus_State/Secrets_revealed/-', value: 'Milena.other' }]);
const f99 = ['Current case', '', 99];
ok(UI.fieldUnlocked('Milena', f99, X), 'Current case unlocked');
X = applyPatch(X, [{ op: 'replace', path: '/Campus_State/Secrets_revealed', value: [...X.Campus_State.Secrets_revealed, ...Array.from({ length: 80 }, (_x, i) => 'Npc' + i + '.other')] }]);
ok(!X.Campus_State.Secrets_revealed.includes('Milena.other') && X.$ui.secrets.includes('Milena.other'), 'dropped from the AI list, kept in the ledger');
ok(UI.fieldUnlocked('Milena', f99, X), 'still unlocked after 81 secrets');

console.log('F14 an older save missing newer fields does not crash the engine');
const legacy = _.omit(_.cloneDeep(S0), ['Competition', 'Trip', 'Projects', 'Notices', 'Letters', 'Clues', 'Mysteries', 'Commitments', 'Battle']);
let thrown = null; try { runEngine(legacy, _.cloneDeep(legacy), ''); } catch (e) { thrown = e; }
ok(!thrown && legacy.Competition && Array.isArray(legacy.Competition.Team), `empty patch on a legacy save (${thrown ? thrown.message : 'ok'})`);

console.log('F02 NPC_status beats habits in the Now entry');
const now = S => ejs.render(fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/505.txt'), 'utf8'), { getvar: k => _.get({ stat_data: S }, k) });
const G = set(S0, { Month: 11, Week: 3, Day: 'Sun', Time: '10:00', Location: 'Student Council Chamber' }, [{ op: 'replace', path: '/Campus_State/NPC_status', value: { Irene: 'Graduated; left Halvard by airship' } }]);
const txt = now(G);
ok(/Likely around[^\n]*Caspian/.test(txt) && !/Likely around[^\n]*Irene/.test(txt) && /Irene: Graduated/.test(txt), 'Irene moves from habits to status on record');

console.log('F10 Royhan qualifies only after the Dorm Competition');
const roy = (m, w, d) => ejs.render(fs.readFileSync(path.join(ROOT, 'src/worldbook/content/101.txt'), 'utf8'), { getvar: k => ({ 'stat_data.World.Month': m, 'stat_data.World.Week': w, 'stat_data.World.Day': d })[k] });
ok(!/qualified/.test(roy(3, 4, 'Mon')) && !/qualified from/.test(roy(3, 4, 'Sat')) && /qualified from/.test(roy(4, 1, 'Mon')), 'M3 W4 Mon/Sat: not yet; M4: qualified');

console.log('A#5 log view hides unknown names');
ok(!/Kanae/.test(UI.pLog({ ...S0, _Log: ['[M1 W1 Mon 08:00] Bond progress with Kanae capped for today.'] })), 'pLog replaces an unknown NPC name');

console.log('Graduation: third-years leave campus and stop being regulars');
const y3 = ['Caspian', 'Etnie', 'Gareth', 'Irene', 'Royhan', 'Ruby', 'Sophia'];
let Gd = set(S0, { Month: 11, Week: 4, Day: 'Sun', Time: '09:00', Location: 'The Arbiter Hall' });
ok(Gd.Campus_State.Graduated.length === 0 && Gd._Log.some(l => /Graduation today/.test(l)), 'Graduation day: nobody has left yet');
Gd = set(Gd, { Month: 12, Week: 1, Day: 'Mon', Time: '08:00', Location: 'Student Council Chamber' });
ok(_.isEqual([...Gd.Campus_State.Graduated].sort(), y3), `next morning the Year 3 students leave (${Gd.Campus_State.Graduated.join(', ')})`);
ok(!Gd.Campus_State.Graduated.includes('Mirelle') && !Gd.Campus_State.Graduated.includes('Lenna'), 'rival-academy third-years and second-years stay');
ok(Gd.Journal.some(l => /graduated and left/.test(l)) && Gd.$ui.toasts.some(t => /Graduates have left campus: \{npc:/.test(t)), 'journal line + name-gated toast');
const nowG = now(Gd);
ok(!/Caspian|Irene/.test(nowG), 'Now entry no longer lists Irene / Caspian at the Council Chamber');
const MapUI = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { locCard, acClubs };')();
ok(!/Caspian|Irene/.test(MapUI.locCard('student_council_chamber', Gd, '', { x: 50, y: 50 })), 'map card drops them from Regulars');
let Keep = applyPatch(Gd, [{ op: 'replace', path: '/Campus_State/Graduated', value: y3.filter(x => x !== 'Etnie') }]);
Keep = set(Keep, { Time: '12:00' });
ok(!Keep.Campus_State.Graduated.includes('Etnie'), 'the story can keep a student (repeating): the engine does not re-add her');
const Y2 = set(Gd, { Year: 2, Month: 12, Week: 1, Day: 'Mon', Time: '08:00' });
ok(['Lenna', 'Saffi', 'Kanae', 'Idris'].every(x => Y2.Campus_State.Graduated.includes(x)) && !Y2.Campus_State.Graduated.includes('Aiden'), 'Year 2: the original second-years graduate');
const skip = set(S0, { Year: 2, Month: 2, Week: 1, Day: 'Mon', Time: '08:00' });
ok(y3.every(x => skip.Campus_State.Graduated.includes(x)), 'a time skip past Graduation still sends them away');

console.log('Gareth picked for the World Competition competes before he graduates');
let Ga = set(S0, { Month: 9, Week: 4, Day: 'Sun', Time: '18:00' }, [{ op: 'replace', path: '/Competition', value: { Tier: 'World', Status: 'selected', Team: ['Gareth', 'Sophia', 'Florian'] } }]);
Ga = set(Ga, { Month: 11, Week: 4, Day: 'Wed', Time: '10:00', Location: 'the World Competition arena' }, [{ op: 'replace', path: '/Trip', value: { Active: true, Destination: 'World Competition', Companions: ['Gareth', 'Sophia', 'Florian'] } }]);
ok(/World Competition/.test(Ga.World._Event_today) && !Ga.Campus_State.Graduated.includes('Gareth'), 'M11 W4 Wed: competing, not graduated');
Ga = set(Ga, { Day: 'Sun', Time: '09:00', Location: 'The Arbiter Hall' }, [{ op: 'replace', path: '/Trip/Active', value: false }]);
ok(/Graduation/.test(Ga.World._Event_today) && !Ga.Campus_State.Graduated.includes('Gareth'), 'M11 W4 Sun: back for his Graduation');
Ga = set(Ga, { Month: 12, Week: 1, Day: 'Mon', Time: '08:00' });
ok(Ga.Campus_State.Graduated.includes('Gareth') && Ga.Competition.Team.includes('Gareth'), 'M12 W1 Mon: he has left; the competition record stays');
const UIa = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { acCompetition, DATA, whoLine, locCard, acClubs, NPCS };')();
ok(/World Competition[\s\S]{0,80}M11 W4 Wed/.test(UIa.acCompetition(set(S0, { Month: 11, Week: 3, Day: 'Sun' }))), 'Activities ladder dates the World Competition M11 W4 Wed');

console.log('Incoming cohorts: inactive until their campaign year (fake NPC "Testa", arrives Year 2)');
// engine with a fake incoming first-year injected (1.7.0: added next to the real cohort 2 of data/cohorts.json)
const engSrc = fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8')
  .replace('const NPC_ALIAS = {', 'const NPC_ALIAS = {"testa":"Testa",')
  .replace('const NAME_FORMS = {', 'const NAME_FORMS = {"Testa":["Testa"],')
  .replace('const STUDENTS = {', 'const STUDENTS = {"Testa":[1,2],')
  .replace('const ARRIVES = {', 'const ARRIVES = {"Testa":2,');
const runE = new Function(engSrc + '\nreturn runEngine;')();
const step = (before, ops, text) => { const S = _.cloneDeep(before); for (const o of ops) _.set(S, o.path.slice(1).split('/'), o.value); const P = Schema.parse(S); runE(P, before, text || ''); return Schema.parse(P); };
let Co = step(S0, [{ path: '/Scene/Present', value: { Testa: { Note: 'x' } } }], 'Testa waves.');
ok(!Co.Bonds.Testa && !Co.$ui.names.includes('Testa') && Co._Log.some(l => /Testa is not at Halvard yet/.test(l)), 'Year 1: no bond, no name reveal, the log flags it');
Co = step(S0, [{ path: '/World/Year', value: 2 }, { path: '/World/Month', value: 1 }, { path: '/World/Week', value: 1 }, { path: '/World/Day', value: 'Mon' }, { path: '/World/Time', value: '09:00' }]);
ok(Co.Journal.some(l => /new class of first-years arrived/.test(l)) && Co._Log.some(l => /New first-years this year[^\n]*Testa/.test(l)), 'Year 2 begins: arrival journaled, the narrator is told who');
const Co2 = step(Co, [{ path: '/Scene/Present', value: { Testa: { Note: 'x' } } }], 'Testa waves.');
ok(Co2.Bonds.Testa && Co2.$ui.names.includes('Testa'), 'Year 2: bond starts and the name can be revealed');
const Co3 = step(Co2, [{ path: '/World/Year', value: 4 }, { path: '/World/Month', value: 12 }, { path: '/World/Week', value: 1 }, { path: '/World/Time', value: '09:00' }]);
ok(Co3.Campus_State.Graduated.includes('Testa'), 'she graduates at the end of campaign Year 4 (her third year)');
// UI with the same fake NPC
UIa.DATA.npcs.Testa = { n: 'Testa Example', g: 'Year 1', y: 1, a: 2, dm: 'Fire', dc: '#d0583f', d: 'a bold first-year', r: '', p: '', t: '', fc: [50, 25], fl: [] };
const locId = Object.keys(UIa.DATA.locs).find(k => UIa.DATA.locs[k].name === 'Main Library');
UIa.DATA.locs[locId].regulars.push('Testa');
const Y1s = set(S0, {}), Y2s = set(S0, { Year: 2 });
// 1.2.0: map regulars need a bond whose Haunts entry is open (Rank 1 without one): give her one in both years
for (const X of [Y1s, Y2s]) X.Bonds.Testa = { Rank: 1, Progress: 0, Trust: 50, Tension: 0, Title: '', Romance: false, Known_facts: [], Milestones: [], Last_seen: '', _Event_ready: false, $Known_old: [] };
ok(!/a bold first-year|Testa/.test(UIa.locCard(locId, Y1s, '', { x: 50, y: 50 })) && /Testa/.test(UIa.locCard(locId, Y2s, '', { x: 50, y: 50 })), 'map Regulars: hidden in Year 1, shown in Year 2 (once her Haunts are known, 1.2.0)');
ok(/First-year/.test(UIa.whoLine('Testa', Y2s)) && /Second-year/.test(UIa.whoLine('Testa', set(S0, { Year: 3 }))), 'school year label moves with the campaign year');
ok(/Second-year/.test(UIa.whoLine('Trixie', Y2s)) && /Former student/.test(UIa.whoLine('Gareth', Gd)), 'existing students move up too; graduates are former students');
// roster (uid 97, EJS)
const ros = fs.readFileSync(path.join(ROOT, 'src/worldbook/content/97.txt'), 'utf8').replace('const _R = [', 'const _R = [["Testa", 1, 2, "Testa (Fire, F, red, bold)"], ');
const rr = (Y, G) => ejs.render(ros, { getvar: k => ({ 'stat_data.World.Year': Y, 'stat_data.Campus_State.Graduated': G || [] })[k] });
ok(!/Testa/.test(rr(1)) && /Year 3: Gareth/.test(rr(1)) && /Year 1: Trixie/.test(rr(1)), 'roster Year 1: as written, no Testa');
const r2 = rr(2, y3);
ok(/Year 1: Testa/.test(r2) && /Year 2: Trixie/.test(r2) && /Year 3: Florian/.test(r2) && /Graduated, no longer at Halvard: Gareth/.test(r2), 'roster Year 2: Testa arrives, everyone moves up, graduates listed apart');
ok(/Etnie \([^)]*repeating\)/.test(rr(2, y3.filter(x => x !== 'Etnie'))), 'a student kept back shows as repeating');
