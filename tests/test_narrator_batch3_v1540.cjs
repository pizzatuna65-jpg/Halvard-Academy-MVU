// 1.54.0 (audit/AUDIT_2026-10-04_1_beban_narator.md §6, batch 3; U1 stage 1): situational rule cards. 502 keeps a core line per topic;
// the full rule (data/rule_cards.json) is listed by the engine ($ui.now.rules) while it applies and printed by entry 511. The alcohol rule
// is a keyword entry (512) plus one CORE FACTS line.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')), E = card.data.character_book.entries;
const RC = JSON.parse(rd('data/rule_cards.json')).cards;
const go = (S, w, x = [], text = '') => applyPatch(S, Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x), { text });
const S0 = go(initState({ etnie: true }), { Location: 'Fire Dormitory', Time: '09:00' });
const t = (S, m) => go(S, { Time: m });
const cards = S => S.$ui.now.rules;
const r511 = S => renderEntry(card, 511, S);

console.log('Core lines in 502, full rules in cards');
{
  const r = renderEntry(card, 502, S0);
  ok(Object.values(RC).every(c => !r.includes(c.text)), 'no card text is in 502 any more');
  ok(/^Letters \(Mail Tower\): \{/m.test(r) && /^Projects: \{/m.test(r) && /^Competition: \{/m.test(r) && /^Trip: when \{\{user\}\} departs/m.test(r) && /^- Exams: the engine marks each subject/m.test(r), 'each topic keeps a core line (path and shape)');
  ok(!/Students may buy alcohol/.test(r) && /Forbidden-magic gifts are dangerous to hold/.test(r), 'the alcohol rule left 502; the forbidden-gift line stays');
  ok(/A remedial is attended when/.test(r) && !/A remedial is attended/.test(RC.exams.text), 'the remedial line stays in the core (any week)');
  ok(Object.values(RC).every(c => !/<%/.test(c.text)), 'card texts are plain text');
  const ST1 = ['letters', 'projects', 'competition', 'exams', 'tutoring', 'trip', 'pacts', 'first_pact'];   // 1.55.0: stage 2 adds Entrance-day cards
ok(!cards(S0).some(id => ST1.includes(id)) && !/Letters \(Mail Tower: birds/.test(r511(S0)), `a quiet morning: no stage-1 card (${cards(S0)})`);
}

console.log('Each card when it applies');
{
  const L = t(go(S0, { Location: 'Mail Tower' }), '09:10');
  ok(cards(L).includes('letters') && /<rule_cards>[\s\S]*Letters \(Mail Tower: birds carry them/.test(r511(L)), 'at the Mail Tower: letters');
  const Lw = go(S0, { Time: '09:10' }, [{ op: 'insert', path: '/Letters/From home', value: { From: 'Mother', To: '{{user}}', Gist: 'news', Status: 'waiting' } }]);
  ok(cards(Lw).includes('letters'), 'a letter waiting: letters');
  const P = go(S0, { Time: '09:10' }, [{ op: 'insert', path: '/Projects/Owl carving', value: { Kind: 'carving', Goal: 'an owl', Progress: 10, Needs: '', Where: '', Due: '', With: '' } }]);
  ok(cards(P).includes('projects') && !cards(P).includes('letters'), 'a Project open: projects (and nothing else)');
  const C = go(S0, { Time: '09:10' }, [{ op: 'replace', path: '/Competition', value: { Tier: 'Dorm', Status: 'entered', Placement: '', Team: [], Results: [] } }]);
  ok(cards(C).includes('competition'), 'entered in a competition: competition');
  const X = go(S0, { Month: 2, Week: 4, Day: 'Sat', Time: '10:00' });
  ok(cards(X).includes('exams'), 'the week before the M3 midterms: exams');
  const A = _.cloneDeep(S0); A.Player.Academics.Grades = { History: 'A' };
  ok(cards(t(A, '09:10')).includes('tutoring') && !cards(t(S0, '09:10')).includes('tutoring'), 'an A: tutoring; none without');
  const T = go(S0, { Time: '09:10' }, [{ op: 'replace', path: '/Trip', value: { Active: true, Destination: 'Avalon', Companions: [], Note: '' } }]);
  ok(cards(T).includes('trip'), 'Trip.Active: trip');
  const pact = _.cloneDeep(S0); pact.Magic.Pacts = { Pip: { Kind: 'Spirit', Tier: 'Lesser', Presence: 'summoned', Summoned: false, Terms: 'fetches' } };
  ok(!cards(t(pact, '09:10')).includes('pacts'), 'a pact partner not out: no pacts card');
  ok(cards(go(pact, { Time: '09:10' }, [], 'Pip curls up on the desk.')).includes('pacts'), 'the partner named in the reply: pacts');
  const occ = _.cloneDeep(S0); occ.Magic._Affinity = { ...(occ.Magic._Affinity || {}), Types: ['Occult'], Dominant: 'Occult' };
  ok(cards(go(occ, { Location: 'Spirit Path', Time: '09:30' })).includes('first_pact') && !cards(t(occ, '09:10')).includes('first_pact'), 'an Occult student at the Spirit Path: first_pact; not in the dorm');
  const W = go(S0, { Time: '09:10' }, [], 'She mentions the Dorm Competition next month.');
  ok(cards(W).includes('competition'), 'a word in the reply opens its card next turn (fail-open)');
  const W2 = go(S0, { Time: '09:10' }, [{ op: 'insert', path: '/Projects/x', value: { Kind: 'other', Goal: '', Progress: 0 } }], '<UpdateVariable>[{"path": "/Letters/x"}]</UpdateVariable>');
  ok(!cards(W2).includes('letters'), 'words inside the update block do not count');
}

console.log('Features and fail-open');
{
  const L = _.cloneDeep(S0); L.$ui.off = [...(L.$ui.off || []), 'letters'];
  ok(!cards(go(L, { Location: 'Mail Tower', Time: '09:10' })).includes('letters'), 'Letters off: no letters card');
  const N = _.cloneDeep(S0); delete N.$ui.now.rules;
  const all = r511(N);
  ok(Object.keys(RC).every(id => all.includes(RC[id].text)), 'no list from the engine: every card is printed (fail-open)');
  const e511 = E.find(e => e.id === 511), e512 = E.find(e => e.id === 512);
  ok(e511 && e511.constant && e511.extensions.position === 4 && e511.extensions.depth === 1 && /\[mvu_update\]/.test(e511.comment), 'entry 511: constant, depth 1, [mvu_update]');
  ok(e512 && !e512.constant && e512.keys.includes('alcohol') && e512.keys.includes('Barrow & Vine') && /drink or smoke only on the rest day/.test(e512.content), 'entry 512: the alcohol rule by keyword');
  ok(/Alcohol and tobacco: students may buy them/.test(rd('src/worldbook/content/0.txt')), 'the World Index CORE FACTS has the one-line rule');
  const fc = JSON.parse(rd('data/feature_cost.json')).rules;
  ok(fc.letters > 0 && fc.letters < Math.round(RC.letters.text.length / 3.6), `the Features cost is the always-on core line; a card costs only while it applies (letters ${fc.letters})`);
}
