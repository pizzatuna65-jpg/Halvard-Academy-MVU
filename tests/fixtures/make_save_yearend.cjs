// 1.7.1: a save at the very end of campaign Year 1 (M12 W4 Sun 20:00), made by the CURRENT build from the ordinary save of the
// same release: dated lines from across Year 1 (Journal, Knows, Last_seen, a campus event), a finished competition run and the
// graduation already done. tests/test_year2_v171.cjs plays it into Year 2 with the new build.
// Usage: node tests/fixtures/make_save_yearend.cjs   -> tests/fixtures/saves/save_<character_version>_yearend.json
const fs = require('fs'), path = require('path');
const { applyPatch, ROOT } = require('../harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const ver = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/card/card.json'), 'utf8')).character_version;
let S = JSON.parse(fs.readFileSync(path.join(__dirname, 'saves', `save_${ver}.json`), 'utf8'));
const at = (w, ops) => { S = applyPatch(S, [...Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })), ...ops]); };
const here = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
at({ Month: 3, Week: 4, Day: 'Sat', Time: '15:00', Location: 'Combat Grounds' }, [here(['Irene']),
  { op: 'replace', path: '/Competition', value: { Tier: 'Dorm', Status: 'qualified', Placement: '9th of 40', Team: [], Results: ['R1: beat a Fire second-year'] } },
  { op: 'replace', path: '/Bonds/Irene/Knows', value: ['{{user}} qualified from the Dorm Competition.'] }]);
at({ Month: 6, Week: 4, Day: 'Thu', Time: '15:00' }, [here(['Etnie']),
  { op: 'replace', path: '/Competition', value: { Tier: 'Academy', Status: 'eliminated', Placement: 'quarter-final', Team: ['Etnie', 'Irene', 'Castor'], Results: ['R1: won', 'QF: lost'] } },
  { op: 'replace', path: '/Bonds/Etnie/Knows', value: ['{{user}} fought beside her in the Academy Competition.'] },
  { op: 'replace', path: '/Campus_State/Events/Seal inspection', value: 'Doves inspect the seal every night this month.' },
  { op: 'insert', path: '/Journal/-', value: 'Lost the Academy Competition quarter-final with Etnie, Irene and Castor.' }]);
at({ Month: 11, Week: 4, Day: 'Sun', Time: '10:00', Location: 'Arbiter Hall' }, [here(['Etnie', 'Irene'])]);
at({ Month: 12, Week: 1, Day: 'Mon', Time: '09:00', Location: 'Viridian Dormitory' }, [here([])]);
at({ Month: 12, Week: 4, Day: 'Sun', Time: '20:00' }, [{ op: 'insert', path: '/Journal/-', value: 'Packed for the new year.' }]);
const out = path.join(__dirname, 'saves', `save_${ver}_yearend.json`);
fs.writeFileSync(out, JSON.stringify(S, null, 1) + '\n');
console.log('wrote', path.relative(ROOT, out), 'Graduated', S.Campus_State.Graduated.join(', '), 'Competition', S.Competition.Status, S.Competition.Tier);
