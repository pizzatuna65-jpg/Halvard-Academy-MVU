import json, os, asyncio, sys
from playwright.async_api import async_playwright
import tempfile as _tf
OUT = os.path.join(_tf.gettempdir(), 'eldrasil_preview'); os.makedirs(OUT, exist_ok=True)
NM = os.environ.get('NM', os.path.join(ROOT, 'node_modules'))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ui = open(os.path.join(ROOT, 'src/scripts/ui.js')).read()
lodash = open(NM + '/lodash/lodash.min.js').read()
fresh = json.load(open(os.path.join(ROOT, 'tests/preview/sample_states.json')))['fresh']
built = json.load(open(os.path.join(ROOT, 'tests/preview/sample_built.json')))
MOCK = """
window.H={}; window.eventOn=(e,f)=>{(H[e]=H[e]||[]).push(f)}; window.eventEmit=async(e,d)=>(H[e]||[]).forEach(f=>f(d));
window.getButtonEvent=n=>'btn:'+n; window.tavern_events={CHAT_CHANGED:'cc',MESSAGE_RECEIVED:'mr'};
window.waitGlobalInitialized=()=>new Promise(()=>{}); window.toastr={warning:console.log,success:console.log,error:console.log};
window.$=f=>{ if(typeof f==='function') f(); return {on(){}} };
window.getLastMessageId=()=>0; window.getVariables=()=>({stat_data:window.STATE}); window.substitudeMacros=()=>'Aria Vale';
"""
shots = [
  ('b_start', 'fresh', 'builder', "", 900), ('b_power', 'fresh', 'builder', "tpl:frost;step:power", 900),
  ('b_techs', 'fresh', 'builder', "tpl:frost;step:techs", 900), ('b_hidden', 'fresh', 'builder', "tpl:hidden;step:hidden", 900),
  ('b_review', 'fresh', 'builder', "tpl:hidden;step:review", 900), ('b_techs_m', 'fresh', 'builder', "tpl:spirit;step:pacts", 390),
  ('p_overview', 'built', 'profile', "", 900), ('p_magic', 'built', 'profile', "tab:magic", 900), ('p_hidden', 'built', 'profile', "tab:hidden", 390),
  ('p_body', 'built', 'profile', "tab:body", 900),
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for name, st, panel, acts, w in shots:
            pg = await b.new_page(viewport={'width': w, 'height': 820})
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            await pg.set_content('<html><body style="background:#1e1f22;margin:0"></body></html>')
            await pg.add_script_tag(content=lodash)
            await pg.add_script_tag(content='window.STATE=' + json.dumps(fresh if st == 'fresh' else built) + ';' + MOCK)
            await pg.add_script_tag(content=ui)
            await pg.evaluate(f"eventEmit('eldrasil:open','{panel}')")
            for a in [x for x in acts.split(';') if x]:
                k, v = a.split(':')
                sel = {'tpl': f'[data-tpl="{v}"]', 'step': f'.nav [data-step="{v}"]', 'tab': f'[data-tab="{v}"]'}[k]
                await pg.evaluate(f"document.getElementById('eldrasil-ui-host').shadowRoot.querySelector('{sel}').click()")
            await pg.wait_for_timeout(150)
            await pg.screenshot(path=f'{OUT}/ui_{name}.png')
            if errs: print(name, 'ERRORS', errs)
            await pg.close()
        await b.close()
asyncio.run(main())
print('done')
