"""Audit slop scanner: card text, lore entries, custom (EJS) entries, prompt files for the memory extensions, name pool.
Prints per-pattern counts and examples with their source. Prose-like text only is judged for prose slop."""
import json, os, re, sys, collections
sys.stdout.reconfigure(encoding='utf-8')
R = 'D:/Halvard-Academy-MVU-main/'
src = []   # (source label, text)
card = json.load(open(R + 'src/card/card.json', encoding='utf-8'))
for k in ('description', 'first_mes'):
    src.append((f'card.{k}', card[k]))
idx = {e['uid']: e for e in json.load(open(R + 'src/worldbook/index.json', encoding='utf-8'))}
for uid, e in idx.items():
    src.append((f'lore {uid} {e.get("comment","")[:40]}', open(R + f'src/worldbook/content/{uid}.txt', encoding='utf-8').read()))
cidx = {e['uid']: e for e in json.load(open(R + 'src/worldbook/custom/index.json', encoding='utf-8'))}
for uid, e in cidx.items():
    t = open(R + f'src/worldbook/custom/content/{uid}.txt', encoding='utf-8').read()
    # text outside EJS tags + string literals inside them
    outside = re.sub(r'<%[\s\S]*?%>', ' ', t)
    lits = ' \n'.join(m.group(2) for m in re.finditer(r"(['`])((?:\\.|(?!\1).){25,}?)\1", ''.join(re.findall(r'<%[\s\S]*?%>', t))))
    src.append((f'custom {uid} {e.get("comment","")[:40]}', outside + '\n' + lits))
for f in ('src/vectfox/vectfox_eventbase_prompt.txt', 'src/summaryception/summaryception_prompt.txt', 'src/summaryception/summaryception_system_prompt.txt', 'src/summaryception/summaryception_injection_template.txt'):
    src.append((f, open(R + f, encoding='utf-8').read()))

WORDS = ['ledger', 'arithmetic', 'load-bearing', 'structural integrity', 'logistics', 'padded', 'grounding', 'humming', 'hummed', 'menace',
         'grease', 'scree', 'timber', 'unvarnished', 'sovereign', 'flicker', 'flickered', 'flickering', 'flickers', 'leaned', 'muttered', 'gaze',
         'grinned', 'gestured', 'murmured', 'murmurs', 'nodded', 'glint', 'hesitated', 'whispered', 'blinked', 'faintly', 'unreadable', 'shimmered',
         'unsettlingly', 'stammered', 'delve', 'tapestry', 'testament', 'pivotal', 'vibrant', 'intricate', 'interplay', 'meticulous', 'meticulously',
         'underscore', 'nestled', 'boasts', 'showcasing', 'fostering', 'quietly', 'ozone', 'palpable', 'smirk', 'smirked', 'smirks', 'predatory',
         'jaw', 'knuckles', 'spine', 'shiver', 'shivers', 'electric', 'purred', 'chuckled', 'steeled', 'half-lidded', 'ministrations', 'unspoken',
         'liminal', 'resonate', 'resonates', 'echoed', 'multifaceted', 'beacon', 'symphony', 'dance of', 'whirlwind', 'labyrinthine', 'ethereal']
PHRASES = ['a beat', 'for a moment', 'a moment too long', 'something shifted', 'something else entirely', 'barely above a whisper', 'barely audible',
           'deep breath', 'eyes never leaving', 'long shadows', 'air thick', 'heart pound', 'heart hammer', 'the weight of', 'the silence stretch',
           "doesn't notice", 'does not notice', 'not unkindly', 'despite herself', 'despite himself', 'ghost of a smile', 'corner of her mouth',
           'corner of his mouth', 'breath hitch', "didn't know she was holding", "didn't know he was holding", 'maybe, just maybe', 'in the heart of',
           'says nothing', 'said nothing', 'does not move', "doesn't move", 'for now', 'older than he is', 'older than she is', 'somewhere above',
           'somewhere below', 'somewhere in the', 'clears its throat', 'a little too', 'just a little', 'the ghost of', 'a flicker of', 'something like',
           'stands as', 'serves as', 'is a testament', 'it is worth noting', "it's important to", 'not just', 'not only']
