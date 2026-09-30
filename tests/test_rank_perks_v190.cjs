// 1.9.0: rank progression and context-dependent benefits without scripted bond events.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const clone = x => JSON.parse(JSON.stringify(x));
const meet = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(id => [id, { Note: '' }])) });
const act = (With, Kind, more = {}) => ({ op: 'insert', path: '/Interactions/-', value: { With, Kind, ...more } });
const step = (S, time, ops = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...ops]);
const seed = (ids, ranks = {}) => {
  const S = step(initState(), '09:00', [meet(ids)]); S.$ui.wxfx = 'off';
  for (const [id, rank] of Object.entries(ranks)) Object.assign(S.Bonds[id], { Rank: rank, Trust: 80, Tension: 0, $xp: 0, $cool: -1 });
  return S;
};
console.log('Rank perks 1.9.0');

const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/rank4_partners.json'), 'utf8')).npcs;
const rewards = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bond_rewards.json'), 'utf8')).npcs;
ok(Object.keys(table).length === 59 && Object.keys(table).sort().join() === Object.keys(rewards).sort().join(), 'Rank 4 categories cover exactly the 59 bonded roster NPCs');
ok(Object.values(table).some(v => v.length === 1) && Object.values(table).some(v => v.length === 2) && Object.values(table).some(v => v.length === 3), 'one, two and three-activity categories exist');

let S = seed(['Trixie']); S.Bonds.Trixie.$xp = 10;
let A = step(S, '09:10');
ok(A.Bonds.Trixie.Rank === 0 && A.Bonds.Trixie._Event_ready, 'full XP alone does not force rank progression');
A = step(A, '09:20', [act('Trixie', 'talk')]);
ok(A.Bonds.Trixie.Rank === 1 && A.Bonds.Trixie.$xp === 2 && A.$ui.rank_cues.some(x => x.id === 'Trixie') && !Object.keys(A.$ui.bev || {}).length, 'one genuine interaction raises exactly one rank and leaves no event prompt');
const before = A.Bonds.Trixie.Rank;
A = step(A, '09:30', [{ op: 'replace', path: '/Bonds/Trixie/Rank', value: before + 1 }]);
ok(A.Bonds.Trixie.Rank === before, 'narrator cannot raise a rank directly');
S = seed(['Trixie']); S.Bonds.Trixie.$xp = 10; S.Bonds.Trixie._Event_ready = true;
A = step(S, '09:10', [act('Trixie', 'talk')]);
ok(A.Bonds.Trixie.Rank === 1, 'a legacy save with event-ready state advances on a genuine interaction');

S = seed(['Ruby'], { Ruby: 2 });
A = step(S, '09:10', [act('Ruby', 'hangout', { Invited: true })]);
ok(A.Bonds.Ruby.$xp === 4, 'Rank 2: first accepted invited hangout adds one XP');
A = step(A, '09:20', [act('Ruby', 'hangout', { Invited: true })]);
ok(A.Bonds.Ruby.$xp === 4, 'Rank 2: daily hangout cap remains');

S = seed(['Ruby', 'Sophia', 'Etnie'], { Ruby: 4, Sophia: 4, Etnie: 4 });
A = step(S, '09:10', [act('Ruby', 'study'), act('Sophia', 'study')]);
ok(A.Bonds.Ruby.$xp === 4 && A.Bonds.Sophia.$xp === 3, 'Rank 4 study bonus follows the NPC category');
const tr = [{ op: 'insert', path: '/Training/-', value: { Track: 'mana', Partner: 'Ruby' } }];
const solo = step(seed(['Ruby'], { Ruby: 4 }), '09:10', tr);
ok(!solo._Log.some(x => /with Ruby, x1\.25/.test(x)), 'study-only NPC gives no mana-training bonus');
const mana = step(seed(['Etnie'], { Etnie: 4 }), '09:10', [{ op: 'insert', path: '/Training/-', value: { Track: 'mana', Partner: 'Etnie' } }]);
ok(mana._Log.some(x => /with Etnie, x1\.25/.test(x)), 'three-activity NPC gives mana-training bonus when actively reported');

S = seed(['Irene', 'Ruby'], { Irene: 6 }); delete S.Bonds.Ruby;
A = step(S, '09:10', [act('Ruby', 'introduction', { By: 'Irene' })]);
ok(A.Bonds.Ruby && A.Bonds.Ruby.Rank === 1 && A.Bonds.Ruby.Milestones.some(x => /Introduced by Irene/.test(x)), 'Rank 6 introduction begins an unseen roster NPC at Rank 1');
S = seed(['Irene'], { Irene: 6 }); S.Extras.Stranger = { Name: 'Stranger' };
A = step(S, '09:10', [act('Stranger', 'introduction', { By: 'Irene' })]);
ok(!A.Bonds.Stranger, 'narrator-invented Extras never enter the bond system');

S = seed(['Sophia', 'Gavlan'], { Sophia: 7, Gavlan: 7 });
A = step(S, '09:10');
ok((A.$ui.rank_access.dorms || []).includes('Fire') && (A.$ui.rank_access.staff || []).includes('Gavlan'), 'Rank 7 exposes escorted dorm and spontaneous staff-visit access');
global.window = { parent: { document: {} } }; global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { DATA, PANELS, view, locCard };')();
U.view.arg = 'Sophia';
ok(/Shared practice: mana · stamina/.test(U.PANELS.npc.render(A)), 'People dossier lists only Sophia’s approved Rank 4 activities');
ok(/trusted resident here can escort/.test(U.locCard('fire_dormitory', A, 'courtyards', { label: 'Dorms' })) && /without an appointment/.test(U.locCard('faculty_offices', A, 'courtyards', { label: 'Offices' })), 'Map explains Rank 7 access in the relevant places');

S = seed(['Irene'], { Irene: 9 });
A = step(S, '09:10', [{ op: 'insert', path: '/Rep_events/-', value: { Rep: 'Academy', XP: -8, Kind: 'event', Why: 'False accusation' } }, act('Irene', 'vouch', { Public: true, Rep: 'Academy', Why: 'False accusation' })]);
ok(A._Log.some(x => /Irene vouched.*reduced by 5 XP/.test(x)), 'Rank 9 witness reduces one matching public reputation loss by five XP');
A = step(A, '09:20', [{ op: 'insert', path: '/Rep_events/-', value: { Rep: 'Academy', XP: -8, Kind: 'event', Why: 'Another accusation' } }, act('Irene', 'vouch', { Public: true, Rep: 'Academy', Why: 'Another accusation' })]);
ok(A._Log.filter(x => /Irene vouched/.test(x)).length === 1, 'Rank 9 witness can vouch only once per month');

const rules = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/502.txt'), 'utf8');
const now = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/505.txt'), 'utf8');
ok(!/Bond event available|raise \/Bonds\/.*\/Rank by 1/.test(now) && !/bond event/i.test(rules), 'narrator rules no longer script rank-up events');
console.log('ALL PASSED');
