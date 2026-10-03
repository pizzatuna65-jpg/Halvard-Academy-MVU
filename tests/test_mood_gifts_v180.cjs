// Approved mood, fatigue, wind, gifts and birthdays: behavior and legacy save coverage.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, runEngine, initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn {moodOf, giftTier, windMultiplier, wxDay, fromAbs, toAbs, birthdayParty, NPC_MOODS, GIFT_PREFS, tuneOf, updateSleep};')();
const clone = x => _.cloneDeep(x), op = (path,value) => ({op:'replace',path,value});
const act = (With,Kind,Item='',Gift='neutral') => op('/Interactions',[{With,Kind,Item,Gift}]);
function base(ids=['Trixie'], mode='full', W={}) {
  const S=initState(); S.World={...S.World,Month:4,Week:2,Day:'Wed',Time:'14:00',Location:'Canteen',...W};
  S.$eng.abs=E.toAbs(S.World); S.$eng.seed=12345; S.$ui.wxfx=mode; S.Player.Vitals.Stamina=100;
  for (const id of ids) { S.Bonds[id]={Rank:4,Trust:50,Tension:0,$xp:0,Known_facts:[],Milestones:[]}; S.Scene.Present[id]={Note:''}; }
  const A=Schema.parse(S); runEngine(A); return Schema.parse(A);
}
const step = (S,mins,extra=[]) => { const W=E.fromAbs(S.$eng.abs+mins); return applyPatch(S,[...Object.entries(W).map(([k,v])=>op('/World/'+k,v)),...extra]); };
const card=JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render=(uid,S)=>renderEntry(card,uid,S);   // 1.48.0: the Cast Sheet is a group
global.window={parent:{document:{}}};
const U=new Function(read('src/scripts/ui.js')+'\nreturn {PANELS,view,datedItems,fieldUnlocked,npcOf,customRecord,shopsHere};')();