STOCK = ['Elara', 'Lyra', 'Kael', 'Voss', 'Thorne', 'Silas', 'Hale', 'Marcus Chen', 'Sarah Chen', 'Julian', 'Seraphina', 'Lysandra', 'Zephyr',
         'Nyx', 'Vex', 'Aria', 'Kestrel', 'Blackwood', 'Ashford', 'Vance', 'Isolde', 'Elias', 'Mira', 'Orion', 'Evelyn', 'Calloway', 'Sterling']
NEG = [re.compile(p, re.I) for p in [
    r"\b(?:it|that|this|he|she|they)(?:'s| is| was|'re| are)\s+not\b[^.;:!?\n]{1,60}[,;—-]+\s*(?:it|that|this|he|she|they)(?:'s| is| was|'re| are)\b",
    r"\bnot because\b[^.\n]{1,80}\bbut because\b",
    r"\bnot\s+(?:just|only|merely|simply)\b[^.\n]{1,70}\bbut\b",
    r"\b(?:didn't|did not|doesn't|does not|don't|do not)\s+\w+[^.\n]{0,40}\.\s+(?:Instead|Rather)\b",
    r"\bno\s+\w+(?:\s\w+)?,\s+no\s+\w+(?:\s\w+)?,\s+(?:just|only)\b",
    r"\b[\w' ]{2,30};\s*the\s+\w+\s+(?:do|does|did)\s+not\b",          # "The smile stays; the eyes do not"
    r"\bnot\s+[^.,;\n]{1,30},\s+but\s+[^.,;\n]{1,30}",
]]
def sentences(t):
    return [s.strip() for s in re.split(r'(?<=[.!?])["”]?\s+', t) if s.strip()]
hits = collections.defaultdict(list)
for label, t in src:
    tl = t.lower()
    for w in WORDS:
        for m in re.finditer(r'\b' + re.escape(w) + r'\b', tl):
            hits['word:' + w].append((label, t[max(0, m.start() - 50): m.end() + 50].replace('\n', ' ')))
    for p in PHRASES:
        for m in re.finditer(re.escape(p), tl):
            hits['phrase:' + p].append((label, t[max(0, m.start() - 60): m.end() + 60].replace('\n', ' ')))
    for n in STOCK:
        for m in re.finditer(r'\b' + re.escape(n) + r'\b', t):
            hits['name:' + n].append((label, t[max(0, m.start() - 40): m.end() + 40].replace('\n', ' ')))
    for i, rx in enumerate(NEG):
        for m in rx.finditer(t):
            hits[f'negation#{i}'].append((label, t[max(0, m.start() - 30): m.end() + 30].replace('\n', ' ')))
    # staccato: 3+ consecutive sentences of <= 4 words
    ss = sentences(t); run = []
    for s in ss:
        if len(s.split()) <= 4 and not s.startswith(('-', '[', '#', '<', '{')): run.append(s)
        else:
            if len(run) >= 3: hits['staccato'].append((label, ' '.join(run)[:160]))
            run = []
    # one-word/two-word tricolon fragment like "Calm, pleasant, final."
    for m in re.finditer(r'(?:^|[.!?"”]\s+)([A-Z][a-z]+, [a-z]+, (?:and )?[a-z]+\.)', t):
        hits['tricolon-fragment'].append((label, m.group(1)))
    hits['_emdash'].append((label, str(t.count('—'))))
order = sorted((k for k in hits if not k.startswith('_')), key=lambda k: -len(hits[k]))
for k in order:
    v = hits[k]
    print(f'\n### {k}: {len(v)}')
    for lab, ex in v[:6]:
        print(f'   [{lab}] …{ex}…')
em = sorted(((int(c), lab) for lab, c in hits['_emdash']), reverse=True)
print('\nEm dash total', sum(c for c, _ in em), 'top', em[:8])
