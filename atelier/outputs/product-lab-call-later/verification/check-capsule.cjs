const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const destination = path.join(__dirname, 'capsule-septembre');
async function ready(page) {
  await page.locator('.piece').last().waitFor();
  await page.locator('.open-image img').evaluateAll(images => images.forEach(i => i.loading = 'eager'));
  await page.waitForFunction(() => [...document.querySelectorAll('.open-image img')].length === 6 && [...document.querySelectorAll('.open-image img')].every(i => i.complete && i.naturalWidth > 0));
  for (const image of await page.locator('.open-image img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(i => i.decode());
  }
  await page.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,0); });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
(async () => {
  await fs.mkdir(destination, { recursive:true });
  const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const report = { checkedAt:new Date().toISOString(),scope:'Local concept gallery; not Shopify or supplier validation',viewports:[],zooms:[],referenceImages:[],errors };
  for (const width of [1440,768,390,320]) {
    await page.setViewportSize({ width,height:1000 });
    await page.goto('http://127.0.0.1:8769/capsule-septembre/', { waitUntil:'load' });
    await ready(page);
    const result = await page.evaluate(() => ({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,pieces:document.querySelectorAll('.piece').length,images:[...document.querySelectorAll('.open-image img')].filter(i => i.naturalWidth > 0).length}));
    result.pass = result.documentWidth <= width && result.pieces === 6 && result.images === 6;
    report.viewports.push(result);
    if ([1440,390].includes(width)) await page.screenshot({path:path.join(destination,`gallery-${width}.png`),fullPage:true});
  }
  await page.setViewportSize({width:1440,height:1000});
  for (let i = 0; i < 6; i++) {
    const button = page.locator('.open-image').nth(i);
    await button.click();
    await page.waitForFunction(() => document.querySelector('#viewer-image').complete && document.querySelector('#viewer-image').naturalWidth > 0);
    const isOpen = await page.locator('#viewer').evaluate(d => d.open);
    await page.keyboard.press('Escape');
    const focusReturned = await button.evaluate(b => document.activeElement === b);
    report.zooms.push({piece:i+1,pass:isOpen && focusReturned});
  }
  await page.locator('.open-image').first().focus();
  await page.keyboard.press('Enter');
  report.keyboardOpen = await page.locator('#viewer').evaluate(d => d.open);
  await page.getByRole('button',{name:'Fermer le visuel'}).click();
  for (let i=0; i<6; i++) {
    await page.locator('summary').nth(i).click();
    if (i < 4) {
      const img = page.locator('.reference-photo img').nth(i);
      await img.scrollIntoViewIfNeeded();
      await page.waitForFunction(index => {const x = document.querySelectorAll('.reference-photo img')[index]; return x && x.complete;},i,{timeout:20000});
      report.referenceImages.push(await img.evaluate(x => ({url:x.src,loaded:x.naturalWidth > 0})));
    }
  }
  report.details = await page.locator('details[open]').count();
  await page.setViewportSize({width:390,height:1000});
  await page.addStyleTag({content:'html{font-size:200%}'});
  report.textEnlargement = await page.evaluate(() => ({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../capsule-septembre/index.html')).href);
  await ready(page);
  report.localFileWorks = await page.locator('.open-image img').count() === 6;
  report.pass = report.viewports.every(x=>x.pass) && report.zooms.every(x=>x.pass) && report.keyboardOpen && report.details === 6 && report.referenceImages.every(x=>x.loaded) && report.localFileWorks && report.textEnlargement.documentWidth <= report.textEnlargement.width && errors.length===0;
  await fs.writeFile(path.join(destination,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  await browser.close();
  if (!report.pass) process.exitCode = 1;
})().catch(e=>{console.error(e);process.exitCode=1});
