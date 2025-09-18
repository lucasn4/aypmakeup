// Carrito.jsx
import React, { useEffect, useState } from "react";
import "../styles/Carrito.css";
import { LuShoppingCart } from "react-icons/lu";

export default function Carrito({ onClose }) {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString("es-AR"); // ej: 06/09/2025
    const hora = ahora.toLocaleTimeString("es-AR"); // ej: 19:45:12
    const [items, setItems] = useState([]);
    const [step, setStep] = useState(1); // paso 1, 2 o 3
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        telefono: ""
    });

    // cargar carrito y datos cliente desde sessionStorage
    useEffect(() => {
        const carritoGuardado = JSON.parse(sessionStorage.getItem("carrito")) || [];
        setItems(carritoGuardado);

        const datosGuardados = JSON.parse(sessionStorage.getItem("cliente")) || {
            nombre: "",
            apellido: "",
            telefono: ""
        };
        setFormData(datosGuardados);
    }, []);

    // guardar datos cliente en sessionStorage cada vez que cambia
    useEffect(() => {
        sessionStorage.setItem("cliente", JSON.stringify(formData));
    }, [formData]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStep(3); // ir al paso 3
    };

    const totalGeneral = items.reduce((acc, item) => acc + item.total, 0);

    // 👉 limpiar carrito
    const limpiarCarrito = () => {
        sessionStorage.removeItem("carrito");
        setItems([]);
        setStep(1); // volvemos al primer paso
    };
    // Generar mensaje para WhatsApp
    const generarMensaje = () => {
        let mensaje = `*¡Nuevo Pedido!*\n\n *Fecha: ${fecha}*\n *Hora: ${hora}*\n\n`;
        items.forEach((item, i) => {
            mensaje += `*${i + 1}*. ${item.nombre} - $ ${item.precio} x ${item.cantidad
                } UN. = *$ ${item.total}*\n`;
        });
        mensaje += `\n*Total:* $ ${totalGeneral}\n\n`;
        mensaje += `  Cliente: *${formData.nombre} ${formData.apellido}*\n Tel.: *${formData.telefono}*`;
        return encodeURIComponent(mensaje);
    };

    const numeroAdmin = import.meta.env.VITE_NUM_ADMIN;

    return (
        <div className="side-panel">
            <section className="overlay">
                <h2>
                    <LuShoppingCart /> CARRITO
                </h2>
            </section>

            <section className="body">
                {/* Paso 1: Carrito */}
                {step === 1 && (
                    <>
                        <p>Aqui veras los productos que agregaste al carrito.</p>
                        <div className="productos">

                            {items.length === 0 ? (
                                <p>No hay productos en el carrito.</p>
                            ) : (
                                <ul>
                                    {items.map((item) => (
                                        <li key={item.id}>
                                            {item.nombre} - 💲{item.precio} x {item.cantidad} ={" "}
                                            <strong>💲{item.total}</strong>
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

                {/* Paso 2: Formulario */}
                {step === 2 && (
                    <form onSubmit={handleSubmit} className="form-cliente">
                        <h3>Datos del cliente</h3>
                        <p>Ingresa tus datos para que nuestro personal pueda contactarte.</p>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="apellido"
                            placeholder="Apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="tel"
                            name="telefono"
                            placeholder="Teléfono"
                            value={formData.telefono}
                            onChange={handleChange}
                            required
                        />

                        <div className="form-buttons">
                            <button type="button" onClick={() => setStep(1)}>
                                Atrás
                            </button>
                            <button type="submit" onClick={() => setStep(3)}><a
                                href={`https://wa.me/${numeroAdmin}?text=${generarMensaje()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-whatsapp"
                            >
                                📲 Enviar por WhatsApp
                            </a></button>
                        </div>
                    </form>
                )}

                {/* Paso 3: Confirmación y WhatsApp */}
                {step === 3 && (
                    <div className="confirmacion">
                        <h3>✅ Pedido Enviado</h3>
                        <p>
                            Tu pedido a sido enviado con exito. Te contactaremos a la brevedad.
                        </p>
                    </div>
                )}
            </section>

            <section className="footer">
                <button onClick={limpiarCarrito} className="btn-limpiar">
                    Limpiar carrito
                </button>
                {step === 1 && items.length > 0 && (
                    <button onClick={() => setStep(2)}>Siguiente</button>
                )}
                {step !== 3 && <button onClick={onClose}>Cerrar</button>}
            </section>
        </div>
    );
}
