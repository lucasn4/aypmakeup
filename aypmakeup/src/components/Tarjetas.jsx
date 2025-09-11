// Tarjetas.jsx
import React, { useEffect, useState, useContext } from "react";
import CrearTarjeta from "./CrearTarjeta";
import "../styles/CardManager.css";
import { UserContext } from "../context/UserContext";
import "../App.css";

export default function Tarjetas() {
  const [tarjetas, setTarjetas] = useState([]);
  const { user } = useContext(UserContext);

  // Estado para cantidades individuales (clave = idtarjeta)
  const [cantidades, setCantidades] = useState({});

  useEffect(() => {
    fetch("http://192.168.1.4:5000/api/tarjetas")
      .then((res) => res.json())
      .then(setTarjetas);
  }, []);

  const handleNuevaTarjeta = (nueva) => {
    setTarjetas((prev) => [nueva, ...prev]);
  };

  const handleCantidadChange = (id, value) => {
    setCantidades((prev) => ({ ...prev, [id]: parseInt(value) || 0 }));
  };

  const agregarAlCarrito = (tarjeta) => {
    const cantidad = cantidades[tarjeta.idtarjeta] || 0;
    if (cantidad < 1) {
      alert("Debe ingresar una cantidad válida (mínimo 1)");
      return;
    }

    const item = {
      id: tarjeta.idtarjeta,
      nombre: tarjeta.nombre,
      precio: tarjeta.precio,
      cantidad,
      total: tarjeta.precio * cantidad,
    };

    // Obtener carrito actual de localStorage
    const carritoActual = JSON.parse(sessionStorage.getItem("carrito")) || [];

    // Verificar si ya existe el producto → actualizar cantidad y total
    const existente = carritoActual.find((p) => p.id === item.id);
    if (existente) {
      existente.cantidad += cantidad;
      existente.total = existente.precio * existente.cantidad;
    } else {
      carritoActual.push(item);
    }

    // Guardar en localStorage
    sessionStorage.setItem("carrito", JSON.stringify(carritoActual));
    alert(`${tarjeta.nombre} agregado al carrito ✅`);
  };

  return (
    <div>
      {/* Mostrar formulario solo si hay usuario */}
      {user && (
        <div className="card2">
          <CrearTarjeta onTarjetaCreada={handleNuevaTarjeta} />
        </div>
      )}
      <div className="cards">
        {tarjetas.map((t) => (
          <div key={t.idtarjeta} className="card">
            <img src={t.imagen} alt={t.nombre} className="tarjeta-img" />
            <h4>{t.nombre}</h4>
            <p>💲 {t.precio}</p>
            <p>Stock: {t.stock}</p>
            <input
              type="number"
              min="1"
              value={cantidades[t.idtarjeta] || ""}
              onChange={(e) => handleCantidadChange(t.idtarjeta, e.target.value)}
              className="input-cant-carrito"
              placeholder="Cantidad"
            />
            <input
              type="button"
              value="Agregar al carrito"
              className="boton-agregar"
              onClick={() => agregarAlCarrito(t)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
