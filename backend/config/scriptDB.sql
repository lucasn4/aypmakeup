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
ALTER TABLE Administradores
ADD COLUMN refresh_token TEXT NULL AFTER contraseña_admin;

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

INSERT INTO Administradores (nombre_admin,apellido_admin,telefono_admin,contraseña_admin)
VALUES ('Lucas','Naranjo',3813342620,'abc123');

DELETE FROM Administradores
WHERE id_admin = 1; 

CREATE TABLE pedidos (
  idpedido INT AUTO_INCREMENT PRIMARY KEY,
  nombre_cliente VARCHAR(100) NOT NULL,
  apellido_cliente VARCHAR(100) NOT NULL,
  telefono_cliente VARCHAR(50) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado ENUM('pendiente', 'realizada', 'cancelada') DEFAULT 'pendiente',
  id_admin INT NULL,  -- admin que procesó la venta (si aplica)
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_admin) REFERENCES Administradores(id_admin) ON DELETE SET NULL
);

CREATE TABLE pedido_detalle (
  iddetalle INT AUTO_INCREMENT PRIMARY KEY,
  idpedido INT NOT NULL,
  idtarjeta INT NOT NULL,
  nombre_producto VARCHAR(255) NOT NULL,
  cantidad INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (idpedido) REFERENCES pedidos(idpedido) ON DELETE CASCADE,
  FOREIGN KEY (idtarjeta) REFERENCES tarjeta(idtarjeta)
);