const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../capsule-septembre');
const destination = path.join(__dirname, 'ruban-revision');
async function loaded(page) {
  await page.locator('img[src]').evaluateAll(images => images.forEach(i => i.loading = 'eager'));
  await page.waitForFunction(() => [...document.images].filter(i=>i.hasAttribute('src')).every(i => i.complete && i.naturalWidth > 0));
  await page.locator('img[src]').evaluateAll(images => Promise.all(images.map(i => i.decode())));
}
(async () => {
  await fs.mkdir(destination, { recursive:true });
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const report = {scope:'Local Ruban comparison and six-piece gallery only; no manufacturing validation',viewports:[],errors};
    for (const width of [1440,768,390,320]) {
      await page.setViewportSize({width,height:1000});
      await page.goto(pathToFileURL(path.join(root,'revision-ruban.html')).href);
      await loaded(page);
      const result = await page.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,images:[...document.images].map(i=>({url:i.src,width:i.naturalWidth}))}));
      assert.equal(result.images.length,2);
      assert.ok(result.scrollWidth <= width);
      report.viewports.push(result);
      if ([1440,390].includes(width)) await page.screenshot({path:path.join(destination,`revision-${width}.png`),fullPage:true});
    }
    const links = await page.locator('a[href]').evaluateAll(items => items.map(a=>a.href));
    for (const link of links.filter(x=>x.startsWith('file:'))) {
      const url = new URL(link); url.hash='';
      await fs.access(url);
    }
    await page.addStyleTag({content:'html{font-size:200%}'});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.goto(pathToFileURL(path.join(root,'index.html')).href);
    await loaded(page);
    assert.equal(await page.locator('.piece').count(),6);
    assert.ok((await page.locator('#piece-02 .open-image img').getAttribute('src')).endsWith('02-ruban-tee-v2.png'));
    await page.locator('#piece-02 .open-image').click();
    await page.waitForFunction(()=>document.querySelector('#viewer-image').complete && document.querySelector('#viewer-image').naturalWidth>0);
    assert.ok(await page.locator('#viewer').evaluate(d=>d.open));
    await page.keyboard.press('Escape');
    assert.ok(await page.locator('#piece-02 .open-image').evaluate(b=>document.activeElement===b));
    await page.getByRole('link',{name:'Ruban : avant / après'}).click();
    assert.ok(page.url().endsWith('revision-ruban.html'));
    assert.deepEqual(errors,[]);
    report.pass = true;
    await fs.writeFile(path.join(destination,'report.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
