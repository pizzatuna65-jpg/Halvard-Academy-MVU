// 1.3.2 (owner): a pact partner has its own abilities, like a creature's moves. Each ability is its own technique
// ("<partner>: <ability>") with its own cost; Summon only pays for the partner being there. Older pacts without abilities keep
// the one generic trigger cost. The engine charges an ability only while the partner is with {{user}}.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { TEMPLATES, blankDraft, draftFromState, buildOps, validate, techRecord, blankPact, blankMove, moveCost, moveCap, bPacts, bTechs, bReview };')();
console.log('Pact abilities 1.3.2');
const clone = o => JSON.parse(JSON.stringify(o));
const S0 = initState();
const spirit = () => { const d = Object.assign(U.blankDraft(), U.TEMPLATES.find(t => t.id === 'spirit').make()); d.name = 'Aria Vale'; return d; };

// ---- techniques from abilities
let d = spirit(), T = U.techRecord(d);
ok(T['Summon Ember'].Cost_mode === 'sustained' && T['Summon Ember'].Trigger === 0 && /abilities: Flame Lash, Scent of Danger, Hearth Glow/.test(T['Summon Ember'].Effect), 'Summon only pays for Ember being there and names her abilities');
ok(T['Ember: Flame Lash'].Cost_mode === 'per_use' && T['Ember: Flame Lash'].Activation === 6 && T['Ember: Flame Lash'].Notes === '[pact] Ember', 'each ability is its own technique with its own cost');
ok(T['Ember: Hearth Glow'].Cost_mode === 'sustained' && T['Ember: Hearth Glow'].Upkeep_per_min > 0 && T['Ember: Scent of Danger'].Activation === 3, 'a lasting ability has upkeep; a light one costs less');
ok(!T['Ember: Flame Lash'].Forbidden && Object.keys(T).filter(k => /^Ember: /.test(k)).length === 3, 'a spirit pact stays lawful; three abilities');
ok(U.validate(d, S0).blocking === 0 && !U.validate(d, S0).Wn.some(w => /abilities/.test(w)), 'the template is valid (3 abilities fit a Basic spirit)');

// ---- costs follow strength and tier
const p = d.pacts[0];
ok(U.moveCost(p, { scale: 'Standard', mode: 'per_use' }).act === 6 && U.moveCost(p, { scale: 'Heavy', mode: 'per_use' }).act === 12 && U.moveCost(p, { scale: 'Ultimate', mode: 'per_use' }).act === 21, 'Basic spirit: Standard 6, Heavy 12, Ultimate 21');
ok(U.moveCost({ kind: 'Spirit', tier: 'Greater' }, { scale: 'Standard', mode: 'per_use' }).act === 12 && U.moveCost({ kind: 'Spirit', tier: 'Spirit Lord' }, { scale: 'Light', mode: 'per_use' }).act === 12.5, 'a higher tier costs more');
ok(U.moveCap('Spirit', 'Lesser') === 2 && U.moveCap('Spirit', 'Basic') === 3 && U.moveCap('Spirit', 'Greater') === 4 && U.moveCap('Spirit', 'Spirit Lord') === 6 && U.moveCap('Animal', 'Animal') === 2, 'usual number of abilities per tier');
const nm = U.blankMove(p);
ok(nm.act === 6 && nm.mode === 'per_use' && nm.open, 'a new ability starts at Standard for the tier, open for editing');

