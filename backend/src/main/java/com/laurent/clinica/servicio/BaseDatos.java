package com.laurent.clinica.servicio;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Component
public class BaseDatos {
 private final NamedParameterJdbcTemplate jdbc;
 public BaseDatos(NamedParameterJdbcTemplate jdbc) {this.jdbc=jdbc;}
 public static Map<String,Object> m(Object... kv) {
  if(kv.length%2!=0) throw new IllegalArgumentException("pares clave-valor");
  Map<String,Object> map=new LinkedHashMap<>();
  for(int i=0;i<kv.length;i+=2) map.put(kv[i].toString(),kv[i+1]);
  return map;
 }
 public List<Map<String,Object>> list(String sql, Map<String,?> p) {return jdbc.queryForList(sql,p);}
 public Map<String,Object> one(String sql,Map<String,?> p) {
  try{return jdbc.queryForMap(sql,p);}catch(EmptyResultDataAccessException e){throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Registro no encontrado");}
 }
 public Map<String,Object> maybe(String sql,Map<String,?> p){
  List<Map<String,Object>> x=list(sql,p);return x.isEmpty()?null:x.get(0);
 }
 public int exec(String sql,Map<String,?> p) {return jdbc.update(sql,p);}
 public UUID id(){return UUID.randomUUID();}
 public UUID uid(){
  try{return UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());}
  catch(Exception e){throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Sesion requerida");}
 }
 public boolean role(String role) {return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_"+role));}
 public void validarAccesoClinico(UUID pacienteId){
  if(!role("MEDICO"))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo personal clinico");
  var x=maybe("SELECT 1 AS ok FROM paciente_profesionales WHERE paciente_id=:p AND odontologo_usuario_id=:u",
     m("p",pacienteId,"u",uid()));
  if(x==null)throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Paciente no asignado al profesional");
 }
 public void audit(String modulo,String accion,String entidad,UUID id) {
  exec("INSERT INTO auditoria_eventos(usuario_id,modulo,accion,entidad,registro_id) VALUES (:u,:m,:a,:e,:i)",m("u",uid(),"m",modulo,"a",accion,"e",entidad,"i",id));
 }
 public static void require(boolean ok,String msg){if(!ok)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,msg);}
}
