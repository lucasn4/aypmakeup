import express from "express";
import multer from "multer";
import { getTarjetas, createTarjeta } from "../controllers/tarjetaController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getTarjetas); // todos pueden ver
router.post("/", verifyToken, upload.single("imagen"), createTarjeta); // logeados pueden crear

export default router;
