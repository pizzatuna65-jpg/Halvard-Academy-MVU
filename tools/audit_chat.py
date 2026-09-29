#!/usr/bin/env python3
"""Batch 0 (P10): character-drift audit for exported SillyTavern chats (.jsonl). Offline; nothing here goes into the card.

Usage:
  python3 tools/audit_chat.py <chat.jsonl> [--window 25] [--out report.md] [--json findings.json] [--user-name NAME] [--voice rules.json]

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

Works with old non-MVU chats too (pronoun, name, secret and voice checks run; present and locked need the MVU state, read from
the message's variables or, failing that, from the <UpdateVariable> patches in the text).
"""
import argparse, glob, json, os, re, sys
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
    a = ap.parse_args(argv)
    res = audit(a.chat, a.window, a.user_name, a.voice)
    md = report_md(res)
    if a.out:
        open(a.out, 'w', encoding='utf-8', newline='\n').write(md)
    else:
        sys.stdout.write(md)
    if a.json:
        open(a.json, 'w', encoding='utf-8', newline='\n').write(json.dumps(res, ensure_ascii=False, indent=1))
    print(f"audit: {len(res['findings'])} findings in {res['messages']} messages", file=sys.stderr)


if __name__ == '__main__':
    main()
