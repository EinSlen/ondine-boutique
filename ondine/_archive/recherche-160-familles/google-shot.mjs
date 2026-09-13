import puppeteer from "puppeteer-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DIR = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const PROFILE = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad\\edge-profile-goog";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    defaultViewport: { width: 1400, height: 1200 },
    args: ["--lang=fr-FR", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });

  const kw = process.argv[2] || "booster batterie voiture";
  const slug = kw.replace(/[^a-z0-9]+/gi, "-").slice(0, 40);
  await page.goto(`https://www.google.fr/search?q=${encodeURIComponent(kw)}&hl=fr&gl=fr`, { waitUntil: "domcontentloaded", timeout: 40000 });
  await sleep(3000);

  // dismiss consent if present
  for (const txt of ["Tout refuser", "Refuser tout", "Reject all"]) {
    const h = await page.evaluateHandle((t) => {
      const els = Array.from(document.querySelectorAll("button, div[role=button]"));
      return els.find((e) => (e.innerText || "").trim().toLowerCase() === t.toLowerCase()) || null;
    }, txt);
    const el = h.asElement();
    if (el) { await el.click(); await sleep(2500); break; }
  }

  await sleep(2000);
  await page.screenshot({ path: `${DIR}\\goog-${slug}-1.png`, fullPage: false });
  console.log("shot 1 done");

  await page.evaluate(() => window.scrollBy(0, 900));
  await sleep(1500);
  await page.screenshot({ path: `${DIR}\\goog-${slug}-2.png`, fullPage: false });
  console.log("shot 2 done");

  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
