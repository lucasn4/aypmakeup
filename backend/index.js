import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import winston from "winston";
import csurf from "csurf";

import authRoutes from "./routes/authRoutes.js";
import tarjetaRoutes from "./routes/tarjetaRoutes.js";
import filtroRoutes from "./routes/filtroRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";

dotenv.config();

// ✅ Logger con Winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/app.log" }),
    new winston.transports.Console()
  ],
});

// ✅ Limitador global
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit alcanzado desde IP: ${req.ip}`);
    res.status(429).json({ error: "Demasiadas solicitudes, intente más tarde." });
  },
});

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// ✅ CORS con cookies
const allowed = ["http://localhost:5173", "http://192.168.1.4:5173", "https://mi-frontend.com"];
app.use(
  cors({
    origin: allowed,
    credentials: true,
  })
);

// ✅ Seguridad general
app.use(helmet());

// ✅ Logging HTTP
app.use(
  morgan("combined", {
    stream: {
      write: (message) => {
        const ruta = message.split('"')[1]?.split(" ")[1] || "";
        // Filtrar rutas de autenticación
        if (ruta.startsWith("/api/auth")) return;
        logger.info(message.trim());
      },
    },
  })
);

// ✅ CSRF Protection (usa cookies httpOnly)
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // cambia a true si usas HTTPS
  },
});
// 🧩 Aplica CSRF solo a rutas protegidas (admin)
app.use((req, res, next) => {
  const rutasProtegidas = [
    "/api/auth",
    "/api/tarjetas",
    "/api/filtros",
  ];

  // Si la ruta empieza con alguna protegida, aplica CSRF
  if (rutasProtegidas.some((ruta) => req.path.startsWith(ruta))) {
    return csrfProtection(req, res, next);
  }

  // Si no, continuar sin CSRF (por ejemplo /api/pedidos)
  next();
});

// ✅ Endpoint para obtener el token CSRF
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ✅ Rutas
app.use("/api/", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/tarjetas", tarjetaRoutes);
app.use("/api/filtros", filtroRoutes);
app.use("/api/pedidos", pedidoRoutes);

// ✅ Manejador de errores global
app.use((err, req, res, next) => {
  logger.error(`Error en ${req.method} ${req.url}: ${err.message}`);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});