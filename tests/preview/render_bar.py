import json, sys, os, asyncio
from playwright.async_api import async_playwright
import tempfile as _tf
OUT = os.path.join(_tf.gettempdir(), 'eldrasil_preview'); os.makedirs(OUT, exist_ok=True)
NM = os.environ.get('NM', os.path.join(ROOT, 'node_modules'))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bar = open(os.path.join(ROOT, 'src/ui/statusbar.html')).read()
mock = open(os.path.join(ROOT, 'tests/preview/mock_th.js')).read()
states = json.load(open(os.path.join(ROOT, 'tests/preview/sample_states.json')))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for name, st in states.items():
            for w in (720, 380):
                pg = await b.new_page(viewport={'width': w, 'height': 400})
                head, body = bar.split('<body>')
                html = '<html>' + head.replace('<head>', '<head><script>window.__MOCK_STATE=' + json.dumps(st) + ';' + mock + '</script>') + '<body style="background:#1e1f22;padding:8px">' + body + '</html>'
                await pg.set_content(html); await pg.wait_for_timeout(300)
                await pg.screenshot(path=f'{OUT}/bar_{name}_{w}.png', full_page=True); await pg.close()
        await b.close()
asyncio.run(main())
