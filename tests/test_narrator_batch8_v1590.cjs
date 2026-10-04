// 1.59.0 (audit/AUDIT_2026-10-04_1_beban_narator.md §6, batch 8; U8, owner-approved 2026-10-04): the narrator reports a Trust drop
// as a letdown and a Tension rise as an offence, by severity word; the engine draws the size from data/trust.json letdown and
// data/tension.json offence (the 1.55.0 rule card's numbers), then applies the character's nature as for a written number.
const fs = require('fs'), path = require('path');
const { initState: initBase, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const initState = opts => { const S = initBase(opts); S.$ui.wxfx = 'off'; return S; };   // no mood modifiers
const TRU = JSON.parse(rd('data/trust.json')), TEN = JSON.parse(rd('data/tension.json'));
const T = (S, time, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...extra]);
const IA = (With, Kind, o = {}) => ({ op: 'insert', path: '/Interactions/-', value: { With, Kind, ...o } });
const meet = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const S = T(initState(), '09:00', [meet(['Caspian', 'Aiden'])]);   // Caspian: normal openness (drop x1), Neutral 50, Tension 0
const between = (x, lo, hi) => x >= lo && x <= hi;

console.log('Data');
ok(JSON.stringify(TRU.letdown.weights) === '{"small":[3,5],"broken":[10,15],"secret_told":[20,20],"betrayal":[25,40]}', 'letdown ranges are the rule card\'s numbers');
ok(JSON.stringify(TEN.offence.weights) === '{"slight":[3,5],"jealous":[5,10],"insult":[10,15],"violence":[20,30]}', 'offence ranges are the rule card\'s numbers');

console.log('Trust: letdown');
{
  const tr0 = S.Bonds.Caspian.Trust;
  const A = T(S, '09:10', [IA('Caspian', 'letdown', { Weight: 'broken' })]);
  ok(between(tr0 - A.Bonds.Caspian.Trust, 10, 15), `broken: Trust ${tr0} -> ${A.Bonds.Caspian.Trust}`);
  const A2 = T(S, '09:10', [IA('Caspian', 'letdown', { Weight: 'broken' })]);
  ok(A2.Bonds.Caspian.Trust === A.Bonds.Caspian.Trust, 'replay-safe: the same reply draws the same size');
  const B = T(S, '09:10', [IA('Caspian', 'letdown', { Weight: 'secret_told', Meant: 'no_harm' })]);
  ok(between(tr0 - B.Bonds.Caspian.Trust, 8, 10), `a slipped secret (no_harm): Trust ${tr0} -> ${B.Bonds.Caspian.Trust}`);
  const C = T(S, '09:10', [IA('Caspian', 'letdown', { Weight: 'betrayal', Meant: 'forced' })]);
  ok(C.Bonds.Caspian.Trust === tr0 && C._Log.some(l => /Caspian knows \{\{user\}\} had no choice/.test(l)), 'forced: no drop, and the Log says why');
  const D = T(S, '09:10', [IA('Caspian', 'letdown', { Weight: 'broken' }), IA('Caspian', 'letdown', { Weight: 'broken' })]);
  ok(between(tr0 - D.Bonds.Caspian.Trust, 20, 30), `two letdowns add up (no cap): Trust ${tr0} -> ${D.Bonds.Caspian.Trust}`);
  const E = T(S, '09:10', [IA('Caspian', 'letdown', { Weight: 'small' }), { op: 'replace', path: '/Bonds/Caspian/Trust', value: tr0 - 20 }]);
  ok(E.Bonds.Caspian.Trust === tr0 - 20, `a drop written too is not added twice (the larger counts): ${E.Bonds.Caspian.Trust}`);
  const F = T(S, '09:10', [{ op: 'replace', path: '/Bonds/Caspian/Trust', value: tr0 - 12 }]);
  ok(F.Bonds.Caspian.Trust === tr0 - 12, 'a number written directly still works (older habit)');
  const G = T(S, '09:10', [IA('Caspian', 'letdown', { Weight: 'awful' })]);
  ok(G.Bonds.Caspian.Trust === tr0 && G._Log.some(l => /letdown Weight "awful" is unknown/.test(l)), 'an unknown Weight changes nothing and is logged');
  const H = T(S, '09:10', [IA('Caspian', 'letdown', { Weight: 'betrayal' })]);
  ok(between(tr0 - H.Bonds.Caspian.Trust, 25, 40), `betrayal: Trust ${tr0} -> ${H.Bonds.Caspian.Trust}`);
  ok(A.Bonds.Caspian.Rank === S.Bonds.Caspian.Rank, 'a letdown is not a genuine encounter (no rank-up from it)');
}

console.log('Tension: offence');
{
  const t0 = S.Bonds.Caspian.Tension;
  const A = T(S, '09:10', [IA('Caspian', 'offence', { Weight: 'slight' })]);
  ok(between(A.Bonds.Caspian.Tension - t0, 3, 5), `slight: Tension ${t0} -> ${A.Bonds.Caspian.Tension}`);
  const B = T(S, '09:10', [IA('Caspian', 'offence', { Weight: 'violence' }), IA('Caspian', 'offence', { Weight: 'violence' })]);
  ok(between(B.Bonds.Caspian.Tension - t0, 40, 60), `two violent offences add up, never capped: Tension ${t0} -> ${B.Bonds.Caspian.Tension}`);
  const C = T(S, '09:10', [IA('Caspian', 'offence', { Weight: 'slight' }), { op: 'replace', path: '/Bonds/Caspian/Tension', value: t0 + 12 }]);
  ok(C.Bonds.Caspian.Tension === t0 + 12, `a rise written too is not added twice (the larger counts): ${C.Bonds.Caspian.Tension}`);
  const D = T(S, '09:10', [IA('Caspian', 'offence', { Weight: 'rude' })]);
  ok(D.Bonds.Caspian.Tension === t0 && D._Log.some(l => /offence Weight "rude" is unknown/.test(l)), 'an unknown Weight changes nothing and is logged');
  const E = T(S, '09:10', [IA('Caspian', 'offence', { Weight: 'insult' }), IA('Caspian', 'letdown', { Weight: 'broken' })]);
  ok(E.Bonds.Caspian.Tension > t0 && E.Bonds.Caspian.Trust < S.Bonds.Caspian.Trust, 'a broken promise reported as both: Trust falls and Tension rises');
  ok(/let them down/i.test(E.Bonds.Caspian.$Recent.slice(-1)[0].n) && /offended them/i.test(E.Bonds.Caspian.$Recent.slice(-1)[0].n), 'Recent keeps the moment in words');
}

console.log('The narrator is told');
{
  const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
  const P = T(S, '09:10');
  const r = renderEntry(card, 502, P) + renderEntry(card, 511, P);
  ok(/never write their numbers/.test(r) && /Kind "letdown" with "Weight": "small\|broken\|secret_told\|betrayal"/.test(r) && /Kind "offence" with "Weight": "slight\|jealous\|insult\|violence"/.test(r), '502: report letdowns and offences by word');
  ok(/"Meant": "no_harm"/.test(r) && /"Meant": "forced"/.test(r) && /Several add up and are never capped/.test(r), 'Trust/Tension card: intent words, no cap');
  ok(!/−25–40|\+20–30|−10–15/.test(r), 'no Trust or Tension number ranges left for the narrator');
}
