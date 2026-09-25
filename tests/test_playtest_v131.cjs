// 1.3.1 owner playtest fixes: Etnie's bond starts when they meet (Rank 3), {{user}} in lore text, World.Location in the map's words,
// the Forest's own pin, event day plans with times, club sign-up week, the max-tension penalty, Settings for training and
// reputation, colour themes, the Connections graph layout.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { PANELS, view, DATA, CAL, locIdOf, pinOf, personal, userName, youText, recolor, THEMES, renderProfile, tuneVal };')();
const REP = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/reputation.json'), 'utf8'));
const BR = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bond_rules.json'), 'utf8'));
console.log('Playtest fixes 1.3.1');
const clone = o => JSON.parse(JSON.stringify(o));
const T = (S, time, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...extra]);
const at = (S, W, extra = []) => applyPatch(S, [...Object.entries(W).map(([k, v]) => ({ op: 'replace', path: `/World/${k}`, value: v })), ...extra]);
const present = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const tune = (S, o) => applyPatch(S, [{ op: 'replace', path: '/$ui/tune', value: o }]);

// ---- 1. Etnie: not bonded at the start; meeting her starts the bond at Rank 3
const S0 = initState();
ok(Object.keys(S0.Bonds).length === 0, 'a new chat starts with no bonds (Etnie is not there yet)');
let E = T(S0, '10:30', [present(['Etnie'])]);
const eb = E.Bonds.Etnie;
ok(eb && eb.Rank === 3 && eb.Trust === 70 && eb.Title === 'Self-declared big sister', `meeting Etnie: Rank 3, Trust 70, her title (${eb && eb.Rank})`);
ok(eb.Known_facts.some(f => /big sister/.test(f)) && eb.Milestones.some(m => /little sibling/.test(m)) && E.Journal.some(l => /little sibling/.test(l)), 'her fact, milestone and a journal line');
ok(eb.$xp === 0 && eb.$cool === Math.floor(E.$eng.abs / 1440) + BR.cool_base[3] && !eb._Event_ready, 'the next event waits for the Rank 3 cooldown');
ok(E.$ui.toasts.some(t => /starts at Rank 3/.test(t)), 'toast: the bond starts at Rank 3');
const E2 = T(E, '10:40', [present(['Etnie', 'Trixie'])]);
ok(E2.Bonds.Etnie.Rank === 3 && E2.Bonds.Etnie.Milestones.length === 1 && E2.Bonds.Trixie.Rank === 0, 'applied once; anyone else still starts at Rank 0');
const E3 = T(S0, '10:30', [{ op: 'replace', path: '/Bonds/Etnie', value: { Rank: 6, Trust: 90, Known_facts: ['clingy'] } }]);
ok(E3.Bonds.Etnie.Rank === 3 && E3.Bonds.Etnie.Trust === 70 && E3.Bonds.Etnie.Known_facts.length === 2, 'a bond record the narrator writes first still starts at Rank 3 and her start Trust 70 (1.4.3; its own facts kept)');

// ---- 2. {{user}} in lore text shows the student's name everywhere in the panels
const N = clone(E); N.Player.Profile.Name = 'Aria Vale';
U.view.arg = 'Etnie'; const dos = U.personal(U.PANELS.npc.render(N), N);
ok(!/\{\{user\}\}/i.test(dos) && /Aria/.test(dos), 'dossier: no raw {{user}}, the first name instead');
ok(U.userName(N) === 'Aria' && U.youText('{{user}} and {{USER}}', N) === 'Aria and Aria', 'userName / youText');
const N2 = clone(E); N2.Player.Profile.Name = '{{user}}';
ok(U.userName(N2) === 'you', 'no name and no persona: "you"');

