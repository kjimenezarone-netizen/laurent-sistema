package com.laurent.clinica.api;
import com.laurent.clinica.servicio.BaseDatos;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/cms")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class MarketingApi {
 private final BaseDatos db;public MarketingApi(BaseDatos db){this.db=db;}
 @GetMapping("/publicaciones") public List<Map<String,Object>> publicaciones(){return db.list("SELECT * FROM publicaciones ORDER BY creado_en DESC LIMIT 200",Map.of());}
 public record Publicacion(@NotBlank String tipo,@NotBlank String titulo,@NotBlank String slug,
     String resumen,String contenido,String portadaUrl,String videoUrl,OffsetDateTime iniciaEn,OffsetDateTime terminaEn,
     @NotBlank String estado){}
 @PostMapping("/publicaciones") @Transactional public Map<String,Object> crear(@Valid @RequestBody Publicacion x){
  validar(x);UUID id=db.id();
  db.exec("INSERT INTO publicaciones(id,tipo,titulo,slug,resumen,contenido,portada_url,video_url,inicia_en,termina_en,estado,autor_id,publicado_en) " +
   "VALUES(:id,:t,:ti,:s,:r,:c,:p,:v,:ini,:fin,:e,:u,:pub)",
   BaseDatos.m("id",id,"t",x.tipo(),"ti",x.titulo(),"s",x.slug(),"r",x.resumen(),"c",x.contenido(),"p",x.portadaUrl(),"v",x.videoUrl(),
     "ini",x.iniciaEn(),"fin",x.terminaEn(),"e",x.estado(),"u",db.uid(),"pub",x.estado().equals("PUBLICADO")?OffsetDateTime.now():null));
  db.audit("CMS","CREAR_PUBLICACION","publicaciones",id);return Map.of("id",id);
 }
 @PutMapping("/publicaciones/{id}") @Transactional public void editar(@PathVariable UUID id,@Valid @RequestBody Publicacion x){
  validar(x);
  BaseDatos.require(db.exec("UPDATE publicaciones SET tipo=:t,titulo=:ti,slug=:s,resumen=:r,contenido=:c,portada_url=:p,video_url=:v,inicia_en=:ini,termina_en=:fin,estado=:e,publicado_en=CASE WHEN :e='PUBLICADO' AND publicado_en IS NULL THEN now() ELSE publicado_en END WHERE id=:id",
   BaseDatos.m("id",id,"t",x.tipo(),"ti",x.titulo(),"s",x.slug(),"r",x.resumen(),"c",x.contenido(),"p",x.portadaUrl(),"v",x.videoUrl(),
     "ini",x.iniciaEn(),"fin",x.terminaEn(),"e",x.estado()))==1,"Publicacion no encontrada");
  db.audit("CMS","EDITAR_PUBLICACION","publicaciones",id);
 }
 private static void validar(Publicacion x){
  BaseDatos.require(Set.of("BLOG","EVENTO","VIDEO","ACTIVIDAD","PROMOCION").contains(x.tipo()),"Tipo no permitido");
  BaseDatos.require(Set.of("BORRADOR","PUBLICADO","ARCHIVADO").contains(x.estado()),"Estado no permitido");
  BaseDatos.require(x.slug().matches("[a-z0-9]+(?:-[a-z0-9]+)*")&&x.slug().length()<230,"Slug invalido");
 }
 @GetMapping("/testimonios") public List<Map<String,Object>> testimonios(){return db.list("SELECT * FROM testimonios ORDER BY creado_en DESC",Map.of());}
 public record Testimonio(@NotBlank String nombrePublico,@NotBlank String comentario,@Min(1) @Max(5) int estrellas,
     boolean consentimientoVerificado,String evidenciaConsentimiento,boolean publicado){}
 @PostMapping("/testimonios") @Transactional public Map<String,Object> testimonio(@Valid @RequestBody Testimonio x){
  BaseDatos.require(!x.publicado() || (x.consentimientoVerificado() && x.evidenciaConsentimiento()!=null && !x.evidenciaConsentimiento().isBlank()),"Se requiere evidencia de consentimiento para publicar");
  UUID id=db.id();db.exec("INSERT INTO testimonios(id,nombre_publico,comentario,estrellas,consentimiento_verificado,evidencia_consentimiento,publicado) VALUES(:id,:n,:c,:e,:con,:ev,:p)",
    BaseDatos.m("id",id,"n",x.nombrePublico(),"c",x.comentario(),"e",x.estrellas(),"con",x.consentimientoVerificado(),"ev",x.evidenciaConsentimiento(),"p",x.publicado()));
  db.audit("CMS","CREAR_TESTIMONIO","testimonios",id);return Map.of("id",id);
 }
 @GetMapping("/solicitudes") public List<Map<String,Object>> solicitudes(){return db.list("SELECT * FROM solicitudes_web ORDER BY creado_en DESC LIMIT 300",Map.of());}
 @PatchMapping("/solicitudes/{id}/estado") public void solicitudEstado(@PathVariable UUID id,@RequestBody Map<String,String> x){
  String estado=x.getOrDefault("estado","");BaseDatos.require(Set.of("NUEVA","CONTACTADA","AGENDADA","DESCARTADA").contains(estado),"Estado no valido");
  db.exec("UPDATE solicitudes_web SET estado=:e WHERE id=:i",BaseDatos.m("e",estado,"i",id));db.audit("CMS","SOLICITUD_"+estado,"solicitudes_web",id);
 }
}
