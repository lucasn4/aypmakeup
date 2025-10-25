// src/components/BorrarTarjeta.jsx
import React, { useContext } from "react";
import Swal from "sweetalert2";
import { UserContext } from "../context/UserContext";

export default function BorrarTarjeta({ idtarjeta, onEliminada }) {
  const { csrfToken } = useContext(UserContext);

  const eliminarTarjeta = async (id) => {
    const result = await Swal.fire({
      title: "¿Seguro que quieres eliminar esta tarjeta?",
      text: "No podrás revertirlo",
      icon: "warning",
      showCancelButton: true,
    });
    if (!result.isConfirmed) return;

    try {
      const token = csrfToken || sessionStorage.getItem("csrfToken") || "";
      const res = await fetch(`http://192.168.1.4:5000/api/tarjetas/borrar/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "CSRF-Token": token },
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al eliminar");
      }

      Swal.fire("Eliminado", "Tarjeta eliminada", "success");
      onEliminada?.(id);
    } catch (err) {
      console.error("eliminarTarjeta", err);
      Swal.fire("Error", "No se pudo eliminar la tarjeta", "error");
    }
  };

  return <button className="boton-eliminar" onClick={() => eliminarTarjeta(idtarjeta)}>🗑️</button>;
}
