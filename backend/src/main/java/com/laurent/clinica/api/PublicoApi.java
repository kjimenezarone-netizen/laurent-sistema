package com.laurent.clinica.api;
import com.laurent.clinica.servicio.BaseDatos;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/publico")
public class PublicoApi {
 private final BaseDatos db;
 public PublicoApi(BaseDatos db){this.db=db;}
 @GetMapping("/servicios") public List<Map<String,Object>> servicios(){
  return db.list("SELECT id,codigo,nombre,descripcion,especialidad,precio_base,duracion_minutos FROM catalogo_tratamientos WHERE activo=true AND publico=true ORDER BY nombre",Map.of());
 }
 @GetMapping("/odontologos") public List<Map<String,Object>> odontologos(){
  return db.list("SELECT u.nombre, o.especialidad, o.biografia, o.foto_url, o.cop FROM odontologos o JOIN usuarios u ON o.usuario_id=u.id WHERE o.mostrar_en_web AND u.activo ORDER BY u.nombre",Map.of());
 }
 @GetMapping("/testimonios") public List<Map<String,Object>> testimonios(){
  return db.list("SELECT nombre_publico,comentario,estrellas,foto_url FROM testimonios WHERE publicado=true AND consentimiento_verificado=true ORDER BY creado_en DESC LIMIT 40",Map.of());
 }
 @GetMapping("/publicaciones") public List<Map<String,Object>> publicaciones(@RequestParam(required=false) String tipo){
  return db.list("SELECT id,tipo,titulo,slug,resumen,contenido,portada_url,video_url,inicia_en,termina_en,publicado_en FROM publicaciones WHERE estado='PUBLICADO' AND (publicado_en IS NULL OR publicado_en<=now()) AND (cast(:tipo as text) IS NULL OR tipo=:tipo) ORDER BY COALESCE(publicado_en,creado_en) DESC LIMIT 100",BaseDatos.m("tipo",tipo));
 }
 @GetMapping("/publicaciones/{slug}") public Map<String,Object> publicacion(@PathVariable String slug){
  return db.one("SELECT id,tipo,titulo,slug,resumen,contenido,portada_url,video_url,inicia_en,termina_en,publicado_en FROM publicaciones WHERE slug=:s AND estado='PUBLICADO'",BaseDatos.m("s",slug));
 }
 public record Solicitud(@NotBlank @Size(max=160) String nombre,@Size(max=40) String telefono,
   @Email @Size(max=254) String correo,@Size(max=800) String mensaje,UUID servicioId,boolean consentimientoContacto){}
 @PostMapping("/solicitudes") public Map<String,Object> solicitud(@Valid @RequestBody Solicitud x){
  BaseDatos.require(x.consentimientoContacto(),"Debe autorizar el contacto");
  BaseDatos.require(x.telefono()!=null && !x.telefono().isBlank() || x.correo()!=null && !x.correo().isBlank(),"Indique telefono o correo");
  UUID id=db.id();
  db.exec("INSERT INTO solicitudes_web(id,nombre,telefono,correo,mensaje,servicio_id,consentimiento_contacto) VALUES(:id,:n,:t,:c,:m,:s,true)",
    BaseDatos.m("id",id,"n",x.nombre(),"t",x.telefono(),"c",x.correo(),"m",x.mensaje(),"s",x.servicioId()));
  return Map.of("id",id,"mensaje","Solicitud recibida");
 }
}
