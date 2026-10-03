// 1.47.0 (audit batch 5): the campus as an Area (3.2), the area {{user}} is in (3.3) and one whereabouts model (3.8).
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, runEngine, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn {toAbs, areaNow, awayIn, whereabouts, presenceNow, PRESENCE};')();
const now = S => ejs.render(JSON.parse(read('dist/Eldrasil_Halvard.json')).data.character_book.entries.find(e => e.id === 505).content, { getvar: k => _.get({ stat_data: S }, k) });
const op = (p, value) => ({ op: 'replace', path: p, value });

console.log('Whereabouts: <now> presence as 1.46.0 wrote it');
// tests/fixtures/presence_1460.json: the presence lines 1.46.0's <now> (its own EJS rules) gave for each scenario; the same states now
// get them from the engine ($ui.here). The full <now> of all 360 was compared byte for byte when the rules moved (CHANGELOG 1.47.0).
const { scenario, N } = require('./fixtures/presence_scenarios.cjs');
const REC = JSON.parse(read('tests/fixtures/presence_1460.json'));
const PRES = /^(Students |Study Hall|Student Council (meets|members)|Likely around|Moved indoors|Club time|Regulars here|Your class now|Free period|Presence:)/;
const bad = [];
for (let i = 0; i < N; i++) { const got = now(scenario(i, E)).split('\n').filter(l => PRES.test(l)); if (JSON.stringify(got) !== JSON.stringify(REC[i])) bad.push(i); }
ok(REC.length === N && !bad.length, `every scenario's presence block is the same (${N} scenarios: places, periods, Study Hall, clubs, the election, the Council, weather, flu, statuses, graduates, Settings)` + (bad.length ? ': differs in ' + bad.slice(0, 5).join(', ') : ''));
const lines = REC.flat();
ok(['Likely around', 'Students are in class', 'Students are at Study Hall', 'Your class', 'Free period', 'Club time', 'Moved indoors', 'Regulars here', 'Students vote', 'Student Council', 'Presence: after']
  .every(k => lines.some(l => l.startsWith(k))), 'the scenarios reach every kind of presence line');
const tmpl = read('src/worldbook/custom/505.template.ejs');
ok(!/REG|TEACH|CLUBV|OUTD/.test(tmpl.replace(/\/\/.*$/gm, '')) && /HERE\.regs/.test(tmpl), '<now> no longer carries the presence rules or their data: it prints $ui.here');
ok(!/whereabouts/.test(read('src/ui/statusbar.html')) && /function whereabouts/.test(read('src/scripts/ui.js')), 'the whereabouts code goes to the engine and the panels, not the bracelet');

console.log('One model for one NPC');
const S0 = initState();
const at = (W, extra = {}) => { const S = initState(); S.World = { ...S.World, ...W }; Object.assign(S.Campus_State, extra); S.$eng.abs = E.toAbs(S.World); const A = Schema.parse(S); runEngine(A); return Schema.parse(A); };
const P1 = at({ Month: 2, Week: 1, Day: 'Mon', Time: '08:30', Location: 'Canteen' }, { NPC_status: { Irene: 'away visiting family' }, Graduated: ['Castor'] });
const w = id => E.whereabouts(E.PRESENCE, E.presenceNow(P1), id);
ok(/^in class until /.test(w('Etnie').busy[0]) && w('Irene').st === 'away visiting family' && w('Castor').gone === 'graduated', 'a student in a class period is in class; a status and a graduate are on record');
const tch = Object.keys(E.PRESENCE.teach).find(id => w(id).busy);
ok(tch && /^teaching /.test(w(tch).busy[0]) && w(tch).busy[1].length, 'the period\'s teacher is teaching, and counts as here at the venue');

console.log('The area {{user}} is in');
ok(E.areaNow(S0) === 'campus' && !E.awayIn(S0), 'a new chat is on the campus');
const off = _.cloneDeep(S0); off.World.Location = 'Riverside Inn';
ok(E.areaNow(off) === '' && !E.awayIn(off), 'off the grounds on an ordinary day: no area, not away');
const sky = _.cloneDeep(S0); sky.World.Location = 'Airship — Common Room';
ok(E.areaNow(sky) === 'airship' && E.awayIn(sky), 'aboard the airship: an outside area, away');
