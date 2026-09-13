const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL, fileURLToPath } = require('node:url');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const results = [];
const errors = [];
function check(name, fn) { return Promise.resolve().then(fn).then(() => results.push({ name, status: 'PASS' })); }
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    const url = pathToFileURL(path.join(root, 'index.html')).href;
    await page.goto(url);
    await page.evaluate(() => { localStorage.clear(); document.querySelectorAll('img').forEach(img => img.loading = 'eager'); });
    await page.reload();
    await page.evaluate(async () => { const images = [...document.images]; images.forEach(img => img.loading = 'eager'); await Promise.all(images.map(img => img.decode())); });
    await check('8 produits et une composition éditoriale', async () => { assert.equal(await page.locator('.product-card').count(), 8); assert.equal(await page.locator('.editorial-tile').count(), 1); });
    await check('11 images sources disponibles', async () => {
      const images = fs.readdirSync(path.join(root, 'assets')).filter(name => name.endsWith('.png'));
      assert.equal(images.length, 11);
      assert.equal(await page.evaluate(() => [...document.images].every(img => img.complete && img.naturalWidth > 0)), true);
    });
    await check('Aucun débordement horizontal desktop', async () => { assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true); });
    await page.screenshot({ path: path.join(__dirname, 'desktop.png'), fullPage: true });
    for (const category of ['tops', 'sweats', 'pants', 'accessories']) {
      await check(`Filtre ${category} : 2 pièces`, async () => { await page.locator(`[data-filter="${category}"]`).click(); assert.equal(await page.locator('.product-card').count(), 2); });
    }
    await page.locator('[data-filter="all"]').click();
    await check('Tri prix croissant', async () => { await page.selectOption('#catalog-sort', 'price-up'); const prices = await page.locator('.product-card .price').allTextContents(); const values = prices.map(v => Number(v.replace(/[^0-9]/g, ''))); assert.deepEqual(values, [...values].sort((a,b) => a-b)); });
    await page.selectOption('#catalog-sort', 'studio');
    await check('Recherche cerise ouvre Double Cherry', async () => { await page.locator('[data-open-search]').click(); await page.fill('#search-input', 'cerise'); assert.equal(await page.locator('.search-result').count(), 1); await page.locator('.search-result').click(); assert.equal(await page.locator('#product-title').textContent(), 'Double Cherry Tee'); assert.equal(await page.locator('#search-dialog').evaluate(el => el.open), false); });
    await check('Vues détail et silhouette, taille obligatoire', async () => { assert.equal(await page.locator('.add-to-bag').isDisabled(), true); await page.locator('[data-image-view="detail"]').click(); assert.equal(await page.locator('.detail-image-wrap').evaluate(el => el.classList.contains('is-detail')), true); await page.locator('[data-image-view="worn"]').click(); assert.match(await page.locator('#detail-image').getAttribute('src'), /look-cherry/); await page.locator('#size-options button').filter({ hasText: /^M$/ }).click(); assert.equal(await page.locator('.add-to-bag').isDisabled(), false); });
    await page.screenshot({ path: path.join(__dirname, 'product.png') });
    await check('Ajout, quantité et export de sélection', async () => {
      await page.locator('.add-to-bag').click(); assert.equal(await page.locator('.bag-count').textContent(), '1');
      await page.locator('[data-open-bag]').click(); await page.locator('[data-action="plus"]').click();
      assert.match(await page.locator('#bag-total').textContent(), /90/);
      const downloadPromise = page.waitForEvent('download'); await page.locator('#export-selection').click(); const download = await downloadPromise;
      const file = await download.path(); const text = fs.readFileSync(file, 'utf8'); assert.match(text, /Double Cherry Tee/); assert.match(text, /Ceci n’est pas une commande/); assert.match(text, /Qté 2/);
      await page.locator('[data-action="minus"]').click(); assert.match(await page.locator('#bag-total').textContent(), /45/);
      await page.locator('#bag-dialog [data-close-dialog]').click();
      await page.reload(); assert.equal(await page.locator('.bag-count').textContent(), '1');
      await page.locator('[data-open-bag]').click(); await page.locator('[data-action="remove"]').click(); assert.equal(await page.locator('#export-selection').isDisabled(), true); await page.locator('#bag-dialog [data-close-dialog]').click();
    });
    await check('Look Cherry affiche les trois pièces', async () => { await page.locator('.look-photo-link[data-look^="double-cherry"]').click(); assert.equal(await page.locator('.product-card').count(), 3); });
    await page.locator('[data-filter="all"]').click();
    await check('Accessoires sans fausse vue portée + navigation', async () => { await page.locator('.product-picture[data-product="half-loop-earrings"]').click(); assert.equal(await page.locator('[data-image-view="worn"]').isVisible(), false); await page.locator('[data-product-step="1"]').click(); assert.equal(await page.locator('#product-title').textContent(), 'Raw Hours Hoodie'); await page.keyboard.press('Escape'); });
    await check('Entrées locales invalides ignorées', async () => { await page.evaluate(() => localStorage.setItem('sour-hours-v4-selection', JSON.stringify([{id:'fake', size:'M', quantity:1},{id:'raw-hours-hoodie',size:'X',quantity:2},{id:'raw-hours-hoodie',size:'M',quantity:-1}]))); await page.reload(); assert.equal(await page.locator('.bag-count').textContent(), '0'); await page.evaluate(() => localStorage.clear()); });
    for (const width of [768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 }); await page.goto(url);
      await page.evaluate(async () => { const imgs = [...document.images]; imgs.forEach(img => img.loading='eager'); await Promise.all(imgs.map(img => img.decode())); });
      await check(`Aucun débordement horizontal ${width}px`, async () => { assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true); });
      if (width===768) await page.screenshot({path:path.join(__dirname,'tablet.png'),fullPage:true});
      if (width===390) {
        await page.screenshot({path:path.join(__dirname,'mobile-top.png')});
        await page.screenshot({ path:path.join(__dirname,'mobile.png'), fullPage:true });
        await page.locator('.product-picture[data-product="raw-hours-hoodie"]').click();
        await check('Contrôles de vue mobile ancrés à l’image', async () => { const image=await page.locator('.detail-image-wrap').boundingBox(); const controls=await page.locator('.detail-view-controls').boundingBox(); assert.ok(controls.y>=image.y && controls.y+controls.height<=image.y+image.height); });
        await page.screenshot({ path:path.join(__dirname,'mobile-product.png') });
        await page.keyboard.press('Escape');
      }
    }
    await page.setViewportSize({ width:1440, height:1050 }); await page.goto(pathToFileURL(path.join(root,'atelier.html')).href);
    await check('Atelier : huit briefs et calculateur', async () => { assert.equal(await page.locator('.atelier-product').count(),8); await page.fill('#cost-revenue','75'); await page.fill('#cost-product','30'); await page.fill('#cost-shipping','8'); await page.fill('#cost-other','12'); assert.match(await page.locator('#cost-result').textContent(), /25,00/); });
    await page.evaluate(async () => { const imgs=[...document.images]; imgs.forEach(img=>img.loading='eager'); await Promise.all(imgs.map(img=>img.decode())); });
    await page.evaluate(() => scrollTo(0,0));
    await page.screenshot({ path:path.join(__dirname,'atelier.png'), fullPage:true });
    await page.setViewportSize({width:390,height:844});
    await check('Atelier mobile sans débordement',async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true));
    await page.screenshot({path:path.join(__dirname,'atelier-mobile.png'),fullPage:true});
    await check('Liens locaux HTML et ressources disponibles', async () => { for(const file of ['index.html','atelier.html']) { await page.goto(pathToFileURL(path.join(root,file)).href); const links=await page.locator('[href],[src]').evaluateAll(els=>els.flatMap(el=>['href','src'].map(key=>el.getAttribute(key)).filter(Boolean))); for(const link of links) { if(/^(https?:|#|data:|blob:|mailto:)/.test(link))continue; const target=fileURLToPath(new URL(link, pathToFileURL(path.join(root,file)))); assert.equal(fs.existsSync(target), true, `${file}: ${link}`); } } });
    await check('Aucune erreur JavaScript', async () => assert.deepEqual(errors,[]));
  } catch(error) { results.push({name: 'Échec du contrôle', status:'FAIL', message:error.stack}); process.exitCode=1; }
  finally { await browser.close(); fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify({date:new Date().toISOString(),results,errors},null,2)); console.log(JSON.stringify(results,null,2)); }
})();
