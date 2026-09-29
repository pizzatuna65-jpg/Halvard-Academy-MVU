// 1.12.0 (planning/DRAFT_missed_reports.md): what the narrator forgets to report. The engine derives what it can (H1 sleep from a
// skipped night, H2 Bag Qty from /Consumables, H3 unlogged Points, H5-H7 sustained magic and summons) and reminds the rest in <now>
// ($ui.missed, section 8l), never changing a number for a reminder.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('Missed reports 1.12.0');
const clone = o => JSON.parse(JSON.stringify(o));
const W = (o, x = [], opts) => [Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x), opts];
const go = (S, o, x, opts) => applyPatch(S, ...W(o, x, opts));
const present = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const miss = (S, rx) => (S.$ui.missed || []).some(l => rx.test(l));
const S0 = go(initState({ etnie: true }), { Location: 'Fire Dormitory', Time: '09:00' });

// ---- H1: a skipped night is sleep
let N = go(S0, { Time: '22:30' }, [{ op: 'replace', path: '/Player/Vitals/Stamina', value: 40 }]);
let M = go(N, { Day: 'Tue', Time: '07:00' });
ok(M.Player.Vitals.Stamina > 90 && !(M.$ui.sleep && M.$ui.sleep.loss) && M._Log.some(l => /slept through the night/.test(l)), `a night skipped indoors counts as sleep (stamina ${Math.round(M.Player.Vitals.Stamina)})`);
M = go(N, { Day: 'Tue', Time: '07:00' }, [{ op: 'replace', path: '/Player/Vitals/Resting', value: 'awake' }]);
ok(M.Player.Vitals.Resting === 'none' && M.$ui.sleep && M.$ui.sleep.late >= 6, `"awake" is an all-nighter (sleep debt ${M.$ui.sleep && M.$ui.sleep.late} h)`);
M = go(go(N, { Location: 'Forest' }), { Day: 'Tue', Time: '07:00' });
ok(!M._Log.some(l => /slept through the night/.test(l)), 'a night outdoors is not assumed to be sleep');
M = go(N, { Time: '23:30' });
ok(!M._Log.some(l => /slept through the night/.test(l)), 'an hour in the evening is not sleep');

// ---- H2: /Consumables lowers the Bag
const bag = go(S0, {}, [{ op: 'replace', path: '/Inventory', value: { 'Ember pouch': { Qty: 2, Kind: 'gear' }, 'Honey cake': { Qty: 1, Kind: 'food' } } }]);
M = go(bag, { Time: '09:10' }, [{ op: 'insert', path: '/Consumables/-', value: 'Ember pouch' }]);
ok(M.Inventory['Ember pouch'].Qty === 1, 'a used item loses one from the Bag');
M = go(bag, { Time: '09:10' }, [{ op: 'insert', path: '/Consumables/-', value: 'Ember pouch' }, { op: 'replace', path: '/Inventory/Ember pouch/Qty', value: 1 }]);
ok(M.Inventory['Ember pouch'].Qty === 1, 'no second loss when the narrator lowered it too');

// ---- H3 / R13: Points and Transactions
let P = go(S0, {}, [{ op: 'replace', path: '/Player/Wallet/Points', value: 500 }]);
P = go(P, { Time: '09:10' }, [{ op: 'delta', path: '/Player/Wallet/Points', value: -15 }]);
ok(P.Player.Wallet.Transactions.slice(-1)[0] === '-15 (not itemised)', 'Points changed with no line: logged as not itemised');
let P2 = go(P, { Time: '09:20' }, [{ op: 'insert', path: '/Player/Wallet/Transactions/-', value: '-15 bakery roll (The Mall)' }]);
ok(P2.Player.Wallet.Points === 485 && !P2.Player.Wallet.Transactions.includes('-15 (not itemised)') && !miss(P2, /Transactions gained/), 'a later line for the same amount replaces it, no second charge');
P2 = go(P, { Time: '09:20' }, [{ op: 'insert', path: '/Player/Wallet/Transactions/-', value: '-40 new cloak' }]);
ok(P2.Player.Wallet.Points === 485 && miss(P2, /Transactions gained "-40 new cloak" but Points did not change/), 'a line with no Points change is only reminded');

