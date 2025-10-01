import express from "express";
import multer from "multer";
import { getTarjetas, createTarjeta, deleteTarjeta, updateTarjeta, deleteImagen } from "../controllers/tarjetaController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { body } from "express-validator"; 

const router = express.Router();
const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Formato no permitido"), false);
        }
        cb(null, true);
    }
});

router.get("/", getTarjetas);
router.post("/", verifyToken, upload.array("imagenes", 10),[
    body('nombre').isString().isLength({ min: 2 }),
    body('precio').isFloat({ gt: 0 }),
    body('stock').isInt({ min: 0 })
  ], createTarjeta);
router.put("/:id", verifyToken, updateTarjeta);
router.delete("/borrar/:id", verifyToken, deleteTarjeta);
router.delete("/imagen/:id", verifyToken, deleteImagen);

export default router;
