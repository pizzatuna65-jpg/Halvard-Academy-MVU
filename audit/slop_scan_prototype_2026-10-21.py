"""Quick offline slop/cliche scan of SillyTavern chat exports (read-only). Usage: python slop_scan.py <chat.jsonl> [...]"""
import json, re, sys
from collections import Counter, defaultdict

ROOT = 'D:/Halvard-Academy-MVU-main'
HIDDEN = re.compile(r'<(UpdateVariable|thinking|think|npc_thoughts|scene_plan|details|Analysis)\b.*?</\1>', re.S | re.I)
TAGS = re.compile(r'<[^>]{1,200}>')
QUOTE = re.compile(r'"([^"\n]{2,})"|\u201c([^\u201d\n]{2,})\u201d')
SAY = re.compile(r'<say(?::([A-Za-z\- ]+))?(?::[a-z]+)?>(.*?)</say>', re.S)
W = re.compile(r"[a-z']+")

CONTRAST = [
    re.compile(r"\bnot (?:just |only |merely |even )?[^.,;!?\"]{1,40}, but\b", re.I),
    re.compile(r"\b(?:it|that|this|he|she|they)(?:'s| is| was| wasn't| isn't)(?: not)? [^.!?\"]{1,40}[.\u2014-]+\s*(?:it|that|this|he|she|they)(?:'s| is| was)\b", re.I),
    re.compile(r"\b(?:didn't|doesn't|don't|wasn't|isn't) [^.!?\"]{1,40}\.\s*(?:instead|rather)\b", re.I),
    re.compile(r"\bnot [^.,;!?\"]{1,30}\s*\u2014\s*(?:just |but )?[^.,;!?\"]{1,30}", re.I),
]
LEX = ['ledger', 'arithmetic', 'load-bearing', 'structural', 'logistics', 'a beat', 'beat of silence', 'it lands', 'grounding',
       'anchor', 'humming', 'grease', 'scree', 'timber', 'unvarnished', 'sovereign', 'filed away', 'calculus', 'inventory',
       'something shifts', 'something shifted', 'the air shifts', 'the air thickens', 'heavy silence', 'weight of',
       'tell me', 'your choice', 'say that again', 'for now', 'noted']
TICS = ['smirk', 'chuckle', 'snort', 'jaw tighten', 'jaw clench', 'eyes soften', 'lips quirk', 'quirks', 'shifts her weight',
        'shifts his weight', 'breath he didn', 'breath she didn', 'exhales', 'tilts her head', 'tilts his head', 'arches an eyebrow',
        'raises an eyebrow', 'something like', 'a ghost of a smile', 'barely above a whisper', 'voice low', 'leans back', 'leans in']


def story(mes):
    t = HIDDEN.sub(' ', mes or '')
    return t


COLOR = re.compile(r'<([a-z]+)>("[^"]{2,}")</\1>')
USERP = re.compile(r'^\s*(?:<[^>]+>)?\s*(?:You|Your)\b')
USER_NAMES = {'charles', '{{user}}'}


def dialogue(t):
    t = '\n'.join(p for p in t.split('\n') if not USERP.match(p))
    lines = [(m.group(1) or '?', TAGS.sub('', m.group(2))) for m in SAY.finditer(t) if (m.group(1) or '').lower() not in USER_NAMES]
    if not lines:
        lines = [(m.group(1), m.group(2)) for m in COLOR.finditer(t)]
    if not lines:
        lines = [('?', a or b) for a, b in QUOTE.findall(TAGS.sub('', t))]
    return lines


def grams(text, n):
    ws = W.findall(text.lower())
    return {' '.join(ws[i:i + n]) for i in range(len(ws) - n + 1)}


def load_examples():
    try:
        d = json.load(open(ROOT + '/data/npc_canon.json', encoding='utf-8'))['voice']
    except Exception:
        return {}
    ex = {}
    for nid, v in d.items():
        q = ' '.join(a or b for s in v.get('scenes', []) for a, b in QUOTE.findall(s))
        ex[nid] = grams(q, 5)
    return ex


