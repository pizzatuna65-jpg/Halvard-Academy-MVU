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
const INITIATIVE_STAGES = /*@@INITIATIVE_STAGES@@*/{};      // 1.7.7 (FP1): approved Stage lines, not new motives
const INITIATIVE_OPENNESS = /*@@INITIATIVE_OPENNESS@@*/{};  // scheduling weight only; never personality
const canRomance = id => 'AC'.includes(BRANCH[id] || 'A'), canRival = id => 'AB'.includes(BRANCH[id] || 'A');
const MENTION_DENY = new Set(/*@@MENTION_DENY@@*/[]);
const EXTRAS_MAX = 20, EXTRAS_ARCHIVE = 40, STALE_DAYS = 7;   // 1.6.1 (Batch D): invented characters kept; campus events without news
const PHASES = /*@@PHASES@@*/[];   // 1.6.1 (N6): campus phases (data/campus_phases.json; empty until the canon waves)
const QUOTE_RX = /["“][^"”]*["”]/g;
// 1.12.0 (section 8l): reminders of what an update may have left out
const MISS_MAX = 3;
const MISS_TIME_RX = /\b(an hour later|(?:two|three|four|five|several|a few|some) hours (?:later|pass|passed|go by|went by)|hours later|(?:the )?next morning|the following (?:morning|day)|later that (?:day|night|evening|afternoon)|by (?:evening|nightfall|dusk|noon|midnight)|as night falls|after (?:classes|class|dinner|lunch|breakfast))\b/i;
const MISS_PLACE = "([A-Z][\\w'’&]*(?:\\s+(?:[A-Z][\\w'’&]*|of|and|&))*)";
const MISS_ARRIVE_RX = new RegExp(`\\b(?:arrive[sd]?|arriving) (?:at|in) (?:the )?${MISS_PLACE}|\\b(?:step(?:s|ped)?|walk(?:s|ed)?|head(?:s|ed)?|slip(?:s|ped)?|burst(?:s)?) (?:into|inside) (?:the )?${MISS_PLACE}|\\b(?:reach(?:es|ed)?|enter(?:s|ed)?) (?:the )?${MISS_PLACE}`, 'g');
const MISS_TRAIN_AT = ['combat grounds', 'sparring pavilion', 'gymnasium', 'sports field', 'swimming pool', 'meditation rooms / spirit house'];
const MISS_TRAIN_RX = /\b(train(?:s|ed|ing)?|drill(?:s|ed|ing)?|practi[cs](?:e|es|ed|ing)|spar(?:s|red|ring)?|laps|meditat(?:e|es|ed|ing|ion))\b/i;
// 1.16.1 (audit A6): compiled once per NPC. matchAll clones a global regex; test() callers get it back at lastIndex 0.
const FORM_RX = {}, WORD_RX = new Map();   // WORD_RX: whole-word tests of technique, perk and gift names (section 8l)
function formRx(id) {
  const r = FORM_RX[id] || (FORM_RX[id] = new RegExp('(^|[^A-Za-z])(' + NAME_FORMS[id].map(f => f.replace(/[.*+?^()|[\]\\]/g, '\\$&')).join('|') + ')(?![A-Za-z])', 'g'));
  r.lastIndex = 0; return r;
}
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
const MON_THU = DAYS.slice(0, 4), MON_FRI = DAYS.slice(0, 5), MON_SAT = DAYS.slice(0, 6);
const EVENTS = /*@@CAL_EVENTS@@*/[];
const TIMETABLE = /*@@CAL_TIMETABLE@@*/{};
const ENTR_BACK = '{{user}} is a returning student and the assigned senior guide: never sorted again; watches the speeches and sorting from the gallery, then tours 10:00–18:00 with the two new first-years recorded in Campus_State.Entrance_tour';
const schedOf = (e, day) => (!e.s ? '' : typeof e.s === 'string' ? e.s : e.s[day] || '');
const curfewHour = (e, day) => (e.curfew && typeof e.curfew === 'object' ? e.curfew[day] : e.curfew);
const timetableFor = W => W.Month === 10 && W.Week === 3 && W.Day === 'Sat' ? [TIMETABLE.Sat[0], TIMETABLE.Sat[1], 'Student Council Election (Main Courtyard)'] : TIMETABLE[W.Day];
// monthly payout by dorm rank (lore: 300 bottom band ... 3,000 for rank 1). Bands between are tunable.
const PAYOUT = [[1, 3000], [3, 2000], [10, 1200], [25, 800], [50, 500], [Infinity, 300]];
// 1.15.0 (owner-approved planning/DRAFT_grades_exams.md): the engine marks every subject at each exam. Midterm slots from lore 232
// ([day, from, to] in minutes; Creature Studies sits no midterm and is marked on fieldwork); finals are one run on a seeded day.
const SUBJECTS = ['Magic Theory', 'History', 'Etiquette', 'Potion Crafting', 'Dark Magic Defense', 'Combat', 'Creature Studies'];
const MARKS = ['F', 'D', 'C', 'B', 'A'];
const MID_SLOTS = { 'Magic Theory': [0, 480, 600], Etiquette: [0, 600, 720], History: [1, 480, 600], 'Potion Crafting': [1, 780, 960],
  'Dark Magic Defense': [2, 480, 960], Combat: [3, 480, 960] };
const PRACTICAL = ['Potion Crafting', 'Dark Magic Defense', 'Combat', 'Creature Studies'];
// an A: +10 on a Fortune roll in the subject's field (rule 504 "specialty"), until the next exams
const TOP_FIELD = { 'Magic Theory': 'analysing or unpicking unfamiliar magic', History: 'recognising old places, artefacts and symbols',
  Etiquette: 'formal dealings with staff, nobles and envoys', 'Potion Crafting': 'brewing, or knowing a potion or poison',
  'Dark Magic Defense': 'curses, wards and magical traps', Combat: 'duels and fights', 'Creature Studies': 'handling beasts' };
const TUTOR_PAY = 40, TUTOR_WEEK = 2, TRAIN_FOR_COMBAT = 6, ASSIGNMENT_MIN = 45;
const subjectOf = t => { const x = String(t || '').trim().toLowerCase(); return x === 'dmd' ? 'Dark Magic Defense' : SUBJECTS.find(s => s.toLowerCase() === x) || ''; };
const subjectIn = t => SUBJECTS.find(s => new RegExp(`\\b${s}\\b`, 'i').test(String(t || ''))) || (/\bDMD\b/.test(String(t || '')) ? 'Dark Magic Defense' : '');
const teaches = (id, subj, py) => ((CLASS.teach || {})[id] || []).some(x => x[0] === subj && (x[1] === py || x[1] === 0));
// 1.2.2 bond system (owner design): XP per kind of interaction with daily/weekly limits, rising XP per rank scaled by the pace
// setting, a cooldown after each rank, then an in-scene interaction to deepen the bond.
const BR = /*@@BOND_RULES@@*/{};
const START = BR.start || {};   // 1.3.1: bonds that begin above Rank 0 (data/bond_rules.json start)
const HAUNT = /*@@HAUNTS@@*/{};
// 1.3.0 (owner brainstorm 2026-09-25): bond rewards (Rank 5 gift, Rank 10 benefit, mask -> truth, Krieg), reputation, training.
// Single sources data/bond_rewards.json, reputation.json, training.json; NPC_GROUP: staff | student | other | rival (no bond system).
const REW = /*@@BOND_REWARDS@@*/{};
const RANK4_PARTNERS = /*@@RANK4_PARTNERS@@*/{};
const REP = /*@@REPUTATION@@*/{};
const TRN = /*@@TRAINING@@*/{};
const NPC_GROUP = /*@@NPC_GROUP@@*/{};
// 1.3.1 (owner playtest): player settings for training and reputation (data/tuning.json rows; values in $ui.tune, else the default)
const TUNING = /*@@TUNING@@*/[];
// 1.10.0 (FP7): lessons with venues per weekday period, teachers ([subject, year]; year 0 = every year), club venues (tools/common.py)
const CLASS = /*@@CLASS@@*/{};
// 1.10.2 (FP11): why an NPC seeks {{user}} out: templates per Tension category, each NPC's category and club (data/initiative_asks.json)
const INIT_ASKS = /*@@INITIATIVE_ASKS@@*/{};
const TIMES = ['08:00-10:00', '10:00-12:00', '13:00-16:00'];
const placeKey = loc => placeOf(loc).toLowerCase().replace(/^the /, '');
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
// effects for everyone (what they share, rank benefits, XP, how Tension and apologies land); the category
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
const tsuspOf = (S, bonds) => Object.entries(S._Perks || {}).filter(([, p]) => p.Kind === 'rank10' && bonds[p.From] && trustGate(p.From, 10) && num(bonds[p.From].Trust, 50) < num(TRU.suspend_r10_below, 35)).map(([k]) => k);
const trustGate = (id, rank) => (((TRU.overrides || {})[id] || {}).no_gates ? 0 : num((TRU.perk_gates || {})[String(rank)], 0));
const repLevel = x => (x >= 0 ? 1 : -1) * (REP.thresholds || []).filter(t => Math.abs(x) >= t).length;
const repFloor = L => (L === 0 ? 0 : Math.sign(L) * REP.thresholds[Math.abs(L) - 1]);   // the Rep XP at which level L begins
const repBand = (r, L) => ((((REP.effects || {})[r]) || []).find(([a, c]) => L >= a && L <= c) || [0, 0, ''])[2];
const repOfNpc = id => (NPC_GROUP[id] === 'staff' ? 'Academy' : NPC_GROUP[id] === 'student' ? 'Student' : (REP.doves_bond || []).includes(id) ? 'Doves' : '');
const r2 = x => Math.round(x * 100) / 100;
const paceOf = S => ((BR.pace || {})[(S.$ui || {}).bondpace] || 1);
const needXP = (r, m) => (r >= 10 ? 0 : Math.max(3, Math.round(BR.xp_base[r] * m)));
const coolDays = (r, m) => Math.round((BR.cool_base[Math.min(r, 9)] || 0) * m);
const hm = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || '').trim()); return m ? +m[1] * 60 + +m[2] : null; };
const normP = x => String(x || '').split(/\s+[—-]\s+/)[0].trim().toLowerCase().replace(/^the\s+/, '');
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
// 1.24.0 (owner playtest): a place's lore and rumours {place key: [[uid, name as prose writes it, title, text]]}. The Campus Map shows
// only those {{user}} has heard ($ui.lore): overheard at the place (ambience, section 8m) or named in the narration (section 9).
const PLACE_LORE = /*@@PLACE_LORE@@*/{};
function hearLore(S, u, title, where) {
  if (S.$ui.lore.includes(String(u))) return;
  S.$ui.lore.push(String(u)); S.$ui.toasts.push(`Heard${where ? ' at ' + where : ''}: ${title}`);
}
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
const STAYS = /*@@STAYS@@*/{};   // 1.7.4: third-years whose canon keeps them at Halvard (data/cohorts.json "stays"): {id: log line}
const yearOf = (id, Y) => (STUDENTS[id] ? STUDENTS[id][0] + Y - STUDENTS[id][1] : 0);   // their school year in campaign year Y
// Batch 5.3 (F20): seeded campus happenings. Pool from data/happenings.json (injected by tools/gen_engine.py).
// Plan 4.6: never Math.random(). The chat seed is taken once from the creation time of the message whose update first ran the
// engine and then stored in $eng.seed, so every later roll is a pure function of (seed, day): swipes and replays see the same day.
const HAPPENINGS = /*@@HAPPENINGS@@*/[];
// 1.16.0 ambience (data/ambience.json): categories and their crowd rhythm, the sun table, cue and beat types, the uncanny stories
const AMB = /*@@AMBIENCE@@*/{};
const AMB_LEVELS = ['empty', 'quiet', 'some people', 'busy', 'packed'];
const HAPPEN_RATE = { off: 0, rare: 0.2, normal: 0.4, often: 0.65 };
const hash32 = (...parts) => {
  let h = 2166136261;
  for (const ch of parts.join('|')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
  return h >>> 0;
};
const rand01 = (...parts) => hash32(...parts) / 4294967296;
const JOURNAL_ARCHIVE = 120;
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
// 1.7.4: from campaign Year 2 every date the engine writes carries its year ("Y2 M1 W1 Mon"), so the age of a line is right across
// years (<now>, Cast Sheet) and the Journal groups by year; Year 1 keeps the plain form. withYear() adds a year to a leading bare date.
const yPre = W => ((W.Year || 1) > 1 ? `Y${W.Year} ` : '');
const stamp = W => `${yPre(W)}M${W.Month} W${W.Week} ${W.Day} ${W.Time}`;
const withYear = (s, Y) => String(s).replace(/^(\[?)(M\d{1,2} W[1-4]\b)/, `$1Y${Y} $2`);
const eventsOn = W => EVENTS.filter(e => e.m === W.Month && e.w === W.Week && e.d.includes(W.Day));
const pctOf = (v, max) => (max > 0 ? (v / max) * 100 : 0);
const num = (v, d = 0) => { const x = Number(v); return Number.isFinite(x) ? x : d; };
const dstamp = W => `${yPre(W)}M${W.Month} W${W.Week} ${W.Day}`;
// Parses a due/until text written by the AI ("M2 W1 Tue 14:00", "Month 3 Week 2", "Fri 18:00", "tomorrow 9am", "M4") into an
// absolute minute, relative to the current world time W. Missing parts: day -> Sunday of that week (or the next such weekday),
// week -> week 4 when only a month is given, time -> 23:59. Returns -1 when nothing date-like is found.
function parseWhen(str, W, absNow) {
  const s = String(str || '');
  const m = s.match(/\b(?:M|Month\s*)(\d{1,2})\b/i), w = s.match(/\b(?:W|Week\s*)([1-4])\b/i);
  const d = s.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:s|[a-z]*day)?\b/i);   // not \"Month\"
  const t = s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) || s.match(/\b(\d{1,2}):(\d{2})\b/);
  const rel = s.match(/\b(today|tonight|tomorrow)\b/i);
  // 1.11.1 (bug hunt): parts of the day ("by noon", "Sat morning"), "in two days", "next week" and a year ("Y2 M1 W1 Mon")
  const tw = s.match(/\b(noon|midday|midnight|morning|afternoon|evening)\b/i);
  const inN = s.match(/\bin\s+(a|an|one|two|three|four|five|six|seven|\d{1,2})\s+(days?|weeks?)\b/i), nextWk = /\bnext week\b/i.test(s);
  const y = s.match(/\bY(\d{1,2})\b/);
  if (!m && !w && !d && !t && !rel && !tw && !inN && !nextWk) return -1;
  let hh = 23, mm = 59;
  if (t) { hh = +t[1] % 24; mm = +(t[2] || 0); if (t[3]) { hh = hh % 12 + (/pm/i.test(t[3]) ? 12 : 0); } }
  else if (tw) [hh, mm] = { noon: [12, 0], midday: [12, 0], midnight: [23, 59], morning: [9, 0], afternoon: [15, 0], evening: [19, 0] }[tw[1].toLowerCase()];
  else if (rel && /tonight/i.test(rel[1])) { hh = 21; mm = 0; }
  const dayStart = Math.floor(absNow / DAY_MIN) * DAY_MIN;
  if (inN && !m && !w && !d) {
    const n = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 }[inN[1].toLowerCase()] || +inN[1];
    return dayStart + n * (/^week/i.test(inN[2]) ? 7 : 1) * DAY_MIN + hh * 60 + mm;
  }
  if (nextWk && !m && !w) {                                    // next week: that weekday of it, else by its Sunday
    const mon = dayStart + (7 - DAYS.indexOf(W.Day)) * DAY_MIN;
    return mon + (d ? DAYS.indexOf(d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase()) : 6) * DAY_MIN + hh * 60 + mm;
  }
  if (rel && !m && !w && !d) return dayStart + (/tomorrow/i.test(rel[1]) ? DAY_MIN : 0) + hh * 60 + mm;
  if (!m && !w) {                                              // weekday only: this one or the next one
    if (!d) return dayStart + hh * 60 + mm;
    const want = DAYS.indexOf(d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase()), now = DAYS.indexOf(W.Day);
    let add = (want - now + 7) % 7; const at = dayStart + add * DAY_MIN + hh * 60 + mm;
    return add === 0 && at < absNow - 12 * 60 ? at + 7 * DAY_MIN : at;
  }
  const M = m ? _.clamp(+m[1], 1, 12) : W.Month, Wk = w ? +w[1] : (m ? 4 : W.Week);
  const Dy = d ? d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase() : 'Sun';
  let abs = toAbs({ Year: y ? Math.max(1, +y[1]) : W.Year, Month: M, Week: Wk, Day: Dy, Time: `${pad(hh)}:${pad(mm)}` });
  if (y) return abs;                                           // a written year is taken as it is
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
  return `${T.Year !== fromAbs(absNow).Year ? `Y${T.Year} ` : ''}M${T.Month} W${T.Week} ${T.Day}${tm}`;
}
const capRecord = (obj, max, dropFirst) => {                   // drop the oldest keys (insertion order), preferring dropFirst(v)
  let keys = Object.keys(obj || {}); if (keys.length <= max) return;
  const order = dropFirst ? [...keys.filter(k => dropFirst(obj[k])), ...keys.filter(k => !dropFirst(obj[k]))] : keys;
  for (const k of order.slice(0, keys.length - max)) delete obj[k];
};

function periodOf(W, evs) {
  const [h] = W.Time.split(':').map(Number);
  const tt = timetableFor(W);
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
  const tt = timetableFor(W), stop = evs.some(e => e.noclass || e.home || e.lockdown || e.away);
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
// No repeat of the previous two days' happening. 1.16.1 (audit B3): "previous" means what those days actually got, so the year is
// chained from its first day (Month 12 is the holiday, with no happenings, so a year never carries one over) and cached.
const HAPY = new Map();
function happeningOn(seed, dayNo, rate, wxm) {
  const Y = Math.floor(dayNo / YEAR_DAYS), key = `${seed}|${Y}|${rate}|${wxm}`;
  let arr = HAPY.get(key);
  if (!arr) {
    arr = [];
    for (let i = 0; i < YEAR_DAYS; i++) arr.push(rawHappening(seed, Y * YEAR_DAYS + i, rate, arr.slice(-2).filter(Boolean).map(h => h.id), wxm));
    if (HAPY.size > 8) HAPY.clear();
    HAPY.set(key, arr);
  }
  return arr[dayNo - Y * YEAR_DAYS] || null;
}

// ---- 1.1.0 weather (spec §4): seasons, sky per block, wind, rare weather, °C. Pure functions of (seed, day): swipe-safe. ----
// 1.9.4 (playtest Batch 4): the academic year opens in spring. One label per season; 'Autumn' is the internal and displayed name.
const SEASONS = ['Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter', 'Winter', 'Winter'];   // by Month-1
const SKY = ['Clear', 'Cloudy', 'Overcast', 'Fog', 'Rain', 'Storm'];
const WX_BASE = { Winter: [25, 20, 25, 10, 18, 2], Spring: [30, 25, 15, 8, 20, 2], Summer: [50, 22, 8, 3, 12, 5], Autumn: [28, 22, 20, 12, 16, 2] };
const WX_BLOCK = [{ Fog: 2, Storm: 0.5 }, { Fog: 0.3, Storm: 1.8 }, {}];   // morning, afternoon, night
const WX_TRANS = { Clear: { Clear: 2, Cloudy: 1.2, Overcast: 0.6, Rain: 0.4, Storm: 0.6 }, Cloudy: { Cloudy: 1.4, Overcast: 1.3 },
  Overcast: { Overcast: 1.5, Rain: 2, Clear: 0.5 }, Fog: { Clear: 1.5, Cloudy: 1.3, Fog: 0.4 }, Rain: { Rain: 1.8, Overcast: 1.5, Storm: 1.3, Clear: 0.4 },
  Storm: { Rain: 2, Overcast: 1.5, Storm: 0.5 } };
const WX_MEAN = [9, 12, 15, 18, 21, 22, 19, 14, 9, 4, 1, 1];   // monthly mean °C (1.9.4: rebaselined for the spring start)
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
      if (season === 'Winter' && temp <= 3) snow = d100(seed, day, b, 'snow') <= (P.Month === 10 ? 60 : 70) + (b !== 1 ? 15 : 0);
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
// winter flu wave: 1-2 a year in Months 10-11 (Month 12 is the holiday), 5 days each, seeded
const FLU_FROM = 9 * 28;   // Month 10, Week 1
function fluOn(seed, day) {
  const Y = Math.floor(day / YEAR_DAYS), doy = day - Y * YEAR_DAYS;
  if (doy < FLU_FROM || doy >= FLU_FROM + 56) return false;
  for (let k = 0, n = 1 + hash32(seed, Y, 'flu') % 2; k < n; k++) { const st = FLU_FROM + hash32(seed, Y, k, 'flus') % 51; if (doy >= st && doy < st + 5) return true; }
  return false;
}
// outdoor places (spec §4.8; generated by gen_engine from data/locations.json) and weather gear from Bag item names
const OUTDOOR = /*@@OUTDOOR@@*/[];
const isOutdoor = loc => { const p = placeOf(loc).toLowerCase(); return !!p && OUTDOOR.some(c => p === c || p.startsWith(c + ' ') || p.startsWith(c + ',')); };
const GEAR = { umbrella: /umbrella/i, waterproof: /waterproof|oilskin|rain cloak|raincoat/i, warm: /wool|scarf|winter cloak|mittens/i, sun: /sun hat|straw hat/i };
// 1.9.5 (playtest Batch 5): shop items with an effect (data/shop.json gear / use, by lowercase name); gear also by exact item name,
// and a used charm's timed protection (wxs.buff: { kind: until abs minute })
const SHOP_FX = /*@@SHOP_FX@@*/{};
const SHOP_PRICE = /*@@SHOP_PRICE@@*/{};
const fxOf = name => SHOP_FX[String(name || '').trim().toLowerCase().replace(/^(an?|the)\s+/, '')] || SHOP_FX[String(name || '').trim().toLowerCase().replace(/^(an?|the)\s+/, '').replace(/\s*\(.*\)$/, '')] || null;
const gearOf = (I, buff, now) => {
  const own = Object.keys(I || {}).filter(k => (I[k] && I[k].Qty) > 0), ks = own.join(' | ');
  return _.mapValues(GEAR, (rx, g) => rx.test(ks) || own.some(k => (fxOf(k) || {}).gear === g) || ((buff || {})[g] > now));
};
const EXPO = { soaked: 'Soaked', drenched: 'Soaked', wet: 'Soaked', chilled: 'Chilled', frozen: 'Chilled', frostbitten: 'Chilled' };   // 1.9.4: /Exposure kinds
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
  Bonds: {}, Campus_State: { Entrance_tour: { Year: 0, Guide: '', FirstYears: [] }, Council: { Candidates: { '1': { First: 'Florian', Second: 'Dante' } }, Results: {}, President: 'Irene', VicePresident: 'Caspian', PresidentElect: '', VicePresidentElect: '' }, Events: {}, Rumours: [], Location_changes: {}, NPC_status: {}, New_relations: {}, Secrets_revealed: [], Graduated: [] },
  Commitments: {}, Notices: {}, Letters: {}, Journal: [], Clues: {}, Mysteries: {},
  Competition: { Tier: '', Status: '', Placement: '', Team: [], Results: [] }, Projects: {},
  Trip: { Active: false, Destination: '', Companions: [], Note: '' }, Battle: { Active: false, Combatants: {} }, _Log: [],
  Inventory: {}, Hooks: {},   // 1.1.0
  Extras: {},   // 1.6.1
  _Perks: {}, Rep_events: [], Training: [], Perk_use: [],   // 1.3.0
  Exam_events: [], Tutoring: [],   // 1.15.0
};
function fillShape(o, shape) {
  for (const [k, v] of Object.entries(shape)) {
    if (o[k] === undefined || o[k] === null) o[k] = _.cloneDeep(v);
    else if (_.isPlainObject(v) && _.isPlainObject(o[k]) && Object.keys(v).length) fillShape(o[k], v);
  }
}
// 1.16.1 (audit B4): one answer to "is this NPC away?" for bonds, introductions, Rank 5 handovers, the Entrance tour, NPC
// initiative and birthday parties (each had its own list of words). A status is found by the NPC's id, alias or first word.
const AWAY_RX = /away|abroad|absent|missing|dead|confined|hospital|unconscious|expelled|unavailable|left campus|left halvard|out of town/i;
const npcStatusIn = (S, id) => {
  const N = (S.Campus_State || {}).NPC_status || {}, lo = String(id).toLowerCase();
  const k = Object.keys(N).find(x => (NPC_ALIAS[String(x).toLowerCase()] || x) === id || String(x).toLowerCase().split(/\s+/)[0] === lo);
  return k ? String(N[k] || '') : '';
};
const npcAwayIn = (S, id) => ((S.Campus_State || {}).Graduated || []).includes(id) || AWAY_RX.test(npcStatusIn(S, id));
// 1.16.1 (audit B1): Player.Profile.Club in the club list's own words ("Soccer", "soccer club" -> "Soccer Club"; "Theatre" ->
// "Theatre Troupe"), so Saturday club time is counted; a club the list does not know is kept as written
function canonClub(c) {
  const s = String(c || '').trim(), k = s.toLowerCase().replace(/^the\s+/, '').replace(/\s+/g, ' ');
  if (!k) return '';
  if (/^duel+ing club$/.test(k)) return 'Magic Duelling Club';
  const names = Object.keys(CLASS.clubs || {}), base = x => x.toLowerCase().replace(/\s+club$/, '');
  return names.find(n => n.toLowerCase() === k) || (CLASS.calias || {})[base(k)] || names.find(n => base(n) === base(k)) || s;
}
const BOND0 = { $gifts: {}, Rank: 0, Progress: 0, Trust: 50, Tension: 0, Title: '', Romance: false, Known_facts: [], Milestones: [], Last_seen: '' };
/*@@MOOD_GIFTS_SOURCE@@*/
const ENGINE_VER = '@@VERSION@@';   // the card version (src/card/card.json, set by tools/gen_engine.py)

