// Audit Batch 3: integrations calculate only deterministic facts; story-dependent outcomes stay conditional.
const { initState, applyPatch, ok } = require('./harness.cjs');
const put = (path, value) => ({ op: 'replace', path, value });
const add = (path, value) => ({ op: 'insert', path, value });

let S = initState();
ok(S.$ui.on.weather && S.$ui.on.planner && S.$ui.on.wxfull, 'engine publishes enabled feature gates');
S = applyPatch(S, [put('/$ui/ambience', 'off'), add('/$ui/off/-', 'planner')]);
ok(S.$ui.on.ambience === false && S.$ui.on.planner === false && S.$ui.on.weather, 'level and toggle gates agree');

S = initState();
const xp0 = S.Player.Profile.Reputation.$xp.Academy;
S = applyPatch(S, [add('/Rep_events/-', { Kind: 'staff_job', Rep: 'Doves', XP: 100, Why: 'helped staff' })]);
ok(S.Player.Profile.Reputation.$xp.Academy === xp0 + 1, 'named deed supplies its own reputation and XP');
ok(S.Player.Profile.Reputation.$xp.Doves === 0, 'narrator-supplied Rep and XP cannot override a named deed');
const x1 = S.Player.Profile.Reputation.$xp.Student;
S = applyPatch(S, [add('/Rep_events/-', { Kind: 'event', Rep: 'Student', XP: 3, Why: 'legacy custom event' })]);
ok(S.Player.Profile.Reputation.$xp.Student === x1 + 3, 'legacy explicit reputation event still works');

S = initState();
S.Hidden.Dove_attention = 5;
S.$eng.doveweek = { w: 0, raised: false };
S = applyPatch(S, [put('/World/Week', 2), put('/World/Time', '08:01')]);
ok(S.Hidden.Dove_attention === 4, 'one quiet week lowers Dove attention once');
S = applyPatch(S, [put('/Hidden/Dove_attention', 1)]);
ok(S.Hidden.Dove_attention === 4, 'narrator cannot manually lower Dove attention');
S = applyPatch(S, [put('/Hidden/Dove_attention', 9)]);
S = applyPatch(S, [put('/World/Week', 3)]);
ok(S.Hidden.Dove_attention === 9, 'a week with a reported rise does not decay at rollover');

S = initState();
S.Player.Wallet.Points = 100;
S = applyPatch(S, [put('/World/Location', 'Commissary'), add('/Inventory/Notebook', { Qty: 1, Note: '' })]);
ok(S.$ui.missed.some(x => /Notebook entered the Bag/.test(x)), 'unpaid shop stock gets a conditional price reminder');
ok(S.Inventory.Notebook.Qty === 1 && S.Player.Wallet.Points === 100, 'price reminder never changes item or money');
S = initState();
S.Player.Wallet.Points = 100;
S = applyPatch(S, [put('/World/Location', 'Commissary'), add('/Inventory/Notebook', { Qty: 1, Note: '' }),
  put('/Player/Wallet/Points', 95), add('/Player/Wallet/Transactions/-', '-5 Notebook')]);
ok(!S.$ui.missed.some(x => /Notebook entered the Bag/.test(x)), 'paid purchase with a matching transaction needs no reminder');

S = initState();
S = applyPatch(S, [add('/Player/Injuries/Bruise', { Severity: 'minor', Body_part: 'arm', Effect: 'sore', Heals_by: 'in one day' })]);
const healAt = S.$eng.heals.Bruise.abs;
S = applyPatch(S, [put('/World/Day', 'Wed'), put('/World/Time', '08:01')]);
ok(S.$eng.heals.Bruise.abs === healAt && S.$ui.missed.some(x => /Bruise's Heals_by/.test(x)), 'relative healing target stays anchored and reminds when due');
ok(!!S.Player.Injuries.Bruise, 'due injury does not heal automatically');

S = initState();
S.Player.Profile.Dorm = 'Fire';
S = applyPatch(S, [put('/World/Time', '20:30'), put('/World/Location', 'Canteen')]);
ok(S.$ui.missed.some(x => /after dorm curfew/.test(x)), 'out of dorm after curfew gets a conditional reminder');

S = initState({ etnie: true });
S.Hidden._True_magic = 'secret flame';
S = applyPatch(S, [add('/Hidden/Known_by/-', 'Etnie')]);
ok(S.Bonds.Etnie.Knows.some(x => /learned .*true magic/i.test(x) && /^\[M/.test(x)), 'new keeper receives a dated Knows line');

S = initState();
S = applyPatch(S, [put('/World/Location', 'Canteen'), add('/Commitments/Tea with Etnie', { Desc: 'tea', Due: 'M1 W1 Mon 08:20', With: 'Etnie', Where: 'Canteen', Type: 'appointment' })]);
ok(S.$ui.maybe.some(([id, what]) => id === 'Etnie' && /appointment/.test(what)), 'imminent local commitment lists its partner as possibly here');
ok(!S.Scene.Present.Etnie, 'appointment does not force a person into the scene');
