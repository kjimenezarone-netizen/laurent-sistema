-- =============================================================================
-- V1: MÓDULO DE IDENTIDAD, ROLES, SEDES Y PACIENTES
-- Clinica Dental Laurent - Arquitectura Integral en Español
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 1. Sedes de la clínica
CREATE TABLE sedes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    ciudad VARCHAR(50) DEFAULT 'Lima',
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Roles del sistema (RBAC granular)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL, -- 'ADMINISTRADOR', 'ODONTOLOGO', 'RECEPCIONISTA', 'CAJERO', 'PACIENTE'
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- 3. Permisos granulares
CREATE TABLE permisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(100) UNIQUE NOT NULL, -- ej. 'clinica.atencion.escribir', 'finanzas.pago.registrar'
    modulo VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- 4. Asociación Roles - Permisos
CREATE TABLE roles_permisos (
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id UUID NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

-- 5. Cuentas de Usuario
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    contrasena_encriptada VARCHAR(255) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    telefono_movil VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    bloqueado BOOLEAN DEFAULT FALSE,
    ultimo_acceso TIMESTAMPTZ,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Usuarios y sus roles por sede
CREATE TABLE usuarios_roles_sedes (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, rol_id, sede_id)
);

-- 7. Perfil de Odontólogos / Profesionales
CREATE TABLE odontologos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE RESTRICT,
    numero_colegiatura VARCHAR(50) UNIQUE NOT NULL, -- COP (Colegio Odontológico del Perú)
    especialidad VARCHAR(100) NOT NULL DEFAULT 'Odontología General',
    biografia TEXT,
    color_agenda VARCHAR(20) DEFAULT '#0d9488',
    activo BOOLEAN DEFAULT TRUE
);

-- 8. Sillones de atención dental por sede
CREATE TABLE sillones_dentales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE RESTRICT,
    codigo VARCHAR(20) NOT NULL, -- 'SILLON-1', 'SILLON-2'
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE (sede_id, codigo)
);

-- 9. Pacientes
CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sede_registro_id UUID NOT NULL REFERENCES sedes(id) ON DELETE RESTRICT,
    tipo_documento VARCHAR(20) NOT NULL DEFAULT 'DNI', -- 'DNI', 'CARNET_EXTRANJERIA', 'PASAPORTE'
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    sexo VARCHAR(20),
    telefono_movil VARCHAR(20) NOT NULL,
    correo_electronico VARCHAR(100),
    direccion VARCHAR(255),
    ocupacion VARCHAR(100),
    alergias TEXT,
    enfermedades_sistemicas TEXT,
    medicacion_actual TEXT,
    observaciones_medicas TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Índices de búsqueda ágil
CREATE INDEX idx_pacientes_documento ON pacientes(numero_documento);
CREATE INDEX idx_pacientes_apellidos_nombres ON pacientes(apellidos, nombres);

