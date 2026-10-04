// 1.56.0 (audit/AUDIT_2026-10-04_1_beban_narator.md §6, batch 5; U2, owner-approved): one place per fact. Each present character's
// engine lines are one "Now with {{user}}" block in their Cast Sheet ($ui.now.people), with band words instead of numbers; the numbers
// stay in <current_state>; Recent shows 3 moments with their effect in words; repeated sentences are said once. Also: entry 512 tagged.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')), E = card.data.character_book.entries;
const go = (S, w, x = []) => applyPatch(S, Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x));
const S0 = go(initState({ etnie: true }), { Week: 2, Day: 'Tue', Location: 'Canteen', Time: '12:00' });
const talk = (S, t) => go(S, { Time: t }, [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: '' } } }, { op: 'insert', path: '/Interactions/-', value: { With: 'Etnie', Kind: 'talk', Note: 'Talked about lunch.' } }]);
let S = S0; for (const t of ['12:05', '12:10', '12:15', '12:20', '12:25']) S = talk(S, t);
const now = renderEntry(card, 505, S), cast = renderEntry(card, 509, S), P = S.$ui.now.people.Etnie || [];

console.log('One block per person, in the Cast Sheet');
{
  ok(P.some(l => /^Bond \(/.test(l)) && P.some(l => /^Recent with \{\{user\}\}/.test(l)) && P.some(l => /^Teasing: /.test(l)), `the engine groups Etnie's lines (${P.length})`);
  ok(/\[Etnie\] full sheet[\s\S]*Now with \{\{user\}\}:\n- /.test(cast) && !/^(Bond|Tension|Trust|Recent with \{\{user\}\}|Teasing \(how each)/m.test(now), 'the block is in her sheet; <now> has no per-person lines');
  ok(!/Mood colours their manner/.test(now + cast) && !/Mood colours their manner/.test(JSON.stringify(S.$ui.now)), 'the mood tail is not repeated per person');
  ok(!/deflects in character \(pushing too soon adds Tension\)/.test(cast) && /deflect in their own way \(pushing too soon adds Tension\)/.test(renderEntry(card, 504, S)), 'deflecting is said once, in 504');
}

console.log('Numbers once');
{
  ok(!/Rank \d|Trust \d|Tension \d/.test(P.join(' ')) && !/Bond with \{\{user\}\}: Rank/.test(cast) && !/Stage with \{\{user\}\} \(Rank/.test(cast), 'no Rank, Trust or Tension number in the block or the sheet');
  ok(/Bond with \{\{user\}\}: \w+ trust, \w+ tension\./.test(cast), 'the sheet names the bands');
  ok(/Etnie:[\s\S]*Rank: \d+[\s\S]*Trust: \d+/.test(renderEntry(card, 501, S)), 'the numbers are still in <current_state>');
}

console.log('Recent and Defining');
{
  const rec = P.find(l => /^Recent/.test(l)) || '';
  ok(rec.split(' | ').length === 3, `Recent shows 3 moments (${rec.split(' | ').length})`);
  ok(!/XP \+|Rank \d+ →|Trust [+−]\d/.test(rec), 'effects are words, not numbers');
  const fx = new Function(rd('src/scripts/engine.js').match(/const fxWords = [^\n]*/)[0] + '\nreturn fxWords;')();
  ok(fx('Rank 2 → 3, XP +6, Trust +3') === 'grew closer, trust grew' && fx('Trust −12, Tension +10') === 'trust shaken, tension rose' && fx('XP +2') === '', 'fxWords: the effect in words; XP alone says nothing');
  ok(JSON.parse(rd('data/bond_rules.json')).recent.now === 3 && JSON.parse(rd('data/bond_rules.json')).recent.keep === 10, 'Recent: 3 for the narrator, 10 kept for the dossier');
}

console.log('Said once, and the fallback');
{
  ok(!/never who they are/.test(renderEntry(card, 509, S)) && /never who they are/.test(rd('src/worldbook/custom/content/504.txt')), '"never who they are" only in 504');
  ok(!/do not announce ranks or perks/.test(renderEntry(card, 502, S)) && /Never announce a rank, XP, multiplier, or perk/.test(renderEntry(card, 504, S)), 'the rank ban is said once, in 504');
  ok(!/\/Purchases|\/Consumables|\/Craft_sales/.test(rd('src/worldbook/custom/506.template.ejs').split('_%>').pop()), 'the Price Guide lists prices; how to report a purchase is 502\'s');
  ok(!/Skyport, Gilded Arcade/.test(rd('src/worldbook/custom/content/502.txt')), 'area place names are not listed in 502');
  const X = _.cloneDeep(S); X.$ui.cast = { full: [], brief: [] };
  ok(/Now with \{\{user\}\}, Etnie: .*Bond \(/.test(renderEntry(card, 505, X)), 'someone here without a sheet gets the block in <now>');
  const e = E.find(x => x.id === 512);
  ok(/^\[mvu_plot\]/.test(e.comment), 'entry 512 is tagged [mvu_plot] (DECISIONS §1 D2)');
}
