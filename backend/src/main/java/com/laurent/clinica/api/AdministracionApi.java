package com.laurent.clinica.api;
import com.laurent.clinica.servicio.BaseDatos;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/administracion")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdministracionApi {
 private final BaseDatos db;private final PasswordEncoder encoder;
 public AdministracionApi(BaseDatos db,PasswordEncoder encoder){this.db=db;this.encoder=encoder;}
 @GetMapping("/resumen") public Map<String,Object> resumen(){
  return Map.of("pacientes",db.one("SELECT count(*) total FROM pacientes WHERE activo",Map.of()).get("total"),
   "citasHoy",db.one("SELECT count(*) total FROM citas WHERE inicio::date=CURRENT_DATE AND estado<>'CANCELADA'",Map.of()).get("total"),
   "ingresosMes",db.one("SELECT COALESCE(sum(monto),0) total FROM pagos WHERE estado='CONFIRMADO' AND date_trunc('month',pagado_en)=date_trunc('month',now())",Map.of()).get("total"),
   "solicitudes",db.one("SELECT count(*) total FROM solicitudes_web WHERE estado='NUEVA'",Map.of()).get("total"));
 }
 @GetMapping("/ingresos-diarios") public List<Map<String,Object>> ingresosDiarios(@RequestParam(defaultValue="30") int dias){
  BaseDatos.require(dias>=7 && dias<=90,"Rango permitido: 7 a 90 días");
  return db.list("SELECT g.fecha::date fecha,COALESCE(sum(p.monto),0) monto " +
    "FROM generate_series(current_date-Cast(:dias AS integer)+1,current_date,interval '1 day') g(fecha) " +
    "LEFT JOIN pagos p ON p.pagado_en::date=g.fecha::date AND p.estado='CONFIRMADO' " +
    "GROUP BY g.fecha ORDER BY g.fecha",BaseDatos.m("dias",dias));
 }
 @GetMapping("/tratamientos-frecuentes") public List<Map<String,Object>> tratamientosFrecuentes(){
  return db.list("SELECT t.nombre,count(c.id) atenciones,sum(c.importe) facturado " +
    "FROM cargos_cuenta c JOIN catalogo_tratamientos t ON t.id=c.tratamiento_id " +
    "WHERE c.estado='VIGENTE' GROUP BY t.id,t.nombre ORDER BY atenciones DESC LIMIT 8",Map.of());
 }
 @GetMapping("/usuarios") public List<Map<String,Object>> usuarios(){return db.list("SELECT id,username,nombre,correo,rol,activo,creado_en FROM usuarios ORDER BY creado_en DESC",Map.of());}
 public record Usuario(@NotBlank String username,@NotBlank String nombre,@NotBlank String rol,@NotBlank @Size(min=14) String contrasena,String correo){}
 @PostMapping("/usuarios") @Transactional public Map<String,Object> nuevo(@Valid @RequestBody Usuario x){
  BaseDatos.require(Set.of("ADMINISTRADOR","MEDICO","RECEPCIONISTA").contains(x.rol()),"Rol no permitido");
  UUID id=db.id();
  db.exec("INSERT INTO usuarios(id,username,nombre,rol,password_hash,correo) VALUES(:id,:u,:n,:r,:p,:c)",
    BaseDatos.m("id",id,"u",x.username(),"n",x.nombre(),"r",x.rol(),"p",encoder.encode(x.contrasena()),"c",x.correo()));
  db.audit("SEGURIDAD","CREAR_USUARIO","usuarios",id);return Map.of("id",id);
 }
 @PatchMapping("/usuarios/{id}/activo") @Transactional public void activo(@PathVariable UUID id,@RequestBody Map<String,Boolean> x){
  boolean activar=Boolean.TRUE.equals(x.get("activo"));
  BaseDatos.require(!id.equals(db.uid()) || activar,"No puede desactivar su propia cuenta");
  if(db.exec("UPDATE usuarios SET activo=:a WHERE id=:i",BaseDatos.m("a",activar,"i",id))==0)
    throw new ResponseStatusException(HttpStatus.NOT_FOUND);
  db.audit("SEGURIDAD",activar?"ACTIVAR":"DESACTIVAR","usuarios",id);
 }
 public record Tratamiento(@NotBlank String codigo,@NotBlank String nombre,String descripcion,String especialidad,
      @NotNull @DecimalMin("0.0") BigDecimal precioBase,@Min(5) @Max(600) int duracionMinutos,boolean publico){}
 @GetMapping("/tratamientos") public List<Map<String,Object>> tratamientos(){return db.list("SELECT * FROM catalogo_tratamientos ORDER BY nombre",Map.of());}
 @PostMapping("/tratamientos") @Transactional public Map<String,Object> tratamiento(@Valid @RequestBody Tratamiento x){
  UUID id=db.id();
  db.exec("INSERT INTO catalogo_tratamientos(id,codigo,nombre,descripcion,especialidad,precio_base,duracion_minutos,publico) VALUES(:id,:c,:n,:d,:e,:p,:m,:v)",
    BaseDatos.m("id",id,"c",x.codigo(),"n",x.nombre(),"d",x.descripcion(),"e",x.especialidad(),"p",x.precioBase(),"m",x.duracionMinutos(),"v",x.publico()));
  db.audit("CATALOGO","CREAR","catalogo_tratamientos",id);return Map.of("id",id);
 }
 @GetMapping("/sillones") public List<Map<String,Object>> sillones(){return db.list("SELECT s.*,sed.nombre sede FROM sillones s JOIN sedes sed ON sed.id=s.sede_id",Map.of());}
 @GetMapping("/odontologos") public List<Map<String,Object>> odontologos(){return db.list("SELECT o.id,o.usuario_id,u.nombre,o.especialidad,o.cop,o.mostrar_en_web FROM odontologos o JOIN usuarios u ON u.id=o.usuario_id",Map.of());}
 @GetMapping("/sedes") public List<Map<String,Object>> sedes(){return db.list("SELECT * FROM sedes",Map.of());}
 public record Sede(@NotBlank String nombre,String direccion,String telefono){}
 @PostMapping("/sedes") @Transactional public Map<String,Object> sede(@Valid @RequestBody Sede x){
  UUID id=db.id();db.exec("INSERT INTO sedes(id,nombre,direccion,telefono) VALUES(:id,:n,:d,:t)",BaseDatos.m("id",id,"n",x.nombre(),"d",x.direccion(),"t",x.telefono()));return Map.of("id",id);
 }
 public record Sillon(@NotNull UUID sedeId,@NotBlank String codigo,@NotBlank String nombre){}
 @PostMapping("/sillones") @Transactional public Map<String,Object> sillon(@Valid @RequestBody Sillon x){
  UUID id=db.id();db.exec("INSERT INTO sillones(id,sede_id,codigo,nombre) VALUES(:id,:s,:c,:n)",BaseDatos.m("id",id,"s",x.sedeId(),"c",x.codigo(),"n",x.nombre()));return Map.of("id",id);
 }
 public record Odontologo(@NotNull UUID usuarioId,UUID sedeId,String cop,String especialidad,String colorAgenda,boolean mostrarEnWeb,String biografia,String fotoUrl){}
 @PostMapping("/odontologos") @Transactional public Map<String,Object> odontologo(@Valid @RequestBody Odontologo x){
  var u=db.one("SELECT rol FROM usuarios WHERE id=:i",BaseDatos.m("i",x.usuarioId()));
  BaseDatos.require("MEDICO".equals(u.get("rol")),"Debe elegir un usuario medico");
  UUID id=db.id();db.exec("INSERT INTO odontologos(id,usuario_id,sede_id,cop,especialidad,color_agenda,mostrar_en_web,biografia,foto_url) VALUES(:id,:u,:s,:c,:e,:co,:p,:b,:f)",
    BaseDatos.m("id",id,"u",x.usuarioId(),"s",x.sedeId(),"c",x.cop(),"e",x.especialidad(),"co",x.colorAgenda(),"p",x.mostrarEnWeb(),"b",x.biografia(),"f",x.fotoUrl()));return Map.of("id",id);
 }
}
