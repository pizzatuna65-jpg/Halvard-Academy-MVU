import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';
// zod and lodash are available globally as `z` and `_`
// Eldrasil / Halvard — MVU ZOD schema (Batch 2.1, extended in 3.2)
// Prefix rules: `_Name` = visible to the AI but read-only for it (engine/builder writes); `$name` = hidden from the AI.

// ---------- helpers ----------
const Num = (lo, hi, d) =>
  z.coerce.number().transform(v => _.clamp(Number.isFinite(v) ? v : d, lo, hi)).prefault(d);
const Int = (lo, hi, d) =>
  z.coerce.number().transform(v => Math.round(_.clamp(Number.isFinite(v) ? v : d, lo, hi))).prefault(d);
const Str = (d = '') => z.coerce.string().prefault(d);
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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ---------- schema ----------
export const Schema = z.object({
  World: z.object({
    Year: Int(1, 99, 1),
    Month: Int(1, 12, 1),
    Week: Int(1, 4, 1),
    Day: Enum(DAYS, 'Mon'),
    Time: z.string().regex(/^\d{1,2}:\d{2}$/).prefault('08:00').catch('08:00'),
    Location: Str('Reception and Gatehouse'),
    _Period: Str(''),
    _Curfew: Str(''),
    _Event_today: Str(''),
    _Happening: Str(''),   // 5.3 (F20): today's seeded campus happening, engine-written
    _Season: Str(''),      // 1.1.0: Winter | Spring | Summer | Autumn (engine; '' when Weather is Off)
    _Weather: Str(''),     // 1.1.0: "Afternoon, autumn: steady rain, windy, 9 °C (cool)" (engine; '' when Weather is Off)
  }).prefault({}),

  Scene: z.object({
    Present: Rec(v => ({ Note: s(v.Note) }), 'Note'),
  }).prefault({}),

  Player: z.object({
    Profile: z.object({
      Name: Str('{{user}}'),
      Pronouns: Str(''),
      Age: Int(0, 999, 18),
      Race: Str('Human'),
      Beast_type: Str(''),
      Appearance: Str(''),
      Background: Str(''),
      Year: Int(1, 3, 1),
      Dorm: Enum(['Unsorted', 'Fire', 'Light', 'Sky', 'Viridian'], 'Unsorted'),
      Dorm_rank: Int(0, 9999, 0),
      Club: Str(''),
      Combat_role: Str(''),
      Goal: Str(''),
      Reputation: z.object({ Public: Int(-100, 100, 0), Dorm: Int(-100, 100, 0) }).prefault({}),
    }).prefault({}),

    Vitals: z.object({
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
    }).prefault({}).transform(o => ({
      ...o,
      HP: Math.min(o.HP, o.HP_max),
      Stamina: Math.min(o.Stamina, o.Stamina_max),
      Mana: Math.min(o.Mana, o.Mana_max),
    })),

    Injuries: Rec(v => ({
      Severity: ['minor', 'moderate', 'serious', 'critical'].includes(s(v.Severity).toLowerCase()) ? s(v.Severity).toLowerCase() : 'minor',
      Body_part: s(v.Body_part), Effect: s(v.Effect), Heals_by: s(v.Heals_by),
    }), 'Effect'),

    Wallet: z.object({
      Points: Int(0, 1e9, 0),
      Coin: Int(0, 1e9, 0),   // real money (Banking House 1:1); the only money that works off campus (Plan 4.1, added 5.2)
      Transactions: StrList(20),
    }).prefault({}),

    Academics: z.object({
      Grades: StrRec(),
      Exams: StrRec(),
    }).prefault({}),
    // 1.1.0: weather conditions (Soaked, Chilled, Overheated, Head cold). The engine adds and clears them; the story may remove one.
    Conditions: Rec(v => ({ Effect: s(v.Effect), Since: s(v.Since) }), 'Effect'),
  }).prefault({}),

  Magic: z.object({
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
    _Affinity: z.object({
      Types: StrList(4),
      Dominant: Str(''),
      Specialties: StrList(8),
      Preset: Enum(['', 'Grounded', 'Gifted', 'Prodigy', 'Unbound'], ''),
    }).prefault({}),
    Active: Rec(v => ({ Technique: s(v.Technique), Note: s(v.Note), $started: n(v.$started, -1, 1e9, -1), $settled: n(v.$settled, -1, 1e9, -1) }), 'Technique'),
    Casts: z.array(z.any().transform(v => (typeof v === 'object' && v !== null
      ? { Technique: s(v.Technique), Times: n(v.Times, 1, 99, 1) } : { Technique: s(v), Times: 1 }))).prefault([]).catch([]),
    Pacts: Rec(v => ({
      Spirit: s(v.Spirit), Tier: ['Lesser', 'Basic', 'Greater', 'Spirit Lord'].includes(v.Tier) ? v.Tier : 'Lesser',
      Summoned: b(v.Summoned), Terms: s(v.Terms), Note: s(v.Note),
    }), 'Spirit'),
  }).prefault({}),

  Hidden: z.object({
    _True_magic: Str(''),
    Cover_magic: Str(''),
    Concealment: Str(''),
    Known_by: StrList(40),
    Dove_attention: Int(0, 100, 0),
    _Stage: Str('Unnoticed'),
  }).prefault({}),

  Bonds: Rec(v => ({
    Rank: Math.round(n(v.Rank, 0, 10, 0)), Progress: n(v.Progress, 0, 10, 0),
    Trust: Math.round(n(v.Trust, 0, 100, 50)), Tension: Math.round(n(v.Tension, 0, 100, 0)),
    Title: s(v.Title), Romance: b(v.Romance),
    Known_facts: Array.isArray(v.Known_facts) ? v.Known_facts.map(s).slice(-30) : [],
    Milestones: Array.isArray(v.Milestones) ? v.Milestones.map(s).slice(-20) : [],
    Last_seen: s(v.Last_seen), _Event_ready: b(v._Event_ready),
    $Known_old: Array.isArray(v.$Known_old) ? v.$Known_old.map(s).slice(-40) : [],   // 5.4: older facts, hidden from the AI, shown in the dossier
  }), 'Title'),

  Campus_State: z.object({
    Events: StrRec(),
    Rumours: StrList(15),
    Location_changes: StrRec(),
    NPC_status: StrRec(),
    New_relations: StrRec(),
    Secrets_revealed: StrList(80),
    Graduated: StrList(60),   // 1.0.3: students who have left campus after Graduation (engine adds the year's third-years)
  }).prefault({}),

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
  Competition: z.object({
    Tier: CIEnum(['', 'Dorm', 'Academy', 'Kingdom', 'World'], ''),
    Status: CIEnum(['', 'entered', 'qualified', 'eliminated', 'champion', 'selected'], ''),
    Placement: Str(''),
    Team: StrList(4),       // teammates (not {{user}})
    Results: StrList(12),
  }).prefault({}),
  Projects: Rec(v => ({
    Kind: s(v.Kind) || 'other', Goal: s(v.Goal), Progress: Math.round(n(v.Progress, 0, 100, 0)),
    Needs: s(v.Needs), Where: s(v.Where), Due: s(v.Due), With: s(v.With),
  }), 'Goal'),
  Trip: z.object({ Active: Bool(false), Destination: Str(''), Companions: StrList(6), Note: Str('') }).prefault({}),
  Journal: StrList(30),   // "[M1 W1 Mon] turning point" — long-term memory (used by state-as-memory in 5.3)
  Clues: Rec(v => ({
    Thread: s(v.Thread) || 'Unsorted clues', Detail: s(v.Detail), Where: s(v.Where), Found: s(v.Found),
    Links: Array.isArray(v.Links) ? v.Links.map(s).filter(Boolean).slice(0, 8) : (v.Links ? String(v.Links).split(/\s*,\s*/).filter(Boolean).slice(0, 8) : []),
  }), 'Detail'),
  Mysteries: Rec(v => ({
    Status: ['open', 'solved', 'cold'].includes(s(v.Status).toLowerCase()) ? s(v.Status).toLowerCase() : 'open', Summary: s(v.Summary),
  }), 'Summary'),

  Battle: z.object({
    Active: Bool(false),
    Combatants: Rec(v => ({ HP: n(v.HP, 0, 999, 100), Stamina: n(v.Stamina, 0, 999, 100), Status: s(v.Status) }), 'Status'),
  }).prefault({}),

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

  _Log: StrList(12),

  $ui: z.object({
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
  }).prefault({}),

  $eng: z.object({
    abs: z.coerce.number().prefault(-1).catch(-1),
    daily: z.record(z.string(), z.any()).prefault({}).catch({}),
    auth: Str(''),   // 'builder' only inside a Student Builder patch; lets it write the read-only fields once
    seed: z.coerce.number().prefault(0).catch(0),   // 5.3: chat seed for happenings, set once by the engine
    prizes: StrList(20),
    grads: StrList(10),
    cohorts: StrList(10),  // 1.0.3: campaign years whose new first-years already arrived ("Y2")    // 1.0.3: campaign years whose graduates already left ("Y1")   // 1.0.3: competition prizes already paid ("Kingdom-Y1")
    ver: Str(''),          // 1.0.3: engine version that last wrote this state (for future save migrations)
    rum: z.record(z.string(), z.any()).prefault({}).catch({}),   // 1.1.0: rumour metadata { text: { born, fate } }
    wxs: z.any().prefault(null).catch(null),                     // 1.1.0: weather exposure counters and head-cold bookkeeping
  }).prefault({}),
}).prefault({});

$(() => {
  registerMvuSchema(Schema);
});
