import pool from "../config/db.js";
import sanitizeHtml from "sanitize-html";

/* ===============================
   📦 CREAR PEDIDO (desde cliente)
   =============================== */
export const crearPedido = async (req, res) => {
  const { nombre, apellido, telefono, total, productos } = req.body;

  if (!nombre || !apellido || !telefono || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "Datos de pedido incompletos o inválidos" });
  }

  try {

    const cleanNombre = sanitizeHtml(nombre);
    const cleanApellido = sanitizeHtml(apellido);
    const cleanTelefono = sanitizeHtml(telefono);

    // 1️⃣ Insertar pedido principal
    const [pedidoResult] = await pool.query(
      `INSERT INTO pedidos (nombre_cliente, apellido_cliente, telefono_cliente, total, estado)
       VALUES (?, ?, ?, ?, 'pendiente')`,
      [cleanNombre, cleanApellido, cleanTelefono, total]
    );

    const idpedido = pedidoResult.insertId;

    // 2️⃣ Insertar productos del pedido
    for (const p of productos) {
      await pool.query(
        `INSERT INTO pedido_detalle (idpedido, idtarjeta, nombre_producto, cantidad, precio)
         VALUES (?, ?, ?, ?, ?)`,
        [idpedido, p.id, p.nombre, p.cantidad, p.precio]
      );
    }

    res.json({ message: "Pedido creado correctamente", idpedido });
  } catch (err) {
    console.error("Error al crear pedido:", err);
    res.status(500).json({ error: "Error al crear pedido" });
  }
};

/* ===============================
   📋 OBTENER PEDIDOS (solo admin)
   =============================== */
export const obtenerPedidos = async (req, res) => {
  try {
    // 1️⃣ Obtener todos los pedidos
    const [pedidos] = await pool.query(`
      SELECT p.idpedido, p.nombre_cliente, p.apellido_cliente, p.telefono_cliente, 
             p.total, p.estado, p.fecha, p.idusuario, ad.id_admin, ad.nombre_admin,
             ad.apellido_admin
      FROM pedidos AS p
      JOIN Administradores AS ad ON p.idusuario = ad.id_admin
      ORDER BY p.fecha DESC
    `);

    // 2️⃣ Agregar los productos correspondientes a cada pedido
    for (const pedido of pedidos) {
      const [productos] = await pool.query(
        `SELECT idtarjeta, nombre_producto, cantidad, precio
         FROM pedido_detalle
         WHERE idpedido = ?`,
        [pedido.idpedido]
      );
      pedido.productos = productos; // 🔹 cada pedido tendrá su array de productos
    }

    res.json(pedidos);
  } catch (err) {
    console.error("Error al obtener pedidos:", err);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

/* ====================================
   ✅ MARCAR PEDIDO COMO VENTA REALIZADA
   ==================================== */
export const marcarVentaRealizada = async (req, res) => {
  const { id } = req.params;
  const idusuario = req.user?.id; // viene del token del admin

  try {
    // Obtener detalles del pedido
    const [detalles] = await pool.query(
      "SELECT idtarjeta, cantidad FROM pedido_detalle WHERE idpedido = ?",
      [id]
    );

    // Actualizar stock de cada producto
    for (const d of detalles) {
      await pool.query(
        "UPDATE tarjeta SET stock = GREATEST(stock - ?, 0) WHERE idtarjeta = ?",
        [d.cantidad, d.idtarjeta]
      );
    }

    // Actualizar estado del pedido
    await pool.query(
      "UPDATE pedidos SET estado = 'realizada', idusuario = ? WHERE idpedido = ?",
      [idusuario || null, id]
    );

    res.json({ message: "Venta marcada como realizada correctamente" });
  } catch (err) {
    console.error("Error al marcar venta como realizada:", err);
    res.status(500).json({ error: "Error al marcar venta como realizada" });
  }
};

/* ===============================
   ❌ CANCELAR PEDIDO
   =============================== */
export const cancelarPedido = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM pedidos WHERE idpedido = ?", [id]);
    res.json({ message: "Pedido cancelado correctamente" });
  } catch (err) {
    console.error("Error al cancelar pedido:", err);
    res.status(500).json({ error: "Error al cancelar pedido" });
  }
};
/* ====================================
   💰 OBTENER SOLO VENTAS REALIZADAS
   ==================================== */
export const obtenerVentasRealizadas = async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT p.idpedido, p.nombre_cliente, p.apellido_cliente, p.telefono_cliente,
             p.total, p.estado, p.fecha, p.idusuario, 
      FROM pedidos p
      WHERE p.estado = 'realizada'
      ORDER BY p.fecha DESC
    `);

    for (const venta of ventas) {
      const [productos] = await pool.query(
        `SELECT idtarjeta, nombre_producto, cantidad, precio
         FROM pedido_detalle
         WHERE idpedido = ?`,
        [venta.idpedido]
      );
      venta.productos = productos;
    }

    res.json(ventas);
    console.log(ventas);
  } catch (err) {
    console.error("Error al obtener ventas realizadas:", err);
    res.status(500).json({ error: "Error al obtener ventas realizadas" });
  }
};