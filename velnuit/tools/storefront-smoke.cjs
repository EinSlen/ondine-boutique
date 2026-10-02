const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdir, writeFile } = require('node:fs/promises');

const origin = 'https://0rsiku-r1.myshopify.com';
const theme = '190185144648';
const reportDir = 'velnuit/browser-report';
const results = [];
const warnings = [];
function preview(path) {
  const url = new URL(path, origin);
  assert.equal(url.origin, origin);
  url.searchParams.set('preview_theme_id', theme);
  return url.href;
}
async function record(name, action) {
  await action();
  results.push({ name, passed: true });
  process.stdout.write('PASS ' + name + '\n');
}
(async () => {
  await mkdir(reportDir, { recursive: true });
  const browser = await chromium.launch();
  let activePage;
  try {
    for (const device of [
      { name: 'desktop', viewport: { width: 1440, height: 1000 } },
      { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
    ]) {
      const { name: deviceName, ...contextOptions } = device;
      const context = await browser.newContext({ ...contextOptions, locale: 'fr-FR' });
      const page = await context.newPage();
      activePage = page;
      page.on('pageerror', error => warnings.push({ device: device.name, message: error.message, stack: error.stack }));
      async function visit(path, status = 200) {
        const response = await page.goto(preview(path), { waitUntil: 'domcontentloaded', timeout: 60000 });
        assert.equal(response.status(), status, path + ': HTTP status');
        await page.locator('.vn-wordmark').waitFor();
        assert.equal((await page.locator('.vn-wordmark').textContent()).trim(), 'VELNUIT');
        await page.waitForFunction(() => !document.documentElement.classList.contains('no-js'));
      }
      const prefix = device.name + ': ';
      await record(prefix + 'home, title and eight concepts', async () => {
        await visit('/');
        assert.equal(await page.title(), 'VELNUIT · Chocolat & ciel');
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('.vn-concept').count(), 8);
        assert.equal(await page.locator('.vn-concept:not([hidden])').count(), 8);
        assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
        assert.equal(await page.locator('.vn-empty').count(), 0);
      });
      await record(prefix + 'campaign and supplier images load', async () => {
        const images = ['.vn-hero__image', '.vn-supplier-piece img', '.vn-concept__sprite img'];
        for (const selector of images) {
          const image = page.locator(selector).first();
          assert.ok(await image.count(), selector + ' exists');
          await image.scrollIntoViewIfNeeded();
          await page.waitForFunction(selector => {
            const element = document.querySelector(selector);
            return element && element.complete && element.naturalWidth > 0;
          }, selector, { timeout: 30000 });
        }
      });
      await record(prefix + 'filters and collection navigation', async () => {
        await page.locator('[data-vn-filter="femme"]').click();
        assert.equal(await page.locator('.vn-concept:not([hidden])').count(), 4);
        await page.locator('[data-vn-filter="homme"]').click();
        assert.equal(await page.locator('.vn-concept:not([hidden])').count(), 4);
        await page.locator('[data-vn-filter="all"]').click();
        assert.equal(await page.locator('.vn-concept:not([hidden])').count(), 8);
        if (device.isMobile) {
          await page.locator('[data-mobile-menu] summary').click();
          await page.locator('.vn-menu__panel > a').filter({ hasText: /^Femme$/ }).click();
        } else {
          await page.locator('.vn-nav a').filter({ hasText: /^Femme$/ }).click();
        }
        await page.waitForFunction(() => document.querySelectorAll('.vn-concept:not([hidden])').length === 4);
        assert.ok(page.url().endsWith('#capsule-femme'));
        if (device.isMobile) assert.equal(await page.locator('[data-mobile-menu]').getAttribute('open'), null);
      });
      await record(prefix + 'no horizontal overflow', async () => {
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
        await page.screenshot({ path: reportDir + '/' + device.name + '-home.png', fullPage: true });
      });
      for (const [handle, title] of [
        ['velnuit-a-propos', 'À propos de VELNUIT'],
        ['velnuit-guide-des-tailles', 'Guide des tailles VELNUIT'],
        ['velnuit-livraison', 'Livraison VELNUIT'],
        ['velnuit-faq', 'Questions fréquentes VELNUIT']
      ]) {
        await record(prefix + handle, async () => {
          await visit('/pages/' + handle);
          assert.equal((await page.locator('h1').textContent()).trim(), title);
          assert.ok((await page.locator('.sh-page .sh-rte').innerText()).length > 100);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
          assert.equal(await page.locator('.vn-footer nav a').filter({ hasText: /^Guide des tailles$/ }).count(), 1);
        });
      }
      await record(prefix + 'contact form fields', async () => {
        await visit('/pages/contact');
        for (const selector of ['input[name="contact[name]"]', 'input[name="contact[email]"]', 'textarea[name="contact[body]"]']) {
          assert.equal(await page.locator(selector).count(), 1);
          assert.equal(await page.locator(selector).getAttribute('required'), '');
        }
      });
      await record(prefix + 'empty cart and search', async () => {
        await visit('/cart');
        assert.ok((await page.locator('main').innerText()).includes('vide'));
        assert.equal(await page.locator('button[name="checkout"]:enabled').count(), 0);
        await visit('/search');
        assert.equal(await page.locator('input[name="q"]').count(), 1);
      });
      await record(prefix + 'draft product remains unavailable and 404 route works', async () => {
        await visit('/products/sweat-a-capuche-i-love-milfs', 404);
        assert.equal(await page.locator('[data-add-button]:enabled').count(), 0);
        await visit('/velnuit-route-inexistante-test', 404);
        assert.equal(await page.locator('h1').count(), 1);
      });
      await context.close();
    }
    assert.equal(warnings.filter(item => (item.stack || '').includes('velnuit.js')).length, 0, 'VELNUIT JavaScript errors');
    await writeFile(reportDir + '/results.json', JSON.stringify({ passed: true, tests: results, warnings, limits: 'Aucune commande ni soumission du formulaire. Produits en brouillon : variantes et paiement non testés.' }, null, 2));
  } catch (error) {
    if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: reportDir + '/failure.png', fullPage: true }).catch(() => {});
    await writeFile(reportDir + '/results.json', JSON.stringify({ passed: false, tests: results, warnings, error: error.stack }, null, 2));
    throw error;
  } finally {
    await browser.close();
  }
})().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
