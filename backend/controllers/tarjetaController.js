import pool from "../config/db.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Obtener tarjetas con imágenes
export const getTarjetas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, i.url_imagen 
       FROM tarjeta t
       LEFT JOIN tarjeta_imagen i ON t.idtarjeta = i.idtarjeta
       ORDER BY t.idtarjeta DESC`
    );

    // Agrupar imágenes por tarjeta
    const tarjetas = rows.reduce((acc, row) => {
      let tarjeta = acc.find((t) => t.idtarjeta === row.idtarjeta);
      if (!tarjeta) {
        tarjeta = {
          idtarjeta: row.idtarjeta,
          nombre: row.nombre,
          categoria: row.categoria,
          precio: row.precio,
          stock: row.stock,
          imagenes: [],
        };
        acc.push(tarjeta);
      }
      if (row.url_imagen) tarjeta.imagenes.push(row.url_imagen);
      return acc;
    }, []);

    res.json(tarjetas);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener tarjetas" });
  }
};

// Crear tarjeta con múltiples imágenes
export const createTarjeta = async (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;
  const files = req.files;

  try {
    // 1) Insertar tarjeta
    const [resultDB] = await pool.query(
      "INSERT INTO tarjeta (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)",
      [nombre, categoria, precio, stock]
    );

    const idtarjeta = resultDB.insertId;

    // 2) Subir imágenes (si hay)
    const imagenesGuardadas = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "tarjetas",
        });
        fs.unlinkSync(file.path);

        await pool.query(
          "INSERT INTO tarjeta_imagen (idtarjeta, url_imagen) VALUES (?, ?)",
          [idtarjeta, result.secure_url]
        );

        imagenesGuardadas.push(result.secure_url);
      }
    }

    res.json({
      idtarjeta,
      nombre,
      categoria,
      precio,
      stock,
      imagenes: imagenesGuardadas,
    });
  } catch (err) {
    console.error("Error al crear tarjeta:", err);
    res.status(500).json({ error: "Error al crear tarjeta" });
  }
};

// Eliminar tarjeta
export const deleteTarjeta = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tarjeta WHERE idtarjeta = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar tarjeta" });
  }
};

// Editar tarjeta (solo datos)
export const updateTarjeta = async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, stock } = req.body;

  try {
    await pool.query(
      "UPDATE tarjeta SET nombre=?, categoria=?, precio=?, stock=? WHERE idtarjeta=?",
      [nombre, categoria, precio, stock, id]
    );

    const [rows] = await pool.query("SELECT * FROM tarjeta WHERE idtarjeta = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Tarjeta no encontrada" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Error al editar tarjeta:", err);
    res.status(500).json({ error: "Error al editar tarjeta" });
  }
};

// Eliminar imagen específica
export const deleteImagen = async (req, res) => {
  const { id } = req.params; // idimagen
  try {
    const [rows] = await pool.query("SELECT * FROM tarjeta_imagen WHERE idimagen = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Imagen no encontrada" });

    const imagen = rows[0];

    // Eliminar de Cloudinary
    const publicId = imagen.url_imagen.split("/").pop().split(".")[0]; 
    try {
      await cloudinary.uploader.destroy(`tarjetas/${publicId}`);
    } catch (cloudErr) {
      console.warn("No se pudo eliminar de Cloudinary:", cloudErr.message);
    }

    // Eliminar de la BD
    await pool.query("DELETE FROM tarjeta_imagen WHERE idimagen = ?", [id]);

    res.json({ success: true, idimagen: id });
  } catch (err) {
    console.error("Error al eliminar imagen:", err);
    res.status(500).json({ error: "Error al eliminar imagen" });
  }
};