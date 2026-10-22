// 1.95.0 (owner-approved planning/DRAFT_surat.md): the Mail Tower. Letters are posted at the Tower (written elsewhere, they wait);
// every letter's reply is rolled once when posted (campus, far, other), a campus friend met in person answers there; family writes
// first in a month {{user}} has not; a close friend now and then; letters sent in the week before 1.95.0 are still answered.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, renderEntry, ok, ROOT } = require('./harness.cjs');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn { fromAbs };')();
const MAIL = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/letters.json'), 'utf8'));
const CARD = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8'));
const at = (S, d, time, loc, extra = []) => { const T = E.fromAbs(d * 1440 + (+time.slice(0, 2)) * 60 + (+time.slice(3)));
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })), { op: 'replace', path: '/World/Location', value: loc }, ...extra]); };
const send = (k, To, Gist = 'hello') => ({ op: 'insert', path: `/Letters/${k}`, value: { From: '{{user}}', To, Gist, Status: 'sent' } });
const bond = (Rank, extra = {}) => ({ Rank, Progress: 0, Trust: 60, Tension: 0, Title: '', Romance: false, Known_facts: [], Milestones: [], Last_seen: '', _Event_ready: false, $Known_old: [], ...extra });
const seeded = seed => applyPatch(initState(), [{ op: 'replace', path: '/$eng/seed', value: seed }]);
const S0 = at(seeded(7), 1, '09:00', 'Main Library', [{ op: 'replace', path: '/Bonds/Saffi', value: bond(2) }]);
const pend = S => (S.$eng.mail || {}).pend || [];

console.log('Who a letter is for');
const tower = at(S0, 1, '10:00', 'Mail Tower');
const posted = at(tower, 1, '10:20', 'Mail Tower', [send('To Saffi', 'Saffi'), send('To Lucius', 'Lucius'), send('To Linus', 'Linus'),
  send("To Roy's mother", "Roy's mother"), send('To the bakery', 'Mrs Hale at the bakery'), send('To Mum', 'Mum')]);
const kind = to => (pend(posted).find(p => p.to === to) || {}).kind;
ok(kind('Saffi') === 'campus' && kind('Lucius') === 'far' && kind('Linus') === 'far', 'a roster NPC at Halvard is campus; another academy\'s team and one not arrived yet are far');
ok(kind("Roy's mother") === 'other' && kind('Mrs Hale at the bakery') === 'other', "someone else's family and anyone off the roster are other");
ok(!pend(posted).some(p => p.to === 'Mum') && posted.$eng.home.from === 'Mum', 'a letter home keeps its own rule (HOME)');
const days = p => [Math.round((p.due - p.at) / 1440), Math.round((p.end - p.at) / 1440)];
ok(pend(posted).every(p => { const [d, e] = days(p), R = MAIL.reply[p.kind].days; return d >= R[0] - 1 && d <= R[1] + 1 && e >= R[1] - 1 && e <= R[1] + 1; }), 'reply days follow MAIL.reply (campus 2–3, far 5–8, other 3–5)');
const again = at(tower, 1, '10:20', 'Mail Tower', [send('To Saffi', 'Saffi'), send('To Lucius', 'Lucius'), send('To Linus', 'Linus'),
  send("To Roy's mother", "Roy's mother"), send('To the bakery', 'Mrs Hale at the bakery'), send('To Mum', 'Mum')]);
ok(JSON.stringify(pend(again)) === JSON.stringify(pend(posted)), 'a swipe rolls the same replies');
ok((posted.$ui.agenda || []).some(x => x.k === 'letter' && /A reply from Saffi may come/.test(x.t)), 'the Planner shows a reply that may come, not whether it will');

