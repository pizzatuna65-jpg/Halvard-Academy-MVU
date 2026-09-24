// Student Builder logic: templates -> validate -> buildOps -> MVU-style patch -> schema + engine -> round trip.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
const src = fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8');
const U = new Function(src + '\nreturn { TEMPLATES, blankDraft, draftFromState, buildOps, validate, techRecord, manaOf, costLine, subInfo, SUBTYPES, blankPact, blankTech, PACT_KINDS, trueMagicText, firstSpec, techForm };')();
console.log('Student Builder logic');
ok(U.subInfo('Mystic', 'Unmaking').forbidden === true && U.subInfo('Elemental', 'Ice').forbidden === false, 'forbidden subtype detection from lore');
const S0 = initState();
const v0 = U.validate(U.blankDraft(), S0);
ok(v0.blocking >= 2, `blank draft is blocked (${v0.blocking} issues)`);
for (const t of U.TEMPLATES) {
  const d = Object.assign(U.blankDraft(), t.make()); d.name = 'Aria Vale';
  const V = U.validate(d, S0);
  ok(V.blocking === 0, `${t.id}: valid (warnings: ${V.Wn.length ? V.Wn.join(' | ') : 'none'})`);
  const ops = U.buildOps(d, S0);
  // same wire format as commit(): one JSON op per line inside <JSONPatch>
  const text = `<JSONPatch>\n[\n${ops.map(o => JSON.stringify(o)).join(',\n')}\n]\n</JSONPatch>`;
  const parsed = JSON.parse(text.match(/<JSONPatch>([\s\S]*?)<\/JSONPatch>/)[1]);
  const S = applyPatch(S0, parsed, { mvu: true });   // 1.0.3: as the MVU zod helper sees it ("_" paths dropped)
  ok(S.$ui.built && S.$eng.auth === '' && S.Player.Profile.Name === 'Aria Vale', `${t.id}: registered`);
  ok(S.Player.Vitals.Mana_max === U.manaOf(d) && S.Player.Vitals.Mana === U.manaOf(d), `${t.id}: mana ${S.Player.Vitals.Mana}/${S.Player.Vitals.Mana_max}`);
  ok(_.isEqual(Object.keys(S.Magic._Techniques).sort(), Object.keys(U.techRecord(d)).sort()), `${t.id}: techniques ${Object.keys(S.Magic._Techniques).join(', ')}`);
  if (d.hidden.on) ok(S.Hidden._True_magic && S.Hidden.Cover_magic === 'Telekinesis (Mystic)' && S.$ui.unlocks.includes('hidden'), `${t.id}: hidden magic + unlock`);
  if (d.pacts.length) ok(S.Magic.Pacts.Ember.Tier === 'Basic' && S.Magic._Techniques['Summon Ember'].Cost_mode === 'hybrid' && !S.Magic._Techniques['Channel Ember'], `${t.id}: pact → Summon technique (no Channel for Basic)`);
  const d2 = U.draftFromState(S), ops2 = U.buildOps(d2, S);
  ok(ops2.length === 2, `${t.id}: round trip has no spurious changes (${ops2.length - 2} extra: ${ops2.slice(0, -2).map(o => o.path).join(', ')})`);
  // amend: add a technique, bump nothing else
  d2.techs.push({ name: 'Spark/Flash.', type: d2.dominant, subtype: '', effect: 'test', cannot: '', mode: 'per_use', scale: '', act: 3, up: 0, trig: 0, hidden: false, notes: '' });
  const S2 = applyPatch(S, U.buildOps(d2, S), { mvu: true });
  ok(S2.Magic._Techniques['Spark-Flash-'] && S2.Player.Vitals.Mana === S.Player.Vitals.Mana, `${t.id}: amend adds a technique (key sanitised) without refilling mana`);
}
// Greater pact gets Channel; Stone mismatch warning
const g = Object.assign(U.blankDraft(), U.TEMPLATES[2].make()); g.name = 'X'; g.pacts[0].tier = 'Greater'; g.pacts[0].ch = 15;
ok(!!U.techRecord(g)['Channel Ember'], 'Greater pact adds Channel technique');
const h = Object.assign(U.blankDraft(), U.TEMPLATES[3].make()); h.name = 'X'; h.hidden.cover_type = 'Elemental';
ok(U.validate(h, S0).Wn.some(w => /Arbiter Stone/.test(w)), 'warns when cover type ≠ dominant (Stone would contradict the cover)');
const f = Object.assign(U.blankDraft(), U.TEMPLATES[3].make()); f.name = 'X'; f.hidden.on = false; f.techs.push(Object.assign(U.blankTech(), { name: 'Unmake', type: 'Mystic', subtype: 'Unmaking', effect: 'x' }));
ok(U.validate(f, S0).Wn.some(w => /forbidden art/.test(w)), 'warns about forbidden art used openly');
ok(/about 8 uses/.test(U.costLine({ mode: 'per_use', act: 12 }, 100)) && /lasts about/.test(U.costLine({ mode: 'sustained', act: 10, up: 0.3 }, 100)), 'cost helper text');

