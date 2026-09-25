import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';
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
      Resting: Enum(['none', 'rest', 'sleep'], 'none'),
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
      Custom: Rec(v => ({ Type: s(v.Type), Forbidden: b(v.Forbidden) }), 'Type'),
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
    $Known_old: Array.isArray(v.$Known_old) ? v.$Known_old.map(s).slice(-40) : [],   // 5.4: older facts, hidden from the AI, shown in the dossier
    $tf: n(v.$tf, 0, 100, 0),   // 1.3.8: Tension decay carried between days (engine)
    $ms: Array.isArray(v.$ms) ? v.$ms.map(Number).filter(Number.isFinite).slice(-11) : [],   // 1.3.8: ranks whose reputation milestone was already paid
    $tdrop: n(v.$tdrop, -99, 1e9, -99),   // 1.4.3: day of the last Trust drop (a quiet week recovers it; engine)
    $tlast: n(v.$tlast, 0, 100, 0),       // 1.4.4: size of that drop, for an 'understood' (engine)
    $tbrk: n(v.$tbrk, 0, 1, 0),           // 1.4.4: maximum Tension already broke a rank; re-armed below 70 (engine)
    $Recent: Array.isArray(v.$Recent) ? v.$Recent.filter(r => r && typeof r === 'object').map(r => ({ w: s(r.w), n: s(r.n), fx: s(r.fx) })).slice(-10) : [],   // 1.4.4: latest moments with {{user}} (engine)
  }), 'Title'),

  Campus_State: O({
    Events: StrRec(),
    Rumours: StrList(15),
    Location_changes: StrRec(),
    NPC_status: StrRec(),
    New_relations: StrRec(),
    Secrets_revealed: StrList(80),
    Graduated: StrList(60),   // 1.0.3: students who have left campus after Graduation (engine adds the year's third-years)
  }),

  // Batch 5.1: Where (optional place, enables "Go here"); _When / _Late / $abs are computed by the engine from Due
  Commitments: Rec(v => ({ Desc: s(v.Desc), Due: s(v.Due), With: s(v.With), Type: s(v.Type), Where: s(v.Where),
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
  Journal: StrList(30),   // "[M1 W1 Mon] turning point" — long-term memory (used by state-as-memory in 5.3)
  Clues: Rec(v => ({
    Thread: s(v.Thread) || 'Unsorted clues', Detail: s(v.Detail), Where: s(v.Where), Found: s(v.Found),
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
    ? { With: s(v.With), Kind: s(v.Kind).trim().toLowerCase(), Gift: s(v.Gift).trim().toLowerCase(), Public: b(v.Public), Note: s(v.Note).slice(0, 200) } : { With: s(v), Kind: 'talk', Gift: '', Public: false, Note: '' }))).prefault([]).catch([]),   // 1.4.4: Note (one sentence, for the bond's recent history)   // 1.4.0: Public (an apology in front of others)

  // 1.3.0: what earned or cost reputation this reply (narrator), training sessions (narrator), one-use perks spent (narrator);
  // the engine applies them and empties the lists
  Rep_events: z.array(z.any().transform(v => (typeof v === 'object' && v !== null
    ? { Rep: s(v.Rep).trim(), XP: n(v.XP, -125, 125, 0), Kind: s(v.Kind).trim().toLowerCase(), Why: s(v.Why) } : { Rep: '', XP: 0, Kind: '', Why: s(v) }))).prefault([]).catch([]),
  Training: z.array(z.any().transform(v => ({ Track: s(typeof v === 'object' && v !== null ? v.Track : v).trim().toLowerCase() }))).prefault([]).catch([]),
  Perk_use: StrList(10),
  // 1.3.0 bond rewards held (engine-written, read-only for the AI): { "<name>": { From, Kind: gift|rank10, Effect, Uses } }; Uses 0 = not limited
  _Perks: Rec(v => ({ From: s(v.From), Kind: s(v.Kind) === 'rank10' ? 'rank10' : 'gift', Effect: s(v.Effect), Uses: Math.round(n(v.Uses, 0, 99, 0)) }), 'Effect'),

  _Log: StrList(12),

  $ui: O({
    unlocks: StrList(60),
    discovered: StrList(80),
    toasts: StrList(10),
    built: Bool(false),
    names: StrList(80),   // NPC ids whose name has appeared in the story prose (name reveal = story evidence, D14)
    happenings: Enum(['off', 'rare', 'normal', 'often'], 'normal'),   // 5.3: player setting (Student file > Settings)
    hap: z.any().prefault(null).catch(null),                          // 5.3: today's happening, structured for the UI
    archive: StrList(300),                                            // 5.3: journal lines the narrator no longer reads
    secrets: StrList(500),                                            // 1.0.3: permanent ledger of Secrets_revealed (unlocks read it)
    // 1.1.0
    wxfx: Enum(['off', 'flavor', 'full'], 'full'),                    // Weather effects setting (Features panel)
    wx: z.any().prefault(null).catch(null),                           // weather for the UI and the Now entry (engine)
    rumours_old: StrList(50),                                         // rumours that died out (UI only)
    gossip: z.any().prefault([]).catch([]),                           // live rumours with reach [[text, reach, day]] (engine)
    off: StrList(20),                                                 // feature ids turned off in Features settings
    parked: z.record(z.string(), z.any()).prefault({}).catch({}),     // state of features that are off: { id: { path: value } }
    // 1.2.0
    file: z.any().prefault(null).catch(null),                         // the Builder's record of what it last wrote (self-heal, engine §0)
    marks: z.record(z.string(), z.coerce.string()).prefault({}).catch({}),   // calendar notes the player wrote { "M1 W2 Wed": "text" }
    // 1.2.2 bonds (Settings) and the engine's view of full bond bars (event ready now / after the cooldown)
    bondpace: Enum(['standard', 'fast', 'brisk', 'slow'], 'standard'),
    romrank: Int(0, 11, 8),                                            // romance opens at this rank (0 any, 11 off)
    bev: z.any().prefault({}).catch({}),
    close: z.array(z.string()).prefault([]).catch([]),           // 1.5.0 (N3a): bonds close to their next rank (engine)
    cast: z.any().prefault({}).catch({}),                             // 1.5.1 (P1/P6): { full, brief, spoke, gone, ment } for the Cast Sheet (engine)
    perks_used: StrList(60),
    next: z.any().prefault(null).catch(null),                         // 1.3.4: the next thing on today's schedule (engine; bracelet)
    portrait: Str(''),                                                // 1.3.4: the student's picture (a SillyTavern user image path)                                          // 1.3.0: one-use perks already spent ("Council pardon (Irene), M3 W2 Tue")
    tsusp: StrList(40),                                               // 1.4.3: Rank 10 benefits suspended by low Trust (engine)
    tune: z.record(z.string(), z.any()).prefault({}).catch({}),       // 1.3.1: training / reputation settings { id: value } (data/tuning.json; the engine checks the values)
  }),

  $eng: O({
    abs: z.coerce.number().prefault(-1).catch(-1),
    daily: z.record(z.string(), z.any()).prefault({}).catch({}),
    auth: Str(''),   // 'builder' only inside a Student Builder patch; lets it write the read-only fields once
    seed: z.coerce.number().prefault(0).catch(0),   // 5.3: chat seed for happenings, set once by the engine
    prizes: StrList(20),
    grads: StrList(10),
    cohorts: StrList(10),  // 1.0.3: campaign years whose new first-years already arrived ("Y2")    // 1.0.3: campaign years whose graduates already left ("Y1")   // 1.0.3: competition prizes already paid ("Kingdom-Y1")
    ver: Str(''),          // 1.0.3: engine version that last wrote this state (for future save migrations)
    repw: z.any().prefault(null).catch(null),                    // 1.3.0: repeatable Rep XP gained this week { w, Academy, Student, Doves }
    repv: z.coerce.number().prefault(0).catch(0),                // 1.3.0: 1 once the pre-1.3.0 Public / Dorm meters were migrated
    rum: z.record(z.string(), z.any()).prefault({}).catch({}),   // 1.1.0: rumour metadata { text: { born, fate } }
    wxs: z.any().prefault(null).catch(null),                     // 1.1.0: weather exposure counters and head-cold bookkeeping
    bweek: z.record(z.string(), z.any()).prefault({}).catch({}),  // 1.2.2: gifts / help per bond this week
    bondv: z.coerce.number().prefault(0).catch(0),
    tenv: z.coerce.number().prefault(0).catch(0),                // 1.3.8: 1 once older bonds had their paid milestones recorded
    lore: Str(''),                                                // 1.3.4: the card version of the lorebook this chat started from ([initvar])                // 1.2.2: 2 once Progress was converted to XP
  }),
}).prefault({});

$(() => {
  registerMvuSchema(Schema);
});
