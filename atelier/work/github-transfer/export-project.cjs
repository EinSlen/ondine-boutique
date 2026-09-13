const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const roots = [
  ['ondine', 'C:/Users/Valentin/Desktop/Ondine'],
  ['atelier', 'C:/Users/Valentin/Documents/Codex/2026-08-24/repr']
];
const dest = 'C:/Users/Valentin/Documents/Codex/2026-08-24/repr/outputs/github-export-2026-09-13';
const ignoredDir = /^(?:\.git|node_modules|\.edge-profile.*|\.venv|venv|__pycache__|\.cache|\.shopify|github-export.*)$/i;
const ignoredFile = /^(?:\.env(?:\..*)?|\.mcp\.json|\.npmrc|\.pypirc|credentials(?:\..*)?|cookies?(?:\..*)?|storage[-_]?state(?:\..*)?|session(?:\..*)?|.*\.(?:pem|p12|pfx|key|log|har|sqlite|sqlite3|db))$/i;
const textExtensions = new Set(['.md','.txt','.json','.js','.cjs','.mjs','.ts','.tsx','.jsx','.html','.css','.svg','.liquid','.xml','.yaml','.yml','.toml','.ini','.py','.ps1','.sh','.bat','.csv','.env']);
const patterns = [
 /(?:shpat_|shpca_|shppa_|shpss_)[a-zA-Z0-9]{16,}/,
 /gh[pousr]_[A-Za-z0-9]{30,}/,
 /github_pat_[A-Za-z0-9_]{30,}/,
 /sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{30,}/,
 /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
 /(?:access_token|api_key|api_secret|client_secret|password)\s*["']?\s*[:=]\s*["'][A-Za-z0-9_+\/=.-]{24,}["']/i,
 /Authorization\s*[:=]\s*["']?Bearer\s+[A-Za-z0-9_+\/=.-]{24,}/i
];
const report = {date:'2026-09-13',roots:roots.map(([target,source])=>({target,source})),files:[],excluded:[],archives:[]};
function exclusion(p,reason){report.excluded.push({path:p,reason});}
function walk(root,rel,label){
  for(const e of fs.readdirSync(path.join(root,rel),{withFileTypes:true})){
    const r = path.join(rel,e.name); const f = path.join(root,r); const output = label+'/'+r.split(path.sep).join('/');
    if(e.isSymbolicLink()){exclusion(output,'lien symbolique / jonction non suivi');continue;}
    if(e.isDirectory()){
      if(ignoredDir.test(e.name)){exclusion(output,'profil navigateur, dépendances, cache ou métadonnées locales');continue;}
      walk(root,r,label); continue;
    }
    if(ignoredFile.test(e.name)){exclusion(output,'configuration ou état local potentiellement sensible');continue;}
    if(path.extname(e.name).toLowerCase()==='.zip'){report.archives.push({source:f,target:output});continue;}
    const data=fs.readFileSync(f);
    if(textExtensions.has(path.extname(e.name).toLowerCase()) && patterns.some(p=>p.test(data.toString('utf8')))){exclusion(output,'motif de secret détecté, contenu non exporté');continue;}
    if(data.length >= 95*1024*1024){exclusion(output,'fichier supérieur à 95 Mio, à transférer séparément');continue;}
    const target=path.join(dest,output);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(f,target);
    report.files.push({path:output,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});
  }
}
if(fs.existsSync(dest))throw Error('Destination already exists; refusing to overwrite snapshot');
fs.mkdirSync(dest,{recursive:true});
for(const [label,root] of roots) walk(root,'',label);
fs.writeFileSync(path.join(dest,'EXPORT-MANIFEST.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(path.dirname(dest),'github-transfer-archives.local.json'),JSON.stringify(report.archives,null,2));
console.log(JSON.stringify({destination:dest,files:report.files.length,MB:report.files.reduce((n,f)=>n+f.bytes,0)/1048576,exclusions:report.excluded,archives:report.archives.length},null,2));
