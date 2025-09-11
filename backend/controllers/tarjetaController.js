import pool from "../config/db.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuración Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Obtener todas las tarjetas
export const getTarjetas = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tarjeta ORDER BY idtarjeta DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener tarjetas" });
  }
};

// Crear una tarjeta (solo logeados)
export const createTarjeta = async (req, res) => {
  const { nombre, precio, stock } = req.body;
  const file = req.file;

  try {
    // Subir imagen a Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "tarjetas",
    });

    // Eliminar archivo temporal
    fs.unlinkSync(file.path);

    // Guardar en BD
    const [resultDB] = await pool.query(
      "INSERT INTO tarjeta (nombre, imagen, precio, stock) VALUES (?, ?, ?, ?)",
      [nombre, result.secure_url, precio, stock]
    );

    res.json({
      idtarjeta: resultDB.insertId,
      nombre,
      imagen: result.secure_url,
      precio,
      stock,
    });
  } catch (err) {
    console.error("Error al crear tarjeta:", err);
    res.status(500).json({ error: "Error al crear tarjeta" });
  }
};
