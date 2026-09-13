const sites = [
 ['Scuffers','https://scuffers.com/collections/best-sellers'],
 ['Nude Project','https://nude-project.com/collections/hoodies'],
 ['Wasted Paris','https://wasted.fr/collections/t-shirts-homme'],
 ['6PM','https://www.6pmseason.com/collections/summer-26'],
 ['Jaded London','https://jadedldn.com/collections/mens-bestsellers'],
 ['WRSTBHVR','https://worst-behavior.com/de-eu/collections/men-hoodies-sweatshirts'],
 ['Arte Antwerp','https://arte-antwerp.com/collections/knitwear'],
 ['PESO','https://pesoclo.com/collections/all'],
 ['derschutze','https://derschutze.com/collections/all'],
 ['Cold Culture','https://coldcultureworldwide.com/collections/most-popular'],
 ['Broken Planet','https://www.brokenplanet.com/shop']
];
(async()=> {
 for(let start=0;start<sites.length;start+=3){
  await Promise.all(sites.slice(start,start+3).map(async([brand,url])=>{
   try{
    const r=await fetch(url,{signal:AbortSignal.timeout(18000)}); const html=await r.text();
    const links=[...html.matchAll(/href=["']([^"']*(?:\/products\/|\/product\/)[^"']*)["']/g)].map(m=>new URL(m[1].replaceAll('&amp;','&'),r.url).href.split('?')[0]);
    const unique=[...new Set(links)];
    console.log(JSON.stringify({brand,status:r.status,finalUrl:r.url,shopify:/Shopify\.shop|cdn\.shopify\.com/.test(html),productLinks:unique.slice(0,25),total:unique.length}));
   }catch(e){console.log(JSON.stringify({brand,error:e.message}));}
  }));
 }
})();
