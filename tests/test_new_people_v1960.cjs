// 1.96.0 (owner-approved planning/DRAFT_nama_npc.md): names and traits for the narrator's new characters. The pools
// (data/name_pool.json): no roster name, no name language models keep reusing, no duplicates. The traits roll in two stages
// (2-3 good, 1-3 bad, then which, never two on one axis), then sometimes one dere archetype. 1.96.1 (owner): names and traits
// apart: one given name per gender with one shared surname, and one set of traits ($eng.xslot) that the next new character takes
// under any name. 505 prints the offer and, with the record request, each trait's behaviour. Switched off in Features: nothing.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, renderEntry, ok, ROOT } = require('./harness.cjs');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn { xTraits, xOffer, XROLL };')();
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/name_pool.json'), 'utf8'));
const NPCS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/npcs.json'), 'utf8'));
const CARD = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8'));
// names the 2026-10-22 research found language models default to (antislop-sampler, Max Read, seehuhn.de, the Gemini forum,
// typingmind), and the fantasy defaults a narrator reaches for: a new pool name among them fails here
const AVOID = new Set(`Elara Elysia Lyra Eira Eluned Elian Elias Elianore Aria Eitan Kael Kaelen Kaelan Caelan Jaxon Marianne Maya Mia
Sarah Lykos Yumi Minji Amelia Amira Marla Lily Lila Amara Samir Ravi Jamie Emily Elise Alex Eadric Aldric Jake Jamal Johann Amina Makena
Maria Anika Eliab Zara Naledi Arben Clara Ayla Freydis Claudette Meera Alexei Melodia Aisha Fatima Seraphina Maeve Eleanor Elena Mara Kira
Nova Luna Sage Kai Evelyn Marcus Sofia Aiden Thomas Daniel Michael David Voss Vance Vex Thorne Hartley Ashworth Whitby Hargreaves Kincaid
Castellano Kowalski Marchetti Vasquez Chen Wayfarer Wandermere Lysander Cassian Draven Zephyr Orion Rowan Finn Silas Theron Alaric Corvin
Isolde Seren Liora Elowen Aurelia Celeste Vivienne Evangeline Ophelia Rosalind Thalia Sylvie Ember Raven Nyx Aurora Ivy Willow Eamon Ronan
Torin Lucian Valerius Darian Varian Rhys Soren Ezra Jasper Elric Garrick Mira Nessa Talia Kestrel Brynn Sloane Vesper Blackwood Ashford
Sterling Hawthorne Nightshade Ravenwood Godric Osric Merrick Audric Ulric Lorcan Caspian Dorian Cedric Gideon`.toLowerCase().split(/\s+/));
const lo = a => a.map(x => x.toLowerCase());

console.log('The pools');
const roster = new Set(Object.values(NPCS).flatMap(v => [v.name, ...(v.keys || [])]).flatMap(s => s.toLowerCase().split(/\s+/)));
for (const k of ['m', 'f', 'surname']) {
  const L = lo(DATA[k]);
  ok(new Set(L).size === L.length && L.length >= 100, `${k}: ${L.length} names, no duplicates`);
  ok(!L.some(n => AVOID.has(n)), `${k}: none of the names language models keep reusing`);
  ok(!L.some(n => roster.has(n)), `${k}: no roster name or alias`);
}
ok(!lo(DATA.m).some(n => lo(DATA.f).includes(n)), 'no given name in both gender pools');
const T = DATA.traits, all = [...T.positive, ...T.negative, ...T.dere];
ok(T.positive.length >= 50 && T.negative.length >= 50 && T.dere.length === 6, `traits: ${T.positive.length} good, ${T.negative.length} bad, ${T.dere.length} dere`);
ok(new Set(lo(all.map(t => t.t))).size === all.length && all.every(t => t.do && t.x.length && t.do.split(' ').length <= 10), 'every trait once, with a short behaviour and an axis');

console.log('Two stages, then a dere sometimes');
const seed = 4242, N = 3000, axisOf = Object.fromEntries(all.map(t => [t.t, t.x]));
const side = Object.fromEntries(['positive', 'negative', 'dere'].map(k => [k, new Set(T[k].map(t => t.t))]));
let dere = 0, bad = 0, again = 0;
const ratio = {};
for (let i = 0; i < N; i++) {
  const name = `Test Person ${i}`, got = E.xTraits(seed, name), labels = got.map(t => t.t);
  const g = labels.filter(l => side.positive.has(l)).length, b = labels.filter(l => side.negative.has(l)).length, d = labels.filter(l => side.dere.has(l)).length;
  ratio[`${g}+${b}`] = (ratio[`${g}+${b}`] || 0) + 1; dere += d;
  if (g < 2 || g > 3 || b < 1 || b > 3 || d > 1) bad++;
  const ax = labels.flatMap(l => axisOf[l]); if (new Set(ax).size !== ax.length) bad++;
  if (JSON.stringify(E.xTraits(seed, name.toUpperCase())) === JSON.stringify(got)) again++;
}
ok(!bad, 'always 2-3 good and 1-3 bad, at most one dere, never two traits on one axis');
ok(Object.keys(ratio).length === 6 && Object.values(ratio).every(n => n > N / 6 * 0.75), `all six ratios come up about equally: ${JSON.stringify(ratio)}`);
ok(dere > N * 0.16 && dere < N * 0.24, `a dere archetype on top about ${T.dere_pct}% of the time: ${(dere / N * 100).toFixed(1)}%`);
ok(again === N, 'the same key (any case) always rolls the same traits');
ok(JSON.stringify(E.xTraits(seed, 'Tancred Pell')) !== JSON.stringify(E.xTraits(seed + 1, 'Tancred Pell')), 'another campaign seed, other traits');

