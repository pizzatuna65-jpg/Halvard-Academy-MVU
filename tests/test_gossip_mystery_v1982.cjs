// 1.98.2 (owner-approved planning/DRAFT_kedalaman_fitur.md batch 4): a rumour that has reached most of campus reaches people (a
// friend may ask {{user}} about one about them; their friends hear one about someone with a bond); Investigate where an open thread's
// clue was seen (Knowledge +1 a day, a lead on a clean first Fortune number once in 14 days); a solved thread pays Knowledge +2 and a
// moment with the Links there; a finished research Project pays its subject's XP (and a lead when it names an open thread), a club
// Project its club's Field and a Newspaper line.
const fs = require('fs'), path = require('path');
const { Schema, initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { toAbs, TRU };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json'));
const now = S => renderEntry(card, 505, S);
const op = (p, value) => ({ op: 'replace', path: p, value });
function at(W, seed, extra = {}) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 2, Week: 2, Day: 'Mon', Time: '08:00', Location: 'Canteen', ...W });
  Object.assign(S.Player.Profile, { Dorm: 'Fire', Year: 1, Name: 'Aria Vale' });
  S.Player.Wallet.Points = 300; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = seed;
  for (const [k, v] of Object.entries(extra)) _.set(S, k, v);
  return applyPatch(Schema.parse(S), []);
}
const go = (B, W, ops = [], opts) => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops], opts);
const xp = (S, k) => num(((S.$eng.prof || {}).xp || {})[k]);
function num(v) { return Number(v) || 0; }

console.log('Gossip reaches people');
const rum = 'Aria Vale was seen climbing out of the Archive window at midnight';
const S0 = at({}, 5, { 'Bonds.Etnie': { Rank: 4, Trust: 60, Tension: 0 } });
const S1 = go(S0, {}, [op('/Campus_State/Rumours', [rum])]);
const S2 = go(S1, { Day: 'Fri', Time: '12:00' });
const wide = (S2.$ui.gossip || []).find(g => g[0] === rum);
ok(wide && /campus/.test(wide[1]), 'the rumour has spread: ' + (wide || [])[1]);
ok(S2.$eng.agenda.ask['r:' + rum] && S2.$eng.agenda.ask['r:' + rum].ev === 2, 'a rumour about {{user}} becomes something friends may ask about');
const S3 = go(S2, { Time: '13:00', Location: 'Main Library' }, [op('/Scene/Present/Etnie', {})]);
ok(/Has heard the rumour about \{\{user\}\} going round campus/.test((S3.$ui.asks || {}).Etnie || ''), 'Etnie, met again: ' + ((S3.$ui.asks || {}).Etnie || '').slice(0, 90));
const S4 = go(S3, { Time: '14:00' }, [op('/Campus_State/Rumours', [])]);
ok(!(S4.$eng.agenda.ask || {})['r:' + rum], 'the rumour dies: nobody asks any more');
const [nid, fr] = Object.entries(E.TRU.friends || {}).find(([, v]) => v.length) || [];
const R0 = at({}, 5, { [`Bonds.${nid}`]: { Rank: 2, Trust: 50, Tension: 0 }, [`Bonds.${fr[0]}`]: { Rank: 2, Trust: 50, Tension: 0 } });
const nr = `${nid} cried in the Bell Tower after the duel`;
const R1 = go(go(R0, {}, [op('/Campus_State/Rumours', [nr])]), { Day: 'Fri', Time: '12:00' });
const R2 = go(R1, { Time: '13:00' });
ok((R2.Bonds[fr[0]].Knows || []).some(k => k.includes(`Heard from campus talk: ${nr}`)), `${fr[0]} (a friend of ${nid}) hears it`);
const R3 = go(R2, { Day: 'Sat', Time: '12:00' });
ok((R3.Bonds[fr[0]].Knows || []).filter(k => k.includes(nr)).length === 1, 'once');

