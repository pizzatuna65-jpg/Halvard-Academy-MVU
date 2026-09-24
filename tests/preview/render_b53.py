# Batch 5.3 screenshots (planner happening card, journal archive, Student file > Settings, bar chip). Run from the project root: NM=<node_modules> python3 tests/preview/render_b53.py
import json, os, asyncio, glob, sys
import os as _os, tempfile as _tf
ROOT = _os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
NM = _os.environ.get('NM', _os.path.join(ROOT, 'node_modules'))
OUT = _os.path.join(_tf.gettempdir(), 'eldrasil_preview'); _os.makedirs(OUT, exist_ok=True)
sys.argv=['x','tests/preview/sample_b53.json']
src=open('tests/preview/render_b5.py').read()
src=src.replace("asyncio.run(main()); print('done')","").replace('os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))', repr(os.getcwd()))
exec(src)
async def extra():
    exe = (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux/chrome') or [None])[0]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=exe)
        pg = await b.new_page(viewport={'width': 900, 'height': 900})
        await pg.route('https://**', lambda r: r.fulfill(status=404))
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.set_content('<html><body style="background:#1e1f22;margin:0"></body></html>')
        for c in (lodash, 'window.STATE=' + json.dumps(S) + ';' + MOCK, ui): await pg.add_script_tag(content=c)
        await pg.evaluate("eventEmit('eldrasil:open','profile')"); await pg.wait_for_timeout(200)
        await pg.evaluate("(()=>{const r=document.getElementById('eldrasil-ui-host').shadowRoot; r.querySelector('[data-tab=settings]').click()})()")
        await pg.wait_for_timeout(200); await pg.screenshot(path=OUT + '/b5_settings.png'); print('settings errs', errs)
        await b.close()
os.environ['SHOTS']=json.dumps([['nb_planner','notebook:planner',900],['nb_journal','notebook:journal',390]])
SHOTS=json.loads(os.environ['SHOTS'])
asyncio.run(main()); asyncio.run(extra()); print('done')
