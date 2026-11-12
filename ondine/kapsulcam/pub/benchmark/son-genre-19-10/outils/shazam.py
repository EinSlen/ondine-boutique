import asyncio, json, os, subprocess, sys
from shazamio import Shazam

AUDIO, OUT = sys.argv[1], sys.argv[2]


def duration(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True)
    return float(r.stdout.strip())


async def main():
    sh = Shazam()
    res = {}
    tmp = os.path.join(os.path.dirname(OUT), '_seg.wav')
    for f in sorted(os.listdir(AUDIO)):
        p = os.path.join(AUDIO, f)
        d = duration(p)
        hits = []
        for start in sorted({0.0, max(0.0, d / 2 - 6), max(0.0, d - 13)}):
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-t', '12', '-i', p, tmp], check=True)
            try:
                r = await sh.recognize(tmp)
            except Exception as e:
                hits.append({'at': start, 'err': str(e)[:120]})
                continue
            t = r.get('track')
            if t:
                genre = (t.get('genres') or {}).get('primary')
                hits.append({'at': round(start, 1), 'title': t.get('title'), 'artist': t.get('subtitle'), 'genre': genre, 'url': t.get('url')})
            else:
                hits.append({'at': round(start, 1), 'title': None})
            await asyncio.sleep(1.5)
        res[f[:-4]] = hits
        print(f[:-4], [h.get('title') for h in hits], flush=True)
    json.dump(res, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


asyncio.run(main())
