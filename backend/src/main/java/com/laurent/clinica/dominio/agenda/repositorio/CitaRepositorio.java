package com.laurent.clinica.dominio.agenda.repositorio;

import com.laurent.clinica.dominio.agenda.entidad.CitaEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CitaRepositorio extends JpaRepository<CitaEntidad, UUID> {

    @Query("SELECT c FROM CitaEntidad c WHERE c.fechaHoraInicio >= :inicio AND c.fechaHoraFin <= :fin ORDER BY c.fechaHoraInicio ASC")
    List<CitaEntidad> buscarPorRangoFechas(@Param("inicio") OffsetDateTime inicio, @Param("fin") OffsetDateTime fin);

    @Query("SELECT c FROM CitaEntidad c WHERE c.odontologo.id = :odontologoId AND c.fechaHoraInicio >= :inicio AND c.fechaHoraFin <= :fin ORDER BY c.fechaHoraInicio ASC")
    List<CitaEntidad> buscarPorOdontologoYRango(@Param("odontologoId") UUID odontologoId, @Param("inicio") OffsetDateTime inicio, @Param("fin") OffsetDateTime fin);

    @Query("SELECT c FROM CitaEntidad c WHERE c.paciente.id = :pacienteId ORDER BY c.fechaHoraInicio DESC")
    List<CitaEntidad> buscarPorPaciente(@Param("pacienteId") UUID pacienteId);

    // Validación preventiva en Java antes de la restricción física de PostgreSQL
    @Query("SELECT COUNT(c) > 0 FROM CitaEntidad c WHERE c.sillon.id = :sillonId " +
           "AND c.estadoCodigo != 'CANCELADA' " +
           "AND (:inicio < c.fechaHoraFin AND :fin > c.fechaHoraInicio)")
    boolean existeSolapamientoSillon(@Param("sillonId") UUID sillonId,
                                    @Param("inicio") OffsetDateTime inicio,
                                    @Param("fin") OffsetDateTime fin);

    @Query("SELECT COUNT(c) > 0 FROM CitaEntidad c WHERE c.odontologo.id = :odontologoId " +
           "AND c.estadoCodigo != 'CANCELADA' " +
           "AND (:inicio < c.fechaHoraFin AND :fin > c.fechaHoraInicio)")
    boolean existeSolapamientoOdontologo(@Param("odontologoId") UUID odontologoId,
                                        @Param("inicio") OffsetDateTime inicio,
                                        @Param("fin") OffsetDateTime fin);
}

