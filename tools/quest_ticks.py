#!/usr/bin/env python3
"""Tick the campaign quest log (docs/TEST_CHECKLIST.md) from an Eldrasil Black Box playtest bundle (quest autopilot, 1.99.14).

Usage:
  python tools/quest_ticks.py <bundle.json.gz> [--checklist docs/TEST_CHECKLIST.md] [--write]

The bundle carries the card's live-check rules (data/live_checks.json, as the card shipped them) and what the autopilot found.
A rule names its check by quest and the start of its line. For each check line:
  - every rule for it passed and each covers the whole check ("whole": true)
                                        -> the line is ticked [x] with a note "✓ msg N (autopilot, card X)";
  - every rule passed, one covers only the part a machine can see
                                        -> a note "✓ msg N (autopilot, card X, the machine part)"; the line stays open for the rest;
  - a rule failed                       -> a note "✗ msg N (autopilot, card X): <what was missing>" (the line stays open);
  - a rule is to review (or undecided)  -> listed on the screen with its evidence messages, for the assistant to judge.
Without --write it prints the changes as a diff and changes nothing. A note already there is not added twice.
"""
import argparse, difflib, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audit_chat import read_bundle   # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECK_RX = re.compile(r'^(\s*)- \[( |x|-)\] (.*)$')
QUEST_RX = re.compile(r'^### (\S+)')


def check_lines(lines):
    """Every check line of the quest log: (quest, index of the line, text after the box, box)."""
    out, quest = [], None
    for i, line in enumerate(lines):
        m = QUEST_RX.match(line)
        if m:
            quest = m.group(1)
            continue
        if line.startswith('## '):
            quest = None
        m = CHECK_RX.match(line)
        if m and quest:
            out.append((quest, i, m.group(3), m.group(2)))
    return out


def find_line(checks, quest, start):
    hits = [c for c in checks if c[0] == quest and c[2].startswith(start)]
    return hits[0] if len(hits) == 1 else None


def item_end(lines, i):
    """The last line of a check item: its wrapped text and the notes under it (indented, not a new item)."""
    j = i + 1
    while j < len(lines) and lines[j].startswith('      ') and not CHECK_RX.match(lines[j]):
        j += 1
    return j


def plan(bundle, lines):
    """What to change: {line index: (tick, [notes])} and the checks to review."""
    q = bundle.get('quests') or {}
    rules, results, card = q.get('rules') or [], q.get('results') or {}, q.get('card') or '?'
    checks = check_lines(lines)
    groups, missing = {}, []
    for r in rules:
        c = find_line(checks, r.get('quest'), r.get('line', ''))
        if not c:
            missing.append(r)
            continue
        groups.setdefault(c[1], (c, []))[1].append(r)
    changes, review = {}, []
    for idx, (c, rs) in sorted(groups.items()):
        res = [(r, results.get(r['id']) or {'status': 'unseen'}) for r in rs]
        notes = []
        for r, x in res:
            for f in x.get('fails') or []:
                notes.append(f"✗ msg {f.get('mesId')} (autopilot, card {card}): {f.get('why')}")
        if any(x['status'] == 'failed' for _, x in res):
            changes[idx] = (False, notes)
        elif all(x['status'] == 'passed' for _, x in res):
            first = min((e.get('mesId') for _, x in res for e in x.get('evidence') or [] if e.get('mesId') is not None), default=None)
            n = sum(x.get('passes', 0) for _, x in res)
            whole = all(r.get('whole') for r, _ in res)
            part = '' if whole else ', the machine part'
            changes[idx] = (whole, [f"✓ msg {first} (autopilot, card {card}{part}): passed {n} time{'s' if n != 1 else ''}"])
            if not whole:
                review.append((c[0], c[2][:90], '+'.join(r['id'] for r in rs), 'machine part passed', [first], 0))
        for r, x in res:
            if x['status'] in ('review', 'seen') and (x.get('evidence') or x.get('seen')):
                review.append((c[0], c[2][:90], r['id'], x['status'], [e.get('mesId') for e in x.get('evidence') or []], x.get('waiting', 0)))
    return changes, review, missing


def apply(lines, changes):
    out = list(lines)
    for idx in sorted(changes, reverse=True):
        tick, notes = changes[idx]
        end = item_end(out, idx)
        have = {l.strip() for l in out[idx:end]}
        add = ['      ' + n for n in notes if n not in have]
        out[end:end] = add
        if tick:
            out[idx] = re.sub(r'- \[ \] ', '- [x] ', out[idx], count=1)
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('bundle')
    ap.add_argument('--checklist', default=os.path.join(ROOT, 'docs', 'TEST_CHECKLIST.md'))
    ap.add_argument('--write', action='store_true', help='write the changes (default: print a diff)')
    a = ap.parse_args(argv)
    b = read_bundle(a.bundle)
    if not b.get('quests'):
        sys.exit('this bundle carries no quest results (the card had no live checks, or the autopilot was off)')
    text = open(a.checklist, encoding='utf-8').read()
    lines = text.split('\n')
    changes, review, missing = plan(b, lines)
    new = apply(lines, changes)
    if a.write:
        open(a.checklist, 'w', encoding='utf-8', newline='\n').write('\n'.join(new))
    else:
        sys.stdout.writelines(difflib.unified_diff([l + '\n' for l in lines], [l + '\n' for l in new], 'TEST_CHECKLIST.md', 'TEST_CHECKLIST.md (ticked)'))
    ticked = sum(1 for t, _ in changes.values() if t)
    failed = sum(1 for t, n in changes.values() if not t and any(x.startswith('✗') for x in n))
    partial = sum(1 for t, n in changes.values() if not t and not any(x.startswith('✗') for x in n))
    print(f'\nquest_ticks: {ticked} ticked, {partial} with the machine part noted, {failed} with a failure noted{"" if a.write else " (dry run: --write to apply)"}', file=sys.stderr)
    if review:
        print('To review (judge from the bundle\'s evidence messages):', file=sys.stderr)
        for quest, line, rid, status, ev, waiting in review:
            print(f'  {quest} [{rid}, {status}] {line} — evidence msgs {ev or "-"}{f", waiting {waiting}" if waiting else ""}', file=sys.stderr)
    for r in missing:
        print(f"  ! rule {r.get('id')}: no single check line in {r.get('quest')} starts with {r.get('line')!r}", file=sys.stderr)


if __name__ == '__main__':
    main()
