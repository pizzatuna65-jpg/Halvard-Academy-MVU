// Eldrasil / Halvard — game engine (Batch 2.3; 3.2: read-only guard, hybrid trigger cost, per-turn toasts). Runs after every MVU update; deterministic and replay-safe:
// everything is computed from (state before, state after) only. Internals live in stat_data.$eng (hidden from the AI).
const NPC_ALIAS = /*@@NPC_ALIAS@@*/{};
const NPC_IDS = new Set(Object.values(NPC_ALIAS));
// proper-case name forms (first name, full name, nickname) matched case-sensitively in story prose
const NAME_FORMS = /*@@NAME_FORMS@@*/{};
const NAME_RX = Object.entries(NAME_FORMS).map(([id, forms]) => [id, new RegExp('(^|[^A-Za-z])(' + forms.map(f => f.replace(/[.*+?^()|[\]\\]/g, '\\$&')).join('|') + ')(?![A-Za-z])')]);
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// 1.5.1 (P6): who spoke in a reply. A name counts as a speaker when it opens the sentence that leads into a quote
// ("Irene looked up. "Curfew.") or directly follows a closing quote ("Curfew," Irene said / "…," said Irene). Names inside quotes
// are people being talked to or about. MENTION_DENY: first names that are also ordinary words; at a sentence start they are no mention.
const CAST_FULL = 4;
const KNOWS_VISIBLE = 15, IMPRINT_MAX = 5, DEFINING_MAX = 5, NEXT_RANK = 3, MEANWHILE_RANK = 7;   // 1.6.0 (Batch C)
const CHANGE = /*@@CHANGE@@*/{};   // 1.6.0 (N2): fixed | shaped | fluid per NPC (data/npc_canon.json; empty until the canon waves)
// 1.6.8 (owner): which Rank 8 branches each NPC allows (data/npc_canon.json branch): A all, B best friend or rival, C best friend
// or romance, D best friend only. An NPC with no entry (a new one) allows all three until its canon says otherwise.
const BRANCH = /*@@BRANCH@@*/{};
const canRomance = id => 'AC'.includes(BRANCH[id] || 'A'), canRival = id => 'AB'.includes(BRANCH[id] || 'A');
const MENTION_DENY = new Set(/*@@MENTION_DENY@@*/[]);
const EXTRAS_MAX = 20, EXTRAS_ARCHIVE = 40, STALE_DAYS = 7;   // 1.6.1 (Batch D): invented characters kept; campus events without news
const PHASES = /*@@PHASES@@*/[];   // 1.6.1 (N6): campus phases (data/campus_phases.json; empty until the canon waves)
const QUOTE_RX = /["“][^"”]*["”]/g;
function formRx(id) { return new RegExp('(^|[^A-Za-z])(' + NAME_FORMS[id].map(f => f.replace(/[.*+?^()|[\]\\]/g, '\\$&')).join('|') + ')(?![A-Za-z])', 'g'); }
function speakersIn(prose) {
  const out = [];
  for (const para of String(prose).split(/\n+/)) {
    if (!/["“”]/.test(para)) continue;
    const qs = [...para.matchAll(QUOTE_RX)].map(m => [m.index, m.index + m[0].length]);
    if (!qs.length) continue;
    const inQuote = i => qs.some(([a, b]) => i >= a && i < b);
    for (const id of Object.keys(NAME_FORMS)) {
      for (const m of para.matchAll(formRx(id))) {
        const at = m.index + m[1].length, end = at + m[2].length;
        if (inQuote(at)) continue;
        const after = qs.find(([a]) => a >= end), before = [...qs].reverse().find(([, b]) => b <= at);
        const lead = para.slice(0, at), sentStart = /(^|[.!?]["”]?\s+)$/.test(lead) || !lead.trim();
        const opens = sentStart && after && !/[.!?]\s+\S/.test(para.slice(end, after[0]).replace(/\b(Mr|Mrs|Ms|Dr|St)\.\s/g, '')) && after[0] - end < 160;
        const tags = before && /^\s*[,;:]?\s*([a-z]+\s+){0,2}$/.test(para.slice(before[1], at)) && at - before[1] < 30;
        if ((opens || tags) && !out.includes(id)) out.push(id);
      }
    }
  }
  return out;
}
function mentionIn(prose, id, rx) {
  if (!MENTION_DENY.has(id)) return rx.test(prose);
  return [...String(prose).matchAll(formRx(id))].some(m => m[2] !== id || !/(^|[.!?]["”]?\s+)$/.test(prose.slice(0, m.index + m[1].length)));
}
const DAY_MIN = 1440, YEAR_DAYS = 12 * 4 * 7;
const ALL = DAYS, MON_THU = DAYS.slice(0, 4), MON_FRI = DAYS.slice(0, 5), MON_SAT = DAYS.slice(0, 6);
// 1.3.1 (owner playtest): every event carries its day plan `s` (from its lore entry; one text, or one per day), shown in the
// calendar and with _Event_today. `curfew` is one hour for all its days or one per day.
const DORM_DAY = "09:00–18:00 open house: the common room shows the dorm's history and the founding warden is honoured with a small rite at the entrance; upperclassmen showcase casting in the courtyard, first-years run booths, a public lesson for outsiders, food stalls, type contests open to all and the dorm tournament; 19:00 dorm-only closing dinner, first-years welcomed with a token of belonging";
const MIDTERM = { Mon: '08:00 Magic Theory, 10:00 Etiquette (written papers); afternoon free', Tue: '08:00 History (written); 13:00–16:00 Potion Crafting practical (one brew from a sealed brief)',
  Wed: '08:00–16:00 Dark Magic Defense practicals, one student at a time against the teacher (marked on how long they hold)', Thu: '08:00–16:00 Combat practicals, students paired within their year, marked by combat role' };
const FINALS = '08:00–18:00 the single practical trial, one student at a time: theory door, beast, potion, cursed room, examiner in role, duel with a staff member; Royal Inspectorate examiners watch from the gallery';
const BOOTHS = 'Classes as usual; 16:00–18:00 club booths across the academy';
const EVENTS = [
  { m: 1, w: 1, d: ['Mon'], t: 'Entrance Event (Arbiter Stone sorting)', noclass: 1,
    s: '07:00–09:00 arrivals at Reception and Gatehouse; 09:00 sorting at the Arbiter Stone in the Arbiter Hall; 10:00–18:00 campus tour all day (three other newcomers and one senior per group) while club booths stand across the academy (sign-up open until Friday 18:00); late afternoon: seniors show the new students their dorm rooms; 19:00 Entrance Feast in the Ring Dining Hall, the Headmaster and Vice Headmaster speak before dinner' },
  { m: 1, w: 1, d: ['Tue', 'Wed', 'Thu', 'Fri'], t: 'Club sign-up week (club booths after classes)',
    s: { Tue: BOOTHS, Wed: BOOTHS, Thu: BOOTHS, Fri: BOOTHS + '; last day: club registration closes at 18:00' } },
  { m: 1, w: 3, d: ['Sat', 'Sun'], t: 'Star Night (Sat evening to Sun dawn; no 8pm curfew)', nocurfew: 1,
    s: { Sat: 'Sunset to sunrise, no 8pm curfew; 20:00–00:00 night market near the Grassy Field and Hills (students and mall vendors); stargazing on the hills, tents and bedrolls; midnight: the great meteor shower (a wish made during it is believed to come true)', Sun: 'Until dawn: students sleep out on the Grassy Field and Hills; the curfew is back from dawn' } },
  { m: 1, w: 4, d: ['Sat'], t: 'Spiritual Dorm Day', s: 'Viridian Dormitory: ' + DORM_DAY },
  { m: 2, w: 1, d: ['Fri', 'Sat'], t: 'Warding Rite (Fri dusk to Sat dawn; the whole academy renews the wards)',
    s: { Fri: 'Classes as usual while staff build a giant magic circle in the Main Courtyard all day; dusk (about 17:00): the Bell Tower rings a special pattern and every student gathers in the courtyard; speeches from the Headmaster, the Vice Headmaster and the Warden; the Dorm Heads lead each dorm through the shared working; then a feast in the Ring Dining Hall', Sat: 'Until dawn: the feast runs late after the working' } },
  { m: 2, w: 3, d: ['Wed', 'Thu', 'Fri'], t: 'Creature Studies Expedition (off-grounds, Grade III country)', noclass: 1, away: 1,
    s: { Wed: '07:00 airships leave, one per year level (half a day to the Grand Vast Forest); afternoon: make camp (tents, cookfires, watch rotations) and prepare gear', Thu: 'Morning: each group of four is assigned a beast to bring back within 24 hours (Years 1–2 Grade III, Year 3 Grade II); staff shadow at a distance and pull out groups in trouble', Fri: 'Morning: break camp and fly home, back on campus by evening; catches count dead or alive' } },
  { m: 3, w: 1, d: MON_THU, t: 'Midterm exams', noclass: 1, s: MIDTERM },
  { m: 3, w: 2, d: ['Fri', 'Sat'], t: 'Club Festival',
    s: { Fri: 'Classes in the morning; 13:00–18:00 every club runs a stand in the Main Courtyard: demonstrations, exhibition matches, sales, food', Sat: '09:00–18:00 stands and exhibition matches all day; everyone drops one gold coin at the best stand (never their own club); the winner is announced at the close, 18:00' } },
  { m: 3, w: 3, d: MON_SAT, t: 'Training Week (cross-dorm sparring allowed; curfew 21:00)', curfew: 21,
    s: 'Classes as usual; from 16:00 the Combat Grounds, duelling rings and practice halls stay open and supervised into the evening; sparring across years and dorms; curfew 21:00' },
  { m: 3, w: 4, d: ['Sat', 'Sun'], t: 'Dorm Competition (solo, top 16 qualify)', noclass: 1,
    s: { Sat: '09:00–18:00 solo ranking bouts inside each dorm, open to the whole dorm', Sun: '09:00–18:00 the ranking bouts finish; every entrant gets a placement and the top 16 of each dorm qualify for the Academy Competition' } },
  { m: 4, w: 1, d: ['Wed'], t: 'Secret Fools Day (prank day, dorm name-draw)',
    s: "Morning: participants draw a dorm-mate's name in secret, then prank them without warning all day; classes still run; Merryhew's biggest sale of the year" },
  { m: 4, w: 2, d: ['Tue'], t: 'Independence Crowning Day (airship trip to the capital; fireworks on campus at night; curfew 22:00)', noclass: 1, curfew: 22, away: 1,
    s: "07:00 the whole academy flies to the capital; morning: parade and the King's speech; free time in groups of four (coin only) until the afternoon muster; back before dark, passenger lists counted twice; night: fireworks over the Grassy Field and Hills; curfew 22:00" },
  { m: 4, w: 3, d: ['Sat'], t: 'Mystic Dorm Day', s: 'Light Dormitory: ' + DORM_DAY },
  { m: 5, w: 1, d: MON_THU, t: 'End of Semester exams', noclass: 1, s: FINALS },
  { m: 5, w: 2, d: ['Fri'], t: 'Results & Dorm Ranking (Player.Profile.Dorm_rank is updated today)', ranking: 1,
    s: '09:00 assembly in the Arbiter Hall: trial results stage by stage, then the new dorm ranking read aloud last; 19:00 feast in the Ring Dining Hall' },
  { m: 5, w: 4, d: ALL, t: 'Mid-Year Break (students go home)', home: 1,
    s: { Mon: 'Morning: airships leave; staying is allowed (the canteen runs short hours, half the mall is closed)', Sun: 'Airships bring the students back during the day' } },
  { m: 6, w: 1, d: MON_FRI, t: 'Return Week' },
  { m: 6, w: 3, d: ['Sat'], t: 'Sports Day (magic banned outright)', s: "09:00–18:00 events, no magic: running and team events on the Sports Field, crowd contests in the Main Courtyard, the rest at the lake and the Combat Grounds; medals tallied by dorm at the day's end" },
  { m: 6, w: 4, d: ['Wed', 'Thu', 'Fri', 'Sat'], t: 'Academy Competition (cross-dorm teams of 4)', s: '09:00–18:00 knockout matches between the cross-dorm teams of four; the winning team represents the academy' },
  { m: 7, w: 2, d: ALL, t: 'Magical & Science Fair week',
    s: { Mon: 'Stands are built in the Main Courtyard through the week; classes as usual', Tue: 'Stands are built in the Main Courtyard; classes as usual', Wed: 'Stands are built in the Main Courtyard; classes as usual', Thu: 'Last day of building; classes as usual',
      Fri: 'Classes in the morning; 13:00–18:00 set-up and viewing in the Main Courtyard', Sat: '09:00–18:00 judging: a staff panel questions and scores every stand' } },
  { m: 7, w: 3, d: ALL, t: 'The Thinning: the seal is at its weakest; academy locked down all week', lockdown: 1, s: 'All week: absolute curfew, academy locked, nobody outside' },
  { m: 8, w: 2, d: ['Thu', 'Fri', 'Sat', 'Sun'], t: 'Traveling Circus visits (Thu evening to Sun)', curfew: 22,
    s: { Thu: 'Evening: the great tent opens in the Main Courtyard; stands, games, sideshows and fortune tellers across the grounds (stalls take points); curfew 22:00', Fri: 'Classes in the morning; shows several times a day from the afternoon; curfew 22:00', Sat: 'Classes in the morning; shows several times a day from the afternoon; curfew 22:00', Sun: 'Shows all day, the last one in the evening; curfew 22:00' } },
  { m: 8, w: 3, d: ['Thu', 'Fri', 'Sat'], t: 'Academy Showcase',
    s: { Thu: '09:00–18:00 acts on the Main Courtyard stage; parents and guardians visit (logged at the Gatehouse)', Fri: '09:00–18:00 acts on the Main Courtyard stage; families visit', Sat: '09:00–18:00 the last acts; scores tallied by dorm in the evening to name the most talented dorm' } },
  { m: 8, w: 4, d: ['Sat'], t: 'Elemental Dorm Day', s: 'Fire Dormitory: ' + DORM_DAY },
  { m: 9, w: 1, d: MON_THU, t: 'Midterm exams', noclass: 1, s: MIDTERM },
  { m: 9, w: 2, d: ['Thu', 'Fri', 'Sat'], t: 'Academy Bazaar', s: '09:00–18:00 invited traders fill the Main Courtyard (stalls take points, haggling expected); traders logged at the Gatehouse, the Doves watch the stock and the crowd' },
  { m: 9, w: 3, d: ['Sat'], t: 'Academy Founder Day', s: "09:00 speeches from the Headmaster and Vice Headmaster in the Arbiter Hall, then a short rite at the Founder's Statue; all day: the optional treasure hunt across the campus; 19:00 feast in the Ring Dining Hall" },
  { m: 9, w: 4, d: ['Thu', 'Fri', 'Sat', 'Sun'], t: 'Kingdom Competition (four academies, one team each)', s: "09:00–18:00 knockout matches between the four academies' teams; each member of the winning team earns 5,000 points" },
  { m: 10, w: 1, d: ['Tue'], t: 'Remembrance Day', s: 'All day: nothing loud (no clubs, duelling, music, games or sport); classes run quietly, the Bell Tower keeps a slow pattern, bouquets line the halls; evening (about 19:00): lantern release on the Grassy Field and Hills, one lantern each' },
  { m: 10, w: 2, d: ['Sat'], t: 'Occult Dorm Day', s: 'Sky Dormitory: ' + DORM_DAY },
  { m: 10, w: 4, d: ['Fri', 'Sat', 'Sun'], t: 'Harvest Festival (Fri evening to Sun)', curfew: { Fri: 23, Sat: 23 },
    s: { Fri: 'Classes as usual; from 17:00 cafés, food stalls, game booths, haunted houses and stage acts, costumes and carved lanterns; families visit (logged at the Gatehouse); curfew 23:00', Sat: '09:00 until late: the festival all day; curfew 23:00', Sun: 'The festival all day; evening: fireworks over the lake, watched from the Grassy Field and Hills; the usual curfew' } },
  { m: 11, w: 1, d: MON_THU, t: 'End of Semester exams', noclass: 1, s: FINALS },
  { m: 11, w: 2, d: ['Fri'], t: 'Results & Final Ranking (Player.Profile.Dorm_rank is updated today)', ranking: 1,
    s: '09:00 assembly in the Arbiter Hall: trial results stage by stage, then the final dorm ranking read aloud last; 19:00 feast in the Ring Dining Hall' },
  { m: 11, w: 3, d: ['Mon', 'Tue', 'Wed'], t: 'Academy Trip (Sunreach Bay, abroad)', noclass: 1, away: 1,
    s: { Mon: '07:00 airships leave (half a day to Sunreach Bay); beachfront hotels, four to a room; free time in groups of four; the teachers set a curfew', Tue: "Free time in groups of four (the day side only; the night side is out of bounds); the teachers' curfew", Wed: 'Morning free; afternoon: fly home, back by evening' } },
  { m: 11, w: 4, d: ['Wed', 'Thu', 'Fri', 'Sat'], t: 'World Competition abroad (the national four)', away: 1, s: 'Abroad: the national four compete; the rest of the academy follows the news' },
  { m: 11, w: 4, d: ['Sun'], t: 'Graduation (everyone attends; third-years leave by airship next morning)', noclass: 1, grad: 1,
    s: '09:00 ceremony in the Arbiter Hall: the Headmaster speaks, the Dorm Heads read out their graduates, each touches the Arbiter Stone a last time; afternoon: recruitment tables (noble houses, the Royal Inspectorate, the Dovecote, the Bank, hunting companies, guilds); 19:00 farewell feast' },
  { m: 12, w: 1, d: ALL, t: 'Kingdom-wide holiday: students go home', home: 1 },
  { m: 12, w: 2, d: ALL, t: 'Kingdom-wide holiday: students go home', home: 1 },
  { m: 12, w: 3, d: ALL, t: 'Kingdom-wide holiday: students go home', home: 1 },
  { m: 12, w: 4, d: ALL, t: 'Kingdom-wide holiday: students go home', home: 1 },
];
const schedOf = (e, day) => (!e.s ? '' : typeof e.s === 'string' ? e.s : e.s[day] || '');
const curfewHour = (e, day) => (e.curfew && typeof e.curfew === 'object' ? e.curfew[day] : e.curfew);
const TIMETABLE = {
  Mon: ['Magic Theory [M]', 'History [M]', 'Combat [D] (Combat Grounds)'],
  Tue: ['Dark Magic Defense [D]', 'Magic Theory [D]', 'Potion Crafting [M] (Potion Halls)'],
  Wed: ['Etiquette [M]', 'Dark Magic Defense [M]', 'Creature Studies [M] (Menagerie or Forest)'],
  Thu: ['History [M]', 'Magic Theory [D]', 'Combat [D] (Combat Grounds)'],
  Fri: ['Magic Theory [M]', 'Etiquette [M]', 'Dark Magic Defense practical [D] (Doves; Combat Grounds or warded seminar room)'],
  Sat: ['Etiquette [M]', 'Study Hall (unsupervised, Main Library)', 'Clubs (club venues)'],
};
// monthly payout by dorm rank (lore: 300 bottom band ... 3,000 for rank 1). Bands between are tunable.
const PAYOUT = [[1, 3000], [3, 2000], [10, 1200], [25, 800], [50, 500], [Infinity, 300]];
const DAILY_BOND_CAP = 3;   // before 1.2.2 only (Progress); the XP system reads data/bond_rules.json
// 1.2.2 bond system (owner design): XP per kind of interaction with daily/weekly limits, rising XP per rank scaled by the pace
// setting, a cooldown after each rank, a bond event to rank up (scripted in data/bond_events.json, else the rank's default theme).
const BR = /*@@BOND_RULES@@*/{};
const BEV = /*@@BOND_EVENTS@@*/[];
const START = BR.start || {};   // 1.3.1: bonds that begin above Rank 0 (data/bond_rules.json start)
const HAUNT = /*@@HAUNTS@@*/{};
// 1.3.0 (owner brainstorm 2026-09-25): bond rewards (Rank 5 gift, Rank 10 benefit, mask -> truth, Krieg), reputation, training.
// Single sources data/bond_rewards.json, reputation.json, training.json; NPC_GROUP: staff | student | other | rival (no bond system).
const REW = /*@@BOND_REWARDS@@*/{};
const REP = /*@@REPUTATION@@*/{};
const TRN = /*@@TRAINING@@*/{};
const NPC_GROUP = /*@@NPC_GROUP@@*/{};
// 1.3.1 (owner playtest): player settings for training and reputation (data/tuning.json rows; values in $ui.tune, else the default)
const TUNING = /*@@TUNING@@*/[];
function tuneOf(S) {
  const u = _.isPlainObject((S.$ui || {}).tune) ? S.$ui.tune : {}, o = {};
  for (const r of TUNING) { const v = Number(u[r.id]); o[r.id] = r.opts.some(([x]) => x === v) ? v : r.def; }
  return o;
}
const NO_BOND = new Set(Object.keys(NPC_GROUP).filter(id => NPC_GROUP[id] === 'rival'));
const MASK = new Set(REW.mask || []);
// 1.3.8 Tension (owner design 2026-09-25, data/tension.json): the same bands and mechanical effects for everyone; how the tension
// is played comes from the NPC's category (withdrawn, social, confrontational, authority, dangerous) or a personal override
// (Etnie, Kanae, Althair, Ezrel). Quiet days ease it by the category's decay; a fight eases a confrontational NPC.
const TEN = /*@@TENSION@@*/{};
const TE = TEN.effects || {};
function tensionProfile(id) {
  const o = (TEN.overrides || {})[id];
  if (o) return { ...o, cat: 'override', decay: num(o.decay, 0), riseMult: o.rise_mult || 1 };
  const c = (TEN.npcs || {})[id], C = (TEN.categories || {})[c];
  return C ? { ...C, cat: c, riseMult: 1 } : { cat: '', decay: 0, riseMult: 1 };
}
const tensionBand = t => (TEN.bands || [[0, '']]).reduce((a, [from, nm]) => (t >= from ? nm : a), '');
// 1.4.3 Trust (owner design 2026-09-25, data/trust.json): how sure an NPC is that {{user}} can be relied on. The same bands and
// effects for everyone (what they share, the perks and bond events that need it, XP, how Tension and apologies land); the category
// (the NPC's openness) sets the start, how fast it rises and falls and whether it recovers; personal overrides (Etnie, Kanae,
// Althair, Ezrel, Caine, Krieg), and a Dorm Head is easier on their own students (Ottavio and Sky).
const TRU = /*@@TRUST@@*/{};
const TRE = TRU.effects || {};
const trustBand = x => (TRU.bands || [[0, '']]).reduce((a, [from, nm]) => (x >= from ? nm : a), '');
function trustProfile(id, S, secretOut) {
  const dh = (TRU.dorm_head || {})[id], mine = !!(dh && S && S.Player && S.Player.Profile && S.Player.Profile.Dorm === dh.dorm);
  const cat = mine ? dh.category : (TRU.npcs || {})[id] || 'normal', C = (TRU.categories || {})[cat] || {};
  let o = (TRU.overrides || {})[id] || {};
  if (o.until_secret && secretOut && secretOut(id)) o = {};             // Kanae's Plan / Caine's secret is out: a plain category again
  return { cat, C, o, dh: mine ? dh : null, start: C.start != null ? C.start : 50, rise: num(o.rise, 1) * num(C.rise, 1), drop: num(o.drop, 1) * num(C.drop, 1), recover: num(C.recover, 0) };
}
const trustGate = (id, rank) => (((TRU.overrides || {})[id] || {}).no_gates ? 0 : num((TRU.perk_gates || {})[String(rank)], 0));
const repLevel = x => (x >= 0 ? 1 : -1) * (REP.thresholds || []).filter(t => Math.abs(x) >= t).length;
const repFloor = L => (L === 0 ? 0 : Math.sign(L) * REP.thresholds[Math.abs(L) - 1]);   // the Rep XP at which level L begins
const repBand = (r, L) => ((((REP.effects || {})[r]) || []).find(([a, c]) => L >= a && L <= c) || [0, 0, ''])[2];
const repOfNpc = id => (NPC_GROUP[id] === 'staff' ? 'Academy' : NPC_GROUP[id] === 'student' ? 'Student' : (REP.doves_bond || []).includes(id) ? 'Doves' : '');
const r2 = x => Math.round(x * 100) / 100;   // first line of each NPC's Haunts: where a bond event is likely when no scripted event says
const paceOf = S => ((BR.pace || {})[(S.$ui || {}).bondpace] || 1);
const needXP = (r, m) => (r >= 10 ? 0 : Math.max(3, Math.round(BR.xp_base[r] * m)));
const coolDays = (r, m) => Math.round((BR.cool_base[Math.min(r, 9)] || 0) * m);
const hm = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || '').trim()); return m ? +m[1] * 60 + +m[2] : null; };
const normP = x => String(x || '').split(/\s+[—-]\s+/)[0].trim().toLowerCase().replace(/^the\s+/, '');
// a scripted event's conditions (tools/import_bond_events.py): where, time window, days, skies it must not have, prerequisites
function bondEventOk(e, S) {
  const W = S.World, P = S.Player.Profile, now = hm(W.Time);
  if (e.where && e.where.length && !e.where.some(w => normP(w) === normP(W.Location))) return false;
  if (e.time && now != null) { const a = hm(e.time[0]), b = hm(e.time[1]); if (a != null && b != null && !(a <= b ? now >= a && now <= b : now >= a || now <= b)) return false; }
  if (e.days && e.days.length && !e.days.includes(W.Day)) return false;
  const sky = ((S.$ui.wx || {}).now || {}).sky;
  if (e.not_sky && e.not_sky.length && sky && e.not_sky.some(x => x.toLowerCase() === String(sky).toLowerCase())) return false;
  const R = e.requires || {};
  if (R.club && !String(P.Club || '').toLowerCase().includes(String(R.club).toLowerCase())) return false;
  if (R.dorm && P.Dorm !== R.dorm) return false;
  if (R.month_from && (W.Month < R.month_from)) return false;
  if (R.year_from && (W.Year < R.year_from)) return false;
  return true;
}
// Batch 5.1: castle places (the Notice Board is in the Floor 1 entrance hall that every student crosses) and module caps
const CASTLE = new Set(/*@@CASTLE@@*/[]);
// v1.0.3 (F01): every campus place name (lowercase, with and without a leading "the"); anything else is off the grounds
const CAMPUS = /*@@CAMPUS@@*/[];
const placeOf = loc => String(loc || '').split(/\s+[—-]\s+/)[0].trim();
// 1.3.1 (owner playtest: walking to "Boathouse" did not register on the map; "Boathouse and Lake — Fishing House" registered the
// boathouse). World.Location is put in the Campus Map's words: a short name ("Boathouse", "the library") becomes the map name, and a
// sub-spot that is itself a place ("… — Fishing House") becomes the place. A dorm room every dorm shares stays under its dorm.
const PLACE_NAMES = /*@@PLACE_NAMES@@*/{};     // every way a place's own name is written (lowercase) -> map name
const PLACE_ALIAS = /*@@PLACE_ALIAS@@*/{};     // short and partial names (tools/common.py place_aliases) -> map name
const PLACE_SHARED = new Set(/*@@PLACE_SHARED@@*/[]);
const plKey = s => String(s || '').trim().toLowerCase().replace(/[.!]+$/, '').replace(/\s+/g, ' ');
const plName = s => { const k = plKey(s); return PLACE_NAMES[k] || PLACE_NAMES[k.replace(/^the /, '')] || ''; };
function canonLocation(loc) {
  const segs = String(loc || '').split(/\s+[—–-]\s+|,\s+/).map(x => x.trim()).filter(Boolean);
  if (!segs.length) return String(loc || '');
  let at = -1, nm = '';
  for (let i = segs.length - 1; i >= 0 && at < 0; i--) { const n = plName(segs[i]); if (n && (i === 0 || !PLACE_SHARED.has(n))) { at = i; nm = n; } }
  if (at < 0) { nm = PLACE_ALIAS[plKey(segs[0])] || PLACE_ALIAS[plKey(segs[0]).replace(/^the /, '')] || ''; if (nm) at = 0; }
  if (at < 0) return String(loc);
  return at === 0 && segs[0] === nm ? String(loc) : [nm, ...segs.slice(at + 1)].join(' — ');
}
const onCampus = loc => { const p = placeOf(loc).toLowerCase(); return !p || CAMPUS.some(c => p === c || p.startsWith(c + ' ') || p.startsWith(c + ',')); };
const CAP = { Notices: 10, Letters: 12, Clues: 40, Journal: 30 };
// Batch 5.2: trips (first day, for the unlock window) and the Kingdom prize (lore Competitions: 5,000 points per winning member)
const TRIPS = [{ m: 4, w: 2, d: 'Tue', name: 'the capital (Crowning Day)' }, { m: 11, w: 3, d: 'Mon', name: 'Sunreach Bay (Academy Trip)' }];
const KINGDOM_PRIZE = 5000;
// v1.0.3: Halvard students {id: [lorebook Year, campaign year they arrive]}, injected by gen_engine. Graduation (M11 W4 Sun) sends
// the year's third-years away the next morning (M12 W1 Mon); they go to Campus_State.Graduated (the story may take a name back out).
// ARRIVES: incoming cohorts (data/cohorts.json) -> campaign year they arrive as first-years; before that they are not at Halvard.
const STUDENTS = /*@@STUDENTS@@*/{};
const ARRIVES = /*@@ARRIVES@@*/{};
const yearOf = (id, Y) => (STUDENTS[id] ? STUDENTS[id][0] + Y - STUDENTS[id][1] : 0);   // their school year in campaign year Y
// Batch 5.3 (F20): seeded campus happenings. Pool from data/happenings.json (injected by tools/gen_engine.py).
// Plan 4.6: never Math.random(). The chat seed is taken once from the creation time of the message whose update first ran the
// engine and then stored in $eng.seed, so every later roll is a pure function of (seed, day): swipes and replays see the same day.
const HAPPENINGS = /*@@HAPPENINGS@@*/[];
const HAPPEN_RATE = { off: 0, rare: 0.2, normal: 0.4, often: 0.65 };
const hash32 = (...parts) => {
  let h = 2166136261;
  for (const ch of parts.join('|')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
  return h >>> 0;
};
const rand01 = (...parts) => hash32(...parts) / 4294967296;
const JOURNAL_ARCHIVE = 300;
const FACTS_VISIBLE = 10;      // 5.4 token budget: the narrator reads each bond's latest 10 Known_facts; older ones go to $Known_old   // $ui.archive: journal lines the narrator no longer reads (UI only)

// ---------- helpers ----------
const pad = x => String(x).padStart(2, '0');
const toAbs = W => {
  const [h, mi] = String(W.Time || '08:00').split(':').map(Number);
  const di = Math.max(0, DAYS.indexOf(W.Day));
  const day = (((W.Year || 1) - 1) * YEAR_DAYS) + ((W.Month - 1) * 28) + ((W.Week - 1) * 7) + di;
  return day * DAY_MIN + (h || 0) * 60 + (mi || 0);
};
const fromAbs = abs => {
  let day = Math.floor(abs / DAY_MIN), min = abs - day * DAY_MIN;
  const Year = Math.floor(day / YEAR_DAYS) + 1; day -= (Year - 1) * YEAR_DAYS;
  const Month = Math.floor(day / 28) + 1; day -= (Month - 1) * 28;
  const Week = Math.floor(day / 7) + 1; day -= (Week - 1) * 7;
  return { Year, Month, Week, Day: DAYS[day], Time: `${pad(Math.floor(min / 60))}:${pad(min % 60)}` };
};
const stamp = W => `M${W.Month} W${W.Week} ${W.Day} ${W.Time}`;
const eventsOn = W => EVENTS.filter(e => e.m === W.Month && e.w === W.Week && e.d.includes(W.Day));
const pctOf = (v, max) => (max > 0 ? (v / max) * 100 : 0);
const num = (v, d = 0) => { const x = Number(v); return Number.isFinite(x) ? x : d; };
const dstamp = W => `M${W.Month} W${W.Week} ${W.Day}`;
// Parses a due/until text written by the AI ("M2 W1 Tue 14:00", "Month 3 Week 2", "Fri 18:00", "tomorrow 9am", "M4") into an
// absolute minute, relative to the current world time W. Missing parts: day -> Sunday of that week (or the next such weekday),
// week -> week 4 when only a month is given, time -> 23:59. Returns -1 when nothing date-like is found.
function parseWhen(str, W, absNow) {
  const s = String(str || '');
  const m = s.match(/\b(?:M|Month\s*)(\d{1,2})\b/i), w = s.match(/\b(?:W|Week\s*)([1-4])\b/i);
  const d = s.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:s|[a-z]*day)?\b/i);   // not \"Month\"
  const t = s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) || s.match(/\b(\d{1,2}):(\d{2})\b/);
  const rel = s.match(/\b(today|tonight|tomorrow)\b/i);
  if (!m && !w && !d && !t && !rel) return -1;
  let hh = 23, mm = 59;
  if (t) { hh = +t[1] % 24; mm = +(t[2] || 0); if (t[3]) { hh = hh % 12 + (/pm/i.test(t[3]) ? 12 : 0); } }
  else if (rel && /tonight/i.test(rel[1])) { hh = 21; mm = 0; }
  const dayStart = Math.floor(absNow / DAY_MIN) * DAY_MIN;
  if (rel && !m && !w && !d) return dayStart + (/tomorrow/i.test(rel[1]) ? DAY_MIN : 0) + hh * 60 + mm;
  if (!m && !w) {                                              // weekday only: this one or the next one
    if (!d) return dayStart + hh * 60 + mm;
    const want = DAYS.indexOf(d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase()), now = DAYS.indexOf(W.Day);
    let add = (want - now + 7) % 7; const at = dayStart + add * DAY_MIN + hh * 60 + mm;
    return add === 0 && at < absNow - 12 * 60 ? at + 7 * DAY_MIN : at;
  }
  const M = m ? _.clamp(+m[1], 1, 12) : W.Month, Wk = w ? +w[1] : (m ? 4 : W.Week);
  const Dy = d ? d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase() : 'Sun';
  let abs = toAbs({ Year: W.Year, Month: M, Week: Wk, Day: Dy, Time: `${pad(hh)}:${pad(mm)}` });
  if (m && abs < absNow - 180 * DAY_MIN) abs += YEAR_DAYS * DAY_MIN;   // "M2" written in M11 means next year
  else if (!m && w && abs < absNow - 12 * 60) abs += 28 * DAY_MIN;   // "W1 Mon" written in W4 means next month
  return abs;
}
function whenText(abs, absNow) {
  if (abs < 0) return '';
  if (abs < absNow) return 'overdue';
  const T = fromAbs(abs), dd = Math.floor(abs / DAY_MIN) - Math.floor(absNow / DAY_MIN);
  const tm = T.Time === '23:59' ? '' : ' ' + T.Time;
  if (dd === 0) return 'today' + (tm || ' (by end of day)');
  if (dd === 1) return 'tomorrow' + tm;
  if (dd < 7) return `in ${dd} days (${T.Day}${tm})`;
  return `M${T.Month} W${T.Week} ${T.Day}${tm}`;
}
const capRecord = (obj, max, dropFirst) => {                   // drop the oldest keys (insertion order), preferring dropFirst(v)
  let keys = Object.keys(obj || {}); if (keys.length <= max) return;
  const order = dropFirst ? [...keys.filter(k => dropFirst(obj[k])), ...keys.filter(k => !dropFirst(obj[k]))] : keys;
  for (const k of order.slice(0, keys.length - max)) delete obj[k];
};

function periodOf(W, evs) {
  const [h] = W.Time.split(':').map(Number);
  const tt = TIMETABLE[W.Day];
  const suspended = evs.find(e => e.noclass || e.home || e.lockdown);
  let p;
  if (!tt) p = 'Sunday (no classes)';
  else if (h < 7) p = 'Night';
  else if (h < 8) p = 'Morning, before classes';
  else if (h < 10) p = `P1 08:00-10:00: ${tt[0]}`;
  else if (h < 12) p = `P2 10:00-12:00: ${tt[1]}`;
  else if (h < 13) p = 'Lunch';
  else if (h < 16) p = `P3 13:00-16:00: ${tt[2]}`;
  else if (h < 20) p = 'After classes';
  else p = 'Evening';
  if (suspended && /^P\d/.test(p)) p = `Timetable suspended (${suspended.t.split(' (')[0]})`;
  return p;
}
function curfewOf(W, evs, S) {
  if (evs.some(e => e.lockdown)) return 'LOCKDOWN (The Thinning): academy sealed, nobody outside, all week';
  if (evs.some(e => e.home)) return 'Break: most students have gone home; campus nearly empty';
  const [h] = W.Time.split(':').map(Number);
  // v1.0.3 (F01): on a trip or an off-grounds day, and not at a campus place, the dorm curfew does not apply
  const Tr = (S && S.Trip) || {};
  if (!onCampus(W.Location) && (Tr.Active || evs.some(e => e.away))) return `Away from campus${Tr.Active && Tr.Destination ? ` (${Tr.Destination})` : ''}: the dorm curfew does not apply; the teachers in charge set the rules`;
  // v1.0.3 (A#6): a no-curfew event lifts it from its first day's evening to its last day's dawn, not for the whole two days
  const nc = evs.find(e => e.nocurfew);
  if (nc && ((W.Day === nc.d[0] && h >= 12) || (W.Day === nc.d[nc.d.length - 1] && W.Day !== nc.d[0] && h < 7))) return '';
  const start = evs.map(e => curfewHour(e, W.Day)).find(Boolean) || 20;
  return h >= start || h < 7 ? `CURFEW (${start}:00-07:00): students must be in their own dorms` : '';
}

// 1.3.4 (owner): the next thing on today's schedule, for the bracelet ($ui.next): an event's timed item ("09:00 sorting at the
// Arbiter Stone…", "dusk (about 17:00): …"), a class period, curfew. Nothing left today -> null.
function nextUp(W, evs, S) {
  const now = hm(W.Time); if (now == null) return null;
  const items = [], cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  for (const e of evs) for (const part of String(schedOf(e, W.Day) || '').split(/;\s+/)) {
    const p = part.trim(); let m = /^(\d{1,2}):(\d{2})(?:\s*[–-]\s*(\d{1,2}):(\d{2}))?\s+(.+)$/.exec(p);
    if (m) { items.push({ at: +m[1] * 60 + +m[2], what: cap(m[5]), kind: 'event' }); continue; }
    m = /^(.*?)\(about (\d{1,2}):(\d{2})\):?\s*(.*)$/.exec(p);
    if (m) items.push({ at: +m[2] * 60 + +m[3], what: cap((m[4] || m[1]).trim()), kind: 'event' });
  }
  const tt = TIMETABLE[W.Day], stop = evs.some(e => e.noclass || e.home || e.lockdown || e.away);
  if (tt && !stop) [8, 10, 13].forEach((h, i) => items.push({ at: h * 60, what: String(tt[i]).replace(/\s*\[[MD]\]/g, ''), kind: /^(Study Hall|Clubs)/.test(tt[i]) ? 'club' : 'class' }));
  const noCurfew = evs.some(e => e.lockdown || e.home || (e.nocurfew && W.Day === e.d[0])) || /^Away/.test(W._Curfew || '');
  if (!noCurfew) items.push({ at: (evs.map(e => curfewHour(e, W.Day)).find(Boolean) || 20) * 60, what: 'Curfew: back to your dorm', kind: 'curfew' });
  const next = items.filter(x => x.at > now).sort((a, b) => a.at - b.at || (a.kind === 'event' ? -1 : b.kind === 'event' ? 1 : 0))[0];
  return next ? { at: `${pad(Math.floor(next.at / 60))}:${pad(next.at % 60)}`, what: next.what, kind: next.kind } : null;
}

// ---- F20 happenings ----
function dayParts(dayNo) { const doy = ((dayNo % YEAR_DAYS) + YEAR_DAYS) % YEAR_DAYS; return { Month: Math.floor(doy / 28) + 1, Week: Math.floor((doy % 28) / 7) + 1, Day: DAYS[doy % 7] }; }
function happeningFits(h, P) {
  const d = h.days || 'any';
  if (d === 'weekday' && !MON_FRI.includes(P.Day)) return false;
  if (d === 'weekend' && MON_FRI.includes(P.Day)) return false;
  if (Array.isArray(d) && !d.includes(P.Day)) return false;
  if (h.months && (P.Month < h.months[0] || P.Month > h.months[1])) return false;
  if (h.weeks && !h.weeks.includes(P.Week)) return false;
  return true;
}
// 1.1.0: weather (wxm = the Weather effects level). Full: outdoor items skip heavy weather, weather-only items need their weather,
// a fallen tree is 3x likelier the day after a storm. Any level but Off: "clear_night" items need a clear night (their text says so).
function wxFits(h, seed, dayNo, wxm) {
  if (wxm === 'off') return !h.weather || h.weather === 'clear_night';
  const D = wxDay(seed, dayNo).blocks, Y = wxDay(seed, dayNo - 1).blocks;
  if (h.weather === 'clear_night') return D[2].sky === 'Clear';
  if (wxm !== 'full') return !h.weather;
  if (h.outdoor && (wxHeavy(D[0]) || wxHeavy(D[1]))) return false;
  if (h.weather === 'snow') return Y[2].snow || D[0].snow;
  if (h.weather === 'after_storm') return Y.some(b => b.rare === 'lightning storm' || b.wind === 'gale');
  if (h.weather === 'dense_fog') return D[0].rare === 'dense fog';
  return !h.weather;
}
function rawHappening(seed, dayNo, rate, exclude, wxm = 'off') {
  const P = dayParts(dayNo), evs = eventsOn(P);
  if (!rate || evs.some(e => e.home || e.lockdown)) return null;       // breaks and the Thinning: nothing
  if (rand01(seed, dayNo, 'roll') >= rate * (evs.length ? 0.5 : 1)) return null;   // calendar days are busy enough
  const pool = HAPPENINGS.filter(h => happeningFits(h, P) && !(exclude || []).includes(h.id) && wxFits(h, seed, dayNo, wxm));
  const stormy = wxm === 'full' && wxDay(seed, dayNo - 1).blocks.some(b => b.sky === 'Storm' || b.wind === 'gale');
  const wt = h => (h.weight || 1) * (stormy && h.after_storm_x3 ? 3 : 1);
  const total = pool.reduce((a, h) => a + wt(h), 0);
  let r = rand01(seed, dayNo, 'pick') * total;
  for (const h of pool) { r -= wt(h); if (r < 0) return h; }
  return null;
}
function happeningOn(seed, dayNo, rate, wxm) {   // no repeat of the previous two days' happening
  const prev = [1, 2].map(k => rawHappening(seed, dayNo - k, rate, [], wxm)).filter(Boolean).map(h => h.id);
  return rawHappening(seed, dayNo, rate, prev, wxm);
}

// ---- 1.1.0 weather (spec §4): seasons, sky per block, wind, rare weather, °C. Pure functions of (seed, day): swipe-safe. ----
const SEASONS = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'];   // by Month-1
const SKY = ['Clear', 'Cloudy', 'Overcast', 'Fog', 'Rain', 'Storm'];
const WX_BASE = { Winter: [25, 20, 25, 10, 18, 2], Spring: [30, 25, 15, 8, 20, 2], Summer: [50, 22, 8, 3, 12, 5], Autumn: [28, 22, 20, 12, 16, 2] };
const WX_BLOCK = [{ Fog: 2, Storm: 0.5 }, { Fog: 0.3, Storm: 1.8 }, {}];   // morning, afternoon, night
const WX_TRANS = { Clear: { Clear: 2, Cloudy: 1.2, Overcast: 0.6, Rain: 0.4, Storm: 0.6 }, Cloudy: { Cloudy: 1.4, Overcast: 1.3 },
  Overcast: { Overcast: 1.5, Rain: 2, Clear: 0.5 }, Fog: { Clear: 1.5, Cloudy: 1.3, Fog: 0.4 }, Rain: { Rain: 1.8, Overcast: 1.5, Storm: 1.3, Clear: 0.4 },
  Storm: { Rain: 2, Overcast: 1.5, Storm: 0.5 } };
const WX_MEAN = [2, 3, 7, 11, 15, 19, 21, 21, 17, 12, 7, 3];   // monthly mean °C (owner-approved table)
const BLOCKS = ['morning', 'afternoon', 'night'], BLOCK_T = [-2, 4, -4];
const FC_NEAR = { Clear: ['Cloudy'], Cloudy: ['Clear', 'Overcast', 'Fog'], Overcast: ['Cloudy', 'Rain'], Fog: ['Cloudy'], Rain: ['Overcast', 'Storm'], Storm: ['Rain'] };
const FC_TRUE = 75;            // Divination Society forecast: d100 <= 75 -> the true sky (owner: 70-80%)
const d100 = (...p) => hash32(...p) % 100 + 1;
const tempLabel = t => (t <= 0 ? 'freezing' : t <= 7 ? 'cold' : t <= 14 ? 'cool' : t <= 21 ? 'mild' : t <= 27 ? 'warm' : 'hot');
// night belongs to the day it starts on: 03:00 is the night block of the previous day
const blockOf = abs => { const day = Math.floor(abs / DAY_MIN), h = Math.floor((abs - day * DAY_MIN) / 60); return h < 6 ? [day - 1, 2] : [day, h < 12 ? 0 : h < 18 ? 1 : 2]; };
function wxRollDay(seed, day, prev) {                          // prev = the previous block ({sky, wind}) or null
  const P = dayParts(day), season = SEASONS[P.Month - 1];
  const heat = season === 'Summer' && d100(seed, day, 'heat') >= 98;   // heatwave: the whole day clear, +8 °C
  const tv = hash32(seed, day, 'tv') % 7 - 3, blocks = [];
  for (let b = 0; b < 3; b++) {
    let sky = 'Clear';
    if (!heat) {
      const w = SKY.map(k => WX_BASE[season][SKY.indexOf(k)] * (WX_BLOCK[b][k] || 1) * (prev ? (WX_TRANS[prev.sky][k] || 1) : 1));
      let r = rand01(seed, day, b, 'sky') * w.reduce((a, x) => a + x, 0);
      sky = SKY[SKY.length - 1];
      for (let i = 0; i < SKY.length; i++) { r -= w[i]; if (r < 0) { sky = SKY[i]; break; } }
    }
    const prevWet = !!prev && (prev.sky === 'Rain' || prev.sky === 'Storm');
    let temp = WX_MEAN[P.Month - 1] + BLOCK_T[b] + tv + (sky === 'Rain' ? -2 : 0) + (season === 'Summer' && sky === 'Clear' && b === 1 ? 2 : 0) + (heat ? 8 : 0);
    let rain = '', snow = false;
    if (sky === 'Rain') {
      const ri = d100(seed, day, b, 'ri') + (prevWet ? 15 : 0);
      rain = ri <= 45 ? 'light' : ri <= 85 ? 'steady' : 'heavy';
      if (season === 'Winter' && temp <= 3) snow = d100(seed, day, b, 'snow') <= (P.Month === 12 ? 60 : 70) + (b !== 1 ? 15 : 0);
    }
    const th = 93 - (b === 1 ? 5 : 0) - (season === 'Spring' || season === 'Autumn' ? 4 : 0) - (sky === 'Rain' ? 6 : 0) - (prev && prev.wind ? 15 : 0) + (sky === 'Clear' ? 3 : 0);
    const wr = d100(seed, day, b, 'wind');
    let wind = wr >= 100 ? 'gale' : wr >= th ? 'windy' : '';
    if (sky === 'Storm') wind = wr >= 95 ? 'gale' : 'windy';
    const rr = d100(seed, day, b, 'rare'), warm = season === 'Spring' || season === 'Summer';
    let rare = heat ? 'heatwave' : '';
    if (!rare && sky === 'Storm' && warm && b >= 1 && rr >= 71) rare = 'lightning storm';
    else if (!rare && sky === 'Storm' && warm && b === 1 && rr >= 51) rare = 'hail';
    else if (!rare && snow && wind) rare = 'blizzard';
    else if (!rare && sky === 'Fog' && (season === 'Autumn' || season === 'Winter') && b === 0 && rr >= 80) rare = 'dense fog';
    if (rare === 'blizzard') temp -= 6;
    blocks.push({ sky, rain, snow, wind, rare, temp: Math.round(temp) });
    prev = blocks[b];
  }
  return { season, blocks };
}
const WXC = new Map();
function wxDay(seed, day) {                                    // chain without state: 3 days of warm-up, then the day itself
  const key = seed + '|' + day; if (WXC.has(key)) return WXC.get(key);
  let prev = null;
  for (let d = day - 3; d < day; d++) prev = wxRollDay(seed, d, prev).blocks[2];
  const r = wxRollDay(seed, day, prev);
  if (WXC.size > 400) WXC.clear(); WXC.set(key, r);
  return r;
}
function wxText(bk) {
  const main = bk.rare === 'lightning storm' ? 'lightning storm' : bk.rare === 'hail' ? 'hailstorm' : bk.rare === 'blizzard' ? 'blizzard'
    : bk.rare === 'dense fog' ? 'dense fog (visibility a few metres)' : bk.snow ? `${bk.rain} snow` : bk.sky === 'Rain' ? `${bk.rain} rain` : bk.sky.toLowerCase();
  return [main, bk.rare === 'heatwave' ? 'heatwave' : '', bk.wind && bk.rare !== 'blizzard' ? (bk.wind === 'gale' ? 'gale' : 'windy') : ''].filter(Boolean).join(', ');
}
function wxForecast(seed, day) {                               // the Divination Society's posting for `day` (rare events are never forecast)
  const D = wxDay(seed, day);
  return D.blocks.map((bk, b) => {
    let sky = bk.sky;
    if (d100(seed, day, b, 'fc') > FC_TRUE) { const nb = FC_NEAR[sky]; sky = nb[hash32(seed, day, b, 'fcn') % nb.length]; }
    const t = bk.temp - (bk.rare === 'heatwave' ? 8 : 0) + (bk.rare === 'blizzard' ? 6 : 0);
    return { sky, text: sky === 'Rain' && D.season === 'Winter' && t <= 3 ? 'snow' : sky.toLowerCase(), label: tempLabel(t) };
  });
}
const wxBad = bk => !!bk && (bk.sky === 'Rain' || bk.sky === 'Storm');                              // rain, snow or storm
const wxHeavy = bk => !!bk && (bk.sky === 'Storm' || bk.rain === 'heavy' || bk.rare === 'blizzard' || bk.rare === 'hail');
// winter flu wave: 1-2 a year in Months 1-2 (Month 12 is the holiday), 5 days each, seeded
function fluOn(seed, day) {
  const Y = Math.floor(day / YEAR_DAYS), doy = day - Y * YEAR_DAYS;
  if (doy >= 56) return false;
  for (let k = 0, n = 1 + hash32(seed, Y, 'flu') % 2; k < n; k++) { const st = hash32(seed, Y, k, 'flus') % 51; if (doy >= st && doy < st + 5) return true; }
  return false;
}
// outdoor places (spec §4.8; generated by gen_engine from data/locations.json) and weather gear from Bag item names
const OUTDOOR = /*@@OUTDOOR@@*/[];
const isOutdoor = loc => { const p = placeOf(loc).toLowerCase(); return !!p && OUTDOOR.some(c => p === c || p.startsWith(c + ' ') || p.startsWith(c + ',')); };
const GEAR = { umbrella: /umbrella/i, waterproof: /waterproof|oilskin|rain cloak|raincoat/i, warm: /wool|scarf|winter cloak|mittens/i, sun: /sun hat|straw hat/i };
const gearOf = I => { const ks = Object.keys(I || {}).filter(k => (I[k] && I[k].Qty) > 0).join(' | '); return _.mapValues(GEAR, rx => rx.test(ks)); };
const COND = {
  Soaked: 'Wet through: rest and sleep restore half the usual stamina. Dries after an hour indoors.',
  Chilled: 'Cold to the bone: -10 stamina per hour outdoors. Warms up after an hour indoors or a hot drink.',
  Overheated: 'Too hot: -10 stamina per hour outdoors. Cools down after half an hour indoors or a cold drink.',
  'Head cold': 'Stuffy and slow: stamina capped at 80% of max until it passes or the Medical Centre treats it.',
};
// ---- 1.1.0 Features settings (spec §9): which state each feature parks when it is off (data/features.json, injected) ----
const FEATURES = /*@@FEATURES@@*/[];
const EMPTY = { Commitments: {}, Notices: {}, Letters: {}, Clues: {}, Mysteries: {}, Projects: {}, Inventory: {}, Hooks: {}, 'Player.Conditions': {},
  Competition: { Tier: '', Status: '', Placement: '', Team: [], Results: [] }, Trip: { Active: false, Destination: '', Companions: [], Note: '' },
  Battle: { Active: false, Combatants: {} } };
// parkOff: the feature's state is parked (weather effects: anything but Full); ruleOff: its rules and UI are off (weather: Off only)
const parkOff = (X, f) => { const u = (X && X.$ui) || {}; return f.control === 'levels' ? (f.id === 'weather' ? (u.wxfx || 'full') !== 'full' : (u[f.field] || 'normal') === 'off') : (u.off || []).includes(f.id); };
const isEmptyV = v => v == null || v === '' || v === false || (Array.isArray(v) && !v.length) || (_.isPlainObject(v) && !Object.keys(v).length);
function mergePark(to, from) {                                  // a write into a parked module is kept in the parking, not dropped
  if (_.isPlainObject(to) && _.isPlainObject(from)) {
    for (const [k, v] of Object.entries(from)) if (!isEmptyV(v)) to[k] = Array.isArray(v) && Array.isArray(to[k]) ? [...new Set([...to[k], ...v])] : _.cloneDeep(v);
    return to;
  }
  return isEmptyV(from) ? to : _.cloneDeep(from);
}
const REACH = (m, age) => (age <= 0 ? 'only witnesses' : m.fate === 'fast' && age <= 6 ? 'all over campus' : age <= 2 ? "the source's dorm and club" : age <= 6 ? 'most of campus' : 'old news, everyone knows');
const CAP_HOOKS = 15, CAP_BAG = 40, BOTTLE_BACK = 2;

// v1.0.3 (F14): a save made before a field existed may reach the engine without it (an update the schema never parsed).
// Fill missing containers with their empty shape; existing values are never touched. Arrays are only set when missing.
const SHAPE = {
  Scene: { Present: {} },
  Player: { Profile: { Reputation: {} }, Vitals: {}, Injuries: {}, Wallet: { Points: 0, Coin: 0, Transactions: [] }, Academics: { Grades: {}, Exams: {} }, Conditions: {} },
  Magic: { _Techniques: {}, _Affinity: { Types: [], Dominant: '', Specialties: [], Preset: '' }, Active: {}, Casts: [], Pacts: {} },
  Hidden: { _True_magic: '', Known_by: [], Dove_attention: 0 },
  Bonds: {}, Campus_State: { Events: {}, Rumours: [], Location_changes: {}, NPC_status: {}, New_relations: {}, Secrets_revealed: [], Graduated: [] },
  Commitments: {}, Notices: {}, Letters: {}, Journal: [], Clues: {}, Mysteries: {},
  Competition: { Tier: '', Status: '', Placement: '', Team: [], Results: [] }, Projects: {},
  Trip: { Active: false, Destination: '', Companions: [], Note: '' }, Battle: { Active: false, Combatants: {} }, _Log: [],
  Inventory: {}, Hooks: {},   // 1.1.0
  Extras: {},   // 1.6.1
  _Perks: {}, Rep_events: [], Training: [], Perk_use: [],   // 1.3.0
};
function fillShape(o, shape) {
  for (const [k, v] of Object.entries(shape)) {
    if (o[k] === undefined || o[k] === null) o[k] = _.cloneDeep(v);
    else if (_.isPlainObject(v) && _.isPlainObject(o[k]) && Object.keys(v).length) fillShape(o[k], v);
  }
}
const BOND0 = { Rank: 0, Progress: 0, Trust: 50, Tension: 0, Title: '', Romance: false, Known_facts: [], Milestones: [], Last_seen: '' };
const ENGINE_VER = '@@VERSION@@';   // the card version (src/card/card.json, set by tools/gen_engine.py)

function runEngine(S, B, text, seedHint) {
  if (!S || !S.World) return;
  fillShape(S, SHAPE);
  const log = [], jnl = [];                                    // jnl: journal lines the engine adds itself (5.1)
  S.$eng = S.$eng || { abs: -1, daily: {} };
  S.$ui = S.$ui || { unlocks: [], discovered: [], toasts: [] };
  for (const k of ['unlocks', 'discovered', 'toasts', 'names', 'archive', 'secrets', 'off', 'rumours_old']) if (!Array.isArray(S.$ui[k])) S.$ui[k] = [];
  if (!_.isPlainObject(S.$ui.parked)) S.$ui.parked = {};
  if (!['off', 'flavor', 'full'].includes(S.$ui.wxfx)) S.$ui.wxfx = 'full';
  S.$eng.ver = ENGINE_VER;
  const hasB = !!(B && B.World);
  if (hasB) S.$ui.toasts = [];                                  // toasts = what happened in THIS update only

  // ---- 0. read-only fields: only a Student Builder patch (auth = 'builder') may change them ----
  const byBuilder = S.$eng.auth === 'builder';
  if (hasB && !byBuilder) {
    const keep = [['Magic', '_Techniques'], ['Magic', '_Affinity'], ['Hidden', '_True_magic'], ['$ui', 'built'], ['$ui', 'file'], ['_Perks']];
    for (const path of keep) {
      const was = _.get(B, path);
      if (was !== undefined && !_.isEqual(_.get(S, path), was)) { _.set(S, path, _.cloneDeep(was)); log.push(`${path.join('.')} is read-only; the change was reverted.`); }
    }
  }
  if (byBuilder) S.$ui.toasts.push('Student file updated');
  S.$eng.auth = '';
  let healedMax = false;
  // 1.2.0 (owner playtest: a reload came back with the student's magic empty): the Builder keeps its own record in $ui.file.
  // A built student whose Builder-only fields are all empty gets them back from that record. The Builder always writes both
  // together, so an empty set next to a full record is a lost write, never a choice.
  {
    const F = S.$ui.file, M = S.Magic, A = M._Affinity || {};
    if (S.$ui.built && F && typeof F === 'object' && _.isEmpty(M._Techniques) && !(A.Types || []).length
      && (!_.isEmpty(F.Techniques) || ((F.Affinity || {}).Types || []).length)) {
      M._Techniques = _.cloneDeep(F.Techniques || {}); M._Affinity = _.cloneDeep(F.Affinity || {});
      if (F.Mana_max > 0) { S.Player.Vitals.Mana_max = F.Mana_max; healedMax = true; }
      if (F.True_magic && !S.Hidden._True_magic) S.Hidden._True_magic = F.True_magic;
      log.push('The student file was restored from the Builder record (magic had come back empty).');
    }
  }

  // 1.3.0 training: Mana_max and Stamina_max grow only through training (engine §6b) or the Student Builder. Any other change is
  // reverted; a Builder change (or the self-heal above) moves the starting value the training limits are measured from.
  {
    const V0 = S.Player.Vitals, TS = S.Player.$Training || (S.Player.$Training = {}), TB = hasB ? ((B.Player || {}).$Training || {}) : {};
    for (const [k, t] of Object.entries(TRN.tracks || {})) {
      const cur = num(V0[t.field], 1), prev = hasB ? num(((B.Player || {}).Vitals || {})[t.field], cur) : cur, o = TB[k] || TS[k];
      let base = o && o.base > 0 ? o.base : cur;
      const gain = o ? num(o.gain, 0) : 0;
      if (hasB && cur !== prev) {
        if (byBuilder || healedMax) base = Math.max(1, r2(cur - gain));
        else { V0[t.field] = prev; log.push(`${t.label} (${t.field}) grows only through training or the Student Builder; the change was reverted.`); }
      }
      TS[k] = { base, gain, w: o ? num(o.w, -1) : -1, wg: o ? num(o.wg, 0) : 0 };
    }
    V0.Mana = Math.min(V0.Mana, V0.Mana_max); V0.Stamina = Math.min(V0.Stamina, V0.Stamina_max);
  }

  // ---- 0b. 1.1.0 Features settings: a feature that is off has its state parked in $ui.parked (hidden from the AI) and is not processed.
  // Turning it back on restores it. A write the AI still makes into a parked module is merged into the parking, not dropped.
  // On the update that toggles a feature, the "before" copy of its state is aligned, so the toggle is not read as a story change.
  {
    const parked = S.$ui.parked;
    let Bw = B;
    for (const f of FEATURES) {
      if (!f.paths) continue;
      const offA = parkOff(S, f), offB = hasB ? parkOff(B, f) : offA;
      if (offA) {
        const Pk = parked[f.id] || (parked[f.id] = {});
        for (const p of f.paths) {
          const cur = _.get(S, p);
          Pk[p] = p in Pk ? mergePark(Pk[p], cur) : _.cloneDeep(cur === undefined ? EMPTY[p] : cur);
          _.set(S, p, _.cloneDeep(EMPTY[p]));
        }
      } else if (parked[f.id]) {
        for (const p of f.paths) if (parked[f.id][p] !== undefined) _.set(S, p, mergePark(_.cloneDeep(parked[f.id][p]), _.get(S, p)));
        delete parked[f.id];
      }
      if (hasB && offA !== offB) { if (Bw === B) Bw = _.cloneDeep(B); for (const p of f.paths) _.set(Bw, p, _.cloneDeep(_.get(S, p))); }
    }
    B = Bw;
  }
  // features whose rules, unlocks and UI are off (weather: level Off; happenings: level off)
  const OFF = new Set(S.$ui.off);
  if (S.$ui.happenings === 'off') OFF.add('happenings');
  if (S.$ui.wxfx === 'off') OFF.add('weather');
  const offUnlock = new Set(FEATURES.filter(f => f.unlock && parkOff(S, f)).map(f => f.unlock));

  // 1.3.4 (owner playtest: Etnie showed up in message 0 of a new chat). The chat's starting state comes from the card's lorebook
  // as SillyTavern holds it ([initvar] entry 500), which is not replaced when the card is imported again. That entry carries the
  // card version in $eng.lore; on the first update of a chat, an older one (or none) means an old lorebook: say so, and drop
  // Etnie's pre-1.3.1 starting bond (she now bonds when they meet).
  const staleDrop = new Set();
  if (hasB && !(B.$eng && B.$eng.abs >= 0) && (B.$eng || {}).lore !== ENGINE_VER) {
    const old = (B.$eng || {}).lore || 'before 1.3.4';
    S.$ui.toasts.push(`Old lorebook (${old}): update the card's lorebook in SillyTavern`);
    log.push(`This chat started from the card's lorebook ${old}, but the card is ${ENGINE_VER}: rules, lore and the starting state are out of date. In SillyTavern, replace the lorebook "Eldrasil — Halvard Academy" with the one inside the card (character panel → More… → Import Card Lore), then start a new chat.`);
    const e = (S.Bonds || {}).Etnie;
    if (!(B.$eng || {}).lore && e && !e.Last_seen && e.Rank === 3 && (e.Milestones || []).length <= 1 && S.World.Month === 1 && S.World.Week === 1) { delete S.Bonds.Etnie; staleDrop.add('Etnie'); }
  }
  S.$eng.lore = ENGINE_VER;
  // ---- 1. time ----
  // 1.3.3: an unreadable Day or Time from the AI arrives as '' (schema): keep the previous one rather than guess
  for (const [f, d] of [['Day', 'Mon'], ['Time', '08:00']]) {
    if (!S.World[f]) { S.World[f] = (hasB && B.World[f]) || d; if (hasB) log.push(`World.${f} could not be read; it was kept at ${S.World[f]}.`); }
  }
  if (!(S.Trip && S.Trip.Active)) S.World.Location = canonLocation(S.World.Location);   // 1.3.1: the map's name for the place
  const absB = hasB ? (B.$eng && B.$eng.abs >= 0 ? B.$eng.abs : toAbs(B.World)) : toAbs(S.World);
  let absA = toAbs(S.World);
  if (hasB && absA < absB) {
    // v1.0.3 (A#1): the AI wrote a new Day but forgot to roll Week/Month/Year -> keep its Day and Time and move forward by whole
    // weeks (up to a bit over a year); only the clock passed midnight with the same Day -> +1 day
    const dayChanged = S.World.Day !== B.World.Day;
    const step = dayChanged ? 7 * DAY_MIN : DAY_MIN, limit = dayChanged ? 60 : 1;
    let k = 0;
    while (absA < absB && k < limit) { absA += step; k++; }
    if (absA < absB) { absA = absB; log.push('Time cannot move backwards; the clock was kept.'); }
  }
  Object.assign(S.World, fromAbs(absA));
  const elapsed = hasB ? Math.max(0, absA - absB) : 0;
  const evs = eventsOn(S.World);
  // 1.2.0: {{user}}'s birthday (Builder, Profile.Birthday "M? W? Day") joins the day's events; lore entry 508 says how it plays out
  const bd = /^M(\d{1,2}) W([1-4]) (Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.exec(String(S.Player.Profile.Birthday || '').trim());
  const bday = bd && +bd[1] === S.World.Month && +bd[2] === S.World.Week && bd[3] === S.World.Day;
  // 1.3.1: each event with today's plan (times from its lore entry), so the narrator runs the day on schedule
  S.World._Event_today = [...evs.map(e => (schedOf(e, S.World.Day) ? `${e.t} — ${schedOf(e, S.World.Day)}` : e.t)), ...(bday ? [`${S.Player.Profile.Name || 'Your'}'s birthday`] : [])].join(' | ');
  S.World._Period = periodOf(S.World, evs);
  S.World._Curfew = curfewOf(S.World, evs, S);
  // F20: today's happening (visible from the day's start until its window closes)
  if (!(S.$eng.seed > 0)) S.$eng.seed = (hash32(String(seedHint || ''), stamp(S.World), String(S.Player.Profile.Name || '')) % 2147483646) + 1;
  {
    const rate = HAPPEN_RATE[S.$ui.happenings] ?? HAPPEN_RATE.normal;
    const h = happeningOn(S.$eng.seed, Math.floor(absA / DAY_MIN), rate, S.$ui.wxfx), hr = Math.floor((absA % DAY_MIN) / 60);
    if (h && hr < h.to) {
      const win = `${pad(h.from)}:00–${pad(h.to)}:00`, now = hr >= h.from;
      S.World._Happening = `${now ? 'Now, until ' + pad(h.to) + ':00' : win}${h.where ? ', ' + h.where : ', around campus'}: ${h.text}`;
      S.$ui.hap = { id: h.id, where: h.where || '', from: h.from, to: h.to, text: h.text, now };
      if (hasB && (!B.$ui || !B.$ui.hap || B.$ui.hap.id !== h.id || Math.floor(absB / DAY_MIN) !== Math.floor(absA / DAY_MIN))) S.$ui.toasts.push(`Around campus: ${h.where || 'campus-wide'}`);
    } else { S.World._Happening = ''; S.$ui.hap = null; }
  }
  const dayNo = Math.floor(absA / DAY_MIN);
  const dayNoB = Math.floor(absB / DAY_MIN);
  if (hasB && dayNo !== dayNoB && evs.some(e => e.ranking)) log.push('Results & Dorm Ranking today: update Player.Profile.Dorm_rank when the results are announced.');
  if (hasB && dayNo !== dayNoB && evs.some(e => e.grad)) log.push('Graduation today: the third-years leave by airship tomorrow morning; the engine then lists them in Campus_State.Graduated.');
  if (hasB && S.World.Year > (B.World.Year || 1)) log.push(`A new academic year began (Year ${S.World.Year}): update Player.Profile.Year if {{user}} moved up.`);

  // ---- 1b. 1.1.0 weather (spec §4): season, sky, wind, rare weather and °C for the current block; the Divination Society forecast ----
  const WXM = S.$ui.wxfx, seed = S.$eng.seed;
  const away = /^Away from campus/.test(S.World._Curfew || '');
  let wxNow = null, wxBlk = null;                              // wxNow: the block whose effects apply (Full, on campus)
  if (WXM === 'off') { S.World._Season = ''; S.World._Weather = ''; S.$ui.wx = null; }
  else {
    const [wd, wb] = blockOf(absA), D = wxDay(seed, wd), bk = D.blocks[wb];
    const lab = x => ({ ...x, label: tempLabel(x.temp) });
    wxBlk = bk;
    S.World._Season = D.season;
    S.World._Weather = away ? "Away: local weather is the narrator's call" : `${_.capitalize(BLOCKS[wb])}, ${D.season.toLowerCase()}: ${wxText(bk)}, ${bk.temp} °C (${tempLabel(bk.temp)})`;
    const fday = (absA % DAY_MIN) >= 7 * 60 ? dayNo + 1 : dayNo;   // posted daily at 07:00 for the next day
    S.$ui.wx = { mode: WXM, season: D.season, away, block: wb, now: lab(bk), text: wxText(bk), blocks: D.blocks.slice(0, wb + 1).map(lab),
      fc: { day: fday, tomorrow: fday > dayNo, blocks: wxForecast(seed, fday) }, flu: false, sick: [], field: '' };
    if (WXM === 'full' && !away) {
      wxNow = bk;
      if (fluOn(seed, dayNo)) {                                  // a cold is going around: 1-2 seeded students off sick today
        const pool = Object.keys(STUDENTS).filter(id => (STUDENTS[id][1] || 1) <= S.World.Year && yearOf(id, S.World.Year) <= 3 && !(S.Campus_State.Graduated || []).includes(id)).sort();
        const sick = [];
        for (let k = 0, n = 1 + hash32(seed, dayNo, 'sickn') % 2; k < n && pool.length; k++) sick.push(pool.splice(hash32(seed, dayNo, k, 'sick') % pool.length, 1)[0]);
        Object.assign(S.$ui.wx, { flu: true, sick });
      }
      if (isOutdoor(S.World.Location)) {                         // outdoor fights: field line for the narrator and the Battle panel
        S.$ui.wx.field = [bk.sky === 'Rain' ? 'wet footing' : '', bk.sky === 'Fog' ? (bk.rare === 'dense fog' ? 'very low visibility' : 'low visibility') : '',
          bk.wind ? 'gusts' : '', bk.temp >= 28 ? 'heat' : ''].filter(Boolean).join(', ');
      }
    }
    if (hasB && bk.rare && !away) {                              // a rare event: toast + log when it begins
      const [bd, bb] = blockOf(absB), b0 = wxDay(seed, bd).blocks[bb];
      if ((bd !== wd || bb !== wb) && b0.rare !== bk.rare) { S.$ui.toasts.push(`Weather: ${bk.rare}`); log.push(`Rare weather: ${wxText(bk)}.`); }
    }
  }

  // ---- 2. magic: casts ----
  const V = S.Player.Vitals, M = S.Magic, T = M._Techniques || {};
  const BA = (hasB && B.Magic && B.Magic.Active) || {};
  // v1.0.3 (A#3): the AI never sees $ fields, so a whole-record replace drops them; the same effect keeps its start time
  for (const [k, e] of Object.entries(M.Active || {})) {
    const e0 = BA[k];
    if (e0 && e0.Technique === e.Technique && !(e.$started >= 0) && e0.$started >= 0) { e.$started = e0.$started; e.$settled = e0.$settled; }
  }
  const activeNow = tq => Object.values(M.Active || {}).some(e => e.Technique === tq);
  const partnerHere = pk => { const P = (M.Pacts || {})[pk] || {}; return P.Presence === 'terms' || !!P.Summoned || activeNow('Summon ' + pk); };
  for (const c of M.Casts || []) {
    const t = T[c.Technique];
    if (!t) { log.push(`Unknown technique "${c.Technique}" was reported; nothing was charged.`); continue; }
    // v1.0.3 (A#4/F05): a sustained effect is cast by its Active entry, which pays the Activation; a Casts entry for it is not a second cast
    if (t.Cost_mode === 'sustained' && activeNow(c.Technique)) { log.push(`${c.Technique} is sustained: its Active entry already paid the activation, so the Casts entry was not charged.`); continue; }
    // 1.3.2: a pact partner's ability ("<partner>: <ability>") works only while the partner is with {{user}} (summoned, or living
    // by its terms); otherwise nothing happened and nothing is charged
    const pm = /^\[pact\]\s*(.+)$/.exec(t.Notes || ''), pk = pm && pm[1].trim();
    if (pk && c.Technique.startsWith(pk + ': ') && !partnerHere(pk)) { log.push(`${c.Technique}: ${pk} is not summoned, so the ability could not be used; nothing was charged.`); continue; }
    // hybrid: while the effect is running, a triggered use costs Trigger; otherwise a cast costs Activation
    const running = Object.values(M.Active || {}).some(e => e.Technique === c.Technique);
    const unit = t.Cost_mode === 'hybrid' && t.Trigger > 0 && running ? t.Trigger : (t.Activation || 0);
    const cost = unit * (c.Times || 1);
    if (cost > V.Mana) { log.push(`${c.Technique} needed ${cost} mana but only ${Math.floor(V.Mana)} was left: the casting strained or failed (mana now 0).`); V.Mana = 0; }
    else V.Mana -= cost;
  }
  M.Casts = [];

  // ---- 3. magic: sustained effects ----
  let upkeepRunning = false;
  const endPact = eff => {   // v1.0.3 (F06): the engine ended a pact summon -> the spirit is no longer summoned
    const t = T[eff.Technique], m = t && /^\[pact\]\s*(.+)$/.exec(t.Notes || '');
    if (m && /^Summon /.test(eff.Technique) && M.Pacts && M.Pacts[m[1].trim()]) M.Pacts[m[1].trim()].Summoned = false;
  };
  const settle = (name, eff, until) => {
    const t = T[eff.Technique];
    const rate = t ? (t.Upkeep_per_min || 0) : 0;
    const from = eff.$settled >= 0 ? eff.$settled : until;
    const mins = Math.max(0, until - from);
    if (rate <= 0 || mins <= 0) { eff.$settled = until; return true; }
    const need = rate * mins;
    if (need <= V.Mana) { V.Mana -= need; eff.$settled = until; return true; }
    const lasted = Math.floor(V.Mana / rate); V.Mana = 0;
    log.push(`${name} ended at ${fromAbs(from + lasted).Time}: mana ran out.`);
    return false;
  };
  for (const [name, eff] of Object.entries(BA)) {              // effects the AI ended this turn: settle up to now
    if (!(name in M.Active)) settle(name, { ...eff }, absA);
  }
  for (const [name, eff] of Object.entries(M.Active)) {
    const t = T[eff.Technique];
    if (!(name in BA) || eff.$started < 0) {                    // started this turn
      eff.$started = absA; eff.$settled = absA;
      if (t && t.Cost_mode !== 'per_use' && t.Activation) {
        if (t.Activation > V.Mana) { log.push(`${name} could not be sustained: not enough mana to activate.`); endPact(eff); delete M.Active[name]; continue; }
        V.Mana -= t.Activation;
      }
      if (!t) log.push(`Active effect "${name}" names no known technique; no upkeep is charged.`);
    } else {
      eff.$started = BA[name].$started; eff.$settled = BA[name].$settled;
      if (!settle(name, eff, absA)) { endPact(eff); delete M.Active[name]; continue; }
    }
    if (t && t.Upkeep_per_min > 0) upkeepRunning = true;
  }

  // ---- 4. rest & recovery (1.1.0: Soaked halves stamina recovery; sleep quality follows the night's weather, Full only) ----
  const deadBefore = hasB ? B.Player.Vitals.HP <= 0 : V.HP <= 0;
  const Cn = S.Player.Conditions || (S.Player.Conditions = {});
  if (elapsed > 0 && V.Resting !== 'none') {
    const h = elapsed / 60;
    let stMul = wxNow && Cn.Soaked ? 0.5 : 1;
    if (V.Resting === 'sleep' && wxNow) {
      const [sd, sb] = blockOf(absB), nb = wxDay(seed, sb === 2 ? sd : Math.floor(absB / DAY_MIN)).blocks[2];   // the night of the sleep
      stMul *= 1 + (nb.sky === 'Rain' && !nb.snow && nb.rain !== 'heavy' ? 0.1 : 0) - (nb.sky === 'Storm' ? 0.2 : 0) - (nb.temp >= 22 ? 0.1 : 0);
    }
    if (V.Resting === 'sleep') {
      V.Stamina += V.Stamina_max * Math.min(1, h / 6) * stMul;
      if (!upkeepRunning) V.Mana += h >= 6 ? V.Mana_max : V.Mana_max * (h / 6) * 0.8;
      if (h >= 6 && V.HP > 0 && !deadBefore && !Object.values(S.Player.Injuries).some(i => i.Severity === 'serious' || i.Severity === 'critical')) V.HP += 5;   // v1.0.3 (F07, D13): no sleeping back from death
    } else {
      V.Stamina += 20 * h * stMul;
      if (!upkeepRunning) V.Mana += 5 * h;
    }
  }
  V.Resting = 'none';

  // ---- 4b. 1.1.0 weather effects (Full, on campus): outdoor exposure -> Soaked / Chilled / Overheated, daily Head cold roll ----
  {
    const xs = _.isPlainObject(S.$eng.wxs) ? S.$eng.wxs : (S.$eng.wxs = {});
    for (const k of ['wet', 'cold', 'hot', 'dry']) if (!(xs[k] >= 0)) xs[k] = 0;
    if (!(xs.exp > -1e9)) xs.exp = -1e9; if (!(xs.hc > -1e9)) xs.hc = -1e9;
    const C0 = (hasB && B.Player && B.Player.Conditions) || {};
    const storyNew = hasB && Object.keys(Cn).some(k => !C0[k] && k !== 'Head cold');   // the story added one (a bucket of water)
    for (const k of Object.keys(C0)) if (!Cn[k]) { if (k === 'Soaked') xs.wet = 0; if (k === 'Chilled') xs.cold = 0; if (k === 'Overheated') xs.hot = 0; if (k === 'Head cold') xs.hc = -1e9; }   // the story removed it
    if (wxNow) {
      const bk = wxNow, gear = gearOf(S.Inventory), since = stamp(S.World);
      const outB = hasB && isOutdoor(B.World.Location), outA = isOutdoor(S.World.Location);
      const o = elapsed > 0 ? (outB && outA ? elapsed : outB || outA ? elapsed / 2 : 0) : 0;
      const add = (k, why) => { if (!Cn[k]) { Cn[k] = { Effect: COND[k], Since: since }; S.$ui.toasts.push(`Condition: ${k}`); log.push(`{{user}} is now ${k} (${why}).`); } };
      // head cold: one roll at the first update of a new day
      if (hasB && dayNo !== dayNoB && !Cn['Head cold']) {
        const p = (xs.exp >= dayNoB ? 0.15 : 0) + (fluOn(seed, dayNo) ? 0.05 : 0) + (pctOf(V.Stamina, V.Stamina_max) < 30 ? 0.05 : 0);
        if (p > 0 && rand01(seed, dayNo, 'hc') < p) { xs.hc = dayNo + 2 + hash32(seed, dayNo, 'hcd') % 3; add('Head cold', `for ${xs.hc - dayNo} days`); }
      }
      if (Cn['Head cold'] && xs.hc > -1e9 && dayNo >= xs.hc) { delete Cn['Head cold']; xs.hc = -1e9; S.$ui.toasts.push('Head cold is over'); }
      const dryProt = gear.waterproof || (gear.umbrella && !bk.wind && bk.sky !== 'Storm');
      xs.wet = o > 0 && wxBad(bk) && !dryProt ? xs.wet + o : 0;
      if (xs.wet >= (wxHeavy(bk) ? 5 : 20)) add('Soaked', gear.umbrella && !gear.waterproof ? 'the wind beat the umbrella' : 'caught out in the ' + (bk.snow ? 'snow' : 'rain'));
      xs.cold = o > 0 && bk.temp <= (gear.warm ? -5 : 0) ? xs.cold + o : 0;
      if (xs.cold >= 30 || (Cn.Soaked && o > 0 && bk.temp <= (gear.warm ? 3 : 8))) add('Chilled', `${bk.temp} °C outdoors`);
      xs.hot = o > 0 && bk.temp >= (gear.sun ? 31 : 28) && (bk.sky === 'Clear' || bk.sky === 'Cloudy') ? xs.hot + o : 0;
      if (xs.hot >= 60) add('Overheated', `${bk.temp} °C in the sun`);
      for (const k of ['Chilled', 'Overheated']) if (Cn[k] && o > 0) V.Stamina -= 10 * o / 60;
      xs.dry = outA ? 0 : xs.dry + (outB ? elapsed - o : elapsed);
      if (storyNew) xs.dry = 0;                                  // ...so it lasts its full time from now
      for (const [k, mins] of [['Soaked', 60], ['Chilled', 60], ['Overheated', 30]]) if (Cn[k] && xs.dry >= mins && !(k === 'Chilled' && xs.cold)) { delete Cn[k]; S.$ui.toasts.push(`${k}: over`); }
      if (Cn.Soaked || Cn.Chilled) xs.exp = dayNo;
      if (Cn['Head cold']) V.Stamina = Math.min(V.Stamina, V.Stamina_max * 0.8);
    }
  }

  // ---- 5. vitals ----
  if (hasB) {
    const dmg = B.Player.Vitals.HP - V.HP;
    if (dmg > 40 && !V.Lethal_flag) { V.HP = B.Player.Vitals.HP - 40; log.push(`HP loss capped at 40 (no lethal flag): HP ${Math.round(V.HP)}.`); }
    if (V.HP <= 0 && B.Player.Vitals.HP > 0) log.push('{{user}} has died.');
  }
  V.Lethal_flag = false;
  V.HP = _.clamp(V.HP, 0, V.HP_max); V.Stamina = _.clamp(V.Stamina, 0, V.Stamina_max); V.Mana = _.clamp(Math.round(V.Mana * 10) / 10, 0, V.Mana_max);
  const hp = pctOf(V.HP, V.HP_max), st = pctOf(V.Stamina, V.Stamina_max);
  V._Condition = V.HP <= 0 ? 'Dead' : hp <= 30 ? 'Unconscious / Critical' : hp <= 50 ? 'Badly Injured' : hp <= 70 ? 'Hurt' : hp <= 90 ? 'Bruised' : 'Healthy';
  V._Fatigue = V.Stamina <= 0 ? 'Collapsed' : st <= 30 ? 'Exhausted' : st <= 70 ? 'Tired' : 'Fresh';
  if (hasB && B.Player.Vitals._Condition !== V._Condition) S.$ui.toasts.push(`Condition: ${V._Condition}`);

  // ---- 5b. 1.3.0 reputation: Academy (staff and the institution), Student (the student body), Doves (the Dovecote). Signed Rep XP
  // (engine-owned, in $xp) sets the level -5..+5. The narrator reports what earned or cost reputation in /Rep_events: repeatable
  // triggers are capped at REP.weekly_cap a week per reputation, events and losses are not. Bond milestones and high Tension are
  // counted by the engine (§6). A pre-1.3.0 save's Public / Dorm meters become Academy / Student XP once.
  const RP = S.Player.Profile.Reputation || (S.Player.Profile.Reputation = {});
  const RPB = hasB ? ((((B.Player || {}).Profile || {}).Reputation) || {}) : null;
  const rx = {};
  for (const r of REP.reps) rx[r] = _.clamp(num(((RPB && RPB.$xp) || RP.$xp || {})[r], 0), -REP.thresholds[4], REP.thresholds[4]);
  if (S.$eng.repv !== 1) {
    const old = (RPB && (RPB.Public != null || RPB.Dorm != null)) ? RPB : RP;
    if (REP.reps.every(r => !rx[r]) && (num(old.Public, 0) || num(old.Dorm, 0))) {
      rx.Academy = _.clamp(Math.round(num(old.Public, 0) * 1.25), -125, 125); rx.Student = _.clamp(Math.round(num(old.Dorm, 0) * 1.25), -125, 125);
      log.push(`Reputation now has three parts (Academy, Student, Doves); the old academy and dorm standing became Academy ${repLevel(rx.Academy)} and Student ${repLevel(rx.Student)}.`);
    }
    S.$eng.repv = 1;
  }
  delete RP.Public; delete RP.Dorm;
  const weekNo = Math.floor(dayNo / 7), weekNoB = Math.floor(dayNoB / 7);
  const repw = _.isPlainObject(S.$eng.repw) && S.$eng.repw.w === weekNo ? S.$eng.repw : { w: weekNo };
  const repLv = r => repLevel(rx[r]);
  // cap: 'week' (repeatable), 'bond' (only below bond_cap_level), '' (event or loss)
  const TU = tuneOf(S);   // 1.3.1 Settings: pace (rep_mult), weekly cap (0 = none), bond milestones (0 off, 1 until bond_cap_level, 2 always)
  const repAdd = (r, x, why, cap) => {
    if (!REP.reps.includes(r) || !x) return 0;
    if (cap === 'bond' && !TU.rep_bond) return 0;
    if (cap === 'bond' && x > 0 && TU.rep_bond === 1 && repLv(r) >= REP.bond_cap_level) { log.push(`${r} reputation is already +${repLv(r)}: bond milestones add no more (${why}).`); return 0; }
    if (TU.rep_mult !== 1) x = Math.sign(x) * Math.max(1, Math.round(Math.abs(x) * TU.rep_mult));
    if (cap === 'week' && x > 0 && TU.rep_week > 0) {
      const room = Math.max(0, TU.rep_week - num(repw[r], 0));
      if (x > room) log.push(`${r} reputation: the weekly limit for everyday deeds (+${TU.rep_week}) is reached${room ? `; +${room} of +${x} counted` : ''} (${why}).`);
      x = Math.min(x, room); repw[r] = num(repw[r], 0) + x;
      if (!x) return 0;
    }
    const was = rx[r];
    rx[r] = _.clamp(was + x, -REP.thresholds[4], REP.thresholds[4]);
    return rx[r] - was;
  };
  // one level up at once (Ruby, Baelin; Kuroo and Milena's tokens only below 0): Rep XP goes to where the next level begins
  const repLevelUp = (r, onlyNegative) => {
    const L = repLv(r);
    if (L >= 5 || (onlyNegative && L >= 0)) return false;
    rx[r] = Math.max(rx[r], repFloor(L + 1)); return true;
  };
  for (const e of (Array.isArray(S.Rep_events) ? S.Rep_events : [])) {
    const r = REP.reps.find(x => x.toLowerCase() === String(e.Rep || '').trim().toLowerCase());
    if (!r) { log.push(`Reputation "${e.Rep}" is unknown (use Academy, Student or Doves); nothing was changed.`); continue; }
    const x = Math.round(num(e.XP, 0)), kind = String(e.Kind || '').toLowerCase();
    repAdd(r, x, e.Why || kind || 'story', x > 0 && kind !== 'event' ? 'week' : '');
  }
  S.Rep_events = [];
  const repSync = announce => {
    for (const r of REP.reps) {
      const L = repLevel(rx[r]), L0 = RPB ? num(RPB['_' + r], 0) : L;
      RP['_' + r] = L;
      if (announce && hasB && L !== L0) {
        const t = `${r} reputation ${L > L0 ? 'rose' : 'fell'} to ${L > 0 ? '+' : ''}${L}`;
        S.$ui.toasts.push(t); jnl.push(t + '.'); log.push(`${t}: ${repBand(r, L)}`);
      }
    }
    RP.$xp = { ...rx };
  };
  repSync(false);

  // ---- 6a. names revealed by the story prose (not by the update block); before 6 so a name spoken in this reply counts ----
  if (text) {
    const prose = String(text).replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '').replace(/<[^>]+>/g, ' ');
    const names = S.$ui.names;
    for (const [id, rx] of NAME_RX) if (!names.includes(id) && (ARRIVES[id] || 1) <= S.World.Year && rx.test(prose)) names.push(id);
  }

  // ---- 6. bonds ----
  const canon = k => NPC_ALIAS[String(k).toLowerCase()] || k;
  // v1.0.3 (F09): when both an alias key and the canonical key exist, the alias record's real changes merge into the canonical one
  // (fields that differ from the empty record; lists are unioned). Engine-owned "_" / "$" fields are never taken from the alias.
  const mergeInto = (to, from, empty) => {
    if (!_.isPlainObject(to) || !_.isPlainObject(from)) return typeof from === 'string' && from ? from : to;
    for (const [f, v] of Object.entries(from)) {
      if (/^[_$]/.test(f)) continue;
      if (Array.isArray(v)) to[f] = [...new Set([...(to[f] || []), ...v])];
      else if (!_.isEqual(v, empty[f])) to[f] = v;
    }
    return to;
  };
  const renameKeys = (obj, empty = {}) => {
    for (const k of Object.keys(obj || {})) {
      const c = canon(k);
      if (c !== k) { obj[c] = c in obj ? mergeInto(obj[c], obj[k], empty) : obj[k]; delete obj[k]; }
    }
  };
  renameKeys(S.Scene.Present, { Note: '' }); renameKeys(S.Bonds, BOND0);
  if (S.Battle && S.Battle.Combatants) renameKeys(S.Battle.Combatants, { HP: 100, Stamina: 100, Status: '' });
  renameKeys(S.Campus_State.NPC_status);
  const BB = (hasB && B.Bonds) || {};
  for (const [id, b] of Object.entries(S.Bonds)) {             // v1.0.3 (A#3): older facts survive a whole-record replace
    const o = (BB[id] && BB[id].$Known_old) || [];
    if (o.length && !(b.$Known_old || []).length) b.$Known_old = [...o];
  }
  // 1.3.3 (bug hunt): a bond is never removed by an update (a whole-/Bonds replace used to drop every bond it left out), and a
  // record rewritten whole (its facts and milestones both came back empty) keeps what it knew: facts, milestones, title, and
  // Trust / Tension where the rewrite only carried the defaults.
  {
    const kept = [], mended = [];
    for (const [id, b0] of Object.entries(BB)) if (!(id in S.Bonds) && !staleDrop.has(id)) { S.Bonds[id] = _.cloneDeep(b0); kept.push(id); }
    for (const [id, b] of Object.entries(S.Bonds)) {
      const b0 = BB[id]; if (!b0 || kept.includes(id)) continue;
      if ((b.Known_facts || []).length || (b.Milestones || []).length || !((b0.Known_facts || []).length || (b0.Milestones || []).length)) continue;
      b.Known_facts = [...(b0.Known_facts || [])]; b.Milestones = [...(b0.Milestones || [])];
      if (!b.Title) b.Title = b0.Title || '';
      if (num(b.Trust, 50) === 50) b.Trust = num(b0.Trust, 50);
      if (!num(b.Tension, 0)) b.Tension = num(b0.Tension, 0);
      mended.push(id);
    }
    if (kept.length) log.push(`Bond records cannot be removed (${kept.join(', ')}); they were kept. Change a bond's fields instead of replacing /Bonds.`);
    if (mended.length) log.push(`Bond record${mended.length > 1 ? 's' : ''} for ${mended.join(', ')} came back without facts or milestones; what was known was kept.`);
  }
  const seen = `${stamp(S.World)} at ${S.World.Location}`;
  for (const id of Object.keys(S.Scene.Present)) {
    if (NPC_IDS.has(id) && !(id in S.Bonds) && (ARRIVES[id] || 1) > S.World.Year) {   // v1.0.3: incoming cohort, not here yet
      log.push(`${id} is not at Halvard yet (arrives as a first-year in Year ${ARRIVES[id]}); no bond was started. Check who this is.`);
    } else if (NPC_IDS.has(id) && !(id in S.Bonds) && !NO_BOND.has(id)) {   // 1.3.0: rival academy teams have no bond system
      S.Bonds[id] = { Rank: 0, Progress: 0, Trust: 50, Tension: 0, Title: '', Romance: false, Known_facts: [], Milestones: [], Last_seen: '', _Event_ready: false, $Known_old: [], $xp: 0, $cool: -1 };
      S.$ui.toasts.push(`New acquaintance: {npc:${id}}`);   // {npc:id}: the bar shows the name only once it is known (D14)
    }
    if (S.Bonds[id]) S.Bonds[id].Last_seen = seen;
  }
  const daily = S.$eng.daily || {};
  // 1.1.0 (Full): +1 to today's cap for a bond that grew "stuck indoors together" in rain/snow/storm, outdoors in fine mild weather,
  // or on a clear Star Night. At most +1 per bond per day.
  const bondWx = !!wxNow && ((!isOutdoor(S.World.Location) && wxBad(wxNow))
    || (isOutdoor(S.World.Location) && (wxNow.sky === 'Clear' || wxNow.sky === 'Cloudy') && wxNow.temp >= 15 && wxNow.temp <= 27)
    || (evs.some(e => /^Star Night/.test(e.t)) && wxDay(seed, S.World.Day === 'Sun' ? dayNo - 1 : dayNo).blocks[2].sky === 'Clear'));
  // 1.2.2: interactions the narrator reported this reply (/Interactions, emptied here); a raised Progress (pre-1.2.2 habit) with no
  // Interactions entry still counts once, as a talk (+1) or a hangout (+2 or more)
  const PACE = paceOf(S), bweek = _.isPlainObject(S.$eng.bweek) ? S.$eng.bweek : {};
  const romRank = Number.isFinite(+S.$ui.romrank) ? +S.$ui.romrank : BR.romance_default;
  const byId = {};
  for (const a of (Array.isArray(S.Interactions) ? S.Interactions : [])) {
    const id = canon(a && a.With); if (id && S.Bonds[id]) (byId[id] = byId[id] || []).push(a);
  }
  S.Interactions = [];
  const migrate = S.$eng.bondv !== 2, fresh = [];
  // 1.3.0 reputation changes how fast NPCs warm up: extra XP per counted talk or hangout (REP.bond_mod), modifiers add up
  const modBy = (rows, L) => { const hit = rows.find(([at]) => (at > 0 ? L >= at : L <= at)); return hit ? hit[1] : 0; };
  const BM = REP.bond_mod || {};
  const repMod = id => (NPC_GROUP[id] === 'staff' ? modBy(BM.staff || [], repLv('Academy')) : 0) + (NPC_GROUP[id] === 'student' ? modBy(BM.student || [], repLv('Student')) : 0)
    + ((REP.anti_doves || []).includes(id) ? modBy(BM.anti_doves || [], repLv('Doves')) : 0) + ((REP.pro_doves || []).includes(id) ? modBy(BM.pro_doves || [], repLv('Doves')) : 0);
  // 1.3.0 mask -> truth (Castor, Kanae, Caine): the 8 -> 9 event waits until one of the NPC's secrets has come out in play
  const secretOut = id => [...(S.$ui.secrets || []), ...(S.Campus_State.Secrets_revealed || [])].some(x => String(x).toLowerCase().startsWith(id.toLowerCase() + '.'));
  const held = (id, b) => MASK.has(id) && b.Rank === 8 && !secretOut(id);
  const tenseHold = (id, b) => { const P = tensionProfile(id); return !P.exempt && !P.lock && num(b.Tension, 0) >= num(TE.hold_event_from, 70); };   // 1.3.8
  // 1.4.3; 1.6.8 (owner): the Rank 8 event waits too when this character has no rival branch (C, D)
  const trustHold = (id, b) => (b.Rank + 1 !== 8 || !canRival(id)) && num(b.Trust, 50) < trustGate(id, b.Rank + 1);
  const spreadFrom = [];
  const KR = REW.krieg || {}, weeksNew = hasB ? Math.max(0, Math.min(8, weekNo - weekNoB)) : 0;
  const give = (id, which) => {                                // a Rank 5 gift / Rank 10 benefit, once
    const x = ((REW.npcs || {})[id] || {})[which];
    if (!x || !_.isPlainObject(S._Perks)) return;
    if (S._Perks[x.name] || (S.$ui.perks_used || []).some(u => u.startsWith(x.name + ' ('))) return;
    S._Perks[x.name] = { From: id, Kind: which === 'gift' ? 'gift' : 'rank10', Effect: x.text + (x.secret ? ` <narrator_only>${x.secret}</narrator_only>` : ''), Uses: x.uses || 0 };
    S.$ui.toasts.push(which === 'gift' ? `Gift from {npc:${id}}: ${x.name}` : `Rank 10 with {npc:${id}}: new benefit`);
    jnl.push(which === 'gift' ? `${id} gave {{user}} ${x.name}.` : `Rank 10 with ${id}: ${x.text.split(/(?<=\.)\s/)[0]}`);
    if (x.jump) trainJump(x.jump, `${x.name} (${id})`);
    if (x.rep_up && repLevelUp(x.rep_up, false)) log.push(`${x.rep_up} reputation rose one level (${id}, Rank 10).`);
  };
  const rankedUp = (id, b) => {
    const R0 = repOfNpc(id), mx = (REP.bond_milestone_xp || {})[String(b.Rank)];
    if (R0 && mx && !(b.$ms || []).includes(b.Rank)) { repAdd(R0, mx, `bond with ${id} reached Rank ${b.Rank}`, 'bond'); b.$ms = [...(b.$ms || []), b.Rank]; }   // 1.3.8: once per rank
    if (b.Rank === 5) give(id, 'gift');
    if (b.Rank === 10) give(id, 'r10');
    const nd = ((REW.npcs || {})[id] || {}).nudge;
    if (b.Rank === 8 && MASK.has(id) && nd && !(b.Known_facts || []).includes(nd.fact)) { b.Known_facts = [...(b.Known_facts || []), nd.fact]; log.push(`${id}: a new lead, "${nd.fact}"`); }
  };
  for (const [id, b] of Object.entries(S.Bonds)) {
    const b0 = BB[id];
    const g = num(b.Progress, 0) - num(b0 && b0.Progress, 0);
    if (hasB && g > 0 && !byId[id]) byId[id] = [{ Kind: g >= 2 ? 'hangout' : 'talk' }];
    // engine-owned fields come from the previous state; a record the AI (re)wrote cannot set them
    let xp = b0 ? num(b0.$xp, 0) : (hasB ? 0 : num(b.$xp, 0));
    if (migrate) { const p = num(b0 ? b0.Progress : b.Progress, 0); if (p > 0 && xp === 0) xp = Math.round(Math.min(p, 10) / 10 * needXP(b.Rank, PACE)); }
    b.Progress = 0;
    b._Event_ready = b0 ? !!b0._Event_ready : false;
    b.$cool = b0 ? num(b0.$cool, -1) : num(b.$cool, -1);
    b.$ms = b0 ? [...(b0.$ms || [])] : [...(b.$ms || [])]; b.$tf = b0 ? num(b0.$tf, 0) : num(b.$tf, 0);   // 1.3.8 engine-owned
    b.$tdrop = b0 ? num(b0.$tdrop, -99) : num(b.$tdrop, -99);   // 1.4.3
    b.$tlast = b0 ? num(b0.$tlast, 0) : 0; b.$tbrk = b0 ? num(b0.$tbrk, 0) : 0;   // 1.4.4
    b.$Recent = b0 ? [...(b0.$Recent || [])] : [...(b.$Recent || [])];   // 1.4.4 engine-owned
    b.$Defining = b0 ? [...(b0.$Defining || [])] : [...(b.$Defining || [])];   // 1.6.0 engine-owned
    b.$branch = b0 ? String(b0.$branch || '') : String(b.$branch || '');   // 1.6.8 engine-owned: friend | romance | rival from Rank 8
    if (!b.$branch && b0 && b0.Rank >= 8) b.$branch = b0.Romance ? 'romance' : /rival/i.test(String(b0.Title || '')) ? 'rival' : 'friend';   // saves from before 1.6.8
    b.$Knows_old = b0 ? [...(b0.$Knows_old || [])] : [...(b.$Knows_old || [])]; b.$seen = b0 ? num(b0.$seen, -1) : num(b.$seen, -1); b.$mw = b0 ? num(b0.$mw, -1) : num(b.$mw, -1);
    const acts = [...(byId[id] || [])], rank0 = b0 ? b0.Rank : b.Rank, tw0 = num(b.Tension, 0), trw0 = num(b.Trust, 50);
    let rankTrust = 0;
    if (S.$eng.tenv !== 1) b.$ms = [...new Set([...b.$ms, ...Object.keys(REP.bond_milestone_xp || {}).map(Number).filter(r => r <= b.Rank)])];   // older saves: milestones already paid
    // 1.4.3: a new bond starts at the character's own Trust (owner: start by category). 1.6.11 (owner playtest: Trixie met for the
    // first time showed Trust 10, Betrayed): a number the narrator writes on a first meeting is not a deed, so it gives way too
    if (!b0 && hasB) { const s0 = trustProfile(id, S, secretOut).start; if (num(b.Trust, 50) !== 50 && num(b.Trust, 50) !== s0) log.push(`${id} is new: Trust starts at ${s0} by their nature (${num(b.Trust, 50)} written; a first meeting is not a deed).`); b.Trust = s0; }
    if (!b0 && hasB && START[id]) {                            // 1.3.1: a bond with its own start (Etnie adopts {{user}} on sight)
      const st = START[id];
      b.Rank = st.Rank; b.$cool = dayNo + coolDays(st.Rank, PACE); xp = 0;
      if (!b.Title && st.Title) b.Title = st.Title;
      if (st.Trust) b.Trust = st.Trust;
      b.Known_facts = [...new Set([...(b.Known_facts || []), ...(st.Known_facts || [])])];
      b.Milestones = [...new Set([...(b.Milestones || []), ...(st.Milestones || [])])];
      S.$ui.toasts.push(`Bond with {npc:${id}} starts at Rank ${st.Rank}`);
      for (const m of st.Milestones || []) jnl.push(m + '.');
    } else if (!b0 && hasB && b.Rank > 0) b.Rank = 0;         // a new acquaintance starts at Rank 0
    if (b0 && b.Rank > b0.Rank) {
      if (b0._Event_ready && b.Rank === b0.Rank + 1) {
        xp = 0; b._Event_ready = false; b.$cool = dayNo + coolDays(b.Rank, PACE);
        S.$ui.toasts.push(`Bond with {npc:${id}} reached Rank ${b.Rank}: new profile info unlocked`);
        jnl.push(`Bond with ${id} deepened to Rank ${b.Rank}.`);
        rankedUp(id, b); rankTrust = num(TRU.rank_up, 0);   // 1.4.3: a rank earned together adds Trust (outside the weekly cap)
      } else {
        log.push(`Rank change for ${id} reverted: a rank rises by 1 only through the bond event, once the bond is ready.`);
        b.Rank = b0.Rank;
      }
    } else if (b0 && b.Rank < b0.Rank) {
      b._Event_ready = false; log.push(`Bond with ${id} fell to Rank ${b.Rank}.`);
    }
    let need = needXP(b.Rank, PACE);
    const xpStart = xp;   // 1.4.4: for the recent history
    // XP: talk and hangout once a day each, gifts and help a few times a week; a loved gift counts more from Rank 3
    let gain = 0;
    const d = daily[id] && daily[id].day === dayNo ? daily[id] : { day: dayNo }, w = bweek[id] && bweek[id].w === weekNo ? bweek[id] : { w: weekNo };
    // 1.3.0 Krieg (model B): Rank 1 from his introduction (the 0 -> 1 event is ready at once); then +weekly_xp every Monday while
    // Doves reputation >= min_doves (with hidden magic, also Dove attention <= max_attention), else Tension +1. Nothing from interactions.
    if (id === KR.id) {
      byId[id] = [];
      if (b.Rank === 0) xp = need;
      else if (b0 && b.Rank < 10) for (let k = 0; k < weeksNew; k++) {
        if (repLv('Doves') >= KR.min_doves && !(S.Hidden._True_magic && num(S.Hidden.Dove_attention, 0) > KR.max_attention)) gain += KR.weekly_xp;
        else { b.Tension = _.clamp(num(b.Tension, 0) + 1, 0, 100); log.push(`Krieg: no bond progress this week (Doves reputation ${repLv('Doves')}${S.Hidden._True_magic ? ', Dove attention ' + S.Hidden.Dove_attention : ''}); Tension +1.`); }
      }
    }
    for (const a of byId[id] || []) {
      const k = String((a && a.Kind) || '').trim().toLowerCase();
      if (k === 'talk' || k === 'hangout') {
        if ((d[k] || 0) >= BR.per_day[k]) continue;
        d[k] = (d[k] || 0) + 1; gain += Math.max(0, BR.kind_xp[k] + repMod(id));
      } else if (k === 'gift') {
        if ((w.gift || 0) >= BR.per_week.gift) { log.push(`${id} already had ${BR.per_week.gift} gifts this week: no bond XP for another.`); continue; }
        w.gift = (w.gift || 0) + 1;
        const gk = String((a && a.Gift) || 'neutral').trim().toLowerCase();
        let x = gk in BR.gift_xp ? BR.gift_xp[gk] : BR.gift_xp.neutral;
        if (gk === 'loved' && b.Rank >= BR.gift_bonus_rank) x = Math.round(x * BR.gift_bonus_mult);
        if (gk === 'disliked') b.Tension = _.clamp(num(b.Tension, 0) + BR.gift_disliked_tension, 0, 100);
        gain += x;
      } else if (k === 'help') {
        if ((w.help || 0) >= BR.per_week.help) continue;
        w.help = (w.help || 0) + 1; gain += BR.kind_xp.help;
      }
    }
    // 1.1.0 weather bonus, kept: +1 once a day for time together indoors in bad weather, outdoors in fine weather, a clear Star Night
    if (bondWx && !d.wx && (byId[id] || []).some(a => /^(talk|hangout)$/i.test(String((a && a.Kind) || '').trim()))) { d.wx = 1; gain += BR.weather_xp; }
    // ---- 1.4.3 Trust: drops as the narrator wrote them (x the category), rises only from reported deeds (x the category, capped a
    // week) and a rank earned; a quiet week recovers it towards the floor; then the overrides. tr0 (before this reply) decides what
    // Trust does to Tension and apologies below.
    const RP = trustProfile(id, S, secretOut), RO = RP.o, DH = RP.dh || {};
    const tr0 = b0 ? num(b0.Trust, 50) : num(b.Trust, 50), band0 = trustBand(tr0);
    let tr = num(b.Trust, 50), tdropped = 0, trXP = 0;
    if (b0) {
      if (tr > tr0) { log.push(`${id}'s Trust cannot be raised directly (${tr0} -> ${tr} undone): report the deed as an interaction (keep, secret, defend, confide).`); tr = tr0; }
      const written = tr; let tback = 0; tr = tr0;
      // 1.4.4 (owner): once they understand {{user}} meant no harm, part of the last drop comes back (by nature, once, within 30 days)
      if ((byId[id] || []).some(a => /^understood$/i.test(String((a && a.Kind) || '').trim())) && RO.lock == null) {
        const back = Math.round(num(b.$tlast, 0) * num(RP.C.understood, 0));
        if (b.$tlast > 0 && dayNo - num(b.$tdrop, -99) <= num(TRU.understood_days, 30) && back > 0) { log.push(`${id} understands now: Trust +${back} (part of the last drop).`); tback = back; }
        else if (b.$tlast > 0) log.push(`${id} understands, but it does not give back what was lost${num(RP.C.understood, 0) ? ' (too long ago)' : ' (not in their nature)'}.`);
        b.$tlast = 0;
      }
      tr += tback;
      if (written < tr0) { tdropped = Math.ceil((tr0 - written) * RP.drop); tr -= tdropped; b.$tdrop = dayNo; b.$tlast = tdropped; }
      const kinds = { ...(TRU.kinds || {}), ...(RO.kind_extra || {}) };
      let add = 0;
      for (const a of byId[id] || []) {
        const k = String((a && a.Kind) || '').trim().toLowerCase();
        if (!(k in kinds) || d['tr_' + k]) continue;               // each kind once a day
        d['tr_' + k] = 1;
        add += kinds[k] * (a.Public && (TRU.public_mult || {})[k] ? TRU.public_mult[k] : 1) * num((RO.kind_mult || {})[k], 1);
      }
      add = Math.round(add * RP.rise);
      if (add > 0) {
        const got = Math.min(add, Math.max(0, num(TRU.weekly_cap, 8) - num(w.tr, 0)));
        if (got > 0) { w.tr = num(w.tr, 0) + got; tr += got; }
        if (got < add) log.push(`${id}: Trust rises at most +${TRU.weekly_cap} a week (+${got} of +${add} counted).`);
      }
      tr += rankTrust;
      if (weeksNew > 0 && tr < num(TRU.floor, 35) && RP.recover > 0 && dayNo - num(b.$tdrop, -99) >= 7) tr = Math.min(num(TRU.floor, 35), tr + RP.recover * weeksNew);
      if (RO.lock != null) {                                       // Althair: Trust stays put; a betrayal becomes bond XP
        if (tdropped > 0) {
          const cap = num(tensionProfile(id).daily_cap, 10), x = Math.min(Math.ceil(tdropped * num(RO.convert, 0.5)), Math.max(0, cap - num(d.tx, 0)));
          if (x > 0) { d.tx = num(d.tx, 0) + x; trXP = x; log.push(`${id} enjoyed being betrayed: Trust stays ${RO.lock}, bond XP +${x}.`); }
        }
        tr = RO.lock;
      }
      if (RO.floor_hard != null && tr < RO.floor_hard) {           // Etnie: never below 50; the rest of the blow becomes Tension
        const over = RO.floor_hard - tr; tr = RO.floor_hard;
        if (RO.overflow_to_tension) { b.Tension = _.clamp(num(b.Tension, 0) + over, 0, 100); log.push(`${id} cannot stop trusting {{user}}: it hurts instead (Tension +${over}).`); }
      }
      if (RO.floor_hidden != null) tr = Math.max(RO.floor_hidden, tr);   // Kanae while her Plan is hidden
      if (RO.cap != null) tr = Math.min(RO.cap, tr);                     // Caine and mages, until his secret is out
      if (tdropped >= num((TRU.spread || {}).at, 999) && RO.lock == null) spreadFrom.push(id);
    }
    b.Trust = _.clamp(Math.round(tr), 0, 100);
    gain = Math.round(gain * num(DH.bond_xp_mult, 1));                   // Ottavio and his own Sky students
    // ---- 1.3.8 Tension: Althair's lock, Ezrel's half rises, fights, quiet-day decay, then its effects
    const TP = tensionProfile(id), t0 = b0 ? num(b0.Tension, 0) : num(b.Tension, 0);
    let t = num(b.Tension, 0), tgain = 0;
    if (b0 && t > t0) {
      if (TP.lock) {                                             // Althair: every rise becomes bond XP (/2, rounded up, capped a day)
        const add = Math.min(Math.ceil((t - t0) * (TP.convert || 0.5)), Math.max(0, num(TP.daily_cap, 10) - num(d.tx, 0)));
        if (add > 0) { d.tx = num(d.tx, 0) + add; tgain = add; log.push(`${id} enjoyed that: Tension stays 0, bond XP +${add}.`); }
      } else {
        const small = t - t0 <= num(TRE.small_tension_max, 15);
        const m = TP.riseMult * num(DH.tension_rise_mult, 1) * (band0 === 'Confidant' && small ? num(TRE.confidant_small_tension_mult, 0.5) : band0 === 'Betrayed' ? num(TRE.betrayed_tension_mult, 1.5) : 1);
        if (m !== 1) t = t0 + Math.ceil((t - t0) * m);   // 1.4.3: Trust and the Dorm Head
      }
    }
    if (TP.lock) t = 0;
    // 1.4.0 (owner): an apology eases Tension by the NPC's category (or override); one a day, and each further one in the same week
    // counts half. Some NPCs take it badly (apology_npc, e.g. Sophia: it raises Tension).
    const apo = (byId[id] || []).find(a => /^apolog/i.test(String((a && a.Kind) || '').trim()));
    if (apo && !TP.lock && !d.apology) {
      const A = (TEN.apology_npc || {})[id] || TP.apology || { private: 0, public: 0 };
      let x = num(apo.Public ? A.public : A.private, 0);
      if (num(w.apo, 0) > 0) x = Math.sign(x) * Math.round(Math.abs(x) * num(TE.apology_repeat_mult, 0.5));
      if (x < 0) x = Math.round(x * num((TRE.apology_mult || {})[band0], 1) * num(DH.apology_mult, 1));   // 1.4.3: how much they believe it
      d.apology = 1; w.apo = num(w.apo, 0) + 1;
      if (x < 0 && t > 0) { const was = t; t = Math.max(0, t + x); log.push(`${id} accepted the apology${apo.Public ? ' (in public)' : ''}: Tension ${was} -> ${t}.`); }
      else if (x > 0) { const was = t; t = Math.min(100, t + x); log.push(`The apology made it worse with ${id}: Tension ${was} -> ${t}.`); }
      else if (t > 0) log.push(`An apology changes nothing with ${id}.`);
    }
    if (TP.cat === 'confrontational' && (byId[id] || []).some(a => /^fight$/i.test(String((a && a.Kind) || '').trim())) && !d.fight && t > 0) {
      d.fight = 1; const was = t; t = Math.max(0, t - num(TE.fight_ease, 25)); log.push(`A fight with ${id} cleared the air: Tension ${was} -> ${t}.`);
    }
    // 1.4.4 (owner): kindness eases Tension by the character's nature (kind_ease: help / keep / defend; Social only a public
    // defence), once a day
    if (!TP.lock && t > 0 && !d.kind) {
      const KE = TP.kind_ease || {};
      const hit = (byId[id] || []).map(a => { const k = String((a && a.Kind) || '').trim().toLowerCase(); return k === 'defend' && a.Public && KE.defend_public != null ? KE.defend_public : KE[k]; }).filter(x => x < 0);
      if (hit.length) { const x = Math.min(...hit), was = t; d.kind = 1; t = Math.max(0, t + x); log.push(`${id} took the kindness to heart: Tension ${was} -> ${t}.`); }
    }
    if (b0 && hasB && dayNo > dayNoB && t <= t0 && TP.decay > 0 && t > 0) {   // quiet days (no rise in this update)
      const f = num(b.$tf, 0) + TP.decay * num(DH.tension_decay_mult, 1) * Math.min(60, dayNo - dayNoB), whole = Math.floor(f);
      t = Math.max(0, t - whole); b.$tf = r2(f - whole);
    }
    b.Tension = _.clamp(Math.round(t), 0, 100);
    if (Object.keys(d).length > 1) daily[id] = d;
    if (Object.keys(w).length > 1) bweek[id] = w;
    const cross = at => b0 && t0 < at && b.Tension >= at;
    // a public falling-out costs reputation like a bond milestone earns it (staff: Academy, students: Student, Milena: Doves).
    // 1.3.1: high Tension costs tension_xp, maximum Tension another tension_max_xp; Settings can turn it off. Kanae is exempt.
    if (TU.rep_tension && repOfNpc(id) && !TP.exempt) {
      for (const [at, x, what] of [[REP.tension_high, REP.tension_xp, 'high'], [REP.tension_max, REP.tension_max_xp, 'maximum']]) {
        if (at && x && cross(at)) {
          const got = repAdd(repOfNpc(id), x, `${what} tension with ${id}`, '');
          if (got) log.push(`${what === 'high' ? 'High' : 'Maximum'} tension with ${id}: ${repOfNpc(id)} reputation ${got} XP.`);
        }
      }
    }
    if (TU.rep_tension && TP.enemy_rep && cross(TEN.bands[TEN.bands.length - 1][0])) {   // Social: a gossip campaign
      for (const [r, x] of Object.entries(TP.enemy_rep)) { const got = repAdd(r, x, `${id} turned the students against {{user}}`, ''); if (got) log.push(`${id} turned the room against {{user}}: ${r} reputation ${got} XP.`); }
    }
    if (id === (TEN.krieg && KR.id) && cross(TEN.krieg.at)) {   // Krieg at maximum Tension: the Dovecote turns on {{user}}
      if (S.Hidden._True_magic) { S.Hidden.Dove_attention = _.clamp(num(S.Hidden.Dove_attention, 0) + num(TEN.krieg.attention, 10), 0, 100); log.push(`Krieg has made {{user}} his business: Dove attention +${TEN.krieg.attention}.`); }
      const got = repAdd('Doves', TEN.krieg.doves_xp, 'Krieg turned the Dovecote against {{user}}', ''); if (got) log.push(`Krieg turned the Dovecote against {{user}}: Doves reputation ${got} XP.`);
    }
    if (b.Tension < num(TE.rank_drop_rearm, 70)) b.$tbrk = 0;   // 1.4.4: re-armed once it has really cooled
    if (cross(num(TE.rank_drop_at, 100)) && !TP.exempt && !TP.lock && b.Rank > 0 && !b.$tbrk) {   // maximum Tension breaks a rank (once per blow-up)
      b.$tbrk = 1; b.Rank -= 1; xp = 0; b._Event_ready = false; b.$cool = dayNo + coolDays(b.Rank, PACE); need = needXP(b.Rank, PACE);
      S.$ui.toasts.push(`Bond with {npc:${id}} fell to Rank ${b.Rank}`); jnl.push(`The bond with ${id} broke down to Rank ${b.Rank}.`);
      log.push(`Maximum Tension with ${id}: the bond fell to Rank ${b.Rank}.`);
    }
    // what Tension does to the bond (everyone the same, but Kanae and Althair): Strained halves XP, Enemy stops it
    if (!TP.exempt && !TP.lock) {
      if (b.Tension >= num(TE.stop_xp_from, 90)) gain = 0;
      else if (b.Tension >= num(TE.strained_from, 40)) gain = Math.round(gain * num(TE.strained_xp_mult, 0.5));
    }
    if (trustBand(b.Trust) === 'Betrayed' && RO.lock == null && !RO.no_gates) gain = Math.round(gain * num(TRE.betrayed_xp_mult, 0.5));   // 1.4.3
    gain += tgain + trXP;
    xp = b.Rank >= 10 ? 0 : Math.min(need, xp + gain);          // the bar stops when full, until the event
    b.$xp = xp;
    const ready = b.Rank < 10 && xp >= need && dayNo >= num(b.$cool, -1) && !held(id, b) && !tenseHold(id, b) && !trustHold(id, b);
    if (ready && !b._Event_ready) { b._Event_ready = true; fresh.push(id); }
    else if (!ready) b._Event_ready = false;
    // romance opens at the rank chosen in Settings (default 8); feelings can grow earlier in the story, the flag waits.
    // 1.6.8 (owner): never for a character whose canon has no romance branch (B, D); a romance from an older save stays.
    if (hasB && b.Romance && !(b0 && b0.Romance) && !canRomance(id)) {
      b.Romance = false; log.push(`Romance with ${id} is closed (canon: ${id} does not become a romance); the flag was not set.`);
    } else if (hasB && b.Romance && !(b0 && b0.Romance) && (romRank > 10 || b.Rank < romRank)) {
      b.Romance = false;
      log.push(romRank > 10 ? `Romance flags are off (Settings); ${id}'s was not set.` : `Romance with ${id} opens at Rank ${romRank} (Settings); the flag was not set yet.`);
    } else if (hasB && b.Romance && !(b0 && b0.Romance) && b.Trust < trustGate(id, 8)) {   // 1.4.3
      b.Romance = false; log.push(`Romance with ${id} needs Trust ${trustGate(id, 8)} (now ${b.Trust}); the flag was not set yet.`);
    }
    // 1.6.8: the branch the bond took, recorded once when it reaches Rank 8 (a romance flag accepted later turns it into a romance).
    // 1.6.9 (bug hunt): decided by the Trust the 7->8 event was played on (before this reply's +3 for the rank), so a rivalry the
    // narrator was told to play at Trust 47-49 is not recorded as a best friendship.
    const tr8 = num(b0 && b0.Rank < 8 ? b0.Trust : b.Trust, 50);
    if (hasB && b.Romance && !(b0 && b0.Romance)) b.$branch = 'romance';
    else if (hasB && b.Rank >= 8 && !b.$branch) b.$branch = b.Romance ? 'romance' : canRival(id) && tr8 < trustGate(id, 8) ? 'rival' : 'friend';
    else if (b.Rank < 8 && b.$branch) b.$branch = '';
    // 1.4.4 (owner): the bond's recent history with {{user}}: when, one sentence (the narrator's Note, else the kinds), the effect.
    // Only what {{user}} did or reported: quiet-day easing and weekly recovery write no row.
    if (hasB) {
      const fx = [], dx = b.Rank < rank0 ? 0 : Math.max(0, num(b.$xp, 0) - xpStart), dT = b.Trust - (b0 ? num(b0.Trust, 50) : b.Trust), dX = b.Tension - (b0 ? num(b0.Tension, 0) : b.Tension);
      if (b0 && b.Rank > rank0) fx.push(`Rank ${rank0} → ${b.Rank}`); else if (b0 && b.Rank < rank0) fx.push(`Rank fell to ${b.Rank}`);
      if (dx > 0) fx.push(`XP +${dx}`); if (trXP + tgain > 0 && !dx) fx.push('enjoyed it');
      const sg = x => (x > 0 ? '+' + x : '−' + Math.abs(x));
      if (dT) fx.push(`Trust ${sg(dT)}`); if (dX) fx.push(`Tension ${sg(dX)}`);
      if (b.Romance && !(b0 && b0.Romance)) fx.push('romance');
      const notes = [...new Set(acts.map(a => String((a && a.Note) || '').trim()).filter(Boolean))];
      const PH = (BR.recent || {}).phrases || {}, kinds = [...new Set(acts.map(a => String((a && a.Kind) || '').trim().toLowerCase()).filter(k => PH[k]))].map(k => PH[k]);
      const said = notes.join(' ') || (kinds.length ? kinds.join(', ').replace(/^./, c => c.toUpperCase()) + '.' : '');
      if (!b0) b.$Recent.push({ w: stamp(S.World), n: `First met, at ${S.World.Location}.`, fx: b.Rank > 0 ? `Bond starts at Rank ${b.Rank}` : '' });
      else if (acts.length || fx.length && (b.Rank !== rank0 || trw0 !== num(b0.Trust, 50) || tw0 !== num(b0.Tension, 0) || dx > 0))
        b.$Recent.push({ w: stamp(S.World), n: said || '(no note)', fx: fx.join(', ') });
      b.$Recent = b.$Recent.slice(-num((BR.recent || {}).keep, 10));
      // 1.6.0 (P4): defining moments. A big row (a rank changed, Trust moved 15+, Tension rose 20+, romance began) is also kept
      // for good; at most DEFINING_MAX, the smallest leaves first (ties: the older one)
      const big = (b0 && b.Rank !== rank0 ? 3 : 0) + (Math.abs(dT) >= 15 ? Math.abs(dT) / 5 : 0) + (dX >= 20 ? dX / 10 : 0) + (b.Romance && !(b0 && b0.Romance) ? 3 : 0);
      if (b0 && big > 0) {
        const r = b.$Recent[b.$Recent.length - 1];
        b.$Defining = [...b.$Defining, { w: r.w, n: r.n, fx: r.fx, s: Math.round(big * 10) / 10 }];
        while (b.$Defining.length > DEFINING_MAX) { let lo = 0; b.$Defining.forEach((x, i) => { if (x.s < b.$Defining[lo].s) lo = i; }); b.$Defining.splice(lo, 1); }
      }
    }
  }
  // ---- 6c. 1.6.0 (Batch C, P4/N4): what each character carries of {{user}}. Knows: dated, the latest KNOWS_VISIBLE (older
  // lines move to $Knows_old). Imprints: weight 5+, at most IMPRINT_MAX; over the cap the lightest goes, and the new one must
  // outweigh it; a "fixed" character (data/npc_canon.json Change) is never rewritten, only deepened; a "shaped" or "fluid" one keeps
  // what the belief replaced (Was). Next (Rank NEXT_RANK+): their own plan when they leave; brought back when they meet {{user}}
  // again ("since you last saw them") or, once it lapses unseen, moved into $Recent. Meanwhile: Rank MEANWHILE_RANK+ bonds unseen
  // for a week get one Journal line a week about their own life.
  {
    const presentIds = new Set(Object.keys(S.Scene.Present || {}));
    const wasHere = new Set(Object.keys((hasB && B.Scene && B.Scene.Present) || {}));
    const since = [], mayBe = [];
    for (const [id, b] of Object.entries(S.Bonds)) {
      const b0 = BB[id] || null;
      b.Knows = (Array.isArray(b.Knows) ? b.Knows : []).map(k => String(k).trim()).filter(Boolean);
      const old0 = new Set(b0 ? [...(b0.Knows || []), ...(b0.$Knows_old || [])] : []);
      b.Knows = [...new Set(b.Knows)].map(k => (old0.has(k) || /^\[M\d{1,2} W[1-4]/.test(k) ? k : `[${dstamp(S.World)}] ${k}`));
      if (b.Knows.length > KNOWS_VISIBLE) { b.$Knows_old = [...b.$Knows_old, ...b.Knows.slice(0, b.Knows.length - KNOWS_VISIBLE)].slice(-40); b.Knows = b.Knows.slice(-KNOWS_VISIBLE); }
      // Imprints
      const I0 = b0 ? (b0.Imprints || []) : [], key = x => String(x.Belief || '').trim().toLowerCase();
      let I = (Array.isArray(b.Imprints) ? b.Imprints : []).filter(x => x && String(x.Belief || '').trim());
      const fresh = I.filter(x => !I0.some(y => key(y) === key(x)));
      for (const x of fresh) {
        if (!x.When) x.When = dstamp(S.World);
        if (num(x.Weight, 0) < 5) { I = I.filter(y => y !== x); log.push(`An Imprint for ${id} needs weight 5 or more (an experience that changes who they are); "${x.Belief}" was not kept. Record smaller moments as Known_facts or Knows.`); }
      }
      while (I.length > IMPRINT_MAX) {
        const kept = I.filter(y => !fresh.includes(y)), x = fresh.find(y => I.includes(y));
        if (!x) { I = I.slice(-IMPRINT_MAX); break; }
        let lo = null; for (const y of kept) if (!lo || num(y.Weight, 0) < num(lo.Weight, 0)) lo = y;
        const ch = CHANGE[id] || '';
        if (ch === 'fixed' || !lo || num(x.Weight, 0) <= num(lo.Weight, 0)) {
          I = I.filter(y => y !== x);
          log.push(ch === 'fixed' ? `${id} does not change at the core (fixed): with ${IMPRINT_MAX} Imprints, a new one can only deepen a belief they hold (edit its Weight), not replace one. "${x.Belief}" was not kept.`
            : `${id} already holds ${IMPRINT_MAX} Imprints; "${x.Belief}" (weight ${num(x.Weight, 0)}) does not outweigh the lightest one, so it was not kept.`);
        } else { x.Was = lo.Belief; I = I.filter(y => y !== lo); log.push(`${id}'s Imprint "${lo.Belief}" gave way to "${x.Belief}".`); }
      }
      b.Imprints = I.map(x => ({ Belief: String(x.Belief).trim(), Weight: _.clamp(Math.round(num(x.Weight, 5)), 5, 10), When: String(x.When || ''), From: String(x.From || ''), Was: String(x.Was || '') }));
      // Next
      let nx = b.Next && typeof b.Next === 'object' && String(b.Next.What || '').trim() ? { What: String(b.Next.What).trim(), Where: String(b.Next.Where || '').trim(), Until: String(b.Next.Until || '').trim() } : null;
      if (nx && b.Rank < NEXT_RANK) { if (!(b0 && b0.Next)) log.push(`Next plans are kept for bonds of Rank ${NEXT_RANK} or more; ${id}'s was not kept.`); nx = null; }
      const until = nx ? parseWhen(nx.Until, S.World, absA) : -1;
      if (nx && presentIds.has(id) && !wasHere.has(id) && b0 && b0.Next) {
        since.push([id, nx.What + (nx.Where ? ' (' + nx.Where + ')' : ''), nx.Until]); nx = null;
      } else if (nx && until >= 0 && until < absA && !presentIds.has(id)) {
        b.$Recent = [...b.$Recent, { w: String(nx.Until || stamp(S.World)), n: `(Off-screen) ${nx.What}${nx.Where ? ' (' + nx.Where + ')' : ''}.`, fx: '' }].slice(-num((BR.recent || {}).keep, 10)); nx = null;
      } else if (nx && !presentIds.has(id) && nx.Where && placeOf(canonLocation(nx.Where)).toLowerCase() === placeOf(S.World.Location).toLowerCase() && (until < 0 || absA <= until)) mayBe.push([id, nx.What]);
      b.Next = nx;
      // Meanwhile
      if (presentIds.has(id)) b.$seen = dayNo;
      const wk = Math.floor(dayNo / 7);
      if (hasB && b.Rank >= MEANWHILE_RANK && !presentIds.has(id) && b.$seen >= 0 && dayNo - b.$seen >= 7 && b.$mw !== wk && !S.Trip.Active) {
        b.$mw = wk;
        const what = b.Next ? b.Next.What : (HAUNT[id] ? 'was seen around ' + HAUNT[id].split(/[;,]/)[0].trim() : 'kept to their own business');
        jnl.push(`Meanwhile: ${id} ${b.Next ? 'is busy with ' + what.replace(/^./, c => c.toLowerCase()) : what}.`);
      }
    }
    S.$ui.since = since; S.$ui.maybe = mayBe;
  }
  // 1.4.3: word of a betrayal reaches the NPC's friends (their Friends lines), once; then the Rank 10 benefits Trust suspends
  for (const id of spreadFrom) {
    const hit = ((TRU.friends || {})[id] || []).filter(f => S.Bonds[f] && f !== id && ((TRU.overrides || {})[f] || {}).lock == null);
    for (const f of hit) {
      const o = (TRU.overrides || {})[f] || {}, was = S.Bonds[f].Trust; S.Bonds[f].Trust = Math.max(o.floor_hard != null ? o.floor_hard : 0, was + num(TRU.spread.friends, -5)); S.Bonds[f].$tdrop = dayNo;
      if (was !== S.Bonds[f].Trust) S.Bonds[f].$Recent = [...(S.Bonds[f].$Recent || []), { w: stamp(S.World), n: `Heard what {{user}} did to ${id}.`, fx: `Trust −${was - S.Bonds[f].Trust}` }].slice(-num((BR.recent || {}).keep, 10));   // 1.4.4
    }
    if (hit.length) log.push(`Word of what {{user}} did to ${id} reached ${hit.join(', ')}: their Trust ${TRU.spread.friends}.`);
  }
  S.$ui.tsusp = Object.entries(S._Perks || {}).filter(([, p]) => p.Kind === 'rank10' && S.Bonds[p.From] && trustGate(p.From, 10) && S.Bonds[p.From].Trust < num(TRU.suspend_r10_below, 35)).map(([k]) => k);
  S.$eng.bondv = 2;
  S.$eng.tenv = 1;   // 1.3.8: $ms filled for bonds from before
  for (const k of Object.keys(bweek)) if (bweek[k].w !== weekNo) delete bweek[k];
  S.$eng.bweek = bweek;
  // what the UI and the Now entry show: bonds whose bar is full (event ready now, or after the cooldown)
  const bev = {}, present = new Set(Object.keys(S.Scene.Present || {}));
  // 1.6.8 (owner): what the 7->8 event may turn into for this character (branch, Trust, and the romance setting)
  const rank8Way = (id, b) => canRival(id) && b.Trust < trustGate(id, 8) ? `${id}'s Trust is ${b.Trust} (under ${trustGate(id, 8)}): this bond can only turn into a sworn rivalry here, not a best friendship or a romance.`
    : canRomance(id) && romRank <= 8 ? `This bond can turn into a best friendship or a romance here; not a rivalry.`
    : `This bond can only turn into a best friendship here${canRomance(id) ? ' (romance is closed at this rank in Settings)' : ''}; not a romance or a rivalry.`;
  for (const [id, b] of Object.entries(S.Bonds)) {
    if (b.Rank >= 10 || num(b.$xp, 0) < needXP(b.Rank, PACE)) continue;
    const e = BEV.find(x => x.npc === id && x.rank === b.Rank) || null;
    if (held(id, b)) { bev[id] = { r: b.Rank, ready: false, in: 0, held: 1, where: '', when: '', now: false, s: 0, dir: '' }; continue; }
    if (tenseHold(id, b)) { bev[id] = { r: b.Rank, ready: false, in: 0, held: 1, why: 'tension', where: '', when: '', now: false, s: 0, dir: '' }; continue; }
    if (trustHold(id, b)) { bev[id] = { r: b.Rank, ready: false, in: 0, held: 1, why: 'trust', need: trustGate(id, b.Rank + 1), where: '', when: '', now: false, s: 0, dir: '' }; continue; }
    const now = !!b._Event_ready && present.has(id) && (!e || bondEventOk(e, S));
    const RW = (REW.npcs || {})[id] || {}, rw = b.Rank === 4 ? RW.gift : b.Rank === 9 ? RW.r10 : null;
    const extra = [rw ? `${b.Rank === 4 ? 'This event gives {{user}} ' + id + "'s gift" : 'This event gives {{user}} ' + id + "'s Rank 10 benefit"} (${rw.name}): ${rw.text}${rw.secret ? ' (Narrator only: ' + rw.secret + ')' : ''} The engine records it when the rank rises.` : '',
      b.Rank === 7 && MASK.has(id) && RW.nudge ? `This event carries a nudge: ${RW.nudge.text} The engine adds the Fact "${RW.nudge.fact}" when the rank rises.` : '',
      b.Rank === 7 ? rank8Way(id, b) : ''].filter(Boolean).join('\n');   // 1.4.3; 1.6.8 per branch
    bev[id] = { r: b.Rank, ready: !!b._Event_ready, in: Math.max(0, num(b.$cool, -1) - dayNo),
      where: e && e.where && e.where.length ? e.where.join(' or ') : (HAUNT[id] || ''),
      when: e ? [e.days && e.days.length ? e.days.join('/') : '', e.time ? e.time.join('–') : ''].filter(Boolean).join(', ') : '',
      now, s: e ? 1 : 0, dir: now ? [(e ? e.text : (BR.themes || {})[String(b.Rank)] || ''), extra].filter(Boolean).join('\n') : '' };
  }
  S.$ui.bev = bev;
  // 1.5.0 (N3a): a bond is "close" when its XP reaches close_at of the next rank's need before the bar is full; <now> marks it
  S.$ui.close = Object.entries(S.Bonds).filter(([id, b]) => b.Rank < 10 && !bev[id] && num(b.$xp, 0) >= Math.ceil(needXP(b.Rank, PACE) * num(BR.close_at, 0.8))).map(([id]) => id);
  for (const id of fresh) {
    const v = bev[id] || {};
    log.push(`Bond with ${id} is ready for its Rank ${S.Bonds[id].Rank + 1} event${v.where ? ` (likely at ${v.where}${v.when ? ', ' + v.when : ''})` : ''}.`);
    S.$ui.toasts.push(`Bond event ready: {npc:${id}}${v.where ? ` (${v.where}${v.when ? ', ' + v.when : ''})` : ''}`);
  }
  for (const b of Object.values(S.Bonds)) {
    if ((b.Known_facts || []).length > FACTS_VISIBLE) {
      const over = b.Known_facts.slice(0, b.Known_facts.length - FACTS_VISIBLE);
      b.$Known_old = [...(b.$Known_old || []), ...over].slice(-40); b.Known_facts = b.Known_facts.slice(-FACTS_VISIBLE);
    }
  }
  for (const id of Object.keys(daily)) if (daily[id].day !== dayNo) delete daily[id];
  S.$eng.daily = daily;

  // ---- 6b. 1.3.0 training: Mana pool (Mana_max) and Stamina (Stamina_max). The narrator reports sessions in /Training. One session
  // adds TRN.session_pct % of the starting value x (1 + partner bonuses), at most TRN.weekly_pct % a week and TRN.total_pct % in all.
  // Partners: an NPC whose Rank 5 gift is a training bonus for that track, in the scene. Jumps (rewards) skip the weekly limit only.
  function trainRoom(k, weekly) {
    const T = S.Player.$Training[k]; if (!T) return 0;
    if (T.w !== weekNo) { T.w = weekNo; T.wg = 0; }
    const tot = TU.trn_total > 0 ? T.base * TU.trn_total / 100 - T.gain : Infinity;   // 1.3.1 Settings: 0 = no limit
    return Math.max(0, weekly && TU.trn_week > 0 ? Math.min(T.base * TU.trn_week / 100 - T.wg, tot) : tot);
  }
  function trainAdd(k, amt, weekly) {
    const T = S.Player.$Training[k], f = TRN.tracks[k].field, add = r2(Math.max(0, Math.min(amt, trainRoom(k, weekly))));
    if (add > 0) { S.Player.Vitals[f] = r2(S.Player.Vitals[f] + add); T.gain = r2(T.gain + add); if (weekly) T.wg = r2(T.wg + add); }
    return add;
  }
  function trainJump(k, why) {
    const T = S.Player.$Training[k]; if (!T) return;
    const add = trainAdd(k, T.base * REW.jump_pct / 100, false);
    log.push(add > 0 ? `${TRN.tracks[k].label} +${add} at once (${why}).` : `${TRN.tracks[k].label} is already at its training limit; ${why} adds nothing.`);
    if (add > 0) S.$ui.toasts.push(`${TRN.tracks[k].label} +${add}`);
  }
  {
    const here = new Set(Object.keys(S.Scene.Present || {}).map(canon));
    // 1.7.0: a Rank 10 benefit can carry the training bonus too (Linus: mana, Tsubaki: stamina); a suspended benefit (low Trust) does not count
    const partners = k => Object.entries(REW.npcs || {}).filter(([id, x]) => here.has(id) && ['gift', 'r10'].some(g => x[g] && x[g].train === k && S._Perks[x[g].name] && !(S.$ui.tsusp || []).includes(x[g].name))).map(([id]) => id);
    for (const x of (Array.isArray(S.Training) ? S.Training : [])) {
      const k = /mana/.test(x.Track) ? 'mana' : /stam/.test(x.Track) ? 'stamina' : '';
      if (!k || !S.Player.$Training[k]) { log.push(`Training track "${x.Track}" is unknown (use mana or stamina); nothing was added.`); continue; }
      const T = S.Player.$Training[k], pr = partners(k), mult = 1 + pr.length * REW.train_bonus, lab = TRN.tracks[k].label;
      const add = trainAdd(k, T.base * TU.trn_session / 100 * mult, true), lim = TU.trn_total > 0 ? r2(T.base * TU.trn_total / 100) : 0;
      if (add > 0) log.push(`Training: ${lab} +${add}${pr.length ? ` (with ${pr.join(' and ')}, x${mult})` : ''}; ${r2(T.gain)}${lim ? ` of ${lim}` : ''} trained so far.`);
      else log.push(lim && T.gain >= lim ? `Training: ${lab} has reached its limit (+${TU.trn_total}% of the starting value); training keeps {{user}} in shape but adds no more.` : `Training: ${lab} already gained all it can this week.`);
    }
    S.Training = [];
  }
  // ---- 6c. 1.3.0 one-use perks spent this reply (/Perk_use). Kuroo's and Milena's Rank 10 favours lift a negative reputation one level.
  for (const key of (Array.isArray(S.Perk_use) ? S.Perk_use : [])) {
    const k = Object.keys(S._Perks || {}).find(x => x === key) || Object.keys(S._Perks || {}).find(x => x.toLowerCase() === String(key).trim().toLowerCase());
    if (!k) { log.push(`Perk "${key}" is not held; nothing was spent.`); continue; }
    const p = S._Perks[k], fx = (((REW.npcs || {})[p.From]) || {})[p.Kind === 'gift' ? 'gift' : 'r10'] || {};
    if (!(p.Uses > 0)) { log.push(`"${k}" is not a one-use perk; nothing to spend.`); continue; }
    if ((S.$ui.tsusp || []).includes(k)) { log.push(`"${k}" is suspended while ${p.From}'s Trust is low; it was kept.`); continue; }   // 1.4.3
    if (fx.rep_token) {
      if (!repLevelUp(fx.rep_token, true)) { log.push(`"${k}" only works while ${fx.rep_token} reputation is below 0 (now ${repLv(fx.rep_token)}); it was kept.`); continue; }
      log.push(`${fx.rep_token} reputation rose one level ("${k}").`);
    }
    p.Uses -= 1;
    if (p.Uses <= 0) { delete S._Perks[k]; S.$ui.perks_used = [...(S.$ui.perks_used || []), `${k} (${p.From}), ${dstamp(S.World)}`].slice(-60); }
    S.$ui.toasts.push(`Used: ${k}`); jnl.push(`{{user}} used ${k} (from ${p.From}).`);
  }
  S.Perk_use = [];
  repSync(true);
  S.$eng.repw = repw;

  // ---- 7. hidden magic ----
  const Hd = S.Hidden;
  // 1.1.0 (Full): outdoors in fog, heavy rain, a storm or a blizzard the hidden magic is harder to notice: the rise is halved (rounded up)
  if (wxNow && hasB && Hd._True_magic && isOutdoor(S.World.Location) && (wxNow.sky === 'Fog' || wxHeavy(wxNow))) {
    const was = (B.Hidden && B.Hidden.Dove_attention) || 0, rise = Hd.Dove_attention - was;
    if (rise > 0) { Hd.Dove_attention = was + Math.ceil(rise / 2); log.push(`Dove attention rise halved by the weather (outdoors, ${wxText(wxNow)}): +${Math.ceil(rise / 2)} instead of +${rise}.`); }
  }
  const stageOf = a => (a < 20 ? 'Unnoticed' : a < 40 ? 'Rumoured' : a < 60 ? 'Watched' : a < 80 ? 'Investigated' : 'Exposed');
  const stg = stageOf(Hd.Dove_attention);
  if (Hd._True_magic && Hd._Stage !== stg) { log.push(`Dove attention is now: ${stg}.`); S.$ui.toasts.push(`Dove attention: ${stg}`); }
  for (const [id, o] of Object.entries(TRU.overrides || {})) {   // 1.4.3: Krieg learns the hidden magic: his Trust is gone
    if (o.zero_at_stage && Hd._True_magic && stg === o.zero_at_stage && S.Bonds[id] && S.Bonds[id].Trust > 0) {
      S.Bonds[id].$Recent = [...(S.Bonds[id].$Recent || []), { w: stamp(S.World), n: 'Learned what {{user}} has been hiding.', fx: `Trust −${S.Bonds[id].Trust}` }].slice(-num((BR.recent || {}).keep, 10));   // 1.4.4
      S.Bonds[id].Trust = 0; S.Bonds[id].$tdrop = dayNo; log.push(`${id} knows what {{user}} hid: Trust 0.`);
    }
  }
  Hd._Stage = stg;

  // ---- 8. monthly payout ----
  if (hasB) {
    const mi = W => ((W.Year || 1) - 1) * 12 + W.Month;
    const crossed = Math.min(12, mi(S.World) - mi(B.World));
    for (let i = 0; i < crossed; i++) {
      const r = S.Player.Profile.Dorm_rank || 0;
      let pay = S.Player.Profile.Dorm === 'Unsorted' ? 0 : r <= 0 ? 300 : PAYOUT.find(([max]) => r <= max)[1];
      const acad = repLv('Academy');
      if (pay && acad <= -5) pay = Math.floor(pay / 2);          // 1.3.0: academic probation halves the payout
      if (pay) {
        S.Player.Wallet.Points += pay;
        S.Player.Wallet.Transactions.push(`+${pay} monthly payout (dorm rank ${r || 'unranked'}${acad <= -5 ? ', halved: academic probation' : ''})`);
        log.push(`Monthly payout: +${pay} points (dorm rank ${r || 'unranked'}${acad <= -5 ? ', halved on academic probation' : ''}).`);
      }
      // 1.3.0: Academy +5 bonus, and points from bond rewards (data/bond_rewards.json monthly)
      const extra = [...(acad >= 5 && S.Player.Profile.Dorm !== 'Unsorted' ? [[REP.academy5_monthly, 'honoured student bonus (Academy reputation +5)']] : []),
        ...Object.values(S._Perks || {}).map(p => (((REW.npcs || {})[p.From] || {})[p.Kind === 'gift' ? 'gift' : 'r10'] || {}).monthly).filter(Boolean).map(m => REW.monthly[m])];
      for (const [pts, why] of extra) {
        S.Player.Wallet.Points += pts; S.Player.Wallet.Transactions.push(`+${pts} ${why}`); log.push(`Monthly: +${pts} points, ${why}.`);
      }
    }
    S.Player.Wallet.Transactions = S.Player.Wallet.Transactions.slice(-20);
  }

  // ---- 8b. Batch 5.1 records: commitments, notices, letters, clues, journal ----
  const newKeys = (cur, prev) => Object.keys(cur || {}).filter(k => !(prev && k in prev));
  // commitments: computed due text, overdue flag (logged once, when it turns overdue)
  const BC = (hasB && B.Commitments) || {};
  for (const [k, c] of Object.entries(S.Commitments || {})) {
    // v1.0.3 (A#2/F04): parse Due once (new record or new Due text) and keep that target; "tomorrow" must not drift every turn
    const c0 = BC[k];
    const abs = c0 && c0.Due === c.Due && c0.$abs >= 0 ? c0.$abs : parseWhen(c.Due, S.World, absA);
    c.$abs = abs; c._When = whenText(abs, absA);
    const late = abs >= 0 && abs < absA;
    if (late && !(BC[k] && BC[k]._Late)) { log.push(`"${k}" is overdue (was due ${c.Due}${c.With ? `, with ${c.With}` : ''}): resolve it in the story, then remove it.`); S.$ui.toasts.push(`Overdue: ${k}`); }
    c._Late = late;
  }
  // notices: stamp, expire, cap
  const BN = (hasB && B.Notices) || {};
  for (const k of newKeys(S.Notices, BN)) { if (!S.Notices[k].Posted) S.Notices[k].Posted = dstamp(S.World); if (hasB) S.$ui.toasts.push(`New notice: ${k}`); }
  for (const [k, nt] of Object.entries(S.Notices || {})) {
    const n0 = BN[k], u = n0 && n0.Until === nt.Until && n0.$abs >= 0 ? n0.$abs : parseWhen(nt.Until, S.World, absA);
    nt.$abs = u;
    if (u >= 0 && u < absA - 60) delete S.Notices[k];
  }
  capRecord(S.Notices, CAP.Notices);
  // letters: stamp, direction, cap (read/sent ones go first)
  const BL = (hasB && B.Letters) || {};
  const me = new Set(['{{user}}', 'you', 'me', 'i', String(S.Player.Profile.Name || '').toLowerCase()].filter(Boolean).map(x => x.toLowerCase()));
  for (const k of newKeys(S.Letters, BL)) {
    const L = S.Letters[k];
    if (!L.Date) L.Date = dstamp(S.World);
    if (me.has(String(L.From).trim().toLowerCase())) L.Status = 'sent';
    else if (L.Status === 'waiting' && hasB) S.$ui.toasts.push(`Letter waiting at the Mail Tower${L.From ? ` (from ${L.From})` : ''}`);
  }
  capRecord(S.Letters, CAP.Letters, L => L.Status !== 'waiting');
  // clues and mysteries
  const BCl = (hasB && B.Clues) || {}, BMy = (hasB && B.Mysteries) || {};
  for (const k of newKeys(S.Clues, BCl)) {
    const c = S.Clues[k];
    if (!c.Found) c.Found = dstamp(S.World);
    if (hasB) S.$ui.toasts.push(`New clue: ${k}`);
  }
  for (const c of Object.values(S.Clues || {})) {
    c.Links = [...new Set((c.Links || []).map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
    if (!(c.Thread in S.Mysteries)) S.Mysteries[c.Thread] = { Status: 'open', Summary: '' };
  }
  for (const [k, my] of Object.entries(S.Mysteries || {})) {
    if (my.Status === 'solved' && (!BMy[k] || BMy[k].Status !== 'solved') && hasB) { jnl.push(`Solved: ${k}${my.Summary ? ` (${my.Summary})` : ''}.`); S.$ui.toasts.push(`Mystery solved: ${k}`); }
  }
  capRecord(S.Clues, CAP.Clues);
  // ---- 8c. Batch 5.2: club, competition, projects, trip ----
  const canonList = a => [...new Set((a || []).map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
  if (hasB) {
    const c0 = B.Player.Profile.Club || '', c1 = S.Player.Profile.Club || '';
    if (c0 !== c1) jnl.push(c1 ? `Joined the ${c1}.` : `Left the ${c0}.`);
  }
  const Co = S.Competition, Co0 = (hasB && B.Competition) || {};
  Co.Team = canonList(Co.Team);
  if (hasB && Co.Status && (Co.Status !== Co0.Status || Co.Tier !== Co0.Tier)) {
    const what = { entered: 'Entered', qualified: 'Qualified from', eliminated: 'Eliminated from', champion: 'Won', selected: 'Selected for' }[Co.Status];
    jnl.push(`${what} the ${Co.Tier || 'current'} Competition${Co.Placement ? ` (${Co.Placement})` : ''}.`);
    S.$ui.toasts.push(`Competition: ${Co.Status}${Co.Tier ? ` (${Co.Tier})` : ''}`);
    const prize = `Kingdom-Y${S.World.Year}`, paid = S.$eng.prizes || (S.$eng.prizes = []);
    if (Co.Tier === 'Kingdom' && Co.Status === 'champion' && !paid.includes(prize)) {   // v1.0.3 (F08): once per year's competition
      paid.push(prize);
      S.Player.Wallet.Points += KINGDOM_PRIZE;
      S.Player.Wallet.Transactions = [...S.Player.Wallet.Transactions, `+${KINGDOM_PRIZE} Kingdom Competition prize`].slice(-20);
      log.push(`Kingdom Competition won: +${KINGDOM_PRIZE} points paid to each member of the team.`);
    }
  }
  const BP = (hasB && B.Projects) || {};
  for (const [k, pj] of Object.entries(S.Projects || {})) {
    pj.With = canonList(String(pj.With || '').split(/\s*,\s*/).filter(Boolean)).join(', ');
    if (pj.Progress >= 100 && hasB && (!BP[k] || BP[k].Progress < 100)) { jnl.push(`Finished: ${k}.`); S.$ui.toasts.push(`Project complete: ${k}`); }
  }
  const Tr = S.Trip, Tr0 = (hasB && B.Trip) || {};
  Tr.Companions = canonList(Tr.Companions);
  if (hasB && Tr.Active !== !!Tr0.Active) jnl.push(Tr.Active ? `Set off for ${Tr.Destination || 'a trip'}.` : `Back from ${Tr0.Destination || Tr.Destination || 'the trip'}.`);

  // ---- 8e. v1.0.3 new school year: a new class of first-years (incoming cohorts from data/cohorts.json) ----
  {
    const seen = S.$eng.cohorts || (S.$eng.cohorts = []);
    for (let Y = 2; hasB && Y <= S.World.Year; Y++) {
      if (seen.includes(`Y${Y}`)) continue;
      seen.push(`Y${Y}`);
      const ids = Object.keys(ARRIVES).filter(id => ARRIVES[id] === Y);
      jnl.push(`A new class of first-years arrived at Halvard for the Year ${Y} Entrance Event.`);
      S.$ui.toasts.push('New first-years have arrived at Halvard');
      if (ids.length) log.push(`New first-years this year (now in the NPC roster): ${ids.join(', ')}.`);
    }
  }
  // ---- 8d. v1.0.3 graduation: the morning after Graduation (M12 W1 Mon 07:00) that year's third-years leave campus ----
  {
    const done = S.$eng.grads || (S.$eng.grads = []), G = S.Campus_State.Graduated || (S.Campus_State.Graduated = []);
    for (let Y = 1; hasB && Y <= S.World.Year; Y++) {
      if (done.includes(`Y${Y}`) || absA < toAbs({ Year: Y, Month: 12, Week: 1, Day: 'Mon', Time: '07:00' })) continue;
      done.push(`Y${Y}`);
      const left = Object.keys(STUDENTS).filter(id => yearOf(id, Y) === 3 && !G.includes(id));
      G.push(...left);
      if (left.length) {
        jnl.push(`The third-years graduated and left Halvard: ${left.join(', ')}.`);
        S.$ui.toasts.push(`Graduates have left campus: ${left.map(id => `{npc:${id}}`).join(', ')}`);
        log.push(`Graduation departures: ${left.join(', ')} left campus (Campus_State.Graduated). If the story keeps one (repeating the year, staying as staff), remove that name.`);
      }
    }
    S.Campus_State.Graduated = [...new Set(G.map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
  }

  // ---- 8f. 1.1.0 story hooks: narrator-side debts. Due anchored once like Commitments; state waiting | due | overdue | old ----
  {
    const BH = (hasB && B.Hooks) || {};
    for (const [k, hk] of Object.entries(S.Hooks || {})) {
      const h0 = BH[k];
      if (h0 && !(hk.$born >= 0) && h0.$born >= 0) hk.$born = h0.$born;             // a whole-record replace keeps the birth time
      if (!(hk.$born >= 0)) hk.$born = absA;
      if (!hk.Planted) hk.Planted = (h0 && h0.Planted) || dstamp(S.World);
      const abs = hk.Due ? (h0 && h0.Due === hk.Due && h0.$abs >= 0 ? h0.$abs : parseWhen(hk.Due, S.World, absA)) : -1;
      hk.$abs = abs;
      hk.Who = canonList(String(hk.Who || '').split(/\s*,\s*/).filter(Boolean)).join(', ');
      const st = abs >= 0 ? (absA < abs - 30 ? 'waiting' : absA <= abs + 180 ? 'due' : 'overdue')
        : (hk.Weight >= 2 && absA - hk.$born >= 14 * DAY_MIN ? 'old' : 'waiting');
      if (st === 'due' && (!h0 || h0._State !== 'due')) log.push(`Hook due now: \"${k}\"${hk.Who ? ` (${hk.Who})` : ''}. Pay it off, break it, or drop it.`);
      hk._State = st;
    }
    capRecord(S.Hooks, CAP_HOOKS, h => h.Weight === 1);                          // over the cap: Weight-1 hooks go first, oldest first
  }
  // ---- 8g. 1.1.0 gossip: each rumour's fate and reach by age; fizzled (day 3) and old (day 21) ones leave Campus_State.Rumours ----
  if (OFF.has('gossip')) S.$ui.gossip = [];
  else {
    const R = _.isPlainObject(S.$eng.rum) ? S.$eng.rum : (S.$eng.rum = {}), live = S.Campus_State.Rumours || [];
    for (const r of Object.keys(R)) if (!live.includes(r)) delete R[r];         // the story removed it: drop its metadata
    const keep = [], gone = [];
    for (const r of live) {
      if (!R[r]) { const d20 = hash32(seed, r, 'rum') % 20 + 1; R[r] = { born: dayNo, fate: d20 <= 3 ? 'fizzle' : d20 >= 18 ? 'fast' : 'normal' }; }
      const age = dayNo - R[r].born;
      if ((R[r].fate === 'fizzle' && age >= 3) || age >= 21) { gone.push(r); delete R[r]; } else keep.push(r);
    }
    if (gone.length) {
      S.Campus_State.Rumours = keep; S.$ui.rumours_old = [...S.$ui.rumours_old, ...gone].slice(-50);
      log.push(`Rumours that have died out (removed; do not bring them back unless something revives them): ${gone.map(r => `\"${r}\"`).join('; ')}.`);
    }
    S.$ui.gossip = keep.map(r => [r, REACH(R[r], dayNo - R[r].born), dayNo - R[r].born]);
  }
  // ---- 8h. 1.1.0 inventory (the Bag): merge case duplicates, remove at Qty 0, Sunfizz bottles, cap 40 (never gear) ----
  {
    const I = S.Inventory || (S.Inventory = {}), BI = (hasB && B.Inventory) || {};
    const groups = _.groupBy(Object.keys(I), k => k.trim().toLowerCase());
    for (const ks of Object.values(groups)) {
      const main = ks.find(k => k in BI) || ks[0], rec = { ...I[main] };
      for (const k of ks) if (k !== main) {
        const o = I[k]; rec.Qty += o.Qty;
        if (o.Note && !(k in BI)) rec.Note = o.Note; if (o.Plan && !(k in BI)) rec.Plan = o.Plan;
        if (rec.Kind === 'other' && o.Kind !== 'other') rec.Kind = o.Kind;
        delete I[k];
      }
      if (main.trim() !== main) delete I[main];
      rec.Qty = Math.min(99, rec.Qty); I[main.trim()] = rec;
    }
    const qty = (O, rx) => Object.entries(O || {}).filter(([k]) => rx.test(k.trim())).reduce((a, [, v]) => a + (Number(v && v.Qty) || 0), 0);
    const SF = /^sunfizz$/i, EB = /^empty sunfizz bottles?$/i;
    if (hasB) {
      const returned = qty(BI, EB) - qty(I, EB), drank = qty(BI, SF) - qty(I, SF);
      if (returned > 0 && ['commissary', 'the mall', 'mall'].includes(placeOf(S.World.Location).toLowerCase())) {
        const pts = BOTTLE_BACK * returned;
        S.Player.Wallet.Points += pts;
        S.Player.Wallet.Transactions = [...S.Player.Wallet.Transactions, `+${pts} returned Sunfizz bottles (${returned})`].slice(-20);
        log.push(`Returned ${returned} Sunfizz bottle${returned > 1 ? 's' : ''}: +${pts} points.`);
      }
      if (drank > 0) {
        const k = Object.keys(I).find(x => EB.test(x.trim()));
        if (k) I[k].Qty = Math.min(99, Math.max(0, I[k].Qty) + drank);
        else I['Empty Sunfizz bottle'] = { Qty: drank, Kind: 'other', Note: 'returnable: 2 points each at the Commissary or the Mall store', Plan: '' };
      }
    }
    for (const k of Object.keys(I)) if (!(I[k].Qty > 0)) delete I[k];
    const ks = Object.keys(I);
    if (ks.length > CAP_BAG) {
      const order = [...ks.filter(k => /^(other|food)$/.test(I[k].Kind)), ...ks.filter(k => !/^(other|food|gear)$/.test(I[k].Kind))];
      for (const k of order.slice(0, ks.length - CAP_BAG)) delete I[k];
    }
  }

  // journal: engine-written turning points; date-stamp the AI's new lines
  if (hasB) {
    if (B.Player.Profile.Dorm === 'Unsorted' && S.Player.Profile.Dorm !== 'Unsorted') jnl.unshift(`Sorted into the ${S.Player.Profile.Dorm} Dormitory by the Arbiter Stone.`);
    const sec0 = new Set([...((B.Campus_State && B.Campus_State.Secrets_revealed) || []), ...((B.$ui && B.$ui.secrets) || [])]);
    for (const x of S.Campus_State.Secrets_revealed || []) if (!sec0.has(x)) { const [who, ...topic] = String(x).split('.'); jnl.push(`Uncovered a hidden truth about ${who}${topic.length ? ` (${topic.join('.')})` : ''}.`); }
  }
  // v1.0.3 (F13): every revealed secret also goes to a permanent, hidden ledger; unlocks read it, so the AI list may stay short
  for (const x of S.Campus_State.Secrets_revealed || []) if (!S.$ui.secrets.includes(x)) S.$ui.secrets.push(x);
  const J0 = new Set((hasB && B.Journal) || []);
  S.Journal = (S.Journal || []).map(line => (J0.has(line) || /^\[M\d/.test(line) ? line : `[${dstamp(S.World)}] ${line}`));
  for (const line of jnl) S.Journal.push(`[${dstamp(S.World)}] ${line}`);
  S.Journal = [...new Set(S.Journal)].slice(-CAP.Journal);
  // F21 state-as-memory: the narrator reads the last CAP.Journal lines; older ones (and lines the AI removed) move to $ui.archive
  if (hasB) {
    const kept = new Set(S.Journal), arch = S.$ui.archive || (S.$ui.archive = []);
    const have = new Set(arch);
    for (const l of B.Journal || []) if (!kept.has(l) && !have.has(l)) { arch.push(l); have.add(l); }
    S.$ui.archive = arch.slice(-JOURNAL_ARCHIVE);
  }

  // ---- 8j. 1.6.1 (Batch D, N4): campus events. Updated is stamped when an event's Text changes (a new event, or news about it);
  // events with no news for STALE_DAYS are listed in <now> ($ui.stale), so the world moves them on or closes them. A bare string
  // (the AI's shorthand, or a save from before 1.6.1) is the Text.
  {
    const E0 = (hasB && B.Campus_State && B.Campus_State.Events) || {}, stale = [];
    const ev = x => (_.isPlainObject(x) ? x : x == null ? null : { Text: String(x) });
    for (const k of Object.keys(S.Campus_State.Events || {})) {
      const v = ev(S.Campus_State.Events[k]), p = ev(E0[k]), text = String(v.Text || '').trim();
      if (!p || String(p.Text || '').trim() !== text || !(num(p.$d, -1) >= 0)) { v.Updated = dstamp(S.World); v.$d = dayNo; }
      else { v.Updated = p.Updated || dstamp(S.World); v.$d = num(p.$d, dayNo); }
      S.Campus_State.Events[k] = { Text: text, Updated: v.Updated, $d: v.$d };
      if (text && dayNo - v.$d > STALE_DAYS) stale.push([k, v.Updated, v.$d]);
    }
    S.$ui.stale = stale.sort((a, b) => a[2] - b[2]).slice(0, 3).map(([k, u]) => [k, u]);
  }
  // N6: the campus phase today ({ id, from: "M5 W1 Mon", to: "M5 W2 Fri", line }, every year); the line goes into <now>
  {
    const doyOf = w => { const m = /^M(\d{1,2}) W([1-4]) (\w{3})/.exec(String(w || '')); return m && DAYS.includes(m[3]) ? (+m[1] - 1) * 28 + (+m[2] - 1) * 7 + DAYS.indexOf(m[3]) : -1; };
    const d = dayNo % YEAR_DAYS;
    const ph = PHASES.find(p => { const a = doyOf(p.from), z = doyOf(p.to); return a >= 0 && z >= 0 && (a <= z ? d >= a && d <= z : d >= a || d <= z); });
    S.$ui.phase = ph ? { id: ph.id, line: ph.line } : null;
  }

  // ---- 8k. 1.6.1 (Batch D, N5): characters the narrator invented (Extras). A roster name is never an Extra. A key that differs
  // only in case, or a first name that matches exactly one recorded full name, is the same person: it merges into the recorded
  // key (in Scene.Present too). Every time one enters Scene.Present it is counted ($eng.xs); from the second appearance <cast>
  // asks for their record until it exists. At most EXTRAS_MAX records: the least recently seen leave first (into a hidden
  // archive, $ui.xold, which gives the record back if they turn up again), never one the player pinned (Keep) or one present.
  let xHere = [], xNew = [];
  {
    const X = S.Extras = _.isPlainObject(S.Extras) ? S.Extras : {}, X0 = (hasB && _.isPlainObject(B.Extras) && B.Extras) || {};
    const XF = ['Who', 'Looks', 'Manner', 'Calls_user', 'Voice'];
    const first = k => String(k).trim().toLowerCase().split(/\s+/)[0];
    const xMatch = (name, keys) => {
      const l = String(name).trim().toLowerCase(), same = keys.find(k => k !== name && k.toLowerCase() === l);
      if (same) return same;
      if (/\s/.test(l)) return null;
      const f = keys.filter(k => /\s/.test(k.trim()) && first(k) === l);
      return f.length === 1 ? f[0] : null;
    };
    for (const k of Object.keys(X)) {
      if (!_.isPlainObject(X[k])) X[k] = { Who: String(X[k] == null ? '' : X[k]) };
      if (NPC_IDS.has(canon(k))) { delete X[k]; log.push(`${canon(k)} is a roster character (their sheet is in <cast>), not an invented one; the Extras record "${k}" was removed.`); }
    }
    for (const k of Object.keys(X)) {   // same person under two keys: keep the recorded (or the longer) key
      if (!(k in X)) continue;
      const t0 = xMatch(k, Object.keys(X)); if (!t0) continue;
      const keep = t0.length !== k.length ? (t0.length > k.length ? t0 : k) : (t0 in X0 || !(k in X0) ? t0 : k), drop = keep === k ? t0 : k;
      const a = X[keep], z = X[drop], fresh = !(drop in X0);
      for (const f of XF) if (String(z[f] || '').trim() && (fresh || !String(a[f] || '').trim())) a[f] = z[f];
      a.Keep = !!(a.Keep || z.Keep); a.$seen = Math.max(num(a.$seen, -1), num(z.$seen, -1));
      delete X[drop];
    }
    const P = S.Scene.Present;
    for (const id of Object.keys(P)) {
      if (NPC_IDS.has(id)) continue;
      const t0 = xMatch(id, Object.keys(X)); if (!t0 || t0 === id) continue;
      if (!(t0 in P) || !String((P[t0] || {}).Note || '').trim()) P[t0] = P[id];
      delete P[id];
    }
    const ext = Object.keys(P).filter(id => !NPC_IDS.has(id));
    const XO = S.$ui.xold = _.isPlainObject(S.$ui.xold) ? S.$ui.xold : {};
    for (const id of ext) if (!(id in X)) { const o = id in XO ? id : xMatch(id, Object.keys(XO)); if (o) { X[id] = XO[o]; delete XO[o]; } }
    const bp = Object.keys((hasB && B.Scene && B.Scene.Present) || {}).filter(id => !NPC_IDS.has(id));
    const wasL = new Set(bp.map(k => k.trim().toLowerCase())), wasF = new Set(bp.map(first));
    const XS = S.$eng.xs = _.isPlainObject(S.$eng.xs) ? S.$eng.xs : {};
    const xsKey = {};
    for (const id of ext) {
      const l = id.trim().toLowerCase();
      let key = l in XS ? l : xMatch(l, Object.keys(XS));
      if (key && key !== l && /\s/.test(l)) { XS[l] = XS[key]; delete XS[key]; key = l; }   // first name, then the full name: one person
      const r = XS[key || l] || (XS[key || l] = { n: 0, d: dayNo });
      if (!wasL.has(l) && !wasF.has(first(l))) r.n = num(r.n, 0) + 1;
      r.d = dayNo; xsKey[id] = key || l;
      if (id in X) X[id].$seen = absA;
    }
    for (const k of Object.keys(XS).sort((a, b) => num(XS[b].d, 0) - num(XS[a].d, 0)).slice(80)) delete XS[k];
    for (const k of Object.keys(X)) if (num(X[k].$seen, -1) < 0) X[k].$seen = absA;   // written now: seen now
    const out = Object.keys(X).filter(k => !X[k].Keep && !ext.includes(k)).sort((a, b) => num(X[a].$seen, -1) - num(X[b].$seen, -1));
    for (const k of out.slice(0, Math.max(0, Object.keys(X).length - EXTRAS_MAX))) { XO[k] = X[k]; delete X[k]; }
    for (const k of Object.keys(XO).sort((a, b) => num(XO[b].$seen, -1) - num(XO[a].$seen, -1)).slice(EXTRAS_ARCHIVE)) delete XO[k];
    xHere = ext.filter(id => id in X && String(X[id].Who || '').trim());
    xNew = ext.filter(id => (id in X && !String(X[id].Who || '').trim()) || (!(id in X) && num((XS[xsKey[id]] || {}).n, 0) >= 2));
  }

  // ---- 8i. 1.5.1 (Batch B, P1/P6): the cast. Who among the present gets their full canon sheet in the Cast Sheet (509; their
  // keyword lore entry stays empty meanwhile): those who spoke in the last reply first, then the highest bond rank, at most
  // CAST_FULL; the others get a brief sheet. From the reply's prose: who spoke without being in Scene.Present, who was mentioned.
  {
    const prev = _.isPlainObject(S.$ui.cast) ? S.$ui.cast : {};
    const pres = Object.keys(S.Scene.Present || {}).filter(id => NPC_IDS.has(id) && (ARRIVES[id] || 1) <= S.World.Year);
    let spoke = prev.spoke || [], gone = prev.gone || [], ment = prev.ment || [];
    if (text) {
      const prose = String(text).replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '').replace(/<[^>]+>/g, ' ');
      spoke = speakersIn(prose); const said = new Set(spoke);
      gone = spoke.filter(id => !pres.includes(id));
      ment = NAME_RX.filter(([id, rx]) => !pres.includes(id) && !said.has(id) && (ARRIVES[id] || 1) <= S.World.Year && mentionIn(prose, id, rx)).map(([id]) => id).slice(0, 4);
    }
    const rank = id => (S.Bonds[id] ? num(S.Bonds[id].Rank, 0) : -1);
    const order = [...pres].sort((a, b) => (spoke.includes(b) - spoke.includes(a)) || (rank(b) - rank(a)) || (pres.indexOf(a) - pres.indexOf(b)));
    S.$ui.cast = { full: order.slice(0, CAST_FULL), brief: order.slice(CAST_FULL), spoke: spoke.filter(id => pres.includes(id)), gone, ment,
      where: Object.fromEntries(ment.filter(id => HAUNT[id]).map(id => [id, HAUNT[id]])), extras: xHere, xnew: xNew };
  }

  // ---- 9. UI bookkeeping ----
  const place = placeOf(S.World.Location);
  if (place && !S.$ui.discovered.includes(place)) S.$ui.discovered.push(place);
  const unlock = k => { if (!offUnlock.has(k) && !S.$ui.unlocks.includes(k)) S.$ui.unlocks.push(k); };   // 1.1.0: a feature that is off does not unlock
  if (S.Battle.Active) unlock('battle');
  if (Hd._True_magic) unlock('hidden');
  if (Object.keys(M.Pacts || {}).length) unlock('pacts');
  if (Object.keys(S.Commitments || {}).length) unlock('planner');
  if (Object.keys(S.Player.Injuries || {}).length) unlock('injuries');
  if ((S.Campus_State.Secrets_revealed || []).length || Object.keys(S.Clues || {}).length) unlock('mystery');
  if (Object.keys(S.Notices || {}).length || CASTLE.has(place.toLowerCase())) unlock('notices');
  if (Object.keys(S.Letters || {}).length) unlock('letters');
  const doy = dayNo % (YEAR_DAYS);
  if (S.Competition.Status || S.Competition.Tier || doy >= 2 * 28) unlock('competition');   // from Month 3 (Training Week, Dorm Competition)
  if (Object.keys(S.Projects || {}).length) unlock('projects');
  if (Object.keys(S.Inventory || {}).length) unlock('inventory');                 // 1.1.0
  if (Object.keys(S.Player.Conditions || {}).length) unlock('conditions');
  if (S.Trip.Active || TRIPS.some(tp => { const d0 = (tp.m - 1) * 28 + (tp.w - 1) * 7 + DAYS.indexOf(tp.d); return doy >= d0 - 14 && doy <= d0 + 2; })) unlock('trip');
  S.$ui.next = nextUp(S.World, evs, S);   // 1.3.4: the bracelet's "Next" chip
  S.$ui.toasts = S.$ui.toasts.slice(-10);

  // ---- 10. commit ----
  S.$eng.abs = absA;
  if (log.length) S._Log = [...(S._Log || []), ...log.map(l => `[${stamp(S.World)}] ${l}`)].slice(-12);
}

if (typeof eventOn === 'function' && typeof waitGlobalInitialized === 'function') {
  (async () => {
    await waitGlobalInitialized('Mvu');
    let text = '';   // message being parsed in this update (COMMAND_PARSED fires before VARIABLE_UPDATE_ENDED)
    eventOn(Mvu.events.VARIABLE_UPDATE_STARTED, () => { text = ''; });
    eventOn(Mvu.events.COMMAND_PARSED, (_v, _c, content) => { text = content || ''; });
    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (variables, variables_before) => {
      let hint = '';
      try { const c = SillyTavern.chat || [], m = c[c.length - 1] || {}; hint = String(m.send_date || '') + '|' + (SillyTavern.getCurrentChatId ? SillyTavern.getCurrentChatId() : ''); } catch (e) { /* seed falls back to world time */ }
      try { runEngine(variables.stat_data, variables_before && variables_before.stat_data, text, hint); text = ''; }
      catch (e) { console.error('[Eldrasil engine]', e); }
    });
  })();
}
