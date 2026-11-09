// Comprueba sintaxis TypeScript/TSX sin renderizar ni compilar bundles.
const fs=require('node:fs');
const path=require('node:path');
let ts;
try{ts=require('typescript')}catch(e){ts=require(path.join(require('node:child_process').execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript'))}
const dir=path.join(__dirname,'../frontend/src');
let n=0;const errors=[];
function walk(root){for(const item of fs.readdirSync(root,{withFileTypes:true})){
 const p=path.join(root,item.name);if(item.isDirectory()){walk(p);continue}
 if(!p.endsWith('.ts')&&!p.endsWith('.tsx'))continue;
 n++;const source=ts.createSourceFile(p,fs.readFileSync(p,'utf8'),ts.ScriptTarget.ES2022,true,
   p.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 for(const d of source.parseDiagnostics){const pos=source.getLineAndCharacterOfPosition(d.start||0);
  errors.push(`${p}:${pos.line+1}:${pos.character+1}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`)}
}}
walk(dir);
console.log(`TypeScript: ${n} archivos, ${errors.length} errores sintácticos`);
for(const e of errors)console.error(e);
if(errors.length)process.exit(1);
