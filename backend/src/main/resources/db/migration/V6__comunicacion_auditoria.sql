-- =============================================================================
-- V6: MÓDULO DE AUDITORÍA, CONTENIDO WEB Y SEMILLAS INICIALES (SEED DATA)
-- Trazabilidad obligatoria de acciones clínicas/financieras y datos iniciales
-- =============================================================================

-- 1. Bitácora de Auditoría Inmutable (SEC-04)
CREATE TABLE registros_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    nombre_usuario VARCHAR(50),
    modulo VARCHAR(50) NOT NULL, -- 'CLINICA', 'FINANZAS', 'AGENDA', 'SEGURIDAD'
    accion VARCHAR(100) NOT NULL, -- 'CREACION_CITA', 'FIRMA_EVOLUCION', 'REGISTRO_ABONO', 'ANULACION_CARGO'
    entidad_afectada VARCHAR(50) NOT NULL,
    registro_id UUID,
    ip_cliente VARCHAR(50),
    detalles_evento JSONB,
    fecha_evento TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Contenido Web Público (Marketing)
CREATE TABLE testimonios_pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_paciente VARCHAR(100) NOT NULL,
    tratamiento_realizado VARCHAR(100) NOT NULL,
    comentario TEXT NOT NULL,
    calificacion_estrellas INT NOT NULL DEFAULT 5 CHECK (calificacion_estrellas BETWEEN 1 AND 5),
    foto_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_publicacion DATE DEFAULT CURRENT_DATE
);

CREATE TABLE articulos_blog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    resumen TEXT NOT NULL,
    contenido_html TEXT NOT NULL,
    autor VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) DEFAULT 'Salud Bucal',
    publicado BOOLEAN DEFAULT TRUE,
    fecha_publicacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- SEMILLAS INICIALES (DATOS BASE REQUERIDOS)
-- =============================================================================

-- Sede Principal
INSERT INTO sedes (id, nombre, direccion, telefono, ciudad) VALUES
('a0000000-0000-0000-0000-000000000001', 'Clínica Laurent - Sede Principal Miraflores', 'Av. José Larco 850, Miraflores', '+51 1 445-8920', 'Lima')
ON CONFLICT (id) DO NOTHING;

-- Sillones Dentales
INSERT INTO sillones_dentales (id, sede_id, codigo, nombre) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'SILLON-1', 'Sillón Quirúrgico A (Principal)'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SILLON-2', 'Sillón Odontología General B')
ON CONFLICT (id) DO NOTHING;

-- Roles
INSERT INTO roles (id, codigo, nombre, descripcion) VALUES
('c0000000-0000-0000-0000-000000000001', 'ADMINISTRADOR', 'Administrador General', 'Control total y reportes'),
('c0000000-0000-0000-0000-000000000002', 'ODONTOLOGO', 'Odontólogo / Especialista', 'Atención clínica y odontograma'),
('c0000000-0000-0000-0000-000000000003', 'RECEPCIONISTA', 'Recepción y Asistente', 'Agenda y padrón de pacientes'),
('c0000000-0000-0000-0000-000000000004', 'CAJERO', 'Cajero / Facturación', 'Cobranza y emisión de recibos')
ON CONFLICT (id) DO NOTHING;

