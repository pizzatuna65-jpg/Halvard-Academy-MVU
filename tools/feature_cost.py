# v1.1.0 (spec §9) Features settings: token cost of each feature's rules, measured from its EJS gates in 502 / 504.
# Executed by tools/gen_mvu_entries.py (shares its globals: P, json, re). Writes data/feature_cost.json, which gen_ui.py injects.
# Same heuristic as tests/token_audit.cjs (~3.6 characters per token). The pseudo-feature 'wxfull' (Full-only rules) counts toward 'weather'.
TAG = re.compile(r'<%[_-]?([\s\S]*?)[_-]?%>')
def gated_chars(src):
    per, stack, pos = {}, [], 0
    for m in TAG.finditer(src):
        text = src[pos:m.start()]; pos = m.end()
        fid = next((x for x in reversed(stack) if x), None)
        per[fid] = per.get(fid, 0) + len(text)
        code = m.group(1).strip()
        g = re.match(r"^if \(on\('(\w+)'\)\) \{$", code)
        if g: stack.append(g.group(1)); continue
        if code == '}': stack.pop(); continue
        for ch in code:
            if ch == '{': stack.append(None)
            elif ch == '}' and stack: stack.pop()
    per[None] = per.get(None, 0) + len(src[pos:])
    return per
_C = lambda u: open(P('src/worldbook/custom/content', f'{u}.txt'), encoding='utf-8').read()
_cost, _core = {}, 0
for _u in (502, 504):
    for _fid, _n in gated_chars(_C(_u)).items():
        if _fid is None: _core += _n
        else: _k = {'wxfull': 'weather'}.get(_fid, _fid); _cost[_k] = _cost.get(_k, 0) + _n
_core += len(_C(501).replace('{{format_message_variable::stat_data}}', '')) + len(_C(503)) + 400   # + ~110 tokens: the Now entry's fixed lines
_lore = 0
for _e in json.load(open(P('src/worldbook/index.json'), encoding='utf-8')):
    if _e.get('constant') and not _e.get('disable'):
        _lore += len(TAG.sub('', open(P('src/worldbook/content', f"{_e['uid']}.txt"), encoding='utf-8').read()))
_tok = lambda n: round(n / 3.6)
_feats = json.load(open(P('data/features.json'), encoding='utf-8'))['features']
_unknown = set(_cost) - {f['id'] for f in _feats}
assert not _unknown, f'gates for unknown features: {_unknown}'
FC = {'rules': {f['id']: _tok(_cost.get(f['id'], 0)) for f in _feats}, 'core_rules': _tok(_core), 'lore': _tok(_lore),
      'price_guide': _tok(len(_C(506))),
      # Now-entry lines that are not in <current_state>: the class line during a class period; the forecast line
      'live': {'class': 40, 'weather': 25}}
json.dump(FC, open(P('data/feature_cost.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('feature rule tokens:', FC['rules'], '| core', FC['core_rules'], '| always-on lore', FC['lore'])
