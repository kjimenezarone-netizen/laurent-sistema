package com.laurent.clinica.config;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.beans.factory.annotation.Value;
import java.util.Map;

@Configuration
public class InicializarAdministrador {
 @Bean ApplicationRunner inicializar(NamedParameterJdbcTemplate jdbc, PasswordEncoder pass,
 @Value("${bootstrap.admin-username:}") String name,
 @Value("${bootstrap.admin-password:}") String password,
 @Value("${bootstrap.admin-name:Administrador Laurent}") String display) {
   return args -> {
     Integer total=jdbc.queryForObject("SELECT count(*) FROM usuarios",Map.of(),Integer.class);
     if(total != null && total == 0) {
       if(name.isBlank() || password.length()<14) throw new IllegalStateException("Registrar ADMIN_USERNAME y ADMIN_PASSWORD (minimo 14 caracteres) antes del primer inicio");
       jdbc.update("INSERT INTO usuarios(username,password_hash,nombre,rol) VALUES(:u,:p,:n,'ADMINISTRADOR')",
         Map.of("u",name,"p",pass.encode(password),"n",display));
     }
   };
 }
}
