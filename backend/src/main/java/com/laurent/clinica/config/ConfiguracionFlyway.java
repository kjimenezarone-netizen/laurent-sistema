package com.laurent.clinica.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ConfiguracionFlyway {

  @Bean
  public FlywayMigrationStrategy flywayMigrationStrategy() {
    return flyway -> {
      try {
        flyway.repair();
      } catch (Exception e) {
        System.err.println("Aviso en flyway.repair(): " + e.getMessage());
      }
      flyway.migrate();
    };
  }
}

