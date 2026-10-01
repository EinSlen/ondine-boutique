from pathlib import Path
import re,json,shutil
base=Path(__file__).resolve().parent.parent
root=base/'shopify-theme'
builder=base/'editorial-v2/build.py'

def revise(s):
    s=s.replace('<span aria-hidden="true">✧</span>', '<span aria-hidden="true">/</span>',1)
    s=s.replace('<span aria-hidden="true">✧</span>', '')
    s=s.replace('<span aria-hidden="true">♡</span>','')
    s=s.replace('<i>✧</i>','')
    s=s.replace('<span class="ed-story-star">✧</span>','')
    s=s.replace(' <span aria-hidden="true">↗</span>','')
    s=s.replace(' ↗','').replace(' ↓','').replace(' ↑','')
    s=s.replace('M20.8 4.6a5.6 5.6 0 0 0-7.9 0L12 5.5l-.9-.9a5.6 5.6 0 0 0-7.9 7.9L12 21l8.8-8.5a5.6 5.6 0 0 0 0-7.9Z','M6 3h12v18l-6-4-6 4V3Z')
    s=s.replace('.ed-saved-link>span:first-child{font-size:25px}','')
    s=s.replace('.ed-save-word{display:none}', '.ed-save-word{display:inline;font-size:10px}')
    s=s.replace(".ed-hero-foot a{font-size:0}.ed-hero-foot a:after{content:'↓';font-size:19px}",'.ed-hero-foot a{font-size:9px}')
    s=s.replace('object-position:center 45%','object-position:center top')
    s=s.replace('.ed-hero{height:calc(88svh - 100px);min-height:540px;max-height:750px;align-items:flex-end}.ed-hero-image{object-position:58% center}.ed-hero-shade{background:linear-gradient(0deg,#21150def 0%,#21150d65 60%,#21150d0d)}.ed-hero-content{padding:40px 7vw 95px}', '.ed-hero{display:block;height:auto;min-height:0;max-height:none}.ed-hero-image{position:relative;inset:auto;display:block;height:420px;object-position:82% top}.ed-hero-shade{display:none}.ed-hero-content{padding:32px 7vw 28px}.ed-hero-foot{position:static;padding:0 7vw 25px;gap:20px}')
    s=s.replace(".ed-ribbon span:nth-last-child(-n+3),.ed-ribbon i:nth-last-child(-n+3){display:none}",".ed-ribbon span:nth-child(n+3){display:none}")
    s=s.replace('capsule-editorial-hero-v2.png','capsule-campagne-portee-v3.png').replace('capsule-editorial-pieces-v2.png','capsule-modeles-portes-v3.png')
    return s

builder.write_text(revise(builder.read_text()))
section=root/'sections/capsule-home.liquid'
section.write_text(revise(section.read_text()))
for name in ('index.json','index.capsule.json'):
    p=root/'templates'/name
    p.write_text(revise(p.read_text()))

assets=Path(__file__).parent/'assets'
assets.mkdir(exist_ok=True)
scratch=Path('/workspace/scratch/fa3e8bd23a10/generated_images')
shutil.copy2(scratch/'exec-4027b8e4-9cc9-4e19-b8b8-51bfaadf1441.png',assets/'modeles-portes.png')
shutil.copy2(scratch/'exec-9d91fe5a-b23f-447d-86b4-f52b3f3b7e81.png',assets/'campagne-portee.png')
assert not any(c in section.read_text() for c in ['✧','♡','↗','↓','↑'])
print('Portraits de collection intégrés ; symboles décoratifs retirés.')