console.log('The offer: one name per gender, one surname, one set of traits');
const SL = n => E.xTraits(seed, `slot ${n}`);
let S = applyPatch(initState(), [{ op: 'replace', path: '/$eng/seed', value: seed }, { op: 'replace', path: '/World/Time', value: '09:00' }]);
const X = S.$ui.xroll, sur = X.m.split(' ')[1];
ok(DATA.m.includes(X.m.split(' ')[0]) && DATA.f.includes(X.f.split(' ')[0]), 'one male and one female given name');
ok(DATA.surname.includes(sur) && X.f.split(' ')[1] === sur, 'both with the same rolled surname');
ok(JSON.stringify(X.t) === JSON.stringify(SL(0).map(t => [t.t, t.do])), 'one set of traits, rolled apart from the names (slot 0)');
const S2 = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:10' }]);
ok(JSON.stringify(S2.$ui.xroll) === JSON.stringify(X), 'nobody new: the offer stays the same');
let txt = renderEntry(CARD, 505, S);
ok(txt.includes(`Next new character: the first character this reply introduces who is not in the roster and has no Extras record is named ${X.m} if male, ${X.f} if female (a name the player gave wins) and has these traits, whatever their name: ${X.t.map(t => t[0]).join(', ')}.`), '505 prints the names and the trait labels');
const used = X.f;
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:20' }, { op: 'replace', path: '/Scene/Present', value: { [used]: { Note: 'sweeping the steps' } } }]);
ok(S.$eng.xs[used.toLowerCase()].t === 0 && S.$eng.xslot === 1, `${used} arrives and takes the waiting set`);
ok(JSON.stringify(S.$ui.xroll.t) === JSON.stringify(SL(1).map(t => [t.t, t.do])), 'the next new character gets a fresh set');
ok(![S.$ui.xroll.m, S.$ui.xroll.f].some(n => n.split(' ')[0] === used.split(' ')[0] || n.split(' ')[1] === sur), 'a worn given name or surname is not offered again');
const swipe = applyPatch(S2, [{ op: 'replace', path: '/World/Time', value: '09:20' }, { op: 'replace', path: '/Scene/Present', value: { [used]: { Note: 'sweeping the steps' } } }]);
ok(JSON.stringify(swipe.$ui.xroll) === JSON.stringify(S.$ui.xroll) && swipe.$eng.xs[used.toLowerCase()].t === 0, 'a swipe gives the same');
const two = applyPatch(S2, [{ op: 'replace', path: '/World/Time', value: '09:20' }, { op: 'replace', path: '/Scene/Present', value: { 'Marta Bellweather': { Note: 'counting' }, 'Odo Quint': { Note: 'yawning' } } }]);
ok(two.$eng.xs['marta bellweather'].t === 0 && two.$eng.xs['odo quint'].t === 1 && two.$eng.xslot === 2, 'any name takes the set; two in one reply take two sets, in order');

console.log('The record request carries the traits');
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '10:00' }, { op: 'replace', path: '/Scene/Present', value: {} }]);
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '11:00' }, { op: 'replace', path: '/Scene/Present', value: { [used]: { Note: 'back' }, 'Marta Bellweather': { Note: 'counting' } } }]);
ok(S.$eng.xs['marta bellweather'].t === 1, 'a name from outside the pool takes the next set');
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '11:30' }, { op: 'replace', path: '/Scene/Present', value: {} }]);
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '12:00' }, { op: 'replace', path: '/Scene/Present', value: { [used]: { Note: 'again' }, 'Marta Bellweather': { Note: 'again' } } }]);
txt = renderEntry(CARD, 505, S);
const line = n => SL(n).map(t => `${t.t}: ${t.do}`).join('; ');
ok(S.$ui.cast.xnew.includes(used) && txt.includes(`${used} (${line(0)})`), 'the same set as offered, now with what to play');
ok(txt.includes(`Marta Bellweather (${line(1)})`) && /Manner carries these traits/.test(txt), 'and Marta\'s own set');
const old = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '12:05' }, { op: 'remove', path: '/$eng/xs/marta bellweather/t' }]);
ok(old.$ui.cast.xt['Marta Bellweather'] === E.xTraits(seed, 'Marta Bellweather').map(t => `${t.t}: ${t.do}`).join('; '), 'someone counted on 1.96.0 (no slot) keeps the set of their name');

console.log('Switched off');
const off = applyPatch(S, [{ op: 'replace', path: '/$ui/off', value: ['new_people'] }, { op: 'replace', path: '/World/Time', value: '12:10' }, { op: 'replace', path: '/Scene/Present', value: { 'Wilmot Tull': { Note: 'new' } } }]);
txt = renderEntry(CARD, 505, off);
ok(off.$ui.xroll === null && !/Next new character:/.test(txt), 'no offer');
ok(!Object.keys(off.$ui.cast.xt).length && off.$eng.xs['wilmot tull'].t == null, 'nobody takes a set');
