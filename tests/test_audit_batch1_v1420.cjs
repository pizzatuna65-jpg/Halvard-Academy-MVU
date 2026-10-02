// 1.42.0 (audit/AUDIT_2026-10-03_3_batch_perbaikan.md, Batch 1): every bug from audit part 1 (1.1-1.10 and the "Rendah" table).
// One regression check per bug.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const W = (o, x = [], opts) => [Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x), opts];
const go = (S, o, x, opts) => applyPatch(S, ...W(o, x, opts));
const present = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const S0 = go(initState({ etnie: true }), { Location: 'Fire Dormitory', Time: '09:00' });

console.log('1.1 dialogue-colour regexes');
{
  const R = JSON.parse(rd('src/regex/index.json'));
  ok(R.every(r => ![...String(r.findRegex)].some(ch => ch.charCodeAt(0) < 32)), 'no findRegex holds a control character (a JSON "\\b" is a backspace)');
  for (const r of R.filter(x => /dialogue colours: (stray tags|strip tags)/.test(x.scriptName))) {
    const m = r.findRegex.match(/^\/(.*)\/(\w*)$/s), rx = new RegExp(m[1], m[2]);
    ok('<say:Irene>"Hi."</say>'.replace(rx, '') === '"Hi."', `${r.scriptName.replace(/^.*: /, '')}: removes <say:Irene> and </say>`);
  }
}

console.log('1.3 consumables: one item-name key');
{
  const bag = go(S0, {}, [{ op: 'replace', path: '/Inventory', value: { 'Quick-dry powder': { Qty: 2, Kind: 'other' } } },
    { op: 'replace', path: '/Player/Conditions/Soaked', value: { Effect: 'wet', Since: '' } }]);
  const M = go(bag, { Time: '09:10' }, [{ op: 'insert', path: '/Consumables/-', value: 'a Quick-dry powder' }]);
  ok(!M.Player.Conditions.Soaked && M.Inventory['Quick-dry powder'].Qty === 1, `"a Quick-dry powder" clears Soaked and lowers the Bag (Qty ${M.Inventory['Quick-dry powder'].Qty})`);
}

console.log('1.5 "not itemised": lines counted as a multiset');
{
  let P = go(S0, {}, [{ op: 'replace', path: '/Player/Wallet/Points', value: 100 }]);
  const tea = [{ op: 'delta', path: '/Player/Wallet/Points', value: -3 }, { op: 'insert', path: '/Player/Wallet/Transactions/-', value: '-3 tea at the Snug' }];
  const ni = X => X.Player.Wallet.Transactions.filter(l => /not itemised/.test(l)).length, n0 = ni(P);
  P = go(P, { Time: '10:00' }, tea);
  P = go(P, { Time: '15:00' }, tea);
  ok(P.Player.Wallet.Points === 94 && ni(P) === n0 && P.Player.Wallet.Transactions.filter(l => l === '-3 tea at the Snug').length === 2, 'the same tea line twice: no false "(not itemised)"');
}

