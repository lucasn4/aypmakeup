// src/components/Tarjetas.jsx
import React, { useEffect, useState, useContext } from "react";
import CrearTarjeta from "./CrearTarjeta";
import CrearFiltro from "./CrearFiltro";
import Filtros from "./Filtros";
import CarruselImagenes from "./CarruselImagenes";
import BorrarTarjeta from "./BorrarTarjeta";
import EditarTarjeta from "./EditarTarjeta";
import "../styles/CardManager.css";
import { UserContext } from "../context/UserContext";
import DOMPurify from "dompurify";
import Swal from "sweetalert2";

export default function Tarjetas() {
  const [tarjetas, setTarjetas] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState(null);
  const { user } = useContext(UserContext);
  const [cantidades, setCantidades] = useState({});

  useEffect(() => {
    fetch("http://192.168.1.4:5000/api/tarjetas")
      .then((res) => res.json())
      .then(setTarjetas)
      .catch((err) => console.error("Error al cargar tarjetas:", err));
  }, []);

  const handleNuevaTarjeta = (nueva) => {
    setTarjetas((prev) => [nueva, ...prev]);
  };
  const handleNuevoFiltro = (nueva) => {
    setFiltroActivo((prev) => [nueva, ...prev]);
  };

  const handleEliminarTarjetaLocal = (id) => {
    setTarjetas((prev) => prev.filter((t) => t.idtarjeta !== id));
  };

  const handleCantidadChange = (id, value, stock) => {
    let cantidad = parseInt(value, 10) || 0;
    if (cantidad > stock) cantidad = stock;
    setCantidades((prev) => ({ ...prev, [id]: cantidad }));
  };

  const agregarAlCarrito = (tarjeta) => {
    const cantidad = cantidades[tarjeta.idtarjeta] || 0;
    if (cantidad < 1) {
      Swal.fire({
        title: "<strong>Debe ingresar una cantidad valida</strong>",
        icon: "info",
        text: `Debe agregar al menos una unidad (1).`,
      });
      return;
    }
    const carritoActual = JSON.parse(sessionStorage.getItem("carrito")) || [];
    const existente = carritoActual.find((p) => p.id === tarjeta.idtarjeta);
    if (existente) {
      const nuevaCantidad = existente.cantidad + cantidad;
      if (nuevaCantidad > tarjeta.stock) {
        Swal.fire({
          icon: "warning",
          title: "Stock insuficiente",
          text: `Solo hay ${tarjeta.stock} unidades disponibles.`,
        });
        return;
      } existente.cantidad = nuevaCantidad;
      existente.total = existente.precio * existente.cantidad;
    } else {
      // Agregar nuevo producto al carrito
      carritoActual.push({
        id: tarjeta.idtarjeta,
        nombre: tarjeta.nombre,
        precio: tarjeta.precio,
        cantidad,
        total: Number(tarjeta.precio) * cantidad,
        stock: tarjeta.stock,
      });
    }
    sessionStorage.setItem("carrito", JSON.stringify(carritoActual));
    Swal.fire("¡Listo!", "Agregado al Carrito Correctamente", "success");
  };

  const tarjetasFiltradas = filtroActivo
    ? tarjetas.filter((t) => (t.categoria || "").toLowerCase() === filtroActivo.toLowerCase())
    : tarjetas;

  return (
    <div>
      {user && (
        <div className="card2">
          <CrearTarjeta onTarjetaCreada={handleNuevaTarjeta} />
        </div>
      )}
      {user && (
        <div className="card2">
          <CrearFiltro onFiltroCreado={handleNuevoFiltro} />
        </div>
      )}

      <Filtros onFiltroSeleccionado={(f) => setFiltroActivo(f)} />

      <div className="cards">
        {tarjetasFiltradas.map((t) => (
          <section key={t.idtarjeta} className="card">
            <article>
              {user && <BorrarTarjeta idtarjeta={t.idtarjeta} onEliminada={handleEliminarTarjetaLocal} />}
              {user && <EditarTarjeta tarjeta={t} onTarjetaEditada={handleNuevaTarjeta} />}

            </article>

            <article className="tarjeta-info">
              <div className="imagenes-container">
                {t.imagenes && t.imagenes.length > 0 ? (
                  <CarruselImagenes imagenes={t.imagenes} nombre={t.nombre} />
                ) : (
                  <p>Sin imágenes</p>
                )}
              </div>

              <h4>{DOMPurify.sanitize(t.nombre)}</h4>
              <p>Categoria: {DOMPurify.sanitize(t.categoria)}</p>
              <p>💲 {t.precio}</p>
              <p>Stock: {t.stock}</p>

              <input
                type="number"
                min="1"
                max={t.stock}
                value={cantidades[t.idtarjeta] || ""}
                onChange={(e) => handleCantidadChange(t.idtarjeta, e.target.value, t.stock)}
                className="input-cant-carrito"
                placeholder="Cantidad"
              />
              <input type="button" value="Agregar al carrito" className="boton-agregar" onClick={() => agregarAlCarrito(t)} />
            </article>
          </section>
        ))}
      </div>
    </div>
  );
}
