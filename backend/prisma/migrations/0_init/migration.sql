-- CreateTable
CREATE TABLE `Usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `fecha_registro` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fecha_nacimiento` DATE NULL,
    `email_verificado` BOOLEAN NOT NULL DEFAULT false,
    `token_verificacion` VARCHAR(255) NULL,
    `avatar` VARCHAR(500) NULL,
    `rol` ENUM('user', 'admin') NOT NULL DEFAULT 'user',

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Anime` (
    `id_anime` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_estreno` DATE NULL,
    `num_episodios` INTEGER NULL DEFAULT 0,
    `edad_recomendada` VARCHAR(50) NULL,
    `imagen_portada` VARCHAR(500) NULL,
    `mal_id` INTEGER NULL,

    UNIQUE INDEX `mal_id`(`mal_id`),
    PRIMARY KEY (`id_anime`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Genero` (
    `id_genero` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `nombre`(`nombre`),
    PRIMARY KEY (`id_genero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Anime_Genero` (
    `id_anime` INTEGER NOT NULL,
    `id_genero` INTEGER NOT NULL,

    INDEX `id_genero`(`id_genero`),
    PRIMARY KEY (`id_anime`, `id_genero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lista` (
    `id_lista` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `tipo` ENUM('predeterminada', 'personalizada') NOT NULL DEFAULT 'personalizada',
    `color` VARCHAR(20) NOT NULL DEFAULT 'gray',
    `id_usuario` INTEGER NOT NULL,
    `fecha_creacion` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_usuario`(`id_usuario`),
    UNIQUE INDEX `uq_lista_usuario`(`nombre`, `id_usuario`),
    PRIMARY KEY (`id_lista`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lista_Anime` (
    `id_lista` INTEGER NOT NULL,
    `id_anime` INTEGER NOT NULL,
    `fecha_anadido` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `episodios_vistos` INTEGER NOT NULL DEFAULT 0,

    INDEX `id_anime`(`id_anime`),
    PRIMARY KEY (`id_lista`, `id_anime`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Puntuacion` (
    `id_puntuacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_anime` INTEGER NOT NULL,
    `valor` TINYINT NOT NULL,
    `fecha_creada` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_anime`(`id_anime`),
    UNIQUE INDEX `uq_puntuacion`(`id_usuario`, `id_anime`),
    PRIMARY KEY (`id_puntuacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resenia` (
    `id_resenia` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_anime` INTEGER NOT NULL,
    `texto` TEXT NOT NULL,
    `fecha` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_anime`(`id_anime`),
    UNIQUE INDEX `uq_resenia`(`id_usuario`, `id_anime`),
    PRIMARY KEY (`id_resenia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resenia_Like` (
    `id_usuario` INTEGER NOT NULL,
    `id_resenia` INTEGER NOT NULL,

    INDEX `id_resenia`(`id_resenia`),
    PRIMARY KEY (`id_usuario`, `id_resenia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recomendacion` (
    `id_recomendacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_anime` INTEGER NOT NULL,
    `motivo` VARCHAR(255) NULL,
    `fecha_generada` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_anime`(`id_anime`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_recomendacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Anime_Genero` ADD CONSTRAINT `Anime_Genero_ibfk_1` FOREIGN KEY (`id_anime`) REFERENCES `Anime`(`id_anime`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Anime_Genero` ADD CONSTRAINT `Anime_Genero_ibfk_2` FOREIGN KEY (`id_genero`) REFERENCES `Genero`(`id_genero`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Lista` ADD CONSTRAINT `Lista_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Lista_Anime` ADD CONSTRAINT `Lista_Anime_ibfk_1` FOREIGN KEY (`id_lista`) REFERENCES `Lista`(`id_lista`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Lista_Anime` ADD CONSTRAINT `Lista_Anime_ibfk_2` FOREIGN KEY (`id_anime`) REFERENCES `Anime`(`id_anime`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Puntuacion` ADD CONSTRAINT `Puntuacion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Puntuacion` ADD CONSTRAINT `Puntuacion_ibfk_2` FOREIGN KEY (`id_anime`) REFERENCES `Anime`(`id_anime`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Resenia` ADD CONSTRAINT `Resenia_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Resenia` ADD CONSTRAINT `Resenia_ibfk_2` FOREIGN KEY (`id_anime`) REFERENCES `Anime`(`id_anime`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Resenia_Like` ADD CONSTRAINT `Resenia_Like_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Resenia_Like` ADD CONSTRAINT `Resenia_Like_ibfk_2` FOREIGN KEY (`id_resenia`) REFERENCES `Resenia`(`id_resenia`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Recomendacion` ADD CONSTRAINT `Recomendacion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Recomendacion` ADD CONSTRAINT `Recomendacion_ibfk_2` FOREIGN KEY (`id_anime`) REFERENCES `Anime`(`id_anime`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `Puntuacion` ADD CONSTRAINT `chk_valor` CHECK (`valor` BETWEEN 1 AND 10);