// 1.20.0 (audit A5): the engine runs as a list of steps, in the order of the sections they came from. Each step reads what it needs
// from the shared context c (the states, the reply's text and the values earlier steps computed) and adds what later steps use.
function runEngine(S, B, text, seedHint, userText) {   // 1.12.0: userText = the player's message this reply answers (section 8l)
  if (!S || !S.World) return;
  const c = { S, B, text, seedHint, userText };
  for (const step of ENGINE_STEPS) step(c);
}

function stepSetup(c) {
  const { S, B } = c;
  fillShape(S, SHAPE);
  const log = [], jnl = [];                                    // jnl: journal lines the engine adds itself (5.1)
  S.$eng = S.$eng || { abs: -1, daily: {} };
  S.$ui = S.$ui || { unlocks: [], discovered: [], toasts: [] };
  for (const k of ['unlocks', 'discovered', 'toasts', 'names', 'archive', 'secrets', 'off', 'rumours_old', 'lore']) if (!Array.isArray(S.$ui[k])) S.$ui[k] = [];
  if (!_.isPlainObject(S.$ui.parked)) S.$ui.parked = {};
  if (!['off', 'flavor', 'full'].includes(S.$ui.wxfx)) S.$ui.wxfx = 'full';
  const hasB = !!(B && B.World);
  const fromVer = hasB ? (B.$eng || {}).ver : S.$eng.ver;      // the engine version that wrote the state before this reply
  S.$eng.ver = ENGINE_VER;
  if (hasB) S.$ui.toasts = [];                                  // toasts = what happened in THIS update only
  Object.assign(c, { log, jnl, hasB, fromVer });
}

// 1.20.0 (audit A5): save migrations, run on the first update after the card version changes (and on a new chat's first run).
// Each keeps its own flag or test, so one already done is skipped. The engine reads its own fields from the state before the
// reply (B), so a migration changes a copy of B as well as S: the reply is not read as having made the change.
function stepMigrate(c) {
  const { S, hasB, log } = c;
  if (c.fromVer === ENGINE_VER) return;
  const B = c.B = hasB ? _.cloneDeep(c.B) : c.B, both = hasB ? [S, B] : [S];
  for (const X of both) {
    const P = X._Perks;
    if (!_.isPlainObject(P)) continue;
    const oldDanteGift = P["Groundskeeper's Lodge key"];       // Dante's Rank 5 gift before its rename
    if (oldDanteGift) {
      if (!P['Council safety card']) P['Council safety card'] = { ...oldDanteGift, Effect: REW.npcs.Dante.gift.text };
      delete P["Groundskeeper's Lodge key"];
    }
    if (P['Florian (Rank 10)']) P['Florian (Rank 10)'].Effect = REW.npcs.Florian.r10.text;
  }
  // 1.3.0: a pre-1.3.0 save's Public / Dorm meters become Academy / Student XP once
  if (S.$eng.repv !== 1) {
    const RP = S.Player.Profile.Reputation || (S.Player.Profile.Reputation = {});
    const RPB = hasB ? (((B.Player || {}).Profile || {}).Reputation) : null;
    const old = (RPB && (RPB.Public != null || RPB.Dorm != null)) ? RPB : RP, xp0 = (RPB && RPB.$xp) || RP.$xp || {};
    if (REP.reps.every(r => !_.clamp(num(xp0[r], 0), -REP.thresholds[4], REP.thresholds[4])) && (num(old.Public, 0) || num(old.Dorm, 0))) {
      const xp = { ...xp0, Academy: _.clamp(Math.round(num(old.Public, 0) * 1.25), -125, 125), Student: _.clamp(Math.round(num(old.Dorm, 0) * 1.25), -125, 125) };
      RP.$xp = xp;
      if (RPB) RPB.$xp = { ...xp };
      log.push(`Reputation now has three parts (Academy, Student, Doves); the old academy and dorm standing became Academy ${repLevel(xp.Academy)} and Student ${repLevel(xp.Student)}.`);
    }
    S.$eng.repv = 1;
  }
  // 1.2.2: a pre-XP bond's Progress (0-10) becomes XP toward its next rank; 1.3.8: milestones of the ranks already reached count as paid
  const PACE = paceOf(S);
  for (const X of both) {
    for (const b of Object.values(X.Bonds || {})) {
      if (!b || typeof b !== 'object') continue;
      if (S.$eng.bondv !== 2) { const p = num(b.Progress, 0); if (p > 0 && num(b.$xp, 0) === 0) b.$xp = Math.round(Math.min(p, 10) / 10 * needXP(b.Rank, PACE)); }
      if (S.$eng.tenv !== 1) b.$ms = [...new Set([...(b.$ms || []), ...Object.keys(REP.bond_milestone_xp || {}).map(Number).filter(r => r <= b.Rank)])];
    }
  }
  S.$eng.bondv = 2;
  S.$eng.tenv = 1;
  S.$ui.bev = {};                                               // obsolete event hints of older saves
}

// ---- 0. read-only fields: only a Student Builder patch (auth = 'builder') may change them ----
function stepGuards(c) {
  const { S, B, text, log, hasB } = c;
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
  // 1.11.1: a player-tool message (the UI writes /$eng/tool = 1 with every Builder or Settings patch and marks its text)
  const toolEdit = hasB && (num(S.$eng.tool, 0) === 1 || /\(player tool\)/.test(String(text || '')));
  S.$eng.tool = 0;
  // 1.16.1 (audit B1): the club in the club list's words, before attendance (5d) reads it
  {
    const P = S.Player.Profile, raw = String(P.Club || ''), c = canonClub(raw);
    P.Club = c;
    const was = hasB ? canonClub(((B.Player || {}).Profile || {}).Club) : c;
    if (c && c !== was && !Object.keys(CLASS.clubs || {}).includes(c)) log.push(`Club "${c}" is not a club on record (${Object.keys(CLASS.clubs || {}).join(', ')}); Saturday club time is only counted for one of them.`);
  }
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
  Object.assign(c, { byBuilder, toolEdit });
}

// ---- 0b. 1.1.0 Features settings: a feature that is off has its state parked in $ui.parked (hidden from the AI) and is not processed.
// Turning it back on restores it. A write the AI still makes into a parked module is merged into the parking, not dropped.
// On the update that toggles a feature, the "before" copy of its state is aligned, so the toggle is not read as a story change.
function stepFeatures(c) {
  const { S, log, hasB } = c;
  let { B } = c;
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
  if (S.$ui.ambience === 'off') OFF.add('ambience');
  S.$ui.on = Object.fromEntries(FEATURES.map(f => [f.id, !OFF.has(f.id)]));
  S.$ui.on.wxfull = S.$ui.wxfx === 'full';
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
  // 1.12.0 (planning/DRAFT_missed_reports.md): what the narrator reported in this update, kept before the sections below empty the
  // lists; section 8l compares it with the prose and the state to remind the narrator of what it may have left out
  const REPORTED = {
    acts: (Array.isArray(S.Interactions) ? S.Interactions : []).filter(a => a && typeof a === 'object'),
    casts: (Array.isArray(S.Magic && S.Magic.Casts) ? S.Magic.Casts : []).map(c => String((c && c.Technique) || '')),
    used: (Array.isArray(S.Consumables) ? S.Consumables : []).map(x => String(x).trim().toLowerCase()),
    perks: (Array.isArray(S.Perk_use) ? S.Perk_use : []).map(x => String(x).trim().toLowerCase()),
    training: Array.isArray(S.Training) ? S.Training.length : 0,
  };
  Object.assign(c, { OFF, offUnlock, staleDrop, REPORTED, B });
}

// ---- 1. time ----
// 1.3.3: an unreadable Day or Time from the AI arrives as '' (schema): keep the previous one rather than guess
function stepTime(c) {
  const { S, B, seedHint, log, jnl, hasB } = c;
  for (const [f, d] of [['Day', 'Mon'], ['Time', '08:00']]) {
    if (!S.World[f]) { S.World[f] = (hasB && B.World[f]) || d; if (hasB) log.push(`World.${f} could not be read; it was kept at ${S.World[f]}.`); }
  }
  if (!(S.Trip && S.Trip.Active)) S.World.Location = canonLocation(S.World.Location);   // 1.3.1: the map's name for the place
  const absB = hasB ? (B.$eng && B.$eng.abs >= 0 ? B.$eng.abs : toAbs(B.World)) : toAbs(S.World);
  let absA = toAbs(S.World);
  if (hasB && absA < absB) {
    // v1.0.3 (A#1): a new Day without Week/Month/Year rollover advances by whole weeks. On the same Day, only a clear
    // late-night to early-morning crossing is an implicit midnight rollover; a small backwards typo must not skip a day.
    const dayChanged = S.World.Day !== B.World.Day;
    const overnight = !dayChanged && B.World.Time >= '20:00' && S.World.Time <= '06:00';
    const step = dayChanged ? 7 * DAY_MIN : overnight ? DAY_MIN : 0, limit = dayChanged ? 60 : overnight ? 1 : 0;
    let k = 0;
    while (absA < absB && k < limit) { absA += step; k++; }
    if (absA < absB) { absA = absB; log.push('Time cannot move backwards; the clock was kept.'); }
  }
  // 1.11.1 (bug hunt): a partial calendar rollover. Month or Year changed but the Week was left as it was ("M3 W4 Sun" ->
  // "M4 W4 Mon"): when the next such Day and Time after the previous clock falls in the Month and Year written, that is the day
  // meant, not three weeks later.
  if (hasB && absA - absB > 3 * DAY_MIN && (S.World.Month !== B.World.Month || (S.World.Year || 1) !== (B.World.Year || 1))) {
    const t = hm(S.World.Time), want = DAYS.indexOf(S.World.Day);
    if (t != null && want >= 0) {
      const d0 = Math.floor(absB / DAY_MIN), add = (want - DAYS.indexOf(B.World.Day) + 7) % 7;
      let alt = (d0 + add) * DAY_MIN + t; if (alt <= absB) alt += 7 * DAY_MIN;
      const T = fromAbs(alt);
      if (T.Month === S.World.Month && T.Year === (S.World.Year || 1) && alt < absA) {
        log.push(`World.Week was not reset for the new month: the clock moved to ${stamp(T)} (the next ${S.World.Day}), not ${stamp(fromAbs(absA))}.`);
        absA = alt;
      }
    }
  }
  Object.assign(S.World, fromAbs(absA));
  const elapsed = hasB ? Math.max(0, absA - absB) : 0;
  // a jump of more than three days is shown to the player, so a mistaken date can be swiped away before it is played on
  if (elapsed > 3 * DAY_MIN) {
    const days = Math.round(elapsed / DAY_MIN);
    S.$ui.toasts.push(`Time jumped ${days} days`);
    log.push(`Time moved ${days} days in one update (to ${stamp(S.World)}). If the story did not mean a time skip, the date was written wrongly: swipe or correct it.`);
  }
  const evs = eventsOn(S.World);
  // 1.2.0: {{user}}'s birthday (Builder, Profile.Birthday "M? W? Day") joins the day's events; lore entry 508 says how it plays out
  const bd = /^M(\d{1,2}) W([1-4]) (Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.exec(String(S.Player.Profile.Birthday || '').trim());
  const bday = bd && +bd[1] === S.World.Month && +bd[2] === S.World.Week && bd[3] === S.World.Day;
  // 1.3.1: each event with today's plan (times from its lore entry), so the narrator runs the day on schedule
  S.World._Event_today = [...evs.map(e => (schedOf(e, S.World.Day) ? `${e.t} — ${schedOf(e, S.World.Day)}` : e.t) + (e.entr && (S.World.Year > 1 || num(S.Player.Profile.Year, 1) > 1) ? ` (${ENTR_BACK})` : '')), ...(bday ? [`${S.Player.Profile.Name || 'Your'}'s birthday`] : [])].join(' | ');
  S.World._Period = periodOf(S.World, evs);
  S.World._Curfew = curfewOf(S.World, evs, S);
  // F20: today's happening (visible from the day's start until its window closes)
  if (!(S.$eng.seed > 0)) S.$eng.seed = (hash32(String(seedHint || ''), stamp({ ...S.World, Year: 1 }), String(S.Player.Profile.Name || '')) % 2147483646) + 1;
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
  const goneNow = id => (S.Campus_State.Graduated || []).includes(id);   // 1.7.6: a graduate's rewards stop working
  const dayNoB = Math.floor(absB / DAY_MIN);
  // FP2: the story records the announced winner; the other nominee is always the incoming Vice President.
  // Keep a recorded result stable across swipes, updates and later school years. Year 1 has the owner's named nominees.
  {
    const C = S.Campus_State.Council, BC = hasB && B.Campus_State && B.Campus_State.Council || {};
    C.Candidates['1'] = { First: 'Florian', Second: 'Dante' };
    for (const [key, pair] of Object.entries(C.Candidates)) {
      const y = Number(key), prev = (BC.Candidates || {})[key];
      if (key === '1') continue;
      if (prev && prev.First && prev.Second) { C.Candidates[key] = prev; continue; }
      const ids = [pair.First, pair.Second].map(x => NPC_ALIAS[String(x).toLowerCase()] || x);
      const eligible = id => !!STUDENTS[id] && (STUDENTS[id][1] || 1) <= y && yearOf(id, y) >= 1 && yearOf(id, y) <= 2;
      if (!Number.isInteger(y) || y < 2 || ids[0] === ids[1] || !ids.every(eligible)) {
        delete C.Candidates[key];
        if (pair.First || pair.Second) log.push(`Council candidates for Year ${key} must be two different named students eligible to attend the next year.`);
      } else C.Candidates[key] = { First: ids[0], Second: ids[1] };
    }
    for (const [key, result] of Object.entries(C.Results)) {
      const y = Number(key), prev = (BC.Results || {})[key], pair = C.Candidates[key];
      if (prev && prev.President && prev.VicePresident) { C.Results[key] = prev; continue; }
      const winner = NPC_ALIAS[String(result.President).toLowerCase()] || result.President;
      const other = pair && (winner === pair.First ? pair.Second : winner === pair.Second ? pair.First : '');
      const close = Number.isInteger(y) && y > 0 ? toAbs({ Year: y, Month: 10, Week: 3, Day: 'Sat', Time: '16:00' }) : Infinity;
      if (!other || absA < close) {
        delete C.Results[key];
        if (result.President) log.push(`Council result for Year ${key} waits until Saturday voting closes and must name one of that year's two candidates.`);
      } else {
        C.Results[key] = { President: winner, VicePresident: other };
        if (!prev || !prev.President) jnl.push(`Student Council election: ${winner} was elected President for Year ${y + 1} and named ${other} Vice President.`);
      }
    }
    if (S.World.Year > 1 && !C.Results['1']) {
      C.Results['1'] = { President: 'Florian', VicePresident: 'Dante' };
      log.push('The Year 1 Council election was skipped in this save; Florian is the default President and Dante the Vice President for Year 2.');
    }
    const cur = S.World.Year === 1 ? { President: 'Irene', VicePresident: 'Caspian' } : C.Results[String(S.World.Year - 1)] || {};
    const elect = C.Results[String(S.World.Year)] || {};
    C.President = S.World.Month === 12 ? '' : cur.President || '';
    C.VicePresident = S.World.Month === 12 ? '' : cur.VicePresident || '';
    C.PresidentElect = elect.President || '';
    C.VicePresidentElect = elect.VicePresident || '';
  }
  // Entrance tour: a reproducible roster-first assignment, saved once so swipes and scene changes keep the same trio.
  // In Year 1 {{user}} is one of the two first-years; in later years {{user}} is the senior guide.
  if (evs.some(e => e.entr)) {
    const Y = S.World.Year, returning = Y > 1 || num(S.Player.Profile.Year, 1) > 1;
    const required = returning ? 2 : 1;
    const T = S.Campus_State.Entrance_tour, old = hasB && B.Campus_State && B.Campus_State.Entrance_tour;
    if (old && old.Year === Y && old.Guide && (old.FirstYears || []).length === required) {
      S.Campus_State.Entrance_tour = _.cloneDeep(old);
    } else {
      const unavailable = id => npcAwayIn(S, id);
      const students = Object.keys(STUDENTS).filter(id => (STUDENTS[id][1] || 1) <= Y && !unavailable(id));
      const freshmen = students.filter(id => yearOf(id, Y) === 1);
      const seniors = students.filter(id => yearOf(id, Y) >= 2 && yearOf(id, Y) <= 3);
      const ordered = (ids, key) => {
        const here = ids.filter(id => S.Scene.Present[id]);
        const rest = ids.filter(id => !S.Scene.Present[id]).sort();
        const shift = rest.length ? hash32(S.$eng.seed, Y, key) % rest.length : 0;
        return [...here, ...rest.slice(shift), ...rest.slice(0, shift)];
      };
      const proposed = (T.FirstYears || []).map(x => NPC_ALIAS[String(x).toLowerCase()] || x);
      const first = [...new Set(proposed.filter(id => freshmen.includes(id)))].slice(0, required);
      for (const id of ordered(freshmen, 'entrance-first-years')) if (first.length < required && !first.includes(id)) first.push(id);
      // Only if roster candidates cannot fill the group may a narrator-created first-year take a remaining place.
      for (const id of proposed) if (first.length < required && !STUDENTS[id] && /\s/.test(id) && !first.includes(id)) first.push(id);
      const requestedGuide = NPC_ALIAS[String(T.Guide || '').toLowerCase()] || T.Guide;
      const guide = returning ? '{{user}}' : seniors.includes(requestedGuide) ? requestedGuide
        : ordered(seniors, 'entrance-guide')[0] || (seniors.length ? '' : requestedGuide || '');
      S.Campus_State.Entrance_tour = { Year: Y, Guide: guide, FirstYears: first };
      if (hasB) log.push(`Entrance tour assigned: ${returning ? '{{user}} guides' : guide + ' guides {{user}} and'} ${first.join(' and ') || 'new first-years yet to be named'}. Keep this trio through 18:00.`);
    }
  }
  if (hasB && dayNo !== dayNoB && evs.some(e => e.ranking) && (S.$ui.off || []).includes('study')) log.push('Results & Dorm Ranking today: update Player.Profile.Dorm_rank when the results are announced.');
  if (hasB && dayNo !== dayNoB && evs.some(e => e.grad)) log.push(`Graduation today: the third-years leave by airship tomorrow morning; the engine then lists them in Campus_State.Graduated.${Object.keys(STAYS).filter(id => yearOf(id, S.World.Year) === 3 && !(S.Campus_State.Graduated || []).includes(id)).map(id => ` ${id} is not graduating (see their lore).`).join('')}`);
  // 1.7.4: {{user}} turns a year older on the first update of their birthday (once per campaign year), unless the story already
  // changed Player.Profile.Age in that update
  if (hasB && bday && dayNo !== dayNoB) {
    const bs = S.$eng.bdays || (S.$eng.bdays = []), k = `Y${S.World.Year}`;
    if (!bs.includes(k)) {
      bs.push(k);
      if (num(S.Player.Profile.Age, 18) === num(B.Player.Profile.Age, 18)) { S.Player.Profile.Age = num(S.Player.Profile.Age, 18) + 1; log.push(`Birthday: {{user}} turns ${S.Player.Profile.Age} today (Player.Profile.Age).`); }
    }
  }
  Object.assign(c, { absB, absA, elapsed, evs, dayNo, goneNow, dayNoB });
}

// ---- 1b. 1.1.0 weather (spec §4): season, sky, wind, rare weather and °C for the current block; the Divination Society forecast ----
function stepWeather(c) {
  const { S, log, hasB, absB, absA, dayNo } = c;
  const WXM = S.$ui.wxfx, seed = S.$eng.seed, TU = tuneOf(S);
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

  S.$ui.moods = {};
  if (WXM !== 'off') for (const id of Object.keys(NPC_MOODS)) if ((ARRIVES[id] || 1) <= S.World.Year && (S.Bonds[id] || (S.Scene.Present || {})[id]))
    S.$ui.moods[id] = moodOf(id, S, S.$ui.wx && !S.$ui.wx.away ? S.$ui.wx.now : null, dayNo);
  S.$ui.party = birthdayParty(S);
  Object.assign(c, { WXM, seed, TU, wxNow });
}

// ---- 2. magic: casts ----
function stepMagic(c) {
  const { S, B, log, hasB, absA, elapsed, TU, wxNow } = c;
  const V = S.Player.Vitals, M = S.Magic, T = M._Techniques || {};
  const BA = (hasB && B.Magic && B.Magic.Active) || {};
  // v1.0.3 (A#3): the AI never sees $ fields, so a whole-record replace drops them; the same effect keeps its start time
  for (const [k, e] of Object.entries(M.Active || {})) {
    const e0 = BA[k];
    if (e0 && e0.Technique === e.Technique && !(e.$started >= 0) && e0.$started >= 0) { e.$started = e0.$started; e.$settled = e0.$settled; }
  }
  const wind = wxNow && isOutdoor(S.World.Location) && !blocksWind(M.Active, T) ? wxNow.wind : '';
  const windCost = (t, amount, name) => {
    const mult = windMultiplier(t.Subtype, M._Affinity.Custom, wind), cost = Math.round(amount * mult * 100) / 100;
    if (wind && amount > 0) log.push(`${name} cost ${cost} (×${mult}, ${wind} outdoors).`);
    return cost;
  };
  if (wind && S.$ui.wx.field) S.$ui.wx.field += '; casting: Wind/Storm ×' + (wind === 'gale' ? '0.75' : '1') + ', scattered ×' + (wind === 'gale' ? '2' : '1.5') + ', body/object ×1, others ×' + (wind === 'gale' ? '1.5' : '1.25');
  // 1.9.4 (playtest Batch 4): passive mana regeneration, Mana_max / 360 per elapsed minute awake or asleep (empty to full in six
  // hours). The turn's regeneration is a pool counted once: a cast or activation that needs more than the mana on hand draws on it,
  // sustained upkeep is paid from it minute by minute, and the rest is added after upkeep (section 4).
  const regenRate = V.HP > 0 ? num(V.Mana_max, 0) / (60 * TU.mana_regen) : 0;   // 1.9.9: Settings > Body and magic (default 6 hours)
  let regenLeft = regenRate * elapsed;
  const payMana = cost => { const pool = Math.min(regenLeft, Math.max(0, cost - V.Mana)); regenLeft -= pool; V.Mana -= cost - pool; };
  const activeNow = tq => Object.values(M.Active || {}).some(e => e.Technique === tq);
  const partnerHere = pk => { const P = (M.Pacts || {})[pk] || {}; return P.Presence === 'terms' || !!P.Summoned || activeNow('Summon ' + pk); };
  // 1.12.0 (H6, planning/DRAFT_missed_reports.md): a sustained or hybrid technique reported only in Casts, with no running effect,
  // was started: it becomes an Active entry (Activation in section 3, then upkeep), not a one-off cast. More uses of a hybrid in the
  // same entry are its triggers. A pact's Summon started this way also marks the partner summoned.
  const autoStarted = new Set();
  {
    const keep = [];
    for (const c of M.Casts || []) {
      const t = T[c.Technique];
      if (t && (t.Cost_mode === 'sustained' || t.Cost_mode === 'hybrid') && !activeNow(c.Technique)) {
        const key = c.Technique in M.Active ? c.Technique + ' (started)' : c.Technique;
        M.Active[key] = { Technique: c.Technique, Note: '' }; autoStarted.add(key);
        log.push(`${c.Technique} is ${t.Cost_mode}: it now runs in Magic.Active as "${key}" (activation, then upkeep each minute); remove that entry when {{user}} ends it.`);
        if (t.Cost_mode === 'hybrid' && (c.Times || 1) > 1) keep.push({ Technique: c.Technique, Times: c.Times - 1 });
        const pm = /^\[pact\]\s*(.+)$/.exec(t.Notes || ''), pk = pm && pm[1].trim();
        if (pk && c.Technique === 'Summon ' + pk && (M.Pacts || {})[pk]) M.Pacts[pk].Summoned = true;
      } else keep.push(c);
    }
    M.Casts = keep;
  }
  // 1.12.0 (H5): a summoned pact partner and its Summon effect in Magic.Active follow each other (rule 502 asks for both). Summoned
  // written without the effect starts it; the effect removed, or Summoned turned off, dismisses the partner; an effect started
  // without Summoned sets it. A partner that lives by its terms is not summoned and is left alone.
  for (const [pk, P] of Object.entries(M.Pacts || {})) {
    const tq = 'Summon ' + pk;
    if (!P || P.Presence === 'terms' || !T[tq] || T[tq].Cost_mode === 'per_use') continue;
    const runs = activeNow(tq), ran = Object.values(BA).some(e => e && e.Technique === tq);
    const was = !!((((hasB && B.Magic && B.Magic.Pacts) || {})[pk]) || {}).Summoned;
    if (P.Summoned && !runs) {
      if (ran) { P.Summoned = false; log.push(`${pk} was dismissed (the Summon effect left Magic.Active).`); }
      else {
        const key = pk in M.Active ? tq : pk;
        M.Active[key] = { Technique: tq, Note: '' }; autoStarted.add(key);
        log.push(`${pk} was summoned: "${key}" now runs in Magic.Active (activation, then upkeep each minute).`);
      }
    } else if (!P.Summoned && runs) {
      if (was) {
        for (const [k, e] of Object.entries(M.Active)) if (e && e.Technique === tq) delete M.Active[k];
        log.push(`${pk} was dismissed: its Summon effect ended.`);
      } else P.Summoned = true;
    }
  }
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
    const cost = windCost(t, unit * (c.Times || 1), c.Technique);
    if (cost > V.Mana + regenLeft) { log.push(`${c.Technique} needed ${cost} mana but only ${Math.floor(V.Mana + regenLeft)} was left: the casting strained or failed (mana now 0).`); V.Mana = 0; regenLeft = 0; }
    else payMana(cost);
  }
  M.Casts = [];

  // ---- 3. magic: sustained effects ----
  const endPact = eff => {   // v1.0.3 (F06): the engine ended a pact summon -> the spirit is no longer summoned
    const t = T[eff.Technique], m = t && /^\[pact\]\s*(.+)$/.exec(t.Notes || '');
    if (m && /^Summon /.test(eff.Technique) && M.Pacts && M.Pacts[m[1].trim()]) M.Pacts[m[1].trim()].Summoned = false;
  };
  const settle = (name, eff, until) => {
    const t = T[eff.Technique];
    const rate = t ? windCost(t, t.Upkeep_per_min || 0, name + " upkeep/min") : 0;
    const from = eff.$settled >= 0 ? eff.$settled : until;
    const mins = Math.max(0, until - from);
    if (rate <= 0 || mins <= 0) { eff.$settled = until; return true; }
    const need = rate * mins, regen = Math.min(regenLeft, regenRate * mins);   // 1.9.4: regeneration during these minutes offsets upkeep
    if (need <= V.Mana + regen) { const r = Math.min(regen, need); regenLeft -= r; V.Mana -= need - r; eff.$settled = until; return true; }
    const g = regen / mins, lasted = Math.floor(V.Mana / (rate - g));   // net drain until empty; regeneration after the end stays in the pool
    regenLeft -= g * lasted; V.Mana = 0;
    log.push(`${name} ended at ${fromAbs(from + lasted).Time}: mana ran out.`);
    return false;
  };
  // 1.12.0 (H7): an effect that only changed its name in Magic.Active (same technique) keeps running: no second Activation
  const renamed = new Set(), cont = new Set();
  for (const [name, eff] of Object.entries(M.Active)) {
    if (name in BA || !eff || autoStarted.has(name)) continue;
    const old = Object.keys(BA).find(k => !(k in M.Active) && !renamed.has(k) && BA[k] && BA[k].Technique === eff.Technique && BA[k].$started >= 0);
    if (old) { renamed.add(old); cont.add(name); eff.$started = BA[old].$started; eff.$settled = BA[old].$settled; }
  }
  for (const [name, eff] of Object.entries(BA)) {              // effects the AI ended this turn: settle up to now
    if ((!(name in M.Active) || autoStarted.has(name)) && !renamed.has(name)) settle(name, { ...eff }, absA);
  }
  const startedNow = [];                                         // 1.12.0: techniques started this update (section 8l)
  for (const [name, eff] of Object.entries(M.Active)) {
    const t = T[eff.Technique];
    if ((!(name in BA) && !cont.has(name)) || eff.$started < 0 || autoStarted.has(name)) {   // started this turn
      eff.$started = absA; eff.$settled = absA;
      if (t && t.Cost_mode !== 'per_use' && t.Activation) {
        const activation = windCost(t, t.Activation, name);
        if (activation > V.Mana + regenLeft) { log.push(`${name} could not be sustained: not enough mana to activate.`); endPact(eff); delete M.Active[name]; continue; }
        payMana(activation);
      }
      if (!t) log.push(`Active effect "${name}" names no known technique; no upkeep is charged.`);
      startedNow.push(eff.Technique);
    } else {
      if (name in BA) { eff.$started = BA[name].$started; eff.$settled = BA[name].$settled; }
      if (!settle(name, eff, absA)) { endPact(eff); delete M.Active[name]; continue; }
    }
  }
  Object.assign(c, { V, M, regenLeft, startedNow });
}

