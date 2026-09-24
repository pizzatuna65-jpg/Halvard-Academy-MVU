// Batch 4 panels: rank gating, name evidence, edge visibility, secrets, graph model, map matching/discovery/crops, Go here text.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, runEngine, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
const src = fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8');
const U = new Function(src + '\nreturn { DATA, PANELS, view, knowsName, nameOf, fieldUnlocked, edgeVisible, graphModel, locIdOf, discovered, cropStyle, goText, pinOf };')();
console.log('People & map');
let S = initState();
S = applyPatch(S, [{ op: 'replace', path: '/Scene/Present', value: { Irene: { Note: 'checking a ledger' }, Etnie: { Note: 'waving' } } }, { op: 'replace', path: '/World/Time', value: '07:40' }]);
ok(S.Bonds.Irene && S.Bonds.Irene.Rank === 0, 'meeting Irene auto-creates a Rank 0 bond');
ok(!U.knowsName('Irene', S) && U.nameOf('Irene', S) === 'Student Council President', `unnamed Irene shows public role: "${U.nameOf('Irene', S)}"`);
ok(U.nameOf('Zara', S) === 'Silver-haired elf first-year', `descriptor without role: "${U.nameOf('Zara', S)}"`);
ok(U.knowsName('Etnie', S), 'Etnie (seeded Rank 3) is known by name');
const B = JSON.parse(JSON.stringify(S)); S.World.Time = '07:45';
runEngine(S, B, 'Irene Chanare adjusted her badge.');
ok(U.knowsName('Irene', S), 'once the story names Irene, the UI does too');
// dossier gating
U.view.arg = 'Etnie'; let h = U.PANELS.npc.render(S);
ok(/<h3>Appearance/.test(h) && /<h3>Hates/.test(h) && !/<h3>Personality/.test(h), 'Etnie at Rank 3: Hates visible, Personality (Rank 4) locked');
ok(/Rank 4: [^<]*Personality/.test(h), 'locked fields listed as "Still to learn"');
U.view.arg = 'Irene'; h = U.PANELS.npc.render(S);
ok(/<h3>Appearance/.test(h) && !/<h3>Speech/.test(h), 'Irene at Rank 0: appearance only');
// story-only (rank 99) field needs Secrets_revealed
const sec = Object.entries(U.DATA.npcs).find(([, n]) => n.fl.some(f => f[2] >= 99));
const [sid, sn] = sec, f99 = sn.fl.find(f => f[2] >= 99);
ok(!U.fieldUnlocked(sid, f99, S), `${sid}.${f99[0]} hidden before discovery`);
const S2 = JSON.parse(JSON.stringify(S)); S2.Campus_State.Secrets_revealed = [`${sid}.${/magic/i.test(f99[0]) ? 'magic' : /goal/i.test(f99[0]) ? 'goal' : /pact/i.test(f99[0]) ? 'pact' : 'other'}`];
ok(U.fieldUnlocked(sid, f99, S2), `${sid}.${f99[0]} unlocked by Secrets_revealed`);
// edges
const e5 = U.DATA.rel.find(e => e[0] === 'Irene' && e[4] === 'rank:6');
ok(e5 && !U.edgeVisible(e5, S), 'Irene\'s views hidden at Rank 0');
const S3 = JSON.parse(JSON.stringify(S)); S3.Bonds.Irene.Rank = 6;
ok(U.edgeVisible(e5, S3), 'visible at Rank 6');
U.view.gtypes = new Set(['rival', 'fear', 'dislike', 'friend', 'respect', 'mentor', 'family', 'romance', 'story']);
S3.Campus_State.New_relations = { 'Irene→Aiden': 'caught him at last' };
const G = U.graphModel(S3);
ok(G.nodes[0].you && G.links.some(l => l.type === 'bond' && l.target === 'Irene'), 'graph: you + bond links');
ok(G.links.some(l => [l.source, l.target].includes('Sophia')), 'graph: Irene–Sophia (fear) appears at Rank 6');
ok(G.links.some(l => l.types && l.types.includes('story')), 'graph: story relation from Campus_State.New_relations');
ok(!G.links.some(l => l.type === 'knows'), 'graph: "acquainted" edges filtered by default');
U.view.arg = 'Irene'; ok(/How they see others/.test(U.PANELS.npc.render(S3)), 'dossier lists their views at Rank 6');
// map
ok(U.locIdOf('Reception and Gatehouse') === 'reception_and_gatehouse' && U.locIdOf('Canteen — main kitchen') === 'canteen' && U.locIdOf('The Mall') === 'mall' && U.locIdOf('Main Courtyard') === 'courtyards', 'location matching (sub-spots, "The", courtyard alias)');
const roof = U.DATA.locs.rooftop;
ok(!U.discovered(S, roof), 'Rooftop undiscovered at start (D21)');
const S4 = JSON.parse(JSON.stringify(S)); S4.$ui.discovered.push('Rooftop');
ok(U.discovered(S4, roof), 'Rooftop discovered after being there');
U.view.pin = 1; U.view.floor = 'Towers & Roof';
ok(!/data-card="rooftop"/.test(U.PANELS.map.render(S)) && /data-card="rooftop"/.test(U.PANELS.map.render(S4)), 'map hides the Rooftop card until discovered');
U.view.pin = null; U.view.floor = ''; const mh = U.PANELS.map.render(S);
ok(/class="pin here[^"]*" data-pin="26"/.test(mh), 'current location pin (Gatehouse) marked');
ok(/data-card="reception_and_gatehouse"/.test(mh) && /You are here/.test(mh), 'opens on the current location card');
ok(U.goText('The Mall') === 'I head to the Mall.' && U.goText("Founder's Statue and Park") === "I head to the Founder's Statue and Park.", 'Go here text');
const cs = U.cropStyle(U.pinOf('mall'));
ok(/background-position:-?\d+px -?\d+px/.test(cs), `map crop style: ${cs.split(';').pop()}`);
// Location_changes surface on the card
const S5 = JSON.parse(JSON.stringify(S)); S5.Campus_State.Location_changes = { 'Reception and Gatehouse': 'a second checkpoint after the break-in' };
ok(/Changed: a second checkpoint/.test(U.PANELS.map.render(S5)), 'Campus_State.Location_changes shown on the card');
U.view.ptab = 'bonds'; const ph = U.PANELS.people.render(S);
ok(/data-open="npc:Irene"/.test(ph) && /here now/.test(ph), 'bonds list with "here now"');
ok(!U.knowsName('Sophia', S) && U.knowsName('Sophia', S3), 'a learned connection (Irene fears Sophia) reveals Sophia\'s name');
