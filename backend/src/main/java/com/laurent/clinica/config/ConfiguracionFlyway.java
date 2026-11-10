package com.laurent.clinica.config;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ConfiguracionFlyway {

  @Bean
  public FlywayMigrationStrategy flywayMigrationStrategy(DataSource dataSource) {
    return flyway -> {
      try (Connection conn = dataSource.getConnection();
           Statement stmt = conn.createStatement()) {
        // Detectar si la BD de Supabase tiene el esquema antiguo previo al rediseño
        boolean esquemaAntiguo = false;
        try (ResultSet rs = stmt.executeQuery(
            "SELECT to_regclass('public.testimonios_pacientes') IS NOT NULL AND to_regclass('public.testimonios') IS NULL")) {
          if (rs.next() && rs.getBoolean(1)) {
            esquemaAntiguo = true;
          }
        }
        if (esquemaAntiguo) {
          System.out.println("Detectado esquema antiguo previo al rediseño en Supabase. Limpiando esquema public para aplicar V1..V8...");
          stmt.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO anon; GRANT ALL ON SCHEMA public TO authenticated; GRANT ALL ON SCHEMA public TO service_role;");
        }
      } catch (Exception e) {
        System.err.println("Aviso al verificar o limpiar esquema antiguo: " + e.getMessage());
      }

      try {
        flyway.repair();
      } catch (Exception e) {
        System.err.println("Aviso en flyway.repair(): " + e.getMessage());
      }
      flyway.migrate();
    };
  }
}
