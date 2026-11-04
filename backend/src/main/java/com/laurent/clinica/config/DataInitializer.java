package com.laurent.clinica.config;

import com.laurent.clinica.dominio.identidad.repositorio.UsuarioRepositorio;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner inicializarContrasenas(UsuarioRepositorio usuarioRepositorio, PasswordEncoder passwordEncoder) {
        return args -> {
            usuarioRepositorio.findByNombreUsuario("admin").ifPresent(u -> {
                u.setContrasenaEncriptada(passwordEncoder.encode("admin123"));
                usuarioRepositorio.save(u);
            });

            usuarioRepositorio.findByNombreUsuario("dr.laurent").ifPresent(u -> {
                u.setContrasenaEncriptada(passwordEncoder.encode("medico123"));
                usuarioRepositorio.save(u);
            });

            usuarioRepositorio.findByNombreUsuario("dra.mendoza").ifPresent(u -> {
                u.setContrasenaEncriptada(passwordEncoder.encode("medico123"));
                usuarioRepositorio.save(u);
            });

            usuarioRepositorio.findByNombreUsuario("recepcion").ifPresent(u -> {
                u.setContrasenaEncriptada(passwordEncoder.encode("recepcion123"));
                usuarioRepositorio.save(u);
            });
        };
    }
}
