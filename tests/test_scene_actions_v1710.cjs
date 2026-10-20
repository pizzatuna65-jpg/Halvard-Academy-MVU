// 1.71.0 (owner, mockup v2): the scene cards' actions, each the doorway to a system the engine already runs for that person
// (practice partners, Rank 4 tracks, invitations, gifts, favours, the Rank 5-7 perks, apologies); they only draft chat text.
// The other dorms leave the campus map once {{user}} has a dorm; a brass rule sits between the bracelet and the story.
const fs = require('fs'), path = require('path');
const { initState, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { sceneActions, sceneHTML, pinShown, DATA };')();
console.log('Scene actions and dorm pins 1.71.0');

const base = () => { const S = initState(); S.Player.Profile.Dorm = 'Fire'; S.$ui = Object.assign({}, S.$ui, { names: ['Sophia', 'Aiden', 'Irene'] }); return S; };
const fills = h => [...h.matchAll(/data-eld-fill="([^"]*)"/g)].map(m => m[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"'));
const labels = h => [...h.matchAll(/class="act[^"]*"[^>]*>([^<]*)/g)].map(m => m[1].trim().replace(/&#39;/g, "'"));

// ---- Practice with a partner, here and still open today; sparring only within the dorm (the engine's rule)
let S = base();
S.World.Location = U.DATA.locs.combat_grounds.name;
S.$ui.practice = [{ action: 'Spar with a partner', stat: 'Prowess', locked: '' }];
S.Bonds = { Sophia: { Rank: 0, $xp: 0, Trust: 40, Tension: 0 }, Aiden: { Rank: 0, $xp: 0, Trust: 60, Tension: 0 } };
let h = U.sceneActions('Sophia', S);
ok(labels(h).includes('Spar with Sophia') && fills(h).includes('I ask Sophia to join me at Combat Grounds and spar with Sophia: ') && /Prowess \+2/.test(h), 'Sophia (Fire, like {{user}}): Spar with Sophia, Prowess +2, a draft for the chat');
ok(!/Spar with/.test(U.sceneActions('Aiden', S)), 'Aiden (Light): no sparring outside Training Week');
S.$ui.practice[0].locked = 'already practised today';
ok(!/Spar with/.test(U.sceneActions('Sophia', S)), 'already practised today: the button is gone');
ok(!/Invite|training|Study together|goal|friends|Visit|amends/i.test(h), 'Rank 0, Calm: nothing a rank or Tension has not opened');

// ---- Rank 4 tracks are the person's own; Rank 2 invitations; Rank 5-7 perks
S = base(); S.Bonds = { Aiden: { Rank: 7, $xp: 0, Trust: 70, Tension: 0 }, Sophia: { Rank: 4, $xp: 0, Trust: 60, Tension: 0 } };
h = U.sceneActions('Aiden', S);
ok(labels(h).includes('Mana training') && labels(h).includes('Study together') && !labels(h).includes('Stamina training'), 'Aiden at Rank 4+: mana and study (rank4_partners), no stamina');
ok(labels(h).includes('Invite Aiden') && labels(h).includes('Help with his goal') && labels(h).includes('Meet his friends') && labels(h).includes('Visit the Light Dormitory'), 'Rank 2, 5, 6, 7: invite, his goal, his friends, his dorm');
h = U.sceneActions('Sophia', S);
ok(labels(h).includes('Stamina training') && !labels(h).includes('Study together') && !/Visit the/.test(h) && !/goal/.test(h), 'Sophia at Rank 4: mana and stamina; no Rank 5+ perks yet');

// ---- gifts from the Bag, with what {{user}} already knows; favours; amends
S = base();
S.Inventory = { 'Marked deck': { Kind: 'other', Qty: 1 }, 'Honey bun': { Kind: 'food', Qty: 2 } };
S.Bonds = { Aiden: { Rank: 1, $xp: 0, Trust: 60, Tension: 0, $gifts: { 'Marked deck': 'loved' } }, Irene: { Rank: 2, $xp: 0, Trust: 55, Tension: 24 } };
S.Commitments = { 'Bring the club rosters': { Type: 'favour', With: 'Irene', Due: 'M1 W2 Thu', Desc: '' } };
h = U.sceneActions('Aiden', S);
ok(/data-eld-gift/.test(h) && /Marked deck<span class="t loved">loved/.test(h) && /Honey bun ×2<span class="t ">not tried/.test(h) && fills(h).includes('I give Aiden the Marked deck: '), 'the gift list: Bag items, a known reaction shown, the rest "not tried"');
h = U.sceneActions('Irene', S);
ok(labels(h).includes("Do Irene's favour") && /due M1 W2 Thu/.test(h) && labels(h).includes('Make amends') && /Tension: Friction/.test(h), "Irene: her open favour; Make amends at Friction");
ok(!/Make amends/.test(U.sceneActions('Aiden', S)), 'Calm: no amends');

// ---- not yet named: the drafts use the descriptor; Extras get no actions
S = base(); S.$ui.names = []; S.Bonds = { Irene: { Rank: 0, $xp: 0, Trust: 50, Tension: 30 } };
ok(fills(U.sceneActions('Irene', S)).some(f => /^I apologise to the Student Council President/.test(f)), 'an unnamed person is "the Student Council President" in the draft');
ok(U.sceneActions('Grinning upperclassman', S) === '', 'an invented character: no bond, no actions');
S.Scene = { Present: { Irene: { Note: '' } } };
ok(/<div class="acts">/.test(U.sceneHTML(S, '').html), 'the actions sit in the card');

// ---- the campus map: the other dorms only on their Dorm Day or while {{user}} is inside
const pin = id => U.DATA.pins.find(p => p.cluster[0] === id);
S = base(); S.World.Location = U.DATA.locs.main_courtyard ? U.DATA.locs.main_courtyard.name : 'Main Courtyard';
ok(U.pinShown(pin('fire_dormitory'), S) && !U.pinShown(pin('sky_dormitory'), S) && !U.pinShown(pin('light_dormitory'), S), 'Fire student: the Fire Dormitory shows, Sky and Light do not');
S.World.Month = 1; S.World.Week = 4; S.World.Day = 'Sun';
ok(U.pinShown(pin('viridian_dormitory'), S) && !U.pinShown(pin('sky_dormitory'), S), 'Spiritual Dorm Day (M1 W4 Sun): the Viridian Dormitory opens, Sky stays hidden');
S.World.Day = 'Mon'; S.World.Location = 'Sky Dormitory — common room';
ok(U.pinShown(pin('sky_dormitory'), S), 'inside the Sky Dormitory (a visit): it shows');
S.Player.Profile.Dorm = 'Unsorted';
ok(['fire', 'sky', 'light', 'viridian'].every(d => U.pinShown(pin(d + '_dormitory'), S)), 'not sorted yet: every dorm shows');
ok(U.DATA.pins.filter(p => !/_dormitory$/.test(p.cluster[0])).every(p => U.pinShown(p, base())), 'no other pin is touched');

// ---- the bracelet's brass rule
const bar = fs.readFileSync(path.join(ROOT, 'src/ui/statusbar.html'), 'utf8');
ok(/<div class="band" id="band">[\s\S]*?<\/div>\n<div class="sep"/.test(bar) && /\.band\.stale\+\.sep\{display:none\}/.test(bar), 'a brass rule under the bracelet, gone with a stale bracelet');
