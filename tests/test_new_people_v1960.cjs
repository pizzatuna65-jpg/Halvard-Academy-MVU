// 1.96.0 (owner-approved planning/DRAFT_nama_npc.md): names and traits for the narrator's new characters. The pools
// (data/name_pool.json): no roster name, no name language models keep reusing, no duplicates. Two names per gender wait in
// $ui.xroll until one is used; the traits roll in two stages (2-3 good, 1-3 bad, then which, never two on one axis), then
// sometimes one dere archetype; they are a pure function of (seed, full name). 505 prints the offer and, with the record request,
// each trait's behaviour. Switched off in Features: nothing.
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
ok(again === N, 'the same person (any case) always rolls the same traits');
ok(JSON.stringify(E.xTraits(seed, 'Tancred Pell')) !== JSON.stringify(E.xTraits(seed + 1, 'Tancred Pell')), 'another campaign seed, other traits');

console.log('The offer');
let S = applyPatch(initState(), [{ op: 'replace', path: '/$eng/seed', value: seed }, { op: 'replace', path: '/World/Time', value: '09:00' }]);
const X = S.$ui.xroll;
ok(X && X.m.length === 2 && X.f.length === 2, 'two male and two female names wait');
ok(X.m.every(([n]) => DATA.m.includes(n.split(' ')[0])) && X.f.every(([n]) => DATA.f.includes(n.split(' ')[0])) && [...X.m, ...X.f].every(([n]) => DATA.surname.includes(n.split(' ')[1])), 'given names by gender, surnames from the shared pool');
ok([...X.m, ...X.f].every(([n, l]) => l === E.xTraits(seed, n).map(t => t.t).join(', ')), 'each name carries its own trait labels');
const S2 = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:10' }]);
ok(JSON.stringify(S2.$ui.xroll) === JSON.stringify(X), 'nothing used: the offer stays the same');
const [used] = X.m[0];
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:20' }, { op: 'replace', path: '/Scene/Present', value: { [used]: { Note: 'sweeping the steps' } } }]);
const flat = [...S.$ui.xroll.m, ...S.$ui.xroll.f].map(x => x[0]);
ok(!flat.some(n => n.split(' ')[0] === used.split(' ')[0] || n.split(' ')[1] === used.split(' ')[1]), `once ${used} is in a scene, neither their given name nor their surname is offered again`);
let txt = renderEntry(CARD, 505, S);
ok(/New names: a character this reply introduces who is not in the roster and has no Extras record takes a name and traits from here, in order \(male: /.test(txt), '505 prints the offer');
ok(txt.includes(`${S.$ui.xroll.f[0][0]} (${S.$ui.xroll.f[0][1]})`), 'with each name\'s traits');

console.log('The record request carries the traits');
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '10:00' }, { op: 'replace', path: '/Scene/Present', value: {} }]);
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '11:00' }, { op: 'replace', path: '/Scene/Present', value: { [used]: { Note: 'back' }, 'Marta Bellweather': { Note: 'counting' } } }]);
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '11:30' }, { op: 'replace', path: '/Scene/Present', value: {} }]);
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '12:00' }, { op: 'replace', path: '/Scene/Present', value: { [used]: { Note: 'again' }, 'Marta Bellweather': { Note: 'again' } } }]);
txt = renderEntry(CARD, 505, S);
const line = (E.xTraits(seed, used)).map(t => `${t.t}: ${t.do}`).join('; ');
ok(S.$ui.cast.xnew.includes(used) && txt.includes(`${used} (${line})`), 'a pool name: the same traits as offered, now with what to play');
ok(S.$ui.cast.xt['Marta Bellweather'] && /Manner carries these traits/.test(txt), 'a name from outside the pool gets traits too');

console.log('Switched off');
const off = applyPatch(S, [{ op: 'replace', path: '/$ui/off', value: ['new_people'] }, { op: 'replace', path: '/World/Time', value: '12:10' }]);
txt = renderEntry(CARD, 505, off);
ok(off.$ui.xroll === null && !/New names:/.test(txt), 'no offer');
ok(!Object.keys(off.$ui.cast.xt).length && /Seen before, with no Extras record yet: [^(]+\. Add their record/.test(txt), 'the record request as before 1.96.0');
