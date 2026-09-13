const fs=require('node:fs');
const path=require('node:path');
async function main(){
  const target=JSON.parse(fs.readFileSync(path.join(__dirname,'.staged-target.json'),'utf8'));
  const url=new URL(target.url);
  if(url.protocol!=='https:')throw Error('Upload target must be HTTPS');
  if(!target.parameters?.length)throw Error('Missing staged parameters');
  const form=new FormData();
  for(const {name,value} of target.parameters)form.append(name,value);
  const archive=fs.readFileSync(path.join(__dirname,'studio-preview-r1.zip'));
  form.append('file',new Blob([archive],{type:'application/zip'}),'studio-preview-r1.zip');
  const result=await fetch(url,{method:'POST',body:form,signal:AbortSignal.timeout(60000)});
  console.log(JSON.stringify({httpStatus:result.status,uploaded:result.ok,bytes:archive.length}));
  if(!result.ok){const message=await result.text();console.error(message.slice(0,600));process.exitCode=1;}
}
main().catch(error=>{console.error(error.name,error.message);process.exitCode=1;});
