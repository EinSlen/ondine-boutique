const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
let browser;
(async()=>{
 const report={checkedAt:new Date().toISOString(),url:'https://0rsiku-r1.myshopify.com/?preview_theme_id=189335208264',errors:[],tests:[],viewports:[]};
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>report.errors.push(e.message));
 const response=await page.goto(report.url,{waitUntil:'domcontentloaded',timeout:60000});
 report.httpStatus=response.status();report.finalUrl=page.url();
 report.title=await page.title();
 report.studioPresent=await page.locator('.studio-home').count()===1;
 if(!report.studioPresent){
  report.visibleText=(await page.locator('body').innerText()).slice(0,3000);
  await page.screenshot({path:path.join(__dirname,'remote-unavailable.png'),fullPage:true});
 }else{
  const refuse=page.getByRole('button',{name:'Refuser',exact:true});
  if(await refuse.count()){await refuse.focus();await refuse.press('Enter');await refuse.waitFor({state:'hidden'});report.tests.push({name:'cookie-refusal-keyboard',passed:true});}
  await page.locator('.studio-home img[loading=lazy]').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
  await page.waitForFunction(()=>[...document.querySelectorAll('.studio-home img')].every(i=>i.complete&&i.naturalWidth>0));
  report.tests.push({name:'both-images-render',passed:await page.locator('.studio-home img').count()===2});
  report.tests.push({name:'no-liquid-error',passed:!(/Liquid error|translation missing/i.test(await page.locator('body').innerText()))});
  await page.locator('.studio-button').click();report.tests.push({name:'worn-link',passed:new URL(page.url()).hash==='#porte'});
  for(const detail of await page.locator('.studio-accordions details').all()){const before=await detail.evaluate(d=>d.open);await detail.locator('summary').click();report.tests.push({name:'accordion-toggles',passed:await detail.evaluate(d=>d.open)!==before});if(!before)await detail.locator('summary').click();}
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:1000});
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   report.viewports.push({width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
   if(width===1440||width===390){await page.screenshot({path:path.join(__dirname,`remote-hero-${width}.png`)});await page.screenshot({path:path.join(__dirname,`remote-page-${width}.png`),fullPage:true});}
  }
  report.tests.push({name:'no-purchase-or-data-form',passed:await page.locator('main form,main a[href*="checkout"],main button[type=submit]').count()===0});
  report.imageUrls=await page.locator('.studio-home img').evaluateAll(imgs=>imgs.map(i=>({src:i.currentSrc,width:i.naturalWidth})));
  for(const route of ['/collections/all','/search?q=tee','/cart']){await page.goto('https://0rsiku-r1.myshopify.com'+route,{waitUntil:'domcontentloaded'});report.tests.push({name:'showcase-route-'+route,passed:await page.getByRole('heading',{name:'Le vestiaire se prépare.'}).count()===1&&await page.locator('main form').count()===0});}
 }
 report.passed=report.studioPresent&&report.errors.length===0&&report.tests.every(t=>t.passed)&&report.viewports.every(v=>!v.overflow);
 fs.writeFileSync(path.join(__dirname,'remote-report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 await browser.close();if(!report.passed)process.exitCode=1;
})().catch(async e=>{console.error(e.name,e.message);if(browser)await browser.close();process.exitCode=1;});
