// 1.43.0 (audit batch 2): what the player and the narrator see, rendered from fixed states, so a refactor of the UI, the bracelet or
// the EJS entries can be compared before and after (the engine side is ENGINE_DIFF's job).
//   node tests/snapshot_render.cjs states <out.json>                     -> a spread of states made with the current engine
//   node tests/snapshot_render.cjs render <states.json> <out.json> [ui.js] [statusbar.html] [card.json]   (defaults: the build)
//   node tests/snapshot_render.cjs diff <a.json> <b.json>               -> the first differences (exit 1 when any)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const [mode, A, B, uiF, barF, cardF] = process.argv.slice(2);

if (mode === 'states') {
  const { initState, applyPatch } = require('./harness.cjs');
  const W = (S, o, x = []) => applyPatch(S, [...Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })), ...x]);
  const saves = fs.readdirSync(path.join(__dirname, 'fixtures/saves')).filter(f => /^save_1\.4/.test(f)).sort();
  const base = applyPatch(JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/saves', saves[saves.length - 1]), 'utf8')), []);
  const out = { fresh: initState(), etnie: initState({ etnie: true }), save: base };
  const council = applyPatch(base, [{ op: 'replace', path: '/Player/Profile/Council', value: true }]);
  out.council_sat = W(council, { Week: 3, Day: 'Sat', Time: '10:30', Location: 'Student Council Chamber' });
  for (const [k, w] of Object.entries({
    class_mon: { Week: 3, Day: 'Mon', Time: '09:00', Location: 'Lecture Halls' }, clubs_sat: { Week: 3, Day: 'Sat', Time: '14:00', Location: 'Club Rooms' },
    m4_crown: { Month: 4, Week: 2, Day: 'Tue', Time: '12:00', Location: 'Avalon — Crown Square' }, m6: { Month: 6, Week: 1, Day: 'Wed', Time: '16:00', Location: 'Gardens' },
    m8_exp: { Month: 8, Week: 1, Day: 'Wed', Time: '11:00', Location: 'Grand Vast Forest — Base Camp' }, m9_exam: { Month: 9, Week: 1, Day: 'Tue', Time: '10:00', Location: 'Main Library' },
    m10_elect: { Month: 10, Week: 3, Day: 'Sat', Time: '15:00', Location: 'Main Courtyard' }, m11_sr_day: { Month: 11, Week: 2, Day: 'Sun', Time: '11:00', Location: 'Sunreach Bay — Coral Beach' },
    m11_sr_night: { Month: 11, Week: 2, Day: 'Mon', Time: '21:00', Location: 'Sunreach Bay — The Golden Tide' }, m11_air: { Month: 11, Week: 2, Day: 'Sat', Time: '12:00', Location: 'Airship — Promenade Deck' },
    m12: { Month: 12, Week: 2, Day: 'Thu', Time: '19:00', Location: 'Viridian Dormitory' }, m2_mall: { Week: 3, Day: 'Sun', Time: '13:00', Location: 'The Mall' },
  })) { let S = base; for (const m of [w.Month || 2]) S = W(S, { ...w, Month: m }); out[k] = S; }
  out.battle = applyPatch(out.class_mon, [{ op: 'replace', path: '/Battle', value: { Active: true, Combatants: { Rei: { HP: 80, Stamina: 60, Status: 'guarding' } } } }]);
  fs.writeFileSync(A, JSON.stringify(out));
  console.log('states:', Object.keys(out).join(' '));
  return;
}

