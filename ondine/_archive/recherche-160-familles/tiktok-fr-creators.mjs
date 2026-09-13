import puppeteer from "puppeteer-core";
import { writeFileSync, readFileSync, existsSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DIR = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const PROFILE = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad\\edge-profile-tiktok";
const AUTHORS_OUT = `${DIR}\\fr-authors.json`;
const CREATORS_OUT = `${DIR}\\fr-creators.json`;

// Tags chosen to bias hard toward French-language pet content
const TAGS = [
  "toilettagechien", "accessoirechien", "educationcanine", "chiot",
  "animauxdecompagnie", "proprietairedechien", "chienheureux", "croquettes",
  "harnaischien", "chatdemaison", "jouetpourchien", "dresseurcanin",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (s) => {
  if (!s) return null;
  const m = String(s).trim().replace(/,/g, ".").match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || "").toUpperCase()] || 1;
  return Math.round(parseFloat(m[1]) * mult);
};

async function harvestAuthors(page) {
  const authors = new Map();
  for (const tag of TAGS) {
    try {
      await page.goto(`https://www.tiktok.com/tag/${tag}`, { waitUntil: "domcontentloaded", timeout: 45000 });
    } catch (e) {
      console.log(`  #${tag} goto failed: ${e.message}`);
      continue;
    }
    await sleep(5000);
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 1500));
      await sleep(2200);
    }
    const found = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href*="/video/"]'))
        .map((a) => (a.href.match(/tiktok\.com\/@([^/]+)\/video\//) || [])[1])
        .filter(Boolean)
    );
    let added = 0;
    for (const h of found) {
      if (!authors.has(h)) { authors.set(h, { handle: h, tags: [tag] }); added++; }
      else if (!authors.get(h).tags.includes(tag)) authors.get(h).tags.push(tag);
    }
    console.log(`  #${tag}: ${found.length} refs, +${added} new authors (total ${authors.size})`);
    await sleep(2500);
  }
  return [...authors.values()];
}

async function profileCreator(page, handle) {
  const out = { handle, url: `https://www.tiktok.com/@${handle}`, ok: false };
  try {
    const resp = await page.goto(out.url, { waitUntil: "domcontentloaded", timeout: 40000 });
    out.status = resp ? resp.status() : null;
  } catch (e) {
    out.error = e.message;
    return out;
  }
  await sleep(4200);

  const data = await page.evaluate(() => {
    const g = (sel) => { const e = document.querySelector(sel); return e ? e.innerText.trim() : null; };
    const bodyTxt = document.body ? document.body.innerText : "";
    return {
      followers: g('[data-e2e="followers-count"]'),
      following: g('[data-e2e="following-count"]'),
      likes: g('[data-e2e="likes-count"]'),
      bio: g('[data-e2e="user-bio"]'),
      title: g('[data-e2e="user-title"]'),
      subtitle: g('[data-e2e="user-subtitle"]'),
      // shop / product showcase signals
      hasShopTab: /\bShop\b|Boutique/.test(bodyTxt) && !!document.querySelector('[data-e2e*="shop"], a[href*="/shop"]'),
      bioLink: (() => {
        const a = document.querySelector('[data-e2e="user-link"] a, [data-e2e="user-link"]');
        return a ? (a.href || a.innerText || "").trim() : null;
      })(),
    };
  });

  out.ok = true;
  out.followers = num(data.followers);
  out.followersRaw = data.followers;
  out.likes = num(data.likes);
  out.bio = data.bio;
  out.displayName = data.title || data.subtitle;
  out.bioLink = data.bioLink;
  out.hasShopSignal = data.hasShopTab;

  // crude French-language signal on bio + display name
  const blob = `${out.bio || ""} ${out.displayName || ""}`.toLowerCase();
  const frWords = ["chien", "chat", "chiot", "toilettage", "éduc", "educ", "France", "français", "animalerie",
    "dresseur", "croquette", "patte", "maître", "poilu", "boutique", "livraison", "conseils", "notre", "vos", "je "];
  out.frHits = frWords.filter((w) => blob.includes(w.toLowerCase()));
  out.frScore = out.frHits.length;

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
  if (existsSync(AUTHORS_OUT)) {
    authors = JSON.parse(readFileSync(AUTHORS_OUT, "utf8"));
    console.log(`reusing ${authors.length} harvested authors`);
  } else {
    console.log("STAGE 1: harvesting authors from French pet hashtags");
    authors = await harvestAuthors(page);
    writeFileSync(AUTHORS_OUT, JSON.stringify(authors, null, 2), "utf8");
    console.log(`harvested ${authors.length} unique authors -> ${AUTHORS_OUT}\n`);
  }

  console.log(`STAGE 2: profiling ${authors.length} creators`);
  const creators = [];
  for (let i = 0; i < authors.length; i++) {
    const a = authors[i];
    const c = await profileCreator(page, a.handle);
    c.tags = a.tags;
    creators.push(c);
    console.log(`  [${i + 1}/${authors.length}] @${a.handle} followers=${c.followersRaw ?? "?"} frScore=${c.frScore ?? "?"} shop=${c.hasShopSignal ?? "?"}`);
    if ((i + 1) % 10 === 0) writeFileSync(CREATORS_OUT, JSON.stringify(creators, null, 2), "utf8");
    await sleep(2600);
  }

  writeFileSync(CREATORS_OUT, JSON.stringify(creators, null, 2), "utf8");
  console.log(`\nwritten: ${CREATORS_OUT}`);
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
