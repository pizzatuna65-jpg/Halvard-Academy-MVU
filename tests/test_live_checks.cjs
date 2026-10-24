// The Eldrasil Black Box quest autopilot (no card change): the rules live in the Black Box repository
// (pizzatuna65-jpg/Eldrasil-BlackBox, data/eldrasil_checks.json; language version 1 in its src/checks.js, mirrored below). Each rule
// names one check line of docs/TEST_CHECKLIST.md by quest and line start. The rule checks run when the Black Box is found
// (BLACKBOX_DIR, or a clone beside this repository); tools/quest_ticks.py and audit_chat.py --blackbox are checked either way.
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), zlib = require('zlib');
const { ok, ROOT } = require('./harness.cjs');
console.log('Live-check rules (quest autopilot, Black Box)');

const BB = process.env.BLACKBOX_DIR || path.join(ROOT, '..', 'eldrasil-blackbox');
const RULES_FILE = path.join(BB, 'data', 'eldrasil_checks.json');
const R = fs.existsSync(RULES_FILE) ? JSON.parse(fs.readFileSync(RULES_FILE, 'utf8')) : null;
if (!R) console.log(`  (no Black Box at ${BB}: the rule checks are skipped; set BLACKBOX_DIR)`);

// ---- shape (Black Box src/checks.js, rules version 1)
const TEXT = ['prompt', 'reply', 'prose', 'user'], PATHS = ['state', 'before', 'record', 'signals'];
const SOURCES = [...TEXT, 'block', ...PATHS, 'present', 'lore'];
const OPS = ['match', 'not', 'count', 'exists', 'eq', 'ne', 'lt', 'gt', 'in', 'has', 'unchanged'];
const FIELDS = ['id', 'quest', 'line', 'mode', 'when', 'pass', 'scope', 'skip', 'needs', 'max', 'evidence', 'eventually', 'whole'];
const rx = src => { if (typeof src !== 'string' || src.length > 2000) return null; let f = 'ms', b = src; if (b.startsWith('(?i)')) { f += 'i'; b = b.slice(4); } try { return new RegExp(b, f); } catch { return null; } };
function cond(c, where, errs) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return errs.push(`${where}: not an object`);
  for (const k of ['all', 'any', 'none']) if (k in c) {
    if (!Array.isArray(c[k]) || !c[k].length) return errs.push(`${where}.${k}: needs a list`);
    return c[k].forEach((x, i) => cond(x, `${where}.${k}[${i}]`, errs));
  }
  const src = SOURCES.find(s => s in c);
  if (!src) return errs.push(`${where}: no source`);
  const ops = TEXT.includes(src) && c[src] && typeof c[src] === 'object' ? c[src] : Object.fromEntries(Object.entries(c).filter(([k]) => k !== src));
  for (const k of Object.keys(ops)) if (!OPS.includes(k)) errs.push(`${where}: unknown operator ${k}`);
  for (const k of ['match', 'not']) if (k in ops && !rx(ops[k])) errs.push(`${where}: bad pattern ${k}`);
  if ('count' in ops && !('match' in ops)) errs.push(`${where}: count needs match`);
  if ('unchanged' in ops && src !== 'state') errs.push(`${where}: unchanged on ${src}`);
  if (!TEXT.includes(src) && src !== 'lore' && typeof c[src] !== 'string') errs.push(`${where}: ${src} needs a name or path`);
}
const errs = [];
const ids = new Set();
if (R) {
ok(R.version === 1 && Array.isArray(R.checks) && R.checks.length >= 50, `rules version 1, ${R.checks.length} rules`);
for (const c of R.checks) {
  const where = c.id || '?';
  if (!c.id || ids.has(c.id)) errs.push(`${where}: missing or duplicate id`);
  ids.add(c.id);
  for (const k of Object.keys(c)) if (!FIELDS.includes(k)) errs.push(`${where}: unknown field ${k}`);
  if (typeof c.quest !== 'string' || typeof c.line !== 'string' || c.line.length < 12) errs.push(`${where}: quest and a line start of 12+ characters`);
  const mode = c.mode || 'auto';
  if (!['auto', 'review'].includes(mode)) errs.push(`${where}: mode`);
  if (mode === 'auto') cond(c.pass, `${where}.pass`, errs); else if (c.pass) errs.push(`${where}: a review rule has no pass`);
  if (c.when) cond(c.when, `${where}.when`, errs);
}
ok(!errs.length, 'every rule has the version 1 shape and compiles' + (errs.length ? ': ' + errs.slice(0, 5).join('; ') : ''));

// ---- each rule names exactly one check line under its quest
const lines = fs.readFileSync(path.join(ROOT, 'docs/TEST_CHECKLIST.md'), 'utf8').split('\n');
const checks = [];
let quest = null;
for (const l of lines) {
  const q = /^### (\S+)/.exec(l);
  if (q) { quest = q[1]; continue; }
  if (l.startsWith('## ')) quest = null;
  const m = /^\s*- \[[ x-]\] (.*)$/.exec(l);
  if (m && quest) checks.push([quest, m[1]]);
}
const bad = R.checks.filter(c => checks.filter(([q, t]) => q === c.quest && t.startsWith(c.line)).length !== 1);
ok(!bad.length, 'every rule names exactly one check line of its quest' + (bad.length ? ': ' + bad.map(c => `${c.id} (${c.quest}: ${c.line})`).join('; ') : ''));
const quests = new Set(R.checks.map(c => c.quest));
ok(['Q0.2', 'Q0.3', 'Q1.1', 'Q1.3', 'Q1.4', 'Q1.5', 'Q2.1', 'Q2.7', 'SQ-CACHE', 'SQ-W', 'SQ1'].every(q => quests.has(q)), 'Acts 0–2 and the side quests have rules');

}

