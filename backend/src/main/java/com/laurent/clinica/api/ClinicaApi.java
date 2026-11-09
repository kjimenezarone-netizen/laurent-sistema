package com.laurent.clinica.api;
import com.laurent.clinica.servicio.BaseDatos;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;
import java.math.*;

@RestController
@RequestMapping("/api/clinica")
@PreAuthorize("hasRole('MEDICO')")
public class ClinicaApi {
 private final BaseDatos db;
 public ClinicaApi(BaseDatos db){this.db=db;}
 private void acceso(UUID p){db.validarAccesoClinico(p);}
 @GetMapping("/pacientes/{pacienteId}/resumen") public Map<String,Object> resumen(@PathVariable UUID pacienteId){
  acceso(pacienteId);
  return Map.of("paciente",db.one("SELECT id,nombres,apellidos,fecha_nacimiento,alergias,antecedentes_alertas,contacto_emergencia FROM pacientes WHERE id=:p",BaseDatos.m("p",pacienteId)),
   "atenciones",db.one("SELECT count(*) total FROM atenciones_clinicas WHERE paciente_id=:p",BaseDatos.m("p",pacienteId)).get("total"),
   "hallazgos",db.one("SELECT count(*) total FROM hallazgos_odontograma WHERE paciente_id=:p",BaseDatos.m("p",pacienteId)).get("total"));
 }
 @GetMapping("/pacientes/{pacienteId}/timeline") public List<Map<String,Object>> timeline(@PathVariable UUID pacienteId){
  acceso(pacienteId);
  return db.list("SELECT 'ATENCION' tipo,id,creada_en fecha,motivo_consulta titulo,estado detalle FROM atenciones_clinicas WHERE paciente_id=:p " +
   "UNION ALL SELECT 'HALLAZGO' tipo,id,registrado_en fecha,tipo titulo,estado detalle FROM hallazgos_odontograma WHERE paciente_id=:p " +
   "UNION ALL SELECT 'DOCUMENTO' tipo,id,creado_en fecha,nombre_original titulo,tipo detalle FROM archivos_clinicos WHERE paciente_id=:p ORDER BY fecha DESC LIMIT 150",BaseDatos.m("p",pacienteId));
 }
 @GetMapping("/pacientes/{pacienteId}/anamnesis") public List<Map<String,Object>> anamnesis(@PathVariable UUID pacienteId){
  acceso(pacienteId);return db.list("SELECT * FROM anamnesis WHERE paciente_id=:p ORDER BY registrada_en DESC LIMIT 30",BaseDatos.m("p",pacienteId));
 }
 public record Anamnesis(UUID pacienteId,String enfermedades,String medicamentos,String alergias,String antecedentesFamiliares,String observaciones,boolean validada){}
 @PostMapping("/anamnesis") @Transactional public Map<String,Object> guardarAnamnesis(@Valid @RequestBody Anamnesis x){
  BaseDatos.require(x.pacienteId()!=null,"Paciente requerido");acceso(x.pacienteId());UUID id=db.id();
  db.exec("INSERT INTO anamnesis(id,paciente_id,registrada_por,enfermedades,medicamentos,alergias,antecedentes_familiares,observaciones,validada) VALUES(:id,:p,:u,:e,:m,:a,:f,:o,:v)",
    BaseDatos.m("id",id,"p",x.pacienteId(),"u",db.uid(),"e",x.enfermedades(),"m",x.medicamentos(),"a",x.alergias(),"f",x.antecedentesFamiliares(),"o",x.observaciones(),"v",x.validada()));
  // Alertas clínicas sólo actualizadas tras validación por un profesional autorizado.
  if(x.validada())db.exec("UPDATE pacientes SET alergias=:a,antecedentes_alertas=:e,actualizado_en=now() WHERE id=:p",
    BaseDatos.m("a",x.alergias(),"e",x.enfermedades(),"p",x.pacienteId()));
  db.audit("CLINICA","ANAMNESIS","anamnesis",id);return Map.of("id",id);
 }
 @GetMapping("/pacientes/{pacienteId}/atenciones") public List<Map<String,Object>> atenciones(@PathVariable UUID pacienteId){
  acceso(pacienteId);
  return db.list("SELECT a.*,u.nombre profesional FROM atenciones_clinicas a JOIN usuarios u ON u.id=a.odontologo_usuario_id WHERE paciente_id=:p ORDER BY creada_en DESC",BaseDatos.m("p",pacienteId));
 }
 public record Atencion(@NotNull UUID pacienteId,UUID citaId,@NotBlank String motivoConsulta,String diagnostico,String diagnosticoCie10,
 @NotBlank String procedimiento,String indicaciones,boolean firmar){}
 @PostMapping("/atenciones") @Transactional public Map<String,Object> registrar(@Valid @RequestBody Atencion x) throws Exception {
  acceso(x.pacienteId());UUID id=db.id();
  if(x.citaId()!=null) {
   var row=db.one("SELECT paciente_id,odontologo_usuario_id FROM citas WHERE id=:i",BaseDatos.m("i",x.citaId()));
   BaseDatos.require(x.pacienteId().equals(row.get("paciente_id")) && db.uid().equals(row.get("odontologo_usuario_id")),"La cita no corresponde a la atencion");
  }
  OffsetDateTime firmada=x.firmar()?OffsetDateTime.now(ZoneOffset.UTC).withNano(0):null;
  String signed=firmada==null?null:firmada.toInstant().toString();
  String checksum=x.firmar()?HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(
    (x.pacienteId()+"|"+db.uid()+"|"+x.motivoConsulta()+"|"+x.diagnostico()+"|"+
     x.diagnosticoCie10()+"|"+x.procedimiento()+"|"+x.indicaciones()+"|"+signed).getBytes(StandardCharsets.UTF_8))):null;
  // Se registra huella de integridad. NO constituye firma digital certificada por sí sola.
  db.exec("INSERT INTO atenciones_clinicas(id,paciente_id,cita_id,odontologo_usuario_id,motivo_consulta,diagnostico,diagnostico_cie10,procedimiento,indicaciones,estado,firmada_en,firma_hash) " +
      "VALUES(:id,:p,:c,:u,:mot,:d,:cie,:pr,:ind,:estado,:firma,:hash)",
      BaseDatos.m("id",id,"p",x.pacienteId(),"c",x.citaId(),"u",db.uid(),"mot",x.motivoConsulta(),"d",x.diagnostico(),"cie",x.diagnosticoCie10(),
        "pr",x.procedimiento(),"ind",x.indicaciones(),"estado",x.firmar()?"FIRMADA":"BORRADOR", "firma",firmada,"hash",checksum));
  db.audit("CLINICA",x.firmar()?"ATENCION_CERRADA":"ATENCION_BORRADOR","atenciones_clinicas",id);
  return Map.of("id",id);
 }
 @PatchMapping("/atenciones/{id}/borrador") @Transactional public void editarBorrador(@PathVariable UUID id,@Valid @RequestBody Atencion x){
  acceso(x.pacienteId());
  var old=db.one("SELECT paciente_id,odontologo_usuario_id,estado FROM atenciones_clinicas WHERE id=:id FOR UPDATE",BaseDatos.m("id",id));
  BaseDatos.require(x.pacienteId().equals(old.get("paciente_id"))&&db.uid().equals(old.get("odontologo_usuario_id")),"Atencion no corresponde al autor");
  BaseDatos.require("BORRADOR".equals(old.get("estado")),"Solo se puede editar un borrador");
  db.exec("UPDATE atenciones_clinicas SET motivo_consulta=:m,diagnostico=:d,diagnostico_cie10=:cie,procedimiento=:p,indicaciones=:i WHERE id=:id",
      BaseDatos.m("id",id,"m",x.motivoConsulta(),"d",x.diagnostico(),"cie",x.diagnosticoCie10(),"p",x.procedimiento(),"i",x.indicaciones()));
  db.audit("CLINICA","EDITAR_BORRADOR","atenciones_clinicas",id);
 }
 @PostMapping("/atenciones/{id}/cerrar") @Transactional public Map<String,Object> cerrar(@PathVariable UUID id) throws Exception{
  var a=db.one("SELECT * FROM atenciones_clinicas WHERE id=:id FOR UPDATE",BaseDatos.m("id",id));
  acceso((UUID)a.get("paciente_id"));BaseDatos.require(db.uid().equals(a.get("odontologo_usuario_id")),"Solo el autor cierra la atencion");
  BaseDatos.require("BORRADOR".equals(a.get("estado")),"La atencion ya esta cerrada");
  OffsetDateTime fecha=OffsetDateTime.now(ZoneOffset.UTC).withNano(0);
  String canonical=a.get("paciente_id")+"|"+db.uid()+"|"+a.get("motivo_consulta")+"|"+a.get("diagnostico")+"|"+
      a.get("diagnostico_cie10")+"|"+a.get("procedimiento")+"|"+a.get("indicaciones")+"|"+fecha.toInstant();
  String checksum=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(canonical.getBytes(StandardCharsets.UTF_8)));
  db.exec("UPDATE atenciones_clinicas SET estado='FIRMADA',firmada_en=:f,firma_hash=:h WHERE id=:id",
      BaseDatos.m("id",id,"f",fecha,"h",checksum));
  db.audit("CLINICA","CERRAR_ATENCION","atenciones_clinicas",id);
  return Map.of("id",id,"huellaIntegridad",checksum,"aclaracion","No es firma digital certificada");
 }
 public record Rectificacion(@NotBlank String motivo,@NotBlank String textoRectificacion){}
 @PostMapping("/atenciones/{id}/rectificaciones") @Transactional public Map<String,Object> rectificar(@PathVariable UUID id,@Valid @RequestBody Rectificacion x){
  var a=db.one("SELECT paciente_id,odontologo_usuario_id,estado FROM atenciones_clinicas WHERE id=:i",BaseDatos.m("i",id));
  acceso((UUID)a.get("paciente_id"));BaseDatos.require(db.uid().equals(a.get("odontologo_usuario_id")),"Solo autor puede rectificar");
  BaseDatos.require(!"BORRADOR".equals(a.get("estado")),"La atencion es borrador");
  UUID r=db.id();
  db.exec("INSERT INTO rectificaciones_clinicas(id,atencion_id,autor_id,motivo,texto_rectificacion) VALUES(:id,:a,:u,:m,:t)",
    BaseDatos.m("id",r,"a",id,"u",db.uid(),"m",x.motivo(),"t",x.textoRectificacion()));
  db.exec("UPDATE atenciones_clinicas SET estado='RECTIFICADA' WHERE id=:id",BaseDatos.m("id",id));
  db.audit("CLINICA","RECTIFICAR","atenciones_clinicas",id);return Map.of("id",r);
 }
 @GetMapping("/pacientes/{pacienteId}/odontograma") public List<Map<String,Object>> odontograma(@PathVariable UUID pacienteId){
  acceso(pacienteId);return db.list("SELECT * FROM hallazgos_odontograma WHERE paciente_id=:p ORDER BY registrado_en",BaseDatos.m("p",pacienteId));
 }
 public record Hallazgo(@NotNull UUID pacienteId,@NotNull int piezaFdi,@NotBlank String superficie,@NotBlank String tipo,
   @NotBlank String estado,String observacion,UUID atencionId,UUID rectificaA){}
 private static boolean fdi(int x){int q=x/10,p=x%10;return q>=1&&q<=8&&p>=1&&p<=(q<=4?8:5);}
 @PostMapping("/odontograma") @Transactional public Map<String,Object> hallazgo(@Valid @RequestBody Hallazgo x){
  acceso(x.pacienteId());BaseDatos.require(fdi(x.piezaFdi()),"FDI invalido");
  BaseDatos.require(Set.of("GENERAL","VESTIBULAR","LINGUAL","PALATINO","INCISAL","OCLUSAL","MESIAL","DISTAL").contains(x.superficie()),"Superficie invalida");
  BaseDatos.require(Set.of("CARIES","RESTAURACION","SELLANTE","CORONA","ENDODONCIA","IMPLANTE","FRACTURA","PIEZA_AUSENTE","PROTESIS").contains(x.tipo()),"Hallazgo invalido");
  BaseDatos.require(Set.of("EXISTENTE","PLANIFICADO","REALIZADO").contains(x.estado()),"Estado invalido");
  // Impide vincular un hallazgo con atenciones u otros hallazgos de pacientes ajenos.
  if(x.atencionId()!=null){
   var at=db.one("SELECT paciente_id FROM atenciones_clinicas WHERE id=:id",BaseDatos.m("id",x.atencionId()));
   BaseDatos.require(x.pacienteId().equals(at.get("paciente_id")),"Atencion de otro paciente");
  }
  if(x.rectificaA()!=null){
   var anterior=db.one("SELECT paciente_id FROM hallazgos_odontograma WHERE id=:id",BaseDatos.m("id",x.rectificaA()));
   BaseDatos.require(x.pacienteId().equals(anterior.get("paciente_id")),"No se puede rectificar un hallazgo ajeno");
   BaseDatos.require(db.maybe("SELECT id FROM hallazgos_odontograma WHERE rectifica_a=:id",BaseDatos.m("id",x.rectificaA()))==null,
       "El hallazgo ya fue rectificado");
  }
  UUID id=db.id();
  db.exec("INSERT INTO hallazgos_odontograma(id,paciente_id,odontologo_usuario_id,pieza_fdi,superficie,tipo,estado,observacion,atencion_id,rectifica_a) " +
       "VALUES(:id,:p,:u,:fdi,:s,:t,:e,:o,:a,:r)",
    BaseDatos.m("id",id,"p",x.pacienteId(),"u",db.uid(),"fdi",x.piezaFdi(),"s",x.superficie(),"t",x.tipo(),"e",x.estado(),"o",x.observacion(),"a",x.atencionId(),"r",x.rectificaA()));
  db.audit("CLINICA","ODONTOGRAMA","hallazgos_odontograma",id);return Map.of("id",id);
 }
 @GetMapping("/pacientes/{pacienteId}/periodontograma") public List<Map<String,Object>> periodontograma(@PathVariable UUID pacienteId){
  acceso(pacienteId);return db.list("SELECT p.id,p.registrado_en,p.observacion FROM periodontogramas p WHERE paciente_id=:p ORDER BY registrado_en DESC",BaseDatos.m("p",pacienteId));
 }
 @GetMapping("/periodontograma/{examenId}/sitios") public List<Map<String,Object>> periodontoSitios(@PathVariable UUID examenId){
  var p=db.one("SELECT paciente_id FROM periodontogramas WHERE id=:id",BaseDatos.m("id",examenId));acceso((UUID)p.get("paciente_id"));
  return db.list("SELECT * FROM periodontograma_sitios WHERE examen_id=:i ORDER BY pieza_fdi,sitio",BaseDatos.m("i",examenId));
 }
 public record Sitio(@Min(11) int piezaFdi,@NotBlank String sitio,Integer sondajeMm,Integer recesionMm,boolean sangrado,boolean placa,boolean supuracion){}
 public record Periodonto(@NotNull UUID pacienteId,String observacion,@NotEmpty List<@Valid Sitio> sitios){}
 @PostMapping("/periodontograma") @Transactional public Map<String,Object> nuevoPeriodonto(@Valid @RequestBody Periodonto x){
  acceso(x.pacienteId());UUID id=db.id();
  db.exec("INSERT INTO periodontogramas(id,paciente_id,odontologo_usuario_id,observacion) VALUES(:id,:p,:u,:o)",BaseDatos.m("id",id,"p",x.pacienteId(),"u",db.uid(),"o",x.observacion()));
  for(var s:x.sitios()){
   BaseDatos.require(fdi(s.piezaFdi())&&Set.of("MV","V","DV","ML","L","DL").contains(s.sitio()),"Sitio periodontal invalido");
   db.exec("INSERT INTO periodontograma_sitios(examen_id,pieza_fdi,sitio,sondaje_mm,recesion_mm,sangrado,placa,supuracion) VALUES(:e,:p,:s,:son,:rec,:sa,:pl,:su)",
     BaseDatos.m("e",id,"p",s.piezaFdi(),"s",s.sitio(),"son",s.sondajeMm(),"rec",s.recesionMm(),"sa",s.sangrado(),"pl",s.placa(),"su",s.supuracion()));
  }
  db.audit("CLINICA","PERIODONTOGRAMA","periodontogramas",id);return Map.of("id",id);
 }
 @GetMapping("/pacientes/{pacienteId}/saldo-consulta") public Map<String,Object> saldoConsulta(@PathVariable UUID pacienteId){
  acceso(pacienteId);
  return db.one("SELECT paciente_id,total_cargos,total_pagado,deuda,saldo_a_favor FROM v_cuenta_paciente WHERE paciente_id=:p",BaseDatos.m("p",pacienteId));
 }
 @GetMapping("/pacientes/{pacienteId}/consentimientos") public List<Map<String,Object>> consentimientos(@PathVariable UUID pacienteId){
  acceso(pacienteId);return db.list("SELECT id,plantilla_codigo,version_documento,documento_sha256,firma_modalidad,firmante_nombre,firmado_en,creado_en FROM consentimientos WHERE paciente_id=:p ORDER BY creado_en DESC",BaseDatos.m("p",pacienteId));
 }
 public record Consentimiento(@NotNull UUID pacienteId,UUID atencionId,@NotBlank String plantillaCodigo,int versionDocumento,String documentoSha256){}
 @PostMapping("/consentimientos/borrador") @Transactional public Map<String,Object> consentimiento(@Valid @RequestBody Consentimiento x){
  acceso(x.pacienteId());UUID id=db.id();
  if(x.atencionId()!=null){
   var at=db.one("SELECT paciente_id FROM atenciones_clinicas WHERE id=:i",BaseDatos.m("i",x.atencionId()));
   BaseDatos.require(x.pacienteId().equals(at.get("paciente_id")),"Atencion de otro paciente");
  }
  db.exec("INSERT INTO consentimientos(id,paciente_id,atencion_id,plantilla_codigo,version_documento,documento_sha256,creado_por) VALUES(:id,:p,:a,:c,:v,:sha,:u)",
    BaseDatos.m("id",id,"p",x.pacienteId(),"a",x.atencionId(),"c",x.plantillaCodigo(),"v",Math.max(1,x.versionDocumento()),"sha",x.documentoSha256(),"u",db.uid()));
  db.audit("CLINICA","CONSENTIMIENTO_BORRADOR","consentimientos",id);
  return Map.of("id",id,"estado","BORRADOR_SIN_FIRMA");
 }
 @GetMapping("/pacientes/{pacienteId}/planes") public List<Map<String,Object>> planes(@PathVariable UUID pacienteId){
  acceso(pacienteId);return db.list("SELECT * FROM planes_tratamiento WHERE paciente_id=:p ORDER BY creado_en DESC",BaseDatos.m("p",pacienteId));
 }
 public record ItemPlan(@NotNull UUID tratamientoId,Integer piezaFdi,@Min(1) int cantidad,@NotNull @DecimalMin("0") BigDecimal precioUnitario){}
 public record Plan(@NotNull UUID pacienteId,String observaciones,@NotEmpty List<@Valid ItemPlan> items){}
 @PostMapping("/planes") @Transactional public Map<String,Object> plan(@Valid @RequestBody Plan x){
  acceso(x.pacienteId());UUID id=db.id();
  db.exec("INSERT INTO planes_tratamiento(id,paciente_id,odontologo_usuario_id,observaciones) VALUES(:id,:p,:u,:o)",BaseDatos.m("id",id,"p",x.pacienteId(),"u",db.uid(),"o",x.observaciones()));
  for(var item:x.items()){
   BaseDatos.require(item.piezaFdi()==null || fdi(item.piezaFdi()),"Pieza FDI del plan no válida");
   db.exec("INSERT INTO plan_items(plan_id,tratamiento_id,pieza_fdi,cantidad,precio_unitario) VALUES(:p,:t,:d,:c,:v)",BaseDatos.m("p",id,"t",item.tratamientoId(),"d",item.piezaFdi(),"c",item.cantidad(),"v",item.precioUnitario()));
  }
  db.audit("CLINICA","PLAN_TRATAMIENTO","planes_tratamiento",id);return Map.of("id",id);
 }

 // Consulta financiera solo para el profesional vinculado; nunca permite cobrar ni editar saldos.
 @GetMapping("/pacientes/{pacienteId}/movimientos-cuenta")
 public List<Map<String,Object>> movimientosCuenta(@PathVariable UUID pacienteId){
  acceso(pacienteId);
  return db.list("SELECT tipo,id,descripcion,fecha,cargo,abono, " +
    "SUM(cargo - abono) OVER (ORDER BY fecha,orden,id) AS saldo_acumulado FROM (" +
    "SELECT 'CARGO'::text tipo,c.id,COALESCE(t.nombre,c.descripcion) descripcion, " +
    "COALESCE(a.creada_en,c.creado_en) fecha,c.importe cargo,0::numeric abono,1 orden " +
    "FROM cargos_cuenta c LEFT JOIN atenciones_clinicas a ON a.id=c.atencion_id " +
    "LEFT JOIN catalogo_tratamientos t ON t.id=c.tratamiento_id " +
    "WHERE c.paciente_id=:p AND c.estado='VIGENTE' " +
    "UNION ALL " +
    "SELECT 'ABONO'::text tipo,p.id,concat('Pago ',p.metodo) descripcion,p.pagado_en fecha, " +
    "0::numeric cargo,p.monto abono,2 orden FROM pagos p " +
    "WHERE p.paciente_id=:p AND p.estado='CONFIRMADO'" +
    ") mov ORDER BY fecha,orden,id",BaseDatos.m("p",pacienteId));
 }
 @GetMapping("/pacientes/{pacienteId}/presupuestos")
 public List<Map<String,Object>> presupuestos(@PathVariable UUID pacienteId){
  acceso(pacienteId);
  return db.list("SELECT p.id,p.version,p.estado,p.observaciones,p.creado_en, " +
    "COALESCE(sum(i.cantidad * i.precio_unitario),0) monto_total,count(i.id) cantidad_items " +
    "FROM planes_tratamiento p LEFT JOIN plan_items i ON i.plan_id=p.id " +
    "WHERE p.paciente_id=:p GROUP BY p.id,p.version,p.estado,p.observaciones,p.creado_en " +
    "ORDER BY p.creado_en DESC",BaseDatos.m("p",pacienteId));
 }
 @GetMapping("/planes/{planId}/items")
 public List<Map<String,Object>> itemsPlan(@PathVariable UUID planId){
  var plan=db.one("SELECT paciente_id FROM planes_tratamiento WHERE id=:id",BaseDatos.m("id",planId));
  acceso((UUID)plan.get("paciente_id"));
  return db.list("SELECT i.id,i.pieza_fdi,i.cantidad,i.precio_unitario,i.aprobado,i.ejecutado, " +
    "t.nombre tratamiento,(i.cantidad*i.precio_unitario) subtotal " +
    "FROM plan_items i JOIN catalogo_tratamientos t ON t.id=i.tratamiento_id " +
    "WHERE i.plan_id=:id ORDER BY t.nombre,i.pieza_fdi",BaseDatos.m("id",planId));
 }

}