// ---- 1.2.0 (owner playtest) ----
console.log('Student Builder 1.2.0');
{
  const d = Object.assign(U.blankDraft(), U.TEMPLATES[0].make()); d.name = 'Aria Vale';
  d.mana = 200; d.pronouns = 'xe/xem'; d.pronOther = true; d.personality = 'Stubborn.'; d.bday = { m: 1, w: 1, d: 'Tue' };
  d.custom.push({ name: 'Glass shaping', type: 'Elemental', forbidden: false }, { name: 'Frostbinding', type: 'Elemental', forbidden: true });
  d.specs.push('Glass shaping', 'Frostbinding');
  d.techs.push(Object.assign(U.blankTech(), { name: 'Glass Knife', type: 'Elemental', subtype: 'Glass shaping', effect: 'x' }),
    Object.assign(U.blankTech(), { name: 'Bind', type: 'Elemental', subtype: 'Frostbinding', effect: 'x' }),
    Object.assign(U.blankTech(), { name: 'Odd', type: 'Elemental', subtype: 'Something new', effect: 'x', forb: 'yes' }));
  const S = applyPatch(S0, U.buildOps(d, S0), { mvu: true });
  const T = S.Magic._Techniques, A = S.Magic._Affinity;
  ok(S.Player.Vitals.Mana_max === 200 && A.Preset === '', 'mana capacity comes from the slider value, no preset label');
  ok(S.Player.Profile.Pronouns === 'xe/xem' && S.Player.Profile.Personality === 'Stubborn.' && S.Player.Profile.Birthday === 'M1 W1 Tue', 'pronouns, personality and birthday saved');
  ok(S.Player.Profile.Combat_role === '', 'combat role is left for the first Combat class');
  ok(A.Custom['Frostbinding'].Forbidden === true && A.Custom['Glass shaping'].Forbidden === false, 'custom subtypes stored with their forbidden flag');
  ok(T['Bind'].Forbidden && !T['Glass Knife'].Forbidden && T['Odd'].Forbidden, 'custom / unknown subtypes carry the forbidden answer into the technique');
  const d2 = U.draftFromState(S);
  ok(U.buildOps(d2, S).length === 2 && d2.pronOther && d2.bday.m === 1, 'round trip of the 1.2.0 fields has no spurious changes');
  // the birthday reaches the day's events
  const S1 = applyPatch(S, [{ op: 'replace', path: '/World/Day', value: 'Tue' }, { op: 'replace', path: '/World/Time', value: '08:00' }]);
  ok(/Aria Vale's birthday/.test(S1.World._Event_today), `birthday in _Event_today on the day (${S1.World._Event_today})`);
  const S1b = applyPatch(S1, [{ op: 'replace', path: '/World/Day', value: 'Wed' }]);
  ok(!/birthday/.test(S1b.World._Event_today), 'and not the next day');
  // self-heal: the magic comes back empty while built -> the Builder record restores it
  const L = _.cloneDeep(S); L.Magic._Techniques = {}; L.Magic._Affinity = { Types: [], Dominant: '', Specialties: [], Preset: '', Custom: {} }; L.Player.Vitals.Mana_max = 100;
  const H = applyPatch(L, [{ op: 'replace', path: '/World/Time', value: '07:45' }]);
  ok(Object.keys(H.Magic._Techniques).length === Object.keys(T).length && H.Magic._Affinity.Dominant === 'Elemental' && H.Player.Vitals.Mana_max === 200, 'lost Builder fields restored from $ui.file');
  const G = applyPatch(S, [{ op: 'replace', path: '/$ui/file', value: null }]);
  ok(G.$ui.file && G.$ui.file.Mana_max === 200, 'the AI cannot change the Builder record');
}
{
  // pacts: kind first, forbidden kinds, apply button
  const d = Object.assign(U.blankDraft(), U.TEMPLATES[2].make()); d.name = 'X';
  const p = Object.assign(U.blankPact(), { kind: 'Demon', name: 'Vex', tier: 'Greater', ch: 15 });
  d.pacts.push(p);
  ok(U.validate(d, S0).E.pacts.some(e => /Apply pact/.test(e)), 'an unapplied pact blocks registering');
  ok(!U.techRecord(d)['Summon Vex'], 'an unapplied pact adds no technique');
  p.applied = true; p.presence = 'terms';
  const T = U.techRecord(d);
  ok(T['Summon Vex'].Forbidden && T['Channel Vex'] && !T['Summon Ember'].Forbidden, 'a demon pact is forbidden Pacting (spirit pact stays lawful); Greater demon can channel');
  ok(U.validate(d, S0).Wn.some(w => /forbidden pact/.test(w)), 'warns about a forbidden pact kept openly');
  const S = applyPatch(S0, U.buildOps(d, S0), { mvu: true });
  ok(S.Magic.Pacts.Vex.Kind === 'Demon' && S.Magic.Pacts.Vex.Presence === 'terms' && S.Magic.Pacts.Ember.Kind === 'Spirit', 'pact kind and presence saved');
  const d2 = U.draftFromState(S);
  ok(U.buildOps(d2, S).length === 2 && d2.pacts.every(x => x.applied), 'pacts round trip');
  const b = Object.assign(U.blankPact(), { kind: '', name: 'Y' }); const d3 = Object.assign(U.blankDraft(), U.TEMPLATES[0].make()); d3.name = 'X'; d3.pacts.push(b);
  ok(U.validate(d3, S0).E.pacts.some(e => /choose what the pact is made with/.test(e)), 'a pact needs its kind first');
}
{
  // hidden magic is filled in like a technique
  const d = Object.assign(U.blankDraft(), U.TEMPLATES[3].make()); d.name = 'X';
  const S = applyPatch(S0, U.buildOps(d, S0), { mvu: true });
  ok(S.Magic._Techniques['Unmake'] && S.Magic._Techniques['Unmake'].Hidden && S.Magic._Techniques['Unmake'].Forbidden && /^\[true\]/.test(S.Magic._Techniques['Unmake'].Notes), 'true magic saved as a hidden technique');
  ok(S.Hidden._True_magic === U.trueMagicText(d) && /^Unmake \(Mystic, Unmaking, forbidden\):/.test(S.Hidden._True_magic), `true magic summary: ${S.Hidden._True_magic.slice(0, 50)}…`);
  const K = applyPatch(S, [{ op: 'insert', path: '/Hidden/Known_by/-', value: 'Etnie' }]);
  const dk = U.draftFromState(K);
  ok(dk.hidden.truth.name === 'Unmake' && dk.techs.every(t => t.name !== 'Unmake') && U.buildOps(dk, K).length === 2, 'round trip keeps the true magic out of the normal list and leaves Known_by to the story');
  d.hidden.truth.name = '';
  ok(U.validate(d, S0).E.hidden.some(e => /True magic: needs a name/.test(e)), 'true magic needs a name like any technique');
}

// ---- 1.2.1 (owner playtest) ----
console.log('Student Builder 1.2.1');
{
  const d = Object.assign(U.blankDraft(), U.TEMPLATES[0].make()); d.name = 'X';
  ok(U.firstSpec(d, 'Elemental') === 'Ice' && U.firstSpec(d, 'Mystic') === '', 'a new technique starts with the student\'s specialty for its type');
  d.custom.push({ name: 'Glass shaping', type: 'Mystic', forbidden: false }); d.types.push('Mystic'); d.specs.push('Glass shaping');
  ok(U.firstSpec(d, 'Mystic') === 'Glass shaping', '...including a custom subtype of that type');
  const folded = U.techForm(d.techs[0], 'techs.0', d, 130, 'New technique');
  ok(/class="item tc"/.test(folded) && /data-act="techopen"/.test(folded) && !/data-k="techs\.0\.effect"/.test(folded), 'an applied technique folds into one row');
  d.techs[0].open = true;
  const open = U.techForm(d.techs[0], 'techs.0', d, 130, 'New technique');
  ok(/data-act="techapply"/.test(open) && /data-k="techs\.0\.effect"/.test(open) && /<option value="Ice">your specialty/.test(open), 'an open technique has Apply technique, and its subtype list starts with the student\'s specialties');
  ok(U.buildOps(U.draftFromState(applyPatch(S0, U.buildOps(d, S0), { mvu: true })), applyPatch(S0, U.buildOps(d, S0), { mvu: true })).length === 2, 'folding is UI only (no change to the saved file)');
}
