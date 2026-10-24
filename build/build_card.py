#!/usr/bin/env python3
"""Eldrasil card assembler.
Reads src/ + data/ and writes dist/Eldrasil_Halvard.json (ccv3) and dist/Eldrasil_Halvard.png, and copies src/vectfox/ into dist/.
Source layout:
  src/card/card.json            -> name, description, first_mes, alternate_greetings, creator_notes, tags...
  src/card/avatar.png           -> card image (falls back to a plain placeholder)
  src/worldbook/index.json      -> list of ST world-info entries WITHOUT 'content'
  src/worldbook/content/<uid>.txt
  src/scripts/index.json        -> [{name, file, enabled}]  (Tavern Helper character scripts)
  src/regex/index.json          -> [{...ST regex script fields..., replace_file?}]
Usage: python3 build/build_card.py
"""
import json, os, re, base64, uuid, struct, zlib, time, sys, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

def load(path, default=None):
    return json.load(open(path, encoding='utf-8')) if os.path.exists(path) else default

POS_NAME = {0: 'before_char', 1: 'after_char'}
sys.path.insert(0, P('tools'))
from common import lore_names   # 1.60.0: the names a Lore_changes subject may use for an entry (the engine's LORE map too)
# 1.60.0: every lore entry opens with this. A change recorded for one of its names (Campus_State.Lore_changes, the subject as
# common.lore_key / the engine's lcKey writes it) is printed first; with Replace the entry's own text is left out.
LORE_OPEN = ("<%_ { const _lc = getvar('stat_data.Campus_State.Lore_changes') || {}, _ln = @@NAMES@@, "
             "_lk = Object.keys(_lc).find(k => _ln.includes(String(k).trim().toLowerCase().replace(/^the\\s+/, '').replace(/\\s+/g, ' '))), "
             "_lx = _lk && _lc[_lk] && _lc[_lk].Now ? _lc[_lk] : null; if (_lx) { _%>\n"
             "[Changed in this campaign<%- _lx.Since ? ', ' + _lx.Since : '' %><%- _lx.Until ? ', until ' + _lx.Until : '' %>; this overrides the lore<%- _lx.Replace ? '' : ' below' %>] "
             "<%- _lk %>: <%- _lx.Now %>\n<%_ } if (!(_lx && _lx.Replace)) { _%>\n")
LORE_CLOSE = "\n<%_ } } _%>"

def wi_to_book_entry(e, content):
    return {
        'id': e['uid'], 'keys': e.get('key', []), 'secondary_keys': e.get('keysecondary', []),
        'comment': e.get('comment', ''), 'content': content,
        'constant': bool(e.get('constant')), 'selective': bool(e.get('selective', True)),
        'insertion_order': e.get('order', 100), 'enabled': not e.get('disable', False),
        'position': POS_NAME.get(e.get('position', 1), 'after_char'), 'use_regex': True,
        'extensions': {
            'position': e.get('position', 1), 'exclude_recursion': e.get('excludeRecursion', False),
            'display_index': e.get('displayIndex', e['uid']), 'probability': e.get('probability', 100),
            'useProbability': e.get('useProbability', True), 'depth': e.get('depth', 4),
            'selectiveLogic': e.get('selectiveLogic', 0), 'outlet_name': e.get('outletName', ''),
            'group': e.get('group', ''), 'group_override': e.get('groupOverride', False),
            'group_weight': e.get('groupWeight', 100), 'prevent_recursion': e.get('preventRecursion', False),
            'delay_until_recursion': e.get('delayUntilRecursion', False), 'scan_depth': e.get('scanDepth'),
            'match_whole_words': e.get('matchWholeWords'), 'use_group_scoring': e.get('useGroupScoring', False),
            'case_sensitive': e.get('caseSensitive'), 'automation_id': e.get('automationId', ''),
            'role': e.get('role', 0) or 0, 'vectorized': e.get('vectorized', False),
            'sticky': e.get('sticky', 0) or 0, 'cooldown': e.get('cooldown', 0) or 0, 'delay': e.get('delay', 0) or 0,
            'match_persona_description': False, 'match_character_description': False,
            'match_character_personality': False, 'match_character_depth_prompt': False,
            'match_scenario': False, 'match_creator_notes': False,
            'triggers': e.get('triggers', []), 'ignore_budget': e.get('ignoreBudget', False),
        },
    }

