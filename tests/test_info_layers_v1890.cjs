// 1.89.0 (owner, planning/DRAFT_lapisan_info.md, deleted): info layers. Every dossier field sits in a layer (Public, Deep, Deeper) whose
// rank follows the NPC's openness (data/bond_rules.json layers; data/info_layers.json per NPC); the narrator's Bond line names the same
// fields by their lore headings, so the dossier and the story agree (owner playtest: Trixie told Goals, Doves and Backstory at Rank 0).
// No field opens later than before; before a bond only Role and Appearance show. The 1.88.1 save loads.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
console.log('Info layers 1.89.0');
const rd = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { fieldUnlocked, npcOf };')();
const npcs = rd('data/npcs.json'), L = rd('data/bond_rules.json').layers, OPN = rd('data/bond_openness.json'), OWN = rd('data/info_layers.json');
const tagOf = id => ['open', 'guarded', 'closed'].find(t => OPN[t].includes(id)) || 'normal';
const layerOf = (id, lab) => ((OWN[id] || {}).move || {})[lab] || Object.keys(L.of).find(k => L.of[k].includes(lab)) || L.other;

// the data: every field opens no later than its layer's rank for this NPC
const late = [];
for (const [id, n] of Object.entries(npcs)) for (const f of n.fields) {
  if (f.rank >= 99) continue;
  const lab = f.label.replace(/\s*\(.*\)$/, ''), want = ((OWN[id] || {}).ranks || L.ranks[tagOf(id)])[['public', 'deep', 'deeper'].indexOf(layerOf(id, lab))];
  if (f.rank > want) late.push(`${id}.${lab} ${f.rank}>${want}`);
}
ok(!late.length, 'every field opens at or before its layer\'s rank' + (late.length ? ': ' + late.slice(0, 5).join(', ') : ''));
ok(['William', 'Aiden', 'Florian', 'Hadrian', 'Dorian'].every(id => tagOf(id) === 'normal'), 'William, Aiden, Florian, Hadrian and Dorian are normal now');

// the narrator's Bond line and the dossier agree
const T = (S, time, ops) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...ops]);
const meet = (id, v) => [{ op: 'replace', path: '/Scene/Present', value: { [id]: { Note: '' } } }, { op: 'insert', path: '/Bonds/' + id, value: v }];
const bondLine = (S, id) => (((S.$ui.now || {}).people || {})[id] || []).find(l => /^Bond/.test(l)) || '';
const freeOf = l => ((/tells freely what their lore lists under (.*?)(\. Held back|; nothing held back|\.)/.exec(l) || [])[1] || '').split(', ');
const agree = (S, id) => { const open = U.npcOf(id).fl.filter(f => f[2] < 99 && !['Notes', 'Routine'].includes(f[0]) &&!L.seen.includes(f[0].replace(/\s*\(.*\)$/, '')) && U.fieldUnlocked(id, f, S)).map(f => f[0].replace(/\s*\(.*\)$/, ''));
  return [...new Set(open)].sort().join() === freeOf(bondLine(S, id)).filter(x => x !== 'their public role').sort().join(); };
let S = T(initState(), '09:00', meet('Trixie', { Rank: 0 }));
let b = bondLine(S, 'Trixie');
ok(/under [^.]*Backstory[^.]*Goals/.test(b) && /Held back for now, deflected in their own way if asked \(pushing adds Tension\): [^;]*Loves[^;]*\(Rank 1\); Doves, Relations \(Rank 2\)/.test(b),
  'Trixie at Rank 0: her circus and her goal are hers to tell (info_layers.json), Loves to Personality wait for Rank 1, Doves and Relations for Rank 2');
ok(agree(S, 'Trixie'), 'Trixie at Rank 0: the Bond line names exactly the dossier fields that are open');
S.Bonds.Trixie.Rank = 1; S = T(S, '09:10', []);
ok(agree(S, 'Trixie') && /Doves, Relations \(Rank 2\)/.test(bondLine(S, 'Trixie')), 'Rank 1: the dossier and the line still agree');
let I = T(initState(), '09:00', meet('Irene', { Rank: 3 }));
ok(agree(I, 'Irene') && /Backstory[^;]*\(Rank 5\)/.test(bondLine(I, 'Irene')), 'guarded Irene at Rank 3: they agree; Backstory waits for Rank 5');
// Trust moves what they tell by a rank; Betrayed tells nothing new
S.Bonds.Trixie.Trust = 30; S = T(S, '09:20', []);
ok(/Personality[^;]*\(Rank 2\)/.test(bondLine(S, 'Trixie')), 'Doubtful Trust: Trixie at Rank 1 tells only what Rank 0 would (Personality now waits for Rank 2)');
S.Bonds.Trixie.Trust = 5; S = T(S, '09:30', []);
ok(/shares nothing new with \{\{user\}\}/.test(bondLine(S, 'Trixie')), 'Betrayed: nothing new');

// before a bond: only Role and Appearance, even for an open NPC
const none = initState(), fl = U.npcOf('Trixie').fl;
ok(fl.filter(f => U.fieldUnlocked('Trixie', f, none)).every(f => L.seen.includes(f[0])) && fl.some(f => f[0] === 'Club' && f[2] === 0), 'an open NPC\'s Club is Rank 0, but not shown before meeting her');

// a new bond with a moved NPC starts at the normal category's Trust
const F = T(initState(), '09:00', meet('Florian', { Rank: 0 }));
ok(F.Bonds.Florian.Trust === 50, `Florian (now normal) starts at Trust 50 (${F.Bonds.Florian.Trust})`);

const save = rd('tests/fixtures/saves/save_1.88.1.json'), Ld = T(save, save.World.Time, []);
ok(Ld.$eng.ver === rd('src/card/card.json').character_version && Object.keys(save.Bonds).every(id => Ld.Bonds[id] && Ld.Bonds[id].Rank === save.Bonds[id].Rank && Ld.Bonds[id].Trust === save.Bonds[id].Trust),
  'the 1.88.1 save loads with every bond, rank and Trust unchanged');
