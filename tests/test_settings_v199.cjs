// 1.9.9 complete Settings: every Settings row has a real choice, and the new rows (mana recovery, NPC initiative, rumour lifetime,
// tension fading) change what the engine does.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { fromAbs };')();
const TUN = JSON.parse(read('data/tuning.json'));
const DAY = 1440;
const at = (S, d, hhmm, extra = []) => { const [h, m] = hhmm.split(':').map(Number), T = E.fromAbs(d * DAY + h * 60 + m);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })), ...extra]); };
const tune = (S, o) => applyPatch(S, [{ op: 'replace', path: '/$ui/tune', value: o }]);

console.log('Settings 1.9.9');
const rows = TUN.groups.flatMap(g => g.rows.map(r => [g.id, r]));
const single = rows.filter(([, r]) => r.opts.length < 2).map(([g, r]) => g + '.' + r.id);
ok(!single.length, `every Settings row offers a real choice (${rows.length} rows)` + (single.length ? ': ' + single.join(', ') : ''));
ok(rows.every(([, r]) => r.opts.some(([v]) => v === r.def)), 'every default is one of its options');
ok(['mana_regen', 'init_rate', 'gossip_life', 'tension_fade'].every(id => rows.some(([, r]) => r.id === id)), 'new rows: mana recovery, NPC initiative, rumour lifetime, tension fading');
const ui = new Function('global.window={parent:{document:{}}};' + read('src/scripts/ui.js') + '\nreturn { view, renderProfile };')();
ui.view.tab = 'settings';
const html = ui.renderProfile(initState());
ok(['Body and magic', 'Campus life', 'Mana recovery', 'Rumour lifetime', 'Tension fades', '8 hours', '25 per hour'].every(x => html.includes(x)), 'the Settings tab shows the new groups and the completed Mood and rest rows');

// mana recovery follows the setting (and the narrator rule says so)
const base = applyPatch(tune(at(initState(), 30, '08:00', [{ op: 'replace', path: '/$ui/wxfx', value: 'off' }]), { mana_regen: 4 }), [{ op: 'replace', path: '/Player/Vitals/Mana', value: 0 }]);
ok(base.Player.Vitals.Mana === 0, 'start from an empty pool');
const four = at(base, 30, '12:00');
ok(four.Player.Vitals.Mana === four.Player.Vitals.Mana_max, `4-hour setting: full after 240 minutes (${four.Player.Vitals.Mana})`);
const twelve = at(tune(base, { mana_regen: 12 }), 30, '14:00');
ok(Math.abs(twelve.Player.Vitals.Mana - twelve.Player.Vitals.Mana_max / 2) < 0.2, `12-hour setting: half after 6 hours (${twelve.Player.Vitals.Mana})`);
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data, ejs = require('ejs');
const r502 = S => ejs.render(card.character_book.entries.find(e => e.id === 502).content, { getvar: k => _.get({ stat_data: S }, k) });
ok(/empty to full in 12 hours/.test(r502(tune(base, { mana_regen: 12 }))) && /empty to full in 6 hours/.test(r502(initState())), 'rule 502 states the chosen recovery time');

// NPC initiative frequency: count contact days over twelve weeks with the same seed
const count = rate => { let S = tune(applyPatch(initState({ etnie: true }), [{ op: 'replace', path: '/$eng/seed', value: 777 }]), { init_rate: rate }), n = 0;
  for (let d = 1; d <= 84; d++) { S = at(S, d, '09:00'); if (S.$ui.initiative) n++; } return n; };
const [rare, normal, often] = [1, 2, 3].map(count);
ok(rare < normal && normal < often && rare >= 1, `NPC initiative: rare ${rare} < normal ${normal} < often ${often} contact days in 12 weeks`);

// rumour lifetime
const rum = life => { let S = tune(at(initState(), 3, '09:00'), { gossip_life: life });
  S = applyPatch(S, [{ op: 'replace', path: '/Campus_State/Rumours', value: ['Someone saw a light in the Bell Tower (x)'] }]);
  if (S.$eng.rum['Someone saw a light in the Bell Tower (x)'].fate === 'fizzle') return null;
  return [12, 25, 45].map(d => (at(S, 3 + d, '09:00').Campus_State.Rumours || []).length); };
const r10 = rum(10), r42 = rum(42);
ok(r10 && r42 && r10[0] === 0 && r42[0] === 1 && r42[1] === 1 && r42[2] === 0, `rumours die out after the chosen lifetime (10 days: ${r10}; 6 weeks: ${r42})`);

// tension fading
const fade = f => { let S = tune(initState({ etnie: true }), { tension_fade: f });
  S = applyPatch(S, [{ op: 'replace', path: '/Bonds/Etnie/Tension', value: 40 }]); const t0 = S.Bonds.Etnie.Tension; S = at(S, 20, '09:00'); return [t0, S.Bonds.Etnie.Tension]; };
const [[a0, f0], [a1, f1], [a2, f2]] = [0, 1, 2].map(fade);
ok(a0 === a1 && a1 === a2 && f0 === a0 && f1 < a1 && f2 < f1, `tension fading after ~3 quiet weeks from ${a0}: never ${f0}, standard ${f1}, faster ${f2}`);
