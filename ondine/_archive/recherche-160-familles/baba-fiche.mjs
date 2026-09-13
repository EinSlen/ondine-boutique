/**
 * Opens Alibaba product pages and pulls what decides the purchase:
 * laser power and class, price tiers, MOQ, certifications, supplier age.
 *
 * The listing text is not enough. One card reads "certified" while advertising 40 mW,
 * which is Class 3B and illegal for consumer sale in the EU.
 */
import puppeteer from "puppeteer-core";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const HERE = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const PROFILE = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad\\edge-profile-baba";
const IN = process.argv[2] || "fiches-a-verifier.json";
const OUT = `${HERE}\\fiches-verifiees.json`;
const SHOTS = `${HERE}\\shots-fiche`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function dismiss(page) {
  await page.evaluate(() => {
    document.querySelectorAll("button, div[role=button], a").forEach((b) => {
      const t = (b.innerText || "").trim().toLowerCase();
      if (["accept all cookies", "accept all", "ok", "got it", "close", "allow all"].includes(t)) { try { b.click(); } catch { } }
    });
  }).catch(() => { });
}

async function readOne(page, item) {
  const rec = { ...item };
  try { const r = await page.goto(item.url, { waitUntil: "domcontentloaded", timeout: 60000 }); rec.status = r ? r.status() : null; }
  catch (e) { rec.error = e.message.slice(0, 120); return rec; }

  await sleep(4000);
  await dismiss(page);
  await sleep(1200);
  for (let i = 0; i < 3; i++) { await page.evaluate(() => window.scrollBy(0, 1200)); await sleep(1000); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(900);

  let txt = "";
  try { txt = await page.evaluate(() => (document.body ? document.body.innerText : "")); }
  catch (e) { rec.error = e.message.slice(0, 120); return rec; }

  if (/drag the slider|slide to verify|captcha/i.test(txt.slice(0, 300))) { rec.blocked = true; return rec; }

  const grab = (re) => { const m = txt.match(re); return m ? m[0].replace(/\s+/g, " ").trim().slice(0, 110) : null; };
  const all = (re) => [...new Set((txt.match(re) || []).map((s) => s.replace(/\s+/g, " ").trim()))].slice(0, 6);

  // Power is the deciding figure. Anything above 1 mW is not Class 2.
  const mw = [...txt.matchAll(/(\d+(?:[.,]\d+)?)\s*mW/gi)].map((m) => parseFloat(m[1].replace(",", ".")));
  const classMatch = txt.match(/class\s*(?:II|2|3R|3B|1M|1)\b/gi) || [];

  Object.assign(rec, {
    title: (await page.evaluate(() => { const h = document.querySelector("h1"); return h ? h.innerText.trim().slice(0, 140) : null; })) || item.title,
    powersMw: mw.filter((x) => x > 0 && x < 5000).slice(0, 6),
    maxMw: mw.length ? Math.max(...mw.filter((x) => x < 5000)) : null,
    classMentions: [...new Set(classMatch.map((s) => s.toLowerCase().replace(/\s+/g, " ")))].slice(0, 5),
    priceLine: grab(/€\s*[\d.,]+\s*-\s*€?\s*[\d.,]+/),
    moqLine: grab(/Min(?:imum)?\.?\s*order[^\n]{0,40}/i),
    certs: all(/\b(CE|RoHS|FCC|ISO ?9001|EN ?60825|UN38\.3|FDA)\b/g),
    supplierYears: grab(/\d+\s*(?:yrs|years)\b/i),
    reviews: grab(/[\d.]+\/5\.0|\d+ reviews?/i),
    accuracy: grab(/±?\s*\d+(?:[.,]\d+)?\s*mm\s*\/?\s*(?:at\s*)?\d+\s*m/i),
    wavelength: grab(/\d{3}\s*nm/),
  });

  rec.verdict = rec.maxMw == null ? "PUISSANCE NON INDIQUEE, ecarter"
    : rec.maxMw > 1 ? `REFUSE, ${rec.maxMw} mW, classe superieure a 2`
      : "puissance conforme classe 2";

  try { mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: `${SHOTS}\\${item.tag}.png` }); } catch { }
  return rec;
}

(async () => {
  const items = JSON.parse(readFileSync(`${HERE}\\${IN}`, "utf8"));
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    defaultViewport: { width: 1500, height: 1150 },
    args: ["--lang=en-US", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();

  const all = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
  const done = new Set(all.map((r) => r.tag));

  for (const it of items) {
    if (done.has(it.tag)) continue;
    const r = await readOne(page, it);
    all.push(r);
    console.log(`${it.tag.padEnd(12)} ${(r.maxMw != null ? r.maxMw + " mW" : "? mW").padStart(9)}`
      + `  ${(r.priceLine || "?").padEnd(22)} ${(r.certs || []).join(",").padEnd(22)} ${r.verdict || r.error || (r.blocked ? "BLOQUE" : "")}`);
    writeFileSync(OUT, JSON.stringify(all, null, 2), "utf8");
    await sleep(7000);
  }
  console.log(`\njson -> ${OUT}\ncaptures -> ${SHOTS}`);
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
