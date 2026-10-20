// 1.11.0 token audit (planning/DRAFT_token_audit.md A1-A10, B1, C1): situational rules only when they apply, one copy of each rule,
// the state without $ keys / empty values / retired bond fields, and adult preset toggles off by default.
const fs = require('fs'), path = require('path'), ejs = require('ejs'), YAML = require('yaml');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const R = (uid, S) => ejs.render(card.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const set = (S, ops) => { S = _.cloneDeep(S); for (const [p, v] of ops) _.set(S, p, v); return S; };   // render-only states
const S0 = initState({ etnie: true });
const entrance = set(S0, [['World.Month', 1], ['World.Week', 1], ['World.Day', 'Mon']]);
const ordinary = set(S0, [['World.Month', 2], ['World.Week', 2], ['World.Day', 'Tue']]);

console.log('Situational rules (A3, A4, A5)');
ok(/Entrance Event \(M1 W1 Mon\)/.test(R(502, entrance)) && !/Entrance Event \(M1 W1 Mon\)/.test(R(502, ordinary)), '502 Entrance paragraph only on Entrance day');
ok(/Entrance_tour \{/.test(R(502, entrance)) && !/Entrance_tour \{/.test(R(502, ordinary)), '502 Entrance_tour rule only on Entrance day');
ok(/On Entrance morning, follow the ceremony/.test(R(504, entrance)) && !/On Entrance morning/.test(R(504, ordinary)), '504 Entrance bullets only on Entrance day');
ok(/Entrance morning \(Month 1 Week 1 Monday\)/.test(R(97, entrance)) && !/Entrance morning/.test(R(97, ordinary)), 'NPC Roster Entrance paragraph only on Entrance day');
const withCast = S => set(S, [['$ui.cast', { full: ['Etnie'], brief: [] }]]);
ok(/On Entrance morning, check each first-year/.test(R(510, withCast(entrance))) && !/On Entrance morning/.test(R(510, withCast(ordinary))), '510 Entrance check only on Entrance day');
ok(/debate Friday 16:00-18:00/.test(R(502, set(S0, [['World.Month', 10]]))) && !/debate Friday/.test(R(502, ordinary)) && /election is Month 10 Week 3 \(details that month\)/.test(R(502, ordinary)), 'Council details in Months 9-10, one line otherwise');
ok(!/- Pacts \(key = /.test(R(502, ordinary)) && /- Pacts \(key = /.test(R(502, set(ordinary, [['Magic.Pacts', { Ember: { Kind: 'Spirit' } }]]))), 'Pacts rule only with a pact (1.54.0: its core line; the full rule is a card)');
ok(!/Dove_attention 0–100/.test(R(502, ordinary)) && /Dove_attention 0–100/.test(R(502, set(ordinary, [['Hidden._True_magic', 'Effigy']]))), 'Hidden rules only with hidden magic');
ok(!/- _Perks:/.test(R(502, ordinary)) && /- _Perks:/.test(R(502, set(ordinary, [['_Perks', { Ribbon: { From: 'Etnie', Kind: 'gift', Effect: 'x', Uses: 0 } }]]))), '_Perks rule only with a perk');
const r5 = set(ordinary, [['Bonds.Etnie.Rank', 5]]), r9 = set(ordinary, [['Bonds.Etnie.Rank', 9]]);
ok(!/rank_gift/.test(R(502, ordinary)) && /rank_gift/.test(R(502, r5)) && !/introduction/.test(R(502, r5)) && /introduction/.test(R(502, r9)) && /Kind "vouch"/.test(R(502, r9)) && /escort \{\{user\}\} into their dorm/.test(R(502, r9)), 'rank-specific rules appear from the rank a bond has reached');
ok(!/- Graduated \(list\)/.test(R(502, ordinary)) && /- Graduated \(list\)/.test(R(502, set(ordinary, [['World.Month', 11]]))), 'Graduated rule from Month 11');

console.log('One copy of each rule (A1, A2, A7, A9, A10)');
const r502 = R(502, ordinary), r504 = R(504, ordinary);
ok(r502.trim().endsWith('</variable_update_rules>') && !/Students may buy alcohol/.test(r502) && /Students may buy alcohol/.test(fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/512.txt'), 'utf8')) && !/\+1 XP|×1\.5|−10% stamina ceiling/.test(r502), 'every 502 rule is inside the tag, without engine arithmetic');
ok(/on consuming The Vigil, insert "The Vigil"/i.test(r502) && /blocks wind shelters casts/.test(r502) && /Birthdays: remembering someone's birthday matters/.test(r502), 'what the narrator must do from those blocks is kept');
ok(r502.indexOf('  - Doves kinds:') < r502.indexOf('- Exams: the engine marks') && r502.indexOf('- Reputation:') < r502.indexOf('  - Academy kinds:'), 'Exams no longer splits the reputation list');
ok(!/Before setting Time or narrating lateness/.test(r504) && /Arrivals follow the Time rule/.test(r504) && (r504.match(/In a class period/g) || []).length === 1, '504: one travel bullet, one class-period sentence');
ok(!/Magic Duelling Club/.test(r504), '504: the duelling-club correction lives in the lore and the cast gate');
const ev = set(S0, [['World._Event_today', 'Star Night (Sat evening to Sun dawn) — 18:00 gathering on the Hills; the meteor shower from 23:00']]);
ok(/Today: Star Night \(Sat evening to Sun dawn\) \(plan in World\._Event_today\)/.test(R(505, ev)) && !/meteor shower from 23:00/.test(R(505, ev)), '<now> names today\'s events; the plan stays in the state');

console.log('State without empty values (B1, A6)');
const save = JSON.parse(read('tests/fixtures/saves/save_1.10.3.json'));
const st = R(501, save), lines = st.split('\n'), end = lines.indexOf('</current_state>');
let parsed; try { parsed = YAML.parse(lines.slice(3, end).join('\n')); } catch (e) { parsed = null; }
ok(parsed && parsed.World.Time === save.World.Time && parsed.Player.Wallet.Points === save.Player.Wallet.Points, 'the state is valid YAML with the same values');
const keysDeep = o => (o && typeof o === 'object' ? Object.entries(o).flatMap(([k, v]) => [k, ...keysDeep(v)]) : []);
ok(!keysDeep(parsed).some(k => k.startsWith('$')) && !Object.values(parsed.Bonds).some(b => b && typeof b === 'object' && ('Progress' in b || '_Event_ready' in b)), 'no $ keys and no retired bond fields');
ok(!/: ""$|: \[\]$|: \{\}$|: false$/m.test(st), 'no empty values printed');
const omit = o => (Array.isArray(o) ? o.map(omit) : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('$')).map(([k, v]) => [k, omit(v)])) : o);
const before = YAML.stringify(omit(save)).length, after = lines.slice(3, end).join('\n').length;
ok(after < before * 0.85, `the state is shorter (${Math.round(after / 3.6)} vs ${Math.round(before / 3.6)} tokens)`);
ok(/Empty fields are not shown; they still exist/.test(st), 'the narrator is told empty fields still exist');

console.log('Preset (C1; 1.68.0: RF 2.2.1.3 as it ships)');
const PS = JSON.parse(read('dist/Realistic_Frankenstein_2_2_1_3_Eldrasil.json'));
const onP = new Set(PS.prompt_order[0].order.filter(o => o.enabled).map(o => o.identifier));
const named = frag => PS.prompts.find(p => (p.name || '').includes(frag));
ok(onP.has(named('Realism Mode / Jailbreak').identifier) && onP.has(named('NSFW Anti-Slop Register').identifier) && !onP.has(named('Freaky Mode').identifier), '1.68.0: Realism Mode and its NSFW register ON as upstream ships them (active only in an NSFW scene), Freaky Mode OFF');
ok(onP.has(named('Female Vocal Acoustics').identifier), 'the vocal cliché fix stays on');