console.log('Investigate');
const clue = { Thread: 'The cold candles', Detail: 'candles burn blue in the east stair', Where: 'Main Library', Links: ['Etnie'] };
const M0 = go(at({}, 9, { 'Bonds.Etnie': { Rank: 4, Trust: 60, Tension: 0 } }), {}, [op('/Clues/Blue flame', clue)]);
const M1 = go(M0, { Time: '15:00', Location: 'Main Library' });
ok((M1.$ui.inv || []).includes('The cold candles') && /Investigate here \(an open thread's clue was seen here: The cold candles\)/.test(now(M1)), '<now> at the clue\'s place offers it');
ok(!(go(M0, { Time: '15:00', Location: 'Canteen' }).$ui.inv || []).length, 'not elsewhere');
const k0 = xp(M1, 'Knowledge');
const M2 = go(M1, { Time: '15:45' }, [{ op: 'insert', path: '/Practice/-', value: { Action: 'Investigate', Aim: 'The cold candles' } }]);
ok(xp(M2, 'Knowledge') === k0 + 1, 'Knowledge +1');
const M3 = go(M2, { Time: '16:30' }, [{ op: 'insert', path: '/Practice/-', value: { Action: 'Investigate', Aim: 'The cold candles' } }]);
ok(xp(M3, 'Knowledge') === k0 + 1, 'once a thread a day');
let leadAt = null;
for (let s = 1; s <= 30 && !leadAt; s++) {
  const A0 = go(go(at({}, s), {}, [op('/Clues/Blue flame', clue)]), { Time: '15:00', Location: 'Main Library' });
  const A1 = go(A0, { Time: '15:45' }, [{ op: 'insert', path: '/Practice/-', value: { Action: 'Investigate', Aim: 'The cold candles' } }]);
  if (A1.Clues['Lead: The cold candles']) leadAt = [A0, A1];
}
ok(leadAt && leadAt[0].$ui.fortune.rolls[0] > leadAt[0].$ui.fortune.part, 'a clean first Fortune number turns up a lead');
ok(leadAt && leadAt[1]._Log.some(l => /real lead on The cold candles/.test(l)), 'the narrator is told to show it from the lore');
const short = go(M1, { Time: '15:10' }, [{ op: 'insert', path: '/Practice/-', value: { Action: 'Investigate', Aim: 'The cold candles' } }]);
ok(xp(short, 'Knowledge') === k0 && short._Log.some(l => /at least 30 minutes/.test(l)), 'ten minutes is not an investigation');

console.log('Solved, Projects');
const V0 = go(M1, {}, [op('/Scene/Present/Etnie', {})]);
const V1 = go(V0, { Time: '15:10' }, [op('/Mysteries/The cold candles/Status', 'solved')]);
ok(xp(V1, 'Knowledge') === xp(V0, 'Knowledge') + 2, 'solved: Knowledge +2');
ok((V1.Bonds.Etnie.$Recent || []).some(r => r.n === 'Pieced together The cold candles with {{user}}.'), 'a moment with the Link who was there');
const P0 = go(at({}, 4), {}, [op('/Projects/Old charters', { Kind: 'research', Goal: 'what History says of the founding warden', Progress: 60 })]);
const P1 = go(P0, { Time: '10:00' }, [op('/Projects/Old charters/Progress', 100)]);
ok(xp(P1, 'Knowledge') === xp(P0, 'Knowledge') + 2, 'research finished: its subject (History → Knowledge) +2');
const Q0 = go(go(at({}, 4), {}, [op('/Clues/Blue flame', clue)]), {}, [op('/Projects/Candle wax', { Kind: 'research', Goal: 'find what feeds The cold candles', Progress: 80 })]);
const Q1 = go(Q0, { Time: '10:00' }, [op('/Projects/Candle wax/Progress', 100)]);
ok(Q1.Clues['Lead: The cold candles'], 'a research Project that names an open thread brings a lead');
const C0 = go(at({}, 4, { 'Player.Profile.Club': 'Smithing Club' }), {}, [op('/Projects/A new anvil stand', { Kind: 'club', Goal: 'for the club forge', Progress: 70 })]);
const C1 = go(C0, { Time: '10:00' }, [op('/Projects/A new anvil stand/Progress', 100)]);
ok(xp(C1, 'Craft') === xp(C0, 'Craft') + 2, 'a club Project: the club\'s Field (Smithing → Craft) +2');
ok(JSON.stringify(C1.$eng.paper || {}).includes('Smithing Club: A new anvil stand finished.'), 'and a line for Monday\'s Newspaper');
