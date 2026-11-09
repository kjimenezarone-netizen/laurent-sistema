CREATE TABLE publicaciones (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tipo VARCHAR(20) NOT NULL CHECK(tipo IN ('BLOG','EVENTO','VIDEO','ACTIVIDAD','PROMOCION')),
 titulo VARCHAR(200) NOT NULL, slug VARCHAR(240) NOT NULL UNIQUE, resumen TEXT,
 contenido TEXT, portada_url TEXT, video_url TEXT, inicia_en TIMESTAMPTZ, termina_en TIMESTAMPTZ,
 estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR' CHECK(estado IN ('BORRADOR','PUBLICADO','ARCHIVADO')),
 autor_id UUID NOT NULL REFERENCES usuarios(id), publicado_en TIMESTAMPTZ,
 creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE testimonios (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nombre_publico VARCHAR(140) NOT NULL,
 comentario TEXT NOT NULL, estrellas SMALLINT CHECK(estrellas BETWEEN 1 AND 5),
 foto_url TEXT, consentimiento_verificado BOOLEAN NOT NULL DEFAULT FALSE,
 evidencia_consentimiento TEXT, publicado BOOLEAN NOT NULL DEFAULT FALSE,
 creado_en TIMESTAMPTZ DEFAULT now(),
 CHECK(NOT publicado OR consentimiento_verificado)
);
CREATE TABLE multimedia_web (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), titulo VARCHAR(180), tipo VARCHAR(30) NOT NULL,
 url TEXT NOT NULL, descripcion TEXT, visible BOOLEAN NOT NULL DEFAULT FALSE,
 subido_por UUID REFERENCES usuarios(id), creado_en TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE solicitudes_web (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nombre VARCHAR(160) NOT NULL,
 telefono VARCHAR(40), correo VARCHAR(254), servicio_id UUID REFERENCES catalogo_tratamientos(id),
 mensaje TEXT, canal VARCHAR(30) NOT NULL DEFAULT 'WEB',
 consentimiento_contacto BOOLEAN NOT NULL DEFAULT FALSE,
 estado VARCHAR(30) NOT NULL DEFAULT 'NUEVA' CHECK(estado IN ('NUEVA','CONTACTADA','AGENDADA','DESCARTADA')),
 creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK(telefono IS NOT NULL OR correo IS NOT NULL)
);
