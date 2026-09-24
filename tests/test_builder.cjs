// Student Builder logic: templates -> validate -> buildOps -> MVU-style patch -> schema + engine -> round trip.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
const src = fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8');
const U = new Function(src + '\nreturn { TEMPLATES, blankDraft, draftFromState, buildOps, validate, techRecord, presetMana, costLine, subInfo, SUBTYPES };')();
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
  ok(S.Player.Vitals.Mana_max === U.presetMana(d) && S.Player.Vitals.Mana === U.presetMana(d), `${t.id}: mana ${S.Player.Vitals.Mana}/${S.Player.Vitals.Mana_max}`);
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
const f = Object.assign(U.blankDraft(), U.TEMPLATES[3].make()); f.name = 'X'; f.hidden.on = false;
ok(U.validate(f, S0).Wn.some(w => /forbidden art/.test(w)), 'warns about forbidden art used openly');
ok(/about 8 uses/.test(U.costLine({ mode: 'per_use', act: 12 }, 100)) && /lasts about/.test(U.costLine({ mode: 'sustained', act: 10, up: 0.3 }, 100)), 'cost helper text');
