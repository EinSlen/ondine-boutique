// node texte-insta.mjs <out.png> <line1> [line2] : renders an Instagram-style overlay (white semibold text, soft shadow, color emoji) as a transparent 1080x1920 PNG with headless Edge
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [out, ...lines] = process.argv.slice(2);
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; width: 1080px; height: 1920px; background: transparent; }
  .box { position: absolute; left: 50px; right: 50px; top: 330px; text-align: center; }
  p { margin: 0 0 6px; font: 600 ${process.env.PC_SIZE || 54}px/1.22 "Segoe UI Semibold", "Segoe UI", "Segoe UI Emoji", sans-serif; color: #fff;
      text-shadow: 0 2px 8px rgba(0,0,0,.85), 0 0 3px rgba(0,0,0,1), 0 0 22px rgba(0,0,0,.5); }
</style></head><body><div class="box">${lines.map((l) => `<p>${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`).join('')}</div></body></html>`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'texte-insta-'));
const file = path.join(tmp, 'texte.html');
fs.writeFileSync(file, html);
execFileSync(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--default-background-color=00000000', '--window-size=1080,1920', `--screenshot=${path.resolve(out)}`, `file:///${file.replace(/\\/g, '/')}`], { stdio: 'ignore' });
console.log('texte', path.resolve(out));
