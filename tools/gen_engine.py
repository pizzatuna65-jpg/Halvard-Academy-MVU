#!/usr/bin/env python3
"""Batch 2.3 — generates src/scripts/engine.js from engine.template.js + data/npcs.json (alias map)."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
npcs = json.load(open(P('data/npcs.json'), encoding='utf-8'))
from common import npc_aliases
alias = npc_aliases(npcs)   # 1.37.0: shared with gen_ui.py (dialogue colours)
forms = {nid: sorted({f for f in [nid, n['name'], n.get('nickname')] if f and len(f) > 1}, key=len, reverse=True) for nid, n in npcs.items()}
t = open(P('src/scripts/engine.template.js'), encoding='utf-8').read()
cal = json.load(open(P('data/calendar.json'), encoding='utf-8'))
t = t.replace('/*@@CAL_EVENTS@@*/[]', json.dumps(cal['events'], ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@CAL_TIMETABLE@@*/{}', json.dumps(cal['timetable'], ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@CLUB_STATS@@*/{}', json.dumps(json.load(open(P('data/club_stats.json'), encoding='utf-8')), ensure_ascii=False, separators=(',', ':')))
_plocs = json.load(open(P('data/locations.json'), encoding='utf-8'))
t = t.replace('/*@@PRACTICE@@*/[]', json.dumps([{**a, 'name': _plocs[a['loc']]['name']} for a in json.load(open(P('data/practice.json'), encoding='utf-8'))], ensure_ascii=False, separators=(',', ':')))
crafts = json.load(open(P('data/crafts.json'), encoding='utf-8'))
t = t.replace('/*@@CRAFTS@@*/{}', json.dumps(crafts, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@MOOD_GIFTS_SOURCE@@*/', open(P('src/scripts/mood_gifts.js'), encoding='utf-8').read())
import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import shared_js
assert t.count('/*@@SHARED@@*/') == 1
t = t.replace('/*@@SHARED@@*/', shared_js())   # 1.43.0 (audit batch 2): the rules and constants every runtime shares
for key, file in [('NPC_MOODS', 'npc_moods'), ('GIFT_PREFS', 'gift_prefs'), ('WIND_CASTING', 'wind_casting')]:
    obj = json.load(open(P('data/' + file + '.json'), encoding='utf-8'))
    if key == 'NPC_MOODS': obj = obj['npcs']
    if key == 'NPC_MOODS':   # 1.72.0: every special day names a birthday, a calendar event (start of its title) or a date
        _titles = [e['t'] for e in json.load(open(P('data/calendar.json'), encoding='utf-8'))['events']]
        for _id, _p in obj.items():
            for _d in _p.get('days', []):
                assert _d['on'] == 'birthday' or re.match(r'^M(1[0-2]|[1-9]) W[1-4]( (Mon|Tue|Wed|Thu|Fri|Sat|Sun))?$', _d['on']) or any(x.startswith(_d['on']) for x in _titles), (_id, _d['on'])
                assert _d.get('tone') and _d.get('how') and _d.get('fix', 'Good') in ('Good', 'Normal', 'Bad') and _d.get('lean', 0) in (-1, 0, 1), (_id, _d)
    if key == 'GIFT_PREFS':
        # Shop provenance is part of category matching (Merryhew's goods, books, food, raw reagents).
        obj['catalog'] = {}
        for item in json.load(open(P('data/shop.json'), encoding='utf-8'))['items']:
            name, shop = item['item'], item['shop']
            tags = [shop] + item.get('gift_tags', [])   # 1.43.0 (2.8): data/shop.json gift_tags, no longer guessed from the name
            obj['catalog'][name] = ' '.join(tags)
    t = t.replace('/*@@' + key + '@@*/{}', json.dumps(obj, ensure_ascii=False, separators=(',', ':')))
_mst = json.load(open(P('data/mastery.json'), encoding='utf-8'))   # 1.43.0 (2.8): Rank 5 perks' numbers
t = t.replace('/*@@MASTERY_FX@@*/{ arcana_cost: 0.9, society_trust: 5, nature_forage: 2 }', json.dumps({k: _mst[k] for k in ('arcana_cost', 'society_trust', 'nature_forage')}))
t = t.replace('/*@@NPC_DORMS@@*/{}', json.dumps({k: v.get('dorm') for k,v in npcs.items()}, separators=(',', ':')))

locs = json.load(open(P('data/locations.json'), encoding='utf-8'))
castle = sorted({n.lower() for l in locs.values() if l.get('pin') == 1 for n in (l['name'], re.sub(r'^The ', '', l['name']))} | {'castle', 'the castle'})
t = t.replace('/*@@CASTLE@@*/[]', json.dumps(castle, ensure_ascii=False))
# 1.3.4: the engine version is the card version (the [initvar] entry carries the same, see build/build_card.py)
t = t.replace("'@@VERSION@@'", json.dumps(json.load(open(P('src/card/card.json'), encoding='utf-8'))['character_version']))
# v1.0.3 (F01): all campus place names, so the engine can tell an off-grounds location from a campus one
campus = sorted({n.lower() for l in locs.values() for n in (l['name'], re.sub(r'^The ', '', l['name']))} | set(castle) | {'main courtyard', 'halvard', 'halvard academy', 'campus'})
t = t.replace('/*@@CAMPUS@@*/[]', json.dumps(campus, ensure_ascii=False))
# v1.0.3: Halvard students and their lorebook Year (group "Year N"; rival academy teams and staff are not included)
students = {nid: [n['year'], n.get('arrives', 1)] for nid, n in sorted(npcs.items()) if re.match(r'^Year \d$', n.get('group') or '') and n.get('year')}
assert students, 'no Halvard students found'
t = t.replace('/*@@STUDENTS@@*/{}', json.dumps(students, ensure_ascii=False, separators=(',', ':')))
arrives = {nid: n['arrives'] for nid, n in sorted(npcs.items()) if n.get('arrives', 1) > 1}   # v1.0.3 incoming cohorts
t = t.replace('/*@@ARRIVES@@*/{}', json.dumps(arrives, ensure_ascii=False, separators=(',', ':')))
# 1.7.4: third-years whose canon keeps them at Halvard past their third year (data/cohorts.json "stays"): not sent away at Graduation
stays = json.load(open(P('data/cohorts.json'), encoding='utf-8')).get('stays', {})
assert all(nid in students and students[nid][0] + 1 - students[nid][1] <= 3 for nid in stays), f'cohorts.json stays: not a Halvard student {sorted(stays)}'
t = t.replace('/*@@STAYS@@*/{}', json.dumps(stays, ensure_ascii=False, separators=(',', ':')))
# v1.1.0 (spec §4.8): outdoor places (lowercase names, with and without "the"); rule and canon corrections in tools/common.py
import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import outdoor_ids, place_keys, place_aliases, class_data
_TT, _TEACH, _CLUBS = class_data(npcs, locs)   # 1.10.0 (FP7): lessons with venues, teachers, club venues for attendance
# 1.16.1 (audit B1): each club's short name (lowercase, as the lore's Club lines write it) -> its name, for canonClub
from common import load_clubs
_CALIAS = {c['key'].lower(): c['name'] for c in load_clubs(npcs, locs)}
assert all(v in _CLUBS for v in _CALIAS.values()), 'club alias names a club without venues'
_SAY = json.load(open(P('data/dialogue_colors.json'), encoding='utf-8'))   # 1.37.1: dialogue colours
t = t.replace('/*@@SAY@@*/{ n: 0, start: {}, dist: [] }', json.dumps({'n': len(_SAY['palette']), 'start': _SAY['npcs'], 'dist': _SAY['dist']}, separators=(',', ':')))
t = t.replace('/*@@CLASS@@*/{}', json.dumps({'tt': _TT, 'teach': _TEACH, 'clubs': _CLUBS, 'calias': _CALIAS}, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@CLUB_MEMBERS@@*/{}', json.dumps({c['name']: c['members'] for c in load_clubs(npcs, locs)}, ensure_ascii=False, separators=(',', ':')))
# 1.3.1: place names for World.Location normalisation (engine canonLocation); dorm rooms every dorm shares are never promoted
pnames = {k: l['name'] for lid, l in sorted(locs.items()) for k in place_keys(l, lid)}
t = t.replace('/*@@PLACE_NAMES@@*/{}', json.dumps(pnames, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@PLACE_ALIAS@@*/{}', json.dumps(place_aliases(locs), ensure_ascii=False, separators=(',', ':')))
pins = json.load(open(P('data/map_pins.json'), encoding='utf-8'))
shared = sorted(locs[i]['name'] for i in locs if sum(i in p['cluster'] for p in pins) > 1)
t = t.replace('/*@@PLACE_SHARED@@*/[]', json.dumps(shared, ensure_ascii=False))
# 1.47.0 (audit batch 5): the campus as an Area (3.2: the walking graph, the pins, data/campus.json) and whereabouts (3.8)
from common import presence_data, campus_map
from common import now_data, AGE_JS, fill_data   # 1.48.0 (audit 3.11): <now>'s engine-made lines
# 1.54.0 (narrator-load audit U1): the rule cards' ids and features (their texts go only to entry 511, gen_mvu_entries.py)
_rc = json.load(open(P('data/rule_cards.json'), encoding='utf-8'))['cards']
# 1.57.0 (U3): places whose first visit is a Journal line (an access rule, or the sealed site)
_locs = json.load(open(P('data/locations.json'), encoding='utf-8'))
_EVERYDAY = {'Reception and Gatehouse', 'Combat Grounds'}   # an access line, but every student passes through them (classes, the way in)
_notable = sorted(v['name'] for v in _locs.values() if (v.get('access') or v.get('category') == 'The Site') and v['name'] not in _EVERYDAY)
assert t.count('/*@@NOTABLE@@*/[]') == 1
t = t.replace('/*@@NOTABLE@@*/[]', json.dumps(_notable, ensure_ascii=False))
assert t.count('/*@@RULE_CARDS@@*/{}') == 1
t = t.replace('/*@@RULE_CARDS@@*/{}', json.dumps({k: v['feature'] for k, v in _rc.items()}, separators=(',', ':')))
assert t.count('/*@@NOW_DATA@@*/{}') == 1 and t.count('/*@@AGE@@*/') == 1
t = fill_data(t.replace('/*@@NOW_DATA@@*/{}', json.dumps(now_data(npcs), ensure_ascii=False, separators=(',', ':'))).replace('/*@@AGE@@*/', AGE_JS))
for ph, v in (('CAMPUS_MAP', {**campus_map(locs, pins), 'rates': json.load(open(P('data/campus.json'), encoding='utf-8'))}), ('PRESENCE', presence_data(npcs, locs))):
    assert t.count('/*@@' + ph + '@@*/{}') == 1, ph
    t = t.replace('/*@@' + ph + '@@*/{}', json.dumps(v, ensure_ascii=False, separators=(',', ':')))
# 1.24.0 (owner playtest): lore and rumours of a place are heard, not given. {place key: [[uid, name as prose writes it, title, text]]};
# the text is the lore entry without its [title] line, told once in <now> when it is overheard
place_lore = {}
for lid, l in sorted(locs.items()):
    for x in l.get('lore') or []:
        body = open(P(f"src/worldbook/content/{x['uid']}.txt"), encoding='utf-8').read().strip()
        body = ' '.join(ln.strip() for ln in re.sub(r'^\[[^\]]+\]\s*', '', body).split('\n') if ln.strip())
        name = re.sub(r'^(?:[A-Z][a-z]+ )+- ', '', x['title']); name = re.sub(r'^The ', '', name)
        place_lore.setdefault(re.sub(r'^the ', '', l['name'].lower()), []).append([x['uid'], name, x['title'], body])
# 1.24.3: places on each year's floor (curate_data.py YEAR_FLOORS) -> their floors, for canonLocation
t = t.replace('/*@@YEAR_FLOOR_PLACES@@*/{}', json.dumps({l['name']: l['floors'] for l in locs.values() if l.get('floors')}, ensure_ascii=False))
t = t.replace('/*@@PLACE_LORE@@*/{}', json.dumps(place_lore, ensure_ascii=False, separators=(',', ':')))
# 1.3.1 Settings for training and reputation (data/tuning.json); the defaults must be the numbers the data files use
tun = json.load(open(P('data/tuning.json'), encoding='utf-8'))
rows = [r for g in tun['groups'] for r in g['rows']]
_src = {'training': json.load(open(P('data/training.json'), encoding='utf-8')), 'reputation': json.load(open(P('data/reputation.json'), encoding='utf-8'))}
for r in rows:
    assert any(o[0] == r['def'] for o in r['opts']), f"tuning {r['id']}: default not an option"
    if r['src']:
        f, k = r['src'].split('.'); assert _src[f][k] == r['def'], f"tuning {r['id']}: default {r['def']} != {r['src']} {_src[f][k]}"
t = t.replace('/*@@TUNING@@*/[]', json.dumps([{k: r[k] for k in ('id', 'opts', 'def')} for r in rows], ensure_ascii=False, separators=(',', ':')))
outdoor = sorted({k for lid in outdoor_ids(locs) for k in place_keys(locs[lid], lid)})
t = t.replace('/*@@OUTDOOR@@*/[]', json.dumps(outdoor, ensure_ascii=False))
# 1.9.5 (playtest Batch 5): shop items with a mechanical effect, by lowercase name (data/shop.json gear / use)
shop_fx = {i['item'].lower(): {k: i[k] for k in ('gear', 'use') if k in i} for i in json.load(open(P('data/shop.json'), encoding='utf-8'))['items'] if i.get('gear') or i.get('use')}
shop_fx.update({i['name'].lower(): {k: i[k] for k in ('gear', 'use') if k in i} for i in crafts['recipes'] if i.get('gear') or i.get('use')})
t = t.replace('/*@@SHOP_FX@@*/{}', json.dumps(shop_fx, ensure_ascii=False, separators=(',', ':')))
shop_prices = {}   # 1.45.0 (audit 3.4): [price, shop, the shop's place key (engine placeKey), seasons or 0, item name]
for i in json.load(open(P('data/shop.json'), encoding='utf-8'))['items']:
    place = re.sub(r'^the ', '', locs[i['loc']]['name'].lower())
    shop_prices.setdefault(i['item'].lower(), []).append([i['price'], i['shop'], place, 0 if i.get('season', 'all') == 'all' else i['season'], i['item']])
t = t.replace('/*@@SHOP_PRICE@@*/{}', json.dumps(shop_prices, ensure_ascii=False, separators=(',', ':')))
# v1.1.0 (spec §9): Features settings, single source data/features.json (the engine needs id, control, field, paths, unlock)
feats = json.load(open(P('data/features.json'), encoding='utf-8'))['features']
t = t.replace('/*@@FEATURES@@*/[]', json.dumps([{k: f[k] for k in ('id', 'control', 'field', 'paths', 'unlock') if k in f} for f in feats], ensure_ascii=False, separators=(',', ':')))
hap = json.load(open(P('data/happenings.json'), encoding='utf-8'))['items']
WX_KINDS = {'snow', 'after_storm', 'dense_fog', 'clear_night'}
assert all(h.get('weather') in (None, *WX_KINDS) for h in hap), 'unknown happening weather'
locnames = {l['name'] for l in locs.values()}
assert all(h['where'] in locnames or h['where'] == '' for h in hap), [h['where'] for h in hap if h['where'] not in locnames]
t = t.replace('/*@@HAPPENINGS@@*/[]', json.dumps(hap, ensure_ascii=False, separators=(',', ':')))
# 1.16.0 ambience (planning/DRAFT_dynamic_ambience.md): every place a category names must be a known place
amb = json.load(open(P('data/ambience.json'), encoding='utf-8'))
_lnames = {re.sub(r'^the ', '', k.lower()) for k in pnames} | {re.sub(r'^the ', '', l['name'].lower()) for l in locs.values()} | set(campus)
_bad = [n for c in amb['cats'].values() for n in c['places'] if n not in _lnames] + [n for u in amb['uncanny'] for n in u['places'] if n not in _lnames]
assert not _bad, f'ambience.json: unknown places {_bad}'
assert all(len(c[k]) == 9 for c in amb['cats'].values() for k in ('class', 'free', 'sat') if k in c) and len(amb['sun']) == 12, 'ambience.json: rhythm or sun table'
assert all(b[0] == '*' or b[0] in amb['cats'] for b in amb['cues'] + amb['beats']), 'ambience.json: unknown category'
t = t.replace('/*@@AMBIENCE@@*/{}', json.dumps({k: v for k, v in amb.items() if not k.startswith('_')}, ensure_ascii=False, separators=(',', ':')))
# 1.31.0 restful places (keyed by the place's lowercase name) and letters home; their items must be shop items
_rest = json.load(open(P('data/restore_places.json'), encoding='utf-8'))['places']
assert all(lid in locs for lid in _rest), 'restore_places.json: unknown place'
t = t.replace('/*@@RESTFUL@@*/{}', json.dumps({re.sub(r'^the ', '', locs[lid]['name'].lower()): v for lid, v in _rest.items()}, ensure_ascii=False, separators=(',', ':')))
_home = {k: v for k, v in json.load(open(P('data/letters_home.json'), encoding='utf-8')).items() if not k.startswith('_')}
_shopnames = {i['item'] for i in json.load(open(P('data/shop.json'), encoding='utf-8'))['items']}
assert all(n in _shopnames for n, _ in _home['items']), 'letters_home.json: not a shop item'
t = t.replace('/*@@HOME@@*/{}', json.dumps(_home, ensure_ascii=False, separators=(',', ':')))
# 1.33.0 (owner-approved planning/DRAFT_classes_and_teachers.md): free periods, the chance and the reasons per teacher
_free = {k: v for k, v in json.load(open(P('data/free_periods.json'), encoding='utf-8')).items() if not k.startswith('_')}
assert all(k in json.load(open(P('data/npcs.json'), encoding='utf-8')) for k in _free['npcs']), 'free_periods.json: unknown NPC'
t = t.replace('/*@@FREE@@*/{}', json.dumps(_free, ensure_ascii=False, separators=(',', ':')))
# 1.38.0 (owner-approved planning/DRAFT_outside_maps.md, part 1): the Grand Vast Forest (places, legs, beasts, rates, weather);
# the descriptions stay in the lore and the UI
_exp = json.load(open(P('data/expedition.json'), encoding='utf-8'))
_eids = {p['id'] for p in _exp['places']}
assert all(a in _eids and b in _eids for a, b, *_ in _exp['legs']), 'expedition.json: a leg names an unknown place'
assert all(p['group'] in _exp['groups'] for p in _exp['places']), 'expedition.json: unknown group'
t = t.replace('/*@@EXPEDITION@@*/{}', json.dumps({**{k: v for k, v in _exp.items() if not k.startswith('_') and k != 'groups'},
    'groups': {g: {k: v for k, v in G.items() if k in ('IV', 'III', 'II', 'protected', 'rate')} for g, G in _exp['groups'].items()}},
    ensure_ascii=False, separators=(',', ':')))
# 1.39.0 (owner-approved planning/DRAFT_outside_maps.md, part 2): Avalon (pins, places, walks, rates, the city-life pools) and
# the rival academies' students for the chance meetings there ({id: lorebook school year}); descriptions stay in the lore and the UI
_av = json.load(open(P('data/avalon.json'), encoding='utf-8'))
_apins, _aids = {p['id'] for p in _av['pins']}, {p['id'] for p in _av['places']}
assert all(a in _apins and b in _apins for a, b, _m in _av['legs']), 'avalon.json: a leg names an unknown pin'
assert all(p['pin'] in _apins for p in _av['places']) and all(set(v) <= _aids for v in _av['where'].values()), 'avalon.json: unknown pin or place'
_npcs_all = json.load(open(P('data/npcs.json'), encoding='utf-8'))
t = t.replace('/*@@AVALON@@*/{}', json.dumps({**{k: v for k, v in _av.items() if not k.startswith('_')},
    'places': [{k: v for k, v in p.items() if k not in ('desc', 'vibe')} for p in _av['places']],
    'rivals': {nid: n['year'] for nid, n in sorted(_npcs_all.items()) if (n.get('group') or '').endswith('team')}},
    ensure_ascii=False, separators=(',', ':')))
# 1.40.0 (owner-approved planning/DRAFT_airship.md): the airship flights and the places aboard; descriptions stay in the lore and the UI
_air = json.load(open(P('data/airship.json'), encoding='utf-8'))
_airids = {p['id'] for p in _air['places']}
assert _air['board'] in _airids and _air['bath']['place'] in _airids, 'airship.json: board or bath names an unknown place'
assert all(f['who'] in ('all', 'kingdom') and f['dir'] in ('out', 'home') and f['route'] + '_' + f['dir'] in _air['views'] and f['route'] + '_' + f['dir'] in _air['cargo']
           and len(_air['views'][f['route'] + '_' + f['dir']]) == 3 and (f['route'] in _air['sky']) for f in _air['flights']), 'airship.json: a flight without its views, cargo or sky'
assert all(re.match(r'^\d\d:\d\d$', f['from']) and f['from'] < f['to'] for f in _air['flights']), 'airship.json: flight times'
t = t.replace('/*@@AIRSHIP@@*/{}', json.dumps({**{k: v for k, v in _air.items() if not k.startswith('_')},
    'places': [{k: v for k, v in p.items() if k not in ('desc', 'line')} for p in _air['places']]}, ensure_ascii=False, separators=(',', ':')))
# 1.41.0 (owner-approved planning/DRAFT_outside_maps.md, part 3): Sunreach Bay (pins, places, walks, rates, games, the hourly pools,
# who may be met where); descriptions stay in the lore and the UI
_sr = json.load(open(P('data/sunreach.json'), encoding='utf-8'))
_spins, _sids = {p['id'] for p in _sr['pins']}, {p['id'] for p in _sr['places']}
assert all(a in _spins and b in _spins for a, b, *_m in _sr['legs']) and all(p['pin'] in _spins for p in _sr['places']), 'sunreach.json: unknown pin'
assert _sr['arrive'] in _sids and _sr['hotel'] in _sids and set(_sr['street']) <= _sids and set(_sr['theft']['where']) <= _sids, 'sunreach.json: unknown place'
assert all(set(d + n) <= _sids for g in _sr['meet'].values() for d, n in g.values()), 'sunreach.json: meet names an unknown place'
assert set(_sr['meet']['rivals']) <= {nid for nid, n in _npcs_all.items() if (n.get('group') or '').endswith('team')}, 'sunreach.json: not a rival team member'
assert set(_sr['meet']['halvard']) <= {nid for nid, n in _npcs_all.items() if n.get('academy') == 'Halvard' and (n.get('group') or '').startswith('Year')}, 'sunreach.json: not a Halvard student'
t = t.replace('/*@@SUNREACH@@*/{}', json.dumps({**{k: v for k, v in _sr.items() if not k.startswith('_')},
    'places': [{k: v for k, v in p.items() if k not in ('desc', 'feel', 'night', 'night_feel', 'narrator', 'brief')} for p in _sr['places']]},
    ensure_ascii=False, separators=(',', ':')))
# Bond rules and where each NPC is usually found (Haunts, first clause).
t = t.replace('/*@@BOND_RULES@@*/{}', json.dumps(json.load(open(P('data/bond_rules.json'), encoding='utf-8')), ensure_ascii=False, separators=(',', ':')))
haunt = {}
for nid, n in npcs.items():
    f = next((f['text'] for f in n['fields'] if f['label'] == 'Haunts'), '')
    if f: haunt[nid] = re.split(r'[;.]', f.replace('{{user}}', 'you'))[0].strip()[:80]
# 1.3.0 bond rewards, reputation, training (data/*.json single sources) and each NPC's group for them
rew = json.load(open(P('data/bond_rewards.json'), encoding='utf-8'))
assert all(nid in npcs for nid in rew['npcs']) and all(nid in npcs for nid in rew['mask'] + [rew['krieg']['id']]), 'bond_rewards.json: unknown NPC'
rep = json.load(open(P('data/reputation.json'), encoding='utf-8'))
assert all(nid in npcs for nid in rep['anti_doves'] + rep['pro_doves'] + rep['doves_bond']), 'reputation.json: unknown NPC'
strip = lambda o: {k: v for k, v in o.items() if not k.startswith('_')}
t = t.replace('/*@@BOND_REWARDS@@*/{}', json.dumps(strip(rew), ensure_ascii=False, separators=(',', ':')))
t4 = json.load(open(P('data/rank4_partners.json'), encoding='utf-8'))['npcs']
assert set(t4) == set(rew['npcs']) and all(v and set(v) <= {'mana', 'stamina', 'study'} and len(v) == len(set(v)) for v in t4.values()), 'rank4_partners.json: one to three unique activities for every bonded NPC'
t = t.replace('/*@@RANK4_PARTNERS@@*/{}', json.dumps(t4, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@REPUTATION@@*/{}', json.dumps(strip(rep), ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@TRAINING@@*/{}', json.dumps(strip(json.load(open(P('data/training.json'), encoding='utf-8'))), ensure_ascii=False, separators=(',', ':')))
grp = lambda n: 'rival' if (n.get('group') or '').endswith('team') else 'staff' if n.get('group') == 'Staff' else 'student' if re.match(r'^Year \d$', n.get('group') or '') else 'other'
t = t.replace('/*@@NPC_GROUP@@*/{}', json.dumps({nid: grp(n) for nid, n in sorted(npcs.items())}, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@HAUNTS@@*/{}', json.dumps(haunt, ensure_ascii=False, separators=(',', ':')))
# 1.51.0 (feature batch 3, audit 4.8): lines between NPCs for pair moments: [from, to, type, rank to see it (0 public, 99 a secret), via]
_pairs = []
for _e in json.load(open(P('data/relations.json'), encoding='utf-8')):
    _ty = next((x for x in ('rivals', 'friends', 'dislike') if x in _e['types']), None)
    if _e.get('rule') or not _ty: continue
    _v = _e['visibility']
    assert _v == 'public' or _v.startswith('rank:'), _v
    _pairs.append([_e['from'], _e['to'], _ty, 0 if _v == 'public' else int(_v.split(':')[1]), _e.get('via') or _e['from']])
assert all(x[0] in npcs and x[1] in npcs and x[4] in npcs for x in _pairs)
t = t.replace('/*@@REL_PAIRS@@*/[]', json.dumps(_pairs, ensure_ascii=False, separators=(',', ':')))
# 1.3.8 Tension (data/tension.json): every bonded NPC has a category or an override
ten = strip(json.load(open(P('data/tension.json'), encoding='utf-8')))
bonded = [nid for nid, n in npcs.items() if grp(n) != 'rival']
assert not [i for i in bonded if i not in ten['npcs'] and i not in ten['overrides']], ('tension.json: NPC without a category', [i for i in bonded if i not in ten['npcs'] and i not in ten['overrides']])
assert all(c in ten['categories'] for c in ten['npcs'].values()) and all(i in npcs for i in list(ten['npcs']) + list(ten['overrides'])), 'tension.json: unknown category or NPC'
t = t.replace('/*@@TENSION@@*/{}', json.dumps(ten, ensure_ascii=False, separators=(',', ':')))
# 1.4.3 Trust (data/trust.json): the category is the NPC's openness (data/bond_openness.json; not listed = normal); friends are the
# Friends lines of People -> Connections (data/relations.json), for the spread of a betrayal
tru = strip(json.load(open(P('data/trust.json'), encoding='utf-8')))
opn = json.load(open(P('data/bond_openness.json'), encoding='utf-8'))
tru['npcs'] = {nid: next((c for c in ('open', 'guarded', 'closed') if nid in opn[c]), 'normal') for nid in bonded}
assert all(c in tru['categories'] for c in tru['npcs'].values()) and all(i in npcs for i in list(tru['overrides']) + list(tru['dorm_head'])), 'trust.json: unknown category or NPC'
assert all(v['category'] in tru['categories'] for v in tru['dorm_head'].values()), 'trust.json: dorm_head category'
fr = {}
for e in json.load(open(P('data/relations.json'), encoding='utf-8')):
    if e['type'] == 'friends' and not e.get('rule'): fr.setdefault(e['from'], set()).add(e['to']); fr.setdefault(e['to'], set()).add(e['from'])
tru['friends'] = {k: sorted(v) for k, v in sorted(fr.items())}
t = t.replace('/*@@TRUST@@*/{}', json.dumps(tru, ensure_ascii=False, separators=(',', ':')))
t = t.replace('/*@@NAME_FORMS@@*/{}', json.dumps(forms, ensure_ascii=False, separators=(',', ':')))
# 1.5.1 (P6): first names that are also ordinary words; a sentence-initial one is not counted as a mention
MENTION_DENY = ['Pip', 'Ruby', 'Maple', 'Wren']   # 1.7.0: maple (the tree), wren (the bird)
# 1.6.0 (N2): stability type per NPC (owner canon; empty until the canon waves)
CANON = json.load(open(P('data/npc_canon.json'), encoding='utf-8'))
assert all(k in npcs for k in CANON['change']) and set(CANON['change'].values()) <= {'fixed', 'shaped', 'fluid'}
t = t.replace('/*@@CHANGE@@*/{}', json.dumps(CANON['change'], ensure_ascii=False))
assert all(CANON.get('branch', {}).get(k) in ('A', 'B', 'C', 'D') for k in CANON['change']), 'every NPC in npc_canon.json change needs a Rank 8 branch (A-D)'
t = t.replace('/*@@BRANCH@@*/{}', json.dumps(CANON.get('branch', {}), ensure_ascii=False, separators=(',', ':')))   # 1.6.8
# 1.7.7 (FP1): the already-approved Stage is the only motive supplied for a selected NPC's initiative.
stages = {nid: voice['stages'] for nid, voice in CANON['voice'].items()}
assert all(set(bands) == {'0-2', '3-5', '6-8', '9-10'} for bands in stages.values()), 'FP1 needs all four Stage bands'
t = t.replace('/*@@INITIATIVE_STAGES@@*/{}', json.dumps(stages, ensure_ascii=False, separators=(',', ':')))
openness = {nid: next((tag for tag in ('open', 'guarded', 'closed') if nid in opn[tag]), 'normal') for nid in stages}
t = t.replace('/*@@INITIATIVE_OPENNESS@@*/{}', json.dumps(openness, ensure_ascii=False, separators=(',', ':')))
# 1.10.2 (FP11): templates for why an NPC seeks {{user}} out, each NPC's Tension category and club
_askd = json.load(open(P('data/initiative_asks.json'), encoding='utf-8')); _asks = _askd['categories']
_cats = json.load(open(P('data/tension.json'), encoding='utf-8'))['npcs']
_nclub = {}
from common import load_clubs as _load_clubs
for _c in _load_clubs(npcs, locs):
    for _m in _c['members']: _nclub.setdefault(_m, _c['name'])
# 1.49.0 (audit 4.6): favours, per category but strained; each template names {thing} or {place}
_fav = _askd['favours']
assert set(_fav['asks']) <= set(_asks) - {'strained'}, 'favour categories'
assert all(('{thing}' in x) != ('{place}' in x) for v in _fav['asks'].values() for x in v), 'a favour names {thing} or {place}'
t = t.replace('/*@@INITIATIVE_ASKS@@*/{}', json.dumps({'asks': _asks, 'cat': _cats, 'club': _nclub, 'places': _askd.get('places', []),
    'fav': {k: v for k, v in _fav.items() if k != '_note'}}, ensure_ascii=False, separators=(',', ':')))
# 1.6.1 (N6): campus phases, one line each for <now> while the phase runs (empty until the canon waves)
PH = json.load(open(P('data/campus_phases.json'), encoding='utf-8'))['phases']
assert all({'id', 'from', 'to', 'line'} <= set(p) for p in PH), 'campus phase needs id, from, to, line'
t = t.replace('/*@@PHASES@@*/[]', json.dumps(PH, ensure_ascii=False, separators=(',', ':')))
assert all(x in npcs for x in MENTION_DENY)
t = t.replace('/*@@MENTION_DENY@@*/[]', json.dumps(MENTION_DENY))
# 1.60.0: Lore_changes subjects -> their lore entry (common.lore_names, the names build_card's overlay matches); NPC entries apart
from common import lore_names
_lnames, _lnpc = {}, []
for _e in json.load(open(P('src/worldbook/index.json'), encoding='utf-8')):
    for _n in lore_names(_e): _lnames.setdefault(_n, _e['uid'])
    if lore_names(_e) and re.match(r'^(\[[^\]]*\]\s*)?NPC\s+[—–-]', _e.get('comment', '')): _lnpc.append(_e['uid'])
assert t.count('/*@@LORE_NAMES@@*/{}') == 1 and _lnpc
t = t.replace('/*@@LORE_NAMES@@*/{}', json.dumps({'names': _lnames, 'npc': _lnpc}, ensure_ascii=False, separators=(',', ':')))
open(P('src/scripts/engine.js'), 'w', encoding='utf-8').write(t.replace('/*@@NPC_ALIAS@@*/{}', json.dumps(alias, ensure_ascii=False, separators=(',', ':'))))
assert '/*@@' not in open(P('src/scripts/engine.js'), encoding='utf-8').read(), 'unreplaced placeholder in engine.js'
print('aliases:', len(alias), '| outdoor names:', len(outdoor), '| features:', len(feats))
