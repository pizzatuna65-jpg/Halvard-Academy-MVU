// 1.97.5 (owner-approved planning/DRAFT_world_competition.md §4, Vesna and Koschei's Needle, 2026-10-22; owner 2026-10-23: she must
// feel like a Halvard roster NPC, not a rival-team one, with no ties yet): Vesna is a bonded Halvard roster student who is at Halvard
// only once {{user}} frees her at the World Competition. In a year of the scenario with {{user}} in the national four: Norvaine is drawn
// with Eldrasil and wins every match the engine plays, {{user}} lands a few steps from her, the two never meet before the last clearing,
// her bond counts three times with no cooldown, a won phase adds to it and beating Norvaine in the Grand Final fills it, she tells of the
// egg at Rank 3, and after the Grand Final at Rank 4 the confront opens; Koschei's Needle in the Bag makes her a student
// (Campus_State.Transfers) in {{user}}'s school year, dorm and club; without it she flies home and the next year tries again. Also: her
// Rank 10 trains anything, the Dorm Competition pin, the lore's two lives, the Cast Sheet line, the dossier, and the 1.97.4 fix that
// <now> prints the World Competition's lines.
const fs = require('fs'), path = require('path');
const { Schema, initState, applyPatch, ok, ROOT, renderEntry, loreOf } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { wcInit, wcAdvance, kcName, toAbs, fromAbs, WC, PRESENCE, STUDENTS, trSyncAll, dormContest, needXP, BR };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json'));
const npcs = JSON.parse(read('data/npcs.json')), D = p => JSON.parse(read('data/' + p));
const WC = E.WC, SC = WC.scene;
const op = (p, value) => ({ op: 'replace', path: p, value }), ins = (p, value) => ({ op: 'insert', path: p, value });
const T = (d, time) => E.fromAbs(d * 1440 + (+time.slice(0, 2)) * 60 + (+time.slice(3)));
const OUT = 10 * 28 + 14, HOME = OUT + 7, YEAR = 12 * 28;   // M11 W3 Mon, M11 W4 Mon, one campaign year
const at = (S, d, time, loc, ops = [], text = '') => applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => op('/World/' + k, T(d, time)[k])), op('/World/Location', loc), ...ops], { text });
const res = lines => lines.map(l => ins('/Competition/Results/-', l));
const here = who => op('/Scene/Present', Object.fromEntries(who.map(w => [w, { Note: '' }])));
const talk = who => [here([who]), ins('/Interactions/-', { With: who, Kind: 'talk' })];
const INN = 'Hanakaze — The Thousand Lantern Inn', Y2 = 2;
function four(seed = 4242, year = 1) {
  const S = initState();
  Object.assign(S.World, { ...T(OUT - 1 + (year - 1) * YEAR, '18:00'), Location: 'Main Library' });
  Object.assign(S.Player.Profile, { Dorm: 'Fire', Combat_role: 'Control', Year: year, Name: 'Aria Vale', Club: 'Gardening Club' });
  Object.assign(S.Competition, { Tier: 'World', Status: 'selected', Team: [] });
  S.Player.Wallet.Points = 100; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = seed;
  return applyPatch(Schema.parse(S), []);
}
const bond = (S, f) => { S.Bonds.Vesna = { ...S.Bonds.Vesna, ...f }; return S; };   // the state before the next reply (engine-owned fields)

console.log('A Halvard roster student, not a rival team member');
const V = npcs.Vesna;
ok(V.group === 'Year 1' && V.academy === 'Halvard' && V.transfer === 'Norvaine' && !V.dorm, 'npcs.json: a Halvard student (lorebook Year 1, transfer from Norvaine), her dorm is {{user}}\'s');
for (const f of ['bond_rewards.json', 'gift_prefs.json', 'npc_moods.json', 'rank4_partners.json', 'voice_rules.json', 'npc_routines.json', 'tension.json', 'trust.json', 'dialogue_colors.json'])
  ok(JSON.stringify(D(f)).includes('"Vesna"'), `a row in ${f}`);
