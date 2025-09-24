CREATE DATABASE IF NOT EXISTS ayp;
USE ayp;

-- 🔴 Eliminar tablas si existen
DROP TABLE IF EXISTS Administradores;
DROP TABLE IF EXISTS tarjeta;
DROP TABLE IF EXISTS tarjeta_imagen;
DROP TABLE IF EXISTS filtro;

CREATE TABLE Administradores (
    id_admin INT PRIMARY KEY AUTO_INCREMENT,
    nombre_admin VARCHAR(100) NOT NULL,
    apellido_admin VARCHAR(100) NOT NULL,
    telefono_admin VARCHAR(40) NOT NULL,
    contraseña_admin VARCHAR(255) NOT NULL
);
CREATE TABLE tarjeta (
  idtarjeta INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL
);
CREATE TABLE tarjeta_imagen (
  idimagen INT AUTO_INCREMENT PRIMARY KEY,
  idtarjeta INT NOT NULL,
  url_imagen TEXT NOT NULL,
  FOREIGN KEY (idtarjeta) REFERENCES tarjeta(idtarjeta) ON DELETE CASCADE
);
CREATE TABLE filtro (
  idfiltro INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL -- ej: "Labiales"
);
SELECT * FROM Administradores;
SELECT * FROM tarjeta;
SELECT * FROM tarjeta_imagen;
SELECT * FROM filtro;
