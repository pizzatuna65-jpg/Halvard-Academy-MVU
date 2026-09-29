// Stress test (bug hunt 1.3.3): random narrator updates, sensible and broken, through schema + engine, then every UI panel.
// Checks invariants after every step. Usage: node tests/stress/fuzz.cjs [runs=40] [steps=150] [seed=1]
const fs = require('fs'), path = require('path');
const { Schema, initState, applyPatch, ROOT } = require('../harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + `
return { PANELS, view, renderProfile, renderBuilder, draftFromState, buildOps, validate, TEMPLATES, blankDraft, personal, themed, locIdOf, CAL,
  setDraft: (d, b) => { draft = d; draftBuilt = b; }, STEPS };`)();
const DATA_NPCS = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/npcs.json'), 'utf8')));
const LOCS = Object.values(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/locations.json'), 'utf8'))).map(l => l.name);
const [RUNS, STEPS, SEED0] = [+process.argv[2] || 40, +process.argv[3] || 150, +process.argv[4] || 1];

let seed = SEED0;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const pick = a => a[Math.floor(rnd() * a.length)];
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEIRD = ['', ' ', 'the', '—', 'Boathouse', 'boathouse — dock', 'Lake — Fishing House', 'Main Courtyard, by the fountain', 'the library',
  'Fire Dormitory — Common Rooms', 'Sunreach Bay — hotel', 'The Capital', 'Mall - Nightwell', 'Nightwell', 'forest', 'The Forest Clearing',
  'Rooftop', '???', 'x'.repeat(300), 'Castle — Floor 2 — Main Library', 'Gatehouse.', 'Willow Island — the willow', 'Old Hut', 'Dovecote'];
const NPCX = [...DATA_NPCS, 'etnie', 'IRENE', 'Bob the Baker', 'Krieg', 'Myrdath', '', 'Big Sister'];
const TIMES = ['00:00', '23:59', '07:00', '12:30', '19:45', '25:61', '7:5', 'noon', '09:00'];
const REPS = ['Academy', 'Student', 'Doves', 'academy', 'Dorm', ''];

function randomOps(S) {
  const ops = [], n = ri(1, 5);
  const W = S.World, T = Object.keys(S.Magic._Techniques || {});
  for (let k = 0; k < n; k++) {
    const r = rnd();
    if (r < 0.22) {                       // time: mostly forward, sometimes broken
      const m = rnd();
      if (m < 0.6) { const add = pick([5, 15, 60, 120, 480, 900, 1440, 3000, 10080]); const [h, mi] = W.Time.split(':').map(Number); let t = h * 60 + mi + add, di = DAYS.indexOf(W.Day), wk = W.Week, mo = W.Month, yr = W.Year;
        while (t >= 1440) { t -= 1440; di++; if (di > 6) { di = 0; wk++; if (wk > 4) { wk = 1; mo++; if (mo > 12) { mo = 1; yr++; } } } }
        ops.push({ op: 'replace', path: '/World', value: { ...W, Time: `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`, Day: DAYS[di], Week: wk, Month: mo, Year: yr } });
      } else if (m < 0.8) ops.push({ op: 'replace', path: '/World/Time', value: pick(TIMES) });
      else if (m < 0.9) ops.push({ op: 'replace', path: '/World/Day', value: pick([...DAYS, 'Funday', 'mon']) });
      else ops.push({ op: 'replace', path: '/World/Month', value: pick([0, 1, 5, 12, 13, -2, '7', null]) });
    } else if (r < 0.32) ops.push({ op: 'replace', path: '/World/Location', value: rnd() < 0.5 ? pick(LOCS) : pick(WEIRD) });
    else if (r < 0.42) ops.push({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(Array.from({ length: ri(0, 4) }, () => [pick(NPCX), { Note: pick(['', 'hi', 'x'.repeat(80)]) }])) });
    else if (r < 0.52) { const who = pick([...Object.keys(S.Bonds), ...NPCX]); ops.push({ op: 'insert', path: '/Interactions/-', value: pick([{ With: who, Kind: pick(['talk', 'hangout', 'gift', 'help', 'fight', '']), Gift: pick(['loved', 'liked', 'disliked', 'meh', '']) }, who, 42, null]) }); }
    else if (r < 0.6) { const ids = Object.keys(S.Bonds); if (ids.length) { const id = pick(ids), f = pick(['Rank', 'Tension', 'Trust', 'Romance', 'Known_facts', 'Title']);
        ops.push({ op: 'replace', path: `/Bonds/${id}/${f}`, value: f === 'Romance' ? pick([true, false, 'true', 'yes']) : f === 'Known_facts' ? Array.from({ length: ri(0, 14) }, (_, i) => 'fact ' + i) : f === 'Title' ? pick(['', 'friend', null]) : pick([-5, 0, 1, S.Bonds[id].Rank + 1, 5, 10, 11, 70, 100, 250, 'high', null]) }); } }
    else if (r < 0.66) ops.push({ op: 'insert', path: '/Rep_events/-', value: pick([{ Rep: pick(REPS), XP: pick([1, 3, 5, -5, -40, 200, -500, 'x', 0.4]), Kind: pick(['repeat', 'event', 'EVENT', '']), Why: 'fz' }, 'rumour', null]) });
    else if (r < 0.7) ops.push({ op: 'insert', path: '/Training/-', value: pick([{ Track: 'mana' }, { Track: 'Stamina' }, 'mana', { Track: 'luck' }, {}]) });
    else if (r < 0.76) { if (T.length || rnd() < 0.3) ops.push({ op: 'insert', path: '/Magic/Casts/-', value: pick([{ Technique: pick([...T, 'Fireball']), Times: pick([1, 2, 5, 99, -1, 'x']) }, pick([...T, 'nothing'])]) }); }
    else if (r < 0.8) { const st = T.find(k => /^Summon /.test(k)); if (st) { const pk = st.slice(7); ops.push(rnd() < 0.5 ? { op: 'insert', path: `/Magic/Active/${pk}`, value: { Technique: st, Note: '' } } : { op: 'remove', path: `/Magic/Active/${pk}` }); ops.push({ op: 'replace', path: `/Magic/Pacts/${pk}/Summoned`, value: rnd() < 0.5 }); } }
    else if (r < 0.84) ops.push({ op: 'replace', path: pick(['/Player/Vitals/HP', '/Player/Vitals/Stamina', '/Player/Vitals/Mana', '/Player/Vitals/Mana_max', '/Player/Vitals/Stamina_max']), value: pick([0, 1, 50, 99, 150, -10, 1e6, 'lots', null]) });
    else if (r < 0.88) ops.push({ op: 'insert', path: `/Commitments/${pick(['Meet Etnie', 'Essay', 'x'])}`, value: { Due: pick(['tomorrow 9am', 'M3 W2 Fri 18:00', 'Fri', 'someday', 'M13 W9', 'tonight', '']), With: pick(['Etnie', '', 'Bob']), Where: pick(['Boathouse', 'Library', '']) } });
    else if (r < 0.9) ops.push({ op: 'insert', path: `/Inventory/${pick(['Umbrella', 'Sunfizz', 'Star Cookie', 'umbrella'])}`, value: { Qty: pick([0, 1, 3, 150, -1]), Kind: pick(['gear', 'drink', 'food', 'weird']) } });
    else if (r < 0.93) ops.push({ op: 'replace', path: '/$ui/tune', value: { trn_week: pick([0, 2.5, 5, 7]), trn_total: pick([0, 100, 200, 'x']), rep_mult: pick([0.5, 1, 2, 3]), rep_week: pick([0, 3, 10]), rep_bond: pick([0, 1, 2]), rep_tension: pick([0, 1]) } });
    else if (r < 0.95) ops.push({ op: 'replace', path: '/$ui/off', value: [pick(['planner', 'letters', 'gossip', 'hooks', 'inventory', 'mystery'])].filter(() => rnd() < 0.7) });
    else if (r < 0.97) ops.push({ op: 'insert', path: '/Perk_use/-', value: pick(['Council pardon', 'nothing', '']) });
    else if (r < 0.985) ops.push({ op: 'replace', path: '/Bonds', value: pick([{}, { Etnie: { Rank: 9 } }, S.Bonds]) });
    else ops.push({ op: 'replace', path: pick(['/Battle', '/Trip', '/Campus_State/Rumours', '/Player/Profile/Birthday', '/Hidden/Dove_attention']), value: pick([{ Active: true, Combatants: { Goblin: { HP: 50 } } }, { Active: true, Destination: 'Sunreach Bay' }, ['Etnie kissed a statue'], 'M1 W1 Tue', 55, null, 'x']) });
  }
  return ops;
}

const problems = new Map();
const report = (kind, msg, ctx) => { const k = kind + ': ' + msg; if (!problems.has(k)) problems.set(k, { n: 0, ctx }); problems.get(k).n++; };
function walkNum(o, p = '') {
  if (typeof o === 'number' && !Number.isFinite(o)) return p;
  if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { const r = walkNum(v, p + '/' + k); if (r) return r; }
  return '';
}
const absOf = W => ((W.Year - 1) * 336 + (W.Month - 1) * 28 + (W.Week - 1) * 7 + DAYS.indexOf(W.Day)) * 1440 + (+W.Time.split(':')[0]) * 60 + (+W.Time.split(':')[1]);
function check(S, B, ops) {
  const ctx = JSON.stringify(ops).slice(0, 400);
  const bad = walkNum(S); if (bad) report('engine', `non-finite number at ${bad.replace(/\/\d+/g, '/#')}`, ctx);
  const V = S.Player.Vitals;
  if (!(V.Mana >= 0 && V.Mana <= V.Mana_max + 1e-9)) report('engine', 'Mana out of 0..Mana_max', ctx);
  if (!(V.HP >= 0 && V.HP <= V.HP_max) || !(V.Stamina >= 0 && V.Stamina <= V.Stamina_max)) report('engine', 'HP/Stamina out of bounds', ctx);
  if (absOf(S.World) < absOf(B.World)) report('engine', 'time moved backwards', ctx);
  if (!DAYS.includes(S.World.Day) || !/^\d\d:\d\d$/.test(S.World.Time)) report('engine', `bad clock ${S.World.Day} ${S.World.Time}`, ctx);
  for (const [id, b] of Object.entries(S.Bonds)) {
    if (!(b.Rank >= 0 && b.Rank <= 10) || !(b.$xp >= 0) || !(b.Tension >= 0 && b.Tension <= 100) || !(b.Trust >= 0 && b.Trust <= 100)) report('engine', `bond out of range (${JSON.stringify({ r: b.Rank, x: b.$xp, t: b.Tension })})`, ctx);
    if (b.Rank > ((B.Bonds[id] || {}).Rank ?? (id === 'Etnie' ? 3 : 0)) + 1) report('engine', `bond rank jumped ${((B.Bonds[id] || {}).Rank)} -> ${b.Rank} (${id})`, ctx);
    if (!DATA_NPCS.includes(id)) report('engine', `bond for unknown id "${id}"`, ctx);
  }
  const R = S.Player.Profile.Reputation;
  for (const r of ['Academy', 'Student', 'Doves']) if (Math.abs(R['_' + r]) > 5 || Math.abs(R.$xp[r]) > 125) report('engine', 'reputation out of range', ctx);
  if ((S.Journal || []).length > 30) report('engine', `Journal over 30 (${S.Journal.length})`, ctx);
  if ((S._Log || []).length > 12) report('engine', '_Log over 12', ctx);
  for (const [k, t] of Object.entries(S.Player.$Training || {})) if (t.gain > t.base * 10 + 1) report('engine', `training runaway ${k}`, ctx);
  if (typeof S.World.Location !== 'string') report('engine', 'Location not a string', ctx);
  if (S.World.Location.length > 400) report('engine', 'Location grew', ctx);
  // the schema must accept what the engine wrote, unchanged in shape (a second parse is stable)
  try { const P = Schema.parse(JSON.parse(JSON.stringify(S))); if (JSON.stringify(Schema.parse(P)) !== JSON.stringify(P)) report('schema', 'parse not idempotent', ctx); } catch (e) { report('schema', 'reparse threw ' + e.message.slice(0, 80), ctx); }
}
const ejs = require('ejs');
const CARD = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const EJS_ENTRIES = CARD.character_book.entries.filter(e => /<%/.test(e.content));
function renderAll(S, ctx) {
  for (const e of EJS_ENTRIES) {   // the lore entries the Prompt Template renders every turn (Now, rules, calendar, roster)
    try { const out = ejs.render(e.content, { getvar: k => _.get({ stat_data: S }, k) });
      const m = out.match(/.{0,50}(\bNaN\b|\bundefined\b|\[object Object\]).{0,50}/); if (m) report('ejs', `entry ${e.id} prints "${m[1]}"`, m[0] + ' | ' + ctx); }
    catch (err) { report('ejs', `entry ${e.id} threw: ${err.message.split('\n').slice(-1)[0].slice(0, 120)}`, ctx); }
  }
  const tryR = (name, f) => { try { const h = String(f()); if (/\bNaN\b|>undefined<|\bundefined\b(?![-\w])|\[object Object\]/.test(h.replace(/<script[\s\S]*?<\/script>/g, ''))) {
    const m = h.match(/.{0,60}(\bNaN\b|>undefined<|\bundefined\b(?![-\w])|\[object Object\]).{0,60}/); report('ui', `${name} shows "${m ? m[1] : '?'}"`, (m ? m[0] : '') + ' | ' + ctx); } }
    catch (e) { report('ui', `${name} threw: ${e.message.slice(0, 100)}`, ctx + ' | ' + (e.stack || '').split('\n')[1]); } };
  const v = U.view;
  for (const tab of ['overview', 'body', 'bag', 'wallet', 'studies', 'magic', 'hidden', 'perks', 'log', 'settings']) { v.tab = tab; tryR('profile/' + tab, () => U.renderProfile(S)); }
  for (const t of ['bonds', 'graph']) { v.ptab = t; tryR('people/' + t, () => U.PANELS.people.render(S)); }
  for (const id of Object.keys(S.Bonds).slice(0, 6).concat(['Krieg', 'Nobody'])) { v.arg = id; tryR('npc/' + (id === 'Nobody' ? 'unknown' : 'x'), () => U.PANELS.npc.render(S)); }
  v.arg = ''; v.pin = null;
  tryR('map', () => U.PANELS.map.render(S));
  for (const p of [1, 11, 12, 37, 22, 999]) { v.pin = p; v.floor = ''; tryR('map/pin', () => U.PANELS.map.render(S)); }
  for (const nb of ['planner', 'journal', 'notices', 'letters', 'mystery']) { v.nb = nb; v.arg = ''; tryR('notebook/' + nb, () => U.PANELS.notebook.render(S)); }
  v.nb = 'planner'; v.calSel = `Y${S.World.Year} M${S.World.Month} W${S.World.Week} ${S.World.Day}`; tryR('notebook/calday', () => U.PANELS.notebook.render(S)); v.calSel = '';
  for (const a of ['clubs', 'competition', 'shop', 'projects', 'trip']) { v.act = a; v.arg = ''; tryR('activities/' + a, () => U.PANELS.activities.render(S)); }
  tryR('battle', () => U.PANELS.battle.render(S));
  if (S.$ui.built) {
    tryR('builder/load', () => { const d = U.draftFromState(S); U.setDraft(d, true); U.validate(d, S); return JSON.stringify(U.buildOps(d, S)); });
    for (const [st] of U.STEPS.filter(([s]) => s !== 'start')) { v.step = st; tryR('builder/' + st, () => U.renderBuilder(S)); }
    // a Builder round trip on a fuzzed state must change nothing but the two bookkeeping ops
    try { const d = U.draftFromState(S), ops = U.buildOps(d, S); const ch = ops.slice(0, -2).map(o => o.path).filter(x => x !== '/$ui/file' && !(x === '/Player/Profile/Birthday' && !/^M\d{1,2} W[1-4] (Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.test(S.Player.Profile.Birthday))); if (ch.length) report('ui', `builder round trip changes ${ch.join(', ')}`, ctx); } catch (e) { report('ui', 'builder round trip threw ' + e.message, ctx); }
  }
}

let steps = 0; const DUMPS = [];
for (let run = 0; run < RUNS; run++) {
  seed = SEED0 * 1000 + run;
  let S = initState();
  // half the runs start from a built student (a template), including the pact student
  if (run % 2 === 0) { const t = U.TEMPLATES[run / 2 % U.TEMPLATES.length], d = Object.assign(U.blankDraft(), t.make()); d.name = 'Aria Vale'; S = applyPatch(S, U.buildOps(d, S), { mvu: true }); }
  for (let i = 0; i < STEPS; i++) {
    const ops = randomOps(S), text = rnd() < 0.3 ? `${pick(DATA_NPCS)} waved. <UpdateVariable>x</UpdateVariable>` : '';
    let N;
    try { N = applyPatch(S, ops, { text, mvu: rnd() < 0.5 }); } catch (e) { report('engine', 'threw: ' + e.message.slice(0, 120), JSON.stringify(ops).slice(0, 300) + ' | ' + (e.stack || '').split('\n').slice(1, 3).join(' ')); continue; }
    check(N, S, ops); steps++;
    if (i % 10 === 0 || i === STEPS - 1) renderAll(N, JSON.stringify(ops).slice(0, 200));
    if (process.env.DUMP && i % 25 === 24) DUMPS.push(N);
    S = N;
  }
}
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, 'window.STATES=' + JSON.stringify(DUMPS) + ';');
console.log(`fuzz: ${RUNS} runs x ${STEPS} steps = ${steps} updates`);
if (!problems.size) console.log('no problems');
for (const [k, v] of [...problems].sort((a, b) => b[1].n - a[1].n)) console.log(`[${v.n}x] ${k}\n     ${v.ctx.slice(0, 500)}`);
process.exitCode = problems.size ? 1 : 0;
