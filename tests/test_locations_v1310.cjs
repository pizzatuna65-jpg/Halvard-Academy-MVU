// 1.31.0 (owner-approved planning/DRAFT_spirit_path.md, DRAFT_restore_places.md, DRAFT_location_activities.md, 2026-09-30):
// the Meditation Rooms and the Spirit Path are two places; restful places recover stamina or mana faster by the hour and the
// weather; new practice at the far grounds and a paid bell-keeper's shift; the Old Hut custom; letters home; talk under water.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn { fromAbs };')();
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const at = (S, d, time, loc, extra = []) => { const T = E.fromAbs(d * 1440 + (+time.slice(0, 2)) * 60 + (+time.slice(3)));
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })), { op: 'replace', path: '/World/Location', value: loc }, ...extra]); };
const rest = { op: 'replace', path: '/Player/Vitals/Resting', value: 'rest' };
const L = JSON.parse(read('data/locations.json')), pins = JSON.parse(read('data/map_pins.json'));
const entry = uid => read(`src/worldbook/content/${uid}.txt`);

console.log('Two places');
ok(L.meditation_rooms && L.spirit_path && !L.meditation_rooms_spirit_house, 'the Meditation Rooms and the Spirit Path, no "Spirit House"');
ok(pins.some(p => p.pin === 38 && p.label === 'Spirit Path' && p.cluster.includes('spirit_path')) && pins.some(p => p.pin === 32 && p.label === 'Meditation Rooms'), 'pin 38 is the Spirit Path; pin 32 the Meditation Rooms');
ok(['gymnasium', 'menagerie', 'sports_field'].every(x => L.spirit_path.connections.includes(x)) && L.spirit_path.category === 'Sport and Grounds', 'the Spirit Path joins the Gymnasium, Menagerie and Sports Field, out of doors');
ok(['Anselm','Caspian','Tristan','Faye'].every(id => L.meditation_rooms.regulars.includes(id)) && ['Florian','Royhan','Ruby','William'].every(id => L.spirit_path.regulars.includes(id)), 'regulars include Faye in Meditation Rooms and William on Spirit Path');
ok(!L.meditation_rooms.access && !/not to go alone|sounds no one|bound spirits/i.test(entry(87)) && /no sound from the campus gets in/.test(entry(87)), 'the Meditation Rooms are calm now: no "not alone", no sounds, no bound spirits');
ok(/first Spirit Pact/.test(entry(347)) && /Anyone may come to watch/.test(entry(347)), 'the Spirit Path lore: first pacts, and watching for everyone');
const v39map = JSON.parse(read('dist/lorebook_v39/eldrasil_v39_Core.json')).entries['132'].content;   // 1.99.5 (audit T4): the minutes live there
ok(!/Spirit House/.test(entry(132)) && /Spirit Path 17/.test(v39map) && /Spirit Path \(the footpath/.test(entry(132)), 'the Campus Map says Meditation Rooms and knows the Spirit Path');
const S0 = at(initState(), 12, '10:00', 'Main Library');
ok(at(S0, 12, '10:05', 'the Spirit House').World.Location === 'Meditation Rooms' && at(S0, 12, '10:05', 'Meditation Rooms / Spirit House').World.Location === 'Meditation Rooms', 'the old name and the nickname are the Meditation Rooms');

console.log('Restful places');
const low = (S, loc, time) => at(S, 12, time, loc, [{ op: 'replace', path: '/Player/Vitals/Mana', value: 0 }, { op: 'replace', path: '/Player/Vitals/Stamina', value: 10 }]);
const gain = (loc, from, to, k, extra = [], base = S0) => { const A = low(base, loc, from); const Z = at(A, 12, to, loc, [rest, ...extra]); return +(Z.Player.Vitals[k] - A.Player.Vitals[k]).toFixed(1); };
const baseMana = gain('Main Library', '10:00', '12:00', 'Mana'), medMana = gain('Meditation Rooms', '10:00', '12:00', 'Mana');
ok(baseMana > 30 && Math.abs(medMana / baseMana - 2) < 0.1, `Meditation Rooms: mana twice as fast (${baseMana} -> ${medMana})`);
const morning = gain('Meditation Rooms', '07:00', '09:00', 'Mana', [], at(initState(), 12, '06:55', 'Main Library'));
ok(Math.abs(morning / baseMana - 2.5) < 0.1, `Meditation Rooms: x2.5 in the quiet morning (${morning})`);
const cath = gain('The Cathedral', '10:00', '12:00', 'Mana');
ok(Math.abs(cath / baseMana - 1.25) < 0.1, `Cathedral on a Saturday: x1.25 (${cath})`);
const baseSt = gain('Main Library', '10:00', '11:00', 'Stamina'), ward = gain('Medical Centre', '10:00', '11:00', 'Stamina');
ok(baseSt === 20 && ward === 35, `Medical Centre ward: stamina x1.75 (${baseSt} -> ${ward})`);
const bath = gain('Bathhouse and Washrooms', '10:00', '11:00', 'Stamina');
ok(bath === 40 || bath === 50, `Bathhouse: stamina x2, x2.5 in the cold (${bath})`);
const practising = gain('Meditation Rooms', '10:00', '12:00', 'Mana', [{ op: 'insert', path: '/Practice/-', value: { Action: 'Will-focus meditation' } }]);
ok(Math.abs(practising - baseMana) < 1, 'no bonus while practising (the time is training, not rest)');
const here = low(S0, 'Meditation Rooms', '10:00');
ok(here.$ui.rest && here.$ui.rest.what === 'mana' && here.$ui.rest.mult === 2 && low(S0, 'Main Library', '10:00').$ui.rest === null, '$ui.rest names the rate here for <now> and the map');
const exam = at(initState(), 56, '10:00', 'Meditation Rooms');   // M3 W1 Mon: exam week
ok(exam.$ui.rest.mult === 1.75 && /exam/.test(exam.$ui.rest.why), 'exam week: the Meditation Rooms are full (x1.75)');
const sunday = at(initState(), 13, '10:00', 'The Cathedral');
ok(sunday.$ui.rest.mult === 1.75, 'the Sunday service: x1.75');
const night = at(initState(), 12, '22:00', 'Forest Clearing');
ok(night.$ui.rest.mult === 2, 'the Forest Clearing after dark: x2');

console.log('Practice and shifts');
const P = S => (S.$ui.practice || []).map(a => a.action + (a.locked ? ':' + a.locked : ''));
ok(P(at(S0, 12, '10:00', 'Boathouse and Lake')).some(x => x.startsWith('Row on the lake')), 'rowing on the lake');
ok(P(at(S0, 12, '10:00', 'Grassy Field and Hills')).some(x => x.startsWith('Run the hills')) && P(at(S0, 12, '10:00', 'Grassy Field and Hills')).some(x => x.startsWith('Read the sky')), 'running the hills, reading the sky');
ok(P(at(S0, 12, '10:00', 'Willow Island')).includes('Sit under the willow') && P(at(S0, 12, '21:00', 'Willow Island')).some(x => /Sit under the willow:daylight/.test(x)), 'the willow by daylight only');
const sp = P(at(S0, 12, '10:00', 'Spirit Path'));
ok(sp.includes('Watch the spirits') && sp.some(x => /Walk with your spirit:your pact partner/.test(x)), 'anyone watches the spirits; walking one needs a pact partner');
const bell0 = at(S0, 12, '10:00', 'Bell Tower'), bell = at(bell0, 12, '11:00', 'Bell Tower', [{ op: 'insert', path: '/Practice/-', value: { Action: "Bell-keeper's shift (paid)" } }]);
ok(bell.Player.Wallet.Points - bell0.Player.Wallet.Points === 30 && bell.Player.Wallet.Transactions.some(t => /\+30 bell-keeper's shift/.test(t)), "the bell-keeper's shift pays 30");

console.log('A first pact in play');
const occult = applyPatch(S0, [{ op: 'replace', path: '/$eng/auth', value: 'builder' }, { op: 'replace', path: '/$ui/built', value: true },
  { op: 'replace', path: '/Magic/_Affinity', value: { Types: ['Occult'], Dominant: 'Occult', Specialties: ['Spirit Pact'], Preset: '' } }]);
const path0 = at(occult, 12, '10:00', 'Spirit Path');
const pact = (S, loc, v) => at(S, 12, '11:00', loc, [{ op: 'insert', path: '/Magic/Pacts/Moss', value: Object.assign({ Spirit: 'Moss', Kind: 'Spirit', Tier: 'Lesser', Presence: 'summoned', Terms: 'keeps watch and fetches small things' }, v || {}) }]);
const made = pact(path0, 'Spirit Path');
ok(made.Magic.Pacts.Moss && made.Magic._Techniques['Summon Moss'] && made.Magic._Techniques['Summon Moss'].Trigger === 3 && made.$eng.pactPlay === 'Moss', 'an Occult student bonds a lesser spirit at the Spirit Path; the engine writes Summon');
ok(!pact(path0, 'Spirit Path', { Tier: 'Basic' }).Magic.Pacts.Moss && !pact(at(occult, 12, '10:00', 'Main Library'), 'Main Library').Magic.Pacts.Moss, 'not a Basic spirit, not away from the Spirit Path');
ok(!pact(at(S0, 12, '10:00', 'Spirit Path'), 'Spirit Path').Magic.Pacts.Moss, 'not without Occult magic');
const second = at(made, 12, '12:00', 'Spirit Path', [{ op: 'insert', path: '/Magic/Pacts/Fern', value: { Spirit: 'Fern', Kind: 'Spirit', Tier: 'Lesser' } }]);
ok(!second.Magic.Pacts.Fern && second.Magic.Pacts.Moss && second._Log.some(x => /already made a pact in play/.test(x)), 'one pact in play, ever');
ok(!P(made).some(x => /Walk with your spirit:/.test(x)) || P(at(made, 12, '12:00', 'Spirit Path', [{ op: 'replace', path: '/Magic/Pacts/Moss/Summoned', value: true }])).includes('Walk with your spirit'), 'with Moss summoned, the walk is open');

console.log('The Old Hut custom');
const bond = { Rank: 1, Progress: 0, Trust: 50, Tension: 0, Title: '', Romance: false, Known_facts: [], Milestones: [], Last_seen: '', _Event_ready: false, $Known_old: [] };
const talk = loc => { const A = at(S0, 12, '10:00', loc, [{ op: 'replace', path: '/Bonds/Saffi', value: bond }, { op: 'replace', path: '/Scene/Present', value: { Saffi: { Note: 'here' } } }]);
  return [A, at(A, 12, '11:00', loc, [{ op: 'insert', path: '/Interactions/-', value: { With: 'Saffi', Kind: 'confide', Note: 'told her the truth' } }])]; };
const [h0, hut] = talk('Old Hut'), [f0, field] = talk('Grassy Field and Hills');
ok(hut.Bonds.Saffi.Trust - h0.Bonds.Saffi.Trust === field.Bonds.Saffi.Trust - f0.Bonds.Saffi.Trust + 1 && hut._Log.some(x => /Old Hut, Trust \+1/.test(x)), 'a confidence in the Old Hut: Trust +1 more');
const again = at(hut, 13, '11:00', 'Old Hut', [{ op: 'insert', path: '/Interactions/-', value: { With: 'Saffi', Kind: 'confide', Note: 'again' } }]);
const hutLines = S => S._Log.filter(x => /Old Hut, Trust \+1/.test(x)).length;
ok(hutLines(again) === hutLines(hut), 'once a month for each person');

console.log('Letters home');
const mt = at(S0, 12, '10:00', 'Mail Tower');
const sent = at(mt, 12, '10:20', 'Mail Tower', [{ op: 'insert', path: '/Letters/To Mother', value: { From: '{{user}}', To: 'Mother', Gist: 'All well; send biscuits', Status: 'sent' } }]);
ok(sent.$eng.home && sent.$eng.home.month === '1-1' && sent.$eng.home.from === 'Mother', 'a letter home from the Mail Tower is on its way');
const early = at(sent, 16, '10:00', 'Main Library'), later = at(early, 20, '10:00', 'Main Library');
ok(!early.Letters['Reply from Mother'] && later.Letters['Reply from Mother'] && later.Letters['Reply from Mother'].Status === 'waiting', 'the reply arrives about a week later');
const readIt = at(later, 20, '10:30', 'Mail Tower', [{ op: 'replace', path: '/Letters/Reply from Mother/Status', value: 'read' }]), H = readIt.$eng.home;
const coin = readIt.Player.Wallet.Coin - later.Player.Wallet.Coin, item = H.parcel && H.parcel.item && readIt.Inventory[H.parcel.item[0]];
ok(H.given && (H.parcel ? (H.parcel.coin ? coin === H.parcel.coin : !!item) : coin === 0), `read, its parcel is handed over (${JSON.stringify(H.parcel)})`);
const elsewhere = at(at(S0, 12, '10:00', 'Main Library'), 12, '10:20', 'Main Library', [{ op: 'insert', path: '/Letters/To Dad', value: { From: '{{user}}', To: 'Dad', Gist: 'hi', Status: 'sent' } }]);
ok(!(elsewhere.$eng.home || {}).month && elsewhere.$eng.mail.post.includes('To Dad') && elsewhere._Log.some(x => /next at the Mail Tower/.test(x)), 'written away from the Mail Tower: it waits to be posted (1.95.0)');

console.log('Talk under running water');
const AMB = JSON.parse(read('data/ambience.json'));
ok(AMB.lore_places['bathhouse and washrooms'] === 60 && AMB.lore_places.laundry === 60 && AMB.cats.spirits.places.includes('spirit path') && AMB.cats.stillness.places.includes('meditation rooms'), 'bathhouse and laundry 60%; the spirits and the stillness have their own ambience');

console.log('Map card');
global.window = { parent: { document: {} } };
const U = new Function(read('src/scripts/ui.js') + '\nreturn { locCard };')();
ok(/<dt>Restores<\/dt><dd>Mana ×2 while resting now/.test(U.locCard('meditation_rooms', here, 'meditation_rooms', { x: 50, y: 50 })), 'here: the card gives the rate now');
ok(/<dt>Restores<\/dt><dd>Stamina ×1.75 while resting in the ward/.test(U.locCard('medical_centre', here, 'meditation_rooms', { x: 50, y: 50 })) && !/Restores/.test(U.locCard('spirit_path', here, 'meditation_rooms', { x: 50, y: 50 })), 'elsewhere: the summary; the Spirit Path restores nothing');
