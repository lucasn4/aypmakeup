CREATE DATABASE IF NOT EXISTS ayp;
USE ayp;

-- 🔴 Eliminar tablas si existen
DROP TABLE IF EXISTS Administradores;

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
  imagen TEXT, -- podés guardar url o base64, lo más liviano es url
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL
);