package com.laurent.clinica.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.beans.factory.annotation.Value;
import java.util.Map;
import java.util.UUID;

@Configuration
public class InicializarAdministrador {

  @Bean
  ApplicationRunner inicializar(NamedParameterJdbcTemplate jdbc, PasswordEncoder pass,
      @Value("${bootstrap.admin-username:admin}") String adminUser,
      @Value("${bootstrap.admin-password:admin123}") String adminPass,
      @Value("${bootstrap.admin-name:Administrador Laurent}") String adminNombre) {
    return args -> {
      try {
        // 1. Asegurar usuario Administrador
        Integer countAdmin = jdbc.queryForObject(
            "SELECT count(*) FROM usuarios WHERE username = :u",
            Map.of("u", adminUser.isBlank() ? "admin" : adminUser),
            Integer.class);
        if (countAdmin == null || countAdmin == 0) {
          String u = adminUser.isBlank() ? "admin" : adminUser;
          String p = adminPass.isBlank() ? "admin123" : adminPass;
          jdbc.update(
              "INSERT INTO usuarios(username, password_hash, nombre, rol, activo) " +
              "VALUES(:u, :p, :n, 'ADMINISTRADOR', true)",
              Map.of("u", u, "p", pass.encode(p), "n", adminNombre.isBlank() ? "Administrador Laurent" : adminNombre));
        }

        // 2. Asegurar usuario Médico (Dr. Laurent)
        Integer countMedico = jdbc.queryForObject(
            "SELECT count(*) FROM usuarios WHERE username = 'dr.laurent'",
            Map.of(),
            Integer.class);
        UUID medicoId;
        if (countMedico == null || countMedico == 0) {
          medicoId = UUID.randomUUID();
          jdbc.update(
              "INSERT INTO usuarios(id, username, password_hash, nombre, rol, activo) " +
              "VALUES(:id, 'dr.laurent', :p, 'Dr. Laurent Odontología', 'MEDICO', true)",
              Map.of("id", medicoId, "p", pass.encode("medico123")));
        } else {
          medicoId = jdbc.queryForObject(
              "SELECT id FROM usuarios WHERE username = 'dr.laurent' LIMIT 1",
              Map.of(),
              UUID.class);
        }

        // 3. Asegurar usuario Recepción
        Integer countRecepcion = jdbc.queryForObject(
            "SELECT count(*) FROM usuarios WHERE username = 'recepcion'",
            Map.of(),
            Integer.class);
        if (countRecepcion == null || countRecepcion == 0) {
          jdbc.update(
              "INSERT INTO usuarios(username, password_hash, nombre, rol, activo) " +
              "VALUES('recepcion', :p, 'Recepción Clínica Laurent', 'RECEPCIONISTA', true)",
              Map.of("p", pass.encode("recepcion123")));
        }

        // 4. Asegurar Sede principal
        Integer countSedes = jdbc.queryForObject("SELECT count(*) FROM sedes", Map.of(), Integer.class);
        UUID sedeId;
        if (countSedes == null || countSedes == 0) {
          sedeId = UUID.randomUUID();
          jdbc.update(
              "INSERT INTO sedes(id, nombre, direccion, telefono, activa) " +
              "VALUES(:id, 'Sede Principal Laurent', 'Av. José Larco 850, Miraflores, Lima', '+51 987 654 321', true)",
              Map.of("id", sedeId));
        } else {
          sedeId = jdbc.queryForObject("SELECT id FROM sedes LIMIT 1", Map.of(), UUID.class);
        }

        // 5. Asegurar Sillón odontológico
        Integer countSillones = jdbc.queryForObject("SELECT count(*) FROM sillones", Map.of(), Integer.class);
        if (countSillones == null || countSillones == 0) {
          jdbc.update(
              "INSERT INTO sillones(sede_id, codigo, nombre, activo) VALUES(:s, 'SIL-01', 'Sillón Principal 1', true)",
              Map.of("s", sedeId));
        }

        // 6. Asegurar Odontólogo registrado y visible en la web
        if (medicoId != null) {
          Integer countOdonto = jdbc.queryForObject(
              "SELECT count(*) FROM odontologos WHERE usuario_id = :u",
              Map.of("u", medicoId),
              Integer.class);
          if (countOdonto == null || countOdonto == 0) {
            jdbc.update(
                "INSERT INTO odontologos(usuario_id, sede_id, cop, especialidad, color_agenda, mostrar_en_web, biografia) " +
                "VALUES(:u, :s, '45892', 'Rehabilitación Oral e Implantología', '#0e4a4e', true, " +
                "'Especialista con más de 12 años de experiencia en rehabilitación estética, implantes y diseño digital de sonrisa.')",
                Map.of("u", medicoId, "s", sedeId));
          }
        }

        // 7. Asegurar tratamientos iniciales si el catálogo está vacío
        Integer countTratamientos = jdbc.queryForObject("SELECT count(*) FROM catalogo_tratamientos", Map.of(), Integer.class);
        if (countTratamientos == null || countTratamientos == 0) {
          jdbc.update("INSERT INTO catalogo_tratamientos(codigo, nombre, especialidad, precio_base, duracion_minutos, publico, activo, descripcion) VALUES " +
              "('ORT-001', 'Ortodoncia Invisible Digital', 'Ortodoncia', 2800.00, 45, true, true, 'Alineadores transparentes de alta precisión con simulación 3D.'), " +
              "('IMP-001', 'Implante Dental de Titanio', 'Implantes', 1950.00, 60, true, true, 'Reemplazo fijo con osteointegración de alta biocompatibilidad.'), " +
              "('EST-001', 'Diseño de Sonrisa y Carillas', 'Estética', 1200.00, 60, true, true, 'Carillas cerámicas ultradelgadas para una armonía perfecta.'), " +
              "('BLA-001', 'Blanqueamiento Dental LED', 'Estética', 380.00, 45, true, true, 'Aclaramiento seguro en una sola sesión de 45 minutos.'), " +
              "('PRE-001', 'Limpieza Profunda con Ultrasonido', 'Prevención', 120.00, 30, true, true, 'Profilaxis profesional, retiro de sarro y pulido dental.'), " +
              "('END-001', 'Endodoncia Mecanizada', 'Rehabilitación', 450.00, 60, true, true, 'Tratamiento de conductos en una sesión con tecnología rotatoria.')",
              Map.of());
        }

        // 8. Asegurar testimonios iniciales si la tabla está vacía
        try {
          Integer countTestimonios = jdbc.queryForObject("SELECT count(*) FROM testimonios", Map.of(), Integer.class);
          if (countTestimonios == null || countTestimonios == 0) {
            jdbc.update("INSERT INTO testimonios(nombre_publico, comentario, estrellas, publicado, consentimiento_verificado) VALUES " +
                "('María Elena Quispe', 'Excelente experiencia. Mi tratamiento de ortodoncia invisible fue rápido y sin molestias.', 5, true, true), " +
                "('Carlos Mendoza V.', 'El Dr. Laurent es sumamente minucioso y profesional. La clínica cuenta con tecnología de punta.', 5, true, true), " +
                "('Dra. Sofía Benavides', 'Recomiendo a Clínica Laurent al 100%. Me realizaron un implante con un cuidado impecable.', 5, true, true)",
                Map.of());
          }
        } catch (Exception ignored) {}

      } catch (Exception e) {
        System.err.println("Aviso durante inicialización de datos de arranque: " + e.getMessage());
      }
    };
  }
}
