import express from "express";
import { crearPedido, obtenerPedidos, marcarVentaRealizada, cancelarPedido, obtenerVentasRealizadas, } from "../controllers/pedidoController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
const router = express.Router();

// Cliente crea pedido
router.post("/", crearPedido);

// Admin obtiene pedidos
router.get("/", verifyToken, obtenerPedidos);

// Admin marca venta realizada
router.put("/:id/realizar", verifyToken, marcarVentaRealizada);

// Admin cancela pedido
router.delete("/:id", verifyToken, cancelarPedido);

// Admin obtiene solo las ventas realizadas
router.get("/realizadas", verifyToken, obtenerVentasRealizadas);

export default router;
