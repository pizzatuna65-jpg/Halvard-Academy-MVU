// 1.3.4 owner playtest: an old lorebook in SillyTavern (Etnie in message 0), the bracelet's theme, map pins in every theme,
// the student's picture, the calendar keeping its scroll, the "Next" chip.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, Schema, runEngine, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { recolor, THEMES, CSS, renderProfile, view, portraitURL, TEMPLATES, blankDraft, buildOps };')();
const VER = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/card/card.json'), 'utf8')).character_version;
console.log('Playtest fixes 1.3.4');
const W = (S, w) => applyPatch(S, Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })));

// ---- 1. the chat's starting state comes from the lorebook ST holds; an old one is detected on the first update
const S0 = initState();
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const e500 = card.character_book.entries.find(e => e.id === 500).content;
ok(new RegExp(`lore: "${VER.replace(/\./g, '\\.')}"`).test(e500) && /Bonds: \{\}/.test(e500), `the card's [initvar] carries its version (${VER}) and no bonds`);
ok(S0.$eng.lore === VER && Object.keys(S0.Bonds).length === 0, 'a new chat from the current lorebook: no bonds');
let N = W(S0, { Time: '07:45' });
ok(!N.$ui.toasts.some(t => /Old lorebook/.test(t)) && !N._Log.some(l => /lorebook/.test(l)), 'current lorebook: no warning');
// a chat started from a 1.3.0 lorebook: no $eng.lore, Etnie at Rank 3 in the starting state
const old = JSON.parse(JSON.stringify(S0)); delete old.$eng.lore; old.$eng.abs = -1;
old.Bonds.Etnie = { Rank: 3, Trust: 70, Tension: 0, Title: 'Self-declared big sister', Romance: false, Known_facts: ["Third-year, Viridian (dog beastkin); insists she is Aria's big sister"], Milestones: ['Etnie decided Aria is her little sibling'], Last_seen: '' };
const O = Schema.parse(old);
N = applyPatch(O, [{ op: 'replace', path: '/World/Time', value: '07:45' }]);
ok(N.$ui.toasts.some(t => /Old lorebook \(before 1\.3\.4\)/.test(t)) && N._Log.some(l => /Import Card Lore/.test(l)), 'an old lorebook: toast and a log line saying how to update it');
ok(!N.Bonds.Etnie, "Etnie's pre-1.3.1 starting bond is dropped (she bonds when they meet)");
ok(N.$eng.lore === VER && !applyPatch(N, [{ op: 'replace', path: '/World/Time', value: '08:00' }]).$ui.toasts.some(t => /Old lorebook/.test(t)), 'warned once');
// an ongoing chat (already processed) is never touched
const run = JSON.parse(JSON.stringify(O)); run.$eng.abs = 5000;
const R = applyPatch(Schema.parse(run), [{ op: 'replace', path: '/World/Time', value: '07:45' }]);
ok(R.Bonds.Etnie && !R.$ui.toasts.some(t => /Old lorebook/.test(t)), 'an ongoing chat keeps its Etnie and gets no warning');

