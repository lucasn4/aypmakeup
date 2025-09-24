import express from "express";
import multer from "multer";
import { getTarjetas, createTarjeta, deleteTarjeta, updateTarjeta, deleteImagen } from "../controllers/tarjetaController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getTarjetas);
router.post("/", verifyToken, upload.array("imagenes",10), createTarjeta);
router.put("/:id", verifyToken, updateTarjeta); 
router.delete("/borrar/:id", verifyToken, deleteTarjeta);
router.delete("/imagen/:id", verifyToken, deleteImagen);

export default router;
