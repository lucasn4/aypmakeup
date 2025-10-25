import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../styles/header.css";
import "../App.css";
import Swal from "sweetalert2";
import { UserContext } from "../context/UserContext";


export default function Notificaciones() {
    const links = [
        { label: "Inicio", href: "/" },
        { label: "Login", href: "/login" }
    ];
    const navigate = useNavigate();
    const { user, loading } = useContext(UserContext);
    const [pedidosPendientes, setPedidosPendientes] = useState([]);
    const [pedidosCompletados, setPedidosCompletados] = useState([]);


    // 🔒 Si no está logueado, redirigir
    useEffect(() => {
        if (!loading && !user) {
            Swal.fire({
                icon: "info",
                title: "Acceso restringido",
                text: "Debes iniciar sesión como administrador para ver esta sección.",
            }).then(() => navigate("/login"));
        }
    }, [user, loading, navigate]);

    // 📦 Cargar pedidos al montar el componente
    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const res = await fetch("http://192.168.1.4:5000/api/pedidos", {
                    method: "GET",
                    credentials: "include", // envía cookies de sesión
                });

                if (!res.ok) throw new Error("Error al obtener pedidos");

                const data = await res.json();

                const pendientes = data.filter((p) => p.estado === "pendiente");
                const completados = data.filter((p) => p.estado === "realizada");

                setPedidosPendientes(pendientes);
                setPedidosCompletados(completados);

                console.log("Venta marcada como realizada:", completados);
            } catch (err) {
                console.error("Error al cargar pedidos:", err);
            }
        };

        fetchPedidos();
    }, []);

    // ✅ Marcar como venta realizada
    const marcarVentaRealizada = async (idPedido) => {
        try {
            const res = await fetch(`http://192.168.1.4:5000/api/pedidos/${idPedido}/realizar`, {
                method: "PUT",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error al marcar venta");

            const actualizado = await res.json();

            Swal.fire({
                icon: "success",
                title: "✅ Venta realizada",
                text: "El stock fue actualizado correctamente.",
            });

            // Mover pedido a la lista de completados
            setPedidosPendientes((prev) => prev.filter((p) => p.idpedido !== idPedido));
            setPedidosCompletados((prev) => [actualizado, ...prev]);
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Error ❌",
                text: "No se pudo completar la venta.",
            });
        }
    };

    // ❌ Cancelar venta
    const cancelarPedido = async (idPedido) => {
        try {
            const confirmar = await Swal.fire({
                title: "¿Cancelar pedido?",
                text: "Esta acción eliminará el pedido.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, cancelar",
                cancelButtonText: "No, volver",
            });

            if (!confirmar.isConfirmed) return;

            const res = await fetch(`http://192.168.1.4:5000/api/pedidos/${idPedido}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error al cancelar pedido");

            Swal.fire("Cancelado", "El pedido ha sido eliminado.", "info");
            setPedidosPendientes((prev) => prev.filter((p) => p.idpedido !== idPedido));
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "No se pudo cancelar el pedido.", "error");
        }
    };
    return (
        <>
            <Header
                brand="A&P Makeup"
                links={links}
                cta={{ label: "Ingresar" }}
                onClick={() => navigate("/login")}
            />
            <main className="app">
                <section className="hero">
                    <h1>📢 Notificaciones</h1>
                    <p>Pedidos recientes enviados por clientes</p>
                </section>

                {/* === PEDIDOS PENDIENTES === */}
                <section className="pedidos-section">
                    <h2>📦 Pedidos pendientes</h2>
                    {pedidosPendientes.length === 0 ? (
                        <p>No hay pedidos pendientes.</p>
                    ) : (
                        pedidosPendientes.map((pedido) => (
                            <div key={pedido.idpedido} className="pedido-card">
                                <h3>🧾 Pedido #{pedido.idpedido}</h3>
                                <p><strong>Cliente:</strong> {pedido.nombre_cliente} {pedido.apellido_cliente}</p>
                                <p><strong>Teléfono:</strong> {pedido.telefono_cliente}</p>
                                <p><strong>Total:</strong> 💲{pedido.total}</p>
                                <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>

                                <h4>Productos:</h4>
                                <ul>
                                    {pedido.productos.map((prod, i) => (
                                        <li key={i}>
                                            {prod.nombre} - {prod.cantidad} un. x 💲{prod.precio}
                                        </li>
                                    ))}
                                </ul>

                                <div className="pedido-actions">
                                    <button onClick={() => marcarVentaRealizada(pedido.idpedido)} className="btn-realizada">
                                        ✅ Venta realizada
                                    </button>
                                    <button onClick={() => cancelarPedido(pedido.idpedido)} className="btn-cancelar">
                                        ❌ Cancelar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </section>

                {/* === PEDIDOS COMPLETADOS === */}
                <section className="pedidos-section">
                    <h2>✅ Ventas realizadas</h2>
                    {pedidosCompletados.length === 0 ? (
                        <p>No hay ventas registradas.</p>
                    ) : (
                        pedidosCompletados.map((pedido) => (
                            <div key={pedido.idpedido} className="pedido-card realizado">
                                <h3>Venta #{pedido.idpedido}</h3>
                                <p><strong>Cliente:</strong> {pedido.nombre_cliente} {pedido.apellido_cliente}</p>
                                <p><strong>Total:</strong> 💲{pedido.total}</p>
                                <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
                                <p>
                                    <strong>Atendido por: </strong>
                                    {pedido.nombre_admin && pedido.apellido_admin
                                        ? `${pedido.nombre_admin} ${pedido.apellido_admin}`
                                        : "Desconocido"}
                                </p>
                                <h4>Productos:</h4>
                                <ul>
                                    {pedido.productos.map((prod, i) => (
                                        <li key={i}>
                                            {prod.nombre_producto} - {prod.cantidad} un. x 💲{prod.precio}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </section>
            </main>
        </>
    )
}
