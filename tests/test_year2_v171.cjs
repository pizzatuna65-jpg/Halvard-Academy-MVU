// 1.7.1 (owner: "bug hunt dan stress test apa yang terjadi ketika user mencapai Year 2"): what changes when the campaign reaches
// Year 2. Dates carry their year from Year 2 (a Year 1 line is aged "over a year ago", not "earlier today"), and Year 1's lines are
// dated "Y1" at the rollover; {{user}} moves up a year; last year's competition record is cleared; Etnie does not leave with the
// graduates (her canon); {{user}} ages on their birthday; NPC ages follow the campaign year; a graduate's own entry says they left;
// Royhan's "last chance" trouble is Year 1 only; <now> names the campaign year; the Entrance Event is for the new first-years;
// the Journal groups by year. A 1.7.0 save made at the end of Year 1 plays into Year 2 without losing anything.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, runEngine, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
console.log('Year 2 1.7.1');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const cardJ = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const entry = uid => cardJ.character_book.entries.find(e => e.id === uid).content;
const R = (uid, S) => ejs.render(entry(uid), { getvar: k => _.get({ stat_data: S }, k) });
const npcs = JSON.parse(rd('data/npcs.json'));
const W = (S, w, ops = []) => applyPatch(S, [...Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })), ...ops]);
const here = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { nbJournal, PANELS, view };')();
const ver = JSON.parse(rd('src/card/card.json')).character_version;

// ---- the 1.7.0 save made at the end of Year 1 plays into Year 2
const old = JSON.parse(rd('tests/fixtures/saves/save_1.7.0_yearend.json'));
ok(old.World.Year === 1 && old.World.Month === 12 && old.Campus_State.Graduated.includes('Etnie') && old.Competition.Status === 'eliminated', 'fixture: 1.7.0, Year 1 M12 W4 Sun, graduation done (Etnie among them, as 1.7.0 did it), a finished competition');
let S = W(old, { Year: 2, Month: 1, Week: 1, Day: 'Mon', Time: '07:30' }, [{ op: 'insert', path: '/Journal/-', value: '[M1 W1 Mon] Back at the gate for Year 2.' },
  { op: 'replace', path: '/Bonds/Kanae/Knows', value: [...old.Bonds.Kanae.Knows, '[M1 W1 Mon] {{user}} came back for a second year.'] }]);