console.log('Mood scores and gates');
let S=base(); const wx={sky:'Cloudy',temp:18,wind:'',rare:'',snow:false}, day=Math.floor(S.$eng.abs/1440);
const mood=(id,w=wx,state=S)=>E.moodOf(id,state,w,Math.floor(E.toAbs(state.World)/1440));
ok(Object.keys(E.NPC_MOODS).length===59 && Object.keys(E.GIFT_PREFS.npcs).length===59,'59 canon mood and gift profiles, including cohort 3');
ok(mood('Sophia',{...wx,sky:'Rain'}).score-mood('Sophia').score===1,'weather love adds one');
ok(mood('Sophia',{...wx,temp:30,rare:'heatwave'}).score-mood('Sophia').score===-2,'each matching hate counts (Hot + Heatwave)');
ok(mood('Caralynn',{...wx,sky:'Rain',wind:'gale'}).score-mood('Caralynn').score===-2,'wind and rain stack');
const morning=clone(S); morning.World.Time='08:00'; const night=clone(S); night.World.Time='23:00';
ok(mood('Irene',wx,morning).score-mood('Irene',wx,night).score===2,'morning person and late-night penalty');
ok(mood('Lenna',wx,night).score-mood('Lenna',wx,morning).score===2,'night owl clock');
const exam=clone(S); Object.assign(exam.World,{Month:3,Week:1,Day:'Mon'});
const examNeutral=clone(exam); examNeutral.World.Day='Fri';
// Remove seeded day variance by comparing the same day with the trait neutralised temporarily.
const p=E.NPC_MOODS.Irene, oldExam=p.exams; p.exams=0; const n=mood('Irene',wx,exam).score; p.exams=oldExam;
ok(mood('Irene',wx,exam).score===n+1,'student exam bonus on the exam date');
const trial=clone(S); Object.assign(trial.World,{Month:7,Week:3,Day:'Sun'});
const pt=E.NPC_MOODS.Vallie, ot=pt.trials; pt.trials=0; const nt=mood('Vallie',wx,trial).score; pt.trials=ot;
ok(mood('Vallie',wx,trial).score===nt+1,'Thinning affects staff too');
const election=clone(S); Object.assign(election.World,{Month:10,Week:3,Day:'Tue'});
const withCandidate=mood('Dante',wx,election).score; election.Campus_State.Council.Candidates['1']={First:'Florian',Second:'Irene'};
ok(withCandidate-mood('Dante',wx,election).score===1,'election Trials only applies to candidates');
const ill=clone(S); ill.Campus_State.NPC_status.Sophia='injured and grieving';
ok(mood('Sophia',wx,ill).score===mood('Sophia').score-1,'status penalty once even with two conditions');
ok(mood('Ezrel',{...wx,sky:'Storm'},ill).mood==='Normal','Ezrel always Normal');
ok(JSON.stringify(mood('Trixie'))===JSON.stringify(mood('Trixie')),'mood deterministic without consuming randomness');
const rolls={Good:0,Normal:0,Bad:0}; for(let seed=1;seed<=2000;seed++){ const x=clone(S);x.$eng.seed=seed;rolls[mood('Tristan',wx,x).mood]++; }
ok(rolls.Good>140 && rolls.Good<270 && rolls.Bad>140 && rolls.Bad<270,'seeded daily distribution approximately 10/80/10');
function stateMood(id,want){for(let seed=1;seed<300;seed++){const x=base([id]);x.$eng.seed=seed;const A=applyPatch(x,[]);if(A.$ui.moods[id].mood===want)return A;}throw Error('mood unavailable '+id+want);}
for(const [id,want] of [['Irene','Good'],['Irene','Bad']]){
  const x=stateMood(id,want), flavor=clone(x);flavor.$ui.wxfx='flavor';
  const a=applyPatch(x,[act(id,'talk')]), b=applyPatch(flavor,[act(id,'talk')]);
  // Existing daily weather XP may add one only in Full; subtract it from the comparison.
  const weather=a.$eng.daily[id].wx?1:0;
  ok(a.Bonds[id].$xp-b.Bonds[id].$xp-weather===(want==='Good'?1:-1),want+' mood changes talk XP');
  const ta=applyPatch(x,[op('/Bonds/'+id+'/Tension',10)]),tb=applyPatch(flavor,[op('/Bonds/'+id+'/Tension',10)]);
  ok(ta.Bonds[id].Tension===(want==='Bad'?Math.ceil(tb.Bonds[id].Tension*1.5):tb.Bonds[id].Tension),want+' mood tension multiplier');
}
{
 const x=stateMood('Irene','Good');x.Bonds.Irene.Tension=30;const f=clone(x);f.$ui.wxfx='flavor';
 ok(applyPatch(x,[act('Irene','apology')]).Bonds.Irene.Tension===15 && applyPatch(f,[act('Irene','apology')]).Bonds.Irene.Tension===20,'Good mood accepted apology ×1.5');
 const off=applyPatch(x,[op('/$ui/wxfx','off')]);ok(!Object.keys(off.$ui.moods).length,'Off clears moods');
}

