// 1.98.1 (owner-approved planning/DRAFT_kedalaman_fitur.md batch 2): Dove watch. Dove_attention is how close the Dovecote is to any
// Dove secret (the true magic, a forbidden technique or pact, Koschei's Needle, Hidden.Secrets); the stages bring a rumour, a Dove on
// {{user}}'s routine, the interview (Krieg; missed, Milena), the room search, a knower who talks and the hearing; /Dove_found records
// what the Doves learned (the Needle goes to the Dovecote and lore 490's Held by follows).
const fs = require('fs'), path = require('path');
const { Schema, initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { toAbs, fromAbs, DAY_MIN, DW, doveSecrets };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json'));
const now = S => renderEntry(card, 505, S), rules = S => renderEntry(card, 511, S);
const op = (p, value) => ({ op: 'replace', path: p, value });
function at(W, seed, extra = {}) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 2, Week: 2, Day: 'Mon', Time: '08:00', Location: 'Canteen', ...W });
  Object.assign(S.Player.Profile, { Dorm: 'Fire', Year: 1, Name: 'Aria Vale' });
  S.Player.Wallet.Points = 300; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = seed;
  for (const [k, v] of Object.entries(extra)) _.set(S, k, v);
  return applyPatch(Schema.parse(S), []);
}
const go = (B, W, ops = [], opts) => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops], opts);
const att = (B, a, W = {}) => go(B, W, [op('/Hidden/Dove_attention', a)]);
const TRUE = { 'Hidden._True_magic': 'Unmake (Mystic, Unmaking)' };
const NEEDLE = { "Inventory.Koschei's Needle": { Qty: 1, Kind: 'other', Note: '', Plan: '' }, 'Campus_State.Transfers': { Vesna: 1 } };

