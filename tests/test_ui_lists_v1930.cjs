// 1.93.0 (owner): event schedules as a time | what table, long explanations as points, the Bonds order as a dropdown with
// ascending / descending, and pinned people kept on top whatever the order
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
const src = fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8');
const U = new Function(src + '\nreturn { PANELS, view, schedHTML, pinsGet, peopleListHTML, peopleGraphHTML };')();
console.log('UI lists (1.93.0)');

// schedule table: times split from what, a header row per day only when the days differ
const one = U.schedHTML([['', '07:00–09:00 arrivals at Reception; 09:00 speeches; afternoon: Base Camp; Classes as usual; dusk (about 18:30): the Bell Tower rings']]);
ok(/<td class="w">07:00–09:00<\/td><td>Arrivals at Reception<\/td>/.test(one), 'a timed part: time in its own cell, the rest capitalised');
ok(/<td class="w">Afternoon<\/td><td>Base Camp<\/td>/.test(one) && /<td class="w">dusk \(about 18:30\)|<td class="w">Dusk \(about 18:30\)<\/td>/.test(one), 'afternoon and "dusk (about 18:30)" count as times');
ok(/<td class="w"><\/td><td>Classes as usual<\/td>/.test(one) && !/tr class="sd"/.test(one), 'an untimed part keeps an empty time cell; one day has no day header');
const two = U.schedHTML([['Wed', '07:00 airships leave'], ['Thu', '08:00 the hunt']]);
ok((two.match(/tr class="sd"/g) || []).length === 2 && /<th colspan="2">Thu<\/th>/.test(two), 'several days: a header row each');
ok(U.schedHTML([['', '']]) === '', 'no schedule, no table');

// the Bonds order: a dropdown, ascending / descending, pins on top
let S = initState();
S = applyPatch(S, [{ op: 'replace', path: '/Scene/Present', value: { Irene: { Note: 'here' } } }]);
S.Bonds.Irene.Rank = 2; S.Bonds.Etnie = S.Bonds.Etnie || JSON.parse(JSON.stringify(S.Bonds.Irene));
const order = h => [...h.matchAll(/data-open="npc:([^"]+)"/g)].map(m => m[1]);
U.view.psort = 'close'; U.view.pdir = '';
let h = U.peopleListHTML(S);
ok(/<select data-psort/.test(h) && /<option value="close" selected>Closest<\/option>/.test(h) && !/data-psort="name"/.test(h), 'the order is a dropdown, not a row of buttons');
ok(/data-pdir="desc" class="on"/.test(h), 'Closest starts descending (closest first)');
const base = order(h);
U.view.pdir = 'asc'; ok(JSON.stringify(order(U.peopleListHTML(S))) === JSON.stringify([...base].reverse()), 'ascending reverses the order');
U.PANELS.people.input({ dataset: { psort: '' }, value: 'name' });
ok(U.view.psort === 'name' && U.view.pdir === '', 'picking another order resets the direction to its own default');
U.view.pdir = '';
const last = base[base.length - 1];
U.pinsGet().push(last);
for (const [by, dir] of [['close', ''], ['close', 'asc'], ['name', 'desc'], ['dorm', ''], ['year', 'desc']]) {
  U.view.psort = by; U.view.pdir = dir;
  ok(order(U.peopleListHTML(S))[0] === last, `pinned ${last} stays on top (${by}${dir ? ' ' + dir : ''})`);
}
h = U.peopleListHTML(S);
ok(/★ Pinned/.test(h) && new RegExp(`data-pin="${last}" aria-pressed="true"`).test(h), 'a Pinned header and a pressed star');
U.view.arg = last; ok(/class="btn sm pind on"/.test(U.PANELS.npc.render(S)), 'the dossier shows the pin too');

// Connections: the explanation as points
ok(/<ul class="pts">/.test(U.peopleGraphHTML(S)) && !/<p class="lead">Everyone you have met/.test(U.peopleGraphHTML(S)), 'Connections explains itself in points');
