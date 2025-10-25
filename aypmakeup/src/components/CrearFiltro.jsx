// src/components/CrearFiltro.jsx
import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";

export default function CrearFiltro({ onFiltroCreado }) {
  const [nombre, setNombre] = useState("");
  const { user, csrfToken } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      Swal.fire("Atención", "El nombre del filtro es obligatorio", "info");
      return;
    }
    if (!user) {
      Swal.fire("Acceso denegado", "Debes iniciar sesión para crear filtros", "warning");
      return;
    }

    try {
      const token = csrfToken || sessionStorage.getItem("csrfToken") || "";
      const clean = DOMPurify.sanitize(nombre);

      const res = await fetch("http://192.168.1.4:5000/api/filtros", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": token,
        },
        body: JSON.stringify({ nombre: clean }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear filtro");

      onFiltroCreado(data);
      setNombre("");
      Swal.fire("Éxito", "Filtro creado correctamente", "success");
    } catch (err) {
      console.error("CrearFiltro error:", err);
      Swal.fire("Error", "Hubo un error al crear el filtro", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-crear-filtro">
      <h3>➕ Crear Filtro</h3>
      <input
        type="text"
        placeholder="Nombre del filtro (ej: Labiales)"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <button type="submit">Crear</button>
    </form>
  );
}
