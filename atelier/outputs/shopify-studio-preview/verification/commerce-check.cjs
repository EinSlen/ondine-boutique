const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {chromium}=require('playwright');
const theme=path.resolve(__dirname,'../shopify-theme');
const baselineMode=process.argv.includes('--baseline');
const productSource=baselineMode?JSON.parse(fs.readFileSync(path.join(__dirname,'remote-files.json'),'utf8')).files.nodes.find(file=>file.filename==='sections/main-product.liquid').body.content:fs.readFileSync(path.join(theme,'sections/main-product.liquid'),'utf8');
const baseSource=fs.readFileSync(path.join(theme,'snippets/theme-base.liquid'),'utf8');
const locale=JSON.parse(fs.readFileSync(path.join(theme,'locales/fr.json'),'utf8'));
const js=productSource.match(/{% javascript %}([\s\S]*?){% endjavascript %}/)[1];
const css=[baseSource,productSource].map(source=>source.match(/{% stylesheet %}([\s\S]*?){% endstylesheet %}/)[1]).join('\n');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const variants={S:{id:101,price:'39,00 €',available:true},M:{id:102,price:'42,00 €',available:true},XL:{id:103,price:'42,00 €',available:false}};
function section(size='S',showcase=false,extra={}){
 const v=variants[size];const unavailable=showcase||!v.available;
 return `<section class="sh-product sh-container sh-section" data-sh-product data-showcase="${showcase}" data-section-id="product-test" data-product-url="/fr/products/piece-test" data-cart-url="/fr/cart" data-error="${escape(locale.product.option_error)}" data-adding="${escape(locale.product.adding)}" data-add-error="${escape(locale.product.add_error)}" data-check-hint="${escape(locale.product.check_cart_hint)}">
 <div class="sh-product__media"><div class="sh-product__image sh-product__image--main" style="display:grid;place-items:center;text-align:center;padding:24px"><p>ZONE PHOTO DE TEST<br><small>Aucun nouveau vêtement proposé</small></p></div></div>
 <div class="sh-product__info"><p class="sh-eyebrow">FICHE DE TEST / DONNÉES FICTIVES</p><h1>Vêtement de test</h1><div class="sh-product__price" aria-live="polite">${v.price}</div>
 <div class="sh-product__options js-only"><div class="sh-form-field"><label for="Option-product-test-1">Taille</label><select id="Option-product-test-1" data-option-select data-option-position="1">${Object.keys(variants).map(key=>`<option value="${key}"${key===size?' selected':''}>${key}${!variants[key].available?' — Épuisé':''}</option>`).join('')}</select></div></div>
 <form action="/fr/cart/add" method="post" class="sh-product__form"><input name="form_type" value="product" type="hidden"><input name="id" type="hidden" data-variant-id value="${v.id}"${unavailable?' disabled':''}>
 <input name="properties[Note]" type="hidden" value="Essai technique"><input name="selling_plan" type="hidden" value="456">
 <div class="sh-product__buy"><div><label class="visually-hidden" for="Quantity-product-test">Quantité</label><input id="Quantity-product-test" type="number" name="quantity" min="${extra.min||1}" step="${extra.step||1}" max="${extra.max||5}" value="${extra.min||1}" required></div><button name="add" type="submit" class="sh-button" data-add-button${unavailable?' disabled':''}>${showcase?locale.showcase.button:!v.available?locale.product.sold_out:locale.product.add_to_cart}</button></div>
 <p class="sh-error sh-note" data-option-status role="status" aria-live="polite" aria-atomic="true"></p><a class="sh-note" data-check-cart href="/fr/cart" hidden>${locale.product.check_cart}</a></form>
 <details class="sh-product__detail"><summary>Informations de test<span>+</span></summary><p>Les tailles, prix et réponses serveur sont simulés pour vérifier le code. Aucun achat possible.</p></details></div></section>`;
}
function documentHtml(options={}){return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><p class="sh-container sh-note" style="padding-top:20px">BANC DE TEST LOCAL · PAS UNE BOUTIQUE NI UN TEST DE DEMANDE</p>${section(options.size||'S',options.showcase||false,options)}<script>${js}</script></body></html>`;}
const checks=[];
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 async function run(name,options,check){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();const errors=[];const adds=[];const requests=[];const pending=[];let closing=false;page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(2500);
  const release=()=>pending.splice(0).forEach(resolve=>resolve());
  await page.route('**/*',async route=>{
   const request=route.request();const url=new URL(request.url());
   try{
    if(url.hostname!=='studio.test'){await route.abort();return}
    if(url.pathname==='/fr/cart/add.js'){
     adds.push({url:request.url(),body:request.postData(),method:request.method(),headers:request.headers()});
     if(options.holdAdd)await new Promise(resolve=>pending.push(resolve));
     if(options.networkError){await route.abort('failed');return}
     await route.fulfill({status:options.addStatus||200,contentType:options.htmlError?'text/html':'application/json',body:options.htmlError?'<h1>Temporary error</h1>':JSON.stringify(options.addResult||{id:102,quantity:2})});return;
    }
    if(url.pathname==='/fr/cart/add'){
     adds.push({native:true,url:request.url(),body:request.postData()});await route.fulfill({contentType:'text/html',body:'<h1>Native form endpoint (fixture)</h1>'});return;
    }
    if(url.pathname==='/fr/cart'){await route.fulfill({contentType:'text/html',body:'<h1>Panier de test</h1><p>Réponse simulée, aucun achat.</p>'});return}
    if(url.searchParams.has('section_id')){
     const size=url.searchParams.get('option_values');requests.push(size);
     if(options.holdOptions||options.holdFirstOption&&requests.length===1)await new Promise(resolve=>pending.push(resolve));
     if(options.optionNetworkError){await route.abort('failed');return}
     await route.fulfill({status:options.optionStatus||200,contentType:'text/html',body:options.missingSection?'<p>Missing section</p>':section(size,options.showcase||false,options)});return;
    }
    await route.fulfill({contentType:'text/html',body:documentHtml(options)});
   }catch(error){if(!closing&&!request.failure())errors.push('Route fixture: '+error.message)}
  });
  try{
   await page.clock.install();await page.goto('https://studio.test/fr/products/piece-test');await check({page,adds,requests,release});
   if(errors.length)throw new Error(errors.join('; '));checks.push({name,pass:true});
  }catch(error){checks.push({name,pass:false,error:error.message});}
  finally{closing=true;release();await context.close();}
 }
 const assert=(value,message)=>{if(!value)throw new Error(message)};
 const restored=async page=>{
  await page.waitForFunction(()=>document.querySelector('[data-option-status]')?.textContent.length>0,{},{timeout:2500});
  assert(await page.locator('[data-option-select]').inputValue()==='S','previous option not restored');
  assert(await page.locator('[data-variant-id]').inputValue()==='101','wrong variant after failure');
  assert(await page.locator('[data-add-button]').isEnabled(),'button not restored');
  assert(await page.locator('[data-sh-product]').getAttribute('aria-busy')===null,'busy flag retained');
 };
 const submit=page=>page.locator('.sh-product__form').evaluate(form=>form.requestSubmit());
 const cartError=async(page,adds)=>{
  await page.waitForFunction(()=>document.querySelector('[data-check-cart]')?.hidden===false,{},{timeout:2500});
  assert(await page.locator('[data-option-status]').textContent().then(t=>t.includes(locale.product.check_cart_hint)),'missing uncertain/partial-add warning');
  assert(await page.locator('[data-add-button]').isEnabled(),'retry controls stuck');
  assert(await page.locator('[data-option-select]').isEnabled(),'option stuck disabled');
  assert(await page.locator('[name="quantity"]').isEnabled(),'quantity stuck disabled');
  assert(adds.length===1&&!adds[0].native,'wrong add requests or automatic retry');
  assert(page.url().includes('/fr/products/'),'left product on failure');
 };
 await run('Variant updates size, price, ID, URL and focus',{},async({page})=>{
  await page.selectOption('[data-option-select]','M');await page.waitForFunction(()=>document.querySelector('[data-variant-id]').value==='102');
  assert(await page.locator('.sh-product__price').textContent()==='42,00 €','stale price');assert(new URL(page.url()).searchParams.get('option_values')==='M','stale URL');assert(await page.locator('[data-option-select]').evaluate(e=>e===document.activeElement),'focus lost');
 });
 await run('Unavailable size cannot be added',{},async({page,adds})=>{
  await page.selectOption('[data-option-select]','XL');await page.waitForFunction(()=>document.querySelector('[data-variant-id]').value==='103');await submit(page);
  assert(await page.locator('[data-add-button]').isDisabled(),'sold-out button active');assert(adds.length===0,'sold-out variant submitted');
 });
 for(const [name,options]of [['HTTP 500',{optionStatus:500}],['Missing section',{missingSection:true}],['Network failure',{optionNetworkError:true}]])await run(`Variant ${name} restores previous selection`,options,async({page})=>{await page.selectOption('[data-option-select]','M');await restored(page)});
 await run('Variant timeout recovers after 12 seconds',{holdOptions:true},async({page,requests})=>{
  const requested=page.waitForRequest(url=>url.url().includes('option_values=M'));await page.selectOption('[data-option-select]','M');await requested;await page.waitForFunction(()=>document.querySelector('[data-sh-product]').getAttribute('aria-busy')==='true');
  await page.clock.runFor(12010);await restored(page);assert(requests.length===1,'unexpected retries');
 });
 await run('Rapid option changes ignore obsolete response',{holdFirstOption:true},async({page,requests,release})=>{
  await page.selectOption('[data-option-select]','M');await page.waitForFunction(()=>document.querySelector('[data-sh-product]').getAttribute('aria-busy')==='true');
  await page.selectOption('[data-option-select]','XL');await page.waitForFunction(()=>document.querySelector('[data-variant-id]').value==='103');release();await page.clock.runFor(100);
  assert(await page.locator('[data-variant-id]').inputValue()==='103','stale result replaced final selection');assert(requests.join(',')==='M,XL','unexpected sequence');
 });
 await run('No add while option request is pending',{holdOptions:true},async({page,adds})=>{
  await page.selectOption('[data-option-select]','M');await submit(page);assert(adds.length===0,'stale selection submitted');
 });
 await run('Add sends exact selected ID, quantity, properties, plan and locale route',{},async({page,adds})=>{
  await page.selectOption('[data-option-select]','M');await page.waitForFunction(()=>document.querySelector('[data-variant-id]').value==='102');await page.locator('[name="quantity"]').fill('2');
  await submit(page);await page.waitForURL('https://studio.test/fr/cart');
  assert(adds.length===1&&!adds[0].native,'wrong number/type of adds');assert(adds[0].url==='https://studio.test/fr/cart/add.js','locale path lost');
  for(const [field,value]of [['id','102'],['quantity','2'],['properties[Note]','Essai technique'],['selling_plan','456']])assert(adds[0].body.includes(`name="${field}"\r\n\r\n${value}`),`missing ${field}`);
 });
 await run('Duplicate submit sends only one request and locks options',{holdAdd:true},async({page,adds,release})=>{
  const requested=page.waitForRequest('**/fr/cart/add.js');await page.locator('.sh-product__form').evaluate(form=>{form.requestSubmit();form.requestSubmit()});await requested;await page.waitForFunction(()=>document.querySelector('.sh-product__form').dataset.submitting==='true');
  assert(await page.locator('[data-option-select]').isDisabled(),'option not locked');assert(await page.locator('[name="quantity"]').isDisabled(),'quantity not locked');release();await page.waitForURL('**/fr/cart');assert(adds.length===1,'duplicate add');
 });
 await run('Showcase blocks even programmatic submit',{showcase:true},async({page,adds})=>{await submit(page);assert(adds.length===0,'showcase submitted');assert(await page.locator('[data-add-button]').isDisabled(),'showcase unlocked')});
 for(const [name,quantity,rule]of [['minimum','0',{}],['maximum','6',{}],['increment','3',{min:2,step:2,max:8}]])await run(`Invalid quantity: ${name}`,rule,async({page,adds})=>{
  await page.locator('[name="quantity"]').fill(quantity);await submit(page);assert(adds.length===0,'invalid quantity submitted');assert(!await page.locator('.sh-product__form').evaluate(form=>form.checkValidity()),'fixture validity rule not active');
 });
 await run('Stock 422 is shown as text, warns of possible partial add',{addStatus:422,addResult:{status:422,description:'<img src=x onerror=alert(1)> Stock insuffisant.'}},async({page,adds})=>{
  await submit(page);await cartError(page,adds);assert(await page.locator('[data-option-status] img').count()===0,'server error inserted as HTML');assert(await page.locator('[data-option-status]').textContent().then(t=>t.startsWith('<img')),'server message missing');
 });
 await run('JSON error in HTTP 200 is not treated as success',{addResult:{status:422,description:'Stock insuffisant'}},async({page,adds})=>{await submit(page);await cartError(page,adds)});
 await run('Cart network error stays on page and does not auto-retry',{networkError:true},async({page,adds})=>{await submit(page);await cartError(page,adds)});
 await run('Cart non-JSON error restores controls',{addStatus:503,htmlError:true},async({page,adds})=>{await submit(page);await cartError(page,adds)});
 await run('Malformed success response is not reported as added',{addResult:{}},async({page,adds})=>{await submit(page);await cartError(page,adds)});
 await run('Cart timeout warns without an automatic second request',{holdAdd:true},async({page,adds})=>{
  await submit(page);await page.waitForFunction(()=>document.querySelector('.sh-product__form').dataset.submitting==='true');await page.clock.runFor(15010);await cartError(page,adds);
 });
 await run('Error recovery link opens locale-aware cart',{networkError:true},async({page,adds})=>{await submit(page);await cartError(page,adds);await page.locator('[data-check-cart]').click();await page.waitForURL('**/fr/cart')});
 await run('Responsive product controls and information accordion',{},async({page})=>{
   for(const width of [1440,768,390,320]){await page.setViewportSize({width,height:1000});assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),`overflow ${width}`);if(!baselineMode&&(width===1440||width===390))await page.screenshot({path:path.join(__dirname,`commerce-fixture-${width}.png`),fullPage:true})}
  await page.locator('summary').click();assert(await page.locator('details').evaluate(d=>d.open),'detail does not open');
 });
 const contract=['data-cart-url="{{ routes.cart_url }}"','data-check-cart hidden','{{ form.errors | default_errors }}','{% form \'product\', product','<noscript>','selected_variant.quantity_rule.min','selected_variant.quantity_rule.increment','selected_variant.quantity_rule.max','option_value.id','option_value.product_url'].every(token=>productSource.includes(token));
 checks.push({name:'Liquid contains native fallback, route bindings and quantity rules (static contract)',pass:contract});
 const report={checkedAt:new Date().toISOString(),baselineMode,scope:'Browser tests of actual section JavaScript and CSS with simulated Shopify HTML/API contracts. Liquid itself is validated separately. Not a real Shopify cart, checkout, supplier, physical-product or demand test.',sourceSha256:crypto.createHash('sha256').update(productSource).digest('hex'),checks,pass:checks.every(c=>c.pass)};
 fs.writeFileSync(path.join(__dirname,baselineMode?'commerce-baseline-report.json':'commerce-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();if(!report.pass&&!baselineMode)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
