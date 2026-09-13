/**
 * Deep read of one Alibaba listing: scroll the whole page and search the spec table for
 * the one figure that decides the purchase, the laser class or output power.
 *
 * The first pass only scrolled three screens. Alibaba puts the spec table far below the
 * fold, after the description images.
 */
import puppeteer from "puppeteer-core";
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const HERE = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const PROFILE = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad\\edge-profile-baba";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TARGETS = JSON.parse(readFileSync(`${HERE}\\fiches-a-verifier.json`, "utf8")).slice(0, 4);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    defaultViewport: { width: 1500, height: 1150 },
    args: ["--lang=en-US", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();
  const out = [];

  for (const t of TARGETS) {
    const rec = { tag: t.tag, url: t.url };
    try { await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 60000 }); }
    catch (e) { rec.error = e.message.slice(0, 100); out.push(rec); continue; }
    await sleep(4000);

    // Walk the entire page so lazy-loaded spec tables and description images render.
    for (let i = 0; i < 14; i++) {
      await page.evaluate(() => window.scrollBy(0, 1100));
      await sleep(700);
    }
    await sleep(1500);

    let txt = "";
    try { txt = await page.evaluate(() => (document.body ? document.body.innerText : "")); }
    catch (e) { rec.error = e.message.slice(0, 100); out.push(rec); continue; }

    if (/drag the slider|slide to verify/i.test(txt.slice(0, 300))) { rec.blocked = true; out.push(rec); continue; }

    rec.pageChars = txt.length;
    const mw = [...txt.matchAll(/(\d+(?:[.,]\d+)?)\s*mW/gi)].map((m) => parseFloat(m[1].replace(",", ".")));
    rec.powers = [...new Set(mw)].filter((x) => x > 0 && x < 5000);
    rec.classHits = [...new Set((txt.match(/class\s*(?:1M|3R|3B|II|IIIa|1|2|3|4)\b/gi) || []).map((s) => s.trim()))];
    rec.laserLines = (txt.split("\n").map((l) => l.trim())
      .filter((l) => /laser (class|power|output)|class\s*\d|mW|EN ?60825|wavelength|nm\b/i.test(l))
      .filter((l) => l.length < 120)).slice(0, 12);

    rec.verdict = rec.powers.length
      ? (Math.max(...rec.powers) <= 1 ? `CONFORME, ${Math.max(...rec.powers)} mW` : `REFUSE, ${Math.max(...rec.powers)} mW`)
      : rec.classHits.some((c) => /class\s*(2|II)$/i.test(c)) ? "classe 2 annoncee, puissance non chiffree"
        : "aucune donnee de puissance ni de classe";

    console.log(`${rec.tag}  ${String(rec.pageChars).padStart(6)} car.  puissances=[${rec.powers.join(", ")}]  classes=[${rec.classHits.join(", ")}]`);
    console.log(`      ${rec.verdict}`);
    for (const l of rec.laserLines.slice(0, 5)) console.log(`      | ${l}`);
    out.push(rec);
    await sleep(6000);
  }

  writeFileSync(`${HERE}\\specs-laser.json`, JSON.stringify(out, null, 2), "utf8");
  console.log(`\njson -> ${HERE}\\specs-laser.json`);
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