# 1.99.8 (bug-hunt audit T1, prompt cache): a provider reuses the prompt only up to its first change. SillyTavern joins the entries of
# one position in ascending order (world-info.js: sorted by order descending, then unshifted), and keyword lore changes every reply,
# so the owner's v38 orders put it first in Lorebook Before and cut the reuse there. Every enabled keyword entry goes to Lorebook After,
# behind the constant entries (all of which barely change from reply to reply): Lorebook Before, the description and the constants of
# Lorebook After now stay the same. The keyword entries keep their order among themselves (the former Before ones first), so the World
# Info budget drops them as before; the constants carry ignoreBudget and are never dropped (DECISIONS §9 "Prompt layout for the cache").
LAYOUT_BEFORE, LAYOUT_AFTER = 600, 700
def cache_layout(entries):
    kw = lambda e: not e.get('constant') and not e.get('disable') and e.get('key') and e.get('position', 1) in (0, 1)
    for e in entries:
        if kw(e):
            e['order'] = e.get('order', 100) + (LAYOUT_BEFORE if e.get('position', 1) == 0 else LAYOUT_AFTER)
            e['position'] = 1
    const = [e for e in entries if e.get('constant') and not e.get('disable') and e.get('position', 1) in (0, 1)]
    moved = [e for e in entries if kw(e)]
    assert all(e.get('ignoreBudget') for e in const), 'cache_layout: a constant Before/After entry without ignoreBudget'
    assert not [e for e in entries if kw(e) and e.get('position', 1) == 0], 'cache_layout: keyword lore left in Lorebook Before'
    assert max(e.get('order', 100) for e in const if e.get('position', 1) == 1) < min(e['order'] for e in moved), \
        'cache_layout: a constant Lorebook After entry would follow keyword lore'
    return entries

