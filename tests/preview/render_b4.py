import json, os, asyncio
from playwright.async_api import async_playwright
import tempfile as _tf
OUT = os.path.join(_tf.gettempdir(), 'eldrasil_preview'); os.makedirs(OUT, exist_ok=True)
NM = os.environ.get('NM', os.path.join(ROOT, 'node_modules'))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ui = open(os.path.join(ROOT, 'src/scripts/ui.js')).read()
bar = open(os.path.join(ROOT, 'src/ui/statusbar.html')).read()
mock_bar = open(os.path.join(ROOT, 'tests/preview/mock_th.js')).read()
lodash = open(NM + '/lodash/lodash.min.js').read()
d3 = open(NM + '/d3/dist/d3.min.js').read()
S = json.load(open(os.path.join(ROOT, 'tests/preview/sample_people.json')))
MOCK = """window.H={}; window.eventOn=(e,f)=>{(H[e]=H[e]||[]).push(f)}; window.eventEmit=async(e,d)=>(H[e]||[]).forEach(f=>f(d));
window.getButtonEvent=n=>'btn:'+n; window.tavern_events={CHAT_CHANGED:'cc',MESSAGE_RECEIVED:'mr'};
window.waitGlobalInitialized=()=>new Promise(()=>{}); window.toastr={warning:console.log,success:console.log,error:console.log,info:console.log};
window.$=f=>{ if(typeof f==='function') f(); return {on(){}} };
window.getLastMessageId=()=>0; window.getVariables=()=>({stat_data:window.STATE}); window.substitudeMacros=()=>'Aria Vale';"""
shots = [('people', 'people', '', 900), ('dossier', 'npc:Irene', '', 900), ('dossier_m', 'npc:Etnie', '', 390),
         ('graph', 'people', 'ptab:graph', 900), ('map', 'map', '', 1000), ('map_castle', 'map', 'pin:1', 1000), ('map_m', 'map', '', 390)]
async def fake(route):
    u = route.request.url
    await route.fulfill(path=OUT + '/fake_map.png' if 'map' in u else OUT + '/fake_thumb.png') if ('irene' in u or 'caspian' in u or 'map' in u) else await route.fulfill(status=404)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for name, target, act, w in shots:
            pg = await b.new_page(viewport={'width': w, 'height': 860})
            await pg.route('https://cdn.jsdelivr.net/**', fake)
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.set_content('<html><body style="background:#1e1f22;margin:0"></body></html>')
            for c in (lodash, d3, 'window.STATE=' + json.dumps(S) + ';' + MOCK, ui): await pg.add_script_tag(content=c)
            await pg.evaluate(f"eventEmit('eldrasil:open','{target}')")
            if act:
                k, v = act.split(':'); sel = {'ptab': f'[data-ptab="{v}"]', 'pin': f'[data-pin="{v}"]'}[k]
                await pg.evaluate(f"document.getElementById('eldrasil-ui-host').shadowRoot.querySelector('{sel}').click()")
            await pg.wait_for_timeout(1500 if 'graph' in name else 400)
            await pg.screenshot(path=f'{OUT}/b4_{name}.png')
            if errs: print(name, 'ERR', errs)
            await pg.close()
        # status bar with cast strip
        for w in (720, 380):
            pg = await b.new_page(viewport={'width': w, 'height': 500}); await pg.route('https://cdn.jsdelivr.net/**', fake)
            head, body = bar.split('<body>')
            await pg.set_content('<html>' + head.replace('<head>', '<head><script>window.__MOCK_STATE=' + json.dumps(S) + ';' + mock_bar + '</script>') + '<body style="background:#1e1f22;padding:8px">' + body + '</html>')
            await pg.wait_for_timeout(500); await pg.screenshot(path=f'{OUT}/b4_bar_{w}.png', full_page=True); await pg.close()
        await b.close()
asyncio.run(main()); print('done')
