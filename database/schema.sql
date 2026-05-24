-- ============================================
-- BASE DE DATOS: concesionario
-- ============================================

CREATE DATABASE IF NOT EXISTS concesionario 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE concesionario;

-- ============================================
-- TABLA: users (contraseñas HASHEADAS con BCrypt)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(100) DEFAULT NULL,
    dni VARCHAR(20) DEFAULT NULL,
    telefono VARCHAR(20) DEFAULT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLA: vehiculos
-- ============================================
CREATE TABLE IF NOT EXISTS vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    anyo INT NOT NULL,
    precio DECIMAL(12, 2) NOT NULL,
    categoria VARCHAR(50) DEFAULT NULL,
    matricula VARCHAR(20) DEFAULT NULL,
    descripcion TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLA: vehiculo_imagenes
-- ============================================
CREATE TABLE IF NOT EXISTS vehiculo_imagenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

