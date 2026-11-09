package com.laurent.clinica.api;
import com.laurent.clinica.servicio.BaseDatos;
import com.laurent.clinica.dominio.ReglasAgenda;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/agenda")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','MEDICO','RECEPCIONISTA')")
public class AgendaApi {
 private final BaseDatos db;
 private static LocalTime hora(Object valor){
  if(valor instanceof LocalTime t)return t;
  if(valor instanceof java.sql.Time t)return t.toLocalTime();
  return LocalTime.parse(valor.toString());
 }
 public AgendaApi(BaseDatos db){this.db=db;}
 @GetMapping("/citas") public List<Map<String,Object>> citas(@RequestParam OffsetDateTime desde,@RequestParam OffsetDateTime hasta){
  BaseDatos.require(desde.isBefore(hasta) && Duration.between(desde,hasta).toDays()<=65,"Intervalo de agenda invalido");
  return db.list("SELECT c.*, CONCAT(p.nombres,' ',p.apellidos) paciente, u.nombre odontologo, s.nombre sillon, t.nombre tratamiento, p.telefono telefono_paciente FROM citas c "+
   "JOIN pacientes p ON c.paciente_id=p.id JOIN usuarios u ON c.odontologo_usuario_id=u.id JOIN sillones s ON c.sillon_id=s.id "+
   "LEFT JOIN catalogo_tratamientos t ON c.tratamiento_id=t.id "+
   "WHERE c.inicio<:hasta AND c.fin>:desde AND (:todos=true OR c.odontologo_usuario_id=:u) ORDER BY c.inicio",
   BaseDatos.m("desde",desde,"hasta",hasta,"todos",!db.role("MEDICO"),"u",db.uid()));
 }
 @GetMapping("/sillones") public List<Map<String,Object>> sillones(){return db.list("SELECT id,sede_id,codigo,nombre FROM sillones WHERE activo=true ORDER BY nombre",Map.of());}
 @GetMapping("/odontologos") public List<Map<String,Object>> odontologos(){return db.list("SELECT u.id usuario_id,u.nombre,o.especialidad,o.color_agenda FROM usuarios u JOIN odontologos o ON o.usuario_id=u.id WHERE u.activo=true ORDER BY u.nombre",Map.of());}
 public record NuevaCita(@NotNull UUID pacienteId,@NotNull UUID odontologoUsuarioId,@NotNull UUID sillonId,
   UUID tratamientoId,@NotNull OffsetDateTime inicio,@NotNull OffsetDateTime fin,String observacion){}
 @PostMapping("/citas") @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')") @Transactional
 public Map<String,Object> reservar(@Valid @RequestBody NuevaCita x){
  BaseDatos.require(x.inicio().isBefore(x.fin()),"La cita debe tener duracion positiva");
  BaseDatos.require(Duration.between(x.inicio(),x.fin()).toMinutes()<=600,"Duracion maxima de cita: 10 horas");
  BaseDatos.require(x.inicio().isAfter(OffsetDateTime.now().minusMinutes(5)),"No se permite reservar en el pasado");
  var doctor=db.maybe("SELECT id FROM usuarios WHERE id=:id AND rol='MEDICO' AND activo=true",BaseDatos.m("id",x.odontologoUsuarioId()));
  BaseDatos.require(doctor!=null,"Seleccione un odontologo activo");
  // Si el odontólogo ya cuenta con horarios semanales aprobados, la cita debe
  // caber íntegramente dentro de al menos uno; sin horarios configurados se
  // preserva el comportamiento de instalación inicial.
  var aprobados=db.list("SELECT dia_semana,desde,hasta FROM disponibilidades_odontologo " +
     "WHERE odontologo_usuario_id=:d AND aprobado=true",BaseDatos.m("d",x.odontologoUsuarioId()));
  if(!aprobados.isEmpty()){
   ZoneId zonaClinica=ZoneId.of("America/Lima");
   boolean disponible=aprobados.stream().anyMatch(h ->
     ReglasAgenda.cubreFranja(x.inicio(),x.fin(),((Number)h.get("dia_semana")).intValue(),
       hora(h.get("desde")),
       hora(h.get("hasta")),zonaClinica));
   BaseDatos.require(disponible,"El horario no está aprobado para este odontólogo");
  }
  var bloqueos=db.one("SELECT count(*) total FROM bloqueos_agenda WHERE (odontologo_usuario_id=:d OR sillon_id=:s) AND inicio<:fin AND fin>:inicio",
    BaseDatos.m("d",x.odontologoUsuarioId(),"s",x.sillonId(),"inicio",x.inicio(),"fin",x.fin()));
  BaseDatos.require(((Number)bloqueos.get("total")).longValue()==0,"Existe un bloqueo de agenda");
  UUID id=db.id();
  // Las exclusiones GiST en PostgreSQL protegen frente a reservas concurrentes aunque pasen la validacion anterior.
  db.exec("INSERT INTO citas(id,paciente_id,odontologo_usuario_id,sillon_id,tratamiento_id,inicio,fin,observacion,creada_por) VALUES(:id,:p,:d,:s,:t,:ini,:fin,:obs,:u)",
    BaseDatos.m("id",id,"p",x.pacienteId(),"d",x.odontologoUsuarioId(),"s",x.sillonId(),"t",x.tratamientoId(),"ini",x.inicio(),"fin",x.fin(),"obs",x.observacion(),"u",db.uid()));
  db.exec("INSERT INTO paciente_profesionales(paciente_id,odontologo_usuario_id) VALUES(:p,:d) ON CONFLICT DO NOTHING",
    BaseDatos.m("p",x.pacienteId(),"d",x.odontologoUsuarioId()));
  db.audit("AGENDA","RESERVA","citas",id);
  return Map.of("id",id,"estado","RESERVADA");
 }
 public record CambioEstado(@NotBlank String estado){}
 @PatchMapping("/citas/{id}/estado") @Transactional
 public void estado(@PathVariable UUID id,@Valid @RequestBody CambioEstado x){
  var cita=db.one("SELECT odontologo_usuario_id,estado FROM citas WHERE id=:i",BaseDatos.m("i",id));
  if(db.role("MEDICO") && !db.uid().equals(cita.get("odontologo_usuario_id")))throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  String from=cita.get("estado").toString();String to=x.estado();
  Map<String,Set<String>> allowed=Map.of(
   "RESERVADA",Set.of("CONFIRMADA","CANCELADA","PRESENTE","NO_ASISTIO"),
   "CONFIRMADA",Set.of("PRESENTE","CANCELADA","NO_ASISTIO"),
   "PRESENTE",Set.of("EN_ATENCION","CANCELADA"),
   "EN_ATENCION",Set.of("COMPLETADA"),
   "COMPLETADA",Set.of(),"CANCELADA",Set.of(),"NO_ASISTIO",Set.of());
  BaseDatos.require(allowed.getOrDefault(from,Set.of()).contains(to),"Transicion de estado no permitida");
  db.exec("UPDATE citas SET estado=:e,confirmada_en=CASE WHEN :e='CONFIRMADA' THEN now() ELSE confirmada_en END WHERE id=:i AND estado=:actual",
    BaseDatos.m("e",to,"i",id,"actual",from));
  db.audit("AGENDA","ESTADO_"+to,"citas",id);
 }
}
