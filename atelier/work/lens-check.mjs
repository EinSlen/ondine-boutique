import puppeteer from 'puppeteer-core';

const imageUrl = process.argv[2];
if (!imageUrl) throw new Error('URL image manquante');

const engine = process.argv[3] || 'google';
const target = engine === 'bing'
  ? `https://www.bing.com/images/searchbyimage/upload?cbir=sbi&imgurl=${encodeURIComponent(imageUrl)}&rdr=1`
  : `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`;
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-first-run', '--disable-features=Translate'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await new Promise((resolve) => setTimeout(resolve, 8_000));
  console.log(`URL: ${page.url()}`);
  console.log((await page.$eval('body', (element) => element.innerText)).slice(0, 20_000));
  const links = await page.$$eval('a[href]', (items) => items.map((item) => ({
    text: item.innerText.trim(),
    href: item.href,
  })).filter((item) => item.text || item.href));
  console.log(JSON.stringify(links.slice(0, 200), null, 2));
} finally {
  await browser.close();
}
