-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS prealca;
USE prealca;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(100) NOT NULL,
    rol ENUM('administrador', 'registro', 'ensayo') NOT NULL,
    foto VARCHAR(255),
    codigo_verificacion VARCHAR(10),
    verificado BOOLEAN DEFAULT 0,
    reset_token VARCHAR(100),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de vendedores
CREATE TABLE IF NOT EXISTS vendedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    documento VARCHAR(20) NOT NULL,
    vendedor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendedor_id) REFERENCES vendedores(id)
);

-- Tabla de choferes
CREATE TABLE IF NOT EXISTS choferes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    licencia VARCHAR(50) NOT NULL,
    vencimiento_licencia DATE NOT NULL,
    certificado_medico VARCHAR(50),
    vencimiento_certificado DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de camiones
CREATE TABLE IF NOT EXISTS camiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    placa VARCHAR(20) NOT NULL UNIQUE,
    capacidad DECIMAL(10,2) NOT NULL,
    foto VARCHAR(255),
    estado ENUM('activo', 'mantenimiento', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de despachos
CREATE TABLE IF NOT EXISTS despachos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    guia VARCHAR(50) NOT NULL UNIQUE,
    m3 DECIMAL(10,2) NOT NULL,
    resistencia VARCHAR(20) NOT NULL,
    cliente_id INT NOT NULL,
    chofer_id INT NOT NULL,
    vendedor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (chofer_id) REFERENCES choferes(id),
    FOREIGN KEY (vendedor_id) REFERENCES vendedores(id)
);

-- Tabla de inventario
CREATE TABLE IF NOT EXISTS inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    minimo DECIMAL(10,2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mantenimiento
CREATE TABLE IF NOT EXISTS mantenimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    camion_id INT NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT NOT NULL,
    costo DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camion_id) REFERENCES camiones(id)
);

-- Insertar datos de ejemplo para pruebas
INSERT INTO vendedores (nombre, cedula) VALUES
('Ana Martínez', 'V-12345678'),
('Luis Sánchez', 'V-23456789'),
('María López', 'V-34567890');

INSERT INTO clientes (nombre, direccion, telefono, documento, vendedor_id) VALUES
('Constructora ABC', 'Av. Principal #123', '0412-1234567', 'J-12345678-9', 1),
('Edificaciones XYZ', 'Calle 45 #67-89', '0414-2345678', 'J-23456789-0', 2),
('Inmobiliaria Delta', 'Carrera 12 #34-56', '0416-3456789', 'J-34567890-1', 3);

INSERT INTO choferes (nombre, cedula, licencia, vencimiento_licencia, certificado_medico, vencimiento_certificado) VALUES
('Juan Pérez', 'V-12345678', 'L-12345', '2023-12-31', 'CM-12345', '2023-12-31'),
('Carlos Rodríguez', 'V-23456789', 'L-23456', '2024-06-30', 'CM-23456', '2024-06-30'),
('Miguel González', 'V-34567890', 'L-34567', '2024-03-31', 'CM-34567', '2024-03-31');

INSERT INTO camiones (marca, modelo, placa, capacidad) VALUES
('Ford', 'F-350', 'ABC-123', 8.5),
('Chevrolet', 'NPR', 'XYZ-789', 10.0),
('Iveco', 'Daily', 'DEF-456', 7.5);

INSERT INTO inventario (nombre, cantidad, unidad, minimo) VALUES
('Cemento', 150, 'Sacos', 50),
('Arena', 80, 'm³', 30),
('Grava', 65, 'm³', 25),
('Aditivo', 20, 'Galones', 10),
('Acero', 200, 'Varillas', 50);