console.log('Gift resolution, birthdays and discovery');
ok(E.giftTier('Sophia','NINE RIVERS: FIELD TACTICS','hated')==='loved','catalog item overrides narrator');
ok(E.giftTier('Sophia','Honey bun','loved')==='disliked','NPC category overrides universal sweets');
ok(E.giftTier('Wren','Music box','loved')==='disliked','NPC disliked catalog item');
ok(E.giftTier('Percival','odd rock','disliked')==='loved','NPC exception to universal junk');
ok(E.giftTier('Ruby','unregistered pact token','loved')==='hated','forbidden magic universally hated');
ok(E.giftTier('Tristan','unknown one-off present','liked')==='liked','unknown item falls back to narrator');
ok(E.giftTier('Etnie','rock','hated')==='liked' && E.giftTier('Etnie','thank-you card','loved')==='hated','Etnie minimum liked except her own hated gifts');
ok(E.giftTier('Ezrel','Honey bun','liked')==='neutral','Ezrel never likes ordinary gifts');
ok(E.giftTier('Krieg','Fine vintage','disliked')==='liked','drinker exception to universal alcohol');
ok(E.giftTier('Aiden','Itching charm','neutral')==='loved' && E.giftTier('Irene','Voice-changing sweets (bag)','liked')==='hated','Merryhew catalog provenance beats universal sweets');
ok(E.giftTier('Tristan','Star Cookie','neutral')==='liked' && E.giftTier('Gareth','The Rose in the Tower','neutral')==='liked','catalog bakery and book categories resolve without narrator fallback');
ok(E.giftTier('Krieg','Everlamp, miniature','neutral')==='hated','enchanted catalog item triggers Krieg exception');
for(const [id,pref] of Object.entries(E.GIFT_PREFS.npcs)) for(const tier of ['hated','loved','disliked','liked']) for(const item of pref.items[tier]){
 ok(E.giftTier(id,item,'neutral')===tier,`${id}: ${item} -> ${tier}`);
}
S=base(['Sophia'],'off',{Month:4,Week:3,Day:'Tue'});
S=applyPatch(S,[act('Sophia','gift','Nine Rivers: Field Tactics','hated')]);
ok(S.Bonds.Sophia.$xp===12 && !S.$eng.bweek.Sophia?.gift && S.Bonds.Sophia.Trust===52,'birthday first loved gift: 4 ×1.5 ×2, weekly exemption, +2 Trust');
S=applyPatch(S,[act('Sophia','gift','Nine Rivers: Field Tactics')]);
S=applyPatch(S,[act('Sophia','gift','Nine Rivers: Field Tactics')]);
const xp=S.Bonds.Sophia.$xp;S=applyPatch(S,[act('Sophia','gift','Nine Rivers: Field Tactics')]);
ok(S.Bonds.Sophia.$xp===xp && S.$eng.bweek.Sophia.gift===2 && S.Bonds.Sophia.Trust===52,'only first birthday gift bypasses weekly cap; Trust once');
S=applyPatch(S,[act('Sophia','gift','Get-well hamper')]);
ok(S.Bonds.Sophia.Tension===20 && S.Bonds.Sophia.$gifts['Get-well hamper']==='hated','birthday hated Tension doubles even after XP cap');
let K=base(['Krieg'],'off');const kxp=K.Bonds.Krieg.$xp;K=applyPatch(K,[act('Krieg','gift','Orchard cider')]);
ok(K.Bonds.Krieg.$xp===kxp && K.Bonds.Krieg.Tension>0 && K.Bonds.Krieg.$gifts['Orchard cider']==='hated','Krieg gift reaction and tension without XP');
let log=base(['Trixie'],'off');for(let i=0;i<26;i++) log=applyPatch(log,[act('Trixie','gift','unique '+i)]);
ok(Object.keys(log.Bonds.Trixie.$gifts).length===24 && !('unique 0' in log.Bonds.Trixie.$gifts),'gift discovery stores latest 24 items even beyond XP cap');
const rewritten=applyPatch(log,[op('/Bonds/Trixie',{Rank:4,Trust:50,Tension:0})]);
ok(_.isEqual(rewritten.Bonds.Trixie.$gifts,log.Bonds.Trixie.$gifts),'whole bond rewrite preserves gift discoveries');
const birthday=base(['Trixie'],'off',{Month:8,Week:2,Day:'Tue'});birthday.Bonds.Trixie.Tension=30;
const bdayA=applyPatch(birthday,[act('Trixie','birthday')]);
ok(bdayA.Bonds.Trixie.Trust===52 && applyPatch(bdayA,[act('Trixie','birthday')]).Bonds.Trixie.Trust===52,'greeting remembers birthday once');
const learned=base(['Irene'],'off');const bf=U.npcOf('Irene').fl.find(f=>f[0]==='Birthday');learned.Bonds.Irene.Rank=3;
ok(!U.fieldUnlocked('Irene',bf,learned),'guarded birthday stays hidden at Rank 3');
learned.Bonds.Irene.Rank=4;ok(U.fieldUnlocked('Irene',bf,learned),'guarded birthday opens Rank 4');
learned.Bonds.Irene.Rank=0;learned.Bonds.Irene.Known_facts=['Her birthday is '+bf[1]];
ok(U.fieldUnlocked('Irene',bf,learned) && Object.values(U.datedItems(learned)).flat().some(x=>/birthday/.test(x.t)),'learned birthday fact opens dossier and calendar early');
ok(/Gifts: loves/.test(render(509,applyPatch(base(['Sophia']),[]))),'present Cast Sheet includes gift tastes');
const gradBirthday=base(['Irene'],'off',{Year:2,Month:11,Week:3,Day:'Thu'});gradBirthday.Campus_State.Graduated=['Irene'];
ok(/Irene.*birthday/i.test(render(505,gradBirthday)),'known graduate birthday remains in narrator context');

