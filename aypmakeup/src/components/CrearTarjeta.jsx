import React, { useState } from "react";
import "../styles/CardManager.css";
export default function CrearTarjeta({ onTarjetaCreada }) {
  const [form, setForm] = useState({ nombre: "",categoria: "", precio: "", stock: "" });
  const [imagen, setImagen] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setImagen(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("nombre", form.nombre);
    data.append("categoria", form.categoria);
    data.append("precio", form.precio);
    data.append("stock", form.stock);
    data.append("imagen", imagen);

    const token = localStorage.getItem("token");

    const res = await fetch("http://192.168.1.4:5000/api/tarjetas", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });

    const nueva = await res.json();
    if (!nueva.error) {
      onTarjetaCreada(nueva);
      setForm({ nombre: "",categoria: "", precio: "", stock: "" });
      setImagen(null);
    }
  };

  return (
    <form className="tarjeta-form" onSubmit={handleSubmit}>
      <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
      <input type="text" name="categoria" value={form.categoria} onChange={handleChange} placeholder="Categoria, Ej: Labiales" required />
      <input type="number" name="precio" value={form.precio} onChange={handleChange} placeholder="Precio" required />
      <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" required />
      <input type="file" onChange={handleFileChange} accept="image/*" required />
      <button type="submit">Guardar</button>
    </form>
  );
}
