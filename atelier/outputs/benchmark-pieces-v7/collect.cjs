// Read-only collection of metadata from public official product pages.
// No image files are downloaded. The private board links to official images.
const fs = require('node:fs');
const path = require('node:path');
const sources = [
 ['Nude Project','Espagne','T-shirts','https://nude-project.com/products/juicy-cherry-tee-white'],
 ['Nude Project','Espagne','Sweats','https://nude-project.com/products/beast-zip-up-hoodie-ash'],
 ['Nude Project','Espagne','Sweats','https://nude-project.com/products/metal-cherry-hood-black-1'],
 ['Scuffers','Espagne','Sweats','https://scuffers.com/products/raw-blue-hoodie'],
 ['Scuffers','Espagne','Longsleeves','https://scuffers.com/products/niy-longsleeve-1'],
 ['Scuffers','Espagne','Mailles','https://scuffers.com/products/scff-camo-knit-zipper'],
 ['Cold Culture','Espagne','T-shirts','https://coldcultureworldwide.com/products/dogs-tee-white'],
 ['Cold Culture','Espagne','Sweats','https://coldcultureworldwide.com/products/down-to-luck-hoodie'],
 ['Cold Culture','Espagne','Mailles','https://coldcultureworldwide.com/products/poison-knitwear-cool-grey'],
 ['derschutze','Allemagne','Sweats','https://derschutze.com/products/lotus-hoodie-navy'],
 ['derschutze','Allemagne','Pantalons','https://derschutze.com/products/airplane-carpenter-pants-black'],
 ['derschutze','Allemagne','Sweats','https://derschutze.com/products/dse-3048u-hoodie-navy'],
 ['Arte Antwerp','Belgique','Mailles','https://arte-antwerp.com/products/polyform-sunfade-knit-bordeaux'],
 ['Arte Antwerp','Belgique','Mailles','https://arte-antwerp.com/products/back-graphic-knit-tshirt-cream'],
 ['Arte Antwerp','Belgique','Mailles','https://arte-antwerp.com/products/knit-polo-brown-cream'],
 ['PESO','Allemagne','T-shirts','https://pesoclo.com/fr-fr/products/ghost-pocket-tee'],
 ['PESO','Allemagne','Pantalons','https://pesoclo.com/fr-fr/products/asymmetric-denim'],
 ['PESO','Allemagne','Pantalons','https://pesoclo.com/fr-fr/products/carpenter-trackpants'],
 ['Wasted Paris','France','T-shirts','https://wasted.fr/products/howl-t-shirt-faded-black'],
 ['Wasted Paris','France','T-shirts','https://wasted.fr/products/i-love-my-dog-ringer-tee-white'],
 ['Wasted Paris','France','Longsleeves','https://wasted.fr/products/skive-t-age-black-charcoal'],
 ['6PM','Allemagne','T-shirts','https://www.6pmseason.com/products/sleeveless-waffle-tee-strawberry-milk'],
 ['6PM','Allemagne','Chemises','https://www.6pmseason.com/products/seersucker-pull-over-shirt-nautical-blue-white'],
 ['6PM','Allemagne','Shorts','https://www.6pmseason.com/products/6pm-long-shorts-wine-red'],
 ['WRSTBHVR','Allemagne','Mailles','https://worst-behavior.com/de-eu/products/mixam-knit-hoodie-1'],
 ['WRSTBHVR','Allemagne','Mailles','https://worst-behavior.com/de-eu/products/iven-knit-jacket'],
 ['WRSTBHVR','Allemagne','Sweats','https://worst-behavior.com/de-eu/products/studio-v14-hoodie-15'],
 ['Jaded London','Royaume-Uni · hors UE','T-shirts','https://jadedldn.com/en-fr/products/make-noise-spliced-cropped-t-shirt'],
 ['Jaded London','Royaume-Uni · hors UE','Pantalons','https://jadedldn.com/en-fr/products/multi-badge-grey-colossus-jeans'],
 ['Jaded London','Royaume-Uni · hors UE','Pantalons','https://jadedldn.com/en-fr/products/bedrock-drift-bootcut-jeans']
];
const decode = s => String(s||'').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
function attrs(tag){const o={};for(const m of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs))o[m[1].toLowerCase()]=decode(m[3]);return o;}
function nodes(v){if(!v||typeof v!=='object')return[];return [v,...Object.values(v).flatMap(nodes)];}
async function collect(row,i){
 const [brand,country,category,url]=row;
 try{
  const r=await fetch(url,{signal:AbortSignal.timeout(25000)});const html=await r.text();
  const meta={};for(const m of html.matchAll(/<meta\b[^>]*>/gi)){const a=attrs(m[0]);meta[a.property||a.name]=a.content;}
  const linked=[...html.matchAll(/<script\b[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].flatMap(m=>{try{return nodes(JSON.parse(m[1]));}catch{return[];}});
  const product=linked.find(x=>['ProductGroup','Product'].includes(x['@type'])&&x.name)||{};
  const offer=linked.find(x=>x['@type']==='Offer'&&x.price!=null)||{};
  let primary=meta['og:image:secure_url']||meta['og:image']||product.image;
  // This product's social metadata contained a removed image. Use its current
  // visible product-gallery image, not a downloaded/proxied fallback.
  if(url.endsWith('/studio-v14-hoodie-15')){
   const current=[...html.matchAll(/(?:src|data-src)="([^"]*Shop4_S_26a1_2FU2026TT_3692_9021_[^"/]*\.jpg[^" ]*)"/g)][0];
   if(current)primary=decode(current[1]);
  }
  let image=typeof primary==='string'?primary:Array.isArray(primary)?primary[0]:null;
  if(image){image=new URL(image,r.url);image.protocol='https:';image.searchParams.set('width','900');image=image.href;}
  const item={id:`ref-${String(i+1).padStart(2,'0')}`,brand,country,category,url:r.url,requestedUrl:url,status:r.status,title:meta['og:title']||product.name||'Fiche indisponible',image,price:meta['og:price:amount']||meta['product:price:amount']||offer.price||null,currency:meta['og:price:currency']||meta['product:price:currency']||offer.priceCurrency||null,description:decode(meta['og:description']||product.description||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,2400),shopify:/Shopify\.shop|cdn\.shopify\.com/.test(html),checkedAt:new Date().toISOString()};
  console.log(JSON.stringify({...item,image:!!image,description:item.description.slice(0,700)}));return item;
 }catch(e){console.log(brand,url,e.message);return{id:`ref-${String(i+1).padStart(2,'0')}`,brand,country,category,url,error:e.message};}
}
(async()=>{const results=[];for(let i=0;i<sources.length;i+=5)results.push(...await Promise.all(sources.slice(i,i+5).map((r,j)=>collect(r,i+j))));fs.writeFileSync(path.join(__dirname,'references.json'),JSON.stringify(results,null,2));fs.writeFileSync(path.join(__dirname,'references.js'),'window.REFERENCES = '+JSON.stringify(results,null,2)+';\n');})();
