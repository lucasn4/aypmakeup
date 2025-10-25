// src/components/Filtros.jsx
import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";

export default function Filtros({ onFiltroSeleccionado }) {
  const [filtros, setFiltros] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState(null);
  const { user, csrfToken } = useContext(UserContext);

  useEffect(() => {
    fetch("http://192.168.1.4:5000/api/filtros")
      .then((res) => res.json())
      .then((data) => setFiltros(data))
      .catch((err) => console.error("Error cargando filtros:", err));
  }, []);

  const eliminarFiltro = async (idfiltro) => {
    const confirmed = await Swal.fire({
      title: "¿Eliminar filtro?",
      text: "No podrás revertirlo",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirmed.isConfirmed) return;

    try {
      const token = csrfToken || sessionStorage.getItem("csrfToken") || "";
      const res = await fetch(`http://192.168.1.4:5000/api/filtros/${idfiltro}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "CSRF-Token": token },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al eliminar");
      }
      setFiltros((prev) => prev.filter((f) => f.idfiltro !== idfiltro));
      Swal.fire("Eliminado", "Filtro borrado", "success");
    } catch (err) {
      console.error("eliminarFiltro", err);
      Swal.fire("Error", "No se pudo eliminar el filtro", "error");
    }
  };

  const editarFiltro = async (filtro) => {
    const nuevoNombre = await Swal.fire({
      title: "Editar filtro",
      input: "text",
      inputValue: filtro.nombre,
      showCancelButton: true,
    });
    if (!nuevoNombre.value) return;

    try {
      const token = csrfToken || sessionStorage.getItem("csrfToken") || "";
      const clean = DOMPurify.sanitize(nuevoNombre.value);
      const res = await fetch(`http://192.168.1.4:5000/api/filtros/${filtro.idfiltro}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", "CSRF-Token": token },
        body: JSON.stringify({ nombre: clean }),
      });
      if (!res.ok) throw new Error("Error al editar filtro");
      setFiltros((prev) => prev.map((f) => (f.idfiltro === filtro.idfiltro ? { ...f, nombre: clean } : f)));
      Swal.fire("Actualizado", "Filtro actualizado", "success");
    } catch (err) {
      console.error("editarFiltro", err);
      Swal.fire("Error", "No se pudo editar el filtro", "error");
    }
  };

  return (
    <div className="filtros-container">
      <button className={!filtroActivo ? "activo" : ""} onClick={() => { setFiltroActivo(null); onFiltroSeleccionado?.(null); }}>
        Todos
      </button>

      {filtros.map((f) => (
        <div key={f.idfiltro} className="filtro-item">
          <button
            className={filtroActivo === f.nombre ? "activo" : ""}
            onClick={() => {
              setFiltroActivo(f.nombre);
              onFiltroSeleccionado?.(f.nombre);
            }}
          >
            {DOMPurify.sanitize(f.nombre)}
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
  );
}