// ---- 8. "Next" on the bracelet: an event's timed item, a class, curfew
const nx = w => W(S0, w).$ui.next;
ok(nx({ Time: '08:00' }).at === '09:00' && /Sorting at the Arbiter Stone in the Arbiter Hall/.test(nx({ Time: '08:00' }).what), 'Entrance Event 08:00: next 09:00 sorting, Arbiter Hall');
ok(nx({ Time: '16:30' }).at === '19:00' && /Entrance Feast/.test(nx({ Time: '16:30' }).what) && nx({ Time: '19:30' }).kind === 'curfew' && nx({ Time: '21:00' }) === null, 'later: the feast, then curfew, then nothing');
ok(nx({ Day: 'Tue', Time: '07:00' }).what === 'Dark Magic Defense' && nx({ Day: 'Tue', Time: '07:00' }).kind === 'class' && nx({ Day: 'Tue', Time: '15:00' }).what === 'Club booths across the academy', 'an ordinary day: the next class; club booths at 16:00');
ok(nx({ Day: 'Sat', Time: '11:00' }).kind === 'club' && nx({ Day: 'Sun', Time: '10:00' }).kind === 'curfew', 'Saturday clubs; Sunday only curfew');
ok(nx({ Month: 2, Week: 1, Day: 'Fri', Time: '15:00' }).at === '17:00' && nx({ Month: 7, Week: 3, Day: 'Wed', Time: '09:00' }) === null && nx({ Month: 10, Week: 4, Day: 'Fri', Time: '19:00' }).at === '23:00', 'dusk (about 17:00), lockdown, a late festival curfew');
ok(nx({ Week: 3, Day: 'Sat', Time: '17:00' }).at === '20:00' && nx({ Week: 3, Day: 'Sat', Time: '17:00' }).kind === 'event', 'Star Night: no curfew, the night market');
const bar = fs.readFileSync(path.join(ROOT, 'src/ui/statusbar.html'), 'utf8');
ok(/chip\('Next ' \+ nx\.at/.test(bar), 'the bracelet shows the Next chip');

// ---- 2. the bracelet re-colours its own style (Tavern Helper adds a <style> of its own first)
ok(/<style id="eld-bar-css">/.test(bar) && /getElementById\('eld-bar-css'\)/.test(bar) && !/document\.querySelector\('style'\)/.test(bar), 'the bracelet finds its CSS by id');

// ---- 3-5. map pins keep high-contrast colours in every theme
for (const th of ['rosewood', 'parchment', 'frost', 'midnight']) {
  const css = U.recolor(U.CSS, U.THEMES.themes[th].map);
  ok(/\.pin\.here\{background:#35e0b0\/\*keep\*\/;[^}]*border:3px solid #ffffff/.test(css) && /\.pin\.sel\{background:#fff4d8/.test(css) && /\.pin\{[^}]*background:#b39062\/\*keep\*\//.test(css), `${th}: you are here (mint, white ring) and the picked place (cream) stand out from the brass pins`);
}
ok(U.recolor('a{color:#262a30/*keep*/;background:#262a30}', U.THEMES.themes.parchment.map) === 'a{color:#262a30/*keep*/;background:#f6f0e4}', '"/*keep*/" opts a colour out of the theme');

// ---- 6. the student's picture
const d = Object.assign(U.blankDraft(), U.TEMPLATES[0].make()); d.name = 'Aria Vale';
let S = applyPatch(S0, U.buildOps(d, S0), { mvu: true });
U.view.tab = 'overview';
let h = U.renderProfile(S);
ok(/class="portrait"/.test(h) && /No picture yet/.test(h) && /<input type="file" accept="image\/\*" data-act="portrait">/.test(h), 'Overview: an empty picture frame with "Upload picture"');
S = applyPatch(S, [{ op: 'replace', path: '/$ui/portrait', value: 'user/images/Eldrasil/student_1.jpg' }]);
h = U.renderProfile(S);
ok(/<img src="\/user\/images\/Eldrasil\/student_1\.jpg"/.test(h) && /data-act="portraitdel"/.test(h) && /Change picture/.test(h), 'with a picture: shown, with Change and Remove');
ok(S.$ui.portrait === 'user/images/Eldrasil/student_1.jpg' && !JSON.stringify(Object.keys(S)).includes('portrait'), 'only the path is kept, hidden from the narrator ($ui)');
const src = fs.readFileSync(path.join(ROOT, 'src/scripts/ui.template.js'), 'utf8');
ok(/\/api\/images\/upload/.test(src) && /toDataURL\('image\/jpeg', 0\.88\)/.test(src) && /640 \/ Math\.max/.test(src), 'uploads a scaled JPEG to SillyTavern user images');

// ---- 7. re-rendering the same panel keeps the scroll position (the calendar jumped to the top on every click)
ok(/render0\.key === key \? bd0\.scrollTop : 0/.test(src) && /render0\.key = '';/.test(src), 'the same panel keeps its scroll; a new panel starts at the top');

// ---- 1.3.5 (owner): a card imported without its lorebook: the bracelet explains and offers SillyTavern's Import Card Lore
ok(/getCharWorldbookNames\('current'\)/.test(bar) && /lorebook is not attached/.test(bar) && /data-importlore="1"/.test(bar), 'the bracelet says the lorebook is missing and offers to import it');
ok(/getElementById\('char-management-dropdown'\)/.test(bar) && /getElementById\('import_character_info'\)/.test(bar) && /if \(\+\+tries === 4\) diagnose\(\)/.test(bar), "it triggers SillyTavern's own More… → Import Card Lore; the hint shows after 4 s and the bracelet keeps looking");
ok(/function lorebookMissing\(\)/.test(src) && /Import Card Lore, then start a new chat/.test(src), 'the panels warn when a chat opens without the lorebook');
