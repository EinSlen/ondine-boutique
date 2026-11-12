// node monter-pub.mjs <spec.json> : burns TikTok-style captions (word by word pop, fixed top hook, end card) onto a 9:16 video with ffmpeg + libass, output 1080x1920 H.264 + AAC
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const dir = path.dirname(path.resolve(process.argv[2]));
const GOLD = '&H0062ADD8';

const ts = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = (s % 60).toFixed(2).padStart(5, '0');
  return `${h}:${String(m).padStart(2, '0')}:${sec}`;
};
const esc = (t) => t.replace(/\{/g, '(').replace(/\}/g, ')');
const paint = (t) => esc(t).replace(/\*([^*]+)\*/g, `{\\c${GOLD}&}$1{\\c&HFFFFFF&}`);

// Splits a caption into words, glues lone punctuation to the previous word and keeps the *gold* marking per word so a chunk boundary never leaves a stray asterisk
const tokenize = (text) => {
  const words = [];
  let gold = false;
  for (const raw of text.split(/[ \t\n]+/)) {
    const opens = raw.startsWith('*');
    const closes = raw.endsWith('*') && (raw.length > 1 || !opens);
    if (opens) gold = true;
    const word = raw.replace(/\*/g, '');
    if (/^[!?:;.…]+$/.test(word) && words.length) words[words.length - 1].word += ` ${word}`;
    else words.push({ word, gold });
    if (closes) gold = false;
  }
  return words;
};
const render = (list) => list.map(({ word, gold }) => (gold ? `*${word}*` : word)).join(' ');

const events = [];
for (const c of spec.captions || []) {
  const words = tokenize(c.text);
  const size = c.chunk || 2;
  const chunks = [];
  for (let i = 0; i < words.length; i += size) chunks.push(render(words.slice(i, i + size)));
  const step = (c.end - c.start) / chunks.length;
  chunks.forEach((chunk, i) => {
    const a = c.start + i * step;
    const b = i === chunks.length - 1 ? c.end : a + step;
    events.push(`Dialogue: 1,${ts(a)},${ts(b)},Cap,,0,0,0,,{\\fscx82\\fscy82\\t(0,90,\\fscx100\\fscy100)}${paint(chunk)}`);
  });
}
for (const h of spec.top || []) {
  events.push(`Dialogue: 2,${ts(h.start)},${ts(h.end)},Top,,0,0,0,,{\\fad(120,0)}${paint(h.text).replace(/\n/g, '\\N')}`);
}
for (const e of spec.end || []) {
  events.push(`Dialogue: 3,${ts(e.start)},${ts(e.end)},${e.style || 'End'},,0,0,0,,{\\fad(150,0)\\fscx90\\fscy90\\t(0,150,\\fscx100\\fscy100)}${paint(e.text).replace(/\n/g, '\\N')}`);
}

const ass = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Segoe UI Black,104,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,7,2,5,90,90,0,1
Style: Top,Segoe UI Black,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,6,2,8,110,110,300,1
Style: End,Segoe UI Black,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,7,2,2,90,90,640,1
Style: EndSmall,Segoe UI Black,66,${GOLD},${GOLD},&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,6,2,2,90,90,560,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events.join('\n')}
`;
const assFile = path.join(dir, `${spec.name}.ass`);
fs.writeFileSync(assFile, ass);

const out = path.join(dir, `${spec.name}.mp4`);
const vf = `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,ass=${path.basename(assFile)}`;
const trim = spec.trim ? ['-ss', String(spec.trim[0]), '-t', String(spec.trim[1])] : [];
execFileSync('ffmpeg', ['-v', 'error', '-y', ...trim, '-i', path.resolve(dir, spec.input), '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], { cwd: dir, stdio: 'inherit' });
console.log('pub', out);
