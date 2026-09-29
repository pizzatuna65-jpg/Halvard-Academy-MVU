#!/usr/bin/env python3
"""1.16.1 (audit A2): the whole build in its fixed order, then a syntax check of every generated script.
Usage: python tools/build_all.py [--lore] [--themes] [--preset] [--no-test-cards]
  --lore           first re-merge the lorebook and re-curate the data (merge_lorebooks.py, curate_data.py)
  --themes         regenerate data/themes.json (make_themes.py)
  --preset         regenerate the edited preset (presets/edit_preset.py)
  --no-test-cards  skip the dist/test/ TEST cards
The order matters: gen_mvu_entries writes data/feature_cost.json, which gen_ui reads; build_card reads everything."""
import os, subprocess, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')   # the Windows console is not UTF-8
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = set(sys.argv[1:])
py = lambda *a: [sys.executable, *a]
steps = []
if '--lore' in args: steps += [py('tools/merge_lorebooks.py'), py('tools/curate_data.py')]
steps += [py('tools/gen_engine.py'), py('tools/gen_mvu_entries.py')]
if '--themes' in args: steps.append(py('tools/make_themes.py'))
steps += [py('tools/gen_ui.py'), py('build/build_card.py')]
if '--no-test-cards' not in args: steps += [py('tools/build_test_card.py', '7'), py('tools/build_test_card_year2.py'), py('tools/build_test_card_loredepth.py')]
if '--preset' in args: steps.append(py('presets/edit_preset.py'))
# every generated script must at least parse (node detects the ES module syntax of schema.js by itself)
steps += [['node', '--check', f'src/scripts/{f}'] for f in ('engine.js', 'ui.js', 'schema.js', 'mood_gifts.js')]
for cmd in steps:
    name = ' '.join(os.path.relpath(c, ROOT) if os.path.isabs(c) and c != sys.executable else c for c in cmd if c != sys.executable)
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace', env={**os.environ, 'PYTHONIOENCODING': 'utf-8'})
    out = (r.stdout + r.stderr).strip().splitlines()
    print(f"{'ok  ' if r.returncode == 0 else 'FAIL'} {name}{'  | ' + out[-1][:150] if out else ''}")
    if r.returncode:
        print('\n'.join(out[-25:]))
        sys.exit(1)
print('build complete')