// ---- quest_ticks.py and audit_chat.py --blackbox on a bundle
const PY = ['python3', 'python', 'py'].find(c => { const r = cp.spawnSync(c, ['-c', 'import sys; print(sys.version_info[0])'], { encoding: 'utf8' }); return r.status === 0 && /3/.test(r.stdout); });
if (!PY) { console.log('  (no Python 3 found: tool checks skipped)'); process.exit(0); }
const env = { ...process.env, PYTHONUTF8: '1' };
// Six rules as the Black Box shipped them (inline, so the tool checks run without the Black Box).
const rules = [{"id": "q0.3-no-400", "quest": "Q0.3", "line": "No error 400 \"Requests ending with a model turn\"", "needs": 10, "max": 1000, "pass": {"record": "status", "ne": 400}, "whole": true}, {"id": "q0.2-no-engine-error", "quest": "Q0.2", "line": "No \"Engine error\" line in the Log", "needs": 10, "max": 1000, "pass": {"signals": "engineError", "eq": false}}, {"id": "q1.1-tour-line", "quest": "Q1.1", "line": "`<now>` has the \"Entrance tour assignment", "needs": 2, "when": {"all": [{"state": "World._Event_today", "match": "Entrance Event"}, {"state": "World.Time", "match": "^(1[0-7]):"}]}, "pass": {"all": [{"block": "now", "match": "Entrance tour assignment \\(keep these same people through 18:00\\)"}, {"block": "campus_rules", "match": "Entrance"}]}}, {"id": "q1.1-tour-gone", "quest": "Q1.1", "line": "`<now>` has the \"Entrance tour assignment", "when": {"all": [{"state": "World.Month", "eq": 1}, {"state": "World.Week", "eq": 1}, {"state": "World.Day", "eq": "Tue"}]}, "pass": {"block": "now", "not": "Entrance tour assignment"}}, {"id": "q1.4-three-numbers", "quest": "Q1.4", "line": "Two risky attempts in one reply", "needs": 3, "when": {"block": "now", "match": "^Fortune \\("}, "pass": {"block": "now", "match": "^Fortune \\([^)]*\\): \\d+, then \\d+, then \\d+"}}, {"id": "q1.1-birthday", "quest": "Q1.1", "line": "Ask someone their birthday", "mode": "review", "when": {"user": {"match": "(?i)birthday"}}}];
const results = {
  'q0.3-no-400': { status: 'passed', seen: 12, passes: 12, fails: [], evidence: [{ recordId: 'a', mesId: 80 }] },
  'q0.2-no-engine-error': { status: 'passed', seen: 12, passes: 12, fails: [], evidence: [{ recordId: 'a', mesId: 80 }] },
  'q1.1-tour-line': { status: 'passed', seen: 3, passes: 3, fails: [], evidence: [{ recordId: 'b', mesId: 82 }] },
  'q1.1-tour-gone': { status: 'seen', seen: 0, passes: 0, fails: [], evidence: [] },
  'q1.4-three-numbers': { status: 'failed', seen: 4, passes: 3, fails: [{ recordId: 'c', mesId: 90, why: 'block now: no match /^Fortune/' }], evidence: [] },
  'q1.1-birthday': { status: 'review', seen: 1, passes: 0, fails: [], evidence: [{ recordId: 'd', mesId: 85 }] },
};
const bundle = { format: 'eldrasil-blackbox-bundle', version: 1, manifest: { chatId: 'c', cardVersion: '2.0.0', chatFrom: 0, chatMessages: 0 },
  quests: { card: 'Black Box 1.2.0', source: 'Black Box 1.2.0', version: 1, summary: {}, results, rules }, turns: [], texts: {}, chat: { header: {}, from: 0, messages: [] } };
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eld-qt-'));
const file = path.join(dir, 'b.json.gz'), list = path.join(dir, 'TEST_CHECKLIST.md');
fs.writeFileSync(file, zlib.gzipSync(JSON.stringify(bundle)));
fs.copyFileSync(path.join(ROOT, 'docs/TEST_CHECKLIST.md'), list);
const dry = cp.spawnSync(PY, [path.join(ROOT, 'tools/quest_ticks.py'), file, '--checklist', list], { encoding: 'utf8', env });
ok(dry.status === 0 && fs.readFileSync(list, 'utf8') === fs.readFileSync(path.join(ROOT, 'docs/TEST_CHECKLIST.md'), 'utf8'), 'dry run changes nothing' + (dry.status ? ': ' + dry.stderr.slice(-300) : ''));
ok(/\+- \[x\] No error 400/.test(dry.stdout) && !/\+- \[x\] `<now>` has the "Entrance tour/.test(dry.stdout), 'the diff ticks a whole passed check; the tour line waits for its second rule');
ok(!/\+- \[x\] No "Engine error" line/.test(dry.stdout) && /\+\s+✓ msg 80 \(autopilot, Black Box 1\.2\.0, the machine part\)/.test(dry.stdout), 'a check the rule covers only in part gets a note, not a tick');
if (R) ok(R.checks.filter(c => c.whole).length >= 5 && R.checks.every(c => c.whole === undefined || c.whole === true), 'some rules cover their whole check ("whole": true)');
ok(/\+\s+✗ msg 90 \(autopilot, Black Box 1\.2\.0\): block now: no match/.test(dry.stdout), 'a failure becomes a note under its line');
ok(/q1\.1-birthday, review\].*evidence msgs \[85\]/.test(dry.stderr), 'a review rule is listed with its evidence');
cp.spawnSync(PY, [path.join(ROOT, 'tools/quest_ticks.py'), file, '--checklist', list, '--write'], { encoding: 'utf8', env });
cp.spawnSync(PY, [path.join(ROOT, 'tools/quest_ticks.py'), file, '--checklist', list, '--write'], { encoding: 'utf8', env });
const after = fs.readFileSync(list, 'utf8');
ok(after.includes('- [x] No error 400') && !after.includes('- [x] No "Engine error"') && (after.match(/✓ msg 80 \(autopilot/g) || []).length === 2, '--write ticks once and notes once, run twice');
ok((after.match(/✗ msg 90 \(autopilot/g) || []).length === 1 && /- \[ \] Two risky attempts/.test(after), 'the failed check stays open with one note');
const rep = cp.spawnSync(PY, [path.join(ROOT, 'tools/audit_chat.py'), file, '--blackbox', '--no-drift'], { encoding: 'utf8', env });
ok(rep.status === 0 && rep.stdout.includes('### Quests (autopilot)') && /\| failed \| Q1\.4 \|.*msg 90/.test(rep.stdout), 'the Black Box report has the quests, failures first');
fs.rmSync(dir, { recursive: true, force: true });
