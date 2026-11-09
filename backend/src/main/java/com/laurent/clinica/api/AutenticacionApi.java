package com.laurent.clinica.api;
import com.laurent.clinica.servicio.BaseDatos;
import io.jsonwebtoken.Jwts;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import java.util.*;
import java.time.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import java.util.Base64;

@RestController
@RequestMapping("/api/autenticacion")
public class AutenticacionApi {
 private final BaseDatos db;
 private final PasswordEncoder encoder;
 private final byte[] key;
 private final int expiry;
 public AutenticacionApi(BaseDatos db,PasswordEncoder encoder,@Value("${jwt.secret}") String secret,
      @Value("${jwt.expiration-hours:8}") int expiry) {
  this.db=db;this.encoder=encoder;this.key=Base64.getDecoder().decode(secret);this.expiry=expiry;
 }
 public record Login(@NotBlank String usuario,@NotBlank String contrasena){}
 @PostMapping("/iniciar-sesion")
 public Map<String,Object> login(@Valid @RequestBody Login request) {
  var u=db.maybe("SELECT id,username,nombre,rol,activo,password_hash FROM usuarios WHERE username=:u",BaseDatos.m("u",request.usuario()));
  if(u==null || !(Boolean)u.get("activo") || !encoder.matches(request.contrasena(),(String)u.get("password_hash")))
    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales incorrectas");
  String token=Jwts.builder().subject(u.get("id").toString()).claim("rol",u.get("rol").toString())
    .issuedAt(new Date()).expiration(Date.from(Instant.now().plusSeconds(expiry*3600L)))
    .signWith(Keys.hmacShaKeyFor(key)).compact();
  return Map.of("token",token,"usuario",Map.of("id",u.get("id"),"nombre",u.get("nombre"),"rol",u.get("rol")));
 }
 @GetMapping("/yo")
 public Map<String,Object> yo(){return db.one("SELECT id,username,nombre,rol,correo FROM usuarios WHERE id=:u AND activo=true",BaseDatos.m("u",db.uid()));}
}
