# Pruebas de aceptación pendientes de ejecutar con navegador + PostgreSQL de pruebas
Feature: Laurent v1 - Clínico, operativo y marketing

  Scenario: El odontólogo no puede registrar pagos
    Given un usuario autenticado con rol MEDICO
    When envía POST a /api/caja/pagos
    Then recibe HTTP 403

  Scenario: Recepción no puede modificar el odontograma
    Given una recepcionista autenticada
    When envía POST a /api/clinica/odontograma
    Then recibe HTTP 403

  Scenario: Dos citas no pueden ocupar el mismo sillón y hora
    Given un paciente, un odontólogo y un sillón habilitados
    When recepción reserva el sillón el lunes a las 10:00
    And otra recepcionista intenta reservar el mismo sillón a las 10:30
    Then PostgreSQL rechaza la segunda reserva por exclusión de intervalos

  Scenario: Horarios variables requieren aprobación
    Given un médico propone lunes de 08:00 a 12:00
    And administración aprueba su turno
    When recepción intenta reservar ese médico fuera de ese horario
    Then la reserva es rechazada

  Scenario: Historia clínica con identificador FDI
    Given un médico autorizado para un paciente
    When registra caries en pieza FDI 16 superficie OCLUSAL
    Then aparece el hallazgo en el odontograma de ese paciente
    And el registro conserva autor, fecha y estado

  Scenario: Periodontograma en seis sitios por diente
    Given un médico autorizado
    When registra sitios MV V DV ML L y DL de una pieza
    Then el examen se guarda con seis mediciones

  Scenario: Cargos y abonos cronológicos
    Given un cargo de S/180
    When recepción registra un abono S/100 y luego otro S/50
    Then el saldo pendiente es S/30
    And se conserva fecha y concepto de cada movimiento

  Scenario: Doble clic no duplica un pago
    Given un abono S/100 con un Idempotency-Key
    When se reenvía la misma solicitud con idéntica clave
    Then la API retorna el mismo identificador del pago
    And la suma de pagos confirmados no aumenta

  Scenario: Testimonio público requiere consentimiento
    Given un administrador en el CMS
    When intenta publicar una reseña sin evidencia de consentimiento
    Then el sistema rechaza la operación

  Scenario: Una orden de laboratorio registra su estado
    Given una orden SOLICITADO
    When administración la cambia a EN_PROCESO
    Then queda registrada la transición sin borrar la orden

  Scenario: Ficha clínica no expone datos públicos
    Given un visitante sin iniciar sesión
    When consulta la API de historia clínica de un paciente
    Then recibe HTTP 401 o 403
