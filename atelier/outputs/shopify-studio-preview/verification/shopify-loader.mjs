import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const dependencyRequire=createRequire('C:/Users/Valentin/AppData/Roaming/npm/node_modules/@shopify/dev-mcp/package.json');
export async function resolve(specifier,context,nextResolve){
 try{return await nextResolve(specifier,context);}
 catch(error){
  if(error.code==='ERR_MODULE_NOT_FOUND'&&specifier.startsWith('@shopify/theme-check'))return{url:pathToFileURL(dependencyRequire.resolve(specifier)).href,shortCircuit:true};
  throw error;
 }
}