def build():
    card = load(P('src/card/card.json'), {})
    name = card.get('name', 'Eldrasil — Halvard Academy')
    entries, raw = [], []
    # lore (generated by tools/merge_lorebooks.py) + custom MVU entries (hand-written, uid >= 500)
    for idx_path, cdir in (('src/worldbook/index.json', 'src/worldbook/content'),
                           ('src/worldbook/custom/index.json', 'src/worldbook/custom/content')):
        for e in load(P(idx_path), []):
            c = open(P(cdir, f"{e['uid']}.txt"), encoding='utf-8').read()
            c = c.replace('@@VERSION@@', card.get('character_version', ''))   # 1.3.4: [initvar] 500 carries the card version ($eng.lore)
            # 1.3.7 (owner playtest: "redeclaration of const _U"): the Prompt Template extension compiles entries that land in the
            # same place as one template, so two entries' top-level consts collided (502 and 504 both declare _U / on). Each EJS
            # entry gets its own block scope.
            # 1.48.0 (audit 2.7): decorator lines (@@if) stay first, where Prompt Template and SillyTavern read and strip them
            # 1.60.0: a lore entry opens with the Lore_changes overlay (a change on record for its subject is printed over its lore,
            # Replace: instead of it); the overlay is that entry's block scope
            names = lore_names(e) if cdir.endswith('worldbook/content') else []
            if names or '<%' in c:
                deco = ''
                while c.startswith('@@'):
                    nl = c.index('\n') + 1; deco += c[:nl]; c = c[nl:]
                c = deco + (LORE_OPEN.replace('@@NAMES@@', json.dumps(names, ensure_ascii=False)) + c.rstrip('\n') + LORE_CLOSE if names
                            else '<%_ { _%>\n' + c.rstrip('\n') + '\n<%_ } _%>')
            raw.append((e, c))
    cache_layout([dict_e for dict_e, _ in raw])
    entries = [wi_to_book_entry(e, c) for e, c in raw]
    uids = [e['id'] for e in entries]
    assert len(uids) == len(set(uids)), 'duplicate worldbook uid!'
    scripts = []
    for s in load(P('src/scripts/index.json'), []):
        scripts.append({'type': 'script', 'enabled': s.get('enabled', True), 'name': s['name'],
                        'id': s.get('id') or str(uuid.uuid5(uuid.NAMESPACE_URL, 'eldrasil/' + s['name'])),
                        'content': open(P('src/scripts', s['file']), encoding='utf-8').read(), 'info': s.get('info', ''),
                        'button': {'enabled': True, 'buttons': s.get('buttons', [])}, 'data': {},
                        'export_with': {'data': True, 'button': True}})
    regexes = []
    for r in load(P('src/regex/index.json'), []):
        r = dict(r)
        if 'replace_file' in r:
            txt = open(P('src/regex', r.pop('replace_file')), encoding='utf-8').read()
            if r.pop('wrap', None) == 'html':   # Tavern Helper renders an html code block as a message iframe
                bad = re.findall(r'\$\d|\$<|\{\{|<USER>|<BOT>|<CHAR>', txt)
                assert not bad, f'regex replacement {r["scriptName"]} contains ST-special sequences: {bad}'
                txt = '```html\n' + txt.strip() + '\n```'
            r['replaceString'] = txt
        r.setdefault('id', str(uuid.uuid5(uuid.NAMESPACE_URL, 'eldrasil/regex/' + r['scriptName'])))
        regexes.append(r)
    data = {
        'name': name, 'description': card.get('description', ''), 'personality': '', 'scenario': card.get('scenario', ''),
        'first_mes': card.get('first_mes', ''), 'mes_example': '', 'creator_notes': card.get('creator_notes', ''),
        'system_prompt': '', 'post_history_instructions': '', 'tags': card.get('tags', []),
        'creator': card.get('creator', ''), 'character_version': card.get('character_version', ''),
        'alternate_greetings': card.get('alternate_greetings', []), 'group_only_greetings': [],
        'extensions': {'talkativeness': '0.5', 'fav': False, 'world': name,
                       'depth_prompt': {'prompt': '', 'depth': 4, 'role': 'system'},
                       'regex_scripts': regexes,
                       'tavern_helper': {'scripts': scripts, 'variables': card.get('tavern_helper_variables', {})},
                       # 1.99.14: the live-check rules for the Black Box quest autopilot; SillyTavern never puts this key in the prompt
                       'eldrasil_live_checks': live_checks(card.get('character_version', ''))},
        'character_book': {'name': name, 'entries': entries},
    }
    v3 = {'spec': 'chara_card_v3', 'spec_version': '3.0', 'data': data}
    v2 = dict(name=name, description=data['description'], personality='', scenario=data['scenario'],
              first_mes=data['first_mes'], mes_example='', creatorcomment=data['creator_notes'], avatar='none',
              talkativeness='0.5', fav=False, tags=data['tags'], spec='chara_card_v2', spec_version='2.0',
              data=data, create_date=time.strftime('%Y-%m-%d @%Hh %Mm %Ss'))
    os.makedirs(P('dist'), exist_ok=True)
    json.dump(v3, open(P('dist/Eldrasil_Halvard.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    write_png(v2, v3)
    for d in ('src/vectfox', 'src/summaryception'):   # the memory extensions' files sit next to the card and the preset: one download folder
        for f in os.listdir(P(d)):
            shutil.copyfile(P(d, f), P('dist', f))
    print(f'built: {len(entries)} wb entries, {len(scripts)} scripts, {len(regexes)} regex')

def live_checks(version):
    """data/live_checks.json for the card: its rules, stamped with this card version."""
    rules = load(P('data/live_checks.json'), None)
    if not rules:
        return {'version': 1, 'card': version, 'checks': []}
    assert rules.get('version') == 1, 'data/live_checks.json: rules version 1 expected'
    return {'version': 1, 'card': version, 'checks': rules.get('checks', [])}

def chunk(t, body):
    c = t + body
    return struct.pack('>I', len(body)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

def write_png(v2, v3):
    av = P('src/card/avatar.png')
    raw = open(av, 'rb').read() if os.path.exists(av) else None
    if raw is None:
        from PIL import Image; import io
        b = io.BytesIO(); Image.new('RGB', (512, 768), (30, 30, 46)).save(b, 'PNG'); raw = b.getvalue()
    # strip existing text chunks, insert chara + ccv3 before IEND
    out, p = [raw[:8]], 8
    while p < len(raw):
        l = struct.unpack('>I', raw[p:p+4])[0]; t = raw[p+4:p+8]
        if t == b'IEND':
            for k, obj in (('chara', v2), ('ccv3', v3)):
                out.append(chunk(b'tEXt', k.encode() + b'\x00' + base64.b64encode(json.dumps(obj, ensure_ascii=False).encode('utf-8'))))
        if t not in (b'tEXt', b'iTXt', b'zTXt'):
            out.append(raw[p:p+12+l])
        p += 12 + l
    open(P('dist/Eldrasil_Halvard.png'), 'wb').write(b''.join(out))

if __name__ == '__main__':
    build()
