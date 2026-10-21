// 1.79.0 (audit/AUDIT_2026-10-21_2_megumin_suite.md, batch 2: MS1): the bracelet's "This reply" fold. shared.js replyDelta lists
// what a reply changed (bonds, money, body, studies, Bag, records) from the state before it to the state after it; the bracelet works
// it out from its own message's state and the newest earlier one, so nothing is stored and nothing reaches the prompt.
const fs = require('fs'), path = require('path');
const { applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const SHD = new Function(read('src/scripts/shared.js') + '\nreturn { replyDelta, DELTA_GROUPS, newLines };')();

console.log('replyDelta (shared.js)');
const A = JSON.parse(read('tests/fixtures/saves/save_1.78.0.json'));
const B = applyPatch(A, [
  { op: 'replace', path: '/World/Time', value: '17:10' },
  { op: 'replace', path: '/World/Location', value: 'Commissary' },
  { op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: 'shopping with {{user}}' } } },
  { op: 'insert', path: '/Interactions/-', value: { With: 'Etnie', Kind: 'hangout', Note: 'browsed the shelves together' } },
  { op: 'insert', path: '/Purchases/-', value: { Item: 'Notebook', Qty: 2, Shop: 'Commissary' } },
  { op: 'insert', path: '/Player/Injuries/Bruised shin', value: { Severity: 'minor', Body_part: 'shin', Effect: 'walked into a crate' } },
  { op: 'insert', path: '/Rep_events/-', value: { Rep: 'Student', XP: 2, Kind: 'repeat', Why: 'helped a first-year with a dropped box' } },
  { op: 'replace', path: '/Commitments/Return the ledger', value: { Desc: 'to the Commissary clerk', Due: 'M2 W3 Mon 09:00', With: '', Where: 'Commissary', Type: 'promise' } },
  { op: 'replace', path: '/Hooks/Clerk owes a favour', value: { Note: 'the clerk will remember this', Who: '', Kind: 'promise', Weight: 1 } },
  { op: 'insert', path: '/Journal/-', value: 'Etnie and {{user}} found the Commissary clerk hiding a ledger.' },
], { text: 'Etnie laughed as they filled the basket.' });
const D = SHD.replyDelta(A, B), rows = D.map(r => r[0] + ' | ' + r[1]);
const has = (g, rx) => D.some(r => r[0] === g && rx.test(r[1]));
ok(has('People', /^\{npc:Etnie\}: bond XP \+\d+/), 'a bond that grew: its XP, the NPC as {npc:id}: ' + rows.filter(r => r.startsWith('People')).join('; '));
ok(has('Money', /^-\d+ .*Notebook/) && !has('Money', /in all/), 'a purchase shows its own Transactions line; one line needs no total');
ok(has('Body', /^Injury: Bruised shin \(minor\)$/), 'a new injury with its severity');
ok(has('Studies', /^Student reputation \+\d+ XP/), 'reputation XP as the engine counted it (the weekly cap may cut it)');
ok(has('Bag', /^\+2 Notebook$/), 'the Bag: what came in');
ok(has('Records', /^Planner: Return the ledger \(M2 W3 Mon 09:00\)$/) && has('Records', /^Journal \+1 line$/), 'records: a new Planner entry and a Journal line');
ok(!D.some(r => /Clerk owes|favour/i.test(r[1])), 'Hooks are the narrator\'s notes: never listed');
ok(D.every((r, i) => i === 0 || SHD.DELTA_GROUPS.indexOf(D[i - 1][0]) <= SHD.DELTA_GROUPS.indexOf(r[0])), 'rows come in group order: ' + [...new Set(D.map(r => r[0]))].join(', '));
ok(!SHD.replyDelta(A, A).length, 'a state compared with itself: nothing');

// a later state written by hand (the function only compares; the engine's own rules decide what can change)
const C = _.cloneDeep(B);
delete C.Player.Injuries['Bruised shin']; C.Inventory.Notebook.Qty -= 1;
C.Bonds.Etnie.Trust += 3; C.Bonds.Etnie.Tension += 12; C.Bonds.Kanae.Rank += 1;
C.Player.Vitals.Mana_max += 5; C.Player.Conditions.Soaked = { Effect: 'wet through', Since: '' };
const D2 = SHD.replyDelta(B, C), t2 = D2.map(r => r[1]);
ok(t2.includes('Healed: Bruised shin') && t2.includes('−1 Notebook') && t2.includes('Now Soaked'), 'what healed, what left the Bag, a new condition: ' + t2.join('; '));
ok(t2.includes('{npc:Etnie}: Trust +3, Tension +12') && t2.some(t => /^\{npc:Kanae\}: Rank \d+ → \d+$/.test(t)), 'Trust and Tension moves as numbers (as the People panel shows them); a rank change');
ok(t2.includes('Mana max +5'), 'a maximum that grew');
ok(SHD.newLines(['a', 'b', 'a'], ['a', 'b', 'a', 'a', 'c']).join() === 'a,c', 'newLines (moved from the engine): a repeated line counts once per repeat');

console.log('The bracelet');
const bar = read('src/ui/statusbar.html'), js = bar.split('<script>').slice(1).map(s => s.split('</script>')[0]).join('\n');
function braceletAt(states, mid) {
  const band = { innerHTML: '', className: '', st: {}, addEventListener() {}, querySelectorAll: () => [] };
  band.style = { setProperty: (p, v) => { band.st[p] = v; } };
  const env = { document: { getElementById: id => (id === 'band' ? band : null), createElement: () => ({}) }, window: { addEventListener() {}, parent: {} },
    localStorage: { getItem: () => null, setItem() {} }, sessionStorage: { getItem: () => '1', setItem() {} },
    getCurrentMessageId: () => mid, getLastMessageId: () => states.length - 1,
    getVariables: ({ message_id }) => (states[message_id] ? { stat_data: _.cloneDeep(states[message_id]) } : {}),
    getChatMessages: () => [], tavern_events: {}, eventOn() {}, waitGlobalInitialized: () => ({ then() {} }), setInterval: () => 0, clearInterval() {}, setTimeout() {}, _ };
  new Function(...Object.keys(env), js)(...Object.values(env));
  return band.innerHTML;
}
const h = braceletAt([A, null, B], 2);
ok(/<details class="delta"><summary>This reply <small>\d+ changes<\/small><\/summary>/.test(h), 'the fold is there, closed, with the number of changes');
ok(/<span class="dgh">People<\/span><div>Etnie: bond XP \+\d+/.test(h) && !/\{npc:/.test(h), 'NPC names filled in as the player knows them');
ok(h.indexOf('class="delta"') > h.indexOf('class="low"') || !/class="low"/.test(h), 'below the people-here and news row');
ok(!/class="delta"/.test(braceletAt([B], 0)), 'the first message of a chat (no state before it): no fold');
ok(!/class="delta"/.test(braceletAt([B, B], 1)), 'a reply that changed nothing: no fold');
ok(/\.band\.collapsed \.delta\{display:none\}/.test(bar), 'a collapsed bracelet hides it');
ok(!/replyDelta|This reply/.test(read('src/worldbook/custom/505.template.ejs') + read('src/worldbook/custom/content/501.txt')), 'nothing of it reaches the prompt');
