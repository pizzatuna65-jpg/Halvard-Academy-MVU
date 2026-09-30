// Cohort 3 and the separate Saturday Student Council membership.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const rd = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const cohort = ['Aurelian','William','Bruno','Bianca','Rigel','Topaz','Faye'];
const npcs = rd('data/npcs.json'), incoming = rd('data/cohorts.json').incoming;
const canon = rd('data/npc_canon.json');
console.log('Cohort 3');
ok(JSON.stringify(incoming['3']) === JSON.stringify(cohort) && cohort.every(id => npcs[id]?.arrives === 3), 'all seven arrive in campaign Year 3');
ok(cohort.every(id => canon.voice[id]?.stages['9-10'] && canon.branch[id]), 'voice stages and Rank 8 branches are present');
ok(canon.branch.Faye === 'C' && canon.branch.Topaz === 'A' && rd('data/bond_rules.json').start.Topaz.Rank === 2, 'Faye and Topaz follow their approved bond paths');
const card = rd('dist/Eldrasil_Halvard.json').data;
const entry = id => card.character_book.entries.find(e => e.id === id).content;
const render = (id, S) => ejs.render(entry(id), { getvar: k => _.get({stat_data:S}, k) });
let S = initState();
ok(!render(424,S).includes('[Aurelian Solmere]'), 'incoming lore is gated before Year 3');
let early = applyPatch(S, [{op:'replace',path:'/Bonds/Aurelian',value:{Rank:0}}]);
ok(!early.Bonds.Aurelian, 'incoming bond is refused before arrival');
let third = applyPatch(S, [{op:'replace',path:'/World/Year',value:3},{op:'replace',path:'/Player/Profile/Year',value:3}]);
ok(render(424,third).includes('[Aurelian Solmere]'), 'Year 3 lore is available on arrival');
third = applyPatch(third, [{op:'replace',path:'/Bonds/Aurelian',value:{Rank:0}}]);
ok(!!third.Bonds.Aurelian, 'incoming bond is accepted in Year 3');
ok(/Wearing†: binding a spirit into a living person, another's body or one's own/.test(entry(36)), 'Wearing covers a pact-holder’s own body');

console.log('Student Council');
S = applyPatch(S, [{op:'replace',path:'/Player/Profile/Name',value:'Aria Vale'}, {op:'replace',path:'/Player/Profile/Club',value:'Swimming Club'}, {op:'replace',path:'/Player/Profile/Council',value:true}]);
ok(S.Player.Profile.Club === 'Swimming Club' && S.Player.Profile.Council, 'Council membership keeps the afternoon club');
S = applyPatch(S, [{op:'replace',path:'/World/Year',value:2},{op:'replace',path:'/Player/Profile/Year',value:2}]);
ok(S.Campus_State.Council.Candidates['2'].Second === 'Aria Vale' && !S.Campus_State.Council.Members.includes('Percival'), 'a Year 2 Council member takes Percival’s nominee seat');
ok(/Year 2 nominees: Caralynn/.test(render(336,S)) && /\{\{user\}\}/.test(render(336,S)), 'election lore uses the player nominee in Year 2');
S = applyPatch(S, [{op:'replace',path:'/World/Month',value:2},{op:'replace',path:'/World/Week',value:1}, {op:'replace',path:'/World/Day',value:'Sat'}, {op:'replace',path:'/World/Time',value:'10:00'}, {op:'replace',path:'/World/Location',value:'Student Council Chamber'}]);
ok(/Student Council \(Student Council Chamber\)/.test(S.World._Period), 'Saturday P2 shows the Council meeting');
const beforeStudy = S.$eng.study?.mins || 0;
S = applyPatch(S, [{op:'replace',path:'/World/Time',value:'11:00'}]);
ok((S.$eng.study?.mins || 0) > beforeStudy, 'Council Chamber time counts toward Saturday study minutes');
S = applyPatch(S, [{op:'replace',path:'/Commitments/Remedial History',value:{Desc:'Required',Due:'Y2 M2 W1 Sat 10:00',With:'Cedric',Where:'',Type:'appointment'}}, {op:'replace',path:'/World/Time',value:'11:01'}]);
ok(/Study Hall/.test(S.World._Period), 'a required remedial takes priority over the Council schedule');
S = applyPatch(S, [{op:'replace',path:'/World/Month',value:10},{op:'replace',path:'/World/Week',value:3},{op:'replace',path:'/World/Day',value:'Sat'},{op:'replace',path:'/World/Time',value:'17:00'},
  {op:'replace',path:'/Campus_State/Council/Results/2',value:{President:'Aria Vale'}}]);
ok(S.Campus_State.Council.Results['2'].VicePresident === 'Caralynn', 'a player victory names Caralynn Vice President-elect');
S = applyPatch(S, [{op:'replace',path:'/World/Year',value:3},{op:'replace',path:'/World/Month',value:1},{op:'replace',path:'/World/Week',value:1},{op:'replace',path:'/World/Day',value:'Mon'}]);
ok(S.Campus_State.Council.President === 'Aria Vale' && S.Campus_State.Council.Candidates['3'].First === 'Hadrian'
  && S.Campus_State.Council.Candidates['3'].Second === 'Nerys' && S.Campus_State.Council.Members.includes('Bianca'), 'Year 3 handover and Council roster are seeded');
ok(/Year 3 nominees: Hadrian Quelloris/.test(render(336,S)), 'election lore switches to the Year 3 nominees');
ok(rd('data/shop.json').items.some(x => x.item === 'The Ninth Dawn (latest volume)' && x.price === 8), 'William’s serial is stocked at its approved price');
