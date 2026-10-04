#!/usr/bin/env python3
"""Batch 0 (P10): character-drift audit for exported SillyTavern chats (.jsonl). Offline; nothing here goes into the card.

Usage:
  python3 tools/audit_chat.py <chat.jsonl> [--window 25] [--out report.md] [--json findings.json] [--user-name NAME] [--voice rules.json]
                              [--mechanics] [--no-drift]

Reads the canon from the project (data/npcs.json, src/worldbook/content/<uid>.txt, data/voice_rules.json) and reports, per NPC
and per window of messages, where the narrator drifted:
  pronoun   a sentence about one NPC uses the other gender's pronouns (suspect, check by hand)
  name      a capitalised word one letter away from an NPC's first name or surname (a misspelt name)
  present   an NPC speaks in a reply but is not in Scene.Present after it (MVU chats only: needs the state)
  secret    a reply names an NPC and uses three or more words found only in that NPC's <narrator_only> lore
            (MVU chats: skipped once a secret of that NPC is in Campus_State.Secrets_revealed)
  locked    an NPC says two or more words from a dossier field their bond rank has not opened yet (MVU chats only)
  voice     an NPC's line matches a "never" pattern in data/voice_rules.json (filled by the canon waves, Batch G)
Every check is a heuristic: the report is a list of places to read, not a verdict.

--mechanics (1.53.1, narrator-load audit U10) adds how the narrator handled the engine, per reply with an update block: its size
(operations, lines, about-tokens, Analysis lines), engine work the narrator did itself (a Rank or bond record written, sums in the
Analysis, stamina taken for the weather, the calendar turned by hand, a legacy reputation entry, a read-only path), and, by replaying
every block through the CURRENT engine (tools/replay_chat.cjs, needs node), what the engine had to correct: a malformed block it
repaired or could not read, a list written under /Player, a change the schema dropped, and its _Log corrections (time, a new bond's
Trust, reverted writes, unknown names, refused reports), the reminders it raised and the time each reply moved. 0 prompt tokens.
--no-drift skips the character-drift checks.

Works with old non-MVU chats too (pronoun, name, secret and voice checks run; present and locked need the MVU state, read from
the message's variables or, failing that, from the <UpdateVariable> patches in the text).
"""
import argparse, glob, json, os, re, subprocess, sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
NO = re.compile(r'<narrator_only>(.*?)</narrator_only>', re.S)
WORD = re.compile(r"[A-Za-z][A-Za-z'\-]+")
QUOTE = re.compile(r'"([^"\n]{2,})"|“([^”\n]{2,})”|「([^」\n]{2,})」')
MALE, FEMALE = {'he', 'him', 'his', 'himself'}, {'she', 'her', 'hers', 'herself'}
# Only pronouns that must point back at the sentence's subject count ("Etnie shook his head", "Etnie steadied himself",
# "Etnie ..., he said"). A plain "he" after a name is usually someone else ({{user}}, a stranger), so it is never flagged.
SELF_REF = re.compile(
    r"^[^.!?;:]{0,60}?\b(?:"
    r"(?:shake|shook|shakes|shaking|nod|nods|nodded|nodding|tilt|tilts|tilted|tilting|scratch|scratches|scratched|rub|rubs|rubbed|"
    r"run|runs|ran|push|pushes|pushed|tuck|tucks|tucked|lower|lowers|lowered|raise|raises|raised|clear|clears|cleared|cross|crosses|"
    r"crossed|fold|folds|folded|bite|bites|bit|biting|duck|ducks|ducked|hang|hangs|hung|turn|turns|turned|roll|rolls|rolled)\s+"
    r"(?P<poss>his|her)\s+(?:head|hair|neck|chin|throat|arms|hands|hand|lip|lips|eyes|brow|shoulders|face)"
    r"|(?P<refl>himself|herself)"
    r"|,\s*(?P<subj>he|she)\s+(?:said|says|added|adds|muttered|mutters|replied|replies|whispered|whispers|asked|asks))\b", re.I)
SECRET_MIN = 3   # words from one NPC's <narrator_only> lore in one reply before it is reported (2 matched ordinary prose too often)
HIDDEN_BLOCKS = re.compile(r'<(UpdateVariable|thinking|think|scene_plan|details)\b.*?</\1>', re.S | re.I)
TAGS = re.compile(r'<[^>]{1,200}>')


