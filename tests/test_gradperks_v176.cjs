// 1.7.6 (owner, 2026-09-27: "harusnya perk sudah tidak efektif dan hadiah rank 5 hanya sebatas memento"; a. rep tetap up, b. usul
// kedua, c. setuju): once a character has graduated, their Rank 5 gift is a keepsake with no effect (Royhan's pouch and Idris's vials
// keep what is left in them, without refills), their Rank 10 benefit ends, a training bonus, a one-use perk and a monthly payment from
// them stop, a later bond event of theirs gives no reward, and Student reputation raised by Ruby's Rank 10 stays. If the story keeps
// them (the name leaves Campus_State.Graduated) the reward works again. Chats already past Graduation convert. A 1.7.5 save loads.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
console.log('Graduates\' rewards 1.7.6');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ver = JSON.parse(rd('src/card/card.json')).character_version;
const REW = JSON.parse(rd('data/bond_rewards.json')).npcs;
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const W = (S, w, ops = []) => applyPatch(S, [...Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })), ...ops]);
const here = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { pPerks };')();
const perk = (id, which) => { const x = REW[id][which]; return [x.name, { From: id, Kind: which === 'gift' ? 'gift' : 'rank10', Effect: x.text, Uses: x.uses || 0 }]; };

let S = W(initState(), { Time: '09:00' }, [here(['Gareth', 'Irene', 'Royhan', 'Ruby', 'Caspian', 'Saffi'])]);
for (const id of ['Gareth', 'Irene', 'Royhan', 'Saffi']) S.Bonds[id].Rank = 5;
S.Bonds.Caspian.Rank = 10; S.Bonds.Ruby.Rank = 10; S.Bonds.Caspian.Trust = 80; S.Bonds.Ruby.Trust = 80;
Object.assign(S._Perks, Object.fromEntries([perk('Gareth', 'gift'), perk('Irene', 'gift'), perk('Royhan', 'gift'), perk('Saffi', 'gift'), perk('Caspian', 'r10'), perk('Ruby', 'r10')]));
S = W(S, { Time: '10:00' }, [here([])]);
const rep0 = S.Player.Profile.Reputation._Student;
ok(Object.keys(S._Perks).length === 6 && Object.values(S._Perks).every(p => p.Kind !== 'memento'), 'Year 1: six rewards held and working');
S = W(S, { Month: 12, Week: 1, Day: 'Mon', Time: '09:00' });
const P = S._Perks;
ok(P[REW.Gareth.gift.name].Kind === 'memento' && /keepsake from Gareth, who has graduated; it no longer does what it did/.test(P[REW.Gareth.gift.name].Effect), "Gareth's gift is a keepsake with no effect");
ok(P[REW.Royhan.gift.name].Kind === 'memento' && /whatever is still in the pouch[^.]*can be used, but nobody refills it/.test(P[REW.Royhan.gift.name].Effect), "Royhan's pouch keeps what is left, without refills (owner b)");
ok(!P[REW.Caspian.r10.name] && !P[REW.Ruby.r10.name] && S.$ui.perks_grad[REW.Caspian.r10.name].Kind === 'rank10', "Caspian's and Ruby's Rank 10 benefits have ended (kept aside in $ui.perks_grad)");
ok(P[REW.Saffi.gift.name].Kind === 'gift', "Saffi (a second-year) keeps her gift working");
ok(S.Player.Profile.Reputation._Student === rep0, 'Student reputation from Ruby\'s Rank 10 stays (owner a)');
ok(S._Log.some(l => /Gareth has graduated: "Gareth's training journal" is now a keepsake with no effect/.test(l)) && S._Log.some(l => /Caspian has graduated: their Rank 10 benefit "[^"]+" has ended/.test(l)), 'the log says what changed');
const Y2 = W(S, { Year: 2, Month: 2, Week: 1, Day: 'Mon', Time: '09:00' }, [here(['Gareth']), { op: 'insert', path: '/Training/-', value: { Track: 'mana' } }]);
ok(Y2._Log.some(l => /Training: Mana pool \+1;/.test(l)) && !Y2._Log.some(l => /x1\.5/.test(l)), 'training with a visiting Gareth: no bonus');
const sf = W(Y2, { Time: '10:00' }, [here(['Saffi']), { op: 'insert', path: '/Training/-', value: { Track: 'stamina' } }]);
ok(sf._Log.some(l => /with Saffi, x1\.5/.test(l)), 'a gift from someone still here works as before');
const pu = W(Y2, { Time: '11:00' }, [here([]), { op: 'insert', path: '/Perk_use/-', value: REW.Irene.gift.name }]);
ok(pu._Perks[REW.Irene.gift.name] && pu._Log.some(l => /came from Irene, who has graduated: it no longer works; nothing was spent/.test(l)) && !(pu.$ui.perks_used || []).length, "Irene's one-use pardon is refused and kept as a keepsake");
// a later bond event of a graduate gives nothing
let V = W(Y2, { Time: '12:00' }, [here(['Sophia'])]);
Object.assign(V.Bonds.Sophia, { Rank: 4, $xp: 999, _Event_ready: true, $cool: -1 }); V = W(V, { Time: '12:30' }, [{ op: 'replace', path: '/Bonds/Sophia/Rank', value: 5 }]);
ok(V.Bonds.Sophia.Rank === 5 && !V._Perks[REW.Sophia.gift.name] && V._Log.some(l => /Sophia has graduated: Rank 5 brings no gift now/.test(l)), "a graduate's 4->5 event raises the rank but gives no gift");
// monthly payment from a graduate stops (Aiden, a Year 1 first-year, graduates at the end of Year 3)
let A = W(initState(), { Time: '09:00' }, [here(['Aiden'])]); A.Bonds.Aiden.Rank = 10; A._Perks[REW.Aiden.r10.name] = perk('Aiden', 'r10')[1];
const monthly = s => (s.Player.Wallet.Transactions || []).filter(t => /betting book/.test(t)).length;
const A1 = W(A, { Month: 2, Week: 1, Day: 'Mon', Time: '09:00' }, [here([])]);
const A2 = W(applyPatch(A1, [{ op: 'replace', path: '/Campus_State/Graduated', value: ['Aiden'] }]), { Month: 3, Week: 1, Day: 'Mon', Time: '09:00' });
ok(REW.Aiden.r10.monthly && monthly(A1) === 1 && monthly(A2) === 1 && !A2._Perks[REW.Aiden.r10.name], "Aiden's monthly share stops once he has graduated");
// the story keeps a graduate: the reward works again
const back = W(applyPatch(S, [{ op: 'replace', path: '/Campus_State/Graduated', value: S.Campus_State.Graduated.filter(x => x !== 'Caspian' && x !== 'Gareth') }]), { Time: '12:00' });
ok(back._Perks[REW.Caspian.r10.name] && back._Perks[REW.Caspian.r10.name].Kind === 'rank10' && back._Perks[REW.Gareth.gift.name].Kind === 'gift' && !back.$ui.perks_grad[REW.Caspian.r10.name], 'if the story keeps Caspian and Gareth, their rewards work again');
// the narrator's rule and the UI
ok(/A memento \(Kind memento\) is a keepsake from someone who has graduated/.test(card.character_book.entries.find(e => e.id === 502).content), 'rule 502 explains a memento');
const html = U.pPerks(S);
ok(/<h3>Keepsakes from graduates<\/h3>/.test(html) && /<h3>Ended<\/h3>/.test(html) && /keepsake · /.test(html), 'Student file: keepsakes and ended benefits listed apart');
// a chat already past Graduation (made on 1.7.5) converts on its next update
const old = JSON.parse(rd('tests/fixtures/saves/save_1.7.5_yearend.json'));
old._Perks[REW.Irene.gift.name] = perk('Irene', 'gift')[1];
const L = W(old, { Time: '21:00' });
ok(L.$eng.ver === ver && L._Perks[REW.Irene.gift.name].Kind === 'memento' && Object.keys(old.Bonds).every(id => L.Bonds[id].Rank === old.Bonds[id].Rank), 'a 1.7.5 chat past Graduation converts its graduates\' rewards and keeps every bond');
// the Year 2 TEST card: Gareth's gift turns into a keepsake on the first update
const T = JSON.parse(rd('dist/test/Eldrasil_TEST_Year2.json')).data;
ok(/Gareth/.test(T.character_book.entries.find(e => e.id === 500).content), 'the Year 2 TEST card carries a graduate\'s gift to convert');
