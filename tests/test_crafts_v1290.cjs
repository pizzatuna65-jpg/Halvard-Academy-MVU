// 1.29.0: non-magic crafts (cooking, needlework, drawing, woodcarving, calligraphy, smithing) and masterwork from Projects.
const fs = require('fs'), path = require('path');
const ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const E = new Function(fs.readFileSync(path.join(ROOT,'src/scripts/engine.js'),'utf8') + '\nreturn {fromAbs, gearOf};')();
const CR = JSON.parse(fs.readFileSync(path.join(ROOT,'data/crafts.json'),'utf8'));
const SHOP = JSON.parse(fs.readFileSync(path.join(ROOT,'data/shop.json'),'utf8')).items;
const PRACTICE = JSON.parse(fs.readFileSync(path.join(ROOT,'data/practice.json'),'utf8'));
const at = (S,d,time,loc,extra=[]) => { const T=E.fromAbs(d*1440+(+time.slice(0,2))*60+(+time.slice(3)));
  return applyPatch(S,[...['Year','Month','Week','Day','Time'].map(k=>({op:'replace',path:'/World/'+k,value:T[k]})),{op:'replace',path:'/World/Location',value:loc},...extra]); };
const item = (name,qty=1,kind='other',Note='') => ({op:'insert',path:'/Inventory/'+name,value:{Qty:qty,Kind:kind,Note,Plan:''}});
const set = (p,value) => ({op:'replace',path:p,value});
const craft = (S,loc,aim,subject='') => at(S,0,'17:00',loc,[{op:'insert',path:'/Practice/-',value:{Action:'craft',Aim:aim,Subject:subject,With:''}}]);
const count = r => ({fine:0,success:1,weak:2}[r]);

// data: every material is sold (or gathered), every craft has a Practice action
const gathered = ['Foraged reagent','Clearing bloom'];
const missing = CR.recipes.flatMap(r => r.materials.flat().map(m => m.item)).filter(n => !gathered.includes(n) && !SHOP.some(i => i.item === n));
ok(!missing.length, 'every recipe ingredient is sold in a shop or gathered' + (missing.length ? ': ' + missing.join(', ') : ''));
for (const n of ['Baking and cooking ingredients','Knitting wool and needles','Paint box','Bar stock and coal']) ok(SHOP.some(i => i.item === n), `new ingredient on sale: ${n}`);
ok(Object.entries(CR.groups).every(([, g]) => g.actions.some(a => PRACTICE.some(p => p.action === a.action))), 'every craft group can be done under an existing Practice action');
ok(CR.recipes.every(r => CR.groups[r.group]), 'every recipe belongs to a defined craft group');

// portable crafts: common rooms yes, library no
const knit0 = at(initState(),0,'16:00','Common Rooms',[item('Knitting wool and needles',2,'other')]);
ok(knit0.$ui.craft.some(x => x.name === 'Knitted scarf') && !knit0.$ui.craft.some(x => x.name === 'Knitted winter set'), 'portable needlework is offered in the Common Rooms; advanced waits for Craft Rank 3');
const lib = at(initState(),0,'16:00','Main Library',[item('Knitting wool and needles',2,'other')]);
ok(!lib.$ui.craft.length, 'no portable craft in the Main Library');
const scarfPre = knit0.$ui.craft.find(x => x.name === 'Knitted scarf');
const scarf = craft(knit0,'Common Rooms','Knitted scarf');
ok(scarfPre.result === 'failed' ? !scarf.Inventory['Knitted scarf'] : scarf.Inventory['Knitted scarf'].Kind === 'gear' && /handmade by/.test(scarf.Inventory['Knitted scarf'].Note), 'knitted scarf goes to the Bag as handmade gear');
ok(scarf.Inventory['Knitting wool and needles'].Qty === 1, 'one ball of wool is spent');
ok(E.gearOf({'Knitted winter set':{Qty:1,Note:'handmade by {{user}}'}},{},0).warm, 'a knitted winter set keeps {{user}} warm (weather gear by recipe)');
ok(!E.gearOf({'Knitting wool and needles':{Qty:1,Note:''}},{},0).warm, 'knitting wool itself is not warm gear');
const woolOnly = at(initState(),0,'16:00','Courtyards',[item('Wool scarf and mittens',1,'gear')]);
ok(woolOnly.$ui.practice.some(x => /Knit or sew/.test(x.action) && x.locked === 'materials in Bag'), 'a bought wool scarf is not a craft material');

// cooking: club or the cook's leave
const kitchen = [set('/Player/Profile/Club','Cooking Club'), item('Baking and cooking ingredients',3,'food'), item('Carrots and fresh greens',1,'food')];
const cook0 = at(initState(),0,'16:00','Canteen',kitchen);
ok(['Honey buns','Butter cookies','Hearty stew pot'].every(n => cook0.$ui.craft.some(x => x.name === n)), 'Cooking Club member can cook simple and standard dishes');
const stranger = at(initState(),0,'16:00','Canteen',[item('Baking and cooking ingredients',3,'food')]);
ok(!stranger.$ui.craft.length, 'a non-member without the cook cannot use the kitchen');
const stewPre = cook0.$ui.craft.find(x => x.name === 'Hearty stew pot'), stew = craft(cook0,'Canteen','Hearty stew pot');
ok(stewPre.result === 'failed' ? !stew.Inventory['Hearty stew pot'] : stew.Inventory['Hearty stew pot'].Qty === [4,3,2][count(stewPre.result)], 'stew pot yields shareable servings by result');
ok(stew.Inventory['Carrots and fresh greens'] === undefined || stew.Inventory['Carrots and fresh greens'].Qty === 0, 'stew spends its greens');

