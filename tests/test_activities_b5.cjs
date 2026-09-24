// Batch 5.2: club/competition/projects/trip engine + Activities and Battle panels.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { DATA, PANELS, view, clubOf };')();
console.log('Activities (engine + UI)');
let S = initState();
ok(S.Player.Wallet.Coin === 0 && S.Trip.Active === false && S.Competition.Status === '', 'new fields initialised');
ok(!S.$ui.unlocks.includes('competition') && !S.$ui.unlocks.includes('trip'), 'competition / trip locked in Month 1');
S = applyPatch(S, [{ op: 'replace', path: '/Player/Profile/Club', value: 'Duelling Club' }, { op: 'replace', path: '/Player/Profile/Combat_role', value: 'Attack, Control' }]);
ok(/Joined the Duelling Club\./.test(S.Journal.join()), 'joining a club is journaled');
ok(U.clubOf(S) && U.clubOf(S).key === 'Duelling', 'Profile.Club matched to the directory');
let h = U.PANELS.activities.render(S);
ok(/your club/.test(h) && /followed you in/.test(h), 'your club card, Etnie follows you in');
ok(!/data-nb|Ask to join/.test(h), 'no "Ask to join" once in a club');
ok(!/data-actab="competition"/.test(h) && !/data-actab="shop"/.test(h), 'tabs: competition locked, no shop away from a shop (1.2.0)');
// club members gated by the Club field (rank 1)
const lib = U.DATA.clubs.find(c => c.key === 'Library Assistants');
ok(lib.members.includes('Irene'), 'Irene listed in Library Assistants data');
S = applyPatch(S, [{ op: 'replace', path: '/Scene/Present', value: { Irene: { Note: 'reading' } } }]);
h = U.PANELS.activities.render(S);
ok(!/npc:Irene/.test(h.split('Library Assistants')[1].split('class="club"')[0]), 'Irene (Rank 0) not shown as a member yet');
// competition
S = applyPatch(S, [{ op: 'replace', path: '/Competition', value: { Tier: 'dorm', Status: 'Entered' } }]);
ok(S.Competition.Tier === 'Dorm' && S.Competition.Status === 'entered', 'case-insensitive enums');
ok(S.$ui.unlocks.includes('competition') && /Entered the Dorm Competition/.test(S.Journal.join()), 'unlock + journal');
S = applyPatch(S, [{ op: 'replace', path: '/Competition', value: { Tier: 'Academy', Status: 'qualified', Team: ['sophia', 'Gareth', 'Etnie'] } }]);
ok(S.Competition.Team.join() === 'Sophia,Gareth,Etnie', 'team canonicalised');
U.view.act = 'competition'; h = U.PANELS.activities.render(S);
ok(/Your team/.test(h) && /✓ Attack/.test(h) && /Y1 ✓/.test(h), 'team panel: roles + years');
const pts = S.Player.Wallet.Points;
S = applyPatch(S, [{ op: 'replace', path: '/Competition/Tier', value: 'Kingdom' }, { op: 'replace', path: '/Competition/Status', value: 'champion' }]);
ok(S.Player.Wallet.Points === pts + 5000 && /Kingdom Competition prize/.test(S.Player.Wallet.Transactions.join()), 'Kingdom prize paid by the engine');
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:00' }]);
ok(S.Player.Wallet.Points === pts + 5000, 'prize paid once');
U.view.act = 'competition'; h = U.PANELS.activities.render(S); ok(/Rival academies/.test(h), 'rival teams at Kingdom tier');
// projects
S = applyPatch(S, [{ op: 'insert', path: '/Projects/Healing draught', value: { Kind: 'potion', Goal: 'Brew a draught for Etnie', Progress: 40, Where: 'Potion Halls', With: 'etnie' } }]);
ok(S.$ui.unlocks.includes('projects') && S.Projects['Healing draught'].With === 'Etnie', 'projects unlock, With canon');
S = applyPatch(S, [{ op: 'replace', path: '/Projects/Healing draught/Progress', value: 140 }]);
ok(S.Projects['Healing draught'].Progress === 100 && /Finished: Healing draught/.test(S.Journal.join()), 'progress clamped, completion journaled');
// trip unlock window (Crowning Day M4 W2 Tue)
S = applyPatch(S, [{ op: 'replace', path: '/World/Month', value: 4 }, { op: 'replace', path: '/World/Week', value: 1 }, { op: 'replace', path: '/World/Day', value: 'Mon' }]);
ok(S.$ui.unlocks.includes('trip'), 'trip tab unlocks two weeks before Crowning Day');
S = applyPatch(S, [{ op: 'replace', path: '/Trip', value: { Active: true, Destination: 'the capital', Companions: ['Etnie'] } }]);
ok(/Set off for the capital/.test(S.Journal.join()), 'departure journaled');
U.view.act = 'trip'; h = U.PANELS.activities.render(S); ok(/Travelling: the capital/.test(h) && /curfew moves to 22:00/.test(h), 'trip tab');
// shop
// 1.2.0: the Shop tab exists only at a shop; the Mall lists its own shops, the Commissary its stock and Ardenne's orders
const Sm = applyPatch(S, [{ op: 'replace', path: '/World/Location', value: 'The Mall' }]);
U.view.act = 'shop'; U.view.shop = 'All'; h = U.PANELS.activities.render(Sm);
ok(/data-actab="shop"/.test(h) && /Quality focus/.test(h) && /data-fill="I buy a Sunfizz for 8 points\."/.test(h) && /data-fill="I head to Merryhew&#39;s to buy the Oracle Shell \(40 points\)\."/.test(h), 'at the Mall: Mall shops listed, rows draft a purchase, Oracle Shell at Merryhew\'s');
ok(!/Satchel/.test(h) && /not the whole stock/.test(h), 'the Mall does not list the Commissary; the list says it is a recommendation');
const Sc = applyPatch(S, [{ op: 'replace', path: '/World/Location', value: 'Commissary' }]);
Sc.Player.Wallet.Points = 10; h = U.PANELS.activities.render(Sc);
ok(/Satchel[\s\S]*?disabled title="Not enough points"/.test(h) && /Ardenne case/.test(h) && !/Quality focus/.test(h), 'at the Commissary: its stock and Ardenne orders; unaffordable items disabled');
const Sn = applyPatch(S, [{ op: 'replace', path: '/World/Location', value: 'The Mall — Nightwell' }]);
U.view.shop = 'All'; h = U.PANELS.activities.render(Sn);
ok(/data-shop="Nightwell" class="on"/.test(h) && /House coffee/.test(h), 'at "The Mall — Nightwell" the list opens on Nightwell');
// battle
S = applyPatch(S, [{ op: 'replace', path: '/Battle', value: { Active: true, Combatants: { sophia: { HP: 80, Stamina: 60, Status: 'guarding' } } } }]);
ok(S.Battle.Combatants.Sophia && !S.Battle.Combatants.sophia, 'combatant keys canonicalised');
h = U.PANELS.battle.render(S); ok(/<h2>Battle/.test(h) && /guarding/.test(h), 'battle panel');
// crowning day curfew fix
S = applyPatch(S, [{ op: 'replace', path: '/World/Week', value: 2 }, { op: 'replace', path: '/World/Day', value: 'Tue' }, { op: 'replace', path: '/World/Time', value: '21:00' }]);
ok(S.World._Curfew === '', 'Crowning Day: no curfew at 21:00 (moves to 22:00)');
fs.writeFileSync(path.join(ROOT, 'tests/preview/sample_b52.json'), JSON.stringify(S));