console.log('Replies arrive, or silence');
let late = at(posted, 10, '09:00', 'Main Library');
for (const p of pend(posted)) {
  const got = Object.entries(late.Letters).find(([k, l]) => l.From === p.to && /^Reply from/.test(k));
  ok(p.ok ? got && got[1].Status === 'waiting' && /letter of M1 W1 Tue/.test(got[1].Gist) : !got, `${p.to}: ${p.ok ? 'a reply waits at the Mail Tower' : 'no reply, and nothing is said'}`);
}
ok(pend(late).length === 0, 'every reply is settled by the end of its window');
const hinted = pend(posted).filter(p => p.ok).map(p => p.to);
ok(hinted.every(n => late.$ui.mail.hint.some(h => h.includes(`from ${n};`) && /answers \{\{user\}\}'s letter/.test(h))), 'the narrator is told what each reply answers');
if (hinted.length) {
  const txt = renderEntry(CARD, 505, late);
  ok(/To write when \{\{user\}\} reads it: Reply from/.test(txt), '505 lists it while it waits');
  const k = Object.keys(late.Letters).find(x => /^Reply from/.test(x));
  const read = at(late, 10, '10:00', 'Mail Tower', [{ op: 'replace', path: `/Letters/${k}/Status`, value: 'read' }]);
  ok(!read.$ui.mail.hint.some(h => h.startsWith(k + ' ')), 'once read, the hint is gone');
}

console.log('Met in person, posting, one reply per person');
const met = at(posted, 2, '12:00', 'Main Courtyard', [{ op: 'replace', path: '/Scene/Present', value: { Saffi: { Note: 'here' } } }]);
ok(!pend(met).some(p => p.to === 'Saffi') && met._Log.some(x => /Saffi met \{\{user\}\} before writing back/.test(x)), 'a campus friend met before writing back answers in person');
const room = at(S0, 1, '10:20', 'Main Library', [send('To Saffi', 'Saffi')]);
ok(room.$eng.mail.post.includes('To Saffi') && !pend(room).length && room.$ui.mail.post.includes('To Saffi'), 'written elsewhere: it waits to be posted');
const go = at(room, 1, '11:00', 'Mail Tower');
ok(!go.$eng.mail.post.length && pend(go).some(p => p.of === 'To Saffi'), 'at the Mail Tower it is posted');
const twice = at(posted, 1, '10:40', 'Mail Tower', [send('To Saffi again', 'Saffi')]);
ok(pend(twice).filter(p => p.to === 'Saffi').length === 1 && twice._Log.some(x => /one reply will answer both/.test(x)), 'a second letter before the reply: one reply answers both');

console.log('Family writes first');
let hit = null, miss = null;
for (let s = 1; s < 60 && !(hit && miss); s++) {
  const A = at(at(seeded(s), 13, '10:00', 'Main Library'), 14, '09:00', 'Main Library');   // M1 W3 Mon
  if (num(A.$eng.home.first) >= 0) hit = hit || A; else miss = miss || A;
}
function num(x) { return Number.isFinite(+x) ? +x : -1; }
ok(hit && miss && miss.$eng.home.fm === '1-1', 'one draw a month from Monday of week 3 (some months nothing)');
const home = at(hit, 20, '09:00', 'Main Library'), hk = home.$eng.home.key;
ok(hk && home.Letters[hk].Status === 'waiting' && /written unasked/.test(home.Letters[hk].Gist) && home.$eng.home.month === '1-1', 'the letter from home arrives within week 3 and is this month\'s exchange');
const answer = at(at(home, 20, '10:00', 'Mail Tower'), 20, '10:20', 'Mail Tower', [send('To home', 'home')]);
ok(answer._Log.some(x => /already exchanged/.test(x)), "{{user}}'s answer reaches them; the next reply comes from next month's letter");
const wrote = at(at(seeded(1), 3, '10:00', 'Mail Tower'), 3, '10:20', 'Mail Tower', [send('To Mum', 'Mum')]);
ok(at(wrote, 14, '09:00', 'Main Library').$eng.home.first === undefined || at(wrote, 14, '09:00', 'Main Library').$eng.home.first < 0, 'a month {{user}} wrote home: family does not write first');

console.log('A close friend writes first');
// the engine guards Rank and Tension against a patch, so the bond goes into the state before the reply (as a save would hold it)
const withBond = (S, b) => { const X = JSON.parse(JSON.stringify(S)); X.Bonds.Saffi = { ...bond(0), ...b, $mail: -1 }; return X; };
const close = (s, extra = {}, Rank = 4) => at(withBond(at(seeded(s), 1, '09:00', 'Main Library'), { Rank, Last_seen: 'M1 W1 Tue 09:00 at Main Library', ...extra }), 9, '09:00', 'Main Library');
let f = null;
for (let s = 1; s < 80 && !f; s++) { const A = close(s); if (A.$eng.mail.first) f = A; }
ok(f && f.$eng.mail.first.id === 'Saffi', 'a Rank 4 bond not seen for a week may write (one draw a week)');
const fl = at(f, 13, '23:00', 'Main Library'), fk = Object.keys(fl.Letters).find(k => /^Letter from Saffi/.test(k));
ok(fk && fl.$ui.mail.hint.some(h => /written unasked: they have not seen \{\{user\}\} for \d+ days/.test(h)) && fl.Bonds.Saffi.$mail >= 0, 'the letter arrives that week with its reason');
let tense = 0; for (let s = 1; s < 80; s++) if (close(s, { Tension: 60 }).$eng.mail.first) tense++;
ok(tense === 0, 'Tension 50 or more: never writes first');
let low = 0; for (let s = 1; s < 80; s++) if (close(s, {}, 2).$eng.mail.first) low++;
ok(low === 0, 'below Rank 3: never writes first');

console.log('Migration from 1.94.0');
const old = at(S0, 12, '10:00', 'Main Library', [{ op: 'insert', path: '/Letters/To Saffi', value: { From: '{{user}}', To: 'Saffi', Gist: 'hi', Date: 'M1 W2 Thu', Status: 'sent' } },
  { op: 'insert', path: '/Letters/Old one', value: { From: '{{user}}', To: 'Kanae', Gist: 'hi', Date: 'M1 W1 Mon', Status: 'sent' } }]);
old.$eng.ver = '1.94.0'; delete old.$eng.mail;
const mig = at(old, 12, '11:00', 'Main Library'), mlog = mig._Log.filter(x => x.startsWith('[M1 W2 Sat 11:00]'));
ok(mlog.some(x => /"To Saffi" posted to Saffi/.test(x)) && !mlog.some(x => /"Old one" posted/.test(x)), 'a letter sent within the week before is scheduled; an older one is settled');
