// 1.98.3 (owner-approved planning/DRAFT_kedalaman_fitur.md batch 5): the Council petition (a weekly chance that a student brings one
// to the Saturday meeting when {{user}} is on the Council, drawn as the club client is) and treatment in the Medical Centre's Healing
// Ward (minutes there by severity, once an injury: minor heals, moderate halves the time to Heals_by, serious two days nearer).
const fs = require('fs'), path = require('path');
const { Schema, initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { toAbs, DAY_MIN };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json'));
const now = S => renderEntry(card, 505, S);
const op = (p, value) => ({ op: 'replace', path: p, value });
function at(W, seed, extra = {}) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 2, Week: 2, Day: 'Mon', Time: '08:00', Location: 'Canteen', ...W });
  Object.assign(S.Player.Profile, { Dorm: 'Fire', Year: 1, Name: 'Aria Vale', Council: true });
  S.Player.Wallet.Points = 300; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = seed;
  for (const [k, v] of Object.entries(extra)) _.set(S, k, v);
  return applyPatch(Schema.parse(S), []);
}
const go = (B, W, ops = []) => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops]);
const pe = S => S.$eng.petition || {};

console.log('The Council petition');
const runs = [];
for (let s = 1; s <= 120; s++) runs.push([s, at({}, s)]);
const hit = runs.filter(([, S]) => pe(S).id);
ok(hit.length >= 30 && hit.length <= 66, `about 40% of weeks bring a petition (${hit.length} of 120)`);
const members = ['Irene', 'Caspian', 'Florian', 'Dante'];
ok(hit.every(([, S]) => !members.includes(pe(S).id)), 'never a Council member');
const [s0, S0] = hit[0], id0 = pe(S0).id;
const sat = go(S0, { Day: 'Sat', Time: '10:20', Location: 'Student Council Chamber' });
const line = now(sat).split('\n').find(l => /Council petition: /.test(l)) || '';
ok(line.includes(id0) && /student_notice_help/.test(line) && /help Interaction/.test(line), '<now> at the meeting: ' + line.slice(0, 150));
ok(!(go(sat, { Time: '13:00' }).Journal || []).some(l => /brought a petition/.test(l)), 'taken up there: no Journal line');
const missed = go(S0, { Day: 'Sat', Time: '13:00' });
ok((missed.Journal || []).some(l => l.includes(`${id0} brought a petition to the Student Council`) && /another member took it up\.$/.test(l)), 'not there: another member took it up');
ok(!pe(at({}, s0, { 'Player.Profile.Council': false })).id, 'not on the Council: no petition');
ok(!/Council petition/.test(now(go(S0, { Day: 'Sat', Time: '10:20', Location: 'Main Library' }))), 'only in the Chamber');

console.log('The Healing Ward');
const W0 = at({ Time: '09:00', Location: 'Medical Centre' }, 3, {
  'Player.Injuries.Bruised shin': { Severity: 'minor', Body_part: 'leg', Effect: 'x', Heals_by: 'M2 W2 Thu' },
  'Player.Injuries.Sprained wrist': { Severity: 'moderate', Body_part: 'arm', Effect: 'x', Heals_by: 'M2 W3 Mon' },
  'Player.Injuries.Cracked rib': { Severity: 'serious', Body_part: 'chest', Effect: 'x', Heals_by: 'M2 W4 Mon' } });
const W1 = go(W0, { Time: '09:40' });
ok(!W1.Player.Injuries['Bruised shin'] && W1.Player.Injuries['Sprained wrist'].Heals_by === 'M2 W3 Mon', '40 minutes: the minor injury heals; the moderate one needs an hour');
const W2 = go(W1, { Time: '10:45' });
ok(W2.Player.Injuries['Sprained wrist'].Heals_by === 'M2 W2 Fri 05:22', 'an hour more: half the time left (Mon 10:45 to M2 W3 Mon 23:59): ' + W2.Player.Injuries['Sprained wrist'].Heals_by);
const W3 = go(W2, { Time: '13:00' });
ok(/M2 W3 Sat/.test(W3.Player.Injuries['Cracked rib'].Heals_by), 'two hours: the rib two days nearer: ' + W3.Player.Injuries['Cracked rib'].Heals_by);
const W4 = go(W3, { Time: '15:30' });
ok(W4.Player.Injuries['Cracked rib'].Heals_by === W3.Player.Injuries['Cracked rib'].Heals_by && W4.Player.Injuries['Sprained wrist'].Heals_by === W2.Player.Injuries['Sprained wrist'].Heals_by, 'once an injury');
ok((W3.Journal || []).some(l => /Treated in the Healing Ward: Cracked rib/.test(l)), 'the Journal says so');
const away = go(at({ Time: '09:00', Location: 'Canteen' }, 3, { 'Player.Injuries.Bruised shin': { Severity: 'minor', Body_part: 'leg', Effect: 'x', Heals_by: 'M2 W2 Thu' } }), { Time: '10:00' });
ok(away.Player.Injuries['Bruised shin'], 'elsewhere: nothing heals');
const noDate = go(at({ Time: '09:00', Location: 'Medical Centre' }, 3, { 'Player.Injuries.Twisted knee': { Severity: 'moderate', Body_part: 'leg', Effect: 'x', Heals_by: '' } }), { Time: '10:05' });
ok(noDate.Player.Injuries['Twisted knee'].Severity === 'minor', 'no Heals_by: one step down in severity');
const arrive = go(at({ Time: '09:00', Location: 'Canteen' }, 3, { 'Player.Injuries.Bruised shin': { Severity: 'minor', Body_part: 'leg', Effect: 'x', Heals_by: 'M2 W2 Thu' } }), { Time: '10:00', Location: 'Medical Centre' });
ok(arrive.Player.Injuries['Bruised shin'], 'just arrived: the treatment counts from the next reply');
