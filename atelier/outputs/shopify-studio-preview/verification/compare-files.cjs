const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'remote-files.json'),'utf8'));
function sorted(value){if(Array.isArray(value))return value.map(sorted);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,sorted(value[k])]));return value;}
function normalize(value,json){return json?JSON.stringify(sorted(JSON.parse(value.replace(/^\s*\/\*[\s\S]*?\*\/\s*/,'')))):value.replaceAll('\r\n','\n');}
const files=data.files.nodes.map(f=>({filename:f.filename,match:normalize(fs.readFileSync(path.join(root,'shopify-theme',f.filename),'utf8'),f.filename.endsWith('.json'))===normalize(f.body.content,f.filename.endsWith('.json'))}));
const report={checkedAt:new Date().toISOString(),themeId:data.id,role:data.role,paginatedComplete:!data.files.pageInfo.hasNextPage,files,passed:files.length===37&&files.every(f=>f.match)&&!data.files.pageInfo.hasNextPage};
fs.writeFileSync(path.join(__dirname,'integrity-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({files:files.length,passed:report.passed,differences:files.filter(f=>!f.match)}));if(!report.passed)process.exitCode=1;
