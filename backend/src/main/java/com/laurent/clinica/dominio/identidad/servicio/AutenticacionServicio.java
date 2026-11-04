package com.laurent.clinica.dominio.identidad.servicio;

import com.laurent.clinica.config.JwtUtils;
import com.laurent.clinica.dominio.identidad.dto.RespuestaInicioSesionDto;
import com.laurent.clinica.dominio.identidad.dto.SolicitudInicioSesionDto;
import com.laurent.clinica.dominio.identidad.entidad.OdontologoEntidad;
import com.laurent.clinica.dominio.identidad.entidad.RolEntidad;
import com.laurent.clinica.dominio.identidad.entidad.UsuarioEntidad;
import com.laurent.clinica.dominio.identidad.repositorio.OdontologoRepositorio;
import com.laurent.clinica.dominio.identidad.repositorio.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AutenticacionServicio {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UsuarioRepositorio usuarioRepositorio;
    private final OdontologoRepositorio odontologoRepositorio;

    @Transactional
    public RespuestaInicioSesionDto iniciarSesion(SolicitudInicioSesionDto solicitud) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(solicitud.getNombreUsuario(), solicitud.getContrasena())
        );

        User detallesUsuario = (User) authentication.getPrincipal();
        UsuarioEntidad usuario = usuarioRepositorio.findByNombreUsuario(detallesUsuario.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Usuario o contraseña incorrectos"));

        usuario.setUltimoAcceso(OffsetDateTime.now());
        usuarioRepositorio.save(usuario);

        Set<String> rolesCodigos = usuario.getRoles().stream()
                .map(RolEntidad::getCodigo)
                .collect(Collectors.toSet());

        String rolPrincipal = rolesCodigos.stream().findFirst().orElse("RECEPCIONISTA");
        String token = jwtUtils.generateToken(detallesUsuario, rolPrincipal, usuario.getId());

        UUID odontologoId = null;
        String nombreCompleto = usuario.getNombres() + " " + usuario.getApellidos();

        if (rolesCodigos.contains("ODONTOLOGO")) {
            Optional<OdontologoEntidad> od = odontologoRepositorio.findByUsuario(usuario);
            if (od.isPresent()) {
                odontologoId = od.get().getId();
                nombreCompleto = "Dr. " + usuario.getNombres() + " " + usuario.getApellidos();
            }
        }

        return RespuestaInicioSesionDto.builder()
                .token(token)
                .tipo("Bearer")
                .id(usuario.getId())
                .nombreUsuario(usuario.getNombreUsuario())
                .correoElectronico(usuario.getCorreoElectronico())
                .nombreCompleto(nombreCompleto)
                .roles(rolesCodigos)
                .odontologoId(odontologoId)
                .build();
    }
}

