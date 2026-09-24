# Batch 5.1 screenshots: notebook tabs (desktop + mobile) and the status bar with clickable chips.
import json, os, sys, asyncio, glob
from playwright.async_api import async_playwright
import tempfile as _tf
OUT = os.path.join(_tf.gettempdir(), 'eldrasil_preview'); os.makedirs(OUT, exist_ok=True)
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NM = os.environ.get('NM', os.path.join(ROOT, 'node_modules'))
ui = open(os.path.join(ROOT, 'src/scripts/ui.js')).read()
bar = open(os.path.join(ROOT, 'src/ui/statusbar.html')).read()
mock_bar = open(os.path.join(ROOT, 'tests/preview/mock_th.js')).read()
lodash = open(os.path.join(NM, 'lodash/lodash.min.js')).read()
S = json.load(open(os.path.join(ROOT, sys.argv[1] if len(sys.argv) > 1 else 'tests/preview/sample_b5.json')))
MOCK = """window.H={}; window.eventOn=(e,f)=>{(H[e]=H[e]||[]).push(f)}; window.eventEmit=async(e,d)=>(H[e]||[]).forEach(f=>f(d));
window.getButtonEvent=n=>'btn:'+n; window.tavern_events={CHAT_CHANGED:'cc',MESSAGE_RECEIVED:'mr'};
window.waitGlobalInitialized=()=>new Promise(()=>{}); window.toastr={warning:console.log,success:console.log,error:console.log,info:console.log};
window.$=f=>{ if(typeof f==='function') f(); return {on(){}} };
window.getLastMessageId=()=>0; window.getVariables=()=>({stat_data:window.STATE}); window.substitudeMacros=()=>'Aria Vale';"""
SHOTS = json.loads(os.environ.get('SHOTS', '[]')) or [
    ['nb_planner', 'notebook:planner', 900], ['nb_planner_m', 'notebook:planner', 390], ['nb_notices', 'notebook:notices', 900],
    ['nb_letters', 'notebook:letters', 900], ['nb_mystery', 'notebook:mystery', 900], ['nb_journal', 'notebook:journal', 390]]
async def main():
    exe = (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux/chrome') or [None])[0]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=exe)
        for name, target, w in SHOTS:
            pg = await b.new_page(viewport={'width': w, 'height': 900})
            await pg.route('https://**', lambda r: r.fulfill(status=404))
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.set_content('<html><body style="background:#1e1f22;margin:0"></body></html>')
            for c in (lodash, 'window.STATE=' + json.dumps(S) + ';' + MOCK, ui): await pg.add_script_tag(content=c)
            await pg.evaluate(f"eventEmit('eldrasil:open','{target}')")
            await pg.wait_for_timeout(300)
            if os.environ.get("TALL"): await pg.evaluate("(()=>{const r=document.getElementById(\x27eldrasil-ui-host\x27).shadowRoot; r.querySelector(\x27.bd\x27).scrollTop=99999})()")
            await pg.screenshot(path=f'{OUT}/b5_{name}.png')
            if errs: print(name, 'ERR', errs)
            await pg.close()
        for w in (720, 380):
            pg = await b.new_page(viewport={'width': w, 'height': 500}); await pg.route('https://**', lambda r: r.fulfill(status=404))
            head, body = bar.split('<body>')
            await pg.set_content('<html>' + head.replace('<head>', '<head><script>window.__MOCK_STATE=' + json.dumps(S) + ';' + mock_bar + '</script>') + '<body style="background:#1e1f22;padding:8px">' + body + '</html>')
            await pg.wait_for_timeout(400); await pg.screenshot(path=f'{OUT}/b5_bar_{w}.png', full_page=True); await pg.close()
        await b.close()
asyncio.run(main()); print('done')
