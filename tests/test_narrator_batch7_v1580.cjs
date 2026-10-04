// 1.58.0 (audit/AUDIT_2026-10-04_1_beban_narator.md §6, batch 7; U9): the card is ready for MVU's extra-model mode. In that mode an
// entry tagged [mvu_plot] reaches only the story model, [mvu_update] only the update model, an untagged one both (MagVarUpdate 438f9ff,
// src/function/request/filter_entries.ts). The update model has no <cast>, so update rules must not depend on it.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')), E = card.data.character_book.entries;
const byId = id => E.find(e => e.id === id);
const go = (S, w, x = []) => applyPatch(S, Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x));
const S0 = go(initState({ etnie: true }), { Location: 'Fire Dormitory', Time: '09:00' });

console.log('Tags for the two models');
{
  ok(!/\[mvu_(plot|update)\]/.test(byId(506).comment), '506 Price Guide is untagged: the update model writes /Purchases with its exact names');
  const co = JSON.parse(E.find(e => e.comment.trim() === '[config_override]').content);
  ok(co['更新方式'] === '随AI输出', '507 still sets the one-call mode (DECISIONS §9 unchanged until the owner decides)');
  const upd = E.filter(e => e.enabled && /\[mvu_update\]/.test(e.comment)).map(e => e.id);
  ok(upd.every(id => !/<cast>[^.]*\b(asks|line)\b/.test(renderEntry(card, id, S0))), `no update-only entry sends the update model to <cast> (${upd})`);
}

console.log('Update rules readable without <cast>');
{
  const rules = renderEntry(card, 502, S0);
  ok(/When <now> asks \(their second appearance\), add their record/.test(rules), '502: the Extras request is in <now> (505, untagged)');
  const P = go(S0, { Time: '09:10' }, [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: '' } } }]);
  ok(P.$ui.now.rules.includes('imprints'), 'a bonded character here: the Imprints card is listed');
  const r = renderEntry(card, 511, P);
  ok(/Follow their change type \(below\)/.test(r) && !/Change line in <cast>/.test(r), 'Imprints: the change type is given in the card');
  ok(/Change type of those here: Etnie fixed \(fixed: Experience deepens who they are; it never rewrites them\.\)/.test(r), 'Imprints: Etnie fixed, with its meaning');
  ok(!/Change type of those here/.test(renderEntry(card, 511, S0)), 'nobody here: no change line');
  ok(/"Teasing", and how the story shows them taking it/.test(JSON.parse(rd('data/rule_cards.json')).cards.trust_tension.text), 'Trust: teasing judged from the sheet and the story');
}

console.log('A/B tool');
{
  const src = rd('tools/audit_chat.py');
  ok(/--compare/.test(src) && /def compare_md/.test(src) && /with more than one/.test(src), 'audit_chat.py --compare puts two chats side by side and counts double blocks');
}