console.log('Fatigue, injury and sleep debt');
for(const [st,gain] of [[100,1],[70,0.5],[30,0],[0,0]]){
 const x=base([],'off');x.Player.Vitals.Stamina=st;const a=applyPatch(x,[op('/Training',[{Track:'mana'}])]);
 ok(a.Player.Vitals.Mana_max===100+gain,`stamina ${st}: training +${gain}`);
}
for(const [severity,track,allow] of [['moderate','mana',true],['moderate','stamina',false],['serious','mana',false],['critical','stamina',false]]){
 const x=base([],'off');x.Player.Injuries.arm={Severity:severity};const a=applyPatch(x,[op('/Training',[{Track:track}])]);
 ok(a.Player.Vitals[track==='mana'?'Mana_max':'Stamina_max']===100+(allow?1:0),severity+' injury '+track+' gate');
}
const tired=base(['Trixie'],'off');tired.Player.Vitals.Stamina=30;
ok(applyPatch(tired,[act('Trixie','talk')]).Bonds.Trixie.$xp===1,'Exhausted talk loses 1 XP');
tired.Player.Vitals.Stamina=0;ok(applyPatch(tired,[act('Trixie','gift','Juggling set')]).Bonds.Trixie.$xp===0,'Collapsed cannot interact');
S=base([],'full',{Time:'00:00'});S=step(S,30);ok(S.$eng.late===0,'partial awake hour is retained, not charged');
S=step(S,30);ok(S.$eng.late===1 && S.Player.Vitals.Stamina===90,'two half-hours create one hour debt');
S=step(S,120);ok(S.$eng.late===3 && S.Player.Vitals.Stamina===70,'three hours caps stamina at 70%');
S=step(S,180);ok(S.$eng.late===6 && S.Player.Vitals.Stamina===60,'six hours capped at maximum 40% loss');
const replay=applyPatch(S,[]);ok(replay.$eng.late===6,'no-op does not accrue debt twice');
S=step(S,180,[op('/Player/Vitals/Resting','sleep')]);S=step(S,180,[op('/Player/Vitals/Resting','sleep')]);
ok(S.$eng.late===0 && S.Player.Vitals.Stamina>60,'six-hour sleep clears debt across consecutive updates');
let f=base([],'flavor',{Time:'00:00'});f=step(f,180);ok(f.Player.Vitals.Stamina===100 && Math.abs(f.$ui.sleep.loss-0.3)<1e-9,'Flavor narrates debt without numeric stamina effect');
let off=base([],'off',{Time:'00:00'});off=step(off,180);ok(off.$eng.late===0 && off.Player.Vitals.Stamina===100,'Off does not accrue sleep debt');
let cold=base([],'full',{Time:'00:00'});cold.Player.Conditions['Head cold']={Effect:'cold',Since:''};cold=step(cold,60);ok(cold.Player.Vitals.Stamina===80,'head cold wins over 10% debt');
cold=step(cold,120);ok(cold.Player.Vitals.Stamina===70,'30% debt wins over head cold');
let vigil=base([],'full',{Time:'00:00'});vigil=applyPatch(vigil,[op('/Inventory',{'The Vigil':{Qty:1,Kind:'other'}}),op('/Consumables',['The Vigil'])]);vigil=step(vigil,48*60);   // 1.16.1: a used item must be in the Bag
ok(vigil.$eng.late===0 && vigil.$ui.sleep.nights===2 && vigil.Player.Vitals.Stamina===60,'Vigil protects 48h then immediately caps at 60%');
vigil=step(vigil,360,[op('/Player/Vitals/Resting','sleep')]);ok(vigil.$ui.sleep.nights===1 && vigil.Player.Vitals.Stamina===60,'first full night retains crash');
vigil=step(vigil,18*60);vigil=step(vigil,360,[op('/Player/Vitals/Resting','sleep')]);ok(vigil.$ui.sleep.nights===0 && vigil.$eng.late===0,'second full night clears Vigil crash');

