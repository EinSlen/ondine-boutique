import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from 'file:///C:/Users/Valentin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const source = await readFile(new URL('../sections/main-product.liquid', import.meta.url), 'utf8');
const script = source.match(/{% javascript %}([\s\S]*?){% endjavascript %}/)[1];
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
let mode = 'normal';
const markup = (selected = '101', available = true) => `<section data-sh-product data-section-id="main" data-product-url="/products/test" data-error="Option could not load"><div class="price">${selected === '101' ? '69' : '79'} EUR</div><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" alt="Image ${selected}"><select data-option-select data-option-position="1"><option value="101" ${selected === '101' ? 'selected' : ''}>S</option><option value="102" ${selected === '102' ? 'selected' : ''}>M</option><option value="103" ${selected === '103' ? 'selected' : ''}>L</option></select><form class="sh-product__form"><input type="hidden" name="id" data-variant-id value="${selected}" ${available ? '' : 'disabled'}><button type="submit" data-add-button ${available ? '' : 'disabled'}>Add</button><p data-option-status role="status"></p></form></section>`;
await page.route('http://theme.test/**', async route => {
  const url = new URL(route.request().url());
  if (!url.searchParams.has('section_id')) {
    await route.fulfill({ contentType: 'text/html', body: `<!doctype html><html><body>${markup()}<script>${script}</script></body></html>` });
    return;
  }
  const selected = url.searchParams.get('option_values');
  if (mode === 'failure') {
    await route.fulfill({ status: 500, contentType: 'text/plain', body: 'failure' });
    return;
  }
  if (mode === 'race' && selected === '102') await new Promise(resolve => setTimeout(resolve, 150));
  await route.fulfill({ contentType: 'text/html', body: markup(selected, selected !== '103') }).catch(() => {});
});
await page.goto('http://theme.test/products/test');
await page.selectOption('[data-option-select]', '102');
await page.waitForFunction(() => document.querySelector('[data-variant-id]').value === '102');
assert.equal(await page.locator('.price').textContent(), '79 EUR');
assert.equal(await page.locator('img').getAttribute('alt'), 'Image 102');
assert.equal(await page.locator('[data-add-button]').isDisabled(), false);
assert.match(page.url(), /option_values=102/);

await page.selectOption('[data-option-select]', '103');
await page.waitForFunction(() => document.querySelector('[data-variant-id]').value === '103');
assert.equal(await page.locator('[data-add-button]').isDisabled(), true);
assert.equal(await page.evaluate(() => { const form = document.querySelector('form'); const event = new Event('submit', { bubbles: true, cancelable: true }); form.dispatchEvent(event); return event.defaultPrevented; }), true);

mode = 'failure';
await page.selectOption('[data-option-select]', '102');
await page.waitForFunction(() => document.querySelector('[data-option-status]').textContent.length > 0);
assert.equal(await page.locator('[data-option-select]').inputValue(), '103');
assert.equal(await page.locator('[data-variant-id]').inputValue(), '103');
assert.equal(await page.locator('[data-add-button]').isDisabled(), true);

mode = 'normal';
await page.selectOption('[data-option-select]', '101');
await page.waitForFunction(() => document.querySelector('[data-variant-id]').value === '101');
mode = 'race';
await page.selectOption('[data-option-select]', '102');
assert.equal(await page.locator('[data-add-button]').isDisabled(), true);
await page.selectOption('[data-option-select]', '103');
await page.waitForFunction(() => document.querySelector('[data-variant-id]').value === '103');
await page.waitForTimeout(220);
assert.equal(await page.locator('[data-variant-id]').inputValue(), '103');
assert.equal(await page.locator('[data-add-button]').isDisabled(), true);
assert.deepEqual(errors, []);
await browser.close();
console.log(JSON.stringify({ success: true, checks: ['server-rendered variant changes price and image', 'unavailable variant rejects submit', 'network failure restores committed selection', 'pending requests disable checkout action', 'newer option selection wins against delayed requests', 'no browser JavaScript errors'], scope: 'Local browser fixtures using the theme JavaScript; no live Shopify checkout executed.' }, null, 2));