// ---- 3. World.Location in the Campus Map's words (engine) and the map's reading of it (UI)
const L = loc => T(S0, '11:00', [{ op: 'replace', path: '/World/Location', value: loc }]).World.Location;
ok(L('Boathouse') === 'Boathouse and Lake', `"Boathouse" -> "${L('Boathouse')}"`);
ok(L('the boathouse — north dock') === 'Boathouse and Lake — north dock', 'an alias keeps its detail');
ok(L('Boathouse and Lake — Fishing House') === 'Fishing House', `a sub-spot that is its own place wins (${L('Boathouse and Lake — Fishing House')})`);
ok(L('Fire Dormitory — Common Rooms') === 'Fire Dormitory — Common Rooms', 'a room every dorm shares stays under its dorm');
ok(L('Canteen — main kitchen') === 'Canteen — main kitchen' && L('Mail Tower') === 'Mail Tower', 'exact names are left alone');
ok(L('the library') === 'Main Library' && L('Main Courtyard') === 'Courtyards' && L('Gatehouse') === 'Reception and Gatehouse', 'short names');
ok(L('Sunreach Bay — hotel') === 'Sunreach Bay — hotel', 'off-campus places are left alone');
const trip = applyPatch(S0, [{ op: 'replace', path: '/Trip', value: { Active: true, Destination: 'Sunreach Bay' } }, { op: 'replace', path: '/World/Location', value: 'Boathouse' }]);
ok(trip.World.Location === 'Boathouse', 'nothing is renamed on a trip');
ok(T(S0, '11:00', [{ op: 'replace', path: '/World/Location', value: 'Boathouse' }]).$ui.discovered.includes('Boathouse and Lake'), 'discovery records the map name');
ok(U.locIdOf('Boathouse') === 'boathouse_and_lake' && U.locIdOf('Lake — Fishing House') === 'fishing_house' && U.locIdOf('Boathouse and Lake — Fishing House') === 'fishing_house', 'map: "you are here" reads short names and sub-spots');
ok(U.locIdOf('Mail Tower') === 'mail_tower' && U.locIdOf('Sky Dormitory — Laundry') === 'sky_dormitory' && U.locIdOf('the Mall — Nightwell') === 'nightwell', 'map: plain names, shared rooms, shops');
// ---- 4. the Forest has its own pin, below the Forest Clearing
const pf = U.pinOf('forest'), pc = U.pinOf('forest_clearing');
ok(pf && pc && pf.pin !== pc.pin && pf.label === 'Forest' && pf.y > pc.y, `Forest pin ${pf && pf.pin} (${pf && pf.x}%, ${pf && pf.y}%) apart from the Clearing (${pc && pc.pin})`);