// ---- magic: H5 summons, H6 sustained in Casts, H7 renamed effect, R11 left running
const TQ = {
  'Warm Aura': { Type: 'Elemental', Subtype: 'Fire', Cost_mode: 'sustained', Activation: 10, Upkeep_per_min: 0.5 },
  'Ice Wall': { Type: 'Elemental', Subtype: 'Ice', Cost_mode: 'hybrid', Activation: 10, Upkeep_per_min: 0.5, Trigger: 6 },
  'Summon Ember': { Type: 'Occult', Cost_mode: 'sustained', Activation: 5, Upkeep_per_min: 0.2, Notes: '[pact] Ember' },
  'Ember: Flare': { Type: 'Occult', Cost_mode: 'per_use', Activation: 4, Notes: '[pact] Ember' },
  'Shadowstep': { Type: 'Occult', Cost_mode: 'per_use', Activation: 8, Hidden: true, Notes: '[true]' },
};
const mag = applyPatch(go(S0, { Location: 'Main Library' }), [{ op: 'replace', path: '/Magic/_Techniques', value: TQ }, { op: 'replace', path: '/Player/Vitals/Mana_max', value: 100 },
  { op: 'replace', path: '/Player/Vitals/Mana', value: 100 }, { op: 'replace', path: '/$eng/auth', value: 'builder' },
  { op: 'replace', path: '/Magic/Pacts', value: { Ember: { Spirit: 'Ember', Kind: 'Spirit', Tier: 'Basic' } } }]);