ok(S.$eng.ver === ver && Object.keys(old.Bonds).every(id => S.Bonds[id] && S.Bonds[id].Rank === old.Bonds[id].Rank && S.Bonds[id].Trust === old.Bonds[id].Trust), 'every bond keeps its rank and Trust');
ok(old.Journal.every(l => S.Journal.includes(l.replace(/^\[M/, '[Y1 M')) || (S.$ui.archive || []).includes(l.replace(/^\[M/, '[Y1 M'))), "every Year 1 Journal line is kept, dated Y1");
ok(S.Journal.includes('[Y2 M1 W1 Mon] Back at the gate for Year 2.') && S.Journal.some(l => /^\[Y2 M1 W1 Mon\] A new class of first-years arrived/.test(l)), 'lines written in Year 2 carry Y2 (the narrator\'s own date too)');
ok(S.Bonds.Etnie.Knows.every(k => /^\[Y1 M/.test(k)) && /^Y1 M11 W4 Sun/.test(S.Bonds.Etnie.Last_seen) && S.Bonds.Etnie.$Recent.every(r => /^Y1 /.test(r.w)), "Etnie's Knows, Last seen and Recent are dated Y1");
ok(S.Bonds.Kanae.Knows.slice(-1)[0] === '[Y2 M1 W1 Mon] {{user}} came back for a second year.' && S.Bonds.Kanae.Knows.slice(0, -1).every(k => /^\[Y1 /.test(k)), "Kanae: the old lines Y1, the new one Y2");
ok(Object.values(S.Campus_State.Events).every(v => /^Y1 M/.test(v.Updated)), 'campus events: last news dated Y1');
ok(S._Log.some(l => /^\[Y2 M1 W1 Mon 07:30\] A new academic year began \(Year 2\): \{\{user\}\} moved up to Year 2/.test(l)) && S.Player.Profile.Year === 2 && S.Journal.some(l => /Began Year 2 at Halvard/.test(l)), '{{user}} moves up to Year 2 (log, Journal, Player.Profile.Year)');
ok(!S.Competition.Status && !S.Competition.Tier && !S.Competition.Team.length && S._Log.some(l => /last year's Competition record was cleared/.test(l)) && S.Journal.some(l => /Eliminated from the Academy Competition/.test(l)), "last year's competition record is cleared; the Journal keeps it");
// what the narrator reads: <now> and the Cast Sheet
let N = R(505, S);
ok(/^Year 2, Month 1, Week 1, Mon 07:30/m.test(N) && /Campaign Year 2 \(\{\{user\}\}: Year 2\)\. Lore calls students first-, second- or third-years/.test(N), '<now> names the campaign year and how to read school years in lore');
ok(/Journal dates, newest first: Y2 M1 W1 Mon = earlier today;[^\n]*Y1 M12 W4 Sun = yesterday/.test(N) && !/Y1 M1 W1 Mon = earlier today/.test(N), `<now> ages a Year 1 line by its year (${(N.match(/Journal dates[^\n]*/) || [''])[0].slice(0, 160)})`);
ok(!/^Year \d, Month/m.test(R(505, initState())) && !/Campaign Year/.test(R(505, initState())), 'Year 1: <now> reads as before');
const late = W(S, { Month: 2, Week: 1, Day: 'Mon', Time: '10:00' }, [here(['Kanae'])]);
const ks = R(509, late);
ok(/Defining moments with \{\{user\}\}: \[Y1 M1 W1 Thu 18:00, over a year ago\][^\n]*\[Y1 M2 W1 Sat 18:00, 11 months ago\]/.test(ks), "Cast Sheet: Kanae's defining moments from Year 1 are aged across the year (not \"4 days ago\")");
ok(/\[Y2 M1 W1 Mon, last month\] \{\{user\}\} came back for a second year\./.test(ks), 'and the Year 2 line by its own date');
const nextYear = W(late, { Month: 3, Week: 1, Day: 'Mon', Time: '10:00' }, [here(['Kanae'])]);
const far = W(nextYear, { Year: 3, Month: 4, Week: 1, Day: 'Mon', Time: '10:00' }, [here(['Kanae'])]);
ok(/\[Y1 M1 W1 Thu 18:00, over 2 years ago\]/.test(R(509, far)) && /\[Y2 M1 W1 Mon, over a year ago\]/.test(R(509, far)), 'Year 3: Year 1 lines are "over 2 years ago", Year 2 lines "over a year ago"');
// the player's Journal groups by year
const J = U.nbJournal(S);
ok(/<h4>Year 2, Month 1<\/h4>/.test(J) && /<h4>Year 1, Month 12<\/h4>/.test(J) && J.indexOf('Year 2, Month 1') < J.indexOf('Year 1, Month 12'), 'Journal: groups by year and month, newest first');
ok(!/Year 1, Month/.test(U.nbJournal(old)) && /<h4>Month 12<\/h4>/.test(U.nbJournal(old)), 'Journal in Year 1: months as before');

// ---- graduation: Etnie stays on (canon: she fails her third year on purpose to stay beside {{user}})
const S0 = W(initState(), { Month: 1, Week: 1, Day: 'Mon', Time: '09:00' }, [here(['Etnie', 'Royhan'])]);
let G = W(S0, { Month: 11, Week: 4, Day: 'Sun', Time: '09:00' }, [here([])]);
ok(G._Log.some(l => /Graduation today[^\n]*Etnie is not graduating \(see their lore\)/.test(l)), 'Graduation day: the log says Etnie is not graduating');
G = W(G, { Month: 12, Week: 1, Day: 'Mon', Time: '08:00' });
ok(!G.Campus_State.Graduated.includes('Etnie') && ['Caspian', 'Gareth', 'Irene', 'Royhan', 'Ruby', 'Sophia'].every(x => G.Campus_State.Graduated.includes(x)), 'the others leave; Etnie does not');
ok(G._Log.some(l => /Etnie did not leave with the graduates: she stays on at Halvard for another third year \(her lore says why\)\. If the story had them graduate after all/.test(l)) && !/fail|on purpose/i.test(G._Log.join(' ')), 'the log explains without giving her secret away (the player sees the log)');
let G2 = W(G, { Year: 2, Month: 1, Week: 1, Day: 'Mon', Time: '12:00' }, [here(['Etnie'])]);
ok(/Year 3 student, Viridian dorm/.test(R(509, G2)) && /Year 3: Etnie \([^)]*repeating\)/.test(R(97, G2)), 'Year 2: her sheet says Year 3 student; the roster shows her repeating');
G2 = W(G2, { Month: 12, Week: 1, Day: 'Mon', Time: '08:00' }, [here([])]);
ok(!G2.Campus_State.Graduated.includes('Etnie') && ['Dante', 'Kanae', 'Saffi'].every(x => G2.Campus_State.Graduated.includes(x)), 'end of Year 2: the second-years of Year 1 graduate; Etnie is still not sent away');
const Gs = applyPatch(G, [{ op: 'replace', path: '/Campus_State/Graduated', value: [...G.Campus_State.Graduated, 'Etnie'] }]);
ok(W(Gs, { Time: '12:00' }).Campus_State.Graduated.includes('Etnie'), 'the story can still have her graduate');

// ---- {{user}}'s year: the story's choice wins; a third-year is not moved
const up = W(W(S0, { Month: 12, Week: 4, Day: 'Sun', Time: '20:00' }), { Year: 2, Month: 1, Week: 1, Day: 'Mon', Time: '08:00' });
const held = W(up, { Time: '09:00' }, [{ op: 'replace', path: '/Player/Profile/Year', value: 1 }]);
ok(up.Player.Profile.Year === 2 && held.Player.Profile.Year === 1 && W(held, { Time: '10:00' }).Player.Profile.Year === 1, 'the story can hold {{user}} back (set the year back); the engine does not move it again');
const wrote = W(W(S0, { Month: 12, Week: 4, Day: 'Sun', Time: '20:00' }), { Year: 2, Month: 1, Week: 1, Day: 'Mon', Time: '08:00' }, [{ op: 'replace', path: '/Player/Profile/Year', value: 2 }]);
ok(wrote.Player.Profile.Year === 2 && wrote._Log.some(l => /\{\{user\}\} is in Year 2\./.test(l)), 'if the narrator moved {{user}} up itself, it is not added twice');
const y3 = applyPatch(W(S0, { Month: 12, Week: 4, Day: 'Sun', Time: '20:00' }), [{ op: 'replace', path: '/Player/Profile/Year', value: 3 }]);
const y3n = W(y3, { Year: 2, Month: 1, Week: 1, Day: 'Mon', Time: '08:00' });
ok(y3n.Player.Profile.Year === 3 && y3n._Log.some(l => /was already a third-year: the card does not play \{\{user\}\}'s own graduation/.test(l)), 'a third-year {{user}} is not moved; the story decides');

// ---- the Entrance Event in Year 2
ok(!/returning student/.test(S0.World._Event_today) && /returning student, sorted in their first year and never sorted again/.test(W(G, { Year: 2, Month: 1, Week: 1, Day: 'Mon', Time: '09:00' }).World._Event_today), 'Entrance Event: from Year 2, {{user}} is a returning student and is not sorted again');

// ---- {{user}}'s birthday adds a year, once
const bd = applyPatch(S0, [{ op: 'replace', path: '/Player/Profile/Birthday', value: 'M2 W1 Tue' }, { op: 'replace', path: '/Player/Profile/Age', value: 18 }]);
let b1 = W(bd, { Month: 2, Week: 1, Day: 'Tue', Time: '07:00' });
ok(b1.Player.Profile.Age === 19 && b1._Log.some(l => /Birthday: \{\{user\}\} turns 19 today/.test(l)), 'the birthday adds a year');
b1 = W(b1, { Time: '12:00' });
ok(b1.Player.Profile.Age === 19, 'once a day, not every update');
const b2 = W(bd, { Month: 2, Week: 1, Day: 'Tue', Time: '07:00' }, [{ op: 'replace', path: '/Player/Profile/Age', value: 19 }]);
ok(b2.Player.Profile.Age === 19, 'if the story already wrote the new age, it is not added twice');
ok(W(W(b1, { Month: 12, Week: 4, Day: 'Sun', Time: '20:00' }), { Year: 2, Month: 2, Week: 1, Day: 'Tue', Time: '07:00' }).Player.Profile.Age === 20, 'the next year: 20');

// ---- NPC ages and a graduate's own entry
const Y1 = initState(), Y2 = W(G, { Year: 2, Month: 2, Week: 1, Day: 'Mon', Time: '12:00' });
const roy = s => R(npcs.Royhan.uid_card, s);
ok(/^Age: 20\.$/m.test(roy(Y1)) && /^Age: 21\.$/m.test(roy(Y2)), 'Royhan: 20 in Year 1, 21 in Year 2');
ok(/Current trouble: This year is his last chance/.test(roy(Y1)) && !/Current trouble/.test(roy(Y2)), 'his "last chance" trouble is Year 1 only');
ok(!/graduated/.test(roy(Y1)) && /^Now: graduated; has left Halvard/m.test(roy(Y2)), "a graduate's own entry says they have left");
const Y3 = W(Y2, { Year: 3, Month: 2, Week: 1, Day: 'Mon', Time: '12:00' });
ok(/^Age: 18, a first-year/m.test(R(npcs.Linus.uid_card, Y2)) && /^Age: 19, a first-year/m.test(R(npcs.Linus.uid_card, Y3)), 'Linus (arrives Year 2): 18 in Year 2, 19 in Year 3');
ok(/Age 634:/.test(R(npcs.Gavlan.uid_card, Y1)) && /Age 635:/.test(R(npcs.Gavlan.uid_card, Y2)), 'staff age too (Gavlan 634 -> 635)');
const rival = Object.values(npcs).find(n => n.academy !== 'Halvard' && /age 18/.test(R(n.uid_card, Y1)));
ok(rival && /age 18/.test(R(rival.uid_card, Y3)), `rival academy teams keep their ages (${rival && rival.id})`);
ok(/^Age: 22\. Third year, after repeating her second year\./m.test(R(npcs.Etnie.uid_card, Y2)) && !/^Now: graduated/m.test(R(npcs.Etnie.uid_card, Y2)), 'Etnie in Year 2: 22, still a student');
const rs = W(Y2, { Time: '13:00' }, [here(['Royhan'])]);
ok(/Former student \(graduated\)/.test(R(509, rs)) && /Age: 21\./.test(R(509, rs)), "Royhan's Cast Sheet: former student, 21");
// the dossier (UI) shows the same ages
const dos = s => { const x = _.cloneDeep(s); x.Bonds.Royhan = { ...x.Bonds.Royhan, Rank: 2 }; x.$ui.names = [...(x.$ui.names || []), 'Royhan']; U.view.arg = 'Royhan'; return U.PANELS.npc.render(x); };
ok(/<h3>Age<\/h3><p class="fv">20\.<\/p>/.test(dos(S0)) && /<h3>Age<\/h3><p class="fv">21\.<\/p>/.test(dos(Y2)), 'dossier: Royhan 20 in Year 1, 21 in Year 2');

// ---- the card
ok(!/\{\{user\}\} is a first-year student/.test(cardJ.description) && /a first-year when the story begins; Player\.Profile\.Year says which year now/.test(cardJ.description), 'the card description no longer fixes {{user}} as a first-year');
// every lore entry still renders in Year 2 and Year 3
let bad = 0; for (const st of [Y2, Y3, G2]) for (const e of cardJ.character_book.entries) { try { R(e.id, st); } catch (err) { bad++; } }
ok(!bad, 'every entry renders in Year 2 and Year 3');