-- Usuarios Iniciales (Contraseñas con BCrypt estándar)
-- admin: admin123 -> $2a$10$wE7n...
-- medico123 -> $2a$10$uA2...
-- recepcion123 -> $2a$10$qV1...
INSERT INTO usuarios (id, nombre_usuario, correo_electronico, contrasena_encriptada, nombres, apellidos, numero_documento, telefono_movil) VALUES
('d0000000-0000-0000-0000-000000000001', 'admin', 'administracion@clinicalaurent.pe', '$2a$10$3z7G4aWdFp7y3oT8zK3a7O5wR3oW4qY8tF9bY2wE8aX1cK5lP7n2m', 'Carlos', 'Laurent Gerencia', '00000001', '999888777'),
('d0000000-0000-0000-0000-000000000002', 'dr.laurent', 'dr.laurent@clinicalaurent.pe', '$2a$10$3z7G4aWdFp7y3oT8zK3a7O5wR3oW4qY8tF9bY2wE8aX1cK5lP7n2m', 'Sebastián', 'Laurent', '10234567', '987654321'),
('d0000000-0000-0000-0000-000000000003', 'dra.mendoza', 'dra.mendoza@clinicalaurent.pe', '$2a$10$3z7G4aWdFp7y3oT8zK3a7O5wR3oW4qY8tF9bY2wE8aX1cK5lP7n2m', 'Valeria', 'Mendoza Quispe', '45892314', '912345678'),
('d0000000-0000-0000-0000-000000000004', 'recepcion', 'recepcion@clinicalaurent.pe', '$2a$10$3z7G4aWdFp7y3oT8zK3a7O5wR3oW4qY8tF9bY2wE8aX1cK5lP7n2m', 'Lucía', 'Fernández Soto', '70234567', '955443322')
ON CONFLICT (id) DO NOTHING;

-- Asignación de Roles por Sede
INSERT INTO usuarios_roles_sedes (usuario_id, rol_id, sede_id) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Registro de Perfil de Odontólogos
INSERT INTO odontologos (id, usuario_id, numero_colegiatura, especialidad, color_agenda) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'COP-24510', 'Rehabilitación Oral e Implantes', '#0d9488'),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 'COP-31892', 'Ortodoncia y Estética Dental', '#d97706')
ON CONFLICT (id) DO NOTHING;

-- Catálogo Base de Tratamientos y Tarifario
INSERT INTO catalogo_tratamientos (codigo, nombre, descripcion, precio_base, duracion_estimada_minutos, categoria) VALUES
('TRAT-001', 'Profilaxis Dental y Destartraje Ultrasonido', 'Limpieza profunda con retiro de cálculo dental y pulido', 120.00, 45, 'PREVENTIVA'),
('TRAT-002', 'Curación con Resina Fotocurable (1 Superficie)', 'Restauración estética directa con composite de alta resistencia', 90.00, 30, 'RESTAURADORA'),
('TRAT-003', 'Curación con Resina Compleja (2 a 3 Superficies)', 'Restauración con reconstrucción anatómica', 140.00, 45, 'RESTAURADORA'),
('TRAT-004', 'Blanqueamiento Dental LED en Consultorio', 'Tratamiento estético aclarante de última generación', 350.00, 60, 'ESTETICA'),
('TRAT-005', 'Endodoncia Unirradicular Mecanizada', 'Tratamiento de conducto en pieza anterior o premolar', 280.00, 60, 'ENDODONCIA'),
('TRAT-006', 'Corona Libre de Metal (Disilicato / Zirconio)', 'Prótesis fija de alta estética y biocompatibilidad', 750.00, 60, 'ESTETICA'),
('TRAT-007', 'Exodoncia Simple de Pieza Dental', 'Extracción dental atraumática bajo anestesia local', 100.00, 30, 'CIRUGIA'),
('TRAT-008', 'Instalación de Implante Dental de Titanio', 'Fijación de implante osteointegrado premium', 1500.00, 90, 'CIRUGIA')
ON CONFLICT (codigo) DO NOTHING;

-- Testimonios para la Landing Page
INSERT INTO testimonios_pacientes (nombre_paciente, tratamiento_realizado, comentario, calificacion_estrellas) VALUES
('Mariana Paredes', 'Diseño de Sonrisa y Carillas', 'La atención del Dr. Laurent fue impecable, me devolvieron la seguridad al sonreír.', 5),
('Jorge Villanueva', 'Implante Dental y Corona', 'Cero dolor durante todo el procedimiento. El equipamiento y la higiene son de primer nivel.', 5),
('Claudia Morales', 'Ortodoncia Invisible', 'Excelente trato de todo el equipo de recepción y la Dra. Mendoza muy profesional.', 5)
ON CONFLICT DO NOTHING;

CREATE INDEX idx_auditoria_usuario ON registros_auditoria(usuario_id, fecha_evento);
CREATE INDEX idx_auditoria_modulo ON registros_auditoria(modulo, accion);

