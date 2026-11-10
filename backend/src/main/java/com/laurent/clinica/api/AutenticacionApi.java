package com.laurent.clinica.api;

import com.laurent.clinica.servicio.BaseDatos;
import io.jsonwebtoken.Jwts;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.time.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import java.util.Base64;

@RestController
@RequestMapping({"/api/autenticacion", "/api/v1/autenticacion"})
public class AutenticacionApi {
  private final BaseDatos db;
  private final PasswordEncoder encoder;
  private final byte[] key;
  private final int expiry;

  public AutenticacionApi(BaseDatos db, PasswordEncoder encoder,
      @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}") String secret,
      @Value("${jwt.expiration-hours:8}") int expiry) {
    this.db = db;
    this.encoder = encoder;
    byte[] k;
    try {
      k = Base64.getDecoder().decode(secret);
    } catch (Exception e) {
      k = Base64.getDecoder().decode("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
    }
    this.key = k;
    this.expiry = expiry;
  }

  public record Login(@NotBlank String usuario, @NotBlank String contrasena) {}

  @PostMapping("/iniciar-sesion")
  public Map<String, Object> login(@Valid @RequestBody Login request) {
    var u = db.maybe(
        "SELECT id, username, nombre, rol, activo, password_hash FROM usuarios WHERE LOWER(username) = LOWER(:u)",
        BaseDatos.m("u", request.usuario().trim())
    );

    if (u == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos");
    }

    Object activoVal = u.get("activo");
    boolean esActivo = activoVal instanceof Boolean ? (Boolean) activoVal : Boolean.parseBoolean(String.valueOf(activoVal));
    if (!esActivo) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La cuenta de usuario está desactivada");
    }

    String hashGuardado = (String) u.get("password_hash");
    boolean coincide = false;
    try {
      coincide = encoder.matches(request.contrasena(), hashGuardado);
    } catch (Exception ex) {
      coincide = request.contrasena().equals(hashGuardado);
    }

    if (!coincide) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos");
    }

    String token = Jwts.builder()
        .subject(u.get("id").toString())
        .claim("rol", u.get("rol").toString())
        .issuedAt(new Date())
        .expiration(Date.from(Instant.now().plusSeconds(expiry * 3600L)))
        .signWith(Keys.hmacShaKeyFor(key))
        .compact();

    return Map.of(
        "token", token,
        "usuario", Map.of(
            "id", u.get("id"),
            "nombre", u.get("nombre"),
            "rol", u.get("rol"),
            "username", u.get("username")
        )
    );
  }

  @GetMapping("/yo")
  public Map<String, Object> yo() {
    return db.one(
        "SELECT id, username, nombre, rol, correo FROM usuarios WHERE id = :u AND activo = true",
        BaseDatos.m("u", db.uid())
    );
  }
}
