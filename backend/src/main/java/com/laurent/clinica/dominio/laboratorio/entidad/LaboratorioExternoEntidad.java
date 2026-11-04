package com.laurent.clinica.dominio.laboratorio.entidad;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "laboratorios_externos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LaboratorioExternoEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "razon_social", nullable = false, length = 150)
    private String razonSocial;

    @Column(unique = true, length = 20)
    private String ruc;

    @Column(name = "telefono_contacto", length = 20)
    private String telefonoContacto;

    @Column(name = "contacto_nombre", length = 100)
    private String contactoNombre;

    @Builder.Default
    private Boolean activo = true;
}