// ---- 4. rest & recovery (1.1.0: Soaked halves stamina recovery; sleep quality follows the night's weather, Full only) ----
// 1.12.0 (H1): a night skipped in one update (5 to 24 hours, 4 of them between 00:00 and 06:00) with no Resting written was
// slept, not stayed up: indoors (or on a trip), not in a battle, not under The Vigil. "awake" is a deliberate all-nighter.
function stepRest(c) {
  const { S, B, log, hasB, toolEdit, absB, absA, elapsed, seed, TU, wxNow, V, regenLeft } = c;
  if (V.Resting === 'awake') V.Resting = 'none';
  else if (hasB && !toolEdit && V.Resting === 'none' && V.HP > 0 && elapsed >= 300 && elapsed <= DAY_MIN && nightMinutes(absA) - nightMinutes(absB) >= 240
    && !(S.Battle && S.Battle.Active) && (!isOutdoor(S.World.Location) || (S.Trip && S.Trip.Active))) {
    const vig = num((((B.$eng || {}).sleep) || {}).vigilUntil, -1) > absB || (S.Consumables || []).some(x => /^the vigil$/i.test(String(x).trim()));
    if (!vig) { V.Resting = 'sleep'; log.push('{{user}} slept through the night (read from the time skip; write Resting "awake" for an all-nighter).'); }
  }
  const restedAs = V.Resting;
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
      if (h >= 6 && V.HP > 0 && !deadBefore && !Object.values(S.Player.Injuries).some(i => i.Severity === 'serious' || i.Severity === 'critical')) V.HP += 5;   // v1.0.3 (F07, D13): no sleeping back from death
    } else {
      V.Stamina += 20 * h * stMul;
    }
  }
  V.Mana += regenLeft;                                           // 1.9.4: mana regenerates passively (section 2); resting adds none
  // 1.16.1 (audit B2): a used item takes effect only if {{user}} has it: in the Bag before this reply, added to it in this reply,
  // or bought in this reply (a new Transactions line names it, e.g. a hot drink at a café). Anything else changes nothing.
  if (hasB && Array.isArray(S.Consumables) && S.Consumables.length) {
    const ik = x => String(x || '').trim().toLowerCase().replace(/^(an?|the)\s+/, '').replace(/\s*\(.*\)$/, '');
    const have = new Set([...Object.keys(B.Inventory || {}).filter(k => num((B.Inventory[k] || {}).Qty, 0) > 0), ...Object.keys(S.Inventory || {})].map(ik));
    const T0 = new Set(((B.Player || {}).Wallet || {}).Transactions || []);
    const bought = (S.Player.Wallet.Transactions || []).filter(l => !T0.has(l)).join(' | ').toLowerCase();
    S.Consumables = S.Consumables.filter(c => {
      const k = ik(c); if (!k || have.has(k) || bought.includes(k)) return true;
      log.push(`"${String(c).trim()}" was reported used, but {{user}} has none (not in the Bag, not bought in this reply): no effect.`);
      return false;
    });
  }
  updateSleep(S, hasB ? B : null, absB, absA, TU, log);
  const consumed = S.Consumables || [];                         // 1.9.5: item effects are applied with the weather effects (4b)
  S.Consumables = [];
  // 1.12.0 (H2): an item reported used lowers its Qty in the Bag by one per report, unless this update already lowered it
  if (hasB && consumed.length && _.isPlainObject(S.Inventory)) {
    const IB = B.Inventory || {}, need = _.countBy(consumed.map(x => String(x).trim().toLowerCase()));
    for (const [lk, n] of Object.entries(need)) {
      const k = Object.keys(S.Inventory).find(x => x.toLowerCase() === lk), kb = Object.keys(IB).find(x => x.toLowerCase() === lk);
      if (!k || !kb) continue;
      const extra = n - Math.max(0, num(IB[kb].Qty, 1) - num(S.Inventory[k].Qty, 1));
      if (extra > 0) S.Inventory[k].Qty = Math.max(0, num(S.Inventory[k].Qty, 1) - extra);
    }
  }
  V.Resting = 'none';
  Object.assign(c, { restedAs, Cn, consumed });
}

// ---- 4b. 1.1.0 weather effects (Full, on campus): outdoor exposure -> Soaked / Chilled / Overheated, daily Head cold roll ----
function stepExposure(c) {
  const { S, B, log, hasB, absA, elapsed, dayNo, dayNoB, WXM, seed, TU, wxNow, V, Cn, consumed } = c;
  {
    const xs = _.isPlainObject(S.$eng.wxs) ? S.$eng.wxs : (S.$eng.wxs = {});
    for (const k of ['wet', 'cold', 'hot', 'dry']) if (!(xs[k] >= 0)) xs[k] = 0;
    if (!(xs.exp > -1e9)) xs.exp = -1e9; if (!(xs.hc > -1e9)) xs.hc = -1e9;
    const C0 = (hasB && B.Player && B.Player.Conditions) || {};
    const storyNew = hasB && Object.keys(Cn).some(k => !C0[k] && k !== 'Head cold');   // the story added one (a bucket of water)
    // 1.9.4 (playtest Batch 4): /Exposure reports a direct soaking or freezing (a water or ice hit) as it happens
    const expo = (Array.isArray(S.Exposure) ? S.Exposure : []).map(e => EXPO[(e && e.Kind) || ''] ? { k: EXPO[e.Kind], why: (e.Cause || '').trim() } : null).filter(Boolean);
    S.Exposure = [];
    let hit = false;
    // 1.9.5 (playtest Batch 5): items used this reply (/Consumables) with a shop effect: clear conditions, stamina, timed gear, cold remedy
    const buff = xs.buff = _.isPlainObject(xs.buff) ? _.pickBy(xs.buff, t => t > absA) : {};
    for (const c of consumed) {
      const u = (fxOf(c) || {}).use; if (!u) continue;
      const done = [];
      for (const k of u.clears || []) if (Cn[k]) { delete Cn[k]; done.push(k + ' cleared'); if (k === 'Soaked') xs.wet = 0; if (k === 'Chilled') xs.cold = 0; if (k === 'Overheated') xs.hot = 0; }
      if (u.stamina > 0) { V.Stamina += u.stamina; done.push('+' + u.stamina + ' stamina'); }
      if (u.buff && WXM === 'full') { buff[u.buff] = Math.max(buff[u.buff] || 0, absA + u.mins); done.push(`${u.buff} until ${fromAbs(buff[u.buff]).Time}`); }
      if (u.cure && Cn[u.cure] && xs.hc > dayNo + 1) { xs.hc = dayNo + 1; done.push(u.cure.toLowerCase() + ' ends tomorrow'); }
      if (done.length) { log.push(`${String(c).trim()}: ${done.join(', ')}.`); S.$ui.toasts.push(`${String(c).trim()}: ${done[0]}`); }
    }
    for (const k of Object.keys(C0)) if (!Cn[k]) { if (k === 'Soaked') xs.wet = 0; if (k === 'Chilled') xs.cold = 0; if (k === 'Overheated') xs.hot = 0; if (k === 'Head cold') xs.hc = -1e9; }   // the story removed it
    if (wxNow) {
      const bk = wxNow, gear = gearOf(S.Inventory, buff, absA), since = stamp(S.World);
      const outB = hasB && isOutdoor(B.World.Location), outA = isOutdoor(S.World.Location);
      const o = elapsed > 0 ? (outB && outA ? elapsed : outB || outA ? elapsed / 2 : 0) : 0;
      const add = (k, why) => { if (!Cn[k]) { Cn[k] = { Effect: COND[k], Since: since }; S.$ui.toasts.push(`Condition: ${k}`); log.push(`{{user}} is now ${k} (${why}).`); } };
      // head cold: one roll at the first update of a new day
      if (hasB && dayNo !== dayNoB && !Cn['Head cold']) {
        const p = (xs.exp >= dayNoB ? 0.15 : 0) + (fluOn(seed, dayNo) ? 0.05 : 0) + (pctOf(V.Stamina, V.Stamina_max) < 30 ? 0.05 : 0);
        if (p > 0 && rand01(seed, dayNo, 'hc') < p) { xs.hc = dayNo + 2 + hash32(seed, dayNo, 'hcd') % 3; add('Head cold', `for ${xs.hc - dayNo} days`); }
      }
      if (Cn['Head cold'] && xs.hc > -1e9 && dayNo >= xs.hc) { delete Cn['Head cold']; xs.hc = -1e9; S.$ui.toasts.push('Head cold is over'); }
      for (const e of expo) { hit = true; add(e.k, e.why || (e.k === 'Soaked' ? 'a direct soaking' : 'a freezing hit')); }
      const dryProt = gear.waterproof || (gear.umbrella && !bk.wind && bk.sky !== 'Storm');
      xs.wet = o > 0 && wxBad(bk) && !dryProt ? xs.wet + o : 0;
      if (xs.wet >= (wxHeavy(bk) ? 5 : 20)) add('Soaked', gear.umbrella && !gear.waterproof ? 'the wind beat the umbrella' : 'caught out in the ' + (bk.snow ? 'snow' : 'rain'));
      const chillTemp = bk.temp - (bk.wind === 'gale' ? 14 : bk.wind === 'windy' ? 7 : 0);
      xs.cold = o > 0 && chillTemp <= (gear.warm ? -5 : 0) ? xs.cold + o : 0;
      if (xs.cold >= 30 || (Cn.Soaked && o > 0 && chillTemp <= (gear.warm ? 3 : 8))) add('Chilled', `${bk.temp} °C outdoors`);
      // soaked through outdoors at freezing: the chill is immediate (warm gear holds it off until the next minutes outdoors)
      if (Cn.Soaked && !C0.Soaked && outA && chillTemp <= (gear.warm ? -5 : 0)) add('Chilled', `soaked through at ${bk.temp} °C outdoors`);
      xs.hot = o > 0 && bk.temp >= (gear.sun ? 31 : 28) && (bk.sky === 'Clear' || bk.sky === 'Cloudy') ? xs.hot + o : 0;
      if (xs.hot >= 60) add('Overheated', `${bk.temp} °C in the sun`);
      if (o > 0 && (bk.wind === 'gale' || Cn.Chilled || Cn.Overheated)) V.Stamina -= (bk.wind === 'gale' ? TU.gale_stamina : 10) * o / 60;
      xs.dry = outA ? 0 : xs.dry + (outB ? elapsed - o : elapsed);
      if (storyNew || hit) xs.dry = 0;                                  // ...so it lasts its full time from now
      for (const [k, mins] of [['Soaked', 60], ['Chilled', 60], ['Overheated', 30]]) if (Cn[k] && xs.dry >= mins && !(k === 'Chilled' && xs.cold)) { delete Cn[k]; S.$ui.toasts.push(`${k}: over`); }
      if (Cn.Soaked || Cn.Chilled) xs.exp = dayNo;
      if (Cn['Head cold']) V.Stamina = Math.min(V.Stamina, V.Stamina_max * 0.8);
    }
  }
}

// ---- 5. vitals ----
function stepVitals(c) {
  const { S, B, log, hasB, V } = c;
  if (hasB) {
    const dmg = B.Player.Vitals.HP - V.HP;
    if (dmg > 40 && !V.Lethal_flag) { V.HP = B.Player.Vitals.HP - 40; log.push(`HP loss capped at 40 (no lethal flag): HP ${Math.round(V.HP)}.`); }
    if (V.HP <= 0 && B.Player.Vitals.HP > 0) log.push('{{user}} has died.');
  }
  V.Lethal_flag = false;
  V.HP = _.clamp(V.HP, 0, V.HP_max); V.Stamina = _.clamp(V.Stamina, 0, V.Stamina_max); V.Mana = _.clamp(V.Mana, 0, V.Mana_max);
  {                                                              // 1.9.4: the display keeps 0.1; the rounding remainder carries to the next turn
    const exact = V.Mana + (V.Mana > 0 && V.Mana < V.Mana_max ? num(S.$eng.mrem, 0) : 0);
    V.Mana = _.clamp(Math.round(exact * 10) / 10, 0, V.Mana_max);
    S.$eng.mrem = V.Mana > 0 && V.Mana < V.Mana_max ? Math.round((exact - V.Mana) * 1e6) / 1e6 : 0;
  }
  const hp = pctOf(V.HP, V.HP_max), st = pctOf(V.Stamina, V.Stamina_max);
  V._Condition = V.HP <= 0 ? 'Dead' : hp <= 30 ? 'Unconscious / Critical' : hp <= 50 ? 'Badly Injured' : hp <= 70 ? 'Hurt' : hp <= 90 ? 'Bruised' : 'Healthy';
  V._Fatigue = V.Stamina <= 0 ? 'Collapsed' : st <= 30 ? 'Exhausted' : st <= 70 ? 'Tired' : 'Fresh';
  S.$ui.training = Object.values(S.Player.Injuries).some(i => /moderate|serious|critical/.test(i.Severity)) ? 'Injured' : /Exhausted|Collapsed/.test(V._Fatigue) ? 'Too tired to train' : '';
  if (hasB && B.Player.Vitals._Condition !== V._Condition) S.$ui.toasts.push(`Condition: ${V._Condition}`);
}

// ---- 5b. 1.3.0 reputation: Academy (staff and the institution), Student (the student body), Doves (the Dovecote). Signed Rep XP
// (engine-owned, in $xp) sets the level -5..+5. The narrator reports what earned or cost reputation in /Rep_events: repeatable
// triggers are capped at REP.weekly_cap a week per reputation, events and losses are not. Bond milestones and high Tension are
// counted by the engine (§6). A pre-1.3.0 save's Public / Dorm meters became Academy / Student XP in stepMigrate.
function stepReputation(c) {
  const { S, B, log, jnl, hasB, dayNo, goneNow, dayNoB, TU } = c;
  const RP = S.Player.Profile.Reputation || (S.Player.Profile.Reputation = {});
  const RPB = hasB ? ((((B.Player || {}).Profile || {}).Reputation) || {}) : null;
  const rx = {};
  for (const r of REP.reps) rx[r] = _.clamp(num(((RPB && RPB.$xp) || RP.$xp || {})[r], 0), -REP.thresholds[4], REP.thresholds[4]);
  delete RP.Public; delete RP.Dorm;
  const weekNo = Math.floor(dayNo / 7), weekNoB = Math.floor(dayNoB / 7);
  const repw = _.isPlainObject(S.$eng.repw) && S.$eng.repw.w === weekNo ? S.$eng.repw : { w: weekNo };
  const repLv = r => repLevel(rx[r]);
  // cap: 'week' (repeatable), 'bond' (only below bond_cap_level), '' (event or loss)
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
    if (r === 'Academy' && x < 0) S.$eng.wkloss = weekNo;   // 1.10.0: no clean week after this
    rx[r] = _.clamp(was + x, -REP.thresholds[4], REP.thresholds[4]);
    return rx[r] - was;
  };
  // one level up at once (Ruby, Baelin; Kuroo and Milena's tokens only below 0): Rep XP goes to where the next level begins
  const repLevelUp = (r, onlyNegative) => {
    const L = repLv(r);
    if (L >= 5 || (onlyNegative && L >= 0)) return false;
    rx[r] = Math.max(rx[r], repFloor(L + 1)); return true;
  };
  const vouchMonth = `Y${S.World.Year}M${S.World.Month}`, usedVouch = new Set();
  const vouchLedger = S.$eng.vouch = _.isPlainObject(S.$eng.vouch) ? S.$eng.vouch : {};
  for (const e of (Array.isArray(S.Rep_events) ? S.Rep_events : [])) {
    const kind = String(e.Kind || '').trim().toLowerCase(), deed = (REP.deeds || {})[kind];
    if (!deed && kind && !['repeat', 'event'].includes(kind)) { log.push(`Reputation deed "${kind}" is unknown; use a listed Kind or an explicit repeat/event entry.`); continue; }
    const r = deed ? deed[0] : REP.reps.find(x => x.toLowerCase() === String(e.Rep || '').trim().toLowerCase());
    if (!r) { log.push(`Reputation "${e.Rep}" is unknown (use Academy, Student or Doves); nothing was changed.`); continue; }
    let x = deed ? deed[1] : Math.round(num(e.XP, 0));
    if (x < 0 && e.Why) {
      const a = (S.Interactions || []).find(a => {
        const id = NPC_ALIAS[String(a.With || '').toLowerCase()] || a.With, b = S.Bonds[id];
        return a.Kind === 'vouch' && a.Public && String(a.Rep || '').toLowerCase() === r.toLowerCase() && a.Why === e.Why
          && b && b.Rank >= 9 && b.Trust >= trustGate(id, 9) && b.Tension < 70 && S.Scene.Present[id]
          && !goneNow(id) && vouchLedger[id] !== vouchMonth && !usedVouch.has(id);
      });
      if (a) { const id = NPC_ALIAS[String(a.With || '').toLowerCase()] || a.With, saved = Math.min(5, -x); x += saved;
        vouchLedger[id] = vouchMonth; usedVouch.add(id); log.push(`${id} vouched for {{user}} in the ${r} matter (${e.Why}): reputation loss reduced by ${saved} XP.`); }
    }
    if (S.World.Month === 10 && S.World.Week === 3 && S.World.Day === 'Sat' && r === 'Student' && x > 0 && (kind === 'club_time' || (kind !== 'event' && /\bclub\b/i.test(String(e.Why || ''))))) {
      log.push('Saturday club attendance earns no reputation during the Student Council election; the election replaced club time.');
      continue;
    }
    repAdd(r, x, e.Why || kind || 'story', deed ? deed[2] : x > 0 && kind !== 'event' ? 'week' : '');
  }
  S.Rep_events = [];
  const repSync = announce => {
    for (const r of REP.reps) {
      const L = repLevel(rx[r]), L0 = RPB ? num(RPB['_' + r], 0) : L;
      RP['_' + r] = L;
      if (announce && hasB && L !== L0) {
        const t = `${r} reputation ${L > L0 ? 'rose' : 'fell'} to ${L > 0 ? '+' : ''}${L}`;
        S.$ui.toasts.push(t); jnl.push(t + '.'); log.push(`${t}: ${repBand(r, L)}`);
        if (_.isPlainObject(S.$eng.wk)) (S.$eng.wk.rep = S.$eng.wk.rep || []).push(`${r} ${L > 0 ? '+' : ''}${L}`);   // 1.10.0 recap
      }
    }
    RP.$xp = { ...rx };
  };
  repSync(false);
  Object.assign(c, { weekNo, weekNoB, repw, repLv, repAdd, repLevelUp, repSync });
}

// ---- 5c. 1.9.8 Fortune roll (owner-approved planning/DRAFT_outside_presets.md A1). One seeded d100 per update, shown in <now>
// for the next reply: swipes of that reply re-run from this same state, so they all see the same number (no reroll by swipe).
// The narrator uses it only for an important, uncertain attempt by {{user}} (rule 504), adding these standing modifiers and the
// situation's own (fitting magic, cover, an alert opponent). Bands come from Settings (Gentle by default).
// 1.11.1 (bug hunt): a player-tool edit (Builder, Settings, calendar note) is not a story turn: it keeps the roll, so editing
// a setting and swiping cannot reroll it (the edit is inserted before the last reply since 1.9.1)
function stepFortune(c) {
  const { S, B, hasB, toolEdit, OFF, absA, seed, TU, V, M, repLv } = c;
  S.$eng.turn = hasB ? num((B.$eng || {}).turn, 0) + (toolEdit ? 0 : 1) : num(S.$eng.turn, 0);
  if (OFF.has('fortune')) S.$ui.fortune = null;
  else {
    const band = { 1: [10, 35], 2: [20, 50], 3: [30, 65] }[TU.fortune_band] || [10, 35];
    const mods = [], Cn2 = S.Player.Conditions || {}, sev = Object.values(S.Player.Injuries || {}).map(i => i.Severity);
    for (const [k, x] of [['Chilled', -10], ['Soaked', -5], ['Overheated', -5], ['Head cold', -5]]) if (Cn2[k]) mods.push(`${k} ${x}`);
    if (V._Fatigue === 'Exhausted') mods.push('Exhausted -15'); else if (V._Fatigue === 'Tired') mods.push('Tired -5');
    if (sev.some(x => /serious|critical/.test(x))) mods.push('seriously injured -20'); else if (sev.includes('moderate')) mods.push('injured -10');
    if (S.$ui.sleep && S.$ui.sleep.loss >= 0.2 && !S.$ui.sleep.flavor) mods.push('short on sleep -5');
    for (const [r, who] of [['Academy', 'staff'], ['Student', 'students'], ['Doves', 'Doves']]) { const L = repLv(r); if (L) mods.push(`with ${who} ${L > 0 ? '+' : ''}${L * 5}`); }
    const active = Object.entries(M.Active || {}).map(([k, e]) => e.Technique && e.Technique !== k ? `${k} (${e.Technique})` : k);
    S.$ui.fortune = { roll: d100(seed, 'fortune', S.$eng.turn, absA), fail: band[0], part: band[1], mods, active };
  }

  // 1.16.1 (audit B5): Rank 10 benefits suspended by low Trust, from the Trust before this reply, for the sections before the
  // bonds (exam perks); recomputed after the bonds for the rest
  S.$ui.tsusp = tsuspOf(S, (hasB && B.Bonds) || S.Bonds);
}

