import express from "express";
import multer from "multer";
import { getTarjetas, createTarjeta, deleteTarjeta } from "../controllers/tarjetaController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getTarjetas); // todos pueden ver
router.post("/", verifyToken, upload.single("imagen"), createTarjeta); // logeados pueden crear
//router.put("/:id", verifyToken, updateTarjeta);    // Editar (solo logueado)
router.delete("/borrar/:id", verifyToken, deleteTarjeta);
export default router;
