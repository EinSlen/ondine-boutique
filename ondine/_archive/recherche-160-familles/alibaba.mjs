/**
 * Wholesale prices on Alibaba, to test the one hypothesis left standing: buying a batch
 * instead of dropshipping unit by unit. AliExpress sells at the maker's public price;
 * Alibaba sells at the trade price with a minimum order. If the ratio does not open up
 * here, the blocker is the model, not the purchasing channel.
 *
 * node alibaba.mjs [queriesFile] [tag] [usdToEur]
 */
import puppeteer from "puppeteer-core";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const HERE = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const PROFILE = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad\\edge-profile-baba";
const QF = process.argv[2] || "baba-queries.json";
const TAG = process.argv[3] || "baba";
const USD_EUR = parseFloat(process.argv[4] || "0.92");
const OUT = `${HERE}\\${TAG}.json`;
const SHOTS = `${HERE}\\shots-baba`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function dismiss(page) {
  await page.evaluate(() => {
    document.querySelectorAll("button, div[role=button], a").forEach((b) => {
      const t = (b.innerText || "").trim().toLowerCase();
      if (["accept all cookies", "accept all", "allow all", "ok", "got it", "close"].includes(t)) { try { b.click(); } catch { } }
    });
    document.querySelectorAll("[class*='close'],[aria-label='Close']").forEach((b) => { try { b.click(); } catch { } });
  }).catch(() => { });
}

/**
 * Cards read: title / "€44.59-56.83" / "Min. order: 1 piece  30 sold" / supplier / years.
 * The site serves EUR with a FR delivery target, so a US$-only regex matches nothing and
 * silently reports an empty market. Both currencies are accepted here.
 */
function parseCards(text) {
  const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(?:US\$|€)\s*([\d.,]+)(?:\s*-\s*(?:US\$|€)?\s*([\d.,]+))?$/i);
    if (!m) continue;
    const isEur = lines[i].includes("€");
    const num = (s) => parseFloat(s.replace(/,/g, ""));
    let lo = num(m[1]);
    let hi = m[2] ? num(m[2]) : lo;
    if (!(lo > 0) || lo > 5000) continue;
    if (isEur) { lo = lo / USD_EUR; hi = hi / USD_EUR; }   // normalise to USD, converted back below

    let moq = null, title = null, sold = null;
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      const q = lines[j].match(/Min(?:imum)?\.?\s*order:?\s*([\d,]+)\s*(pieces?|sets?|units?|bags?|boxes)/i);
      if (q) {
        moq = parseInt(q[1].replace(/,/g, ""), 10);
        const s = lines[j].match(/([\d,]+)\s*sold/i);
        if (s) sold = parseInt(s[1].replace(/,/g, ""), 10);
        break;
      }
    }
    for (let j = i - 1; j >= Math.max(0, i - 4); j--) {
      if (lines[j].length > 18 && !/^US\$/.test(lines[j]) && !/Min\.? order/i.test(lines[j])) { title = lines[j].slice(0, 120); break; }
    }
    out.push({ eurLow: +(lo * USD_EUR).toFixed(2), eurHigh: +(hi * USD_EUR).toFixed(2), moq, sold, title });
  }
  return out;
}

async function probe(page, q) {
  // Ready to Ship: fixed price, in stock, buy online without contacting anyone.
  const url = q.rts
    ? `https://www.alibaba.com/trade/search?tab=ready_to_ship&SearchText=${encodeURIComponent(q.kw)}`
    : `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(q.kw)}`;
  const rec = { ...q, url, items: [] };
  try { const r = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }); rec.status = r ? r.status() : null; }
  catch (e) { rec.error = e.message.slice(0, 130); return rec; }

  if (rec.status && rec.status >= 400) { rec.blocked = true; return rec; }

  await sleep(4500);
  await dismiss(page);
  await sleep(1500);
  for (let i = 0; i < 4; i++) { await page.evaluate(() => window.scrollBy(0, 1300)); await sleep(1200); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1000);

  let text = "";
  try { text = await page.evaluate(() => (document.body ? document.body.innerText : "")); }
  catch (e) { rec.error = e.message.slice(0, 120); return rec; }

  // "Verified Supplier" and "Verify now" live in the chrome of every page: a loose keyword
  // test flags a healthy page as blocked. Only a real challenge page has no results at all.
  const head = text.slice(0, 400);
  if (/slider|captcha|unusual traffic|are you a robot|security check/i.test(head)) {
    rec.blocked = true; rec.head = head; return rec;
  }

  rec.items = parseCards(text);
  // Supplier links live on the card; the text pass alone cannot give a contactable lead.
  try {
    rec.suppliers = await page.evaluate(() => {
      const out = [];
      const seen = new Set();
      for (const a of document.querySelectorAll("a[href*='/product-detail/'], a[href*='.alibaba.com']")) {
        const href = a.getAttribute("href") || "";
        if (!/product-detail|company_profile|\/company\//.test(href)) continue;
        const url = href.startsWith("//") ? "https:" + href : href;
        if (seen.has(url)) continue;
        seen.add(url);
        let card = a;
        for (let i = 0; i < 7 && card.parentElement; i++) {
          card = card.parentElement;
          if ((card.innerText || "").length > 80) break;
        }
        const t = (card.innerText || "").replace(/\s+/g, " ").slice(0, 260);
        out.push({ url: url.split("?")[0], text: t });
      }
      return out.slice(0, 40);
    });
  } catch { rec.suppliers = []; }
  rec.count = rec.items.length;
  try { mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: `${SHOTS}\\${q.tag}.png` }); } catch { }
  return rec;
}

const stats = (v) => {
  const s = v.filter((x) => x != null).sort((a, b) => a - b);
  if (!s.length) return null;
  const p = (q) => s[Math.min(s.length - 1, Math.floor(s.length * q))];
  return { n: s.length, min: s[0], p25: p(0.25), med: p(0.5) };
};

(async () => {
  const queries = JSON.parse(readFileSync(`${HERE}\\${QF}`, "utf8"));
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    defaultViewport: { width: 1500, height: 1150 },
    args: ["--lang=en-US", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();

  const all = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
  const done = new Set(all.map((r) => r.tag));

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    if (done.has(q.tag)) continue;
    const r = await probe(page, q);
    all.push(r);
    const s = stats(r.items.map((x) => x.eurLow));
    const moqs = r.items.map((x) => x.moq).filter(Boolean).sort((a, b) => a - b);
    console.log(`[${i + 1}/${queries.length}] ${q.tag.padEnd(20)} n=${String(r.count ?? 0).padStart(3)}`
      + ` gros p25=${s ? s.p25.toFixed(2).padStart(7) : "      ?"} med=${s ? s.med.toFixed(2).padStart(7) : "      ?"}`
      + ` MOQ median=${moqs.length ? moqs[Math.floor(moqs.length / 2)] : "?"}${r.blocked ? "  BLOQUE" : ""}${r.error ? "  " + r.error : ""}`);
    writeFileSync(OUT, JSON.stringify(all, null, 2), "utf8");
    await sleep(6000);
  }
  console.log(`\njson -> ${OUT}\ncaptures -> ${SHOTS}`);
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
