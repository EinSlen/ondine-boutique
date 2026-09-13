const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
let browser;
(async()=>{
 const root=path.resolve(__dirname,'..');
 const report={checkedAt:new Date().toISOString(),errors:[],tests:[],viewports:[],localLinks:[]};
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(pathToFileURL(path.join(root,'index.html')).href);
 await page.locator('img[loading=lazy]').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
 await page.waitForFunction(()=>[...document.querySelectorAll('img[src]')].every(i=>i.complete&&i.naturalWidth>0));
 for(const key of ['back','worn','art']){
  await page.locator(`[data-view="${key}"]`).click();
  await page.waitForFunction(()=>document.getElementById('main-image').complete&&document.getElementById('main-image').naturalWidth>0);
  report.tests.push({name:'view-'+key,passed:await page.locator(`[data-view="${key}"]`).getAttribute('aria-pressed')==='true'});
 }
 await page.locator('#zoom').click();
 report.tests.push({name:'zoom-opens',passed:await page.locator('dialog').evaluate(d=>d.open)});
 await page.keyboard.press('Escape');
 report.tests.push({name:'escape-closes',passed:await page.locator('dialog').evaluate(d=>!d.open)});
 await page.locator('#zoom').click();
 await page.locator('#close-dialog').click();
 report.tests.push({name:'button-closes',passed:await page.locator('dialog').evaluate(d=>!d.open)});
 await page.locator('#see-worn').click();
 report.tests.push({name:'worn-cta',passed:await page.locator('[data-view=worn]').getAttribute('aria-pressed')==='true'});
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  await page.locator('[data-view=back]').click();
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForFunction(()=>document.getElementById('main-image').complete);
  report.viewports.push({width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  if(width===1440||width===390){await page.screenshot({path:path.join(__dirname,`hero-${width}.png`)});await page.screenshot({path:path.join(__dirname,`page-${width}.png`),fullPage:true});}
 }
 for(const h of await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('http')))){
  const exists=h.startsWith('#')?await page.locator(h).count()>0:fs.existsSync(path.resolve(root,h));
  report.localLinks.push({href:h,exists});
 }
 const popupPromise=page.waitForEvent('popup');
 await page.locator('#open-art').click();
 const popup=await popupPromise;
 await popup.waitForLoadState();
 report.tests.push({name:'artwork-opens-in-tab',passed:popup.url().endsWith('call-me-later-art.png')});
 await popup.close();
 report.tests.push({name:'no-checkout-or-data-form',passed:await page.locator('form,input[type=email],a[href*="checkout"]').count()===0});
 report.passed=report.errors.length===0&&report.tests.every(t=>t.passed)&&report.viewports.every(v=>!v.overflow)&&report.localLinks.every(l=>l.exists);
 fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 await browser.close();
 if(!report.passed)process.exitCode=1;
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
