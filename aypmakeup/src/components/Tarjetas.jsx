import React, { useEffect, useState, useContext } from "react";
import CrearTarjeta from "./CrearTarjeta";
import CrearFiltro from "./CrearFiltro";
import BorrarTarjeta from "./BorrarTarjeta";
import "../styles/CardManager.css";
import { UserContext } from "../context/UserContext";
import "../App.css";

export default function Tarjetas() {
  const [tarjetas, setTarjetas] = useState([]);
  const [filtros, setFiltros] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState(null);
  const { user } = useContext(UserContext);

  const [cantidades, setCantidades] = useState({});

  useEffect(() => {
    fetch("http://192.168.1.4:5000/api/tarjetas")
      .then((res) => res.json())
      .then(setTarjetas);

    fetch("http://192.168.1.4:5000/api/filtros")
      .then((res) => res.json())
      .then(setFiltros);
  }, []);

  const handleNuevaTarjeta = (nueva) => {
    setTarjetas((prev) => [nueva, ...prev]);
  };

  const handleNuevoFiltro = (nuevo) => {
    setFiltros((prev) => [nuevo, ...prev]);
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

    const carritoActual = JSON.parse(sessionStorage.getItem("carrito")) || [];
    const existente = carritoActual.find((p) => p.id === item.id);
    if (existente) {
      existente.cantidad += cantidad;
      existente.total = existente.precio * existente.cantidad;
    } else {
      carritoActual.push(item);
    }

    sessionStorage.setItem("carrito", JSON.stringify(carritoActual));
    alert(`${tarjeta.nombre} agregado al carrito ✅`);
  };

  // 👉 borrar filtro (solo admin)
  const eliminarFiltro = async (idfiltro) => {
    if (!window.confirm("¿Seguro que quieres eliminar este filtro?")) return;

    try {
      const res = await fetch(`http://192.168.1.4:5000/api/filtros/${idfiltro}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // token del login
        },
      });

      if (!res.ok) throw new Error("Error al eliminar filtro");

      setFiltros((prev) => prev.filter((f) => f.idfiltro !== idfiltro));
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el filtro ❌");
    }
  };

  // 👉 editar filtro (solo admin)
  const editarFiltro = async (filtro) => {
    const nuevoNombre = prompt("Nuevo nombre del filtro:", filtro.nombre);
    if (!nuevoNombre || nuevoNombre.trim() === "") return;

    try {
      const res = await fetch(`http://192.168.1.4:5000/api/filtros/${filtro.idfiltro}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ nombre: nuevoNombre }),
      });

      if (!res.ok) throw new Error("Error al editar filtro");

      setFiltros((prev) =>
        prev.map((f) =>
          f.idfiltro === filtro.idfiltro ? { ...f, nombre: nuevoNombre } : f
        )
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo editar el filtro ❌");
    }
  };

  const tarjetasFiltradas = filtroActivo
    ? tarjetas.filter((t) => t.categoria.toLowerCase() === filtroActivo.toLowerCase())
    : tarjetas;

  return (
    <div>
      {user && (
        <div className="card2">
          <CrearTarjeta onTarjetaCreada={handleNuevaTarjeta} />
          <CrearFiltro onFiltroCreado={handleNuevoFiltro} />
        </div>
      )}

      {/* Botones de filtros */}
      <div className="filtros">
        <button
          className={!filtroActivo ? "activo" : ""}
          onClick={() => setFiltroActivo(null)}
        >
          Todos
        </button>
        {filtros.map((f) => (
          <div key={f.idfiltro} className="filtro-item">
            <button
              className={filtroActivo === f.nombre ? "activo" : ""}
              onClick={() => setFiltroActivo(f.nombre)}
            >
              {f.nombre}
            </button>
            {user && (
              <>
                <button onClick={() => editarFiltro(f)}>✏️</button>
                <button onClick={() => eliminarFiltro(f.idfiltro)}>🗑️</button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="cards">
        {tarjetasFiltradas.map((t) => (
          <section key={t.idtarjeta} className="card">
            <article>
              {user && (
                  <>
                    <BorrarTarjeta idtarjeta={t.idtarjeta} />
                  </>
                )}
            </article>
            <article>
              <img src={t.imagen} alt={t.nombre} className="tarjeta-img" />
              <h4>{t.nombre}</h4>
              <p>Categoria: {t.categoria}</p>
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
            </article>
          </section>
        ))}
      </div>
    </div>
  );
}