STOP5 = {'i don t know what', 'you don t have to', 'i don t want to', 'what do you want', 'do you want to'}


def scan(path):
    msgs = [json.loads(l) for l in open(path, encoding='utf-8') if l.strip()]
    msgs = [m for m in msgs if 'mes' in m]
    ex = load_examples()
    n = words = q_rep = multi_q = contrast = echo = emd = 0
    lex, tic, verb, endq, endnarr = Counter(), Counter(), Counter(), 0, 0
    seen6 = defaultdict(set)
    last_user = ''
    contrast_ex, echo_ex, verb_ex = [], [], []
    for i, m in enumerate(msgs):
        if m.get('is_system'):
            continue
        if m.get('is_user'):
            last_user = story(m['mes'])
            continue
        t = story(m['mes']); plain = TAGS.sub('', t)
        if len(plain.split()) < 30:
            continue
        n += 1; wc = len(plain.split()); words += wc
        emd += plain.count('\u2014')
        low = plain.lower()
        for k in LEX:
            lex[k] += len(re.findall(r'\b' + re.escape(k) + r'\b', low))
        for k in TICS:
            tic[k] += low.count(k)
        for rx in CONTRAST:
            for mm in rx.finditer(plain):
                contrast += 1
                if len(contrast_ex) < 6:
                    contrast_ex.append((i, mm.group(0)[:90]))
        dl = dialogue(t)
        qs = sum(s.count('?') for _, s in dl)
        if qs:
            q_rep += 1
        if qs > 1:
            multi_q += 1
        said = ' '.join(s for _, s in dl)
        ug = grams(TAGS.sub('', last_user), 4)
        hit = [g for g in grams(said, 4) if g in ug]
        if hit:
            echo += 1
            if len(echo_ex) < 6:
                echo_ex.append((i, hit[0]))
        for who, s in dl:
            g = grams(s, 5)
            for nid, eg in ex.items():
                h = g & eg
                if h:
                    verb[nid] += 1
                    if len(verb_ex) < 8:
                        verb_ex.append((i, nid, sorted(h)[0]))
        for g in grams(plain, 6):
            seen6[g].add(i)
        paras = [p.strip() for p in plain.split('\n') if p.strip()]
        if paras:
            lastp = paras[-1]
            if lastp.rstrip('"\u201d ').endswith('?'):
                endq += 1
            if not QUOTE.search(lastp):
                endnarr += 1
    rep = sorted(((len(v), g) for g, v in seen6.items() if len(v) >= 3 and g not in STOP5), reverse=True)[:15]
    k = words / 1000 or 1
    print(f'== {path.split("/")[-1]}')
    print(f'replies {n}, words {words} (avg {words // max(n, 1)})')
    print(f'contrastive negation {contrast} ({contrast / k:.2f}/1k words) e.g. {contrast_ex}')
    print(f'replies with an NPC question {q_rep} ({100 * q_rep // max(n, 1)}%), with 2+ questions {multi_q} ({100 * multi_q // max(n, 1)}%)')
    print(f'echo (4-gram of the player message inside NPC dialogue) {echo} replies ({100 * echo // max(n, 1)}%) e.g. {echo_ex}')
    print(f'voice-example 5-gram reuse {sum(verb.values())} lines {dict(verb.most_common(8))} e.g. {verb_ex}')
    print(f'ends with a question {endq} ({100 * endq // max(n, 1)}%), last paragraph narration only {endnarr} ({100 * endnarr // max(n, 1)}%)')
    print(f'em dash {emd / k:.1f}/1k words')
    print('stock lexicon /1k:', {a: round(b / k, 2) for a, b in lex.most_common(12) if b})
    print('body tics /1k:', {a: round(b / k, 2) for a, b in tic.most_common(12) if b})
    print('6-grams in 3+ replies:', [(c, g) for c, g in rep])
    print()


for p in sys.argv[1:]:
    scan(p)