// ---- 5d. 1.10.0 (owner-approved planning/DRAFT_batch_fp7_fp11.md, Batch 1): FP7 attendance, FP10 weekly recap, FP12 small scenes ----
function stepSchoolWeek(c) {
  const { S, B, log, jnl, hasB, byBuilder, OFF, REPORTED, absB, absA, elapsed, evs, dayNo, goneNow, dayNoB, seed, TU, V, restedAs, weekNo, weekNoB, repLv, repAdd } = c;
  {
    const Pf = S.Player.Profile, PY = _.clamp(num(Pf.Year, 1), 1, 3), pts = x => num(((x || {}).Wallet || {}).Points, 0);
    let WK = _.isPlainObject(S.$eng.wk) ? S.$eng.wk : null;
    // week rollover: FP7 clean week and FP10 recap for the week that ended, then a fresh tally
    if (!WK || WK.w !== weekNo) {
      if (hasB && WK && WK.w === weekNoB) {
        const parts = [...(WK.ranks || []), ...(WK.rep || []).map(x => 'reputation ' + x)];
        if (!OFF.has('attendance') && num(WK.periods, 0) > 0 && !num(WK.skipped, 0) && S.$eng.wkloss !== weekNoB) {
          repAdd('Academy', 2, 'a clean week', 'week'); parts.push('a clean week');
        }
        if (num(WK.skipped, 0)) parts.push(`skipped ${WK.skipped} class${WK.skipped > 1 ? 'es' : ''}`);
        const net = pts(B.Player) - num(WK.p0, pts(B.Player)) - num(WK.pay, 0);   // monthly payouts excluded
        if (Math.abs(net) >= 300) parts.push(`points ${net > 0 ? '+' : ''}${net.toLocaleString('en')} net`);
        if (!OFF.has('recap') && (parts.length || TU.recap_mode === 2)) {
          const Wd = fromAbs(weekNoB * 7 * DAY_MIN);
          jnl.push(`Week recap (M${Wd.Month} W${Wd.Week}): ${parts.length ? parts.join('; ') : 'a quiet week'}.`);
        }
      }
      WK = S.$eng.wk = { w: weekNo, p0: hasB ? pts(B.Player) : pts(S.Player), ranks: [], rep: [], skipped: 0, periods: 0 };
    }
    // FP7: minutes in or away from the room of each class period this update overlapped (the location at the start and the end
    // of the update each count for half). Long skips (over six hours) are assumed to follow the routine.
    S.$ui.absent = null;
    const skippedNow = [];   // 1.15.0: subjects skipped in this update (a mark loses its attendance floor)
    const ATT =_.isPlainObject(S.$eng.att) ? S.$eng.att : (S.$eng.att = {});
    for (const k of ['p', 'c', 'done']) if (!_.isPlainObject(ATT[k])) ATT[k] = {};
    for (const k of Object.keys(ATT.done)) if (+k.split(':')[0] < dayNo - 1) { delete ATT.done[k]; delete ATT.p[k]; delete ATT.c[k]; }
    const inj = Object.values(S.Player.Injuries || {}).some(i => /moderate|serious|critical/.test(i.Severity));
    const pkA = placeKey(S.World.Location), pkB = hasB ? placeKey(B.World.Location) : pkA;
    // 1.11.1 (bug hunt): only a place on the Campus Map other than the class venue counts as away; a name the map does not know
    // ("Classroom", "Seminar Room 4") is the narrator's wording and gets the benefit of the doubt. A place inside a venue counts
    // as the venue (the Sparring Pavilion is in a corner of the Combat Grounds, the Forest Clearing is in the Forest).
    const knownPlace = pk => !!pk && CAMPUS.some(c => c.replace(/^the /, '') === pk);
    const VENUE_PARTS = { 'combat grounds': ['sparring pavilion'], forest: ['forest clearing'] };
    const classVenues = v => [...v, ...v.flatMap(x => VENUE_PARTS[x] || [])];
    const excused = pkA === 'medical centre' || pkB === 'medical centre' || (S.Player.Conditions || {})['Head cold'] || inj
      || (S.Trip && S.Trip.Active) || (S.Battle && S.Battle.Active) || V._Fatigue === 'Collapsed' || Pf.Dorm === 'Unsorted';
    if (hasB && elapsed > 0 && elapsed <= 360 && !OFF.has('attendance') && CLASS.tt) {
      for (let d = dayNoB; d <= dayNo; d++) {
        const Wd = fromAbs(d * DAY_MIN), evD = eventsOn(Wd), row = CLASS.tt[Wd.Day];
        if (!row || evD.some(e => e.noclass || e.home || e.lockdown || e.away)) continue;
        [[480, 600], [600, 720], [780, 960]].forEach(([s0, e0], p) => {
          const ov = Math.min(absA, d * DAY_MIN + e0) - Math.max(absB, d * DAY_MIN + s0);
          if (ov <= 0) return;
          const cell = row[p], key = `${d}:${p}`, elect = Wd.Month === 10 && Wd.Week === 3 && Wd.Day === 'Sat' && p === 2;
          const share = (v, doubt) => ov * ((v.includes(pkB) || (doubt && !knownPlace(pkB)) ? 0.5 : 0) + (v.includes(pkA) || (doubt && !knownPlace(pkA)) ? 0.5 : 0));
          if (cell[3] === 'class') {
            if (!ATT.done[key] && !(key in ATT.p)) { WK.periods++; ATT.p[key] = 0; }
            ATT.p[key] += ov - share(classVenues(cell[2]), true);
            if (!excused && !ATT.done[key] && ATT.p[key] > TU.att_minutes) {
              ATT.done[key] = true; WK.skipped++; skippedNow.push(cell[0]);
              const tch = Object.keys(CLASS.teach || {}).find(id => teaches(id, cell[0], PY) && !goneNow(id));
              repAdd('Academy', -2, `skipped ${cell[0]}`, '');
              S.$ui.absent = { cls: cell[0], teacher: tch || '' };
              log.push(`{{user}} skipped ${cell[0]} (${TIMES[p]}); Academy reputation -2.`);
            }
          } else if (cell[3] === 'clubs' && Pf.Club && !elect) {
            const v = (CLASS.clubs || {})[Pf.Club] || [];
            ATT.c[key] = num(ATT.c[key], 0) + share(v);
            if (!ATT.done[key] && ATT.c[key] >= 60) { ATT.done[key] = true; repAdd('Student', 1, `Saturday time at the ${Pf.Club}`, 'week'); }
          }
        });
      }
    }
    // FP8: study time toward the next exam week -> preparation tier; FP9: the Results days set the dorm rank
    // 1.15.0 (owner-approved planning/DRAFT_grades_exams.md): the engine marks every subject A-F from the preparation tier, the
    // attendance floor (no skipped class: at least C), skips, the condition on the exam day, training (Combat) and four bond
    // rewards; the story may move a mark one step (/Exam_events). Midterm marks post on the Friday of exam week, finals on
    // Results day. Marks set the dorm rank, Academy/Doves reputation, remedials for an F, and the rewards of an A or B.
    S.$ui.exam = null; S.$ui.ranknews = null; S.$ui.grades = null; S.$ui.posted = null;
    if (!OFF.has('study')) {
      const EXAMS = [3, 5, 9, 11], Wn = S.World;
      const nextExam = W => { const m = EXAMS.find(x => W.Month < x || (W.Month === x && W.Week === 1)); return m ? `Y${W.Year}M${m}` : `Y${W.Year + 1}M3`; };
      const key = nextExam(Wn), TIERS = ['unprepared', 'shaky', 'fair', 'solid', 'excellent'];
      const cut = { 1: [2, 6, 12, 20], 2: [4, 10, 18, 28], 3: [6, 15, 25, 40] }[TU.study_tiers] || [4, 10, 18, 28];
      let ST = _.isPlainObject(S.$eng.study) ? S.$eng.study : null;
      if (!ST) ST = S.$eng.study = { key, mins: 0, grace: hasB, hist: {} };   // a save that gains the feature mid-term: floor "fair"
      for (const k of ['hist', 'skip', 'cap', 'shift', 'res', 'marks', 'stand', 'rem']) if (!_.isPlainObject(ST[k])) ST[k] = {};
      const tierOf = () => { const h = num(ST.mins, 0) / 60; let i = cut.filter(c => h >= c).length; if (ST.grace) i = Math.max(i, 2); return i; };
      const sessOf = k => { const m = /^Y(\d+)M(\d+)$/.exec(String(k || '')); return m ? { Y: +m[1], M: +m[2], fin: +m[2] === 5 || +m[2] === 11 } : null; };
      const labelOf = c => `Y${c.Y} M${c.M} ${c.fin ? 'Finals' : 'Midterm'}`;
      const runOf = k => ({ d: hash32(seed, k, 'run') % 4, h: 8 + hash32(seed, k, 'runh') % 8 });   // {{user}}'s finals run: Mon-Thu, 08:00-15:00
      const perkOn = (id, which) => { const x = ((REW.npcs || {})[id] || {})[which], p = x && (S._Perks || {})[x.name];
        return !!(p && p.Kind !== 'memento' && !goneNow(id) && !(S.$ui.tsusp || []).includes(x.name)); };
      // the engine owns Player.Academics while the feature is on: a direct write is reverted (the story uses /Exam_events)
      const AB = hasB && B.Player && B.Player.Academics;
      if (AB && !byBuilder && !_.isEqual(S.Player.Academics, AB)) {
        S.Player.Academics = _.cloneDeep(AB);
        log.push('Player.Academics is written by the engine; the change was reverted. Report an exam moment in /Exam_events instead.');
      }
      fillShape(S.Player.Academics, { Grades: {}, Exams: {} });
      // the story's exam moments (for the exams now being prepared or sat)
      for (const e of (Array.isArray(S.Exam_events) ? S.Exam_events : [])) {
        const s = subjectOf(e.Subject);
        if (!s) { log.push(`Exam subject "${e.Subject}" is unknown (use ${SUBJECTS.join(', ')}); nothing changed.`); continue; }
        if (ST.res[ST.key] || ST.marks[ST.key]) { log.push(`The ${s} mark for these exams is already set; the story can no longer move it.`); continue; }
        if (!e.Fail && !e.Shift) continue;
        ST.shift[s] = e.Fail ? { fail: 1, why: e.Why } : { s: Math.sign(e.Shift), why: e.Why };
        log.push(`${s}: ${e.Fail ? 'failed' : e.Shift > 0 ? 'one step up' : 'one step down'} at the next marking (${e.Why || 'the story'}).`);
      }
      // Mimosa's focus draught, taken on an exam day: that day's marks follow the preparation with no penalty
      const draught = ((REW.npcs || {}).Mimosa || {}).gift;
      if (draught && REPORTED.perks.includes(draught.name.toLowerCase()) && perkOn('Mimosa', 'gift')) ST.focus = dayNo;
      const markUp = () => {
        const gareth = perkOn('Gareth', 'r10'), t = Math.min(4, tierOf() + (gareth ? 1 : 0)), marks = {}, why = {};
        const tw = `${TIERS[tierOf()]} preparation${gareth ? " (+1 Gareth's tutoring)" : ''}`;
        for (const s of SUBJECTS) {
          const sk = num(ST.skip[s], 0), c = ST.cap[s] || {}, r = [tw];
          let m = t, mod = 0;
          if (!sk && m < 2) { m = 2; r.push('no class skipped: at least C'); }
          if (c.focus) r.push("focus draught: no penalty");
          else {
            if (sk >= 3) { mod--; r.push(`${sk} classes skipped -1`); }
            if (c.f === 'Tired') { mod--; r.push('Tired -1'); } else if (c.f === 'Exhausted') { mod -= 2; r.push('Exhausted -2'); }
          }
          if (s === 'Combat' && num(ST.train, 0) >= TRAIN_FOR_COMBAT) { mod++; r.push(`${num(ST.train, 0)} training sessions +1`); }
          m = _.clamp(m + _.clamp(mod, -2, 2), 0, 4);
          if (c.ex) { m = Math.min(m, 2); r.push('make-up exam: at most C'); }
          marks[s] = m; why[s] = r;
        }
        if (perkOn('Alyssa', 'r10')) {
          const p = PRACTICAL.filter(s => marks[s] < 4 && !(ST.cap[s] || {}).ex).sort((a, b) => marks[a] - marks[b])[0];
          if (p) { marks[p]++; why[p].push("Alyssa's Foresight +1"); }
        }
        for (const s of SUBJECTS) {
          const sh = ST.shift[s];
          if (sh && sh.fail) { marks[s] = 0; why[s].push(`failed (${sh.why || 'the story'})`); continue; }
          if (sh && sh.s) { marks[s] = _.clamp(marks[s] + sh.s, 0, 4); why[s].push(`${sh.why || 'the story'} ${sh.s > 0 ? '+1' : '-1'}`); }
          if (s === 'History' && marks[s] < 4 && perkOn('Layla', 'r10')) { marks[s] = 4; why[s].push("Layla's tutoring: A"); }
        }
        return { marks, why };
      };
      // the condition {{user}} sits each exam in: read on the first update after it starts
      const cs = sessOf(ST.key);
      if (cs && hasB) {
        const d0 = Math.floor(toAbs({ Year: cs.Y, Month: cs.M, Week: 1, Day: 'Mon', Time: '00:00' }) / DAY_MIN), run = runOf(ST.key);
        const hurt = Object.values(S.Player.Injuries || {}).some(i => /serious|critical/.test(i.Severity));
        for (const s of SUBJECTS) {
          const sl = cs.fin ? [run.d, run.h * 60, run.h * 60 + 120] : MID_SLOTS[s];
          if (!sl || ST.cap[s]) continue;
          const s0 = (d0 + sl[0]) * DAY_MIN + sl[1], e0 = (d0 + sl[0]) * DAY_MIN + sl[2];
          if (absA <= s0) continue;
          const known = absB < e0 && absA <= e0 + 360;   // the update reaches into the exam (a skip far past it: unknown)
          ST.cap[s] = { f: known ? V._Fatigue : '', ex: known && (pkA === 'medical centre' || V._Fatigue === 'Collapsed' || hurt), focus: ST.focus === d0 + sl[0] };
          if (ST.cap[s].ex) log.push(`${s} exam: {{user}} could not sit it (${pkA === 'medical centre' ? 'in the Medical Centre' : hurt ? 'badly injured' : 'collapsed'}); a make-up follows, marked at most C.`);
        }
      }
      // marks are set at the end of exam week (or when the next exams' count begins)
      const postDays = cs && Wn.Year === cs.Y && Wn.Month === cs.M && Wn.Week === 1 && ['Fri', 'Sat', 'Sun'].includes(Wn.Day);
      const begun = cs && absA >= toAbs({ Year: cs.Y, Month: cs.M, Week: 1, Day: 'Mon', Time: '08:00' });   // never marks exams still to come
      if (begun && hasB && !ST.res[ST.key] && !ST.marks[ST.key] && (ST.key !== key || postDays)) ST.res[ST.key] = markUp().marks;
      if (ST.key !== key) {   // an exam week has passed
        if (!(ST.key in ST.hist)) ST.hist[ST.key] = tierOf();
        Object.assign(ST, { key, mins: 0, grace: false, skip: {}, cap: {}, train: 0, shift: {} });
      }
      for (const s of skippedNow) ST.skip[s] = num(ST.skip[s], 0) + 1;
      // minutes: study places outside lessons (Saturday Study Hall counts), halves for the start and end of the update
      if (hasB && elapsed > 0 && elapsed <= 360 && restedAs !== 'sleep') {   // 1.12.0: Resting is reset in section 4; read what it was
        const SP = ['main library', 'study rooms', 'archive'], f = (SP.includes(pkB) ? 0.5 : 0) + (SP.includes(pkA) ? 0.5 : 0);
        let lesson = 0;
        for (let d = dayNoB; d <= dayNo; d++) {
          const Wd = fromAbs(d * DAY_MIN), row = CLASS.tt && CLASS.tt[Wd.Day];
          if (!row || eventsOn(Wd).some(e => e.noclass || e.home || e.lockdown || e.away)) continue;
          [[480, 600], [600, 720], [780, 960]].forEach(([s0, e0], p) => { if (row[p][3] === 'class') lesson += Math.max(0, Math.min(absA, d * DAY_MIN + e0) - Math.max(absB, d * DAY_MIN + s0)); });
        }
        ST.mins = num(ST.mins, 0) + Math.max(0, elapsed - lesson) * f;
      }
      for (const a of S.Interactions || []) if (String(a.Kind || '').toLowerCase() === 'study') {
        const id = NPC_ALIAS[String(a.With || '').toLowerCase()] || a.With, b = S.Bonds[id];
        ST.mins = num(ST.mins, 0) + 60 + (b && b.Rank >= 4 && (RANK4_PARTNERS[id] || []).includes('study') ? 30 : 0);
      }
      // posting: midterm marks at once, finals on Results day. Reputation from the average (docs/design/reputation.md figures),
      // and a remedial session for each F (next week's Saturday Study Hall slot, with the subject's teacher)
      const post = sess => {
        const c = sessOf(sess), mk = ST.res[sess], label = labelOf(c), Ac = S.Player.Academics;
        delete ST.res[sess];
        const line = SUBJECTS.map(s => `${s} ${MARKS[mk[s]]}`).join(', ');
        Ac.Exams[label] = line;
        for (const s of SUBJECTS) Ac.Grades[s] = MARKS[mk[s]];
        ST.marks[sess] = mk; ST.stand = { ...mk };
        for (const k of Object.keys(ST.marks).slice(0, -8)) delete ST.marks[k];
        const avg = SUBJECTS.reduce((a, s) => a + mk[s], 0) / SUBJECTS.length, fails = SUBJECTS.filter(s => !mk[s]);
        const up = avg >= 3.5 ? 15 : avg >= 2.5 ? 8 : avg >= 1.5 ? 3 : 0;
        if (up) repAdd('Academy', up, `${label} marks`, '');
        if (fails.length) repAdd('Academy', fails.length >= 2 ? -15 : -8, `failed ${fails.join(', ')} (${label})`, '');
        if (mk['Dark Magic Defense'] === 4) repAdd('Doves', 8, `top Dark Magic Defense mark (${label})`, '');
        const rem = [];
        for (const s of fails) {
          const k = `Remedial ${s}`, t = Object.keys(CLASS.teach || {}).find(id => teaches(id, s, PY) && !goneNow(id)) || '';
          const due = stamp(fromAbs(((weekNo + 1) * 7 + 5) * DAY_MIN + 600));
          S.Commitments[k] = { Desc: `Make-up session for the ${s} F (${label}); attending turns it into a D for the dorm ranking`, Due: due, With: t, Where: '', Type: 'appointment' };
          ST.rem[k] = sess; rem.push({ s, t, due });
        }
        S.$ui.posted = { label, line, rem };
        jnl.push(`${label} marks: ${line}.`);
        S.$ui.toasts.push(`${c.fin ? 'Final' : 'Midterm'} marks posted`);
        log.push(`${label} marks posted: ${line} (average ${avg.toFixed(1)} of 4).`);
        (WK.ranks = WK.ranks || []).push(`${label} marks posted`);
      };
      for (const sess of Object.keys(ST.res)) {
        const c = sessOf(sess);
        if (!c || !_.isPlainObject(ST.res[sess])) { delete ST.res[sess]; continue; }
        if (!c.fin || absA >= toAbs({ Year: c.Y, Month: c.M, Week: 2, Day: 'Fri', Time: '00:00' })) post(sess);
      }
      // FP9: the first update of a Results day
      const rk = `Y${Wn.Year}M${Wn.Month}`;
      if (evs.some(e => e.ranking) && ST.ranked !== rk && Pf.Dorm && Pf.Dorm !== 'Unsorted') {
        ST.ranked = rk;
        // 1.15.0: the semester's marks (midterm once, finals twice; 0-4 like the tiers before); a save without them: the tiers
        const pair = Wn.Month === 5 ? [3, 5] : [9, 11], gpa = m => { const mk = ST.marks[`Y${Wn.Year}M${m}`]; return mk ? SUBJECTS.reduce((a, s) => a + num(mk[s], 0), 0) / SUBJECTS.length : null; };
        const g = pair.map(gpa), ex = pair.map(m => num(ST.hist[`Y${Wn.Year}M${m}`], 2));
        const exScore = g[1] != null ? (g[0] != null ? (g[0] + 2 * g[1]) / 3 : g[1]) : (ex[0] + ex[1]) / 2;
        const exText = g[1] != null ? `marks ${exScore.toFixed(1)} of 4` : `exams ${ex.map(i => TIERS[i]).join(' / ')}`;
        const Co = S.Competition || {}, tier = String(Co.Tier || ''), status = String(Co.Status || '').toLowerCase();
        const comp = /champion/.test(status) ? 2 : /Academy|Kingdom|World/.test(tier) || /qualified|selected/.test(status) ? 1 : 0;
        const aL = repLv('Academy'), acadPts = aL >= 2 ? 1 : aL <= -2 ? -1 : 0;
        const score = exScore + comp + acadPts + (hash32(seed, rk, 'rank') % 100) / 100 - 0.5;
        const BANDS = [[1, 1], [2, 3], [4, 10], [11, 25], [26, 50], [51, 80]];
        // 1.11.1 (bug hunt): a rank below #80 is in the last band (it used to find no band and jump to #1)
        const bandOf = r => { const i = r >= 1 ? BANDS.findIndex(([, hi]) => r <= hi) : 5; return i < 0 ? 5 : i; }, cur = num(Pf.Dorm_rank, 0), b0 = bandOf(cur);
        const want = score >= 6.5 ? 0 : score >= 5.5 ? 1 : score >= 4.2 ? 2 : score >= 3 ? 3 : score >= 1.8 ? 4 : 5;
        const step = TU.rank_move || 1, b1 = want < b0 ? Math.max(want, b0 - step) : want > b0 ? Math.min(want, b0 + step) : b0;
        const [lo, hi] = BANDS[b1], to = b1 === b0 && cur >= 1 ? cur : lo + hash32(seed, rk, 'rankpos') % (hi - lo + 1);
        Pf.Dorm_rank = to;
        if (b1 < b0) repAdd('Academy', 5, 'dorm rank up on Results day', '');
        S.$ui.ranknews = { from: cur, to, dorm: Pf.Dorm };
        log.push(`Results day: dorm rank ${cur ? '#' + cur : 'unranked'} -> #${to} (${exText}, competition +${comp}, Academy ${acadPts >= 0 ? '+' : ''}${acadPts}).`);
        if (_.isPlainObject(S.$eng.wk) && cur !== to) (S.$eng.wk.ranks = S.$eng.wk.ranks || []).push(`dorm rank #${to}`);
      }
      // paid tutoring (lore 221) in a subject whose latest mark is an A: two sessions a week, each also a Notice Board request
      const TW = ST.tw && ST.tw.w === weekNo ? ST.tw : (ST.tw = { w: weekNo, n: 0 });
      for (const t of (Array.isArray(S.Tutoring) ? S.Tutoring : [])) {
        const s = subjectOf(t.Subject);
        if (!s || num(ST.stand[s], -1) < 4) { log.push(`Tutoring ${s || t.Subject}: paid tutoring needs an A in that subject at the latest exams; nothing was paid.`); continue; }
        if (TW.n >= TUTOR_WEEK) { log.push(`Tutoring: ${TUTOR_WEEK} paid sessions already this week; no pay for another.`); continue; }
        TW.n++;
        S.Player.Wallet.Points = num(S.Player.Wallet.Points, 0) + TUTOR_PAY;
        S.Player.Wallet.Transactions.push(`+${TUTOR_PAY} tutoring (${s}${t.Student ? ', ' + t.Student : ''})`);
        repAdd('Student', 2, `tutoring in ${s}`, 'week');
        S.$ui.toasts.push(`Tutoring +${TUTOR_PAY} points`);
      }
      // the expected marks now (Student file, <now>), exam week, and an A's Fortune bonus
      const nx = sessOf(ST.key), fc = markUp(), run = nx.fin ? runOf(ST.key) : null;
      S.$ui.grades = { label: labelOf(nx), set: !!(ST.res[ST.key] || ST.marks[ST.key]), tier: TIERS[tierOf()], h: Math.round(num(ST.mins, 0) / 60),
        marks: _.mapValues(fc.marks, m => MARKS[m]), why: _.mapValues(fc.why, r => r.join('; ')), run: run ? `${DAYS[run.d]} ${pad(run.h)}:00` : '',
        stand: _.mapValues(ST.stand, m => MARKS[m]) };
      const examWeek = EXAMS.includes(Wn.Month) && Wn.Week === 1 && ['Mon', 'Tue', 'Wed', 'Thu'].includes(Wn.Day) && !evs.some(e => e.home);
      if (examWeek) {
        const di = DAYS.indexOf(Wn.Day), today = SUBJECTS.filter(s => (nx.fin ? run.d === di : (MID_SLOTS[s] || [])[0] === di));
        S.$ui.exam = { tier: TIERS[tierOf()], h: Math.round(num(ST.mins, 0) / 60), run: S.$ui.grades.run, today: today.map(s => ({ s, mark: MARKS[fc.marks[s]], why: fc.why[s].slice(1).join('; ') })) };
      }
      if (S.$ui.fortune && Array.isArray(S.$ui.fortune.mods)) for (const s of SUBJECTS) if (num(ST.stand[s], -1) === 4) S.$ui.fortune.mods.push(`top mark in ${s}: ${TOP_FIELD[s]} +10`);
    }
    S.Exam_events = []; S.Tutoring = [];
    // FP12: on a day with nothing on the calendar, at most TU.scene_cap people with {{user}}; one more takes their leave
    S.$ui.leave = null;
    const hr = Math.floor((absA % DAY_MIN) / 60), perNow = /^P[123] /.test(S.World._Period || '');
    const partyOn = S.$ui.party && hr >= 18;
    const present = Object.keys(S.Scene.Present || {});
    if (!OFF.has('small_scenes') && !evs.length && !perNow && !partyOn && !(S.Trip && S.Trip.Active) && !(S.Battle && S.Battle.Active) && present.length > TU.scene_cap) {
      const talked = new Set((S.Interactions || []).map(a => NPC_ALIAS[String(a.With || '').toLowerCase()] || a.With));
      const dormHere = /dormitor|common room/.test(pkA);
      let pool = present.filter(id => !talked.has(id) && !(dormHere && num((S.Bonds[id] || {}).Rank, 0) >= 7));
      if (pool.length) {
        // 1.11.1: invented characters leave first, recorded as Extras or not yet, then unbonded roster people, then the lowest rank
        const rankOf = id => (S.Bonds[id] ? num(S.Bonds[id].Rank, 0) : NPC_IDS.has(NPC_ALIAS[String(id).toLowerCase()] || id) ? -1 : -2);
        pool = _.sortBy(pool, [rankOf, id => hash32(seed, dayNo, 'leave', id)]);
        S.$ui.leave = { id: pool[0], n: present.length, cap: TU.scene_cap };
      }
    }
  }
}

