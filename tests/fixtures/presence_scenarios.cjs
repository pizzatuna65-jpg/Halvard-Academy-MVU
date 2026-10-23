// 1.47.0 (audit batch 5, 3.8): the scenarios whose <now> presence block was recorded from 1.46.0's EJS (presence_1460.json) and is
// compared with the engine's whereabouts ($ui.here) in tests/test_audit_batch5_v1470.cjs. Deterministic: places, days, hours, months
// (the flu months too), years, dorms, roles, statuses, graduates, the Council, the election Saturday and Settings with class or
// weather off. scenario(i) -> the state after one engine run.
const { Schema, runEngine, initState } = require('../harness.cjs');
const PLACES = ['Canteen', 'Main Library', 'Lecture Halls — Floor 2', 'Lecture Halls — Floor 3', 'Potion Halls', 'Student Council Chamber', 'Main Courtyard',
  'Courtyards', 'Boathouse and Lake', 'Fishing House', 'Gymnasium', 'Sports Field', 'Gardens', 'Fire Dormitory', 'Archery Range', 'Combat Grounds',
  'Medical Centre', 'Menagerie', 'Seminar Rooms', 'Workshop', 'The Snug', 'Club Rooms', 'Observation Tower', 'Staff Room', 'Faculty Offices'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], TIMES = ['07:30', '08:30', '09:40', '11:05', '13:10', '14:20', '15:40', '17:00', '21:00'];
const ROLES = ['', 'Attack', 'Healing', 'Control, Defense', 'Support'], DORMS = ['Fire', 'Light', 'Sky', 'Viridian', 'Unsorted'];
const pick = (a, i, k) => a[(i * k + Math.floor(i / a.length)) % a.length];
function scenario(i, E, off) {   // 1.52.0: off = Features to turn off (the routines, to compare with older releases)
  const S = initState();
  const m = i % 5 === 0 ? 10 + (i % 2) : 1 + (i * 7) % 11, w = 1 + (i * 3) % 4, Y = i % 9 === 0 ? 2 : 1;
  S.World = { ...S.World, Year: Y, Month: m, Week: i % 23 === 0 ? 3 : w, Day: i % 23 === 0 ? 'Sat' : pick(DAYS, i, 3), Time: i % 23 === 0 ? '13:10' : pick(TIMES, i, 5), Location: pick(PLACES, i, 7) };
  S.Player.Profile = { ...S.Player.Profile, Name: 'Aria Vale', Year: 1 + (i % 3), Dorm: pick(DORMS, i, 2), Combat_role: pick(ROLES, i, 3), Council: i % 4 === 0 };
  if (i % 6 === 0) S.Campus_State.NPC_status = { Ottavio: 'in the Medical Centre with a sprained wrist', Irene: 'away visiting family' };
  if (i % 10 === 0) S.Campus_State.Graduated = ['Castor', 'Zara'];
  if (i % 4 === 0) S.Campus_State.Council = { ...(S.Campus_State.Council || {}), Members: ['Caspian', 'Aria Vale', 'Kanae'] };
  if (i % 13 === 0) S.$ui.off = ['class'];
  if (i % 17 === 0) S.$ui.wxfx = 'flavor';
  if (off) S.$ui.off = [...(S.$ui.off || []), ...off];
  S.$ui.off = [...(S.$ui.off || []), 'presence_roll'];   // 1.99.11: recorded from the habit list (the presence roll has its own suite)
  S.$eng.abs = E.toAbs(S.World);
  const A = Schema.parse(S); runEngine(A); return Schema.parse(A);
}
module.exports = { scenario, N: 360 };
