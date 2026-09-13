import puppeteer from "puppeteer-core";
import { writeFileSync, readFileSync, existsSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DIR = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const PROFILE = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad\\edge-profile-tiktok";
const AUTHORS = `${DIR}\\nail-authors.json`;
const OUT_JSON = `${DIR}\\nail-creators.json`;
const OUT_CSV = `${DIR}\\nail-creators.csv`;
const CAP = 130;

const TAGS = ["prothesisteongulaire", "ongles", "manucurefrance", "ongleenresine", "ponceuseongles",
  "nailartfrance", "prothesisteongulairefrance", "remplissageongles", "chablon", "gelx",
  "onglesgel", "nailtechfrance"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (s) => {
  if (!s) return null;
  const m = String(s).trim().replace(/\u00a0/g, "").replace(/,/g, ".").match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || "").toUpperCase()] || 1;
  return Math.round(parseFloat(m[1]) * mult);
};

const FR = ["ongle", "prothésiste", "prothesiste", "manucure", "pose", "résine", "resine", "chablon",
  "remplissage", "gel", "institut", "salon", "france", "français", "francais", "vos ", "nos ", "je ",
  "mon ", "ma ", "rdv", "réservation", "reservation", "domicile", "formation", "élève", "eleve",
  "beauté", "beaute", "ongulaire", "esthéticienne", "estheticienne", "prestation", "cliente"];

async function harvest(page) {
  const authors = new Map();
  for (const tag of TAGS) {
    try { await page.goto(`https://www.tiktok.com/tag/${tag}`, { waitUntil: "domcontentloaded", timeout: 45000 }); }
    catch (e) { console.log(`  #${tag} echec: ${e.message.slice(0, 60)}`); continue; }
    await sleep(5000);
    for (let i = 0; i < 3; i++) { await page.evaluate(() => window.scrollBy(0, 1500)); await sleep(2200); }
    const found = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href*="/video/"]'))
        .map((a) => (a.href.match(/tiktok\.com\/@([^/]+)\/video\//) || [])[1]).filter(Boolean));
    let added = 0;
    for (const h of found) {
      if (!authors.has(h)) { authors.set(h, { handle: h, tags: [tag] }); added++; }
      else if (!authors.get(h).tags.includes(tag)) authors.get(h).tags.push(tag);
    }
    console.log(`  #${tag}: ${found.length} refs, +${added} nouveaux (total ${authors.size})`);
    await sleep(2500);
  }
  return [...authors.values()];
}

async function profile(page, handle) {
  const out = { handle, url: `https://www.tiktok.com/@${handle}`, ok: false };
  try { const r = await page.goto(out.url, { waitUntil: "domcontentloaded", timeout: 35000 }); out.status = r ? r.status() : null; }
  catch (e) { out.error = e.message.slice(0, 100); return out; }
  await sleep(3800);
  const d = await page.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); return e ? e.innerText.trim() : null; };
    const body = document.body ? document.body.innerText : "";
    const link = document.querySelector('[data-e2e="user-link"] a, [data-e2e="user-link"]');
    return {
      followers: g('[data-e2e="followers-count"]'), likes: g('[data-e2e="likes-count"]'),
      bio: g('[data-e2e="user-bio"]'), name: g('[data-e2e="user-subtitle"]') || g('[data-e2e="user-title"]'),
      bioLink: link ? (link.href || link.innerText || "").trim() : null,
      shop: !!document.querySelector('[data-e2e="shop-tab"], a[href*="/shop"]') || /\bBoutique\b/.test(body),
      notFound: /Couldn't find this account|Impossible de trouver ce compte/i.test(body),
    };
  });
  if (d.notFound) { out.error = "compte introuvable"; return out; }
  out.ok = true;
  out.followers = num(d.followers); out.followersRaw = d.followers; out.likes = num(d.likes);
  out.bio = (d.bio || "").replace(/\s+/g, " ").trim();
  out.displayName = (d.name || "").replace(/\s+/g, " ").trim();
  out.bioLink = d.bioLink; out.shopSignal = d.shop;
  const blob = `${out.bio} ${out.displayName}`.toLowerCase();
  out.frHits = FR.filter((w) => blob.includes(w));
  out.frScore = out.frHits.length;
  out.eligible = out.followers != null && out.followers >= 1500;
  out.microTarget = out.followers != null && out.followers >= 1500 && out.followers <= 60000;
  return out;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    defaultViewport: { width: 1360, height: 900 },
    args: ["--lang=fr-FR", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });

  let authors;
  if (existsSync(AUTHORS)) { authors = JSON.parse(readFileSync(AUTHORS, "utf8")); console.log(`reprise: ${authors.length} comptes deja recoltes`); }
  else {
    console.log("ETAPE 1 : recolte sur les hashtags ongle francophones");
    authors = await harvest(page);
    writeFileSync(AUTHORS, JSON.stringify(authors, null, 2), "utf8");
    console.log(`recolte: ${authors.length} comptes uniques\n`);
  }

  const ranked = authors.map((a) => ({ ...a, tagCount: (a.tags || []).length }))
    .sort((x, y) => y.tagCount - x.tagCount).slice(0, CAP);
  console.log(`ETAPE 2 : profilage des ${ranked.length} plus pertinents`);

  const creators = [];
  for (let i = 0; i < ranked.length; i++) {
    const c = await profile(page, ranked[i].handle);
    c.tags = ranked[i].tags; c.tagCount = ranked[i].tagCount;
    creators.push(c);
    const flag = c.microTarget ? "CIBLE" : c.eligible ? "eligible" : c.ok ? "trop-petit" : "ERR";
    console.log(`  [${i + 1}/${ranked.length}] @${ranked[i].handle} ${c.followersRaw ?? "?"} fr=${c.frScore ?? "-"} shop=${c.shopSignal ? "OUI" : "non"} ${flag}`);
    if ((i + 1) % 10 === 0) writeFileSync(OUT_JSON, JSON.stringify(creators, null, 2), "utf8");
    await sleep(2000);
  }
  writeFileSync(OUT_JSON, JSON.stringify(creators, null, 2), "utf8");

  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [["handle", "followers", "likes", "frScore", "tagCount", "eligible", "microTarget", "shopSignal", "displayName", "bio", "bioLink"].join(",")];
  for (const c of creators.filter((c) => c.ok).sort((a, b) => b.frScore - a.frScore || b.followers - a.followers))
    rows.push([c.handle, c.followers, c.likes, c.frScore, c.tagCount, c.eligible, c.microTarget, c.shopSignal, c.displayName, c.bio, c.bioLink].map(esc).join(","));
  writeFileSync(OUT_CSV, rows.join("\n"), "utf8");

  const ok = creators.filter((c) => c.ok);
  console.log(`\n=== SYNTHESE ONGLE ===`);
  console.log(`profiles ok        : ${ok.length}/${creators.length}`);
  console.log(`eligibles (>=1500) : ${ok.filter((c) => c.eligible).length}`);
  console.log(`cibles micro       : ${ok.filter((c) => c.microTarget).length}`);
  console.log(`bio francophone    : ${ok.filter((c) => c.frScore >= 2).length}`);
  console.log(`signal boutique    : ${ok.filter((c) => c.shopSignal).length}`);
  console.log(`CIBLES FINALES (micro + fr>=2) : ${ok.filter((c) => c.microTarget && c.frScore >= 2).length}`);
  console.log(`csv -> ${OUT_CSV}`);
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
