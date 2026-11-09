#!/usr/bin/env python3
"""Prueba E2E API Laurent con datos ficticios sobre PostgreSQL NUEVO.
Ejecutar solamente en contenedor aislado; CREA usuarios, paciente y pagos de prueba.
Variables necesarias: LAURENT_API_URL, ADMIN_USERNAME, ADMIN_PASSWORD.
"""
import json,os,sys,urllib.request,urllib.error,secrets
from datetime import datetime,timedelta,timezone
from decimal import Decimal

base=os.environ.get('LAURENT_API_URL','http://localhost:8080').rstrip('/')
admin=os.environ.get('ADMIN_USERNAME')
password=os.environ.get('ADMIN_PASSWORD')
if not admin or not password:
 print('FALTAN ADMIN_USERNAME / ADMIN_PASSWORD; se cancela sin modificar la base de datos.')
 sys.exit(2)
count=0

def call(method,path,payload=None,token=None,headers=None,expected=(200,201)):
 global count
 data=json.dumps(payload).encode() if payload is not None else None
 h={'Content-Type':'application/json'}
 if token:h['Authorization']='Bearer '+token
 if headers:h.update(headers)
 req=urllib.request.Request(base+path,data=data,headers=h,method=method)
 try:
  with urllib.request.urlopen(req,timeout=12) as r:
   code=r.status; body=r.read().decode()
 except urllib.error.HTTPError as e:
  code=e.code;body=e.read().decode()
 if code not in expected:
  raise AssertionError(f'{method} {path} esperaba {expected}; obtuvo {code}: {body[:400]}')
 count+=1
 try:return json.loads(body) if body else {}
 except json.JSONDecodeError:return body

def ident(t):return t['id']

def main():
 suffix=secrets.token_hex(4)
 root=call('POST','/api/autenticacion/iniciar-sesion',{'usuario':admin,'contrasena':password})['token']
 call('GET','/api/autenticacion/yo',token=root)
 def user(role):
  return ident(call('POST','/api/administracion/usuarios',{'username':role.lower()+suffix,'nombre':role+' Prueba',
     'rol':role,'contrasena':'Test-'+secrets.token_urlsafe(22),'correo':role.lower()+suffix+'@example.invalid'},root))
 # guardar contraseñas de test para inicio de sesión por rol
 def create_user(role):
  pwd='Test-'+secrets.token_urlsafe(22)
  result=call('POST','/api/administracion/usuarios',{'username':role.lower()+suffix,'nombre':role+' Prueba',
     'rol':role,'contrasena':pwd,'correo':role.lower()+suffix+'@example.invalid'},root)
  return result['id'],call('POST','/api/autenticacion/iniciar-sesion',{'usuario':role.lower()+suffix,'contrasena':pwd})['token']
 medico,mt=create_user('MEDICO')
 recep,rt=create_user('RECEPCIONISTA')
 sede=ident(call('POST','/api/administracion/sedes',{'nombre':'Sede Test '+suffix,'direccion':'Prueba','telefono':''},root))
 sillon=ident(call('POST','/api/administracion/sillones',{'sedeId':sede,'codigo':'TEST-'+suffix,'nombre':'Sillón Test'},root))
 ident(call('POST','/api/administracion/odontologos',{'usuarioId':medico,'sedeId':sede,'cop':'TEST-000','especialidad':'Pruebas','colorAgenda':'#0e4a4e','mostrarEnWeb':False,'biografia':'','fotoUrl':''},root))
 servicio=ident(call('POST','/api/administracion/tratamientos',{'codigo':'TEST-'+suffix,'nombre':'Consulta de test',
   'descripcion':'No real','especialidad':'General','precioBase':180,'duracionMinutos':45,'publico':False},root))
 paciente=ident(call('POST','/api/pacientes',{'nombres':'Paciente','apellidos':'Prueba '+suffix,
   'tipoDocumento':'OTRO','numeroDocumento':suffix,'telefono':'999111222'},rt))
 call('GET',f'/api/clinica/pacientes/{paciente}/odontograma',token=mt,expected=(403,))
 call('POST','/api/clinica/atenciones',{'pacienteId':paciente,'motivoConsulta':'Prueba',
  'procedimiento':'No real'},rt,expected=(403,))
 inicio=datetime.now(timezone.utc)+timedelta(days=3)
 inicio=inicio.replace(hour=15,minute=0,second=0,microsecond=0)
 fin=inicio+timedelta(minutes=45)
 iso=lambda x:x.isoformat()
 appointment={'pacienteId':paciente,'odontologoUsuarioId':medico,'sillonId':sillon,
              'tratamientoId':servicio,'inicio':iso(inicio),'fin':iso(fin),'observacion':'PRUEBA'}
 cita=ident(call('POST','/api/agenda/citas',appointment,rt))
 call('POST','/api/agenda/citas',appointment,rt,expected=(409,))
 call('GET',f'/api/clinica/pacientes/{paciente}/odontograma',token=mt)
 call('POST','/api/clinica/odontograma',{'pacienteId':paciente,'piezaFdi':16,'superficie':'OCLUSAL',
  'tipo':'CARIES','estado':'EXISTENTE','observacion':'HALLAZGO FICTICIO'},mt)
 atencion=ident(call('POST','/api/clinica/atenciones',{'pacienteId':paciente,'citaId':cita,
  'motivoConsulta':'CONSULTA DE PRUEBA','diagnostico':'FICTICIO','procedimiento':'NINGUNO','firmar':False},mt))
 call('POST','/api/caja/cargos',{'pacienteId':paciente,'atencionId':atencion,'tratamientoId':servicio,
  'descripcion':'Tratamiento ficticio','importe':180},rt)
 call('POST','/api/caja/sesiones/abrir',{'montoApertura':0,'sedeId':sede},rt)
 payload={'pacienteId':paciente,'monto':100,'metodo':'YAPE','referencia':'TEST-'+suffix}
 key='TEST-'+secrets.token_hex(16)
 p1=call('POST','/api/caja/pagos',payload,rt,headers={'Idempotency-Key':key})
 p2=call('POST','/api/caja/pagos',payload,rt,headers={'Idempotency-Key':key})
 assert p1['id']==p2['id'] and p2['duplicado'] is True,'Idempotencia falló'
 cuenta=call('GET',f'/api/caja/pacientes/{paciente}/estado',token=rt)
 assert Decimal(str(cuenta['resumen']['deuda']))==Decimal('80.00'),cuenta
 call('GET',f'/api/caja/pacientes/{paciente}/estado',token=mt,expected=(403,))
 call('GET','/api/publico/servicios',expected=(200,))
 print(f'APROBADAS: {count} solicitudes de integración; paciente ficticio {paciente}; deuda S/80')
 print('IMPORTANTE: la prueba deja registros ficticios en la BD aislada. Nunca usar en producción.')

if __name__=='__main__':
 try:main()
 except Exception as e:print('FALLO E2E:',type(e).__name__,str(e),file=sys.stderr);sys.exit(1)
