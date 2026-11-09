const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const fs=require('fs'),path=require('path');
let archivos=[];function recorrer(p){for(const f of fs.readdirSync(p)){let x=path.join(p,f);if(fs.statSync(x).isDirectory())recorrer(x);else if(!x.endsWith(".d.ts") && /\.(tsx?|jsx?)$/.test(x))archivos.push(x);}}recorrer(path.join(__dirname,'../frontend/src'));
let errores=[];for(const p of archivos){const src=fs.readFileSync(p,'utf8');const r=ts.transpileModule(src,{fileName:p,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});for(const d of r.diagnostics||[])if(d.category===ts.DiagnosticCategory.Error) errores.push({file:p.split('/frontend/')[1],message:ts.flattenDiagnosticMessageText(d.messageText,' ')});}
console.log(JSON.stringify({archivosTypeScript:archivos.length,erroresSintaxis:errores},null,2));if(errores.length)process.exit(1);
