package com.laurent.clinica.dominio.clinica.entidad;

import com.laurent.clinica.dominio.pacientes.entidad.PacienteEntidad;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "expedientes_clinicos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpedienteClinicoEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false, unique = true)
    private PacienteEntidad paciente;

    @Column(name = "numero_expediente", nullable = false, unique = true, length = 50)
    private String numeroExpediente;

    @Column(name = "grupo_sanguineo", length = 10)
    private String grupoSanguineo;

    @Column(name = "antecedentes_patologicos", columnDefinition = "TEXT")
    private String antecedentesPatologicos;

    @Column(name = "antecedentes_quirurgicos", columnDefinition = "TEXT")
    private String antecedentesQuirurgicos;

    @Column(name = "habitos_nocivos", columnDefinition = "TEXT")
    private String habitosNocivos;

    @Column(length = 20)
    @Builder.Default
    private String estado = "ABIERTO";

    @Column(name = "fecha_apertura")
    private OffsetDateTime fechaApertura;
}

