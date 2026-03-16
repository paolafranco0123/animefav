-- ============================================
-- AnimeFav - Esquema de Base de Datos
-- ============================================

CREATE DATABASE IF NOT EXISTS animefav_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE animefav_db;

-- ============================================
-- TABLA: Usuario
-- ============================================
CREATE TABLE Usuario (
  id_usuario     INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100)        NOT NULL,
  email          VARCHAR(255)        NOT NULL UNIQUE,
  contraseña     VARCHAR(255)        NOT NULL,
  fecha_registro TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_nacimiento DATE              NULL
);

-- ============================================
-- TABLA: Anime
-- ============================================
CREATE TABLE Anime (
  id_anime         INT AUTO_INCREMENT PRIMARY KEY,
  titulo           VARCHAR(255)  NOT NULL,
  descripcion      TEXT          NULL,
  fecha_estreno    DATE          NULL,
  num_episodios    INT           DEFAULT 0,
  edad_recomendada VARCHAR(50)   NULL,
  imagen_portada   VARCHAR(500)  NULL,
  mal_id           INT           UNIQUE NULL
);

-- ============================================
-- TABLA: Genero
-- ============================================
CREATE TABLE Genero (
  id_genero  INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================
-- TABLA INTERMEDIA: Anime_Genero (N:M)
-- ============================================
CREATE TABLE Anime_Genero (
  id_anime   INT NOT NULL,
  id_genero  INT NOT NULL,
  PRIMARY KEY (id_anime, id_genero),
  FOREIGN KEY (id_anime)  REFERENCES Anime(id_anime)  ON DELETE CASCADE,
  FOREIGN KEY (id_genero) REFERENCES Genero(id_genero) ON DELETE CASCADE
);

-- ============================================
-- TABLA: Lista
-- ============================================
CREATE TABLE Lista (
  id_lista       INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100)                        NOT NULL,
  tipo           ENUM('predeterminada','personalizada') NOT NULL DEFAULT 'personalizada',
  id_usuario     INT                                 NOT NULL,
  fecha_creacion TIMESTAMP                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lista_usuario (nombre, id_usuario),
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

-- ============================================
-- TABLA INTERMEDIA: Lista_Anime (N:M)
-- ============================================
CREATE TABLE Lista_Anime (
  id_lista         INT       NOT NULL,
  id_anime         INT       NOT NULL,
  fecha_añadido    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  episodios_vistos INT       NOT NULL DEFAULT 0,
  PRIMARY KEY (id_lista, id_anime),
  FOREIGN KEY (id_lista) REFERENCES Lista(id_lista) ON DELETE CASCADE,
  FOREIGN KEY (id_anime) REFERENCES Anime(id_anime) ON DELETE CASCADE
);

-- ============================================
-- TABLA: Puntuacion
-- ============================================
CREATE TABLE Puntuacion (
  id_puntuacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario    INT          NOT NULL,
  id_anime      INT          NOT NULL,
  valor         TINYINT      NOT NULL CHECK (valor BETWEEN 1 AND 10),
  fecha_creada  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_puntuacion (id_usuario, id_anime),
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_anime)   REFERENCES Anime(id_anime)     ON DELETE CASCADE
);

-- ============================================
-- TABLA: Reseña
-- ============================================
CREATE TABLE Reseña (
  id_reseña  INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT       NOT NULL,
  id_anime   INT       NOT NULL,
  texto      TEXT      NOT NULL,
  fecha      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_resenia (id_usuario, id_anime),
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_anime)   REFERENCES Anime(id_anime)     ON DELETE CASCADE
);

-- ============================================
-- TABLA: Recomendacion
-- ============================================
CREATE TABLE Recomendacion (
  id_recomendacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario       INT          NOT NULL,
  id_anime         INT          NOT NULL,
  motivo           VARCHAR(255) NULL,
  fecha_generada   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_anime)   REFERENCES Anime(id_anime)     ON DELETE CASCADE
);