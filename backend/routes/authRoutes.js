import express from "express";
import { register, login, refresh, logout, me } from "../controllers/authController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// 🔒 Límite de intentos de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Demasiados intentos de login, espere 15 minutos.",
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", me);

// ✅ Endpoint extra (por si frontend necesita directamente)
router.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

export default router;