// ---- 6a. names revealed by the story prose (not by the update block); before 6 so a name spoken in this reply counts ----
function stepNamesInProse(c) {
  const { S, text } = c;
  if (text) {
    const prose = String(text).replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '').replace(/<[^>]+>/g, ' ');
    const names = S.$ui.names;
    // 1.11.1 (bug hunt): a first name that is also a word ("Maple leaves…", "Ruby light…") opening a sentence is no name reveal
    for (const [id, rx] of NAME_RX) if (!names.includes(id) && (ARRIVES[id] || 1) <= S.World.Year && mentionIn(prose, id, rx)) names.push(id);
  }
}

// ---- 6. bonds ----
function stepBonds(c) {
  const { S, B, log, jnl, hasB, OFF, staleDrop, evs, dayNo, goneNow, dayNoB, WXM, seed, TU, wxNow, V, weekNo, weekNoB, repLv, repAdd, repLevelUp } = c;
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
  const BB0 = (hasB && B.Bonds) || {};
  // 1.11.1 (bug hunt): a bond written straight into /Bonds passes the same gates as one started in Scene.Present: invented
  // characters (Extras) and rival academy teams never get a bond, and an incoming first-year has none before their year. Such a
  // record is removed (the "bonds cannot be removed" rule below is for real bonds).
  const noBondWhy = id => (!NPC_IDS.has(id) ? 'is not on the roster (invented characters get an Extras record, not a bond)'
    : NO_BOND.has(id) ? 'is on a rival academy team (no bond system)' : (ARRIVES[id] || 1) > S.World.Year ? `is not at Halvard until Year ${ARRIVES[id]}` : '');
  for (const id of Object.keys(S.Bonds)) {
    const why = noBondWhy(id);
    if (why) { delete S.Bonds[id]; log.push(`Bond record "${id}" was removed: ${id} ${why}.`); }
  }
  const BB = _.omitBy(BB0, (b, id) => !!noBondWhy(id));
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
      // 1.17.0 (audit T3): <current_state> no longer shows Mind, Knows and Imprints of absent people, so a rewrite keeps them too
      if (!(b.Knows || []).length && (b0.Knows || []).length) b.Knows = [...b0.Knows];
      if (!(b.Imprints || []).length && (b0.Imprints || []).length) b.Imprints = _.cloneDeep(b0.Imprints);
      if (!b.Mind && b0.Mind) b.Mind = b0.Mind;
      if (!b.Next && b0.Next) b.Next = _.cloneDeep(b0.Next);
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
  // 1.12.0: a genuine encounter or a Rank 5 handover reported one update late still counts for someone present at the end of the
  // previous update (they may have left in the reply that tells it)
  const wasHere = id => hasB && !!(((B.Scene || {}).Present || {})[id]);
  const npcAway = id => npcAwayIn(S, id);   // 1.16.1 (audit B4)
  const introductions = {};
  for (const a of S.Interactions || []) {
    if (a.Kind !== 'introduction') continue;
    const id = canon(a.With), by = canon(a.By), sponsor = S.Bonds[by];
    if (NPC_IDS.has(id) && !NO_BOND.has(id) && !BB[id] && S.Bonds[id] && !introductions[id]
        && (ARRIVES[id] || 1) <= S.World.Year && S.Scene.Present[id] && S.Scene.Present[by]
        && sponsor && sponsor.Rank >= 6 && sponsor.Trust >= trustGate(by, 6) && sponsor.Tension < 70
        && !npcAway(id) && !npcAway(by)) introductions[id] = by;
  }
  S.Interactions = [];
  S.$ui.rank_cues = [];
  // 1.3.0 reputation changes how fast NPCs warm up: extra XP per counted talk or hangout (REP.bond_mod), modifiers add up
  const modBy = (rows, L) => { const hit = rows.find(([at]) => (at > 0 ? L >= at : L <= at)); return hit ? hit[1] : 0; };
  const BM = REP.bond_mod || {};
  const repMod = id => (NPC_GROUP[id] === 'staff' ? modBy(BM.staff || [], repLv('Academy')) : 0) + (NPC_GROUP[id] === 'student' ? modBy(BM.student || [], repLv('Student')) : 0)
    + ((REP.anti_doves || []).includes(id) ? modBy(BM.anti_doves || [], repLv('Doves')) : 0) + ((REP.pro_doves || []).includes(id) ? modBy(BM.pro_doves || [], repLv('Doves')) : 0);
  // 1.15.0 (planning/DRAFT_grades_exams.md): +1 XP per counted talk or hangout with a teacher of a subject {{user}} got an A or B
  // in at the latest exams (once, however many of their subjects)
  const standing = !OFF.has('study') && S.$eng.study && _.isPlainObject(S.$eng.study.stand) ? S.$eng.study.stand : {};
  const PYb = _.clamp(num(S.Player.Profile.Year, 1), 1, 3);
  const examMod = id => (SUBJECTS.some(s => num(standing[s], -1) >= 3 && teaches(id, s, PYb)) ? 1 : 0);
  // 1.3.0 mask -> truth (Castor, Kanae, Caine): the 8 -> 9 event waits until one of the NPC's secrets has come out in play
  const secretOut = id => [...(S.$ui.secrets || []), ...(S.Campus_State.Secrets_revealed || [])].some(x => String(x).toLowerCase().startsWith(id.toLowerCase() + '.'));
  const held = (id, b) => MASK.has(id) && b.Rank === 8 && !secretOut(id);
  const tenseHold = (id, b) => { const P = tensionProfile(id); return !P.exempt && !P.lock && num(b.Tension, 0) >= num(TE.hold_event_from, 70); };   // 1.3.8
  // 1.4.3; 1.6.8 (owner): the Rank 8 event waits too when this character has no rival branch (C, D)
  const trustHold = (id, b) => (b.Rank + 1 !== 8 || !canRival(id)) && num(b.Trust, 50) < trustGate(id, b.Rank + 1);
  const spreadFrom = [];
  const KR = REW.krieg || {}, weeksNew = hasB ? Math.max(0, Math.min(8, weekNo - weekNoB)) : 0;
  const b0rank = which => (which === 'gift' ? 5 : 10);
  const give = (id, which) => {                                // a Rank 5 gift / Rank 10 benefit, once
    const x = ((REW.npcs || {})[id] || {})[which];
    if (!x || !_.isPlainObject(S._Perks)) return;
    if (goneNow(id)) { log.push(`${id} has graduated: Rank ${b0rank(which)} brings no ${which === 'gift' ? 'gift' : 'Rank 10 benefit'} now.`); return; }   // 1.7.6 (owner)
    if (S._Perks[x.name] || (S.$ui.perks_used || []).some(u => u.startsWith(x.name + ' ('))) return;
    S._Perks[x.name] = { From: id, Kind: which === 'gift' ? 'gift' : 'rank10', Effect: x.text + (x.secret ? ` <narrator_only>${x.secret}</narrator_only>` : ''), Uses: x.uses || 0 };
    S.$ui.toasts.push(which === 'gift' ? `Gift from {npc:${id}}: ${x.name}` : `Rank 10 with {npc:${id}}: new benefit`);
    jnl.push(which === 'gift' ? `${id} gave {{user}} ${x.name}.` : `Rank 10 with ${id}: ${x.text.split(/(?<=\.)\s/)[0]}`);
    if (x.jump) trainJump(c, x.jump, `${x.name} (${id})`);
    if (x.rep_up && repLevelUp(x.rep_up, false)) log.push(`${x.rep_up} reputation rose one level (${id}, Rank 10).`);
  };
  const rankedUp = (id, b) => {
    const R0 = repOfNpc(id), mx = (REP.bond_milestone_xp || {})[String(b.Rank)];
    if (R0 && mx && !(b.$ms || []).includes(b.Rank)) { repAdd(R0, mx, `bond with ${id} reached Rank ${b.Rank}`, 'bond'); b.$ms = [...(b.$ms || []), b.Rank]; }   // 1.3.8: once per rank
    if (b.Rank === 5 && !goneNow(id)) b.$gift_pending = true;
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
    b.Progress = 0;
    b._Event_ready = b0 ? !!b0._Event_ready : false;
    b.$cool = b0 ? num(b0.$cool, -1) : num(b.$cool, -1);
    b.$ms = b0 ? [...(b0.$ms || [])] : [...(b.$ms || [])]; b.$tf = b0 ? num(b0.$tf, 0) : num(b.$tf, 0);   // 1.3.8 engine-owned
    b.$tdrop = b0 ? num(b0.$tdrop, -99) : num(b.$tdrop, -99);   // 1.4.3
    b.$tlast = b0 ? num(b0.$tlast, 0) : 0; b.$tbrk = b0 ? num(b0.$tbrk, 0) : 0;   // 1.4.4
    b.$Recent = b0 ? [...(b0.$Recent || [])] : [...(b.$Recent || [])];   // 1.4.4 engine-owned
    b.$Defining = b0 ? [...(b0.$Defining || [])] : [...(b.$Defining || [])];   // 1.6.0 engine-owned
    b.$gifts = _.cloneDeep(b0 ? b0.$gifts || {} : b.$gifts || {});
    b.$gift_pending = b0 ? !!b0.$gift_pending : !!b.$gift_pending;
    b.$branch = b0 ? String(b0.$branch || '') : String(b.$branch || '');   // 1.6.8 engine-owned: friend | romance | rival from Rank 8
    if (!b.$branch && b0 && b0.Rank >= 8) b.$branch = b0.Romance ? 'romance' : /rival/i.test(String(b0.Title || '')) ? 'rival' : 'friend';   // saves from before 1.6.8
    b.$Knows_old = b0 ? [...(b0.$Knows_old || [])] : [...(b.$Knows_old || [])]; b.$seen = b0 ? num(b0.$seen, -1) : num(b.$seen, -1); b.$mw = b0 ? num(b0.$mw, -1) : num(b.$mw, -1);
    const acts = [...(byId[id] || [])], rank0 = b0 ? b0.Rank : b.Rank, tw0 = num(b.Tension, 0), trw0 = num(b.Trust, 50);
    let rankTrust = 0;
    // 1.4.3: a new bond starts at the character's own Trust (owner: start by category). 1.6.11 (owner playtest: Trixie met for the
    // first time showed Trust 10, Betrayed): a number the narrator writes on a first meeting is not a deed, so it gives way too
    if (!b0 && hasB) { const s0 = trustProfile(id, S, secretOut).start; if (num(b.Trust, 50) !== 50 && num(b.Trust, 50) !== s0) log.push(`${id} is new: Trust starts at ${s0} by their nature (${num(b.Trust, 50)} written; a first meeting is not a deed).`); b.Trust = s0; }
    if (!b0 && hasB && START[id]) {                            // Etnie adopts {{user}} on sight.
      const st = START[id];
      b.Rank = st.Rank; b.$cool = dayNo + coolDays(st.Rank, PACE); xp = 0;
      if (!b.Title && st.Title) b.Title = st.Title;
      if (st.Trust) b.Trust = st.Trust;
      b.Known_facts = [...new Set([...(b.Known_facts || []), ...(st.Known_facts || [])])];
      b.Milestones = [...new Set([...(b.Milestones || []), ...(st.Milestones || [])])];
      S.$ui.toasts.push(`Bond with {npc:${id}} starts at Rank ${st.Rank}`);
      for (const m of st.Milestones || []) jnl.push(m + '.');
    } else if (!b0 && hasB && introductions[id]) {
      b.Rank = 1; b.$cool = dayNo + coolDays(1, PACE); xp = 0;
      b.Milestones = [...new Set([...(b.Milestones || []), `Introduced by ${introductions[id]}`])];
      log.push(`${introductions[id]} introduced {{user}} to ${id}; their bond begins at Rank 1.`);
    } else if (!b0 && hasB && b.Rank > 0) b.Rank = 0;
    if (b0 && b.Rank > b0.Rank) {
      b.Rank = b0.Rank;
      log.push(`Rank change for ${id} reverted: the engine deepens bonds after a real interaction, never by a direct rank write.`);
    }
    const genuine = (S.Scene.Present[id] || wasHere(id)) && !npcAway(id) && V._Fatigue !== 'Collapsed'
      && acts.some(a => /^(talk|hangout|study|gift|help|fight|keep|secret|defend|confide|birthday)$/.test(a.Kind));
    const eligible = b0 && b.Rank === b0.Rank && b.Rank < 10
      && (num(b0.$xp, 0) >= needXP(b0.Rank, PACE) || b0._Event_ready)
      && dayNo >= num(b0.$cool, -1) && !held(id, b) && !tenseHold(id, b) && !trustHold(id, b);
    if (eligible && genuine) {
      b.Rank++; xp = 0; b._Event_ready = false; b.$cool = dayNo + coolDays(b.Rank, PACE);
      // 1.16.1 (audit T4): no generic "grew closer" Milestone: $Recent records the rank, Milestones are the story's own
      jnl.push(`Bond with ${id} deepened to Rank ${b.Rank}.`);
      if (_.isPlainObject(S.$eng.wk)) (S.$eng.wk.ranks = S.$eng.wk.ranks || []).push(`${id} reached Rank ${b.Rank}`);   // 1.10.0 recap
      rankedUp(id, b); rankTrust = num(TRU.rank_up, 0);
      S.$ui.rank_cues.push({ id, rank: b.Rank });
    } else if (b0 && b.Rank < b0.Rank) {
      b._Event_ready = false; log.push(`Bond with ${id} fell to Rank ${b.Rank}.`);
    }
    let need = needXP(b.Rank, PACE);
    const xpStart = xp;   // 1.4.4: for the recent history
    // XP: talk and hangout once a day each, gifts and help a few times a week; a loved gift counts more from Rank 3
    let gain = 0, partyGain = 0;
    const birthday = npcBirthday(id, S.World), mood = WXM === 'full' ? (S.$ui.moods[id] || {}).mood : 'Normal';
    const socialMod = (mood === 'Good' ? TU.mood_xp : mood === 'Bad' ? -TU.mood_xp : 0) - (V._Fatigue === 'Exhausted' ? 1 : 0);
    const recoveryMult = birthday ? BR.birthday.recovery_mult : 1;
    const d = daily[id] && daily[id].day === dayNo ? daily[id] : { day: dayNo }, w = bweek[id] && bweek[id].w === weekNo ? bweek[id] : { w: weekNo };
    // 1.3.0 Krieg (model B): Rank 1 from his introduction (the 0 -> 1 event is ready at once); then +weekly_xp every Monday while
    // Doves reputation >= min_doves (with hidden magic, also Dove attention <= max_attention), else Tension +1. Nothing from interactions.
    if (id === KR.id) {
      byId[id] = (byId[id] || []).filter(a => /^(gift|apology|birthday)$/.test(a.Kind));
      if (b.Rank === 0) xp = need;
      else if (b0 && b.Rank < 10) for (let k = 0; k < weeksNew; k++) {
        if (repLv('Doves') >= KR.min_doves && !(S.Hidden._True_magic && num(S.Hidden.Dove_attention, 0) > KR.max_attention)) gain += KR.weekly_xp;
        else { b.Tension = _.clamp(num(b.Tension, 0) + 1, 0, 100); log.push(`Krieg: no bond progress this week (Doves reputation ${repLv('Doves')}${S.Hidden._True_magic ? ', Dove attention ' + S.Hidden.Dove_attention : ''}); Tension +1.`); }
      }
    }
    for (const a of byId[id] || []) {
      const k = String((a && a.Kind) || '').trim().toLowerCase();
      if (V._Fatigue === 'Collapsed') { log.push('Collapsed: no interaction until {{user}} wakes.'); continue; }
      if (k === 'rank_gift') {
        if (b.$gift_pending && b.Rank >= 5 && (S.Scene.Present[id] || wasHere(id)) && !npcAway(id)) {
          give(id, 'gift'); b.$gift_pending = false;
        }
      } else if (k === 'birthday_party') {
        const party = S.$ui.party, h = Number(S.World.Time.split(':')[0]);
        const atParty = party && (party.where.startsWith('The Snug') ? /snug/i.test(S.World.Location) : S.World.Location.includes(S.Player.Profile.Dorm) && /common room/i.test(S.World.Location));
        if (party && party.guests.includes(id) && S.Scene.Present[id] && h >= 18 && h < party.endHour && atParty && !d.party) { d.party = 1; partyGain += BR.birthday.party_xp; }
      } else if (k === 'talk' || k === 'hangout' || k === 'study') {
        const socialKind = k === 'study' ? 'hangout' : k;
        if ((d[socialKind] || 0) >= BR.per_day[socialKind]) continue;
        d[socialKind] = (d[socialKind] || 0) + 1;
        const studyBonus = k === 'study' && b.Rank >= 4 && (RANK4_PARTNERS[id] || []).includes('study') && S.Scene.Present[id] && !npcAway(id);
        gain += Math.round(Math.max(0, BR.kind_xp[socialKind] + repMod(id) + examMod(id) + socialMod) * (birthday ? BR.birthday.social_mult : 1) * (studyBonus ? 1.25 : 1));
        if (socialKind === 'hangout' && a.Invited && b.Rank >= 2 && S.Scene.Present[id] && !npcAway(id) && !w.invited) { gain++; w.invited = 1; }
      } else if (k === 'gift') {
        const gk = giftTier(id, a.Item, a.Gift), firstBirthday = birthday && !d.birthdayGift;
        if (a.Item) { delete b.$gifts[a.Item]; b.$gifts[a.Item] = gk; capRecord(b.$gifts, BR.gift_log_cap); }
        const tension = gk === 'hated' ? BR.gift_hated_tension : gk === 'disliked' ? BR.gift_disliked_tension : 0;
        b.Tension = _.clamp(num(b.Tension, 0) + tension * (birthday ? BR.birthday.gift_mult : 1), 0, 100);
        log.push(`${id}: ${a.Item || 'gift'} — ${gk}${firstBirthday ? ' (birthday)' : ''}.`);
        if (firstBirthday) d.birthdayGift = 1;
        else if ((w.gift || 0) >= BR.per_week.gift) { log.push(`${id} already had ${BR.per_week.gift} gifts this week: no bond XP for another.`); continue; }
        else w.gift = (w.gift || 0) + 1;
        let x = gk in BR.gift_xp ? BR.gift_xp[gk] : BR.gift_xp.neutral;
        if (gk === 'loved' && b.Rank >= BR.gift_bonus_rank) x = Math.round(x * BR.gift_bonus_mult);
        if (id !== KR.id) gain += x * (firstBirthday ? BR.birthday.gift_mult : 1);
      } else if (k === 'help') {
        if ((w.help || 0) >= BR.per_week.help) continue;
        w.help = (w.help || 0) + 1; gain += BR.kind_xp.help;
      }
    }
    // 1.1.0 weather bonus, kept: +1 once a day for time together indoors in bad weather, outdoors in fine weather, a clear Star Night
    if (V._Fatigue !== 'Collapsed' && bondWx && !d.wx && (byId[id] || []).some(a => /^(talk|hangout|study)$/i.test(String((a && a.Kind) || '').trim()))) { d.wx = 1; gain += BR.weather_xp; }
    // ---- 1.4.3 Trust: drops as the narrator wrote them (x the category), rises only from reported deeds (x the category, capped a
    // week) and a rank earned; a quiet week recovers it towards the floor; then the overrides. tr0 (before this reply) decides what
    // Trust does to Tension and apologies below.
    if (V._Fatigue === 'Collapsed') byId[id] = [];
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
    if (birthday && !d.birthdayRemembered && (byId[id] || []).some(a => /^(gift|birthday)$/.test(a.Kind))) { d.birthdayRemembered = 1; if (RO.lock == null) { b.Trust = _.clamp(b.Trust + BR.birthday.remember_trust, 0, 100); log.push(`${id}: birthday remembered, Trust +${BR.birthday.remember_trust}.`); } }
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
        const m = (mood === 'Bad' ? TU.mood_tension : 1) * TP.riseMult * num(DH.tension_rise_mult, 1) * (band0 === 'Confidant' && small ? num(TRE.confidant_small_tension_mult, 0.5) : band0 === 'Betrayed' ? num(TRE.betrayed_tension_mult, 1.5) : 1);
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
      if (x < 0) x = Math.round(x * num((TRE.apology_mult || {})[band0], 1) * num(DH.apology_mult, 1) * recoveryMult * (mood === 'Good' ? TU.mood_apology : 1));   // 1.4.3: how much they believe it
      d.apology = 1; w.apo = num(w.apo, 0) + 1;
      if (x < 0 && t > 0) { const was = t; t = Math.max(0, t + x); log.push(`${id} accepted the apology${apo.Public ? ' (in public)' : ''}: Tension ${was} -> ${t}.`); }
      else if (x > 0) { const was = t; t = Math.min(100, t + x * (mood === 'Bad' ? TU.mood_tension : 1)); log.push(`The apology made it worse with ${id}: Tension ${was} -> ${t}.`); }
      else if (t > 0) log.push(`An apology changes nothing with ${id}.`);
    }
    if (TP.cat === 'confrontational' && (byId[id] || []).some(a => /^fight$/i.test(String((a && a.Kind) || '').trim())) && !d.fight && t > 0) {
      d.fight = 1; const was = t; t = Math.max(0, t - num(TE.fight_ease, 25) * recoveryMult); log.push(`A fight with ${id} cleared the air: Tension ${was} -> ${t}.`);
    }
    // 1.4.4 (owner): kindness eases Tension by the character's nature (kind_ease: help / keep / defend; Social only a public
    // defence), once a day
    if (!TP.lock && t > 0 && !d.kind) {
      const KE = TP.kind_ease || {};
      const hit = (byId[id] || []).map(a => { const k = String((a && a.Kind) || '').trim().toLowerCase(); return k === 'defend' && a.Public && KE.defend_public != null ? KE.defend_public : KE[k]; }).filter(x => x < 0);
      if (hit.length) { const x = Math.min(...hit) * recoveryMult, was = t; d.kind = 1; t = Math.max(0, t + x); log.push(`${id} took the kindness to heart: Tension ${was} -> ${t}.`); }
    }
    if (b0 && hasB && dayNo > dayNoB && t <= t0 && TP.decay > 0 && t > 0) {   // quiet days (no rise in this update)
      const f = num(b.$tf, 0) + TP.decay * num(DH.tension_decay_mult, 1) * TU.tension_fade * (Math.min(60, dayNo - dayNoB) + (birthday ? recoveryMult - 1 : 0)), whole = Math.floor(f);
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
    gain += tgain + trXP + partyGain;
    xp = b.Rank >= 10 ? 0 : Math.min(need, xp + gain);          // full XP waits for the next genuine interaction
    b.$xp = xp;
    const ready = b.Rank < 10 && xp >= need && dayNo >= num(b.$cool, -1) && !held(id, b) && !tenseHold(id, b) && !trustHold(id, b);
    b._Event_ready = ready; // legacy save field: readiness only, never a scripted event
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
      let pushed = false;   // 1.10.3: a defining moment is only ever this update's own row
      if (!b0) b.$Recent.push({ w: stamp(S.World), n: `First met, at ${S.World.Location}.`, fx: b.Rank > 0 ? `Bond starts at Rank ${b.Rank}` : '' });
      else if (acts.length || fx.length && (b.Rank !== rank0 || trw0 !== num(b0.Trust, 50) || tw0 !== num(b0.Tension, 0) || dx > 0)) {
        b.$Recent.push({ w: stamp(S.World), n: said || '(no note)', fx: fx.join(', ') }); pushed = true;
      }
      b.$Recent = b.$Recent.slice(-num((BR.recent || {}).keep, 10));
      // 1.6.0 (P4): defining moments. A big row (a rank changed, Trust moved 15+, Tension rose 20+, romance began) is also kept
      // for good; at most DEFINING_MAX, the smallest leaves first (ties: the older one)
      const big = (b0 && b.Rank !== rank0 ? 3 : 0) + (Math.abs(dT) >= 15 ? Math.abs(dT) / 5 : 0) + (dX >= 20 ? dX / 10 : 0) + (b.Romance && !(b0 && b0.Romance) ? 3 : 0);
      if (b0 && big > 0 && pushed) {
        const r = b.$Recent[b.$Recent.length - 1];
        b.$Defining = [...b.$Defining, { w: r.w, n: r.n, fx: r.fx, s: Math.round(big * 10) / 10 }];
        while (b.$Defining.length > DEFINING_MAX) { let lo = 0; b.$Defining.forEach((x, i) => { if (x.s < b.$Defining[lo].s) lo = i; }); b.$Defining.splice(lo, 1); }
      }
    }
  }
  Object.assign(c, { canon, BB, daily, PACE, bweek, npcAway, spreadFrom, KR });
}

