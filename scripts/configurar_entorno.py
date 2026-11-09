#!/usr/bin/env python3
"""Crea .env local. Nunca publica secretos ni sustituye .env existente."""
from pathlib import Path
from secrets import token_urlsafe, token_bytes
from base64 import b64encode
from getpass import getpass
import re,sys
root=Path(__file__).resolve().parents[1]
out=root/'.env'
if out.exists():
 print('Existe .env; no se modificó.');sys.exit(0)
usuario=input('Usuario administrador inicial [administrador]: ').strip() or 'administrador'
clave=getpass('Contraseña del administrador (mínimo 14 caracteres): ')
clave2=getpass('Confirma la contraseña: ')
if clave!=clave2 or len(clave)<14 or any(c in clave for c in '\n\r='):
 print('Contraseña insegura o diferente; no se creó .env.');sys.exit(1)
if not re.fullmatch(r'[A-Za-z0-9_.-]{3,60}',usuario):
 print('Usuario inválido.');sys.exit(1)
postgres=token_urlsafe(36)
jwt=b64encode(token_bytes(48)).decode('ascii')
valor=f'''POSTGRES_PASSWORD={postgres}\nDB_USER=laurent_app\nDB_PASSWORD={postgres}\nJWT_SECRET={jwt}\nADMIN_USERNAME={usuario}\nADMIN_PASSWORD={clave}\nADMIN_NAME=Administrador Laurent\nLAURENT_STORAGE_DIR=/app/storage\n'''
out.write_text(valor,encoding='utf-8')
try:out.chmod(0o600)
except OSError:pass
print('Archivo .env generado. No lo subas a GitHub. Ejecuta: docker compose up -d --build')
