// 1.25.0 (planning/DRAFT_proficiency_practice.md Batch 1): red "new" dots. What was seen lives in Tavern Helper's chat variables.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
// Tavern Helper's chat variables (chat_metadata.variables), as the script sees them
let CHAT = { stat_data: 'kept' }, emitted = 0;
global.getVariables = o => (o && o.type === 'chat' ? CHAT : {});
global.updateVariablesWith = (fn, o) => { if (o.type === 'chat') CHAT = fn(JSON.parse(JSON.stringify(CHAT))); };
global.eventEmit = e => { if (e === 'eldrasil:news') emitted++; };
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8')
  + '\nreturn { PANELS, view, renderProfile, newsItems, newsUnseen, newsPanels, newsInit, newsMark, newsGet, newsFeat, setNow: S => { newsNow = { unseen: new Set(newsUnseen(S, newsFeat(S), newsGet()).map(([k]) => k)), shown: [] }; }, shown: () => newsNow.shown };')();
console.log('Red "new" dots (1.25.0)');
const panels = S => [...U.newsPanels(S, U.newsFeat(S), U.newsGet())].sort().join(',');
let S = initState();
ok(U.newsGet() === null, 'a chat with no record yet');
S = applyPatch(S, [{ op: 'replace', path: '/Commitments/Essay', value: { Desc: 'two pages', Due: 'M1 W2 Mon 09:00', With: '', Where: '', Type: 'assignment' } }]);
U.newsInit(S);
ok(U.newsGet() && CHAT.stat_data === 'kept' && Array.isArray(CHAT.eld_seen.seen), 'first run: recorded in the chat variables, MVU keys kept');
ok(!panels(S), 'first run: everything already open counts as seen (no flood of dots)');
const before = CHAT.eld_seen.seen.length;
U.newsInit(S);
ok(CHAT.eld_seen.seen.length === before, 'init runs once per chat');

// something new: a letter and a bond
S = applyPatch(S, [{ op: 'replace', path: '/Letters/From home', value: { From: 'Mother', To: '{{user}}', Status: 'waiting', Text: 'Write soon.' } },
  { op: 'replace', path: '/Scene/Present', value: { Irene: { Note: 'reading' } } }, { op: 'insert', path: '/Interactions/-', value: { With: 'Irene', Kind: 'talk' } }]);
ok(S.$ui.unlocks.includes('letters') && S.Bonds.Irene, 'setup: letters unlocked, Irene met');
ok(panels(S) === 'notebook,people', 'bracelet: Notebook and People get a dot');
const items = U.newsUnseen(S, U.newsFeat(S), U.newsGet()).map(([k]) => k);
ok(items.includes('tab:notebook:letters') && items.includes('npc:Irene'), 'the new items are the Letters tab and Irene');

// the Notebook tab shows its dot until the tab itself is opened
U.setNow(S); U.view.nb = 'planner'; U.view.arg = '';
let h = U.PANELS.notebook.render(S);
ok(/data-nb="letters"[^>]*>Letters(<i class="nbb">\d<\/i>)?<i class="nd"/.test(h), 'Notebook: a dot on the Letters tab');
ok(!/data-nb="planner"[^>]*>Planner<i class="nd"/.test(h), 'no dot on the tab being shown');
// opening the panel takes the button dot away, not the tab dot
U.newsMark(['tab:notebook:letters'], 'noticed');
ok(panels(S) === 'people', 'Notebook noticed: its bracelet dot is gone');
U.setNow(S); h = U.PANELS.notebook.render(S);
ok(/data-nb="letters"[^>]*>Letters(<i class="nbb">\d<\/i>)?<i class="nd"/.test(h), '...but the Letters tab keeps its dot until it is opened');
U.view.nb = 'letters'; U.setNow(S); U.PANELS.notebook.render(S);
ok(U.shown().includes('tab:notebook:letters'), 'opening the Letters tab marks it seen');
U.newsMark(U.shown(), 'seen');
ok(!U.newsUnseen(S, U.newsFeat(S), U.newsGet()).some(([k]) => k === 'tab:notebook:letters') && !CHAT.eld_seen.noticed.includes('tab:notebook:letters'), 'seen, and dropped from the noticed list');

// People: a dot on the card until the dossier is opened
U.setNow(S); h = U.PANELS.people.render(S);
ok(/Irene<i class="nd"|<i class="nd"[^>]*><\/i>/.test(h) && /class="nd"/.test(h), 'People: a dot on the new person');
U.view.arg = 'Irene'; U.setNow(S); U.PANELS.npc.render(S);
ok(U.shown().includes('npc:Irene'), 'opening the dossier marks the person seen');
U.newsMark(U.shown(), 'seen');
ok(!panels(S), 'nothing new left');

// Student file tabs and a swipe back: a key that is no longer in the state shows no dot
S = applyPatch(S, [{ op: 'replace', path: '/Inventory/Sunfizz', value: { Qty: 1, Note: '' } }]);
ok(panels(S) === 'notebook', 'the Bag appears: Inventory gets a dot (1.32.0)');
U.view.nb = 'wallet'; U.setNow(S); h = U.PANELS.notebook.render(S);
ok(/data-nb="bag"[^>]*>Bag<i class="nd"/.test(h), 'Inventory: a dot on the Bag tab');
const swipedBack = JSON.parse(JSON.stringify(S)); swipedBack.$ui.unlocks = swipedBack.$ui.unlocks.filter(k => k !== 'inventory');
ok(!panels(swipedBack), 'swiped back before the Bag: no dot');

// a switched-off feature never shows a dot
const off = JSON.parse(JSON.stringify(S)); off.$ui.on = Object.assign({}, off.$ui.on, { inventory: false });
ok(!U.newsItems(off, U.newsFeat(off)).some(([k]) => k === 'tab:notebook:bag'), 'a feature that is off gives no dot');

// lore heard: the map pin and the card
const L = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/locations.json'), 'utf8')).main_library;
S = applyPatch(S, [{ op: 'replace', path: '/World/Location', value: 'Main Library' }]);
if (!S.$ui.lore.includes(String(L.lore[0].uid))) S.$ui.lore.push(String(L.lore[0].uid));
ok(panels(S).includes('map'), 'a story heard: the Map button gets a dot');
U.view.pin = null; U.setNow(S); h = U.PANELS.map.render(S);
ok(/class="pin[^"]* new"/.test(h), 'Map: a dot on the marker');
ok(/<details open><summary>Lore and rumours[^<]*<i class="nd"/.test(h) && U.shown().includes('lore:' + L.lore[0].uid), 'the card opens its lore with a dot, and it counts as read');

// the bracelet reads the same record and never writes it
const bar = fs.readFileSync(path.join(ROOT, 'src/ui/statusbar.html'), 'utf8');
ok(/function newsPanels/.test(bar) && /newsStore\(\)/.test(bar) && !/updateVariablesWith|insertOrAssignVariables|replaceVariables/.test(bar), 'bracelet: reads the record, never writes it');
ok(/eventOn\('eldrasil:news'/.test(bar) && emitted > 0, 'the panels tell the bracelet when something was seen');
ok(/--notify:#ee5648/.test(bar) && /--notify:#ee5648/.test(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8')), 'the dot colour is a token in both token blocks');
