// Every release (owner: one chat continues across versions, never a restart): a save made by each earlier release loads in
// this build without losing data. Fixtures: tests/fixtures/saves/save_<version>.json, written by tests/fixtures/make_save.cjs
// on that release's code. Checks: every key survives, every story value (no "_" or "$" prefix: those are engine-owned and may be
// recomputed) is unchanged after one no-op update, $eng.ver becomes this version, and ordinary play continues.
const fs = require('fs'), path = require('path');
const { Schema, runEngine, applyPatch, ok, ROOT } = require('./harness.cjs');
const ver = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/card/card.json'), 'utf8')).character_version;
console.log('Saves from earlier releases load in ' + ver);
const dir = path.join(__dirname, 'fixtures/saves'), files = fs.readdirSync(dir).filter(f => /^save_.*\.json$/.test(f)).sort();
ok(files.length >= 1, 'at least one earlier save fixture: ' + files.join(', '));
const VOLATILE = /^(_Log|\$ui\.toasts|\$ui\.moods|\$ui\.wx|\$ui\.amb|\$ui\.say|\$ui\.soon#?|Interactions|Rep_events|Training|Perk_use|Exposure)(\.|$)/;   // per-update lists the engine empties; weather-derived UI (1.9.4 rebaselined the seasons); $ui.amb is the next reply's ambience (1.16.0), rolled fresh each update; $ui.say is the dialogue colour of the people present (1.37.2), recomputed each update; $ui.soon (1.32.0) is the Agenda feed $ui.agenda since 1.44.0, rebuilt each update
function leaves(o, pre = '', out = {}) {
  if (_.isPlainObject(o)) { if (!Object.keys(o).length && pre) out[pre] = '{}'; for (const [k, v] of Object.entries(o)) leaves(v, pre ? pre + '.' + k : k, out); }
  else if (Array.isArray(o)) { out[pre + '#'] = o.length; o.forEach((v, i) => leaves(v, pre + '.' + i, out)); }
  else out[pre] = o;
  return out;
}
const story = p => !VOLATILE.test(p) && !p.split('.').some(s => s.startsWith('_') || s.startsWith('$'));
for (const f of files) {
  const old = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const P = Schema.parse(_.cloneDeep(old)); runEngine(P, _.cloneDeep(old), ''); const S = Schema.parse(P);
  const L0 = leaves(old), L1 = leaves(S);
  // 1.33.0: the Combat subject is Practical Magic (planning/DRAFT_classes_and_teachers.md); a renamed key is not a lost one
  const RENAMED = p => p.replace(/(^|\.)Combat(\.|$)/, '$1Practical Magic$2').replace(/(^|\.)Remedial Combat(\.|$)/, '$1Remedial Practical Magic$2');
  const lost = Object.keys(L0).filter(p => !VOLATILE.test(p) && !(p in L1) && !(RENAMED(p) in L1) && !Object.keys(L1).some(q => q.startsWith(p + '.') || q.startsWith(RENAMED(p) + '.')));
  ok(!lost.length, `${f}: no field is lost (${Object.keys(L0).length} paths)` + (lost.length ? ': ' + lost.slice(0, 8).join(', ') : ''));
  const changed = Object.keys(L0).filter(p => story(p) && p in L1 && L1[p] !== L0[p] && !(typeof L0[p] === 'string' && L1[p] === L0[p].replace(/Combat/g, 'Practical Magic')));
  ok(!changed.length, `${f}: story values unchanged after a no-op update` + (changed.length ? ': ' + changed.slice(0, 8).map(p => `${p} ${JSON.stringify(L0[p])} -> ${JSON.stringify(L1[p])}`).join('; ') : ''));
  ok(S.$eng.ver === ver, `${f}: $eng.ver ${old.$eng && old.$eng.ver} -> ${S.$eng.ver}`);
  ok(Object.keys(S.Bonds).every(id => S.Bonds[id].Rank === old.Bonds[id].Rank && S.Bonds[id].Trust === old.Bonds[id].Trust), `${f}: every bond keeps its rank and Trust`);
  // ordinary play continues: an hour later, a talk with a bonded character
  const id = Object.keys(S.Bonds)[0], W = S.World;
  const T = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '23:00' }, { op: 'replace', path: '/Scene/Present', value: { [id]: { Note: '' } } },
    { op: 'insert', path: '/Interactions/-', value: { With: id, Kind: 'talk', Note: 'a late talk' } }]);
  ok(T.World.Time === '23:00' && T.Bonds[id].Rank >= S.Bonds[id].Rank && T.Journal.length >= S.Journal.length, `${f}: play continues (${id}, ${W.Month}/${W.Week} ${W.Day})`);
}