const mana = S => Math.round(S.Player.Vitals.Mana * 10) / 10;
let G = go(mag, { Time: '09:05' }, [{ op: 'replace', path: '/Magic/Pacts/Ember/Summoned', value: true }]);
ok(Object.values(G.Magic.Active).some(e => e.Technique === 'Summon Ember') && mana(G) < 100, `Summoned without its effect starts it and pays (mana ${mana(G)})`);
let G2 = go(G, { Time: '10:05' }, [{ op: 'remove', path: '/Magic/Active/Ember' }]);
ok(G2.Magic.Pacts.Ember.Summoned === false, 'the effect removed dismisses the partner');
G2 = go(G, { Time: '10:05' }, [{ op: 'replace', path: '/Magic/Pacts/Ember/Summoned', value: false }]);
ok(!Object.keys(G2.Magic.Active).length && G2.Magic.Pacts.Ember.Summoned === false, 'Summoned turned off ends the effect');
G2 = go(G, { Time: '12:05' });
ok(mana(G2) < mana(G) + 3 * 60 * (100 / 360), 'a summon in step pays its upkeep');
let C = go(mag, { Time: '09:05' }, [{ op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Warm Aura', Times: 1 } }]);
ok(C.Magic.Active['Warm Aura'] && mana(C) < 95 && !C.Magic.Casts.length, `a sustained technique in Casts only becomes an Active effect and pays its activation (mana ${mana(C)})`);
const C2 = go(C, { Time: '13:05' });
ok(mana(C2) < 60 && C2.Magic.Active['Warm Aura'], `and pays upkeep from then on (mana ${mana(C2)} after 4 h)`);
ok(miss(C2, /Warm Aura has been running for 4 h/), 'an effect left running for hours is reminded');
C = go(mag, { Time: '09:05' }, [{ op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Ice Wall', Times: 2 } }]);
ok(C.Magic.Active['Ice Wall'] && Math.abs(mana(C) - (100 - 10 - 6)) < 2, `a hybrid in Casts: start, then the second use is a trigger (mana ${mana(C)})`);
C = go(mag, { Time: '09:00' }, [{ op: 'insert', path: '/Magic/Active/Aura', value: { Technique: 'Warm Aura' } }]);
const Cr = go(C, { Time: '09:30' }, [{ op: 'remove', path: '/Magic/Active/Aura' }, { op: 'insert', path: '/Magic/Active/Fire aura', value: { Technique: 'Warm Aura' } }]);
const Cs = go(C, { Time: '09:30' });
ok(mana(Cr) === mana(Cs) && Cr.Magic.Active['Fire aura'], `a renamed effect keeps running without a second activation (${mana(Cr)} = ${mana(Cs)})`);

// ---- reminders from the state
const E = go(S0, { Location: 'Canteen' }, [present(['Etnie'])]);
let R = go(E, { Time: '09:10' }, [{ op: 'replace', path: '/Player/Vitals/HP', value: 80 }]);
ok(miss(R, /HP fell by 20 with no injury named/), 'R1: HP lost with no injury');
R = go(E, { Time: '09:10' }, [{ op: 'replace', path: '/Player/Vitals/HP', value: 80 }, { op: 'insert', path: '/Player/Injuries/Bruised ribs', value: { Severity: 'minor' } }]);
ok(!miss(R, /HP fell/), 'no reminder when the injury is named');
const EB = go(E, {}, [{ op: 'replace', path: '/Inventory', value: { 'Honey cake': { Qty: 1, Kind: 'food' } } }]);
R = go(EB, { Time: '09:10' }, [{ op: 'remove', path: '/Inventory/Honey cake' }]);
ok(miss(R, /Honey cake left the Bag while Etnie was here: if \{\{user\}\} gave it, report Kind gift/), 'R2: an item left the Bag with someone present');
R = go(EB, { Time: '09:10' }, [{ op: 'remove', path: '/Inventory/Honey cake' }, { op: 'insert', path: '/Interactions/-', value: { With: 'Etnie', Kind: 'gift', Item: 'Honey cake' } }]);
ok(!miss(R, /left the Bag/), 'no reminder when the gift was reported');
const hid = go(go(mag, { Location: 'Canteen' }, [present(['Etnie'])]), {}, [{ op: 'replace', path: '/Hidden', value: { _True_magic: 'Shadowstep', Known_by: [], Dove_attention: 0 } }, { op: 'replace', path: '/$eng/auth', value: 'builder' }]);
R = go(hid, { Time: '09:20' }, [{ op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Shadowstep', Times: 1 } }]);
ok(miss(R, /Shadowstep \(hidden magic\) was used with Etnie present, but Dove_attention did not rise/), 'R12: hidden magic in front of someone who does not know');
R = go(hid, { Time: '09:20' }, [{ op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Shadowstep', Times: 1 } }, { op: 'delta', path: '/Hidden/Dove_attention', value: 5 }]);
ok(!miss(R, /hidden magic/), 'no reminder when Dove_attention rose');

// ---- reminders from the prose and the player's words
const T0 = { text: 'Etnie leans in, "You are late again."' };
R = go(E, { Time: '09:10' }, [], T0);
ok(miss(R, /Etnie spoke, but no interaction was reported/), 'R6: a bonded character spoke with nothing reported');
R = go(E, { Time: '09:10' }, [{ op: 'insert', path: '/Interactions/-', value: { With: 'Etnie', Kind: 'talk' } }], T0);
ok(!miss(R, /spoke, but/), 'no reminder when the talk was reported');
const R2 = go(R, { Time: '09:20' }, [], T0);
ok(!miss(R2, /spoke, but/), 'no reminder once a talk is counted today');
R = go(E, { Time: '09:10' }, [], T0);
const R3 = go(R, { Time: '09:20' }, [], T0);
ok(!miss(R3, /spoke, but/), 'the same hint is not repeated the same day');
R = go(E, { Time: '09:10' }, [], { text: 'An hour later, the canteen is nearly empty.' });
ok(miss(R, /The narration moves time on \("An hour later"\) but the clock moved only 10 min/), 'R3: the prose skips time, the clock does not');
R = go(E, { Time: '09:10' }, [], { text: 'Etnie says "An hour later we meet."' });
ok(!miss(R, /moves time on/), 'a time phrase inside dialogue does not count');
R = go(E, { Time: '09:20' }, [], { text: 'You step into the Main Library and breathe in the dust.' });
ok(miss(R, /arriving at Main Library, but Location is Canteen/), 'R4: arrival at a map place not in Location');
R = go(go(mag, { Location: 'Canteen' }), { Time: '09:20' }, [], { text: 'The air shimmers.', user: 'I cast Warm Aura to keep us warm.' });
ok(miss(R, /Warm Aura appears in the last exchange but was not charged/), 'R5: a technique named by the player but not charged');
const sore = clone(E); sore.Bonds.Etnie.Tension = 30;
R = go(sore, { Time: '09:20' }, [], { text: 'She looks away.', user: "I'm sorry about yesterday, Etnie." });
ok(miss(R, /may have apologised to Etnie/), 'R9: the player apologised, nothing reported');
R = go(E, { Time: '09:20' }, [], { text: 'You hand Etnie a small gift wrapped in blue paper. She blinks.' });
ok(miss(R, /A gift to Etnie may have happened/), 'R7: the narration tells of a gift');
const gym = go(S0, { Location: 'Gymnasium', Day: 'Sat', Time: '17:00' });
R = go(gym, { Time: '18:10' }, [], { text: 'You run drills until your legs burn.' });
ok(miss(R, /may have trained at Gymnasium/), 'R10: an hour of drills with no /Training');

// ---- limits: at most three, a player-tool edit keeps them, the toggle turns them off
R = go(EB, { Time: '09:20' }, [{ op: 'replace', path: '/Player/Vitals/HP', value: 80 }, { op: 'remove', path: '/Inventory/Honey cake' }],
  { text: 'An hour later, Etnie leans in, "You step into the Main Library."', user: 'sorry' });
ok(R.$ui.missed.length === 3 && /HP fell/.test(R.$ui.missed[0]), `at most three reminders, the most important first (${R.$ui.missed.length})`);
const tool = applyPatch(R, [{ op: 'replace', path: '/$eng/tool', value: 1 }]);
ok(tool.$ui.missed.length === 3, 'a player-tool edit keeps the reminders');
const off = clone(E); off.$ui.off = ['reminders'];
R = go(off, { Time: '09:10' }, [{ op: 'replace', path: '/Player/Vitals/HP', value: 80 }]);
ok(!R.$ui.missed.length, 'Features: reminders off, none shown');

// ---- a late report: the Rank 5 gift handed over as the NPC left
const G5 = clone(E); Object.assign(G5.Bonds.Etnie, { Rank: 5, $gift_pending: true });
const gift = ((JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bond_rewards.json'), 'utf8')).npcs.Etnie || {}).gift || {}).name;
const L = go(G5, { Time: '09:20' }, [present([]), { op: 'insert', path: '/Interactions/-', value: { With: 'Etnie', Kind: 'rank_gift' } }]);
ok(gift && L._Perks[gift], `a handover reported as she leaves still counts (${gift})`);

// ---- the <now> block and rule 502 text
const t505 = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/505.txt'), 'utf8');
ok(/Possibly missed in the last update/.test(t505) && /on\('reminders'\)/.test(t505), '<now> lists the reminders behind the Features toggle');
const r502 = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/502.txt'), 'utf8');
ok(/set "awake" only when/.test(r502) && /lowers its Qty by one/.test(r502) && /before any time skip/.test(r502) && /possibly missed/.test(r502), 'rule 502 says what the engine now derives');