// ---- 6c. 1.6.0 (Batch C, P4/N4): what each character carries of {{user}}. Knows: dated, the latest KNOWS_VISIBLE (older
// lines move to $Knows_old). Imprints: weight 5+, at most IMPRINT_MAX; over the cap the lightest goes, and the new one must
// outweigh it; a "fixed" character (data/npc_canon.json Change) is never rewritten, only deepened; a "shaped" or "fluid" one keeps
// what the belief replaced (Was). Next (Rank NEXT_RANK+): their own plan when they leave; brought back when they meet {{user}}
// again ("since you last saw them") or, once it lapses unseen, moved into $Recent. Meanwhile: Rank MEANWHILE_RANK+ bonds unseen
// for a week get one Journal line a week about their own life.
// 1.18.0 (I6): a newly confirmed keeper of the true magic also remembers learning it.
function stepBondMemory(c) {
  const { S, B, log, jnl, hasB, absA, dayNo, weekNo, canon, BB, daily, PACE, bweek, npcAway, spreadFrom } = c;
  if (hasB && S.Hidden._True_magic) {
    const known0 = new Set(((B.Hidden || {}).Known_by || []).map(canon));
    for (const raw of S.Hidden.Known_by || []) {
      const id = canon(raw), b = S.Bonds[id];
      if (id && !known0.has(id) && b) {
        b.Knows = Array.isArray(b.Knows) ? b.Knows : [];
        if (![...b.Knows, ...(b.$Knows_old || [])].some(x => /learned .*true magic/i.test(String(x))))
          b.Knows.push(`Learned {{user}}'s true magic.`);
      }
    }
  }
  {
    const presentIds = new Set(Object.keys(S.Scene.Present || {}));
    const wasHere = new Set(Object.keys((hasB && B.Scene && B.Scene.Present) || {}));
    const since = [], mayBe = [];
    for (const [id, b] of Object.entries(S.Bonds)) {
      const b0 = BB[id] || null;
      b.Knows = (Array.isArray(b.Knows) ? b.Knows : []).map(k => String(k).trim()).filter(Boolean);
      const old0 = new Set(b0 ? [...(b0.Knows || []), ...(b0.$Knows_old || [])] : []);
      b.Knows = [...new Set(b.Knows)].map(k => (old0.has(k) ? k : /^\[(Y\d+ )?M\d{1,2} W[1-4]/.test(k) ? (S.World.Year > 1 ? withYear(k, S.World.Year) : k) : `[${dstamp(S.World)}] ${k}`));
      if (b.Knows.length > KNOWS_VISIBLE) { b.$Knows_old = [...b.$Knows_old, ...b.Knows.slice(0, b.Knows.length - KNOWS_VISIBLE)].slice(-20); b.Knows = b.Knows.slice(-KNOWS_VISIBLE); }
      b.$Knows_old = (b.$Knows_old || []).slice(-20); // diet legacy saves on their first update too
      // Imprints
      const I0 = b0 ? (b0.Imprints || []) : [], key = x => String(x.Belief || '').trim().toLowerCase();
      let I = (Array.isArray(b.Imprints) ? b.Imprints : []).filter(x => x && String(x.Belief || '').trim());
      const fresh = I.filter(x => !I0.some(y => key(y) === key(x)));
      for (const x of fresh) {
        if (!x.When) x.When = dstamp(S.World); else if (S.World.Year > 1) x.When = withYear(x.When, S.World.Year);
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
  S.$ui.tsusp = tsuspOf(S, S.Bonds);
  for (const k of Object.keys(bweek)) if (bweek[k].w !== weekNo) delete bweek[k];
  S.$eng.bweek = bweek;
  // Passive readiness and visit access. The relationship changes inside ordinary scenes.
  S.$ui.close = Object.entries(S.Bonds).filter(([id, b]) => b.Rank < 10 && num(b.$xp, 0) >= Math.ceil(needXP(b.Rank, PACE) * num(BR.close_at, 0.8))).map(([id]) => id);
  const visiting = Object.entries(S.Bonds).filter(([id, b]) => b.Rank >= 7 && b.Trust >= 50 && b.Tension < 70 && !npcAway(id));
  const accessDay = !S.Trip.Active && !/LOCKDOWN|CURFEW/.test(String(S.World._Curfew || ''));
  S.$ui.rank_access = {
    dorms: accessDay ? [...new Set(visiting.filter(([id]) => NPC_GROUP[id] === 'student' && (S.Scene.Present || {})[id]).map(([id]) => NPC_DORMS[id]).filter(Boolean))] : [],
    staff: accessDay ? visiting.filter(([id]) => NPC_GROUP[id] === 'staff' || id === 'Bobby' || id === 'Milena').map(([id]) => id) : []
  };
  for (const b of Object.values(S.Bonds)) {
    if ((b.Known_facts || []).length > FACTS_VISIBLE) {
      const over = b.Known_facts.slice(0, b.Known_facts.length - FACTS_VISIBLE);
      b.$Known_old = [...(b.$Known_old || []), ...over].slice(-20); b.Known_facts = b.Known_facts.slice(-FACTS_VISIBLE);
    }
    b.$Known_old = (b.$Known_old || []).slice(-20);
  }
  for (const id of Object.keys(daily)) if (daily[id].day !== dayNo) delete daily[id];
  S.$eng.daily = daily;
}

// Training room left on a track this week and in all (section 6b); a reward jump (section 6) skips the weekly limit only.
function trainRoom(c, k, weekly) {
  const { S, weekNo, TU } = c;
  const T = S.Player.$Training[k]; if (!T) return 0;
  if (T.w !== weekNo) { T.w = weekNo; T.wg = 0; }
  const tot = TU.trn_total > 0 ? T.base * TU.trn_total / 100 - T.gain : Infinity;   // 1.3.1 Settings: 0 = no limit
  return Math.max(0, weekly && TU.trn_week > 0 ? Math.min(T.base * TU.trn_week / 100 - T.wg, tot) : tot);
}
function trainAdd(c, k, amt, weekly) {
  const S = c.S, T = S.Player.$Training[k], f = TRN.tracks[k].field, add = r2(Math.max(0, Math.min(amt, trainRoom(c, k, weekly))));
  if (add > 0) { S.Player.Vitals[f] = r2(S.Player.Vitals[f] + add); T.gain = r2(T.gain + add); if (weekly) T.wg = r2(T.wg + add); }
  return add;
}
function trainJump(c, k, why) {
  const S = c.S, T = S.Player.$Training[k]; if (!T) return;
  const add = trainAdd(c, k, T.base * REW.jump_pct / 100, false);
  c.log.push(add > 0 ? `${TRN.tracks[k].label} +${add} at once (${why}).` : `${TRN.tracks[k].label} is already at its training limit; ${why} adds nothing.`);
  if (add > 0) S.$ui.toasts.push(`${TRN.tracks[k].label} +${add}`);
}

// ---- 6b. 1.3.0 training: Mana pool (Mana_max) and Stamina (Stamina_max). The narrator reports sessions in /Training. One session
// adds TRN.session_pct % of the starting value x (1 + partner bonuses), at most TRN.weekly_pct % a week and TRN.total_pct % in all.
// Partners: an NPC whose Rank 5 gift is a training bonus for that track, in the scene. Jumps (rewards) skip the weekly limit only.
function stepTraining(c) {
  const { S, log, OFF, goneNow, TU, V, canon, npcAway } = c;
  {
    const here = new Set(Object.keys(S.Scene.Present || {}).map(canon));
    // 1.7.0: a Rank 10 benefit can carry the training bonus too (Linus: mana, Tsubaki: stamina); a suspended benefit (low Trust) does not count
    const partners = k => Object.entries(REW.npcs || {}).filter(([id, x]) => here.has(id) && !goneNow(id) && ['gift', 'r10'].some(g => x[g] && x[g].train === k && S._Perks[x[g].name] && S._Perks[x[g].name].Kind !== 'memento' && !(S.$ui.tsusp || []).includes(x[g].name))).map(([id]) => id);
    for (const x of (Array.isArray(S.Training) ? S.Training : [])) {
      const k = /mana/.test(x.Track) ? 'mana' : /stam/.test(x.Track) ? 'stamina' : '';
      if (!k || !S.Player.$Training[k]) { log.push(`Training track "${x.Track}" is unknown (use mana or stamina); nothing was added.`); continue; }
      const injury = Object.values(S.Player.Injuries).find(i => /serious|critical/.test(i.Severity) || k === 'stamina' && i.Severity === 'moderate');
      if (injury || /Exhausted|Collapsed/.test(V._Fatigue)) { log.push(`Training ${k}: ${injury ? 'Injured' : 'Too tired to train'}; no gain.`); continue; }
      if (!OFF.has('study') && _.isPlainObject(S.$eng.study)) S.$eng.study.train = num(S.$eng.study.train, 0) + 1;   // 1.15.0: toward the Combat mark
      const fatigueMult = V._Fatigue === 'Tired' ? TU.tired_training : 1;
      const T = S.Player.$Training[k], pr = partners(k), partner = canon(x.Partner), pb = S.Bonds[partner];
      const r4 = !!(pb && pb.Rank >= 4 && pb.Trust >= 35 && pb.Tension < 70 && here.has(partner) && !npcAway(partner)
        && (RANK4_PARTNERS[partner] || []).includes(k));
      const mult = 1 + pr.length * REW.train_bonus + (r4 ? 0.25 : 0), lab = TRN.tracks[k].label;
      const add = trainAdd(c, k, T.base * TU.trn_session / 100 * mult * fatigueMult, true), lim = TU.trn_total > 0 ? r2(T.base * TU.trn_total / 100) : 0;
      if (add > 0) log.push(`Training: ${lab} +${add}${fatigueMult < 1 ? ' (Tired: half gain)' : ''}${pr.length || r4 ? ` (with ${[...new Set([...pr, ...(r4 ? [partner] : [])])].join(' and ')}, x${mult})` : ''}; ${r2(T.gain)}${lim ? ` of ${lim}` : ''} trained so far.`);
      else log.push(lim && T.gain >= lim ? `Training: ${lab} has reached its limit (+${TU.trn_total}% of the starting value); training keeps {{user}} in shape but adds no more.` : `Training: ${lab} already gained all it can this week.`);
    }
    S.Training = [];
  }
}

// ---- 6c. 1.3.0 one-use perks spent this reply (/Perk_use). Kuroo's and Milena's Rank 10 favours lift a negative reputation one level.
function stepPerkUse(c) {
  const { S, log, jnl, goneNow, repw, repLv, repLevelUp, repSync } = c;
  for (const key of (Array.isArray(S.Perk_use) ? S.Perk_use : [])) {
    const k = Object.keys(S._Perks || {}).find(x => x === key) || Object.keys(S._Perks || {}).find(x => x.toLowerCase() === String(key).trim().toLowerCase());
    if (!k) { log.push(`Perk "${key}" is not held; nothing was spent.`); continue; }
    const p = S._Perks[k], fx = (((REW.npcs || {})[p.From]) || {})[p.Kind === 'gift' ? 'gift' : 'r10'] || {};
    if (p.Kind === 'memento' || goneNow(p.From)) { log.push(`"${k}" came from ${p.From}, who has graduated: it no longer works; nothing was spent.`); continue; }   // 1.7.6
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
}

// ---- 7. hidden magic ----
function stepHidden(c) {
  const { S, B, log, hasB, toolEdit, dayNo, wxNow, weekNo, weekNoB } = c;
  const Hd = S.Hidden;
  // 1.1.0 (Full): outdoors in fog, heavy rain, a storm or a blizzard the hidden magic is harder to notice: the rise is halved (rounded up)
  if (wxNow && hasB && Hd._True_magic && isOutdoor(S.World.Location) && (wxNow.sky === 'Fog' || wxHeavy(wxNow))) {
    const was = (B.Hidden && B.Hidden.Dove_attention) || 0, rise = Hd.Dove_attention - was;
    if (rise > 0) { Hd.Dove_attention = was + Math.ceil(rise / 2); log.push(`Dove attention rise halved by the weather (outdoors, ${wxText(wxNow)}): +${Math.ceil(rise / 2)} instead of +${rise}.`); }
  }
  // 1.18.0 (I1): the narrator reports witnessed/detected rises; the engine owns quiet-week decay.
  if (hasB) {
    const prior = num((B.Hidden || {}).Dove_attention, 0);
    if (Hd.Dove_attention < prior) { Hd.Dove_attention = prior; log.push('Dove attention falls only after a quiet week; the manual decrease was reverted.'); }
    const raised = Hd.Dove_attention > prior;
    const old = _.isPlainObject(S.$eng.doveweek) ? S.$eng.doveweek : { w: weekNoB, raised: true }; // old saves: do not assume the prior week was quiet
    if (weekNo > num(old.w, weekNoB)) {
      const quiet = Math.max(0, weekNo - num(old.w, weekNoB) - (old.raised ? 1 : 0));
      const drop = Math.min(Hd.Dove_attention, quiet);
      if (drop) { Hd.Dove_attention -= drop; log.push(`Dove attention −${drop} after ${quiet} quiet week${quiet === 1 ? '' : 's'}.`); }
      S.$eng.doveweek = { w: weekNo, raised };
    } else S.$eng.doveweek = { w: weekNo, raised: !!old.raised || raised };
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

  // 1.12.0 (H3): Points the narrator changed with no Transactions line get one ("not itemised"); a line written later for the same
  // amount replaces it. A new line with no change to Points or Coin changes nothing here: section 8l reminds the narrator.
  let lineNoPay = '';
  if (hasB && !toolEdit) {
    const WB = (B.Player || {}).Wallet || {}, WS = S.Player.Wallet, T0 = new Set(WB.Transactions || []);
    const amt = l => { const m = /^\s*([+−-])\s*([\d,]+)/.exec(String(l)); return m ? (m[1] === '+' ? 1 : -1) * Number(m[2].replace(/,/g, '')) : 0; };
    const pts = l => amt(l) && !/\bcoins?\b/i.test(l);
    const fresh = (WS.Transactions || []).filter(l => !T0.has(l) && pts(l));
    const dP = num(WS.Points, 0) - num(WB.Points, 0), dC = num(WS.Coin, 0) - num(WB.Coin, 0);
    if (dP && !fresh.length) WS.Transactions = [...(WS.Transactions || []), `${dP > 0 ? '+' : '-'}${Math.abs(dP)} (not itemised)`];
    else if (!dP && !dC) {
      for (const l of fresh) {
        const ph = WS.Transactions.findIndex(x => T0.has(x) && /\(not itemised\)$/.test(x) && amt(x) === amt(l));
        if (ph >= 0) WS.Transactions.splice(ph, 1); else if (!lineNoPay) lineNoPay = l;
      }
    }
  }
  // 1.11.1 (bug hunt): spending more than {{user}} has. The schema stops Points at 0, which made the missing part free; the
  // reply's new Transactions lines show what was spent, so the narrator is told to settle it in the story.
  if (hasB) {
    const P0 = num(((B.Player || {}).Wallet || {}).Points, 0), T0 = new Set((((B.Player || {}).Wallet || {}).Transactions) || []);
    const spent = (S.Player.Wallet.Transactions || []).filter(l => !T0.has(l)).reduce((a, l) => {
      const m = /^\s*([+−-])\s*([\d,]+)/.exec(String(l)); return m ? a + (m[1] === '+' ? -1 : 1) * Number(m[2].replace(/,/g, '')) : a; }, 0);
    if (num(S.Player.Wallet.Points, 0) === 0 && spent > P0) {
      S.$ui.toasts.push('Not enough points');
      log.push(`{{user}} had ${P0} points but this reply spent ${spent}: the ${spent - P0} missing were not paid (Points stay 0). Settle it in the story (put something back, owe it, pay in coin) and fix Transactions.`);
    }
  }
  Object.assign(c, { Hd, lineNoPay });
}

// ---- 8. monthly payout ----
function stepPayout(c) {
  const { S, B, log, hasB, goneNow, repLv } = c;
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
        if (_.isPlainObject(S.$eng.wk)) S.$eng.wk.pay = num(S.$eng.wk.pay, 0) + pay;   // 1.10.0: the routine payout is not news in the recap
        S.Player.Wallet.Transactions.push(`+${pay} monthly payout (dorm rank ${r || 'unranked'}${acad <= -5 ? ', halved: academic probation' : ''})`);
        log.push(`Monthly payout: +${pay} points (dorm rank ${r || 'unranked'}${acad <= -5 ? ', halved on academic probation' : ''}).`);
      }
      // 1.3.0: Academy +5 bonus, and points from bond rewards (data/bond_rewards.json monthly)
      const extra = [...(acad >= 5 && S.Player.Profile.Dorm !== 'Unsorted' ? [[REP.academy5_monthly, 'honoured student bonus (Academy reputation +5)']] : []),
        ...Object.values(S._Perks || {}).filter(p => p.Kind !== 'memento' && !goneNow(p.From)).map(p => (((REW.npcs || {})[p.From] || {})[p.Kind === 'gift' ? 'gift' : 'r10'] || {}).monthly).filter(Boolean).map(m => REW.monthly[m])];
      for (const [pts, why] of extra) {
        S.Player.Wallet.Points += pts; if (_.isPlainObject(S.$eng.wk)) S.$eng.wk.pay = num(S.$eng.wk.pay, 0) + pts; S.Player.Wallet.Transactions.push(`+${pts} ${why}`); log.push(`Monthly: +${pts} points, ${why}.`);
      }
    }
    S.Player.Wallet.Transactions = S.Player.Wallet.Transactions.slice(-20);
  }
}

// ---- 8b. Batch 5.1 records: commitments, notices, letters, clues, journal ----
// 1.18.0 (I4): relative Heals_by dates are anchored once, like Commitment.Due.
function stepRecords(c) {
  const { S, B, log, jnl, hasB, toolEdit, OFF, absA, canon } = c;
  {
    const prior = _.isPlainObject(S.$eng.heals) ? S.$eng.heals : {}, next = {};
    for (const [name, injury] of Object.entries(S.Player.Injuries || {})) {
      const by = String((injury || {}).Heals_by || '');
      next[name] = prior[name] && prior[name].text === by ? prior[name] : { text: by, abs: parseWhen(by, S.World, absA) };
    }
    S.$eng.heals = next;
  }
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
  // 1.18.0 (I8): an imminent appointment at this place can put its named partner in "May be here".
  if (!OFF.has('planner') && !S.Trip.Active) {
    const maybe = Array.isArray(S.$ui.maybe) ? S.$ui.maybe : [];
    const here = placeKey(S.World.Location);
    for (const [title, c] of Object.entries(S.Commitments || {})) {
      if (!c || !c.With || !c.Where || c.$abs < absA || c.$abs > absA + 60 || placeKey(c.Where) !== here) continue;
      for (const name of String(c.With).split(/,|\band\b/i).map(x => canon(x.trim())).filter(Boolean)) {
        if (npcAwayIn(S, name) || (S.Scene.Present || {})[name] || maybe.some(x => x[0] === name)) continue;
        maybe.push([name, `appointment: ${title}`]);
      }
    }
    S.$ui.maybe = maybe;
  }
  // 1.15.0 (planning/DRAFT_grades_exams.md): a commitment removed before it was overdue was done. An assignment done on time is
  // study time; one removed overdue counts as a skipped class of the subject it names. A remedial attended turns its F into a D.
  const STd = !OFF.has('study') && _.isPlainObject(S.$eng.study) ? S.$eng.study : null;
  if (STd && hasB && !toolEdit) for (const [k, c0] of Object.entries(BC)) {
    if (k in (S.Commitments || {}) || !c0) continue;
    const late = !!c0._Late;
    if (_.isPlainObject(STd.rem) && STd.rem[k]) {
      // an appointment is overdue once it starts: removed within three hours of its start, it was attended
      const sess = STd.rem[k], s = k.replace(/^Remedial /, ''), mk = (STd.marks || {})[sess], missed = num(c0.$abs, -1) >= 0 && absA > c0.$abs + 180;
      delete STd.rem[k];
      if (missed || !mk || mk[s] !== 0) { if (missed) log.push(`${k} was missed: the F stands.`); continue; }
      mk[s] = 1;
      if (num((STd.stand || {})[s], -1) === 0) STd.stand[s] = 1;
      const Ac = S.Player.Academics, lab = Object.keys(Ac.Exams || {}).find(x => x.replace(/ (Midterm|Finals)$/, '').replace(' ', '') === sess);
      if (lab) Ac.Exams[lab] = String(Ac.Exams[lab]).replace(`${s} F`, `${s} D (make-up)`);
      if (Ac.Grades && Ac.Grades[s] === 'F') Ac.Grades[s] = 'D';
      jnl.push(`${k} attended: the ${s} F counts as a D.`); S.$ui.toasts.push(`${s}: F -> D (make-up)`);
    } else if (/^assignment$/i.test(String(c0.Type || '').trim())) {
      if (!late) { STd.mins = num(STd.mins, 0) + ASSIGNMENT_MIN; log.push(`Assignment "${k}" done on time: +${ASSIGNMENT_MIN} minutes of study.`); }
      else { const s = subjectIn(`${k} ${c0.Desc || ''}`); if (s) { STd.skip = _.isPlainObject(STd.skip) ? STd.skip : {}; STd.skip[s] = num(STd.skip[s], 0) + 1; log.push(`Assignment "${k}" was overdue: it counts as a skipped ${s} class for the next marks.`); } }
    }
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
}

// ---- 8c. Batch 5.2: club, competition, projects, trip ----
function stepClubLife(c) {
  const { S, B, log, jnl, hasB } = c;
  const canonList = a => [...new Set((a || []).map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
  if (hasB) {
    const c0 = canonClub(B.Player.Profile.Club), c1 = S.Player.Profile.Club || '';
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
  Object.assign(c, { canonList });
}

// ---- 8e. v1.0.3 new school year: a new class of first-years (incoming cohorts from data/cohorts.json) ----
// 1.7.4: {{user}} moves up a year with everyone else (the story may hold them back), and last year's competition record is cleared
// (the Journal keeps it): Losing at any tier ends only that year's competitions.
function stepNewYear(c) {
  const { S, B, log, jnl, hasB } = c;
  if (hasB && S.World.Year > (B.World.Year || 1)) {
    const P = S.Player.Profile, y0 = num(B.Player.Profile.Year, 1), dy = S.World.Year - (B.World.Year || 1);
    if (num(P.Year, 1) !== y0) log.push(`A new academic year began (Year ${S.World.Year}); {{user}} is in Year ${P.Year}.`);
    else if (y0 < 3) {
      P.Year = Math.min(3, y0 + dy);
      jnl.push(`Began Year ${P.Year} at Halvard.`);
      log.push(`A new academic year began (Year ${S.World.Year}): {{user}} moved up to Year ${P.Year} (Player.Profile.Year). If the story holds {{user}} back a year, set it back.`);
    } else log.push(`A new academic year began (Year ${S.World.Year}). {{user}} was already a third-year: the card does not play {{user}}'s own graduation, so the story decides what happens now.`);
    const Co = S.Competition;
    if (Co && (Co.Tier || Co.Status || Co.Placement || (Co.Team || []).length || (Co.Results || []).length)) {
      Object.assign(Co, { Tier: '', Status: '', Placement: '', Team: [], Results: [] });
      log.push("A new competitive year: last year's Competition record was cleared (the Journal keeps it).");
    }
  }
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
}

// ---- 8d. v1.0.3 graduation: the morning after Graduation (M12 W1 Mon 07:00) that year's third-years leave campus ----
function stepGraduation(c) {
  const { S, log, jnl, hasB, absA } = c;
  {
    const done = S.$eng.grads || (S.$eng.grads = []), G = S.Campus_State.Graduated || (S.Campus_State.Graduated = []);
    for (let Y = 1; hasB && Y <= S.World.Year; Y++) {
      if (done.includes(`Y${Y}`) || absA < toAbs({ Year: Y, Month: 12, Week: 1, Day: 'Mon', Time: '07:00' })) continue;
      done.push(`Y${Y}`);
      const left = Object.keys(STUDENTS).filter(id => yearOf(id, Y) === 3 && !G.includes(id) && !STAYS[id]);
      G.push(...left);
      for (const id of Object.keys(STAYS)) if (yearOf(id, Y) === 3 && !G.includes(id)) log.push(`${STAYS[id]}. If the story had them graduate after all, add the name to Campus_State.Graduated.`);
      if (left.length) {
        jnl.push(`The third-years graduated and left Halvard: ${left.join(', ')}.`);
        S.$ui.toasts.push(`Graduates have left campus: ${left.map(id => `{npc:${id}}`).join(', ')}`);
        log.push(`Graduation departures: ${left.join(', ')} left campus (Campus_State.Graduated). If the story keeps one (repeating the year, staying as staff), remove that name.`);
      }
    }
    S.Campus_State.Graduated = [...new Set(G.map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
  }
}

// ---- 8d2. 1.7.6 (owner, 2026-09-27): a graduate's rewards stop working. Their Rank 5 gift stays as a keepsake (_Perks Kind
// memento, no effect; a gift with a "grad" text in data/bond_rewards.json keeps what is left in it, without refills), their Rank 10
// benefit ends; Student reputation raised by a Rank 10 stays. The originals wait in $ui.perks_grad: if the story keeps the person
// (their name leaves Campus_State.Graduated), the reward works again. Runs every update, so a chat already past Graduation converts too.
function stepGraduateRewards(c) {
  const { S, log } = c;
  {
    const GR = new Set(S.Campus_State.Graduated || []), PG = _.isPlainObject(S.$ui.perks_grad) ? S.$ui.perks_grad : (S.$ui.perks_grad = {});
    for (const [k, p] of Object.entries(S._Perks || {})) {
      if (!p || p.Kind === 'memento' || !GR.has(p.From)) continue;
      PG[k] = { ...p };
      if (p.Kind === 'gift') {
        const x = (((REW.npcs || {})[p.From]) || {}).gift || {};
        S._Perks[k] = { From: p.From, Kind: 'memento', Effect: x.grad || `A keepsake from ${p.From}, who has graduated; it no longer does what it did.`, Uses: 0 };
        log.push(`${p.From} has graduated: "${k}" is now a keepsake${x.grad ? ' (what is left in it can still be used, without refills)' : ' with no effect'}.`);
      } else {
        delete S._Perks[k];
        log.push(`${p.From} has graduated: their Rank 10 benefit "${k}" has ended.`);
      }
    }
    for (const [k, p] of Object.entries(PG)) {
      if (GR.has(p.From)) continue;
      S._Perks[k] = { ...p }; delete PG[k];
      log.push(`${p.From} is at Halvard again: "${k}" works again.`);
    }
  }
}

// ---- 8e. 1.7.7 (FP1): one optional NPC-initiated contact on some days. The result is latched per day so scene changes,
// swipes and replays do not reroll it. The narrator decides how (or whether) the approved Stage can play; no NPC is moved.
function stepInitiative(c) {
  const { S, OFF, evs, dayNo, seed, TU } = c;
  {
    const I = _.isPlainObject(S.$eng.initiative) ? S.$eng.initiative : (S.$eng.initiative = {});
    if (!_.isPlainObject(I.last)) I.last = {};
    const week = Math.floor(dayNo / 7), off = OFF.has('npc_initiative');
    const IR = { 1: [0.15, 1, 10], 2: [0.35, 2, 7], 3: [0.6, 4, 4] }[TU.init_rate] || [0.35, 2, 7];   // 1.9.9 Settings: daily chance, weekly cap, days per NPC
    if (I.week !== week) { I.week = week; I.count = 0; }
    if (I.day !== dayNo) {
      I.day = dayNo; I.id = ''; I.done = false;
      if (!off && !S.Trip.Active && !/LOCKDOWN/.test(S.World._Curfew || '') && I.count < IR[1]
          && rand01(seed, dayNo, 'npc-initiative-roll') < IR[0]) {
        const pool = Object.keys(S.Bonds).sort().filter(id => {
          const b = S.Bonds[id];
          return b.Rank >= 3 && INITIATIVE_STAGES[id] && (ARRIVES[id] || 1) <= S.World.Year
            && !npcAwayIn(S, id) && !S.Scene.Present[id]   // 1.16.1 (audit B4): only a status that keeps them away
            && dayNo - num(I.last[id], -1000) >= IR[2];
        });
        const weight = id => ({ open: 3, normal: 2, guarded: 1, closed: 0.5 })[INITIATIVE_OPENNESS[id] || 'normal'];
        let ticket = rand01(seed, dayNo, 'npc-initiative-pick') * pool.reduce((sum, id) => sum + weight(id), 0);
        for (const id of pool) if ((ticket -= weight(id)) < 0) { I.id = id; I.last[id] = dayNo; I.count++; break; }
      }
    }
    if (off || S.Trip.Active || /LOCKDOWN/.test(S.World._Curfew || '') || (I.id &&
        (!S.Bonds[I.id] || S.Bonds[I.id].Rank < 3 || S.Scene.Present[I.id] || npcAwayIn(S, I.id)))) I.done = true;
    const id = I.done ? '' : I.id;
    if (id && S.Bonds[id] && S.Bonds[id].Rank >= 3) {
      const rank = S.Bonds[id].Rank, band = rank <= 5 ? '3-5' : rank <= 8 ? '6-8' : '9-10';
      S.$ui.initiative = { id, stage: INITIATIVE_STAGES[id][band], strained: S.Bonds[id].Tension >= 70 };
      // FP11: a concrete reason for today, never the same template + filling within this NPC's last 20; latched for the day
      if (!_.isPlainObject(I.used)) I.used = {};
      if (I.askDay !== dayNo || I.askId !== id) {
        const cat = S.Bonds[id].Tension >= 70 ? 'strained' : ((INIT_ASKS.cat || {})[id] || 'social');
        const tpl = ((INIT_ASKS.asks || {})[cat]) || [];
        const gp = ((GIFT_PREFS.npcs || {})[id] || {}).items || {};
        const tomorrow = eventsOn(fromAbs((dayNo + 1) * DAY_MIN));
        const fills = {
          place: [...String(HAUNT[id] || '').split(/[;,]/).map(x => x.replace(/\(.*?\)/g, '').trim()).filter(Boolean),
            ...(cat === 'authority' ? [] : INIT_ASKS.places || [])].filter((x, i, a) => a.indexOf(x) === i),
          thing: [...(gp.loved || []), ...(gp.liked || [])],
          club: (INIT_ASKS.club || {})[id] ? [INIT_ASKS.club[id]] : [],
          event: [...evs, ...tomorrow].map(e => e.t.split(' (')[0]).filter((x, i, a) => a.indexOf(x) === i),
        };
        const combos = [];
        tpl.forEach((t, ti) => {
          const need = (t.match(/\{(place|thing|club|event)\}/g) || []).map(x => x.slice(1, -1));
          if (!need.length) { combos.push([ti, '', t]); return; }
          const k = need[0];
          for (const v of fills[k]) combos.push([ti, v, t.replace('{' + k + '}', v)]);
        });
        const used = I.used[id] || [], fresh = combos.filter(([ti, v]) => !used.includes(ti + '|' + v)), pool = fresh.length ? fresh : combos;
        const pick = pool.length ? pool[hash32(seed, dayNo, 'ask', id) % pool.length] : null;
        I.askDay = dayNo; I.askId = id; I.ask = pick ? pick[2] : '';
        if (pick) I.used[id] = [...used, pick[0] + '|' + pick[1]].slice(-20);
      }
      if (I.ask) S.$ui.initiative.ask = I.ask;
    } else S.$ui.initiative = null;
  }
}

// ---- 8f. 1.1.0 story hooks: narrator-side debts. Due anchored once like Commitments; state waiting | due | overdue | old ----
function stepHooks(c) {
  const { S, B, log, hasB, absA, canonList } = c;
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
}

// ---- 8g. 1.1.0 gossip: each rumour's fate and reach by age; fizzled (day 3) and old (day 21) ones leave Campus_State.Rumours ----
function stepGossip(c) {
  const { S, log, OFF, dayNo, seed, TU } = c;
  if (OFF.has('gossip')) S.$ui.gossip = [];
  else {
    const R = _.isPlainObject(S.$eng.rum) ? S.$eng.rum : (S.$eng.rum = {}), live = S.Campus_State.Rumours || [];
    for (const r of Object.keys(R)) if (!live.includes(r)) delete R[r];         // the story removed it: drop its metadata
    const keep = [], gone = [];
    for (const r of live) {
      if (!R[r]) { const d20 = hash32(seed, r, 'rum') % 20 + 1; R[r] = { born: dayNo, fate: d20 <= 3 ? 'fizzle' : d20 >= 18 ? 'fast' : 'normal' }; }
      const age = dayNo - R[r].born;
      if ((R[r].fate === 'fizzle' && age >= 3) || age >= TU.gossip_life) { gone.push(r); delete R[r]; } else keep.push(r);   // 1.9.9: lifetime from Settings > Campus life
    }
    if (gone.length) {
      S.Campus_State.Rumours = keep; S.$ui.rumours_old = [...S.$ui.rumours_old, ...gone].slice(-50);
      log.push(`Rumours that have died out (removed; do not bring them back unless something revives them): ${gone.map(r => `\"${r}\"`).join('; ')}.`);
    }
    S.$ui.gossip = keep.map(r => [r, REACH(R[r], dayNo - R[r].born), dayNo - R[r].born]);
  }
}

// ---- 8h. 1.1.0 inventory (the Bag): merge case duplicates, remove at Qty 0, Sunfizz bottles, cap 40 (never gear) ----
function stepBag(c) {
  const { S, B, log, jnl, hasB } = c;
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
    // 1.7.5: a student past Year 1 (a chat that starts in Year 2 or 3) was sorted in their first year: the Stone's reading (D9) once
    // the Builder has set the dominant type
    const dm0 = { Elemental: 'Fire', Mystic: 'Light', Spiritual: 'Viridian', Occult: 'Sky' }[((S.Magic || {})._Affinity || {}).Dominant];
    if (S.Player.Profile.Dorm === 'Unsorted' && num(S.Player.Profile.Year, 1) > 1 && dm0) {
      S.Player.Profile.Dorm = dm0;
      log.push(`{{user}} is a Year ${S.Player.Profile.Year} student, so the Arbiter Stone sorted them in their first year: ${dm0} Dormitory (Player.Profile.Dorm).`);
    }
    if (B.Player.Profile.Dorm === 'Unsorted' && S.Player.Profile.Dorm !== 'Unsorted') jnl.unshift(num(S.Player.Profile.Year, 1) > 1 ? `Of the ${S.Player.Profile.Dorm} Dormitory since the first-year sorting.` : `Sorted into the ${S.Player.Profile.Dorm} Dormitory by the Arbiter Stone.`);
    const sec0 = new Set([...((B.Campus_State && B.Campus_State.Secrets_revealed) || []), ...((B.$ui && B.$ui.secrets) || [])]);
    for (const x of S.Campus_State.Secrets_revealed || []) if (!sec0.has(x)) { const [who, ...topic] = String(x).split('.'); jnl.push(`Uncovered a hidden truth about ${who}${topic.length ? ` (${topic.join('.')})` : ''}.`); }
  }
  // v1.0.3 (F13): every revealed secret also goes to a permanent, hidden ledger; unlocks read it, so the AI list may stay short
  for (const x of S.Campus_State.Secrets_revealed || []) if (!S.$ui.secrets.includes(x)) S.$ui.secrets.push(x);
  const J0 = new Set((hasB && B.Journal) || []);
  S.Journal = (S.Journal || []).map(line => (J0.has(line) ? line : /^\[(Y\d+ )?M\d/.test(line) ? (S.World.Year > 1 ? withYear(line, S.World.Year) : line) : `[${dstamp(S.World)}] ${line}`));
  for (const line of jnl) S.Journal.push(`[${dstamp(S.World)}] ${line}`);
  S.Journal = [...new Set(S.Journal)].slice(-CAP.Journal);
  // F21 state-as-memory: the narrator reads the last CAP.Journal lines; older ones (and lines the AI removed) move to $ui.archive
  if (hasB) {
    const kept = new Set(S.Journal), arch = S.$ui.archive || (S.$ui.archive = []);
    const have = new Set(arch);
    for (const l of B.Journal || []) if (!kept.has(l) && !have.has(l)) { arch.push(l); have.add(l); }
    S.$ui.archive = arch.slice(-JOURNAL_ARCHIVE);
  }
}

// ---- 8j. 1.6.1 (Batch D, N4): campus events. Updated is stamped when an event's Text changes (a new event, or news about it);
// events with no news for STALE_DAYS are listed in <now> ($ui.stale), so the world moves them on or closes them. A bare string
// (the AI's shorthand, or a save from before 1.6.1) is the Text.
function stepCampusEvents(c) {
  const { S, B, hasB, dayNo } = c;
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
}

// ---- 8k. 1.6.1 (Batch D, N5): characters the narrator invented (Extras). A roster name is never an Extra. A key that differs
// only in case, or a first name that matches exactly one recorded full name, is the same person: it merges into the recorded
// key (in Scene.Present too). Every time one enters Scene.Present it is counted ($eng.xs); from the second appearance <cast>
// asks for their record until it exists. At most EXTRAS_MAX records: the least recently seen leave first (into a hidden
// archive, $ui.xold, which gives the record back if they turn up again), never one the player pinned (Keep) or one present.
function stepExtras(c) {
  const { S, B, log, hasB, absA, dayNo, canon } = c;
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
  Object.assign(c, { xHere, xNew });
}

// ---- 8i. 1.5.1 (Batch B, P1/P6): the cast. Who among the present gets their full canon sheet in the Cast Sheet (509; their
// keyword lore entry stays empty meanwhile): those who spoke in the last reply first, then the highest bond rank, at most
// CAST_FULL; the others get a brief sheet. From the reply's prose: who spoke without being in Scene.Present, who was mentioned.
function stepCast(c) {
  const { S, text, xHere, xNew } = c;
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
}

// ---- 8l. 1.12.0 (planning/DRAFT_missed_reports.md): what the last update may have left out of its report. Reminders for <now>
// only: nothing here changes a number. At most MISS_MAX lines, most important first, and the same hint is not repeated within two
// days ($eng.missed). A player-tool edit keeps the reminders it found.
function stepReminders(c) {
  const { S, B, text, userText, hasB, toolEdit, OFF, REPORTED, absA, elapsed, dayNo, V, M, startedNow, restedAs, canon, KR, Hd, lineNoPay } = c;
  if (hasB && !toolEdit) {
    const seen = _.pickBy(_.isPlainObject(S.$eng.missed) ? S.$eng.missed : {}, d => num(d, -99) >= dayNo - 2);
    const out = [], add = (sig, line) => { if (!(sig in seen) && !out.some(o => o[0] === sig)) out.push([sig, line]); };
    if (!OFF.has('reminders')) {
      // 1.18.0 (I3-I6): evidence-based prompts; none moves a number or invents detection/healing.
      const bag0 = B.Inventory || {}, bag1 = S.Inventory || {}, tx0 = new Set(((B.Player || {}).Wallet || {}).Transactions || []);
      const newTx = (S.Player.Wallet.Transactions || []).filter(x => !tx0.has(x)).join(' | ').toLowerCase();
      const shopAt = placeKey(S.World.Location);
      let expected = 0; const acquired = [];
      for (const [name, item] of Object.entries(bag1)) {
        const row = SHOP_PRICE[name.toLowerCase()], before = Object.keys(bag0).find(x => x.toLowerCase() === name.toLowerCase());
        const qty = Math.max(0, num(item && item.Qty, 0) - num(before && bag0[before] && bag0[before].Qty, 0));
        if (!row || !qty || !row.some(x => placeKey(x[1]) === shopAt)) continue;
        expected += qty * row.find(x => placeKey(x[1]) === shopAt)[0]; acquired.push(name);
      }
      if (expected) {
        const paid = Math.max(0, num(((B.Player || {}).Wallet || {}).Points, 0) - num(S.Player.Wallet.Points, 0));
        const named = acquired.every(x => newTx.includes(x.toLowerCase()));
        if (paid < expected || !named) add(`shop:${acquired.join('|')}:${dayNo}`, `${acquired.join(', ')} entered the Bag at a shop (listed total ${expected} points), but the Points decrease was ${paid}${named ? '' : ' and a matching Transaction is missing'}. If bought, report the full payment; if gifted or found, make that clear in the story.`);
      }
      for (const [name, injury] of Object.entries(S.Player.Injuries || {})) {
        const by = num(((S.$eng.heals || {})[name] || {}).abs, -1);
        if (by >= 0 && by <= absA) add(`heal:${name}:${dayNo}`, `${name}'s Heals_by time has arrived: show recovery or a Medical Centre visit if the story supports it; never heal off-screen.`);
      }
      const dorm = String(S.Player.Profile.Dorm || '').trim().toLowerCase(), where = placeKey(S.World.Location);
      if (/^CURFEW/.test(S.World._Curfew || '') && dorm && dorm !== 'unsorted' && !where.startsWith(dorm) && !(S.Trip || {}).Active)
        add(`curfew:${where}:${dayNo}`, `{{user}} is at ${placeOf(S.World.Location)} after dorm curfew. If someone catches them, report the appropriate reputation deed; being out alone is not proof of detection.`);
      const keepers = new Set((S.Hidden.Known_by || []).map(canon));
      for (const [id, bond] of Object.entries(S.Bonds || {})) {
        const prior = (((B.Bonds || {})[id] || {}).Knows || []);
        if (!keepers.has(id) && (bond.Knows || []).some(x => !prior.includes(x) && /(?:true|hidden|forbidden) magic/i.test(String(x))))
          add(`knows-magic:${id}:${dayNo}`, `${id}'s Knows now mentions {{user}}'s hidden magic. If ${id} truly learned the secret, add ${id} to Hidden.Known_by.`);
      }
      const prose = String(text || '').replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '').replace(/<[^>]+>/g, ' ');
      const narr = prose.replace(QUOTE_RX, ' '), said = String(userText || ''), low = (said + '\n' + prose).toLowerCase();
      const actsOf = id => REPORTED.acts.filter(a => canon(a.With) === id);
      const bonded = Object.keys(S.Scene.Present || {}).map(canon).filter(id => S.Bonds[id] && id !== KR.id);
      const Tq = M._Techniques || {}, hasWord = (hay, w) => (WORD_RX.get(w) || WORD_RX.set(w, new RegExp('(^|[^a-z])' + _.escapeRegExp(w.toLowerCase()) + '($|[^a-z])')).get(w)).test(hay);
      // R1: HP lost with no injury named (D13)
      const hp0 = num(B.Player.Vitals.HP, 0), inj0 = B.Player.Injuries || {};
      if (V.HP > 0 && V.HP < hp0 && !Object.keys(S.Player.Injuries || {}).some(k => !(k in inj0)))
        add(`hp:${absA}`, `HP fell by ${Math.round(hp0 - V.HP)} with no injury named: add it to Player.Injuries.`);
      // R12: hidden magic used in front of people who do not know, and Dove_attention did not move
      if (Hd._True_magic && num(Hd.Dove_attention, 0) <= num((B.Hidden || {}).Dove_attention, 0)) {
        const hid = [...new Set([...REPORTED.casts, ...startedNow])].filter(k => Tq[k] && (Tq[k].Hidden || /\[true\]/.test(Tq[k].Notes || '')));
        const know = new Set((Hd.Known_by || []).map(x => canon(String(x).trim())));
        const saw = Object.keys(S.Scene.Present || {}).filter(id => !know.has(canon(id)));
        if (hid.length && saw.length) add(`hidden:${hid[0]}:${dayNo}`, `${hid[0]} (hidden magic) was used with ${saw.slice(0, 3).join(', ')} present, but Dove_attention did not rise: raise it if it could have been noticed.`);
      }
      // R2: an item left the Bag with no use or gift reported
      const IB = B.Inventory || {}, IS = S.Inventory || {};
      for (const [k, it] of Object.entries(IB)) {
        const lk = k.toLowerCase(), now = Object.keys(IS).find(x => x.toLowerCase() === lk);
        if (/sunfizz/.test(lk) || num(it && it.Qty, 1) - (now ? num(IS[now].Qty, 1) : 0) <= 0 || REPORTED.used.includes(lk)) continue;
        if (REPORTED.acts.some(a => /^(gift|rank_gift|birthday)$/.test(a.Kind) && (!a.Item || String(a.Item).toLowerCase().includes(lk) || lk.includes(String(a.Item).toLowerCase())))) continue;
        const usable = !!(fxOf(k) || {}).use;
        if (bonded.length) add(`bag:${lk}:${dayNo}`, `${k} left the Bag while ${bonded.slice(0, 2).join(' and ')} ${bonded.length > 1 ? 'were' : 'was'} here: if {{user}} gave it, report Kind gift with Item "${k}"${usable ? '; if {{user}} used it, insert it into /Consumables/-' : ''}.`);
        else if (usable) add(`bag:${lk}:${dayNo}`, `${k} left the Bag: if {{user}} used it, insert it into /Consumables/- so its effect applies.`);
      }
      if (text || said) {
        // R8: a pending Rank 5 gift or a one-use perk named without its report
        for (const [id, b] of Object.entries(S.Bonds)) {
          const g = (((REW.npcs || {})[id] || {}).gift || {}).name;
          if (b && b.$gift_pending && g && hasWord(low, g) && !actsOf(id).some(a => a.Kind === 'rank_gift'))
            add(`rgift:${id}:${dayNo}`, `${g} was mentioned: if ${id} actually handed it to {{user}}, report Kind rank_gift with ${id}.`);
        }
        for (const [k, p] of Object.entries(S._Perks || {}))
          if (num(p && p.Uses, 0) >= 1 && (B._Perks || {})[k] && hasWord(low, k) && !REPORTED.perks.includes(k.toLowerCase()))
            add(`perk:${k}:${dayNo}`, `${k} was mentioned: if {{user}} spent it, insert "${k}" into /Perk_use/-.`);
        // R5: one of {{user}}'s techniques named, but not charged
        const activeT = new Set(Object.values(M.Active || {}).map(e => e && e.Technique)), usedT = new Set([...REPORTED.casts, ...startedNow]);
        for (const k of Object.keys(Tq)) {
          if (k.length < 5 || usedT.has(k) || activeT.has(k) || !hasWord(low, k)) continue;
          add(`cast:${k}:${absA}`, `${k} appears in the last exchange but was not charged: if {{user}} actually cast it, report it in /Magic/Casts (or Magic.Active if it lasts).`);
        }
      }
      // R11: a costly effect left running for hours (or through sleep)
      for (const [name, e] of Object.entries(M.Active || {})) {
        const t = Tq[e && e.Technique], h = t && e.$started >= 0 ? (absA - e.$started) / 60 : 0;
        if (!(num(t && t.Upkeep_per_min, 0) > 0) || !(h >= 2 || (restedAs === 'sleep' && h >= 1))) continue;
        add(`active:${name}:${dayNo}`, `${name} has been running for ${h >= 10 ? Math.round(h) : Math.round(h * 10) / 10} h${restedAs === 'sleep' ? ', through sleep,' : ''} and costs mana every minute: remove it from Magic.Active if {{user}} ended it.`);
      }
      if (text) {
        // R6: a bonded character spoke, with no interaction reported and no talk counted today
        for (const id of (S.$ui.cast || {}).spoke || []) {
          const dd = (S.$eng.daily || {})[id];
          if (!S.Bonds[id] || id === KR.id || actsOf(id).length || (dd && dd.day === dayNo && dd.talk)) continue;
          add(`talk:${id}:${dayNo}`, `${id} spoke, but no interaction was reported: if it was a real conversation with {{user}}, report Kind talk (or hangout); a passing greeting adds nothing.`);
        }
        // R7: the narration tells of a gift to someone present, with no gift reported
        if (!out.some(o => o[0].startsWith('bag:'))) {
          for (const sent of narr.split(/(?<=[.!?])\s+/)) {
            if (!/\b(gifts?|a present|birthday present|gift-wrapped)\b/i.test(sent) || !/\b(give|gives|gave|given|hand|hands|handed|offer|offers|offered|present|presents|presented|slide|slides|slid|press|presses|pressed)\b/i.test(sent)) continue;
            const to = bonded.find(id => NAME_FORMS[id] && mentionIn(sent, id, formRx(id)));
            if (to && !actsOf(to).some(a => /^(gift|rank_gift|birthday)$/.test(a.Kind))) { add(`gift:${to}:${dayNo}`, `A gift to ${to} may have happened: if {{user}} gave one, report Kind gift with the Item.`); break; }
          }
        }
      }
      // R9: {{user}} said sorry to someone they hurt, with no apology reported
      if (/\b(sorry|apologi[sz]e[sd]?|apologies|forgive me)\b/i.test(said)) {
        const hurt = bonded.filter(id => num(((B.Bonds || {})[id] || {}).Tension, 0) >= 10 && !actsOf(id).some(a => a.Kind === 'apology'));
        if (hurt.length) add(`sorry:${hurt[0]}:${dayNo}`, `{{user}} may have apologised to ${hurt.slice(0, 2).join(' or ')}: if so, report Kind apology (the engine decides how much it eases).`);
      }
      // R13: a Transactions line with no change to Points (H3)
      if (lineNoPay) add(`pts:${absA}`, `Transactions gained "${lineNoPay}" but Points did not change: apply it with a delta on /Player/Wallet/Points if it was actually spent or earned.`);
      if (text) {
        // R3: the narration skips time, the clock hardly moved
        const tm = MISS_TIME_RX.exec(narr);
        if (tm && elapsed < 30) add(`time:${absA}`, `The narration moves time on ("${tm[0]}") but the clock moved only ${Math.round(elapsed)} min: set World.Time (and Day) to match.`);
        // R4: the narration has {{user}} arrive at a map place that Location does not show
        let arr = '';
        for (const m of narr.matchAll(MISS_ARRIVE_RX)) arr = (m[1] || m[2] || m[3] || '').replace(/\s+(?:of|and|&)$/, '');
        const nm = arr && (plName(arr) || PLACE_ALIAS[plKey(arr)] || PLACE_ALIAS[plKey(arr).replace(/^the /, '')] || '');
        if (nm && !(S.Trip && S.Trip.Active) && placeKey(nm) !== placeKey(S.World.Location))
          add(`loc:${placeKey(nm)}:${absA}`, `The narration has {{user}} arriving at ${nm}, but Location is ${placeOf(S.World.Location) || 'unset'}: update it if {{user}} is there now.`);
        // R10: an hour or more at a training place, training words, no /Training
        if (elapsed >= 50 && !REPORTED.training && MISS_TRAIN_AT.includes(placeKey(S.World.Location)) && !/^P[123] /.test(S.World._Period || '')
          && MISS_TRAIN_RX.test(said + '\n' + narr) && V._Fatigue !== 'Collapsed')
          add(`train:${placeKey(S.World.Location)}:${dayNo}`, `{{user}} may have trained at ${placeOf(S.World.Location)}: if it was a real session of about an hour, report it in /Training/- (mana or stamina).`);
      }
    }
    S.$ui.missed = out.slice(0, MISS_MAX).map(o => o[1]);
    for (const [sig] of out.slice(0, MISS_MAX)) seen[sig] = dayNo;
    S.$eng.missed = seen;
  }
}

// ---- 8m. 1.16.0 (owner-approved planning/DRAFT_dynamic_ambience.md): ambience for the next reply. How crowded and how lit the
// place is and one sensory cue type (on a new place or time block); a seeded beat (texture nearby, or a small brush with {{user}});
// rarely, a secret uncanny moment from the place's ghost story. Types, not sentences: the narrator writes the detail each time.
// Seeded and computed once per update, so every swipe of the next reply sees the same result (like the Fortune roll).
function stepAmbience(c) {
  const { S, B, hasB, toolEdit, OFF, absB, absA, elapsed, evs, dayNo, dayNoB, WXM, seed, TU, wxNow, restedAs, weekNo } = c;
  S.$ui.amb = null;
  const AML = OFF.has('ambience') ? 'off' : S.$ui.ambience || 'full';
  if (AML !== 'off' && hasB && !toolEdit && AMB.cats) {
    const AE = _.isPlainObject(S.$eng.amb) ? S.$eng.amb : (S.$eng.amb = {});
    for (const k of ['cue', 'beat', 'unc']) if (!_.isPlainObject(AE[k])) AE[k] = {};
    const pk = placeKey(S.World.Location), pkB = placeKey(B.World.Location), t = absA % DAY_MIN;
    const inPlace = (key, n) => key === n || key.startsWith(n + ' ') || key.startsWith(n + ',');
    const catOf = key => {
      const sub = key.includes(',') ? key.slice(key.indexOf(',') + 1).trim() : '';
      const byName = test => Object.keys(AMB.cats).find(c => AMB.cats[c].places.some(test));
      return (sub && byName(n => sub.includes(n))) || byName(n => inPlace(key, n)) || '';
    };
    const cat = catOf(pk), C0 = AMB.cats[cat] || null;
    const blockAt = m => [360, 480, 600, 720, 780, 960, 1080, 1200].filter(x => m >= x).length;
    const blk = blockAt(t), blkB = blockAt(absB % DAY_MIN);
    const cur = String(S.World._Curfew || ''), afterCurfew = /CURFEW|LOCKDOWN/.test(cur);
    const out = isOutdoor(S.World.Location) || /courtyard/.test(pk);
    const noClass = evs.some(e => e.noclass || e.home || e.lockdown || e.away);
    const exam = [3, 5, 9, 11].includes(S.World.Month) && S.World.Week === 1 && MON_THU.includes(S.World.Day);
    const W0 = WXM !== 'off' && S.$ui.wx && !S.$ui.wx.away ? S.$ui.wx.now : null;
    const wtags = new Set();
    if (W0) {
      if (W0.snow) wtags.add('snow'); else if (W0.sky === 'Rain') wtags.add('rain');
      if (W0.sky === 'Storm') wtags.add('storm'); if (W0.sky === 'Fog') wtags.add('fog'); if (W0.sky === 'Clear') wtags.add('clear');
      if (W0.wind === 'windy' || W0.wind === 'gale') wtags.add('wind'); if (W0.temp >= 26) wtags.add('heat'); if (W0.temp <= 5) wtags.add('cold');
    }
    // crowd: the category's rhythm for this kind of day, then exams, events, weather (Full), breaks, the Thinning and curfew
    let crowd = -1;
    if (C0) {
      crowd = (noClass || S.World.Day === 'Sun' ? C0.free : S.World.Day === 'Sat' ? C0.sat || C0.free : C0.class)[blk];
      const plan = evs.map(e => `${e.t} ${schedOf(e, S.World.Day) || ''}`).join(' ').toLowerCase();
      if (exam && cat === 'study' && blk >= 1) crowd = 4;
      if (blk >= 2 && C0.places.some(n => plan.includes(n))) crowd = Math.max(crowd, 3);
      if (/feast/.test(plan) && pk.startsWith('ring dining hall') && t >= 1140 && t < 1320) crowd = 4;
      if (/arbiter hall/.test(plan) && pk.startsWith('arbiter hall') && t >= 540 && t < 660) crowd = 4;
      if (wxNow && wxBad(wxNow)) crowd = out ? Math.max(0, crowd - 2) : ['hub', 'dining', 'dorm_social', 'study', 'sport', 'clubs', 'mall'].includes(cat) ? Math.min(4, crowd + 1) : crowd;
      if (evs.some(e => e.home)) crowd = ['gate', 'staff', 'care'].includes(cat) ? Math.min(crowd, 1) : 0;
      if (afterCurfew && !['dorm_social', 'dorm_utility'].includes(cat)) crowd = 0;
    }
    // light: sunrise and sunset by the calendar (real-life months, interpolated by week), the sky, indoors or out
    const sx = S.World.Month - 1 + (S.World.Week - 0.5) / 4 - 0.5, s0 = Math.floor(sx), sf = sx - s0;
    const sa = AMB.sun[String(((s0 % 12) + 12) % 12 + 1)], sb = AMB.sun[String((((s0 + 1) % 12) + 12) % 12 + 1)];
    const rise = sa[0] + (sb[0] - sa[0]) * sf, set = sa[1] + (sb[1] - sa[1]) * sf;
    const phase = t < rise - 40 || t > set + 40 ? 'dark' : t < rise ? 'dawn' : t > set ? 'dusk' : 'day';
    const dim = !!W0 && (/Rain|Storm|Fog/.test(W0.sky) || !!W0.snow);
    const light = out ? (phase === 'dark' ? (wtags.has('clear') ? 'dark, starlit' : 'dark') : phase === 'day' ? (dim ? 'grey, overcast' : 'daylight') : phase)
      : phase === 'day' ? (dim ? 'grey daylight through the windows' : 'daylight through the windows') : afterCurfew || t < 420 ? 'lanterns at their night burn' : 'lamps lit';
    const season = SEASONS[S.World.Month - 1];
    const tbs = new Set([phase === 'dawn' ? 'dawn' : '', t >= 300 && t < 720 ? 'morning' : t >= 720 && t < 1020 ? 'day' : t >= 1020 && t < 1200 ? 'evening' : 'night'].filter(Boolean));
    const curfewOut = afterCurfew && !['dorm_social', 'dorm_utility'].includes(cat);
    const flu = !!(S.$ui.wx && S.$ui.wx.flu);
    const fits = (w, beat) => (w.out === undefined || w.out === out) && (!w.tb || w.tb.some(x => tbs.has(x))) && (!w.wx || w.wx.some(x => wtags.has(x)))
      && (!w.season || w.season.includes(season)) && (w.min === undefined || crowd >= w.min) && (w.max === undefined || crowd <= w.max)
      && (!w.exam || exam) && (!w.flu || flu) && (!beat || crowd > 0 || w.far) && (!beat || !curfewOut || w.curfew);
    // one cue type per new place or time block, not the same one at this place within three days
    const fresh = pk !== pkB || blk !== blkB || dayNo !== dayNoB || elapsed > 360;
    // the place's own types come first (7 or 6 times in 10), so the shared ones do not crowd them out
    const placeFirst = (all, tenths, tag) => { const own = all.filter(([x]) => x[0] === cat); return own.length && hash32(seed, tag + 'own', pk, absA) % 10 < tenths ? own : all; };
    let cue = '';
    if (C0 && fresh) {
      const hist = (AE.cue[pk] || []).filter(([, d]) => dayNo - d < 3);
      const all = AMB.cues.map((c, i) => [c, i]).filter(([c, i]) => (c[0] === '*' || c[0] === cat) && fits(c[3], false) && !hist.some(([j]) => j === i));
      const pool = placeFirst(all, 7, 'cue');
      if (pool.length) { const [c, i] = pool[hash32(seed, 'cue', pk, absA) % pool.length]; cue = c[2]; hist.push([i, dayNo]); }
      AE.cue[pk] = hist.slice(-12);
      for (const k of Object.keys(AE.cue).slice(0, -40)) delete AE.cue[k];
    }
    // the beat: on a new place, or 30 minutes after the last roll; never in a battle, asleep, in {{user}}'s class or on a tool edit
    const battle = !!(S.Battle && S.Battle.Active);
    const inClass = !noClass && /^P[123] /.test(S.World._Period || '') && ['teaching', 'craft', 'combat'].includes(cat);
    let beat = null, unc = null;
    if (AML === 'full' && C0 && !battle && restedAs !== 'sleep' && !inClass && (pk !== pkB || !(num(AE.last, -1) >= 0) || absA - num(AE.last, -1) >= 30)) {
      AE.last = absA;
      const d = d100(seed, 'amb', S.$eng.turn, absA), calm = { 1: 70, 2: 55, 3: 40 }[TU.amb_freq] || 55;
      let kind = d <= calm ? '' : d > 90 ? 'brush' : 'tex';
      if (kind === 'brush' && ((S.$ui.hap && S.$ui.hap.now) || noClass)) kind = '';   // a happening or an event day holds the attention
      // 1.24.0 (owner playtest): now and then the talk nearby is one of this place's stories {{user}} has not heard yet (once a day;
      // needs people around or company); the Campus Map then shows it
      const untold = kind ? (PLACE_LORE[pk] || []).filter(([u]) => !S.$ui.lore.includes(String(u))) : [];
      if (untold.length && (crowd > 0 || Object.keys(S.Scene.Present || {}).length) && num(AE.lore, -1) !== dayNo
        && d100(seed, 'lore', S.$eng.turn, absA) <= num(AMB.lore_chance, 35)) {
        const [u, , title, text] = untold[hash32(seed, 'lorepick', pk, absA) % untold.length];
        AE.lore = dayNo; hearLore(S, u, title, placeOf(S.World.Location)); beat = { kind: 'lore', text: `${title}. ${text.replace(/[.\s]+$/, '')}` }; kind = '';
      }
      if (kind) {
        const W1 = ((B.$ui || {}).wx || {}).now;
        const gos = S.$ui.gossip || [];
        const tomorrow = eventsOn(fromAbs((dayNo + 1) * DAY_MIN)).filter(e => !evs.some(x => x.t === e.t)), yesterday = eventsOn(fromAbs((dayNo - 1) * DAY_MIN)).filter(e => !evs.some(x => x.t === e.t));
        const special = sp => sp === 'overheard' ? (gos.length ? `overheard: the rumour "${gos[hash32(seed, 'ovh', absA) % gos.length][0]}", in someone else's words` : '')
          : sp === 'weather_turn' ? (W0 && W1 && (W0.sky !== W1.sky || W0.rare !== W1.rare) ? `the weather turning: ${S.$ui.wx.text || W0.sky.toLowerCase()}` : '')
          : sp === 'event_echo' ? (tomorrow.length ? `preparations for tomorrow's ${tomorrow[0].t.split(' (')[0]}` : yesterday.length ? `what is left of yesterday's ${yesterday[0].t.split(' (')[0]}` : '') : '';
        const bh = (AE.beat[cat] || []).filter(([, dd]) => dayNo - dd < 7);
        const pool = placeFirst(AMB.beats.map((b, i) => [b, i]).filter(([b, i]) => (b[0] === '*' || b[0] === cat) && b[1] === kind && fits(b[3], true) && !bh.some(([j]) => j === i) && (!b[3].special || special(b[3].special))), 6, 'beat');
        if (pool.length) {
          const [b, i] = pool[hash32(seed, 'beat', pk, absA) % pool.length];
          beat = { kind, text: b[3].special ? special(b[3].special) : b[2] }; bh.push([i, dayNo]);
        }
        AE.beat[cat] = bh.slice(-30);
      }
    }
    // the uncanny moment: a small seeded chance where and when one of the ghost stories can happen; at most one a week, the
    // same story not within 30 days; doubled in fog and during the Thinning (indoors), and for a story's own season or day
    const U = AE.unc;
    if (!_.isPlainObject(U.last)) U.last = {};
    if (AML === 'full' && !battle && num(U.w, -99) !== weekNo) {
      const thin = evs.some(e => e.lockdown), alone = !Object.keys(S.Scene.Present || {}).length, dark = phase === 'dark' || phase === 'dusk';
      const inWin = (f, to) => (f <= to ? t >= f && t < to : t >= f || t < to);
      const FARK = ['boathouse and lake', 'fishing house', 'willow island', 'grassy field and hills', 'old hut', 'forest', 'forest clearing', 'observation tower'];
      const isFar = k => FARK.some(n => inPlace(k, n)), path = pk !== pkB && (isFar(pk) || isFar(pkB));
      const cands = (AMB.uncanny || []).filter(u => (!u.places.length || u.places.some(n => inPlace(pk, n))) && (!u.out || out) && (!u.dark || dark)
        && (!u.dusk || phase === 'dusk' || phase === 'dark') && (u.from === undefined || inWin(u.from, u.to)) && (!u.curfew || /CURFEW/.test(cur))
        && (!u.alone || alone) && (!u.awake || restedAs !== 'sleep') && (!u.asleep || restedAs === 'sleep' || restedAs === 'rest') && (!u.path || path)
        && !(thin && out) && dayNo - num(U.last[u.id], -99) >= 30);
      if (cands.length) {
        const u = cands[hash32(seed, 'unc', absA) % cands.length];
        const own = (u.x2 === 'winter' && season === 'Winter') || (u.x2 === 'remembrance' && evs.some(e => /Remembrance/.test(e.t)));
        const ch = num(AMB.uncanny_chance, 5) * (wtags.has('fog') ? 2 : 1) * (thin ? 2 : 1) * (own ? 2 : 1);
        if (d100(seed, 'uncanny', S.$eng.turn, absA) <= ch) { U.w = weekNo; U.last[u.id] = dayNo; unc = { id: u.id, title: u.title, text: u.text }; }
      }
    }
    if (fresh || beat || unc) S.$ui.amb = { place: placeOf(S.World.Location), crowd: crowd >= 0 ? AMB_LEVELS[crowd] : '', light, cue, beat, unc };
  }
}

// ---- 9. UI bookkeeping ----
function stepUi(c) {
  const { S, B, offUnlock, evs, dayNo, M, Hd, text, toolEdit, OFF } = c;
  const place = placeOf(S.World.Location);
  // 1.16.1 (audit B6): only places on the Campus Map, so off-campus names never push a discovered place out of the list (cap 80)
  if (place && plName(place) && !S.$ui.discovered.includes(place)) S.$ui.discovered.push(place);
  // 1.24.0 (owner playtest): the castle's halls show on the map once {{user}} has been inside ("Castle" counts, and any castle room)
  if (!S.$ui.discovered.includes('Castle') && (CASTLE.has(normP(S.World.Location)) || /\bcastle\b/i.test(placeOf(S.World.Location)))) S.$ui.discovered.push('Castle');
  // 1.24.0: a story is heard when the narration names it (as a proper name, so "the long corridor" in passing does not count); with
  // Ambience below Full nobody is overheard, so a place's stories come with the first visit
  if (!toolEdit && text) for (const k of Object.keys(PLACE_LORE)) for (const [u, nm, title] of PLACE_LORE[k])
    if (!S.$ui.lore.includes(String(u)) && new RegExp(`(^|[^\\w'])(The )?${_.escapeRegExp(nm)}(?![\\w'])`).test(text)) hearLore(S, u, title, '');
  if ((OFF.has('ambience') || (S.$ui.ambience || 'full') !== 'full') && placeKey(S.World.Location) !== placeKey(((B || {}).World || {}).Location))
    for (const [u, , title] of PLACE_LORE[placeKey(S.World.Location)] || []) hearLore(S, u, title, placeOf(S.World.Location));
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
}

// ---- 10. commit ----
function stepCommit(c) {
  const { S, B, log, hasB, absA } = c;
  S.$eng.abs = absA;
  // 1.7.4: the first update in campaign Year 2 or later dates every line still written in Year 1's plain form ("[M3 W2 Tue]" ->
  // "[Y1 M3 W2 Tue]"); lines of this update already carry their own year (stamp, withYear), so a bare date here is from Year 1.
  if (hasB && (B.World.Year || 1) === 1 && S.World.Year > 1) {
    const y1 = x => (typeof x === 'string' ? withYear(x, 1) : x);
    S.Journal = (S.Journal || []).map(y1);
    if (Array.isArray(S.$ui.archive)) S.$ui.archive = S.$ui.archive.map(y1);
    for (const b of Object.values(S.Bonds || {})) {
      b.Last_seen = y1(b.Last_seen);
      for (const f of ['Knows', '$Knows_old']) if (Array.isArray(b[f])) b[f] = b[f].map(y1);
      for (const f of ['$Recent', '$Defining']) if (Array.isArray(b[f])) b[f] = b[f].map(r => (r && typeof r === 'object' ? { ...r, w: y1(r.w) } : r));
      if (Array.isArray(b.Imprints)) b.Imprints = b.Imprints.map(x => (x && typeof x === 'object' ? { ...x, When: y1(x.When) } : x));
    }
    for (const v of Object.values((S.Campus_State || {}).Events || {})) if (v && typeof v === 'object') v.Updated = y1(v.Updated);
  }
  if (log.length) S._Log = [...(S._Log || []), ...log.map(l => `[${stamp(S.World)}] ${l}`)].slice(-12);
}

const ENGINE_STEPS = [stepSetup, stepMigrate, stepGuards, stepFeatures, stepTime, stepWeather, stepMagic, stepRest, stepExposure, stepVitals, stepReputation, stepFortune, stepSchoolWeek, stepNamesInProse, stepBonds, stepBondMemory, stepTraining, stepPerkUse, stepHidden, stepPayout, stepRecords, stepClubLife, stepNewYear, stepGraduation, stepGraduateRewards, stepInitiative, stepHooks, stepGossip, stepBag, stepCampusEvents, stepExtras, stepCast, stepReminders, stepAmbience, stepUi, stepCommit];

// 1.17.0 (audit T1): the card's trim regex ("State-as-memory", minDepth 24) leaves every older message as "[…]", and each one was
// still sent. SillyTavern emits CHAT_COMPLETION_PROMPT_READY with { chat, dryRun } and sends that same array (public/scripts/openai.js,
// prepareOpenAIMessages; Tavern Helper passes the object through): each run of "[…]" messages becomes one.
const TRIMMED = /^\s*(?:[^\n:]{1,40}:\s*)?\[…\]\s*$/;
function collapseTrimmed(chat) {
  if (!Array.isArray(chat)) return 0;
  let removed = 0;
  for (let i = chat.length - 1; i > 0; i--) {
    const a = chat[i - 1], b = chat[i];
    if (a && b && typeof a.content === 'string' && typeof b.content === 'string' && TRIMMED.test(a.content) && TRIMMED.test(b.content)) {
      a.n = (a.n || 1) + (b.n || 1); chat.splice(i, 1); removed++;
    }
  }
  for (const m of chat) if (m && m.n > 1) { m.content = `[… ${m.n} earlier messages; <current_state> is the story's memory …]`; delete m.n; }
  return removed;
}
if (typeof eventOn === 'function' && typeof tavern_events === 'object' && tavern_events && tavern_events.CHAT_COMPLETION_PROMPT_READY) {
  eventOn(tavern_events.CHAT_COMPLETION_PROMPT_READY, data => { try { collapseTrimmed(data && data.chat); } catch (e) { console.error('[Eldrasil trim]', e); } });
}
if (typeof eventOn === 'function' && typeof waitGlobalInitialized === 'function') {
  (async () => {
    await waitGlobalInitialized('Mvu');
    let text = '';   // message being parsed in this update (COMMAND_PARSED fires before VARIABLE_UPDATE_ENDED)
    eventOn(Mvu.events.VARIABLE_UPDATE_STARTED, () => { text = ''; });
    eventOn(Mvu.events.COMMAND_PARSED, (_v, _c, content) => { text = content || ''; });
    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (variables, variables_before) => {
      let hint = '', said = '';
      try { const c = SillyTavern.chat || [], m = c[c.length - 1] || {}; hint = String(m.send_date || '') + '|' + (SillyTavern.getCurrentChatId ? SillyTavern.getCurrentChatId() : ''); } catch (e) { /* seed falls back to world time */ }
      // 1.12.0: the player's last visible message (not a hidden player-tool entry), for the reminders of section 8l
      try { const c = SillyTavern.chat || []; for (let i = c.length - 1; i >= 0; i--) { const x = c[i] || {}; if (x.is_user && !x.is_system && !/\(player tool\)/.test(String(x.mes || ''))) { said = String(x.mes || ''); break; } } } catch (e) { /* no reminders from the player's words */ }
      // 1.16.1 (audit B8): the engine edits the state in place. If it fails halfway, the state goes back to what it was before
      // this reply (a half-run engine must not be saved), and the player is told so: swipe, or report the error.
      const before = variables_before && variables_before.stat_data;
      const snap = _.cloneDeep(before && before.World ? before : variables.stat_data);
      try { runEngine(variables.stat_data, before, text, hint, said); text = ''; }
      catch (e) {
        console.error('[Eldrasil engine]', e);
        text = '';
        const S = variables.stat_data;
        for (const k of Object.keys(S)) delete S[k];
        Object.assign(S, snap);
        const msg = `Engine error (${String((e && e.message) || e).slice(0, 160)}): this update was not applied and the state was kept as it was before the reply. Swipe the reply, or report the error with the browser console.`;
        S._Log = [...(Array.isArray(S._Log) ? S._Log : []), msg].slice(-12);
        if (S.$ui && typeof S.$ui === 'object') S.$ui.toasts = ['Engine error: the update was not applied (see Log)'];
      }
    });
  })();
}
