// 1.35.0 (owner, lore activation audit): a topic entry fires on the plain word a player says ("spirit", not only "Spirit Tier"),
// the WORLD INDEX names every system topic with a core line, and every card entry ignores SillyTavern's WI budget, which is counted
// on the unrendered EJS. Matching below is SillyTavern's own (public/scripts/world-info.js matchKeys, parseRegexFromString).
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
console.log('Lore activation 1.35.0');
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const E = card.character_book.entries, byId = uid => E.find(e => e.id === uid);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function stRegex(key) {   // parseRegexFromString
  const m = key.match(/^\/([\w\W]+?)\/([gimsuy]*)$/);
  if (!m || /(^|[^\\])\//.test(m[1])) return null;
  try { return new RegExp(m[1].replace('\\/', '/'), m[2]); } catch (e) { return null; }
}
function matchKey(hay, key, e) {   // matchKeys, case-insensitive (the card leaves case_sensitive unset)
  const rx = stRegex(key);
  if (rx) return rx.test(hay);
  const h = hay.toLowerCase(), k = key.toLowerCase();
  if (!e.extensions.match_whole_words) return h.includes(k);
  if (k.split(/\s+/).length > 1) return h.includes(k);
  return new RegExp(`(?:^|\\W)(${esc(k)})(?:$|\\W)`).test(h);
}
const fires = text => E.filter(e => e.enabled && !e.constant && e.keys.some(k => matchKey(text, k, e))).map(e => e.id);

// ---- budget
ok(E.every(e => e.extensions.ignore_budget === true), 'every card entry ignores the WI budget (it would count the raw EJS)');

// ---- regex keys are valid SillyTavern regex keys, case-insensitive
const rxKeys = E.flatMap(e => e.keys.filter(k => k.startsWith('/')).map(k => [e.id, k]));
ok(rxKeys.length >= 30 && rxKeys.every(([, k]) => stRegex(k) && stRegex(k).flags.includes('i')), `${rxKeys.length} regex keys parse as SillyTavern regex keys with the i flag`);

// ---- what a player says -> the entry that must fire
const MUST = [
  ['Tell me about your spirit.', 122], ['What kind of spirits do you have?', 122], ['Is her familiar a fox?', 122],
  ['She made a pact with it.', 249], ['Can you summon it?', 249], ['He summoned his partner.', 249],
  ["I'm Occult.", 36], ['Mystic students', 34], ['the Elemental kids', 33], ['Spiritual magic is odd', 35], ['What subtype do you have?', 33],
  ['Is that dark magic?', 32], ['She was cursed.', 32], ['a demon', 5], ['Demons came through.', 5], ['The seals are old.', 7],
  ['the Council meets today', 6], ['Who won the election?', 336], ['Which clubs are there?', 26], ['I want to join a club.', 26],
  ['the competition next month', 19], ['a tournament', 19], ['Did you qualify?', 19], ['When are the exams?', 203], ['one exam left', 203],
  ['the other academies', 2], ['a rival academy', 3], ['the four academies', 4], ['Is there a church?', 90], ['the goddess', 277], ['Asmoday', 277],
  ['the nobles', 91], ['a duel', 267], ['Let us duel.', 267], ['There is a monster in the forest.', 229], ['a beast', 229],
  ['strange creatures', 229], ['a dire wolf', 229], ['two kelpies', 229], ['a basilisk', 229], ['the Sablemaw', 229],
];
for (const [say, uid] of MUST) ok(fires(say).includes(uid), `"${say}" fires ${byId(uid).comment.replace('[mvu_plot] ', '')}`);
ok(!fires('That face looks familiar.').includes(122) && !fires('the giant oak').includes(229), 'no Spirit Tiers on "looks familiar", no beasts on "giant oak"');
ok(!byId(335).keys.includes('Alpha'), 'Yozakura still has no bare "Alpha" key');

// ---- the WORLD INDEX names every system topic by one of its keys, with a core line; secret topics stay out
const wi = byId(0), idx = wi.content;
ok(wi.constant && /\nCORE FACTS \(/.test(idx), 'WORLD INDEX: CORE FACTS section');
const TOPICS = [2, 3, 4, 5, 6, 7, 10, 12, 18, 19, 26, 32, 33, 34, 35, 36, 122, 229, 231, 249];
const missing = TOPICS.filter(uid => !byId(uid).keys.some(k => matchKey(idx, k, byId(uid))));
ok(!missing.length, 'WORLD INDEX names every system topic by a key' + (missing.length ? ': missing ' + missing : ''));
ok(/Spirits: four tiers\. Lesser .*Basic .*Greater .*Spirit Lord/.test(idx), 'WORLD INDEX: the four spirit tiers');
ok(!/Morning Choir|Lucifer/.test(idx), 'WORLD INDEX: the secret topics stay keyword-only');
