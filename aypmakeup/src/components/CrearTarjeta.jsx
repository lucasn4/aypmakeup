import React, { useState } from "react";

export default function CrearTarjeta({ onTarjetaCreada }) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [imagenes, setImagenes] = useState([]); // múltiples archivos

  const handleFileChange = (e) => {
    setImagenes([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // armo form-data para enviar archivos + datos
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("categoria", categoria);
    formData.append("precio", precio);
    formData.append("stock", stock);

    imagenes.forEach((img) => {
      formData.append("imagenes", img); // backend debe recibir como "imagenes"
    });

    try {
      const res = await fetch("http://192.168.1.4:5000/api/tarjetas", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // 👈 token de admin
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Error al crear tarjeta");

      const nueva = await res.json();
      onTarjetaCreada(nueva);

      setNombre("");
      setCategoria("");
      setPrecio("");
      setStock("");
      setImagenes([]);
    } catch (err) {
      console.error(err);
      alert("No se pudo crear la tarjeta ❌");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Categoría"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        required
      />
      <input
        type="number"
        step="0.01"
        placeholder="Precio"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        required
      />

      <input
        type="file"
        multiple // 👈 ahora acepta varias imágenes
        onChange={handleFileChange}
      />

      <button type="submit">Crear Tarjeta</button>
    </form>
  );
}
