import express from "express";
import { register, login } from "../controllers/authController.js";
import rateLimit from 'express-rate-limit';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // solo 5 intentos de login por IP cada 15 minutos
  message: 'Demasiados intentos de login, debe esperar.',
});

router.post("/register", register);
router.post("/login", loginLimiter, login);

export default router;
