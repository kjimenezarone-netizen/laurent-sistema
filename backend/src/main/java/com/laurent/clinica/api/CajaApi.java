package com.laurent.clinica.api;
import com.laurent.clinica.servicio.BaseDatos;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.math.*;
import java.util.*;

@RestController
@RequestMapping("/api/caja")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
public class CajaApi {
 private final BaseDatos db;public CajaApi(BaseDatos db){this.db=db;}
 public record Apertura(@DecimalMin("0") BigDecimal montoApertura,UUID sedeId){}
 @PostMapping("/sesiones/abrir") @Transactional public Map<String,Object> abrir(@Valid @RequestBody Apertura x){
  BaseDatos.require(db.maybe("SELECT id FROM sesiones_caja WHERE recepcion_usuario_id=:u AND cierre IS NULL",BaseDatos.m("u",db.uid()))==null,"Ya existe una sesion abierta");
  UUID id=db.id();db.exec("INSERT INTO sesiones_caja(id,recepcion_usuario_id,sede_id,monto_apertura) VALUES(:id,:u,:s,:m)",
    BaseDatos.m("id",id,"u",db.uid(),"s",x.sedeId(),"m",x.montoApertura()==null?BigDecimal.ZERO:x.montoApertura()));
  db.audit("CAJA","APERTURA","sesiones_caja",id);return Map.of("id",id);
 }
 @PostMapping("/sesiones/cerrar") @Transactional public void cerrar(@RequestBody Map<String,Object> x){
  BigDecimal monto=new BigDecimal(x.getOrDefault("montoCierre","0").toString());BaseDatos.require(monto.signum()>=0,"Monto invalido");
  int c=db.exec("UPDATE sesiones_caja SET cierre=now(),monto_cierre=:m WHERE recepcion_usuario_id=:u AND cierre IS NULL",BaseDatos.m("m",monto,"u",db.uid()));
  BaseDatos.require(c==1,"No existe una sesion abierta");
 }
 @GetMapping("/sesiones/actual") public Map<String,Object> actual(){
  Map<String,Object> s=db.maybe("SELECT * FROM sesiones_caja WHERE recepcion_usuario_id=:u AND cierre IS NULL",BaseDatos.m("u",db.uid()));
  return s==null?Map.of("abierta",false):s;
 }
 public record Cargo(@NotNull UUID pacienteId,UUID atencionId,UUID tratamientoId,@NotBlank String descripcion,
      @NotNull @DecimalMin(value="0.01") BigDecimal importe){}
 @PostMapping("/cargos") @Transactional public Map<String,Object> cargo(@Valid @RequestBody Cargo x){
  if(x.atencionId()!=null){
   var a=db.one("SELECT paciente_id FROM atenciones_clinicas WHERE id=:i",BaseDatos.m("i",x.atencionId()));
   BaseDatos.require(x.pacienteId().equals(a.get("paciente_id")),"Atencion de otro paciente");
  }
  UUID id=db.id();db.exec("INSERT INTO cargos_cuenta(id,paciente_id,atencion_id,tratamiento_id,descripcion,importe,registrado_por) " +
    "VALUES(:id,:p,:a,:t,:d,:m,:u)",BaseDatos.m("id",id,"p",x.pacienteId(),"a",x.atencionId(),"t",x.tratamientoId(),"d",x.descripcion(),"m",x.importe(),"u",db.uid()));
  db.audit("CAJA","REGISTRAR_CARGO","cargos_cuenta",id);return Map.of("id",id);
 }
 public record Pago(@NotNull UUID pacienteId,@NotNull @DecimalMin(value="0.01") BigDecimal monto,@NotBlank String metodo,String referencia){}
 @PostMapping("/pagos") @Transactional public Map<String,Object> pago(@Valid @RequestBody Pago x,
     @RequestHeader("Idempotency-Key") String idempotencia){
  BaseDatos.require(idempotencia!=null&&idempotencia.length()>=12&&idempotencia.length()<=100,"Clave de idempotencia invalida");
  BaseDatos.require(Set.of("EFECTIVO","YAPE","PLIN","TRANSFERENCIA","TARJETA").contains(x.metodo()),"Metodo de pago invalido");
  // Bloqueo de paciente: serializa la aplicacion de abonos a cargos concurrentes.
  db.one("SELECT id FROM pacientes WHERE id=:p FOR UPDATE",BaseDatos.m("p",x.pacienteId()));
  Map<String,Object> anterior=db.maybe("SELECT id,paciente_id,monto FROM pagos WHERE idempotencia=:k",BaseDatos.m("k",idempotencia));
  if(anterior!=null){
    BaseDatos.require(x.pacienteId().equals(anterior.get("paciente_id")) && x.monto().compareTo((BigDecimal)anterior.get("monto"))==0,"Idempotency-Key ya utilizada con otros datos");
    return Map.of("id",anterior.get("id"),"duplicado",true);
  }
  var sesion=db.maybe("SELECT id FROM sesiones_caja WHERE recepcion_usuario_id=:u AND cierre IS NULL",BaseDatos.m("u",db.uid()));
  BaseDatos.require(sesion!=null,"Debe abrir caja antes de registrar pagos");
  UUID id=db.id();
  db.exec("INSERT INTO pagos(id,paciente_id,sesion_caja_id,monto,metodo,referencia,idempotencia,registrado_por) VALUES(:id,:p,:s,:m,:met,:r,:k,:u)",
    BaseDatos.m("id",id,"p",x.pacienteId(),"s",sesion.get("id"),"m",x.monto(),"met",x.metodo(),"r",x.referencia(),"k",idempotencia,"u",db.uid()));
  BigDecimal rem=x.monto();
  List<Map<String,Object>> cargos=db.list("SELECT c.id,c.importe - COALESCE((SELECT sum(a.monto) FROM aplicaciones_pago a JOIN pagos p ON a.pago_id=p.id WHERE a.cargo_id=c.id AND p.estado='CONFIRMADO'),0) pendiente " +
    "FROM cargos_cuenta c WHERE c.paciente_id=:p AND c.estado='VIGENTE' ORDER BY c.creado_en,c.id FOR UPDATE",
    BaseDatos.m("p",x.pacienteId()));
  for(var c:cargos){
   if(rem.signum()<=0)break;
   BigDecimal pendiente=(BigDecimal)c.get("pendiente");if(pendiente.signum()<=0)continue;
   BigDecimal asignar=rem.min(pendiente);
   db.exec("INSERT INTO aplicaciones_pago(pago_id,cargo_id,monto) VALUES(:p,:c,:m)",BaseDatos.m("p",id,"c",c.get("id"),"m",asignar));
   rem=rem.subtract(asignar);
  }
  db.audit("CAJA","PAGO","pagos",id);
  return Map.of("id",id,"duplicado",false,"creditoSinAplicar",rem);
 }
 @PostMapping("/pagos/{id}/revertir") @PreAuthorize("hasRole('ADMINISTRADOR')") @Transactional
 public void revertir(@PathVariable UUID id,@RequestBody Map<String,String> x){
  String motivo=x.getOrDefault("motivo","").trim();BaseDatos.require(motivo.length()>=8,"Se requiere motivo de reversion");
  int count=db.exec("UPDATE pagos SET estado='REVERTIDO',motivo_reversion=:m WHERE id=:i AND estado='CONFIRMADO'",BaseDatos.m("i",id,"m",motivo));
  BaseDatos.require(count==1,"Pago inexistente o revertido");
  db.audit("CAJA","REVERSION_PAGO","pagos",id);
 }
 @PostMapping("/cargos/{id}/anular") @PreAuthorize("hasRole('ADMINISTRADOR')") @Transactional
 public void anular(@PathVariable UUID id,@RequestBody Map<String,String> x){
  String motivo=x.getOrDefault("motivo","").trim();BaseDatos.require(motivo.length()>=8,"Se requiere motivo de anulacion");
  BaseDatos.require(db.maybe("SELECT 1 ok FROM aplicaciones_pago a JOIN pagos p ON p.id=a.pago_id WHERE a.cargo_id=:c AND p.estado='CONFIRMADO'",BaseDatos.m("c",id))==null,
   "No se puede anular un cargo con pagos aplicados; consulte el procedimiento de reversos");
  BaseDatos.require(db.exec("UPDATE cargos_cuenta SET estado='ANULADO',motivo_anulacion=:m WHERE id=:i AND estado='VIGENTE'",BaseDatos.m("i",id,"m",motivo))==1,"Cargo no anulable");
  db.audit("CAJA","ANULAR_CARGO","cargos_cuenta",id);
 }
 @GetMapping("/pacientes/{pacienteId}/estado") public Map<String,Object> estado(@PathVariable UUID pacienteId){
  var total=db.one("SELECT * FROM v_cuenta_paciente WHERE paciente_id=:p",BaseDatos.m("p",pacienteId));
  var movimientos=db.list("SELECT 'CARGO' tipo,id,descripcion,creado_en fecha,importe cargo,0::numeric abono FROM cargos_cuenta WHERE paciente_id=:p AND estado='VIGENTE' " +
   "UNION ALL SELECT 'ABONO' tipo,id,metodo descripcion,pagado_en fecha,0::numeric cargo,monto abono FROM pagos WHERE paciente_id=:p AND estado='CONFIRMADO' ORDER BY fecha,id",
    BaseDatos.m("p",pacienteId));
  BigDecimal saldo=BigDecimal.ZERO;List<Map<String,Object>> ledger=new ArrayList<>();
  for(var m:movimientos){saldo=saldo.add((BigDecimal)m.get("cargo")).subtract((BigDecimal)m.get("abono"));
    var row=new LinkedHashMap<>(m);row.put("saldoAcumulado",saldo);ledger.add(row);}
  return Map.of("resumen",total,"movimientos",ledger);
 }
 @GetMapping("/pagos/{id}/recibo") public Map<String,Object> recibo(@PathVariable UUID id){
  // Recibo INTERNO. No es boleta/factura electronica SUNAT.
  return db.one("SELECT p.id,p.monto,p.metodo,p.referencia,p.pagado_en,p.estado,c.nombres,c.apellidos,c.numero_documento FROM pagos p JOIN pacientes c ON c.id=p.paciente_id WHERE p.id=:i",BaseDatos.m("i",id));
 }
}
