#!/usr/bin/env python3
"""Batch 1.3 — portraits -> WebP (full + square thumb) with face focus point; map -> WebP; card avatar.
Input: images dir (from images.zip/character). Output: assets_hosting/ + data/assets_manifest.json + src/card/avatar.png"""
import json, os, re, sys, cv2
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
if len(sys.argv) < 2: sys.exit('usage: python3 tools/process_assets.py <folder with the original NPC portrait PNGs>')
SRC = sys.argv[1]
npc = json.load(open(P('source_original/eldrasil_v38_NPC_Detailed.json'), encoding='utf-8'))
names = {e['uid']: e['comment'].replace('NPC — ', '').strip() for e in npc['entries'].values() if e['comment'].startswith('NPC')}
norm = lambda s: re.sub(r'[^a-z]', '', s.lower())
files = [f for f in os.listdir(SRC) if f.lower().endswith('.png') and 'map' not in f.lower()]
cascade = cv2.CascadeClassifier(P('tools/animeface.xml'))
TOVR = json.load(open(P('data/thumb_overrides.json'))) if os.path.exists(P('data/thumb_overrides.json')) else {}
OVR = json.load(open(P('data/focus_overrides.json'))) if os.path.exists(P('data/focus_overrides.json')) else {}
for d in ('portraits', 'thumbs', 'map'): os.makedirs(P('assets_hosting', d), exist_ok=True)
manifest = {'base_url': 'https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/', 'npcs': {}, 'map': 'map/halvard_map.webp', 'map_size': [1536, 1024]}
first_names = [n.split()[0] for n in names.values()]
assert len(first_names) == len(set(first_names)), 'first names not unique'
for uid, name in sorted(names.items()):
    nid = name.split()[0]
    f = [x for x in files if all(norm(p) in norm(x) for p in name.split())]
    assert len(f) == 1, (name, f)
    im = Image.open(os.path.join(SRC, f[0])).convert('RGB')
    W, H = im.size
    gray = cv2.cvtColor(cv2.imread(os.path.join(SRC, f[0])), cv2.COLOR_BGR2GRAY); gray = cv2.equalizeHist(gray)
    faces = cascade.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=4, minSize=(int(W*0.08), int(W*0.08)))
    if nid in OVR:
        fx, fy, fs, how = OVR[nid][0], OVR[nid][1], OVR[nid][2], 'manual'
    elif len(faces):
        x, y, w, h = max(faces, key=lambda r: r[2]*r[3])
        fx, fy, fs, how = (x + w/2)/W, (y + h/2)/H, w/W, 'detected'
    else:
        fx, fy, fs, how = 0.5, 0.22, 0.28, 'default'
    full = im.resize((600, round(600*H/W)), Image.LANCZOS)
    full.save(P('assets_hosting/portraits', f'{nid.lower()}.webp'), 'WEBP', quality=82, method=6)
    side = max(int(W*fs*2.1), int(W*0.35)); side = min(side, W)
    cx, cy = fx*W, fy*H
    l = int(min(max(cx - side/2, 0), W - side)); t = int(min(max(cy - side*0.45, 0), H - side))
    if nid in TOVR:
        tx, ty, ts = TOVR[nid]; side = int(ts*W); cx, cy = tx*W, ty*H
        l = int(min(max(cx - side/2, 0), W - side)); t = int(min(max(cy - side/2, 0), H - side))
    im.crop((l, t, l+side, t+side)).resize((192, 192), Image.LANCZOS).save(P('assets_hosting/thumbs', f'{nid.lower()}.webp'), 'WEBP', quality=85, method=6)
    manifest['npcs'][nid] = {'uid': uid, 'name': name, 'portrait': f'portraits/{nid.lower()}.webp', 'thumb': f'thumbs/{nid.lower()}.webp',
                             'focus': [round(fx*100, 1), round(fy*100, 1)], 'focus_source': how, 'source_file': f[0]}
mp = [x for x in os.listdir(SRC) if 'map' in x.lower()][0]
m = Image.open(os.path.join(SRC, mp)).convert('RGB'); manifest['map_size'] = list(m.size)
m.save(P('assets_hosting/map/halvard_map.webp'), 'WEBP', quality=84, method=6)
# card avatar: 2:3 crop centred on the castle / courtyard
W, H = m.size; cw = int(H*2/3); l = int(0.42*W - cw/2)
m.crop((l, 0, l+cw, H)).resize((512, 768), Image.LANCZOS).save(P('src/card/avatar.png'), 'PNG', optimize=True)
json.dump(manifest, open(P('data/assets_manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
print(Counter(v['focus_source'] for v in manifest['npcs'].values()), [k for k, v in manifest['npcs'].items() if v['focus_source'] != 'detected'])