# ---------------------------------------------------------------- canon
def load_canon(voice_path=None):
    npcs = json.load(open(P('data/npcs.json'), encoding='utf-8'))
    files = {os.path.basename(f)[:-4]: open(f, encoding='utf-8').read() for f in glob.glob(P('src/worldbook/content', '*.txt'))}
    doc_freq = Counter()
    for txt in files.values():
        doc_freq.update({w.lower() for w in WORD.findall(txt)})
    rare = lambda w: len(w) >= 6 and doc_freq[w] <= 2
    canon = {}
    for nid, n in npcs.items():
        lore = files.get(str(n['uid_card']), '')
        public = NO.sub(' ', lore)
        pub_words = {w.lower() for w in WORD.findall(public)}
        secret = {w.lower() for blk in NO.findall(lore) for w in WORD.findall(blk)}
        secret = {w for w in secret if rare(w) and w not in pub_words}
        open_words = {w.lower() for f in n.get('fields', []) if f.get('rank', 0) < 5 for w in WORD.findall(f.get('text', ''))}
        locked = []
        for f in n.get('fields', []):
            if f.get('rank', 0) >= 5 and f.get('rank', 0) < 99:
                terms = {w.lower() for w in WORD.findall(f.get('text', ''))}
                terms = {w for w in terms if rare(w) and w not in open_words}
                if len(terms) >= 2:
                    locked.append({'label': f['label'], 'rank': f['rank'], 'terms': terms})
        forms = {nid, n['name']} | ({n['nickname']} if n.get('nickname') else set())
        forms |= {k for k in n.get('keys', []) if k[:1].isupper() and len(k.split()) <= 2 and not re.search(r'club|library|council|society|troupe', k, re.I)}
        parts = {p for f in (nid, n['name']) for p in f.split() if len(p) >= 3}
        canon[nid] = {'gender': n.get('gender'), 'forms': forms, 'parts': parts, 'secret': secret, 'locked': locked}
    # a surname shared by two NPCs (the Villeneuves) is not an alias of either
    part_owner = Counter(p for c in canon.values() for p in c['parts'])
    alias = {}
    for nid, c in canon.items():
        for f in sorted(c['forms'] | {p for p in c['parts'] if part_owner[p] == 1}, key=len, reverse=True):
            alias.setdefault(f, nid)
    known = {w for txt in files.values() for w in WORD.findall(txt) if w[:1].isupper()}
    try:
        voice = json.load(open(voice_path or P('data/voice_rules.json'), encoding='utf-8'))
    except FileNotFoundError:
        voice = {}
    voice = {k: v for k, v in voice.items() if not k.startswith('_')}
    return canon, alias, known, voice


def alias_regex(alias):
    names = sorted(alias, key=len, reverse=True)
    return re.compile(r'(?<![A-Za-z])(' + '|'.join(re.escape(a) for a in names) + r')(?![A-Za-z])')


# ---------------------------------------------------------------- chat + state
def read_chat(path):
    lines = [l for l in open(path, encoding='utf-8').read().splitlines() if l.strip()]
    head = json.loads(lines[0]) if lines else {}
    msgs = [json.loads(l) for l in lines[1:]]
    return head, msgs


def message_state(m):
    """stat_data after this message: MVU keeps it in the message variables (per swipe)."""
    v = m.get('variables')
    if isinstance(v, list) and v:
        sid = m.get('swipe_id') or 0
        v = v[sid] if sid < len(v) else v[-1]
    if isinstance(v, dict) and isinstance(v.get('stat_data'), dict):
        return v['stat_data']
    return None


def patch_ops(text):
    ops = []
    for blk in re.findall(r'<JSONPatch>(.*?)</JSONPatch>', text or '', re.S):
        try:
            got = json.loads(blk.strip())
            ops += got if isinstance(got, list) else []
        except ValueError:
            pass
    return ops