if (mode === 'render') {
  global._ = require('lodash');
  const ejs = require('ejs');
  const states = JSON.parse(fs.readFileSync(A, 'utf8')), snap = {};
  // the panels
  global.window = { parent: { document: {} } };
  const U = new Function(fs.readFileSync(uiF || path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { PANELS, view, renderProfile, renderBuilder, blankDraft, setDraft: d => { draft = d; } };')();
  const NB = ['bag', 'wallet', 'planner', 'journal', 'notices', 'letters', 'mystery', 'forecast'], ACT = ['clubs', 'practice', 'competition', 'shop', 'projects', 'trip'];
  const PROF = ['overview', 'body', 'studies', 'magic', 'hidden', 'perks', 'log', 'settings'], MAPS = ['campus', 'forest', 'avalon', 'airship', 'sunreach'];
  const tryR = f => { try { return f(); } catch (e) { return 'ERROR ' + e.message; } };
  for (const [k, S] of Object.entries(states)) {
    for (const t of PROF) { U.view.tab = t; snap[`${k}/profile/${t}`] = tryR(() => U.renderProfile(_.cloneDeep(S))); }
    for (const t of NB) { U.view.nb = t; snap[`${k}/notebook/${t}`] = tryR(() => U.PANELS.notebook.render(_.cloneDeep(S))); }
    for (const t of ACT) { U.view.act = t; snap[`${k}/activities/${t}`] = tryR(() => U.PANELS.activities.render(_.cloneDeep(S))); }
    for (const t of MAPS) { U.view.map = t; U.view.pin = null; snap[`${k}/map/${t}`] = tryR(() => U.PANELS.map.render(_.cloneDeep(S))); }
    for (const t of ['bonds', 'graph']) { U.view.ptab = t; snap[`${k}/people/${t}`] = tryR(() => U.PANELS.people.render(_.cloneDeep(S))); }
    for (const id of ['Etnie', 'Irene', 'Krieg', 'Tsubaki']) { U.view.arg = id; U.view.stack = []; snap[`${k}/npc/${id}`] = tryR(() => U.PANELS.npc.render(_.cloneDeep(S))); }
    snap[`${k}/battle`] = tryR(() => U.PANELS.battle.render(_.cloneDeep(S)));
    for (const st of ['start', 'identity', 'power', 'techs', 'pacts', 'hidden', 'review']) { U.setDraft(U.blankDraft()); U.view.step = st; snap[`${k}/builder/${st}`] = tryR(() => U.renderBuilder(_.cloneDeep(S))); }
  }
  // the bracelet: its script with a stand-in page; the band's HTML is the snapshot
  const bar = fs.readFileSync(barF || path.join(ROOT, 'src/ui/statusbar.html'), 'utf8'), js = bar.split('<script>').slice(1).map(s => s.split('</script>')[0]).join('\n');
  for (const [k, S] of Object.entries(states)) {
    const band = { innerHTML: '', className: '', st: {}, addEventListener() {}, querySelectorAll: () => [] };
    band.style = { setProperty: (p, v) => { band.st[p] = v; } };
    const doc = { getElementById: id => (id === 'band' ? band : null), createElement: () => ({}) };
    const env = { document: doc, window: { addEventListener() {}, parent: {} }, localStorage: { getItem: () => null, setItem() {} }, sessionStorage: { getItem: () => '1', setItem() {} },
      getCurrentMessageId: () => 0, getLastMessageId: () => 0, getVariables: () => ({ stat_data: _.cloneDeep(S) }), getChatMessages: () => [], tavern_events: {}, eventOn() {},
      waitGlobalInitialized: () => ({ then() {} }), setInterval: () => 0, clearInterval() {}, setTimeout() {}, _ };
    try { new Function(...Object.keys(env), js)(...Object.values(env)); snap[`${k}/bracelet`] = JSON.stringify(band.st) + band.className + band.innerHTML; } catch (e) { snap[`${k}/bracelet`] = 'ERROR ' + e.message; }
  }
  // the EJS entries of the built card
  const card = JSON.parse(fs.readFileSync(cardF || path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
  for (const e of card.character_book.entries.filter(x => /<%/.test(x.content)))
    for (const [k, S] of Object.entries(states)) snap[`${k}/ejs/${e.id}`] = tryR(() => ejs.render(e.content, { getvar: p => _.get({ stat_data: _.cloneDeep(S) }, p) }));
  fs.writeFileSync(B, JSON.stringify(snap));
  console.log(Object.keys(snap).length, 'renders;', Object.values(snap).filter(v => /^ERROR /.test(v)).length, 'errors');
  return;
}

if (mode === 'diff') {
  const a = JSON.parse(fs.readFileSync(A, 'utf8')), b = JSON.parse(fs.readFileSync(B, 'utf8'));
  const keys = _union(Object.keys(a), Object.keys(b)), bad = keys.filter(k => a[k] !== b[k]);
  for (const k of bad.slice(0, 8)) {
    const x = String(a[k]), y = String(b[k]); let i = 0; while (i < x.length && x[i] === y[i]) i++;
    console.log(`${k}: ...${x.slice(Math.max(0, i - 80), i + 120)}\n   vs ...${y.slice(Math.max(0, i - 80), i + 120)}`);
  }
  console.log(bad.length ? `${bad.length} of ${keys.length} renders differ` : `all ${keys.length} renders identical`);
  process.exitCode = bad.length ? 1 : 0;
}
function _union(x, y) { return [...new Set([...x, ...y])]; }
