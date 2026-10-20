// Source helpers for the approved mood / gifts release, injected by gen_engine.py.
const NPC_MOODS = /*@@NPC_MOODS@@*/{};
const GIFT_PREFS = /*@@GIFT_PREFS@@*/{};
const WIND_CASTING = /*@@WIND_CASTING@@*/{};
const NPC_DORMS = /*@@NPC_DORMS@@*/{};
const moodCanon = k => NPC_ALIAS[String(k).toLowerCase()] || k;
const GRX = new Map(), grx = src => GRX.get(src) || GRX.set(src, new RegExp(src, 'i')).get(src);   // 1.16.1 (audit A6): compiled once
const giftNorm = s => String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
const npcBirthday = (id, W) => ((GIFT_PREFS.npcs[id] || {}).birthday || '') === `M${W.Month} W${W.Week} ${W.Day}`;
function giftTier(id, item, fallback, note = '') {
  const p = GIFT_PREFS.npcs[id], s = giftNorm(item), order = ['hated', 'loved', 'disliked', 'liked'];
  let tier = '';
  const exact = name => { const n = giftNorm(name); const at = s.indexOf(n); return at >= 0 && !/[a-z0-9]/.test(s[at - 1] || '') && !/[a-z0-9]/.test(s[at + n.length] || ''); };
  const description = s + ' ' + giftNorm(note) + ' ' + Object.entries(GIFT_PREFS.catalog || {}).filter(([name]) => exact(name)).map(([,tags]) => tags).join(' ');
  if (s && p) tier = order.find(k => (p.items[k] || []).some(exact) || p.patterns[k] && grx(p.patterns[k]).test(description)) || '';
  if (s && !tier) tier = [...order, 'neutral'].find(k => GIFT_PREFS.universal[k] && grx(GIFT_PREFS.universal[k]).test(description)) || '';
  if (!tier) tier = [...order, 'neutral'].includes(giftNorm(fallback)) ? giftNorm(fallback) : 'neutral';
  if (id === 'Ezrel' && tier === 'liked') tier = 'neutral';
  // Etnie's own hated gifts are the only exception to her minimum; universal dislikes do not overrule it.
  if (id === 'Etnie' && !((p.items.hated || []).some(exact) || grx(p.patterns.hated).test(s)) && !['liked', 'loved'].includes(tier)) tier = 'liked';
  return tier;
}
function moodOf(id, S, wx, day) {
  const p = NPC_MOODS[id], W = S.World, hour = Number(W.Time.split(':')[0]), block = hour < 6 || hour >= 18 ? 2 : hour < 12 ? 0 : 1;
  if (!p || id === 'Ezrel') return { mood: 'Normal', score: 0, reasons: [], days: [] };
  let score = 0; const reasons = [], add = (v, why) => { if (v) { score += v; reasons.push(why); } };
  const match = k => {
    if (!wx) return false;
    if (k === 'Clear night') return wx.sky === 'Clear' && block === 2;
    if (k === 'Clear by day ≥15 °C') return wx.sky === 'Clear' && block !== 2 && wx.temp >= 15;
    return [wx.sky, tempLabel(wx.temp), wx.wind, wx.rare, wx.snow ? 'Snow' : ''].some(x => String(x || '').toLowerCase() === k.toLowerCase());
  };
  for (const k of p.loves) if (match(k)) add(1, k.toLowerCase());
  for (const k of p.hates) if (match(k)) add(-1, k.toLowerCase());
  if (p.clock === 'M') { if (block === 0) add(1, 'morning person'); if (hour >= 22 || hour < 6) add(-1, 'late for a morning person'); }
  if (p.clock === 'N') { if (block === 2) add(1, 'night owl'); if (hour < 10) add(-1, 'early for a night owl'); }
  const dayEvents = EVENTS.filter(e => e.m === W.Month && e.w === W.Week && e.d.includes(W.Day));
  const exams = dayEvents.some(e => e.mood === 'exam');
  const trials = dayEvents.some(e => e.mood === 'trial');
  if (exams && STUDENTS[id] && !(S.Campus_State.Graduated || []).includes(id)) add(p.exams, 'Exams');
  const cand = ((S.Campus_State.Council || {}).Candidates || {})[String(W.Year)] || {};
  if (trials || W.Month === 10 && W.Week === 3 && DAYS.indexOf(W.Day) < 6 && Object.values(cand).includes(id)) add(p.trials, 'Trials');
  const status = Object.entries(S.Campus_State.NPC_status || {}).filter(([k]) => moodCanon(k) === id).map(([,v]) => v).join(' ');
  if (/sick|ill\b|injur|wound|griev|grief|bereav|mourning|hurt|head cold/i.test(status)) add(-1, 'unwell or grieving');
  const roll = rand01(S.$eng.seed, day, id, 'mood'); add(roll < 0.1 ? -1 : roll >= 0.9 ? 1 : 0, 'how the day feels');
  const days = specialDays(id, S), fix = (days.find(d => d.fix) || {}).fix || '';
  for (const d of days) if (!d.fix) score += d.lean;
  // a fixed day overrides the weather, so its reasons would only contradict it
  return { mood: fix || (score >= 1 ? 'Good' : score <= -1 ? 'Bad' : 'Normal'), score, reasons: fix ? [] : reasons, days };
}
// 1.72.0 (owner-approved planning/DRAFT_hari_istimewa_npc.md): a character's special days. data/npc_moods.json `days`: `on` a
// birthday (data/gift_prefs.json), a calendar event by the start of its title, or a date ("M8 W3", "M8 W3 Mon"); `before: N` = the
// N days before it; `fix` sets the mood (the first one wins), `lean` moves the score; `tone` is their own word for the day. A
// birthday without a row of its own is lean +1, "glad". Halvard's calendar days do not reach someone away. Then the personal dates
// with {{user}}, a year or more later: a surviving Imprint's date (its Feel and Weight say how), the day they met ($met, from Rank 5
// and below Tension 40) and the day the bond reached Rank 8 ($b8). Those are `personal`: the narrator's and the character's only.
const DAY_ON_RX = /^\[?(?:Y(\d+) )?M(\d{1,2}) W([1-4])(?: (Mon|Tue|Wed|Thu|Fri|Sat|Sun))?/;
const dayOn = (on, W, id) => { if (on === 'birthday') return npcBirthday(id, W);
  const m = DAY_ON_RX.exec(on); if (m) return +m[2] === W.Month && +m[3] === W.Week && (!m[4] || m[4] === W.Day);
  return eventsOn(W).some(e => e.t.startsWith(on)); };
const feelOf = f => (['warm', 'sore', 'bittersweet'].includes(String(f || '').trim().toLowerCase()) ? String(f).trim().toLowerCase() : 'bittersweet');
const remembers = id => `${id} remembers what day it is; whether to say so is up to ${id}, in character.`;
function specialDays(id, S) {
  const W = S.World, out = [], rows = [...((NPC_MOODS[id] || {}).days || [])];
  if ((GIFT_PREFS.npcs[id] || {}).birthday && !rows.some(d => d.on === 'birthday')) rows.push({ on: 'birthday', lean: 1, tone: 'glad', how: 'warmer to anyone who remembers it.' });
  const away = AWAY_RX.test(npcStatusIn(S, id)), noon = toAbs({ ...W, Time: '12:00' });
  for (const d of rows) {
    if (away && d.on !== 'birthday') continue;
    const hit = d.before ? _.range(1, d.before + 1).some(k => dayOn(d.on, fromAbs(noon + k * DAY_MIN), id)) : dayOn(d.on, W, id);
    if (hit) out.push({ label: d.on === 'birthday' ? 'Birthday' : d.before ? `Before ${d.on}` : d.on, fix: d.fix || '', lean: d.lean || 0, tone: d.tone, how: d.how, bd: d.on === 'birthday' });
  }
  const b = (S.Bonds || {})[id];
  if (!b) return out;
  const years = s => { const m = DAY_ON_RX.exec(String(s || '')), y = m && +(m[1] || W.Year);
    return m && m[4] && +m[2] === W.Month && +m[3] === W.Week && m[4] === W.Day && y < W.Year ? W.Year - y : 0; };
  const ago = n => (n > 1 ? `${n} years` : 'A year');
  for (const x of b.Imprints || []) {
    const n = years(x.When); if (!n) continue;
    const feel = feelOf(x.Feel), sign = { warm: 1, sore: -1 }[feel] || 0;
    out.push({ label: `${ago(n)} today: ${x.From || x.Belief}`, fix: sign && num(x.Weight, 5) >= 8 ? (sign > 0 ? 'Good' : 'Bad') : '', lean: sign, tone: feel, how: remembers(id), personal: true });
  }
  const met = num(b.Rank, 0) >= 5 && num(b.Tension, 0) < 40 && years(b.$met);
  if (met) out.push({ label: `${ago(met)} since ${id} met {{user}}`, fix: '', lean: 1, tone: 'fond', how: remembers(id), personal: true });
  const b8 = b.$branch && years(b.$b8), rival = b.$branch === 'rival';
  if (b8) out.push({ label: `${ago(b8)} since the bond became ${rival ? 'a sworn rivalry' : b.$branch === 'romance' ? 'a romance' : 'a best friendship'}`,
    fix: '', lean: rival ? -1 : 1, tone: rival ? 'bitter' : 'fond', how: remembers(id), personal: true });
  return out;
}
function windMultiplier(subtype, custom, wind) {
  if (!wind) return 1;
  const k = Object.keys(custom || {}).find(k => k.toLowerCase() === String(subtype || '').toLowerCase());
  // An old custom subtype without wind deliberately uses the default, even if its name matches the catalogue.
  const cat = k ? custom[k].wind || WIND_CASTING.default : WIND_CASTING.subtypes[subtype] || WIND_CASTING.default;
  return (WIND_CASTING.groups[cat] || WIND_CASTING.groups[WIND_CASTING.default])[wind === 'gale' ? 1 : 0];
}
const blocksWind = (active, techniques) => Object.entries(active || {}).some(([name, e]) => {
  const t = techniques[e.Technique] || {};
  return /barrier|shield|ward/i.test(name + ' ' + e.Technique + ' ' + t.Subtype) && /wind|gust/i.test([e.Note, e.Effect, t.Effect, t.Notes].join(' '));
});
function birthdayParty(S) {
  if (S.Player.Profile.Birthday !== `M${S.World.Month} W${S.World.Week} ${S.World.Day}`) return null;
  const absent = id => (ARRIVES[id] || 1) > S.World.Year || npcAwayIn(S, id);   // 1.16.1 (audit B4): the engine's one rule
  const available = Object.entries(S.Bonds).filter(([id,b]) => b.Tension < BR.birthday.tension_below && !absent(id));
  const hosts = available.filter(([,b]) => b.Rank >= BR.birthday.host_rank).sort((a,b) => b[1].Rank - a[1].Rank || b[1].Trust - a[1].Trust || a[0].localeCompare(b[0]));
  if (!hosts.length || awayIn(S)) return null;   // 1.42.0 (audit 1.2): no party at Halvard while {{user}} is away
  const host = hosts[0][0], guests = available.filter(([id,b]) => STUDENTS[id] && b.Rank >= BR.birthday.guest_rank).map(([id]) => id).sort();
  const all = [...new Set([host, ...guests])], dorm = S.Player.Profile.Dorm;
  const where = dorm !== 'Unsorted' && all.every(id => NPC_DORMS[id] === dorm) ? `${dorm} Dormitory Common Room` : 'The Snug (reserved evening booth)';
  const evs = eventsOn(S.World);
  // 1.11.1 (bug hunt): no party is arranged while the students have gone home (Mid-Year Break, Month 12); the story may still hold one
  if (evs.some(e => e.lockdown || e.home)) return null;
  const endHour = evs.some(e => e.home || e.nocurfew && S.World.Day === e.d[0]) ? 24 : evs.map(e => curfewHour(e, S.World.Day)).find(Boolean) || 20;
  return { host, guests, where, from: '18:00', endHour, until: pad(endHour) + ':00' };
}
// Count overlap arithmetically so even long time skips stay bounded, and short updates accumulate complete hours.
const nightMinutes = abs => { const d = Math.floor(abs / 1440), t = abs - d * 1440; return d * 360 + Math.min(360, Math.max(0,t)); };
function updateSleep(S, B, from, to, TU, log) {
  const E = S.$eng, prior = B && B.$eng || E, mode = S.$ui.wxfx;
  E.late = Math.max(0, num(prior.late));
  E.sleep = { awake: 0, run: 0, paid: false, vigilUntil: -1, crash: 0, lastNight: -1, ...(prior.sleep || {}) };
  const r = E.sleep, resting = S.Player.Vitals.Resting === 'sleep', elapsed = Math.max(0,to-from), oldUntil = r.vigilUntil;
  if (mode === 'off') { S.$ui.sleep = null; r.run = 0; r.paid = false; return; }
  const consumed = (S.Consumables || []).filter(x => /^the vigil$/i.test(String(x).trim())).length;
  if (consumed && mode === 'full') { r.vigilUntil = Math.max(to, r.vigilUntil) + 48 * 60; log.push('The Vigil: 48 hours without sleep debt; two full nights will be owed afterwards.'); }
  const expired = r.vigilUntil >= 0 && to >= r.vigilUntil;
  if (expired) { r.crash = 2; r.vigilUntil = -1; r.run = 0; r.paid = false; log.push('The Vigil has worn off: stamina capped at 60% until two full nights of sleep.'); }
  if (elapsed > 0 && resting) {
    r.run += expired ? Math.max(0, to - Math.max(from, oldUntil)) : elapsed;
    if (r.run >= TU.sleep_full * 60 && !r.paid) {
      E.late = 0; r.awake = 0; r.paid = true;
      const night = Math.floor((to - 6 * 60) / 1440);
      if (r.crash && night !== r.lastNight && nightMinutes(to) - nightMinutes(to - r.run) > 0) { r.crash--; r.lastNight = night; }
    }
  } else if (elapsed > 0) {
    r.run = 0; r.paid = false;
    r.awake += Math.max(0, nightMinutes(to) - nightMinutes(Math.min(to, Math.max(from, oldUntil))));
    E.late += Math.floor(r.awake / 60); r.awake %= 60;
  }
  const loss = r.vigilUntil > to ? 0 : r.crash ? TU.sleep_cap : Math.min(TU.sleep_cap, E.late * TU.sleep_hour);
  S.$ui.sleep = { late: E.late, loss, vigil: r.vigilUntil > to, nights: r.crash, flavor: mode === 'flavor' };
  if (mode === 'full' && loss > 0) S.Player.Vitals.Stamina = Math.min(S.Player.Vitals.Stamina, S.Player.Vitals.Stamina_max * (1-loss));
}
