// Batch 5.4 token audit: always-on prompt (constant entries, EJS rendered, <current_state> as TH formats it, $ keys omitted) at the start and in a busy mid-year state. ~3.6 chars per token.
// Run after build: NODE_PATH=<zod lodash yaml ejs> node tests/token_audit.cjs
const fs=require('fs'),_=require('lodash'),YAML=require('yaml'),ejs=require('ejs');
const h=require('./harness.cjs');
const h0=require('./harness.cjs');const card=JSON.parse(fs.readFileSync(require('path').join(h0.ROOT,'dist/')+'Eldrasil_Halvard.json','utf8')).data;
const tok=s=>Math.round(s.length/3.6);
const omit$=o=>Array.isArray(o)?o.map(omit$):(o&&typeof o==='object')?Object.fromEntries(Object.entries(o).filter(([k])=>!k.startsWith('$')).map(([k,v])=>[k,omit$(v)])):o;
function render(S){ const getvar=k=>_.get({stat_data:S},k);
  return e=>{let c=e.content; if(/<%/.test(c)) c=ejs.render(c,{getvar}); return c.replace('{{format_message_variable::stat_data}}',YAML.stringify(omit$(S)));};}
// heavy state: grow a mid-year campaign
let S=h.initState();
const ids=['Irene','Caspian','Royhan','Lenna','Saffi','Kanae','Idris','Aiden','Zara','Rei','Kuroo','Mimosa','Bobby','Tilly','Alyssa'];
const ops=[{op:'replace',path:'/World/Month',value:6},{op:'replace',path:'/World/Time',value:'13:00'}];
ids.forEach((id,i)=>ops.push({op:'insert',path:'/Bonds/'+id,value:{Rank:0,Progress:2,Trust:55,Tension:10,Title:'Classmate',Known_facts:Array.from({length:i<5?12:5},(_,k)=>`Fact ${k} about ${id}: something learned in a scene, about ten words`),Milestones:i<5?['Shared a moment on the Rooftop at dusk']:[]}}));
for(let i=0;i<30;i++) ops.push({op:'insert',path:'/Journal/-',value:`Turning point ${i}: a short line of around twenty words describing who did what and where it happened`});
ops.push({op:'replace',path:'/Campus_State/Rumours',value:Array.from({length:10},(_,i)=>`Rumour ${i} whispered in the courtyards this week`)});
ops.push({op:'replace',path:'/Campus_State/Events',value:Object.fromEntries(Array.from({length:8},(_,i)=>[`Event ${i}`,'one-line summary of an event that changed the campus (M3 W2)']))});
ops.push({op:'replace',path:'/Clues',value:Object.fromEntries(Array.from({length:10},(_,i)=>[`Clue ${i}`,{Thread:'The scorched ledger',Detail:'what was observed, around twenty words of detail here',Where:'Archive',Links:['Irene']}]))});
S=h.applyPatch(S,ops);
const I=h.initState();
const rows=[]; let tot0=0,totH=0;
for(const e of card.character_book.entries){ if(!e.enabled||!e.constant) continue;
  const a=tok(render(I)(e)), b=tok(render(S)(e)); tot0+=a; totH+=b; rows.push([e.id,e.comment.slice(0,58),a,b]); }
rows.sort((x,y)=>y[3]-x[3]); console.log('uid | entry | start | heavy'); rows.forEach(r=>console.log(r.join(' | ')));
console.log('TOTAL constant tokens ~', tot0, '(start) ', totH, '(heavy mid-game)');
const card_desc=tok(card.description); console.log('card description ~', card_desc);
const y=YAML.stringify(omit$(S)); const parts=Object.fromEntries(Object.keys(omit$(S)).map(k=>[k,tok(YAML.stringify(omit$(S)[k]))])); console.log('current_state by section (heavy):', JSON.stringify(parts));
// 1.5.0: the edited preset's enabled prompts ({{// }} notes removed, as SillyTavern drops them), biggest first
{ const PS=JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','presets/Realistic_Frankenstein_2_2_Eldrasil.json'),'utf8')), ids=new Set(PS.prompt_order[0].order.filter(o=>o.enabled).map(o=>o.identifier));
  const on=PS.prompts.filter(p=>ids.has(p.identifier)&&p.content).map(p=>[p.name,tok(p.content.replace(/\{\{\/\/[\s\S]*?\}\}/g,''))]).sort((a,b)=>b[1]-a[1]);
  console.log('preset enabled prompts ~', on.reduce((a,x)=>a+x[1],0), 'tokens; biggest', JSON.stringify(on.slice(0,6))); }