console.log('Wind mana costs, party attendance and migration');
ok(E.windMultiplier('Wind',{},'gale')===0.75 && E.windMultiplier('Mist',{},'windy')===1.5 && E.windMultiplier('Sound',{},'gale')===2,'fed and scattered subtypes');
ok(E.windMultiplier('Mending',{},'gale')===1 && E.windMultiplier('Fire',{},'gale')===1.5,'unaffected and default subtypes');
ok(E.windMultiplier('Fire',{Fire:{wind:'fed'}},'gale')===0.75 && E.windMultiplier('Wind',{Wind:{}},'gale')===1.5,'custom priority and old custom default');
let w=base([]);for(let seed=1;seed<500;seed++){w.$eng.seed=seed;const a=applyPatch(w,[]);if(a.$ui.wx.now.wind==='gale'){w=a;break;}}
ok(w.$ui.wx.now.wind==='gale','gale fixture found');
w.World.Location='Sports Field';w.Magic._Techniques.Test={Type:'Elemental',Subtype:'Mist',Cost_mode:'per_use',Activation:20,Trigger:0,Upkeep_per_min:0};
let cast=applyPatch(w,[op('/Magic/Casts',[{Technique:'Test'}])]);ok(cast.Player.Vitals.Mana===60 && cast._Log.some(x=>/×2, gale outdoors/.test(x)),'outdoor Gale doubles activation and logs cause');
const inside=clone(w);inside.World.Location='Canteen';ok(applyPatch(inside,[op('/Magic/Casts',[{Technique:'Test'}])]).Player.Vitals.Mana===80,'indoors costs unchanged');
const shield=clone(w);shield.Magic.Active.Ward={Technique:'Ward',Note:'Barrier blocks wind', $started:w.$eng.abs,$settled:w.$eng.abs};
ok(applyPatch(shield,[op('/Magic/Casts',[{Technique:'Test'}])]).Player.Vitals.Mana===80,'active wind barrier shelters casting');
const sustained=clone(w);sustained.Magic._Techniques.Test.Cost_mode='hybrid';sustained.Magic._Techniques.Test.Upkeep_per_min=1;sustained.Magic._Techniques.Test.Trigger=5;
let run=applyPatch(sustained,[op('/Magic/Active',{Mist:{Technique:'Test'}})]);ok(run.Player.Vitals.Mana===60,'sustained activation wind cost');
run=step(run,5,[op('/Magic/Casts',[{Technique:'Test'}])]);ok(run.Player.Vitals.Mana===41.4,'upkeep and hybrid trigger wind costs (1.9.4: + 5 min passive regeneration)');
const galeWalk=step(w,60);ok(galeWalk.Player.Vitals.Stamina===85,'gale drains 15 stamina per outdoor hour without stacking condition drains');
let party=base(['Trixie','Saffi','Irene'],'off',{Time:'18:00',Location:'The Snug'});party.Player.Profile.Birthday='M4 W2 Wed';
party.Bonds.Trixie.Rank=7;party.Bonds.Saffi.Rank=5;party.Bonds.Irene.Rank=7;party.Bonds.Irene.Trust=60;
party=applyPatch(party,[]);ok(party.$ui.party.host==='Irene' && party.$ui.party.guests.includes('Saffi'),'party organiser by rank then Trust; Rank 5 students invited');
let pa=applyPatch(party,[act('Saffi','birthday_party')]);ok(pa.Bonds.Saffi.$xp===3 && applyPatch(pa,[act('Saffi','birthday_party')]).Bonds.Saffi.$xp===3,'attended party +3 once outside normal daily cap');
const early=clone(party);early.World.Time='17:00';early.$eng.abs=E.toAbs(early.World);ok(applyPatch(early,[act('Saffi','birthday_party')]).Bonds.Saffi.$xp===0,'invitation before party grants no XP');
const festival=clone(party);Object.assign(festival.World,{Month:10,Week:4,Day:'Fri',Time:'21:00'});festival.$eng.abs=E.toAbs(festival.World);festival.Player.Profile.Birthday='M10 W4 Fri';
ok(applyPatch(festival,[act('Saffi','birthday_party')]).Bonds.Saffi.$xp===3,'birthday party honours extended festival curfew');
party.Campus_State.NPC_status.Irene='away abroad';ok(E.birthdayParty(party).host==='Trixie','absent organiser excluded');
const old=JSON.parse(read('tests/fixtures/saves/save_1.7.8.json')), migrated=Schema.parse(old);runEngine(migrated,old);
ok(migrated.$eng.late===0 && Object.values(migrated.Bonds).every(b=>b.$gifts && typeof b.$gifts==='object'),'1.7.8 save gets empty gift logs and zero debt');
ok(Object.keys(old.Bonds).every(id=>old.Bonds[id].Rank===migrated.Bonds[id].Rank && old.Bonds[id].Trust===migrated.Bonds[id].Trust),'1.7.8 bond ranks and trust survive');
for(const name of Object.keys(JSON.parse(read('data/gift_shops.json')))){
 const at=base([],'off',{Location:name});ok(U.shopsHere(at).some(i=>i.shop===name),name+' shop accessible at its location');
}
