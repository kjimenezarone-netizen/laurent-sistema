package com.laurent.clinica.dominio.identidad.controlador;

import com.laurent.clinica.dominio.identidad.dto.RegistroUsuarioDto;
import com.laurent.clinica.dominio.identidad.entidad.OdontologoEntidad;
import com.laurent.clinica.dominio.identidad.entidad.RolEntidad;
import com.laurent.clinica.dominio.identidad.entidad.SedeEntidad;
import com.laurent.clinica.dominio.identidad.entidad.UsuarioEntidad;
import com.laurent.clinica.dominio.identidad.repositorio.OdontologoRepositorio;
import com.laurent.clinica.dominio.identidad.repositorio.RolRepositorio;
import com.laurent.clinica.dominio.identidad.repositorio.SedeRepositorio;
import com.laurent.clinica.dominio.identidad.repositorio.UsuarioRepositorio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/usuarios")
@Tag(name = "Gestión de Usuarios", description = "Administración de cuentas y personal clínico")
@RequiredArgsConstructor
public class GestionUsuariosControlador {

    private final UsuarioRepositorio usuarioRepositorio;
    private final RolRepositorio rolRepositorio;
    private final SedeRepositorio sedeRepositorio;
    private final OdontologoRepositorio odontologoRepositorio;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @Operation(summary = "Listar usuarios", description = "Lista todas las cuentas de usuario activas")
    public ResponseEntity<List<UsuarioEntidad>> listarUsuarios() {
        return ResponseEntity.ok(usuarioRepositorio.findAll());
    }

    @GetMapping("/odontologos")
    @Operation(summary = "Listar odontólogos", description = "Lista los profesionales médicos")
    public ResponseEntity<List<OdontologoEntidad>> listarOdontologos() {
        return ResponseEntity.ok(odontologoRepositorio.findByActivoTrue());
    }

    @PostMapping
    @Operation(summary = "Registrar usuario", description = "Crea una nueva cuenta de usuario y asigna rol")
    public ResponseEntity<UsuarioEntidad> registrarUsuario(@RequestBody RegistroUsuarioDto dto) {
        if (usuarioRepositorio.existsByNombreUsuario(dto.getNombreUsuario())) {
            throw new IllegalArgumentException("El nombre de usuario ya se encuentra registrado");
        }

        Set<RolEntidad> roles = new HashSet<>();
        if (dto.getRolCodigo() != null) {
            rolRepositorio.findByCodigo(dto.getRolCodigo()).ifPresent(roles::add);
        }

        UsuarioEntidad usuario = UsuarioEntidad.builder()
                .nombreUsuario(dto.getNombreUsuario())
                .correoElectronico(dto.getCorreoElectronico())
                .contrasenaEncriptada(passwordEncoder.encode(dto.getContrasena()))
                .nombres(dto.getNombres())
                .apellidos(dto.getApellidos())
                .numeroDocumento(dto.getNumeroDocumento())
                .telefonoMovil(dto.getTelefonoMovil())
                .roles(roles)
                .activo(true)
                .bloqueado(false)
                .fechaCreacion(OffsetDateTime.now())
                .fechaActualizacion(OffsetDateTime.now())
                .build();

        UsuarioEntidad guardado = usuarioRepositorio.save(usuario);

        if (dto.getRolCodigo() != null && dto.getRolCodigo().equalsIgnoreCase("ODONTOLOGO")) {
            OdontologoEntidad odontologo = OdontologoEntidad.builder()
                    .usuario(guardado)
                    .numeroColegiatura("COP-" + dto.getNumeroDocumento())
                    .especialidad("Odontología General")
                    .colorAgenda("#0d9488")
                    .activo(true)
                    .build();
            odontologoRepositorio.save(odontologo);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }
}

