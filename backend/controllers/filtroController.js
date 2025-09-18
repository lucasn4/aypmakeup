// controllers/filtroController.js
import pool from "../config/db.js";

// Obtener todos los filtros (público)
export const getFiltros = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM filtro ORDER BY idfiltro DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener filtros:", err);
    res.status(500).json({ error: "Error al obtener filtros" });
  }
};

// Crear un filtro (solo admins)
export const createFiltro = async (req, res) => {
  const { nombre } = req.body;

  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  try {
    const [result] = await pool.query("INSERT INTO filtro (nombre) VALUES (?)", [
      nombre,
    ]);

    res.json({
      idfiltro: result.insertId,
      nombre,
    });
  } catch (err) {
    console.error("Error al crear filtro:", err);
    res.status(500).json({ error: "Error al crear filtro" });
  }
};


// Editar filtro
export const updateFiltro = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    await pool.query("UPDATE filtro SET nombre = ? WHERE idfiltro = ?", [nombre, id]);
    res.json({ idfiltro: id, nombre });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar filtro" });
  }
};

// Borrar filtro
export const deleteFiltro = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM filtro WHERE idfiltro = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar filtro" });
  }
};