class Tracker:
    """Follows Scene.Present, bond ranks and revealed secrets through a chat (variables first, else patches)."""
    def __init__(self):
        self.present, self.rank, self.revealed, self.seen_state = set(), {}, set(), False

    def step(self, m):
        st = message_state(m)
        if st is not None:
            self.seen_state = True
            self.present = set(((st.get('Scene') or {}).get('Present') or {}).keys())
            self.rank = {k: (b or {}).get('Rank', 0) for k, b in (st.get('Bonds') or {}).items()}
            self.revealed = set((st.get('Campus_State') or {}).get('Secrets_revealed') or [])
            return
        for op in patch_ops(m.get('mes')):
            path, val, kind = str(op.get('path', '')), op.get('value'), op.get('op')
            if path == '/Scene/Present' and isinstance(val, dict) and kind in ('replace', 'add', 'insert'):
                self.present = set(val); self.seen_state = True
            elif path.startswith('/Scene/Present/'):
                key = path.split('/')[3]
                (self.present.discard if kind == 'remove' else self.present.add)(key); self.seen_state = True
            elif re.fullmatch(r'/Bonds/[^/]+/Rank', path) and isinstance(val, (int, float)):
                self.rank[path.split('/')[2]] = int(val); self.seen_state = True
            elif re.fullmatch(r'/Bonds/[^/]+', path) and isinstance(val, dict) and 'Rank' in val:
                self.rank[path.split('/')[2]] = int(val.get('Rank') or 0); self.seen_state = True
            elif path.startswith('/Campus_State/Secrets_revealed') and isinstance(val, str):
                self.revealed.add(val); self.seen_state = True


# ---------------------------------------------------------------- checks
def story_text(mes):
    return TAGS.sub(' ', HIDDEN_BLOCKS.sub(' ', mes or ''))


def lev1(a, b):
    if a == b or abs(len(a) - len(b)) > 1:
        return False
    if len(a) == len(b):
        return sum(x != y for x, y in zip(a, b)) == 1
    s, l = (a, b) if len(a) < len(b) else (b, a)
    return any(l[:i] + l[i + 1:] == s for i in range(len(l)))


def speakers(paragraph, rx, alias):
    """Who speaks in a paragraph: the only NPC named outside the quotes (a heuristic)."""
    if not QUOTE.search(paragraph):
        return None, []
    outside = QUOTE.sub(' ', paragraph)
    who = {alias[m.group(1)] for m in rx.finditer(outside)}
    lines = [next(g for g in q if g) for q in QUOTE.findall(paragraph)]
    return (next(iter(who)) if len(who) == 1 else None), lines


def audit(path, window=25, user_name=None, voice_path=None):
    canon, alias, known, voice = load_canon(voice_path)
    rx = alias_regex(alias)
    head, msgs = read_chat(path)
    user_name = user_name or head.get('user_name') or ''
    parts = {p: nid for nid, c in canon.items() for p in c['parts'] if len(p) >= 5}
    tr, findings = Tracker(), []
    # words the chat also writes in lower case are ordinary words ("Strip" at the start of a sentence), not misspelt names
    lower_vocab = {w for m in msgs for w in WORD.findall(story_text(m.get('mes'))) if w[:1].islower()}

    def add(i, nid, kind, detail, snippet):
        findings.append({'msg': i, 'npc': nid, 'check': kind, 'detail': detail, 'snippet': re.sub(r'\s+', ' ', snippet)[:140]})

    for i, m in enumerate(msgs, start=1):
        tr.step(m)
        if m.get('is_user') or m.get('is_system'):
            continue
        text = story_text(m.get('mes'))
        paragraphs = [p for p in re.split(r'\n\s*\n|\n', text) if p.strip()]
        spoke = set()
        for para in paragraphs:
            who, lines = speakers(para, rx, alias)
            if who:
                spoke.add(who)
                for rule in (voice.get(who) or {}).get('never', []):
                    if any(re.search(rule['rx'], ln) for ln in lines):
                        add(i, who, 'voice', rule.get('why', rule['rx']), ' / '.join(lines))
                if tr.seen_state:
                    said = {w.lower() for ln in lines for w in WORD.findall(ln)}
                    for f in canon[who]['locked']:
                        hit = sorted(f['terms'] & said)
                        if len(hit) >= 2 and tr.rank.get(who, 0) < f['rank']:
                            add(i, who, 'locked', f"{f['label']} (Rank {f['rank']}, bond at {tr.rank.get(who, 0)}): {', '.join(hit)}", ' / '.join(lines))
            # pronouns: sentences that name exactly one NPC (and not the player)
            for sent in re.split(r'(?<=[.!?])\s+', QUOTE.sub(' ', para)):
                named = {alias[x.group(1)] for x in rx.finditer(sent)}
                if len(named) != 1 or (user_name and user_name in sent):
                    continue
                nid = next(iter(named)); g = canon[nid]['gender']
                hit = rx.search(sent)
                if sent[hit.end():hit.end() + 2] == "'s" or re.search(r"\bthoughts?\b", sent[:hit.start() + 40], re.I):
                    continue  # "Etnie's sleeve", "Etnie's true thoughts: he ..." are about someone else
                if len(WORD.findall(sent[:hit.start()])) > 2:
                    continue  # the NPC is not the subject ("Bryne leans there, watching Trixie ... shaking his head")
                m_ = SELF_REF.search(sent[hit.end():])
                if not m_:
                    continue
                pron = (m_.group('poss') or m_.group('refl') or m_.group('subj')).lower()
                wrong = MALE if g == 'F' else FEMALE if g == 'M' else set()
                if pron in wrong:
                    add(i, nid, 'pronoun', f"{'she/her' if g == 'F' else 'he/him'} expected, found \"{pron}\"", sent)
        if tr.seen_state:
            for nid in sorted(spoke - tr.present):
                add(i, nid, 'present', 'speaks but is not in Scene.Present after this reply', text[:140])
        words = {w.lower() for w in WORD.findall(text)}
        for nid in {alias[x.group(1)] for x in rx.finditer(text)}:
            hit = sorted(canon[nid]['secret'] & words)
            if len(hit) >= SECRET_MIN and not any(r.startswith(nid + '.') for r in tr.revealed):
                add(i, nid, 'secret', ', '.join(hit), text[:140])
        for w in {w for w in WORD.findall(text) if w[:1].isupper() and len(w) >= 5 and w not in known and w not in alias
                  and w != user_name and w.lower() not in lower_vocab}:
            near = [p for p in parts if lev1(w, p)]
            if near:
                add(i, parts[near[0]], 'name', f'"{w}" looks like "{near[0]}"', w)
    return {'chat': os.path.basename(path), 'messages': len(msgs), 'window': window, 'mvu_state': tr.seen_state, 'findings': findings}


