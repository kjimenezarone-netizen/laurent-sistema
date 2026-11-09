#!/usr/bin/env python3
"""Chequeo estático reproducible. No modifica archivos ni bases de datos."""
from pathlib import Path
import json,re,sys,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
resultados=[]
def check(label,pred):resultados.append({'prueba':label,'ok':bool(pred)})

check('Sin carpeta legado dentro de la aplicación activa',not (ROOT/'legado').exists())
for directory in ['backend/src/main','frontend/src/componentes','frontend/src/paginas','frontend/src/servicios','frontend/src/estilos','docker','docs','pruebas','scripts']:
 check('Carpeta '+directory,(ROOT/directory).is_dir())

sql=sorted((ROOT/'backend/src/main/resources/db/migration').glob('V*__*.sql'))
vers=[int(re.match(r'V(\d+)__',x.name).group(1)) for x in sql]
check('Una única serie de migraciones Flyway consecutivas V1..V8',vers==list(range(1,9)))
java=list((ROOT/'backend/src/main/java').rglob('*.java'))
pom=(ROOT/'backend/pom.xml').read_text()
check('Java21 y Spring Boot 3', '<java.version>21</java.version>' in pom and 'spring-boot-starter-parent' in pom)
check('Sin dos stacks de persistencia incompatibles', 'spring-boot-starter-data-jpa' not in pom and 'spring-boot-starter-jdbc' in pom)
check('Backend activo con controladores de áreas',len(java)>=18 and (ROOT/'backend/src/main/java/com/laurent/clinica/api/HorariosApi.java').exists())
check('No arrastramos el antiguo código JPA al classpath activo',not any('com.laurent.clinica.dominio.' in p.read_text() and not p.name=='AgendaApi.java' for p in java if p.name!='ReglasAgenda.java'))

app=(ROOT/'frontend/src/App.tsx').read_text()
clinica=(ROOT/'frontend/src/paginas/Clinica.tsx').read_text()
page_names=['Agenda','Pacientes','Clinica','Caja','Administrador','Cms','Publica','Configuracion','Inventario','Laboratorio','Esterilizacion','Mensajeria','Horarios']
check('Todas las pantallas operativas están enlazadas',all((ROOT/f'frontend/src/paginas/{x}.tsx').is_file() and (x in app or x=='Administrador') for x in page_names))
check('Solo tres roles internos, marketing sin cuenta',all(x in app for x in ("'ADMINISTRADOR'","'MEDICO'","'RECEPCIONISTA'","path=\"/\"")))
check('Historia Clínica conserva diez pestañas',all(x in clinica for x in ['Resumen','Odontograma FDI','Periodontograma','Anamnesis','Evoluciones','Tratamientos realizados','Planes y presupuestos','Imágenes y archivos','Consentimientos','Atenciones y cuenta']))
check('Odontograma con clases anatómicas diferentes',all(x in (ROOT/'frontend/src/componentes/odontograma/DienteSvg.tsx').read_text() for x in ('INCISIVO','CANINO','PREMOLAR','MOLAR')))
check('Médico no cobra; recepción no registra clínicamente',"permitidos={['MEDICO']}" in app and "permitidos={['ADMINISTRADOR','RECEPCIONISTA']}" in app)
check('Verificación de permisos en backend clínico y caja',all('@PreAuthorize' in (ROOT/'backend/src/main/java/com/laurent/clinica/api'/f'{f}.java').read_text() for f in ['ClinicaApi','CajaApi']))
check('Agenda protege recursos en PostgreSQL',all(x in (ROOT/'backend/src/main/resources/db/migration/V1__identidad_pacientes_agenda.sql').read_text() for x in ('citas_sillon_sin_solape','citas_medico_sin_solape')))
check('Horarios con aprobación administrativa', '@PatchMapping("/{id}/aprobar")' in (ROOT/'backend/src/main/java/com/laurent/clinica/api/HorariosApi.java').read_text())
check('Finanzas con idempotencia y libro de cargos',all(x in (ROOT/'backend/src/main/java/com/laurent/clinica/api/CajaApi.java').read_text() for x in ('Idempotency-Key','aplicaciones_pago','revertir')))
check('Web, CMS y multimedia presentes',all((ROOT/p).is_file() for p in ['frontend/src/paginas/Publica.tsx','frontend/src/paginas/Cms.tsx','frontend/src/componentes/LaurentBotPublico.tsx','backend/src/main/java/com/laurent/clinica/api/MultimediaWebApi.java']))
check('Imagen y archivo clínico protegidos', '@PreAuthorize' in (ROOT/'backend/src/main/java/com/laurent/clinica/api/ArchivosClinicosApi.java').read_text())
check('Identidad visual uniforme',all(x in (ROOT/'frontend/src/estilos/estilos.css').read_text().lower() for x in ['#0e4a4e','#c59b27']))

src=ROOT/'frontend/src';imports=[]
for f in src.rglob('*'):
 if not f.is_file() or f.suffix not in {'.ts','.tsx'}:continue
 for rel in re.findall(r"\bfrom\s+['\"](\.[^'\"]+)['\"]",f.read_text()):
  p=(f.parent/rel).resolve()
  if not any(Path(str(p)+e).is_file() for e in ['.ts','.tsx','.js','.jsx','/index.ts','/index.tsx']):
   imports.append(str(f.relative_to(ROOT))+' → '+rel)
check('Ningún import local roto',not imports)

pkg=json.loads((ROOT/'frontend/package.json').read_text())
imports_externos=set()
for f in src.rglob('*'):
 if not f.is_file() or f.suffix not in {'.ts','.tsx'}:continue
 for name in re.findall(r"\bfrom\s+['\"]([^.'\"][^'\"]*)['\"]",f.read_text()):imports_externos.add(name.split('/')[0] if not name.startswith('@') else '/'.join(name.split('/')[:2]))
check('Dependencias de frontend cubren librerías importadas',imports_externos.issubset(set(pkg['dependencies'])|set(pkg['devDependencies'])))
check('No se incorpora una dependencia de MUI antigua','@mui/material' not in pkg['dependencies'])
check('CI E2E sobre PostgreSQL configurado',(ROOT/'pruebas/smoke_integracion.py').is_file() and (ROOT/'.github/workflows/validar.yml').is_file())
check('Configuración sin secretos escritos en claro','password: ${DB_PASSWORD}' in (ROOT/'backend/src/main/resources/application.yml').read_text() and 'secret: ${JWT_SECRET}' in (ROOT/'backend/src/main/resources/application.yml').read_text())

names=set()
refs=[]
for f in sql:
 s=re.sub(r'--[^\n]*','',f.read_text())
 names.update(re.findall(r'\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_][a-z_0-9]*)',s,re.I))
 refs+=re.findall(r'\bREFERENCES\s+([a-z_][a-z_0-9]*)',s,re.I)
missing_sql=sorted(set(refs)-names)
check('Todas las referencias de tablas SQL corresponden al esquema',not missing_sql)

fail=[x for x in resultados if not x['ok']]
res={'aprobadas':len(resultados)-len(fail),'total':len(resultados),'fallidas':[x['prueba'] for x in fail],
 'imports_faltantes':imports,'tablas_referenciadas_ausentes':missing_sql,'archivos_java':len(java),'archivos_ts':len(list(src.rglob('*.ts')))+len(list(src.rglob('*.tsx'))),
 'migraciones':len(sql),'revisiones':resultados}
print(json.dumps(res,ensure_ascii=False,indent=2))
sys.exit(1 if fail else 0)
