package com.laurent.clinica.api;
import com.laurent.clinica.servicio.BaseDatos;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.nio.file.*;
import java.security.*;
import java.util.*;

@RestController
@RequestMapping("/api/clinica")
@PreAuthorize("hasRole('MEDICO')")
public class ArchivosClinicosApi {
 private final BaseDatos db;private final Path storage;
 public ArchivosClinicosApi(BaseDatos db,@Value("${laurent.storage-dir:./storage}") String dir){
   this.db=db;this.storage=Path.of(dir).toAbsolutePath().normalize();
 }
 @GetMapping("/pacientes/{pacienteId}/archivos")
 public List<Map<String,Object>> archivos(@PathVariable UUID pacienteId){db.validarAccesoClinico(pacienteId);
  return db.list("SELECT id,tipo,nombre_original,mime,sha256,creado_en,atencion_id FROM archivos_clinicos WHERE paciente_id=:p ORDER BY creado_en DESC",BaseDatos.m("p",pacienteId));
 }
 private static String detectar(byte[] b){
  if(b.length>=4 && b[0]=='%'&&b[1]=='P'&&b[2]=='D'&&b[3]=='F')return "application/pdf";
  if(b.length>=3 && (b[0]&255)==255&&(b[1]&255)==216&&(b[2]&255)==255)return "image/jpeg";
  if(b.length>=8 && (b[0]&255)==137&&b[1]==80&&b[2]==78&&b[3]==71)return "image/png";
  if(b.length>=12 && b[0]=='R'&&b[1]=='I'&&b[2]=='F'&&b[3]=='F'&&b[8]=='W'&&b[9]=='E'&&b[10]=='B'&&b[11]=='P')return "image/webp";
  if(b.length>=132 && b[128]=='D'&&b[129]=='I'&&b[130]=='C'&&b[131]=='M')return "application/dicom";
  return null;
 }
 @PostMapping(value="/pacientes/{pacienteId}/archivos",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @Transactional
 public Map<String,Object> subir(@PathVariable UUID pacienteId,@RequestParam("archivo") MultipartFile file,
       @RequestParam("tipo") String tipo,@RequestParam(value="atencionId",required=false) UUID atencionId) throws Exception{
  db.validarAccesoClinico(pacienteId);
  BaseDatos.require(Set.of("RADIOGRAFIA","FOTOGRAFIA","CONSENTIMIENTO","OTRO").contains(tipo),"Tipo de archivo invalido");
  BaseDatos.require(file!=null&&!file.isEmpty()&&file.getSize()<=15*1024*1024,"Archivo vacio o mayor de 15MB");
  byte[] bytes=file.getBytes();String mime=detectar(bytes);
  BaseDatos.require(mime!=null,"Solo PDF, JPEG, PNG, WEBP o DICOM reconocido");
  if(atencionId!=null){var a=db.one("SELECT paciente_id FROM atenciones_clinicas WHERE id=:i",BaseDatos.m("i",atencionId));
    BaseDatos.require(pacienteId.equals(a.get("paciente_id")),"Atencion ajena al paciente");}
  String nombre=Optional.ofNullable(file.getOriginalFilename()).orElse("archivo").replaceAll("[^a-zA-Z0-9._ -]","_");
  if(nombre.length()>180) nombre=nombre.substring(nombre.length()-180);
  byte[] hash=MessageDigest.getInstance("SHA-256").digest(bytes);
  String sha=HexFormat.of().formatHex(hash);
  String clave=UUID.randomUUID().toString();Files.createDirectories(storage);
  Path ruta=storage.resolve(clave).normalize();if(!ruta.startsWith(storage))throw new SecurityException("Ruta invalida");
  Files.write(ruta,bytes,StandardOpenOption.CREATE_NEW);
  UUID id=db.id();
  try{
   db.exec("INSERT INTO archivos_clinicos(id,paciente_id,atencion_id,tipo,nombre_original,mime,almacenamiento_clave,sha256,creado_por) " +
     "VALUES(:id,:p,:a,:t,:n,:m,:c,:sha,:u)",BaseDatos.m("id",id,"p",pacienteId,"a",atencionId,"t",tipo,"n",nombre,"m",mime,"c",clave,"sha",sha,"u",db.uid()));
   db.audit("CLINICA","ADJUNTAR_ARCHIVO","archivos_clinicos",id);
  }catch(Exception e){Files.deleteIfExists(ruta);throw e;}
  return Map.of("id",id,"sha256",sha,"mime",mime);
 }
 @GetMapping("/archivos/{id}/descargar")
 public ResponseEntity<ByteArrayResource> descargar(@PathVariable UUID id) throws Exception{
  var row=db.one("SELECT paciente_id,nombre_original,mime,almacenamiento_clave FROM archivos_clinicos WHERE id=:i",BaseDatos.m("i",id));
  db.validarAccesoClinico((UUID)row.get("paciente_id"));
  Path ruta=storage.resolve((String)row.get("almacenamiento_clave")).normalize();
  if(!ruta.startsWith(storage))throw new SecurityException("Ruta invalida");
  byte[] contenido=Files.readAllBytes(ruta);
  return ResponseEntity.ok().contentType(MediaType.APPLICATION_OCTET_STREAM)
    .header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\"archivo-clinico-"+id+"\"")
    .header("X-Content-Type-Options","nosniff").body(new ByteArrayResource(contenido));
 }
}
