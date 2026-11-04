package com.laurent.clinica.dominio.compartido.controlador;

import com.laurent.clinica.dominio.compartido.entidad.TestimonioPacienteEntidad;
import com.laurent.clinica.dominio.compartido.repositorio.TestimonioPacienteRepositorio;
import com.laurent.clinica.dominio.finanzas.entidad.CatalogoTratamientoEntidad;
import com.laurent.clinica.dominio.finanzas.repositorio.CatalogoTratamientoRepositorio;
import com.laurent.clinica.dominio.identidad.entidad.OdontologoEntidad;
import com.laurent.clinica.dominio.identidad.repositorio.OdontologoRepositorio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/publico")
@Tag(name = "Portal Público", description = "Servicios públicos para la página web de la clínica")
@RequiredArgsConstructor
public class PublicoControlador {

    private final OdontologoRepositorio odontologoRepositorio;
    private final CatalogoTratamientoRepositorio catalogoRepositorio;
    private final TestimonioPacienteRepositorio testimonioRepositorio;

    @GetMapping("/odontologos")
    @Operation(summary = "Staff odontológico", description = "Lista los profesionales activos de la clínica")
    public ResponseEntity<List<OdontologoEntidad>> listarOdontologos() {
        return ResponseEntity.ok(odontologoRepositorio.findByActivoTrue());
    }

    @GetMapping("/servicios")
    @Operation(summary = "Servicios y tratamientos", description = "Lista los tratamientos principales ofertados")
    public ResponseEntity<List<CatalogoTratamientoEntidad>> listarServicios() {
        return ResponseEntity.ok(catalogoRepositorio.findByActivoTrueOrderByNombreAsc());
    }

    @GetMapping("/testimonios")
    @Operation(summary = "Testimonios de pacientes", description = "Lista las reseñas destacadas")
    public ResponseEntity<List<TestimonioPacienteEntidad>> listarTestimonios() {
        return ResponseEntity.ok(testimonioRepositorio.findByActivoTrueOrderByFechaPublicacionDesc());
    }
}