// ---- 5. events carry their day plan with times; club sign-up week; curfews per day
const ev = W => at(S0, W).World._Event_today;
ok(/09:00 sorting at the Arbiter Stone/.test(ev({ Time: '08:00' })) && /19:00 Entrance Feast/.test(ev({ Time: '08:00' })) && /10:00–18:00 campus tour/.test(ev({ Time: '08:00' })), 'Entrance Event: 09:00 sorting, tour all day, 19:00 feast');
ok(/Club sign-up week/.test(ev({ Day: 'Tue', Time: '08:00' })) && /16:00–18:00 club booths/.test(ev({ Day: 'Wed', Time: '08:00' })), 'club booths Tue–Fri 16:00–18:00');
ok(/registration closes at 18:00/.test(ev({ Day: 'Fri', Time: '08:00' })) && !/sign-up/.test(ev({ Day: 'Sat', Time: '08:00' })), 'registration closes Friday 18:00');
ok(/Warding Rite \([^)]*\) — Classes as usual/.test(ev({ Month: 2, Week: 1, Day: 'Fri', Time: '08:00' })) && / \| /.test(at(S0, { Month: 5, Week: 2, Day: 'Fri', Time: '08:00' }, [{ op: 'replace', path: '/Player/Profile/Birthday', value: 'M5 W2 Fri' }]).World._Event_today), 'per-day plans; several events are separated by " | "');
const cf = W => at(S0, W).World._Curfew;
ok(!cf({ Month: 8, Week: 2, Day: 'Fri', Time: '21:00' }) && /CURFEW \(22:00/.test(cf({ Month: 8, Week: 2, Day: 'Fri', Time: '22:30' })), 'Traveling Circus: curfew 22:00 (lore)');
ok(!cf({ Month: 10, Week: 4, Day: 'Sat', Time: '22:00' }) && /CURFEW \(20:00/.test(cf({ Month: 10, Week: 4, Day: 'Sun', Time: '21:00' })), 'Harvest Festival: curfew 23:00 Fri and Sat only');
const withPlan = U.CAL.EVENTS.filter(e => !e.home && !/^Return Week/.test(e.t));
ok(withPlan.every(e => e.d.every(d => U.CAL.schedOf(e, d) || (typeof e.s === 'object' && !e.s[d] && e.d.length > 3))), 'every event (but the holidays) has a day plan');
U.view.calSel = 'Y1 M1 W1 Mon'; U.view.nbtab = 'calendar';
const lore21 = fs.readFileSync(path.join(ROOT, 'src/worldbook/content/21.txt'), 'utf8');
ok(/09:00 Sorting/.test(lore21) && /registration closes Friday at 18:00/.test(lore21) && /19:00 Entrance Feast/.test(lore21), 'lore 21 carries the same times');

// ---- 6. reputation: high Tension -5, maximum Tension another -10 (staff Academy, students Student, Milena Doves)
let R = T(S0, '12:00', [present(['Baelin', 'Trixie', 'Milena'])]);
const xp = (S, r) => S.Player.Profile.Reputation.$xp[r];
let R1 = T(R, '12:10', [{ op: 'replace', path: '/Bonds/Baelin/Tension', value: REP.tension_high }]);
ok(xp(R1, 'Academy') === REP.tension_xp, `staff at Tension ${REP.tension_high}: Academy ${REP.tension_xp}`);
R1 = T(R1, '12:20', [{ op: 'replace', path: '/Bonds/Baelin/Tension', value: 100 }]);
ok(xp(R1, 'Academy') === REP.tension_xp + REP.tension_max_xp && R1._Log.some(l => /Maximum tension with Baelin/.test(l)), `maximum Tension: another ${REP.tension_max_xp} (${xp(R1, 'Academy')})`);
const R2 = T(R, '12:10', [{ op: 'replace', path: '/Bonds/Trixie/Tension', value: 100 }, { op: 'replace', path: '/Bonds/Milena/Tension', value: 100 }]);
ok(xp(R2, 'Student') === REP.tension_xp + REP.tension_max_xp - 5 && xp(R2, 'Doves') === REP.tension_xp + REP.tension_max_xp, 'a jump straight to 100 counts both; Milena costs Doves reputation (and, Social since 1.3.8, Student -5 at Enemy)');
const R3 = T(tune(R, { rep_tension: 0 }), '12:10', [{ op: 'replace', path: '/Bonds/Trixie/Tension', value: 100 }]);
ok(xp(R3, 'Student') === 0, 'Settings: tension penalty off');

// ---- 7. Settings: training and reputation (defaults unchanged)
const RE = (Rep, XP, Kind) => ({ op: 'insert', path: '/Rep_events/-', value: { Rep, XP, Kind: Kind || 'repeat', Why: 'test' } });
ok(xp(T(S0, '09:00', [RE('Student', 4), RE('Student', 4)]), 'Student') === REP.weekly_cap, 'default weekly cap unchanged');
ok(xp(T(tune(S0, { rep_week: 0 }), '09:00', [RE('Student', 4), RE('Student', 4)]), 'Student') === 8, 'weekly cap: no limit');
ok(xp(T(tune(S0, { rep_mult: 2, rep_week: 10 }), '09:00', [RE('Student', 4)]), 'Student') === 8, 'pace x2 doubles a gain');
ok(xp(T(tune(S0, { rep_mult: 0.5 }), '09:00', [RE('Doves', -1, 'event')]), 'Doves') === -1, 'pace never rounds a change to 0');
ok(xp(T(tune(S0, { rep_week: 7 }), '09:00', [RE('Student', 9)]), 'Student') === REP.weekly_cap, 'a value that is not an option falls back to the default');
const trainN = (S, n) => { let X = S; for (let i = 0; i < n; i++) X = T(X, `1${i}:00`, [{ op: 'insert', path: '/Training/-', value: { Track: 'stamina' } }]); return X.Player.Vitals.Stamina_max; };
ok(trainN(S0, 5) === 102.5, `default: 1% a session, 2.5% a week (${trainN(S0, 5)})`);
ok(trainN(tune(S0, { trn_week: 0, trn_session: 2 }), 5) === 110, 'no weekly limit, 2% a session');
const big = clone(S0); big.Player.$Training.stamina.gain = 99.5; big.Player.Vitals.Stamina_max = 199.5;
ok(trainN(big, 2) === 200 && trainN(tune(big, { trn_total: 0 }), 2) === 201.5, 'lifetime limit (default twice the start) and no limit');
const rk = S => { const X = clone(S); Object.assign(X.Bonds.Trixie, { Rank: 4, $xp: 999, _Event_ready: true, $cool: -1 }); return T(X, '12:30', [{ op: 'replace', path: '/Bonds/Trixie/Rank', value: 5 }]); };
ok(xp(rk(R), 'Student') === 5 && xp(rk(tune(R, { rep_bond: 0 })), 'Student') === 0, 'bond milestones on (default) and off');
const hi = clone(R); hi.Player.Profile.Reputation.$xp.Student = 70;
ok(xp(rk(hi), 'Student') === 70 && xp(rk(tune(hi, { rep_bond: 2 })), 'Student') === 75, 'milestones stop at +3 by default; "Always" keeps them');
U.view.tab = 'settings'; const st = U.renderProfile(tune(S0, { trn_week: 5 }));
ok(/data-act="tune" data-f="trn_week" data-v="5" class="on"/.test(st) && /data-act="tune" data-f="rep_tension"/.test(st), 'Settings shows the rows with the current value');
ok(/data-act="theme" data-v="parchment"/.test(st) && /data-act="theme" data-v="midnight"/.test(st), 'Settings: Appearance offers the themes');

// ---- 8. colour themes (palette only)
const P = U.THEMES.themes.parchment.map;
ok(U.recolor('.dlg{background:#262a30;color:#e6e3dc}', P) === '.dlg{background:#f6f0e4;color:#2b2620}', 'parchment: background and ink swap');
ok(U.recolor('border:1px solid rgba(255,255,255,.07);color:#fff', P) === 'border:1px solid rgba(0,0,0,.07);color:#1e1a14', 'faint white lines turn dark; white text too');
ok(U.recolor('#c4504a #3f9f69', P) === '#c4504a #3f9f69' && U.recolor('#262a30', {}) === '#262a30', 'bars and dorm colours stay; Pewter changes nothing');
ok(Object.values(U.THEMES.themes).every(t => Object.keys(t.map).every(k => /^(a:)?\d+,\d+,\d+$/.test(k))), 'theme maps are well formed');
const bar = fs.readFileSync(path.join(ROOT, 'src/ui/statusbar.html'), 'utf8');
ok(/const THEMES = \{"default":"pewter"/.test(bar) && /eld\.theme/.test(bar), 'the bracelet carries the themes and follows the same setting');

// ---- 9. Connections graph: laid out at once (the hidden script iframe gets no animation frames)
const ppl = fs.readFileSync(path.join(ROOT, 'src/ui/parts/10_people.js'), 'utf8');
ok(/\.stop\(\);/.test(ppl) && /for \(let i = 0; i < 300; i\+\+\) sim\.tick\(\);\s*draw\(\);/.test(ppl) && /PD\.defaultView/.test(ppl), 'the graph ticks its layout synchronously and drags on the page frames');
