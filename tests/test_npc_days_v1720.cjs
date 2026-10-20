// 1.72.0 (owner-approved planning/DRAFT_hari_istimewa_npc.md): special days in an NPC's mood (birthdays, calendar days, the days
// before them) and the personal dates with {{user}} (a surviving Imprint, the day they met, Rank 8), a year or more later.
const fs = require('fs'), path = require('path');
const { Schema, runEngine, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn {moodOf, specialDays, nowOf, fromAbs, toAbs, NPC_MOODS};')();
const clone = x => _.cloneDeep(x), op = (p, value) => ({ op: 'replace', path: p, value });
const wx = { sky: 'Clear', temp: 18, wind: '', rare: '', snow: false };
function base(ids, W = {}, bond = {}) {
  const S = initState(); S.World = { ...S.World, Month: 4, Week: 2, Day: 'Wed', Time: '14:00', Location: 'Canteen', ...W };
  S.$eng.abs = E.toAbs(S.World); S.$eng.seed = 12345; S.$ui.wxfx = 'full';
  for (const id of ids) { S.Bonds[id] = { Rank: 4, Trust: 50, Tension: 0, $xp: 0, Known_facts: [], Milestones: [], ...bond }; S.Scene.Present[id] = { Note: '' }; }
  const A = Schema.parse(S); runEngine(A); return Schema.parse(A);
}
const at = (S, W) => { const T = clone(S); Object.assign(T.World, W); return T; };
const mood = (id, S, w = wx) => E.moodOf(id, S, w, Math.floor(E.toAbs(S.World) / 1440));

console.log('Calendar days and birthdays');
let S = base(['Caspian', 'Etnie', 'Rei', 'Baelin', 'Trixie', 'Nerys', 'Ezrel']);
const rd = at(S, { Month: 10, Week: 1, Day: 'Tue' });
const c = mood('Caspian', rd);
ok(c.mood === 'Bad' && c.days[0].tone === 'sombre' && c.reasons.length === 0, 'Remembrance Day fixes Caspian at Bad even on a clear day, and drops the weather reasons');
ok(mood('Caspian', at(S, { Month: 10, Week: 1, Day: 'Wed' })).days.length === 0, 'the day after is an ordinary day');
const bae = mood('Baelin', at(S, { Month: 10, Week: 1, Day: 'Mon' }));
ok(bae.days.length === 1 && bae.days[0].label === 'Before Remembrance Day' && /condolence/.test(bae.days[0].how), 'before: 1 is the day before (Baelin rereads the letters)');
ok(mood('Rei', at(S, { Month: 9, Week: 4, Day: 'Tue' })).days.some(d => d.tone === 'on edge'), 'before: 7 reaches back across the month boundary (Rei, M9 W4)');
ok(!mood('Rei', at(S, { Month: 9, Week: 3, Day: 'Mon' })).days.length, 'and not further');
const circus = mood('Trixie', at(S, { Month: 8, Week: 2, Day: 'Fri' })), after = mood('Trixie', at(S, { Month: 8, Week: 3, Day: 'Mon' }));
ok(circus.mood === 'Good' && circus.days[0].tone === 'home' && after.days[0].tone === 'homesick', 'Trixie: the circus fixes Good, the week after is homesick (a whole-week date)');
const etBd = at(S, { Month: 2, Week: 2, Day: 'Sat' }), et = mood('Etnie', etBd);
ok(et.days[0].label === 'Birthday' && et.days[0].tone === 'glowing' && et.days[0].bd, "Etnie's birthday has her own tone");
const tBd = at(S, { Month: 1, Week: 4, Day: 'Tue' });   // Kuroo has no birthday row: the default
ok(E.specialDays('Kuroo', tBd).some(d => d.tone === 'glad' && d.lean === 1), 'a birthday without a row is lean +1, glad');
ok(E.specialDays('Nerys', at(S, { Month: 4, Week: 1, Day: 'Thu' }))[0].lean === 0, "Nerys's birthday does not move her mood");
ok(mood('Ezrel', rd).mood === 'Normal' && !(mood('Ezrel', rd).days || []).length, 'Ezrel stays Normal, no special days');
const away = at(rd, {}); away.Campus_State.NPC_status = { Caspian: 'away in Avalon' };
ok(!mood('Caspian', away).days.length, "Halvard's calendar days do not reach someone away");
const awayBd = at(etBd, {}); awayBd.Campus_State.NPC_status = { Etnie: 'away for the day' };
ok(mood('Etnie', awayBd).days.length === 1, 'a birthday does');

console.log('What the narrator and the player see');
let T = applyPatch(S, [op('/World/Month', 10), op('/World/Week', 1), op('/World/Day', 'Tue')]);
ok(T.$ui.moods.Caspian.mood === 'Bad' && T.$ui.moods.Caspian.day === 'Remembrance Day' && T.$ui.moods.Caspian.tone === 'sombre', '$ui.moods carries a calendar day and its tone');
const people = (T.$ui.now.people || {}).Caspian || [];
ok(people.some(l => /^Mood: bad\. Remembrance Day \(sombre\): holds the goddess charm/.test(l)), 'the Cast Sheet line: mood, the day, its tone and how');
const off = applyPatch(T, [op('/$ui/wxfx', 'off')]);
ok(!(off.$ui.moods || {}).Caspian, 'mood Off: no special days either');

console.log('Personal dates with {{user}}');
S = base(['Etnie', 'Rei', 'Gareth', 'Ruby'], {}, {});
ok(/^Y1 M4 W2 Wed$/.test(S.Bonds.Etnie.$met), 'a new bond records the day they met, with its year');
let R = applyPatch(S, [op('/Bonds/Etnie/Imprints', [{ Belief: '{{user}} came back for me.', Weight: 9, From: '{{user}} pulled her out of the Lake', Feel: 'Warm' }])]);
ok(R.Bonds.Etnie.Imprints[0].Feel === 'warm' && R.Bonds.Etnie.Imprints[0].When === 'M4 W2 Wed', 'an Imprint keeps its date and its Feel (normalised)');
R = applyPatch(R, [op('/Bonds/Etnie/Imprints', [{ Belief: '{{user}} came back for me.', Weight: 9, From: '{{user}} pulled her out of the Lake' }])]);
ok(R.Bonds.Etnie.Imprints[0].Feel === 'warm', 'a rewrite without Feel keeps the old one');
const y2 = at(R, { Year: 2 }); y2.Bonds.Etnie.Imprints[0].When = 'Y1 M4 W2 Wed';
const pd = mood('Etnie', y2, { ...wx, sky: 'Storm' });
ok(pd.mood === 'Good' && pd.days.some(d => d.personal && d.label === 'A year today: {{user}} pulled her out of the Lake' && /remembers what day it is/.test(d.how)), 'a year later a weight-9 warm Imprint fixes Good, even in a storm she hates');
ok(!mood('Etnie', at(R, {})).days.some(d => d.personal), 'not in the same year');
const sore = clone(y2); Object.assign(sore.Bonds.Etnie.Imprints[0], { Feel: 'sore', Weight: 6 });
const sd = E.specialDays('Etnie', sore).find(d => d.personal);
ok(sd.fix === '' && sd.lean === -1 && sd.tone === 'sore', 'weight 5-7 only leans; sore leans down');
const bit = clone(y2); bit.Bonds.Etnie.Imprints[0].Feel = '';
ok(E.specialDays('Etnie', bit).find(d => d.personal).lean === 0, 'no Feel = bittersweet, remembered without a shift');
const y3 = at(y2, { Year: 3 });
ok(E.specialDays('Etnie', y3).some(d => d.label.startsWith('2 years today')), 'two years later it says so');
const met = at(S, { Year: 2 }); met.Bonds.Gareth.$met = 'Y1 M4 W2 Wed';
ok(!E.specialDays('Gareth', met).some(d => d.personal), 'the day they met needs Rank 5');
met.Bonds.Gareth.Rank = 5;
ok(E.specialDays('Gareth', met).some(d => d.personal && d.tone === 'fond'), 'from Rank 5 it is remembered, fondly');
met.Bonds.Gareth.Tension = 45;
ok(!E.specialDays('Gareth', met).some(d => d.personal), 'not under Tension 40+');
const r8 = at(S, { Year: 2 }); Object.assign(r8.Bonds.Ruby, { $branch: 'rival', $b8: 'Y1 M4 W2 Wed' });
ok(E.specialDays('Ruby', r8).some(d => d.tone === 'bitter' && d.lean === -1 && /sworn rivalry/.test(d.label)), 'a sworn rivalry is remembered bitterly');
let P = clone(y2); P.$eng.abs = E.toAbs(P.World); P = Schema.parse(P); runEngine(P);
ok(!('day' in (P.$ui.moods.Etnie || {})) && !('bd' in (P.$ui.moods.Etnie || {})), 'a personal date never reaches $ui.moods (the bracelet and scene card)');

console.log('Rank 8 date');
let Q = base(['Lenna'], {}, { Rank: 8, Trust: 70, $xp: 0 });
Q = applyPatch(Q, [op('/Bonds/Lenna/Romance', true)]);
ok(Q.Bonds.Lenna.$branch === 'romance' && Q.Bonds.Lenna.$b8 === 'Y1 M4 W2 Wed', 'a romance records its day');

console.log('Old saves');
const fx = JSON.parse(read('tests/fixtures/saves/save_1.71.0.json'));
const old = Schema.parse(clone(fx)); runEngine(old, clone(fx), '');
const withMet = Object.values(old.Bonds).filter(b => /^Y\d+ M\d+ W[1-4] (Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.test(b.$met)).length;
ok(withMet > 0, `a 1.71.0 save's bonds get $met from their oldest dated line (${withMet} of ${Object.keys(old.Bonds).length})`);
