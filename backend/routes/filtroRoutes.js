// routes/filtroRoutes.js
import express from "express";
import { getFiltros, createFiltro, updateFiltro, deleteFiltro } from "../controllers/filtroController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Público: obtener filtros
router.get("/", getFiltros);

// Solo admins logueados pueden crear filtros
router.post("/", verifyToken, createFiltro);
router.put("/:id", verifyToken, updateFiltro);    // Editar (solo logueado)
router.delete("/:id", verifyToken, deleteFiltro); // Borrar (solo logueado)
export default router;