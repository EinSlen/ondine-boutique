const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../comparatif-audit.html')).href);
  await page.waitForFunction(()=>document.querySelectorAll('.ref-card').length===6);
  await page.waitForFunction(()=>[...document.images].every(img=>img.complete),null,{timeout:45000}).catch(()=>{});
  const images=await page.locator('img').evaluateAll(imgs=>imgs.map(i=>({alt:i.alt,loaded:i.complete&&i.naturalWidth>0})));
  const selections=[];
  for(let n=1;n<=6;n++){
   const id=String(n).padStart(2,'0');await page.locator(`[data-number="${id}"]`).click();
   selections.push({number:id,title:await page.locator('#comparison-title').textContent(),oneSelected:await page.locator('.ref-card[aria-pressed="true"]').count()===1,source:await page.locator('#reference-source').getAttribute('href')});
  }
  await page.locator('[data-number="02"]').focus();await page.keyboard.press('Enter');
  const keyboard=await page.locator('#comparison-title').textContent()==='02 / Cold Culture';
  await page.locator('[data-number="01"]').click();
  const widths=[];for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:1000});await page.evaluate(()=>scrollTo(0,0));
   widths.push({width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
   if(width===1440||width===390)await page.screenshot({path:path.join(__dirname,`comparison-${width}.png`),fullPage:true});
  }
  const report={images,selections,keyboard,widths,errors};report.pass=images.every(i=>i.loaded)&&selections.every(s=>s.title.startsWith(s.number)&&s.oneSelected)&&keyboard&&widths.every(w=>!w.overflow)&&errors.length===0;
  fs.writeFileSync(path.join(__dirname,'comparison-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!report.pass)process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
