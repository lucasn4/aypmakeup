import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import tarjetaRoutes from "./routes/tarjetaRoutes.js";
import filtroRoutes from "./routes/filtroRoutes.js";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

// Limite general para todas las rutas API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
//const allowed = ["https://mi-frontend.com"];
//app.use(cors({ origin: allowed }));
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use(helmet());
app.use('/api/', apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/tarjetas", tarjetaRoutes);
app.use("/api/filtros", filtroRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
