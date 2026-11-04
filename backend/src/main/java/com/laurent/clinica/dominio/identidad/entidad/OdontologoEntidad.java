package com.laurent.clinica.dominio.identidad.entidad;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "odontologos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OdontologoEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private UsuarioEntidad usuario;

    @Column(name = "numero_colegiatura", nullable = false, unique = true, length = 50)
    private String numeroColegiatura;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String especialidad = "Odontología General";

    @Column(columnDefinition = "TEXT")
    private String biografia;

    @Column(name = "color_agenda", length = 20)
    @Builder.Default
    private String colorAgenda = "#0d9488";

    @Builder.Default
    private Boolean activo = true;
}

