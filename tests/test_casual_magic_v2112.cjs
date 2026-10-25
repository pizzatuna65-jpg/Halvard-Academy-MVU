// 2.1.2 (owner-approved planning/DRAFT_sihir_kasual.md): magic is casual at Halvard. The World Index says so (skirmishes anywhere,
// serious fights in the Combat Grounds' rings, only real harm restricted); dorm separation is a class rule (lore 52, the calendar);
// a skirmish that hurts nobody is no reputation deed; one narration line (504); 22 magic beat types and two happenings.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const E = new Function(rd('src/scripts/engine.js') + '\nreturn { AMB, HAPPENINGS, happeningOn };')();
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const S0 = applyPatch(initState({ etnie: true }), W({ Month: 1, Week: 1, Day: 'Mon', Time: '07:30', Location: 'Fire Dormitory' }));

console.log('the lore');
{
  const l0 = rd('src/worldbook/content/0.txt'), l52 = rd('src/worldbook/content/52.txt');
  ok(l0.includes('Magic is everyday at Halvard') && l0.includes('Serious fights (formal duels, grudges, wagers, anything with real stakes) go to the warded rings of the Combat Grounds')
    && !l0.includes('duels outside a warded ring'), 'World Index: everyday magic, skirmishes anywhere, serious fights in the rings; no ban on duels outside a ring');
  ok(/forbidden arts \(arrest\), sport events \(no magic\), magic near the Seal Chamber, and real harm/.test(l0), 'still restricted: forbidden arts, sport events, the Seal Chamber, real harm');
  ok(l52.includes('outside class anyone may challenge anyone') && !l52.includes('Cross-dorm sparring only during Training Week'), 'Combat Grounds: dorm separation is a class rule');
  const m3 = renderEntry(card, 134, applyPatch(S0, W({ Month: 3, Week: 1, Day: 'Mon', Time: '09:00' })));
  ok(m3.includes('Training Week (the one week the dorms spar together in class)'), 'the calendar says so too');
}

console.log('the rules');
{
  ok(renderEntry(card, 504, S0).includes('- Magic is part of ordinary life at Halvard: let it turn up naturally') && !/needs no permission|step in only/.test(renderEntry(card, 504, S0)), '504: one craft line, magic is ordinary (not in every scene); what is allowed stays in the World Index alone (audit T6)');
  const rc = JSON.parse(rd('data/rule_cards.json'));
  ok(JSON.stringify(rc).includes('A quick skirmish that hurts nobody and breaks nothing is no deed'), 'the reputation card: a skirmish that stays one is no deed');
  const rep = JSON.parse(rd('data/reputation.json')).deeds;
  ok(rep.fight_outside_ward && rep.serious_fight_outside_ward, 'the deed names stay (old saves and reports keep working)');
}

console.log('the ambience and the happenings');
{
  const magic = E.AMB.beats.filter(b => /spell|magic|illusion|familiar|spirit|conjur|charm|healing glow|warded ring|palm of fire/i.test(b[2]));
  ok(magic.length >= 24, `magic beat types: ${magic.length} (7 before, by the same count)`);
  const places = ['Canteen', 'Main Library', 'Courtyards', 'Combat Grounds', 'Club Rooms', 'The Mall', 'Gardens', 'Fire Dormitory'];
  let beats = 0, mg = 0;
  for (let n = 8; n < 60; n++) for (const [i, t] of ['12:20', '16:40', '19:10'].entries()) {
    const X = applyPatch(S0, W({ Month: 1 + Math.floor(n / 28), Week: 1 + Math.floor((n % 28) / 7), Day: D[n % 7], Time: t, Location: places[(n + i) % places.length] }));
    const amb = ((X.$ui.now || {}).amb || []).filter(l => /^Nearby/.test(l));
    if (amb.length) { beats++; if (amb.some(l => magic.some(m => l.includes(m[2].slice(0, 30))))) mg++; }
  }
  ok(mg / beats > 0.2 && mg / beats < 0.6, `about a third of the beats show magic (${mg} of ${beats}; 4 of 44 before), not every one`);
  const ids = E.HAPPENINGS.map(h => h.id);
  ok(ids.includes('impromptu_duel') && ids.includes('ring_grudge'), 'two new happenings');
  let seen = new Set();
  for (let d = 0; d < 336; d++) { const h = E.happeningOn(7, d, 0.5, 'off'); if (h) seen.add(h.id); }
  ok(seen.has('impromptu_duel') && seen.has('ring_grudge'), 'both come up over a year');
}
