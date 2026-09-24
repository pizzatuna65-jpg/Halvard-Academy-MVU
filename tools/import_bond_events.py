#!/usr/bin/env python3
"""1.2.2 — imports the owner's scripted bond events into data/bond_events.json (read by tools/gen_engine.py).

Input: one or more SillyTavern lorebook exports (.json) or plain text files (.txt / .md), given on the command line.
  python3 tools/import_bond_events.py path/to/bond_events_lorebook.json [more files…]
  python3 tools/import_bond_events.py --check path/…        (parse and report only, write nothing)
Then rebuild: gen_engine.py, gen_mvu_entries.py, gen_ui.py, build_card.py.

An event is a lorebook entry whose comment (or, in a text file, whose first line) is
  [Bond Event] <NPC first name> — Rank <from>→<to>        ("-" / "->" also accepted; to must be from + 1)
and whose content follows docs/BOND_EVENTS.md:
  Syarat: / Conditions:   places | HH:MM–HH:MM | days | weather   (each part optional, in any order, separated by "|")
  Prasyarat: / Requires:  club = X; dorm = Fire; month >= 3; year >= 2
  everything else (Arah / Directions, Wajib / Must, Pilihan / Choices, Hasil / Results) is kept verbatim for the narrator.
In a text file, events are separated by a line that starts with "[Bond Event]".
The importer checks NPC names, ranks and places against the card data and stops on any error.
"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
npcs = json.load(open(P('data/npcs.json'), encoding='utf-8'))
locs = json.load(open(P('data/locations.json'), encoding='utf-8'))
PLACES = {re.sub(r'^the ', '', l['name'].lower()): l['name'] for l in locs.values()}
PLACES.update({'main courtyard': 'Courtyards', 'courtyard': 'Courtyards', 'gatehouse': 'Reception and Gatehouse', 'mall': 'The Mall'})
DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
DAY_ALIAS = {'senin': 'Mon', 'selasa': 'Tue', 'rabu': 'Wed', 'kamis': 'Thu', 'jumat': 'Fri', "jum'at": 'Fri', 'sabtu': 'Sat', 'minggu': 'Sun',
             'monday': 'Mon', 'tuesday': 'Tue', 'wednesday': 'Wed', 'thursday': 'Thu', 'friday': 'Fri', 'saturday': 'Sat', 'sunday': 'Sun'}
SKY = {'rain': 'Rain', 'hujan': 'Rain', 'storm': 'Storm', 'badai': 'Storm', 'fog': 'Fog', 'kabut': 'Fog', 'overcast': 'Overcast',
       'mendung': 'Overcast', 'cloudy': 'Cloudy', 'berawan': 'Cloudy', 'clear': 'Clear', 'cerah': 'Clear', 'snow': 'Rain', 'salju': 'Rain'}
HEAD = re.compile(r'^\s*\[Bond Event\]\s*(\S+)\s*[—–-]+\s*Rank\s*(\d+)\s*(?:→|->|-|–|to)\s*(\d+)\s*$', re.I)
COND = re.compile(r'^\s*(?:Syarat|Conditions?)\s*:\s*(.*)$', re.I | re.M)
REQ = re.compile(r'^\s*[-•]?\s*(?:Prasyarat|Requires?)\s*:\s*(.*)$', re.I | re.M)

def day_of(tok):
    t = tok.strip().lower().rstrip('.')
    return DAY_ALIAS.get(t) or next((d for d in DAYS if d.lower() == t[:3]), None)

def parse_days(part):
    part = part.strip()
    if re.fullmatch(r'(?i)(weekdays?|hari kerja)', part): return DAYS[:5]
    if re.fullmatch(r'(?i)(weekends?|akhir pekan)', part): return DAYS[5:]
    m = re.fullmatch(r'(\S+)\s*(?:–|-|to|sampai|s/d)\s*(\S+)', part)
    if m and day_of(m.group(1)) and day_of(m.group(2)):
        a, b = DAYS.index(day_of(m.group(1))), DAYS.index(day_of(m.group(2)))
        return DAYS[a:b + 1] if a <= b else DAYS[a:] + DAYS[:b + 1]
    toks = [t for t in re.split(r'[,/ ]+', part) if t]
    ds = [day_of(t) for t in toks]
    return ds if toks and all(ds) else None

def parse_event(head, body, src):
    m = HEAD.match(head)
    if not m: return None
    npc, a, b = m.group(1), int(m.group(2)), int(m.group(3))
    err = []
    nid = next((k for k in npcs if k.lower() == npc.lower()), None)
    if not nid: err.append(f'unknown NPC "{npc}" (use the first name as in the NPC roster)')
    if not (0 <= a <= 9 and b == a + 1): err.append(f'Rank {a}→{b}: an event raises a rank by exactly 1 (0→1 … 9→10)')
    ev = {'npc': nid or npc, 'rank': a, 'where': [], 'time': None, 'days': None, 'not_sky': [], 'requires': {}}
    cm = COND.search(body)
    if cm:
        for part in [p.strip() for p in cm.group(1).split('|') if p.strip()]:
            tm = re.fullmatch(r'(\d{1,2}[:.]\d{2})\s*(?:–|-|to|sampai)\s*(\d{1,2}[:.]\d{2})', part)
            if tm and all(int(x.replace('.', ':').split(':')[0]) < 24 for x in tm.groups()): ev['time'] = [tm.group(1).replace('.', ':').zfill(5), tm.group(2).replace('.', ':').zfill(5)]; continue
            ds = parse_days(part)
            if ds: ev['days'] = ds; continue
            wm = re.fullmatch(r'(?i)(?:bukan|not|no)\s+(.+)', part)
            if wm:
                sk = [SKY.get(w.strip().lower()) for w in re.split(r'[,/]| atau | or ', wm.group(1)) if w.strip()]
                if all(sk): ev['not_sky'] = sorted(set(sk)); continue
                err.append(f'weather "{part}": use e.g. "not rain" / "bukan hujan"'); continue
            names = [x.strip() for x in re.split(r'\s+(?:or|atau)\s+|,', part) if x.strip()]
            found = [PLACES.get(re.sub(r'^the ', '', x.lower())) for x in names]
            if all(found): ev['where'] = found
            else: err.append(f'condition "{part}" is not a place on the Campus Map, a time (16:00–20:00), days (Mon–Fri) or weather (not rain)')
    rm = REQ.search(body)
    if rm:
        for part in [p.strip() for p in re.split(r'[;,]', rm.group(1)) if p.strip()]:
            kv = re.fullmatch(r'(?i)(club|dorm|month|bulan|year|tahun)\s*(=|>=)\s*(.+)', part)
            if not kv: err.append(f'prerequisite "{part}": use club = X, dorm = Fire, month >= 3 or year >= 2'); continue
            k, v = kv.group(1).lower(), kv.group(3).strip()
            if k == 'club': ev['requires']['club'] = v
            elif k == 'dorm': ev['requires']['dorm'] = v.capitalize()
            elif k in ('month', 'bulan'): ev['requires']['month_from'] = int(v)
            else: ev['requires']['year_from'] = int(v)
    text = COND.sub('', REQ.sub('', body)).strip()
    text = re.sub(r'\n{3,}', '\n\n', text)
    if not text: err.append('no directions (Arah / Directions) under the conditions')
    ev['text'] = text
    if err: raise SystemExit(f'{src}: [Bond Event] {npc} Rank {a}→{b}:\n  - ' + '\n  - '.join(err))
    return ev

def entries_from(path):
    if path.endswith('.json'):
        data = json.load(open(path, encoding='utf-8'))
        es = data.get('entries', data)
        es = es.values() if isinstance(es, dict) else es
        for e in es:
            yield (e.get('comment') or '').strip(), e.get('content') or ''
    else:
        txt = open(path, encoding='utf-8').read()
        parts = re.split(r'(?m)^(?=\s*\[Bond Event\])', txt)
        for p in parts:
            if not p.strip().startswith('[Bond Event]'): continue
            head, _, body = p.strip().partition('\n')
            yield head, body

def main(argv):
    check = '--check' in argv
    files = [a for a in argv if a != '--check']
    if not files: raise SystemExit(__doc__)
    evs = []
    for f in files:
        for head, body in entries_from(f):
            if not re.match(r'\s*\[Bond Event\]', head, re.I): continue
            body = re.sub(r'^\s*\[Bond Event\][^\n]*\n', '', body)   # a content that repeats the title line
            ev = parse_event(head, body, os.path.basename(f))
            if ev: evs.append(ev)
    seen = {}
    for e in evs:
        k = (e['npc'], e['rank'])
        if k in seen: raise SystemExit(f'two events for {e["npc"]} Rank {e["rank"]}→{e["rank"] + 1}')
        seen[k] = 1
    evs.sort(key=lambda e: (e['npc'], e['rank']))
    print(f'{len(evs)} bond events:', ', '.join(f'{e["npc"]} {e["rank"]}→{e["rank"] + 1}' for e in evs) or 'none')
    if check: return
    out = json.load(open(P('data/bond_events.json'), encoding='utf-8'))
    out['events'] = evs
    json.dump(out, open(P('data/bond_events.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('written: data/bond_events.json (now run gen_engine.py, gen_mvu_entries.py, gen_ui.py, build_card.py)')

if __name__ == '__main__':
    main(sys.argv[1:])
