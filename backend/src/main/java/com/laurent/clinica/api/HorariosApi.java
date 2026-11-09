package com.laurent.clinica.api;

import com.laurent.clinica.servicio.BaseDatos;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.*;

/** Horarios semanales: los médicos proponen y administración aprueba. */
@RestController
@RequestMapping("/api/horarios")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','MEDICO','RECEPCIONISTA')")
public class HorariosApi {
 private final BaseDatos db;
 public HorariosApi(BaseDatos db){this.db=db;}

 @GetMapping
 public List<Map<String,Object>> listar(){
  return db.list("SELECT d.id,d.odontologo_usuario_id,u.nombre medico,d.dia_semana,d.desde,d.hasta,d.aprobado " +
    "FROM disponibilidades_odontologo d JOIN usuarios u ON u.id=d.odontologo_usuario_id " +
    "WHERE (:todos=true OR (d.odontologo_usuario_id=:u AND :medico=true) OR d.aprobado=true) " +
    "ORDER BY u.nombre,d.dia_semana,d.desde",BaseDatos.m("todos",db.role("ADMINISTRADOR"),"u",db.uid(),"medico",db.role("MEDICO")));
 }
 public record Propuesta(@NotNull UUID odontologoUsuarioId,@Min(1) @Max(7) int diaSemana,
     @NotNull LocalTime desde,@NotNull LocalTime hasta){}
 @PostMapping @PreAuthorize("hasAnyRole('ADMINISTRADOR','MEDICO')") @Transactional
 public Map<String,Object> proponer(@Valid @RequestBody Propuesta x){
  BaseDatos.require(x.desde().isBefore(x.hasta()),"La hora inicial debe preceder a la final");
  BaseDatos.require(db.role("ADMINISTRADOR") || db.uid().equals(x.odontologoUsuarioId()),
    "Un médico solo puede proponer sus horarios");
  BaseDatos.require(db.maybe("SELECT 1 ok FROM usuarios WHERE id=:i AND rol='MEDICO' AND activo=true",
     BaseDatos.m("i",x.odontologoUsuarioId()))!=null,"Odontólogo inválido o inactivo");
  UUID id=db.id();
  db.exec("INSERT INTO disponibilidades_odontologo(id,odontologo_usuario_id,dia_semana,desde,hasta,aprobado) " +
    "VALUES(:id,:u,:dia,:desde,:hasta,false)",BaseDatos.m("id",id,"u",x.odontologoUsuarioId(),
     "dia",x.diaSemana(),"desde",x.desde(),"hasta",x.hasta()));
  db.audit("AGENDA","PROPUESTA_HORARIO","disponibilidades_odontologo",id);
  return Map.of("id",id,"aprobado",false);
 }
 public record Aprobacion(boolean aprobado){}
 @PatchMapping("/{id}/aprobar") @PreAuthorize("hasRole('ADMINISTRADOR')") @Transactional
 public void aprobar(@PathVariable UUID id,@RequestBody Aprobacion x){
  BaseDatos.require(db.exec("UPDATE disponibilidades_odontologo SET aprobado=:a WHERE id=:id",
    BaseDatos.m("a",x.aprobado(),"id",id))==1,"Horario inexistente");
  db.audit("AGENDA",x.aprobado()?"APROBAR_HORARIO":"RETIRAR_APROBACION","disponibilidades_odontologo",id);
 }
 @GetMapping("/bloqueos") public List<Map<String,Object>> bloqueos(){
  return db.list("SELECT b.*,u.nombre medico,s.nombre sillon FROM bloqueos_agenda b " +
    "LEFT JOIN usuarios u ON u.id=b.odontologo_usuario_id LEFT JOIN sillones s ON s.id=b.sillon_id " +
    "WHERE (:todos=true OR b.odontologo_usuario_id=:u) ORDER BY inicio DESC LIMIT 200",
    BaseDatos.m("todos",!db.role("MEDICO"),"u",db.uid()));
 }
 public record Bloqueo(UUID odontologoUsuarioId,UUID sillonId,@NotNull OffsetDateTime inicio,
   @NotNull OffsetDateTime fin,@NotBlank String motivo){}
 @PostMapping("/bloqueos") @PreAuthorize("hasRole('ADMINISTRADOR')") @Transactional
 public Map<String,Object> bloquear(@Valid @RequestBody Bloqueo x){
  BaseDatos.require(x.odontologoUsuarioId()!=null || x.sillonId()!=null,"Elija odontólogo o sillón");
  BaseDatos.require(x.inicio().isBefore(x.fin()),"Intervalo inválido");
  BaseDatos.require(db.maybe("SELECT id FROM citas WHERE estado NOT IN ('CANCELADA','NO_ASISTIO') " +
    "AND inicio<:fin AND fin>:inicio AND " +
    "((odontologo_usuario_id=CAST(:medico AS uuid)) OR " +
    "(sillon_id=CAST(:sillon AS uuid))) LIMIT 1",
    BaseDatos.m("inicio",x.inicio(),"fin",x.fin(),"medico",x.odontologoUsuarioId(),"sillon",x.sillonId()))==null,
    "Existen citas activas dentro del bloqueo; reprogramar antes de bloquear");
  UUID id=db.id();
  db.exec("INSERT INTO bloqueos_agenda(id,odontologo_usuario_id,sillon_id,inicio,fin,motivo,aprobado_por) " +
    "VALUES(:id,:m,:s,:i,:f,:o,:u)",BaseDatos.m("id",id,"m",x.odontologoUsuarioId(),"s",x.sillonId(),
       "i",x.inicio(),"f",x.fin(),"o",x.motivo(),"u",db.uid()));
  db.audit("AGENDA","BLOQUEAR_AGENDA","bloqueos_agenda",id);
  return Map.of("id",id);
 }
}
