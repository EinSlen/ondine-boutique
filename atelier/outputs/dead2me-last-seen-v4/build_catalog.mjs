import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const outputDir = 'C:/Users/Valentin/Documents/Codex/2026-08-24/repr/outputs/dead2me-last-seen-v4';
const headers = ['Handle','Title','Body (HTML)','Vendor','Product Category','Type','Tags','Published','Option1 Name','Option1 Value','Variant SKU','Variant Price','Variant Inventory Policy','Variant Fulfillment Service','Variant Requires Shipping','Variant Taxable','Status'];
const products = [
  {handle:'last-seen-hoodie',title:'Last Seen Hoodie',body:'<p>Hoodie boxy charbon délavé. Petite broderie poitrine et panneau appliqué bord brut au dos.</p><ul><li>400 GSM cible</li><li>Coupe boxy sans cordons</li><li>Appliqué et broderie</li></ul>',type:'Hoodie',tags:'DROP 001,Last Seen,boxy,heavyweight,prototype',sku:'LSH',price:99},
  {handle:'last-seen-zip',title:'Last Seen Zip',body:'<p>Zip hoodie graphite délavé, large et légèrement court. Broderie poitrine et sérigraphie haute densité au dos.</p><ul><li>400 GSM cible</li><li>Zip métal</li><li>Coupe boxy</li></ul>',type:'Zip Hoodie',tags:'DROP 001,Last Seen,boxy,heavyweight,prototype',sku:'LSZ',price:109},
  {handle:'offline-boxy-tee',title:'Offline Boxy Tee',body:'<p>Tee heavyweight vintage bone, col compact et manches larges. Statut brodé devant et sérigraphie deux couleurs au dos.</p><ul><li>240 GSM cible</li><li>Coton biologique cible</li><li>Oversized boxy</li></ul>',type:'T-Shirt',tags:'DROP 001,Offline,boxy,240gsm,prototype',sku:'OBT',price:55},
  {handle:'missed-call-long-sleeve',title:'Missed Call Long Sleeve',body:'<p>Long sleeve oxblood délavé, large et légèrement court. Motifs poitrine, manches et dos.</p><ul><li>240 GSM cible</li><li>Coton biologique cible</li><li>Oversized boxy</li></ul>',type:'Long Sleeve',tags:'DROP 001,Missed Call,boxy,240gsm,prototype',sku:'MCL',price:65}
];
const sizes=['XS','S','M','L','XL','XXL'];
const rows=[];
for(const product of products){
  sizes.forEach((size,index)=>rows.push([
    product.handle,index===0?product.title:'',index===0?product.body:'',index===0?'DEAD2ME':'',index===0?'Apparel & Accessories > Clothing > Shirts & Tops':'',index===0?product.type:'',index===0?product.tags:'',index===0?false:'','Size',size,`D2M-${product.sku}-${size}`,product.price,'deny','manual',true,true,'draft'
  ]));
}

const workbook=Workbook.create();
const sheet=workbook.worksheets.add('Shopify products');
sheet.showGridLines=false;
sheet.getRangeByIndexes(0,0,rows.length+1,headers.length).values=[headers,...rows];
sheet.freezePanes.freezeRows(1);
sheet.getRange(`A1:Q1`).format={fill:'#111111',font:{name:'Arial',bold:true,color:'#FFFFFF',size:10},wrapText:true,verticalAlignment:'center',horizontalAlignment:'center'};
sheet.getRange(`A2:Q${rows.length+1}`).format.font={name:'Arial',size:10,color:'#111111'};
sheet.getRange(`A2:Q${rows.length+1}`).format.verticalAlignment='top';
sheet.getRange(`A2:Q${rows.length+1}`).format.borders={insideHorizontal:{style:'thin',color:'#E0DDD5'}};
sheet.getRange(`L2:L${rows.length+1}`).format.numberFormat='€#,##0.00';
sheet.getRange(`A1:Q${rows.length+1}`).format.autofitColumns();
sheet.getRange('A:A').format.columnWidth=24;sheet.getRange('B:B').format.columnWidth=27;sheet.getRange('C:C').format.columnWidth=62;sheet.getRange('F:F').format.columnWidth=18;sheet.getRange('G:G').format.columnWidth=42;sheet.getRange('K:K').format.columnWidth=22;
sheet.getRange(`C2:C${rows.length+1}`).format.wrapText=true;sheet.getRange(`G2:G${rows.length+1}`).format.wrapText=true;
sheet.getRange(`A2:Q${rows.length+1}`).conditionalFormats.add('containsText',{text:'draft',format:{fill:'#F2E4E2',font:{color:'#8F2823',bold:true}}});
const table=sheet.tables.add(`A1:Q${rows.length+1}`,true,'ShopifyProducts');table.style='TableStyleMedium2';table.showBandedRows=true;

const inspect=await workbook.inspect({kind:'table',range:`Shopify products!A1:Q${rows.length+1}`,include:'values,formulas',tableMaxRows:8,tableMaxCols:17,maxChars:7000});
console.log(inspect.ndjson);
const errors=await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'final formula error scan'});
console.log(errors.ndjson);
const preview=await workbook.render({sheetName:'Shopify products',range:'A1:Q9',scale:1,format:'png'});
await fs.writeFile(`${outputDir}/catalog-preview.png`,new Uint8Array(await preview.arrayBuffer()));
const xlsx=await SpreadsheetFile.exportXlsx(workbook);await xlsx.save(`${outputDir}/shopify-products-draft.xlsx`);

const escapeCsv=value=>{const text=String(value ?? '');return /[",\n]/.test(text)?`"${text.replaceAll('"','""')}"`:text};
const csv=[headers,...rows].map(row=>row.map(escapeCsv).join(',')).join('\r\n')+'\r\n';
await fs.writeFile(`${outputDir}/shopify-products-draft.csv`,csv,'utf8');
console.log(JSON.stringify({rows:rows.length,products:products.length,xlsx:`${outputDir}/shopify-products-draft.xlsx`,csv:`${outputDir}/shopify-products-draft.csv`}));
