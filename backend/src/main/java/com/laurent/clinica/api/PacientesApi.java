package com.laurent.clinica.api;
import com.laurent.clinica.servicio.BaseDatos;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController
@RequestMapping("/api/pacientes")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA','MEDICO')")
public class PacientesApi {
 private final BaseDatos db;
 public PacientesApi(BaseDatos db){this.db=db;}
 @GetMapping public List<Map<String,Object>> listar(@RequestParam(required=false) String q){
  String filtro=q==null?"":q.trim();
  return db.list("SELECT DISTINCT p.id,p.tipo_documento,p.numero_documento,p.nombres,p.apellidos,p.telefono,p.correo,p.alergias,p.antecedentes_alertas FROM pacientes p " +
    "WHERE p.activo=true AND (cast(:q as text)='' OR CONCAT(p.nombres,' ',p.apellidos,' ',COALESCE(p.numero_documento,'')) ILIKE CONCAT('%',:q,'%')) " +
    "AND (:todos=true OR EXISTS(SELECT 1 FROM paciente_profesionales pp WHERE pp.paciente_id=p.id AND pp.odontologo_usuario_id=:u)) " +
    "ORDER BY p.apellidos,p.nombres LIMIT 150",BaseDatos.m("q",filtro,"todos",!db.role("MEDICO"),"u",db.uid()));
 }
 @GetMapping("/{id}") public Map<String,Object> uno(@PathVariable UUID id){
  if(db.role("MEDICO"))db.validarAccesoClinico(id);
  return db.one("SELECT * FROM pacientes WHERE id=:id AND activo=true",BaseDatos.m("id",id));
 }
 public record Paciente(@NotBlank @Size(max=160) String nombres,@NotBlank @Size(max=160) String apellidos,
  String tipoDocumento,@Size(max=30) String numeroDocumento,String telefono,@Email String correo,
  String direccion,String alergias,String antecedentesAlertas,String contactoEmergencia,
  String representanteNombre,String representanteDocumento){}
 @PostMapping @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
 public Map<String,Object> crear(@Valid @RequestBody Paciente x){
  UUID id=db.id();
  db.exec("INSERT INTO pacientes(id,nombres,apellidos,tipo_documento,numero_documento,telefono,correo,direccion,alergias,antecedentes_alertas,contacto_emergencia,representante_nombre,representante_documento,creado_por)"+
   " VALUES (:id,:n,:a,:td,:nd,:t,:e,:d,:al,:an,:ce,:rn,:rd,:u)",
   BaseDatos.m("id",id,"n",x.nombres(),"a",x.apellidos(),"td",x.tipoDocumento()==null?"DNI":x.tipoDocumento(),"nd",x.numeroDocumento(),
     "t",x.telefono(),"e",x.correo(),"d",x.direccion(),"al",x.alergias(),"an",x.antecedentesAlertas(),"ce",x.contactoEmergencia(),"rn",x.representanteNombre(),"rd",x.representanteDocumento(),"u",db.uid()));
  db.audit("PACIENTES","REGISTRO","pacientes",id);return Map.of("id",id);
 }
 @PatchMapping("/{id}") @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
 public void actualizar(@PathVariable UUID id,@Valid @RequestBody Paciente x){
  int n=db.exec("UPDATE pacientes SET nombres=:n,apellidos=:a,tipo_documento=:td,numero_documento=:nd,telefono=:t,correo=:e,direccion=:d,alergias=:al,antecedentes_alertas=:an,contacto_emergencia=:ce,representante_nombre=:rn,representante_documento=:rd,actualizado_en=now() WHERE id=:id AND activo=true",
   BaseDatos.m("id",id,"n",x.nombres(),"a",x.apellidos(),"td",x.tipoDocumento()==null?"DNI":x.tipoDocumento(),"nd",x.numeroDocumento(),
     "t",x.telefono(),"e",x.correo(),"d",x.direccion(),"al",x.alergias(),"an",x.antecedentesAlertas(),"ce",x.contactoEmergencia(),"rn",x.representanteNombre(),"rd",x.representanteDocumento()));
  if(n==0)throw new ResponseStatusException(HttpStatus.NOT_FOUND);
  db.audit("PACIENTES","ACTUALIZAR","pacientes",id);
 }
 @GetMapping("/solicitudes-web") @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
 public List<Map<String,Object>> solicitudes(){return db.list("SELECT * FROM solicitudes_web ORDER BY creado_en DESC LIMIT 150",Map.of());}
}
