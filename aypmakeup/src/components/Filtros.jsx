// Filtros.jsx
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import Swal from 'sweetalert2'

export default function Filtros({ tarjetas, setTarjetasFiltradas }) {
  const [filtros, setFiltros] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetch("http://192.168.1.4:5000/api/filtros")
      .then((res) => res.json())
      .then(setFiltros);
  }, []);

  // 👉 borrar filtro (solo admin)
  const eliminarFiltro = async (idfiltro) => {
    if (!window.confirm("¿Seguro que quieres eliminar este filtro?")) return;

    try {
      const res = await fetch(`http://192.168.1.4:5000/api/filtros/${idfiltro}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar filtro");

      setFiltros((prev) => prev.filter((f) => f.idfiltro !== idfiltro));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error ❌",
        text: "No se pudo eliminar el filtro"
      });
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
      Swal.fire({
        icon: "error",
        title: "Error ❌",
        text: "No se pudo editar el filtro"
      });
    }
  };

  // 👉 buscar + aplicar filtro
  useEffect(() => {
    let resultado = tarjetas;

    if (busqueda.trim() !== "") {
      resultado = resultado.filter((t) =>
        t.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtroActivo) {
      resultado = resultado.filter(
        (t) => t.categoria.toLowerCase() === filtroActivo.toLowerCase()
      );
    }

    setTarjetasFiltradas(resultado);
  }, [tarjetas, busqueda, filtroActivo]);

  return (
    <>
      <div className="buscador-container">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-buscador"
        />
        <button onClick={() => { }} className="btn-buscar">🔍</button>
      </div>

      <div className="filtros-container">
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <div className={`filtros ${menuOpen ? "open" : ""}`}>
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
      </div>
    </>
  );
}
