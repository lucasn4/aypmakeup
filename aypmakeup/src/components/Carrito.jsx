// src/components/Carrito.jsx
import React, { useEffect, useState } from "react";
import "../styles/Carrito.css";
import "../App.css";
import { LuShoppingCart } from "react-icons/lu";
import Swal from "sweetalert2";

export default function Carrito({ onClose }) {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-AR");
  const hora = ahora.toLocaleTimeString("es-AR");
  const [items, setItems] = useState([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ nombre: "", apellido: "", telefono: "" });

  useEffect(() => {
    const carritoGuardado = JSON.parse(sessionStorage.getItem("carrito")) || [];
    setItems(carritoGuardado);

    const datosGuardados = JSON.parse(sessionStorage.getItem("cliente")) || { nombre: "", apellido: "", telefono: "" };
    setFormData(datosGuardados);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("cliente", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const totalGeneral = items.reduce((acc, item) => acc + item.total, 0);

  const limpiarCarrito = () => {
    sessionStorage.removeItem("carrito");
    setItems([]);
    setStep(1);
  };

  const borrarProducto = (id) => {
    const nuevoCarrito = items.filter((item) => item.id !== id);
    setItems(nuevoCarrito);
    sessionStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
    Swal.fire({
      title: "Producto eliminado",
      text: "Se quitó el producto del carrito",
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });
  };

  const generarMensaje = () => {
    let mensaje = "*" + `¡Nuevo Pedido!` + "*\n" + `Fecha: ${fecha} Hora: ${hora}`;
    items.forEach((item, i) => {
      mensaje += "\n" + `${i + 1}. ${item.nombre} - $ ${item.precio} x ${item.cantidad} UN. = $ ${item.total}`;
    });
    mensaje += "\n" + `Total: $ ${totalGeneral}`;
    mensaje += "\n\n" + `Cliente: ${formData.nombre} ${formData.apellido} / Tel.: ${formData.telefono}`;
    return encodeURIComponent(mensaje);
  };

  const numeroAdmin = import.meta.env.VITE_NUM_ADMIN;

  // 🟢 Modificado: primero guarda el pedido en BD, luego limpia y muestra alerta
  const mensajefinal = async () => {
    try {
      const pedido = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        total: totalGeneral,
        productos: items,
      };

      // 📡 Enviar el pedido al backend
      const res = await fetch("http://192.168.1.4:5000/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });

      // ⚠️ Si falla la API
      if (!res.ok) throw new Error("Error al guardar el pedido");

      // ✅ Pedido guardado correctamente
      const data = await res.json();
      console.log("✅ Pedido guardado con éxito:", data);

      // 💬 Generar mensaje de WhatsApp
      const mensaje = generarMensaje();
      const enlaceWhatsApp = `https://wa.me/${numeroAdmin}?text=${mensaje}`;

      // 🔗 Abrir WhatsApp SOLO si se guardó en BD
      window.open(enlaceWhatsApp, "_blank");

      // 🧹 Limpiar carrito y cerrar modal
      limpiarCarrito();
      onClose();

      // ✅ Alerta de éxito
      Swal.fire({
        title: "Tu pedido ha sido enviado con éxito",
        text: "Nos pondremos en contacto a la brevedad",
        icon: "success",
      });

    } catch (err) {
      console.error("❌ Error al enviar pedido:", err);

      // 🚨 Mostrar error sin abrir WhatsApp
      Swal.fire({
        icon: "error",
        title: "Error al guardar pedido",
        text: "No se pudo registrar el pedido. Intenta de nuevo.",
      });
    }
  };

  return (
    <div className="side-panel">
      <section className="overlay">
        <h2><LuShoppingCart /> CARRITO</h2>
      </section>

      <section className="body">
        {step === 1 && (
          <>
            <p>Aquí verás los productos que agregaste al carrito.</p>
            <div className="productos">
              {items.length === 0 ? (
                <p>No hay productos en el carrito.</p>
              ) : (
                <ul>
                  {items.map((item) => (
                    <li key={item.id}>
                      {item.nombre} - 💲{item.precio} x {item.cantidad} = <strong>💲{item.total}</strong>
                      <button onClick={() => borrarProducto(item.id)}>❌</button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="total">
                <h3>Total: 💲{totalGeneral}</h3>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); mensajefinal(); }} className="form-cliente">
            <h3>Datos del cliente</h3>
            <p>Ingresa tus datos para que nuestro personal pueda contactarte.</p>
            <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
            <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />
            <input type="tel" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />
            <div className="form-buttons">
              <button type="button" onClick={() => setStep(1)}>Atrás</button>
              <button type="submit" className="btn-whatsapp">
                📲 Enviar por WhatsApp
              </button>

            </div>
          </form>
        )}

        {step === 3 && (
          <div className="confirmacion">
            <h3>✅ Pedido Enviado</h3>
            <p>Tu pedido ha sido enviado con éxito. Te contactaremos a la brevedad.</p>
          </div>
        )}
      </section>

      <section className="footer">
        <button onClick={limpiarCarrito} className="btn-limpiar">Limpiar carrito</button>
        {step === 1 && items.length > 0 && <button onClick={() => setStep(2)}>Siguiente</button>}
        {step !== 3 && <button onClick={onClose}>Cerrar</button>}
      </section>
    </div>
  );
}
