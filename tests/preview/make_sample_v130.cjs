// 1.3.0 preview sample: reputation levels, training progress, gifts and Rank 10 benefits (one secret, one one-use), a held mask bond.
// Run: node tests/preview/make_sample_v130.cjs  -> tests/preview/sample_v130.json
const fs = require('fs'), path = require('path');
const { initState, applyPatch } = require('../harness.cjs');
let S = initState();
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '12:00' }, { op: 'replace', path: '/World/Location', value: 'Courtyards' },
  { op: 'replace', path: '/Scene/Present', value: { Kanae: { Note: '' }, Sophia: { Note: '' }, Castor: { Note: '' }, Irene: { Note: '' } } }]);
S = JSON.parse(JSON.stringify(S));
S.$ui.built = true; S.Player.Profile.Name = 'Aria Vale'; S.Player.Profile.Dorm = 'Light';
Object.assign(S.Player.Profile.Reputation.$xp, { Academy: 40, Student: -18, Doves: 3 });
for (const [id, r] of [['Kanae', 5], ['Sophia', 5], ['Castor', 8], ['Irene', 5]]) Object.assign(S.Bonds[id], { Rank: r, $xp: 999, $cool: -1 });
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '12:10' }, { op: 'insert', path: '/Training/-', value: { Track: 'mana' } }, { op: 'insert', path: '/Training/-', value: { Track: 'stamina' } }]);
S = JSON.parse(JSON.stringify(S));
const REW = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/bond_rewards.json'), 'utf8'));
for (const id of ['Kanae', 'Sophia', 'Irene']) { const g = REW.npcs[id].gift; S._Perks[g.name] = { From: id, Kind: 'gift', Effect: g.text + (g.secret ? ` <narrator_only>${g.secret}</narrator_only>` : ''), Uses: g.uses || 0 }; }
S._Perks['Kuroo (Rank 10)'] = { From: 'Kuroo', Kind: 'rank10', Effect: REW.npcs.Kuroo.r10.text, Uses: 1 };
S.$ui.perks_used = ["Mimosa's focus draught (Mimosa), M1 W1 Mon"];
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '12:20' }, { op: 'insert', path: '/Training/-', value: { Track: 'mana' } }]);
fs.writeFileSync(path.join(__dirname, 'sample_v130.json'), JSON.stringify(S));
console.log('reputation', JSON.stringify(S.Player.Profile.Reputation), '| perks', Object.keys(S._Perks).length, '| Castor held', !!(S.$ui.bev.Castor || {}).held);
