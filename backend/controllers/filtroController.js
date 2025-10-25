import pool from "../config/db.js";
import sanitizeHtml from "sanitize-html";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.File({ filename: "logs/app.log" })],
});

export const getFiltros = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM filtro");
    res.json(rows);
  } catch (err) {
    logger.error("Error obteniendo filtros:", err.message);
    res.status(500).json({ error: "Error al obtener los filtros" });
  }
};

export const createFiltro = async (req, res) => {
  try {
    const { nombre } = req.body;
    const cleanName = sanitizeHtml(nombre);

    const [result] = await pool.query("INSERT INTO filtros (nombre) VALUES (?)", [cleanName]);
    res.json({ id: result.insertId, nombre: cleanName });
  } catch (err) {
    logger.error("Error al crear filtro:", err.message);
    res.status(500).json({ error: "Error al crear el filtro" });
  }
};

export const updateFiltro = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const cleanName = sanitizeHtml(nombre);

    await pool.query("UPDATE filtros SET nombre = ? WHERE idfiltro = ?", [cleanName, id]);
    res.json({ message: "Filtro actualizado" });
  } catch (err) {
    logger.error("Error al actualizar filtro:", err.message);
    res.status(500).json({ error: "Error al actualizar el filtro" });
  }
};

export const deleteFiltro = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM filtros WHERE idfiltro = ?", [id]);
    res.json({ message: "Filtro eliminado" });
  } catch (err) {
    logger.error("Error al eliminar filtro:", err.message);
    res.status(500).json({ error: "Error al eliminar el filtro" });
  }
};