# ---------------------------------------------------------------- mechanics (1.53.1, U10)
UPDATE = re.compile(r'<UpdateVariable>(.*?)(?:</UpdateVariable>|$)', re.S | re.I)
ANALYSIS = re.compile(r'<Analysis>(.*?)</Analysis>', re.S | re.I)
SUM = re.compile(r'\d+(?:\.\d+)?\s*[+\-\u2212]\s*\d+(?:\.\d+)?\s*=\s*-?\d')
WEATHERY = re.compile(r'\b(?:chilled|overheated|cold|wind|gale|weather|rain|snow|soaked)\b', re.I)
# engine work the narrator did itself, judged from the block alone
DID = [
    ('rank', 'wrote a bond Rank, XP or Progress', lambda o, a: re.fullmatch(r'/Bonds/[^/]+/(?:Rank|XP|Progress)', o['path'])),
    ('bond_record', 'inserted a whole bond record', lambda o, a: re.fullmatch(r'/Bonds/[^/]+', o['path']) and isinstance(o.get('value'), dict)),
    ('max', 'wrote Mana_max or Stamina_max', lambda o, a: re.search(r'/Vitals/(?:Mana|Stamina)_max$', o['path'])),
    ('calendar', 'turned Week, Month or Year by hand', lambda o, a: re.fullmatch(r'/World/(?:Week|Month|Year)', o['path'])),
    ('legacy_rep', 'used the legacy reputation form (XP)', lambda o, a: o['path'].startswith('/Rep_events') and isinstance(o.get('value'), dict) and 'XP' in o['value']),
    ('readonly', 'wrote a "_" or "$" field', lambda o, a: any(x[:1] in '_$' for x in o['path'].strip('/').split('/') if x)),
]
DID_TEXT = {k: t for k, t, _ in DID}
DID_TEXT.update({'sums': 'did sums in the Analysis', 'weather_stamina': 'took stamina for the weather', 'paid_twice': 'changed Points next to a /Purchases entry'})
# the engine's _Log lines that are corrections, first match wins; any other line is information
FIX = [('time', 'time or date corrected', re.compile(r'cannot move backwards|went back from|was not reset|Time moved \d+ days|could not be read', re.I)),
       ('bond_new', 'a new bond\'s written Trust replaced', re.compile(r'is new: Trust starts', re.I)),
       ('reverted', 'a write reverted', re.compile(r'reverted|read-only|grows only through', re.I)),
       ('unknown', 'an unknown name or kind', re.compile(r'\bunknown\b|names no known', re.I)),
       ('refused', 'a report or record refused', re.compile(r'not recorded|was not kept|not counted|was removed|removed from Scene|were kept|nothing was|nothing changed', re.I))]
FIX_TEXT = {k: t for k, t, _ in FIX}


