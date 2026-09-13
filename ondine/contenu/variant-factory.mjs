/**
 * variant-factory: turns a handful of source clips into dozens of TikTok-ready variants.
 *
 * Input : ./clips/*.mp4      (purchased or supplier footage, no speech needed)
 *         ./audio/*.mp3      (optional beds; omit to keep source audio)
 * Output: ./out/v###__<hook-slug>.mp4   1080x1920, H.264, burned-in French text
 *
 * Usage:
 *   node variant-factory.mjs --plan          list what would be built, build nothing
 *   node variant-factory.mjs --limit 20      build the first 20 variants
 *   node variant-factory.mjs                 build everything
 */

import { readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);
const DIR = process.cwd();
const CLIPS = path.join(DIR, "clips");
const AUDIO = path.join(DIR, "audio");
const OUT = path.join(DIR, "out");

// ---------------------------------------------------------------- copy bank
// Hooks are the single highest-leverage variable: they own the first 2 seconds.
// Angles are deliberately different in KIND, not just wording, so the test is informative.
const HOOKS = [
  { slug: "boit-pas-assez", top: "Ton chat ne boit pas assez", bottom: "et tu ne le sais pas" },
  { slug: "veto-800", top: "800 € de vétérinaire", bottom: "pour un problème urinaire évitable" },
  { slug: "eau-stagnante", top: "L'eau du bol stagne", bottom: "les chats refusent d'y boire" },
  { slug: "instinct", top: "Les chats boivent l'eau qui coule", bottom: "c'est un instinct, pas un caprice" },
  { slug: "avant-apres", top: "Avant : il ignorait son eau", bottom: "Après : il boit 3x plus" },
  { slug: "signe-alerte", top: "Si ton chat fait ça", bottom: "il est déshydraté" },
  { slug: "3-semaines", top: "3 semaines avec une fontaine", bottom: "voilà ce qui a changé" },
  { slug: "erreur", top: "L'erreur que font 90% des maîtres", bottom: "un bol d'eau posé par terre" },
  { slug: "silencieux", top: "J'avais peur du bruit", bottom: "on ne l'entend pas" },
  { slug: "croquettes", top: "Ton chat mange des croquettes ?", bottom: "alors il boit trop peu" },
];

const CTAS = [
  "Lien en bio",
  "Dispo en bio",
  "Je mets le lien en bio",
  "", // no CTA: control cell, some algos favour it
];

// ---------------------------------------------------------------- fonts
// On Windows ffmpeg has no fontconfig, so drawtext needs an explicit fontfile.
const FONT_CANDIDATES = [
  "C:/Windows/Fonts/segoeuib.ttf",
  "C:/Windows/Fonts/arialbd.ttf",
  "C:/Windows/Fonts/calibrib.ttf",
  "C:/Windows/Fonts/verdanab.ttf",
  "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
];
const FONT = FONT_CANDIDATES.find((f) => existsSync(f)) || null;

/** ffmpeg filter syntax needs the drive colon escaped: C\:/Windows/... */
const fontArg = FONT ? `fontfile='${FONT.replace(/^([A-Za-z]):/, "$1\\:")}'` : null;

// ---------------------------------------------------------------- ffmpeg helpers
function esc(t) {
  // drawtext is picky: escape colons, quotes, backslashes, percent
  return String(t)
    .replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\u2019").replace(/%/g, "\\%");
}

function drawtext({ text, y, size, box = true }) {
  if (!text) return null;
  const parts = [];
  if (fontArg) parts.push(fontArg);
  parts.push(
    `text='${esc(text)}'`,
    `fontcolor=white`,
    `fontsize=${size}`,
    `x=(w-text_w)/2`,
    `y=${y}`,
    `line_spacing=10`,
  );
  if (box) parts.push(`box=1`, `boxcolor=black@0.55`, `boxborderw=26`);
  return `drawtext=${parts.join(":")}`;
}

/** Build one variant. Returns the ffmpeg args. */
function buildArgs({ clip, audio, hook, cta, speed, startAt, dur, outFile }) {
  const vf = [
    // trim happens via -ss/-t on input; here we normalise to 1080x1920
    `scale=1080:-2`,
    `crop=1080:1920:0:(ih-1920)/2`,
    speed !== 1 ? `setpts=${(1 / speed).toFixed(4)}*PTS` : null,
    drawtext({ text: hook.top, y: 190, size: 74 }),
    drawtext({ text: hook.bottom, y: 300, size: 58 }),
    cta ? drawtext({ text: cta, y: "h-320", size: 56 }) : null,
  ].filter(Boolean).join(",");

  const args = ["-y", "-ss", String(startAt), "-t", String(dur), "-i", clip];
  if (audio) args.push("-i", audio);

  args.push("-vf", vf);
  if (audio) {
    args.push("-map", "0:v:0", "-map", "1:a:0", "-shortest",
      "-af", `atempo=1.0,volume=0.7`);
  } else {
    args.push("-map", "0:v:0", "-map", "0:a?");
    if (speed !== 1) args.push("-af", `atempo=${Math.min(2, Math.max(0.5, speed)).toFixed(3)}`);
  }
  args.push(
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
    "-pix_fmt", "yuv420p", "-r", "30",
    "-c:a", "aac", "-b:a", "128k",
    "-movflags", "+faststart",
    outFile
  );
  return args;
}