// drawing at the Mall art studio costs the studio hour
const art0 = at(initState(),0,'16:00','The Mall',[item('Sketchbook and charcoal',1,'other'), set('/Player/Wallet/Points',100)]);
ok(art0.$ui.craft.some(x => x.name === 'Sketch'), 'Mall art studio offers drawing');
const art = craft(art0,'The Mall','Sketch');
ok(art.Player.Wallet.Points === 85, 'the art studio hour costs 15 points');

// smithing: club, tool bonus
const forge0 = at(initState(),0,'16:00','Workshop',[item('Bar stock and coal',2,'other')]);
ok(!forge0.$ui.craft.some(x => x.group === 'Smithing'), 'smithing needs the Smithing Club');
const forge1 = at(initState(),0,'16:00','Workshop',[set('/Player/Profile/Club','Smithing Club'), item('Bar stock and coal',2,'other')]);
const forge2 = at(initState(),0,'16:00','Workshop',[set('/Player/Profile/Club','Smithing Club'), item('Bar stock and coal',2,'other'), item('Precision tool roll',1,'other')]);
const h1 = forge1.$ui.craft.find(x => x.name === 'Hooks and nails'), h2 = forge2.$ui.craft.find(x => x.name === 'Hooks and nails');
ok(h1 && h2 && h2.score === h1.score + 5 && h2.roll === h1.roll, 'Precision tool roll adds +5 to smithing');
ok(!forge1.$ui.craft.some(x => x.group === 'Brewing'), 'workshop brewing stays with the Brewing Club');

// mending
const mend0 = at(initState(),0,'16:00','Common Rooms',[item('Embroidery thread set',1,'other'), item('Grey cloak',1,'gear','damaged at the hem')]);
ok(mend0.$ui.craft.some(x => x.name === 'Mend clothes'), 'mending is offered with damaged clothing');
const mendPre = mend0.$ui.craft.find(x => x.name === 'Mend clothes'), mended = craft(mend0,'Common Rooms','Mend clothes','Grey cloak');
ok(mendPre.result === 'failed' || !/damaged/.test(mended.Inventory['Grey cloak'].Note), 'a successful mend removes the damage');

// masterwork
const rank4 = [set('/$eng/prof/xp/Craft',100), {op:'insert',path:'/Projects/Moonlit shawl',value:{Kind:'tailoring',Goal:'a shawl of Sky silk',Progress:80,Needs:'',Where:'Common Rooms',Due:'',With:''}}];
const mw0 = at(initState(),0,'16:00','Common Rooms',rank4);
const mwPre = mw0.$ui.craft.find(x => x.tier === 'masterwork');
ok(mwPre && mwPre.name === 'Moonlit shawl' && mwPre.dc === 85, '<now> shows the masterwork result for an open craft Project at Craft Rank 4');
const mw = at(mw0,0,'18:00','Common Rooms',[set('/Projects/Moonlit shawl/Progress',100)]);
ok(!mw.Projects['Moonlit shawl'], 'the finished masterwork Project is closed');
ok(mwPre.result === 'failed' ? !mw.Inventory['Moonlit shawl'] : /handmade by \{\{user\}\}/.test(mw.Inventory['Moonlit shawl'].Note)
  && (mwPre.result === 'weak' || /masterwork/.test(mw.Inventory['Moonlit shawl'].Note)), 'the masterwork lands in the Bag with the <now> result');
ok(mw.Journal.some(x => /masterwork|Moonlit shawl/.test(x)), 'the Journal records the masterwork');
const mwRep = at(mw0,0,'18:00','Common Rooms',[{op:'insert',path:'/Practice/-',value:{Action:'craft',Aim:'masterwork',Subject:'Moonlit shawl',With:''}}]);
ok(!mwRep.Projects['Moonlit shawl'] && mwRep._Log.filter(x => x.includes('Masterwork Moonlit shawl')).length === 1, 'a reported masterwork is judged once');
const low0 = at(initState(),0,'16:00','Common Rooms',[set('/$eng/prof/xp/Craft',60), rank4[1]]);
ok(!low0.$ui.craft.some(x => x.tier === 'masterwork'), 'no masterwork line below Craft Rank 4');
const low = at(low0,0,'18:00','Common Rooms',[set('/Projects/Moonlit shawl/Progress',100)]);
ok(!low.Inventory['Moonlit shawl'] && low._Log.some(x => /needs Craft Rank 4/.test(x)), 'below Rank 4 a finished Project is ordinary work');
const research = at(initState(),0,'16:00','Common Rooms',[set('/$eng/prof/xp/Craft',100), {op:'insert',path:'/Projects/Essay',value:{Kind:'research',Goal:'x',Progress:50,Needs:'',Where:'',Due:'',With:''}}]);
ok(!research.$ui.craft.some(x => x.tier === 'masterwork'), 'a research Project is never a masterwork');

// prompt and UI
const rule = (file, ui) => { const f = path.join(ROOT, file); return ejs.render(fs.readFileSync(f,'utf8'),{getvar:k=>k==='stat_data.$ui'?ui:k==='stat_data'?mw0:undefined},{filename:f}); };
const now = rule('src/worldbook/custom/content/505.txt', mw0.$ui);
ok(/Masterwork if finished this turn: Moonlit shawl/.test(now) && !/Crafting now:/.test(now), '<now> carries the masterwork line apart from the recipes');
global.window={parent:{document:{}}};
const U=new Function(fs.readFileSync(path.join(ROOT,'src/scripts/ui.js'),'utf8')+'\nreturn {PANELS,view};')();
U.view.act='practice';
const html = U.PANELS.activities.render(mw0);
ok(/Needlework · standard/.test(html) && /Moonlit shawl/.test(html) && /A masterwork has no recipe/.test(html), 'Practice tab lists portable recipes and the masterwork');
