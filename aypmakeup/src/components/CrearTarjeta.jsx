// src/components/CrearTarjeta.jsx
import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import Swal from "sweetalert2";

export default function CrearTarjeta({ onTarjetaCreada }) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const { csrfToken } = useContext(UserContext);

  const handleFileChange = (e) => {
    setImagenes(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = csrfToken || sessionStorage.getItem("csrfToken") || "";
    try {
      const data = new FormData();
      data.append("nombre", nombre);
      data.append("categoria", categoria);
      data.append("precio", precio);
      data.append("stock", stock);
      imagenes.forEach((f) => data.append("imagenes", f)); // backend espera campo 'imagenes'

      const res = await fetch("http://192.168.1.4:5000/api/tarjetas", {
        method: "POST",
        credentials: "include",
        headers: {
          "CSRF-Token": token,
        },
        body: data,
      });

      const nueva = await res.json();
      if (!res.ok) throw new Error(nueva.error || "Error al crear tarjeta");

      onTarjetaCreada(nueva);
      setNombre("");
      setCategoria("");
      setPrecio("");
      setStock("");
      setImagenes([]);
      Swal.fire("Listo", "Tarjeta creada", "success");
    } catch (err) {
      console.error("CrearTarjeta error:", err);
      Swal.fire("Error", "No se pudo crear la tarjeta", "error");
    }
  };

  return (
    <form className="tarjeta-form" onSubmit={handleSubmit}>
      <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" required />
      <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Categoría" required />
      <input type="number" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio" required />
      <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" required />
      <input type="file" multiple accept="image/*" onChange={handleFileChange} />
      <button type="submit">Crear Tarjeta</button>
    </form>
  );
}