console.log('1.9 core dependencies pinned');
ok(/MagVarUpdate@[0-9a-f]{40}\//.test(rd('src/scripts/mvu_loader.js').split('\n')[0]), 'MVU bundle pinned to a commit');
ok(/tavern_resource@[0-9a-f]{40}\//.test(rd('src/scripts/schema.js').split('\n')[0]), 'mvu_zod pinned to a commit');

console.log('1.10 a full Bag says what it left behind');
{
  const I = Object.fromEntries(Array.from({ length: 45 }, (_, i) => [`Pebble ${i + 1}`, { Qty: 1, Kind: 'other' }]));
  const M = go(S0, { Time: '09:10' }, [{ op: 'replace', path: '/Inventory', value: I }]);
  ok(Object.keys(M.Inventory).length === 40 && M.$ui.toasts.some(t => /Bag full/.test(t)) && M._Log.some(l => /Pebble 1, .*left behind/.test(l)), '45 items: 40 kept, a toast and a log line name the rest');
}

// ---- gameplay rules (behaviour changes, CHANGELOG 1.42.0) ----
const E = new Function(rd('src/scripts/engine.js') + '\nreturn { awayIn, birthdayParty };')();
const SAVE = JSON.parse(rd('tests/fixtures/saves/save_1.41.0.json'));   // Viridian, M2 W2 Sun 22:00, Etnie Rank 4
const sv = () => applyPatch(SAVE, []);

console.log('1.2 one "away" test');
{
  const at = (loc, extra = {}) => ({ Trip: { Active: false }, World: { Year: 1, Month: 2, Week: 2, Day: 'Mon', Time: '10:00', Location: loc, ...extra } });
  ok(!E.awayIn(at('Main Library')) && E.awayIn({ ...at('Main Library'), Trip: { Active: true } }), 'Trip.Active counts');
  ok(E.awayIn(at('Sunreach Bay — Coral Beach', { Month: 11, Week: 2, Day: 'Sun' })), 'an outside area counts without Trip.Active');
  ok(!E.awayIn(at('Grassy Field and Hills', { Month: 4, Week: 2, Day: 'Tue', Time: '21:00' })), 'back on campus on the Crowning Day evening: not away');
  let T = go(sv(), { Day: 'Mon', Week: 3, Time: '06:00', Location: 'a roadside inn on the way north' }, [{ op: 'replace', path: '/Trip', value: { Active: true, Destination: 'the north', Companions: [], Note: '' } }]);
  T = go(T, { Time: '18:00', Location: 'library' });
  ok(!T.Trip.Active && T.World.Location === 'Main Library' && T._Log.some(l => /Trip.Active was still true/.test(l)), `a Trip left Active after coming home ends, and the place is the map's again (${T.World.Location})`);
  T = go(sv(), { Day: 'Mon', Week: 3, Time: '06:00', Location: 'Main Gate' }, [{ op: 'replace', path: '/Trip', value: { Active: true, Destination: 'the north', Companions: [], Note: '' } }]);
  T = go(T, { Time: '06:20', Location: 'Main Gate' });
  ok(T.Trip.Active, 'still waiting at the gate on the way out: the Trip stays Active');
  // the 1.41.0 audit case: a birthday on the Academy Trip (M11 W2 Sun), Etnie at Rank 7, no Trip.Active
  const P = _.cloneDeep(SAVE);
  Object.assign(P.World, { Month: 11, Week: 2, Day: 'Sun', Time: '10:00', Location: 'Sunreach Bay — Coral Beach' });
  P.Player.Profile.Birthday = 'M11 W2 Sun'; P.Bonds.Etnie.Rank = 7; P.Bonds.Etnie.Tension = 0; P.Trip.Active = false;
  ok(E.birthdayParty(P) === null, 'no party booked at Halvard while {{user}} is in Sunreach');
  P.World.Location = 'Viridian Dormitory'; P.World.Month = 6;  P.Player.Profile.Birthday = 'M6 W2 Sun';
  ok(!!E.birthdayParty(P), 'the same birthday at home still gets its party');
}

console.log('1.4 a gift leaves the Bag');
{
  const B0 = go(sv(), { Day: 'Mon', Week: 3, Time: '17:00', Location: 'Canteen' }, [present(['Etnie']), { op: 'replace', path: '/Inventory/Honey cake', value: { Qty: 2, Kind: 'food', Note: '', Plan: '' } }]);
  const gift = { op: 'insert', path: '/Interactions/-', value: { With: 'Etnie', Kind: 'gift', Item: 'Honey cake', Gift: 'liked' } };
  let M = go(B0, { Time: '17:10' }, [gift]);
  ok(M.Inventory['Honey cake'].Qty === 1 && M._Log.some(l => /Honey cake: given as a gift/.test(l)), 'Kind gift with a Bag item lowers its Qty');
  M = go(B0, { Time: '17:10' }, [gift, { op: 'replace', path: '/Inventory/Honey cake/Qty', value: 1 }]);
  ok(M.Inventory['Honey cake'].Qty === 1, 'no second loss when the narrator lowered it too');
}

console.log('1.6 bond XP needs the NPC there');
{
  const B0 = go(sv(), { Day: 'Mon', Week: 3, Time: '17:00', Location: 'Canteen' }, [present([])]);
  const xp0 = B0.Bonds.Etnie.$xp;
  const M = go(B0, { Time: '18:00' }, [{ op: 'insert', path: '/Interactions/-', value: { With: 'Etnie', Kind: 'hangout', Note: 'wrote her a letter' } }]);
  ok(M.Bonds.Etnie.$xp === xp0 && M._Log.some(l => /Etnie was not in the scene: no bond XP for hangout/.test(l)), `an absent NPC: no XP, and the log says why (${xp0} -> ${M.Bonds.Etnie.$xp})`);
  const N = go(go(B0, { Time: '17:05' }, [present(['Etnie'])]), { Time: '18:00' }, [{ op: 'insert', path: '/Interactions/-', value: { With: 'Etnie', Kind: 'hangout', Note: 'tea' } }]);
  ok(N.Bonds.Etnie.$xp > xp0, 'present: XP as before');
}

console.log('1.7 a long update away from class is truancy');
{
  const B0 = go(sv(), { Day: 'Mon', Week: 3, Time: '07:30', Location: 'Boathouse' });
  const M = go(B0, { Time: '16:30', Location: 'Boathouse' });
  ok(M._Log.filter(l => /skipped .* Academy reputation -2/.test(l)).length >= 2, `07:30 -> 16:30 at the Boathouse skips the day's classes (${M._Log.filter(l => /skipped/.test(l)).length})`);
  const K = go(go(B0, { Time: '07:45', Location: 'Viridian Dormitory' }), { Day: 'Tue', Time: '07:30', Location: 'Viridian Dormitory' });
  ok(!K._Log.some(l => /skipped/.test(l)), 'a skip into the next day still follows the routine');
}

console.log('1.8 a Day written a day back');
{
  const B0 = go(sv(), { Day: 'Tue', Week: 3, Time: '09:00', Location: 'Canteen' });
  const M = go(B0, { Day: 'Mon', Time: '10:00' });
  ok(M.World.Week === 3 && M.World.Day === 'Tue' && M.World.Time === '09:00' && M._Log.some(l => /went back from Tue to Mon/.test(l)), `Tue -> "Mon": the clock is kept (${M.World.Month}/${M.World.Week} ${M.World.Day} ${M.World.Time})`);
  const N = go(go(B0, { Day: 'Sun', Time: '22:00' }), { Day: 'Mon', Time: '07:00' });
  ok(N.World.Week === 4 && N.World.Day === 'Mon', 'Sun -> Mon (week not turned) is still the next morning');
}

// ---- small, latent and dead code ----
global.window = { parent: { document: {} } };
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { DATA, PANELS, view, CAL, pProficiency };')();

console.log('weather in Sunreach (sleep, rare-weather toast)');
{
  const src = rd('src/scripts/engine.template.js');
  ok(/b0 = fAt \? forestWx\(seed, bd, bb\) : rAt \? srWx\(seed, bd, bb\)/.test(src) && /nb = fAt \? forestWx\(seed, nd, 2\) : rAt \? srWx\(seed, nd, 2\)/.test(src), "the rare-weather toast and the night's sleep read Sunreach's own weather");
}

console.log('a Council member\'s Saturday in the UI');
{
  const S = _.cloneDeep(SAVE); S.Player.Profile.Council = true;
  ok(/Student Council/.test(U.CAL.timetableFor({ Month: 2, Week: 3, Day: 'Sat' }, S)[1]) && /Study Hall/.test(U.CAL.timetableFor({ Month: 2, Week: 3, Day: 'Sat' }, SAVE)[1]), 'Sat P2: Student Council for a member, Study Hall for others (as the engine)');
}

console.log('dossier status by full name');
{
  const S = _.cloneDeep(SAVE); S.Campus_State.NPC_status = { 'Etnie Sylvaine': 'away visiting family' };
  U.view.arg = 'Etnie';
  ok(/Now: away visiting family/.test(U.PANELS.npc.render(S)), 'a status keyed by the full name shows in the dossier');
}

console.log('Battle panel prices a cast as the engine');
{
  const S = _.cloneDeep(SAVE);
  S.Magic._Techniques = { 'Mist Veil': { Type: 'Elemental', Subtype: 'Mist', Cost_mode: 'per_use', Activation: 10, Effect: '', Notes: '' },
    'Wisp: Glow': { Type: 'Occult', Subtype: 'Spirit Pact', Cost_mode: 'per_use', Activation: 2, Effect: '', Notes: '[pact] Wisp' } };
  S.Player.Vitals.Mana = 14; S.$ui.wx = { wind: 'gale' }; S.Player._Proficiency.Arcana = 5; S.$ui.on = { ...(S.$ui.on || {}), proficiency: true };
  const h = U.PANELS.battle.render(S);
  ok(/Mist Veil[\s\S]*?18 mana \(wind ×2\)[\s\S]*?disabled/.test(h), 'gale outdoors doubles a scattered cast after the Arcane scholar discount (10 -> 9 -> 18 > 14: disabled)');
  ok(/Wisp is not here[\s\S]*?disabled title="The partner is not here"/.test(h), "a pact partner's ability is disabled while the partner is away");
}

console.log('Fortune bonus text follows the engine cap');
{
  const S = _.cloneDeep(SAVE); S.Player._Proficiency.Knowledge = 4; S.$eng.study = { ...(S.$eng.study || {}), stand: { History: 4 } };
  ok(/Fortune \+10</.test(U.pProficiency(S).split('id="prof-Knowledge"')[1].split('</div>')[1] + '<'), 'Knowledge Rank 4 with an A in History: +10, not +12');
}

console.log('a parked feature keeps its values');
{
  let S = go(sv(), { Day: 'Mon', Week: 3, Time: '08:00' });
  const before = _.cloneDeep(S.Player._Proficiency);
  S = applyPatch(S, [{ op: 'replace', path: '/$ui/off', value: [...S.$ui.off, 'proficiency'] }, { op: 'replace', path: '/$eng/tool', value: 1 }]);
  S = go(S, { Time: '09:00' }); S = go(S, { Time: '10:00' });
  ok(_.isEqual(S.$ui.parked.proficiency['Player._Proficiency'], before), `Proficiency parked across two updates is not zeroed by the schema default (${JSON.stringify(S.$ui.parked.proficiency['Player._Proficiency'])})`);
}

console.log('caps and dead code');
{
  const sch = rd('src/scripts/schema.js');
  ok(/lore: StrList\(200\)/.test(sch) && /names: StrList\(200\)/.test(sch), '$ui.names and $ui.lore hold 200');
  const eng = rd('src/scripts/engine.template.js'), ppl = rd('src/ui/parts/10_people.js');
  ok(!/\bMON_SAT\b|const tensionBand\b|\bnormP\b|\bwxBlk\b/.test(eng) && !/const pips\b/.test(ppl), 'MON_SAT, tensionBand, normP, wxBlk and pips are gone');
}
