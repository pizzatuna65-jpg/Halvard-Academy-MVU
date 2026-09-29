# Batch 5.4 smoke test: opens every panel and clicks every tab for each sample state at desktop and mobile width; reports page errors.
# Run: python3 tests/preview/smoke_all_panels.py (edit ROOT/NM at the top if your paths differ).
import json, os, asyncio, glob
from playwright.async_api import async_playwright
import os as _os, tempfile as _tf
ROOT = _os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
NM = _os.environ.get('NM', _os.path.join(ROOT, 'node_modules'))
OUT = _os.path.join(_tf.gettempdir(), 'eldrasil_preview'); _os.makedirs(OUT, exist_ok=True)
ui=open(ROOT+'/src/scripts/ui.js').read(); lodash=open(NM+'/lodash/lodash.min.js').read()
MOCK="""window.H={}; window.eventOn=(e,f)=>{(H[e]=H[e]||[]).push(f)}; window.eventEmit=async(e,d)=>(H[e]||[]).forEach(f=>f(d));
window.getButtonEvent=n=>'btn:'+n; window.tavern_events={CHAT_CHANGED:'cc',MESSAGE_RECEIVED:'mr'};
window.waitGlobalInitialized=()=>new Promise(()=>{}); window.toastr={warning(){},success(){},error(){},info(){}};
window.$=f=>{ if(typeof f==='function') f(); return {on(){},val(){return this},trigger(){}} };
window.getLastMessageId=()=>0; window.getVariables=()=>({stat_data:window.STATE}); window.substitudeMacros=()=>'Aria Vale';"""
TARGETS=['profile','builder','people','people:bonds','people:connections','map','notebook:planner','notebook:journal','notebook:notices','notebook:letters','notebook:mystery','activities','battle','npc:Etnie','npc:Irene']
async def main():
    exe=(glob.glob('/opt/pw-browsers/chromium-*/chrome-linux/chrome') or [None])[0]
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=exe); total=0; fails=[]
        for sample in sorted(glob.glob(ROOT+'/tests/preview/sample_*.json')):
            S=json.load(open(sample))
            if 'World' not in S: continue
            for w in (900,390):
                pg=await b.new_page(viewport={'width':w,'height':900}); await pg.route('https://**', lambda r: r.fulfill(status=404))
                errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
                await pg.set_content('<html><body></body></html>')
                for c in (lodash,'window.STATE='+json.dumps(S)+';'+MOCK,ui): await pg.add_script_tag(content=c)
                for t in TARGETS:
                    await pg.evaluate(f"eventEmit('eldrasil:open','{t}')"); await pg.wait_for_timeout(60)
                    # click through every tab in the open panel
                    # click through every tab in the open panel (profile tabs, notebook tabs, activities tabs; v1.1.0 adds the last two)
                    n=await pg.evaluate("(()=>{const r=document.getElementById('eldrasil-ui-host').shadowRoot;let k=0;for(const sel of ['[data-tab]','[data-nb]','[data-actab]']){const ids=[...r.querySelectorAll(sel)].map(x=>[...x.attributes].find(a=>a.name.startsWith('data-')).value);for(const id of ids){const b=r.querySelector(sel.replace(']','=\"'+id+'\"]'));if(b){b.click();k++;}}}return k})()")
                    total+=1+n
                if errs: fails.append((os.path.basename(sample),w,errs[:2]))
                await pg.close()
        await b.close(); print('views opened:',total,'| errors:',fails or 'none')
asyncio.run(main())