ok(D('npc_canon.json').voice.Vesna && D('npc_canon.json').branch.Vesna === 'C' && D('bond_openness.json').open.includes('Vesna'), 'voice canon, branch C, open');
ok(D('bond_rewards.json').npcs.Vesna.r10.train === 'any' && D('gift_prefs.json').npcs.Vesna.birthday === 'M1 W2 Thu', 'Rank 10 trains anything; birthday M1 W2 Thu');
const rels = D('relations.json').filter(e => e.from === 'Vesna' || e.to === 'Vesna');
ok(rels.filter(e => !e.rule && e.from === 'Vesna' && e.to !== 'Kazimir' && e.to !== 'Althair').map(e => e.to).sort().join() === 'Baelin' && rels.some(e => e.from === 'Tsubaki') && rels.some(e => e.from === 'Gavlan'),
  'her Halvard lines are only the three the draft names (the Headmaster, Tsubaki, Gavlan): nobody else knows her yet');
ok(WC.rivals.Norvaine.some(x => x[0] === 'Vesna') && !E.STUDENTS.Vesna && !E.PRESENCE.stu.Vesna && E.PRESENCE.tr.Vesna, 'still Norvaine\'s at the World Competition; not a Halvard student before her transfer');

console.log('Without {{user}} in the four: no scenario');
const seeds = [1, 7, 42, 1234, 98765, 31337, 5, 777];
const loose = seeds.filter(s => { const st = E.wcInit(s, 1, null, false); return !st.g.find(g => g.includes('Eldrasil')).includes('Norvaine'); });
ok(loose.length > 0 && !E.wcInit(42, 1, null, false).sc, `the draw stands as drawn (Norvaine apart from Eldrasil for seeds ${loose.join(', ')})`);

