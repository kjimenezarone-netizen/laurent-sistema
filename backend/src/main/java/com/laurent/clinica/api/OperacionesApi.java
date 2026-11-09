package com.laurent.clinica.api;
import com.laurent.clinica.servicio.BaseDatos;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.time.*;
import java.math.*;

@RestController
@RequestMapping("/api/operaciones")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA','MEDICO')")
public class OperacionesApi {
 private final BaseDatos db;public OperacionesApi(BaseDatos db){this.db=db;}
 @GetMapping("/inventario") @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
 public List<Map<String,Object>> inventario(){return db.list("SELECT i.id,i.codigo,i.nombre,i.unidad,i.minimo,COALESCE(sum(l.cantidad),0) stock FROM insumos i LEFT JOIN lotes_insumos l ON l.insumo_id=i.id WHERE i.activo=true GROUP BY i.id ORDER BY i.nombre",Map.of());}
 public record Insumo(@NotBlank String codigo,@NotBlank String nombre,String unidad,@NotNull @DecimalMin("0") BigDecimal minimo){}
 @PostMapping("/inventario") @PreAuthorize("hasRole('ADMINISTRADOR')")
 public Map<String,Object> insumo(@Valid @RequestBody Insumo x){
  UUID id=db.id();db.exec("INSERT INTO insumos(id,codigo,nombre,unidad,minimo) VALUES(:id,:c,:n,:u,:m)",BaseDatos.m("id",id,"c",x.codigo(),"n",x.nombre(),"u",x.unidad(),"m",x.minimo()));
  db.audit("INVENTARIO","INSUMO","insumos",id);return Map.of("id",id);
 }
 public record Lote(@NotNull UUID insumoId,String numeroLote,LocalDate vencimiento,
    @NotNull @DecimalMin("0") BigDecimal cantidad,@NotNull @DecimalMin("0") BigDecimal costoUnitario,UUID sedeId){}
 @PostMapping("/inventario/lotes") @PreAuthorize("hasRole('ADMINISTRADOR')") @Transactional
 public Map<String,Object> nuevoLote(@Valid @RequestBody Lote x){
  UUID id=db.id();
  db.exec("INSERT INTO lotes_insumos(id,insumo_id,numero_lote,vencimiento,cantidad,costo_unitario,sede_id) VALUES(:id,:i,:n,:v,:c,:co,:s)",
    BaseDatos.m("id",id,"i",x.insumoId(),"n",x.numeroLote(),"v",x.vencimiento(),"c",x.cantidad(),"co",x.costoUnitario(),"s",x.sedeId()));
  db.audit("INVENTARIO","NUEVO_LOTE","lotes_insumos",id);return Map.of("id",id);
 }
 @GetMapping("/inventario/lotes") @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
 public List<Map<String,Object>> lotes(){return db.list("SELECT l.*,i.nombre insumo FROM lotes_insumos l JOIN insumos i ON i.id=l.insumo_id ORDER BY l.vencimiento NULLS LAST",Map.of());}
 public record Movimiento(@NotNull UUID loteId,@NotBlank String tipo,@NotNull @DecimalMin("0.001") BigDecimal cantidad,String motivo){}
 @PostMapping("/inventario/movimientos") @PreAuthorize("hasRole('ADMINISTRADOR')") @Transactional
 public Map<String,Object> movimiento(@Valid @RequestBody Movimiento x){
  BaseDatos.require(Set.of("ENTRADA","SALIDA").contains(x.tipo()),"Solo entrada o salida en este modulo");
  var l=db.one("SELECT cantidad,vencimiento FROM lotes_insumos WHERE id=:id FOR UPDATE",BaseDatos.m("id",x.loteId()));
  BigDecimal actual=(BigDecimal)l.get("cantidad");
  if("SALIDA".equals(x.tipo())){
   BaseDatos.require(actual.compareTo(x.cantidad())>=0,"Stock insuficiente");
   BaseDatos.require(l.get("vencimiento")==null || !((java.sql.Date)l.get("vencimiento")).toLocalDate().isBefore(LocalDate.now()),"Lote vencido");
  }
  BigDecimal nuevo="ENTRADA".equals(x.tipo())?actual.add(x.cantidad()):actual.subtract(x.cantidad());
  db.exec("UPDATE lotes_insumos SET cantidad=:c WHERE id=:id",BaseDatos.m("c",nuevo,"id",x.loteId()));
  UUID id=db.id();db.exec("INSERT INTO movimientos_inventario(id,lote_id,tipo,cantidad,motivo,autor_id) VALUES(:id,:l,:t,:c,:m,:u)",BaseDatos.m("id",id,"l",x.loteId(),"t",x.tipo(),"c",x.cantidad(),"m",x.motivo(),"u",db.uid()));
  db.audit("INVENTARIO","MOVIMIENTO_"+x.tipo(),"movimientos_inventario",id);return Map.of("id",id,"stockRestante",nuevo);
 }
 @GetMapping("/laboratorio") public List<Map<String,Object>> laboratorio(){
  return db.list("SELECT o.id,o.paciente_id,o.trabajo,o.laboratorio,o.fecha_entrega,o.estado,p.nombres,p.apellidos FROM ordenes_laboratorio o JOIN pacientes p ON p.id=o.paciente_id WHERE (:todos=true OR o.odontologo_usuario_id=:u) ORDER BY o.creado_en DESC LIMIT 100",
    BaseDatos.m("todos",!db.role("MEDICO"),"u",db.uid()));
 }
 public record Orden(@NotNull UUID pacienteId,@NotBlank String trabajo,String laboratorio,Integer piezaFdi,LocalDate fechaEntrega,String observacion){}
 @PostMapping("/laboratorio") @PreAuthorize("hasRole('MEDICO')")
 public Map<String,Object> orden(@Valid @RequestBody Orden x){
  db.validarAccesoClinico(x.pacienteId());UUID id=db.id();
  db.exec("INSERT INTO ordenes_laboratorio(id,paciente_id,odontologo_usuario_id,laboratorio,trabajo,pieza_fdi,fecha_entrega,observacion) VALUES(:id,:p,:u,:l,:t,:fdi,:f,:o)",
    BaseDatos.m("id",id,"p",x.pacienteId(),"u",db.uid(),"l",x.laboratorio(),"t",x.trabajo(),"fdi",x.piezaFdi(),"f",x.fechaEntrega(),"o",x.observacion()));
  db.audit("LABORATORIO","ORDEN","ordenes_laboratorio",id);return Map.of("id",id);
 }
 @GetMapping("/esterilizacion") @PreAuthorize("hasRole('ADMINISTRADOR')")
 public List<Map<String,Object>> esterilizacion(){return db.list("SELECT * FROM ciclos_esterilizacion ORDER BY inicio DESC LIMIT 100",Map.of());}
 public record Ciclo(@NotBlank String equipo,@NotNull OffsetDateTime inicio,OffsetDateTime fin,
    @NotBlank String resultado,String observaciones){}
 @PostMapping("/esterilizacion") @PreAuthorize("hasRole('ADMINISTRADOR')")
 public Map<String,Object> esterilizar(@Valid @RequestBody Ciclo x){
  BaseDatos.require(Set.of("PENDIENTE","APROBADO","RECHAZADO").contains(x.resultado()),"Resultado invalido");
  UUID id=db.id();db.exec("INSERT INTO ciclos_esterilizacion(id,equipo,inicio,fin,resultado,responsable_id,observaciones) VALUES(:id,:e,:i,:f,:r,:u,:o)",
    BaseDatos.m("id",id,"e",x.equipo(),"i",x.inicio(),"f",x.fin(),"r",x.resultado(),"u",db.uid(),"o",x.observaciones()));
  db.audit("ESTERILIZACION","REGISTRAR_CICLO","ciclos_esterilizacion",id);return Map.of("id",id);
 }
 @GetMapping("/comunicaciones") @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
 public List<Map<String,Object>> comunicaciones(){return db.list("SELECT * FROM mensajes_salida ORDER BY creado_en DESC LIMIT 100",Map.of());}
 @GetMapping("/auditoria") @PreAuthorize("hasRole('ADMINISTRADOR')")
 public List<Map<String,Object>> auditoria(){return db.list("SELECT * FROM auditoria_eventos ORDER BY creado_en DESC LIMIT 300",Map.of());}
}
