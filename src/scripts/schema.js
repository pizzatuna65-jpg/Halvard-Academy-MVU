import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource@276040b5f26436f18662d841fb667429e82b26d4/dist/util/mvu_zod.js';
// zod and lodash are available globally as `z` and `_`
// Eldrasil / Halvard — MVU ZOD schema (Batch 2.1, extended in 3.2)
// Prefix rules: `_Name` = visible to the AI but read-only for it (engine/builder writes); `$name` = hidden from the AI.

// ---------- helpers ----------
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// A value that is not a number, or null where an object belongs, fails the schema; the MVU zod helper then drops only that
// command and keeps the previous value (StageDog tavern_resource util/mvu_zod.ts, checked in 1.3.3), which beats a default.
const Num = (lo, hi, d) =>
  z.coerce.number().transform(v => _.clamp(Number.isFinite(v) ? v : d, lo, hi)).prefault(d);
const Int = (lo, hi, d) =>
  z.coerce.number().transform(v => Math.round(_.clamp(Number.isFinite(v) ? v : d, lo, hi))).prefault(d);
// 1.3.3 (bug hunt): null is '' (it used to become the text "null"), an object is its JSON
const Str = (d = '') => z.preprocess(v => (v == null ? d : typeof v === 'object' ? JSON.stringify(v) : v), z.coerce.string()).prefault(d);
const O = shape => z.object(shape).prefault({});
// World.Time and Day are read loosely ("7:5", "9.30", "7pm", "monday"); anything unreadable becomes '' and the engine keeps the
// previous clock instead of jumping to a default (a typo used to become 08:00 or Monday, which moved the story a day or a week on)
const clockOf = v => {
  const s = String(v == null ? '' : v).trim().toLowerCase();
  let m = /^(\d{1,2})\s*[:.h]\s*(\d{1,2})\s*(am|pm)?$/.exec(s) || /^(\d{1,2})()\s*(am|pm)$/.exec(s);
  if (!m) return s === 'noon' ? '12:00' : s === 'midnight' ? '00:00' : '';
  let h = +m[1]; const mi = +(m[2] || 0);
  if (m[3]) { if (h < 1 || h > 12) return ''; h = h % 12 + (m[3] === 'pm' ? 12 : 0); }
  return h > 23 || mi > 59 ? '' : `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
};
const dayOf = v => { const k = String(v == null ? '' : v).trim().slice(0, 3).toLowerCase(); return DAYS.find(d => d.toLowerCase() === k) || ''; };
const Bool = d =>
  z.preprocess(v => (v === 'true' ? true : v === 'false' ? false : v), z.boolean()).prefault(d).catch(d);
const Enum = (vals, d = vals[0]) => z.enum(vals).prefault(d).catch(d);
// case-insensitive enum (the AI writes "dorm" / "Qualified")
const CIEnum = (vals, d = vals[0]) =>
  z.preprocess(v => vals.find(x => x.toLowerCase() === String(v == null ? '' : v).trim().toLowerCase()) ?? v, z.enum(vals)).prefault(d).catch(d);
const StrList = (max = 50) =>
  z.array(z.coerce.string()).transform(a => a.slice(-max)).prefault([]).catch([]);
const StrRec = () => z.record(z.string(), z.coerce.string()).prefault({}).catch({});
// record whose values may arrive as a bare string from the AI -> wrapped into { [key]: string }
const Rec = (build, wrapKey) =>
  z.record(z.string(), z.any().transform(v => build(typeof v === 'object' && v !== null ? v : { [wrapKey]: v })))
    .prefault({}).catch({});
const s = v => (v === undefined || v === null ? '' : String(v));
const n = (v, lo, hi, d) => { const x = Number(v); return _.clamp(Number.isFinite(x) ? x : d, lo, hi); };
const b = (v, d = false) => (v === true || v === 'true' ? true : v === false || v === 'false' ? false : d);

const PACT_TIERS = ['Lesser', 'Basic', 'Greater', 'Spirit Lord', 'Demon Lord', 'Grade IV', 'Grade III', 'Grade II', 'Grade I', 'Animal', 'Human'];

// ---------- schema ----------
export const Schema = z.object({
  World: O({
    Year: Int(1, 99, 1),
    Month: Int(1, 12, 1),
    Week: Int(1, 4, 1),
    Day: z.preprocess(v => (v === undefined ? 'Mon' : dayOf(v)), z.string()).catch(''),         // '' = unreadable: the engine keeps the previous day
    Time: z.preprocess(v => (v === undefined ? '08:00' : clockOf(v)), z.string()).catch(''),    // '' = unreadable: the engine keeps the previous time
    Location: Str('Reception and Gatehouse'),
    _Period: Str(''),
    _Curfew: Str(''),
    _Event_today: Str(''),
    _Happening: Str(''),   // 5.3 (F20): today's seeded campus happening, engine-written
    _Season: Str(''),      // 1.1.0: Winter | Spring | Summer | Autumn (engine; '' when Weather is Off)
    _Weather: Str(''),     // 1.1.0: "Afternoon, autumn: steady rain, windy, 9 °C (cool)" (engine; '' when Weather is Off)
  }),

  Scene: O({
    Present: Rec(v => ({ Note: s(v.Note) }), 'Note'),
  }),

  Player: O({
    Profile: O({
      Name: Str('{{user}}'),
      Pronouns: Str(''),
      Age: Int(0, 999, 18),
      Race: Str('Human'),
      Beast_type: Str(''),
      Appearance: Str(''),
      Personality: Str(''),   // 1.2.0 (Builder)
      Background: Str(''),
      Birthday: Str(''),      // 1.2.0: "M3 W2 Thu" in the academy calendar (Builder); the engine lists it in _Event_today
      Year: Int(1, 3, 1),
      Dorm: Enum(['Unsorted', 'Fire', 'Light', 'Sky', 'Viridian'], 'Unsorted'),
      Dorm_rank: Int(0, 9999, 0),
      Club: Str(''),
      Council: Bool(false), // membership is independent of the afternoon club
      Combat_role: Str(''),   // 1.2.0: set by the story at the first Combat class (the teacher assigns it), not by the Builder
      Goal: Str(''),
      // 1.3.0 (owner): three reputations, level -5..+5 computed by the engine from signed Rep XP ($xp, clamped at +-125).
      // The narrator reports what earned or cost reputation in /Rep_events. Public / Dorm are the pre-1.3.0 meters, read once for migration.
      Reputation: O({
        _Academy: Int(-5, 5, 0), _Student: Int(-5, 5, 0), _Doves: Int(-5, 5, 0),
        $xp: O({ Academy: Int(-125, 125, 0), Student: Int(-125, 125, 0), Doves: Int(-125, 125, 0) }),
        Public: z.any().optional(), Dorm: z.any().optional(),
      }),
    }),

    Vitals: O({
      HP: Num(0, 999, 100),
      HP_max: Num(1, 999, 100),
      Stamina: Num(0, 999, 100),
      Stamina_max: Num(1, 999, 100),
      Mana: Num(0, 9999, 100),
      Mana_max: Num(1, 9999, 100),
      Lethal_flag: Bool(false),
      Resting: Enum(['none', 'rest', 'sleep', 'awake'], 'none'),   // 1.12.0: awake = a deliberate all-nighter (a night skipped otherwise counts as sleep)
      _Condition: Str('Healthy'),
      _Fatigue: Str('Fresh'),
    }).transform(o => ({
      ...o,
      HP: Math.min(o.HP, o.HP_max),
      Stamina: Math.min(o.Stamina, o.Stamina_max),
      Mana: Math.min(o.Mana, o.Mana_max),
    })),

    Injuries: Rec(v => ({
      Severity: ['minor', 'moderate', 'serious', 'critical'].includes(s(v.Severity).toLowerCase()) ? s(v.Severity).toLowerCase() : 'minor',
      Body_part: s(v.Body_part), Effect: s(v.Effect), Heals_by: s(v.Heals_by),
    }), 'Effect'),

    Wallet: O({
      Points: Int(0, 1e9, 0),
      Coin: Int(0, 1e9, 0),   // real money (Banking House 1:1); the only money that works off campus (Plan 4.1, added 5.2)
      Transactions: StrList(20),
    }),

    Academics: O({
      Grades: StrRec(),
      Exams: StrRec(),
    }),
    _Proficiency: O({ Knowledge: Int(0, 5, 0), Arcana: Int(0, 5, 0), Craft: Int(0, 5, 0),
      Prowess: Int(0, 5, 0), Society: Int(0, 5, 0), Nature: Int(0, 5, 0) }),
    // 1.1.0: weather conditions (Soaked, Chilled, Overheated, Head cold). The engine adds and clears them; the story may remove one.
    Conditions: Rec(v => ({ Effect: s(v.Effect), Since: s(v.Since) }), 'Effect'),
    // 1.3.0 training (engine): per track the starting value (base), what training has added in total and this week
    $Training: z.record(z.string(), z.any().transform(v => ({ base: n(v && v.base, 0, 99999, 0), gain: n(v && v.gain, 0, 99999, 0),
      w: n(v && v.w, -1, 1e9, -1), wg: n(v && v.wg, 0, 99999, 0) }))).prefault({}).catch({}),
  }),

  Magic: O({
    // written by the Student Builder (Batch 3); read-only for the AI
    // Cost_mode: per_use = Activation per cast | sustained = Activation to start + upkeep per in-world minute
    // | hybrid = sustained + Trigger per triggered use while active (D11)
    _Techniques: Rec(v => ({
      Type: s(v.Type), Subtype: s(v.Subtype), Effect: s(v.Effect), Cannot_do: s(v.Cannot_do),
      Cost_mode: ['per_use', 'sustained', 'hybrid'].includes(v.Cost_mode) ? v.Cost_mode : 'per_use',
      Activation: n(v.Activation, 0, 9999, 0), Upkeep_per_min: n(v.Upkeep_per_min, 0, 999, 0),
      Trigger: n(v.Trigger, 0, 9999, 0),
      Hidden: b(v.Hidden), Forbidden: b(v.Forbidden), Notes: s(v.Notes),
    }), 'Effect'),
    // written by the Student Builder; the Arbiter Stone reads Dominant only (D9)
    _Affinity: O({
      Types: StrList(4),
      Dominant: Str(''),
      Specialties: StrList(8),
      Preset: Enum(['', 'Grounded', 'Gifted', 'Prodigy', 'Unbound'], ''),   // before 1.2.0 only; the Builder now writes ''
      // 1.2.0: the student's own subtypes { "<name>": { Type, Forbidden } } (the catalogue lists are suggestions)
      Custom: Rec(v => ({ Type: s(v.Type), Forbidden: b(v.Forbidden), wind: ['fed', 'scattered', 'unaffected', 'fights'].includes(v.wind) ? v.wind : 'fights' }), 'Type'),
    }),
    Active: Rec(v => ({ Technique: s(v.Technique), Note: s(v.Note), $started: n(v.$started, -1, 1e9, -1), $settled: n(v.$settled, -1, 1e9, -1) }), 'Technique'),
    Casts: z.array(z.any().transform(v => (typeof v === 'object' && v !== null
      ? { Technique: s(v.Technique), Times: n(v.Times, 1, 99, 1) } : { Technique: s(v), Times: 1 }))).prefault([]).catch([]),
    // 1.2.0: Kind = what the pact is with (only Spirit is lawful; the rest is the forbidden art of Pacting). Spirit = the partner's name.
    // Presence: summoned = with {{user}} only while summoned | terms = lives and acts as the pact's terms say
    Pacts: Rec(v => ({
      Spirit: s(v.Spirit), Kind: ['Spirit', 'Demon', 'Monster', 'Animal', 'Human'].includes(v.Kind) ? v.Kind : 'Spirit',
      Tier: PACT_TIERS.includes(v.Tier) ? v.Tier : 'Lesser', Presence: v.Presence === 'terms' ? 'terms' : 'summoned',
      Summoned: b(v.Summoned), Terms: s(v.Terms), Note: s(v.Note),
    }), 'Spirit'),
  }),

  Hidden: O({
    _True_magic: Str(''),
    Cover_magic: Str(''),
    Concealment: Str(''),
    Known_by: StrList(40),
    Dove_attention: Int(0, 100, 0),
    _Stage: Str('Unnoticed'),
  }),

  // 1.2.2: Progress is the pre-1.2.2 bond meter; the engine converts it once into $xp and keeps it 0 (a raised one counts as an interaction)
  Bonds: Rec(v => ({
    Rank: Math.round(n(v.Rank, 0, 10, 0)), Progress: n(v.Progress, 0, 10, 0),
    Trust: Math.round(n(v.Trust, 0, 100, 50)), Tension: Math.round(n(v.Tension, 0, 100, 0)),
    Title: s(v.Title), Romance: b(v.Romance),
    Known_facts: Array.isArray(v.Known_facts) ? v.Known_facts.map(s).slice(-30) : [],
    Milestones: Array.isArray(v.Milestones) ? v.Milestones.map(s).slice(-20) : [],
    Last_seen: s(v.Last_seen), _Event_ready: b(v._Event_ready),
    $xp: n(v.$xp, 0, 9999, 0), $cool: n(v.$cool, -1, 1e9, -1),   // 1.2.2: bond XP toward the next rank, first day the next event may start (engine)
    $Known_old: Array.isArray(v.$Known_old) ? v.$Known_old.map(s).slice(-100) : [],   // 5.4: older facts, hidden from the AI, shown in the dossier
    $Known_q: Math.round(n(v.$Known_q, 0, 100, 0)),   // 1.63.0 (memory audit M5): how many of the newest $Known_old lines wait for a fold (engine)
    $tf: n(v.$tf, 0, 100, 0),   // 1.3.8: Tension decay carried between days (engine)
    $ms: Array.isArray(v.$ms) ? v.$ms.map(Number).filter(Number.isFinite).slice(-11) : [],   // 1.3.8: ranks whose reputation milestone was already paid
    $tdrop: n(v.$tdrop, -99, 1e9, -99),   // 1.4.3: day of the last Trust drop (a quiet week recovers it; engine)
    $tlast: n(v.$tlast, 0, 100, 0),       // 1.4.4: size of that drop, for an 'understood' (engine)
    $tbrk: n(v.$tbrk, 0, 1, 0),           // 1.4.4: maximum Tension already broke a rank; re-armed below 70 (engine)
    $hut: s(v.$hut),                      // 1.31.0: month of the last Old Hut confidence (engine)
    $Recent: Array.isArray(v.$Recent) ? v.$Recent.filter(r => r && typeof r === 'object').map(r => ({ w: s(r.w), n: s(r.n), fx: s(r.fx) })).slice(-10) : [],   // 1.4.4: latest moments with {{user}} (engine)
    // 1.6.0 (Batch C, P4/N4): the character's side, written by the narrator (not shown in the player's dossier)
    Mind: s(v.Mind).slice(0, 400),                                                  // how they feel about {{user}} now, what is on their mind
    Knows: Array.isArray(v.Knows) ? v.Knows.map(s).filter(Boolean).slice(-30) : [],   // what they know about {{user}}, and how (engine dates and trims to 15)
    Imprints: Array.isArray(v.Imprints) ? v.Imprints.filter(x => x && typeof x === 'object').map(x => ({ Belief: s(x.Belief), Weight: n(x.Weight, 0, 10, 5), When: s(x.When), From: s(x.From), Was: s(x.Was), Feel: s(x.Feel) })).slice(-8) : [],   // 1.72.0: Feel warm | sore | bittersweet
    Next: v.Next && typeof v.Next === 'object' && !Array.isArray(v.Next) ? { What: s(v.Next.What), Where: s(v.Next.Where), Until: s(v.Next.Until) } : null,
    $Knows_old: Array.isArray(v.$Knows_old) ? v.$Knows_old.map(s).slice(-100) : [],   // older Knows lines (engine)
    $Knows_q: Math.round(n(v.$Knows_q, 0, 100, 0)),   // 1.63.0 (memory audit M5): how many of the newest $Knows_old lines wait for a fold (engine)
    $Defining: Array.isArray(v.$Defining) ? v.$Defining.filter(r => r && typeof r === 'object').map(r => ({ w: s(r.w), n: s(r.n), fx: s(r.fx), s: Number(r.s) || 0 })).slice(-5) : [],   // defining moments (engine)
    $seen: n(v.$seen, -1, 1e9, -1), $mw: n(v.$mw, -1, 1e9, -1),   // last day present; week of the last "Meanwhile" line (engine)
    $apart: n(v.$apart, 0, 1e5, 0), $apartd: n(v.$apartd, -1, 1e9, -1),   // 1.73.0: days apart before this scene, and its day (engine)
    $gifts: v.$gifts && typeof v.$gifts === 'object' && !Array.isArray(v.$gifts) ? Object.fromEntries(Object.entries(v.$gifts).slice(-24).map(([k,t]) => [k, ['loved','liked','neutral','disliked','hated'].includes(t) ? t : 'neutral'])) : {},
    $branch: ['friend', 'romance', 'rival'].includes(v.$branch) ? v.$branch : '',   // 1.6.8: the branch the bond took at Rank 8 (engine)
    $met: s(v.$met), $b8: s(v.$b8),   // 1.72.0: the day they met, the day of Rank 8 ("Y1 M1 W1 Mon"; engine)
    $gift_pending: b(v.$gift_pending),
  }), 'Title'),

  Campus_State: O({
    Entrance_tour: O({ Year: Int(0, 99, 0), Guide: Str(''), FirstYears: StrList(2) }),
    Council: O({
      Candidates: Rec(v => ({ First: s(v.First), Second: s(v.Second) }), 'First'),
      Results: Rec(v => ({ President: s(v.President), VicePresident: s(v.VicePresident) }), 'President'),
      Members: StrList(24),
      President: Str('Irene'), VicePresident: Str('Caspian'),
      PresidentElect: Str(''), VicePresidentElect: Str(''),
    }),
    // 1.6.1 (Batch D, N4): an event is { Text, Updated }; a bare string (the AI's shorthand, or a save from before 1.6.1) is its Text.
    // The engine stamps Updated when the Text changes ($d: that day number) and flags events with no news for over a week.
    Events: Rec(v => ({ Text: s(v.Text), Updated: s(v.Updated), $d: n(v.$d, -1, 1e9, -1) }), 'Text'),
    Rumours: StrList(15),
    Location_changes: StrRec(),   // before 1.60.0; the engine moves anything written here into Lore_changes
    // 1.60.0: lasting changes to the world's facts in this campaign, by subject (a lore entry's name, or something new). The engine
    // accepts one only when the story shows it (stepLoreChanges); Since and $uid (the subject's lore entry, -1 none) are the engine's.
    // 1.75.0: Until (the last day of a temporary change) and $abs (its end, parsed once by the engine; -1 lasting)
    Lore_changes: Rec(v => ({ Now: s(v.Now).slice(0, 400), Cause: s(v.Cause).slice(0, 240), Since: s(v.Since), Replace: b(v.Replace),
      Until: s(v.Until), $abs: n(v.$abs, -1, 1e9, -1), $uid: n(v.$uid, -1, 1e6, -1) }), 'Now'),
    NPC_status: StrRec(),
    New_relations: StrRec(),
    Secrets_revealed: StrList(80),
    Graduated: StrList(60),   // 1.0.3: students who have left campus after Graduation (engine adds the year's third-years)
    // 1.75.0 (owner-approved planning/DRAFT_club_sendiri.md): the club {{user}} founds, one a campaign. Members are students other
    // than {{user}}; Field is the proficiency its Saturday time trains; Status ('forming' / 'founded') and Since are the engine's
    Founded_club: O({ Name: Str(''), Field: Str(''), Venue: Str(''), Advisor: Str(''), Members: StrList(16), Status: Str(''), Since: Str('') }),
  }),

  // 1.6.1 (Batch D, N5): characters the narrator invented, recorded on their second appearance so they stay the same person.
  // Keep is the player's (the cast strip's pin); the engine keeps EXTRAS_MAX, the least recently seen leave first ($seen, engine).
  Extras: Rec(v => ({
    Who: s(v.Who).slice(0, 160), Looks: s(v.Looks).slice(0, 200), Manner: s(v.Manner).slice(0, 200),
    Calls_user: s(v.Calls_user).slice(0, 60), Voice: s(v.Voice).slice(0, 240), Keep: b(v.Keep), $seen: n(v.$seen, -1, 1e9, -1),
  }), 'Who'),

  // Batch 5.1: Where (optional place, enables "Go here"); _When / _Late / $abs are computed by the engine from Due
  // 1.49.0: Item = what a favour asks {{user}} to bring (Type "favour"; the engine takes it from the Bag when the favour is kept)
  Commitments: Rec(v => ({ Desc: s(v.Desc), Due: s(v.Due), With: s(v.With), Type: s(v.Type), Where: s(v.Where), Item: s(v.Item),
    _When: s(v._When), _Late: b(v._Late), $abs: n(v.$abs, -1, 1e9, -1) }), 'Desc'),

  // ---- Batch 5.1 conditional modules ----
  // Notice Board (castle Floor 1 entrance hall): story notices only; official calendar postings are drawn by the UI
  Notices: Rec(v => ({ Text: s(v.Text), By: s(v.By), Posted: s(v.Posted), Until: s(v.Until), $abs: n(v.$abs, -1, 1e9, -1) }), 'Text'),   // $abs: Until, parsed once (1.0.3)
  // Mail Tower letters. waiting = arrived, not yet collected | read | replied (incoming) | sent (outgoing)
  Letters: Rec(v => ({
    From: s(v.From), To: s(v.To), Gist: s(v.Gist), Date: s(v.Date),
    Status: ['waiting', 'read', 'replied', 'sent'].includes(s(v.Status).toLowerCase()) ? s(v.Status).toLowerCase() : 'waiting',
  }), 'Gist'),
  // ---- Batch 5.2 ----
  Competition: O({
    Tier: CIEnum(['', 'Dorm', 'Academy', 'Kingdom', 'World'], ''),
    Status: CIEnum(['', 'entered', 'qualified', 'eliminated', 'champion', 'selected'], ''),
    Placement: Str(''),
    Team: StrList(4),       // teammates (not {{user}})
    Results: StrList(12),
  }),
  Projects: Rec(v => ({
    Kind: s(v.Kind) || 'other', Goal: s(v.Goal), Progress: Math.round(n(v.Progress, 0, 100, 0)),
    Needs: s(v.Needs), Where: s(v.Where), Due: s(v.Due), With: s(v.With),
  }), 'Goal'),
  Trip: O({ Active: Bool(false), Destination: Str(''), Companions: StrList(6), Note: Str('') }),
  // 1.38.0: the Creature Studies Expedition; the narrator sets Caught when the group catches or kills its assigned target (the
  // engine reverts it until <now> has brought the target in, and clears it after the Expedition)
  Expedition: O({ Caught: Bool(false) }),
  // 1.39.0: Avalon; the narrator sets Ride when {{user}} takes a hire carriage for this move (the engine charges it and clears it)
  Avalon: O({ Ride: Bool(false) }),
  // 1.41.0: Sunreach Bay; Ride "carriage" or "boat" for this move, Bet {Game: dice|cards|wheel, Stake} at The Golden Tide (the engine
  // charges and settles them, then clears them)
  Sunreach: O({ Ride: Str(''), Bet: O({ Game: Str(''), Stake: Num(0, 100000, 0) }) }),
  // 1.63.0 (memory audit M5): the story so far, older than the Journal: folds of Journal lines (L1), of folds (L2), one per campaign
  // year (L3), written by the update model through the fold rule card and dated by the engine. 1.62.0 (M3): the pinned (!) lines that
  // left the Journal's window. Both read-only for the AI (engine-written)
  _Chronicle: StrList(60),
  _Kept_from_earlier: StrList(20),
  Journal: StrList(40),   // "[M1 W1 Mon] turning point" — long-term memory (used by state-as-memory in 5.3). 1.61.0: the engine keeps 30
                          // (CAP.Journal); the schema allows 40 so the engine sees a reply's new lines and chooses which old line leaves (M2)
  // 1.66.0 (M11d): the latest reply gists that left the chat the narrator still reads (engine-written, read-only for the AI)
  _Recent_story: StrList(12),
  Clues: Rec(v => ({
    Thread: s(v.Thread) || 'Unsorted clues', Detail: s(v.Detail), Where: s(v.Where), Found: s(v.Found),
    // 1.44.0: rumour / story = hearsay {{user}} pinned (player tool; unconfirmed); records = Encyclopaedic's real lead; '' = seen in play
    Source: ['rumour', 'story', 'records'].includes(s(v.Source).trim().toLowerCase()) ? s(v.Source).trim().toLowerCase() : '',
    Links: Array.isArray(v.Links) ? v.Links.map(s).filter(Boolean).slice(0, 8) : (v.Links ? String(v.Links).split(/\s*,\s*/).filter(Boolean).slice(0, 8) : []),
  }), 'Detail'),
  Mysteries: Rec(v => ({
    Status: ['open', 'solved', 'cold'].includes(s(v.Status).toLowerCase()) ? s(v.Status).toLowerCase() : 'open', Summary: s(v.Summary),
  }), 'Summary'),

  Battle: O({
    Active: Bool(false),
    Combatants: Rec(v => ({ HP: n(v.HP, 0, 999, 100), Stamina: n(v.Stamina, 0, 999, 100), Status: s(v.Status) }), 'Status'),
  }),

  // ---- 1.1.0 ----
  // Bag: key = the item name as bought. Qty 0 (or less) = gone: the engine removes it (the schema keeps 0 so a delta to 0 is not clamped back to 1).
  Inventory: Rec(v => ({
    Qty: Math.round(n(v.Qty, 0, 99, 1)),
    Kind: (['other', 'food', 'drink', 'gear', 'gift', 'book', 'reagent'].find(x => x === s(v.Kind).trim().toLowerCase())) || 'other',
    Note: s(v.Note), Plan: s(v.Plan),
  }), 'Note'),
  // Story hooks: narrator-side debts (a promise with a time, a planted detail, a threat, a secret about to surface). Hidden from the player's UI.
  Hooks: Rec(v => ({
    Note: s(v.Note), Who: s(v.Who),
    Kind: ['promise', 'detail', 'threat', 'secret'].includes(s(v.Kind).trim().toLowerCase()) ? s(v.Kind).trim().toLowerCase() : 'detail',
    Weight: Math.round(n(v.Weight, 1, 3, 1)), Due: s(v.Due), Planted: s(v.Planted), _State: s(v._State),
    $abs: n(v.$abs, -1, 1e9, -1), $born: n(v.$born, -1, 1e9, -1),
  }), 'Note'),

  // 1.2.2: interactions this reply, reported by the narrator; the engine turns them into bond XP and empties the list
  Interactions: z.array(z.any().transform(v => (typeof v === 'object' && v !== null
    ? { With: s(v.With), By: s(v.By), Kind: s(v.Kind).trim().toLowerCase(), Gift: s(v.Gift).trim().toLowerCase(), Item: s(v.Item).slice(0, 160), Rep: s(v.Rep), Why: s(v.Why), Public: b(v.Public), Invited: b(v.Invited), Note: s(v.Note).slice(0, 200), Weight: s(v.Weight).trim().toLowerCase().slice(0, 20), Meant: s(v.Meant).trim().toLowerCase().slice(0, 20) } : { With: s(v), By: '', Kind: 'talk', Gift: '', Public: false, Invited: false, Note: '', Weight: '', Meant: '' }))).prefault([]).catch([]),
  // 1.45.0 (audit 3.9): Track mana | stamina is a training session (no Action needed); /Training is still read as one
  Practice: z.array(z.any().transform(v => typeof v === 'object' && v !== null
    ? { Action: s(v.Action).slice(0, 100), Subject: s(v.Subject).slice(0, 80), With: s(v.With || v.Partner).slice(0, 80), Aim: s(v.Aim).slice(0, 120), Track: s(v.Track).trim().toLowerCase().slice(0, 20) }
    : { Action: s(v).slice(0, 100), Subject: '', With: '', Aim: '', Track: '' })).prefault([]).catch([]),
  // 1.45.0 (audit 3.4): what {{user}} buys this reply (narrator); the engine checks price, place, season and money, pays through the
  // ledger, fills the Bag (or applies an item Used at once) and empties the list. Price: only for an item not on the Price Guide.
  Purchases: z.array(z.any().transform(v => typeof v === 'object' && v !== null
    ? { Item: s(v.Item).slice(0, 100), Qty: Math.round(n(v.Qty, 1, 99, 1)), Shop: s(v.Shop).slice(0, 100), Price: n(v.Price, -1, 100000, -1), Used: b(v.Used), Kind: s(v.Kind).trim().toLowerCase().slice(0, 20) }
    : { Item: s(v).slice(0, 100), Qty: 1, Shop: '', Price: -1, Used: false, Kind: '' })).prefault([]).catch([]),
  Craft_sales: z.array(z.any().transform(v => typeof v === 'object' && v !== null
    ? { Item: s(v.Item).slice(0, 100), Qty: Math.round(n(v.Qty, 1, 99, 1)) }
    : { Item: s(v).slice(0, 100), Qty: 1 })).prefault([]).catch([]),

  // 1.3.0: what earned or cost reputation this reply (narrator), training sessions (narrator), one-use perks spent (narrator);
  // the engine applies them and empties the lists
  Rep_events: z.array(z.any().transform(v => (typeof v === 'object' && v !== null
    ? { Rep: s(v.Rep).trim(), XP: n(v.XP, -125, 125, 0), Kind: s(v.Kind).trim().toLowerCase(), Why: s(v.Why) } : { Rep: '', XP: 0, Kind: '', Why: s(v) }))).prefault([]).catch([]),
  Training: z.array(z.any().transform(v => ({ Track: s(typeof v === 'object' && v !== null ? v.Track : v).trim().toLowerCase(), Partner: s(typeof v === 'object' && v !== null ? v.Partner : '') }))).prefault([]).catch([]),
  Perk_use: StrList(10),
  // 1.15.0 (planning/DRAFT_grades_exams.md): a story moment that moves one exam mark a step (or fails it), and paid tutoring
  // sessions in a subject {{user}} has an A in (narrator); the engine applies them and empties the lists
  Exam_events: z.array(z.any().transform(v => (typeof v === 'object' && v !== null
    ? { Subject: s(v.Subject).trim(), Shift: Math.round(n(v.Shift, -1, 1, 0)), Fail: b(v.Fail), Why: s(v.Why).slice(0, 160) } : { Subject: s(v).trim(), Shift: 0, Fail: false, Why: '' }))).prefault([]).catch([]),
  Tutoring: z.array(z.any().transform(v => (typeof v === 'object' && v !== null
    ? { Subject: s(v.Subject).trim(), Student: s(v.Student).slice(0, 80) } : { Subject: s(v).trim(), Student: '' }))).prefault([]).catch([]),
  Consumables: StrList(10), // Report consumed items (The Vigil); buying or gifting does not consume them.
  // 1.9.4 (playtest Batch 4): a direct soaking or freezing this reply (a water or ice hit, a dunking), reported by the narrator;
  // the engine turns it into Player.Conditions at once (weather effects Full only) and empties the list
  Exposure: z.array(z.any().transform(v => (typeof v === 'object' && v !== null
    ? { Kind: s(v.Kind).trim().toLowerCase(), Cause: s(v.Cause).slice(0, 120) } : { Kind: s(v).trim().toLowerCase(), Cause: '' }))).prefault([]).catch([]),
  // 1.3.0 bond rewards held (engine-written, read-only for the AI): { "<name>": { From, Kind: gift|rank10, Effect, Uses } }; Uses 0 = not limited
  _Perks: Rec(v => ({ From: s(v.From), Kind: s(v.Kind) === 'rank10' ? 'rank10' : s(v.Kind) === 'memento' ? 'memento' : 'gift',   // 1.7.6: memento = a graduate's gift, no effect
    Effect: s(v.Effect), Uses: Math.round(n(v.Uses, 0, 99, 0)) }), 'Effect'),

  _Log: StrList(12),
  Fold: z.coerce.string().prefault('').catch(''),
  Gist: z.coerce.string().prefault('').catch(''),   // 1.66.0 (memory audit M11d): one line on what happened this reply (the engine keeps it and empties it)   // 1.63.0 (memory audit M5): the fold the rule card asked for, this reply only (the engine stores it and empties it)

  $ui: O({
    unlocks: StrList(60),
    discovered: StrList(80),
    lore: StrList(200),  // 1.24.0 (1.42.0: 200): lore entries (uids) of places {{user}} has heard of; the Campus Map shows only these (engine 8m, 9)
    toasts: StrList(10),
    built: Bool(false),
    names: StrList(200),  // (1.42.0: 200, the roster outgrows 80) NPC ids whose name has appeared in the story prose (name reveal = story evidence, D14)
    happenings: Enum(['off', 'rare', 'normal', 'often'], 'normal'),   // 5.3: player setting (Student file > Settings)
    hap: z.any().prefault(null).catch(null),                          // 5.3: today's happening, structured for the UI
    rest: z.any().prefault(null).catch(null),                         // 1.31.0: the restful place here and its multiplier now (engine)
    archive: StrList(300),                                            // 5.3: journal lines the narrator no longer reads
    jnotes: StrList(300),                                             // 1.57.0 (U3): the engine's Journal notes (UI only)
    secrets: StrList(500),                                            // 1.0.3: permanent ledger of Secrets_revealed (unlocks read it)
    // 1.1.0
    wxfx: Enum(['off', 'flavor', 'full'], 'full'),                    // Weather effects setting (Features panel)
    ambience: Enum(['off', 'texture', 'full'], 'full'),               // 1.16.0: Ambience setting (Features panel)
    amb: z.any().prefault(null).catch(null),                          // 1.16.0: ambience for the next reply { place, crowd, light, cue, beat, unc } (engine; <now>)
    moods: z.record(z.string(), z.any()).prefault({}).catch({}),
    sleep: z.any().prefault(null).catch(null),
    party: z.any().prefault(null).catch(null),
    training: Str(''),
    wx: z.any().prefault(null).catch(null),                           // weather for the UI and the Now entry (engine)
    rumours_old: StrList(50),                                         // rumours that died out (UI only)
    gossip: z.any().prefault([]).catch([]),                           // live rumours with reach [[text, reach, day]] (engine)
    off: StrList(20),                                                 // feature ids turned off in Features settings
    on: z.record(z.string(), z.boolean()).prefault({}).catch({}),  // 1.18.0: engine-computed feature gates for EJS and UI
    parked: z.record(z.string(), z.any()).prefault({}).catch({}),     // state of features that are off: { id: { path: value } }
    // 1.2.0
    file: z.any().prefault(null).catch(null),                         // the Builder's record of what it last wrote (self-heal, engine §0)
    marks: z.record(z.string(), z.coerce.string()).prefault({}).catch({}),
    // 1.50.0: the routine week. plan (player tool): { study: hours, acts: [{ a: 'loc|action', s: subject, n }], club, run: 1 to arm };
    // routine (engine): the armed span { to, at, stop, days, moments, line } or a refusal { why }
    plan: z.any().prefault(null).catch(null),
    relold: z.any().prefault(null).catch(null),   // 1.51.0: New_relations keys not renewed: 1 faded (4 weeks), 2 hidden (8) in Connections
    routine: z.any().prefault(null).catch(null),   // calendar notes the player wrote { "M1 W2 Wed": "text" }
    // 1.2.2 bonds (Settings) and the engine's view of full bond bars (event ready now / after the cooldown)
    bondpace: Enum(['standard', 'fast', 'brisk', 'slow'], 'standard'),
    romrank: Int(0, 11, 8),                                            // romance opens at this rank (0 any, 11 off)
    bev: z.any().prefault({}).catch({}), // legacy save only
    rank_cues: z.any().prefault([]).catch([]),
    rank_access: z.any().prefault({}).catch({}),
    close: z.array(z.string()).prefault([]).catch([]),           // 1.5.0 (N3a): bonds close to their next rank (engine)
    initiative: z.any().prefault(null).catch(null),              // 1.7.7 (FP1): today's optional NPC contact, engine-written for <now>
    exam: z.any().prefault(null).catch(null),                    // 1.10.1 (FP8): exam-week preparation { tier, h }
    ranknews: z.any().prefault(null).catch(null),                // 1.10.1 (FP9): Results day { from, to, dorm }
    grades: z.any().prefault(null).catch(null),                  // 1.15.0: the next exams' expected marks { label, tier, h, marks, why, run } (engine; UI, <now>)
    posted: z.any().prefault(null).catch(null),                  // 1.15.0: marks posted in this update { label, line, rem } (engine; <now>)
    absent: z.any().prefault(null).catch(null),                  // 1.10.0 (FP7): the class {{user}} just skipped { cls, teacher }
    free: z.any().prefault(null).catch(null),                    // 1.33.0: today's free periods [{ p, s, t, why }] for <now>
    leave: z.any().prefault(null).catch(null),                   // 1.10.0 (FP12): who takes their leave from a crowded ordinary-day scene { id, n, cap }
    missed: z.array(z.string()).prefault([]).catch([]),        // 1.12.0: reminders of what the last update may have left out (engine 8l, <now>)
    fortune: z.any().prefault(null).catch(null),                 // 1.9.8: the Fortune roll for the next reply { roll, fail, part, mods, active }, engine-written for <now>
    practice: z.any().prefault([]).catch([]),
    craft: z.any().prefault([]).catch([]),                        // 1.28.0: available recipes and their next-turn results
    craft_sale: z.any().prefault(null).catch(null),                // 1.28.0: Apothecary's remaining weekly buying capacity
    mastery: z.any().prefault(null).catch(null),                   // 1.30.0: Rank 5 stats and whether the week's lead is open here
    prof_offer: Bool(false),
    asks: z.record(z.string(), z.string()).prefault({}).catch({}),   // 1.73.0: what a present character may ask after (engine, stepAgenda)
    since: z.any().prefault([]).catch([]), maybe: z.any().prefault([]).catch([]),   // 1.6.0 (N4): Next plans met again / that may bring someone here (engine)
    now: z.any().prefault(null).catch(null),                          // 1.48.0 (audit 3.11): <now>'s engine-made lines (stepNow; 1.47.0's $ui.here is in now.pres)
    xold: z.record(z.string(), z.any()).prefault({}).catch({}),       // 1.6.1 (N5): Extras records that left the full list; given back if they return (engine)
    xgone: z.record(z.string(), z.any()).prefault({}).catch({}),      // 1.61.0 (memory audit M8): short records of Extras past xold { Who, Looks, Voice } (engine)
    fold: z.any().prefault(null).catch(null),                         // 1.63.0 (memory audit M5): the fold request the rule card prints { k, who, label, max, lines, n, sig } (engine)
    cluearch: z.record(z.string(), z.any()).prefault({}).catch({}),   // 1.61.0 (memory audit M1): clues past the cap, for the Mystery panel (engine)
    say: z.record(z.string(), z.number().int().min(0).max(63)).prefault({}).catch({}),   // 1.37.1: dialogue colour of each character present now (engine)
    sayx: z.record(z.string(), z.array(z.number().int().min(0).max(63)).max(3)).prefault({}).catch({}),   // 1.37.2: an Extras character's three dialogue colours (engine)
    stale: z.any().prefault([]).catch([]), phase: z.any().prefault(null).catch(null),   // 1.6.1: campus events with no news for a week; the campus phase (engine)
    cast: z.any().prefault({}).catch({}),                             // 1.5.1 (P1/P6): { full, brief, spoke, gone, ment } for the Cast Sheet (engine)
    perks_used: StrList(60),                                          // 1.3.0: one-use perks already spent ("Council pardon (Irene), M3 W2 Tue")
    perks_grad: z.record(z.string(), z.any()).prefault({}).catch({}),   // 1.7.6: rewards of graduates as they were ({name: perk}), restored if the story keeps them
    next: z.any().prefault(null).catch(null),                         // 1.3.4: the next thing on today's schedule (engine; bracelet)
    agenda: z.any().prefault([]).catch([]),                           // 1.44.0: the Agenda's coming-up feed (engine stepAgenda; Planner, Notice Board, bracelet, <now>)
    portrait: Str(''),                                                // 1.3.4: the student's picture (a SillyTavern user image path)
    tsusp: StrList(40),                                               // 1.4.3: Rank 10 benefits suspended by low Trust (engine)
    area: z.record(z.string(), z.any()).prefault({}).catch({}),       // 1.46.0 (audit 3.1): the outside areas now { forest, avalon, airship, sunreach }: on, at, name, pin,
                                                                      // seen, walks, near, owe, ev, and each area's own fields (engine; UI Map, <now>, lore gates)
    forest: z.any().optional(), capital: z.any().optional(), sunreach: z.any().optional(), airship: z.any().optional(),   // before 1.46.0; moved by stepMigrate
    tune: z.record(z.string(), z.any()).prefault({}).catch({}),       // 1.3.1: training / reputation settings { id: value } (data/tuning.json; the engine checks the values)
  }),

  $eng: O({
    abs: z.coerce.number().prefault(-1).catch(-1),
    late: Num(0, 1e6, 0),
    sleep: z.any().prefault(null).catch(null),
    daily: z.record(z.string(), z.any()).prefault({}).catch({}),
    prof: z.any().prefault(null).catch(null),
    craft: z.any().prefault(null).catch(null),                     // 1.28.0: clearing bloom's harvest day
    pactPlay: Str(''),                                              // 1.31.0: the one Spirit Pact made in play (engine)
    home: z.any().prefault(null).catch(null),                      // 1.31.0: the month's letter home, its reply and parcel (engine)
    agenda: z.any().prefault(null).catch(null),                    // 1.44.0: Agenda { when: { id: [text, abs] } for Projects and Next plans, st: last statuses } (engine)
    area: z.record(z.string(), z.any()).prefault({}).catch({}),       // 1.46.0 (audit 3.1): { forest: this year's hunt { y, tgt, homes, t, hrs, owe, met, caught, res, wen },
                                                                      // avalon: { d, owe, met, ts, tsu, mm, wl, sc }, sunreach: { d, owe, met, nb, lev } } (engine)
    exp: z.any().optional(), cap: z.any().optional(), sr: z.any().optional(),   // before 1.46.0; moved by stepMigrate
    comp: z.any().prefault(null).catch(null),                      // 1.44.0: competition results paid { paid: [keys], exp: 0-2 staff expectation } (engine)
    promise: z.any().prefault(null).catch(null),
    word: z.array(z.any()).prefault([]).catch([]),                // 1.74.0: { from, n, due, to } a loud moment on its way to friends (engine)
    founded: Bool(false),                                          // 1.75.0: founded_club paid (or a club founded before 1.75.0) (engine)
    fjoin: z.record(z.string(), z.any()).prefault({}).catch({}),   // 1.75.0: roster student -> the day they joined the founded club (engine)
    pair: z.any().prefault(null).catch(null),                      // 1.51.0: { d: the day of the last pair moment } (engine)
    first: z.record(z.string(), z.any()).prefault({}).catch({}),    // 1.57.0 (U3): notable place -> [first visit date, who was there] (engine)
    nrel: z.record(z.string(), z.any()).prefault({}).catch({}),     // 1.51.0: New_relations key -> day last renewed (engine)                   // 1.49.0: { late: ['c:<favour>', 'p:<group assignment>'] } overdue rises already paid (engine)
    profv: Int(0, 1, 0),
    trip: Int(0, 1, 0),                                             // 1.42.0: 1 once {{user}} was off campus during the active Trip (engine)
    initiative: z.any().prefault(null).catch(null),              // 1.7.7 (FP1): latched day/week, chosen NPC and per-NPC cooldown
    auth: Str(''),   // 'builder' only inside a Student Builder patch; lets it write the read-only fields once
    tool: z.coerce.number().prefault(0).catch(0),   // 1.11.1: 1 inside a player-tool patch (Builder, Settings): not a story turn (engine resets it)
    seed: z.coerce.number().prefault(0).catch(0),   // 5.3: chat seed for happenings, set once by the engine
    jq: z.array(z.coerce.string()).prefault([]).catch([]),        // 1.63.0 (memory audit M5): Journal lines that left the window, waiting for a fold (engine)
    chron: z.array(z.any()).prefault([]).catch([]),               // 1.63.0: one { L: 1|2|3, y: campaign year } per _Chronicle entry (engine)
    fold: z.any().prefault(null).catch(null),                     // 1.63.0: { sig, n } replies the current fold request has waited (engine)
    gist: z.array(z.coerce.string()).prefault([]).catch([]),   // 1.66.0 (M11d): one entry per reply with an update block ('' = no gist), latest GIST.keep (engine)
    tl: z.any().prefault(null).catch(null),                   // 1.66.0 (M11b): { t, void } of the chat's timeline, stamped by the MVU hook from the chat variable eld_tl
    floor: z.coerce.number().prefault(-1).catch(-1),   // 1.61.0 (memory audit M9): the chat floor this state was made on (the MVU hook)
    prizes: StrList(20),   // 1.0.3: competition prizes already paid ("Kingdom-Y1")
    grads: StrList(10),    // 1.0.3: campaign years whose graduates already left ("Y1")
    bdays: StrList(10),    // 1.7.4: campaign years in which {{user}}'s birthday already added a year to Player.Profile.Age ("Y2")
    cohorts: StrList(10),  // 1.0.3: campaign years whose new first-years already arrived ("Y2")
    ver: Str(''),          // 1.0.3: engine version that last wrote this state (for future save migrations)
    repw: z.any().prefault(null).catch(null),                    // 1.3.0: repeatable Rep XP gained this week { w, Academy, Student, Doves }
    doveweek: z.any().prefault(null).catch(null),                // 1.18.0: quiet-week Dove attention decay
    heals: z.record(z.string(), z.any()).prefault({}).catch({}), // 1.18.0: anchored Heals_by dates
    repv: z.coerce.number().prefault(0).catch(0),                // 1.3.0: 1 once the pre-1.3.0 Public / Dorm meters were migrated
    rum: z.record(z.string(), z.any()).prefault({}).catch({}),   // 1.1.0: rumour metadata { text: { born, fate } }
    wxs: z.any().prefault(null).catch(null),                     // 1.1.0: weather exposure counters and head-cold bookkeeping
    mrem: z.coerce.number().prefault(0).catch(0),                // 1.9.4: mana rounding remainder carried between turns (passive regeneration)
    turn: z.coerce.number().prefault(0).catch(0),                // 1.9.8: updates so far (seeds the Fortune roll)
    missed: z.record(z.string(), z.any()).prefault({}).catch({}),   // 1.12.0: reminder signatures already shown { sig: day } (engine 8l)
    att: z.any().prefault(null).catch(null),                     // 1.10.0 (FP7): minutes away from / at this and yesterday's class periods { p, c, done }
    wk: z.any().prefault(null).catch(null),                      // 1.10.0 (FP7/FP10): this week's tally { w, p0, ranks, rep, skipped, periods }
    wkloss: z.coerce.number().prefault(-1).catch(-1),            // 1.10.0: the last week with an Academy reputation loss
    amb: z.any().prefault(null).catch(null),                     // 1.16.0: ambience bookkeeping { cue, beat, unc, last } (recent types per place, the uncanny week)
    study: z.any().prefault(null).catch(null),                   // 1.10.1 (FP8/FP9): study minutes toward the next exam, past tiers, Results done { key, mins, grace, hist, ranked }; 1.15.0: skips per subject, exam-day condition, training, story shifts, marks, standing, remedials
    bweek: z.record(z.string(), z.any()).prefault({}).catch({}),  // gifts, help and first invited hangout per week
    vouch: z.record(z.string(), z.any()).prefault({}).catch({}),
    bondv: z.coerce.number().prefault(0).catch(0),               // 1.2.2: 2 once Progress was converted to XP
    tenv: z.coerce.number().prefault(0).catch(0),                // 1.3.8: 1 once older bonds had their paid milestones recorded
    xs: z.record(z.string(), z.any()).prefault({}).catch({}),     // 1.6.1 (N5): invented characters seen { lowercase name: { n: appearances, d: last day } }
    lore: Str(''),                                                // 1.3.4: the card version of the lorebook this chat started from ([initvar])
  }),
}).prefault({});

$(() => {
  registerMvuSchema(Schema);
});
