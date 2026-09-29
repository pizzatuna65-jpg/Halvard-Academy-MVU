// Local browser fixture for the new surfaces. Run after building; writes ignored temporary preview HTML in project root.
const fs=require('fs'),path=require('path');
const {initState,Schema,runEngine,ROOT}=require('../harness.cjs');
let S=initState();S.World.Month=4;S.World.Week=3;S.World.Day='Tue';S.World.Location='The Mall';S.World.Time='18:00';
S.Player.Profile.Name='Aria Vale';S.Player.Profile.Dorm='Fire';S.Player.Vitals.Stamina=30;S.$eng.late=2;S.$ui.built=true;
S.Magic._Affinity={Types:['Elemental'],Dominant:'Elemental',Specialties:['Glass'],Custom:{Glass:{Type:'Elemental',Forbidden:false,wind:'scattered'}}};
S.Bonds.Sophia={Rank:4,Trust:60,Tension:5,$gifts:{'Nine Rivers: Field Tactics':'loved','Honey bun':'disliked','Get-well hamper':'hated'}};
S.Scene.Present={Sophia:{Note:'waiting near the door'}};S=Schema.parse(S);runEngine(S);
const state=JSON.stringify(S).replace(/</g,'\\u003c');
const mock=`window.H={};window.eventOn=(e,f)=>(H[e]=H[e]||[]).push(f);window.eventEmit=async(e,d)=>(H[e]||[]).forEach(f=>f(d));window.getButtonEvent=n=>'btn:'+n;window.tavern_events={CHAT_CHANGED:'cc',MESSAGE_RECEIVED:'mr'};window.waitGlobalInitialized=()=>new Promise(()=>{});window.toastr={warning:console.warn,success(){},error:console.error,info(){}};window.$=f=>{if(typeof f==='function') f();return {on(){},val(){return this},trigger(){}}};window.getLastMessageId=()=>0;window.getChatMessages=()=>[];window.getVariables=()=>({stat_data:window.STATE});window.substitudeMacros=()=> 'Aria Vale';`;
const bar=fs.readFileSync(path.join(ROOT,'src/ui/statusbar.html'),'utf8');
const barMock=fs.readFileSync(path.join(ROOT,'tests/preview/mock_th.js'),'utf8');
fs.writeFileSync(path.join(ROOT,'.tmp_v180_bar.html'),bar.replace('<head>','<head><script>window.__MOCK_STATE='+state+';'+barMock+'</script>'));
fs.writeFileSync(path.join(ROOT,'.tmp_v180_preview.html'),`<!doctype html><html><head><meta charset="utf-8"><title>Halvard 1.8.0 preview</title><style>body{background:#202126;color:#eee;font:16px sans-serif;margin:16px}button{padding:10px;margin:4px}iframe{width:100%;height:330px;border:0}</style></head><body><h1>Halvard 1.8.0</h1><iframe src="/.tmp_v180_bar.html"></iframe><nav>${[['npc:Sophia','Gift dossier'],['builder','Builder'],['notebook:planner','Calendar'],['activities','Shop']].map(([id,label])=>`<button onclick="eventEmit('eldrasil:open','${id}')">${label}</button>`).join('')}</nav><script src="/node_modules/lodash/lodash.min.js"></script><script>window.STATE=${state};${mock}</script><script src="/src/scripts/ui.js"></script></body></html>`);
console.log('Preview: /.tmp_v180_preview.html');