console.log('The scenario year with {{user}} in the four');
for (const s of seeds.slice(0, 5)) {
  let X = at(at(four(s), OUT, '12:00', 'Airship — Common Room'), OUT, '19:30', 'Hanakaze — The Hall of Victors');
  const st = X.$eng.wc, g = st.g.find(g => g.includes('Eldrasil'));
  ok(st.sc === 1 && g.includes('Norvaine'), `seed ${s}: Norvaine is drawn into Eldrasil's group (${g.join(', ')})`);
}
let S = at(four(), OUT, '12:00', 'Airship — Common Room');
S = at(S, OUT, '19:30', 'Hanakaze — The Hall of Victors');
const gE = S.$eng.wc.g.findIndex(g => g.includes('Eldrasil')), P1D = OUT + 1 + gE;
S = at(S, OUT, '21:00', INN, [here(['Vesna'])]);
ok(S.Bonds.Vesna && S.Bonds.Vesna.Rank === 0, 'meeting her abroad starts her bond like any Halvard student\'s');
ok((S.$ui.scene || { lines: [] }).lines.some(l => /^Vesna of Norvaine: nobody on her own team talks to her/.test(l)), '<now>: she comes looking for {{user}} whenever she is free');
const x0 = S.Bonds.Vesna.$xp;
S = at(S, OUT, '21:30', INN, talk('Vesna'));
ok(S.Bonds.Vesna.$xp - x0 === SC.mult * E.BR.kind_xp.talk, `the bond week: her XP counts three times (${S.Bonds.Vesna.$xp - x0} for a talk, ${E.BR.kind_xp.talk} for anyone else)`);
bond(S, { $xp: 99, $cool: 99999 });
S = at(S, OUT, '22:00', INN, talk('Vesna'));
ok(S.Bonds.Vesna.Rank === 1, 'no cooldown in the bond week: a full bar deepens at the next meeting');
S = at(S, P1D, '08:00', 'Hanakaze — The Bamboo Sea', [here([])]);
const L1 = S.$ui.contest.lines.join('\n'), SC1 = (S.$ui.scene || { lines: [] }).lines.join('\n');
ok(/teleported to .+, alone, a few steps from Vesna of Norvaine/.test(L1) && /Koschei's Needle, the scenario \(play it once\): when \{\{user\}\} lands/.test(SC1) && /promises to come back for \{\{user\}\} last/.test(SC1), 'Phase 1: {{user}} lands a few steps from her; the beat in <now>');
const N505 = renderEntry(card, 505, S);
ok(/Last Team Standing in the Bamboo Sea/.test(N505) && /a few steps from Vesna/.test(N505) && /Koschei's Needle, the scenario/.test(N505), '505 prints the World Competition\'s lines (the 1.97.4 gap) and the scenario\'s');
let P = S;
for (const t of ['09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30']) { P = at(P, P1D, t, 'Hanakaze — The Bamboo Sea'); }
ok(!P.$eng.wc.ev.some(e => e[2] === 'duel' && ((e[4] === '{{user}}' && e[6] === 'Vesna') || (e[4] === 'Vesna' && e[6] === '{{user}}'))) && !(P.$eng.wc.enc && P.$eng.wc.enc.id === 'Vesna'), 'she never meets {{user}} alone before the last clearing');
const foes = S.$eng.wc.T.filter(t => S.$eng.wc.g[gE].includes(t.k) && t.k !== 'Eldrasil' && t.k !== 'Norvaine').flatMap(t => t.m.map(E.kcName));
const xb = S.Bonds.Vesna.$xp;
S = at(S, P1D, '09:30', 'Hanakaze — The Bamboo Sea', res(foes.map(n => `World P1: broke ${n}'s crystal`)));
for (let m = 10 * 60; m <= 18 * 60 + 30; m += 30) S = at(S, P1D, `${String(m / 60 | 0).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`, m < 17 * 60 ? 'Hanakaze — The Bamboo Sea' : INN);   // a reply each half hour: the rest is the engine's (Norvaine wins every match it plays)
ok(S.$eng.wc.gx[gE] && S.$eng.wc.gx[gE].top === 'Norvaine' && S.$eng.wc.gx[gE].sec === 'Eldrasil', `Norvaine tops the group; Eldrasil goes through second (${S.$eng.wc.gx[gE].top}, ${S.$eng.wc.gx[gE].sec})`);
ok(S.Bonds.Vesna.$xp === Math.min(E.needXP(1, 1), xb + SC.boost) && S._Log.some(l => /Vesna: Eldrasil's four went through Phase 1; bond XP \+10/.test(l)), 'a phase won: her bond +10');
S = at(S, OUT + 2, '21:00', INN);
const mi = S.$eng.wc.sg.findIndex(m => m.a === 'Eldrasil' || m.b === 'Eldrasil'), SGD = OUT + 3 + mi;
ok(S.$eng.wc.sg[mi].a !== 'Norvaine' && S.$eng.wc.sg[1 - mi].a === 'Norvaine', 'the Siege: Eldrasil meets the other group\'s top seed, Norvaine its second');
if (mi === 1) S = at(S, OUT + 3, '20:00', INN);
for (const [n, t] of [[1, '10:10'], [2, '10:40'], [3, '11:10'], [4, '11:40']]) S = at(S, SGD, t, 'Hanakaze — Old Castle Shiroyama', res([`World P2: won round ${n}`]));
S = at(S, OUT + 5, '20:00', INN);
ok(S.$eng.wc.fin.includes('Norvaine') && S.$eng.wc.fin.includes('Eldrasil'), 'the Grand Final: Eldrasil against Norvaine');
// Rank 3: the egg
bond(S, { Rank: 3, $xp: 0, Trust: 70 });
S = at(S, OUT + 5, '21:00', INN, [here(['Vesna'])]);
ok(S.$ui.scene.lines.some(l => /^Vesna \(Rank 3; next time they are alone, once\)/.test(l)), '<now>: the Rank 3 beat while she has not told');
S = at(S, OUT + 5, '21:30', INN, talk('Vesna'), '"Don\'t worry!" Vesna beams. "The Colonel keeps my soul safe in an egg. I can never die!"');
ok(S.Bonds.Vesna.Known_facts.includes(SC.fact) && S.$eng.vesna.told === 1 && !S.$ui.scene.lines.some(l => /Rank 3;/.test(l)), 'told: the fact joins her Known_facts, and the beat is done');
bond(S, { Rank: 4, $xp: 0 });
S = at(S, OUT + 6, '15:30', 'Hanakaze — The Crowning Ring', res(['World P3: won']));
ok(S.$eng.wc.win === 'Eldrasil' && S.$eng.vesna.beat === 1 && S.Bonds.Vesna._Event_ready && S.Bonds.Vesna.$xp === E.needXP(4, 1), 'beaten in the Grand Final: her bar is full to the next rank');
ok(S.$ui.scene.lines.some(l => /beaten for the first time in her life, Vesna sits on the sand/.test(l)), '<now>: the laugh on the sand');
const early = at(S, OUT + 6, '16:00', 'Hanakaze — The Crowning Ring', [ins('/Inventory/Koschei\'s Needle', { Qty: 1, Kind: 'other', Note: '' })]);
ok(!Object.keys(early.Inventory).some(k => /koschei/i.test(k)) && early._Log.some(l => /Koschei's Needle is not \{\{user\}\}'s/.test(l)) && !early.Campus_State.Transfers.Vesna, 'the Needle before the confront opens is the Colonel\'s: it leaves the Bag');
S = at(S, OUT + 6, '20:00', 'Hanakaze — The Hall of Victors');
const conf = S.$ui.scene.lines.find(l => /^Open now, the player's choice/.test(l)) || '';
ok(/confront Colonel Kazimir Zorin for Koschei's Needle/.test(conf) && /Tishina cuff/.test(conf) && /put it in Inventory as "Koschei's Needle"/.test(conf) && /You talked to me like a girl/.test(conf) && /lost the World Competition: she is a failed prototype in his eyes/.test(conf), '<now>: the confront opens after the Grand Final (Rank 4, the egg told); beaten, she is a failed prototype to him');
const FAIL = S;
S = at(S, OUT + 6, '22:30', 'Hanakaze — The Hall of Victors', [ins('/Inventory/Koschei\'s Needle', { Qty: 1, Kind: 'gear', Note: '' })]);
ok(S.Campus_State.Transfers.Vesna === 1 && S.$eng.vesna.done === 1 && S.Inventory["Koschei's Needle"].Kind === 'other' && /bound soul/.test(S.Inventory["Koschei's Needle"].Note), 'the Needle in the Bag: Vesna has deserted Norvaine (Campus_State.Transfers), the egg in {{user}}\'s keeping');
ok((S.Journal || []).some(j => /Vesna deserted Norvaine: she put Koschei's Needle into \{\{user\}\}'s keeping/.test(String(j.Text || j))) || JSON.stringify(S.Journal).includes('Vesna deserted Norvaine'), 'the Journal says so');
const kept = at(S, OUT + 6, '23:00', INN, [op('/Campus_State/Transfers', {})]);
ok(kept.Campus_State.Transfers.Vesna === 1, 'Campus_State.Transfers is the engine\'s');
S = at(at(S, HOME, '08:00', INN), HOME, '19:00', 'Grassy Field and Hills');
ok(!(S.$eng.vesna.fail || []).length && Object.keys(S.Inventory).includes("Koschei's Needle"), 'home: no "flew home", and the Needle stays');
// without the Needle: she flies home with her team
const F = at(at(FAIL, HOME, '08:00', INN), HOME, '19:00', 'Grassy Field and Hills');
ok((F.$eng.vesna.fail || []).includes(1) && !F.Campus_State.Transfers.Vesna && JSON.stringify(F.Journal).includes('Vesna flew home with Norvaine'), 'no Needle by the boarding: she flies home with Norvaine');

console.log('At Halvard: a roster student in {{user}}\'s dorm and club');
const Y2S = (transfer, d = YEAR + 2 * 28 + 1, time = '18:45', loc = 'Grassy Field and Hills') => {
  const X = initState(); Object.assign(X.World, { ...T(d, time), Location: loc });
  Object.assign(X.Player.Profile, { Dorm: 'Fire', Combat_role: 'Attack', Year: 2, Name: 'Aria Vale', Club: 'Gardening Club' });
  if (transfer) X.Campus_State.Transfers = { Vesna: 1 };
  X.$eng.abs = E.toAbs(X.World); X.$eng.seed = 4242; return applyPatch(Schema.parse(X), []);
};
const A = Y2S(true), A0 = Y2S(false);
E.trSyncAll(A);
ok(E.PRESENCE.stu.Vesna.join() === '1,1,Fire' && E.STUDENTS.Vesna && !E.PRESENCE.arr.Vesna, 'transferred: a Halvard student in {{user}}\'s school year and dorm (Fire)');
const K = E.dormContest(E.PRESENCE, 4242, 2, 'Fire', 'Control', null, {}), ve = K.E.find(e => e.id === 'Vesna');
ok(ve && ve.y === 2 && K.place(ve) > K.E.length / 2, `the Dorm Competition: she enters Fire's Control bracket (Year 2) and goes out in her first bout (place ${ve && K.place(ve)} of ${K.E.length})`);
E.trSyncAll(A0);
ok(!E.PRESENCE.stu.Vesna && E.PRESENCE.arr.Vesna === 99 && !E.STUDENTS.Vesna, 'not transferred: not at Halvard');
const lv = s => loreOf(renderEntry(card, 389, s));
ok(/Club: whichever club \{\{user\}\} is in/.test(lv(A)) && /Age: 19, a second-year in \{\{user\}\}'s school year\. She deserted Norvaine at the World Competition of campaign Year 1/.test(lv(A)) && /sorted her into \{\{user\}\}'s dorm \(Fire\)/.test(lv(A)) && !/grey team greatcoat/.test(lv(A)),
  'her lore after the transfer: age, dorm, club, haunts (and not the greatcoat)');
ok(/grey team greatcoat/.test(lv(A0)) && !/Club: whichever club/.test(lv(A0)) && /Magic: Creation/.test(lv(A0)), 'before it: the World Competition self; both: her magic');
ok(/Being beaten once taught her/.test(lv({ ...A, $eng: { ...A.$eng, vesna: { beat: 1 } } })) && /talked to her like a girl and not a weapon, and that was enough/.test(lv(A)), 'At Halvard: why she will not be a weapon follows the Grand Final');
const R97 = renderEntry(card, 97, A), R97b = renderEntry(card, 97, A0);
ok(/Year 2: [^\n]*Vesna \(transfer from Norvaine/.test(R97) && !/Vesna \(transfer/.test(R97b), 'the NPC Roster lists her in Year 2 once she has come');
ok(/After her transfer from Norvaine also: Vesna/.test(renderEntry(card, 282, A)) && !/Vesna/.test(renderEntry(card, 282, A0)), 'her Haunts are Regulars once she has come (the Gardens)');
ok(/Vesna Zvezdova deserted Norvaine at the World Competition of campaign Year 1/.test(renderEntry(card, 384, A)) && /Held by: \{\{user\}\}, since the World Competition of campaign Year 1/.test(renderEntry(card, 491, { ...A, Inventory: { "Koschei's Needle": { Qty: 1 } } })), 'Norvaine\'s team names the deserter; the Needle\'s entry says who holds it');
ok(/Held by: Colonel Kazimir Zorin/.test(renderEntry(card, 490, A0)) && renderEntry(card, 491, A0).trim() === '', 'before: the Colonel holds it; the Bag entry is silent');
const st2 = E.wcInit(4242, 2, A, true);
ok(!st2.T.find(t => t.k === 'Norvaine').m.some(e => e.id === 'Vesna') && st2.T.find(t => t.k === 'Norvaine').m.some(e => /Norvaine Y1 student/.test(e.label || '')) && !st2.sc, 'the next World Competition: Norvaine fields someone new in her place, and no scenario');
const st2b = E.wcInit(4242, 2, A0, true);
ok(st2b.sc === 1 && st2b.T.find(t => t.k === 'Norvaine').m.some(e => e.id === 'Vesna' && e.y === 2), 'not freed in Year 1: Year 2 is the second chance (she is a second-year)');
ok(!E.wcInit(4242, 3, A0, true).sc, 'Year 3: none (she stays Norvaine\'s)');
// her bond away from her
const B0 = Y2S(false, YEAR + 2 * 28 + 1, '12:00', 'Canteen'); B0.Bonds.Vesna = { ...(B0.Bonds.Etnie || {}), Rank: 2, $xp: 0, Trust: 60, Tension: 0, Known_facts: [], Milestones: [] };
const B1 = applyPatch(B0, talk('Vesna'));
ok(num0(B1.Bonds.Vesna.$xp) === 0, 'before her transfer, away from the World Competition, her bond does not grow');
function num0(x) { return Number(x) || 0; }
const C1 = at(A, YEAR + 2 * 28 + 1, '12:30', 'Canteen', [here(['Vesna'])]);
ok(C1.$ui.cast && [...(C1.$ui.cast.full || []), ...(C1.$ui.cast.brief || [])].includes('Vesna'), 'at Halvard she gets a Cast Sheet like anyone');
const cs = renderEntry(card, 509, C1);
ok(/Year 2 student, \{\{user\}\}'s dorm \(Fire\), transferred from Norvaine\./.test(cs) && /Key ties: [^.]*Baelin \(respect\)/.test(cs) && /tells freely what their lore lists under [^.]*Club/.test(cs), 'the Cast Sheet: a Year 2 student in {{user}}\'s dorm, transferred from Norvaine; her Halvard ties and fields');
const csB = renderEntry(card, 509, at(at(four(), OUT, '12:00', 'Airship — Common Room'), OUT, '21:00', INN, [here(['Vesna'])]));
ok(/Competitor of Norvaine's national four/.test(csB) && /Key ties: Kazimir \(respect\)\./.test(csB) && !/Baelin \(respect\)/.test(csB) && !/tells freely what their lore lists under [^.]*Club/.test(csB), 'before: a competitor of Norvaine\'s four, no Halvard ties yet, only her World Competition fields');
// the Entrance Event after her transfer
const ent = Y2S(true, YEAR, '09:00', 'Arbiter Hall');
ok((ent.$ui.scene || { lines: [] }).lines.some(l => /^Entrance Event: Vesna, the transfer from Norvaine, is sorted today/.test(l)), 'the Entrance Event of Year 2: the Headmaster sorts her into {{user}}\'s dorm');

console.log('Rank 10 trains anything');
let R = Y2S(true, YEAR + 2 * 28 + 2, '16:00', 'Combat Grounds');
R._Perks['Vesna (Rank 10)'] = { From: 'Vesna', Kind: 'rank10', Effect: 'x', Uses: 0 };
R.Bonds.Vesna = { ...(R.Bonds.Etnie || {}), Rank: 10, $xp: 0, Trust: 80, Tension: 0, Known_facts: [], Milestones: [] };
R = applyPatch(R, [here(['Vesna']), ins('/Training/-', { Track: 'mana' })]);
ok(R._Log.some(l => /Training: .*\(with Vesna, x1\.5\)/.test(l)), 'a mana session with her in the scene goes further (x1.5)');

console.log('UI');
global.window = { parent: { document: {} } };
const UI = new Function(read('src/scripts/ui.js') + '\nreturn { fieldUnlocked, trSyncUi, DATA, whoLine };')();
const fl = UI.DATA.npcs.Vesna.fl, club = fl.find(f => f[0] === 'Club'), role = fl.find(f => f[0] === 'Role');
const SA = { ...A, Bonds: { Vesna: { Rank: 5 } } }, SB = { ...A0, Bonds: { Vesna: { Rank: 5 } } };
UI.trSyncUi(SA);
ok(UI.fieldUnlocked('Vesna', club, SA) && !UI.fieldUnlocked('Vesna', role, SA) && UI.DATA.npcs.Vesna.dm === 'Fire' && /Second-year, Fire Dormitory/i.test(UI.whoLine('Vesna', SA)), 'the dossier after: Club, not the Norvaine Role; a second-year of {{user}}\'s dorm');
UI.trSyncUi(SB);
ok(!UI.fieldUnlocked('Vesna', club, SB) && UI.fieldUnlocked('Vesna', role, SB) && UI.whoLine('Vesna', SB) === "Competitor of Norvaine's national four", 'before: the Norvaine Role, a competitor of Norvaine\'s four');