def block_stats(text):
    m = UPDATE.search(text or '')
    if not m:
        return None
    body = m.group(1)
    an = ANALYSIS.search(body)
    alines = [l for l in (an.group(1).splitlines() if an else []) if l.strip()]
    ops = [o for o in patch_ops(text) if isinstance(o, dict) and isinstance(o.get('path'), str)]
    did = Counter()
    for o in ops:
        for k, _, f in DID:
            if f(o, alines):
                did[k] += 1
    atext = '\n'.join(alines)
    if SUM.search(atext):
        did['sums'] += 1
    if any('stamina' in l.lower() and WEATHERY.search(l) for l in alines):
        did['weather_stamina'] += 1
    if any(o['path'].startswith('/Purchases') for o in ops) and any(o['path'] == '/Player/Wallet/Points' for o in ops):
        did['paid_twice'] += 1
    return {'lines': len([l for l in body.splitlines() if l.strip()]), 'chars': len(body), 'analysis': len(alines), 'ops_text': len(ops), 'did': dict(did)}


def replay(path):
    try:
        r = subprocess.run(['node', P('tools', 'replay_chat.cjs'), path], capture_output=True, text=True, encoding='utf-8', timeout=900)
        return json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else {'error': (r.stderr or '').strip()[-300:]}
    except (OSError, ValueError, subprocess.TimeoutExpired) as e:
        return {'error': str(e)[:300]}


def fix_kind(line):
    return next((k for k, _, rx in FIX if rx.search(line)), None)


def mechanics(path, use_replay=True):
    _, msgs = read_chat(path)
    rows = {}
    for i, m in enumerate(msgs, start=1):
        if m.get('is_user') or m.get('is_system'):
            continue
        st = block_stats(m.get('mes'))
        if st:
            rows[i] = {'msg': i, **st}
    rp = replay(path) if use_replay else {'error': 'not run'}
    for r in rp.get('replies', []):
        row = rows.setdefault(r['msg'], {'msg': r['msg'], 'did': {}})
        fixes = Counter(k for k in (fix_kind(l) for l in r.get('log', [])) if k)
        row.update({'read': r.get('read'), 'ops': r.get('ops'), 'stray': len(r.get('stray', [])), 'dropped': len(r.get('dropped', [])),
                    'fixes': dict(fixes), 'fix_lines': [l for l in r.get('log', []) if fix_kind(l)], 'missed': len(r.get('missed', [])),
                    'minutes': r.get('minutes', 0), 'at': r.get('at', ''), 'error': r.get('error', '')})
    return {'chat': os.path.basename(path), 'replay': 'from ' + rp['start'] if 'start' in rp else 'skipped: ' + rp.get('error', ''),
            'rows': [rows[k] for k in sorted(rows)]}


def mechanics_md(mx):
    R = mx['rows']
    out = ['## Mechanics (how the narrator handled the engine)', '',
           f"{len(R)} replies with an update block. Replay through the current engine: {mx['replay']}.", '']
    if not R:
        return '\n'.join(out) + '\n'
    avg = lambda xs: round(sum(xs) / len(xs), 1) if xs else 0
    g = lambda k: [r.get(k) for r in R if isinstance(r.get(k), (int, float))]
    did, fixes = Counter(), Counter()
    for r in R:
        did.update(r.get('did') or {}); fixes.update(r.get('fixes') or {})
    reads = Counter(r.get('read') for r in R if r.get('read'))
    mins = g('minutes')
    out += ['| Measure | Value |', '|---|---|',
            f"| operations per block | avg {avg(g('ops') or g('ops_text'))}, max {max(g('ops') or g('ops_text') or [0])} |",
            f"| block lines | avg {avg(g('lines'))}, max {max(g('lines') or [0])} |",
            f"| block size (about tokens, chars / 3.6) | avg {round(avg(g('chars')) / 3.6)}, max {round(max(g('chars') or [0]) / 3.6)} |",
            f"| Analysis lines | avg {avg(g('analysis'))}, max {max(g('analysis') or [0])} |",
            f"| blocks repaired by the engine / unreadable | {reads.get('repaired', 0)} / {reads.get('unreadable', 0)} |",
            f"| lists written under /Player (moved) | {sum(g('stray'))} |",
            f"| changes the schema dropped | {sum(g('dropped'))} |",
            f"| reminders raised (possibly missed) | {sum(g('missed'))} |",
            f"| time per reply (minutes) | avg {avg(mins)}, max {max(mins or [0])} |", '']
    out += ['| Engine work the narrator did itself | Replies |', '|---|---|'] + \
           ([f'| {DID_TEXT.get(k, k)} | {v} |' for k, v in did.most_common()] or ['| none | 0 |']) + ['']
    out += ['| Engine corrections (replay _Log) | Count |', '|---|---|'] + \
           ([f'| {FIX_TEXT.get(k, k)} | {v} |' for k, v in fixes.most_common()] or ['| none | 0 |']) + ['']
    out += ['### Per reply', '', '| msg | ops | lines | Analysis | read | did itself | corrections | reminders | min |', '|---|---|---|---|---|---|---|---|---|']
    for r in R:
        out.append(f"| {r['msg']} | {r.get('ops', r.get('ops_text', ''))} | {r.get('lines', '')} | {r.get('analysis', '')} | {r.get('read', '')} | "
                   f"{', '.join(f'{k} {v}' for k, v in (r.get('did') or {}).items())} | {', '.join(f'{k} {v}' for k, v in (r.get('fixes') or {}).items())} | "
                   f"{r.get('missed', '') or ''} | {r.get('minutes', '')} |")
    lines = [(r['msg'], l) for r in R for l in r.get('fix_lines', [])]
    if lines:
        out += ['', '### Correction lines', ''] + [f'- msg {m}: {l[:200]}' for m, l in lines]
    return '\n'.join(out) + '\n'


