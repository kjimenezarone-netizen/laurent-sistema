package com.laurent.clinica.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import javax.crypto.SecretKey;

@Component
class FiltroJwt extends OncePerRequestFilter {
  private final ServicioJwt jwt;
  private final JdbcTemplate jdbc;
  FiltroJwt(ServicioJwt jwt, JdbcTemplate jdbc) { this.jwt=jwt; this.jdbc=jdbc; }
  @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse resp, FilterChain chain) throws IOException, ServletException {
    String h=req.getHeader("Authorization");
    if(h != null && h.startsWith("Bearer ")) {
      try {
        var claims=jwt.verificar(h.substring(7));
        String role=claims.get("rol",String.class);
        // Verificar roles conocidos. El backend comprueba acceso por paciente y por recurso en cada servicio.
        // Un token con subject malformado nunca debe producir un error SQL/HTTP 500.
        UUID usuarioId=UUID.fromString(claims.getSubject());
        if(List.of("ADMINISTRADOR","MEDICO","RECEPCIONISTA").contains(role) &&
           Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM usuarios WHERE id=? AND rol=? AND activo=true)",Boolean.class,usuarioId,role))) {
          var a=new UsernamePasswordAuthenticationToken(claims.getSubject(),null,List.of(new SimpleGrantedAuthority("ROLE_"+role)));
          SecurityContextHolder.getContext().setAuthentication(a);
        }
      } catch(JwtException | IllegalArgumentException e) { SecurityContextHolder.clearContext(); }
    }
    chain.doFilter(req,resp);
  }
}

@Component
class ServicioJwt {
  private final SecretKey key;
  private final long hours;
  ServicioJwt(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration-hours:8}") long hours) {
    byte[] raw;
    try { raw=Base64.getDecoder().decode(secret); }
    catch(IllegalArgumentException e) { throw new IllegalStateException("JWT_SECRET debe ser base64 valido",e); }
    if(raw.length<32) throw new IllegalStateException("JWT_SECRET requiere 32 bytes aleatorios como minimo");
    key=Keys.hmacShaKeyFor(raw); this.hours=hours;
  }
  String emitir(String id,String role) {
    return Jwts.builder().subject(id).claim("rol",role).issuedAt(new Date())
      .expiration(Date.from(Instant.now().plus(hours,ChronoUnit.HOURS))).signWith(key).compact();
  }
  io.jsonwebtoken.Claims verificar(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
}

@Configuration
@EnableMethodSecurity
public class SeguridadJwt {
 @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }
 @Bean SecurityFilterChain securityFilterChain(HttpSecurity http,FiltroJwt filtro) throws Exception {
  http.csrf(csrf->csrf.disable()).cors(cors->{}).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .authorizeHttpRequests(a->a
      .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
      .requestMatchers("/api/publico/**","/api/autenticacion/iniciar-sesion","/actuator/health").permitAll()
      .anyRequest().authenticated())
    .addFilterBefore(filtro,UsernamePasswordAuthenticationFilter.class);
  return http.build();
 }
}
