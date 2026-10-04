// 1.55.0 (audit/AUDIT_2026-10-04_1_beban_narator.md §6, batch 4; U1 stage 2): the remaining rule cards (Interactions, Trust/Tension,
// Imprints, the Old Hut, Training/Practice, Dorm, Combat_role, favours, Notices, the Vigil) and a tighter 502 core.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')), RC = JSON.parse(rd('data/rule_cards.json')).cards;
const go = (S, w, x = [], text = '') => applyPatch(S, Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x), { text });
const prof = v => ({ op: 'replace', path: '/Player/Profile', value: v });
const base = initState({ etnie: true });
const S0 = go(base, { Week: 2, Day: 'Tue', Location: 'Fire Dormitory', Time: '09:00' }, [prof({ ...base.Player.Profile, Dorm: 'Fire', Combat_role: 'Defense' })]);
const cards = S => S.$ui.now.rules;
const r502 = renderEntry(card, 502, S0);

console.log('The 502 core');
{
  ok(['interactions', 'trust_tension', 'imprints', 'old_hut', 'training', 'practice', 'dorm', 'combat_role', 'favour', 'notices', 'vigil'].every(id => RC[id] && !r502.includes(RC[id].text)), 'the stage-2 card texts left 502');
  ok(/^Interactions: each real interaction with a roster character/m.test(r502) && /^- Trust 0–100 \(how far they rely on \{\{user\}\}\) and Tension 0–100/m.test(r502), 'Interactions and Trust/Tension keep a core line');
  ok(!/Restful places:/.test(r502) && /Resting at a restful place recovers faster; <now> gives the rate/.test(r502), 'the restful-place list left; one clause stays');
  ok(!/Council meets Saturday 10:00-12:00/.test(r502) && /A Student Council member attends the Saturday 10:00-12:00 meeting/.test(renderEntry(card, 504, S0)), 'the Council meeting time is said once, in 504');
  ok(/On consuming The Vigil|on consuming The Vigil/.test(r502) && !/holds off sleep debt/.test(r502), 'the Vigil report stays; its effect is a card');
  const hi = _.cloneDeep(S0); hi.Bonds.Etnie.Rank = 9;
  ok(/Kind "vouch"/.test(renderEntry(card, 502, hi)) && !/Kind "vouch"/.test(r502), 'the rank add-ons of Interactions still follow the top rank in 502');
  ok(Object.values(RC).every(c => !/<%/.test(c.text)), 'card texts are plain text');
}

console.log('Triggers');
{
  ok(cards(S0).length === 0, `alone on an ordinary day, sorted and with a role: no card (${cards(S0)})`);
  const E = go(S0, { Time: '09:10' }, [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: '' } } }]);
  ok(['interactions', 'trust_tension', 'imprints'].every(id => cards(E).includes(id)), `a bonded character here: interactions, trust_tension, imprints (${cards(E)})`);
  const X = go(S0, { Time: '09:10' }, [{ op: 'replace', path: '/Scene/Present', value: { 'Mara Holt': { Note: '' } } }]);
  ok(cards(X).includes('interactions') && !cards(X).includes('trust_tension'), 'only an invented character: interactions, no trust scale');
  ok(cards(go(S0, { Time: '09:10' }, [], 'You promised you would come.')).includes('trust_tension'), 'a broken promise in the reply opens the trust scale (fail-open)');
  ok(cards(go(S0, { Location: 'Old Hut', Time: '09:30' })).includes('old_hut'), 'at the Old Hut: old_hut');
  ok(cards(go(S0, { Time: '09:10' }, [], 'You spend an hour on mana drills.')).includes('training'), 'training talk: training');
  const N = _.cloneDeep(base); N.Player.Profile.Dorm = ''; N.Player.Profile.Combat_role = '';
  const n = go(N, { Time: '09:10' });
  ok(cards(n).includes('dorm') && cards(n).includes('combat_role'), 'not sorted yet, no role: dorm and combat_role');
  const F = go(S0, { Time: '09:10' }, [{ op: 'insert', path: '/Commitments/Herbs for Etnie', value: { Desc: '', Due: 'tomorrow 12:00', With: 'Etnie', Where: '', Type: 'favour', Item: 'Moonmint' } }]);
  ok(cards(F).includes('favour'), 'a favour pending: favour');
  ok(cards(go(S0, { Location: 'Notice Board', Time: '09:20' })).includes('notices'), 'at the Notice Board: notices');
  const V = go(S0, { Time: '09:10' }, [{ op: 'replace', path: '/Inventory/The Vigil', value: { Qty: 1, Kind: 'drink', Note: '', Plan: '' } }]);
  ok(cards(V).includes('vigil'), 'The Vigil in the Bag: vigil');
  const off = _.cloneDeep(S0); off.$ui.off = [...(off.$ui.off || []), 'notices'];
  ok(!cards(go(off, { Location: 'Notice Board', Time: '09:20' })).includes('notices'), 'Notices off: no card');
}