# ---------------------------------------------------------------- report
def report_md(res):
    F, W = res['findings'], res['window']
    out = [f"# Drift audit: {res['chat']}", '',
           f"{res['messages']} messages, window {W}. MVU state found: {'yes' if res['mvu_state'] else 'no (present and locked checks skipped)'}.",
           f"{len(F)} findings. Heuristics: read each one before calling it drift.", '']
    by_check = Counter(f['check'] for f in F)
    out += ['| Check | Findings |', '|---|---|'] + [f'| {k} | {v} |' for k, v in sorted(by_check.items())] + ['']
    per = defaultdict(lambda: defaultdict(int))
    for f in F:
        per[f['npc']][(f['msg'] - 1) // W] += 1
    if per:
        nwin = (res['messages'] - 1) // W + 1
        out += ['## Per NPC per window (first message of each window)', '',
                '| NPC | first finding | ' + ' | '.join(str(k * W + 1) for k in range(nwin)) + ' |',
                '|---|---|' + '---|' * nwin]
        for nid in sorted(per, key=lambda n: -sum(per[n].values())):
            first = min(f['msg'] for f in F if f['npc'] == nid)
            out.append(f'| {nid} | {first} | ' + ' | '.join(str(per[nid].get(k, '')) for k in range(nwin)) + ' |')
        out.append('')
    out += ['## Findings', '']
    for f in F:
        out.append(f"- msg {f['msg']} · **{f['npc']}** · {f['check']}: {f['detail']}  \n  > {f['snippet']}")
    return '\n'.join(out) + '\n'


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('chat'); ap.add_argument('--window', type=int, default=25)
    ap.add_argument('--out'); ap.add_argument('--json'); ap.add_argument('--user-name')
    ap.add_argument('--voice', help='voice rules file (default data/voice_rules.json)')
    ap.add_argument('--mechanics', action='store_true', help='add the mechanics report (replays the blocks through the current engine)')
    ap.add_argument('--no-drift', action='store_true', help='skip the character-drift checks')
    a = ap.parse_args(argv)
    res = {'chat': os.path.basename(a.chat), 'findings': []} if a.no_drift else audit(a.chat, a.window, a.user_name, a.voice)
    md = '' if a.no_drift else report_md(res)
    if a.mechanics:
        res['mechanics'] = mechanics(a.chat)
        md = (md + '\n' if md else f"# Mechanics audit: {res['chat']}\n\n") + mechanics_md(res['mechanics'])
    if a.out:
        open(a.out, 'w', encoding='utf-8', newline='\n').write(md)
    else:
        sys.stdout.write(md)
    if a.json:
        open(a.json, 'w', encoding='utf-8', newline='\n').write(json.dumps(res, ensure_ascii=False, indent=1))
    print(f"audit: {len(res['findings'])} findings" + (f" in {res['messages']} messages" if 'messages' in res else '')
          + (f", {len(res['mechanics']['rows'])} update blocks" if 'mechanics' in res else ''), file=sys.stderr)


if __name__ == '__main__':
    main()
