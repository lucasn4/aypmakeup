import React, { useState } from "react";
import Swal from 'sweetalert2'

export default function EditarTarjeta({ tarjeta, onTarjetaEditada }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(tarjeta.nombre);
  const [categoria, setCategoria] = useState(tarjeta.categoria);
  const [precio, setPrecio] = useState(tarjeta.precio);
  const [stock, setStock] = useState(tarjeta.stock);
  const [imagenes, setImagenes] = useState(tarjeta.imagenes || []);

  const handleGuardar = async () => {
    try {
      const res = await fetch(`http://192.168.1.4:5000/api/tarjetas/${tarjeta.idtarjeta}`, {
        method: "PUT",
        credentials: "include", // 👈 importante para enviar cookies
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre, categoria, precio, stock }),
      });

      if (!res.ok) throw new Error("Error al editar tarjeta");

      const actualizada = await res.json();
      onTarjetaEditada(actualizada);
      setEditando(false);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error ❌",
        text: "No se pudo editar la tarjeta"
      });
    }
  };

  const handleBorrarImagen = async (url) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta imagen?")) return;

    try {
      const res = await fetch(
        `http://192.168.1.4:5000/api/tarjetas/${tarjeta.idtarjeta}/imagen`,
        {
          method: "DELETE",
          credentials: "include", // 👈 importante para enviar cookies
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url }), // 👈 pasamos la url de la imagen
        }
      );

      if (!res.ok) throw new Error("Error al eliminar imagen");

      setImagenes((prev) => prev.filter((img) => img !== url));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error ❌",
        text: "No se pudo eliminar la imagen"
      });
    }
  };

  if (!editando) {
    return (
      <button className="boton-eliminar" onClick={() => setEditando(true)}>✏️</button>
    );
  }

  return (
    <div className="editar-tarjeta">
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="text"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      />
      <input
        type="number"
        step="0.01"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
      />
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />

      <div className="imagenes-edit">
        {imagenes.map((img, i) => (
          <div key={i} className="img-edit-item">
            <img src={img} alt={`Imagen ${i}`} className="tarjeta-img" />
            <button onClick={() => handleBorrarImagen(img)}>❌</button>
          </div>
        ))}
      </div>

      <button onClick={handleGuardar}>💾 Guardar</button>
      <button onClick={() => setEditando(false)}>❌ Cancelar</button>
    </div>
  );
}
