// Source helpers for the approved mood / gifts release, injected by gen_engine.py.
const NPC_MOODS = /*@@NPC_MOODS@@*/{};
const GIFT_PREFS = /*@@GIFT_PREFS@@*/{};
const WIND_CASTING = /*@@WIND_CASTING@@*/{};
const NPC_DORMS = /*@@NPC_DORMS@@*/{};
const moodCanon = k => NPC_ALIAS[String(k).toLowerCase()] || k;
const GRX = new Map(), grx = src => GRX.get(src) || GRX.set(src, new RegExp(src, 'i')).get(src);   // 1.16.1 (audit A6): compiled once
const giftNorm = s => String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
const npcBirthday = (id, W) => ((GIFT_PREFS.npcs[id] || {}).birthday || '') === `M${W.Month} W${W.Week} ${W.Day}`;
function giftTier(id, item, fallback) {
  const p = GIFT_PREFS.npcs[id], s = giftNorm(item), order = ['hated', 'loved', 'disliked', 'liked'];
  let tier = '';
  const exact = name => { const n = giftNorm(name); const at = s.indexOf(n); return at >= 0 && !/[a-z0-9]/.test(s[at - 1] || '') && !/[a-z0-9]/.test(s[at + n.length] || ''); };
  const description = s + ' ' + Object.entries(GIFT_PREFS.catalog || {}).filter(([name]) => exact(name)).map(([,tags]) => tags).join(' ');
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
  if (!p || id === 'Ezrel') return { mood: 'Normal', score: 0, reasons: [] };
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
  return { mood: score >= 1 ? 'Good' : score <= -1 ? 'Bad' : 'Normal', score, reasons };
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
  if (!hosts.length || S.Trip.Active) return null;
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