// ---------------------------------------------------------------- plan
function plan() {
  if (!existsSync(CLIPS)) return { error: `dossier manquant : ${CLIPS}` };
  const clips = readdirSync(CLIPS).filter((f) => /\.(mp4|mov|m4v|webm)$/i.test(f)).map((f) => path.join(CLIPS, f));
  const beds = existsSync(AUDIO) ? readdirSync(AUDIO).filter((f) => /\.(mp3|m4a|aac|wav)$/i.test(f)).map((f) => path.join(AUDIO, f)) : [];
  if (!clips.length) return { error: `aucun clip dans ${CLIPS}` };

  const SPEEDS = [1, 1.15];
  const LENGTHS = [
    { startAt: 0, dur: 9 },
    { startAt: 0.6, dur: 14 },
    { startAt: 1.2, dur: 21 },
  ];

  const variants = [];
  let n = 0;
  for (const hook of HOOKS) {
    for (const len of LENGTHS) {
      // rotate clip / cta / speed / bed so every cell differs on one axis at a time
      const clip = clips[n % clips.length];
      const cta = CTAS[n % CTAS.length];
      const speed = SPEEDS[n % SPEEDS.length];
      const audio = beds.length ? beds[n % beds.length] : null;
      n++;
      variants.push({
        id: String(n).padStart(3, "0"),
        clip, audio, hook, cta, speed,
        startAt: len.startAt, dur: len.dur,
        outFile: path.join(OUT, `v${String(n).padStart(3, "0")}__${hook.slug}__${len.dur}s.mp4`),
      });
    }
  }
  return { clips, beds, variants };
}

// ---------------------------------------------------------------- main
(async () => {
  const argv = process.argv.slice(2);
  const planOnly = argv.includes("--plan");
  const limIdx = argv.indexOf("--limit");
  const limit = limIdx >= 0 ? parseInt(argv[limIdx + 1], 10) : Infinity;

  try { await run("ffmpeg", ["-version"]); }
  catch { console.error("ffmpeg introuvable dans le PATH. Installe-le puis relance."); process.exit(1); }

  if (!FONT) {
    console.error("Aucune police trouvee. Ajoute un chemin .ttf dans FONT_CANDIDATES.");
    process.exit(1);
  }
  console.log(`police        : ${FONT}`);

  const p = plan();
  if (p.error) { console.error(p.error); process.exit(1); }

  console.log(`clips sources : ${p.clips.length}`);
  console.log(`pistes audio  : ${p.beds.length} ${p.beds.length ? "" : "(aucune, l'audio source est conserve)"}`);
  console.log(`variantes     : ${p.variants.length}  (${HOOKS.length} accroches x 3 durees)`);

  const manifest = p.variants.map((v) => ({
    id: v.id, file: path.basename(v.outFile), hook: v.hook.slug,
    top: v.hook.top, bottom: v.hook.bottom, cta: v.cta,
    clip: path.basename(v.clip), audio: v.audio ? path.basename(v.audio) : null,
    speed: v.speed, dur: v.dur,
  }));

  if (planOnly) {
    console.log("\n--- plan (rien n'est encode) ---");
    for (const m of manifest.slice(0, 12)) console.log(`  ${m.id}  ${m.dur}s  ${m.hook.padEnd(16)} cta="${m.cta}"  <- ${m.clip}`);
    if (manifest.length > 12) console.log(`  ... et ${manifest.length - 12} autres`);
    return;
  }

  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  let ok = 0, fail = 0;
  const todo = p.variants.slice(0, limit === Infinity ? undefined : limit);
  for (const v of todo) {
    try {
      await run("ffmpeg", buildArgs(v), { maxBuffer: 1 << 26 });
      ok++;
      console.log(`  OK   ${path.basename(v.outFile)}`);
    } catch (e) {
      fail++;
      console.log(`  ECHEC ${path.basename(v.outFile)} :: ${String(e.stderr || e.message).split("\n").slice(-3).join(" ").slice(0, 160)}`);
    }
  }
  console.log(`\ntermine : ${ok} produites, ${fail} en echec -> ${OUT}`);
  console.log(`manifest.json contient l'accroche et le clip source de chaque variante, pour savoir quoi a marche.`);
})();
