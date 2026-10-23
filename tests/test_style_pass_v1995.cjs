// 1.99.5 (bug-hunt audit 2026-10-23 batch 4, owner "proceed" on planning/DRAFT_slop_pass.md): the style pass. The preset's banned list
// forbids some words as plain vocabulary (names and titles the card writes are exempt, preset deviation 1.99.3); the card's own text
// no longer uses them, so the narrator never has to choose between copying the card and obeying the preset. Also: the opening message,
// the cohort-3 voice scenes' doubled "Scene:" prefix, field labels kept as names, and the card's Campus Map (audit T4).
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data, ENT = card.character_book.entries, X = id => ENT.find(e => e.id === id).content;
const canon = JSON.parse(read('data/npc_canon.json'));
const strings = o => typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(strings) : o && typeof o === 'object' ? Object.values(o).flatMap(strings) : [];

console.log('The preset\'s banned words are not the card\'s vocabulary');
const NAMES = /\bvice[- ](?:headmaster|president|captain|principal|chair|head)|Velvet Lanes|Furnace room/gi;   // titles in any case are names too
const BANNED = /\b(?:breath hitch\w*|breath catch\w*|husky|upholster\w*|pupils blown|predatory|assets?|shivers? down|pupils dilat\w*|finding purchase|nails biting|velvet|vise|vices?|structural integrity|deep curve|furnaces?|throaty|callous\w*|guttural|slick\w*|unadulterated|barely above a whisper|musk|a beat|a pause)\b/gi;
const JAW = /\b(?:clench\w* (?:his|her|their) jaw|tight jaw|jaws? (?:set|tighten\w*|clench\w*|work\w*))\b/gi;   // "jaw {does X}"; a square jaw is fine
const texts = [['first_mes', card.first_mes], ['description', card.description], ...ENT.map(e => ['entry ' + e.id, e.content]),
  ...strings(canon).map(s => ['npc_canon', s]), ...strings(JSON.parse(read('data/shop.json'))).map(s => ['shop', s])];
const hits = [];
for (const [where, t] of texts) {
  const clean = String(t).replace(NAMES, '<name>');
  for (const rx of [BANNED, JAW]) for (const m of clean.matchAll(rx)) hits.push(`${where}: "${m[0]}" …${clean.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\n/g, ' ')}…`);
}
ok(!hits.length, 'no banned word as plain vocabulary in the card, its lore, npc_canon or the shop' + (hits.length ? ': ' + hits.slice(0, 4).join(' | ') : ''));
ok(['Vice Headmaster', 'Vice President', 'Velvet Lanes', 'Furnace room'].every(n => ENT.some(e => e.content.includes(n))), 'the names stay as written (Vice Headmaster, Velvet Lanes, the Furnace room)');

console.log('Opening message and voices');
ok(!/ledger|Somewhere above|clears its throat|warms, blinks/.test(card.first_mes) && /this year's register/.test(card.first_mes) && /taking bets on who goes to which dorm/.test(card.first_mes), 'the opening message uses Halvard\'s own details (S1)');
ok(!strings(canon.voice).some(s => /^Scene: Scene:/.test(s)) && !ENT.some(e => /Scene: Scene:/.test(e.content)), 'no voice scene starts with a doubled "Scene:" (cohort 3, 44 lines)');
ok(/smile is held a moment too long|smile held a moment too long/.test(X(104)) && !strings(canon.voice.Kanae).some(s => /too long/.test(s)), 'Kanae\'s tell lives once, in her Emotional tells');
ok(/Quietly distrusts: The Cathedral/.test(X(109)), 'a field label is a name: Gavlan\'s "Quietly distrusts" stays (bond_rules layers.deeper)');

console.log('Campus Map (audit T4)');
const v39 = JSON.parse(read('dist/lorebook_v39/eldrasil_v39_Core.json')).entries;
ok(!/Club venues|Ordinary walking estimates/.test(X(132)) && /^Walking: <now> gives the minutes/m.test(X(132)) && /home of the Polite Walker story/.test(X(132)), 'the card\'s Campus Map leaves the minutes to <now> and keeps the far-grounds rule');
ok(/^Club venues: .*Camping – Hills/m.test(X(26)) && /Club venues: /.test(v39['132'].content) && /Ordinary walking estimates/.test(v39['132'].content) && !/Club venues/.test(v39['26'].content), 'the venue line is in the Clubs entry; the v39 export keeps its full map');
