/**
 * stills-to-video : transforme les photos produit du fournisseur en clips verticaux
 * prets pour Meta et TikTok. Aucun tournage, aucune IA, le vrai produit a l'ecran.
 *
 * Entree  : ./photos/*.jpg|png|webp   (photos fournisseur, propres et sans watermark)
 *           ./audio/*.mp3             (optionnel)
 * Sortie  : ./out-stills/s###__<accroche>.mp4  + manifest.json
 *
 * Methode : mouvement Ken Burns (zoompan) sur chaque photo, fondu enchaine entre les
 * plans, puis incrustation du texte francais. Le mouvement est ce qui distingue une
 * pub d'un diaporama : sans lui l'algorithme et l'oeil decrochent en 2 secondes.
 *
 * Usage :
 *   node stills-to-video.mjs --plan
 *   node stills-to-video.mjs --limit 5
 *   node stills-to-video.mjs
 */

import { readdirSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";

const run = promisify(execFile);
const DIR = process.cwd();
const PHOTOS = path.join(DIR, "photos");
const AUDIO = path.join(DIR, "audio");
const OUT = path.join(DIR, "out-stills");
const TMP = path.join(os.tmpdir(), `stills-${process.pid}`);

const W = 1080, H = 1920, FPS = 30;

// ---------------------------------------------------------------- police
const FONT_CANDIDATES = [
  "C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf",
  "C:/Windows/Fonts/calibrib.ttf", "C:/Windows/Fonts/verdanab.ttf",
  "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
];
const FONT = FONT_CANDIDATES.find((f) => existsSync(f)) || null;
const fontArg = FONT ? `fontfile='${FONT.replace(/^([A-Za-z]):/, "$1\\:")}'` : null;

// ---------------------------------------------------------------- copy
const HOOKS = [
  { slug: "boit-pas-assez", top: "Ton chat ne boit pas assez", bottom: "et tu ne le sais pas" },
  { slug: "veto", top: "Les problemes urinaires du chat", bottom: "coutent des centaines d'euros" },
  { slug: "eau-stagnante", top: "L'eau du bol stagne", bottom: "ton chat refuse d'y boire" },
  { slug: "instinct", top: "Un chat boit l'eau qui coule", bottom: "c'est un instinct" },
  { slug: "croquettes", top: "Ton chat mange des croquettes ?", bottom: "il boit deux fois trop peu" },
  { slug: "silencieux", top: "Pompe immergee", bottom: "on ne l'entend pas" },
  { slug: "filtre", top: "Filtre a charbon actif", bottom: "fini le gout d'eau croupie" },
  { slug: "3-pieces", top: "Trois pieces, zero outil", bottom: "un rincage par semaine" },
];

const CTAS = ["Lien en bio", "Dispo en bio", ""];

// ---------------------------------------------------------------- helpers
const esc = (t) => String(t)
  .replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\u2019").replace(/%/g, "\\%");

function drawtext({ text, y, size }) {
  if (!text) return null;
  const p = [];
  if (fontArg) p.push(fontArg);
  p.push(`text='${esc(text)}'`, `fontcolor=white`, `fontsize=${size}`,
    `x=(w-text_w)/2`, `y=${y}`, `box=1`, `boxcolor=black@0.55`, `boxborderw=24`);
  return `drawtext=${p.join(":")}`;
}

/** Ken Burns : un mouvement different par plan pour eviter l'effet diaporama. */
const MOVES = [
  { name: "zoom-in", z: `min(zoom+0.0012,1.35)`, x: `iw/2-(iw/zoom/2)`, y: `ih/2-(ih/zoom/2)` },
  { name: "zoom-out", z: `if(lte(zoom,1.0),1.35,max(1.001,zoom-0.0012))`, x: `iw/2-(iw/zoom/2)`, y: `ih/2-(ih/zoom/2)` },
  { name: "pan-droite", z: `1.25`, x: `(iw-iw/zoom)*(on/(${FPS}*4))`, y: `ih/2-(ih/zoom/2)` },
  { name: "pan-bas", z: `1.25`, x: `iw/2-(iw/zoom/2)`, y: `(ih-ih/zoom)*(on/(${FPS}*4))` },
];

/**
 * Encode une photo en segment video anime de `secs` secondes.
 *
 * Deux pieges ffmpeg evites ici, tous deux decouverts a l'usage :
 *  - le recadrage doit etre en mode "couverture" (force_original_aspect_ratio=increase),
 *    sinon une photo 3:4 mise a l'echelle sur la largeur est trop courte pour le cadre
 *    vertical et libx264 refuse la geometrie ;
 *  - il faut fournir UNE seule image. Avec -loop 1, zoompan produit `d` images pour
 *    chaque image entrante, et la duree explose (256 s au lieu de 3,2 s).
 */
function segArgs(photo, move, secs, outFile) {
  const frames = Math.round(secs * FPS);
  const vf = [
    // upscale genereux avant zoompan, sinon le zoom pixelise
    `scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase:flags=lanczos`,
    `crop=${W * 2}:${H * 2}`,
    `zoompan=z='${move.z}':x='${move.x}':y='${move.y}':d=${frames}:s=${W}x${H}:fps=${FPS}`,
  ].join(",");
  return ["-y", "-i", photo,
    "-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
    "-pix_fmt", "yuv420p", "-an", outFile];
}

/** Concatene les segments avec fondu enchaine, ajoute texte et audio. */
function joinArgs({ segs, hook, cta, audio, outFile, xfade = 0.4 }) {
  const args = ["-y"];
  for (const s of segs) args.push("-i", s);
  if (audio) args.push("-i", audio);

  const chain = [];
  let cur = "0:v";
  for (let i = 1; i < segs.length; i++) {
    const next = `x${i}`;
    // offset = cumul des durees precedentes moins les fondus deja consommes
    const offset = (SEG_SECS * i) - (xfade * i);
    chain.push(`[${cur}][${i}:v]xfade=transition=fade:duration=${xfade}:offset=${offset.toFixed(2)}[${next}]`);
    cur = next;
  }
  const texts = [
    drawtext({ text: hook.top, y: 190, size: 72 }),
    drawtext({ text: hook.bottom, y: 296, size: 56 }),
    cta ? drawtext({ text: cta, y: "h-320", size: 54 }) : null,
  ].filter(Boolean).join(",");
  chain.push(`[${cur}]${texts}[vout]`);

  args.push("-filter_complex", chain.join(";"), "-map", "[vout]");
  if (audio) args.push("-map", `${segs.length}:a:0`, "-shortest", "-af", "volume=0.7", "-c:a", "aac", "-b:a", "128k");
  args.push("-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
    "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart", outFile);
  return args;
}

const SEG_SECS = 3.2;          // duree par photo
const PHOTOS_PER_CLIP = 4;     // 4 photos => environ 11 s apres fondus

// ---------------------------------------------------------------- main
(async () => {
  const argv = process.argv.slice(2);
  const planOnly = argv.includes("--plan");
  const li = argv.indexOf("--limit");
  const limit = li >= 0 ? parseInt(argv[li + 1], 10) : Infinity;

  try { await run("ffmpeg", ["-version"]); }
  catch { console.error("ffmpeg introuvable dans le PATH."); process.exit(1); }
  if (!FONT) { console.error("Aucune police trouvee, complete FONT_CANDIDATES."); process.exit(1); }

  if (!existsSync(PHOTOS)) {
    console.error(`Dossier manquant : ${PHOTOS}
Depose-y les photos produit du fournisseur (jpg/png/webp), 5 a 10 suffisent.
Prends-les sur la fiche AliExpress du fournisseur : elles sont propres et sans watermark,
contrairement a ses videos.`);
    process.exit(1);
  }
  const photos = readdirSync(PHOTOS).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map((f) => path.join(PHOTOS, f)).sort();
  if (photos.length < 2) { console.error(`Il faut au moins 2 photos dans ${PHOTOS}.`); process.exit(1); }

  const beds = existsSync(AUDIO)
    ? readdirSync(AUDIO).filter((f) => /\.(mp3|m4a|aac|wav)$/i.test(f)).map((f) => path.join(AUDIO, f)) : [];

  // une variante par accroche, avec rotation des photos de depart pour varier le montage
  const variants = HOOKS.map((hook, i) => ({
    id: String(i + 1).padStart(3, "0"),
    hook,
    cta: CTAS[i % CTAS.length],
    audio: beds.length ? beds[i % beds.length] : null,
    photos: Array.from({ length: Math.min(PHOTOS_PER_CLIP, photos.length) },
      (_, k) => photos[(i + k) % photos.length]),
    outFile: path.join(OUT, `s${String(i + 1).padStart(3, "0")}__${hook.slug}.mp4`),
  }));

  console.log(`police        : ${FONT}`);
  console.log(`photos        : ${photos.length}`);
  console.log(`pistes audio  : ${beds.length}${beds.length ? "" : " (clips muets, tu ajoutes le son dans TikTok)"}`);
  console.log(`variantes     : ${variants.length}  (${PHOTOS_PER_CLIP} photos par clip, ~${Math.round(SEG_SECS * PHOTOS_PER_CLIP - 0.4 * (PHOTOS_PER_CLIP - 1))} s)`);

  if (planOnly) {
    console.log(`\n--- plan (rien n'est encode) ---`);
    for (const v of variants) console.log(`  ${v.id}  ${v.hook.slug.padEnd(16)} cta="${v.cta}"  ${v.photos.map((p) => path.basename(p)).join(" > ")}`);
    return;
  }

  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  mkdirSync(TMP, { recursive: true });

  let ok = 0, fail = 0;
  const manifest = [];
  for (const v of variants.slice(0, limit === Infinity ? undefined : limit)) {
    try {
      const segs = [];
      for (let k = 0; k < v.photos.length; k++) {
        const seg = path.join(TMP, `${v.id}-${k}.mp4`);
        await run("ffmpeg", segArgs(v.photos[k], MOVES[k % MOVES.length], SEG_SECS, seg), { maxBuffer: 1 << 26 });
        segs.push(seg);
      }
      await run("ffmpeg", joinArgs({ segs, hook: v.hook, cta: v.cta, audio: v.audio, outFile: v.outFile }), { maxBuffer: 1 << 26 });
      ok++;
      console.log(`  OK   ${path.basename(v.outFile)}`);
      manifest.push({ id: v.id, file: path.basename(v.outFile), hook: v.hook.slug,
        top: v.hook.top, bottom: v.hook.bottom, cta: v.cta,
        photos: v.photos.map((p) => path.basename(p)), audio: v.audio ? path.basename(v.audio) : null });
    } catch (e) {
      fail++;
      const tail = String(e.stderr || e.message).split("\n").filter(Boolean).slice(-3).join(" ");
      console.log(`  ECHEC ${path.basename(v.outFile)} :: ${tail.slice(0, 200)}`);
    }
  }

  writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  try { rmSync(TMP, { recursive: true, force: true }); } catch { }
  console.log(`\ntermine : ${ok} produites, ${fail} en echec -> ${OUT}`);
  console.log(`manifest.json note l'accroche et les photos de chaque clip, pour savoir ce qui marche.`);
})();