// ---- validation
let e = spirit(); e.pacts[0].moves.push(Object.assign(U.blankMove(e.pacts[0]), { name: 'Flame Lash', effect: '' }));
let V = U.validate(e, S0);
ok(V.E.pacts.some(x => /two abilities are called "Flame Lash"/.test(x)) && V.E.pacts.some(x => /say what it does/.test(x)), 'duplicate names and missing descriptions block registering');
ok(V.Wn.some(x => /4 abilities; a Basic partner usually has at most 3/.test(x)), 'more abilities than usual for the tier is a warning, not an error');
e = spirit(); e.pacts[0].moves.push(Object.assign(U.blankMove(e.pacts[0]), { name: '', effect: 'x' }));
ok(U.validate(e, S0).E.pacts.some(x => /ability 4 needs a name/.test(x)), 'an ability needs a name');
e = spirit(); e.pacts[0].moves = [];
ok(U.validate(e, S0).blocking === 0 && U.validate(e, S0).Wn.some(x => /no abilities listed yet/.test(x)), 'a pact without abilities still registers, with a nudge to list them');
ok(U.techRecord(e)['Summon Ember'].Cost_mode === 'hybrid' && U.techRecord(e)['Summon Ember'].Trigger === 6, 'without abilities: the old generic trigger cost');
e = spirit(); e.techs.push({ name: 'Ember: Flame Lash', type: 'Occult', subtype: 'Illusion', effect: 'x', cannot: '', mode: 'per_use', scale: '', act: 3, up: 0, trig: 0, hidden: false, notes: '' });
ok(U.validate(e, S0).E.techs.some(x => /already uses this name/.test(x)), 'an ability name cannot collide with an ordinary technique');
const g = spirit(); g.pacts[0].tier = 'Greater'; g.pacts[0].ch = 15;
ok(/one of Ember's abilities \(Flame Lash, Scent of Danger, Hearth Glow\)/.test(U.techRecord(g)['Channel Ember'].Effect), 'Channel names the abilities it can borrow');

// ---- save, load, amend
let S = applyPatch(S0, U.buildOps(d, S0), { mvu: true });
ok(S.Magic._Techniques['Ember: Flame Lash'] && S.Magic._Techniques['Ember: Hearth Glow'], 'registered: the abilities are in the technique list');
let d2 = U.draftFromState(S);
ok(d2.pacts[0].moves.length === 3 && d2.pacts[0].moves[0].name === 'Flame Lash' && d2.pacts[0].moves[0].scale === 'Standard' && d2.pacts[0].moves[2].mode === 'sustained', 'loading brings the abilities back (with their strength)');
ok(U.buildOps(d2, S).length === 2 && d2.techs.length === 1, 'round trip: no spurious changes, abilities are not ordinary techniques');
d2.pacts[0].moves.splice(1, 1); d2.pacts[0].moves[0].act = 7;
const S2 = applyPatch(S, U.buildOps(d2, S), { mvu: true });
ok(!S2.Magic._Techniques['Ember: Scent of Danger'] && S2.Magic._Techniques['Ember: Flame Lash'].Activation === 7, 'amend: remove an ability, change a cost');
// a save from before 1.3.2: Summon hybrid, no abilities
const old = clone(S0), oldT = { 'Summon Ember': { Type: 'Occult', Subtype: 'Spirit Pact', Effect: 'x', Cannot_do: '', Cost_mode: 'hybrid', Activation: 10, Upkeep_per_min: 0.3, Trigger: 6, Hidden: false, Forbidden: false, Notes: '[pact] Ember' } };
old.Magic._Techniques = oldT; old.$ui.built = true; old.Magic.Pacts = { Ember: { Spirit: 'Ember', Kind: 'Spirit', Tier: 'Basic', Presence: 'summoned', Summoned: false, Terms: '', Note: '' } };
const od = U.draftFromState(old);
ok(od.pacts[0].moves.length === 0 && od.pacts[0].trig === 6 && U.techRecord(od)['Summon Ember'].Cost_mode === 'hybrid', 'an older pact loads without abilities and keeps its trigger cost');

// ---- engine: an ability is charged only while the partner is here
const cast = (X, ops) => applyPatch(X, [{ op: 'replace', path: '/World/Time', value: '10:00' }, ...ops]);
const CA = n => ({ op: 'insert', path: '/Magic/Casts/-', value: { Technique: n, Times: 1 } });
const m0 = S.Player.Vitals.Mana;
let A = cast(S, [CA('Ember: Flame Lash')]);
ok(A.Player.Vitals.Mana === m0 && A._Log.some(l => /Ember is not summoned/.test(l)), 'Ember not summoned: nothing happens, nothing is charged (logged)');
A = cast(S, [{ op: 'insert', path: '/Magic/Active/Ember', value: { Technique: 'Summon Ember', Note: '' } }, { op: 'replace', path: '/Magic/Pacts/Ember/Summoned', value: true }, CA('Ember: Flame Lash')]);
ok(A.Player.Vitals.Mana === m0 - 10 - 6, `summoned: the summon (10) and the ability (6) are charged (mana ${A.Player.Vitals.Mana})`);
const Tm = clone(S); Tm.Magic.Pacts.Ember.Presence = 'terms';
ok(cast(Tm, [CA('Ember: Flame Lash')]).Player.Vitals.Mana === m0 - 6, 'a partner that lives by its terms can use its abilities unsummoned');

// ---- the Builder pages
const pp = U.bPacts(d, S0, U.validate(d, S0));
ok(/data-act="addmove" data-i="0"/.test(pp) && /Abilities <span class="sub">\(3 of usually 3 for Basic\)/.test(pp) && /Flame Lash/.test(pp), 'Pacts page: the abilities list with "Add ability"');
const tp = U.bTechs(d, S0, U.validate(d, S0));
ok(/Ember: Flame Lash/.test(tp) && /<span class="pill">ability<\/span>/.test(tp) && /Edit Ember's abilities/.test(tp), 'Techniques page: each ability listed under its partner');
ok(/Ember \(Spirit, Basic\): Flame Lash, Scent of Danger, Hearth Glow/.test(U.bReview(d, S0, U.validate(d, S0))), 'Review lists the abilities');
