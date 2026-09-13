const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const theme=path.resolve(__dirname,'../shopify-theme');
const remote=JSON.parse(fs.readFileSync(path.join(__dirname,'remote-files.json'),'utf8'));
function sorted(value){if(Array.isArray(value))return value.map(sorted);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,sorted(value[key])]));return value;}
function normalize(value,json){return json?JSON.stringify(sorted(JSON.parse(value.replace(/^\s*\/\*[\s\S]*?\*\/\s*/,'')))):value.replaceAll('\r\n','\n');}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(file=>file.isDirectory()?walk(path.join(dir,file.name)):[path.join(dir,file.name)]);}
const byName=new Map(remote.files.nodes.map(file=>[file.filename,file]));
const differences=[];const files=walk(theme);
for(const file of files){const filename=path.relative(theme,file).replaceAll('\\','/');const content=fs.readFileSync(file,'utf8');const previous=byName.get(filename);if(!previous||normalize(content,filename.endsWith('.json'))!==normalize(previous.body.content,filename.endsWith('.json')))differences.push({filename,change:previous?'modified':'added',sha256:crypto.createHash('sha256').update(content).digest('hex')});byName.delete(filename);}
for(const filename of byName.keys())differences.push({filename,change:'missing-locally'});
const report={checkedAt:new Date().toISOString(),scope:'Local comparison against saved remote-files.json, not a fresh remote Shopify read.',themeId:remote.id,remoteBaselineFiles:remote.files.nodes.length,localFiles:files.length,deploymentAllowed:false,reason:'Creative direction rejected; capsule and technical changes remain local. Re-read remote state before any future authorized deployment.',differences};
fs.writeFileSync(path.join(__dirname,'local-delta.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
