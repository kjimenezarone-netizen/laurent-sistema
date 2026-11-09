package com.laurent.clinica.api;
import com.laurent.clinica.servicio.BaseDatos;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.util.*;

@RestController
public class MultimediaWebApi {
 private final BaseDatos db;private final Path storage;
 public MultimediaWebApi(BaseDatos db,@Value("${laurent.storage-dir:./storage}") String dir){
  this.db=db;this.storage=Path.of(dir).toAbsolutePath().normalize().resolve("public");
 }
 private static String mime(byte[] b){
  if(b.length>=3 && (b[0]&255)==255 && (b[1]&255)==216 && (b[2]&255)==255)return "image/jpeg";
  if(b.length>=8 && (b[0]&255)==137 && b[1]==80 && b[2]==78 && b[3]==71)return "image/png";
  if(b.length>=12 && b[0]=='R'&&b[1]=='I'&&b[2]=='F'&&b[3]=='F'&&b[8]=='W'&&b[9]=='E'&&b[10]=='B'&&b[11]=='P')return "image/webp";
  return null;
 }
 @GetMapping("/api/cms/multimedia") @PreAuthorize("hasRole('ADMINISTRADOR')")
 public List<Map<String,Object>> lista(){return db.list("SELECT * FROM multimedia_web ORDER BY creado_en DESC LIMIT 250",Map.of());}
 @PostMapping(value="/api/cms/multimedia",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
 @PreAuthorize("hasRole('ADMINISTRADOR')") @Transactional
 public Map<String,Object> cargar(@RequestParam("archivo") MultipartFile file,
      @RequestParam("evidenciaDerechos") String evidencia,@RequestParam("titulo") String titulo) throws Exception{
  BaseDatos.require(evidencia!=null&&evidencia.trim().length()>5,"Indique evidencia de autorización y derechos de uso");
  BaseDatos.require(!file.isEmpty()&&file.getSize()<=10*1024*1024,"Imagen vacía o mayor de 10MB");
  byte[] b=file.getBytes();String tipo=mime(b);BaseDatos.require(tipo!=null,"Solo JPG, PNG o WEBP");
  UUID id=db.id();String ext=tipo.equals("image/jpeg")?"jpg":tipo.equals("image/png")?"png":"webp";
  Path destino=storage.resolve(id+"."+ext).normalize();BaseDatos.require(destino.startsWith(storage),"Ruta inválida");
  Files.createDirectories(storage);Files.write(destino,b,StandardOpenOption.CREATE_NEW);
  String url="/api/publico/media/"+id;
  try{
   db.exec("INSERT INTO multimedia_web(id,titulo,tipo,url,descripcion,visible,subido_por,evidencia_derechos) VALUES(:id,:t,:tipo,:u,:desc,true,:autor,:e)",
     BaseDatos.m("id",id,"t",titulo,"tipo",tipo,"u",url,"desc",null,"autor",db.uid(),"e",evidencia));
   db.audit("CMS","PUBLICAR_IMAGEN","multimedia_web",id);
  }catch(Exception e){Files.deleteIfExists(destino);throw e;}
  return Map.of("id",id,"url",url);
 }
 @GetMapping("/api/publico/media/{id}")
 public ResponseEntity<byte[]> imagen(@PathVariable UUID id) throws Exception{
  var m=db.one("SELECT url,tipo FROM multimedia_web WHERE id=:id AND visible=true",BaseDatos.m("id",id));
  String tipo=(String)m.get("tipo");String ext=tipo.equals("image/jpeg")?"jpg":tipo.equals("image/png")?"png":"webp";
  Path path=storage.resolve(id+"."+ext).normalize();BaseDatos.require(path.startsWith(storage),"Ruta inválida");
  return ResponseEntity.ok().contentType(MediaType.parseMediaType(tipo))
   .header("X-Content-Type-Options","nosniff").header("Cache-Control","public,max-age=3600")
   .body(Files.readAllBytes(path));
 }
}
