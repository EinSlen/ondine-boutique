const {chromium}=require('playwright');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
(async()=>{
 const base='C:/Users/Valentin/Desktop/Ondine/side-habit-store-v8';
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1080}});
 const report={url:pathToFileURL(path.join(base,'comparaison.html')).href,errors:[],references:[],viewports:[],localLinks:[]};
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(report.url);
 for(const key of ['nude','cold','scuffers','wasted']){
  await page.locator(`[data-ref="${key}"]`).click();
  let loaded=true;
  try{await page.waitForFunction(()=>[...document.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0),{},{timeout:20000});}catch{loaded=false;}
  report.references.push({key,loaded,active:await page.locator(`[data-ref="${key}"]`).getAttribute('aria-pressed'),title:await page.locator('#ref-title').textContent(),description:await page.locator('#gap').textContent()});
 }
 await page.locator('[data-ref="nude"]').click();
 await page.waitForFunction(()=>[...document.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0),{},{timeout:20000});
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1080});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  report.viewports.push({width,overflow});
  if(width===1440||width===390)await page.screenshot({path:path.join(__dirname,`comparison-${width}.png`),fullPage:true});
 }
 await page.locator('summary').click();
 report.supplierDisclosure=await page.locator('details').evaluate(el=>el.open);
 for(const href of await page.locator('a').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('https:'))))report.localLinks.push({href,exists:fs.existsSync(path.resolve(base,href))});
 report.passed=report.errors.length===0&&report.references.every(r=>r.loaded&&r.active==='true')&&report.viewports.every(v=>!v.overflow)&&report.localLinks.every(l=>l.exists)&&report.supplierDisclosure;
 fs.writeFileSync(path.join(__dirname,'comparison-report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 await browser.close();
 if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