console.log('Dove secrets');
const none = at({}, 7);
ok(!none.$ui.dove && !now(none).includes('Dove watch'), 'nothing hidden: no Dove watch line');
ok(now(none).includes('') && !/Hidden\.Secrets/.test(renderEntry(card, 502, none)) === false, '502 still names Hidden.Secrets for a student with nothing hidden');
const tm = at({}, 7, TRUE);
ok(tm.$ui.dove && tm.$ui.dove.secrets.some(s => s.n === 'True magic'), 'the true magic is a Dove secret');
ok(/Dove watch: Unnoticed \(0\/100\)\./.test(now(tm)) && /Dove secrets: True magic/.test(now(tm)), '<now>: ' + now(tm).split('\n').filter(l => /^Dove/.test(l)).join(' | '));
const pact = at({}, 7, { 'Magic.Pacts.Ash': { Spirit: 'Ash', Kind: 'Demon', Tier: 'Lesser', Presence: 'summoned' } });
ok(E.doveSecrets(pact).some(s => s.kind === 'pact' && /Pact with Ash \(Demon\)/.test(s.name)), 'a demon pact is a Dove secret (Pacting)');
const spirit = at({}, 7, { 'Magic.Pacts.Wren': { Spirit: 'Wren', Kind: 'Spirit', Tier: 'Lesser', Presence: 'summoned' } });
ok(!E.doveSecrets(spirit).length, 'a Spirit pact is lawful');
const forb = at({}, 7, { 'Magic._Techniques.Rot touch': { Type: 'Elemental', Subtype: 'Rot magic', Effect: 'x', Cost_mode: 'per_use', Activation: 5, Forbidden: true } });
ok(E.doveSecrets(forb).some(s => s.k === 'tech:Rot touch'), 'a forbidden technique is a Dove secret');
const nd = at({}, 7, NEEDLE);
const ns = E.doveSecrets(nd).find(s => s.kind === 'needle');
ok(ns && ns.item === "Koschei's Needle" && ns.who.includes('Vesna'), "Koschei's Needle in the Bag: physical, known to Vesna");
ok(/Dove secrets: Koschei's Needle \(in the Bag; known to Vesna\)/.test(now(nd)), '<now> lists it with its proof');
const sec = go(tm, {}, [op('/Hidden/Secrets/The sealed site', { What: 'went past the Warden\'s line into the sealed site at night', Proof: 'Wardens\' lantern', Known_by: ['etnie'] })]);
ok(sec.Hidden.Secrets['The sealed site'].Since && sec.Hidden.Secrets['The sealed site'].$born >= 0, 'Hidden.Secrets: dated by the engine');
ok(E.doveSecrets(sec).some(s => s.k === 's:The sealed site' && s.who.includes('Etnie')), 'a violation kept from the Doves is a secret; its knowers made canon');

console.log('The meter');
const up = att(tm, 25);
ok(up.Hidden.Dove_attention === 25 && up.Hidden._Stage === 'Rumoured', 'the narrator reports a rise');
const down = att(up, 10);
ok(down.Hidden.Dove_attention === 25 && down._Log.some(l => /manual decrease was reverted/.test(l)), 'the narrator never lowers it');
ok((up.Campus_State.Rumours || []).includes('Someone in the Fire Dormitory casts something that isn\'t on any syllabus.'), 'Rumoured: one rumour that names nobody');
const up2 = att(up, 30);
ok((up2.Campus_State.Rumours || []).filter(r => /syllabus/.test(r)).length === 1, 'once a climb');
const needleRum = att(nd, 22);
ok((needleRum.Campus_State.Rumours || []).some(r => /Hanakaze/.test(r)), 'the Needle\'s rumour points at Hanakaze');
const quiet = go(at({}, 7, { 'Hidden.Dove_attention': 30 }), {}, []);
const q2 = go(quiet, { Week: 4, Day: 'Mon' });
ok(q2.Hidden.Dove_attention <= 30 - 5, `nothing left to hide: quiet weeks lower it by 5 each (30 → ${q2.Hidden.Dove_attention})`);

console.log('The interview');
const inv = att(tm, 62);
const iv = inv.Commitments['Dovecote interview'];
ok(inv.Hidden._Stage === 'Investigated' && iv && iv.With === 'Krieg' && iv.Where === 'The Dovecote' && /M2 W2 Wed 16:00/.test(iv.Due), 'Investigated: Krieg calls {{user}} in for the day after tomorrow, 16:00: ' + (iv || {}).Due);
const there = go(inv, { Day: 'Wed', Time: '16:05', Location: 'The Dovecote' });
const line = (there.$ui.dove.now || []).find(l => /The Dovecote interview is now/.test(l)) || '';
ok(/Sir Krieg Valforth; Fortune \d+/.test(line) && /(Clean|Partial|Fail): /.test(line) && now(there).includes(line), '<now>: ' + line.slice(0, 170));
const again = go(inv, { Day: 'Wed', Time: '16:05', Location: 'The Dovecote' });
ok(JSON.stringify(again.$eng.dove.iv.res) === JSON.stringify(there.$eng.dove.iv.res), 'the same result on every swipe');
const done = go(there, { Time: '17:00' });
const band = there.$eng.dove.iv.res.band, d = E.DW.interview.delta[band];
ok(done.Hidden.Dove_attention === Math.max(0, Math.min(100, there.Hidden.Dove_attention + d)) && !done.Commitments['Dovecote interview'], `played: ${band} ${d >= 0 ? '+' : ''}${d}, the summons is gone`);
const ez = go(att(at({}, 7, { ...TRUE, 'Bonds.Ezrel': { Rank: 7, Trust: 70, Tension: 0 } }), 62), { Day: 'Wed', Time: '16:05', Location: 'The Dovecote' }, [op('/Scene/Present/Ezrel', {})]);
ok((ez.$eng.dove.iv.res.mods || []).some(m => /Ezrel speaks for \{\{user\}\} \+20/.test(m)), 'a Dorm Head at Rank 7 who comes along: +20');
const miss = go(inv, { Day: 'Wed', Time: '19:00' });
ok(miss.Hidden.Dove_attention === 72 && miss.$eng.dove.iv.who === 'Milena' && !miss.Commitments['Dovecote interview'], 'missed: +10, and Milena next');
const mil = go(miss, { Day: 'Thu', Time: '11:00', Location: 'Main Courtyard' });
const ml = (mil.$ui.dove.now || []).join(' ');
ok(/Milena Sagona comes to find/.test(ml) && (mil.$eng.dove.iv.res.mods || []).some(m => /Milena Sagona -10/.test(m)), 'Milena comes to find {{user}} the next day (−10)');

console.log('The room search and the Needle');
const ndi = att(nd, 64);
const night = ndi.$eng.dove.srch.night, day0 = Math.floor(E.toAbs(ndi.World) / E.DAY_MIN);
ok(night - day0 >= 2 && night - day0 <= 5, `a search night ${night - day0} days on`);
let seen = 0, found = 0;
for (let s = 1; s <= 40; s++) {
  const X = att(at({}, s, NEEDLE), 64), n = X.$eng.dove.srch.night;
  const W = E.fromAbs(n * E.DAY_MIN + 23 * 60 + 30), Y = go(X, { Month: W.Month, Week: W.Week, Day: W.Day, Time: '23:30', Location: 'Fire Dormitory' });
  if (Y.$eng.dove.srch.res) seen++;
  if (Y.$eng.dove.srch.res === 'fail') { found++; if (found === 1) ok(Y.Hidden.Dove_attention >= 80 && (Y.$ui.dove.now || []).some(l => /found Koschei's Needle/.test(l)) && Y.Inventory["Koschei's Needle"], 'found: Exposed, told at the dorm, the Needle still in the Bag until the story plays the seizure'); }
}
ok(seen === 40 && found >= 1 && found < 30, `40 searches, ${found} found it`);
const seized = go(nd, {}, [{ op: 'insert', path: '/Dove_found/-', value: { Secret: "Koschei's Needle", How: 'Krieg took it from her desk' } }]);
ok(!seized.Inventory["Koschei's Needle"] && seized.Campus_State.Needle_seized && !E.doveSecrets(seized).length, 'Dove_found: the Needle leaves the Bag for the Dovecote');
ok(seized.Journal.some(l => /! The Doves found out: Koschei's Needle \(Krieg took it from her desk\)\./.test(l)), 'a pinned Journal line');
const lore = card.data.character_book.entries.find(e => e.id === 490).content;
const ejs = require('ejs');
const held = ejs.render(lore, { getvar: k => _.get({ stat_data: seized }, k) });
ok(/Held by: the Dovecote, under Sir Krieg Valforth's seal, since M2 W2 Mon; he always knows where Vesna is/.test(held), 'lore 490: Held by the Dovecote');
const back = go(seized, {}, [op("/Inventory/Koschei's Needle", { Qty: 1, Kind: 'other' })]);
ok(!back.Campus_State.Needle_seized && back.Hidden.Dove_attention === 20 && E.doveSecrets(back).some(s => s.kind === 'needle'), 'stolen back: a secret again, +20');
const tm2 = go(at({}, 7, { ...TRUE, ...NEEDLE }), {}, [{ op: 'insert', path: '/Dove_found/-', value: { Secret: "Koschei's Needle" } }]);
ok(tm2.Hidden.Dove_attention === 60, 'one secret found while another is left: at least 60');

console.log('Knowers, casts, cold trails, the card, the toggle');
let talked = null;
for (let s = 1; s <= 30 && !talked; s++) {
  const X = at({}, s, { ...TRUE, 'Hidden.Known_by': ['Florian'], 'Bonds.Florian': { Rank: 2, Trust: 50, Tension: 55 } });
  const Y = go(X, { Week: 3, Day: 'Mon' });
  if (Y.$eng.dove.leak.id === 'Florian') talked = Y;
}
ok(talked && talked.Hidden.Dove_attention === 10 && (talked.$ui.dove.now || []).some(l => /Florian \(narrator only/.test(l)) && talked.$ui.dove.talked, 'a pro-Dove knower at Tension 50+ may talk: +10');
const anti = [];
for (let s = 1; s <= 30; s++) anti.push(go(at({}, s, { ...TRUE, 'Hidden.Known_by': ['Idris'], 'Bonds.Idris': { Rank: 2, Trust: 5, Tension: 95 } }), { Week: 3, Day: 'Mon' }));
ok(anti.every(Y => !Y.$eng.dove.leak.id), 'an anti-Dove knower never talks, however angry');
const caster = go(at({}, 7, { 'Magic._Techniques.Rot touch': { Type: 'Elemental', Subtype: 'Rot magic', Effect: 'x', Cost_mode: 'per_use', Activation: 1, Forbidden: true } }), {},
  [{ op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Rot touch' } }, op('/Scene/Present/Florian', {})]);
ok((caster.$ui.missed || []).some(l => /used Rot touch with people around \(Florian\)/.test(l)), 'a forbidden cast with people around: one reminder, no number moved');
ok(caster.Hidden.Dove_attention === 0, 'the reminder changes nothing');
const old = go(sec, {}, [op('/Hidden/Secrets/The sealed site/Proof', 'none'), op('/Hidden/Secrets/The sealed site/Known_by', [])]);
const cold = go(old, { Month: 4, Week: 3 });
ok(!cold.Hidden.Secrets['The sealed site'] && cold.Journal.some(l => /The trail went cold: The sealed site\./.test(l)), 'no proof and no knower after 8 weeks: the trail goes cold');
ok(/Dove secrets \(<now> lists them\)/.test(rules(tm)), 'the doves rule card shows with a secret');
ok(!/Dove secrets \(<now> lists them\)/.test(rules(none)) && /Dove secrets \(<now> lists them\)/.test(rules(go(none, {}, [], { text: 'She hid the vial before the Doves came.' }))), 'and for anyone when the reply speaks of hiding from the Doves');
const off = applyPatch(at({}, 7, TRUE), [op('/$ui/off', ['dove_watch'])]);
const offInv = att(off, 62);
ok(!offInv.Commitments['Dovecote interview'] && !(offInv.Campus_State.Rumours || []).length && offInv.Hidden._Stage === 'Investigated', 'Dove watch off: the meter and stage only');
const exp = att(tm, 81);
ok(exp.Commitments['Hearing at the Dovecote'] && /Sir Krieg Valforth leads it/.test(now(exp)), 'Exposed: the hearing; <now> names what they will act on');
