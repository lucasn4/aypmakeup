import express from "express";
import { register, login, refresh, logout, me } from "../controllers/authController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 44,
  message: "Demasiados intentos de login, espere 15 minutos.",
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", me);

export default router;
