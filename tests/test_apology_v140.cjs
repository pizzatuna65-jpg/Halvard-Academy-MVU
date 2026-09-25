// 1.4.0 (owner): an apology eases Tension by the NPC's nature: category values, public vs private, one a day, further ones in the
// same week count half, Sophia takes it as weakness (it raises Tension).
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('Apologies 1.4.0');
const T = (S, time, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...extra]);
const day = (S, d, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Day', value: d }, { op: 'replace', path: '/World/Time', value: '12:00' }, ...extra]);
const ten = (id, v) => ({ op: 'replace', path: `/Bonds/${id}/Tension`, value: v });
const AP = (With, Public) => ({ op: 'insert', path: '/Interactions/-', value: Public ? { With, Kind: 'apology', Public: true } : { With, Kind: 'apology' } });
const ids = ['Ruby', 'Caralynn', 'Percival', 'Irene', 'Krieg', 'Etnie', 'Kanae', 'Ezrel', 'Sophia', 'Althair'];
let S = T(initState(), '09:00', [{ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) }]);
S = T(S, '09:05', ids.map(i => ten(i, 60)));
const after = (id, pub) => T(S, '10:00', [AP(id, pub)]).Bonds[id].Tension;
ok(after('Ruby') === 40 && after('Irene') === 50 && after('Percival') === 55 && after('Krieg') === 60, 'private apology: withdrawn -20, authority -10, confrontational -5, dangerous 0');
ok(after('Caralynn') === 55 && after('Caralynn', true) === 45, 'social: private -5, public -15');
ok(after('Etnie') === 23 && after('Kanae') === 40 && after('Ezrel') === S.Bonds.Ezrel.Tension && S.Bonds.Ezrel.Tension === 30, 'overrides: Etnie -25 (x1.5 since 1.4.3: she trusts {{user}}, Trust 70: -37), Kanae -20, Ezrel 0 (his rises count half: 30)');
ok(after('Sophia') === 70 && /made it worse with Sophia/.test(T(S, '10:00', [AP('Sophia')])._Log.join('\n')), 'Sophia: an apology raises Tension (+10)');
ok(T(S, '10:00', [AP('Althair')]).Bonds.Althair.Tension === 0, 'Althair: nothing to ease');
let R = T(S, '10:00', [AP('Ruby')]); R = T(R, '11:00', [AP('Ruby')]);
ok(R.Bonds.Ruby.Tension === 40, 'one apology a day counts');
R = day(R, 'Tue', [AP('Ruby')]);
ok(R.Bonds.Ruby.Tension === 28, `the next one in the same week counts half (-10) (after a quiet day's -2): ${R.Bonds.Ruby.Tension}`);
let N = day(R, 'Mon'); N = applyPatch(N, [{ op: 'replace', path: '/World/Week', value: 2 }, { op: 'replace', path: '/World/Time', value: '12:00' }, ten('Ruby', 60)]);
ok(T(N, '13:00', [AP('Ruby')]).Bonds.Ruby.Tension === 40, 'a new week: full value again');
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const out = ejs.render(card.character_book.entries.find(e => e.id === 505).content, { getvar: k => _.get({ stat_data: S }, k) });
ok(/Tension: Sophia \([^)]*\): [^\n]*Eases: an apology only makes her angrier/.test(out) && /Tension: Krieg [^\n]*Eases: holds a grudge/.test(out), 'Now: Sophia and Krieg tell the narrator how apologies land');
ok(/report it as an apology interaction/.test(fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/502.txt'), 'utf8')), 'rule 502: the narrator reports apologies instead of lowering Tension');
